# Shard 022: PlanUnits

Source: `Plans/Contracts_V0.md`

Source lines: L3009-L3390

Source SHA256: `8c7a1cfb06b9002436190af12a1dcdccdc2913bbb7c6ffe13118bc081fa33613`

---

## PlanUnits

### CV-002 - Contracts V0 Cross-Cutting Contract SSOT

```yaml
plan_unit_id: CV-002
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Plans/Contracts_V0.md is the SSOT for cross-cutting contracts including
  EventRecord, schema pm.event.v0, EventEnvelopeV1, provider normalized stream,
  UICommand, AuthState, AuthPolicy, and AuthEvent; other plans MUST reference
  these contracts rather than redefining them.
gui_related: true
gui_classification_reason: UICommand and auth state/events are user-facing command and authentication contracts, even though the unit is primarily cross-cutting schema ownership.
split_recommended: true
split_recommendation_reason: Source spans S0020 and S0021 contain compliance/source-purpose text and scope declarations; S0001 also has source-token bank material that remains residual.
depends_on: []
unblocks: [CV-003, CV-006]
acceptance_criteria:
  - Contracts_V0 remains the single source for the listed cross-cutting contract families.
  - Other plans reference these contracts instead of redefining them.
  - EventEnvelopeV1 remains marked as a minimal compatibility envelope for early-phase writers/readers.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: contract_ssot_drift
reasoning_tier: high
context_scope: contracts_v0_ssot
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: contract_owner_ssot
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0020
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0021
preserved_exact_tokens:
  - "Puppet Master"
  - "Contracts V0 (Canonical)"
  - "`EventRecord`"
  - "`pm.event.v0`"
  - "`EventEnvelopeV1`"
  - "`UICommand`"
  - "`AuthState`"
  - "`AuthPolicy`"
  - "`AuthEvent`"
  - "Other plans MUST reference these contracts rather than redefining them."
compatibility_only_notes:
  - "EventEnvelopeV1 is a minimal compatibility envelope for early-phase writers/readers."
negative_constraints:
  - "Other plans must not redefine the cross-cutting contract families owned here."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-003 - Cross-Surface Runtime Concern Route Owner Boundary

```yaml
plan_unit_id: CV-003
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Plans/Contracts_V0.md is the single canonical owner for runtime identity,
  concern/episode lifecycle, route_target primitives, and OpenSubject routing
  semantics across all surfaces and execution contexts.
gui_related: false
gui_classification_reason: This unit defines cross-surface ownership of runtime and routing primitives rather than a concrete visual surface.
split_recommended: false
depends_on: [CV-002]
unblocks: [CV-004, CV-005, CV-006]
acceptance_criteria:
  - Runtime identity, concern/episode lifecycle, route_target primitives, and OpenSubject routing semantics resolve to Contracts_V0.
  - Consumers across surfaces and execution contexts do not create alternate owners for these primitives.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_boundary_drift
reasoning_tier: high
context_scope: runtime_concern_route_owner_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_boundary_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0022
preserved_exact_tokens:
  - "runtime identity"
  - "concern/episode lifecycle"
  - "`route_target`"
  - "`OpenSubject`"
  - "all surfaces"
  - "execution contexts"
negative_constraints:
  - "Consumer surfaces must not own alternate runtime identity, concern, route_target, or OpenSubject semantics."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-004 - Owner-First Canonicalization Sequence

```yaml
plan_unit_id: CV-004
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Canonicalization proceeds owner repairs first, dependent consumer updates
  second, mirror cleanup third, and final verification last; Crosswalk.md,
  DRY_Rules.md, and Decision_Log.md stay ordered when touched, and partial
  reviewer slices do not close coverage until reconciled.
gui_related: false
gui_classification_reason: This is a governance sequencing constraint rather than GUI behavior.
split_recommended: true
split_recommendation_reason: Source span S0003 is a heading-only owner-section alias while S0023 carries the detailed canonicalization sequence.
depends_on: [CV-003]
unblocks: []
acceptance_criteria:
  - Owner repairs precede dependent consumer updates.
  - Mirror cleanup precedes final verification evidence.
  - Crosswalk.md, DRY_Rules.md, and Decision_Log.md preserve their ordered integrity stack when touched.
  - Partial reviewer slices must be reconciled before declaring coverage closure.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: canonicalization_false_closure
reasoning_tier: high
context_scope: owner_first_canonicalization
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Crosswalk.md
  - Plans/DRY_Rules.md
  - Plans/Decision_Log.md
node_compile_hint:
  mode: canonicalization_sequence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0003
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0023
preserved_exact_tokens:
  - "owner-doc corrections"
  - "consumer"
  - "mirror cleanup"
  - "final verification evidence"
  - "`Crosswalk.md`"
  - "`DRY_Rules.md`"
  - "`Decision_Log.md`"
  - "`re-check`"
  - "`/consumer`"
stale_retired_dispositions:
  - "stale-residue retirement remains owner-first."
negative_constraints:
  - "A cleared partial reviewer slice must not be treated as full coverage closure until reconciled."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Crosswalk.md
  - Plans/DRY_Rules.md
  - Plans/Decision_Log.md
```

### CV-005 - Route Open Compatibility Fallback Disposition

