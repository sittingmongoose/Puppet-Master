# Shard 022: PlanUnits

Source: `Plans/storage-plan.md`

Source lines: L2321-L14936

Source SHA256: `ed9771ce83eeeaed6d52411bdc4339f4dd1ddf421c14c18bdc8be5a0c7d869f8`

---

## PlanUnits

### SP-002 - Storage Owner Scope And Structural Anchor Map

```yaml
plan_unit_id: SP-002
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Plans/storage-plan.md preserves storage owner routing for runtime, governance, export, concern, route, projection, artifact, and lane topics through its title and canonical owner-section anchor map."
gui_related: false
gui_classification_reason: "This unit preserves backend storage ownership and section routing rather than visual presentation."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-002 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: storage_owner_scope_anchor_map
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0001"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0002"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0003"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0004"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0005"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0006"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0007"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0008"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0009"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0010"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0011"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0012"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0013"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0014"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0015"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0016"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0017"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0018"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0019"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0020"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0021"
preserved_exact_tokens:
- "Storage plan (seglog, redb, Tantivy, projectors)"
- "Canonical owner-section requirements"
- "Owner-first canonicalization order"
- "Shared governance/runtime record envelope"
- "Export taxonomy and manifest contract"
- "Concern record family definition"
- "Focused run and historical routing contract"
- "Source Control and worktree handshake"
- "Projection trust and action gating"
- "Lane vs worktree lifecycle split"
- "Runtime attribution ownership split"
- "Artifacts index exact indexed fields"
- "Lane cleanup lineage fields"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-003 - Attempt Snapshot And GUI Disclosure Join

```yaml
plan_unit_id: SP-003
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage maps the retired Persona/Runtime snapshot payload contract into attempt and permission snapshot storage, preserving snapshot payload fields, requested/effective identity fields, and chat/GUI disclosure joins."
gui_related: true
gui_classification_reason: "This unit preserves user-visible chat/GUI disclosure joins backed by storage records."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "CV-001"
- "UCC-001"
unblocks: []
acceptance_criteria:
- "SP-003 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: attempt_snapshot_gui_disclosure_join
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0022"
preserved_exact_tokens:
- "5.1B Persona/Runtime Snapshot Payload Contract"
- "{ tool_name"
- "invocation_summary"
- "options }"
- "result_id"
- "requested/effective provider"
- "requested/effective model"
- "requested/effective account"
- "permission_snapshot_id"
- "account_pressure_episode"
- "requirements_quality_report_ref"
- "/chat/GUI"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/FinalGUISpec.md"
- "Plans/UI_Command_Catalog.md"
- "Plans/Contracts_V0.md"
```

### SP-004 - Command Route Normalization And Migration-Only Command Terms

```yaml
plan_unit_id: SP-004
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage keeps command records graph-local and command-family specific, normalizing wrapper payloads into route-derived target and subject fields while keeping listed command terms migration-only."
gui_related: true
gui_classification_reason: "This unit preserves user-visible command routing and surface restore behavior."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "UCC-001"
unblocks: []
acceptance_criteria:
- "SP-004 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: command_route_normalization_migration_terms
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0022"
preserved_exact_tokens:
- "cmd.search.replace_selected"
- "cmd.runtime"
- "cmd.runtime.*"
- "slash-command"
- "cmd.nav.focus_route"
- "cmd.artifacts.show_in_usage"
- "cmd.orchestrator.open_in_source_control"
- "destination_surface"
- "destination_tab"
- "object_kind"
- "object_id"
- "record_id"
- "artifact_id"
- "attempt_id"
- "lane_id"
- "worktree_id"
- "usage_event_ref"
- "filter_payload"
- "inspector_target"
- "scroll_target"
- "focus_behavior"
negative_constraints:
- "Command compatibility terms that remain migration-only must not become canonical storage families."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/UI_Command_Catalog.md"
```

### SP-005 - Runtime Recovery Record Families And Derived Compatibility

```yaml
plan_unit_id: SP-005
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage owns runtime recovery record families, blocked_sequence identity, recovery fields, operational identity, governance-record templates, and derived-only tier aliases for replayable runtime coordination."
gui_related: false
gui_classification_reason: "This unit preserves backend record identity, runtime recovery, and governance storage requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "CV-001"
unblocks: []
acceptance_criteria:
- "SP-005 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "Runtime coordination/audit uses event-sourced seglog/redb records and projections as primary authority; file-based canon remains export/inspection mirror material only."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: runtime_recovery_record_families
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0022"
preserved_exact_tokens:
- "attempt_id?"
- "node_id?"
- "tool.invoked"
- "attempt/receipt/usage/artifact attribution packet"
- "tier_runtime_record"
- "tier_id"
- "widget.completed_prose"
- "blocked_sequence"
- "object_kind = blocked_episode"
- "recovery kind"
- "safe-point restore"
- "restart reconciliation"
- "blocked prerequisite resolution"
- "lane/worktree restore"
- "operational-identity"
- "governance-record"
- "/review/promotion/corroboration/graph-patch/recovery"
negative_constraints:
- "Runtime compatibility stays derived and must not own canonical execution-unit identity."
- "Runtime coordination/audit cannot claim both file-based canon and event-sourced canon as primary authority."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Contracts_V0.md"
```

### SP-006 - Projection Attention Export And Action-Gating Recovery Rules

```yaml
plan_unit_id: SP-006
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage recovery rules preserve projection fallback, attention/card/badge behavior, export identity, notification escalation, and action gating from canonical records instead of projection-only state."
gui_related: true
gui_classification_reason: "This unit preserves user-visible projection, attention, export, and direct-record action surfaces."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "UCC-001"
unblocks: []
acceptance_criteria:
- "SP-006 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: projection_attention_export_action_gating_rules
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0022"
preserved_exact_tokens:
- "Progress"
- "Seams"
- "project_summary.v1"
- "/blocked"
- "/config"
- "Ledger/Usage CSV/JSON"
- "trust-state"
- "projection_freshness"
- "projection_health"
- "/full-record"
- "attention center"
- "Project /card"
- "highest-severity active item plus a count"
- "direct canonical revalidation"
- "sensitive actions"
negative_constraints:
- "Project /card and badge rollups must not collapse rows into one synthetic project blocked blob."
- "Attention cards, blocked notices, and wizard surfaces must not keep card-local or notice-local activation fields as canon."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Project_Output_Artifacts.md"
```

### SP-007 - Receipt Bridge And Usage Join Contract

```yaml
plan_unit_id: SP-007
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Receipt records bridge attempts, usage, evidence, runtime artifacts, and UI pivots while lifecycle truth remains in durable record families and usage_event_ref does not become a top-level route selector."
gui_related: false
gui_classification_reason: "This unit preserves backend receipt and usage join identity rather than visual presentation."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "CV-001"
unblocks: []
acceptance_criteria:
- "SP-007 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: receipt_bridge_usage_join_contract
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0023"
preserved_exact_tokens:
- "orchestrator.receipt.{run_id}.{attempt_id}"
- "orchestrator.receipt"
- "attempt_record"
- "usage_record"
- "evidence_record"
- "scheduler_pass_record"
- "blocked_projection.{run_id}.{node_id}.{blocked_sequence}"
- "wizard_runtime_state"
- "project_id"
- "actor refs"
- "created_at_utc"
- "usage_event_ref"
- "usage_event_id"
- "provider_attempt_ref"
- "gap-004"
- "gap-006"
- "gap-005"
- "gap-008"
negative_constraints:
- "The receipt family is not a junk drawer."
- "Usage/artifact flows must not keep usage_event_ref as a first-class top-level route selector."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-008 - Runtime Object Family And Requested Effective Identity

```yaml
plan_unit_id: SP-008
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Runtime object family storage preserves canonical object tuples, requested/effective model/auth/account routing, operational_identity, decision and permission requested/effective identity, and legacy event names only as migration aliases."
gui_related: false
gui_classification_reason: "This unit preserves backend runtime object and identity record requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "CV-001"
- "PS-001"
unblocks: []
acceptance_criteria:
- "SP-008 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: runtime_object_family_requested_effective_identity
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0024"
preserved_exact_tokens:
- "runtime object families"
- "actor_role"
- "execution_role"
- "operational_identity"
- "requested-side"
- "effective-side"
- "/model/auth/account"
- "identity-contract"
- "requested-vs-effective"
- "effective-resolution"
- "run.tier_started"
- "run.tier_completed"
- "PuppetMasterEvent::*"
- "TierChanged"
- "attempt_record"
- "provider_attempt_ref"
negative_constraints:
- "Legacy tier and event names are compatibility aliases only."
- "attempt_record is the rewrite-era execution unit owner."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Permissions_System.md"
- "Plans/Provider_Stream_Mapping_External_Reference_A2A.md"
```

### SP-009 - Worktree Lane Source-Control And Project-State Boundaries

```yaml
plan_unit_id: SP-009
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage owns durable lane, worktree, source-control projection, and project-state persistence while WorktreeGitImprovement owns operational behavior, cleanup/archive/remove rules, and UI expectations."
gui_related: true
gui_classification_reason: "This unit preserves user-visible Source Control and Orchestrator state backed by storage records."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "W-001"
unblocks: []
acceptance_criteria:
- "SP-009 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "active-agents.json is preserved only as compatibility/debug mirror vocabulary and is not part of project_state canonical runtime truth."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: worktree_lane_source_control_project_state_boundaries
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0025"
preserved_exact_tokens:
- "worktree_id"
- "lane_id"
- "source_control.project_state.{project_id}"
- "baseline"
- "active"
- "retained"
- "suspect"
- "restoring"
- "cleanup_eligible"
- "archived"
- "historical"
- "removed"
- "live"
- "dirty"
- "conflict"
- "orphaned"
- "recovering"
- "projects:v1"
- "project_state:v1:{project_id}"
- "focused_run_id"
- "active-agents.json"
- "resume_url"
negative_constraints:
- "Project registry state stays narrow."
- "Consumer docs must not own storage records."
preserved_contractrefs: []
compatibility_only_notes:
- "active-agents.json is compatibility/debug mirror vocabulary when it appears in project-state source spans."
stale_retired_dispositions:
- "Project-state ownership of active-agent runtime truth is retired; coordination records/projections own it."
owner_hints:
- "Plans/storage-plan.md"
- "Plans/WorktreeGitImprovement.md"
```

### SP-010 - Projection Trust And Concern Lifecycle Semantics

```yaml
plan_unit_id: SP-010
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Projection trust uses projection_freshness and projection_health, concern and blocked lifecycles remain family-specific, direct-record actions are storage-backed, and source-of-truth aspects stay split across seglog, redb, and JSONL exports."
gui_related: true
gui_classification_reason: "This unit preserves user-visible trust, concern, direct-record action, and fallback surfaces."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "CV-001"
unblocks: []
acceptance_criteria:
- "SP-010 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: projection_trust_concern_lifecycle_semantics
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0026"
preserved_exact_tokens:
- "projection_freshness"
- "projection_health"
- "current"
- "refreshing"
- "stale"
- "degraded"
- "unavailable"
- "trust-state"
- "active -> acknowledged -> resolved -> dismissed"
- "open -> addressed -> resolved"
- "attention_required"
- "blocked"
- "action-capable"
- "blocked_projection"
- "allowed_action_ids[]"
- "seglog"
- "redb"
- "JSON/JSONL"
- "/source-of-truth"
- "/current-state/read-optimized"
negative_constraints:
- "projection_freshness remains the recency axis and projection_health remains the integrity/availability axis; storage and consumers MUST NOT collapse them into a single trust field."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-011 - Account Pressure Migration Aliases And Historical Status Semantics

```yaml
plan_unit_id: SP-011
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage preserves multi-account run snapshot and attempt boundaries, durable account_pressure_episode records, subordinate migration aliases, and split time/replacement/validity historical semantics."
gui_related: false
gui_classification_reason: "This unit preserves backend account, migration, and historical status storage semantics."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "CV-001"
unblocks: []
acceptance_criteria:
- "SP-011 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: account_pressure_aliases_historical_semantics
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0026"
preserved_exact_tokens:
- "account_pressure_episode"
- "episode_id"
- "project_id"
- "provider_id"
- "account_id"
- "execution_role?"
- "signal_confidence"
- "pressure_kind"
- "started_at_utc"
- "updated_at_utc"
- "cooled_down"
- "active | cooled_down | resolved | invalidated"
- "HTE"
- "/visible/manual-default"
- "time/replacement/validity status"
- "time status"
- "replacement status"
- "validity status"
- "stale_historical"
- "resolved-but-historical"
negative_constraints:
- "Migration aliases stay explicit but subordinate."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Multi-Account.md"
```

### SP-012 - Artifact Identity Route Export And Forward-Only Migration

```yaml
plan_unit_id: SP-012
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage owns artifact identity, record/artifact separation, openable runtime refs, export family identity, route/search reuse, and forward-only migration from wrapper-local payloads to route-target forms."
gui_related: true
gui_classification_reason: "This unit preserves user-visible artifact, route, export, and search pivots backed by storage identity."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "UCC-001"
unblocks: []
acceptance_criteria:
- "SP-012 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: artifact_identity_route_export_forward_only_migration
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0027"
preserved_exact_tokens:
- "artifact-index records"
- "artifact_type"
- "preview_subject_id = doc:<document_id> | artifact:<artifact_id>"
- "linked_artifact_id"
- "attempt:<attempt_id>"
- "safe_point:<safe_point_id>"
- "remediation:<remediation_root_id>"
- "scheduler_pass:<scheduler_pass_id>"
- "/export/search/routing"
- "/blob/renderable"
- "Run export"
- "Ledger export"
- "Evidence export"
- "CSV"
- "JSONL"
- "route-target"
- "/routing"
negative_constraints:
- "Storage migration is prose-rule driven and forward-only."
- "New docs/producers must prefer canonical route-target forms."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Project_Output_Artifacts.md"
```

### SP-013 - Multi-Store Summary And Navigation Shell

```yaml
plan_unit_id: SP-013
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "The storage summary states the multi-store design with seglog as canonical event stream, redb for durable KV state, Tantivy for full-text search, and projectors/analytics maintaining read models; the table of contents remains navigation structure."
gui_related: false
gui_classification_reason: "This unit preserves backend storage architecture summary and document navigation rather than visual presentation."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-013 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: multi_store_summary_navigation_shell
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0028"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0029"
preserved_exact_tokens:
- "SQLite remains off the table"
- "seglog"
- "redb"
- "Tantivy"
- "Projectors"
- "JSONL mirror"
- "analytics scan jobs"
- "Implementation checklist + detailed design"
- "Table of Contents"
- "Implementation order and testing"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-014 - Promoted Shell Runtime Identity Storage

```yaml
plan_unit_id: SP-014
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage treats promoted shell/runtime IDs as first-class identities, including workspace, window, browser, preview, terminal section/tab/pane/session, dev session, branch lineage, detached scope, and subordinate command-block identity."
gui_related: true
gui_classification_reason: "This unit preserves user-visible workspace, browser, terminal, preview, and branch continuity identity."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "CV-001"
- "F3-001"
unblocks: []
acceptance_criteria:
- "SP-014 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: promoted_shell_runtime_identity_storage
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0030"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0031"
preserved_exact_tokens:
- "workspace_tab_id"
- "window_id"
- "browser_tab_id"
- "preview_session_id"
- "terminal_section_id"
- "terminal_tab_id"
- "terminal_pane_id"
- "terminal_session_id"
- "dev_session_id"
- "branch_id"
- "project_id"
- "raw path is not the canonical identity"
- "detached windows"
- "ephemeral automation/auth sessions"
- "command-block identity"
negative_constraints:
- "dev_session_id owns higher-level dev workflow continuity and MUST NOT replace terminal_session_id when exact shell reuse is required."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md"
- "ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Contracts_V0.md"
- "ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md, ContractName:Plans/assistant-chat-design.md"
- "ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Run_Modes.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Section15_MVP_Promoted_Features_Spec.md"
- "Plans/FinalGUISpec.md"
- "Plans/Contracts_V0.md"
```

### SP-015 - App Data Root And Core Store Layout

```yaml
plan_unit_id: SP-015
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage uses one app data root for core stores and records project-scoped runtime state under managed .puppet-master state when inherently project-local."
gui_related: false
gui_classification_reason: "This unit preserves backend file layout and storage root requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-015 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: app_data_root_core_store_layout
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0032"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0033"
preserved_exact_tokens:
- "~/.puppet-master/"
- "$XDG_DATA_HOME/puppet-master/"
- "%APPDATA%/puppet-master"
- "~/Library/Application Support/puppet-master"
- ".puppet-master/"
- "storage/seglog/"
- "storage/redb/"
- "storage/jsonl/"
- "storage/tantivy/projects/{project_id}/"
- "storage/blobs/"
- "storage/backups/"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md"
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-016 - Deterministic Regex Index Algorithm And Metadata

```yaml
plan_unit_id: SP-016
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Regex-index storage rejects probabilistic Blackbird-style masks, uses deterministic sparse n-gram postings plus ripgrep verification, and records dependencies, xxh3 hashing, Roaring posting lists, and index_meta.json metadata."
gui_related: false
gui_classification_reason: "This unit preserves backend regex index algorithm and metadata requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "T-001"
unblocks: []
acceptance_criteria:
- "SP-016 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: deterministic_regex_index_algorithm_metadata
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0033"
preserved_exact_tokens:
- "regex_index/"
- "FILE_ATTRIBUTE_NOT_CONTENT_INDEXED"
- ".metadata_never_index"
- "Blackbird-style"
- "nextMask"
- "locMask"
- "deterministic sparse n-gram postings"
- "ripgrep verification"
- "regex-syntax"
- "roaring"
- "memmap2"
- "xxhash-rust"
- "arc-swap"
- "thread-priority"
- "xxh3"
- "Roaring Bitmap"
- "index_meta.json"
- "anchor_sha"
- "build_timestamp_utc"
- "schema_version"
- "file_count"
- "generation"
- "case_sensitive_fs"
- "roaring_format: \"portable\""
negative_constraints:
- "PM does not adopt probabilistic Blackbird-style posting augmentation as canonical storage."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md"
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Tools.md"
- "Plans/GitHub_Integration.md"
```

### SP-017 - Remote Git Regex Cache Submodules Verification And Dirty Locality

```yaml
plan_unit_id: SP-017
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Remote Git regex storage keeps local bare-clone cache and dirty staging, handles submodules explicitly, builds with git cat-file, verifies with git show plus ripgrep, and preserves near-zero SSH grep with documented dirty-file fallback."
gui_related: false
gui_classification_reason: "This unit preserves backend remote Git cache, verification, and dirty-file storage requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "GI-001"
- "T-001"
unblocks: []
acceptance_criteria:
- "SP-017 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: remote_git_regex_cache_submodules_verification_dirty_locality
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0033"
preserved_exact_tokens:
- ".puppet-master/cache/r/{hash8}/git/"
- "--shallow/partial"
- "--bare"
- "git clone --bare"
- "core.sshCommand"
- "git bundle"
- "git cat-file --batch"
- "--recurse-submodules"
- "git/modules/{submodule_path}/"
- "git show {anchor_sha}:{path}"
- "case-collisions"
- "dirty/{relative_path}"
- "1 MB"
- "near-zero-SSH-during-grep"
- "SUPERSEDES any absolute zero-SSH claim"
negative_constraints:
- "Remote project storage split does not re-own remote-search behavior, remote-only settings, or /admin controls."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md"
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/GitHub_Integration.md"
- "Plans/Tools.md"
```

### SP-018 - Dirty Layer Generation And Snapshot Publication Safety

```yaml
plan_unit_id: SP-018
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Dirty-layer and regex-index publication use generation-based clearing, RwLock dirty entries, ArcSwap snapshot publication, sync_all durability, anchor reachability invalidation, and bounded memory guidance."
gui_related: false
gui_classification_reason: "This unit preserves backend concurrency, publication, durability, and rebuild safety requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "AI-001"
unblocks: []
acceptance_criteria:
- "SP-018 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: dirty_layer_generation_snapshot_publication_safety
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0033"
preserved_exact_tokens:
- "generation <= build_generation"
- "generation ≤ build_generation"
- "RwLock<HashMap<PathBuf, DirtyEntry>>"
- "DirtyEntry"
- "deleted flag"
- "ArcSwap<Arc<IndexSnapshot>>"
- "gen-{N+1}/"
- "File::sync_all()"
- "sync_all"
- "git cat-file -t {sha}"
- "anchor_sha"
- "full rebuild"
- "500 MB"
- "O(index_size) RAM"
- "1.5x index size"
negative_constraints:
- "Entries added during the build must survive so a long-running build cannot lose files dirtied during that build."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/GitHub_Integration.md"
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Architecture_Invariants.md"
```

### SP-019 - Local And Remote Regex Index Layouts And Windows Path Compatibility

```yaml
plan_unit_id: SP-019
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Local, remote Git, and remote non-Git regex-index layouts preserve generation snapshot paths, remote cache roots, manifest mappings, hash8 short paths, and Windows longPathAware mitigation."
gui_related: false
gui_classification_reason: "This unit preserves backend cache layout and platform compatibility requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "GI-001"
- "BS-001"
- "T-001"
unblocks: []
acceptance_criteria:
- "SP-019 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: local_remote_regex_layout_windows_path_compatibility
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0034"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0035"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0036"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0037"
preserved_exact_tokens:
- ".puppet-master/project/state/regex_index/"
- "frequency_table.bin"
- "gen-{N}/postings.bin"
- "gen-{N}/lookup.bin"
- "gen-{N}/file_map.bin"
- "gen-{N}/index_meta.json"
- ".puppet-master/cache/r/{hash8}/"
- "git/m/{sub_hash8}/"
- "dirty/"
- "manifest.json"
- "hash8 -> project_id/submodule_path"
- "MAX_PATH"
- "/cache/r/{hash8}/git/m/{hash8}/"
- "xxh3(full_id)"
- "longPathAware"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Tools.md, Invariant:INV-002, ContractName:Plans/Architecture_Invariants.md"
- "ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/BinaryLocator_Spec.md"
- "ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/BinaryLocator_Spec.md, ContractName:Plans/Tools.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/GitHub_Integration.md"
- "Plans/BinaryLocator_Spec.md"
- "Plans/Tools.md"
```

### SP-020 - Remote Cache Settings And Eviction Policy

```yaml
plan_unit_id: SP-020
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Remote cache settings persist per-project with global defaults, keep shallow and partial clone toggles independent and off by default, and evict remote caches only by idle age, cache size pressure, or explicit user action."
gui_related: false
gui_classification_reason: "This unit preserves backend remote cache policy and permission-adjacent configuration requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "PS-001"
unblocks: []
acceptance_criteria:
- "SP-020 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: remote_cache_settings_eviction_policy
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0038"
preserved_exact_tokens:
- "Shallow clone is OFF by default"
- "--depth=1"
- "Partial clone is OFF by default"
- "--filter=blob:none"
- "30 days"
- "50 GB"
- "10% of free disk"
- "LRU project caches"
- "Clear All Remote Caches"
- "grep remains read-only"
- "/Permissions_System.md"
- "/plan-mode"
negative_constraints:
- "Remote cache settings do not introduce a new grep permission key or /plan-mode exception."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Permissions_System.md"
- "Plans/Run_Modes.md"
```

### SP-021 - Remote Cache Disk Usage Display

```yaml
plan_unit_id: SP-021
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Disk-usage reporting shows local and remote project cache sizes, including separate remote index and Git portions."
gui_related: true
gui_classification_reason: "This unit preserves user-visible disk-usage reporting text."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-021 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: remote_cache_disk_usage_display
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0038"
preserved_exact_tokens:
- "Disk-usage reporting"
- "BOTH local and remote project caches"
- "Index: {size}"
- "Remote cache: {total} - Index: {idx_size}, Git: {git_size}"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-022 - Binary Index File Contracts

```yaml
plan_unit_id: SP-022
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Binary index files use little-endian no-padding formats for file_map.bin, lookup.bin, postings.bin, and index_meta.json with explicit headers, offsets, portable Roaring bytes, and dirty-layer non-persistence."
gui_related: false
gui_classification_reason: "This unit preserves backend binary file format requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "T-001"
- "AI-001"
unblocks: []
acceptance_criteria:
- "SP-022 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: binary_index_file_contracts
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0039"
preserved_exact_tokens:
- "little-endian"
- "no inter-field padding"
- "file_map.bin"
- "PMFM"
- "schema_version:u32"
- "entry_count:u32"
- "path_byte_length:u32"
- "forward-slash (/) normalized"
- "lookup.bin"
- "PMLK"
- "xxh3_hash:u64"
- "postings_offset:u64"
- "64 KB-aligned"
- "MapViewOfFile"
- "postings.bin"
- "PMPL"
- "bitmap_byte_length:u32"
- "RoaringBitmap::serialize_into"
- "index_meta.json"
- "dirty-layer state is NOT persisted"
negative_constraints:
- "File IDs are generation-local only and MUST NOT be treated as stable across builds or across snapshot generations."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md"
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Architecture_Invariants.md"
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md, Invariant:INV-002"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Tools.md"
- "Plans/GitHub_Integration.md"
- "Plans/Architecture_Invariants.md"
```

### SP-023 - Frequency Table Path Compatibility And Startup Validation

```yaml
plan_unit_id: SP-023
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Frequency-table, path compatibility, and validation rules preserve The Stack Smol base matrix, static binary embedding, project blend rule, fixed 3-gram fallback, path normalization, case sensitivity, startup validation, Windows MAX_PATH mitigation, and OS indexer exclusions."
gui_related: false
gui_classification_reason: "This unit preserves backend indexing, compatibility, and validation requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "T-001"
- "GI-001"
- "AI-001"
unblocks: []
acceptance_criteria:
- "SP-023 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: frequency_table_path_compatibility_startup_validation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0040"
preserved_exact_tokens:
- "The Stack Smol"
- "bigcode/the-stack-smol"
- "256x256 matrix"
- "CRLF-stripped ASCII-lowercased bytes"
- "static const [u16; 65536]"
- "[u16; 65536]"
- "effective[a][b] = 0.5 * base[a][b] + 0.5 * project[a][b]"
- "fixed-width 3-gram extraction"
- "file_map.bin stores forward-slash relative paths"
- "case_sensitive_fs"
- "anchor_sha"
- "FILE_ATTRIBUTE_NOT_CONTENT_INDEXED"
- "SetFileAttributesW"
- ".metadata_never_index"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md"
- "ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Tools.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Tools.md"
- "Plans/GitHub_Integration.md"
- "Plans/Architecture_Invariants.md"
```

### SP-024 - Index Sizing Guidance And Seglog Boundary Anchor

```yaml
plan_unit_id: SP-024
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Sparse n-gram index sizing guidance remains explicit, and the 2.2 seglog heading is retained as the source boundary for the next storage-plan batch."
gui_related: false
gui_classification_reason: "This unit preserves backend sizing guidance and the next storage section anchor."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "T-001"
- "GI-001"
unblocks: []
acceptance_criteria:
- "SP-024 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: index_sizing_guidance_seglog_boundary_anchor
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0041"
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0042"
preserved_exact_tokens:
- "1-10% of source code size"
- "50 MB"
- "500 MB"
- "1 GB"
- "50 GB"
- "2-5 GB"
- "<500 MB"
- "2.2 seglog: format, writer, rotation"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Tools.md"
- "Plans/GitHub_Integration.md"
```

### SP-025 - Mandatory Seglog CRC32 Integrity

```yaml
plan_unit_id: SP-025
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Seglog records must include CRC32 over the stored payload, validate before processing, skip corrupt records, emit recovery/integrity events, and resume projectors from the last known-good checkpoint."
gui_related: false
gui_classification_reason: "This unit preserves backend seglog integrity and recovery behavior."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "AI-001"
- "CV-001"
unblocks: []
acceptance_criteria:
- "SP-025 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: mandatory_seglog_crc32_integrity
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0043"
preserved_exact_tokens:
- "CRC32"
- "checksum"
- "mandatory correctness requirement"
- "not an optional enhancement"
- "record offset"
- "expected vs observed CRC"
- "last known-good checkpoint"
negative_constraints: []
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md"
- "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Runtime_Artifacts_Panel.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Architecture_Invariants.md"
- "Plans/Executor_Protocol.md"
- "Plans/Contracts_V0.md"
- "Plans/Runtime_Artifacts_Panel.md"
```

### SP-026 - Seglog Wire Format And Payload Authority

```yaml
plan_unit_id: SP-026
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Seglog uses a length-prefixed binary MessagePack record stream with canonical header fields, payload-only compression, checksum validation, and JSON diagnostics as non-authoritative mirrors."
gui_related: false
gui_classification_reason: "This unit preserves backend on-disk seglog wire-format requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "CV-001"
unblocks: []
acceptance_criteria:
- "SP-026 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: seglog_wire_format_payload_authority
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0044"
preserved_exact_tokens:
- "length-prefixed binary record stream"
- "MessagePack"
- "JSON is not the on-disk authority"
- "SeglogRecord"
- "SeglogHeader"
- "version: u8"
- "segment_generation: u32"
- "event_type: string"
- "sequence_id: u64"
- "source_timestamp_ns?"
- "observed_timestamp_ns"
- "payload_length: u32"
- "checksum_crc32: u32"
- "compression: \"none\" | \"lz4\""
negative_constraints:
- "JSON is not the on-disk authority."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Contracts_V0.md"
```

### SP-027 - Deterministic Seglog Rotation

```yaml
plan_unit_id: SP-027
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Seglog rotation is deterministic and generation-aware with one active segment, canonical active and closed segment path formats, immutable closed segments, and lexicographic projector consumption."
gui_related: false
gui_classification_reason: "This unit preserves backend seglog segment lifecycle and rotation requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-027 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: deterministic_seglog_rotation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0045"
preserved_exact_tokens:
- "one active writable segment"
- "storage/seglog/seg-{generation:06}-{start_seq:020}.active"
- "storage/seglog/seg-{generation:06}-{start_seq:020}-{end_seq:020}.seglog"
- "schema-generation change"
- "closed segments are immutable"
- "no in-place rewrite"
- "lexicographic order"
negative_constraints:
- "Closed segments are immutable; no in-place rewrite is allowed."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-028 - Seglog Replay And Rebuild Rules

```yaml
plan_unit_id: SP-028
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Replay and rebuild keep seglog authoritative over redb projections, JSONL mirrors, and Tantivy indices, resume from stable checkpoints, truncate only corrupt tails after the last verified record, and preserve sequence_id ordering."
gui_related: false
gui_classification_reason: "This unit preserves backend replay, rebuild, and source-of-truth ordering requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "AI-001"
- "CV-001"
unblocks: []
acceptance_criteria:
- "SP-028 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: seglog_replay_rebuild_rules
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0046"
preserved_exact_tokens:
- "redb projections"
- "JSONL mirror files"
- "Tantivy indices"
- "seglog"
- "last committed checkpoint"
- "{ segment_generation, segment_name, byte_offset, last_seq }"
- "partial/corrupt tail"
- "last verified record"
- "sequence_id ordering"
- "semantic event order"
negative_constraints:
- "redb projections, JSONL mirror files, and Tantivy indices are rebuildable from seglog plus stable checkpoints; none of them outrank seglog as authority."
preserved_contractrefs:
- "ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md"
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Architecture_Invariants.md"
- "Plans/Executor_Protocol.md"
- "Plans/Contracts_V0.md"
```

### SP-029 - redb Schema Boundary Anchor

```yaml
plan_unit_id: SP-029
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "The redb schema, migrations, and key patterns heading remains the canonical section boundary for durable KV schema rules."
gui_related: false
gui_classification_reason: "This unit preserves backend section anchoring for redb schema requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-029 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: redb_schema_boundary_anchor
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0047"
preserved_exact_tokens:
- "2.3 redb: schema, migrations, key patterns"
- "redb"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-030 - Canonical Record Baseline

```yaml
plan_unit_id: SP-030
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Canonical records are the immutable single source of truth for run, node, lane, and execution state and carry created/updated audit fields."
gui_related: false
gui_classification_reason: "This unit preserves backend canonical record baseline requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-030 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: canonical_record_baseline
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0048"
preserved_exact_tokens:
- "single source of truth"
- "run"
- "node"
- "lane"
- "execution state"
- "immutable once committed"
- "explicit lineage"
- "created_at_utc"
- "updated_at_utc"
- "created_by"
negative_constraints:
- "Canonical records are immutable once committed; corrections require a new record with explicit lineage."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-031 - Concern Record Lifecycle Canon

```yaml
plan_unit_id: SP-031
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Concern is a first-class durable record distinct from findings, annotations, blocked episodes, and graph patch requests, with lifecycle, lineage, severity/category/status, governance metadata, resolution_kind, and separate projection/linkage layers."
gui_related: false
gui_classification_reason: "This unit preserves backend concern record lifecycle and storage separation requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-031 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: concern_record_lifecycle_canon
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0049"
preserved_exact_tokens:
- "Concern"
- "first-class durable record"
- "review finding"
- "annotation"
- "blocked episode"
- "graph patch request"
- "concern_id"
- "project_id"
- "evidence/source refs"
- "lineage refs"
- "severity/category/status"
- "resolution_kind"
- "accepted_risk"
- "concern_record"
- "concern_projection"
- "blocked_episode linkage"
negative_constraints:
- "Storage persists concern_record separately from concern_projection and blocked_episode linkage so lifecycle ownership stays durable and queryable."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-032 - Required redb Key Baseline

```yaml
plan_unit_id: SP-032
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "The baseline redb key families include run, node, lane, execution_unit, and receipt records with stable entity key patterns."
gui_related: false
gui_classification_reason: "This unit preserves backend redb key-pattern requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-032 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: required_redb_key_baseline
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0050"
preserved_exact_tokens:
- "run:<run_id>"
- "node:<node_id>"
- "lane:<lane_id>"
- "execution_unit:<execution_unit_id>"
- "receipt:<receipt_id>"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-033 - Historical Semantic Consistency

```yaml
plan_unit_id: SP-033
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage defines shared historical vocabulary while keeping family-local workflow states distinct across concern, receipt, artifact, worktree, and usage families."
gui_related: false
gui_classification_reason: "This unit preserves backend historical vocabulary and lifecycle separation requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-033 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: historical_semantic_consistency
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0051"
preserved_exact_tokens:
- "historical"
- "stale_historical"
- "superseded"
- "revoked"
- "reopened"
- "archived"
- "removed"
- "remediation.resolved"
- "family-local workflow states"
- "concern"
- "receipt"
- "artifact"
- "worktree"
- "usage"
negative_constraints:
- "Historical terms stay shared across concern, receipt, artifact, worktree, and usage families without collapsing family-local workflow states."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-034 - Cross-Surface Receipt Baseline

```yaml
plan_unit_id: SP-034
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Receipt records bind execution results to canonical run, node, and lane identity for dashboard, CLI, and API query surfaces."
gui_related: false
gui_classification_reason: "This unit preserves backend receipt baseline and cross-surface query requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-034 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: cross_surface_receipt_baseline
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0052"
preserved_exact_tokens:
- "Receipt records"
- "canonical run"
- "node"
- "lane identity"
- "execution_unit_id"
- "result_summary"
- "artifacts"
- "evidence_ref"
- "Dashboard"
- "CLI"
- "API"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-035 - Projection Rehydration Baseline

```yaml
plan_unit_id: SP-035
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Projections are derived from canonical records and events, freshness is tracked per projection type, and startup rehydration restores projections from seglog and redb canonical records."
gui_related: false
gui_classification_reason: "This unit preserves backend projection freshness and startup rehydration requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-035 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: projection_rehydration_baseline
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0053"
preserved_exact_tokens:
- "Projections"
- "canonical records and events"
- "Projection freshness"
- "per projection type"
- "stale projections"
- "startup"
- "seglog"
- "redb canonical records"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-036 - Account Pressure Attribution Baseline

```yaml
plan_unit_id: SP-036
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Account pressure metrics are stored per account at node/lane boundaries, history records are immutable and linked to canonical identity, and runtime attribution tracks actor/role execution."
gui_related: false
gui_classification_reason: "This unit preserves backend account pressure, history, and attribution requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-036 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: account_pressure_attribution_baseline
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0054"
preserved_exact_tokens:
- "Account pressure metrics"
- "per account"
- "node/lane boundaries"
- "History records"
- "account-level"
- "execution-level"
- "immutable"
- "canonical run/node identity"
- "Runtime attribution"
- "actor/role"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-037 - Artifact Index And Route Linkage Baseline

```yaml
plan_unit_id: SP-037
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Artifacts are indexed by artifact ID, export manifests bind artifact collections to deliverables, and route/open linkage records active route args and open contracts during execution."
gui_related: false
gui_classification_reason: "This unit preserves backend artifact index, export manifest, and route/open linkage requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-037 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: artifact_index_route_linkage_baseline
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0055"
preserved_exact_tokens:
- "artifact ID"
- "run"
- "node"
- "receipt records"
- "Export manifests"
- "project deliverables"
- "Route/open linkage"
- "route args"
- "open contracts"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-038 - Worktree Lane Cleanup Baseline

```yaml
plan_unit_id: SP-038
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Worktree lifecycle storage tracks allocation, usage, reclamation, Source Control to Orchestrator handshakes, and cleanup lineage for stale worktree audit."
gui_related: false
gui_classification_reason: "This unit preserves backend worktree/lane lifecycle and cleanup storage requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "W-001"
unblocks: []
acceptance_criteria:
- "SP-038 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: worktree_lane_cleanup_baseline
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0056"
preserved_exact_tokens:
- "Worktree lifecycle records"
- "allocation"
- "usage"
- "reclamation events"
- "Handshake records"
- "Source Control → Orchestrator"
- "cleanup lineage"
- "stale worktrees"
- "removed"
- "audited"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/WorktreeGitImprovement.md"
```

### SP-039 - Naming And Migration Baseline

```yaml
plan_unit_id: SP-039
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Schema keys follow entity_type:entity_id:sub_key patterns, migrations are versioned and idempotent, old versions remain supported for at least one major release, and deprecation is explicit in migration notes."
gui_related: false
gui_classification_reason: "This unit preserves backend naming and schema migration requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-039 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: naming_migration_baseline
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0057"
preserved_exact_tokens:
- "entity_type:entity_id:sub_key"
- "Migrations"
- "versioned"
- "idempotent"
- "old schema versions"
- "at least one major release"
- "Deprecation"
- "migration notes"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-040 - Owner-First Canonicalization Order

```yaml
plan_unit_id: SP-040
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Owner-doc corrections happen before consumer and mirror cleanup, and fidelity audit reruns only after owner and consumer corrections are in place."
gui_related: false
gui_classification_reason: "This unit preserves backend plan-governance sequencing for storage owner corrections."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-040 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: owner_first_canonicalization_order
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0058"
preserved_exact_tokens:
- "owner-doc corrections"
- "consumer and mirror cleanup"
- "fidelity audit"
- "canonical owner records first"
- "dependent projections and mirrors second"
- "fidelity rerun evidence"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-041 - Runtime Storage Record Families

```yaml
plan_unit_id: SP-041
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage owns one shared record envelope and required runtime/storage families for attempts, blocked projections, concerns, worktrees, lanes, project summaries, attention items, account pressure, and account switch events."
gui_related: false
gui_classification_reason: "This unit preserves backend runtime/storage record family requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "CV-001"
unblocks: []
acceptance_criteria:
- "SP-041 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: runtime_storage_record_families
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0059"
preserved_exact_tokens:
- "shared record envelope"
- "attempt_record.v1:{project_id}:{node_id}:{attempt_number}"
- "blocked_projection.v1:{project_id}:{node_id}"
- "concern_record.v1:{project_id}:{concern_id}"
- "worktree_record.v1:{project_id}:{worktree_id}"
- "lane_record.v1:{project_id}:{lane_id}"
- "project_summary.v1:{project_id}"
- "project_attention_item.v1:{project_id}:{attention_item_id}"
- "account_pressure_episode.v1:{provider_id}:{account_id}:{episode_id}"
- "account_switch_event.v1:{provider_id}:{event_id}"
- "resolution_kind"
- "fixed"
- "accepted_risk"
- "superseded"
- "merged"
- "split"
- "invalidated"
- "obsoleted_by_patch"
- "obsoleted_by_recovery"
negative_constraints:
- "source-event refs, concern records, and concern projections are separate structural layers rather than one collapsed object."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Contracts_V0.md"
```

### SP-042 - Project Runtime redb Keys

```yaml
plan_unit_id: SP-042
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Project/runtime redb keys include artifact indices, projector checkpoints, attempt and blocked records, concern records, project summary/attention items, worktree/lane records and projections, thread state bindings, and account pressure/switch events."
gui_related: false
gui_classification_reason: "This unit preserves backend project/runtime redb key requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-042 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: project_runtime_redb_keys
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0060"
preserved_exact_tokens:
- "artifacts_index.v1:{project_id}:{artifact_id}"
- "artifacts_project_state.v1:{project_id}"
- "projector.checkpoint.runtime_artifacts:{project_id}"
- "thread_state:{thread_id}:worktree_binding"
- "thread_state:{thread_id}:persona_override"
- "worktree_binding_reverse:{worktree_id}"
- "lane_projection.v1:{project_id}:{lane_id}"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-043 - Cross-Surface Receipt Required Fields

```yaml
plan_unit_id: SP-043
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Cross-surface receipts preserve required attempt/provider/usage/workflow/container/Kubernetes/auditor-cycle/run/verdict/phase/quality fields, allow legacy validation_pass_report only as a compatibility mirror with compatibility_only true plus cycle_report_ref, and keep attempt_id as the primary local anchor."
gui_related: false
gui_classification_reason: "This unit preserves backend cross-surface receipt field and join requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-043 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: cross_surface_receipt_required_fields
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0061"
preserved_exact_tokens:
- "attempt_id"
- "provider_attempt_ref"
- "usage_event_ref"
- "workflow_refs"
- "docker_refs"
- "kubernetes_refs"
- "auditor_cycle_report"
- "validation_pass_report"
- "compatibility_only"
- "cycle_report_ref"
- "workflow_run_id"
- "run_id"
- "pass_verdict"
- "phase_plan_ref"
- "requirements_quality_report_ref"
- "primary local anchor"
- "Artifact open flows"
- "artifact_id"
- "linked envelope refs"
negative_constraints:
- "provider_attempt_ref, usage_event_ref, and receipt refs do not replace the local key."
preserved_contractrefs: []
compatibility_only_notes:
- "validation_pass_report is a legacy mirror only and must carry compatibility_only true plus cycle_report_ref to auditor_cycle_report."
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-044 - Command Alert Incident Timeline Records

```yaml
plan_unit_id: SP-044
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Command-originated alerts are durable incident timeline records with parent/root cause linkage, required alert fields, attention routing precedence, delivery classes, escalation state, waiting states, and coalescing behavior."
gui_related: false
gui_classification_reason: "This unit preserves durable alert records with user-visible routing terms but remains classified as storage-record behavior."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "UCC-001"
unblocks: []
acceptance_criteria:
- "SP-044 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: command_alert_incident_timeline_records
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0062"
preserved_exact_tokens:
- "parent_incident_id"
- "parent-incident"
- "root_cause_key"
- "raised_at"
- "source_surface"
- "severity"
- "owning_surface"
- "acknowledged/snoozed state"
- "resolved_at"
- "attention_key"
- "/coalescing"
- "Orchestrator"
- "GitHub Actions"
- "Docker Manager"
- "status bar"
- "Dashboard"
- "blocking_modal"
- "interruptive_toast"
- "persistent_banner_or_card"
- "badge_only"
- "waiting"
- "waiting_long"
- "attention_waiting"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/UI_Command_Catalog.md"
```

### SP-045 - Project Attention And Execution Reconciliation

```yaml
plan_unit_id: SP-045
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Project attention records do not collapse attention into orchestrator status; storage preserves severity meanings, family-local lifecycle states, projection freshness/health lineage, execution ownership migration, and worktree durable-key boundaries."
gui_related: true
gui_classification_reason: "This unit preserves user-visible project attention and execution ownership state."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "W-001"
unblocks: []
acceptance_criteria:
- "SP-045 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: project_attention_execution_reconciliation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0063"
preserved_exact_tokens:
- "orchestrator status"
- "idle/running/paused"
- "activity_state"
- "info"
- "warning"
- "attention_required"
- "blocked"
- "completion-blocking"
- "archived"
- "removed"
- "deleted"
- "governance_boundary"
- "tier_boundary"
- "projection_freshness"
- "projection_health"
- "last_projected_at_utc"
- "source_seq"
- "degraded_reason_code"
- "refresh_in_progress"
- "blocked_sequence"
- "startup-recovery"
- "scheduler-pass"
- "startup_recovered"
- "execution_role"
- "worktree_id"
- "/path"
- "/source-control"
- "base-branch"
negative_constraints:
- "Project attention records MUST NOT collapse user attention into only orchestrator status."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/WorktreeGitImprovement.md"
- "Plans/Executor_Protocol.md"
```

### SP-046 - Evidence Receipt Redaction Provenance

```yaml
plan_unit_id: SP-046
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Persisted/exported evidence, receipts, summaries, audit items, bulk outcomes, export manifests, holds, and structured-copy payloads preserve source provenance, redaction policy, stability classes, missing refs, and lineage facts."
gui_related: true
gui_classification_reason: "This unit preserves user-visible exported evidence, receipts, audit, and bulk action provenance."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-046 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: evidence_receipt_redaction_provenance
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0064"
preserved_exact_tokens:
- "source_event_ids[]"
- "source_event_ids"
- "blob_ref?"
- "blob_ref"
- "derived_by_projector"
- "projector_version"
- "redaction_profile_id"
- "derived_at"
- "embedded_snapshot"
- "local_blob_ref"
- "external_live_ref"
- "external_missing"
- "mandatory_scrub_applied"
- "heuristic_redaction_enabled"
- "display_may_hide_details"
- "partial-success"
- "per-target"
- "exported_at"
- "source_seglog_range"
- "missing_external_refs[]"
- "hold_state"
- "structured-copy"
negative_constraints:
- "Consumers distinguish source facts from projected summaries."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-047 - External Evidence And Sensitive Metadata Storage

```yaml
plan_unit_id: SP-047
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "External operation evidence separates ephemeral, scrubbed persisted, and user-exported forms; privileged sessions store bounded metadata only; secret-bearing build/deploy data uses no-persist/no-echo flags; sensitive metadata and Kubernetes Secret rendering are masked by default."
gui_related: true
gui_classification_reason: "This unit preserves user-visible export, screenshot, evidence, auth handoff, and sensitive metadata behavior."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "PS-001"
unblocks: []
acceptance_criteria:
- "SP-047 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: external_evidence_sensitive_metadata_storage
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0065"
preserved_exact_tokens:
- "ephemeral in-memory view"
- "scrubbed persisted blob"
- "user-exported"
- "scrub-before-persist"
- "scrub-before-index"
- "docker exec/attach"
- "kubectl exec"
- "kubectl port-forward"
- "remote SCM-over-SSH"
- "browser/device auth handoffs"
- "no-persist"
- "/no-echo"
- "Docker Hub account identity"
- "SSH usernames/host aliases"
- "screenshot-visible values"
- "Kubernetes Secret"
- "ConfigMap"
- "Open app"
- "access-intelligence"
negative_constraints:
- "The durable store does not persist interactive transcript or /stdin by default."
- "Kubernetes Secret resources are never rendered back in full, never indexed, and never included in receipts or /evidence beyond kind, /name/namespace, and redacted status."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Permissions_System.md"
```

### SP-048 - Durable Store Scope Split

```yaml
plan_unit_id: SP-048
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Durable store boundaries split secrets into the OS credential store, global app state and project state into redb, and auth/recovery/action/event linkage into seglog."
gui_related: true
gui_classification_reason: "This unit preserves user-visible scope/store boundaries in a table consumed by configuration and state surfaces."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-048 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: durable_store_scope_split
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0066"
preserved_exact_tokens:
- "Secret"
- "OS credential store only"
- "Global app state"
- "redb"
- "Project state"
- "Event ledger"
- "seglog"
- "GitHub API tokens"
- "Docker PATs"
- "browser-login derived credentials"
- "registry/helper secrets"
- "selected repo/worktree"
- "panel subviews"
- "pinned workflows"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-049 - Projection Freshness Health Operational Rules

```yaml
plan_unit_id: SP-049
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Projection operational rules persist active/focused run identity, historical focus mode, cross-tab deep link targeting, separate freshness and health axes, action gating, and trust_tier retirement to preview/browser semantics only."
gui_related: true
gui_classification_reason: "This unit preserves user-visible projection trust, focus, deep-link, and action gating behavior."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-049 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: projection_freshness_health_operational_rules
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0067"
preserved_exact_tokens:
- "active_run_id"
- "focused_run_id"
- "focus_mode = live | historical"
- "cross-tab deep links"
- "search pivots"
- "projection_freshness"
- "projection_health"
- "MUST NOT collapse"
- "stale-but-healthy"
- "degraded"
- "unavailable"
- "trust_tier"
- "preview/browser semantics"
negative_constraints:
- "projection_freshness remains the recency axis and projection_health remains the integrity/availability axis; storage and consumers MUST NOT collapse them into a single trust field."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-050 - Execution Unit Context Ownership Split

```yaml
plan_unit_id: SP-050
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage consumes the Executor-owned execution_unit_context schema for persisted packet refs and attempt, usage, receipt, and artifact joins while TierContext and tier_id remain compatibility-only derived metadata."
gui_related: true
gui_classification_reason: "This unit preserves GUI/runtime inspection identity and storage ownership for execution context."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "CV-001"
unblocks: []
acceptance_criteria:
- "SP-050 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "Storage references Plans/Executor_Protocol.md and Plans/execution_unit_context.schema.json instead of redefining execution_unit_context fields."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: execution_unit_context_ownership_split
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0068"
preserved_exact_tokens:
- "execution_unit_context"
- "TierContext"
- "tier_id"
- "compatibility-only derived metadata"
- "worker spawn"
- "recovery"
- "remediation"
- "coordination"
- "UI inspection"
- "Contracts_V0"
- "Executor_Protocol"
- "schema_version"
- "Plans/execution_unit_context.schema.json"
- "cross-family attribution packet"
- "attempt/usage/receipt/artifact joins"
negative_constraints:
- "Any TierContext or tier_id decomposition is compatibility-only derived metadata for legacy selection helpers and MUST NOT own runtime canon, storage keys, or join identity."
- "storage-plan must not redefine execution_unit_context required fields, optional fields, enum values, or nullability."
- "Persisted storage payloads must not embed execution_unit_context without schema_version."
- "execution_unit_context payloads must not persist secrets, tokens, passwords, credentials, API keys, provider auth values, or local machine secrets."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Executor_Protocol.md"
- "Plans/execution_unit_context.schema.json"
- "Plans/Contracts_V0.md"
```

### SP-051 - Artifact Route Open Ownership Split

```yaml
plan_unit_id: SP-051
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Runtime artifacts are attempt-native by default with artifact identity and linked refs; Contracts_V0 owns route_target/OpenSubject, Crosswalk remains primitive-boundary limited, FileManager OpenFile remains narrow/path-based, and export manifests carry route/open linkage by reference."
gui_related: false
gui_classification_reason: "This unit preserves backend artifact and route/open ownership boundaries."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "CV-001"
unblocks: []
acceptance_criteria:
- "SP-051 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: artifact_route_open_ownership_split
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0069"
preserved_exact_tokens:
- "attempt-native"
- "artifact identity"
- "routing refs"
- "content refs"
- "provider/usage linkage"
- "artifact_id"
- "linked envelope refs"
- "route_target"
- "OpenSubject"
- "Crosswalk"
- "FileManager OpenFile"
- "path-based"
- "route/open linkage by reference"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/Contracts_V0.md"
- "Plans/Crosswalk.md"
- "Plans/FileManager.md"
```

### SP-052 - Worktree Lane Ownership Split

```yaml
plan_unit_id: SP-052
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage records worktree/lane rows with owning package/lane/run refs, lifecycle and blocked/recovery state, durable worktree_id and lane_id identities, package linkage, and cleanup/archive lineage while Orchestrator and Source Control own their operational halves."
gui_related: true
gui_classification_reason: "This unit preserves user-visible Source Control and Orchestrator worktree/lane rows backed by storage records."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
- "W-001"
unblocks: []
acceptance_criteria:
- "SP-052 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: worktree_lane_ownership_split
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0070"
preserved_exact_tokens:
- "Orchestrator"
- "lane-pool operational truth"
- "Source Control"
- "concrete repo/worktree operator"
- "owning package/lane/run refs"
- "lifecycle"
- "blocked/recovery state"
- "worktree_record/worktree_projection"
- "lane_record/lane_projection"
- "worktree_id"
- "lane_id"
- "package/work-package linkage"
- "cleanup/archive lineage"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
- "Plans/WorktreeGitImprovement.md"
```

### SP-053 - Forward-Only Storage Migration Policy

```yaml
plan_unit_id: SP-053
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage migrations are forward-only and monotonic: new fields are additive first, destructive renames require same-section migration notes, semantic names stay aligned or use explicit translations, durable account/profile and server-profile shapes stay distinct, and consumers follow owner-first propagation."
gui_related: true
gui_classification_reason: "This unit preserves user-visible GUI ontology boundaries and forward-only storage migration policy."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-053 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: forward_only_storage_migration_policy
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0071"
preserved_exact_tokens:
- "forward-only"
- "monotonic"
- "new fields are additive first"
- "destructive renames"
- "migration note"
- "stable semantic names"
- "translation layer"
- "account/profile-backed runtime records"
- "server-profile-backed runtime records"
- "one GUI ontology"
- "owner correction here first"
- "consumer propagation"
- "fidelity audit rerun"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-054 - Canonical Records Owner Reconciliation