```yaml
plan_unit_id: CV-005
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Compatibility-only source vocabulary is noncanonical; route/open fallback
  notes remain lineage or lookup metadata while live route/open auditing focuses
  on refinement omissions after RouteTarget and OpenSubject primitives have
  landed, and view-state fields stay outside base route identity.
gui_related: false
gui_classification_reason: This unit is a route/open compatibility and ownership disposition rather than visible layout.
split_recommended: true
split_recommendation_reason: Source span S0001 contains a large token bank; this unit only covers route/open compatibility and view-state ownership tokens from that span plus S0004 and S0018.
depends_on: [CV-003]
unblocks: []
acceptance_criteria:
  - Compatibility-only source vocabulary is treated as noncanonical.
  - Route/open fallback notes are lineage or lookup metadata, not peer canonical route identity.
  - Route/open audits focus on refinement omissions after RouteTarget and OpenSubject primitives have landed.
  - View-state fields remain outside base route identity.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: compatibility_route_drift
reasoning_tier: high
context_scope: route_open_compatibility_fallback
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: compatibility_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0001
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0004
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0018
preserved_exact_tokens:
  - "ContractRef: ContractName:Plans/Contracts_V0.md, Primitive:RouteTarget, Primitive:OpenSubject"
  - "`allowed_actions[]`"
  - "`active_subview`"
  - "filters"
  - "compare targets"
  - "pinned selections"
  - "`navigation_wrapper`"
  - "`domain_action`"
  - "Base route/open primitives landed"
  - "refinement omissions"
compatibility_only_notes:
  - "Compatibility-only source vocabulary is noncanonical."
negative_constraints:
  - "Route/open auditing must not re-claim absence of primitives that already landed."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-006 - Shared Governance Runtime Record Envelope Fields

```yaml
plan_unit_id: CV-006
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Shared governance/runtime records carry the required record envelope and actor
  envelope fields, including identity, project scope, lineage refs, status
  timestamps, and attributable actor/runtime role fields.
gui_related: false
gui_classification_reason: This unit defines persisted record envelope fields rather than UI presentation.
split_recommended: true
split_recommendation_reason: Source span S0024 covers several envelope, identity, attribution, temporal, and storage-owner concerns split across CV-006 through CV-010.
depends_on: [CV-002, CV-003]
unblocks: [CV-007, CV-008, CV-009, CV-010]
acceptance_criteria:
  - Shared records include the required record identity, project, lineage, artifact, evidence, supersession, status, and timestamp fields.
  - Attributable record actions include the shared actor envelope fields.
  - Actor runtime role is carried through execution_role when relevant.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: envelope_schema_drift
reasoning_tier: high
context_scope: shared_governance_runtime_envelope
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: shared_record_envelope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0024
preserved_exact_tokens:
  - "`record_id`"
  - "`record_kind`"
  - "`project_id`"
  - "`scope_ref?`"
  - "`source_refs[]?`"
  - "`artifact_refs[]?`"
  - "`evidence_refs[]?`"
  - "`supersedes_record_id?`"
  - "`superseded_by_record_id?`"
  - "`status`"
  - "`created_at_utc`"
  - "`updated_at_utc?`"
  - "`actor_kind`"
  - "`actor_ref?`"
  - "`execution_role?`"
negative_constraints:
  - "Shared records must not drop lineage, status, timestamp, or actor attribution fields."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-007 - Record Object Identity And Payload Specialization

```yaml
plan_unit_id: CV-007
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Record objects stay distinct from artifacts, receipts, rendered summaries, and
  process reports; first-class object families reuse the shared envelope, and
  family-specific payloads specialize underneath it rather than inventing
  one-off top-level shapes.
gui_related: false
gui_classification_reason: This is a persisted object identity and schema-shape constraint.
split_recommended: true
split_recommendation_reason: Source span S0024 mixes record identity, family payload specialization, status vocabulary, temporal fields, and storage ownership.
depends_on: [CV-006]
unblocks: [CV-008]
acceptance_criteria:
  - Record IDs and kinds are not artifact IDs, receipt IDs, rendered summary IDs, or process report IDs.
  - First-class object families reuse the shared envelope.
  - Family-specific payload fields specialize under the shared envelope rather than becoming one-off top-level shapes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: record_identity_drift
reasoning_tier: high
context_scope: record_identity_payload_specialization
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: record_identity_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0024
preserved_exact_tokens:
  - "`feature_seam`"
  - "`work_package`"
  - "`lane`"
  - "`promotion`"
  - "`review`"
  - "`resolution_thread`"
  - "`concern`"
  - "`graph_patch`"
  - "`worktree`"
negative_constraints:
  - "Family-specific payloads must not invent one-off top-level shapes."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-008 - Shared Attribution Historical Status Boundary

```yaml
plan_unit_id: CV-008
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts own the shared attribution packet and historical/status vocabulary,
  while storage-plan owns persistence and projection of attempt, usage, receipt,
  and artifact joins; family-local workflow states remain distinct.
gui_related: false
gui_classification_reason: Attribution packets and status vocabulary define runtime/storage contracts rather than visual presentation.
split_recommended: true
split_recommendation_reason: Source span S0024 combines attribution ownership, historical vocabulary, and storage persistence ownership.
depends_on: [CV-006, CV-007]
unblocks: []
acceptance_criteria:
  - Historical/status vocabulary remains shared and canonical.
  - Family-local workflow states remain distinct from shared historical vocabulary.
  - Contracts own the attribution packet shape while storage-plan owns persistence/projection mechanics.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: attribution_join_drift
reasoning_tier: high
context_scope: attribution_status_owner_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: attribution_status_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0024
preserved_exact_tokens:
  - "historical"
  - "stale_historical"
  - "superseded"
  - "revoked"
  - "reopened"
  - "archived"
  - "removed"
  - "`remediation.resolved`"
  - "run/attempt/thread/node/artifact/provider/usage anchors"
  - "execution/runtime identity"
  - "storage-plan"
stale_retired_dispositions:
  - "Historical/status stale markers remain disposition metadata rather than deleted source lineage."
negative_constraints:
  - "Storage persistence and projection mechanics must not be re-owned by Contracts_V0."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```