```yaml
plan_unit_id: SP-054
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage owns discoverable record families for runtime, receipt, and projection truth during owner reconciliation."
gui_related: false
gui_classification_reason: "This unit preserves backend owner reconciliation for record-family ownership."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-054 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: canonical_records_owner_reconciliation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0072"
preserved_exact_tokens:
- "Canonical records (owner reconciliation)"
- "runtime"
- "receipt"
- "projection truth"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-055 - Required redb Keys Owner Reconciliation

```yaml
plan_unit_id: SP-055
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Owner-reconciled redb keys include artifact/projector checkpoint, worktree, lane, thread binding, reverse binding, and orchestrator project state families."
gui_related: false
gui_classification_reason: "This unit preserves backend owner-reconciled redb key requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-055 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: required_redb_keys_owner_reconciliation
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0073"
preserved_exact_tokens:
- "artifacts_index.v1:{project_id}:{artifact_id}"
- "artifacts_project_state.v1:{project_id}"
- "projector.checkpoint.runtime_artifacts:{project_id}"
- "worktree_record.v1:{project_id}:{worktree_id}"
- "lane_record.v1:{project_id}:{lane_id}"
- "thread_state:{thread_id}:worktree_binding"
- "worktree_binding_reverse:{worktree_id}"
- "orchestrator.project_state.{project_id}"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-056 - Cross-Surface Receipt Storage Rules

```yaml
plan_unit_id: SP-056
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Cross-surface receipt storage rules keep auditor_cycle_report receipt fields lineage-bearing and storage-owned for runtime artifacts, worktree records, lane records, and project-state keys; validation_pass_report is legacy mirror storage only with compatibility_only true plus cycle_report_ref."
gui_related: false
gui_classification_reason: "This unit preserves backend receipt storage ownership and lineage requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-056 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: cross_surface_receipt_storage_rules
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0074"
preserved_exact_tokens:
- "Cross-surface receipt record (storage rules)"
- "attempt_id"
- "provider_attempt_ref"
- "usage_event_ref"
- "workflow_refs"
- "docker_refs"
- "kubernetes_refs"
- "auditor_cycle_report"
- "validation_pass_report"
- "compatibility_only"
- "cycle_report_ref"
- "Receipt fields remain lineage-bearing"
- "Runtime artifacts"
- "worktree records"
- "lane records"
- "project-state keys"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- "validation_pass_report is a legacy mirror only and must carry compatibility_only true plus cycle_report_ref to auditor_cycle_report."
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-057 - Temporal Receipt Persistence And Retention Anchors

```yaml
plan_unit_id: SP-057
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Temporal receipt fields, blocked-state records, stream views, and projections preserve timeout/wait/timer/observation fields, immediate flush rules, follow-mode/source-liveness separation, and explicit retention anchor semantics."
gui_related: false
gui_classification_reason: "This unit preserves backend temporal persistence and retention rules for receipt and blocked-state records."
split_recommended: true
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-057 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: temporal_receipt_persistence_retention_anchors
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0075"
preserved_exact_tokens:
- "timeout_class?"
- "wait_state_class?"
- "source_timer_ref?"
- "scheduled_workflow_ref?"
- "last_observation_at_utc?"
- "transitioned_at_utc"
- "retention_anchor_kind"
- "retention_anchor_at_utc"
- "hard execution timeout"
- "inactivity timeout"
- "polling timeout"
- "reconnect timeout"
- "user-visible wait timer expiry"
- "flush immediately"
- "follow-mode intent"
- "/node/log"
- "creation time"
- "last observation"
- "last access"
- "run completion"
- "MUST NOT infer the anchor from file mtime alone"
negative_constraints:
- "Retention policies for receipts, log tails, watch buffers, explorer snapshots, and stale caches MUST store both retention_anchor_kind and retention_anchor_at_utc; implementations MUST NOT infer the anchor from file mtime alone."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-058 - Freshness Policy Fields And Post-Expiry Modes

```yaml
plan_unit_id: SP-058
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Storage records freshness policy separately from retention; watch, follow-mode, log tail, explorer snapshot, stale cache, and remote runtime projection families declare stale_window_policy, stale_window_expires_at_utc, and post-expiry posture actionable, refresh-first, or read-only."
gui_related: false
gui_classification_reason: "This unit preserves backend stale-window policy fields rather than visual presentation."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-058 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: freshness_policy_fields_post_expiry_modes
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0076"
preserved_exact_tokens:
- "stale_window_policy"
- "stale_window_expires_at_utc"
- "actionable"
- "refresh-first"
- "read-only"
- "/watch"
- "follow-mode"
- "log tails"
- "explorer snapshots"
- "stale caches"
- "remote runtime projections"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-059 - Actions Readiness Refresh-First Gate

```yaml
plan_unit_id: SP-059
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Actions readiness snapshots may remain visible when stale, but workflow generation, apply, rerun, cancel, pin/unpin, and Actions Settings mutation require refresh-first; default expiry is 5m or immediate on workflow/settings/secret/environment input change."
gui_related: true
gui_classification_reason: "This unit preserves user-visible Actions readiness and stale action gating."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-059 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: actions_readiness_refresh_first_gate
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0076"
preserved_exact_tokens:
- "Actions readiness snapshot"
- "workflow generation"
- "apply"
- "rerun"
- "cancel"
- "pin/unpin"
- "Actions Settings mutation"
- "refresh-first"
- "5m"
- "last_observation_at_utc + 5m"
- "workflow/settings/secret/environment input change"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-060 - Workflow Run Freshness Gate

```yaml
plan_unit_id: SP-060
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Workflow run list/detail stale rows remain historical evidence, but live log follow, run mutation, rerun/cancel/pin, and dispatch require refresh-first; defaults are 60s for run lists and 15s for active run/detail/log-follow."
gui_related: true
gui_classification_reason: "This unit preserves user-visible workflow run freshness and log-follow gating."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-060 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: workflow_run_freshness_gate
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0076"
preserved_exact_tokens:
- "Workflow run list/detail"
- "stale rows"
- "historical evidence"
- "live log follow"
- "run mutation"
- "rerun/cancel/pin"
- "dispatch"
- "refresh-first"
- "60s"
- "15s"
- "last_observation_at_utc + threshold"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-061 - Docker Runtime Stale Snapshot Gate

```yaml
plan_unit_id: SP-061
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Docker container/image/compose snapshots are read-only when stale; lifecycle actions require refresh-first, with defaults of 15s for containers/compose health and 60s for image/registry inventory."
gui_related: true
gui_classification_reason: "This unit preserves user-visible Docker runtime stale-state and lifecycle action gating."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-061 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: docker_runtime_stale_snapshot_gate
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0076"
preserved_exact_tokens:
- "Docker runtime snapshot"
- "container/image/compose state"
- "read-only until refresh"
- "lifecycle actions"
- "refresh-first"
- "15s"
- "60s"
- "image/registry inventory"
- "cached inventory keeps freshness markers"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-062 - Kubernetes Workload Watch Stale Gate

```yaml
plan_unit_id: SP-062
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Kubernetes workload/watch state remains inspectable but read-only when stale; workload mutation, exec, port-forward, and rollout recovery require refresh-first, expiring at last_observation_at_utc + 15s or watch disconnect."
gui_related: true
gui_classification_reason: "This unit preserves user-visible Kubernetes stale-state and mutation gating."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-062 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: kubernetes_workload_watch_stale_gate
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0076"
preserved_exact_tokens:
- "Kubernetes workload/watch state"
- "rollout"
- "log"
- "exec"
- "port-forward"
- "workload mutation"
- "rollout recovery"
- "refresh-first"
- "last_observation_at_utc + 15s"
- "watch disconnect"
- "stale state remains inspectable"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-063 - Orchestrator Lineage Revalidation Freshness

```yaml
plan_unit_id: SP-063
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Orchestrator receipt/lineage stale views remain inspectable, but run-blocking recovery and CTA execution require canonical revalidation; active run stitching defaults to 30s, while completed historical receipts use retention policy instead of live freshness."
gui_related: true
gui_classification_reason: "This unit preserves user-visible Orchestrator receipt/lineage inspection and CTA revalidation gating."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-063 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: orchestrator_lineage_revalidation_freshness
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0076"
preserved_exact_tokens:
- "Orchestrator lineage/receipt stitching"
- "stale receipt/lineage views"
- "run-blocking recovery"
- "CTA actions"
- "canonical revalidation"
- "30s"
- "last_observation_at_utc + 30s"
- "completed historical receipts"
- "retention policy"
- "live freshness"
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-064 - Stale Threshold Policy Versioning

```yaml
plan_unit_id: SP-064
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Default stale-window thresholds are explicit and may be tightened by a surface owner, but must not be silently lengthened without a persisted policy version."
gui_related: false
gui_classification_reason: "This unit preserves backend stale threshold policy-versioning requirements."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-064 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: stale_threshold_policy_versioning
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0076"
preserved_exact_tokens:
- "Default stale-window thresholds"
- "surface owner"
- "may be tightened"
- "may not be silently lengthened"
- "persisted policy version"
- "Default stale threshold"
- "Expiry computation"
- "Post-expiry posture"
negative_constraints:
- "Default stale-window thresholds are explicit and may be tightened by a surface owner, but may not be silently lengthened without a persisted policy version."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-065 - Watchable Stream When-Hidden Policy

```yaml
plan_unit_id: SP-065
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Watchable streams declare when-hidden behavior for polling pause, return-to-visibility refresh, and relative timer elapsed/reset semantics so consumers do not infer continuity from the last rendered frame."
gui_related: true
gui_classification_reason: "This unit preserves user-visible watchable stream visibility and refresh behavior."
split_recommended: false
depends_on:
- "PDS-003"
- "PDS-004"
- "PDS-005"
- "PNC-001"
unblocks: []
acceptance_criteria:
- "SP-065 remains addressable as a fine-grained Storage Plan PlanUnit with source-span coverage."
- "ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source spans remain preserved."
- "No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit."
validation_surfaces:
- "python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits"
- "python3 scripts/pm-plan-index.py validate"
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_plan
implementation_surfaces:
- "Plans/storage-plan.md"
node_compile_hint:
  mode: watchable_stream_when_hidden_policy
  create_worknodes: false
source_lineage:
- "Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0076"
preserved_exact_tokens:
- "Pause-when-hidden"
- "watchable streams"
- "when-hidden"
- "polling pauses"
- "grace period"
- "return to visibility"
- "forces refresh"
- "relative timers"
- "hidden elapsed time"
- "reset"
- "last rendered frame"
negative_constraints:
- "Consumers do not infer continuity from the last rendered frame."
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- "Plans/storage-plan.md"
```

### SP-066 - Store Scope Split And Projection Owner Boundary

```yaml
plan_unit_id: SP-066
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage records keep secret, global app state, project state, and event ledger scope split across OS credential store only, redb, and seglog, while unified event/projection wording remains owned by Plans/newtools.md rather than a competing storage projection family.
gui_related: false
gui_classification_reason: This unit preserves backend storage ownership and projection owner boundaries.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: store_scope_split_and_projection_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- Scope split (owner reconciliation)
- OS credential store only
- redb
- seglog
- Plans/newtools.md
- /projection
- regex-index storage records
- PolicyRule:no_secrets_in_storage
negative_constraints:
- Secrets belong in the OS credential store only, not in redb or seglog.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/newtools.md, PolicyRule:no_secrets_in_storage'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-067 - Cross-Surface Project Panel State Persistence

```yaml
plan_unit_id: SP-067
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Cross-surface panel state is per-project and panel-specific across Source Control, GitHub Actions, Docker Manager, Kubernetes, hidden-subview policy, and Unraid navigation while canonical cmd.docker.* command aliases win when legacy and new keys coexist.
gui_related: true
gui_classification_reason: This unit preserves user-visible panel state, subviews, filters, focus, and navigation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: cross_surface_project_panel_state_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- source_control.project_state.{project_id}
- github_actions.project_state.{project_id}
- container_manager
- Docker Manager > Publish / Unraid
- cmd.docker.*
- History
- Graph
- Current Branch
- Workflows
- Settings
- admin-scope
- /job/log
- /context/compose/Kubernetes
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Legacy container and publish-oriented panel state migrates into container_manager or Docker Manager > Publish / Unraid.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-068 - Docker Manager One-Way Key Migration

```yaml
plan_unit_id: SP-068
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Docker Manager project-state key migration is one-way: legacy Docker keys are migration-read aliases only, canonical writes use container_manager.project_state.{project_id}, and adjacent owner families stay with Source Control, GitHub Actions, and Orchestrator receipts.'
gui_related: false
gui_classification_reason: This unit preserves backend storage-key ownership and one-way migration rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: docker_manager_one_way_key_migration
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- docker_manager.project_state.*
- docker.project_state.{project_id}
- docker.project_state
- docker_manage_surface_state
- /auth/Unraid
- migration-read aliases only
- container_manager.project_state.{project_id}
- source_control.project_state.{project_id}
- github_actions.project_state.{project_id}
- orchestrator.receipt.{run_id}.{attempt_id}
negative_constraints:
- Legacy Docker project-state keys are migration-read aliases only.
preserved_contractrefs: []
compatibility_only_notes:
- Legacy Docker Manager keys may be read for migration but must not receive canonical writes.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-069 - Cross-Process Target Ownership And Multi-Repo Identity

```yaml
plan_unit_id: SP-069
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Concurrent mutable control of the same project, repo, workspace root, runtime target, or remote repository is unsupported without a canonical project/target lock; conflicts degrade to read-only or explicit override and multi-repo projects carry stable workspace_root_id and repo_id below project_id.
gui_related: false
gui_classification_reason: This unit preserves backend cross-process locking, receipt, and multi-repo identity semantics.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: cross_process_target_ownership_and_multi_repo_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- project_id
- repo_id
- /workspace-root
- /repo/runtime
- remote_repo_ref
- read-only
- explicit override mode
- workspace_root_id
- origin
negative_constraints:
- Concurrent mutable control is unsupported unless a canonical project/target lock exists.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-070 - Mutation Lock And Stale-Selection Revalidation

```yaml
plan_unit_id: SP-070
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Mutation-capable operations claim mutation_lock_id, persist the validated armed selection/version, fail stale-selection when the visible target changes, and reconcile cancel-vs-complete races through receipt reference_state rules.
gui_related: false
gui_classification_reason: This unit preserves backend mutation lock, revalidation, and receipt reconciliation rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: mutation_lock_and_stale_selection_revalidation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- mutation_lock_id
- mutation-lock
- stale-selection
- reference_state
- project/repo/workspace target
- validated selection version
- cancel-vs-complete races
negative_constraints:
- Mutations must rebuild against the new canonical identity rather than applying to a previously visible row after stale-selection.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-071 - Worktrees Panel State Persistence

```yaml
plan_unit_id: SP-071
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Worktrees panel state persists selected worktree, sort mode, hide-stale, ownership display/focus, filters, and temporary Graph overlay badges until the dedicated Source Control Graph contract owns persisted graph state.
gui_related: true
gui_classification_reason: This unit preserves visible Worktrees panel state and Graph overlay badges.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: worktrees_panel_state_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- selected worktree
- sort mode
- hide-stale
- ownership display mode
- worktree ownership projection focus
- persisted worktree panel filters
- Graph overlay badges
- Source Control Graph contract
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-072 - Assistant Worktree Config Keys

```yaml
plan_unit_id: SP-072
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Assistant worktree settings are additive project-level redb config keys and do not replace Branching, File Manager, or Source Control panel-state keys.
gui_related: false
gui_classification_reason: This unit preserves backend project-level configuration keys.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: assistant_worktree_config_keys
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- config:project:{pid}:branching.assistant_auto_worktree
- config:project:{pid}:branching.assistant_worktree_cleanup_default
- config:project:{pid}:branching.assistant_worktree_base_ref
- config:project:{pid}:file_manager.worktree_follow_thread
- config:project:{pid}:branching.worktree_warning_threshold
- config:project:{pid}:branching.worktree_create_timeout_s
- config:project:{pid}:branching.assistant_worktree_pre_merge_test
- config:project:{pid}:branching.assistant_worktree_pre_merge_cmd
- config:project:{pid}:branching.worktree_pre_merge_test_timeout_s
- config:project:{pid}:branching.assistant_worktree_pre_merge_test_target
- ADDITIVE
negative_constraints:
- Assistant worktree settings are not replacements for existing Branching, File Manager, or Source Control panel-state keys.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-073 - Source Control Accordion And Filter Persistence

```yaml
plan_unit_id: SP-073
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Source Control accordion state and worktree_filter persist per project with enum values All, Threads, Orchestrator, and Manual, defaulting to All and remaining additive to thread/worktree binding keys.
gui_related: true
gui_classification_reason: This unit preserves visible Source Control accordion and Worktrees filter state.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: source_control_accordion_and_filter_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- config:project:{pid}:source_control.accordion_state
- Changes
- Worktrees
- Branches/Stash
- History
- Graph
- config:project:{pid}:source_control.worktree_filter
- worktree_filter
- All
- Threads
- Orchestrator
- Manual
- thread_state:{thread_id}:worktree_binding
- worktree_binding_reverse:{worktree_id}
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-074 - Shared Refresh Budgets And State-Class Observability

```yaml
plan_unit_id: SP-074
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Refresh and projection budgets are shared by SCM, Actions, Docker/Kubernetes, and Orchestrator through per-domain budgets, pause-when-hidden rules, backpressure telemetry, consistent state-class icon/text/badge mapping, and projector/cache/runtime observability records.
gui_related: true
gui_classification_reason: This unit preserves visible state-class mappings and backend refresh-budget observability.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: shared_refresh_budgets_and_state_class_observability
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- Git fetch
- Actions auto-refresh
- container health polling
- Kubernetes watch/log streams
- receipt projection
- per-domain budgets
- pause-when-hidden
- /backpressure
- Icon/text/badge mappings
- projector lag
- cache freshness
- stale-read age
- GitHub rate-limit state
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-075 - Command Receipt Lineage And Remote Clock Ordering

```yaml
plan_unit_id: SP-075
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Stitched receipt and long-running command lineage is ordered by storage records rather than remote clock trust, and operational command metadata carries command invocation, retry, correlation, observed, source, attempt, and run identifiers for deterministic replay.
gui_related: false
gui_classification_reason: This unit preserves backend receipt ordering and command lineage records.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: command_receipt_lineage_and_remote_clock_ordering
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- command-execution
- command_invocation_id
- started_at
- completed_at
- transport
- retry_count
- final_reason_code?
- /correlation
- receipt_id
- correlation_id
- source_system
- observed_at
- source_occurred_at?
- attempt_id?
- run_id?
- UI ordering
negative_constraints:
- Remote clocks are not trusted for canonical stitched receipt ordering.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-076 - Typed Orchestrator Deep-Link Context Payloads

```yaml
plan_unit_id: SP-076
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Orchestrator deep links use typed context payload families for Source Control, GitHub Actions, Docker Manager, and Kubernetes, with allowed_action_ids, deep_link_context, partial_lineage, and stale_data disclosure instead of generic URLs.
gui_related: false
gui_classification_reason: This unit preserves backend typed deep-link payload contracts.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: typed_orchestrator_deep_link_context_payloads
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- open_source_control_context
- open_github_actions_context
- open_docker_manager_context
- open_kubernetes_context
- allowed_action_ids[]?
- deep_link_context
- partial_lineage?
- stale_data?
- generic URLs
negative_constraints:
- Restored pivots must disclose partial evidence or stale data without inventing authority.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-077 - Per-Surface Filter And Focus Inheritance

```yaml
plan_unit_id: SP-077
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Per-surface search, filter, and focus inheritance is storage-backed per project; deep links record visible context filter chips or isolated focus markers so inherited context can be cleared without erasing saved project filters.
gui_related: true
gui_classification_reason: This unit preserves visible context filter chips, focus mode, and per-surface filter state.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: per_surface_filter_and_focus_inheritance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- /search
- filter
- /focus
- visible context filter chip
- isolated focus mode
- inherited-filter marker
- saved project filters
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-078 - Host-Aware File And Editor Search Write-State

```yaml
plan_unit_id: SP-078
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'File/editor search write-state is host-aware: persisted search state may reopen visible local, remote, diff, or editor-buffer queries, but write-capable actions bind to the owning project, host, repo/worktree, and recover-unsaved buffer context.'
gui_related: true
gui_classification_reason: This unit preserves user-visible search state and write-authority recovery behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: host_aware_file_and_editor_search_write_state
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- /search/write-state
- Local tree search
- remote tree search
- diff search
- editor-buffer search
- project
- host
- repo/worktree
- recover-unsaved context
negative_constraints:
- A stale cross-ref can reopen the visible query but cannot claim write authority.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-079 - SCM Side-Effect Lineage And Partial Receipt Replay

```yaml
plan_unit_id: SP-079
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: SCM side-effect lineage persists restart-stable receipt context for Orchestrator and Source Control, including repo/worktree/branch/head refs, partial receipt availability, destination filter/focus replay, and explicit complete-or-partial lineage state.
gui_related: false
gui_classification_reason: This unit preserves backend SCM receipt lineage and restart replay semantics.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: scm_side_effect_lineage_and_partial_receipt_replay
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- SCM side-effect lineage
- restart-stable receipt context
- repo/worktree/branch/head refs
- partial receipt availability
- complete or partial
- destination
- filter or focus mode
- Partial lineage
negative_constraints:
- Partial lineage is stored as an explicit state and must not be silently omitted or invented.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-080 - SCM Worktree Canonical Identity

```yaml
plan_unit_id: SP-080
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'SCM/worktree contract-resolution is storage-owned: project_id remains top-level, repo_id derives from vcs_root_fingerprint, worktree_id derives from worktree_realpath_fingerprint, worktree_path is display/navigation state, and historical snapshots stay separate from live_state.'
gui_related: false
gui_classification_reason: This unit preserves backend SCM and worktree identity rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: scm_worktree_canonical_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- project_id
- repo_id
- vcs_root_fingerprint
- gitrepo::<project_id>::<vcs_root_fingerprint>
- worktree_id
- worktree_realpath_fingerprint
- worktree::<repo_id>::<worktree_realpath_fingerprint>
- worktree_path
- /navigation
- historical_snapshot
- live_state
- compare_historical_to_live
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-081 - SCM Runtime Record Growth

```yaml
plan_unit_id: SP-081
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: SCM-capable attempt, tier runtime, blocked projection, and evidence records add exact SCM refs, dirty/conflict fields, ownership and baseline states, recovery targets, and evidence_scm_state so replay does not reconstruct state from UI text.
gui_related: false
gui_classification_reason: This unit preserves backend SCM runtime-record field growth.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: scm_runtime_record_growth
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- attempt_record
- tier_runtime_record
- blocked_projection
- evidence_record
- repo_id
- worktree_id
- worktree_path
- branch_name
- head_commit_oid
- baseline_commit_oid
- compare_target_ref
- git_operation_ref
- pr_ref
- dirty_file_paths
- dirty_file_paths[]
- conflict_file_paths[]
- ownership_state
- evidence_scm_state
negative_constraints:
- Receipts, blocked cards, and history replay exact SCM state instead of reconstructing it from UI text.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-082 - Project And Worktree Tombstone Lifecycle

```yaml
plan_unit_id: SP-082
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Project roots and retired worktrees keep durable tombstone states after deletion or missing-root, preserving immutable identity, last-known refs, receipts, historical deep-link behavior, and validation before resumable state.
gui_related: true
gui_classification_reason: This unit preserves user-visible tombstone, historical link, and rebind behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: project_and_worktree_tombstone_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- active
- missing_on_disk
- archived_from_ui
- deleted_from_registry
- not-found
- rebind_required
- worktree_id
- /receipts
- /recreate
- tombstone detail
- nearest valid compare target
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-083 - Receipt Reference-State And Live-List Anchors

```yaml
plan_unit_id: SP-083
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Receipt reference_state degradation is deterministic when identities disappear, and live-refreshing lists preserve row, menu, dialog, action anchors, and update-source metadata while users focus or arm mutations.
gui_related: true
gui_classification_reason: This unit preserves visible receipt degradation, list anchors, and update-source metadata.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: receipt_reference_state_and_live_list_anchors
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- reference_state
- reference-state
- live
- historical
- missing
- superseded
- target_no_longer_available
- rebased-away
- already_stopped
- already_replaced
- already_finished
- completed_before_cancel
- /containers
- /restarted
- /menu/dialog
- /update-source
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-084 - Source Control Storage Owner Boundary

```yaml
plan_unit_id: SP-084
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Source Control storage is an independent provider-agnostic SCM surface contract; storage owns durable keys and receipt joins while GUI owner docs own command placement.
gui_related: false
gui_classification_reason: This unit preserves backend storage owner/consumer boundaries for Source Control.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: source_control_storage_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- Source Control storage
- independent SCM surface contract
- GitHub-only side effect
- provider-agnostic SCM inventory
- graph/history filters
- merge-editor availability
- compare identity
- conflict presentation
- remote-aware Source Control contexts
negative_constraints:
- Source Control storage is not a GitHub-only side effect.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-085 - SCM Review GUI State Storage Boundary

```yaml
plan_unit_id: SP-085
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: SCM/review GUI state stores identity-rich review routes and summaries for compare, open/review, diff markers, heat maps, conflict heat maps, side-panel filter/focus, and preview linkage without owning hunk UI layout.
gui_related: true
gui_classification_reason: This unit preserves visible SCM review routes, banners, markers, heat maps, and preview linkage.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: scm_review_gui_state_storage_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- /open/review
- /banners
- /drifted
- /change-marker
- heat-map
- /hunk/conflict/heat-map
- /preview
- side-panel filter/focus state
- hunk UI layout
negative_constraints:
- Storage records review-state summaries without owning hunk UI layout.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-086 - File Command Receipt Payload Vocabulary

```yaml
plan_unit_id: SP-086
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: File command receipt payloads store exact workspace-node intent and typed payload vocabulary before UI localization for cmd.file.* operations, root_kind, target_dir, image_viewer, diff_review, workspace_preview, and detached_preview.
gui_related: false
gui_classification_reason: This unit preserves backend command-ref and receipt payload vocabulary.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: file_command_receipt_payload_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- cmd.file.*
- cmd.file.new_file { project_id, parent_path }
- cmd.file.new_folder { project_id, parent_path }
- cmd.file.rename { project_id, path, new_name? }
- 'cmd.file.delete { project_id, paths: string[] }'
- cmd.file.copy_full_path { project_id, path }
- 'cmd.file.copy_relative_path { project_id, path, root_kind?: "project"|"worktree" }'
- 'cmd.file.copy_nodes { project_id, paths: string[] }'
- 'cmd.file.cut_nodes { project_id, paths: string[] }'
- cmd.file.paste_nodes { project_id, target_dir }
- cmd.file.save_local_copy
- root_kind
- target_dir
- image_viewer
- diff_review
- workspace_preview
- detached_preview
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-087 - Account-Switch Projection Invalidation

```yaml
plan_unit_id: SP-087
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Effective account changes hard-refresh or invalidate account-bound projections for source_control, github_actions, docker_manager, kubernetes, receipts, blocked_state, and requested_effective while preserving historical focus refs in the event ledger.
gui_related: true
gui_classification_reason: This unit preserves user-visible account-switch invalidation, CTA reclassification, and stale row clearing.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: account_switch_projection_invalidation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- source_control
- github_actions
- docker_manager
- kubernetes
- receipts
- blocked_state
- requested_effective
- hard-refresh
- invalidate
- clear stale selected rows
- read-only or interrupted
- old account binding
- new effective account binding
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-088 - Authored Help Copy And First-Use Namespaces

```yaml
plan_unit_id: SP-088
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Help, copy, empty states, disabled-state explainers, first-use disclosure, expert variants, eli5 variants, and worktree-native SCM teaching use authored namespaces for source_control, github_actions, docker_manager, kubernetes, receipts, blocked_state, and requested_effective.
gui_related: true
gui_classification_reason: This unit preserves user-visible help, copy, empty-state, and first-use teaching namespaces.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: authored_help_copy_and_first_use_namespaces
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- source_control
- github_actions
- docker_manager
- kubernetes
- receipts
- blocked_state
- requested_effective
- empty states
- disabled-state explainers
- first-use disclosure copy
- expert variants
- eli5 variants
- what worktrees mean here
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-089 - Runtime-Backed Panel Freshness Warnings

```yaml
plan_unit_id: SP-089
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Hosted and runtime-backed panel projections persist freshness, cache/live, partial, and last-known fields; mutating stale runtime projections must record refresh-first or explicit last-known warning posture before execution.
gui_related: true
gui_classification_reason: This unit preserves visible runtime-backed freshness markers and stale mutation warning posture.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: runtime_backed_panel_freshness_warnings
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- /runtime-backed
- last refresh timestamp
- active refresh state
- stale marker
- cached
- /live
- partial
- /last-known
- refresh-first
- last-known warning
negative_constraints:
- Visible stale data is never mistaken for current execution capability.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-090 - Receipt And Storage Retention Classes

```yaml
plan_unit_id: SP-090
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Receipt and storage retention classes distinguish durable state, bounded cache, and discardable state, mapping retention preference to explicit class, policy, and anchor fields without erasing canonical receipts or state transitions.
gui_related: false
gui_classification_reason: This unit preserves backend retention class and cleanup semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: receipt_and_storage_retention_classes
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- Durable state
- canonical receipts
- canonical state transitions
- bounded cache
- log tails
- watch buffers
- explorer snapshots
- retention windows
- truncation rules
- stale markers
- discardable state
- Project-delete cleanup
negative_constraints:
- Project-delete cleanup removes bounded-cache and discardable records according to class policy without erasing durable receipts or canonical state transitions.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-091 - Provider Runtime Record Family Purpose

```yaml
plan_unit_id: SP-091
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The promoted provider/runtime rewrite and updated terminal/editor model require durable record and projection families for concrete runtime surfaces, account/profile identity, entitlement attribution, and terminal layout continuity.
gui_related: false
gui_classification_reason: This unit preserves backend provider/runtime record-family purpose.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: provider_runtime_record_family_purpose
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- promoted provider/runtime rewrite
- terminal/editor model
- durable record and projection families
- concrete runtime surfaces
- account/profile identity
- entitlement attribution
- terminal layout continuity
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/Multi-Account.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-092 - Core Runtime Project Provider Families

```yaml
plan_unit_id: SP-092
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Core runtime storage includes attempt, blocked, artifact, lane, worktree, concern, project, attention, provider account, entitlement, server profile, pressure, and account-switch record families with their exact v1 key templates.
gui_related: false
gui_classification_reason: This unit preserves backend runtime/project/provider key families.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: core_runtime_project_provider_families
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- attempt_record.v1:{project_id}:{node_id}:{attempt_number}
- blocked_projection.v1:{project_id}:{node_id}
- artifacts_index.v1:{project_id}:{artifact_id}
- lane_record.v1:{project_id}:{lane_id}
- lane_projection.v1:{project_id}:{lane_id}
- worktree_record.v1:{project_id}:{worktree_id}
- worktree_projection.v1:{project_id}:{worktree_id}
- concern_record.v1:{project_id}:{concern_id}
- project_summary.v1:{project_id}
- project_attention_item.v1:{project_id}:{attention_item_id}
- provider_account_record.v1:{provider_id}:{account_id}
- provider_entitlement_context_record.v1:{provider_id}:{account_id}:{billing_entity_id}
- server_profile_record.v1:{provider_id}:{connection_profile_id}
- account_pressure_episode.v1:{provider_id}:{account_id}:{episode_id}
- account_switch_event.v1:{provider_id}:{event_id}
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-093 - Terminal And Dev Session Families

```yaml
plan_unit_id: SP-093
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Terminal and dev-session record families preserve workspace tab, section, tab, pane, leaf-pane, workgroup, panel, session, command-block, and dev-session identity without collapsing terminal restore into one bottom-panel blob.
gui_related: true
gui_classification_reason: This unit preserves user-visible terminal layout continuity plus dev-session restoration identities.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: terminal_and_dev_session_families
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- terminal_workspace_state.v1:{project_id}:{workspace_tab_id}
- terminal_section_record.v1:{project_id}:{terminal_section_id}
- terminal_tab_record.v1:{project_id}:{terminal_tab_id}
- terminal_pane_record.v1:{project_id}:{terminal_pane_id}
- terminal_leaf_pane_record.v1:{project_id}:{terminal_leaf_pane_id}
- terminal_workgroup_record.v1:{project_id}:{terminal_workgroup_id}
- editor_terminal_panel_state.v1:{project_id}:{workspace_tab_id}:{editor_terminal_panel_id}
- terminal_session_record.v1:{project_id}:{terminal_session_id}
- terminal_command_block.v1:{project_id}:{terminal_session_id}:{command_block_id}
- dev_session_record.v1:{project_id}:{dev_session_id}
- bottom-panel blob
negative_constraints:
- Terminal restore must not collapse into one bottom-panel blob.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-094 - MCP And Skill Runtime Readiness Families

```yaml
plan_unit_id: SP-094
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: MCP and skill runtime readiness storage preserves server, runtime availability, tool, skill, and skill runtime readiness records with exact v1 key templates.
gui_related: false
gui_classification_reason: This unit preserves backend MCP and skill runtime readiness record families.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: mcp_and_skill_runtime_readiness_families
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- mcp_server_record.v1:{mcp_server_id}
- mcp_runtime_availability.v1:{mcp_server_id}:{provider_id}:{runtime_subject_id}
- mcp_tool_record.v1:{mcp_server_id}:{tool_id}
- skill_record.v1:{skill_id}
- skill_runtime_readiness.v1:{skill_id}:{provider_id}:{runtime_subject_id}
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-095 - Debug GHA Bundle Preview Browser Families

```yaml
plan_unit_id: SP-095
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Debug, GitHub Actions, bundle/note/revision/composer, preview, browser session, and browser profile state families remain durable storage families with exact v1 key templates.
gui_related: true
gui_classification_reason: This unit preserves user-visible debug, GHA panel, bundle review, preview, and browser state families.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: debug_gha_bundle_preview_browser_families
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- debug_investigation_record.v1:{project_id}:{investigation_id}
- gha_panel_state.v1:{project_id}
- bundle_registry.v1:{project_id}:{bundle_id}
- note_record.v1:{bundle_id}:{note_id}
- revision_run.v1:{bundle_id}:{revision_id}
- composer_prep_state.v1:{thread_id}
- preview_state.v1:{project_id}:{preview_id}
- browser_session_state.v1:{project_id}:{browser_session_id}
- browser_profile_state.v1:{project_id}:{profile_scope}
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Tools.md, ContractName:Plans/Skills_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-096 - Investigation Bundle Registry Identity Boundary

```yaml
plan_unit_id: SP-096
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Investigation bundle records use schema_id pm.investigation_bundle.schema.v1 plus bundle_id and schema_version for registry identity and lookup keys, while the Runtime Artifacts panel owns the full manifest field set.
gui_related: false
gui_classification_reason: This unit preserves backend investigation bundle registry identity ownership.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: investigation_bundle_registry_identity_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- schema_id = pm.investigation_bundle.schema.v1
- bundle_id
- schema_version
- Runtime Artifacts panel
- full manifest field set
- registry identity
- lookup keys
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-097 - Debug Instrumentation Lineage And Durable Authority

```yaml
plan_unit_id: SP-097
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Debug investigation records persist target binding and instrumentation_manifest lineage, but arbitrary external targets may store evidence and suggestions only and must not become durable workspace mutation authority without workspace binding.
gui_related: false
gui_classification_reason: This unit preserves backend debug instrumentation lineage and authority boundaries.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: debug_instrumentation_lineage_and_durable_authority
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- debug_investigation_record.v1:{project_id}:{investigation_id}
- instrumentation_manifest[]
- instrumentation_id
- scope
- state
- targets_or_files
- introduced_at_utc
- removed_at_utc
- restore_point_id
- cleanup_outcome
- agent_session
negative_constraints:
- Storage must not represent arbitrary external targets as durable workspace mutation authority until a workspace binding exists.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-098 - Debug Restore Identity Overlay And Relaunch Context

```yaml
plan_unit_id: SP-098
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Investigation records persist cross-surface identity links, overlay state, visible Investigation Context refs, last restore/reopen outcome, and relaunch or attach target context without flattening DAP, browser, dev-session, and runtime-artifact identities.
gui_related: true
gui_classification_reason: This unit preserves visible debug overlay state and restoration/relaunch context.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: debug_restore_identity_overlay_and_relaunch_context
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- run_id?
- thread_id?
- dev_session_id?
- browser_session_id?
- DAP/debugger identity refs
- artifact_ids[]
- artifact_refs[]
- requested and effective mode overlay
- Investigation Context
- last restore/reopen outcome
- /config/wrapper
- /debugger/profiler
- /session
negative_constraints:
- Debug restore must not rebind by guess or flatten DAP, browser, dev-session, and runtime-artifact identities into one generic debug session.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-099 - Canonical Attempt And Blocked Projection Key Migration

```yaml
plan_unit_id: SP-099
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Canonical attempt and blocked projection keys supersede older variants; older run-scoped or three-component forms are migration-read aliases only, and future redb key/value shape changes require explicit family/version or migration notes before writes begin.
gui_related: false
gui_classification_reason: This unit preserves backend key reconciliation and migration-versioning rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: canonical_attempt_and_blocked_projection_key_migration
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- attempt_record.v1:{project_id}:{node_id}:{attempt_number}
- blocked_projection.v1:{project_id}:{node_id}
- blocked_reason_code
- blocked_at
- blocked_family
- approval_scope_key?
- allowed_action_ids[]
- migration-read aliases only
- blocked_projection.{run_id}.{node_id}.{blocked_sequence}
- Unversioned shape drift
- three-way concurrent key ownership
- silent redb rewrites
- replay checkpoint
negative_constraints:
- blocked_projection.v1:{project_id}:{node_id} is the only write target for blocked-state projections.
- Unversioned shape drift, three-way concurrent key ownership, and silent redb rewrites are invalid.
preserved_contractrefs: []
compatibility_only_notes:
- Older 3-component or run-scoped variants remain migration-read aliases only.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-100 - Canonical Field Minima For Attempt Terminal Dev Records

```yaml
plan_unit_id: SP-100
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Canonical field-level minima preserve attempt, terminal workspace/section/tab/pane/workgroup/session/command-block, and dev_session records, including SCM refs, terminal layout/focus/transcript anchors, and dev workflow continuity without replacing exact PTY reuse identity.
gui_related: true
gui_classification_reason: This unit preserves terminal GUI layout/focus fields and backend attempt/dev-session minima.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: canonical_field_minima_for_attempt_terminal_dev_records
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- attempt_record.v1:{project_id}:{node_id}:{attempt_number}
- terminal_workspace_state.v1
- terminal_section_record.v1
- terminal_tab_record.v1
- terminal_pane_record.v1
- terminal_leaf_pane_record.v1
- terminal_workgroup_record.v1
- editor_terminal_panel_state.v1
- terminal_session_record.v1
- terminal_command_block.v1
- dev_session_record.v1:{project_id}:{dev_session_id}
- workspace tab identity
- section/tab/pane split identity
- layout slot/order
- transcript/scrollback anchors
- dev_session_id
- terminal_session_id
negative_constraints:
- dev_session_id owns higher-level dev workflow continuity and must not replace terminal_session_id when exact PTY reuse is required.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-101 - GitHub Actions Panel State Payload

```yaml
plan_unit_id: SP-101
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: GitHub Actions panel state preserves gha_panel_state.v1:{project_id}, workflow pins, filters, refresh interval default, collapsed sections, last run focus, notification preferences, and account-sensitive invalidation semantics.
gui_related: true
gui_classification_reason: This unit preserves visible GitHub Actions panel state and notifications.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: github_actions_panel_state_payload
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- gha_panel_state.v1:{project_id}
- effective_account_id
- pinned_workflows
- filter_status
- auto_refresh_interval_ms
- '30000'
- collapsed_sections
- last_viewed_run_id
- notification_prefs
- 'notify_on_failure: bool'
- 'default: true'
- 'notify_on_success: bool'
- 'default: false'
- active effective account
negative_constraints:
- Implementations MUST invalidate pinned workflows, last-opened run/job/log focus, and admin-readiness snapshots when the active effective account no longer matches effective_account_id.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-102 - Bundle Annotation Storage Key Lineage

```yaml
plan_unit_id: SP-102
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Embedded-document bundle and annotation persistence extends the existing note model under stable notes, note, revision_run, and note_reply_index key names rather than a net-new storage subsystem or scattered GUI state.
gui_related: false
gui_classification_reason: This unit preserves backend bundle annotation key lineage.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: bundle_annotation_storage_key_lineage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- notes_index.{bundle_id}
- note.{bundle_id}.{note_id}
- note_record.v1
- revision_run.{bundle_id}.{revision_id}
- note_reply_index.{bundle_id}.{note_id}
- /revision/preview
- note_record.v1:{bundle_id}:{note_id}
- revision_run.v1:{bundle_id}:{revision_id}
- bundle/note revision lineage
negative_constraints:
- Bundle annotation persistence does not become scattered GUI state.
preserved_contractrefs: []
compatibility_only_notes:
- Existing note model and semantic key names remain compatibility lineage.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-103 - Bundle Registry Payload

```yaml
plan_unit_id: SP-103
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: bundle_registry.v1:{project_id}:{bundle_id} preserves bundle identity, project identity, created_at, status enum, files, review gate approvals, auto_merge, and note records.
gui_related: false
gui_classification_reason: This unit preserves backend bundle registry payload fields.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: bundle_registry_payload
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- bundle_registry.v1:{project_id}:{bundle_id}
- bundle_id
- project_id
- created_at
- ISO8601
- draft
- in_review
- approved
- rejected
- merged
- BundleFile[]
- required_approvals
- current_approvals
- auto_merge
- NoteRecord[]
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-104 - Note Record Annotation Payload And Reanchor Compatibility

```yaml
plan_unit_id: SP-104
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: note_record.v1 remains annotation compatibility lineage while preserving operation intent, source surface, provenance, anchor text_position/text_quote, selected_text_excerpt, last_revision_id, last_reanchor_result, and updated_anchor for targeted revision and open behavior.
gui_related: true
gui_classification_reason: This unit preserves user-visible annotation, review, and reanchor/open behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: note_record_annotation_payload_and_reanchor_compatibility
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- note_record.v1:{bundle_id}:{note_id}
- 'operation?: "comment" | "replace" | "insert_after" | "remove"'
- 'intent_kind?: "question" | "change_request" | "both"'
- operation_payload?
- source_surface?
- assistant_deep_plan
- interview_doc_pane
- document_viewer
- selected_text_excerpt
- anchor.text_position
- anchor.text_quote
- last_revision_id
- last_reanchor_result
- updated_anchor
negative_constraints:
- Implementations MUST preserve annotation anchor and provenance fields whenever they exist.
preserved_contractrefs: []
compatibility_only_notes:
- note_record.v1 remains the compatibility lineage for Annotations.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-105 - Targeted Revision Run Persistence

```yaml
plan_unit_id: SP-105
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'revision_run.v1:{bundle_id}:{revision_id} persists targeted revision identity, trigger, note_reply_index, status, requested/effective revision capability, annotation_ids, changes: FileChange[], and created_at: ISO8601.'
gui_related: false
gui_classification_reason: This unit preserves backend targeted revision run persistence.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: targeted_revision_run_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- revision_run.v1:{bundle_id}:{revision_id}
- revision_id
- bundle_id
- trigger
- note_reply
- resubmit
- auto_fix
- 'note_reply_index: NoteReplyRef[]'
- pending
- running
- completed
- failed
- requested_revision_capability?
- effective_revision_capability?
- schema_enforced_structured_revision
- validated_structured_revision
- chat_handoff_only
- annotation_ids[]
- 'changes: FileChange[]'
- 'created_at: ISO8601'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-106 - Composer Prep State Record

```yaml
plan_unit_id: SP-106
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: composer_prep_state.v1:{thread_id} preserves chat-side draft text, attachments, mode overlay, requested/effective persona, selection source, override owner, and saved_at for handoff continuity.
gui_related: true
gui_classification_reason: This unit preserves visible composer draft, attachment, mode, and persona handoff state.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: composer_prep_state_record
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- composer_prep_state.v1:{thread_id}
- draft_text
- attachments
- ModeOverlay?
- requested_persona
- effective_persona
- persona_selection_source
- persona_override_owner_id
- 'saved_at: ISO8601'
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-107 - Selection And Browser Capture Chip Persistence

```yaml
plan_unit_id: SP-107
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Document selection and browser context capture write pending composer chips into composer_prep_state.v1:{thread_id} with typed browser selection or element attachment identity, bounded context, provenance, requested/effective target, sensitivity, capture, and failure status.
gui_related: true
gui_classification_reason: This unit preserves user-visible capture chips and chat handoff state.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: selection_and_browser_capture_chip_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- /chip/persistence
- selection-to-chat
- document-selection
- browser.context_captured
- composer_prep_state.v1:{thread_id}
- attachment_type
- browser_selection_context
- browser_element_context
- chip_id
- browser_session_id
- thread_id
- click-to-context
- Deep Plan note-only review
negative_constraints:
- Legacy browser-only or note-only storage families are not maintained as separate persistence models.
preserved_contractrefs: []
compatibility_only_notes:
- Legacy browser-only click-to-context and Deep Plan note-only review wording are compatibility labels only.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-108 - Bundle Annotation And Revision Audit Events

```yaml
plan_unit_id: SP-108
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Bundle annotation and revision audit events record note creation, status changes, revision lifecycle, selection-to-chat handoff, and blocked forwarding with durable ids, provenance, requested/effective capability, and visible reasons.
gui_related: true
gui_classification_reason: This unit preserves visible bundle annotation/revision event outcomes and blocked reasons.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: bundle_annotation_and_revision_audit_events
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- bundle.note_created
- bundle.note_status_changed
- open
- addressed
- still_open
- cannot_apply
- resolved
- bundle.revision_started
- bundle.revision_completed
- bundle.revision_interrupted
- annotation_ids[]
- requested_revision_capability
- bundle.selection_sent_to_chat
- requested_target
- effective_target
- bundle.selection_forward_blocked
- visible reason
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-109 - Preview Browser Persistence Split

```yaml
plan_unit_id: SP-109
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Legacy browser_state single-blob shapes are retired; preview, browser session, and browser profile persistence split runtime capability, permission tier, profile scope, restore policy, visible session class, viewport, scroll, zoom, dev tools, cookies, localStorage, and saveChanges writeback state.
gui_related: true
gui_classification_reason: This unit preserves visible preview/browser session state and profile persistence.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: preview_browser_persistence_split
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- browser_state.v1
- browser_state:v1
- retired
- preview_state.v1:{project_id}:{preview_id}
- browser_session_state.v1:{project_id}:{browser_session_id}
- browser_profile_state.v1:{project_id}:{profile_scope}
- requested_browser_runtime
- effective_browser_runtime
- requested_capabilities
- effective_capabilities
- permission_tier
- always_allowed
- session_granted
- explicit_confirmation
- restore_policy
- restore_intent
- restore_session
- do_not_restore
- takeover_state
- stopped_keep_browser
- viewport
- scroll_position
- zoom_level
- dev_tools_open
- localStorage_persistence
- saveChanges_writeback_state
negative_constraints:
- Browser-specific fields must not fork the canonical requested/effective naming pattern owned by Plans/Contracts_V0.md.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Legacy browser_state.v1 and browser_state:v1 single-blob shapes are retired.
owner_hints:
- Plans/storage-plan.md
```

### SP-110 - Runtime Artifact Project Index

```yaml
plan_unit_id: SP-110
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Runtime artifact index storage defines artifacts_project_state.v1 and projector.checkpoint.runtime_artifacts with artifact identity refs, projection_freshness, and projection_health for runtime artifact projection authority.
gui_related: false
gui_classification_reason: This unit preserves backend runtime artifact index and projector checkpoint records.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: runtime_artifact_project_index
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- runtime artifact index
- artifacts_project_state.v1:{project_id}
- projector.checkpoint.runtime_artifacts:{project_id}
- artifact_id
- artifact_type
- run_id?
- thread_id?
- node_id?
- attempt_id?
- worktree_id?
- lane_id?
- repo_id?
- path_ref?
- branch_ref?
- baseline_ref?
- projection_freshness
- current
- refreshing
- stale
- projection_health
- healthy
- degraded
- unavailable
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/Runtime_Artifacts_Panel.md#4. redb key and projector, Plans/WorktreeGitImprovement.md#4.1 Assistant-created worktree lifecycle'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-111 - Worktree And Lane Storage Records

```yaml
plan_unit_id: SP-111
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Worktree and lane authoritative records and projections preserve project, worktree, lane, owner thread, repo, path, branch, baseline, projection_freshness, and projection_health fields under worktree and lane v1 key families.
gui_related: false
gui_classification_reason: This unit preserves backend worktree and lane storage records and projections.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: worktree_and_lane_storage_records
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- worktree_record.v1:{project_id}:{worktree_id}
- lane_record.v1:{project_id}:{lane_id}
- worktree_projection.v1:{project_id}:{worktree_id}
- lane_projection.v1:{project_id}:{lane_id}
- project_id
- worktree_id
- lane_id
- owner_thread_id?
- repo_id?
- path_ref?
- branch_ref?
- baseline_ref?
- projection_freshness
- projection_health
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/Runtime_Artifacts_Panel.md#4. redb key and projector, Plans/WorktreeGitImprovement.md#4.1 Assistant-created worktree lifecycle'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-112 - Preview Browser Event Set

```yaml
plan_unit_id: SP-112
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Preview and browser session storage events preserve preview start/stop/refresh, browser navigation/resize, and browser.context_captured as related runtime event families.
gui_related: true
gui_classification_reason: This unit preserves user-visible preview/browser session event families.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: preview_browser_event_set
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- preview.session.started
- preview.session.stopped
- preview.session.refreshed
- browser.session.navigated
- browser.session.resized
- browser.context_captured
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-113 - Runtime Linked Core Identity Minima

```yaml
plan_unit_id: SP-113
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Runtime-linked record families carry required identity and attribution fields from project/run/node/attempt through provider/model/account/runtime health, pressure, instruction, skill, reason, transport, account-switch, provider-attempt, and usage references.
gui_related: false
gui_classification_reason: This unit preserves backend runtime-linked identity and attribution fields.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: runtime_linked_core_identity_minima
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- project_id
- run_id
- node_id?
- attempt_id?
- blocked_sequence?
- feature_seam_id?
- work_package_id?
- lane_id?
- worktree_id?
- execution_role?
- requested_platform?
- effective_platform?
- requested_provider_family_id?
- provider_family_id?
- effective_provider_family_id?
- requested_transport_kind?
- effective_transport_kind?
- requested_runtime_platform_id?
- effective_runtime_platform_id?
- requested_model?
- effective_model?
- model_provider_id?
- model_id_raw?
- model_key?
- requested_auth_mode?
- effective_auth_mode?
- requested_account_policy?
- requested_account_id?
- requested_billing_entity_id?
- effective_account_id?
- effective_billing_entity_id?
- effective_billing_entity_label?
- effective_entitlement_class?
- connection_profile_id?
- requested_connection_profile_id?
- effective_connection_profile_id?
- selectable_unit_id?
- effective_health_state?
- effective_pressure_state?
- instruction_projection_state?
- skill_projection_state?
- reason_codes[]?
- transport_backend_contract?
- account_switch_reason?
- provider_attempt_ref?
- usage_event_ref?
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/usage-feature.md, ContractName:Plans/assistant-chat-design.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-114 - Workspace Terminal Dev Session Identity Minima

```yaml
plan_unit_id: SP-114
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Runtime-linked workspace, terminal, and dev-session identity fields stay explicit for workspace tabs, terminal sections/tabs/panes/leaf panes/workgroups/panels/sessions, and dev sessions.
gui_related: true
gui_classification_reason: This unit preserves visible terminal/workspace/developer session identity fields.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: workspace_terminal_dev_session_identity_minima
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- workspace_tab_id?
- terminal_section_id?
- terminal_tab_id?
- terminal_pane_id?
- terminal_leaf_pane_id?
- terminal_workgroup_id?
- editor_terminal_panel_id?
- terminal_session_id?
- dev_session_id?
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-115 - Provider Runtime Identity Storage Rules

```yaml
plan_unit_id: SP-115
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Provider/runtime identity storage stores selectable-unit snapshots, keeps lower-level provider-session ids out of base event history, uses direct_api/acp/stream_json/headless_json backend vocabulary, reuses transport_class and ProviderTransport values, and preserves requested/effective runtime snapshots.
gui_related: false
gui_classification_reason: This unit preserves backend provider/runtime identity storage rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: provider_runtime_identity_storage_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- selectable_unit
- selectable_unit_id
- root_path
- last_usage_snapshot
- last_cooldown_snapshot
- provider-session
- attempt_id
- provider_attempt_ref?
- /debug
- direct_api
- acp
- stream_json
- headless_json
- transport_class
- ProviderTransport
- requested_provider_family_id
- effective_provider_family_id
- requested_transport_kind
- effective_transport_kind
- requested_connection_profile_id
- effective_connection_profile_id
- effective_health_state
- effective_pressure_state
- instruction_projection_state
- skill_projection_state
negative_constraints:
- Lower-level provider-session identifiers stay out of base canonical event history records.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-116 - Model Discovery Drift Entitlement Resolver Records

```yaml
plan_unit_id: SP-116
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Model discovery, provider-native drift, entitlement attribution, and resolver output records preserve model_key = model_provider_id/model_id_raw, /model_id_raw, drift-state, drift-check, effective_entitlement_class = chatgpt_plan | api_billed, and reason_codes[] semantics.
gui_related: false
gui_classification_reason: This unit preserves backend model discovery, drift, entitlement, and resolver records.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: model_discovery_drift_entitlement_resolver_records
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- model_key = model_provider_id/model_id_raw
- /model_id_raw
- drift-state
- drift-check
- /detach
- /runtime
- effective_entitlement_class = chatgpt_plan | api_billed
- reason_codes
- reason_codes[]
- selectable_unit_id
- fallback
- pressure
- capability
- policy
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-117 - Projection Freshness Health Runtime Boundaries

```yaml
plan_unit_id: SP-117
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Projection-state families expose both projection_freshness and projection_health, keep stale and degraded distinct, keep account-backed and server-profile-backed runtime records distinct, and exclude scheduler-only debug internals unless a concrete debug/audit use case proves otherwise.
gui_related: false
gui_classification_reason: This unit preserves backend projection trust, runtime record, and audit boundary semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: projection_freshness_health_runtime_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- projection_freshness
- current | refreshing | stale
- projection_health
- healthy | degraded | unavailable
- stale
- degraded
- account-backed runtime records
- server-profile-backed runtime records
- effective billing/entity context
- scheduler-only debug internals
- requested_runtime_platform_id
- effective_runtime_platform_id
- /provider-registry/scheduler-only
negative_constraints:
- stale and degraded are different states and must not collapse into one generic trust field.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-118 - Terminal Projection And Route Restoration Ownership

```yaml
plan_unit_id: SP-118
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: terminal_state:v1 may remain a GUI-facing projection name, but canonical ownership stays with terminal workspace, section, workgroup, tab, leaf-pane, panel, session, and command-block records, and route restoration resolves through canonical record identity.
gui_related: true
gui_classification_reason: This unit preserves visible terminal projection naming and route restoration behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: terminal_projection_and_route_restoration_ownership
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
preserved_exact_tokens:
- terminal_state:v1
- GUI-facing projection name
- terminal workspace
- section
- workgroup
- tab
- leaf-pane
- panel
- session
- command-block records
- route restoration
- canonical record identity
negative_constraints:
- Route restoration resolves through canonical record identity, not through feature-local ad hoc payloads.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-119 - Derived Adapter Instruction Projection And Cache Lineage

```yaml
plan_unit_id: SP-119
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: PM-generated CLI adapter config/projection files, prompt injected-context artifacts, provider-facing instruction projections, and prompt/cache affinity are derived runtime inputs with source refs, projection state, and lineage; Compact Now alone does not force a new cache lineage unless it also changes logical run lineage.
gui_related: false
gui_classification_reason: This unit preserves backend derived artifact, instruction projection, and cache lineage boundaries.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for storage-plan-S0077.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_scope_split_owner_reconciliation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: derived_adapter_instruction_projection_and_cache_lineage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0077
- Plans/ledgers/v2/pldg-20260627-001-feature-intake/state/compaction_compile_readiness_matrix.json:cmp-automated-testing-acceptance
- Plans/ledgers/v2/pldg-20260627-001-feature-intake/records/design_atoms.jsonl:atom-0090
preserved_exact_tokens:
- PM-generated CLI adapter config
- projection files
- MUST NOT
- accounts
- MCP state
- instruction state
- skills
- injected-context
- Prompt Pipeline
- source refs
- projection state
- lineage
- Prompt/cache affinity
- logical run lineage
- Branch
- rewind
- replacement
- Compact Now
- logical run lineage
negative_constraints:
- PM-generated CLI adapter config and projection files are derived artifacts and MUST NOT become canonical ownership stores.
- Manual Compact Now does not by itself force a new cache lineage unless it also changes the logical run lineage.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-120 - Runtime Artifact Subject-First Restore Identity

```yaml
plan_unit_id: SP-120
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Storage restores generated or staged content subject-first: persisted doc:<document_id> and artifact:<artifact_id> subjects remain durable identity, while resume_url and route payloads restore navigation context around that subject, and any tier_runtime_record remains only a compatibility/current-view overlay.'
gui_related: true
gui_classification_reason: This unit preserves user-visible restore/navigation behavior for runtime artifacts.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: runtime_artifact_subject_first_restore_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0078
preserved_exact_tokens:
- doc:<document_id>
- artifact:<artifact_id>
- resume_url
- route payloads
- tier_runtime_record
- compatibility/current-view overlay
- MUST NOT
- canonical runtime identity
- joins
- restoration authority
negative_constraints:
- Any surviving tier_runtime_record MUST NOT own canonical runtime identity, joins, or restoration authority.
preserved_contractrefs: []
compatibility_only_notes:
- Any surviving tier_runtime_record is a compatibility/current-view overlay only.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-121 - Runtime Artifact Projection And Worktree Lane Index Scope

```yaml
plan_unit_id: SP-121
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Runtime-artifact indexing, durable worktree/lane identity, projection state, and projector checkpoints are storage-owned families with required artifact, repo, path, branch, and baseline fields rather than panel-owned leftovers.
gui_related: false
gui_classification_reason: This unit preserves backend storage ownership for runtime artifact, worktree, lane, and projector checkpoint families.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: runtime_artifact_projection_and_worktree_lane_index_scope
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0078
preserved_exact_tokens:
- artifact_type
- repo_id
- path_ref
- branch_ref
- baseline_ref
- artifacts_project_state.v1:{project_id}
- projector.checkpoint.runtime_artifacts:{project_id}
- runtime artifact index
- worktree record
- lane record
- Runtime-artifact indexing
- Projection state
- projector checkpoints
- panel-owned leftovers
negative_constraints:
- Projection state and projector checkpoints must be first-class rather than panel-owned leftovers.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-122 - Canonical Terminal Persistence Key Families

```yaml
plan_unit_id: SP-122
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage-plan is the canonical source for decomposed terminal persistence key families from terminal_session.v1 through terminal_color.v1:global, with terminal_state:v1 retained only as a FinalGUISpec subset alias.
gui_related: true
gui_classification_reason: This unit preserves visible terminal persistence, layout, font, and color state key families.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: canonical_terminal_persistence_key_families
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0079
preserved_exact_tokens:
- terminal_session.v1:{terminal_session_id}
- terminal_layout.v1:{project_id}
- terminal_history.v1:{terminal_session_id}
- terminal_profile.v1:{profile_name}
- terminal_env.v1:{project_id}
- terminal_cwd.v1:{terminal_session_id}
- terminal_scroll.v1:{terminal_session_id}
- terminal_font.v1:global
- terminal_color.v1:global
- terminal_state:v1
- subset alias
- full decomposition
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/FileManager.md'
compatibility_only_notes:
- FinalGUISpec section 15.1 references terminal_state:v1 as a subset alias.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-123 - Terminal Project Section And Tab Records

```yaml
plan_unit_id: SP-123
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Terminal project, section, and tab records preserve project settings, restore flags, dock state/zone, detached bounds, tab order, labels, active state, layout_style, and review_only state.
gui_related: true
gui_classification_reason: This unit preserves visible terminal project, section, tab, layout, and detached-window state.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: terminal_project_section_and_tab_records
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0080
preserved_exact_tokens:
- terminal_project_state
- project_id
- settings version
- last-opened time
- restore flag
- terminal_sections
- terminal_section_id
- order_index
- dock_state
- dock_zone
- visibility
- detached_window_bounds
- terminal_tabs
- terminal_tab_id
- layout_style
- review_only
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-124 - Terminal Pane Session And Restore Identity Split

```yaml
plan_unit_id: SP-124
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Terminal pane, session, and command-block records keep pane/session attachment, shell profile, cwd_snapshot, runtime/restore state, command-block metadata, and the section/tab/pane/session identity split; durable restore reconstructs layout and bindings before runtime liveness validation.
gui_related: true
gui_classification_reason: This unit preserves visible terminal panes, session bindings, labels, layout style, and restore flow.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: terminal_pane_session_and_restore_identity_split
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0080
preserved_exact_tokens:
- terminal_panes
- terminal_pane_id
- terminal_sessions
- terminal_session_id
- terminal_command_blocks
- terminal_session_record
- cwd_snapshot
- worktree path
- section/tab/pane/session
- sections, tabs, panes, labels, layout style, and session bindings
- runtime code verify
- attached terminal_session_id
negative_constraints:
- Terminal storage MUST preserve the section/tab/pane/session identity split rather than collapsing it into flat bottom-panel metadata.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-125 - Terminal Transcript Boundary And No-Fake-Liveness Rule

```yaml
plan_unit_id: SP-125
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Terminal restore records carry an explicit transcript-vs-command-block boundary; restored panes may be historical, review-limited, or history-unavailable, and storage must not mark them live unless terminal runtime liveness is revalidated.
gui_related: false
gui_classification_reason: This unit preserves backend terminal transcript retention and liveness truth rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: terminal_transcript_boundary_and_no_fake_liveness_rule
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0080
preserved_exact_tokens:
- transcript-vs-command-block boundary
- Transcript chunks
- append-oriented
- scrollback anchors
- command blocks
- metadata-only
- transcript retention
- no-fake-liveness
- historical
- review-limited
- history-unavailable
- MUST NOT mark it live unless liveness is revalidated
negative_constraints:
- Storage MUST NOT mark a restored pane live unless liveness is revalidated by the terminal runtime.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-126 - Terminal Route Open Identity Refs And Dev-Session Lookups

```yaml
plan_unit_id: SP-126
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage owns durable joins for tab/pane/session and tab/pane/session/dev-session lookups; routing and open selectors persist terminal and optional dev_session_id refs and recover by those refs rather than labels, titles, or legacy cmd.dev.* hidden-gap assumptions.
gui_related: false
gui_classification_reason: This unit preserves backend terminal route/open identity and lookup semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: terminal_route_open_identity_refs_and_dev_session_lookups
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0080
preserved_exact_tokens:
- /tab/pane/session
- /tab/pane/session/dev-session
- /routing
- /open
- terminal_section_id
- terminal_tab_id
- terminal_pane_id
- terminal_session_id
- dev_session_id
- labels
- last visible titles
- legacy cmd.dev.*-only hidden-gap assumptions
negative_constraints:
- Route/open recovery must use persisted refs instead of labels, last visible titles, or legacy cmd.dev.*-only hidden-gap assumptions.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes:
- legacy cmd.dev.*-only hidden-gap assumptions are compatibility-only context, not canonical recovery authority.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-127 - Terminal GUI Settings Persistence And Terminology Boundary

```yaml
plan_unit_id: SP-127
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Terminal GUI persistence settings are separate from live PTY state: storage owns durable keys and migration behavior, FinalGUISpec owns Settings > Terminal GUI grouping, theming discoverability, shortcuts, and labels, and terminal terminology cross-refs stay explicit.'
gui_related: true
gui_classification_reason: This unit preserves visible Terminal GUI settings grouping, theming discoverability, shortcuts, labels, and storage-backed settings.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: terminal_gui_settings_persistence_and_terminology_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0080
preserved_exact_tokens:
- Terminal GUI
- /persistence/settings
- live PTY state
- project/workspace defaults
- per-tab overrides
- font and color references
- transcript-retention settings
- shell profile refs
- Settings > Terminal GUI
- /theming/discoverability
- shortcuts
- user-facing labels
- terminal_section_id
- terminal_tab_id
- terminal_pane_id
- terminal_session_id
- dev_session_id
- Plans/Glossary.md
- /IDEs research
negative_constraints:
- Storage must not drift back into ambiguous "terminal tab" wording.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Section15_MVP_Promoted_Features_Spec.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-128 - Terminal Storage Key Naming And Forward-Only Migration

```yaml
plan_unit_id: SP-128
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Terminal/storage key migrations are forward-only and monotonic: new fields are additive first, destructive renames require same-section migration notes, stable semantic names are preserved, and owner docs must define terminology mappings rather than overloading shared fields.'
gui_related: false
gui_classification_reason: This unit preserves backend storage key naming and migration rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: terminal_storage_key_naming_and_forward_only_migration
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0081
preserved_exact_tokens:
- forward-only
- monotonic
- additive first
- destructive renames
- migration note
- stable semantic names
- session_id
- thread_id
- run_id
- message_id
- step_id
- tool_call_id
- approval_id
- provider_session_id
- terminal_session_id
- dev_session_id
- owner doc
- mapping explicitly
- silently overloading
negative_constraints:
- If two subsystems need different terminology, the owner doc must define the mapping explicitly rather than silently overloading a shared field name.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md'
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-129 - Owner-Derived Lock Path And Read-Only Fallback

```yaml
plan_unit_id: SP-129
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Storage owns lock-path derivation: active pm.lock is root-derived from logical-root or safe-local fallback-derived durable-store path, legacy hardcoded lock strings are migration evidence only, and failed lock acquisition opens read-only viewer mode without creating a second project-local lock.'
gui_related: false
gui_classification_reason: This unit preserves backend durable-store lock-path derivation and read-only fallback rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_derived_lock_path_and_read_only_fallback
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0082
preserved_exact_tokens:
- lock-path
- pm.lock
- root-derived
- logical-root
- safe-local
- fallback-derived
- durable-store path
- /.puppet-master/pm.lock
- <project>/.puppet-master/pm.lock
- migration evidence only
- /read-only
- viewer mode
- second project-local lock
negative_constraints:
- PM MUST NOT create a second project-local lock beside the owner-derived path.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Commands_System.md'
compatibility_only_notes:
- Legacy hardcoded /.puppet-master/pm.lock and <project>/.puppet-master/pm.lock strings are migration evidence only.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-130 - Run Completed Usage Snapshot Boundary

```yaml
plan_unit_id: SP-130
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage owns run.completed.usage as an optional bounded run-completion usage snapshot derived from canonical usage.event records, not as a replacement for the usage event ledger.
gui_related: false
gui_classification_reason: This unit preserves backend usage snapshot storage and ledger boundary semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: run_completed_usage_snapshot_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0082
preserved_exact_tokens:
- run.completed.usage
- optional run-completion usage snapshot
- bounded snapshot
- canonical usage.event records
- usage event ledger
negative_constraints:
- run.completed.usage is not a replacement for the usage event ledger.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/Commands_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-131 - Same-Directory Atomic Durable-Store Rewrite

```yaml
plan_unit_id: SP-131
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: All non-append durable-store rewrites use same-directory temporary files, fsync, and rename/promote; append-only seglog writers remain subject to durable flush and corruption detection, and replacement-write failures are hard errors without direct-overwrite fallback.
gui_related: false
gui_classification_reason: This unit preserves backend durable storage rewrite atomicity and failure rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: same_directory_atomic_durable_store_rewrite
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0083
preserved_exact_tokens:
- same-directory temporary files
- <target>.tmp.<random>
- fsync
- rename/promote
- Append-only seglog/event writers
- durable flush
- corruption-detection
- Per-session temp directories
- same-filesystem atomic rename
- hard error
- direct overwrite
negative_constraints:
- Per-session temp directories MUST NOT be used for replacement writes that rely on same-filesystem atomic rename.
- Failure to create the temp file, fsync it, or rename/promote it is a hard error; PM MUST NOT silently fall back to direct overwrite.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-132 - Storage Root Selection And Durable Authority

```yaml
plan_unit_id: SP-132
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage-root selection prefers explicit configured roots, valid PUPPET_MASTER_DATA_DIR overrides, project-scoped durable roots, app-level durable roots, and session temp roots only for temporary data; durable state survives process restart unless the owning contract says otherwise.
gui_related: false
gui_classification_reason: This unit preserves backend storage-root selection and durable authority rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: storage_root_selection_and_durable_authority
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0083
preserved_exact_tokens:
- storage-root
- Explicit user-configured storage root
- PUPPET_MASTER_DATA_DIR
- Project-scoped durable root
- App-level durable root
- Session temp root
- temporary or disposable
- Durable state MUST survive process restart
- Remote-mode projects
- owning authority
- temp mirrors
negative_constraints:
- A feature may write to a session temp root only if its contract explicitly classifies the artifact as temporary or disposable.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-133 - Durable-Store Safety Unsafe Filesystem And Migration Backups

```yaml
plan_unit_id: SP-133
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Durable-store safety detects unsafe-filesystem classes, fails closed or enters read-only mode when needed, preserves safe-local fallback lineage, and requires backup-before-any-migration-step before validation, schema rewrite, file promotion, destructive cleanup, or rollback-sensitive repair.
gui_related: false
gui_classification_reason: This unit preserves backend durable-store safety, unsafe-filesystem handling, and migration backup requirements.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: durable_store_safety_unsafe_filesystem_and_migration_backups
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0083
preserved_exact_tokens:
- cross-filesystem temp paths
- atomic rename
- Janitor cleanup
- active durable targets
- preserved checkpoints
- fail closed
- structured error
- unsafe-filesystem
- NFS
- remote mounts
- same-directory atomic rename semantics
- safe local durable-store fallback
- /read-only
- backup-before-any-migration-step
- schema rewrite
- file promotion
- destructive cleanup
- rollback-sensitive repair
negative_constraints:
- Never rewrite durable files via cross-filesystem temp paths when the final correctness contract depends on atomic rename.
- Janitor cleanup MUST NOT touch active durable targets or preserved checkpoints.
- When a durable store is unavailable, writers fail closed and surface a structured error instead of downgrading silently to temp-only persistence.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-134 - Active Durable-Store Lock Identity

```yaml
plan_unit_id: SP-134
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The active durable-store lock is keyed by storage_root, authority_scope, and store_family; session or run ids are insufficient lock identities, and store families with independent recovery or retention policies must not share a lock merely because they live under the same root.
gui_related: false
gui_classification_reason: This unit preserves backend durable-store lock identity rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: active_durable_store_lock_identity
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0084
preserved_exact_tokens:
- (storage_root, authority_scope, store_family)
- Session or run ids
- durable-store lock identities
- independent recovery
- retention policies
- same root
negative_constraints:
- Session or run ids are not sufficient durable-store lock identities by themselves.
- Store families that require independent recovery or retention policies must not share a lock identity merely because they live under the same root.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-135 - Bounded Collection Retention Contracts

```yaml
plan_unit_id: SP-135
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Live storage-managed collections must declare TTL, max-cardinality, or both; bounded-collections canon is satisfied when owner sections name family, bound type/source, and retention/eviction notes for active maps, auth caches, LSP maps, queues, event records, safe points, temp artifacts, and stale rewrite remnants.
gui_related: false
gui_classification_reason: This unit preserves backend bounded collection retention contracts.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: bounded_collection_retention_contracts
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0085
preserved_exact_tokens:
- TTL
- /max-cardinality
- /long-lived
- bounded-collections
- Active assistant and child-session state maps
- max_total_active_agents
- MCP connection and auth-handle caches
- LSP session and host/root attachment maps
- Projector and analytics work queues
- seglog.event_appended
- Run/thread retention policy
- legal-hold
- preserved-run anchors
- Safe points
- snapshot metadata
- undo indexes
- Temp artifacts and stale rewrite remnants
- .tmp.*
- abandoned scratch artifacts
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/LSPSupport.md'
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/LSPSupport.md'
compatibility_only_notes: []
stale_retired_dispositions:
- Temp artifacts and stale rewrite remnants retain their literal row label as bounded-collection material, not a new storage owner.
owner_hints:
- Plans/storage-plan.md
```

### SP-136 - Regex Index Byte Build Concurrency And Mmap Contract

```yaml
plan_unit_id: SP-136
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Regex-index projector rules require byte-level u8 extraction without Unicode decoding, shared build-thread-pool concurrency with one project build slot and FIFO queueing, and platform mmap deletion/open semantics using memmap2 share_mode(0x7) on Windows and inode-by-fd safety on Linux/macOS.
gui_related: false
gui_classification_reason: This unit preserves backend regex-index byte, concurrency, and mmap file-handle contracts.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: regex_index_byte_build_concurrency_and_mmap_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0086
preserved_exact_tokens:
- Regex-index indexing model byte contract
- MUST NOT decode content to Unicode
- frequency-table computation
- n-gram extraction
- byte-level
- u8
- common build thread pool
- one build slot
- FIFO
- memmap2
- share_mode(0x7)
- FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE
- /macOS
- inode-by-fd
negative_constraints:
- Implementers MUST NOT decode content to Unicode for frequency-table computation or n-gram extraction.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/FileSafe.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-137 - Projector Consumption Order And JSONL Mirror Policy

```yaml
plan_unit_id: SP-137
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Projectors advance in canonical seglog order from redb checkpoints, write only owned projections, commit checkpoints after durable writes, and maintain JSONL mirrors as derived, rebuildable, sequence-ordered files that never backfill seglog.
gui_related: false
gui_classification_reason: This unit preserves backend projector consumption ordering and JSONL mirror policy.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: projector_consumption_order_and_jsonl_mirror_policy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0086
preserved_exact_tokens:
- canonical seglog order
- segment_generation
- segment_name
- byte_offset
- last_seq
- JSONL mirror
- derived
- human-readable
- rebuildable
- authoritative over seglog
- canonical event envelope
- sequence order
- deterministically
- stale mirror file
- PM MUST NOT backfill seglog from JSONL
- legal-hold
negative_constraints:
- PM MUST NOT backfill seglog from JSONL.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/FileSafe.md'
compatibility_only_notes: []
stale_retired_dispositions:
- A missing or stale mirror file is repaired by replaying the corresponding seglog range.
owner_hints:
- Plans/storage-plan.md
```

### SP-138 - Tantivy And Projection Rebuild Boundaries

```yaml
plan_unit_id: SP-138
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Tantivy indices, analytics rollups, and projections rebuild from seglog or the owning projector canonical source range; projector checkpoints are durable ownership boundaries, partial writes do not advance checkpoints, and schema-version rebuilds clear only derived projection state.
gui_related: false
gui_classification_reason: This unit preserves backend projection rebuild and checkpoint ownership boundaries.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: tantivy_and_projection_rebuild_boundaries
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0086
preserved_exact_tokens:
- Tantivy indices
- analytics rollups
- projections
- seglog
- canonical source range
- owning projector
- Projector checkpoints
- durable ownership boundaries
- partial projection writes
- schema-version change
- derived projection state
- canonical seglog
- unrelated redb families
negative_constraints:
- Partial projection writes do not advance checkpoints.
- Rebuild after schema-version change clears only the derived projection state being regenerated; the canonical seglog and unrelated redb families remain untouched.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-139 - Projector Checkpoints Runtime Recovery And Usage Carry-Through

```yaml
plan_unit_id: SP-139
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Projector checkpoints encode resume state without duplicate semantic writes and are atomic with projector durability, but runtime/executor checkpoint marker events and safe-point lineage records in seglog remain required before mutation-capable execution or restore flows continue; run.completed.usage carries optional usage snapshot attribution from usage.event records.
gui_related: false
gui_classification_reason: This unit preserves backend projector checkpoint, runtime recovery, and usage carry-through boundaries.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 177.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_177_runtime_terminal_storage
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: projector_checkpoints_runtime_recovery_and_usage_carry_through
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0086
preserved_exact_tokens:
- checkpoints
- duplicate semantic writes
- sequence order
- file mtime
- UI refresh timing
- projector durability
- runtime recovery checkpoint markers
- safe-point lineage records
- seglog
- mutation-capable execution
- restore flows
- canonical runtime checkpoint marker stream
- projector checkpoints alone are insufficient
- run.completed.usage
- run.completed
- usage.event
- attribution tuple
negative_constraints:
- Projector checkpoints are not a substitute for runtime recovery checkpoint markers.
- Projector checkpoints alone are insufficient for mutation/recovery replay.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Runtime_Artifacts_Panel.md'
compatibility_only_notes:
- run.completed.usage carry-through here is linked to SP-130 and does not create a second usage snapshot owner.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-140 - Analytics Refresh Trigger And UI Rollup Read Boundary

```yaml
plan_unit_id: SP-140
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Analytics scans may run periodically or on-demand without blocking the main UI; on-demand refresh keeps prior rollups visible, writes rollup keys in redb, and dashboard consumers read rollups rather than seglog directly.
gui_related: true
gui_classification_reason: This unit preserves user-visible Usage view refresh behavior and dashboard read boundaries.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: analytics_refresh_trigger_and_ui_rollup_read_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0087
preserved_exact_tokens:
- Periodic
- every 5 minutes
- on-demand
- Usage view
- background task
- separate thread
- main UI
- previously written rollups visible
- rollups
- usage_5h.{platform}
- usage_7d.{platform}
- tool_latency.{window}
- tool_usage.{window}
- tool_usage_meta.{window}
- no direct seglog read for dashboard
negative_constraints:
- Analytics scans must not block the main UI.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-141 - Analytics Scan Range Computation And Checkpoint Semantics

```yaml
plan_unit_id: SP-141
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Analytics scans read seglog or JSONL mirror in order over canonical windows, compute usage, tool latency, error rate, and tool usage rollups, exclude denied/FileSafe-blocked calls from tool_usage, and checkpoint last scanned sequence or timestamp idempotently.
gui_related: false
gui_classification_reason: This unit preserves backend analytics scan, computation, and checkpoint semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: analytics_scan_range_computation_and_checkpoint_semantics
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0087
preserved_exact_tokens:
- Last N hours
- at least 7d
- tool_usage.7d
- usage.event
- run.completed
- tool.invoked
- 5h
- 24h
- 7d
- 1h
- p50
- p95
- tool_name
- success = false
- tool.denied
- FileSafe blocks
- last scanned up to seq X
- last scanned timestamp
- Idempotent
negative_constraints:
- tool.denied events and FileSafe blocks do not contribute to tool_usage.{window}.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-142 - Assistant Worktree Event Naming And Projection Keys

```yaml
plan_unit_id: SP-142
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Assistant worktree events use underscore canonical names, normalize dot-form aliases before projection, bind to thread/worktree redb projection keys and worktree records, and keep background enqueue fields optional without inventing worktree context.
gui_related: false
gui_classification_reason: This unit preserves backend assistant worktree event naming and projection key ownership.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: assistant_worktree_event_naming_and_projection_keys
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0088
preserved_exact_tokens:
- chat.thread_created
- chat.thread_archived
- chat.thread_deleted
- chat.thread.worktree_bound
- chat.thread_worktree_bound
- worktree_
- ADDITIVE
- thread_state:{thread_id}:worktree_binding
- worktree_binding_reverse:{worktree_id}
- worktree_record.v1:{project_id}:{worktree_id}
- thread_state:{thread_id}:persona_override
- worktree_projection.v1:{project_id}:{worktree_id}
- run.background_enqueued
- worktree_path
- branch_name
negative_constraints:
- Absent worktree fields on run.background_enqueued are treated as main-project context rather than inventing worktree context.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-143 - Assistant Worktree Lifecycle Merge PR And Pre-Merge Payloads

```yaml
plan_unit_id: SP-143
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Assistant worktree lifecycle, merge, PR, and pre-merge test events preserve exact chat.thread_worktree_* event names, minimum payload fields, PR failure phase enum push | api, and shorthand expansion only to the three pre-merge test event types.
gui_related: false
gui_classification_reason: This unit preserves backend assistant worktree event payload schemas.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: assistant_worktree_lifecycle_merge_pr_and_pre_merge_payloads
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0088
preserved_exact_tokens:
- chat.thread_worktree_bound
- chat.thread_worktree_unbound
- chat.thread_worktree_renamed
- chat.thread_worktree_create_failed
- chat.thread_worktree_merged
- chat.thread_worktree_merge_failed
- chat.thread_worktree_pr_created
- chat.thread_worktree_pr_failed
- chat.thread_worktree_pre_merge_test_started
- chat.thread_worktree_pre_merge_test_passed
- chat.thread_worktree_pre_merge_test_failed
- thread_id
- worktree_id
- branch_name
- worktree_path
- binding_origin
- target_branch
- strategy
- result_commit_sha
- pr_url
- pr_number
- phase
- push | api
- user_override
- chat.thread_worktree_pre_merge_test_started/passed/failed
negative_constraints:
- The ADDITIVE family shorthand expands only to chat.thread_worktree_pre_merge_test_started, chat.thread_worktree_pre_merge_test_passed, and chat.thread_worktree_pre_merge_test_failed.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-144 - Worktree Safe-Point Snapshot Carry-Through

```yaml
plan_unit_id: SP-144
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Projectors store assistant worktree events with the canonical envelope, and safe-point creation records for worktree-bound execution include worktree_id, worktree_path, branch_name, and HEAD_sha before mutation-capable merge or test operations continue.
gui_related: false
gui_classification_reason: This unit preserves backend safe-point snapshot carry-through before mutation-capable worktree operations.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: worktree_safe_point_snapshot_carry_through
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0088
preserved_exact_tokens:
- canonical envelope
- safe-point creation records
- worktree-bound execution
- worktree_id
- worktree_path
- branch_name
- HEAD_sha
- mutation-capable merge
- test operations continue
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-145 - Core Store Event Schema And Redb Checklist Preservation

```yaml
plan_unit_id: SP-145
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The implementation checklist is preserved as PlanUnit readiness metadata for core storage roots, seglog writer, event schemas, redb schema, migration runner, and version bump, not as executable work nodes.
gui_related: false
gui_classification_reason: This unit preserves backend storage checklist readiness without creating executable tasks.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: core_store_event_schema_and_redb_checklist_preservation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0089
preserved_exact_tokens:
- Implementation checklist
- storage/seglog
- storage/redb
- storage/jsonl
- storage/tantivy
- seglog writer
- envelope format
- ts
- seq
- type
- payload
- chat.message
- chat.thread_created
- run.started
- run.completed
- usage.event
- tool.invoked
- tool.denied
- runtime checkpoint-marker events
- review_rules
- migration runner
- version bump
negative_constraints:
- Checklist prose is PlanUnit readiness metadata, not WorkNodes or executable build tasks.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-146 - Projector Checkpoint Marker And Analytics Checklist Preservation

```yaml
plan_unit_id: SP-146
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The checklist preserves projector requirements for JSONL mirror, Tantivy, redb checkpoints, runtime checkpoint-marker events before mutation or restore, and analytics rollups including tool_usage.{window}.
gui_related: false
gui_classification_reason: This unit preserves backend projector, checkpoint-marker, and analytics checklist readiness.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: projector_checkpoint_marker_and_analytics_checklist_preservation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0089
preserved_exact_tokens:
- seglog -> JSONL mirror
- seglog -> Tantivy
- Persist projector checkpoints
- checkpoints
- runtime checkpoint-marker events
- mutation-capable execution resumes
- safe-point restore continues
- stored runtime checkpoint
- analytics scan
- 5h/7d
- tool latency
- tool_usage
- tool_usage.{window}
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-147 - Chat Editor And Usage Wiring Checklist Preservation

```yaml
plan_unit_id: SP-147
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The checklist preserves chat persistence, editor state, and Usage/dashboard wiring as storage integration readiness, including assistant-chat-design, FileManager section 2.9, usage-feature, and Usage view triggers.
gui_related: true
gui_classification_reason: This unit preserves user-visible chat, editor, and Usage/dashboard storage wiring expectations.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: chat_editor_and_usage_wiring_checklist_preservation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0089
preserved_exact_tokens:
- Wire chat persistence
- thread list
- thread content
- assistant-chat-design.md
- Wire editor state
- open tabs
- active tab
- scroll/cursor
- FileManager.md §2.9
- Wire Usage/dashboard
- Usage/dashboard
- Usage view opens
- usage-feature.md
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-148 - Usage Attribution And Run Completed Snapshot Checklist

```yaml
plan_unit_id: SP-148
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Usage checklist coverage requires Assistant/Interview usage events with thread and parent lineage, hidden/background model work usage.event records, and optional run.completed usage snapshots with canonical attribution fields while per-request canon remains usage.event.
gui_related: false
gui_classification_reason: This unit preserves backend usage attribution and run completion snapshot checklist semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: usage_attribution_and_run_completed_snapshot_checklist
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0089
preserved_exact_tokens:
- usage.event with thread_id and parent lineage
- Assistant
- Interview
- thread_id
- parent_run_id
- hidden/background model work
- title generation
- summaries
- compaction helpers
- tool-triggered model calls
- run.completed
- input_tokens
- output_tokens
- cache_read_input_tokens
- cache_creation_input_tokens
- reasoning_tokens
- total_tokens
- input_total
- input_non_cached
- cache_read
- cache_write
- cache_write_1h
- cache_write_ttl
- output_total
- output_visible
- reasoning/thoughts
- provider_total
- context_estimate
- counting_semantics
- cost_microdollars
- provider_id
- model_id
- account_id?
- billing_entity_id?
- entitlement_class?
- cache_hit?
- cache_strategy?
- 'cost_microdollars: u64'
- canonical per-request data remains usage.event
negative_constraints:
- run.completed optional usage snapshot does not replace canonical per-request usage.event data.
- Legacy token names are compatibility import/export aliases and must not replace UF-085 usage fields in persisted storage, aggregation, or GUI projection.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-149 - Chat Interview Runtime Identity Consumer Boundary

```yaml
plan_unit_id: SP-149
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Assistant and Interview surfaces persist thread-local state, activity traces, and reviewable history, but they consume shared runtime identity projection and do not become canonical owners of runtime identity field names.
gui_related: false
gui_classification_reason: This unit preserves backend owner/consumer boundaries for chat and Interview runtime identity.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: chat_interview_runtime_identity_consumer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0090
preserved_exact_tokens:
- Assistant
- Interview
- thread-local state
- activity traces
- reviewable history
- canonical owner of runtime identity
- Shared runtime identity projection
- chat
- widgets
- audit
- delegated execution
negative_constraints:
- Assistant and Interview surfaces do not become canonical owner of runtime identity.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/Personas.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-150 - Shared Runtime Identity Field Vocabulary

```yaml
plan_unit_id: SP-150
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Shared runtime identity storage preserves requested/effective persona, account binding, operational identity, effective account/provider/project fields, and required account/auth vocabulary for requested account, execution role, credential, login, and auth realm.
gui_related: false
gui_classification_reason: This unit preserves backend shared runtime identity field vocabulary.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: shared_runtime_identity_field_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0091
preserved_exact_tokens:
- requested_persona
- effective_persona
- requested_account_binding
- operational_identity
- effective_account_label
- effective_provider_identity
- effective_project_id
- requested_account_id
- requested_account_policy
- effective_account_id
- execution_role
- account_id
- credential_ref
- login
- auth_realm
- requested account
- operational identity
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/Multi-Account.md#4. Data model, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules)'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-151 - Runtime Snapshot Alias Rejection And Surface Consumption Boundary

```yaml
plan_unit_id: SP-151
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Runtime identity fields are additive, _id aliases such as requested_persona_id and effective_persona_id are not canonical runtime snapshot fields, and chat/GUI surfaces consume the same stored names while permission snapshots and usage preserve effective_account_id and execution_role.
gui_related: true
gui_classification_reason: This unit preserves user-visible chat/GUI consumption boundaries and permission carry-through fields.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: runtime_snapshot_alias_rejection_and_surface_consumption_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0091
preserved_exact_tokens:
- additive
- _id
- requested_persona_id
- effective_persona_id
- canonical runtime snapshot fields
- chat and GUI surfaces
- stored field names
- local variants
- permission snapshots
- usage surfaces
- effective_account_id
- execution_role
negative_constraints:
- requested_persona_id and effective_persona_id are not canonical runtime snapshot fields.
preserved_contractrefs:
- 'ContractRef: Plans/Multi-Account.md#4. Data model, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules)'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-152 - Web Runtime Identity And No-Silent-Cross-Fallback Disclosure

```yaml
plan_unit_id: SP-152
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Web-facing runtime records use shared runtime snapshot vocabulary for web/search/extract/research/crawl/map operations; history/detail inspectors read frozen requested/effective snapshots, adapter-layer provider recommendations stay provisional, and provider/runtime selection preserves no-silent-cross-fallback disclosure.
gui_related: true
gui_classification_reason: This unit preserves user-visible web runtime identity disclosure and fallback explanation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: web_runtime_identity_and_no_silent_cross_fallback_disclosure
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0091
preserved_exact_tokens:
- /web
- search
- extract
- research
- crawl
- map
- /history/detail
- frozen requested/effective identity snapshots
- provider settings row structure
- provider ordering
- /algorithm
- account-vs-API-key grouping
- adapter-layer provisional
- no-silent-cross-fallback
- account-pool
- provider-local retries
- fallback loops
- /account/role
- projection freshness/health
- honored, skipped, clamped, or changed
negative_constraints:
- Auth surfaces must not hide provider-local retries or fallback loops behind generic success events.
preserved_contractrefs:
- 'ContractRef: Plans/Multi-Account.md#4. Data model, Plans/GitHub_API_Auth_and_Flows.md#Token handling and storage (hard rules)'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-153 - Questionnaire State Draft And Status Persistence

```yaml
plan_unit_id: SP-153
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Question and questionnaire persistence stores thread-scoped draft, answer, and final submission state as bounded structured data with canonical status values, QuestionItem field names, draft_value, response_kind, validation_state, and answer source metadata.
gui_related: false
gui_classification_reason: This unit preserves backend questionnaire state and schema persistence.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: questionnaire_state_draft_and_status_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0092
preserved_exact_tokens:
- Question and questionnaire persistence
- thread-scoped draft state
- answer state
- final submission state
- bounded structured data only
- answered | submitted | dismissed | timed_out | unavailable
- draft_value
- response_kind
- validation_state
- /questionnaire
- QuestionItem
- question_id
- question
- allow_freeform
- multi_select
- 'default_values?: string[]'
- single_question
- unavailable
- dismissed
negative_constraints:
- Questionnaire persistence must not invent chat-local aliases.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-154 - Question Card Composer Control Persistence Boundary

```yaml
plan_unit_id: SP-154
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Shared question-card persistence covers single and multi-question flows with draft, incomplete, ready_to_submit, submitted, and paused states; composer send/resend controls remain UI controls while storage records state transition and active-run linkage.
gui_related: true
gui_classification_reason: This unit preserves user-visible question-card and composer control persistence boundaries.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: question_card_composer_control_persistence_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0092
preserved_exact_tokens:
- Shared question-card persistence
- single-question
- multi-question
- draft
- /draft
- incomplete
- ready_to_submit
- submitted
- paused
- /send
- /resend
- state transition
- active-run linkage
- rewind later work
- pause follow
- restore jump-to-latest context
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes:
- Composer controls may expose /send and /resend, but storage records only state transition and active-run linkage.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-155 - Plan Deep Plan Normalized TODO Projection Contract

```yaml
plan_unit_id: SP-155
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Plan and Deep Plan project to a normalized TODO list with a named Q&A loop, locked TODO schema/status, explicit revision states, structural-edit gating after approval, bounded revision history, and chat.plan_todo_updated for durable TODO mutations.
gui_related: true
gui_classification_reason: This unit preserves user-visible Plan/Deep Plan TODO projection and panel behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: plan_deep_plan_normalized_todo_projection_contract
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0093
preserved_exact_tokens:
- Plan
- Deep Plan
- normalized TODO list
- Q&A loop
- locked TODO item schema/status set
- revision states
- structural-edit gating after approval
- bounded revision history
- chat.plan_todo_updated
- todoread
- todowrite
- ask/plan mode
- Deep Plan edits
negative_constraints:
- chat.plan_todo_updated must have an explicit owner-contract definition for durable normalized TODO mutation.
- todoread must not survive as a source_surface mutation source.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md#8.1 Canonical planning model, ContractName:Plans/storage-plan.md#4.3 Plan and TODO state, ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-156 - TODO Schema Status Revision And Legacy Progress Vocabulary

```yaml
plan_unit_id: SP-156
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: TODO storage preserves item schema fields, item status enum, plan-level superseded state, structural edit meaning, TODO tool behavior, Deep Plan resync rule, and legacy XV2 inline progress strings as plan-level visibility labels rather than TODO item statuses.
gui_related: false
gui_classification_reason: This unit preserves backend TODO schema, status, revision, and legacy label semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: todo_schema_status_revision_and_legacy_progress_vocabulary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0093
preserved_exact_tokens:
- todo_id
- title
- summary
- status
- dependencies[]
- order_index
- owner_hint
- verification_hint
- notes
- pending | in_progress | completed | blocked | skipped
- superseded (plan-level only)
- draft
- approved
- executing
- Structural edits = adding / removing / reordering TODO items
- todowrite can create, reorder, update statuses/notes
- todoread returns current normalized list for active thread/run
- Remove todowrite from blanket ask/plan mode auto-deny
- editing Deep Plan markdown
- BEFORE execution begins
- Superseded TODO N/M
- Superseded TODO 5/5
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md#8.1 Canonical planning model, ContractName:Plans/storage-plan.md#4.3 Plan and TODO state, ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events'
compatibility_only_notes:
- Legacy XV2 inline progress strings are plan-level visibility labels for superseded plans, not TODO item statuses.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-157 - TODO Panel Verification And Compact Progress Boundary

```yaml
plan_unit_id: SP-157
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The Assistant chat TODO panel shows verification_hint per item, compact inline progress examples, and durable plan refresh behavior so auto-use heuristic changes emit chat.plan_todo_updated before execution and do not silently replace the current panel.
gui_related: true
gui_classification_reason: This unit preserves visible TODO panel verification hints and compact progress behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: todo_panel_verification_and_compact_progress_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0093
preserved_exact_tokens:
- verification_hint
- plan-level summary
- Inline progress
- Started TODO 2/5
- Completed TODO 2/5
- Blocked TODO 3/5
- Skipped TODO 4/5
- Superseded TODO 5/5
- auto-use heuristic
- draft or refreshed plan state
- chat.plan_todo_updated
- current plan panel
- durable event
negative_constraints:
- Inline progress must not duplicate the full checklist on every turn.
- Auto-use heuristic changes must not silently replace the current plan panel without a durable event.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md#8.1 Canonical planning model, ContractName:Plans/storage-plan.md#4.3 Plan and TODO state, ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-158 - Durable TODO Mutation Event And Source-Of-Truth Boundary

```yaml
plan_unit_id: SP-158
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Durable TODO mutation events persist plan/todo ids, changed field, old/new values, and mutation source, while the Assistant chat plan panel remains the visible source-of-truth and storage owns durable normalized TODO projection consumed by related surfaces.
gui_related: true
gui_classification_reason: This unit preserves visible TODO source-of-truth behavior and backend durable mutation event payloads.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: durable_todo_mutation_event_and_source_of_truth_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0093
preserved_exact_tokens:
- chat.plan_todo_updated
- '{ plan_id: string, todo_id: string, field: string, old_value: any, new_value: any, source: "agent" | "user" }'
- 'source: "agent" | "user"'
- /source-of-truth
- /todo/tool
- todoread
- todowrite
- question cards
- web activity cards
- assistant runtime disclosures
- /consumer
- pre-approval structural changes
- new TODO revision event
negative_constraints:
- After execution begins, reorder or status corrections create a new TODO revision event instead of mutating the approved plan in place.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md#8.1 Canonical planning model, ContractName:Plans/storage-plan.md#4.3 Plan and TODO state, ContractName:Plans/Contracts_V0.md#1.1 Assistant worktree seglog events'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-159 - Activity Transparency Bridge And Blocked Payload Owner

```yaml
plan_unit_id: SP-159
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Activity transparency payloads carry canonical runtime bridge fields and receipt refs; storage owns blocked/denied payload persistence, adapter-selection payloads, approval scope linkage, and immutable historical snapshots without allowing chat, GUI, or web-tool local variants.
gui_related: true
gui_classification_reason: This unit preserves visible activity transparency payloads and blocked/denied recovery context.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: activity_transparency_bridge_and_blocked_payload_owner
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0094
preserved_exact_tokens:
- Activity transparency payloads
- canonical runtime bridge fields
- receipt refs
- blocked_reason_code
- allowed_action_ids[]
- approval scope linkage
- immutable historical snapshots
- Adapter-selection payloads
- requested/effective adapter identity
- adapter_selection_reason
- subordinate provider bridge refs
- chat, GUI, or web-tool consumers
- local variants
negative_constraints:
- Chat, GUI, and web-tool consumers must not invent local variants for adapter-selection payloads.
preserved_contractrefs:
- 'ContractRef: Plans/Tools.md#8.0 Event payloads (seglog), Plans/Runtime_Artifacts_Panel.md#Cross-Surface Operation Receipt Linkage Addendum (2026-03-12)'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-160 - Long-Running Progress And Question TODO Carry-Through

```yaml
plan_unit_id: SP-160
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Long-running activity transparency persists progress_event payloads and cancellation fields, while question/TODO/runtime state, source-route lineage, runtime receipts, and activity payloads carry through storage rather than stale consumer-only variants.
gui_related: true
gui_classification_reason: This unit preserves user-visible long-running progress, cancellation, and question/TODO activity state.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: long_running_progress_and_question_todo_carry_through
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0094
preserved_exact_tokens:
- progress_event
- operation phase
- detail text
- completed/total counts
- elapsed timing
- estimated remaining time
- cancellation
- partial-result state
- '### 4.2'
- '### 4.3'
- '### 4.4'
- /TODO/runtime
- question state
- TODO state
- runtime receipts
- stale consumer-only variants
- 'cancelled: true'
- pages_completed
- pages_total
- elapsed_ms
- estimated_remaining_ms
- /questionnaire
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/Tools.md#8.0 Event payloads (seglog), Plans/Runtime_Artifacts_Panel.md#Cross-Surface Operation Receipt Linkage Addendum (2026-03-12)'
compatibility_only_notes: []
stale_retired_dispositions:
- Stale consumer-only variants are retired in transfer metadata rather than copied into storage canon.
owner_hints:
- Plans/storage-plan.md
```

### SP-161 - Command HITL Terminal And Subagent Activity Snapshots

```yaml
plan_unit_id: SP-161
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Command child-run, approval/HITL, watch-mode, terminal command, and subagent task records persist execution mode, requested/effective Persona, permission snapshots, approval ladder, operation-card lineage, terminal handoff refs, command labels, and child-agent outcomes as durable activity state.
gui_related: true
gui_classification_reason: This unit preserves visible command, HITL, terminal handoff, watch-mode, and subagent activity history.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: command_hitl_terminal_and_subagent_activity_snapshots
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0094
preserved_exact_tokens:
- Command child-run storage
- '### 4.2 Command execution model'
- '### 4.3 Persona selection'
- requested/effective Persona
- child/subagent overlay inheritance
- once/session/always/deny
- source
- layer
- permission snapshots
- Rollback lineage
- Watch-mode
- background-card type
- direct-recovery-action
- approval-card scope
- /audit/projectors
- /collapsible
- canonical PTY
- Open in Terminal
- Show Terminal
- sandbox state
- /allowlist
- terminal_session_id
- command block
- cmd.terminal.open
- cmd.terminal.show
- cmd.terminal.new_tab
- aggressive-by-default task launches
negative_constraints:
- Watch-mode and long-running commands do not create a separate background-card type.
- Open in Terminal and Show Terminal do not imply cmd.terminal.new_tab.
preserved_contractrefs:
- 'ContractRef: Plans/Tools.md#8.0 Event payloads (seglog), Plans/Runtime_Artifacts_Panel.md#Cross-Surface Operation Receipt Linkage Addendum (2026-03-12)'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-162 - Web Operation Inline Ref Blob And Payload Meta Storage

```yaml
plan_unit_id: SP-162
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Web-operation storage splits inline activity payload fields from ref/blob payloads, uses blob-ref naming and payload.meta child fields for replay/audit joins, binds cache storage to the web content cache and TTL table, and preserves common and per-tool child fields without duplicating full result bodies.
gui_related: false
gui_classification_reason: This unit preserves backend web-operation payload storage, blob refs, and replay/audit joins.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: web_operation_inline_ref_blob_and_payload_meta_storage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0094
preserved_exact_tokens:
- web-operation inline vs ref/blob split
- Inline activity payload fields
- Ref/blob payloads
- extracted page bodies
- research synthesis
- full source sets
- crawl inventories
- map graph payloads
- blob-ref
- payload.meta
- web content cache
- TTL
- web_operation
- web_input_preview
- support_tier
- execution_path
- requested_adapter_id?
- effective_adapter_id?
- adapter_selection_reason?
- projection_freshness?
- projection_health?
- provider_fallback_occurred
- provider_fallback_summary?
- source_count?
- sources_ref?
- result_quality_hint?
- warnings_count?
- error_code?
- query_preview
- /candidate
- results_count
- websearch
- webextract
- webresearch
- webcrawl
- webmap
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-163 - Web Operation Execution Path Fallback And Display Label Boundary

```yaml
plan_unit_id: SP-163
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Web activity storage preserves execution_path and provider_fallback_summary so replay, history, audit, compact cards, result cards, and provider-named labels agree on the route used without forking runtime identity names.
gui_related: true
gui_classification_reason: This unit preserves visible web activity labels and backend route/fallback replay boundaries.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: web_operation_execution_path_fallback_and_display_label_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0094
preserved_exact_tokens:
- 'execution_path?: string'
- provider_search_native
- provider_extract_native
- pm_search_plus_site_reader
- pm_site_reader
- provider_firecrawl_scrape
- pm_fetch_fallback
- provider_firecrawl_agent
- pm_research_composed
- rate-limit/outage fallback
- provider_fallback_summary?
- same-operation fallback chain
- chat activity label
- Searching Web
- Extracting Site
- /model/account-policy
- result cards
- history rows
- audit logs
negative_constraints:
- Persisted history must not fork runtime identity names from web-specific display labels.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-164 - Activity Payload Runtime Bridge Field Table

```yaml
plan_unit_id: SP-164
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Activity payload records preserve runtime bridge fields for node, attempt, lane, package, execution role, account, operational identity, provider attempt, usage event, inspection refs, structured web_input, result quality, and provenance badge values.
gui_related: false
gui_classification_reason: This unit preserves backend activity payload field-table semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: activity_payload_runtime_bridge_field_table
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0094
preserved_exact_tokens:
- activity payload
- node_id
- attempt_id
- lane_id
- package_id
- execution_role
- effective_account_id
- operational_identity
- provider_attempt_ref
- usage_event_ref
- detail_ref
- report_ref
- web_input
- Structured web-operation input object
- result_quality_hint
- search_snippets_only
- extracted_pages
- site_reader_pages
- research_synthesis
- provenance_badge
- site_reader
- search_snippet
- site_extract
- crawl_result
- map_result
- provider_scrape
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/Contracts_V0.md#3.4 Tool-specific payload extensions'
compatibility_only_notes:
- provider_scrape is persisted only with the proposed-extension caveat from Plans/Contracts_V0.md.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-165 - Receipt Refs Route Open Precedence And Permission Carry-Through

```yaml
plan_unit_id: SP-165
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Receipt refs remain inspection and provenance links rather than route/open surrogates, bridge-field precedence stays explicit, and effective actor/account identity survives into activity payloads.
gui_related: false
gui_classification_reason: This unit preserves backend receipt ref, route/open precedence, and permission carry-through semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: receipt_refs_route_open_precedence_and_permission_carry_through
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0094
preserved_exact_tokens:
- receipt refs
- inspection and provenance links
- route/open surrogates
- Inspection refs
- route/open contracts
- Bridge-field precedence
- effective actor
- account identity
- activity payloads
negative_constraints:
- Receipt refs remain inspection and provenance links rather than route/open surrogates.
- Bridge-field precedence must be explicit rather than inferred.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-166 - Inline Visualizer Source Metadata And Sandbox Bridge Storage

```yaml
plan_unit_id: SP-166
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Inline visualizer persistence stores only PM-managed source, metadata, outputs, render config, and approved host-mediated bridge metadata for sandboxed visual-module cards, not arbitrary bridge calls, direct DOM reach-through, client heap state, or generic send-message payloads.
gui_related: true
gui_classification_reason: This unit preserves user-visible inline visualizer source, render, and sandbox bridge persistence.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: inline_visualizer_source_metadata_and_sandbox_bridge_storage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0095
preserved_exact_tokens:
- Inline visualizer persistence
- PM-managed source
- metadata
- PM-owned outputs
- source fragment
- title
- type/kind
- version
- HTML/JS/CSS
- /JS
- width
- height
- /design
- /auto-height
- visual-module
- open-link
- in-module
- send-message
- /interactive
- /scripts
- version-pinned
- integrity-recorded
- policy-allowed
negative_constraints:
- Arbitrary bridge calls, direct DOM reach-through, and client heap state are not durable storage.
- Question-flow embedded visuals persist PM-managed draft-state outputs instead of generic send-message bridge payloads.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-167 - Inline Visualizer Replay Snapshot Fallback And Display State

```yaml
plan_unit_id: SP-167
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Inline visualizer replay and export review re-render from persisted source, title/type metadata, render config, and PM-managed state outputs, using screenshot or snapshot fallback only when re-render is impractical and storing visible fallback/error state as PM-owned display state.
gui_related: true
gui_classification_reason: This unit preserves visible inline visualizer replay, snapshot fallback, and error-state behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: inline_visualizer_replay_snapshot_fallback_and_display_state
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0095
preserved_exact_tokens:
- screenshot
- /snapshot
- scroll-back
- thread reload/export review
- re-renders from the persisted source fragment
- title/type metadata
- render config
- PM-managed state outputs
- screenshot fallback
- arbitrary JS heap state is not persisted
- replay or reload
- visible fallback and error state
- PM-owned display state
negative_constraints:
- Arbitrary JS heap state is not persisted.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-168 - Persistence Gap Owner-Aligned State Boundary

```yaml
plan_unit_id: SP-168
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Remaining persistence gaps for the rewrite shell resolve through explicit owner-aligned state rather than feature-local ad hoc blobs.
gui_related: false
gui_classification_reason: This unit preserves backend storage owner alignment for remaining persistence gaps.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: persistence_gap_owner_aligned_state_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0096
preserved_exact_tokens:
- persistence gaps
- rewrite shell
- owner-aligned state
- feature-local ad hoc blobs
negative_constraints:
- Remaining persistence gaps are not addressed by feature-local ad hoc blobs.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-169 - Unsaved Editor Recovery Required Shared-Buffer Lifecycle

```yaml
plan_unit_id: SP-169
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Unsaved editor recovery is required MVP live shared-buffer storage: checklist delivery cannot downgrade it to later, recovery starts on first dirty buffer capture, ends only on save/discard/resolution, and multi-view editor surfaces share recovery, restore, and redo lineage.'
gui_related: true
gui_classification_reason: This unit preserves user-visible unsaved editor recovery, banner, restore, and conflict lifecycle.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: unsaved_editor_recovery_required_shared_buffer_lifecycle
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0097
preserved_exact_tokens:
- Unsaved editor recovery
- live shared-buffer storage contract
- /checklist
- /later
- first dirty buffer state
- /ends
- save, discard, or explicit recovery resolution
- multi-view
- /editor
- /restore
- /redo
- recover-unsaved
- required MVP behavior
- local and remote-backed buffers
- remote-backed recovery banners
- Recovered local edits — remote destination not yet synchronized
- save success
- effective destination
negative_constraints:
- The checklist may track delivery work, but it must not downgrade recover-unsaved to /later.
- Save success is only claimed after the effective destination confirms the write.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-170 - Editor Recovery Key Snapshot Restore And Conflict Handling

```yaml
plan_unit_id: SP-170
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Editor recovery stores editor_state.v1:{project_id}:{file_path_hash}, cursor, scroll, selection ranges, undo stack reference, unsaved changes flag, and session-restore/conflict-handling behavior that reloads state before focus and shows diffs on disk changes.
gui_related: true
gui_classification_reason: This unit preserves user-visible editor state restoration and conflict resolution behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: editor_recovery_key_snapshot_restore_and_conflict_handling
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0097
preserved_exact_tokens:
- editor_state.v1:{project_id}:{file_path_hash}
- cursor position
- scroll offset
- selection ranges
- undo stack reference
- unsaved changes flag
- recovery trigger
- session restore
- restoring focus
- conflict handling
- file changed on disk
- show a diff
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-171 - Requested Effective Runtime Visibility Distinctions

```yaml
plan_unit_id: SP-171
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The persistence model stores requested versus effective browser runtime/capabilities, LSP enablement/server set, freshness versus health versus write availability, and restore outcomes for historical Search, LSP, browser, and editor recovery surfaces.
gui_related: true
gui_classification_reason: This unit preserves user-visible requested/effective runtime disclosure and restoration honesty.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: requested_effective_runtime_visibility_distinctions
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0098
preserved_exact_tokens:
- requested vs effective browser runtime/capabilities
- requested vs effective LSP enablement
- attached-server set
- freshness vs health vs write availability
- remote-backed projections
- restore outcome
- historical Search
- LSP
- browser
- editor recovery surfaces
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-172 - Requested Effective Key Patterns And Freshness Triad Disposition

```yaml
plan_unit_id: SP-172
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Requested and effective resource state persist under resource_type requested/effective key patterns; the local freshness triad current/refreshing/stale remains a source preservation note here and must not expand into full projection-health canon beyond the owning sections.
gui_related: false
gui_classification_reason: This unit preserves backend requested/effective state key patterns and limited freshness-triad disposition.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: requested_effective_key_patterns_and_freshness_triad_disposition
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0098
preserved_exact_tokens:
- '{resource_type}_requested.v1:{scope}:{id}'
- '{resource_type}_effective.v1:{scope}:{id}'
- requested state
- effective state
- projection freshness
- current
- refreshing
- stale
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md'
compatibility_only_notes: []
stale_retired_dispositions:
- projection freshness is persisted as current, refreshing, or stale in this span; do not expand it as full projection-health canon here.
owner_hints:
- Plans/storage-plan.md
```

### SP-173 - Search And Source Control Projection Separation

```yaml
plan_unit_id: SP-173
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Search state and Source Control state keep separate projection families: search_projection stores query intent/results/filter/scope, sc_projection stores repo projections, compare origins, review context, branch/diff/staging/commit draft, and editor markers consume rather than own those projections.'
gui_related: true
gui_classification_reason: This unit preserves visible Search and Source Control projection separation and editor marker consumption.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: search_and_source_control_projection_separation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0099
preserved_exact_tokens:
- Search state
- text query intent
- query snapshots
- Source Control state
- repo projections
- compare origins
- review context
- diff-local search
- project Search state
- editor markers
- Source Control/LSP projections
- search_projection.v1:{project_id}
- sc_projection.v1:{project_id}
- last query
- results
- filter state
- scope
- branch
- diff state
- staged files
- commit message draft
negative_constraints:
- Diff-local search does not get persisted as project Search state.
- Editor markers consume Source Control/LSP projections but do not become a substitute owner.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-174 - Source Control Review And Conflict Projection State

```yaml
plan_unit_id: SP-174
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Source Control review and conflict persistence stores compare targets, review filters, generated-file visibility, review comments/notes, stale target downgrade refs, conflict presentation settings, and command resolution events without persisting conflict content.
gui_related: true
gui_classification_reason: This unit preserves visible Source Control review/conflict filters, compare state, and command outcomes.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: source_control_review_and_conflict_projection_state
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0099
preserved_exact_tokens:
- sc_projection.v1:{project_id}
- last compare target
- left/right compare targets
- review filters
- ignore-whitespace
- file filter
- collapse-unchanged
- generated-file visibility
- review context
- local review-comments/notes state
- cmd.source_control.open_review
- cmd.source_control.review.open/swap/filter
- cmd.source_control.set_compare_target
- cmd.source_control.toggle_generated_filter
- stale compare targets
- stale-target references
- replacement baselines
- Conflict assistant persistence
- conflict presentation mode
- open external merge tool preference
- auto-open first conflicted file toggle
- cmd.source_control.open_conflict
- cmd.source_control.open_merge_editor
- cmd.source_control.resolve_conflict_side
- cmd.source_control.mark_conflict_resolved
negative_constraints:
- Source Control conflict commands record resolution events and blocked-state handoff outcomes, not conflict content.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md'
compatibility_only_notes: []
stale_retired_dispositions:
- Stale compare targets are retained only long enough to explain the downgrade and offer alternate pivots.
owner_hints:
- Plans/storage-plan.md
```

### SP-175 - GitHub Actions Receipt To Code Correlation Projection

```yaml
plan_unit_id: SP-175
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: GitHub Actions to-code correlation persistence stores project state and receipt projections for run/job/step focus, log focus, diff targets, failing-file hints, heuristic toggles, confidence thresholds, related diffs/worktrees, and evidence-labeled log-to-file candidates.
gui_related: true
gui_classification_reason: This unit preserves visible GitHub Actions to-code focus, related-diff/worktree pivots, and uncertainty labels.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: github_actions_receipt_to_code_correlation_projection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0099
preserved_exact_tokens:
- github_actions.project_state.{project_id}
- receipt projections
- last-opened run/job/step focus
- /job/step log focus
- preferred diff target
- auto-open failing file hints
- show heuristic matches toggle
- correlation confidence threshold
- branch-diff preference
- auto-open related worktree preference
- workflow run/job/step receipts
- commit range
- changed files
- branch refs
- worktree refs
- failing-step metadata
- candidate related diffs
- candidate related worktrees
- cmd.github.actions.open_run
- cmd.github.actions.open_job
- cmd.github.actions.open_step_logs
- cmd.github.actions.open_related_diff
- cmd.github.actions.open_related_worktree
- confidence and uncertainty labels
negative_constraints:
- Log-to-file correlation candidates remain evidence with confidence and uncertainty labels; they do not become canonical source truth unless a stronger owner record confirms the mapping.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-176 - Host-Aware LSP Lifecycle Restart Budget And No Local Fallback

```yaml
plan_unit_id: SP-176
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Host-aware LSP persistence stores lifecycle and restart budgets by host-aware session key, discloses current/refreshing/stale/degraded/unavailable state, forbids silent local fallback for remote-mode projects, and deterministically replays attached documents after transport or sync loss.
gui_related: false
gui_classification_reason: This unit preserves backend host-aware LSP lifecycle, restart, and recovery semantics.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: host_aware_lsp_lifecycle_restart_budget_and_no_local_fallback
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0100
preserved_exact_tokens:
- LSP lifecycle
- restart budgets
- host-aware session key
- current
- refreshing
- stale
- degraded
- unavailable
- remote-mode projects
- silent local fallback path
- /transport
- /sync-loss
- host-aware LSP session
- deterministic URI order
- persisted restart budget
- backoff state
- Degraded
- user retry
negative_constraints:
- Remote-mode projects never restore into a silent local fallback path.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md'
compatibility_only_notes: []
stale_retired_dispositions:
- restart/reconnect preserves enough state to disclose whether a projection is current, refreshing, stale, degraded, or unavailable.
owner_hints:
- Plans/storage-plan.md
```

### SP-177 - LSP Protocol Trace Inspection Buffer Boundary

```yaml
plan_unit_id: SP-177
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Each host-aware LSP session keeps a bounded protocol/state trace buffer for operational/debug inspection only, exposing session key, root, current state, last error, restart/backoff, and protocol trace reveal action without becoming canonical app history.
gui_related: true
gui_classification_reason: This unit preserves user-visible LSP trace reveal action and debug inspection state.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: lsp_protocol_trace_inspection_buffer_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0100
preserved_exact_tokens:
- bounded protocol/state trace buffer
- operational/debug inspection only
- canonical app history
- session key
- root
- current state
- last error
- restart attempt/backoff
- recent protocol trace reveal action
negative_constraints:
- The bounded protocol/state trace buffer is not canonical app history.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-178 - LSP Server State Key Recovery And Restart Count Persistence

```yaml
plan_unit_id: SP-178
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: LSP server state persists under lsp_server_state.v1:{host_id}:{server_id}:{root_hash} with server config, capabilities snapshot, last known status, restart count, recovery path, and persisted restart counts for stable budget enforcement and degraded-state disclosure.
gui_related: false
gui_classification_reason: This unit preserves backend LSP server state keys, recovery, and restart count persistence.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 178.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_178_chat_runtime_state
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: lsp_server_state_key_recovery_and_restart_count_persistence
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0100
preserved_exact_tokens:
- lsp_server_state.v1:{host_id}:{server_id}:{root_hash}
- server config
- capabilities snapshot
- last known status
- restart count
- recovery path
- session restore
- persisted config
- persisted restart counts
- budget enforcement
- degraded-state disclosure
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-179 - Seglog Redb Checkpoint Projector Recovery

```yaml
plan_unit_id: SP-179
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage recovery rules preserve seglog last-complete-record recovery, redb backup or canonical-seglog rebuild, bounded projector commits, checkpoint loss rebuild, and projector panic/crash behavior that restarts from the last good checkpoint without advancing it.
gui_related: false
gui_classification_reason: This unit preserves backend seglog, redb, checkpoint, and projector recovery rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: seglog_redb_checkpoint_projector_recovery
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0101
preserved_exact_tokens:
- seglog corruption or partial write
- Append-only with flush
- last-complete-record recovery
- CRC32
- corrupt record -> skip + recovery event
- redb corruption
- Restore from backup
- canonical seglog
- Projector falls behind
- bounded batches
- successful commit
- Checkpoint lost
- last retained segment
- Projector panic or crash
- Do not advance checkpoint
- last good checkpoint
negative_constraints:
- 'Projector panic or crash: Do not advance checkpoint; restart from last good checkpoint.'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileSafe.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-180 - User-Visible Storage Error Lock And Boot Recovery

```yaml
plan_unit_id: SP-180
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: User-visible storage problem handling keeps analytics scans in the background with freshness state, surfaces disk/storage errors, prevents half-migrated stores, enforces active durable-store lock-path/pm.lock read-only mode, and emits storage.boot_recovery after boot-time janitor cleanup.
gui_related: true
gui_classification_reason: This unit preserves user-visible storage error, read-only, lock, and boot recovery behavior.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: user_visible_storage_error_lock_and_boot_recovery
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0101
preserved_exact_tokens:
- Analytics scan blocks UI
- background
- last committed rollup
- freshness state
- Disk full / storage I/O
- user-facing error
- stop unsafe writes
- storage I/O policy
- Migration failure
- previous version intact
- half-migrated store
- Multiple app instances
- exclusive flock
- lock-path
- pm.lock
- logical storage root
- safe-local fallback
- /read-only
- notify the user
- Boot-time janitor
- .tmp.*
- lock freshness
- storage.boot_recovery
negative_constraints:
- Do not open a half-migrated store.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md'
- 'ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileSafe.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-181 - Storage API LRU And Shutdown Hygiene

```yaml
plan_unit_id: SP-181
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage API and hygiene rules require append/redb writes to return structured Result values without silent swallow, cap in-memory file records at 10,000 with lazy rebuild, and close the DB/redb handle in the shutdown sequence before process exit.
gui_related: false
gui_classification_reason: This unit preserves backend API, LRU, and shutdown hygiene rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: storage_api_lru_and_shutdown_hygiene
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0101
preserved_exact_tokens:
- append()
- redb write operations
- structured Result
- no silent swallow
- File record LRU eviction
- 10,000
- rebuild lazily on access
- DB / redb shutdown hygiene
- Close the DB handle
- shutdown sequence
- process exit
negative_constraints:
- append() / redb write operations return structured Result; no silent swallow.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Architecture_Invariants.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/FileSafe.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-182 - Compaction And Backup Restore Authority

```yaml
plan_unit_id: SP-182
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Compaction and backup/restore enhancements preserve sequence order, exclude the active segment, keep replay/projector correctness intact, snapshot canonical stores at one shared boundary, validate checksums before restore, and rebuild JSONL/Tantivy disposable projections instead of treating them as authoritative.
gui_related: false
gui_classification_reason: This unit preserves backend compaction and backup/restore authority rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: compaction_and_backup_restore_authority
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0102
preserved_exact_tokens:
- Compaction
- §2.2.1
- Optional for MVP
- MUST preserve seq
- exclude the active segment
- replay/projector correctness
- Backup/restore
- Scheduled backups
- canonical stores
- one shared boundary
- validate checksums before restore
- rebuild disposable projections
- JSONL/Tantivy
- authoritative
negative_constraints:
- Backup/restore must rebuild disposable projections after restore rather than treating them as authoritative.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-183 - Export Replica Per-Project Seglog Event Registry Enhancements

```yaml
plan_unit_id: SP-183
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Enhancement coverage preserves export from seglog or JSONL mirror, embedded redb read-replica non-applicability, per-project seglog default behavior, event schema registry ownership, and optional streaming projector correctness boundaries.
gui_related: false
gui_classification_reason: This unit preserves backend enhancement routing and owner boundaries.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: export_replica_per_project_seglog_event_registry_enhancements
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0102
preserved_exact_tokens:
- Export
- thread or run history
- JSONL/JSON
- seglog
- JSONL mirror
- thread_id
- Read replicas
- embedded redb
- server-backed store
- dashboard/Usage reads
- Per-project seglog
- §2.1.2
- app-global
- Event schema registry
- payload validation
- doc generation
- Plans/Contracts_V0.md
- top-level envelope
- Streaming projector
- Optional richer UX path
- committed projector state
- durable checkpoints
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-184 - Seglog Redb Jsonl Tantivy Build Phases

```yaml
plan_unit_id: SP-184
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The implementation order heading and phases 1-4 remain PlanUnit readiness metadata for seglog foundation, redb/schema, JSONL mirror, and Tantivy chat index build phases, with storage directories, namespaces, checkpoints, and exit criteria preserved without creating WorkNodes.
gui_related: false
gui_classification_reason: This unit preserves backend phased implementation order as readiness metadata only.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: seglog_redb_jsonl_tantivy_build_phases
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0103
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0104
preserved_exact_tokens:
- Implementation order and testing
- Phase 1 -- seglog foundation
- storage/seglog
- storage/redb
- storage/jsonl
- storage/tantivy
- seglog writer only
- envelope format
- seq
- flush
- rotation
- Phase 2 -- redb and schema
- settings
- sessions
- runs
- checkpoints
- editor
- rollups
- review_rules
- migrations runner
- 'Phase 3 -- projector: seglog → JSONL mirror'
- JSONL mirror
- 'Phase 4 -- projector: seglog → Tantivy (chat index)'
- chat.message
- chat.thread_created
- thread_id
- content
- role
- ts
- message_id
negative_constraints:
- Phased implementation order is PlanUnit readiness metadata, not WorkNodes or executable build tasks.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-185 - Analytics Chat Editor Usage Wiring Phase

```yaml
plan_unit_id: SP-185
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Phases 5-6 preserve analytics scan and rollups plus chat, editor, and Usage wiring expectations, including tool_usage, p50/p95/error_count, redb rollups, Usage/dashboard reads, usage.event, run.completed, and end-to-end visible flow.
gui_related: true
gui_classification_reason: This unit preserves user-visible Usage/dashboard, chat, editor, and end-to-end wiring expectations.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: analytics_chat_editor_usage_wiring_phase
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0104
preserved_exact_tokens:
- Phase 5 -- analytics scan and rollups
- analytics scan job
- periodic or on-demand
- 5h/7d usage rollups
- tool latency
- tool_usage
- per-tool count
- p50/p95
- error_count
- Plans/Tools.md §8.4
- redb rollups namespace
- scan checkpoint
- UI
- test reader
- Phase 6 -- wire chat, editor, and Usage
- assistant-chat-design
- FileManager.md §2.9
- Usage/dashboard
- usage-feature.md
- usage.event
- run.completed
- Full flow works
- create thread
- send message
- Usage view shows rollups
- editor state persists
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-186 - Storage Phase Dependency Ordering

```yaml
plan_unit_id: SP-186
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage phase dependencies require seglog writer before projectors, redb schema/migrations and checkpoints before projector checkpoint use, rollups before analytics writes, Tantivy before chat search UX, and chat/editor/Usage wiring after storage primitives exist.
gui_related: false
gui_classification_reason: This unit preserves backend dependency ordering and startup prerequisites.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: storage_phase_dependency_ordering
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0104
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0105
preserved_exact_tokens:
- Dependencies
- seglog writer before any projector
- redb open + schema + migrations
- checkpoints
- rollups
- projectors must not start until redb is open and checkpoints namespace exists
- analytics scan must not run until rollups namespace
- scan checkpoint key
- current segment may be empty
- position 0
- Dependency graph
- Event type schemas
- Tantivy chat index
- Chat/editor/Usage wiring
negative_constraints:
- Projectors must not start until redb is open and checkpoints namespace exists.
- Analytics scan must not run until rollups namespace and scan checkpoint key exist.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-187 - Durable Store Startup Lock And Fallback Order

```yaml
plan_unit_id: SP-187
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Startup order resolves app data root, probes durable-store safety including unsafe-filesystem/NFS posture, derives lock-path, acquires pm.lock before writers, enters read-only mode if held, opens stores and projectors in order, and routes fallback metadata to safe local storage while preserving logical-root lineage and diagnostics.
gui_related: true
gui_classification_reason: This unit preserves user-visible startup diagnostics/read-only posture and backend lock/fallback order.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: durable_store_startup_lock_and_fallback_order
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0106
preserved_exact_tokens:
- Startup order
- app data root
- environment override optional
- unsafe-filesystem
- NFS
- safe local fallback
- lock-path
- pm.lock
- /read-only viewer mode
- storage/seglog
- storage/redb
- storage/jsonl
- storage/tantivy
- Open redb
- run migrations
- Open the seglog writer
- Start projectors
- analytics schedulers
- per-project index services
- durable-store fallback
- session snapshot metadata
- lineage
- user-visible diagnostics
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Architecture_Invariants.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-188 - Regex Index Startup Recovery

```yaml
plan_unit_id: SP-188
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Regex-index startup recovery scans regex_index directories after project context, selects and validates gen-{N} candidates, verifies index_meta, checksums, lookup.bin and git anchors, creates IndexSnapshot when ready, serves raw ripgrep on no_index or corrupt snapshots, and deletes corrupt/orphaned generations during recovery.
gui_related: true
gui_classification_reason: This unit preserves user-visible Search fallback and backend regex-index recovery behavior.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: regex_index_startup_recovery
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0106
preserved_exact_tokens:
- Regex-index startup recovery
- regex_index/
- grep
- Search-panel regex query
- gen-{N}/
- index_meta.json
- xxh3 checksums
- lookup.bin
- mmap
- anchor_sha
- git cat-file -t {anchor_sha}
- IndexSnapshot
- ready
- no_index
- raw ripgrep
- checksum or metadata mismatch
- corrupt generation directory
- full rebuild
- orphaned or partial generations
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Tools.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Architecture_Invariants.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-189 - Shutdown Flush Close And Cache Retention

```yaml
plan_unit_id: SP-189
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Shutdown signals projectors, cancels in-flight regex builds, flushes and closes seglog, closes redb, releases the active durable-store lock only after final writer flush, and leaves valid regex snapshots and reusable remote cache state in place.
gui_related: false
gui_classification_reason: This unit preserves backend shutdown, flush, lock-release, and cache-retention rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: shutdown_flush_close_and_cache_retention
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0106
preserved_exact_tokens:
- Shutdown
- Signal projectors to stop
- flush outputs
- Cancel in-flight regex builds
- partial-generation cleanup
- Flush and close the seglog writer
- Close redb
- Release the active durable-store lock
- final writer flush
- last valid regex snapshot
- reusable remote cache state
- ordinary shutdown does not evict caches
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-190 - Single Writer And Compatibility Prompt State Protection

```yaml
plan_unit_id: SP-190
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Concurrency rules keep seglog a single-writer stream, regex-index publication single-writer per project with ArcSwap reader snapshots, and compatibility prompt/session files such as kv.json or prompt-history.jsonl protected against last-write-wins overwrite unless migrated or locked with lineage and conflict evidence.
gui_related: false
gui_classification_reason: This unit preserves backend single-writer and compatibility prompt/session state protection.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: single_writer_and_compatibility_prompt_state_protection
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0106
preserved_exact_tokens:
- Concurrency and single-writer rules
- Seglog remains a single-writer stream
- Regex-index publication
- single-writer per project
- ArcSwap
- partially-written generations
- Multi-instance prompt/session state
- last-write-wins flat files
- kv.json
- prompt-history.jsonl
- canonical durable store
- atomic write
- file-locking semantics
- session/run lineage
- conflict evidence
negative_constraints:
- Multi-instance prompt/session state is not allowed to degrade into last-write-wins flat files.
- Concurrent instances must never overwrite prompt-history or key-value state without conflict evidence.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Wiring_Matrix.md, ContractName:Plans/Tools.md, ContractName:Plans/storage-plan.md'
compatibility_only_notes:
- kv.json and prompt-history.jsonl are compatibility state until migrated or protected by atomic write plus file-locking semantics.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-191 - First Run Storage Initialization

```yaml
plan_unit_id: SP-191
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: First-run storage initialization creates missing storage directories, creates the first seglog segment on append, initializes redb schema_version/meta namespace, treats missing projector checkpoints as start-from-beginning, and leaves empty seglog projectors with no work.
gui_related: false
gui_classification_reason: This unit preserves backend first-run initialization behavior.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: first_run_storage_initialization
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0107
preserved_exact_tokens:
- First run / empty state
- storage/*
- storage/seglog/
- first segment on first append
- checkpoint "none"
- offset 0
- schema_version
- meta namespace
- initial migration
- schema_version to 1
- redb is created on first open
- Projectors
- start from beginning of seglog
- first segment
- seglog is empty
- no work
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-192 - Analytics Missing Checkpoint Full Scan

```yaml
plan_unit_id: SP-192
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: When the analytics scan checkpoint is missing, storage scans from seq 0, paginates large seglogs in 1000-event batches, yields between batches, writes analytics:scan_checkpoint to last processed seq, resumes subsequent runs from the checkpoint, and preserves analytics.scan_batch_size default 1000.
gui_related: false
gui_classification_reason: This unit preserves backend analytics first-run checkpoint recovery and batching.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: analytics_missing_checkpoint_full_scan
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0107
preserved_exact_tokens:
- Analytics Scan When Checkpoint Missing (Resolved)
- seq 0
- beginning of seglog
- full scan is safe and idempotent
- 1000 events per batch
- yielding between batches
- event loop
- analytics:scan_checkpoint
- last processed seq
- Subsequent runs resume
- analytics.scan_batch_size
- default 1000
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-193 - Phase Storage Verification Strategy

```yaml
plan_unit_id: SP-193
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The testing strategy preserves phase-specific unit and integration verification for data root resolution, seglog append/readback, redb namespaces, JSONL mirror, Tantivy chat index, analytics rollups, and end-to-end chat/editor/Usage flow as PlanUnit validation metadata only.
gui_related: false
gui_classification_reason: This unit preserves backend verification strategy without creating executable tasks.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: phase_storage_verification_strategy
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0108
preserved_exact_tokens:
- Testing strategy
- Phase 1
- Unit
- Integration
- app data root resolution
- dir creation idempotent
- seglog writer append and read-back/tail
- rotation
- Phase 2
- redb open/create
- put/get
- migration runner
- Phase 3
- checkpoint read/write
- mirror append
- Phase 4
- Tantivy index
- search by content and thread_id
- Phase 5
- rollup computation
- fixture seglog
- Phase 6
- end-to-end thread + message + projectors + search + Usage + editor state
negative_constraints:
- Testing strategy rows are PlanUnit validation metadata, not WorkNodes or executable tasks.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-194 - Backend Storage Phase Acceptance Criteria

```yaml
plan_unit_id: SP-194
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Backend acceptance criteria preserve phase 1-5 success conditions for storage dirs, seglog readback, redb schema/migrations, JSONL projector resume, Tantivy search, and analytics rollups readable from redb.
gui_related: false
gui_classification_reason: This unit preserves backend phase acceptance criteria.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: backend_storage_phase_acceptance_criteria
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0109
preserved_exact_tokens:
- Acceptance criteria per phase
- Phase 1
- App data root resolved
- storage dirs exist
- seglog writer appends envelope-format events
- read back in order
- Phase 2
- redb opens with current schema
- migrations run
- settings and checkpoints
- Phase 3
- JSONL projector tails seglog
- resumes from checkpoint
- without duplicating or skipping events
- Phase 4
- Chat projector indexes seglog events into Tantivy
- search by content and thread_id
- Phase 5
- Analytics scan writes 5h/7d and tool_usage rollups
- reader
- UI or test
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-195 - End-To-End Chat Editor Usage Acceptance

```yaml
plan_unit_id: SP-195
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Phase 6 acceptance preserves the visible end-to-end flow where Chat, editor, and Usage use seglog/redb and thread, message, projectors, search, Usage, and editor state work together.
gui_related: true
gui_classification_reason: This unit preserves user-visible end-to-end Chat/editor/Usage acceptance.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: end_to_end_chat_editor_usage_acceptance
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0109
preserved_exact_tokens:
- Phase 6
- Chat, editor, and Usage
- seglog and redb
- full flow
- thread + message + projectors + search + Usage + editor state
- works end-to-end
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-196 - Storage Plan Version History Preservation

```yaml
plan_unit_id: SP-196
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Version history rows remain preserved source metadata, including 2026-02-20, 2026-02-22, validation-reference migration, implementation-ready pass details, extended event/redb key history, and original fleshed-out checklist/change notes.
gui_related: true
gui_classification_reason: This unit preserves user-visible/source-visible version history metadata.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: storage_plan_version_history_preservation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0110
preserved_exact_tokens:
- Version history
- '2026-02-20'
- Initial checklist
- '2026-02-22'
- Validation reference migrated
- verifier/evidence-based validation contracts
- current
- Implementation-ready pass
- §8
- phased implementation order
- dependencies
- startup/shutdown
- first-run
- testing
- acceptance criteria
- project_id
- path_hash
- window
- HITL
- interview
- queue
- plan_todo
- thread archive/delete
- subagent
- editor lifecycle
- queue, plan_todo, thread_usage, file_tree_expanded, layout, recent_files, run/interview/hitl checkpoints
- Fleshed out
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-197 - Scheduler Safe-Point Remediation Event Ingestion

```yaml
plan_unit_id: SP-197
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Scheduler/runtime storage support ingests canonical scheduler, node blocked/unblocked, safe-point, and remediation events while accepting legacy aliases during migration, normalizing to canonical names before projections, and forbidding new legacy event emission.
gui_related: false
gui_classification_reason: This unit preserves backend scheduler/safe-point/remediation event ingestion and migration alias rules.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: scheduler_safe_point_remediation_event_ingestion
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0111
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0112
preserved_exact_tokens:
- Scheduler Runtime, Safe-Point, and Remediation Storage Addendum (2026-03-08)
- Event ingestion
- MUST ingest and project
- canonical names
- legacy aliases
- scheduler.pass
- run.scheduler_analysis
- node.blocked
- run.node_blocked
- node.unblocked
- run.node_unblocked
- safe_point.created
- safe_point.restored
- remediation.spawned
- run.remediation_started
- remediation.resolved
- run.remediation_completed
- Migration rule
- MUST accept both canonical and legacy event names
- MUST normalize to canonical names
- MUST NOT emit legacy names
negative_constraints:
- New storage code MUST NOT emit legacy names.
preserved_contractrefs: []
compatibility_only_notes:
- Legacy scheduler, node, and remediation aliases are accepted only during migration and normalized before projection.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-198 - Scheduler Runtime Redb Projection Keys

```yaml
plan_unit_id: SP-198
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Scheduler runtime redb projections preserve scheduler_pass, blocked_projection, remediation, and safe_point key patterns, while blocked_projection run-scoped keys are superseded by canonical blocked_projection.v1:{project_id}:{node_id} values with blocked reason, family, approval scope, and allowed actions.
gui_related: false
gui_classification_reason: This unit preserves backend scheduler runtime redb projection keys and supersession notes.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: scheduler_runtime_redb_projection_keys
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0113
preserved_exact_tokens:
- scheduler_pass.{run_id}.{scheduler_pass_id}
- blocked_projection.{run_id}.{node_id}.{blocked_sequence}
- remediation.{run_id}.{remediation_root_id}
- safe_point.sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}
- Canonical note
- superseded
- blocked_projection.v1:{project_id}:{node_id}
- blocked_reason_code
- blocked_at
- blocked_family
- approval_scope_key?
- allowed_action_ids[]
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md'
compatibility_only_notes:
- blocked_projection.{run_id}.{node_id}.{blocked_sequence} is superseded by canonical blocked_projection.v1:{project_id}:{node_id}.
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-199 - Attempt-Aware Projection Rules

```yaml
plan_unit_id: SP-199
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Runtime attempt, safe-point, and queue analysis projections persist scheduler/recovery state without SQLite, resolve run-graph/orchestrator projections by attempt_id, preserve latest blocked state after restart, preserve ready_since_utc during continuous readiness, and keep stale replan_generation attempts queryable but not resumable.
gui_related: false
gui_classification_reason: This unit preserves backend attempt-aware projection and stale attempt rules.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: attempt_aware_projection_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0114
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0115
preserved_exact_tokens:
- Runtime Attempt / Safe Point / Queue Analysis Storage Addendum (2026-03-09)
- without SQLite
- Projection rules
- run-graph
- orchestrator projections
- attempt_id
- node_id
- latest blocked state
- app restart
- ready_since_utc
- continuously ready
- stale attempts
- older replan_generation
- queryable for history
- may not be resumed as active work
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- stale attempts from an older replan_generation remain queryable for history but may not be resumed as active work.
owner_hints:
- Plans/storage-plan.md
```

### SP-200 - Safe-Point Queue Analysis Persistence Safety

```yaml
plan_unit_id: SP-200
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Persistence safety requires safe-point metadata before mutation-capable attempt execution, explicit local-work-preserved blocked outcomes, and append-only queue-analysis observability data whose canonical pass history remains reconstructable even if later projections summarize it.
gui_related: false
gui_classification_reason: This unit preserves backend safe-point and queue-analysis persistence safety.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: safe_point_queue_analysis_persistence_safety
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0116
preserved_exact_tokens:
- Persistence safety rules
- safe-point metadata
- before mutation-capable attempt execution begins
- local-work-preserved blocked outcomes
- represented explicitly
- not inferred from missing failure rows
- queue-analysis records
- append-only observability data
- later projections may summarize
- canonical pass history
- reconstructable
negative_constraints:
- Local-work-preserved blocked outcomes must be represented explicitly, not inferred from missing failure rows.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-201 - Attempt Counter Semantics And Snapshot Lineage

```yaml
plan_unit_id: SP-201
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Attempt counter semantics preserve attempt_count as ground truth, retry_count as derived display data, additive sub-counter decomposition, immutable attempt snapshots for permission/auth/approval/safe-point/revalidation changes, and lineage joins through attempt_id and immutable snapshots.
gui_related: false
gui_classification_reason: This unit preserves backend attempt counter and immutable snapshot lineage semantics.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: attempt_counter_semantics_and_snapshot_lineage
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0117
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0118
preserved_exact_tokens:
- Runtime Attempt / Safe Point / Queue Analysis Canonical Alignment (2026-03-09)
- without ambiguity
- Counter semantics
- attempt_count
- ground-truth count
- started attempts
- retry_count
- derived display data only
- max(attempt_count - 1, 0)
- sub-counter decomposition
- initial_attempts
- retry_attempts
- resume_attempts
- remediation_retry_attempts
- permission, auth, approval, safe-point, or revalidation changes
- new attempt snapshots/records
- do not mutate prior attempt counters in place
- attempt_id
- immutable attempt snapshot
negative_constraints:
- permission, auth, approval, safe-point, or revalidation changes produce new attempt snapshots/records; they do not mutate prior attempt counters in place.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Permissions_System.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-202 - Runtime Projection Historical State

```yaml
plan_unit_id: SP-202
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Runtime projection historical state requires run-graph/orchestrator projections to resolve by attempt_id, preserves blocked projections as historical after resolution, keeps ready_since_utc only while continuously ready, and labels older-generation attempts stale and never resumable.
gui_related: false
gui_classification_reason: This unit preserves backend runtime projection historical state rules.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: runtime_projection_historical_state
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0118
preserved_exact_tokens:
- run-graph and orchestrator projections
- attempt_id
- not only node_id
- blocked projections remain historical after resolution
- unblocking does not overwrite prior blocked rows
- ready_since_utc
- continuously ready
- older generations
- stale
- never resumable
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: Plans/Widget_System.md#2. Hostability and data contracts, Plans/FinalGUISpec.md#10.6 Blocked and recovery surfaces'
compatibility_only_notes: []
stale_retired_dispositions:
- attempts from older generations remain queryable but are labeled stale and are never resumable.
owner_hints:
- Plans/storage-plan.md
```

### SP-203 - Projection Freshness Health Fallback Surface

```yaml
plan_unit_id: SP-203
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Projection trust metadata exposes freshness, health, projection time, lag, degraded reason, fallback policy, runtime_artifact terms, labels, direct-record degradation, and action gating before mutation actions.
gui_related: true
gui_classification_reason: This unit preserves user-visible projection freshness/health/fallback labels and backend trust fields.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: projection_freshness_health_fallback_surface
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0118
preserved_exact_tokens:
- projection_freshness
- projection_health
- last_projected_at_utc
- projector_lag
- degraded_reason_code
- fallback_policy
- runtime_artifact.*
- projection freshness
- projection health
- fallback
- Projection freshness is not the same thing as action authority
- Projection-backed surfaces
- direct-record views
- trust drops
- Runtime-artifact projections
- canonical seglog events
- Permission carry-through
- action gating
- mutation actions
negative_constraints:
- Projection freshness is not the same thing as action authority.
- Action gating must respect projection trust before surfacing mutation actions.
preserved_contractrefs:
- 'ContractRef: Plans/Widget_System.md#2. Hostability and data contracts, Plans/FinalGUISpec.md#10.6 Blocked and recovery surfaces'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-204 - Attempt Snapshot Refresh Rules

```yaml
plan_unit_id: SP-204
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Snapshot refresh creates new attempt snapshots when permission, auth, approval, or replan resolution changes, and safe-point restore creates a new attempt record tied back by lineage rather than mutating the originating attempt.
gui_related: false
gui_classification_reason: This unit preserves backend attempt snapshot refresh and restore lineage rules.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: attempt_snapshot_refresh_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0119
preserved_exact_tokens:
- Snapshot refresh rules
- permission/auth/approval/replan resolution
- new attempt snapshot
- old attempt snapshots remain immutable
- safe-point restore
- does not mutate the originating attempt record in place
- new attempt record
- tied back by lineage
negative_constraints:
- Safe-point restore does not mutate the originating attempt record in place.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-205 - Restart Historical Archived Removed Records

```yaml
plan_unit_id: SP-205
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Runtime recovery restart history preserves historical, archived, removed, projection freshness/health, lineage refs, worktree/lane ids, owner ids, last seen time, and rules that keep historical/archived/removed distinct while missing worktrees or lanes remain historically inspectable.
gui_related: false
gui_classification_reason: This unit preserves backend restart history and stale historical record semantics.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: restart_historical_archived_removed_records
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0120
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0121
preserved_exact_tokens:
- Runtime Recovery Persistence and Restart Canonical Alignment (2026-03-09)
- Restart and stale history
- historical
- archived
- removed
- projection_freshness
- projection_health
- historical_lineage_refs[]
- worktree_id
- lane_id
- last_seen_at_utc
- owner_run_id
- owner_attempt_id
- Restart and cleanup
- distinct
- Missing live worktrees or lanes
- historically inspectable
- Projection trust
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Restart and stale history remains an explicit historical record family.
owner_hints:
- Plans/storage-plan.md
```

### SP-206 - Permission Snapshot Storage Binding

```yaml
plan_unit_id: SP-206
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Permission snapshot storage binds durable permission_snapshot_record keys to immutable attempt_record.permission_snapshot_id references while Permissions_System owns schema/enums/surfaces; storage may cache query fields but must not redefine nested snapshot schema locally.
gui_related: false
gui_classification_reason: This unit preserves backend permission snapshot storage binding and owner boundary.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: permission_snapshot_storage_binding
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0122
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0123
preserved_exact_tokens:
- Permission Snapshot Storage and Safe-Point Namespace Addendum
- Permission snapshot storage
- Plans/storage-plan.md owns only the durable storage binding
- Plans/Permissions_System.md owns the snapshot schema
- enums
- approval-surface expectations
- blocked-action semantics
- permission_snapshot_record.v1:{project_id}:{snapshot_id}
- attempt_record.permission_snapshot_id
- blocked_family
- approval_scope_key
- approval_target_ref
- revalidation_required
- snapshot record
- durable/dispatchable
- immutable after creation
- Snapshot retention
- owner-doc schema
- competing schema copy
negative_constraints:
- projector/query fields MUST NOT redefine the nested snapshot schema locally.
- storage-plan MUST reference the owner-doc schema instead of embedding a competing schema copy.
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/Executor_Protocol.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-207 - Safe-Point Restore-Point Namespace Separation

```yaml
plan_unit_id: SP-207
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Safe points and restore points use distinct prefixes, with sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id} for runtime-internal run/node/attempt scope and rp:{project_id}:{restore_point_id} for user-facing project scope; namespaces and queries must not overlap.
gui_related: false
gui_classification_reason: This unit preserves backend safe-point versus restore-point namespace separation.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: safe_point_restore_point_namespace_separation
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0124
preserved_exact_tokens:
- Safe-point vs restore-point namespace separation
- Safe point
- sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}
- Runtime-internal
- run/node/attempt
- Restore point
- rp:{project_id}:{restore_point_id}
- User-facing
- project
- MUST NOT overlap
- 'sp: prefix'
- 'rp: prefix'
negative_constraints:
- Safe-point and restore-point namespaces MUST NOT overlap.
- 'Queries for safe points MUST use sp: and queries for restore points MUST use rp:.'
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/newfeatures.md, ContractName:Plans/Contracts_V0.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-208 - Assistant Worktree Binding Owner Boundary

```yaml
plan_unit_id: SP-208
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Assistant worktree binding storage preserves Source Control as the Git/worktree owner, references the live Orchestrator_Page Source Control boundary instead of a stale numbered anchor, and keeps worktree-binding persistence worktree-first when handing off to Source Control.
gui_related: false
gui_classification_reason: This unit preserves backend Source Control owner boundary and stale-anchor disposition.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: assistant_worktree_binding_owner_boundary
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0125
preserved_exact_tokens:
- Assistant Worktree Binding Storage Addendum
- Source Control remains the Git/worktree owner surface
- Plans/Orchestrator_Page.md#Source Control boundary
- stale numbered anchor
- Worktree-binding persistence
- worktree-first
- hands off to Source Control
negative_constraints: []
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions:
- Storage projections reference the live Plans/Orchestrator_Page.md#Source Control boundary rather than the stale numbered anchor.
owner_hints:
- Plans/storage-plan.md
```

### SP-209 - Web Cache Owner Contract And Core Routing

```yaml
plan_unit_id: SP-209
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Web content cache persistence consumes the linked owner contract, preserving two-phase lookup, state vocabulary, per-project 500 MB cache sizing, action skip/read-time behavior, PM-cache precedence, Firecrawl latency-only role, and diff-reuse audit states.
gui_related: true
gui_classification_reason: This unit preserves user-visible web cache routing/cache-state behavior.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: web_cache_owner_contract_and_core_routing
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0126
preserved_exact_tokens:
- Web content caching persistence
- linked owner contract
- PM-owned web cache contract
- two-phase lookup
- state vocabulary
- per-project cache sizing
- requests with actions
- post-action result
- PM-cache precedence
- Firecrawl cache
- diff-reuse audit states
- per-project
- 500 MB
- per-operation TTL defaults
- LRU eviction
- bounded storage
- stable cache key ordering
- change_tracking
negative_constraints:
- Cache routing must skip read-time cache for requests with actions.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-210 - Web Cache Entry Schema Budget Eviction

```yaml
plan_unit_id: SP-210
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Web cache entries store cache_key, normalized URL, formats, adapter_id, content hash/ref pointer, metadata, fetched/expires/access fields, 500 MB budget, TTL, LRU, per-project/per-operation scope, cache key ordering, and change detection persistence without inlining cached content.
gui_related: false
gui_classification_reason: This unit preserves backend web cache entry schema, budget, and eviction fields.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: web_cache_entry_schema_budget_eviction
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0126
preserved_exact_tokens:
- 'cache_key: string'
- hash of (url, formats, adapter_id)
- 'url: string'
- normalized URL
- 'formats_requested: string[]'
- adapter_id
- content_hash
- 'content_ref: string'
- pointer to cached content (not inline)
- metadata
- title?
- status_code
- content_type
- content_length
- fetched_at
- ISO time
- expires_at
- TTL
- access_count
- last_accessed_at
- 500 MB
- LRU
- per-project
- per-operation
- cache key ordering
- change detection persistence
negative_constraints:
- content_ref is a pointer to cached content and not inline content.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-211 - Web Cache Lookup Bypass Hit Rules

```yaml
plan_unit_id: SP-211
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Web cache lookup is adapter-agnostic and action-free at read time, validates adapter_id after provider selection, always fresh-executes requests with actions while still allowing post-action store, records bypass when max_age_seconds is 0 or store is false, serves hit only within TTL and absent actions/adapter mismatch, and preserves exact cache_state enum values.
gui_related: true
gui_classification_reason: This unit preserves user-visible cache hit/bypass state and backend lookup rules.
split_recommended: true
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: web_cache_lookup_bypass_hit_rules
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0126
preserved_exact_tokens:
- Cache lookup
- adapter-agnostic
- action-free at read time
- (url, formats_hash)
- adapter_id
- actions
- always fresh-execute
- Cache STORE
- post-action content
- 'cache_policy.max_age_seconds: 0'
- 'cache_policy.store: false'
- 'cache_state: "bypassed"'
- 'cache_state: "hit"'
- skip provider execution
- post-selection adapter_id validation fails
- PM cache takes precedence
- Firecrawl cache serves as provider-side /latency optimization only
- 'cache_state: "hit" | "miss" | "bypassed" | "expired_used_for_diff"'
negative_constraints:
- Cache lookup only applies to action-free requests.
- Firecrawl cache is provider-side latency optimization only.
preserved_contractrefs: []
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-212 - Storage Batch Owner Consumer Boundary Map

```yaml
plan_unit_id: SP-212
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The owner/consumer map keeps storage-plan as the owner doc for preserved behavior while cross-doc ownership follows ContractRefs and boundary notes from original text and the Plan Document System/Bootstrap Planning Migration contracts.
gui_related: false
gui_classification_reason: This unit preserves backend plan ownership and migration boundary metadata.
split_recommended: false
depends_on:
- PDS-003
- PDS-004
- PDS-005
- PNC-001
unblocks: []
acceptance_criteria:
- This Storage Plan PlanUnit remains addressable with source-span coverage for batch 179.
- ContractRefs, anchors or aliases, exact tokens, negative constraints, compatibility notes, stale/retired dispositions, owner boundaries, and source lineage from the source span remain preserved.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: storage_plan_drift
reasoning_tier: standard
context_scope: storage_batch_179_body_tail
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: storage_batch_owner_consumer_boundary_map
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0127
preserved_exact_tokens:
- Owner / Consumer Map
- source-preserving standardization
- owner and consumer boundaries
- Plans/storage-plan.md
- owner doc
- preserved sections
- cross-doc ownership
- ContractRefs
- boundary notes
- original text
negative_constraints: []
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Plan_Document_System.md, ContractName:Plans/Bootstrap_Planning_Migration.md'
compatibility_only_notes: []
stale_retired_dispositions: []
owner_hints:
- Plans/storage-plan.md
```

### SP-001 - Storage Plan Generated Artifact Residual

```yaml
plan_unit_id: SP-001
unit_type: compatibility_disposition
status: retired
owner_doc: Plans/storage-plan.md
canonical_text: >-
  SP-001 is retired as active source-preserving product coverage after Phase 2B batch 180. storage-plan-S0001 through S0127 are covered by fine-grained SP-002 through SP-212 or explicit split coverage, while storage-plan-S0128 through S0130 are generated PlanUnits and Migration Coverage audit material. SP-001 remains only a generated-artifact residual for migration lineage and must not override implementation-facing Storage Plan units.
gui_related: true
gui_classification_reason: >-
  The retired generated residual preserves GUI-bearing historical bridge metadata from storage-plan-S0129, but the live SP-001 disposition is migration/audit lineage rather than product GUI coverage.
split_recommended: false
depends_on: [PDS-003, PDS-004, PDS-010]
unblocks: []
acceptance_criteria:
  - storage-plan-S0001 through S0127 remain mapped to fine-grained Storage Plan PlanUnits rather than SP-001.
  - storage-plan-S0128 through S0130 remain available as generated PlanUnits and Migration Coverage audit material only.
  - SP-001 no longer uses node_compile_hint.mode source_preserving_planunit; that token is preserved only as migration lineage.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, production build tasks, implementation files, or source code are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: residual_bridge_overreach
reasoning_tier: standard
context_scope: storage_generated_residual_tail
implementation_surfaces:
  - Plans/storage-plan.md
node_compile_hint:
  mode: generated_artifact_residual
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0128
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0129
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:storage-plan-S0130
preserved_exact_tokens:
  - PlanUnits
  - Migration Coverage
  - source_preserving_planunit
  - "SP-001 - Storage plan (seglog, redb, Tantivy, projectors) Source-Preserving PlanUnit"
  - generated_artifact_residual
negative_constraints:
  - SP-001 must not provide product implementation coverage for storage-plan-S0001 through S0127 after Phase 2B batch 180.
  - SP-001 must not override SP-002 through SP-212 or later structural dispositions.
preserved_contractrefs:
  - Generated PlanUnits and Migration Coverage material remain preserved by span_map and coverage_map as migration-lineage audit material.
compatibility_only_notes:
  - The source_preserving_planunit token is preserved only as retired migration lineage and not as an active node_compile_hint mode.
  - The old storage-plan SP-001 bridge title is a compatibility alias for audit and search only.
stale_retired_dispositions:
  - The former SP-001 source-preserving bridge is retired as active product coverage; product coverage lives in SP-002 through SP-212 and coverage_map rows.
  - Generated storage-plan-S0128 through storage-plan-S0130 are not product implementation canon.
owner_hints:
  - Plans/storage-plan.md
```
