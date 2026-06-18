# Shard 018: PlanUnits

Source: `Plans/Contracts_V0.md`

Source lines: L2546-L16721

Source SHA256: `e0d2b0c4a3a0991e44741c1602e54681bb6faef0eececa78b3f149405c9eb09b`

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

### CV-009 - Temporal Wait Timeout Recovery Envelope Fields

```yaml
plan_unit_id: CV-009
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Temporal records affecting receipts, blocked states, stream sessions, or
  recovery carry typed wait, timeout, observation, timer, and retention-anchor
  fields in the shared envelope rather than hiding them in rendered summaries.
gui_related: false
gui_classification_reason: This unit defines typed runtime/envelope fields, not UI layout.
split_recommended: true
split_recommendation_reason: Source span S0024 joins temporal fields with record identity, attribution, and storage-owner boundaries.
depends_on: [CV-006]
unblocks: [CV-010]
acceptance_criteria:
  - Receipt, blocked-state, stream-session, and recovery records can carry typed wait and timeout fields.
  - Observation, timer, and retention anchor details remain typed envelope fields when applicable.
  - Rendered summaries do not become the only place wait/timeout facts exist.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_timeout_recovery_drift
reasoning_tier: high
context_scope: temporal_recovery_envelope_fields
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: temporal_envelope_fields
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0024
preserved_exact_tokens:
  - "`timeout_class?`"
  - "`wait_state_class?`"
  - "`observation_state?`"
  - "`source_timer_ref?`"
  - "`retention_anchor_kind?`"
  - "`retention_anchor_at_utc?`"
negative_constraints:
  - "Typed wait and timeout facts must not be buried only in rendered summaries."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-010 - Storage-Owned Runtime Persistence Boundary

```yaml
plan_unit_id: CV-010
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  storage-plan owns persistence mechanics for crash-critical active
  receipt/session lifecycle, blocked episode creation/resolution, follow-mode
  intent, last inspected run/node/log context, and retention anchors; Contracts
  preserves the shared envelope and owner boundary.
gui_related: false
gui_classification_reason: This is a storage owner boundary and persistence mechanics constraint.
split_recommended: true
split_recommendation_reason: Source span S0024 includes storage persistence mechanics while Contracts only owns the shared envelope.
depends_on: [CV-006, CV-009]
unblocks: []
acceptance_criteria:
  - storage-plan owns the listed persistence mechanics.
  - Contracts_V0 preserves envelope fields and owner boundary without re-owning storage implementation.
  - Crash-critical receipt/session lifecycle and retention anchors remain explicitly routed to storage-plan.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: storage_owner_drift
reasoning_tier: high
context_scope: storage_owned_runtime_persistence
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: storage_owner_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0024
preserved_exact_tokens:
  - "crash-critical active receipt/session lifecycle"
  - "blocked episode creation/resolution"
  - "follow-mode intent"
  - "last inspected run/node/log context"
  - "receipts"
  - "log tails"
  - "watch buffers"
  - "explorer snapshots"
  - "stale caches"
stale_retired_dispositions:
  - "Stale cache retention anchor language is preserved as storage-owner boundary evidence, not a Contracts-owned persistence schema."
negative_constraints:
  - "Contracts_V0 must not become the owner of storage-plan persistence mechanics."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### CV-011 - RuntimeIdentity Owner ContractRefs

```yaml
plan_unit_id: CV-011
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Requested/effective account and execution identity resolves through the
  shared RuntimeIdentity primitive, with Plans/Executor_Protocol.md and
  Plans/Permissions_System.md as referenced companion and consumer contracts.
gui_related: false
gui_classification_reason: This unit defines owner ContractRefs for runtime identity rather than visible UI behavior.
split_recommended: false
depends_on: [CV-003, CV-006]
unblocks: [CV-012, CV-013, CV-014, CV-015, CV-016, CV-017, CV-018, CV-019, CV-020, CV-021, CV-022]
acceptance_criteria:
  - Requested/effective account and execution identity resolves through RuntimeIdentity.
  - Executor Protocol and Permissions System remain referenced companion/consumer contracts.
  - The RuntimeIdentity ContractRef stays attached to the requested/effective account and execution identity owner section.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_identity_owner_drift
reasoning_tier: high
context_scope: runtime_identity_owner_contractrefs
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/Permissions_System.md
node_compile_hint:
  mode: runtime_identity_owner_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0025
preserved_exact_tokens:
  - "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/Permissions_System.md, Primitive:RuntimeIdentity"
  - "`RuntimeIdentity`"
negative_constraints:
  - "Requested/effective account and execution identity must not be split away from RuntimeIdentity owner references."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/Permissions_System.md
```

### CV-012 - Persona Runtime Field Names And Alias Retirement

```yaml
plan_unit_id: CV-012
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Shared runtime identity preserves requested_persona and effective_persona as
  persisted canonical fields; requested_persona_id and effective_persona_id are
  retired canonical names and may survive only as migration/source-lineage
  aliases.
gui_related: false
gui_classification_reason: This unit is a runtime identity field-name and migration-alias disposition.
split_recommended: false
depends_on: [CV-011]
unblocks: [CV-015]
acceptance_criteria:
  - requested_persona and effective_persona remain canonical persisted runtime identity fields.
  - requested_persona_id and effective_persona_id are retired from canonical contracts.
  - Retired _id variants may survive only as migration/source-lineage aliases.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_field_name_drift
reasoning_tier: high
context_scope: persona_runtime_field_names
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: compatibility_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0026
preserved_exact_tokens:
  - "`requested_persona`"
  - "`effective_persona`"
  - "`requested_persona_id`"
  - "`effective_persona_id`"
  - "`_id` variants"
  - "migration/source-lineage aliases"
stale_retired_dispositions:
  - "`requested_persona_id` and `effective_persona_id` are retired canonical names."
negative_constraints:
  - "`_id` variants must not be revived as canonical runtime identity fields."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-013 - Requested Account Anchor Policy Binding Split

```yaml
plan_unit_id: CV-013
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Runtime identity carries requested_account_id as the explicit requested
  account anchor, models it separately from requested_account_policy, and uses
  requested_account_binding with none | preferred | required semantics.
gui_related: false
gui_classification_reason: This unit defines runtime identity field semantics rather than visual presentation.
split_recommended: false
depends_on: [CV-011]
unblocks: [CV-014, CV-015, CV-017, CV-019, CV-020]
acceptance_criteria:
  - requested_account_id is the explicit requested account anchor.
  - requested_account_policy remains separate from requested_account_id.
  - requested_account_binding preserves none | preferred | required semantics.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: requested_account_identity_drift
reasoning_tier: high
context_scope: requested_account_binding_split
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: runtime_identity_field_split
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0026
preserved_exact_tokens:
  - "`requested_account_id`"
  - "`requested_account_policy`"
  - "`requested_account_binding`"
  - "`none | preferred | required`"
  - "ContractRef: Primitive:RuntimeIdentity"
  - "ContractRef: ContractName:Plans/Contracts_V0.md"
negative_constraints:
  - "`requested_account_policy` MUST NOT replace the concrete requested account field."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-014 - Effective Account And Provider Metadata Boundary

```yaml
plan_unit_id: CV-014
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Runtime identity discloses effective_account_id and effective_provider_identity
  without rewriting the requested selection; provider_account_id is retired as
  canonical/live vocabulary and remains only subordinate provider-native
  metadata inside bridged-provider envelopes.
gui_related: false
gui_classification_reason: This unit defines runtime identity and provider metadata boundaries.
split_recommended: false
depends_on: [CV-013]
unblocks: [CV-015, CV-017, CV-019, CV-020]
acceptance_criteria:
  - effective_account_id and effective_provider_identity disclose resolved identity without rewriting the requested selection.
  - provider_account_id is retired as canonical/live identity vocabulary.
  - provider_account_id may survive only as subordinate provider-native metadata inside bridged-provider envelopes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_identity_collapse
reasoning_tier: high
context_scope: effective_account_provider_metadata_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: compatibility_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0026
preserved_exact_tokens:
  - "`effective_account_id`"
  - "`effective_provider_identity`"
  - "`provider_account_id`"
  - "bridged-provider"
stale_retired_dispositions:
  - "`provider_account_id` is retired as canonical/live identity vocabulary."
negative_constraints:
  - "`provider_account_id` must not be canonical/live identity vocabulary."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-015 - Requested Effective Identity Projection Display

```yaml
plan_unit_id: CV-015
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Runtime, effective-resolution, permission, attempt, usage, and inspector
  surfaces project Requested account, Requested binding, Effective account, and
  Switch reason from the same shared runtime identity snapshot, including grouped
  /model/effort/persona/account disclosure where a UI surface needs one label.
gui_related: true
gui_classification_reason: Requested/effective labels and grouped disclosure are user-visible projection and inspector copy.
split_recommended: false
depends_on: [CV-012, CV-013, CV-014, CV-016]
unblocks: []
acceptance_criteria:
  - Runtime, effective-resolution, permission, attempt, usage, and inspector surfaces use the same shared runtime identity snapshot.
  - Requested account, Requested binding, Effective account, and Switch reason labels remain visible where projected.
  - UI surfaces may use grouped /model/effort/persona/account disclosure without losing the underlying requested/effective identity fields.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: identity_projection_display_drift
reasoning_tier: high
context_scope: requested_effective_identity_projection
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: runtime_identity_projection
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0026
preserved_exact_tokens:
  - "Requested account"
  - "Requested binding"
  - "Effective account"
  - "Switch reason"
  - "`/model/effort/persona/account`"
  - "effective-resolution"
  - "attempt"
  - "usage"
  - "inspector"
negative_constraints:
  - "Grouped UI disclosure must not collapse the underlying requested/effective identity snapshot."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-016 - Execution Role Operational Identity Attribution

```yaml
plan_unit_id: CV-016
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Shared runtime identity carries execution_role / actor-role with
  requested/effective operational identity so audit, approval, attribution,
  attempt, usage, and inspector joins keep the intent-versus-effective split
  through the shared runtime/governance record envelope.
gui_related: false
gui_classification_reason: This unit defines attribution and runtime/governance envelope identity rather than UI layout.
split_recommended: false
depends_on: [CV-006, CV-011]
unblocks: [CV-015]
acceptance_criteria:
  - Shared runtime identity carries execution_role / actor-role.
  - Requested/effective operational identity remains visible to audit, approval, attribution, attempt, usage, and inspector joins.
  - Actor envelope behavior follows the shared runtime/governance record envelope and is not run-centric.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: operational_identity_attribution_drift
reasoning_tier: high
context_scope: operational_identity_attribution
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: operational_identity_attribution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0026
preserved_exact_tokens:
  - "`execution_role`"
  - "`actor-role`"
  - "operational identity"
  - "intent-versus-effective split"
negative_constraints:
  - "The actor envelope is not `run-centric`."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-017 - Gemini Account Resolution Invariants

```yaml
plan_unit_id: CV-017
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Gemini account resolution uses the same requested-vs-effective identity
  contract and supports multiple API-key accounts and multiple OAuth accounts
  simultaneously; OAuth-backed Gemini entries may require project-context and
  /project quota resolution beyond token presence.
gui_related: false
gui_classification_reason: This unit defines provider/account resolution semantics rather than visible presentation.
split_recommended: false
depends_on: [CV-013, CV-014]
unblocks: [CV-018]
acceptance_criteria:
  - Gemini uses the shared requested-vs-effective identity contract.
  - Gemini can support multiple API-key accounts and multiple OAuth accounts simultaneously.
  - OAuth-backed Gemini entries may require project-context and /project quota resolution beyond token presence.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: gemini_account_resolution_drift
reasoning_tier: high
context_scope: gemini_account_resolution
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: provider_account_resolution
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0026
preserved_exact_tokens:
  - "Gemini"
  - "API-key accounts"
  - "OAuth accounts"
  - "`project-context`"
  - "`/project`"
  - "quota resolution"
negative_constraints:
  - "Token presence alone must not be treated as sufficient when project-context or /project quota resolution is required."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-018 - Gemini Display And Provider Grouping Constraint

```yaml
plan_unit_id: CV-018
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Gemini /model/auth display shorthand preserves account selection, switch
  reason, concrete auth mode, and vs-effective differences; provider grouping
  may expose one Gemini family surface or /provider card but must not mint fake
  API-key/OAuth pseudo-providers.
gui_related: true
gui_classification_reason: /model/auth shorthand, /provider card grouping, and displayed account differences are user-visible provider UI behavior.
split_recommended: false
depends_on: [CV-015, CV-017]
unblocks: []
acceptance_criteria:
  - /model/auth display preserves account selection, switch reason, concrete auth mode, and vs-effective differences.
  - Provider grouping may expose one Gemini family surface or /provider card.
  - Provider grouping does not mint fake API-key/OAuth pseudo-providers.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: gemini_provider_grouping_drift
reasoning_tier: high
context_scope: gemini_display_provider_grouping
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: provider_display_grouping
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0026
preserved_exact_tokens:
  - "`/model/auth`"
  - "`vs-effective`"
  - "`/provider`"
  - "`pseudo-providers`"
negative_constraints:
  - "Gemini provider grouping must not mint fake API-key/OAuth `pseudo-providers`."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-019 - Account Pressure Reset Horizon Fields

```yaml
plan_unit_id: CV-019
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Usage/account pressure that blocks execution carries monthly_plan_or_billing_cycle
  and provider cooldown_until facts in the runtime identity/pressure envelope
  rather than hiding reset horizons in prose.
gui_related: false
gui_classification_reason: This unit defines runtime identity/pressure envelope fields rather than UI layout.
split_recommended: false
depends_on: [CV-013, CV-014]
unblocks: []
acceptance_criteria:
  - Blocking account pressure carries monthly_plan_or_billing_cycle when relevant.
  - Provider cooldown_until facts are carried in the runtime identity/pressure envelope.
  - Reset horizon facts are not hidden only in prose.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: account_pressure_envelope_drift
reasoning_tier: high
context_scope: account_pressure_reset_horizon
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: runtime_pressure_envelope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0026
preserved_exact_tokens:
  - "`monthly_plan_or_billing_cycle`"
  - "`cooldown_until`"
  - "runtime identity/pressure envelope"
negative_constraints:
  - "Reset horizon must not be hidden in prose."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-020 - Provider Family Connection Profile Additive Fields

```yaml
plan_unit_id: CV-020
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  requested_provider_family_id, effective_provider_family_id, and
  connection-profile fields are additive requested/effective runtime fields;
  account-backed subjects keep account terminology, while server/profile-backed
  subjects may add connection-profile fields and OpenCode UI may label
  server-backed configuration as Server Profiles.
gui_related: true
gui_classification_reason: OpenCode UI Server Profiles labeling and account terminology are user-visible provider configuration behavior.
split_recommended: false
depends_on: [CV-013, CV-014]
unblocks: []
acceptance_criteria:
  - requested_provider_family_id and effective_provider_family_id are additive requested/effective runtime fields.
  - Connection-profile fields do not replace account terminology for account-backed subjects.
  - OpenCode UI may label server-backed configuration as Server Profiles.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: account_vocabulary_rename_drift
reasoning_tier: high
context_scope: provider_family_connection_profiles
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: provider_family_connection_profile
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0026
preserved_exact_tokens:
  - "`requested_provider_family_id`"
  - "`effective_provider_family_id`"
  - "connection-profile"
  - "OpenCode UI"
  - "`Server Profiles`"
negative_constraints:
  - "Provider family and connection-profile fields do not replace `requested_account_id`, `effective_account_id`, or account terminology."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-021 - Selectable Unit Resolver Debug Boundary

```yaml
plan_unit_id: CV-021
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  selectable_unit_id is resolver/debug identity for the chosen runtime
  candidate; it may appear as subordinate resolution evidence but MUST NOT
  replace account_id in user-facing copy or persisted canonical auth/routing
  fields.
gui_related: true
gui_classification_reason: This unit constrains user-facing copy while also governing persisted auth/routing fields.
split_recommended: true
split_recommendation_reason: The unit intentionally spans user-facing copy and persisted field constraints.
depends_on: [CV-013, CV-014]
unblocks: []
acceptance_criteria:
  - selectable_unit_id is resolver/debug identity only.
  - selectable_unit_id may appear as subordinate resolution evidence.
  - selectable_unit_id does not replace account_id in user-facing copy or persisted canonical auth/routing fields.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: selectable_unit_identity_leak
reasoning_tier: high
context_scope: selectable_unit_debug_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: resolver_debug_identity_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0026
preserved_exact_tokens:
  - "`selectable_unit_id`"
  - "`account_id`"
  - "`/routing`"
  - "resolver/debug identity"
negative_constraints:
  - "`selectable_unit_id` MUST NOT replace `account_id` in user-facing copy or persisted canonical auth/routing fields."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-022 - Agent Runtime Account Isolation Evidence

```yaml
plan_unit_id: CV-022
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Agent/runtime account isolation uses fresh XDG_ / XDG_* roots where supported;
  CURSOR_USER_DATA_DIR alone is insufficient evidence that a Cursor-backed agent
  account is isolated or that cursor-agent reports a different logged-in
  identity.
gui_related: false
gui_classification_reason: This unit defines runtime account isolation evidence, not GUI behavior.
split_recommended: false
depends_on: [CV-011]
unblocks: []
acceptance_criteria:
  - Fresh XDG_ / XDG_* roots are used for account isolation where supported.
  - CURSOR_USER_DATA_DIR alone is not sufficient evidence of account isolation.
  - cursor-agent reporting a different logged-in identity requires evidence beyond CURSOR_USER_DATA_DIR.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: account_isolation_false_evidence
reasoning_tier: high
context_scope: agent_runtime_account_isolation
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: account_isolation_evidence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0026
preserved_exact_tokens:
  - "`XDG_`"
  - "`XDG_*`"
  - "`CURSOR_USER_DATA_DIR`"
  - "`cursor-agent`"
negative_constraints:
  - "`CURSOR_USER_DATA_DIR` alone is not sufficient evidence."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-023 - Runtime Routing Consumer Anchor Preservation

```yaml
plan_unit_id: CV-023
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Runtime routing and execution consumers retain object-family, lane/package/seam
  execution-model, route_target, UICommand, OpenSubject, blocked-episode, and
  HITL anchors when projecting the shared identity envelope into owner and
  consumer docs.
gui_related: false
gui_classification_reason: This unit defines routing and execution consumer anchors rather than visual presentation.
split_recommended: false
depends_on: [CV-003, CV-011, CV-013, CV-014]
unblocks: []
acceptance_criteria:
  - Runtime routing and execution consumers retain the listed anchors.
  - Shared identity envelope projection into owner and consumer docs does not drop route or blocked-state anchors.
  - Consumers do not substitute incompatible local anchors for the canonical contract anchors.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_route_anchor_drift
reasoning_tier: high
context_scope: runtime_routing_consumer_anchors
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: runtime_route_anchor_preservation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0026
preserved_exact_tokens:
  - "`object-family`"
  - "`execution-model`"
  - "`route_target`"
  - "`UICommand`"
  - "`OpenSubject`"
  - "blocked-episode"
  - "`HITL`"
negative_constraints:
  - "Runtime routing and execution consumers must not drop or substitute these anchors during projection."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-024 - Runtime Lineage Consumer Identity Boundary

```yaml
plan_unit_id: CV-024
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Wizard, interview, Source Control, and worktree handoff payloads consume shared
  runtime identity rather than alternate tier_id = None, interview-phase-*,
  pseudo-tier, stable-branch, base_branch, git-hook, ad hoc state, or
  lineage-thin payloads.
gui_related: false
gui_classification_reason: This unit defines runtime lineage and handoff identity contracts rather than visual presentation.
split_recommended: true
split_recommendation_reason: Source span S0027 is a dense mixed runtime lineage, routing, blocked-state, GUI projection, and compatibility span.
depends_on: [CV-011, CV-016]
unblocks: [CV-039, CV-040]
acceptance_criteria:
  - Wizard, interview, Source Control, and worktree handoffs consume shared runtime identity.
  - The listed tier-era, branch, hook, filesystem, and ad hoc state substitutes remain forbidden as canonical routing keys.
  - Pre-run correction payloads preserve project, report, account, runtime, effective, projection, worktree_record, and worktree_projection lineage.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_lineage_consumer_drift
reasoning_tier: high
context_scope: runtime_lineage_handoff_identity
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: runtime_lineage_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`tier_id = None`"
  - "`interview-phase-*`"
  - "`pseudo-tier`"
  - "`stable-branch`"
  - "`base_branch`"
  - "`git-hook`"
  - "`lineage-thin`"
negative_constraints:
  - "Handoff payloads must not own alternate runtime identity or routing keys."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-025 - Graph Runtime Schema Identity Keys

```yaml
plan_unit_id: CV-025
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Graph and runtime schemas carry explicit node, package, seam, lane, worktree,
  and account IDs before they are used for recovery, promotion, safe-point,
  contamination, or requested /effective execution identity; constants unable to
  express those IDs are compatibility fields only.
gui_related: false
gui_classification_reason: This unit defines schema identity keys and compatibility boundaries.
split_recommended: true
depends_on: [CV-023]
unblocks: [CV-032, CV-045]
acceptance_criteria:
  - Runtime object schemas express node/package/seam/lane/worktree/account identity before recovery or promotion use.
  - Schema constants that cannot express those identities are compatibility fields.
  - Older /node/seam requests normalize to explicit node/package/seam/lane IDs plus /package/seam lineage.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: schema_identity_underkeying
reasoning_tier: high
context_scope: graph_runtime_schema_identity
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/plan_graph.schema.json
  - Plans/project_plan_node.schema.json
  - Plans/project_plan_graph_index.schema.json
node_compile_hint:
  mode: schema_identity_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`/contaminated/restore-required`"
  - "safe-point"
  - "contamination"
  - "promotion"
  - "`/effective`"
  - "`/package/seam`"
compatibility_only_notes:
  - "Constants unable to express package/seam/lane/worktree/account IDs are compatibility fields only."
negative_constraints:
  - "Graph/runtime schemas must not remain node-only or /seam/lane-blind for execution recovery or promotion decisions."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-026 - Runtime Event Snapshot Identity Completeness

```yaml
plan_unit_id: CV-026
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Runtime event rows and EventRecord alignment claims carry project, thread,
  run, attempt, and account identity directly or by complete
  requested_effective_snapshot_ref?; compatibility-era subsets are insufficient.
gui_related: false
gui_classification_reason: This unit defines runtime event and EventRecord identity completeness.
split_recommended: true
depends_on: [CV-006, CV-011]
unblocks: [CV-044, CV-060]
acceptance_criteria:
  - Runtime event rows affecting execution, usage, or recovery carry the shared identity snapshot.
  - EventRecord alignment claims include project/thread/run/attempt/account identity directly or by canonical snapshot reference.
  - requested_effective_snapshot_ref? is valid only when it points to the complete canonical snapshot.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: event_snapshot_drift
reasoning_tier: high
context_scope: runtime_event_snapshot_identity
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: event_snapshot_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`EventRecord`"
  - "`run.started`"
  - "`usage.event`"
  - "`requested_effective_snapshot_ref?`"
  - "`/runtime/auth/account`"
negative_constraints:
  - "Owner docs must not claim runtime alignment while omitting project/thread/run/attempt/account join keys."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-027 - Persona Alias Revival Prohibition

```yaml
plan_unit_id: CV-027
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  requested_persona_id and effective_persona_id are forbidden canonical names
  and survive only as migration aliases to requested_persona and
  effective_persona.
gui_related: false
gui_classification_reason: This unit is a compatibility disposition for runtime identity field names.
split_recommended: false
depends_on: [CV-012]
unblocks: []
acceptance_criteria:
  - requested_persona_id and effective_persona_id are not canonical field names.
  - The alias mapping to requested_persona and effective_persona remains explicit.
  - Consumers do not normatively revive the retired names.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_alias_revival
reasoning_tier: high
context_scope: persona_alias_disposition
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: compatibility_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`requested_persona_id`"
  - "`effective_persona_id`"
  - "`requested_persona`"
  - "`effective_persona`"
stale_retired_dispositions:
  - "requested_persona_id and effective_persona_id are migration aliases only."
negative_constraints:
  - "Consumers must not normatively revive requested_persona_id or effective_persona_id."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-028 - Requested Effective Projection Visibility

```yaml
plan_unit_id: CV-028
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Orchestrator, Source Control, graph, usage, verifier, live-status, command
  pivot, and inspector surfaces preserve requested/effective account, account
  policy, switch reason, trust, worker identity, and project-scoped derivation.
gui_related: true
gui_classification_reason: This unit controls user-visible projections, live status, command pivots, graph, usage, verifier, and inspector surfaces.
split_recommended: true
depends_on: [CV-013, CV-014, CV-015]
unblocks: [CV-037]
acceptance_criteria:
  - Orchestrator and Source Control projections preserve requested/effective identity.
  - Live-status and command pivots disclose account policy, account selection, switch reason, and project-scoped derivation.
  - Graph, usage, verifier, trust, and worker identity projections remain traceable end to end.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: identity_projection_visibility_drift
reasoning_tier: high
context_scope: requested_effective_projection_visibility
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: identity_projection_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`live-status`"
  - "`/switch`"
  - "`/model`"
  - "`/account`"
  - "`project_id`"
  - "trust-state"
negative_constraints:
  - "Requested/effective identity must not disappear when command pivots or live-status resolve identity."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-029 - Blocked Episode Action Identity

```yaml
plan_unit_id: CV-029
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Artifact, HITL, tool-denial, approval, and recovery states converge on blocked
  episode identity with blocked_sequence, ordered allowed_action_ids[] /
  allowed_action_ids, node_id, attempt_id, failure_class, and
  blocked_reason_code; allowed_actions[], request_id, tier_id, and tier_type are
  compatibility or lineage only.
gui_related: false
gui_classification_reason: This unit defines blocked runtime action identity and compatibility fields.
split_recommended: true
depends_on: [CV-023]
unblocks: [CV-030, CV-038, CV-040, CV-053]
acceptance_criteria:
  - Artifact, HITL, tool-denial, approval, and recovery states converge on blocked_episode identity.
  - ordered allowed_action_ids[] / allowed_action_ids is the canonical action identity family.
  - allowed_actions[], request_id, tier_id, and tier_type remain compatibility or lineage only.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_episode_action_drift
reasoning_tier: high
context_scope: blocked_episode_action_identity
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: blocked_episode_action_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`blocked_sequence`"
  - "`allowed_action_ids[]`"
  - "`allowed_action_ids`"
  - "`allowed_actions[]`"
  - "`request_id`"
  - "`tier_id`"
  - "`tier_type`"
  - "`blocked_reason_code`"
compatibility_only_notes:
  - "allowed_actions[], request_id, tier_id, and tier_type are compatibility or lineage only."
negative_constraints:
  - "Approval and recovery states must not target tier/request-local identity instead of blocked episode identity."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-030 - Blocked GUI Action Projection Safety

```yaml
plan_unit_id: CV-030
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Blocked-state GUI commands derive buttons from canonical allowed_action_ids[],
  revalidate stale or degraded projections before mutation, and disable with
  explicit projection_health or projection-freshness reason instead of guessing.
gui_related: true
gui_classification_reason: This unit defines visible blocked-state GUI buttons, disabled states, and projection-health explanations.
split_recommended: true
depends_on: [CV-029]
unblocks: [CV-048]
acceptance_criteria:
  - GUI buttons for blocked-state commands derive from canonical allowed_action_ids[].
  - Stale or degraded projections are revalidated before mutation.
  - Invalid or stale action projections disable with explicit projection_health or projection-freshness reason.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: gui_action_projection_stale
reasoning_tier: high
context_scope: blocked_gui_action_projection
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: gui_blocked_action_projection
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`allowed_action_ids[]`"
  - "`projection_health`"
  - "projection-freshness"
  - "`GUI`"
  - "`account_pressure_episode`"
negative_constraints:
  - "The GUI must not guess that an old blocked action set is still valid."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-031 - Route Identity Normalization Before Addressability

```yaml
plan_unit_id: CV-031
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Project artifacts, validation reports, file-management routes, usage routes,
  generated artifacts, and page links normalize to route_target, OpenSubject,
  object_kind, object_id, target_kind, command_kind, inspector_target, scoped
  resolver rules, and normalizes_to_contract before addressability.
gui_related: false
gui_classification_reason: This unit defines route/open normalization before runtime/generated artifacts become addressable.
split_recommended: true
depends_on: [CV-003, CV-023]
unblocks: [CV-046, CV-054, CV-055, CV-059]
acceptance_criteria:
  - Project artifact, validation, file-management, usage, generated-artifact, and page-link routes normalize before addressability.
  - Path/page-local links and alias wrappers do not bypass route_target/OpenSubject normalization.
  - Scoped resolver rules and normalizes_to_contract are preserved for routing proof.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_identity_shortcut
reasoning_tier: high
context_scope: route_identity_normalization
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FileManager.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: route_normalization_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`route_target`"
  - "`OpenSubject`"
  - "`object_kind`"
  - "`object_id`"
  - "`target_kind`"
  - "`command_kind`"
  - "`inspector_target`"
  - "`normalizes_to_contract`"
negative_constraints:
  - "Runtime/generated artifacts must not become addressable through path or page-local shortcuts before route normalization."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-032 - Runtime UI SSOT Consumer Set

```yaml
plan_unit_id: CV-032
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Plans/Orchestrator_Page.md, Plans/Executor_Protocol.md, and
  Plans/Contracts_V0.md consume the practical runtime/UI SSOT for execution,
  blocked states, /handoff, /recovery, terminals, event families, AttemptJournal,
  and package/seam/lane/promotion identity.
gui_related: false
gui_classification_reason: This unit defines cross-doc runtime/UI SSOT ownership rather than a specific visual surface.
split_recommended: true
depends_on: [CV-003]
unblocks: [CV-033, CV-045]
acceptance_criteria:
  - Orchestrator_Page, Executor_Protocol, and Contracts_V0 consume the runtime/UI SSOT together.
  - AttemptJournal and handoff payloads do not remain iteration-shaped.
  - Package/seam/lane/promotion identity replaces tier-boundary ancestry in execution projections.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_ui_ssot_drift
reasoning_tier: high
context_scope: runtime_ui_ssot_consumers
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Orchestrator_Page.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: runtime_ui_ssot_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`/handoff`"
  - "`/recovery`"
  - "`AttemptJournal`"
  - "`/package/seam/lane/promotion`"
  - "`/lane-aware`"
negative_constraints:
  - "AttemptJournal and handoff payloads must not remain /iteration-shaped."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-033 - Package Overseer Authority Scope

```yaml
plan_unit_id: CV-033
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  package-overseer-only responsibility is bounded to package-local execution
  supervision, dispatch/review cadence, and remediation recommendations;
  cross-package promotion, seam governance, durable route identity, and global
  remediation policy require higher-scope authority.
gui_related: false
gui_classification_reason: This unit defines authority scope boundaries for overseer roles.
split_recommended: false
depends_on: [CV-032]
unblocks: []
acceptance_criteria:
  - Package-overseer-only responsibility remains package-local.
  - Cross-package promotion, seam governance, durable route identity, and global remediation policy require higher-scope authority.
  - Package-local remediation recommendations do not become global remediation policy.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: overseer_authority_scope
reasoning_tier: high
context_scope: package_overseer_authority
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: authority_scope_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`package-overseer-only`"
  - "cross-package promotion"
  - "seam governance"
  - "durable route identity"
negative_constraints:
  - "Package-local authority must not claim global remediation or seam governance ownership."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-034 - Canonical Record Help Anchor Discovery

```yaml
plan_unit_id: CV-034
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Canonical record/help anchors such as canonical_record.v1:{project_id}:{record_id},
  /help, /open, record_id, projection-health, gap-003, and gap-006 are
  route/runtime identity obligations; Glossary terms and Crosswalk names do not
  become alternate runtime owners.
gui_related: false
gui_classification_reason: This unit defines record/help route identity and owner boundaries.
split_recommended: true
depends_on: [CV-003]
unblocks: [CV-037]
acceptance_criteria:
  - Canonical record/help anchors remain discoverable through owner headings or route/open aliases.
  - Glossary terms define vocabulary without becoming alternate runtime, route, or record owners.
  - Crosswalk names owner primitive or contract routes without re-owning runtime records.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: record_anchor_discovery_drift
reasoning_tier: high
context_scope: canonical_record_help_anchors
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Glossary.md
  - Plans/Crosswalk.md
node_compile_hint:
  mode: record_anchor_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`canonical_record.v1:{project_id}:{record_id}`"
  - "`/help`"
  - "`/open`"
  - "`record_id`"
  - "`projection-health`"
  - "`gap-003`"
  - "`gap-006`"
negative_constraints:
  - "Glossary terms and Crosswalk names must not become alternate runtime owners."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-035 - Package-Aware Storage Projection Scope

```yaml
plan_unit_id: CV-035
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Storage and projection backbones are package-aware and join attempt, blocked,
  and usage projections to lane, worktree, concern, and project-attention
  identity before any fallback to /tier/session/thread scope.
gui_related: false
gui_classification_reason: This unit defines storage/projection record scope and join semantics.
split_recommended: true
depends_on: [CV-010, CV-023]
unblocks: [CV-036, CV-048, CV-052]
acceptance_criteria:
  - Storage/projection records carry package/seam namespaces and lane/worktree state before legacy scope fallback.
  - Attempt, blocked, and usage projections join to lane/worktree/concern/project-attention identity.
  - /tier/session/thread is compatibility or fallback scope, not primary runtime scope.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: storage_scope_regression
reasoning_tier: high
context_scope: package_aware_storage_projection
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: storage_projection_scope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`/package`"
  - "`/seam`"
  - "`/worktree`"
  - "`/projection`"
  - "`/tier/session/thread`"
compatibility_only_notes:
  - "/tier/session/thread is fallback compatibility scope after package/seam/lane/worktree identity."
negative_constraints:
  - "Storage families must not hide lane/worktree/concern/project-attention identity behind attempt/block/usage-only records."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### CV-036 - Worktree Lane Runtime Context Preservation

```yaml
plan_unit_id: CV-036
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Runtime records carrying /lane, /runtime, or /effective facts preserve
  worktree/lane binding beside requested/effective account and runtime identity.
gui_related: false
gui_classification_reason: This unit defines runtime record identity binding.
split_recommended: false
depends_on: [CV-011, CV-013, CV-014]
unblocks: [CV-045, CV-052]
acceptance_criteria:
  - Runtime records carrying lane/runtime/effective facts include worktree/lane binding.
  - Requested/effective account and runtime identity remain beside worktree/lane identity.
  - Worktree/lane binding is not treated as optional downstream embellishment.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_lane_context_loss
reasoning_tier: high
context_scope: worktree_lane_runtime_context
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: worktree_lane_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`/lane`"
  - "`/runtime`"
  - "`/effective`"
  - "worktree/lane binding"
negative_constraints:
  - "Runtime records must not drop worktree/lane binding when carrying lane/runtime/effective facts."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-037 - Run Graph Projection And Inspector Contract

```yaml
plan_unit_id: CV-037
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Run Graph readability and graph-native drill-in are route/runtime projection
  contracts; zoom density, selected-object inspector detail, governance
  drill-down, requested/effective identity, trust state, and historical runtime
  states remain visible.
gui_related: true
gui_classification_reason: Run Graph zoom density, selected-object inspector detail, trust state, and drill-in are visible GUI behavior.
split_recommended: true
depends_on: [CV-028, CV-034]
unblocks: []
acceptance_criteria:
  - Far, medium, and near graph zoom levels preserve appropriate label density.
  - Selected objects expose strong detail in the right-side inspector regardless of zoom.
  - Graph-native drill-in preserves governance, requested/effective identity, trust state, and historical runtime states.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: graph_projection_contract_drift
reasoning_tier: high
context_scope: run_graph_projection_contract
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: gui_projection_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "far zoom"
  - "medium zoom"
  - "near zoom"
  - "right-side inspector"
  - "graph-native"
negative_constraints:
  - "Graph readability must not become only a local drawing preference."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Run_Graph_View.md
```

### CV-038 - Tool Artifact Runtime Attribution

```yaml
plan_unit_id: CV-038
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  tool.invoked, tool.denied, runtime artifacts, receipts, usage, and evidence
  share runtime attribution with node_id, attempt_id, lane_id, work_package_id,
  feature_seam_id, execution_role, /runtime, /effective, effective_account_id,
  operational_identity, artifact_id, and secondary usage_event_ref.
gui_related: false
gui_classification_reason: This unit defines runtime attribution payloads and joins rather than UI presentation.
split_recommended: true
depends_on: [CV-016, CV-029]
unblocks: [CV-039, CV-060]
acceptance_criteria:
  - tool.invoked and tool.denied are first-class runtime trace records when they affect execution or artifacts.
  - Runtime artifacts, receipts, usage, and evidence share runtime attribution keys.
  - usage_event_ref remains secondary drill-through evidence, not the sole evidence trail.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: tool_artifact_attribution_gap
reasoning_tier: high
context_scope: tool_artifact_runtime_attribution
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: runtime_attribution_packet
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`tool.invoked`"
  - "`tool.denied`"
  - "`node_id`"
  - "`attempt_id`"
  - "`lane_id`"
  - "`work_package_id`"
  - "`feature_seam_id`"
  - "`usage_event_ref`"
negative_constraints:
  - "Tool events that affect execution, artifacts, receipts, usage, or operational identity must not remain under-attributed analytics exhaust."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-039 - Handoff Identity Before Artifacts

```yaml
plan_unit_id: CV-039
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Wizard, interview, and prompt handoffs inherit runtime identity before
  artifacts, including source_stage, source_phase_ids[], persona_id, provider,
  model, timestamp, execution_role, requested/effective account fields,
  /worktree, /report, and governance evidence.
gui_related: false
gui_classification_reason: This unit defines handoff payload identity and provenance.
split_recommended: true
depends_on: [CV-024, CV-038]
unblocks: []
acceptance_criteria:
  - Wizard/interview/prompt handoffs include runtime identity before artifact emission.
  - Handoff payloads preserve stage, phase, persona, provider/model, timestamp, execution role, requested/effective account fields, worktree, report, and governance evidence.
  - Downstream handoff consumers do not lose runtime authority context.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: handoff_identity_underkeying
reasoning_tier: high
context_scope: handoff_identity_provenance
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: handoff_identity_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`source_stage`"
  - "`source_phase_ids[]`"
  - "`persona_id`"
  - "`execution_role`"
  - "`/worktree`"
  - "`/report`"
negative_constraints:
  - "Wizard and interview handoffs must not emit artifacts before inheriting runtime identity grammar."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-040 - Tier Event Alias Compatibility Disposition

```yaml
plan_unit_id: CV-040
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  run.tier_*, HITLRequest, TierContext, TierType, select_for_tier, tier_id,
  active-agents.json, TierChanged, active tier, and request-local approval terms
  remain lineage or compatibility only after mapping to package/seam/lane/account
  runtime contracts.
gui_related: false
gui_classification_reason: This is a compatibility disposition for tier-era event and approval vocabulary.
split_recommended: true
depends_on: [CV-024, CV-029]
unblocks: []
acceptance_criteria:
  - Tier-era event names and approval terms remain compatibility obligations only.
  - Compatibility terms map into package/seam/lane/account runtime contracts.
  - active-agents and tier-rooted selectors are not revived as canonical runtime identity.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: tier_event_alias_drift
reasoning_tier: high
context_scope: tier_event_alias_disposition
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: compatibility_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`run.tier_*`"
  - "`HITLRequest`"
  - "`TierContext`"
  - "`TierType`"
  - "`select_for_tier`"
  - "`tier_id`"
  - "`active-agents.json`"
  - "`TierChanged`"
  - "active tier"
compatibility_only_notes:
  - "Tier-era event names and approval terms are lineage or compatibility only after mapping."
negative_constraints:
  - "Tier-era side files and selectors must not become canonical child/orchestrator lineage identity."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-041 - Command Route Shared Primitive Contract

```yaml
plan_unit_id: CV-041
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Route/open and command metadata use shared route primitives: cmd.panel.switch
  is shell_view, focus/open commands are navigation_wrapper, mutating subject
  commands are domain_action, and wrappers normalize without creating a second
  route/open contract.
gui_related: true
gui_classification_reason: Command routing, shell views, focus/open commands, and mutating subject commands affect user-visible navigation and actions.
split_recommended: true
depends_on: [CV-003, CV-023]
unblocks: []
acceptance_criteria:
  - cmd.panel.switch remains a pure shell-facing shell_view command.
  - Object/thread/worktree focus and open commands route through navigation_wrapper.
  - Mutating subject commands remain domain_actions.
  - Command wrappers normalize to route/open contracts without defining a parallel target model.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: command_route_fork
reasoning_tier: high
context_scope: command_route_shared_primitives
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: command_route_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`cmd.panel.switch`"
  - "`shell_view`"
  - "`navigation_wrapper`"
  - "`domain_action`"
  - "`route_target`"
  - "`OpenSubject`"
negative_constraints:
  - "Command metadata must not create a second route/open contract."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
```

### CV-042 - Owner Cleanup Order Guard

```yaml
plan_unit_id: CV-042
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Cleanup order repairs owner ContractRefs, section anchors, and duplicate
  numbering first; promoted-shell command-family and persistence-scope cleanup
  second; DAE/FileSafe third; and OpenCode provider-native SSE with
  requested-effective disclosure after those owner repairs.
gui_related: false
gui_classification_reason: This unit defines governance cleanup sequencing rather than UI behavior.
split_recommended: true
depends_on: [CV-004]
unblocks: []
acceptance_criteria:
  - Owner ContractRef, section-anchor, and duplicate-number repair comes first.
  - Promoted-shell command-family and persistence-scope cleanup comes before DAE/FileSafe cleanup.
  - OpenCode provider-native SSE cleanup preserves requested-effective disclosure and follows upstream owner repairs.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: cleanup_order_false_closure
reasoning_tier: high
context_scope: owner_cleanup_order
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: cleanup_order_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`ContractRef`"
  - "`section-anchor`"
  - "`duplicate-number`"
  - "`promoted-shell`"
  - "`persistence-scope`"
  - "`DAE`"
  - "`/FileSafe/recovery`"
negative_constraints:
  - "Cleanup must not declare closure before owner-doc issues are repaired in order."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-043 - Shared Concern Projection Family

```yaml
plan_unit_id: CV-043
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  /governance, Seams, History, Progress, Evidence, Ledger, graph inspector,
  concern operations, corroboration, promotion, reviews, graph patches, and
  recovery share one durable governance/concern record family with action policy
  and reversibility classes.
gui_related: true
gui_classification_reason: The listed operational and audit surfaces expose concern projections and graph inspector state.
split_recommended: true
depends_on: [CV-006, CV-007]
unblocks: []
acceptance_criteria:
  - Operational and audit surfaces project the same concern record family.
  - Progress, Seams, Evidence, History, and Ledger preserve distinct projection roles without forking identity.
  - Concern operations preserve action policy, authority, and reversibility classes.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: concern_projection_fork
reasoning_tier: high
context_scope: shared_concern_projection_family
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: concern_projection_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`/governance`"
  - "Seams"
  - "History"
  - "Progress"
  - "Evidence"
  - "Ledger"
  - "graph inspector"
negative_constraints:
  - "Concern projections must not fork separate durable concern identities per surface."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-044 - Event Table Runtime Snapshot Completeness

```yaml
plan_unit_id: CV-044
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Event tables and examples inline or reference canonical runtime snapshot fields
  for run.started, usage.event, hitl.*, safe_point.created, scheduler.pass, and
  remediation.resolved; GATE evidence claims are valid only when schemas encode
  produced outputs.
gui_related: false
gui_classification_reason: This unit defines event schema completeness and governance evidence validity.
split_recommended: true
depends_on: [CV-026]
unblocks: []
acceptance_criteria:
  - Runtime event tables/examples carry or reference canonical runtime snapshot fields.
  - Listed event families preserve runtime identity and snapshot completeness.
  - GATE evidence claims are valid only when schemas encode produced outputs.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: event_table_underimplementation
reasoning_tier: high
context_scope: event_table_snapshot_completeness
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: event_table_schema_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`run.started`"
  - "`usage.event`"
  - "`hitl.*`"
  - "`safe_point.created`"
  - "`scheduler.pass`"
  - "`remediation.resolved`"
  - "GATE"
negative_constraints:
  - "Evidence claims must not be accepted when schemas do not encode the produced outputs."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-045 - Scheduling And Handoff Identity

```yaml
plan_unit_id: CV-045
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Scheduling and handoff schemas preserve package/seam/lane/account/role
  identity, package/seam overseer authority, scored ready-set scheduling,
  safe-point/remediation lineage, and reject hard-coded selection_rule =
  "lexicographic_node_id" except as final tiebreak.
gui_related: false
gui_classification_reason: This unit defines scheduling and handoff schema identity.
split_recommended: true
depends_on: [CV-032, CV-036]
unblocks: []
acceptance_criteria:
  - Scheduling and handoff schemas preserve package/seam/lane/account/role identity.
  - Package/seam overseer authority and safe-point/remediation lineage remain explicit.
  - selection_rule = "lexicographic_node_id" is rejected except as final tiebreak.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: scheduling_identity_drift
reasoning_tier: high
context_scope: scheduling_handoff_identity
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: scheduling_identity_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`selection_rule = \"lexicographic_node_id\"`"
  - "scored ready-set scheduling"
  - "safe-point/remediation lineage"
negative_constraints:
  - "Hard-coded lexicographic_node_id selection is allowed only as a final tiebreak."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-046 - Route Payload Unified Ontology

```yaml
plan_unit_id: CV-046
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  route_payload, primary_route_payload, secondary_route_payload?, resume_url,
  URL deep links, attention rows, palette/search results, and in-app dispatch
  decode to one route model with provenance, trust, and linkage fields.
gui_related: false
gui_classification_reason: This unit defines route payload identity and transport normalization.
split_recommended: true
depends_on: [CV-031]
unblocks: [CV-051, CV-057]
acceptance_criteria:
  - Route payload variants decode to one route model.
  - resume_url and URL deep links remain transport into that model.
  - Provenance, trust, and linkage fields remain available during route decoding.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_payload_ontology_fork
reasoning_tier: high
context_scope: unified_route_payload_ontology
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: route_payload_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`route_payload`"
  - "`primary_route_payload`"
  - "`secondary_route_payload?`"
  - "`resume_url`"
  - "URL deep links"
negative_constraints:
  - "Route payload variants must not fork separate route models."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-047 - Shared Record Envelope Join Completeness

```yaml
plan_unit_id: CV-047
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Shared records expose record_id, record_kind, schema_version, project_id,
  optional run/scope fields, status/timestamps, summary/detail/source/artifact/
  related/lineage refs, actor refs, and requested_effective_snapshot_refs; detail
  opens must not drop joins.
gui_related: false
gui_classification_reason: This unit defines shared record envelope joins and detail-open integrity.
split_recommended: true
depends_on: [CV-006]
unblocks: []
acceptance_criteria:
  - Shared records expose the listed identity, schema, scope, status, timestamp, refs, actor, and snapshot fields.
  - Detail opens preserve joins needed for history, evidence, artifact, source, and lineage traversal.
  - Route/detail openings do not become join-thin rendered summaries.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: record_envelope_join_loss
reasoning_tier: high
context_scope: shared_record_envelope_joins
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: shared_record_join_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`record_id`"
  - "`record_kind`"
  - "`schema_version`"
  - "`project_id`"
  - "`requested_effective_snapshot_refs`"
negative_constraints:
  - "Detail opens must not drop shared record joins."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-048 - Projection Health Safety States

```yaml
plan_unit_id: CV-048
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Projection states use current, refreshing, stale, degraded, and unavailable;
  trust/gating reads committed projection state, checkpoint refs, and
  last-updated metadata rather than page-local timestamps.
gui_related: false
gui_classification_reason: This unit defines projection health state vocabulary and gating inputs.
split_recommended: true
depends_on: [CV-030, CV-035]
unblocks: [CV-051]
acceptance_criteria:
  - Projection health states use the closed vocabulary current, refreshing, stale, degraded, and unavailable.
  - Trust/gating reads committed projection state, checkpoint refs, and last-updated metadata.
  - Page-local timestamps do not replace projection health metadata.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: projection_health_safety_drift
reasoning_tier: high
context_scope: projection_health_safety
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: projection_health_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`current`"
  - "`refreshing`"
  - "`stale`"
  - "`degraded`"
  - "`unavailable`"
negative_constraints:
  - "Trust/gating must not rely on page-local timestamps instead of committed projection state."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-049 - Provider Account Bridge Disclosure

```yaml
plan_unit_id: CV-049
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Provider/model/permission/stream/account contracts disclose requested/effective
  auth/account, account binding, actor role, transport-vs-upstream identity,
  realm split github_api vs copilot_github, failover/switch reasoning, and
  lane/account snapshots.
gui_related: false
gui_classification_reason: This unit defines provider/account runtime disclosure and realm boundaries.
split_recommended: true
depends_on: [CV-013, CV-014, CV-016]
unblocks: [CV-050]
acceptance_criteria:
  - Provider/model/permission/stream/account contracts disclose requested/effective auth/account and account binding.
  - Transport host identity remains split from upstream provider identity.
  - github_api and copilot_github remain hard realm splits.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_account_bridge_drift
reasoning_tier: high
context_scope: provider_account_bridge
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: provider_account_disclosure
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`github_api`"
  - "`copilot_github`"
  - "requested/effective auth/account"
  - "failover/switch reasoning"
negative_constraints:
  - "Stable account identity normalization must preserve the hard realm split between github_api and copilot_github."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-050 - Account Switch Event Audit Fields

```yaml
plan_unit_id: CV-050
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Durable account_switch_event carries switch_event_id, project_id, provider_id,
  requested/from/to account fields, switch_reason, closed decision_kind, source
  episode, run/attempt/thread IDs, and ts.
gui_related: false
gui_classification_reason: This unit defines durable account switch audit records.
split_recommended: false
depends_on: [CV-049]
unblocks: []
acceptance_criteria:
  - account_switch_event carries the listed identity, reason, source episode, run/attempt/thread, and timestamp fields.
  - decision_kind remains a closed field.
  - Requested-side account switching has durable linkage to source episode and execution context.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: account_switch_audit_loss
reasoning_tier: high
context_scope: account_switch_event
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: account_switch_event_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`account_switch_event`"
  - "`switch_event_id`"
  - "`switch_reason`"
  - "`decision_kind`"
  - "`ts`"
negative_constraints:
  - "Account switching must not lose durable run/attempt/thread/source linkage."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-051 - Project Attention Route Payload

```yaml
plan_unit_id: CV-051
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  project_attention_item carries identity, severity, owner/reason/source refs,
  primary and secondary route payloads, projection_trust_state, dismissibility,
  quieting, active, created/updated/resolved timestamps.
gui_related: true
gui_classification_reason: Project attention items, route payloads, projection trust state, dismissibility, quieting, and timestamps are visible attention UI state.
split_recommended: true
depends_on: [CV-046, CV-048]
unblocks: []
acceptance_criteria:
  - project_attention_item carries identity, severity, owner/reason/source refs, and route payloads.
  - projection_trust_state, dismissibility, quieting, active status, and timestamps remain explicit.
  - Project attention rows decode through the shared route model.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: project_attention_route_loss
reasoning_tier: high
context_scope: project_attention_route_payload
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: project_attention_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`project_attention_item`"
  - "`projection_trust_state`"
  - "primary/secondary route payloads"
  - "quieting"
negative_constraints:
  - "Project attention route payloads must not bypass the shared route model."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-052 - Worktree Lane Lifecycle Records

```yaml
plan_unit_id: CV-052
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Worktree/lane lifecycle is a first-class storage family with durable worktree
  record, lane/worktree projection, historical archive/remove lineage,
  conflict/restoring states, and Git/PR restart identity; UI selection pointers
  are not substitutes.
gui_related: false
gui_classification_reason: This unit defines durable storage and lifecycle records rather than UI controls.
split_recommended: true
depends_on: [CV-035, CV-036]
unblocks: []
acceptance_criteria:
  - Worktree/lane lifecycle has durable record and projection identity.
  - Historical archive/remove lineage and conflict/restoring states are preserved.
  - Git/PR restart identity is not replaced by UI selection pointers.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: worktree_lifecycle_record_loss
reasoning_tier: high
context_scope: worktree_lane_lifecycle_records
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: worktree_lifecycle_record
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "worktree/lane lifecycle"
  - "historical archive/remove lineage"
  - "conflict/restoring states"
negative_constraints:
  - "UI selection pointers are not substitutes for durable worktree/lane lifecycle records."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-053 - Blocked Restart Recovery State

```yaml
plan_unit_id: CV-053
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Approval, restart, and startup recovery preserve first-class waiting_approval
  blocked episodes; request_id maps 1:1 to { run_id, node_id, blocked_sequence };
  non-resumable attempts become stale_historical and unresolved prerequisites
  remain actionable.
gui_related: false
gui_classification_reason: This unit defines blocked runtime recovery identity and restart semantics.
split_recommended: true
depends_on: [CV-029]
unblocks: []
acceptance_criteria:
  - waiting_approval blocked episodes remain first-class across approval, restart, and startup recovery.
  - request_id maps 1:1 to run_id, node_id, and blocked_sequence.
  - Non-resumable attempts become stale_historical while unresolved prerequisites remain actionable.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_restart_state_loss
reasoning_tier: high
context_scope: blocked_restart_recovery
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: blocked_restart_recovery
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`waiting_approval`"
  - "`request_id`"
  - "`{ run_id, node_id, blocked_sequence }`"
  - "`stale_historical`"
negative_constraints:
  - "Restart recovery must not lose blocked episode identity."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-054 - Route Target Selector Reject Rules

```yaml
plan_unit_id: CV-054
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  route_target requires project_id plus one primary selector; reject missing
  selector, competing subject_id and object_kind/object_id, object halves,
  inspector_target without object selector, conflicting tab_id, line/range, or
  per-surface state inside route_target.
gui_related: false
gui_classification_reason: This unit defines route_target validation and reject rules.
split_recommended: true
depends_on: [CV-031]
unblocks: [CV-055, CV-057, CV-058, CV-059]
acceptance_criteria:
  - route_target requires project_id plus one primary selector.
  - Invalid selector combinations are rejected.
  - line/range and per-surface state stay outside base route_target.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_selector_invalid_combo
reasoning_tier: high
context_scope: route_target_selector_rules
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: route_target_validation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`route_target`"
  - "`project_id`"
  - "`subject_id`"
  - "`object_kind`"
  - "`object_id`"
  - "`inspector_target`"
  - "`tab_id`"
  - "`line`"
  - "`range`"
negative_constraints:
  - "Base route_target must not contain line/range or per-surface state."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-055 - OpenFile And OpenSubject Identity Split

```yaml
plan_unit_id: CV-055
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  OpenFile { path... } remains workspace-file open; identity-native opens use
  OpenSubject(subject_id, open_intent), with doc:<document_id> and
  artifact:<artifact_id> resolving to workspace source, transient
  generated://<artifact_id>, or routed non-editor surfaces.
gui_related: false
gui_classification_reason: This unit defines open identity and workspace/source routing semantics.
split_recommended: true
depends_on: [CV-031, CV-054]
unblocks: [CV-056]
acceptance_criteria:
  - OpenFile remains the workspace-file open shape.
  - Identity-native opens use OpenSubject with subject_id and open_intent.
  - Document and artifact subjects resolve to workspace source, transient generated transport, or routed non-editor surfaces.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: open_contract_identity_fork
reasoning_tier: high
context_scope: open_file_subject_identity
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: open_identity_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`OpenFile { path... }`"
  - "`OpenSubject`"
  - "`subject_id`"
  - "`open_intent`"
  - "`doc:<document_id>`"
  - "`artifact:<artifact_id>`"
  - "`generated://<artifact_id>`"
negative_constraints:
  - "OpenFile and OpenSubject must not fork into competing identity-native open contracts."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-056 - Generated Transport Compatibility Disposition

```yaml
plan_unit_id: CV-056
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  generated://<artifact_id>, open_subject, OpenArtifact, target_group?,
  open_mode?, and location? are transport, convenience, or compatibility only
  when normalized to OpenSubject, route_target, or open_intent; they do not
  define new identity.
gui_related: false
gui_classification_reason: This unit is a transport/alias compatibility disposition.
split_recommended: true
depends_on: [CV-055]
unblocks: []
acceptance_criteria:
  - Generated transport and open aliases normalize to OpenSubject, route_target, or open_intent.
  - Generated artifact source transports never become canonical identity.
  - Convenience names do not create a second OpenSubject schema.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: generated_transport_as_identity
reasoning_tier: high
context_scope: generated_transport_disposition
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: compatibility_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`generated://<artifact_id>`"
  - "`open_subject`"
  - "`OpenArtifact`"
  - "`target_group?`"
  - "`open_mode?`"
  - "`location?`"
compatibility_only_notes:
  - "Generated transport and open aliases are convenience/compatibility only when normalized."
negative_constraints:
  - "Generated artifact source transports never become canonical identity."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-057 - Resume URL Serialized Route Transport

```yaml
plan_unit_id: CV-057
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  resume_url is serialized transport derived from route_target, narrower than
  internal route identity, and never a parallel stronger primitive; scope
  restorers such as focused_run_id and thread_id remain route fields.
gui_related: false
gui_classification_reason: This unit defines serialized route transport and scope restorer fields.
split_recommended: true
depends_on: [CV-046, CV-054]
unblocks: []
acceptance_criteria:
  - resume_url derives from route_target and decodes back to canonical route identity.
  - resume_url is narrower than internal route identity and not a stronger primitive.
  - focused_run_id and thread_id remain route fields, not shadow route primitives.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: resume_url_shadow_route
reasoning_tier: high
context_scope: resume_url_route_transport
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: route_serialization_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`resume_url`"
  - "`route_target`"
  - "`focused_run_id`"
  - "`thread_id`"
negative_constraints:
  - "resume_url must not act as a shadow routing primitive."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-058 - Inspector Target Closed Focus Enum

```yaml
plan_unit_id: CV-058
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  inspector_target is reusable detail-focus only, closed to summary, evidence,
  artifacts, history, reviews, usage, lineage, and details; message-step-line-
  range anchors and arbitrary tab names stay out.
gui_related: true
gui_classification_reason: Inspector detail focus values and tab/focus behavior are user-visible detail UI semantics.
split_recommended: true
depends_on: [CV-054]
unblocks: []
acceptance_criteria:
  - inspector_target uses the closed focus enum.
  - Inspector focus remains reusable detail-surface focus rather than per-surface noise.
  - Message-step-line-range anchors and arbitrary tab names stay outside inspector_target.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: inspector_focus_enum_drift
reasoning_tier: high
context_scope: inspector_target_enum
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: inspector_focus_enum
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`inspector_target`"
  - "`summary`"
  - "`evidence`"
  - "`artifacts`"
  - "`history`"
  - "`reviews`"
  - "`usage`"
  - "`lineage`"
  - "`details`"
negative_constraints:
  - "message-step-line-range anchors and arbitrary tab names stay out of inspector_target."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-059 - Usage Route Key Normalization

```yaml
plan_unit_id: CV-059
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Usage routes normalize usage_event_ref to object_kind = usage_event and the
  canonical usage event object_id; timestamp/run/thread/tier filters are
  degraded compatibility or narrowing, not primary route identity.
gui_related: false
gui_classification_reason: This unit defines usage route identity and compatibility filters.
split_recommended: true
depends_on: [CV-031, CV-054]
unblocks: []
acceptance_criteria:
  - usage_event_ref normalizes into object_kind = usage_event.
  - The canonical usage event is the object_id for usage routes.
  - Timestamp/run/thread/tier filters are not primary route identity.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: usage_route_key_drift
reasoning_tier: high
context_scope: usage_route_normalization
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: usage_route_identity
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`usage_event_ref`"
  - "`object_kind = usage_event`"
  - "`object_id`"
  - "`tier_id`"
compatibility_only_notes:
  - "Timestamp/run/thread/tier filters are degraded compatibility or narrowing, not primary route identity."
negative_constraints:
  - "Usage route identity must not use tier or timestamp filters as the primary key."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-060 - Executor Dispatch Runtime Attribution Packet

```yaml
plan_unit_id: CV-060
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Executor-facing dispatch requires run_id, thread_id?, node_id?, attempt_id?,
  execution_role?, provider_attempt_ref?, and usage_event_ref?; broad
  EventEnvelopeV1 compatibility wording is not enough.
gui_related: false
gui_classification_reason: This unit defines executor dispatch packet requirements.
split_recommended: true
depends_on: [CV-026, CV-038]
unblocks: []
acceptance_criteria:
  - Executor-facing dispatch payloads include the runtime attribution packet.
  - EventEnvelopeV1 broad compatibility wording does not satisfy executor-facing dispatch requirements.
  - Tools.md references the shared runtime attribution packet instead of treating tool events as analytics-only.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_dispatch_packet_underkeying
reasoning_tier: high
context_scope: executor_dispatch_attribution
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: executor_dispatch_packet
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0027
preserved_exact_tokens:
  - "`run_id`"
  - "`thread_id?`"
  - "`node_id?`"
  - "`attempt_id?`"
  - "`execution_role?`"
  - "`provider_attempt_ref?`"
  - "`usage_event_ref?`"
  - "`EventEnvelopeV1`"
negative_constraints:
  - "EventEnvelopeV1 broad compatibility wording is not enough for executor-facing runtime dispatch."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-061 - Degraded Trust Concern Escalation

```yaml
plan_unit_id: CV-061
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  degraded-trust is represented as a cross-surface concern/projection-trust
  state, and degraded-trust/account-health escalation routes through the shared
  concern record, blocked-owner, and escalation-ladder model instead of
  surface-local warning aliases.
gui_related: false
gui_classification_reason: This unit defines concern escalation records and owner routing rather than GUI layout or visual presentation.
split_recommended: true
depends_on: [CV-043, CV-048]
unblocks: []
acceptance_criteria:
  - Degraded-trust/account-health escalation uses the shared concern record model.
  - Blocked-owner and escalation-ladder routing are preserved as cross-surface contracts.
  - Surface-local warning aliases are not accepted as canonical concern routing.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: concern_escalation_alias_drift
reasoning_tier: high
context_scope: degraded_trust_concern_escalation
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/human-in-the-loop.md
node_compile_hint:
  mode: concern_escalation_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0028
preserved_exact_tokens:
  - "`degraded-trust`"
  - "cross-surface concern/projection-trust state"
  - "blocked-owner"
  - "escalation-ladder"
negative_constraints:
  - "Contracts consumers must not invent surface-local warning aliases for degraded-trust/account-health escalation."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-062 - First-Class Concern Record Shape

```yaml
plan_unit_id: CV-062
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Concern is a first-class durable record distinct from review finding,
  annotation, blocked episode, and graph patch request, with concern identity,
  project/run/scope refs, evidence/source refs, lineage refs,
  severity/category/status, and governance metadata.
gui_related: false
gui_classification_reason: This unit defines the durable concern record schema.
split_recommended: true
depends_on: [CV-006, CV-007, CV-043]
unblocks: [CV-063, CV-064, CV-065, CV-066, CV-067]
acceptance_criteria:
  - Concern remains a first-class durable record separate from review finding, annotation, blocked episode, and graph patch request.
  - Concern records expose concern_id/project_id/run and scope refs.
  - Concern records preserve evidence/source refs, lineage refs, severity/category/status, and governance metadata.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: concern_record_identity_collapse
reasoning_tier: high
context_scope: first_class_concern_record
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: concern_record_schema_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0028
preserved_exact_tokens:
  - "Concern is a first-class durable record"
  - "concern_id"
  - "project_id"
  - "scope refs"
  - "evidence/source refs"
  - "lineage refs"
negative_constraints:
  - "Concern identity must not be collapsed into review findings, annotations, blocked episodes, or graph patch requests."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-063 - Concern Lifecycle And Resolution Kinds

```yaml
plan_unit_id: CV-063
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Concern lifecycle states are active, acknowledged, resolved, and dismissed,
  and concern resolution_kind values are fixed, accepted_risk, superseded,
  merged, split, invalidated, obsoleted_by_patch, and obsoleted_by_recovery.
gui_related: false
gui_classification_reason: This unit defines concern lifecycle enum semantics.
split_recommended: true
depends_on: [CV-062]
unblocks: [CV-064]
acceptance_criteria:
  - Concern lifecycle uses active, acknowledged, resolved, and dismissed.
  - resolution_kind preserves fixed, accepted_risk, superseded, merged, split, invalidated, obsoleted_by_patch, and obsoleted_by_recovery.
  - The concern-lifecycle owner section keeps explicit active/acknowledged/resolved/dismissed semantics.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: concern_lifecycle_enum_drift
reasoning_tier: standard
context_scope: concern_lifecycle_resolution_kinds
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: concern_lifecycle_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0028
preserved_exact_tokens:
  - "active"
  - "acknowledged"
  - "resolved"
  - "dismissed"
  - "resolution_kind"
  - "accepted_risk"
  - "obsoleted_by_patch"
  - "obsoleted_by_recovery"
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-064 - Concern Action Authority And Confirmation

```yaml
plan_unit_id: CV-064
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Concern actions carry actor authority, confirmation, rationale,
  reversibility, and audit fields, and the concern-action confirmation matrix
  keeps acknowledged, dismissed, resolved, and structural lineage edits as
  distinct actions.
gui_related: false
gui_classification_reason: This unit defines concern action authorization and audit semantics.
split_recommended: true
depends_on: [CV-063]
unblocks: []
acceptance_criteria:
  - Concern actions include actor authority, confirmation, rationale, reversibility, and audit fields.
  - Concern-action confirmation matrix requirements are preserved in the owner section.
  - Acknowledged, dismissed, resolved, and structural lineage edits remain distinct concern actions.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: concern_action_audit_loss
reasoning_tier: high
context_scope: concern_action_authority_confirmation
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/human-in-the-loop.md
node_compile_hint:
  mode: concern_action_authority_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0028
preserved_exact_tokens:
  - "actor authority"
  - "confirmation"
  - "rationale"
  - "reversibility"
  - "audit fields"
  - "concern-action confirmation matrix"
negative_constraints:
  - "Acknowledged, dismissed, resolved, and structural lineage edits must not be collapsed into one generic concern action."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-065 - Concern Linkage And Blocked Episode Relation

```yaml
plan_unit_id: CV-065
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Concerns expose review_refs, corroboration_refs, graph_patch_refs,
  recovery_refs, blocked_episode_refs, and promotion_refs, while blocked
  episodes may reference concerns without replacing concern identity.
gui_related: false
gui_classification_reason: This unit defines concern relationship fields and blocked-episode linkage.
split_recommended: true
depends_on: [CV-029, CV-043, CV-062]
unblocks: []
acceptance_criteria:
  - Concern records expose review, corroboration, graph patch, recovery, blocked episode, and promotion refs.
  - Blocked episodes are allowed to reference concerns.
  - Blocked episodes do not replace concern identity.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_episode_concern_identity_loss
reasoning_tier: high
context_scope: concern_linkage_blocked_episode_relation
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/human-in-the-loop.md
node_compile_hint:
  mode: concern_linkage_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0028
preserved_exact_tokens:
  - "review_refs"
  - "corroboration_refs"
  - "graph_patch_refs"
  - "recovery_refs"
  - "blocked_episode_refs"
  - "promotion_refs"
negative_constraints:
  - "Blocked episodes may reference concerns without replacing concern identity."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-066 - Concern Ownership Resolver And Reassignment

```yaml
plan_unit_id: CV-066
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Concern owner_kind/owner_ref, created_by_kind/created_by_ref, and resolver
  authority are separate roles; ownership may be reassigned without changing
  concern identity, and concern resolver remains distinct from owner/source.
gui_related: false
gui_classification_reason: This unit defines concern ownership and resolver role boundaries.
split_recommended: true
depends_on: [CV-062]
unblocks: [CV-067]
acceptance_criteria:
  - owner_kind/owner_ref are separate from created_by_kind/created_by_ref.
  - Resolver authority is distinct from owner and source roles.
  - Concern ownership changes do not change concern identity.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: concern_role_boundary_collapse
reasoning_tier: high
context_scope: concern_ownership_resolver_reassignment
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: concern_role_boundary_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0028
preserved_exact_tokens:
  - "owner_kind"
  - "owner_ref"
  - "created_by_kind"
  - "created_by_ref"
  - "concern resolver"
negative_constraints:
  - "Concern resolver must not be treated as the same role as concern owner or source."
  - "Concern ownership reassignment must not change concern identity."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-067 - Concern Layers Heuristics And Attention Fields

```yaml
plan_unit_id: CV-067
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  concern_source_event_ref, concern_record, and concern_projection are separate
  structural layers; repeated-sighting decisions use source/scope/category and
  lineage-aware heuristics; concern-family contracts include visibility_level,
  attention_level, chatworthy, and blocking_effect?, with blocking_effect
  separate from severity.
gui_related: false
gui_classification_reason: This unit defines concern structural layers and attention fields rather than visual presentation.
split_recommended: true
depends_on: [CV-062, CV-066]
unblocks: []
acceptance_criteria:
  - concern_source_event_ref, concern_record, and concern_projection remain separate structural layers.
  - Repeated sightings use source/scope/category/lineage-aware heuristics to decide update versus new concern.
  - visibility_level, attention_level, chatworthy, and blocking_effect? are present in the concern-family contract.
  - blocking_effect remains explicitly separate from severity.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: concern_projection_attention_field_loss
reasoning_tier: high
context_scope: concern_layers_heuristics_attention
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: concern_attention_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0028
preserved_exact_tokens:
  - "concern_source_event_ref"
  - "concern_record"
  - "concern_projection"
  - "`visibility_level`"
  - "`attention_level`"
  - "`chatworthy`"
  - "`blocking_effect?`"
negative_constraints:
  - "blocking_effect must stay explicitly separate from severity."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-068 - Promotion Classes And Gate Evidence

```yaml
plan_unit_id: CV-068
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  lane_to_package, package_to_seam_available, and seam_complete promotions are
  explicit promotion classes, each with exact gate and evidence expectations.
gui_related: false
gui_classification_reason: This unit defines promotion class contracts and evidence requirements.
split_recommended: true
depends_on: [CV-025, CV-043]
unblocks: []
acceptance_criteria:
  - lane_to_package, package_to_seam_available, and seam_complete are defined promotion classes.
  - Each promotion class carries exact gate expectations.
  - Each promotion class carries exact evidence expectations.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: promotion_gate_evidence_ambiguity
reasoning_tier: standard
context_scope: promotion_classes_gate_evidence
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: promotion_gate_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0029
preserved_exact_tokens:
  - "lane_to_package"
  - "package_to_seam_available"
  - "seam_complete"
  - "gate/evidence expectations"
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-069 - Route Open Shared Payload Owner Boundary

```yaml
plan_unit_id: CV-069
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Search, palette, widgets, recovery links, and cross-surface pivots use one
  shared routing/deep-link payload; resume_url is serialized transport of that
  route payload; Contracts_V0 owns canonical route_target and OpenSubject while
  Crosswalk remains limited to primitive boundary ownership and FileManager
  OpenFile remains narrow and path-based.
gui_related: false
gui_classification_reason: This unit defines route/open owner boundaries and payload contracts.
split_recommended: true
depends_on: [CV-031, CV-046, CV-055, CV-057]
unblocks: [CV-070]
acceptance_criteria:
  - One shared routing/deep-link payload is used for search, palette, widgets, recovery links, and cross-surface pivots.
  - resume_url is treated as serialized transport of the route payload.
  - Contracts_V0 owns canonical route_target and OpenSubject.
  - Crosswalk and FileManager remain within their narrower primitive/OpenFile boundaries.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_open_owner_boundary_drift
reasoning_tier: high
context_scope: route_open_shared_payload_owner_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Crosswalk.md
  - Plans/FileManager.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: route_open_owner_boundary_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0029
preserved_exact_tokens:
  - "route_target"
  - "OpenSubject"
  - "resume_url"
  - "Primitive:RouteTarget/OpenSubject"
  - "FileManager OpenFile"
negative_constraints:
  - "Crosswalk must stay limited to primitive boundary ownership."
  - "FileManager OpenFile must stay narrow and path-based."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-070 - Route Selector And Ref-Family Normalization

```yaml
plan_unit_id: CV-070
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Route/open normalization preserves selector precedence, reject rules, closed
  tab_id vocabulary, scoped resolver rules, route examples, ref-family split,
  resume_url demotion, and wrapper/canonical normalization, while
  timestamp/run/thread fallback logic remains compatibility-only.
gui_related: false
gui_classification_reason: This unit defines route selector and normalization rules.
split_recommended: true
depends_on: [CV-054, CV-056, CV-069]
unblocks: []
acceptance_criteria:
  - Selector precedence, reject rules, closed tab_id vocabulary, scoped resolver rules, and route examples are preserved.
  - Ref-family split remains explicit through route/open normalization transfer.
  - Wrapper/canonical normalization is carried into crosswalk and wiring docs.
  - Timestamp/run/thread fallback logic is marked compatibility-only.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_selector_fallback_drift
reasoning_tier: high
context_scope: route_selector_ref_family_normalization
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Crosswalk.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: route_selector_normalization_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0029
preserved_exact_tokens:
  - "selector precedence"
  - "reject rules"
  - "closed tab_id vocabulary"
  - "scoped resolver rules"
  - "ref-family split"
  - "wrapper/canonical normalization"
compatibility_only_notes:
  - "Timestamp/run/thread fallback logic is compatibility-only inside route/open contracts."
negative_constraints:
  - "Timestamp/run/thread fallback logic must not become primary route/open identity."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-071 - Blocked Runtime Owner Transfer Set

```yaml
plan_unit_id: CV-071
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  execution_role, requested_account_id, operational_identity, account-switch and
  pressure ownership, blocked_sequence minting, startup recovery handshake, and
  DAE jail/approval policy transfer into their owner and consumer docs, with
  usage switch-history and usage execution-role follow-through preserved.
gui_related: false
gui_classification_reason: This unit defines runtime identity and blocked-state owner transfer requirements.
split_recommended: true
depends_on: [CV-016, CV-019, CV-029, CV-053]
unblocks: [CV-072]
acceptance_criteria:
  - execution_role, requested_account_id, and operational_identity transfer into owner and consumer docs.
  - Account-switch and pressure ownership, blocked_sequence minting, startup recovery handshake, and DAE jail/approval policy are preserved.
  - Usage switch-history and usage execution-role follow-through are carried forward.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_runtime_owner_transfer_loss
reasoning_tier: high
context_scope: blocked_runtime_owner_transfer
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/human-in-the-loop.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: blocked_runtime_owner_transfer_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0030
preserved_exact_tokens:
  - "execution_role"
  - "requested_account_id"
  - "operational_identity"
  - "blocked_sequence"
  - "DAE jail/approval policy"
  - "usage switch-history"
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-072 - Blocked Episode Approval Scope Boundary

```yaml
plan_unit_id: CV-072
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Blocked-episode approval scope is separate from session-wide policy scope,
  and approval lineage stays keyed to blocked-episode identity fields run_id,
  node_id, blocked_sequence, and attempt_id? rather than inferred from
  session-wide policy state.
gui_related: false
gui_classification_reason: This unit defines approval scope and lineage keys.
split_recommended: true
depends_on: [CV-029, CV-071]
unblocks: [CV-073]
acceptance_criteria:
  - Blocked-episode approval scope is separate from session-wide policy scope.
  - Approval lineage is keyed to run_id, node_id, blocked_sequence, and attempt_id?.
  - Session-wide policy state is not used to infer blocked-episode approval lineage.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: approval_scope_lineage_collapse
reasoning_tier: high
context_scope: blocked_episode_approval_scope
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/human-in-the-loop.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: approval_scope_boundary_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0030
preserved_exact_tokens:
  - "`run_id`"
  - "`node_id`"
  - "`blocked_sequence`"
  - "`attempt_id?`"
negative_constraints:
  - "Approval lineage must not be inferred from session-wide policy state."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-073 - Durable Approver Identity Events

```yaml
plan_unit_id: CV-073
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Approval and rejection records/events persist durable approver identity fields,
  and /events, /history, and /rejection audit views read those records so they
  can explain who approved or declined rather than only that approval state
  changed.
gui_related: true
gui_classification_reason: This unit affects user-visible audit views for approval and rejection history.
split_recommended: true
depends_on: [CV-029, CV-072]
unblocks: [CV-082]
acceptance_criteria:
  - Approval and rejection records/events persist durable approver identity fields.
  - /events, /history, and /rejection audit views read durable approver identity.
  - Audit views explain who approved or declined rather than only that approval state changed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: durable_approver_identity_loss
reasoning_tier: high
context_scope: durable_approver_identity_events
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/human-in-the-loop.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: approver_identity_event_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0030
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0031
preserved_exact_tokens:
  - "approver identity fields"
  - "`/events`"
  - "`/history`"
  - "`/rejection`"
negative_constraints:
  - "Audit views must not only report that an approval state changed when durable approver identity is available."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-074 - Lifecycle Reason Code Fields

```yaml
plan_unit_id: CV-074
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Debug and investigation lifecycle events that affect stop, retry, resume, or
  user-attention state carry stop_reason_code, attention_required_reason_code,
  and budget_kind fields when applicable so storage, UI, exported bundles, and
  prompt assembly preserve the same machine-readable reason without parsing
  prose.
gui_related: true
gui_classification_reason: This unit affects UI-visible lifecycle reasons and exported/prompt-facing user-attention state.
split_recommended: true
depends_on: [CV-026, CV-044]
unblocks: []
acceptance_criteria:
  - Lifecycle events affecting stop, retry, resume, or user-attention state carry machine-readable reason fields when applicable.
  - stop_reason_code, attention_required_reason_code, and budget_kind are preserved for storage, UI, exported bundles, and prompt assembly.
  - Consumers do not need to parse prose to recover lifecycle reasons.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: lifecycle_reason_prose_parsing
reasoning_tier: high
context_scope: lifecycle_reason_code_fields
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: lifecycle_reason_code_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0031
preserved_exact_tokens:
  - "`stop_reason_code`"
  - "`attention_required_reason_code`"
  - "`budget_kind`"
negative_constraints:
  - "Lifecycle reason recovery must not depend on parsing prose."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-075 - Task Lifecycle Durability Over Projections

```yaml
plan_unit_id: CV-075
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Task lifecycle events persist in thread history and storage through the
  canonical event stream; task cards and thread projections may render
  subagent/task progress, HITL, plan/TODO transitions, and completion or blocked
  outcomes, but those projections do not replace durable event records.
gui_related: true
gui_classification_reason: This unit governs user-visible task cards and thread projections against durable event records.
split_recommended: true
depends_on: [CV-026, CV-044]
unblocks: [CV-077]
acceptance_criteria:
  - Task lifecycle events persist in thread history and storage through the canonical event stream.
  - Task cards and thread projections may render task progress, HITL, plan/TODO transitions, and outcomes.
  - Task cards and thread projections do not replace durable event records.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: task_projection_persistence_confusion
reasoning_tier: high
context_scope: task_lifecycle_event_durability
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: task_lifecycle_durability_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0031
preserved_exact_tokens:
  - "thread history"
  - "canonical event stream"
  - "task cards"
  - "thread projections"
  - "plan/TODO transitions"
negative_constraints:
  - "Task cards and thread projections do not replace durable event records."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-076 - Seglog Event Family Coverage

```yaml
plan_unit_id: CV-076
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  The Seglog contract continues to cover 10 event families: tools, usage, HITL,
  plan/todo, subagent, rollback, persona, background, runtime lifecycle, and
  recovery/blocked-state events.
gui_related: false
gui_classification_reason: This unit defines persisted event family coverage.
split_recommended: true
depends_on: [CV-026, CV-044]
unblocks: [CV-078]
acceptance_criteria:
  - Seglog coverage remains 10 event families.
  - tools, usage, HITL, plan/todo, subagent, rollback, persona, background, runtime lifecycle, and recovery/blocked-state are preserved.
  - Event family coverage stays visible to storage and event-stream consumers.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: seglog_family_coverage_loss
reasoning_tier: standard
context_scope: seglog_event_family_coverage
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: seglog_event_family_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0031
preserved_exact_tokens:
  - "10 event families"
  - "tools"
  - "usage"
  - "HITL"
  - "plan/todo"
  - "subagent"
  - "rollback"
  - "persona"
  - "background"
  - "runtime lifecycle"
  - "recovery/blocked-state events"
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-077 - Bundle Annotation And Selection Handoff

```yaml
plan_unit_id: CV-077
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Document annotation events reuse the existing bundle-note event family for
  durable annotation lifecycle and audit transitions, while
  bundle.selection_sent_to_chat is a separate event that prepares visible chat
  context with requested/effective target, provenance, and bounded selection
  excerpt without mutating durable annotation state by itself.
gui_related: true
gui_classification_reason: This unit affects visible chat handoff and annotation-state projections.
split_recommended: true
depends_on: [CV-075]
unblocks: [CV-082]
acceptance_criteria:
  - Document annotation events reuse the bundle-note event family for durable annotation lifecycle and audit transitions.
  - bundle.selection_sent_to_chat remains a separate event from durable annotation state changes.
  - Selection handoff payloads include requested chat target, effective resolved target, document provenance, and bounded selection excerpt.
  - Selection handoff prepares visible chat context but does not mutate durable annotation state by itself.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: bundle_selection_annotation_state_confusion
reasoning_tier: high
context_scope: bundle_annotation_selection_handoff
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: bundle_selection_handoff_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0031
preserved_exact_tokens:
  - "`bundle-note`"
  - "`bundle.selection_sent_to_chat`"
  - "requested chat target"
  - "effective resolved target"
  - "document provenance"
  - "bounded selection excerpt"
negative_constraints:
  - "bundle.selection_sent_to_chat must not mutate durable annotation state by itself."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-078 - Runtime Event Catalog Boundary

```yaml
plan_unit_id: CV-078
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts registers persisted event names, producer/consumer boundaries, and
  cross-contract payload minima, while storage-plan owns concrete persisted
  payload schemas, segment/projector mechanics, retention, and janitor cleanup.
gui_related: false
gui_classification_reason: This unit defines persisted event catalog ownership boundaries.
split_recommended: true
depends_on: [CV-026, CV-044, CV-076]
unblocks: [CV-079, CV-080, CV-081, CV-082, CV-083]
acceptance_criteria:
  - Contracts_V0 registers persisted event names, producer/consumer boundaries, and cross-contract payload minima.
  - storage-plan owns concrete persisted payload schemas, segment/projector mechanics, retention, and janitor cleanup.
  - Event family payload detail remains with the producer docs named by the runtime event catalog.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: event_catalog_payload_owner_drift
reasoning_tier: high
context_scope: runtime_event_catalog_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: runtime_event_catalog_boundary_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0032
preserved_exact_tokens:
  - "persisted event names"
  - "producer/consumer boundaries"
  - "cross-contract payload minima"
  - "segment/projector mechanics"
  - "retention"
  - "janitor cleanup"
negative_constraints:
  - "Contracts_V0 must not re-own concrete persisted event-type payload schemas that storage-plan owns."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-079 - Core Execution Tool Worktree Event Minima

```yaml
plan_unit_id: CV-079
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Core runtime event minima preserve seglog.event_appended, run.started,
  run.completed, node.started, node.completed, tool.execution_started,
  tool.execution_completed, worktree.created, and worktree.deleted identity,
  outcome, evidence/artifact, and cleanup fields.
gui_related: false
gui_classification_reason: This unit defines persisted runtime event payload minima.
split_recommended: true
depends_on: [CV-078]
unblocks: []
acceptance_criteria:
  - seglog.event_appended preserves seq, appended event type, event_ref, segment_ref, writer_id?, and ts minima.
  - run.*, node.*, and tool.execution_* events preserve the listed runtime identity, attempt, outcome, evidence/artifact, usage/result, and timing minima.
  - worktree.created and worktree.deleted preserve worktree identity, branch/path, cleanup reason, grace period, lock and safe-point fields.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: core_runtime_event_minima_loss
reasoning_tier: high
context_scope: core_execution_tool_worktree_event_minima
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: runtime_event_minima_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0032
preserved_exact_tokens:
  - "`seglog.event_appended`"
  - "`run.started`"
  - "`run.completed`"
  - "`node.started`"
  - "`node.completed`"
  - "`tool.execution_started`"
  - "`tool.execution_completed`"
  - "`worktree.created`"
  - "`worktree.deleted`"
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-080 - Gate Event Score Ownership

```yaml
plan_unit_id: CV-080
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Gate event payload minima preserve gate identity, runtime identity, score?,
  score_threshold?, failure_reason_code, and evidence refs; when score fields
  are exposed, they reference Executor_Protocol dispatch score tuples while
  Progression_Gates remains semantic owner for gate evaluation rules.
gui_related: false
gui_classification_reason: This unit defines gate event payload and owner boundaries.
split_recommended: true
depends_on: [CV-060, CV-078]
unblocks: []
acceptance_criteria:
  - gate.evaluation_started, gate.passed, and gate.failed preserve gate/runtime/attempt/score/evidence minima.
  - score? and score_threshold? reference the Executor_Protocol dispatch score tuple.
  - Progression_Gates remains the semantic owner for gate evaluation rules.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: gate_event_score_owner_drift
reasoning_tier: high
context_scope: gate_event_score_ownership
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: gate_event_score_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0032
preserved_exact_tokens:
  - "`gate.evaluation_started`"
  - "`gate.passed`"
  - "`gate.failed`"
  - "`score?`"
  - "`score_threshold?`"
  - "`failure_reason_code`"
negative_constraints:
  - "Contracts_V0 gate event payloads must not re-own Progression_Gates evaluation semantics."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-081 - LSP Platform Memory Lifecycle Events

```yaml
plan_unit_id: CV-081
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Runtime event catalog minima preserve lsp.server.lifecycle_changed,
  platform.capability_evaluated, and memory.gist_state_changed; legacy
  lsp.server_started and lsp.server_crashed normalize to
  lsp.server.lifecycle_changed with state and state_reason? rather than forking
  a second LSP lifecycle family.
gui_related: false
gui_classification_reason: This unit defines non-visual lifecycle event normalization.
split_recommended: true
depends_on: [CV-078]
unblocks: []
acceptance_criteria:
  - lsp.server.lifecycle_changed preserves platform/root/session/state payload minima.
  - platform.capability_evaluated and memory.gist_state_changed preserve capability and verification-state minima.
  - Legacy lsp.server_started and lsp.server_crashed normalize to lsp.server.lifecycle_changed.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: lifecycle_event_alias_forking
reasoning_tier: high
context_scope: lsp_platform_memory_lifecycle_events
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/LSPSupport.md
  - Plans/newtools.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/assistant-memory-subsystem.md
node_compile_hint:
  mode: lifecycle_event_normalization_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0032
preserved_exact_tokens:
  - "`lsp.server.lifecycle_changed`"
  - "`platform.capability_evaluated`"
  - "`memory.gist_state_changed`"
  - "`lsp.server_started`"
  - "`lsp.server_crashed`"
  - "`state_reason?`"
compatibility_only_notes:
  - "Legacy lsp.server_started and lsp.server_crashed normalize to lsp.server.lifecycle_changed."
negative_constraints:
  - "Producers must not fork a second LSP lifecycle family when the normalized event can carry the transition."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-082 - Bundle Revision And Approval Event Minima

```yaml
plan_unit_id: CV-082
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Runtime event catalog minima preserve bundle annotation, selection, revision,
  and approval requested/granted/denied/timeout events, including bundle/doc and
  annotation/revision identity, requested/effective capability or chat target,
  approval_scope_key, ordered allowed_action_ids[], approver_identity, rationale
  or denial reason, timeout class, and safe_point_id? where applicable.
gui_related: true
gui_classification_reason: This unit affects user-visible bundle, chat, approval, and audit event projections.
split_recommended: true
depends_on: [CV-073, CV-077, CV-078]
unblocks: []
acceptance_criteria:
  - bundle.annotation_state_changed, bundle.selection_sent_to_chat, and bundle.revision_requested preserve their listed identity and target/capability minima.
  - approval.requested, approval.granted, approval.denied, and approval.timeout preserve blocked approval scope and identity minima.
  - allowed_action_ids[], approval_scope_key, approver_identity, and safe_point_id? remain explicit where applicable.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: bundle_approval_event_minima_loss
reasoning_tier: high
context_scope: bundle_revision_approval_event_minima
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
  - Plans/human-in-the-loop.md
node_compile_hint:
  mode: bundle_approval_event_minima_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0032
preserved_exact_tokens:
  - "`bundle.annotation_state_changed`"
  - "`bundle.selection_sent_to_chat`"
  - "`bundle.revision_requested`"
  - "`approval.requested`"
  - "`approval.granted`"
  - "`approval.denied`"
  - "`approval.timeout`"
  - "`allowed_action_ids[]`"
  - "`approval_scope_key`"
  - "`approver_identity`"
  - "`safe_point_id?`"
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-083 - Append Observability Retention Boundary

```yaml
plan_unit_id: CV-083
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  seglog.event_appended records append observability only and must not replace
  the appended event itself; runtime event records may carry ttl_policy_ref?,
  retention_anchor_kind?, and retention_anchor_at_utc?, while storage owns TTL
  defaults, max-cardinality bounds, janitor cleanup triggers, legal-hold
  exceptions, and the prohibition on inferring retention from file mtime.
gui_related: false
gui_classification_reason: This unit defines persistence and retention ownership boundaries.
split_recommended: true
depends_on: [CV-078]
unblocks: []
acceptance_criteria:
  - seglog.event_appended is append observability only.
  - Runtime event records may carry ttl_policy_ref?, retention_anchor_kind?, and retention_anchor_at_utc?.
  - Storage owns default TTL values, max-cardinality bounds, janitor cleanup triggers, and legal-hold exceptions.
  - Retention is not inferred from file mtime.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: append_observability_retention_boundary_drift
reasoning_tier: high
context_scope: append_observability_retention_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: append_observability_retention_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0032
preserved_exact_tokens:
  - "`seglog.event_appended`"
  - "`ttl_policy_ref?`"
  - "`retention_anchor_kind?`"
  - "`retention_anchor_at_utc?`"
  - "legal-hold exceptions"
  - "file mtime"
negative_constraints:
  - "seglog.event_appended must not replace the appended event itself."
  - "Retention defaults, bounds, janitor cleanup, and legal-hold exceptions must not be inferred from file mtime."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-084 - Assistant Worktree Event Ownership

```yaml
plan_unit_id: CV-084
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Assistant worktree seglog events keep assistant-worktree lifecycle local while
  shared record ownership points back to storage canonical records instead of
  restating those record families locally.
gui_related: false
gui_classification_reason: This unit defines assistant worktree event ownership boundaries.
split_recommended: true
depends_on: [CV-078]
unblocks: [CV-085, CV-086]
acceptance_criteria:
  - Assistant worktree lifecycle events remain local to the assistant-worktree event family.
  - Shared record ownership points back to storage canonical records.
  - Contracts links to storage-plan canonical record families instead of restating them locally.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: assistant_worktree_record_owner_duplication
reasoning_tier: standard
context_scope: assistant_worktree_event_ownership
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: assistant_worktree_event_owner_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0033
preserved_exact_tokens:
  - "assistant-worktree lifecycle"
  - "Plans/storage-plan.md#Canonical records"
  - "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-chat-design.md"
negative_constraints:
  - "Assistant worktree events must not restate storage canonical record families locally."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-085 - Assistant Worktree Name Normalization

```yaml
plan_unit_id: CV-085
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Assistant worktree event names use underscore-separated chat.thread_worktree_*
  names that match existing chat seglog convention; dot-namespaced proposals
  such as chat.thread.worktree_bound are migration/review aliases only and MUST
  normalize before persistence.
gui_related: false
gui_classification_reason: This unit defines persisted event naming normalization.
split_recommended: true
depends_on: [CV-084]
unblocks: [CV-086]
acceptance_criteria:
  - chat.thread_worktree_* underscore names are canonical for persisted assistant worktree events.
  - Dot-namespaced assistant worktree names remain migration/review aliases only.
  - Producers normalize dot-namespaced aliases before persistence.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: assistant_worktree_event_name_alias_persistence
reasoning_tier: high
context_scope: assistant_worktree_event_name_normalization
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: assistant_worktree_event_name_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0033
preserved_exact_tokens:
  - "`chat.thread_created`"
  - "`chat.thread_archived`"
  - "`chat.thread_deleted`"
  - "`chat.thread_worktree_*`"
  - "`chat.thread.worktree_bound`"
compatibility_only_notes:
  - "Dot-namespaced assistant worktree proposals are migration/review aliases only."
negative_constraints:
  - "Dot-namespaced assistant worktree aliases must not persist without normalization."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-086 - Assistant Worktree Event Registrations

```yaml
plan_unit_id: CV-086
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Minimum assistant worktree event registrations preserve bound, unbound,
  renamed, create_failed, merged, merge_failed, pr_created, pr_failed,
  pre_merge_test_started, pre_merge_test_passed, and pre_merge_test_failed
  payloads, and chat.thread_worktree_pr_failed.phase is the exact enum
  push | api.
gui_related: false
gui_classification_reason: This unit defines persisted assistant worktree event registration payloads.
split_recommended: true
depends_on: [CV-084, CV-085]
unblocks: []
acceptance_criteria:
  - All minimum chat.thread_worktree_* event registrations from the source table are preserved.
  - Event payload minima include thread_id, worktree_id, branch/path/target, strategy, command/test details, result, error, conflict, duration, and override fields where listed.
  - chat.thread_worktree_pr_failed.phase uses the exact enum push | api with preserved meaning.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: assistant_worktree_event_registration_loss
reasoning_tier: high
context_scope: assistant_worktree_event_registrations
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: assistant_worktree_event_registration_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0033
preserved_exact_tokens:
  - "`chat.thread_worktree_bound`"
  - "`chat.thread_worktree_unbound`"
  - "`chat.thread_worktree_renamed`"
  - "`chat.thread_worktree_create_failed`"
  - "`chat.thread_worktree_merged`"
  - "`chat.thread_worktree_merge_failed`"
  - "`chat.thread_worktree_pr_created`"
  - "`chat.thread_worktree_pr_failed`"
  - "`chat.thread_worktree_pre_merge_test_started`"
  - "`chat.thread_worktree_pre_merge_test_passed`"
  - "`chat.thread_worktree_pre_merge_test_failed`"
  - "`push | api`"
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-087 - EventEnvelopeV1 Compatibility Envelope

```yaml
plan_unit_id: CV-087
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  EventEnvelopeV1 is a minimal intermediate compatibility envelope with ts,
  seq, type, and payload; writers should include run_id and thread_id whenever
  available, readers must tolerate both envelope shapes, and projectors should
  upgrade in-memory to EventRecord form.
gui_related: false
gui_classification_reason: This unit defines event envelope compatibility fields and reader/writer behavior.
split_recommended: true
depends_on: [CV-002, CV-060]
unblocks: [CV-088, CV-089]
acceptance_criteria:
  - EventEnvelopeV1 preserves ts, seq, type, and payload as the minimal envelope.
  - Writers should include run_id and thread_id whenever available.
  - Readers tolerate both envelope shapes and projectors upgrade in-memory to EventRecord form.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: event_envelope_compatibility_break
reasoning_tier: standard
context_scope: event_envelope_v1_compatibility
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: event_envelope_compatibility_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0034
preserved_exact_tokens:
  - "`EventEnvelopeV1`"
  - "`ts`"
  - "`seq`"
  - "`type`"
  - "`payload`"
  - "`run_id`"
  - "`thread_id`"
  - "`EventRecord`"
  - "ContractRef: ContractName:Plans/Contracts_V0.md#EventEnvelopeV1, PolicyRule:Decision_Policy.md§2"
compatibility_only_notes:
  - "EventEnvelopeV1 is the minimal compatibility envelope used by some plans as an intermediate format."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-088 - EventRecord Payload Schema Ownership Split

```yaml
plan_unit_id: CV-088
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts_V0 owns the canonical persisted EventRecord envelope and
  cross-cutting auth/event contracts, while storage-plan owns concrete
  persisted event-type payload schemas so writers, projectors, analytics, and
  generated docs share one payload SSOT.
gui_related: false
gui_classification_reason: This unit defines persisted event schema ownership boundaries.
split_recommended: true
depends_on: [CV-078, CV-087]
unblocks: []
acceptance_criteria:
  - Contracts_V0 owns EventRecord and cross-cutting auth/event contracts.
  - storage-plan owns concrete persisted event-type payload schemas.
  - Writers, projectors, analytics, and generated docs share one payload SSOT.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: event_payload_schema_owner_split_drift
reasoning_tier: high
context_scope: eventrecord_payload_schema_owner_split
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: eventrecord_schema_owner_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0034
preserved_exact_tokens:
  - "`EventRecord`"
  - "Payload schema ownership"
  - "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#EventRecord"
negative_constraints:
  - "Concrete persisted event-type payload schemas must not be moved out of storage-plan ownership."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-089 - Provider Stream Persistence Boundary

```yaml
plan_unit_id: CV-089
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Providers emit a normalized stream for live UI consumption; persistent
  storage remains governed by EventRecord; CLI_Bridged_Providers owns the full
  normalized provider stream schema, while Contracts_V0 asserts the boundary
  that normalized provider stream events are transport-facing and seglog events
  are persistence-facing.
gui_related: true
gui_classification_reason: This unit affects live UI consumption of provider stream events.
split_recommended: true
depends_on: [CV-002, CV-087]
unblocks: [CV-090, CV-091, CV-092]
acceptance_criteria:
  - Provider normalized streams serve live UI consumption.
  - Persistent storage remains governed by EventRecord.
  - CLI_Bridged_Providers owns the full normalized provider stream schema.
  - Contracts_V0 preserves the transport-facing versus persistence-facing boundary.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_stream_persistence_boundary_confusion
reasoning_tier: high
context_scope: provider_stream_persistence_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Provider_OpenCode.md
  - Plans/Tools.md
node_compile_hint:
  mode: provider_stream_persistence_boundary_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0035
preserved_exact_tokens:
  - "normalized stream"
  - "live UI consumption"
  - "`EventRecord`"
  - "transport-facing"
  - "persistence-facing"
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/Tools.md"
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-090 - Unified Provider Facade Across Transports

```yaml
plan_unit_id: CV-090
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  CLI-bridged, server-bridged, and direct-provider implementations conform to
  one unified Provider facade/trait contract with capability flags and
  tool-policy inputs defined at the Provider boundary.
gui_related: false
gui_classification_reason: This unit defines provider runtime boundary contracts.
split_recommended: true
depends_on: [CV-089]
unblocks: [CV-091, CV-092, CV-093]
acceptance_criteria:
  - CLI-bridged providers conform to the unified Provider facade/trait.
  - Server-bridged providers conform to the unified Provider facade/trait.
  - Direct-provider integrations conform to the unified Provider facade/trait.
  - Capability flags and tool-policy inputs are defined at the Provider boundary.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_facade_transport_forking
reasoning_tier: high
context_scope: unified_provider_facade_transports
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Provider_OpenCode.md
  - Plans/Tools.md
node_compile_hint:
  mode: provider_facade_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0035
preserved_exact_tokens:
  - "CLI-bridged"
  - "server-bridged"
  - "direct-provider"
  - "Provider facade/trait"
  - "capability flags"
  - "tool-policy inputs"
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-091 - Provider Consumer Normalization And Tool Access

```yaml
plan_unit_id: CV-091
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  UI and orchestrator consumers must not special-case provider transport or
  brand beyond configuration fields; provider-originated events and tool-call
  lifecycle signals normalize before consumers or persistence mapping; PM
  bundling and PM skill tool access remain available regardless of provider
  transport.
gui_related: true
gui_classification_reason: This unit constrains UI provider consumption and user-visible tool access behavior.
split_recommended: true
depends_on: [CV-089, CV-090]
unblocks: [CV-096]
acceptance_criteria:
  - UI and orchestrator consumers do not special-case provider transport or brand beyond configuration fields.
  - Provider-originated events and tool-call lifecycle signals normalize before reaching consumers or persistence mapping.
  - PM bundling and PM skill tool access are preserved regardless of provider transport.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_consumer_transport_special_casing
reasoning_tier: high
context_scope: provider_consumer_normalization_tool_access
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Provider_OpenCode.md
  - Plans/Tools.md
node_compile_hint:
  mode: provider_consumer_normalization_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0035
preserved_exact_tokens:
  - "UI and orchestrator consumers"
  - "provider transport"
  - "provider brand"
  - "provider configuration fields"
  - "PM bundling"
  - "PM skill tool access"
negative_constraints:
  - "UI and orchestrator consumers must not special-case provider transport or provider brand beyond provider configuration fields."
  - "Transport selection must not remove built-in PM tool availability."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-092 - Provider Transport Version Governance

```yaml
plan_unit_id: CV-092
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Provider and stream seams require explicit contract-version governance, and a
  transport adapter must not invent adapter-local shadow fields for actor,
  account, or trust categories before a contract-versioned owner path exists
  for persistence or UI projections.
gui_related: false
gui_classification_reason: This unit defines provider contract governance and adapter field boundaries.
split_recommended: true
depends_on: [CV-089, CV-090]
unblocks: [CV-093, CV-094, CV-096]
acceptance_criteria:
  - Provider and stream seams have explicit contract-version governance.
  - Transport adapters do not invent adapter-local actor/account/trust shadow fields.
  - New provider fields have a contract-versioned owner path before persistence or UI projections consume them.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_transport_shadow_field_drift
reasoning_tier: high
context_scope: provider_transport_version_governance
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Provider_OpenCode.md
  - Plans/Models_System.md
node_compile_hint:
  mode: provider_transport_governance_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0036
preserved_exact_tokens:
  - "contract-version governance"
  - "actor/account/trust categories"
  - "adapter-local shadow fields"
negative_constraints:
  - "A transport adapter must not invent adapter-local shadow fields for actor/account/trust categories."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-093 - Provider Transport Enum And Class Mapping

```yaml
plan_unit_id: CV-093
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Provider transport classes are CLI-bridged, server-bridged, and
  direct-provider, and the canonical implementation enum is ProviderTransport =
  CliBridge | DirectApi | ServerBridge with CliBridge mapping to CLI-bridged,
  DirectApi mapping to direct-provider, and ServerBridge mapping to
  server-bridged.
gui_related: false
gui_classification_reason: This unit defines provider transport enum and class mapping.
split_recommended: true
depends_on: [CV-090, CV-092]
unblocks: [CV-094, CV-095, CV-096]
acceptance_criteria:
  - Provider transport classes are CLI-bridged, server-bridged, and direct-provider.
  - ProviderTransport = CliBridge | DirectApi | ServerBridge is the canonical implementation enum.
  - CliBridge, DirectApi, and ServerBridge retain their exact class mappings.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_transport_enum_mapping_drift
reasoning_tier: standard
context_scope: provider_transport_enum_mapping
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Provider_OpenCode.md
  - Plans/Models_System.md
node_compile_hint:
  mode: provider_transport_enum_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0036
preserved_exact_tokens:
  - "ProviderTransport = CliBridge | DirectApi | ServerBridge"
  - "`CliBridge`"
  - "`DirectApi`"
  - "`ServerBridge`"
  - "CLI-bridged"
  - "direct-provider"
  - "server-bridged"
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-094 - Provider Support-State And Provenance Dispositions

```yaml
plan_unit_id: CV-094
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Provider support-state projections use closed values native,
  native_projected, and projected; direct-provider catalog candidates such as
  Alibaba, MiniMax, and Z.AI remain lower-confidence until a primary-source pass
  confirms direct-provider shape; legacy CLI/runtime outputs plus CLI
  auth/import notes are migration provenance while /import, /runtime, PM skill
  access, and copilot_github auth realm are preserved.
gui_related: true
gui_classification_reason: This unit affects provider support-state projections visible to UI/help surfaces.
split_recommended: true
depends_on: [CV-092, CV-093]
unblocks: []
acceptance_criteria:
  - Provider support-state projections use native, native_projected, and projected.
  - Alibaba, MiniMax, and Z.AI remain lower-confidence until primary-source confirmation.
  - Legacy CLI/runtime outputs plus CLI auth/import notes remain migration provenance.
  - /import, /runtime, PM skill access, and copilot_github auth realm are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_support_state_provenance_drift
reasoning_tier: high
context_scope: provider_support_state_provenance
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Provider_OpenCode.md
  - Plans/Models_System.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: provider_support_state_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0036
preserved_exact_tokens:
  - "`native`"
  - "`native_projected`"
  - "`projected`"
  - "Alibaba"
  - "MiniMax"
  - "Z.AI"
  - "`/import`"
  - "`/runtime`"
  - "`copilot_github`"
compatibility_only_notes:
  - "Legacy CLI/runtime outputs plus CLI auth/import notes are migration provenance."
negative_constraints:
  - "Unverified direct-provider catalog candidates must not be promoted as first-class PM direct providers."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-095 - Transport-Specific Stream Completion Rules

```yaml
plan_unit_id: CV-095
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Server-bridged providers use HTTP REST endpoints and SSE event streams,
  CLI-bridged providers use CLI event outputs and adapter parsing, and
  direct-provider integrations may use provider HTTP/gRPC endpoints directly
  while emitting the same normalized event types; Gemini/Vertex requires schema
  sanitizer and post-tool loop evidence, and OpenCode EXEC adapters enumerate
  terminal finish reasons before marking a stream complete.
gui_related: false
gui_classification_reason: This unit defines provider transport and stream-completion runtime rules.
split_recommended: true
depends_on: [CV-093]
unblocks: []
acceptance_criteria:
  - Server-bridged, CLI-bridged, and direct-provider transport-specific notes are preserved.
  - Direct-provider integrations emit the same normalized event types.
  - Gemini/Vertex uses schema sanitizer and post-tool loop rules, and finish_reason alone is insufficient evidence of completion.
  - OpenCode EXEC adapters distinguish content-filter, safety, and unknown empty-content terminal cases before marking streams complete.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_stream_completion_rule_loss
reasoning_tier: high
context_scope: transport_specific_stream_completion
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Provider_OpenCode.md
  - Plans/Models_System.md
node_compile_hint:
  mode: provider_stream_completion_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0036
preserved_exact_tokens:
  - "HTTP REST endpoints"
  - "SSE event streams"
  - "CLI event outputs"
  - "provider HTTP/gRPC endpoints"
  - "`text_delta`"
  - "`tool_use`"
  - "`tool_result`"
  - "`usage`"
  - "`done`"
  - "`Gemini/Vertex`"
  - "`FinishReasonContentFilter`"
  - "`FinishReasonSafety`"
  - "`FinishReasonUnknown`"
negative_constraints:
  - "Provider finish_reason alone is not sufficient evidence that tool execution, tool-result ingestion, or response continuation is complete."
  - "FinishReasonUnknown with empty content is an error path rather than normal completion."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-096 - Provider Consumption And Platform Vocabulary Safety

```yaml
plan_unit_id: CV-096
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Consumers do not branch on provider transport class because all provider
  output is consumed through the unified normalized stream, and
  vocabulary-safe persisted contracts must not replace requested_platform or
  effective_platform with provider_entry_id, which may accompany but not rewrite
  requested/effective platform fields.
gui_related: false
gui_classification_reason: This unit defines provider consumption and persisted vocabulary constraints rather than visual presentation.
split_recommended: true
depends_on: [CV-091, CV-092, CV-093]
unblocks: []
acceptance_criteria:
  - Consumers do not branch on transport class.
  - All provider output is consumed through the unified normalized stream.
  - requested_platform and effective_platform are not replaced with provider_entry_id.
  - provider_entry_id may accompany but not rewrite requested/effective platform fields.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_platform_vocabulary_rewrite
reasoning_tier: high
context_scope: provider_consumption_platform_vocabulary
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Provider_OpenCode.md
  - Plans/Models_System.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: provider_platform_vocabulary_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0036
preserved_exact_tokens:
  - "unified normalized stream"
  - "`requested_platform`"
  - "`effective_platform`"
  - "`provider_entry_id`"
  - "ContractRef: ContractName:Plans/Provider_OpenCode.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Models_System.md"
negative_constraints:
  - "Consumers must not branch on transport class."
  - "Vocabulary-safe persisted contracts must not replace requested_platform or effective_platform with provider_entry_id."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-097 - Tool Invoked Attribution Payload

```yaml
plan_unit_id: CV-097
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  tool.invoked persisted payloads carry runtime/tool/artifact attribution
  directly, including attempt_id as the canonical local runtime anchor and
  explicit subordinate bridge refs such as provider_attempt_ref and
  usage_event_ref.
gui_related: false
gui_classification_reason: This unit defines persisted tool invocation payload identity rather than GUI presentation.
split_recommended: true
depends_on: [CV-038, CV-060, CV-078]
unblocks: [CV-111]
acceptance_criteria:
  - tool.invoked payloads preserve node_id, attempt_id, lane_id, package_id, execution_role, effective_account_id, operational_identity, tool_use_id, provider_attempt_ref, and usage_event_ref.
  - Analytics-thin tool events are rejected as insufficient.
  - Requested identity fields may accompany effective identity without replacing effective_account_id or operational_identity.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: tool_invoked_attribution_underkeying
reasoning_tier: high
context_scope: tool_invoked_attribution_payload
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Tools.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: tool_event_payload_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0037
preserved_exact_tokens:
  - "`tool.invoked`"
  - "`node_id`"
  - "`attempt_id`"
  - "`tool_use_id`"
  - "`provider_attempt_ref`"
  - "`usage_event_ref`"
  - "`requested_account_id?`"
  - "`actor_kind`"
  - "ContractRef: EventType:tool.invoked, EventType:tool.denied, ContractName:Plans/Contracts_V0.md"
  - "ContractRef: Plans/Tools.md#8.0 Event payloads (seglog), Plans/Runtime_Artifacts_Panel.md#Cross-Surface Operation Receipt Linkage Addendum (2026-03-12)"
negative_constraints:
  - "Analytics-thin tool events are no longer sufficient."
  - "Provider-side bridge refs must stay subordinate to attempt_id."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-098 - Tool Denied Attribution Payload

```yaml
plan_unit_id: CV-098
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  tool.denied payloads preserve the same runtime/tool/artifact attribution
  envelope for denied actions so permission and policy denials remain
  explainable without consumer-local actor or account fields.
gui_related: false
gui_classification_reason: This unit defines denied tool event payload identity rather than visual presentation.
split_recommended: true
depends_on: [CV-038, CV-078, CV-097]
unblocks: [CV-111]
acceptance_criteria:
  - tool.denied payloads preserve node_id, attempt_id, lane_id, package_id, execution_role, effective_account_id, operational_identity, tool_use_id, provider_attempt_ref, and usage_event_ref.
  - Permission and denial surfaces expose effective actor and account identity.
  - Requested account, permission, or policy routing fields preserve the rejected request envelope.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: tool_denied_attribution_loss
reasoning_tier: high
context_scope: tool_denied_attribution_payload
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Tools.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: tool_denied_payload_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0037
preserved_exact_tokens:
  - "`tool.denied`"
  - "`effective_account_id`"
  - "`operational_identity`"
  - "`requested_account_binding?`"
  - "`actor_ref?`"
  - "ContractRef: Plans/Tools.md#8.0 Event payloads (seglog), Plans/Runtime_Artifacts_Panel.md#Cross-Surface Operation Receipt Linkage Addendum (2026-03-12)"
negative_constraints:
  - "Denial consumers must not invent local actor fields."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-099 - Auditor Cycle Report Event Payload

```yaml
plan_unit_id: CV-099
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Requirements-quality workflow state persists as stable event payload fields
  anchored to auditor_cycle_report and launch handoff lineage. Legacy
  validation_pass_report records are compatibility mirrors only with
  compatibility_only true and cycle_report_ref, and pass_verdict supports
  skipped where the compatibility flow requires it.
gui_related: false
gui_classification_reason: This unit defines persisted validation workflow event payloads.
split_recommended: true
depends_on: [CV-039, CV-060]
unblocks: []
acceptance_criteria:
  - auditor_cycle_report, workflow_run_id, pass_verdict, and verdict_reason fields are canonical.
  - Legacy validation_pass_report mirrors preserve pass_number and pass_name only with compatibility_only true and cycle_report_ref.
  - Phase plan, staged bundle, requirements quality report, runtime identity, and run lineage fields are preserved.
  - pass_verdict supports skipped where the flow requires it.
  - Accepted or final pass output bridges into launched execution.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: validation_pass_event_lineage_loss
reasoning_tier: high
context_scope: auditor_cycle_report_event_payload
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Project_Output_Artifacts.md
  - Plans/chain-wizard-flexibility.md
node_compile_hint:
  mode: validation_pass_event_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0037
preserved_exact_tokens:
  - "`auditor_cycle_report`"
  - "`validation_pass_report`"
  - "`cycle_report_ref`"
  - "`compatibility_only`"
  - "`workflow_run_id`"
  - "`pass_number`"
  - "`pass_verdict`"
  - "`phase_plan_ref`"
  - "`staged_bundle_ref`"
  - "`requirements_quality_report_ref`"
  - "ContractRef: Plans/Project_Output_Artifacts.md#POA-045, Plans/chain-wizard-flexibility.md#12. Auditor Invariant Loop (Mandatory Invariant Sweep)"
negative_constraints:
  - "Pass reports must stay upstream artifacts rather than masquerading as runtime attempts."
  - "validation_pass_report must not become an active fixed-pass scheduler or model-setting contract."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-100 - Inspection Refs And Resume Transport Boundary

```yaml
plan_unit_id: CV-100
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Inspection and provenance refs stay attached to persisted events and records,
  while resume_url is transport-only serialized route_target and must not
  replace route/open navigation identity or become interchangeable with
  detail_ref and report_ref.
gui_related: false
gui_classification_reason: This unit defines event reference and route transport boundaries.
split_recommended: true
depends_on: [CV-057, CV-069, CV-070]
unblocks: []
acceptance_criteria:
  - detail_ref, report_ref, evidence_ref, usage_event_ref, workflow_refs, docker_refs, and kubernetes_refs stay event/record payload fields.
  - route/open contracts own navigation identity.
  - resume_url remains transport-only serialized resume/open handoff.
  - detail_ref, report_ref, and resume_url are not treated as interchangeable open-this-thing fields.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: inspection_ref_route_transport_confusion
reasoning_tier: high
context_scope: inspection_refs_resume_transport
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: inspection_ref_route_boundary_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0037
preserved_exact_tokens:
  - "`detail_ref`"
  - "`report_ref`"
  - "`evidence_ref`"
  - "`workflow_refs`"
  - "`docker_refs`"
  - "`kubernetes_refs`"
  - "`resume_url`"
  - "`route_target`"
  - "ContractRef: Plans/storage-plan.md#4.4 Activity transparency payloads, Plans/Contracts_V0.md#7.3 `route_target`"
negative_constraints:
  - "detail_ref, report_ref, and resume_url are not interchangeable open-this-thing fields."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-101 - Tool-Specific Payload Extension Owner And Lineage

```yaml
plan_unit_id: CV-101
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts owns tool-specific payload extensions for /Runtime, /web,
  /tools/chat, and /section consumers, preserving transfer lineage and
  obligations while retaining /retire lineage only as evidence when stale
  aliases are replaced.
gui_related: false
gui_classification_reason: This unit defines tool payload extension ownership and migration lineage.
split_recommended: true
depends_on: [CV-078]
unblocks: [CV-102, CV-103, CV-107, CV-111, CV-115]
acceptance_criteria:
  - Tool-specific payload extension ownership for /Runtime, /web, /tools/chat, and /section is preserved.
  - Transfer lineage tokens for assistant worktree, common web output, question schema, and listed obligations remain audit-visible.
  - /retire lineage is evidence only when stale aliases are replaced.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: tool_payload_extension_owner_drift
reasoning_tier: standard
context_scope: tool_specific_payload_extension_owner
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Tools.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: tool_payload_extension_owner_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0038
preserved_exact_tokens:
  - "`/Runtime`"
  - "`/web`"
  - "`/tools/chat`"
  - "`/section`"
  - "`obl-043`"
  - "`obl-044`"
  - "`obl-054`"
  - "`obl-055`"
  - "`obl-056`"
  - "`obl-066`"
  - "`obl-068`"
  - "`obl-009`"
  - "`obl-021`"
  - "`obl-040`"
compatibility_only_notes:
  - "/retire lineage is retained only as evidence when stale aliases are replaced."
negative_constraints:
  - "Retired aliases are not live canon."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-102 - WebAction Carry-Through Compatibility Fields

```yaml
plan_unit_id: CV-102
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  /WebAction/web-output/error carry-through keeps question responses, WebAction
  output, and web error payloads aligned on the canonical fields answers,
  answer_text?, value?, description?, tool_use_id, and adapter_id rather than
  creating separate local schemas.
gui_related: false
gui_classification_reason: This unit defines shared payload compatibility fields.
split_recommended: true
depends_on: [CV-101]
unblocks: []
acceptance_criteria:
  - 'answers[] remains compatibility shorthand for answers: Array<{question_id, values: string[]}>.'
  - 'answer_text?, value?: string, description?: string, tool_use_id, and adapter_id remain canonical payload fields.'
  - Compatibility shorthand is normalized before persistence.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: webaction_payload_schema_fork
reasoning_tier: standard
context_scope: webaction_carry_through_fields
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Tools.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: webaction_compatibility_payload_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0038
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0040
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0044
preserved_exact_tokens:
  - "`/WebAction/web-output/error`"
  - "`answers[]`"
  - "`answers: Array<{question_id, values: string[]}>`"
  - "`answer_text?`"
  - "`value?: string`"
  - "`description?: string`"
  - "`tool_use_id`"
  - "`adapter_id`"
compatibility_only_notes:
  - "answers[] is compatibility shorthand for answers: Array<{question_id, values: string[]}>."
negative_constraints:
  - "Compatibility shorthand must not persist as a separate schema."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-103 - Common Web Provenance Provider And Execution Path Fields

```yaml
plan_unit_id: CV-103
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Common web payloads carry provenance, provider, adapter, cache/rate-limit,
  support metadata, and execution_path facts so routing and audit consumers can
  distinguish provider and PM execution paths without inferring execution from
  display labels.
gui_related: true
gui_classification_reason: This unit affects web activity displays and user-visible provenance badges.
split_recommended: true
depends_on: [CV-101]
unblocks: [CV-104, CV-105, CV-111]
acceptance_criteria:
  - source_refs[], citation_refs[], provenance_refs[], requested_provider, effective_provider, adapter_id, provider_attempt_ref?, cache_state, and rate_limit_state are preserved.
  - /batch, anti-bot, and /stability support metadata are preserved when providers expose those facts.
  - execution_path?: string preserves the listed provider and PM execution paths.
  - Routing and audit consumers do not infer execution from display labels.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: web_provenance_execution_path_loss
reasoning_tier: high
context_scope: common_web_provenance_execution_path
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Tools.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: web_provenance_provider_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0039
preserved_exact_tokens:
  - "`source_refs[]`"
  - "`citation_refs[]`"
  - "`provenance_refs[]`"
  - "`requested_provider`"
  - "`effective_provider`"
  - "`adapter_id`"
  - "`cache_state`"
  - "`rate_limit_state`"
  - "`provider_search_native`"
  - "`pm_research_composed`"
negative_constraints:
  - "Routing and audit consumers must not infer execution from display labels."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-104 - Provider-Backed Web Fields And Firecrawl Alias Retirement

```yaml
plan_unit_id: CV-104
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Provider-backed web adapters may report subordinate provider fields, while
  Firecrawl-specific fields remain PM web output payload extensions and legacy
  scrape_id is retired as an incorrect alias rather than becoming a separate
  Firecrawl-owned event family.
gui_related: false
gui_classification_reason: This unit defines provider-backed payload fields and alias retirement.
split_recommended: true
depends_on: [CV-103]
unblocks: []
acceptance_criteria:
  - credits_used, provider request IDs, and provider-cache outcomes remain subordinate to the PM web output contract.
  - firecrawl_credits_used, firecrawl_cache_state, and firecrawl_scrape_id remain the exact Firecrawl-specific subordinate fields.
  - legacy scrape_id is retained only as a retired incorrect alias.
  - Firecrawl-specific fields do not create a separate Firecrawl-owned event family.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: firecrawl_event_family_fork
reasoning_tier: high
context_scope: provider_backed_web_firecrawl_fields
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Tools.md
node_compile_hint:
  mode: web_provider_field_compatibility_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0039
preserved_exact_tokens:
  - "`credits_used`"
  - "`firecrawl_credits_used`"
  - "`firecrawl_cache_state`"
  - "`firecrawl_scrape_id`"
  - "`creditsUsed`"
  - "`metadata.cacheState`"
  - "`data.metadata.scrapeId`"
  - "`scrape_id`"
compatibility_only_notes:
  - "legacy scrape_id is a retired incorrect alias."
negative_constraints:
  - "Firecrawl-specific subordinate fields are payload extensions under this contract, not a separate Firecrawl-owned event family."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-105 - Web Input Quality And Provenance Badge Contract

```yaml
plan_unit_id: CV-105
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Web output preserves result_quality_hint, structured web_input, and
  underscore provenance_badge values for stable joins across contracts, storage,
  and web activity displays, while provider_scrape remains a proposed extension
  caveat where narrowed locked sets are required.
gui_related: true
gui_classification_reason: This unit affects web activity display provenance and quality labels.
split_recommended: true
depends_on: [CV-103]
unblocks: [CV-112]
acceptance_criteria:
  - result_quality_hint preserves search_snippets_only, extracted_pages, site_reader_pages, and research_synthesis.
  - web_input remains a structured object for routing, audit, replay, and provenance joins.
  - provenance_badge uses canonical underscore values for stable joins.
  - provider_scrape remains marked as a provider-specific proposed extension pending harmonization where narrowed locked sets are required.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: web_provenance_badge_drift
reasoning_tier: high
context_scope: web_input_quality_provenance_badge
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: web_quality_provenance_badge_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0039
preserved_exact_tokens:
  - "`result_quality_hint`"
  - "`search_snippets_only`"
  - "`extracted_pages`"
  - "`site_reader_pages`"
  - "`research_synthesis`"
  - "`web_input`"
  - "`provenance_badge`"
  - "`site_reader`"
  - "`provider_scrape`"
compatibility_only_notes:
  - "provider_scrape is retained as a provider-specific proposed extension pending Part P provenance-badge harmonization."
negative_constraints:
  - "web_input is not a preview string and must not be flattened into display text."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-106 - Prompt-Based Web Action Payload Cost Dimensions

```yaml
plan_unit_id: CV-106
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Prompt-based web action payloads use prompt: string for natural-language
  browser or research instructions, keep the action path agent-friendly, and
  record provider cost dimensions such as credits per /min or /clicks/extracts
  when providers report them.
gui_related: false
gui_classification_reason: This unit defines prompt-based web action payload fields.
split_recommended: true
depends_on: [CV-103]
unblocks: []
acceptance_criteria:
  - Prompt-based web action payloads use prompt: string.
  - Browser and research action paths remain agent-friendly.
  - Provider cost dimensions are recorded when providers report them.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: prompt_web_action_payload_loss
reasoning_tier: standard
context_scope: prompt_based_web_action_payload
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Tools.md
node_compile_hint:
  mode: prompt_web_action_payload_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0039
preserved_exact_tokens:
  - "`prompt: string`"
  - "`/min`"
  - "`/clicks/extracts`"
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-107 - Question Lifecycle Runtime UI State Mapping

```yaml
plan_unit_id: CV-107
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Question and /questionnaire payloads share one lifecycle contract that maps
  runtime pending/active outcomes to UI lifecycle states without losing
  terminal or explicitly restorable question outcomes.
gui_related: true
gui_classification_reason: This unit defines user-visible question and questionnaire lifecycle states.
split_recommended: true
depends_on: [CV-101]
unblocks: [CV-108, CV-109, CV-110]
acceptance_criteria:
  - Allowed flow states draft, incomplete, ready_to_submit, submitted, and paused are preserved.
  - Runtime state transitions from pending to active and from active to answered, submitted, dismissed, or expired are preserved.
  - UI lifecycle mapping from runtime state to draft, incomplete, ready_to_submit, submitted, and paused is preserved.
  - answered, submitted, dismissed, and expired remain terminal or explicitly restorable according to the owning surface.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: question_lifecycle_state_drift
reasoning_tier: high
context_scope: question_lifecycle_runtime_ui_mapping
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: question_lifecycle_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0040
preserved_exact_tokens:
  - "`draft`"
  - "`incomplete`"
  - "`ready_to_submit`"
  - "`submitted`"
  - "`paused`"
  - "`pending`"
  - "`active`"
  - "`answered`"
  - "`dismissed`"
  - "`expired`"
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-108 - Structured Question Responses And Option Wire Format

```yaml
plan_unit_id: CV-108
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Question responses use structured answers arrays, locked option object-array
  wire format, and distinct draft_value? and default_values? fields owned by
  Contracts; chat renders and collects these fields without owning the contract
  semantics.
gui_related: true
gui_classification_reason: This unit affects user-visible question rendering and response collection.
split_recommended: true
depends_on: [CV-102, CV-107]
unblocks: []
acceptance_criteria:
  - 'Structured multi-answer submission uses answers: Array<{question_id, values: string[], source?: "option" | "other" | "freeform"}>.'
  - 'Question item/action payload fields preserve question_id, draft_value?, default_values?, response_kind, validation_state, value?: string, description?: string, tool_use_id, adapter_id, and adapter_selection_reason.'
  - 'options format is locked as Array<{id: string, label: string, description?: string}>.'
  - string[] remains backwards-compatible only for legacy single_question inputs and is auto-expanded before persistence or rendering.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: question_response_wire_format_drift
reasoning_tier: high
context_scope: structured_question_response_options
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
node_compile_hint:
  mode: question_response_wire_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0040
preserved_exact_tokens:
  - "answers: Array<{question_id, values: string[], source?: \"option\" | \"other\" | \"freeform\"}>"
  - "`draft_value?`"
  - "`default_values?`"
  - "options?: Array<{id, label, description?}>"
  - "Array<{id: string, label: string, description?: string}>"
  - "`response_kind?: \"selection\" | \"freeform\" | \"mixed\"`"
  - "`validation_state?: \"valid\" | \"invalid\" | \"pending\"`"
compatibility_only_notes:
  - "string[] remains backwards-compatible only for legacy single_question inputs."
negative_constraints:
  - "Chat renders and collects these fields, but does not own the contract itself, the canonical field list, or the resolution semantics."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-109 - Question Envelope Alias And Clarification Event Normalization

```yaml
plan_unit_id: CV-109
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Question envelopes normalize allow_other to allow_freeform, and the persisted
  requirements.clarification_requested event carries blocked requirements
  lineage into the questionnaire payload and answers contract before persistence
  or resolution.
gui_related: false
gui_classification_reason: This unit defines question envelope compatibility and persisted clarification events.
split_recommended: true
depends_on: [CV-099, CV-108]
unblocks: []
acceptance_criteria:
  - Question input envelopes preserve mode single_question or questionnaire and the allowed output status values.
  - allow_other is accepted only as a compatibility input and normalized to allow_freeform before persistence, validation, or rendering.
  - requirements.clarification_requested carries wizard_id, thread_id, and question_ids[] from the blocked requirements report.
  - Legacy single-question tool shapes normalize into the questionnaire payload and answers[] contract.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: question_alias_persistence_drift
reasoning_tier: high
context_scope: question_envelope_clarification_event
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Project_Output_Artifacts.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: question_alias_clarification_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0040
preserved_exact_tokens:
  - "`mode: \"single_question\" | \"questionnaire\"`"
  - "`allow_other`"
  - "`allow_freeform`"
  - "`requirements.clarification_requested`"
  - "`wizard_id`"
  - "`thread_id`"
  - "`question_ids[]`"
  - "`header?: string`"
  - "`text: string`"
  - "`answer: string`"
compatibility_only_notes:
  - "allow_other is a deprecated alias for canonical allow_freeform."
negative_constraints:
  - "Deprecated allow_other must not persist as canonical."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-110 - Subagent Question Escalation Prohibition

```yaml
plan_unit_id: CV-110
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Subagents must not invoke the question tool to address users directly; they
  escalate to the parent orchestrator, and the parent decides whether to surface
  the question to the user.
gui_related: false
gui_classification_reason: This unit defines orchestration authority for user-facing questions.
split_recommended: true
depends_on: [CV-107]
unblocks: []
acceptance_criteria:
  - Subagents do not invoke the question tool to address users directly.
  - Subagents escalate user questions to the parent orchestrator.
  - Parent orchestrator owns the decision to surface the question to the user.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: subagent_direct_user_question
reasoning_tier: high
context_scope: subagent_question_escalation
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: subagent_question_escalation_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0040
preserved_exact_tokens:
  - "Subagents MUST NOT invoke the `question` tool"
  - "assistant-chat-design.md §15.2"
negative_constraints:
  - "Subagents must not address users directly through the question tool."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-111 - Web Operation Tool Event Family Boundary

```yaml
plan_unit_id: CV-111
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Web operations use the existing tool.invoked and tool.denied event families;
  web.operation and web.operation.* vocabulary is reserved for payload
  classification only, with web-specific fields under payload.meta.
gui_related: false
gui_classification_reason: This unit defines persisted web operation event family boundaries.
split_recommended: true
depends_on: [CV-097, CV-098, CV-101]
unblocks: [CV-112]
acceptance_criteria:
  - Successful or attempted-completed web operations use tool.invoked.
  - Policy or user-denied web operations use tool.denied.
  - web.operation / web.operation.* is payload classification only.
  - Web-specific fields live under payload.meta.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: web_operation_event_family_fork
reasoning_tier: high
context_scope: web_operation_tool_event_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Tools.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: web_operation_event_family_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0041
preserved_exact_tokens:
  - "`tool.invoked`"
  - "`tool.denied`"
  - "`web.operation`"
  - "`web.operation.*`"
  - "`payload.meta`"
negative_constraints:
  - "Creating a parallel web.operation.* seglog event family is prohibited unless a future analytics contract explicitly introduces one."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-112 - Web Operation Invoked And Denied Meta Fields

```yaml
plan_unit_id: CV-112
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Web operation payload.meta preserves invoked result hints and denial meta
  fields as lightweight previews, counts, enum-like routing/provenance values,
  and stable error codes for websearch, webextract, webresearch, webcrawl, and
  webmap operations.
gui_related: false
gui_classification_reason: This unit defines event meta fields for web operations.
split_recommended: true
depends_on: [CV-105, CV-111]
unblocks: [CV-113, CV-114]
acceptance_criteria:
  - tool.invoked.payload.meta preserves common web fields including web_operation, web_input_preview, support_tier, execution_path, adapter IDs, projection state, fallback flags, counts, quality hints, warnings, and error_code.
  - Operation-specific hints are preserved for websearch, webextract, webresearch, webcrawl, and webmap.
  - tool.denied.payload.meta preserves web operation, input preview, requested adapter, projection, blocked reason, allowed_action_ids[]?, and headless_denied?.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: web_operation_meta_field_loss
reasoning_tier: high
context_scope: web_operation_meta_fields
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Tools.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: web_operation_meta_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0041
preserved_exact_tokens:
  - "`web_operation`"
  - "`web_input_preview`"
  - "`support_tier`"
  - "`execution_path`"
  - "`projection_freshness?`"
  - "`provider_fallback_occurred`"
  - "`warnings_count?: number`"
  - "`blocked_reason_code?`"
  - "`allowed_action_ids[]?`"
  - "`headless_denied?`"
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-113 - Provider Fallback Audit Disclosure

```yaml
plan_unit_id: CV-113
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Provider fallback caused by rate-limit or outage records the failed provider,
  cause, and next same-operation provider attempted, and audit wording matches
  chat activity fallback disclosure rather than hiding the route behind
  effective_adapter_id.
gui_related: true
gui_classification_reason: This unit affects user-visible chat activity fallback disclosure.
split_recommended: true
depends_on: [CV-112]
unblocks: []
acceptance_criteria:
  - provider_fallback_summary? records failed provider, cause, and next same-operation provider.
  - rate-limit and outage causes remain explicit.
  - Audit wording matches chat activity fallback disclosure.
  - Fallback route is not hidden behind effective_adapter_id.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_fallback_audit_obscured
reasoning_tier: high
context_scope: provider_fallback_audit_disclosure
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
  - Plans/Tools.md
node_compile_hint:
  mode: provider_fallback_audit_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0041
preserved_exact_tokens:
  - "`provider_fallback_summary?`"
  - "`rate-limit`"
  - "`outage`"
  - "`effective_adapter_id`"
negative_constraints:
  - "Fallback route must not be hidden behind effective_adapter_id."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-114 - Web Payload Size Ref Blob And Batch Audit Boundary

```yaml
plan_unit_id: CV-114
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Full extracted page bodies, long research synthesis notes, large source sets,
  crawl page inventories, and map graph payloads move by ref or /blob, while
  batch web operations preserve one parent audit event and child audit events
  per URL.
gui_related: false
gui_classification_reason: This unit defines event payload size and batch audit boundaries.
split_recommended: true
depends_on: [CV-112]
unblocks: []
acceptance_criteria:
  - Large web payload bodies move by ref or /blob rather than being duplicated into every event projection.
  - Batch web operations preserve a parent audit event for batch-level tool use, routing metadata, adapter selection, and aggregate status.
  - Child audit events preserve URL-level status, provider attempt refs, cache fields, and error/provenance metadata.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: web_payload_event_bloat
reasoning_tier: high
context_scope: web_payload_ref_blob_batch_audit
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: web_payload_size_boundary_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0041
preserved_exact_tokens:
  - "`/blob`"
  - "parent audit event"
  - "child audit events"
  - "`pages_returned_count?`"
  - "`max_depth?`"
negative_constraints:
  - "Full web payloads must not be duplicated into every event projection."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-115 - Runtime Snapshot And Tool Chat Payload Fields

```yaml
plan_unit_id: CV-115
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Tool payloads consumed by storage, tools, and chat carry runtime_snapshot,
  task_id, subagent_type, resumed, chat.plan_todo_updated, /turn, /todo, and
  /tokens when those fields participate in runtime or chat projection, and the
  snapshot fields remain cross-cutting payload extensions.
gui_related: false
gui_classification_reason: This unit defines runtime and chat payload fields.
split_recommended: true
depends_on: [CV-026, CV-044, CV-101]
unblocks: [CV-116, CV-117, CV-118]
acceptance_criteria:
  - runtime_snapshot, task_id, subagent_type, resumed, chat.plan_todo_updated, /turn, /todo, and /tokens fields are preserved where they participate in projection.
  - Storage, tools, and chat consume the shared payload extension fields.
  - Runtime snapshot fields are cross-cutting payload extensions rather than local tool-result decorations.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_snapshot_payload_field_loss
reasoning_tier: high
context_scope: runtime_snapshot_tool_chat_payloads
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: runtime_snapshot_tool_chat_payload_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0042
preserved_exact_tokens:
  - "`runtime_snapshot`"
  - "`task_id`"
  - "`subagent_type`"
  - "`resumed`"
  - "`chat.plan_todo_updated`"
  - "`/turn`"
  - "`/todo`"
  - "`/tokens`"
negative_constraints:
  - "Runtime snapshot fields must remain cross-cutting payload extensions rather than local tool-result decorations."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-116 - Subagent Namespace And PM Lineage Envelope

```yaml
plan_unit_id: CV-116
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Subagent lifecycle payloads use the canonical subagent.* event family without
  a chat. prefix, and request/completion variants preserve the same PM lineage
  envelope instead of creating a parallel chat namespace.
gui_related: false
gui_classification_reason: This unit defines runtime event namespace compatibility for subagents.
split_recommended: true
depends_on: [CV-115]
unblocks: []
acceptance_criteria:
  - subagent.* remains the canonical subagent lifecycle event family.
  - Legacy chat.subagent_* aliases normalize to subagent.*.
  - subagent.spawn_requested and subagent.spawn_completed preserve the same PM lineage envelope as subagent.spawned and subagent.completed.
  - PM lineage envelope fields include run_id, thread_id, agent_id, parent_run_id?, child_run_id?, parent_thread_id?, and requested/effective runtime descriptors.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: subagent_event_namespace_fork
reasoning_tier: high
context_scope: subagent_namespace_lineage_envelope
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: subagent_namespace_compatibility_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0042
preserved_exact_tokens:
  - "`subagent.*`"
  - "`chat.subagent_*`"
  - "`chat.subagent_`"
  - "`chat.subagent_spawned`"
  - "`subagent.spawn_requested`"
  - "`subagent.spawn_completed`"
  - "`run_id`"
  - "`agent_id`"
  - "`parent_run_id?`"
  - "`child_run_id?`"
compatibility_only_notes:
  - "legacy chat.subagent_* aliases normalize to subagent.*."
negative_constraints:
  - "Subagent lifecycle payloads must not create a parallel chat namespace."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-117 - Chat Plan TODO Mutation Schema

```yaml
plan_unit_id: CV-117
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  chat.plan_todo_updated persists durable TODO field mutations with plan_id,
  todo_id, field, old_value, new_value, and source so creation, removal, or
  reordering events retain identity, changed field, old/new values, and mutation
  source.
gui_related: true
gui_classification_reason: This unit affects visible chat plan/TODO mutation projections.
split_recommended: true
depends_on: [CV-115]
unblocks: []
acceptance_criteria:
  - chat.plan_todo_updated minimal payload schema includes plan_id, todo_id, field, old_value, new_value, and source.
  - Structural item creation, removal, or reordering may emit one event per affected todo_id.
  - Every mutation event retains plan_id, changed field, old_value, new_value, and source.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: chat_todo_mutation_identity_loss
reasoning_tier: standard
context_scope: chat_plan_todo_mutation_schema
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: chat_plan_todo_mutation_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0042
preserved_exact_tokens:
  - "`chat.plan_todo_updated`"
  - "`plan_id`"
  - "`todo_id`"
  - "`field`"
  - "`old_value`"
  - "`new_value`"
  - "source: \"agent\" | \"user\""
negative_constraints:
  - "Mutation events must not drop plan_id, changed field, old_value, new_value, or source."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-118 - Investigation And Browser Evidence Reference-First Rule

```yaml
plan_unit_id: CV-118
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Verbose investigation and browser evidence payloads are reference-first by
  default; raw logs, full trace payloads, full DOM dumps, request /response
  bodies, cookies, /storage values, and binary blobs must not auto-inline into
  model context unless an owner contract grants a bounded preview or explicit
  attachment path.
gui_related: false
gui_classification_reason: This unit defines context and artifact payload safety boundaries.
split_recommended: true
depends_on: [CV-115]
unblocks: [CV-124]
acceptance_criteria:
  - Raw logs, full trace payloads, full DOM dumps, request /response bodies, cookies, /storage values, and binary blobs are reference-first by default.
  - Raw evidence does not auto-inline into model context.
  - Bounded preview or explicit attachment paths require an owner contract.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: raw_evidence_context_inline
reasoning_tier: high
context_scope: investigation_browser_evidence_reference_first
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: evidence_reference_first_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0042
preserved_exact_tokens:
  - "raw logs"
  - "full trace payloads"
  - "full DOM dumps"
  - "request `/response` bodies"
  - "cookies"
  - "`/storage` values"
  - "binary blobs"
negative_constraints:
  - "Verbose investigation and browser evidence payloads must not auto-inline into model context unless an owner contract grants a bounded preview or explicit attachment path."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-119 - Owner Hint Advisory Resolution Lifecycle

```yaml
plan_unit_id: CV-119
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  owner_hint begins as advisory tool output and becomes effective only through
  crew or delegation resolution records that write owner_hint_advisory and
  owner_hint_resolved, including concrete model/persona, Persona, provider, or
  role binding mappings.
gui_related: false
gui_classification_reason: This unit defines delegation resolution payload lifecycle.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - owner_hint starts as advisory tool output.
  - Resolution records preserve owner_hint_advisory and owner_hint_resolved.
  - Effective resolution records include concrete model/persona mapping when resolution selects a provider, model, Persona, or role binding.
  - Delegation resolution is the advisory-to-effective lifecycle trigger.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: owner_hint_effective_trigger_drift
reasoning_tier: standard
context_scope: owner_hint_resolution_payload
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: owner_hint_resolution_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0043
preserved_exact_tokens:
  - "`owner_hint`"
  - "`owner_hint_advisory`"
  - "`owner_hint_resolved`"
  - "`/model/persona`"
  - "Persona"
  - "role binding"
negative_constraints:
  - "The advisory-to-effective lifecycle trigger is delegation resolution, not a user action."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-120 - Web Error Core Taxonomy And Provider Mapping

```yaml
plan_unit_id: CV-120
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  The web error applicability table remains canonical and aligned with
  provider-to-PM error mapping, including Firecrawl-specific HTTP and provider
  errors mapped to PM canonical codes exactly as specified.
gui_related: false
gui_classification_reason: This unit defines web error taxonomy mappings.
split_recommended: true
depends_on: [CV-103, CV-111]
unblocks: [CV-121, CV-122]
acceptance_criteria:
  - The per-contract web error applicability table remains required canon.
  - Firecrawl-specific HTTP and provider errors map to PM canonical error codes exactly as specified.
  - HTTP and provider mappings preserve adapter_unavailable, rate_limited, timeout, content_not_found, invalid_input, crawl_robots_blocked, content_blocked, and content_too_large.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: web_error_mapping_drift
reasoning_tier: high
context_scope: web_error_core_taxonomy
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Tools.md
node_compile_hint:
  mode: web_error_taxonomy_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0044
preserved_exact_tokens:
  - "`adapter_unavailable`"
  - "`rate_limited`"
  - "`timeout`"
  - "`content_not_found`"
  - "`invalid_input`"
  - "`crawl_robots_blocked`"
  - "`content_too_large`"
negative_constraints:
  - "Firecrawl-specific HTTP and provider errors must map to PM canonical error codes exactly as specified."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-121 - Legacy Web Error Alias Normalization

```yaml
plan_unit_id: CV-121
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Legacy web-operation error aliases normalize into the canonical web error
  taxonomy instead of creating a parallel web-specific code family, including
  no_eligible_adapter normalizing to adapter_unavailable when no configured
  provider can perform the operation.
gui_related: false
gui_classification_reason: This unit defines legacy web error alias normalization.
split_recommended: true
depends_on: [CV-120]
unblocks: []
acceptance_criteria:
  - Listed legacy web_* aliases normalize into canonical web error taxonomy values.
  - 'projection_too_stale becomes projection_freshness: "stale" plus refresh-first/retry handling rather than a web error code.'
  - crawl_limit_reached becomes crawl_depth_exceeded only when a depth cap stops traversal.
  - Web-specific legacy codes are deduplicated into the one canonical table.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: legacy_web_error_parallel_family
reasoning_tier: high
context_scope: legacy_web_error_alias_normalization
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Tools.md
node_compile_hint:
  mode: web_error_alias_compatibility_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0044
preserved_exact_tokens:
  - "`web_timeout`"
  - "`web_dns_failure`"
  - "`web_tls_error`"
  - "`web_provider_error`"
  - "`web_http_4xx`"
  - "`web_http_5xx`"
  - "`web_parse_failure`"
  - "`empty_result`"
  - "`projection_too_stale`"
  - "`crawl_limit_reached`"
  - "`no_eligible_adapter`"
compatibility_only_notes:
  - "Legacy web-operation error aliases normalize into this canonical taxonomy."
negative_constraints:
  - "Legacy web error aliases must not create a parallel web-specific code family."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-122 - Change Tracking Informational Outcome And Closed Error Set

```yaml
plan_unit_id: CV-122
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  change_tracking with no previous cached fetch returns informational
  change_status: "new" and no_previous_version in warnings[] rather than
  error_code, while the closed source error-code set remains preserved.
gui_related: false
gui_classification_reason: This unit defines web result outcome and error-code semantics.
split_recommended: true
depends_on: [CV-120]
unblocks: []
acceptance_criteria:
  - content_not_found covers HTTP 404 or equivalent not-found URL responses.
  - 'change_tracking with no previous cached fetch returns change_status: "new" and no_previous_version in warnings[].'
  - no_previous_version is not treated as error_code in that informational case.
  - The closed web error list from the source span remains preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: web_change_tracking_false_error
reasoning_tier: standard
context_scope: change_tracking_closed_error_set
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Tools.md
node_compile_hint:
  mode: web_change_tracking_error_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0044
preserved_exact_tokens:
  - "`change_tracking`"
  - "change_status: \"new\""
  - "`warnings[]`"
  - "`no_previous_version`"
  - "`unsupported_operation`"
  - "`schema_too_large`"
  - "`autonomous_budget_exceeded`"
  - "`map_no_sitemap`"
  - "`sitemap_parse_error`"
negative_constraints:
  - "When change_tracking has no previous cached fetch, the result is informational, not error_code."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-123 - Debug Investigation Event Family Registration

```yaml
plan_unit_id: CV-123
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  debug.investigation.* events use persisted EventRecord envelopes with stable
  type values and minimum payloads; Assistant Chat consumes that event family
  for status and visibility but does not duplicate payload ownership.
gui_related: false
gui_classification_reason: This unit defines persisted debug investigation event registrations.
split_recommended: true
depends_on: [CV-078]
unblocks: [CV-124]
acceptance_criteria:
  - debug.investigation.started, state_changed, target_bound, context_item_added, context_item_state_changed, instrumentation_state_changed, verification_recorded, exported, and imported events are preserved.
  - Minimum payload fields for investigation identity, target, context, instrumentation, verification, export, and import are preserved.
  - Assistant Chat consumes status and visibility but does not duplicate payload ownership.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_investigation_event_registration_loss
reasoning_tier: high
context_scope: debug_investigation_event_family
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: debug_investigation_event_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0045
preserved_exact_tokens:
  - "`debug.investigation.started`"
  - "`debug.investigation.state_changed`"
  - "`debug.investigation.target_bound`"
  - "`debug.investigation.context_item_added`"
  - "`debug.investigation.instrumentation_state_changed`"
  - "`debug.investigation.verification_recorded`"
  - "`debug.investigation.exported`"
  - "`debug.investigation.imported`"
  - "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/assistant-chat-design.md"
negative_constraints:
  - "Assistant Chat must not duplicate debug investigation payload ownership."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-124 - Debug Payload Redaction And Raw Material Refs

```yaml
plan_unit_id: CV-124
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Debug investigation payloads must not duplicate raw secrets, raw log dumps,
  raw trace blobs, or raw binary artifact bytes; raw material moves through
  artifact or blob refs, and bounded summaries preserve redaction and omission
  state.
gui_related: false
gui_classification_reason: This unit defines debug payload safety and redaction constraints.
split_recommended: true
depends_on: [CV-118, CV-123]
unblocks: []
acceptance_criteria:
  - Raw secrets, raw log dumps, raw trace blobs, and raw binary artifact bytes are not duplicated inside debug investigation payloads.
  - Raw material is referenced through artifact or blob refs owned by the appropriate artifact system.
  - Bounded summaries preserve redaction and omission state.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_payload_secret_duplication
reasoning_tier: high
context_scope: debug_payload_redaction_refs
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: debug_payload_redaction_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0045
preserved_exact_tokens:
  - "raw secrets"
  - "raw log dumps"
  - "raw trace blobs"
  - "raw binary artifact bytes"
  - "`artifact_ref?`"
  - "`redaction_state`"
  - "ContractRef: PolicyRule:no_secrets_in_storage, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Prompt_Pipeline.md"
negative_constraints:
  - "Raw sensitive material must not be duplicated inside debug investigation payloads."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-125 - AuthState Snapshot And Omitted Optional Fields

```yaml
plan_unit_id: CV-125
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  AuthState is the canonical persisted and evented auth snapshot for a provider
  subject, recording selected identity, readiness state, and provider-owned
  optional dimensions while omitting fields that do not apply instead of
  null-padding them.
gui_related: false
gui_classification_reason: This unit defines persisted auth snapshot fields and anchor preservation.
split_recommended: true
depends_on: [CV-014, CV-020]
unblocks: [CV-126, CV-127, CV-128, CV-129, CV-130]
acceptance_criteria:
  - AuthState anchor and canonical snapshot role are preserved.
  - The OpenCode server-profile example fields remain available for exact-text audit.
  - account_id, selected_billing_entity_id, auth_realm, and auth_surface are omitted when they do not apply.
  - Omitted auth fields are not null-padded.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: authstate_null_padding_drift
reasoning_tier: high
context_scope: authstate_snapshot_omitted_fields
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Multi-Account.md
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: authstate_snapshot_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0045
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0046
preserved_exact_tokens:
  - "<a id=\"AuthState\"></a>"
  - "`AuthState`"
  - "`provider = opencode`"
  - "`subject_kind = server_profile`"
  - "`connection_profile_id = opencode-main`"
  - "`auth_job_state = LoggedIn`"
  - "`readiness_state = Ready`"
  - "`updated_at = 2026-03-23T00:00:00Z`"
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md"
negative_constraints:
  - "Fields that do not apply must be omitted rather than null-padded."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-126 - Auth Subject Billing And Server Profile Fields

```yaml
plan_unit_id: CV-126
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Auth subject identity, selected billing entity, auth realm/surface,
  connection profile, and server-profile fields follow provider-specific rules
  without placeholder backfill, including external OpenCode server profile rows.
gui_related: false
gui_classification_reason: This unit defines auth subject and billing entity field requirements.
split_recommended: true
depends_on: [CV-125]
unblocks: []
acceptance_criteria:
  - subject_kind, account_id, and connection_profile_id follow provider-specific rules.
  - selected_billing_entity_id is conditionally required only when quota bucket depends on entity selection.
  - auth_realm and auth_surface are provider-owned optional fields omitted when unused.
  - Attached external OpenCode providers use provider = opencode-external and subject_kind = external_server with a stable provider_identity.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: auth_subject_optional_field_drift
reasoning_tier: high
context_scope: auth_subject_billing_server_profile
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Multi-Account.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: auth_subject_billing_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0046
preserved_exact_tokens:
  - "`account_id`"
  - "`selected_billing_entity_id`"
  - "`auth_realm`"
  - "`auth_surface`"
  - "`launch_mode = managed_server | attach_existing`"
  - "`provider = opencode-external`"
  - "`subject_kind = external_server`"
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/usage-feature.md"
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Multi-Account.md"
negative_constraints:
  - "Consumers must not restate a looser optional-field rule for selected_billing_entity_id."
  - "Provider-owned optional fields must not be backfilled with placeholder values."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-127 - Auth Family Surface Separation And Credential Refresh

```yaml
plan_unit_id: CV-127
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  auth_family values and mixed auth-surface separation are explicit, and
  provider calls that depend on expiring credentials refresh by check-before-use
  before each provider call, with reactive refresh after 401 only as fallback
  recovery.
gui_related: false
gui_classification_reason: This unit defines auth routing and credential refresh behavior.
split_recommended: true
depends_on: [CV-125, CV-126]
unblocks: []
acceptance_criteria:
  - auth_family canonical values include api_key, oauth_user, vertex_adc, vertex_service_account, vertex_api_key, subscription, chatgpt_oauth, server_managed, or provider-specific equivalent.
  - Mixed account pools keep OAuth and API-key credentials separate where providers expose them.
  - Provider calls refresh credentials first when within the provider-defined pre-expiry window, defaulting to 20% of remaining lifetime where no stronger owner contract exists.
  - Reactive refresh after 401 remains fallback recovery, and no background timer is required.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: auth_surface_refresh_drift
reasoning_tier: high
context_scope: auth_family_surface_refresh
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Multi-Account.md
  - Plans/Prompt_Pipeline.md
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: auth_family_refresh_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0046
preserved_exact_tokens:
  - "`auth_family`"
  - "`api_key`"
  - "`oauth_user`"
  - "`vertex_adc`"
  - "`subscription`"
  - "`chatgpt_oauth`"
  - "`server_managed`"
  - "`20%`"
  - "`401`"
negative_constraints:
  - "OAuth and API-key-derived accounts are not interchangeable credentials."
  - "Reactive refresh after 401 is only fallback recovery."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-128 - Orthogonal Account State And UI Chip Derivation

```yaml
plan_unit_id: CV-128
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Account state is orthogonal across credential_state, configuration_state, and
  availability_state, and provider-level chips such as LoggedOut, LoggedIn,
  AuthExpired, and AuthFailed are derived presentation rather than canonical
  provider-specific state.
gui_related: true
gui_classification_reason: This unit affects provider-level UI chip derivation from lower-level state.
split_recommended: true
depends_on: [CV-125]
unblocks: [CV-129, CV-137]
acceptance_criteria:
  - credential_state closes to missing, present, expired, invalid, revoked.
  - configuration_state closes to ready, needs_configuration, validation_required.
  - availability_state closes to eligible, cooldown, hard_blocked, disabled.
  - Provider-level chips are derived from lower-level account-state dimensions.
  - Provider jargon such as needs_project maps to user-facing needs_configuration where the missing setup is broader than a project id.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: account_state_enum_collapse
reasoning_tier: high
context_scope: orthogonal_account_state_ui_chips
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
  - Plans/Multi-Account.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: account_state_projection_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0046
preserved_exact_tokens:
  - "`credential_state`"
  - "`configuration_state`"
  - "`availability_state`"
  - "`LoggedOut`"
  - "`LoggedIn`"
  - "`AuthExpired`"
  - "`AuthFailed`"
  - "`needs_configuration`"
negative_constraints:
  - "Account-state must not collapse into one provider-specific enum."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-129 - Multi-Account Status Summary Projection

```yaml
plan_unit_id: CV-129
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Multi-account status summaries carry control_mode and drift_state, and when
  the account is not In Sync they also carry one-line remediation text plus
  primary actions.
gui_related: true
gui_classification_reason: This unit affects user-visible multi-account status summary projections.
split_recommended: true
depends_on: [CV-128]
unblocks: []
acceptance_criteria:
  - Multi-account summaries carry control_mode.
  - Multi-account summaries carry drift_state.
  - Accounts not In Sync carry one-line remediation text and primary actions.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: multi_account_status_projection_loss
reasoning_tier: standard
context_scope: multi_account_status_summary
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Multi-Account.md
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: multi_account_status_projection_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0046
preserved_exact_tokens:
  - "`control_mode`"
  - "`drift_state`"
  - "`In Sync`"
  - "one-line remediation text"
  - "primary actions"
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-130 - Auth Storage Roots And Vocabulary Collision Guard

```yaml
plan_unit_id: CV-130
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Filesystem and cache roots that depend on provider/account identity use
  stable IDs, and provider-normalized payloads must not introduce a second
  canonical provider field or fork canonical auth/account vocabulary into
  surface-local aliases.
gui_related: false
gui_classification_reason: This unit defines storage identity and vocabulary collision constraints.
split_recommended: true
depends_on: [CV-125, CV-126]
unblocks: []
acceptance_criteria:
  - Filesystem and cache roots use stable IDs such as account_id and connection_profile_id rather than display names.
  - Provider-normalized payloads do not introduce a second canonical field named provider that collides with AuthState.provider.
  - requested_provider, effective_provider, or provider_identity are used for non-auth-state meanings.
  - Canonical auth/account vocabulary remains platform, provider_identity, auth_surface, account_id, and requested/effective runtime fields.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: auth_vocabulary_collision
reasoning_tier: high
context_scope: auth_storage_roots_vocabulary_guard
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Multi-Account.md
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: auth_vocabulary_collision_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0046
preserved_exact_tokens:
  - "`account_id`"
  - "`connection_profile_id`"
  - "`provider`"
  - "`requested_provider`"
  - "`effective_provider`"
  - "`provider_identity`"
  - "`platform`"
  - "requested/effective runtime fields"
negative_constraints:
  - "Provider-normalized payloads must not introduce a second canonical field named provider where it would collide with AuthState.provider."
  - "Contracts_V0.md consumers must not fork canonical auth/account vocabulary into surface-local aliases."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-131 - AuthPolicy Enums And Provider Method Defaults

```yaml
plan_unit_id: CV-131
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  AuthPolicy defines ProviderAuthMethod and RequestedAuthMode enum contracts and
  deterministic auth method defaults for Cursor, Claude Code, Codex, GitHub
  Copilot, Gemini Direct, Gemini CLI, OpenCode, and Anthropic Console/API setup.
gui_related: false
gui_classification_reason: This unit defines auth policy enum and provider-default contracts.
split_recommended: true
depends_on: [CV-017, CV-125]
unblocks: [CV-132, CV-133, CV-134, CV-135, CV-138]
acceptance_criteria:
  - ProviderAuthMethod preserves OAuthBrowser, OAuthDeviceCode, ApiKey, GoogleCredentials, and CliInteractive.
  - RequestedAuthMode preserves auto, oauth, api_key, device_code, google_credentials, and cli_interactive.
  - Provider auth method defaults from the source span are preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: auth_policy_enum_default_drift
reasoning_tier: high
context_scope: authpolicy_enums_provider_defaults
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: authpolicy_enum_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0047
preserved_exact_tokens:
  - "`ProviderAuthMethod = OAuthBrowser | OAuthDeviceCode | ApiKey | GoogleCredentials | CliInteractive`"
  - "`RequestedAuthMode = auto | oauth | api_key | device_code | google_credentials | cli_interactive`"
  - "`OAuthBrowser`"
  - "`OAuthDeviceCode`"
  - "`CliInteractive`"
  - "ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/CLI_Bridged_Providers.md, SchemaID:Spec_Lock.json#locked_decisions.auth_model"
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-132 - Product Auth Copy And Anthropic Helper Action

```yaml
plan_unit_id: CV-132
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Product auth copy distinguishes Codex plan-backed ChatGPT access from API-key
  usage, and Anthropic Console/API setup surfaces use the specified helper
  action label and helper text when selected auth paths produce authoritative
  billing or rate-limit data.
gui_related: true
gui_classification_reason: This unit defines user-facing auth setup copy.
split_recommended: true
depends_on: [CV-131]
unblocks: []
acceptance_criteria:
  - Codex auth copy distinguishes plan-backed ChatGPT access and API-key usage as separate billing/limit paths.
  - Anthropic setup action label is Sign in to Console/API.
  - Anthropic helper text preserves the API/workspace billing and cost/rate-limit wording.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: product_auth_copy_billing_blur
reasoning_tier: standard
context_scope: product_auth_copy_anthropic_helper
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
  - Plans/Multi-Account.md
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: auth_setup_copy_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0047
preserved_exact_tokens:
  - "ChatGPT-plan-plus-API-key"
  - "`Sign in to Console/API`"
  - "`Uses Anthropic API or workspace billing; cost and rate-limit reporting may be more precise`"
negative_constraints:
  - "Product auth copy must not blur plan-backed ChatGPT access and API-key billing/limit semantics."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-133 - Gemini Provider Split And Auth-Mode Filtering

```yaml
plan_unit_id: CV-133
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Gemini Direct and Gemini CLI are separate provider entries with explicit
  requested_auth_mode defaults, auth-surface filtering, and no silent
  cross-provider fallback between gemini and gemini_cli.
gui_related: false
gui_classification_reason: This unit defines Gemini auth routing and provider-entry constraints.
split_recommended: true
depends_on: [CV-017, CV-131]
unblocks: [CV-134]
acceptance_criteria:
  - Gemini Direct and Gemini CLI remain separate provider entries.
  - gemini defaults requested_auth_mode to api_key.
  - gemini_cli defaults requested_auth_mode to auto and prefers OAuth/CLI-interactive first, then API key, then Google credentials unless policy overrides.
  - Explicit oauth, cli_interactive, api_key, and google_credentials requests filter to the correct Gemini account families.
  - There is no silent cross-provider fallback between gemini and gemini_cli.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: gemini_provider_auth_pool_collapse
reasoning_tier: high
context_scope: gemini_provider_auth_filtering
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Multi-Account.md
  - Plans/Prompt_Pipeline.md
  - Plans/rewrite-tie-in-memo.md
node_compile_hint:
  mode: gemini_auth_filtering_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0047
preserved_exact_tokens:
  - "`gemini`"
  - "`gemini_cli`"
  - "`requested_auth_mode`"
  - "`api_key`"
  - "`auto`"
  - "`oauth`"
  - "`cli_interactive`"
  - "`google_credentials`"
  - "ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/rewrite-tie-in-memo.md, ContractName:Plans/Prompt_Pipeline.md#EFFECTIVE-RESOLUTION-RECORD"
negative_constraints:
  - "Gemini Direct and Gemini CLI must not be collapsed into one mixed auth pool."
  - "There is no silent cross-provider fallback between gemini and gemini_cli."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-134 - Auto Auth Precedence And Operator Override

```yaml
plan_unit_id: CV-134
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  The locked auto auth-mode rule follows provider, role, and account policy
  preference order before account selection, while manual set active and
  active-account controls are operator override/debug controls recorded as
  requested state before effective resolution.
gui_related: false
gui_classification_reason: This unit defines auth policy precedence and operator override semantics.
split_recommended: true
depends_on: [CV-131, CV-133]
unblocks: []
acceptance_criteria:
  - auto follows provider, role, and account policy preference order for auth surfaces before account selection.
  - Policy precedence remains provider default, account override, role-by-provider override, role-by-account override, run snapshot, then attempt/message resolution.
  - Manual set active and active-account selection are operator override/debug controls, not default operating model.
  - Manual active-account selection is recorded as requested state before effective resolution.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: auto_auth_policy_bypass
reasoning_tier: high
context_scope: auto_auth_precedence_operator_override
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Multi-Account.md
  - Plans/Prompt_Pipeline.md
  - Plans/rewrite-tie-in-memo.md
node_compile_hint:
  mode: auto_auth_precedence_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0047
preserved_exact_tokens:
  - "provider default -> account override -> role-by-provider override -> role-by-account override -> run snapshot -> attempt/message resolution"
  - "`set active`"
  - "`active-account`"
  - "`/operator`"
negative_constraints:
  - "auto must not pick any credential opportunistically or bypass policy."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-135 - OAuth Callback Integrity And Reliability Safeguards

```yaml
plan_unit_id: CV-135
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  GitHub default interactive auth uses OAuth device-code flow, dynamic OAuth
  client registration persists and reuses a stable clientId, token writes are
  serialized, and managed OAuth flows use proactive refresh, precedence,
  scrubbing, differentiated recovery states, and platform-specific testing.
gui_related: false
gui_classification_reason: This unit defines OAuth callback integrity and reliability constraints.
split_recommended: true
depends_on: [CV-131]
unblocks: []
acceptance_criteria:
  - GitHub default interactive auth uses OAuth device-code flow.
  - Dynamic OAuth client registration persists and reuses the stable clientId for the account/provider auth flow.
  - Token writes are serialized so successful browser callbacks are not overwritten by later registration attempts.
  - Managed OAuth flows preserve proactive refresh, config > stored precedence, strict secret scrubbing, differentiated 401/429/quota recovery states, and platform-specific OAuth testing.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: oauth_callback_token_overwrite
reasoning_tier: high
context_scope: oauth_callback_integrity_reliability
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/GitHub_API_Auth_and_Flows.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: oauth_callback_integrity_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0047
preserved_exact_tokens:
  - "OAuth device-code flow"
  - "`clientId`"
  - "`config > stored`"
  - "`401/429/quota`"
  - "strict secret scrubbing"
  - "ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/FinalGUISpec.md"
negative_constraints:
  - "A successful browser callback must not be overwritten by a later registration attempt."
  - "Registering a new clientId on every call is forbidden."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-136 - AuthEvent Provider-Owned Type Strings

```yaml
plan_unit_id: CV-136
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Auth flows emit persisted EventRecord events with stable type strings owned by
  the provider plan, including the GitHub auth device-code, polling,
  authenticated, failed, and disconnected event names.
gui_related: false
gui_classification_reason: This unit defines persisted auth event names.
split_recommended: false
depends_on: [CV-078, CV-131]
unblocks: []
acceptance_criteria:
  - Auth flows emit persisted EventRecord events.
  - Stable auth event type strings remain owned by the provider plan.
  - GitHub example event type strings remain preserved.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: auth_event_type_owner_drift
reasoning_tier: standard
context_scope: authevent_provider_owned_types
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/GitHub_API_Auth_and_Flows.md
node_compile_hint:
  mode: auth_event_type_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0048
preserved_exact_tokens:
  - "`EventRecord`"
  - "`auth.github.device_code.issued`"
  - "`auth.github.token.polling`"
  - "`auth.github.authenticated`"
  - "`auth.github.failed`"
  - "`auth.github.disconnected`"
  - "ContractRef: ContractName:Plans/GitHub_API_Auth_and_Flows.md, ContractName:Plans/Contracts_V0.md#EventRecord"
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-137 - Setup Health Canonical Enum Families

```yaml
plan_unit_id: CV-137
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Setup, health, readiness, auth realm/surface, credential, configuration,
  availability, and usage pressure enum families remain canonical for setup and
  health lifecycle contracts.
gui_related: false
gui_classification_reason: This unit defines canonical setup and health enum families.
split_recommended: true
depends_on: [CV-128, CV-131]
unblocks: [CV-138, CV-139, CV-140, CV-141]
acceptance_criteria:
  - InstallableComponent, InstallJobState, AuthJobState, ProviderReadinessState, AuthRealm, AuthSurface, CredentialState, ConfigurationState, AvailabilityState, and UsagePressureState enum families are preserved.
  - Enum values in the source block remain available for exact-text audit.
  - Setup/health consumers use the canonical enum families rather than local variants.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: setup_health_enum_drift
reasoning_tier: high
context_scope: setup_health_enum_families
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
  - Plans/Multi-Account.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: setup_health_enum_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0049
preserved_exact_tokens:
  - "`InstallableComponent`"
  - "`InstallJobState`"
  - "`AuthJobState`"
  - "`ProviderReadinessState`"
  - "`AuthRealm`"
  - "`AuthSurface`"
  - "`CredentialState`"
  - "`ConfigurationState`"
  - "`AvailabilityState`"
  - "`UsagePressureState`"
  - "ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/Multi-Account.md, ContractName:Plans/storage-plan.md"
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-138 - Setup Readiness Split And Auth-Surface Validation Branches

```yaml
plan_unit_id: CV-138
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Setup and Health expose both AuthJobState and ProviderReadinessState, preserve
  CursorAgent, Nanobanana, Codex chatgpt auth surface, and keep google_adc,
  service_account_json, and vertex_api_key as separate Gemini CLI
  Vertex/Google Cloud validation branches.
gui_related: true
gui_classification_reason: This unit affects user-facing setup and health flows.
split_recommended: true
depends_on: [CV-132, CV-137]
unblocks: [CV-141]
acceptance_criteria:
  - Setup and Health expose both AuthJobState and ProviderReadinessState when providers can be authenticated but still blocked.
  - CursorAgent remains the canonical installable/runtime target for Cursor CLI integration.
  - Nanobanana remains an installable helper for Gemini CLI media paths only when media is enabled.
  - AuthSurface = chatgpt remains the canonical user-facing direct-login family for Codex plan-backed usage.
  - google_adc, service_account_json, and vertex_api_key remain separate validation branches.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: setup_readiness_auth_surface_collapse
reasoning_tier: high
context_scope: setup_readiness_auth_surface_branches
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Multi-Account.md
node_compile_hint:
  mode: setup_readiness_auth_surface_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0049
preserved_exact_tokens:
  - "`AuthJobState`"
  - "`ProviderReadinessState`"
  - "`CursorAgent`"
  - "`Nanobanana`"
  - "`AuthSurface = chatgpt`"
  - "`google_adc`"
  - "`service_account_json`"
  - "`vertex_api_key`"
negative_constraints:
  - "Google credential branches must not be collapsed into a single unlabeled Google credentials setup path in user-facing flows."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-139 - Usage Pressure Cooldown And Resolution Outcome

```yaml
plan_unit_id: CV-139
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Usage pressure normalizes provider-agnostic scheduler vocabulary, preserves
  provider-reported cooldown facts, post-reset eligible_pending_recheck and
  validating flow, and auditable resolution_outcome for threshold or exhaustion
  handling.
gui_related: false
gui_classification_reason: This unit defines provider/account pressure state and scheduler semantics.
split_recommended: true
depends_on: [CV-137]
unblocks: [CV-140]
acceptance_criteria:
  - UsagePressureState and provider projections preserve nominal, approaching_threshold, threshold_reached, exhausted, and unknown.
  - unhealthy provider remains readiness/health presentation and does not collapse into usage pressure.
  - Provider-reported cooldown windows remain facts and PM overlays do not overwrite cooldown metadata.
  - When reset_at or cooldown_until passes, availability becomes eligible_pending_recheck and readiness enters validating until validation or a successful run returns an observed state.
  - threshold_reached or exhausted records resolution_outcome for audit.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: usage_pressure_cooldown_drift
reasoning_tier: high
context_scope: usage_pressure_cooldown_resolution
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
  - Plans/storage-plan.md
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: usage_pressure_cooldown_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0049
preserved_exact_tokens:
  - "`nominal`"
  - "`approaching_threshold`"
  - "`threshold_reached`"
  - "`exhausted`"
  - "`unknown`"
  - "`pressure_state`"
  - "`reset_at`"
  - "`cooldown_until`"
  - "`eligible_pending_recheck`"
  - "`resolution_outcome`"
negative_constraints:
  - "Provider-reported cooldown metadata must not be overwritten by PM-imposed overlays."
  - "An unhealthy provider remains readiness/health presentation and must not be collapsed into usage pressure."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-140 - Usage Warning Quiet Window And Setup Action Labels

```yaml
plan_unit_id: CV-140
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Usage warnings expose configurable thresholds, dismiss and quiet windows, and
  Usage/config provenance, while provider setup actions use stable
  action-progress labels such as Sign In, Signing In..., and Logged In.
gui_related: true
gui_classification_reason: This unit affects user-visible usage warnings and provider setup actions.
split_recommended: true
depends_on: [CV-137, CV-139]
unblocks: []
acceptance_criteria:
  - Usage warnings expose configurable threshold, dismiss/quiet window, and path to Usage/config.
  - Non-blocking account pressure can be quieted without losing /config provenance or /quiet period explanation.
  - Provider setup actions use stable action-progress labels.
  - Provider-specific setup copy may specialize the provider name while shared lifecycle labels remain stable.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: usage_warning_setup_label_drift
reasoning_tier: standard
context_scope: usage_warning_setup_action_labels
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: usage_warning_setup_label_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0049
preserved_exact_tokens:
  - "`Temporary Pause`"
  - "`Resume Now`"
  - "`Mark Needs Recheck`"
  - "`/config`"
  - "`/quiet`"
  - "`Sign In`"
  - "`Signing In...`"
  - "`Logged In`"
negative_constraints:
  - "User overlays must not overwrite provider-reported cooldown facts."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-141 - Provider Operational Blockers And Claude Import Boundary

```yaml
plan_unit_id: CV-141
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  A provider account can be auth-ready while workspace trust, first-run prompts,
  billing-entity selection, or validation still blocks full operation for a run
  context, and Claude Code import is bounded by CLAUDE_CONFIG_DIR with only
  auth-bearing credentials material seeded before validation.
gui_related: false
gui_classification_reason: This unit defines provider operational blockers and import boundaries.
split_recommended: true
depends_on: [CV-125, CV-138]
unblocks: []
acceptance_criteria:
  - Auth-ready providers may still be blocked by workspace trust, first-run prompts, billing-entity selection, or validation requirements for a specific run context.
  - Claude Code import uses CLAUDE_CONFIG_DIR as the account root boundary.
  - Claude Code auth import may seed only auth-bearing credentials.json / .credentials.json material before validation.
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_operational_blocker_import_boundary_drift
reasoning_tier: high
context_scope: provider_operational_blockers_claude_import
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/storage-plan.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: provider_operational_blocker_import_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0049
preserved_exact_tokens:
  - "workspace trust"
  - "first-run prompts"
  - "billing-entity selection"
  - "`CLAUDE_CONFIG_DIR`"
  - "`credentials.json`"
  - "`.credentials.json`"
  - "ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/CLI_Bridged_Providers.md"
negative_constraints:
  - "Claude Code import may seed only auth-bearing credentials material before validation."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-142 - Provider Profile Lifecycle Reconciliation

```yaml
plan_unit_id: CV-142
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Provider-profile state maps canonically to Executor Protocol and Contracts
  equivalents for reconciliation, but it does not replace the canonical
  child-run lifecycle.
gui_related: false
gui_classification_reason: This unit defines provider lifecycle reconciliation semantics rather than UI presentation.
split_recommended: true
depends_on: [CV-137]
unblocks: [CV-143, CV-144]
acceptance_criteria:
  - "The provider state mapping table preserves unknown, discovered, configuring, ready, active, degraded, suspended, expired, and removed."
  - "Provider-profile state remains a reconciliation input across provider profile, Executor Protocol node state, and PM runtime/contract state."
  - "The mapping table does not replace the canonical child-run lifecycle."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_lifecycle_child_state_confusion
reasoning_tier: high
context_scope: provider_profile_lifecycle_reconciliation
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Multi-Account.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: provider_lifecycle_reconciliation_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0050
preserved_exact_tokens:
  - "provider-profile state"
  - "EP equivalent"
  - "Contracts equivalent"
  - "`unknown`"
  - "`discovered`"
  - "`configuring`"
  - "`ready`"
  - "`degraded`"
  - "ContractRef: ContractName:Plans/Multi-Account.md, ContractName:Plans/Executor_Protocol.md"
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-143 - Provider-To-Child Execution Projection Boundary

```yaml
plan_unit_id: CV-143
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Only execution-relevant provider states project through child execution:
  active and degraded map to active execution, suspended maps to blocked
  execution, and expired maps to failure; discovery and configuration states
  remain provider-profile states.
gui_related: false
gui_classification_reason: This unit defines provider-to-child execution state projection boundaries.
split_recommended: true
depends_on: [CV-026, CV-142]
unblocks: []
acceptance_criteria:
  - "active and degraded correspond to active execution."
  - "suspended corresponds to blocked execution."
  - "expired corresponds to failure."
  - "Discovery and configuration-only states remain provider-profile states."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_state_false_child_execution
reasoning_tier: high
context_scope: provider_child_execution_projection
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: provider_child_execution_projection_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0050
preserved_exact_tokens:
  - "`active`"
  - "`degraded`"
  - "`suspended`"
  - "`expired`"
  - "MUST NOT"
negative_constraints:
  - "Discovery/configuration-only states must not be misreported as in-flight child execution."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-144 - Model Lifecycle State And Sunset Dispatch Boundary

```yaml
plan_unit_id: CV-144
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Model lifecycle is separate from provider account readiness and uses
  model_lifecycle_state with active, deprecated, sunset_pending, sunset, and
  removed; /sunset is UI/help shorthand, not a separate state family.
gui_related: true
gui_classification_reason: This unit affects UI/help shorthand for model lifecycle status.
split_recommended: true
depends_on: [CV-142]
unblocks: []
acceptance_criteria:
  - "model_lifecycle_state preserves active, deprecated, sunset_pending, sunset, and removed."
  - "sunset_at_utc?, replacement_model_id?, and deprecation_notice_ref? are preserved when model owners expose them."
  - "sunset and removed models are ineligible for new dispatch unless explicit compatibility policy permits them."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: model_lifecycle_readiness_collapse
reasoning_tier: high
context_scope: model_lifecycle_sunset_dispatch
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: model_lifecycle_dispatch_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0050
preserved_exact_tokens:
  - "`model_lifecycle_state`"
  - "`active | deprecated | sunset_pending | sunset | removed`"
  - "`/sunset`"
  - "`sunset_at_utc?`"
  - "`replacement_model_id?`"
  - "`deprecation_notice_ref?`"
compatibility_only_notes:
  - "sunset or removed models are ineligible for new dispatch unless an explicit compatibility policy permits them."
negative_constraints:
  - "/sunset is UI/help shorthand for model_lifecycle_state, not a separate state family."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-145 - Requested Effective Account Identity Fields

```yaml
plan_unit_id: CV-145
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Requested/effective execution identity preserves requested account policy
  fields and effective stable account, provider, role, and operational identity
  fields, while provider_account_id remains subordinate provider-native
  metadata unless explicitly governed.
gui_related: false
gui_classification_reason: This unit defines runtime account identity fields.
split_recommended: true
depends_on: [CV-125, CV-131]
unblocks: [CV-146, CV-147, CV-148, CV-149, CV-154]
acceptance_criteria:
  - "Requested fields preserve requested_account_id, requested_account_binding, and requested_account_policy."
  - "Effective fields preserve effective_account_id, effective_provider_identity, provider_account_id, execution_role, and operational_identity."
  - "Requested state remains recoverable in historical snapshots."
  - "Provider-native metadata remains subordinate to the stable internal account key."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: requested_effective_identity_field_loss
reasoning_tier: high
context_scope: requested_effective_account_identity_fields
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Multi-Account.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: requested_effective_identity_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0050
preserved_exact_tokens:
  - "`requested_account_id`"
  - "`requested_account_binding`"
  - "`requested_account_policy`"
  - "`effective_account_id`"
  - "`effective_provider_identity`"
  - "`provider_account_id`"
  - "`execution_role`"
  - "`operational_identity`"
  - "ContractRef: Plans/Prompt_Pipeline.md#6.4 Effective resolution record, Plans/Multi-Account.md#4.5 Selectable unit and runtime resolution"
compatibility_only_notes:
  - "provider_account_id is provider-native metadata subordinate to stable internal identity unless explicitly governed."
negative_constraints:
  - "provider_account_id must not replace stable internal identity."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-146 - Non-Persona Runtime Field Adoption Guard

```yaml
plan_unit_id: CV-146
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Non-persona runtime fields must land in shared runtime contracts before
  question, todowrite, web, tool/chat, or other feature-specific packets depend
  on them, and those packets reuse canonical runtime names with only additive
  child payloads.
gui_related: false
gui_classification_reason: This unit defines cross-contract runtime field adoption boundaries.
split_recommended: true
depends_on: [CV-145]
unblocks: []
acceptance_criteria:
  - "accepted non-persona fields land in shared runtime contracts first."
  - "Feature-specific packets reuse canonical runtime field names."
  - "Feature-specific packets attach only additive child payloads for feature-specific execution details."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_field_shadow_name_drift
reasoning_tier: high
context_scope: non_persona_runtime_field_adoption
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Prompt_Pipeline.md
  - Plans/Multi-Account.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: runtime_field_adoption_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0050
preserved_exact_tokens:
  - "`if/when`"
  - "`question`"
  - "`todowrite`"
  - "`/tool/chat/etc`"
  - "`projection_freshness`"
  - "`projection_health`"
negative_constraints:
  - "Feature-specific docs must not invent shadow names or ad-hoc local versions of shared runtime fields."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-147 - Provider Runtime Record Families

```yaml
plan_unit_id: CV-147
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Provider/runtime storage uses provider_account_state, model_catalog_entry,
  provider_preferences, and requested_effective_runtime as canonical record
  families, preserving requested/effective separation and treating preferences
  as resolver inputs rather than proof of effective execution.
gui_related: false
gui_classification_reason: This unit defines provider runtime record families.
split_recommended: true
depends_on: [CV-145]
unblocks: []
acceptance_criteria:
  - "provider_account_state stores provider/account current-state snapshot facts."
  - "model_catalog_entry stores provider/model/runtime availability, display metadata, capability facts, and runtime compatibility."
  - "provider_preferences stores resolver inputs and is not proof of effective execution."
  - "requested_effective_runtime keeps requested runtime/provider/model/auth/account/preferences distinct from effective selections."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_runtime_record_family_drift
reasoning_tier: high
context_scope: provider_runtime_record_families
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Multi-Account.md
node_compile_hint:
  mode: provider_runtime_record_family_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0050
preserved_exact_tokens:
  - "`provider_account_state`"
  - "`model_catalog_entry`"
  - "`provider_preferences`"
  - "`requested_effective_runtime`"
negative_constraints:
  - "provider_preferences are resolver inputs rather than proof of effective execution."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-148 - Account Binding Permission Carry-Through

```yaml
plan_unit_id: CV-148
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Requested state remains historically recoverable, requested_account_binding
  distinguishes preference from requirement, and permission/approval snapshots
  retain requested binding plus effective_account_id for effective-account-scoped
  permission resolution.
gui_related: false
gui_classification_reason: This unit defines permission and approval identity carry-through.
split_recommended: true
depends_on: [CV-145]
unblocks: []
acceptance_criteria:
  - "Requested state remains recoverable in historical snapshots."
  - "requested_account_binding distinguishes preference from requirement."
  - "effective-account-scoped permission resolution reads requested_account_binding."
  - "effective_account_id remains available to approval and permission snapshots."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: account_binding_permission_lineage_loss
reasoning_tier: high
context_scope: account_binding_permission_carry_through
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Decision_Policy.md
  - Plans/human-in-the-loop.md
node_compile_hint:
  mode: account_binding_permission_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0050
preserved_exact_tokens:
  - "`requested_account_binding`"
  - "`effective_account_id`"
  - "Permission carry-through"
compatibility_only_notes:
  - "provider_account_id is retired or explicitly governed as provider-native metadata subordinate to stable internal identity."
negative_constraints:
  - "Policy-only routes cannot replace requested_account_binding for effective-account-scoped permission resolution."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-149 - Context Management Runtime Identity Scope

```yaml
plan_unit_id: CV-149
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Context management keeps runtime identity explicit across prompt assembly,
  execution, approval, and historical review.
gui_related: false
gui_classification_reason: This unit defines context-management runtime identity scope.
split_recommended: false
depends_on: [CV-026, CV-145]
unblocks: [CV-150, CV-151]
acceptance_criteria:
  - "Runtime identity remains explicit across prompt assembly."
  - "Runtime identity remains explicit across execution and approval."
  - "Runtime identity remains explicit for historical review."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: context_runtime_identity_loss
reasoning_tier: standard
context_scope: context_management_runtime_identity
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Prompt_Pipeline.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: context_runtime_identity_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0051
preserved_exact_tokens:
  - "Context management"
  - "`AGENTS.md`"
  - "runtime identity"
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-150 - Investigation Attachment Additivity

```yaml
plan_unit_id: CV-150
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  InvestigationContextAttachment remains additive and must not rename or shadow
  shared runtime snapshot fields.
gui_related: false
gui_classification_reason: This unit defines investigation attachment boundaries.
split_recommended: false
depends_on: [CV-149]
unblocks: []
acceptance_criteria:
  - "Investigation attachments remain additive."
  - "Investigation attachments use shared runtime snapshot field names."
  - "Investigation attachments do not rename or shadow shared runtime snapshot fields."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: investigation_attachment_runtime_shadow
reasoning_tier: standard
context_scope: investigation_attachment_additivity
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: investigation_attachment_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0052
preserved_exact_tokens:
  - "`InvestigationContextAttachment`"
  - "additive"
  - "runtime snapshot fields"
negative_constraints:
  - "InvestigationContextAttachment must not rename or shadow shared runtime snapshot fields."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-151 - Persona Runtime Snapshot Canonical Persona Fields

```yaml
plan_unit_id: CV-151
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Runtime snapshots preserve requested_persona and effective_persona as
  canonical Persona identity fields, while requested_persona_id and
  effective_persona_id are retired migration-only aliases.
gui_related: false
gui_classification_reason: This unit defines runtime persona identity fields and alias retirement.
split_recommended: true
depends_on: [CV-027, CV-149]
unblocks: [CV-152, CV-153]
acceptance_criteria:
  - "requested_persona and effective_persona remain canonical Persona identity fields."
  - "requested_persona_id and effective_persona_id remain migration-only aliases."
  - "Live tool, chat, and storage payloads do not reintroduce retired persona alias fields."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: persona_runtime_alias_revival
reasoning_tier: high
context_scope: persona_runtime_snapshot_fields
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: persona_runtime_alias_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0053
preserved_exact_tokens:
  - "`requested_persona`"
  - "`effective_persona`"
  - "`requested_persona_id`"
  - "`effective_persona_id`"
compatibility_only_notes:
  - "requested_persona_id and effective_persona_id may appear only in migration or source-lineage metadata."
negative_constraints:
  - "Retired persona aliases must not be reintroduced into live tool, chat, or storage payload shapes."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-152 - PersonaSnapshot Compatibility Label And Mode Fields

```yaml
plan_unit_id: CV-152
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  PersonaSnapshot is a migration compatibility label, not a separate schema
  family; when a runtime snapshot is embedded in EventRecord.payload, mode
  fields remain part of the runtime snapshot as runtime_mode, mode_family?, and
  mode_policy_ref?.
gui_related: false
gui_classification_reason: This unit defines runtime snapshot compatibility naming.
split_recommended: true
depends_on: [CV-078, CV-151]
unblocks: []
acceptance_criteria:
  - "PersonaSnapshot remains a migration compatibility label."
  - "PersonaSnapshot does not become a separate schema family."
  - "Embedded EventRecord.payload runtime snapshots preserve runtime_mode, mode_family?, and mode_policy_ref?."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: personasnapshot_schema_fork
reasoning_tier: high
context_scope: personasnapshot_compatibility_label
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: personasnapshot_compatibility_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0053
preserved_exact_tokens:
  - "`PersonaSnapshot`"
  - "`EventRecord.payload`"
  - "`runtime_mode`"
  - "`mode_family?`"
  - "`mode_policy_ref?`"
compatibility_only_notes:
  - "PersonaSnapshot is a migration compatibility label."
negative_constraints:
  - "PersonaSnapshot must not become a separate schema family."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-153 - Legacy Persona Snapshot Vocabulary Disposition

```yaml
plan_unit_id: CV-153
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Legacy persona and mode-overlay snapshot labels are source-lineage aliases
  only; live payloads use requested/effective Persona fields, runtime identity
  fields, and canonical runtime_mode, mode_family?, and mode_policy_ref? names.
gui_related: false
gui_classification_reason: This unit retires legacy Persona snapshot vocabulary.
split_recommended: true
depends_on: [CV-151]
unblocks: []
acceptance_criteria:
  - "Legacy persona snapshot labels remain source-lineage aliases only."
  - "Live payloads use requested/effective Persona fields and canonical runtime mode names."
  - "Legacy snapshot vocabulary is not revived in live payloads."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: legacy_persona_snapshot_vocabulary_revival
reasoning_tier: high
context_scope: legacy_persona_snapshot_vocabulary
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: legacy_persona_snapshot_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0053
preserved_exact_tokens:
  - "`persona_active_persona_id`"
  - "`persona_display_label`"
  - "`persona_display_icon`"
  - "`persona_system_prompt_sha`"
  - "`mode_overlay_runtime_mode`"
  - "`mode_overlay_ceiling`"
compatibility_only_notes:
  - "Legacy source labels are source-lineage aliases only."
negative_constraints:
  - "Legacy snapshot vocabulary must not be revived in live payloads."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-154 - Execution Unit Context Runtime Snapshot Packet

```yaml
plan_unit_id: CV-154
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  execution_unit_context is the authoritative runtime snapshot packet carrying
  run, node, attempt, lane, package, seam, worktree, execution role, requested
  and effective account state, operational identity, and tool-use fields.
gui_related: false
gui_classification_reason: This unit defines the runtime execution-unit context packet.
split_recommended: true
depends_on: [CV-060, CV-145]
unblocks: []
acceptance_criteria:
  - "execution_unit_context remains the authoritative runtime snapshot packet."
  - "Required runtime fields include run_id, node_id, attempt_id, lane_id, package_id, seam_id, worktree_id, and execution_role."
  - "Required account and join fields include requested_account_id, requested_account_binding, requested_account_policy, effective_account_id, operational_identity, and tool_use_id."
  - "Requested and effective account state stays explicit across runtime, approval, and usage surfaces."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: execution_unit_context_field_loss
reasoning_tier: high
context_scope: execution_unit_context_packet
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: execution_unit_context_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0053
preserved_exact_tokens:
  - "`execution_unit_context`"
  - "`run_id`"
  - "`node_id`"
  - "`attempt_id`"
  - "`lane_id`"
  - "`package_id`"
  - "`seam_id`"
  - "`worktree_id`"
  - "`execution_role`"
  - "`operational_identity`"
  - "`tool_use_id`"
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-155 - HITL Runtime Blocked Episode Identity

```yaml
plan_unit_id: CV-155
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  HITL approval and recovery anchor to runtime blocked episodes with run_id,
  node_id, blocked_sequence, attempt_id?, blocked_reason_code,
  allowed_action_ids[], approval_scope_key, approver_identity?, detail_ref?,
  and report_ref?.
gui_related: false
gui_classification_reason: This unit defines HITL runtime blocked episode identity.
split_recommended: true
depends_on: [CV-029, CV-053]
unblocks: [CV-156, CV-157, CV-158]
acceptance_criteria:
  - "Blocked episode identity preserves run_id, node_id, blocked_sequence, and attempt_id?."
  - "HITL request payloads preserve blocked_reason_code, allowed_action_ids[], approval_scope_key, approver_identity?, detail_ref?, and report_ref?."
  - "blocked_sequence is the canonical approval anchor."
  - "Pre-attempt blocked episodes do not invent attempt_id."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: hitl_blocked_episode_identity_loss
reasoning_tier: high
context_scope: hitl_runtime_blocked_episode_identity
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/human-in-the-loop.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: hitl_blocked_episode_identity_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0054
preserved_exact_tokens:
  - "`run_id`"
  - "`node_id`"
  - "`blocked_sequence`"
  - "`attempt_id?`"
  - "`blocked_reason_code`"
  - "`allowed_action_ids[]`"
  - "`approval_scope_key`"
  - "ContractRef: Plans/human-in-the-loop.md#Canonical HITL request contract, Plans/Executor_Protocol.md#Worktree-aware execution unit context"
negative_constraints:
  - "Pre-attempt blocked episodes must not invent attempt_id."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-156 - HITL Labels And Approval UI Actions

```yaml
plan_unit_id: CV-156
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  HITL user-facing states use the labels Blocked, Waiting approval, and Action
  Required, and chat/GUI action buttons derive from ordered allowed_action_ids[].
gui_related: true
gui_classification_reason: This unit affects user-visible HITL labels and approval action buttons.
split_recommended: true
depends_on: [CV-030, CV-155]
unblocks: []
acceptance_criteria:
  - "HITL labels preserve Blocked, Waiting approval, and Action Required."
  - "Chat and GUI action buttons derive from ordered allowed_action_ids[]."
  - "Ordered allowed_action_ids[] survive into approval UI."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: hitl_ui_action_order_loss
reasoning_tier: high
context_scope: hitl_labels_approval_ui_actions
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
  - Plans/FinalGUISpec.md
  - Plans/human-in-the-loop.md
node_compile_hint:
  mode: hitl_ui_action_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0054
preserved_exact_tokens:
  - "Blocked"
  - "Waiting approval"
  - "Action Required"
  - "`allowed_action_ids[]`"
negative_constraints:
  - "Approval UI must not synthesize unordered local action sets."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-157 - HITL Scope Persistence And Failed Approval History

```yaml
plan_unit_id: CV-157
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Approval scope remains blocked-episode-scoped, unresolved blocked episodes
  survive restart and are rehydrated, and failed approval attempts or failed
  recovery action switches remain historically material in records and history.
gui_related: false
gui_classification_reason: This unit defines HITL approval scope, persistence, and history rules.
split_recommended: true
depends_on: [CV-155]
unblocks: [CV-158]
acceptance_criteria:
  - "Approvals bind to run_id, node_id, blocked_sequence, and attempt_id?."
  - "A blocked-episode approval does not imply broader policy approval unless approval_scope_key says so explicitly."
  - "Unresolved blocked episodes survive restart and are rehydrated rather than reminted opportunistically."
  - "Failed approval attempts or failed recovery-action switches persist in records/history."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: hitl_scope_persistence_loss
reasoning_tier: high
context_scope: hitl_scope_persistence_history
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Decision_Policy.md
  - Plans/Progression_Gates.md
node_compile_hint:
  mode: hitl_scope_persistence_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0054
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0055
preserved_exact_tokens:
  - "`approval_scope_key`"
  - "rehydrated"
  - "failed approval attempt"
  - "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/Progression_Gates.md"
negative_constraints:
  - "Blocked-episode approval does not imply session-global policy approval."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-158 - HITL Request ID Compatibility Boundary

```yaml
plan_unit_id: CV-158
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Older request-centric payloads may carry request_id for lineage and migration,
  but any consumer that mutates runtime state must resolve through the
  blocked-episode identity model.
gui_related: false
gui_classification_reason: This unit defines HITL compatibility identity boundaries.
split_recommended: false
depends_on: [CV-155, CV-157]
unblocks: []
acceptance_criteria:
  - "request_id may continue only for lineage and migration."
  - "Runtime-state mutation resolves through blocked-episode identity."
  - "Blocked-episode identity uses run_id, node_id, blocked_sequence, and attempt_id?."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: hitl_request_id_identity_revival
reasoning_tier: high
context_scope: hitl_request_id_compatibility
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
  - Plans/Run_Graph_View.md
  - Plans/Orchestrator_Page.md
node_compile_hint:
  mode: hitl_request_id_compatibility_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0056
preserved_exact_tokens:
  - "`request_id`"
  - "blocked-episode identity model"
  - "ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Run_Graph_View.md, ContractName:Plans/Orchestrator_Page.md"
compatibility_only_notes:
  - "request_id is lineage and migration compatibility only."
negative_constraints:
  - "request_id is not canonical mutation identity."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-159 - Assistant Worktree UICommand Registrations

```yaml
plan_unit_id: CV-159
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Six assistant worktree UICommand registrations are canonical with their
  command IDs, labels, icons, chat category, when clauses, and shared guard
  activeThreadExists && projectIsGitRepo && !projectIsRemoteNonSSH.
gui_related: true
gui_classification_reason: This unit defines user-visible command registrations for assistant worktree actions.
split_recommended: true
depends_on: [CV-031, CV-052]
unblocks: [CV-160, CV-161, CV-162]
acceptance_criteria:
  - "The six assistant worktree command IDs are preserved."
  - "Command labels, icons, category, and extra when clauses are preserved."
  - "All six commands require activeThreadExists && projectIsGitRepo && !projectIsRemoteNonSSH."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: assistant_worktree_command_registration_loss
reasoning_tier: high
context_scope: assistant_worktree_uicommand_registrations
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
  - Plans/Commands_System.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: assistant_worktree_uicommand_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0057
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0058
preserved_exact_tokens:
  - "`cmd.chat.worktree.create`"
  - "`cmd.chat.worktree.unbind`"
  - "`cmd.chat.worktree.remove`"
  - "`cmd.chat.worktree.merge`"
  - "`cmd.chat.worktree.pr`"
  - "`cmd.chat.worktree.info`"
  - "`activeThreadExists && projectIsGitRepo && !projectIsRemoteNonSSH`"
  - "ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Commands_System.md, ContractName:Plans/assistant-chat-design.md"
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-160 - Assistant Worktree Command Alias Disposition

```yaml
plan_unit_id: CV-160
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Compatibility aliases for assistant worktree commands may route to the
  canonical assistant worktree command IDs, but they are not replacements for
  the canonical six command IDs.
gui_related: false
gui_classification_reason: This unit defines command alias compatibility.
split_recommended: true
depends_on: [CV-159]
unblocks: []
acceptance_criteria:
  - "cmd.chat.worktree.bind_existing, cmd.chat.worktree.open_files, and cmd.chat.worktree.create_pr may route to canonical assistant worktree commands."
  - "Aliases normalize through canonical command IDs."
  - "Aliases are not replacements for the canonical six command IDs."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: assistant_worktree_command_alias_replacement
reasoning_tier: standard
context_scope: assistant_worktree_command_aliases
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: assistant_worktree_command_alias_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0058
preserved_exact_tokens:
  - "`cmd.chat.worktree.bind_existing`"
  - "`cmd.chat.worktree.open_files`"
  - "`cmd.chat.worktree.create_pr`"
  - "`alias_of_command_id`"
compatibility_only_notes:
  - "Compatibility aliases may route to canonical assistant worktree commands."
negative_constraints:
  - "Compatibility aliases are not replacements for the canonical six command IDs."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-161 - UICommand Envelope Fields And Closed Kinds

```yaml
plan_unit_id: CV-161
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  UICommand is the canonical command envelope with command_id, command_kind,
  args, context?, normalization?, and closed command_kind and normalization
  values, with normalization.kind required.
gui_related: false
gui_classification_reason: This unit defines command envelope schema fields.
split_recommended: true
depends_on: [CV-031]
unblocks: [CV-162]
acceptance_criteria:
  - "UICommand preserves command_id, command_kind, args, context?, and normalization?."
  - "command_kind closes to shell_view, navigation_wrapper, and domain_action."
  - "normalization closes to wrapper and deprecated_alias."
  - "normalization.kind is required."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: uicommand_envelope_schema_drift
reasoning_tier: high
context_scope: uicommand_envelope_fields
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
  - Plans/Crosswalk.md
node_compile_hint:
  mode: uicommand_envelope_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0058
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0059
preserved_exact_tokens:
  - "`UICommand`"
  - "`command_id`"
  - "`command_kind`"
  - "`args`"
  - "`context?`"
  - "`normalization?`"
  - "`shell_view`"
  - "`navigation_wrapper`"
  - "`domain_action`"
  - "ContractRef: Plans/UI_Command_Catalog.md#2.0 Command entry contract (doc-level), Plans/Crosswalk.md#3.1 Runtime orchestration ownership"
compatibility_only_notes:
  - "deprecated_alias remains migration normalization."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-162 - UICommand Wrapper Primitive Boundary

```yaml
plan_unit_id: CV-162
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Shared navigation and identity-open primitives sit under public wrapper
  commands; wrapper metadata stays narrow, points only to canonical primitive
  families, and does not restate route payload structure.
gui_related: false
gui_classification_reason: This unit defines command wrapper boundaries around route/open primitives.
split_recommended: true
depends_on: [CV-055, CV-057, CV-161]
unblocks: []
acceptance_criteria:
  - "Deprecated aliases point at alias_of_command_id."
  - "Stable wrapper commands point at normalizes_to_contract."
  - "Wrapper metadata stays narrow and contract-level."
  - "Route payload structure is not restated inside command metadata."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: uicommand_route_payload_fork
reasoning_tier: high
context_scope: uicommand_wrapper_primitive_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/UI_Command_Catalog.md
  - Plans/Progression_Gates.md
  - Plans/Crosswalk.md
node_compile_hint:
  mode: uicommand_wrapper_boundary_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0058
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0059
preserved_exact_tokens:
  - "`normalizes_to_contract`"
  - "`wrapper`"
  - "`deprecated_alias`"
  - "`shell_view`"
  - "ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Progression_Gates.md, ContractName:Plans/Crosswalk.md"
compatibility_only_notes:
  - "deprecated aliases point at alias_of_command_id."
negative_constraints:
  - "Wrappers must not restate route payload structure or create command-owned route models."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-163 - RouteTarget Required Scope And Destination Class

```yaml
plan_unit_id: CV-163
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  route_target is the canonical navigation-and-focus contract requiring
  target_kind and project_id, with target_kind as destination class only.
gui_related: false
gui_classification_reason: This unit defines route_target required fields and destination classes.
split_recommended: true
depends_on: [CV-031, CV-054]
unblocks: [CV-164, CV-166, CV-169, CV-173]
acceptance_criteria:
  - "route_target remains the canonical navigation-and-focus contract."
  - "target_kind and project_id are required."
  - "target_kind closes to primary_view, side_panel, bottom_panel, embedded_surface, and page_tab."
  - "target_kind is destination class only."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_target_destination_scope_drift
reasoning_tier: high
context_scope: routetarget_required_scope_destination
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Crosswalk.md
  - Plans/FileManager.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: routetarget_required_scope_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0060
preserved_exact_tokens:
  - "`route_target`"
  - "`target_kind`"
  - "`project_id`"
  - "`primary_view`"
  - "`side_panel`"
  - "`bottom_panel`"
  - "`embedded_surface`"
  - "`page_tab`"
  - "ContractRef: ContractName:Plans/Crosswalk.md, ContractName:Plans/FileManager.md, ContractName:Plans/FinalGUISpec.md"
negative_constraints:
  - "target_kind must not replace selector identity."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-164 - RouteTarget Primary Selector Families

```yaml
plan_unit_id: CV-164
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  route_target permits exactly one canonical primary selector: subject_id or
  object_kind plus object_id, with closed subject and object-kind families.
gui_related: false
gui_classification_reason: This unit defines route primary selector identity.
split_recommended: true
depends_on: [CV-054, CV-055, CV-163]
unblocks: [CV-165, CV-166, CV-171]
acceptance_criteria:
  - "Exactly one canonical primary selector is permitted."
  - "subject_id closes to doc:<document_id> and artifact:<artifact_id>."
  - "object_kind list from the source span is preserved."
  - "object_id pairs with object_kind for object selectors."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_primary_selector_competition
reasoning_tier: high
context_scope: routetarget_primary_selector_families
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Crosswalk.md
  - Plans/FileManager.md
node_compile_hint:
  mode: routetarget_primary_selector_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0060
preserved_exact_tokens:
  - "`subject_id`"
  - "`object_kind`"
  - "`object_id`"
  - "`thread`"
  - "`message`"
  - "`wizard`"
  - "`usage_event`"
  - "`blocked_episode`"
  - "`browser_session`"
  - "`terminal_session`"
  - "`dev_session`"
negative_constraints:
  - "Route payloads must not use competing primary selectors."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-165 - Terminal And Dev Session Route Identity

```yaml
plan_unit_id: CV-165
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Terminal-focused open and reveal contracts use terminal and dev-session
  object kinds with matching focus identifiers inside route_target object
  identity; terminal widgets target runtime/worker identity rather than tier_id.
gui_related: true
gui_classification_reason: This unit affects user-visible terminal and dev-session route behavior.
split_recommended: true
depends_on: [CV-057, CV-164]
unblocks: []
acceptance_criteria:
  - "Terminal section, tab, pane, session, and dev-session reveals stay in route_target object identity."
  - "Terminal routes prefer exact same-session reveal when terminal_session_id is supplied and still resolvable."
  - "Historical terminal routes may reveal a historical pane or receipt view."
  - "Terminal widgets target runtime/worker identity and terminal object identity rather than tier_id."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: terminal_route_identity_fork
reasoning_tier: high
context_scope: terminal_dev_session_route_identity
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
  - Plans/Crosswalk.md
node_compile_hint:
  mode: terminal_route_identity_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0060
preserved_exact_tokens:
  - "`terminal_section_id`"
  - "`terminal_tab_id`"
  - "`terminal_pane_id`"
  - "`terminal_session_id`"
  - "`dev_session_id`"
  - "`/worker`"
  - "`tier_id`"
  - "PTY"
compatibility_only_notes:
  - "Historical terminal routes may reveal a historical pane or receipt view."
negative_constraints:
  - "Terminal routes must not invent panel-local terminal routing semantics."
  - "Historical terminal routes must not synthesize live PTY continuity."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-166 - Route Activation Scope And Shell-State Boundary

```yaml
plan_unit_id: CV-166
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Route activation restores destination surface plus scope, selected object, and
  focus fields, while shell realization details remain view state and resume_url
  is serialized transport that decodes to route_target.
gui_related: true
gui_classification_reason: This unit affects route activation and visible destination surface restoration.
split_recommended: true
depends_on: [CV-057, CV-163, CV-164]
unblocks: [CV-167]
acceptance_criteria:
  - "Route activation overrides remembered shell state when needed to reveal the requested object, scope, and destination surface."
  - "Route activation may reuse remembered shell state only when that state still reveals the requested object cleanly."
  - "Destination surface plus project_id, focused_run_id, thread_id, selected object, and inspector_target are restored."
  - "resume_url decodes to route_target and remains serialized transport only."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_activation_shell_state_boundary_drift
reasoning_tier: high
context_scope: route_activation_shell_state_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Crosswalk.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: route_activation_boundary_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0060
preserved_exact_tokens:
  - "`focused_run_id`"
  - "`thread_id`"
  - "`tab_id`"
  - "`inspector_target`"
  - "`resume_url`"
  - "`/focus/destination-surface`"
  - "`/chrome`"
  - "`/editor/tree/session`"
compatibility_only_notes:
  - "resume_url is serialized transport only and decodes to route_target."
negative_constraints:
  - "Docked/floating placement, widths, local panel layout, chrome, editor tree state, line, and range must stay outside base route identity."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-167 - Inspector Target Refinement Boundary

```yaml
plan_unit_id: CV-167
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  inspector_target is reusable detail or subsection focus after primary selector
  identity is established; it is not selector identity and not a feature-local
  anchor bag.
gui_related: true
gui_classification_reason: This unit affects user-visible detail pane and subsection focus.
split_recommended: true
depends_on: [CV-058, CV-166]
unblocks: []
acceptance_criteria:
  - "inspector_target closed values are preserved."
  - "tab_id and inspector_target remain narrow focus-refinement fields."
  - "inspector_target = usage and inspector_target = lineage focus rules are preserved."
  - "Primary selector identity is established before inspector_target refinement."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: inspector_target_selector_replacement
reasoning_tier: high
context_scope: inspector_target_refinement_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: inspector_target_refinement_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0060
preserved_exact_tokens:
  - "`summary`"
  - "`evidence`"
  - "`artifacts`"
  - "`history`"
  - "`reviews`"
  - "`usage`"
  - "`lineage`"
  - "`details`"
  - "`/subsection`"
negative_constraints:
  - "inspector_target must not replace selector identity."
  - "inspector_target must not become a universal dumping ground for feature-local anchors."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-168 - Route Open Normalization Anti-Fork

```yaml
plan_unit_id: CV-168
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Settings, object navigation, search/open entry points, chat links, file-tree
  selections, and wizard/object links normalize to route_target plus OpenFile or
  OpenSubject; generated, thread-backed, artifact-backed, browser-session,
  terminal-session, and dev-session reveals must not mint new routing primitives.
gui_related: false
gui_classification_reason: This unit defines route/open normalization boundaries.
split_recommended: true
depends_on: [CV-031, CV-055, CV-163]
unblocks: [CV-172, CV-174]
acceptance_criteria:
  - "Settings, object navigation, search/open entry points, chat links, file-tree selections, and wizard/object links normalize to route_target plus OpenFile or OpenSubject."
  - "Generated, thread-backed, artifact-backed, browser-session, terminal-session, and dev-session reveals do not mint new routing primitives."
  - "OpenSubject owns document/artifact source realization."
  - "OpenFile owns workspace-file path opens."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_open_primitive_fork
reasoning_tier: high
context_scope: route_open_normalization_antifork
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Crosswalk.md
  - Plans/FileManager.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: route_open_normalization_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0060
preserved_exact_tokens:
  - "`OpenFile`"
  - "`OpenSubject`"
  - "`/object/navigation`"
  - "`/thread-backed`"
  - "`/artifact-backed`"
  - "browser-session"
  - "terminal-session"
  - "dev-session"
negative_constraints:
  - "Consumers must not own bespoke open behavior or mint a new route primitive for generated/thread/artifact/browser/terminal/dev reveals."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-169 - Route Resolver Fields And Alias Normalization

```yaml
plan_unit_id: CV-169
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Route resolver refinement uses resolver_scope, route_recipe_id?, tab_family?,
  and open_disposition?, with legacy tab-family and open-disposition labels
  normalized to canonical underscore field names.
gui_related: false
gui_classification_reason: This unit defines route resolver fields and alias normalization.
split_recommended: true
depends_on: [CV-163]
unblocks: [CV-170, CV-172]
acceptance_criteria:
  - "resolver_scope closes to project, run, thread, and global."
  - "open_disposition closes to reuse_existing, open_new, split_group, and focus_only."
  - "route_recipe_id? and tab_family? remain owner-defined refinement fields."
  - "Legacy tab-family and open-disposition labels normalize to tab_family and open_disposition."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_resolver_alias_drift
reasoning_tier: high
context_scope: route_resolver_fields_aliases
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Crosswalk.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: route_resolver_alias_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0060
preserved_exact_tokens:
  - "`resolver_scope`"
  - "`route_recipe_id?`"
  - "`tab_family?`"
  - "`open_disposition?`"
  - "`tab-family`"
  - "`open-disposition`"
compatibility_only_notes:
  - "Legacy labels tab-family and open-disposition map to tab_family and open_disposition."
negative_constraints:
  - "Producers must use canonical underscore field names in payloads."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-170 - Route Validity InvalidRoute Reject Rules

```yaml
plan_unit_id: CV-170
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Routes are rejected as invalid_route when target_kind, selector,
  resolver_scope, tab_family, or open_disposition is invalid for the destination
  surface; resolver scope is explicit where object kinds can exist in multiple
  runs, threads, or projects.
gui_related: false
gui_classification_reason: This unit defines route validation and reject rules.
split_recommended: true
depends_on: [CV-054, CV-169]
unblocks: [CV-171, CV-172]
acceptance_criteria:
  - "Invalid destination, selector, resolver scope, tab family, or open disposition combinations are rejected as invalid_route."
  - "Resolver scope is explicit when the same object_kind can exist in more than one run, thread, or project."
  - "tab_id is rejected as shell-local state when it is not valid for the destination surface."
  - "tab_id does not replace target_kind or inspector_target."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_invalid_combo_acceptance
reasoning_tier: high
context_scope: route_validity_reject_rules
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Crosswalk.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: route_validity_reject_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0060
preserved_exact_tokens:
  - "`invalid_route`"
  - "`resolver_scope`"
  - "`tab_id`"
  - "`target_kind`"
  - "`inspector_target`"
negative_constraints:
  - "Invalid destination/scope combinations must not be accepted as valid routes."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-171 - Scoped Resolution Examples And Object Rules

```yaml
plan_unit_id: CV-171
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Route examples and scoped-resolution rules are normative selector refinements
  owned by route_target and OpenSubject; chat search, wizard resume, blocked
  episode, scheduler pass, safe point, remediation, and attempt selectors retain
  their specified object IDs and focused_run_id requirements.
gui_related: false
gui_classification_reason: This unit defines route selector examples and scoped object rules.
split_recommended: true
depends_on: [CV-164, CV-170]
unblocks: []
acceptance_criteria:
  - "A chat search result uses object_kind = message with object_id = <message_id>."
  - "A wizard resume uses object_kind = wizard with object_id = <wizard_id>."
  - "blocked_episode, scheduler_pass, safe_point, remediation, and attempt keep their specified object_id forms and focused_run_id requirements."
  - "route_target owns destination, scope, selector, and resolver validation while OpenSubject owns identity-native source opening."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: scoped_route_rule_owner_drift
reasoning_tier: high
context_scope: scoped_resolution_examples_object_rules
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Crosswalk.md
  - Plans/Run_Graph_View.md
node_compile_hint:
  mode: scoped_route_resolution_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0060
preserved_exact_tokens:
  - "object_kind = message"
  - "object_kind = wizard"
  - "`blocked_sequence`"
  - "`scheduler_pass_id`"
  - "`safe_point_id`"
  - "`remediation_root_id`"
  - "`attempt_id`"
negative_constraints:
  - "Selector precedence, reject rules, route examples, and scoped-resolution rules must not move to consumer-owned behavior."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-172 - Route Reuse And Extra Args Prohibition

```yaml
plan_unit_id: CV-172
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Route reuse is allowed only when open_disposition permits reuse and the
  destination still reveals the requested object, scope, and inspector target;
  OpenFile reuse is one-tab-per-path-per-group, and producers may not add a
  generic extra-args bag to bypass validation.
gui_related: false
gui_classification_reason: This unit defines route reuse and field validation constraints.
split_recommended: true
depends_on: [CV-168, CV-169, CV-170]
unblocks: []
acceptance_criteria:
  - "Route activation may reuse an existing destination only when open_disposition permits reuse."
  - "The existing destination must still reveal the requested object, scope, and inspector target."
  - "OpenFile reuse is one-tab-per-path-per-group."
  - "Opening the same path in another group requires explicit multi-group disposition."
  - "Route producers do not add generic extra-args bags to bypass field validation."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: route_extra_args_validation_bypass
reasoning_tier: high
context_scope: route_reuse_extra_args_prohibition
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FileManager.md
  - Plans/UI_Command_Catalog.md
node_compile_hint:
  mode: route_reuse_validation_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0060
preserved_exact_tokens:
  - "`reuse_existing`"
  - "`multi-group`"
  - "`open_disposition`"
  - "generic extra-args bag"
negative_constraints:
  - "Route producers must not add a generic extra-args bag to bypass field validation."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-173 - Debug Target Kind Classification Enum

```yaml
plan_unit_id: CV-173
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  debug_target_kind is the canonical investigation-target classification for
  Debug Mode, naming the operational class under investigation and closing to
  dev_session, browser_target, dap_session, agent_session, and imported_bundle.
gui_related: false
gui_classification_reason: This unit defines debug target classification semantics.
split_recommended: true
depends_on: [CV-123, CV-163]
unblocks: [CV-174]
acceptance_criteria:
  - "debug_target_kind names the operational class being investigated."
  - "debug_target_kind closes to dev_session, browser_target, dap_session, agent_session, and imported_bundle."
  - "debug_target_kind does not replace route_target, OpenSubject, or stored session identities."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_target_kind_route_replacement
reasoning_tier: high
context_scope: debug_target_kind_classification
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: debug_target_kind_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0061
preserved_exact_tokens:
  - "`debug_target_kind`"
  - "Debug Mode"
  - "`dev_session`"
  - "`browser_target`"
  - "`dap_session`"
  - "`agent_session`"
  - "`imported_bundle`"
  - "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md"
negative_constraints:
  - "debug_target_kind does not replace route_target, OpenSubject, or stored session identities."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-174 - Debug Imported Bundle And Display Boundary

```yaml
plan_unit_id: CV-174
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Live or resumable debug targets are PM-controlled target classes, while
  imported_bundle identifies external evidence that can be inspected and
  reasoned over without pretending PM can still drive the original runtime
  target; durable routing and opening continue through canonical route/open
  contracts.
gui_related: false
gui_classification_reason: This unit defines debug imported bundle and display boundaries.
split_recommended: true
depends_on: [CV-168, CV-173]
unblocks: []
acceptance_criteria:
  - "dev_session, browser_target, dap_session, and agent_session identify live or resumable PM-controlled targets."
  - "imported_bundle identifies an external investigation bundle."
  - "Consumers may display requested and effective target details."
  - "Durable routing and opening continue through canonical route/open contracts."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: debug_imported_bundle_live_control_confusion
reasoning_tier: high
context_scope: debug_imported_bundle_display_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: debug_imported_bundle_boundary_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0061
preserved_exact_tokens:
  - "`imported_bundle`"
  - "requested"
  - "effective"
  - "route/open contracts"
negative_constraints:
  - "imported_bundle must not pretend PM can still drive the original runtime target."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-175 - OpenSubject Required Fields And Intents

```yaml
plan_unit_id: CV-175
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  OpenSubject is the canonical identity-native source-open contract with
  required subject_id and open_intent fields; open_intent is closed to
  open_source, open_preview, and open_review.
gui_related: false
gui_classification_reason: This unit defines source-open contract fields rather than visual presentation.
split_recommended: false
depends_on: [CV-168]
unblocks: [CV-176, CV-177]
acceptance_criteria:
  - "OpenSubject requires subject_id and open_intent."
  - "open_intent accepts only open_source, open_preview, and open_review."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: open_subject_field_drift
reasoning_tier: high
context_scope: open_subject_required_fields
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FileManager.md
node_compile_hint:
  mode: open_subject_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0062
preserved_exact_tokens:
  - "`OpenSubject`"
  - "`subject_id`"
  - "`open_intent`"
  - "`open_source`"
  - "`open_preview`"
  - "`open_review`"
negative_constraints: []
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/FileManager.md
```

### CV-176 - OpenSubject Resolution And Route Boundary

```yaml
plan_unit_id: CV-176
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  OpenSubject resolves canonical identity to OpenFile or to a transient
  generated://<artifact_id> buffer, while terminal, dev-session, and
  browser-session reveals normalize through route_target instead of overloading
  OpenSubject.
gui_related: false
gui_classification_reason: This unit defines route/open identity boundaries rather than visual presentation.
split_recommended: false
depends_on: [CV-163, CV-168, CV-175]
unblocks: [CV-177, CV-179]
acceptance_criteria:
  - "Transport details do not belong in OpenSubject."
  - "Generated or artifact-backed source results use OpenSubject."
  - "Real workspace source results use OpenFile."
  - "Thread, browser, terminal, and dev-session reveals remain route targets."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: open_subject_route_boundary_drift
reasoning_tier: high
context_scope: open_subject_route_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FileManager.md
  - Plans/storage-plan.md
  - Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: open_subject_route_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0062
preserved_exact_tokens:
  - "`generated://<artifact_id>`"
  - "`route_target`"
  - "`OpenFile`"
  - "`/artifact-backed`"
  - "ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md"
negative_constraints:
  - "OpenSubject must not be overloaded for terminal, dev-session, or browser-session reveals."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/FileManager.md
  - Plans/Runtime_Artifacts_Panel.md
```

### CV-177 - OpenSubject Subject Terms And Bounds

```yaml
plan_unit_id: CV-177
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  OpenSubject subject_id is bounded to canonical renderable/openable document
  and artifact content identities using doc:<document_id> and
  artifact:<artifact_id>; everything else routes by object_kind + object_id.
gui_related: false
gui_classification_reason: This unit defines canonical source-open identifiers rather than visual presentation.
split_recommended: false
depends_on: [CV-164, CV-175]
unblocks: []
acceptance_criteria:
  - "subject_id accepts canonical document and artifact content identities."
  - "Labels open subject and subject identity are preserved."
  - "Non-document and non-artifact subjects route by object_kind + object_id."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: open_subject_identity_bounds_drift
reasoning_tier: high
context_scope: open_subject_identity_terms
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FileManager.md
node_compile_hint:
  mode: open_subject_identity_bounds
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0062
preserved_exact_tokens:
  - "`doc:<document_id>`"
  - "`artifact:<artifact_id>`"
  - "`object_kind + object_id`"
  - "open subject"
  - "subject identity"
negative_constraints:
  - "subject_id must not claim non-renderable or non-openable content identity."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/FileManager.md
```

### CV-178 - Durable Panel Settings Ownership

```yaml
plan_unit_id: CV-178
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Settings-page organization owns durable panel-specific persistence and
  visibility controls when they affect reusable app or project preferences,
  while storage owns persistence keys/write cadence and FinalGUISpec owns
  grouping and visible placement.
gui_related: true
gui_classification_reason: This unit defines visible Settings organization and panel preference placement.
split_recommended: false
depends_on: []
unblocks: [CV-179]
acceptance_criteria:
  - "Panel preferences appear under their owning Settings tab."
  - "Cross-cutting visibility, shortcut, security, and health controls stay under General, Shortcuts, Advanced, or Health."
  - "Storage-plan owns persistence keys and write cadence."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: settings_ownership_drift
reasoning_tier: standard
context_scope: panel_settings_ownership
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: settings_panel_ownership
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0063
preserved_exact_tokens:
  - "Source Control / Branching"
  - "GitHub Actions"
  - "Docker Manager / Kubernetes"
  - "Models / Providers"
  - "General"
  - "Shortcuts"
  - "Advanced"
  - "Health"
negative_constraints:
  - "Cross-cutting settings must not be duplicated by each panel."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
```

### CV-179 - Live Panel State Is Not Settings Canon

```yaml
plan_unit_id: CV-179
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Live run actions, selected runtime objects, current inspector focus, and
  transient filter focus stay in the owning panel or route_target/OpenSubject
  payloads and are not promoted into settings-page canon merely because a panel
  can display them.
gui_related: true
gui_classification_reason: This unit constrains visible panel state and Settings behavior.
split_recommended: false
depends_on: [CV-176, CV-178]
unblocks: []
acceptance_criteria:
  - "Transient panel state stays in the owning panel or route/open payload."
  - "Settings canon contains durable preferences, not live run actions."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: transient_state_settings_drift
reasoning_tier: standard
context_scope: live_panel_state_settings_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: settings_transient_state_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0063
preserved_exact_tokens:
  - "`route_target`"
  - "`OpenSubject`"
  - "transient filter focus"
negative_constraints:
  - "Live run actions and transient focus must not be promoted into settings-page canon."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
```

### CV-180 - Account-Sensitive UI Cache Partitioning

```yaml
plan_unit_id: CV-180
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  GitHub Actions, Docker registry state, Kubernetes selections, and SSH remote
  selections either store account-sensitive UI/cache state per effective account
  identity or invalidate that state on account switch.
gui_related: true
gui_classification_reason: This unit includes user-visible panel cache, focus, and selection state.
split_recommended: true
depends_on: [CV-145, CV-148]
unblocks: [CV-181, CV-182]
acceptance_criteria:
  - "Pinned workflows and last-opened run/job/log focus are partitioned or invalidated by effective account identity."
  - "Namespace selections and admin-readiness snapshots are partitioned or invalidated by effective account identity."
  - "Account-sensitive UI/cache state does not survive an account switch under the wrong identity."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: account_sensitive_cache_leak
reasoning_tier: high
context_scope: account_sensitive_panel_cache
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: account_sensitive_ui_cache_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0064
preserved_exact_tokens:
  - "effective account identity"
  - "`/job/log`"
  - "admin-readiness snapshots"
  - "GitHub Actions"
  - "Docker registry state"
  - "Kubernetes selections"
  - "SSH remote selections"
negative_constraints:
  - "Account-sensitive UI/cache state must not be reused after account switch without partitioning or invalidation."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### CV-181 - Requested Identity Binding For Blocked Hosted Work

```yaml
plan_unit_id: CV-181
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Queued or blocked work that depends on hosted auth or admin capability
  persists requested_account_identity or an equivalent auth-handle reference,
  and on resume revalidates if the active account changed.
gui_related: false
gui_classification_reason: This unit defines hosted-auth work identity binding rather than visual presentation.
split_recommended: false
depends_on: [CV-145, CV-180]
unblocks: [CV-182]
acceptance_criteria:
  - "Blocked hosted work persists requested_account_identity or an equivalent auth handle."
  - "Account changes require an explicitly accepted new identity or the work remains identity_changed."
  - "The rule applies to Actions admin CRUD, workflow dispatch, image push or repository creation, and cluster mutations."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_work_identity_drift
reasoning_tier: high
context_scope: hosted_auth_blocked_work_identity
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: requested_identity_binding
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0064
preserved_exact_tokens:
  - "`requested_account_identity`"
  - "`identity_changed`"
  - "Actions admin CRUD"
  - "workflow dispatch"
  - "image push"
  - "cluster mutations"
negative_constraints:
  - "Hosted-auth work must not resume silently under a changed active account."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### CV-182 - Runtime Admin Capability Disclosure

```yaml
plan_unit_id: CV-182
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Runtime identity and admin identity are distinct capability sets; receipts,
  disabled states, requested views, and disclosure views show which identity and
  capability set was evaluated for the attempted action.
gui_related: true
gui_classification_reason: This unit defines user-visible receipts, disabled states, and disclosure views.
split_recommended: false
depends_on: [CV-181]
unblocks: []
acceptance_criteria:
  - "Read capability does not imply secrets or environments admin capability."
  - "Receipts and disabled states disclose which identity and capability set were evaluated."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: admin_capability_disclosure_drift
reasoning_tier: high
context_scope: runtime_admin_capability_disclosure
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: runtime_admin_capability_disclosure
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0064
preserved_exact_tokens:
  - "`/requested`"
  - "`/disclosure`"
  - "`/environments`"
  - "runtime identity"
  - "admin identity"
negative_constraints:
  - "A GitHub identity that can read runs must not be treated as administering secrets or environments."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
```

### CV-183 - Quota Pressure Evidence Semantics

```yaml
plan_unit_id: CV-183
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Usage or quota pressure becomes exhausted or failover-required only when the
  provider, runtime, or selected plan refuses more usage; provider responses,
  rate-limit signals, and reset hints outrank local token statistics.
gui_related: false
gui_classification_reason: This unit defines provider quota semantics rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: [CV-184]
acceptance_criteria:
  - "Warnings and approaching-threshold signals remain pressure evidence."
  - "ChatGPT-backed Codex plan-included limits stay separate from API-key usage."
  - "Claude Code subscription stats remain softer evidence than API cost unless exhaustion is explicitly reported."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: quota_pressure_semantics_drift
reasoning_tier: high
context_scope: provider_quota_pressure
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: quota_pressure_semantics
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0064
preserved_exact_tokens:
  - "`exhausted`"
  - "ChatGPT-backed Codex"
  - "API-key"
  - "`/reset`"
  - "`/cost`"
  - "`/stats`"
negative_constraints:
  - "Warnings and estimates must not automatically trigger failover-required behavior."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
```

### CV-184 - Provider Recovery Labels And Entitlement Copy

```yaml
plan_unit_id: CV-184
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Account recovery projections expose Retry Sign-In, Choose Billing Entity, and
  Refresh Entitlements, use product-language provider labels, preserve
  skip/cooldown machine reasons, and display policy_blocked as Blocked by plan
  or policy.
gui_related: true
gui_classification_reason: This unit defines user-visible recovery labels, setup copy, and provider entitlement wording.
split_recommended: false
depends_on: [CV-183]
unblocks: []
acceptance_criteria:
  - "Missing billing entity for premium requests displays Needs setup."
  - "Copilot setup copy preserves the license and organization policy wording."
  - "Cooldown displays preserve the underlying machine reason."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_recovery_label_drift
reasoning_tier: standard
context_scope: provider_recovery_entitlement_copy
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: provider_recovery_label_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0064
preserved_exact_tokens:
  - "Retry Sign-In"
  - "Choose Billing Entity"
  - "Refresh Entitlements"
  - "Needs setup"
  - "Uses your GitHub Copilot license and organization policies"
  - "`rate-limited`"
  - "`model-unsupported`"
  - "`workspace-deactivated`"
  - "`auth-invalid`"
  - "Blocked by plan or policy"
negative_constraints:
  - "Provider-facing usage labels must not expose raw internal field names when product language explains the entitlement bucket."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
```

### CV-185 - Current Requested Effective Runtime Inspector Visibility

```yaml
plan_unit_id: CV-185
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  The current predicted requested/effective state remains visible in the
  runtime inspector and is not hidden behind Usage, history, or diagnostics;
  deeper run-specific inspection is supplemental.
gui_related: true
gui_classification_reason: This unit defines user-visible runtime inspector disclosure.
split_recommended: false
depends_on: [CV-145]
unblocks: [CV-186]
acceptance_criteria:
  - "Current requested/effective state remains visible in the runtime inspector."
  - "History, diagnostics, and run-specific views supplement rather than replace current state."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: runtime_identity_visibility_loss
reasoning_tier: high
context_scope: runtime_inspector_requested_effective_state
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: runtime_identity_inspector_visibility
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0064
preserved_exact_tokens:
  - "runtime inspector"
  - "`/history/diagnostics`"
  - "`/run-specific`"
  - "requested/effective"
negative_constraints:
  - "The current predicted requested/effective state must not be hidden behind Usage/history/diagnostics."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
```

### CV-186 - Canonical Vs Internal Audit Split

```yaml
plan_unit_id: CV-186
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Requested/effective identity, clamping outcomes, and switching outcomes belong
  in canonical snapshots, while provider-registry and scheduler-only internals
  remain subordinate evidence unless a debug or audit contract promotes them.
gui_related: false
gui_classification_reason: This unit defines audit/source boundary semantics rather than visual presentation.
split_recommended: false
depends_on: [CV-185]
unblocks: []
acceptance_criteria:
  - "Canonical snapshots carry requested/effective identity, clamping outcomes, and switching outcomes."
  - "Provider-registry and scheduler-only internals stay subordinate unless promoted by a debug or audit contract."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: canonical_internal_boundary_drift
reasoning_tier: high
context_scope: canonical_internal_audit_split
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: canonical_internal_audit_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0064
preserved_exact_tokens:
  - "`/switching`"
  - "canonical snapshots"
  - "provider-registry"
  - "scheduler-only internals"
negative_constraints:
  - "Provider-registry or scheduler-only internals must not be promoted without a debug or audit contract."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### CV-187 - UI Scale Setting Field Contract

```yaml
plan_unit_id: CV-187
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  The app exposes a user-facing UI scale setting in Settings General with
  scale_range [0.75, 1.5], presets [0.75, 0.9, 1.0, 1.1], default 1.0, and
  visible preset buttons 75 %, 90 %, 100 %, and 110 %.
gui_related: true
gui_classification_reason: This unit defines visible UI scale controls.
split_recommended: false
depends_on: []
unblocks: [CV-188]
acceptance_criteria:
  - "Settings General exposes the UI scale setting."
  - "The four preset buttons 75 %, 90 %, 100 %, and 110 % appear."
  - "The scale range is clamped to [0.75, 1.5] and default is 1.0."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: ui_scale_setting_drift
reasoning_tier: standard
context_scope: ui_scale_setting_fields
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: ui_scale_setting_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0065
preserved_exact_tokens:
  - "`scale_range`"
  - "`[0.75, 1.5]`"
  - "`[0.75, 0.9, 1.0, 1.1]`"
  - "`1.0`"
  - "75 %"
  - "90 %"
  - "100 %"
  - "110 %"
  - "ContractRef: ContractName:Plans/FinalGUISpec.md#7.4, ContractName:Plans/FinalGUISpec.md#16.2"
negative_constraints: []
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
```

### CV-188 - Slint Native Scale Mechanism And Iced Prohibition

```yaml
plan_unit_id: CV-188
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  The Slint rewrite implements UI scale through Slint native global/window scale
  factor as the only app-level scaling path; per-token manual scaling and
  Iced-era ScaledTokens multiplication layers are prohibited, and editor text
  zoom remains independent.
gui_related: true
gui_classification_reason: This unit constrains GUI implementation scaling behavior.
split_recommended: false
depends_on: [CV-187]
unblocks: []
acceptance_criteria:
  - "Slint native global/window scale factor is the only app-level UI scaling path."
  - "Per-token manual scaling and Iced-era ScaledTokens multiplication are not ported."
  - "Editor text zoom remains independent of app-level UI scale."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: slint_scale_mechanism_drift
reasoning_tier: high
context_scope: slint_ui_scale_mechanism
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: slint_native_scale_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0065
preserved_exact_tokens:
  - "Slint native scale factor"
  - "Per-token manual scaling"
  - "`ScaledTokens`"
  - "PolicyRule:Plans/rewrite-tie-in-memo.md#ui-scaling-migration"
negative_constraints:
  - "Per-token manual scaling or Iced-era ScaledTokens multiplication layers must not be ported to Slint view code."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
```

### CV-189 - Usage Cost Microdollars Persistence

```yaml
plan_unit_id: CV-189
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Persisted usage and cost values are stored as integer microdollars using u64;
  presentation converts those values to decimal currency strings while storage
  and accumulation do not.
gui_related: false
gui_classification_reason: This unit defines storage value types rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: [CV-193, CV-205, CV-206]
acceptance_criteria:
  - "Persisted usage and cost values use integer microdollars."
  - "Presentation can convert to decimal currency strings."
  - "Storage and accumulation do not use decimal currency strings."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: cost_storage_type_drift
reasoning_tier: high
context_scope: usage_cost_persistence
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: usage_cost_microdollars_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0067
preserved_exact_tokens:
  - "integer microdollars"
  - "`u64`"
  - "ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md"
negative_constraints:
  - "Storage and accumulation must not use decimal currency strings."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
  - Plans/storage-plan.md
```

### CV-190 - Thread Usage Detail Surface Replacement

```yaml
plan_unit_id: CV-190
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Assistant chat-thread usage uses a shared context-detail contract instead of a
  chat-local side panel; the stale direct-click detail-open pattern is replaced
  by hover info-popover plus More Details, and clicking the context circle means
  Compact Now.
gui_related: true
gui_classification_reason: This unit defines user-visible thread usage interaction behavior.
split_recommended: false
depends_on: []
unblocks: [CV-191, CV-192, CV-193]
acceptance_criteria:
  - "Hover shows the compact thread status module."
  - "More Details opens the context-detail editor-tab detail surface."
  - "Clicking the context circle triggers Compact Now."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: thread_usage_detail_pattern_drift
reasoning_tier: standard
context_scope: thread_usage_detail_surface
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: thread_usage_detail_compatibility_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0068
preserved_exact_tokens:
  - "More Details"
  - "Compact Now"
  - "hover info-popover"
  - "context-detail editor-tab detail-surface"
stale_retired_dispositions:
  - "The stale direct-click detail-open pattern is retired."
negative_constraints:
  - "Assistant chat-thread usage surfaces must not use a chat-local side panel as the shared detail contract."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
```

### CV-191 - Compact Message Usage Row Schema

```yaml
plan_unit_id: CV-191
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  The under-message summary and Messages tab compact-row schema is closed to
  role, worker type, mode, model, time or duration, total tokens, and cost; each
  message renders one expandable row with the closed Assistant Chat label set.
gui_related: true
gui_classification_reason: This unit defines visible message rows, labels, and actions.
split_recommended: false
depends_on: [CV-190]
unblocks: []
acceptance_criteria:
  - "Messages renders one expandable row per message."
  - "Expanded rows use Mode, Provider, Model, Effort, Persona, Worker, Tokens, and Context labels."
  - "Resend retries the most recent user message and discards later history or work."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: compact_usage_row_schema_drift
reasoning_tier: standard
context_scope: compact_message_usage_rows
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: compact_message_usage_row_schema
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0068
preserved_exact_tokens:
  - "`Messages`"
  - "`/duration`"
  - "Mode"
  - "Provider"
  - "Model"
  - "Effort"
  - "Persona"
  - "Worker"
  - "Tokens"
  - "Context"
  - "`Resend`"
negative_constraints:
  - "Resend must discard later history or work when retrying the most recent user message."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
```

### CV-192 - Context Detail Editor Tab Paths

```yaml
plan_unit_id: CV-192
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  The context-detail editor tab has top-level Curated and raw inspection paths;
  Curated contains Overview, Breakdown, and Messages, and Deep Plan remains a
  distinct workflow identity and display label.
gui_related: true
gui_classification_reason: This unit defines visible context-detail tab paths and labels.
split_recommended: false
depends_on: [CV-190]
unblocks: []
acceptance_criteria:
  - "Curated contains Overview, Breakdown, and Messages."
  - "Raw inspection may expose serialized payloads, provider metadata, and path/runtime data for log, detail, and debugging."
  - "Deep Plan remains distinct from generic plan mode."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: context_detail_path_drift
reasoning_tier: standard
context_scope: context_detail_editor_tab
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: context_detail_editor_tab_paths
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0068
preserved_exact_tokens:
  - "`Curated`"
  - "`/raw`"
  - "`/workflow`"
  - "Deep Plan"
  - "Overview"
  - "Breakdown"
  - "Messages"
negative_constraints:
  - "Raw/log/detail/debug fields must not become chat-facing labels."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
```

### CV-193 - Thread Estimated Cost Display

```yaml
plan_unit_id: CV-193
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Thread cost labels are Estimated Cost unless PM has provider-authoritative
  cost semantics for that value; estimated baselines may use OpenCode-style
  normalization while preserving provider buckets and over-200k tier behavior.
gui_related: true
gui_classification_reason: This unit defines user-visible thread cost labels.
split_recommended: false
depends_on: [CV-189]
unblocks: [CV-194]
acceptance_criteria:
  - "Thread cost labels use Estimated Cost unless provider-authoritative cost exists."
  - "Estimated baseline may use OpenCode-style normalization."
  - "Provider-reported buckets, cache caveats, and over-200k pricing tier selection are preserved where available."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: thread_cost_display_drift
reasoning_tier: standard
context_scope: thread_estimated_cost_display
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: thread_estimated_cost_display
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0068
preserved_exact_tokens:
  - "Estimated Cost"
  - "OpenCode-style normalization"
  - "over-200k"
negative_constraints:
  - "Estimated display labels must not imply provider-authoritative cost when that authority is absent."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
```

### CV-194 - Provider Cost Raw Audit Preservation

```yaml
plan_unit_id: CV-194
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Raw, log, and debug paths preserve normalization path, provider-reported
  buckets, provider-sensitive cache normalization caveats, and raw bucket values
  for audit so display estimates do not drop evidence.
gui_related: false
gui_classification_reason: This unit defines audit evidence preservation rather than visual presentation.
split_recommended: false
depends_on: [CV-193]
unblocks: []
acceptance_criteria:
  - "Raw, log, and debug paths preserve normalization path and raw bucket values."
  - "Provider-sensitive cache normalization caveats remain available for audit."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: provider_cost_audit_loss
reasoning_tier: high
context_scope: provider_cost_raw_audit
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: provider_cost_raw_audit_preservation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0068
preserved_exact_tokens:
  - "provider-reported buckets"
  - "raw bucket values"
  - "`/log`"
  - "`/detail`"
  - "`/debugging`"
negative_constraints:
  - "Display estimates must not drop provider-sensitive raw evidence."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
```

### CV-195 - Implementation Readiness Naming Boundary

```yaml
plan_unit_id: CV-195
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Implementation readiness pins canonical schema and field names only when they
  are part of planning-doc contracts, persisted payloads, runtime identity
  objects, or cross-doc shared vocabulary; implementation-local helpers,
  variables, and UI components do not need pre-naming.
gui_related: false
gui_classification_reason: This unit defines planning readiness and naming scope rather than GUI work.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "Canonical schema and field names are pinned only for contracts, persisted payloads, runtime identity, or shared vocabulary."
  - "Implementation-local helper, variable, and component names are not required ahead of time."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: over_specified_implementation_names
reasoning_tier: standard
context_scope: implementation_readiness_naming
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: implementation_naming_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0068
preserved_exact_tokens:
  - "`/field`"
  - "planning-doc contracts"
  - "persisted payloads"
  - "runtime identity objects"
negative_constraints:
  - "Implementation readiness must not require naming every implementation-local helper, variable, or UI component ahead of time."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-196 - Canonical Token Bucket Fields

```yaml
plan_unit_id: CV-196
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  The canonical token buckets are input_tokens, output_tokens,
  cache_read_input_tokens, cache_creation_input_tokens, and reasoning_tokens.
gui_related: false
gui_classification_reason: This unit defines usage schema fields rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: [CV-197, CV-198, CV-204, CV-211]
acceptance_criteria:
  - "All five canonical token bucket fields are preserved individually."
  - "Consumers do not collapse the token buckets into a smaller canonical set."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: token_bucket_schema_drift
reasoning_tier: high
context_scope: canonical_token_buckets
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
  - Plans/Architecture_Invariants.md
node_compile_hint:
  mode: token_bucket_field_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0069
preserved_exact_tokens:
  - "`input_tokens`"
  - "`output_tokens`"
  - "`cache_read_input_tokens`"
  - "`cache_creation_input_tokens`"
  - "`reasoning_tokens`"
  - "ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Architecture_Invariants.md"
negative_constraints:
  - "Canonical token buckets must not be collapsed into a smaller field set."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
```

### CV-197 - Token Counting Adapter And Raw Metadata

```yaml
plan_unit_id: CV-197
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Provider-specific token counting flows through a token-counting abstraction
  before canonical buckets are persisted, and raw provider counts explain the
  canonical buckets without replacing them.
gui_related: false
gui_classification_reason: This unit defines usage accounting metadata rather than visual presentation.
split_recommended: false
depends_on: [CV-196]
unblocks: []
acceptance_criteria:
  - "Usage records preserve token_counting_adapter_id and token_counting_basis."
  - "Optional provider raw-count metadata remains explanatory and does not replace canonical buckets."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: token_counting_adapter_drift
reasoning_tier: high
context_scope: token_counting_adapter_metadata
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: token_counting_adapter_metadata
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0069
preserved_exact_tokens:
  - "`token_counting_adapter_id`"
  - "`token_counting_basis`"
  - "provider raw-count metadata"
negative_constraints:
  - "Raw provider counts must not replace canonical token buckets."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
```

### CV-198 - Token Bucket Persistence And Total Tokens Limit

```yaml
plan_unit_id: CV-198
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Token buckets are individually persisted for every LLM call, including title
  generation, summaries, helper passes, subagents, and background operations;
  total_tokens may be stored or derived for convenience but must not replace the
  individual buckets.
gui_related: false
gui_classification_reason: This unit defines usage persistence rules rather than visual presentation.
split_recommended: false
depends_on: [CV-196]
unblocks: []
acceptance_criteria:
  - "Every LLM call emits separated input, output, cache_read, cache_write, and reasoning buckets."
  - "Client-side spending limit enforcement reads the canonical usage stream rather than an optional display rollup."
  - "total_tokens does not replace the individual token buckets."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: token_bucket_collapse
reasoning_tier: high
context_scope: token_bucket_persistence
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: token_bucket_persistence_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0069
preserved_exact_tokens:
  - "`total_tokens`"
  - "title generation"
  - "summaries"
  - "hidden helper passes"
  - "subagents"
  - "background ops"
  - "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FinalGUISpec.md"
negative_constraints:
  - "`total_tokens` MAY be stored or derived for convenience, but it MUST NOT replace the individual token buckets."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### CV-199 - Usage Attribution Minimum Fields

```yaml
plan_unit_id: CV-199
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Usage records and normalized usage events preserve provider, model, account,
  provider-native account label, parent run, per-message model attribution,
  parent aggregation, billing entity, and entitlement fields needed for
  attribution and rollups.
gui_related: false
gui_classification_reason: This unit defines usage attribution schema fields rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: [CV-200, CV-201, CV-203, CV-204, CV-208]
acceptance_criteria:
  - "provider_id, model_id, account_id, parent_run_id, billing_entity_id, and entitlement_class are preserved when known."
  - "provider_account_id and account-label remain provider-native or display metadata subordinate to stable account identity."
  - "Per-message model attribution is preserved for user-visible and background LLM calls."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: usage_attribution_field_loss
reasoning_tier: high
context_scope: usage_attribution_minimum_fields
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
  - Plans/Models_System.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: usage_attribution_minimum_fields
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0070
preserved_exact_tokens:
  - "`provider_id`"
  - "`model_id`"
  - "`account_id`"
  - "`provider_account_id?`"
  - "`/account-label`"
  - "`parent_run_id`"
  - "`billing_entity_id`"
  - "`entitlement_class`"
  - "ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/Models_System.md, ContractName:Plans/storage-plan.md"
negative_constraints:
  - "Provider-native display metadata must not replace stable account identity."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
  - Plans/Models_System.md
```

### CV-200 - Usage Source Window And Cache Metadata

```yaml
plan_unit_id: CV-200
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Usage attribution preserves usage_source_kind, window_label, closed
  window_scope values, cache_hit, cache_strategy, and maps the display phrase
  usage-record to the canonical usage_record object.
gui_related: false
gui_classification_reason: This unit defines usage attribution metadata rather than visual presentation.
split_recommended: false
depends_on: [CV-199]
unblocks: []
acceptance_criteria:
  - "window_scope is closed to provider, account, account+model, org, and server_profile."
  - "usage_source_kind distinguishes local-estimated, API-key-derived, OAuth-quota-derived, and combined API/OAuth attribution."
  - "cache_hit and cache_strategy remain available where they affect attribution."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: usage_source_metadata_loss
reasoning_tier: high
context_scope: usage_source_window_cache_metadata
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: usage_source_window_cache_metadata
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0070
preserved_exact_tokens:
  - "`usage_source_kind`"
  - "`window_label`"
  - "`window_scope`"
  - "`cache_hit?`"
  - "`cache_strategy?`"
  - "`usage_record`"
  - "`provider | account | account+model | org | server_profile`"
  - "`local-estimated`"
  - "API-key-derived"
  - "OAuth-quota-derived"
negative_constraints:
  - "Usage source and window metadata must not collapse all usage into one projection."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
```

### CV-201 - Attribution Tuple And Consumer Coherence

```yaml
plan_unit_id: CV-201
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Usage attribution is keyed by the tuple provider_id, model_id, account_id,
  billing_entity_id, and entitlement_class when those dimensions are known, and
  node-level consumers must not restate or conflict with the requested/effective
  account model.
gui_related: false
gui_classification_reason: This unit defines attribution and consumer contract boundaries rather than visual presentation.
split_recommended: false
depends_on: [CV-199]
unblocks: [CV-202, CV-203, CV-213]
acceptance_criteria:
  - "Attribution uses the provider, model, account, billing entity, and entitlement tuple when known."
  - "Orchestrator, Run Graph, and Models consumers stay coherent with the requested/effective account model."
  - "billing_entity_id alone is not a sufficient substitute when account or entitlement context exists."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: attribution_tuple_collapse
reasoning_tier: high
context_scope: usage_attribution_tuple_consumer_coherence
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Orchestrator_Page.md
  - Plans/Run_Graph_View.md
  - Plans/Models_System.md
node_compile_hint:
  mode: attribution_tuple_consumer_coherence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0070
preserved_exact_tokens:
  - "`(provider_id, model_id, account_id?, billing_entity_id?, entitlement_class?)`"
  - "`billing_entity_id`"
  - "requested/effective account model"
  - "Plans/Orchestrator_Page.md"
  - "Plans/Run_Graph_View.md"
  - "Plans/Models_System.md"
negative_constraints:
  - "Attribution must not collapse to billing_entity_id alone when account or entitlement context exists."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
```

### CV-202 - Gemini OAuth API-Key Auth Surface Boundary

```yaml
plan_unit_id: CV-202
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Gemini usage and account wording keeps OAuth bucket semantics distinct from
  API-key semantics; provider-settings and auth UI expose OAuth login,
  re-auth/logout, status, what each mode unlocks, which bucket each mode uses,
  and precedence when both are present.
gui_related: true
gui_classification_reason: This unit defines provider-settings and auth UI copy/surfaces.
split_recommended: false
depends_on: [CV-201]
unblocks: []
acceptance_criteria:
  - "OAuth and API key modes remain distinct in usage and account wording."
  - "Provider-settings/auth UI exposes OAuth login, re-auth/logout, status, unlocks, bucket use, and precedence."
  - "GUI/spec copy does not over-focus API key or under-specify OAuth."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: gemini_auth_surface_drift
reasoning_tier: high
context_scope: gemini_oauth_api_key_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
  - Plans/Models_System.md
node_compile_hint:
  mode: gemini_auth_surface_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0070
preserved_exact_tokens:
  - "OAuth"
  - "API key"
  - "`/re-auth/logout`"
  - "OAuth bucket semantics"
  - "API-key semantics"
negative_constraints:
  - "GUI/spec copy must not over-focus API key or under-specify OAuth as a distinct surface."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
```

### CV-203 - Usage Lineage And Bridge Enforcement Fields

```yaml
plan_unit_id: CV-203
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Bridge adapters, storage snapshots, analytics rollups, and UI projections
  preserve attribution tuple fields; background/helper usage carries the same
  tuple and parent_run_id, and bridge-visible spending fields round-trip through
  the normalized stream.
gui_related: false
gui_classification_reason: This unit defines bridge, storage, and analytics usage lineage behavior.
split_recommended: false
depends_on: [CV-199, CV-201]
unblocks: []
acceptance_criteria:
  - "Bridge adapters, storage snapshots, analytics rollups, and UI projections preserve tuple fields."
  - "Background and helper usage keep the same attribution tuple and parent_run_id."
  - "Bridge-visible spending-limit fields remain aligned with Run_Modes and CLI_Bridged_Providers."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: usage_lineage_bridge_field_loss
reasoning_tier: high
context_scope: usage_lineage_bridge_enforcement
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Run_Modes.md
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: usage_lineage_bridge_enforcement_fields
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0070
preserved_exact_tokens:
  - "bridge adapters"
  - "storage snapshots"
  - "analytics rollups"
  - "UI projections"
  - "`parent_run_id`"
  - "Plans/Run_Modes.md"
  - "Plans/CLI_Bridged_Providers.md"
negative_constraints:
  - "Background/helper usage must not invent a second attribution model."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/CLI_Bridged_Providers.md
```

### CV-204 - Legacy Run Completed Usage Compatibility

```yaml
plan_unit_id: CV-204
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  run.completed.usage snapshots must not use the legacy tokens_in, tokens_out,
  cost, thread_id tuple as the persisted contract; compatibility import maps
  legacy fields into canonical token buckets, microdollar cost fields,
  attribution tuple, and runtime lineage.
gui_related: false
gui_classification_reason: This unit defines compatibility import and persisted usage contract behavior.
split_recommended: false
depends_on: [CV-196, CV-199]
unblocks: []
acceptance_criteria:
  - "New run.completed.usage snapshots do not persist the legacy tuple."
  - "Compatibility import maps legacy tokens and cost into canonical buckets and microdollars."
  - "Compatibility import preserves attribution tuple and runtime lineage."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: legacy_usage_tuple_revival
reasoning_tier: high
context_scope: run_completed_usage_compatibility
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: legacy_usage_tuple_compatibility_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0070
preserved_exact_tokens:
  - "`run.completed.usage`"
  - "`(tokens_in, tokens_out, cost, thread_id)`"
  - "`tokens_in`"
  - "`tokens_out`"
  - "`cost`"
compatibility_only_notes:
  - "Compatibility import of legacy usage fields is separate from already-fixed root-precedence rules."
negative_constraints:
  - "`run.completed.usage` snapshots MUST NOT use the legacy `(tokens_in, tokens_out, cost, thread_id)` tuple as the persisted contract."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
```

### CV-205 - Cost Accumulation Monotonic Adjustments

```yaml
plan_unit_id: CV-205
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Cost accumulation is monotonic, non-decreasing, and non-negative across a
  cumulative session; model-switch sign flips or provider corrections that
  would produce negative raw cost are recorded as adjustment or clamp events
  instead of retroactively decreasing prior displayed usage.
gui_related: false
gui_classification_reason: This unit defines cost accounting invariants rather than visual presentation.
split_recommended: false
depends_on: [CV-189]
unblocks: [CV-206]
acceptance_criteria:
  - "Cumulative-session cost remains monotonic, non-decreasing, and non-negative."
  - "Negative raw cost corrections become adjustment or clamp events."
  - "Prior displayed usage is not retroactively decreased."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: cost_monotonicity_violation
reasoning_tier: high
context_scope: cumulative_session_cost_accounting
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
node_compile_hint:
  mode: cost_monotonic_adjustment_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0070
preserved_exact_tokens:
  - "`/non-negative`"
  - "negative-raw-cost"
  - "`/adjustment`"
  - "clamp event"
negative_constraints:
  - "Cost corrections must not retroactively decrease prior displayed usage."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
```

### CV-206 - Cost USD Presentation Precision

```yaml
plan_unit_id: CV-206
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  cost_usd is presentation-only and derived from stored microdollars; sub-cent
  display uses adaptive precision including less-than-one-cent values at six
  decimals, and negative-cost display requires an explicit adjustment record.
gui_related: true
gui_classification_reason: This unit defines visible cost presentation precision.
split_recommended: false
depends_on: [CV-189, CV-205]
unblocks: []
acceptance_criteria:
  - "cost_usd is derived from stored microdollars and is presentation-only."
  - "Sub-cent display uses adaptive precision including six decimals below one cent."
  - "Negative-cost display is backed by an explicit adjustment record."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: cost_display_precision_drift
reasoning_tier: standard
context_scope: cost_usd_presentation
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: cost_usd_presentation_precision
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0070
preserved_exact_tokens:
  - "`cost_usd`"
  - "`<$0.01 => 6 decimals`"
  - "integer microdollars"
  - "adjustment record"
negative_constraints:
  - "Negative-cost display must never be backed by mutating prior usage."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
```

### CV-207 - Executor Consumer Anchors And Legacy Audit Closure

```yaml
plan_unit_id: CV-207
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts_V0 owns the shared usage attribution tuple while Executor Protocol
  owns classified outcome, doom-loop, signal/lifecycle, and blocked/retry prose;
  legacy LF-004 and LF-008 audit contradictions are closed by conditional
  omission rules, and audit verdict words are not schema states.
gui_related: false
gui_classification_reason: This unit defines owner boundaries and stale audit dispositions.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "Executor Protocol anchors remain owner prose for outcome, doom-loop, signal/lifecycle, and blocked/retry behavior."
  - "Contracts_V0 owns the shared usage attribution tuple."
  - "Legacy audit verdict words and stale TODOs are not schema states in this contract."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: executor_usage_owner_boundary_drift
reasoning_tier: high
context_scope: executor_usage_consumer_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Runtime_Artifacts_Panel.md
  - Plans/Architecture_Invariants.md
node_compile_hint:
  mode: executor_consumer_anchor_compatibility_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0070
preserved_exact_tokens:
  - "`LF-004`"
  - "`LF-008`"
  - "`MINOR`"
  - "`MOSTLY`"
  - "`CONFIRMED`"
  - "`timeout_ms`"
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Runtime_Artifacts_Panel.md, ContractName:Plans/Architecture_Invariants.md"
stale_retired_dispositions:
  - "Audit verdict words such as MINOR, MOSTLY, and CONFIRMED are not schema states."
  - "Stale TODOs, case-folding examples, and shell-isolation notes remain non-authoritative unless restated in the relevant owner contract."
negative_constraints:
  - "Executor/runtime contract fields must not be restated as usage attribution fields."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-208 - Budget Enforcement Events And Overrun Evidence

```yaml
plan_unit_id: CV-208
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Spending-limit enforcement reads the canonical usage_record stream and legacy
  record review marker through the same attribution tuple; pre-dispatch budget
  failures emit kill.budget_exceeded, while post-response overruns emit
  done.budget_exceeded and persist overrun evidence.
gui_related: false
gui_classification_reason: This unit defines budget enforcement events rather than visual presentation.
split_recommended: false
depends_on: [CV-199]
unblocks: [CV-209]
acceptance_criteria:
  - "Pre-dispatch budget failures emit kill.budget_exceeded."
  - "Post-response overruns emit done.budget_exceeded and persist overrun evidence."
  - "Legacy record review marker remains interpreted through the same attribution tuple."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: budget_event_semantics_drift
reasoning_tier: high
context_scope: budget_enforcement_events
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
  - Plans/Run_Modes.md
node_compile_hint:
  mode: budget_enforcement_event_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0071
preserved_exact_tokens:
  - "`usage_record`"
  - "`/record`"
  - "`kill.budget_exceeded`"
  - "`done.budget_exceeded`"
  - "overrun evidence"
compatibility_only_notes:
  - "The legacy /record review marker remains input to spending-limit enforcement through the canonical attribution tuple."
negative_constraints:
  - "Post-response overrun recording must not rewrite prior usage."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
```

### CV-209 - Usage Pipeline Rollups And Bridge Failure Classes

```yaml
plan_unit_id: CV-209
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  The canonical usage pipeline is seglog to analytics scan to redb rollups to
  UI; rollups preserve per-run, per-session, and per-tool attribution, and CLI
  bridge projections preserve quota, rate-limit, and circuit-breaker failure
  class distinctions.
gui_related: false
gui_classification_reason: This unit defines usage pipeline and bridge failure semantics.
split_recommended: false
depends_on: [CV-208]
unblocks: []
acceptance_criteria:
  - "Rollups preserve parent_run_id, cache_hit, and cache_strategy where relevant."
  - "Child usage is not collapsed into display-only parent totals."
  - "CLI bridge projections preserve 402 quota_exceeded, 429 rate limit, and the 2 minutes circuit-breaker value."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: usage_rollup_attribution_loss
reasoning_tier: high
context_scope: usage_pipeline_rollups_bridge_classes
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Run_Modes.md
node_compile_hint:
  mode: usage_pipeline_rollup_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0071
preserved_exact_tokens:
  - "`seglog -> analytics scan -> redb rollups -> UI`"
  - "`parent_run_id`"
  - "`cache_hit?`"
  - "`cache_strategy?`"
  - "`402 / quota_exceeded`"
  - "`429 / rate limit`"
  - "`2 minutes`"
  - "ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Run_Modes.md"
negative_constraints:
  - "Helper calls and subagent work must not collapse into display-only parent totals."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
  - Plans/CLI_Bridged_Providers.md
```

### CV-210 - OpenRouter Cache Metadata And TTL Boundary

```yaml
plan_unit_id: CV-210
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  PM records OpenRouter cache-key and TTL policy as provider/cache metadata for
  reuse, billing, debugging, and accounting, but must not treat TTL as a
  PM-owned persistence guarantee.
gui_related: false
gui_classification_reason: This unit defines provider cache metadata semantics rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: [CV-211]
acceptance_criteria:
  - "OpenRouter cache-key policy is recorded when it affects reuse, billing, or debugging."
  - "prompt_cache_key remains provider/cache metadata."
  - "TTL policy is recorded for accounting and debug explanation without becoming PM-owned persistence."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: openrouter_cache_ttl_ownership_drift
reasoning_tier: high
context_scope: openrouter_cache_metadata
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
  - Plans/storage-plan.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: openrouter_cache_metadata_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0072
preserved_exact_tokens:
  - "OpenRouter"
  - "`prompt_cache_key`"
  - "`/accounting`"
  - "`#16848`"
  - "`#16850`"
negative_constraints:
  - "PM must not treat OpenRouter cache TTL as a PM-owned persistence guarantee."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
  - Plans/Prompt_Pipeline.md
```

### CV-211 - OpenRouter Cache Token Bucket Accounting

```yaml
plan_unit_id: CV-211
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  OpenRouter cache-write token accounting maps into canonical cache token
  buckets, with cache-write tokens persisted in cache_creation_input_tokens and
  cache reads persisted in cache_read_input_tokens.
gui_related: false
gui_classification_reason: This unit defines usage accounting buckets rather than visual presentation.
split_recommended: false
depends_on: [CV-196, CV-210]
unblocks: []
acceptance_criteria:
  - "Cache-write accounting evidence maps to cache_creation_input_tokens."
  - "Cache reads remain in cache_read_input_tokens."
  - "Provider cache behavior does not redefine PM storage persistence."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: openrouter_cache_bucket_drift
reasoning_tier: high
context_scope: openrouter_cache_token_accounting
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
  - Plans/storage-plan.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: openrouter_cache_bucket_accounting
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0072
preserved_exact_tokens:
  - "`#18440`"
  - "`cache_creation_input_tokens`"
  - "`cache_read_input_tokens`"
  - "ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Prompt_Pipeline.md"
negative_constraints:
  - "Cache-write evidence must not replace canonical cache token buckets."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
```

### CV-212 - Billing Entity Conditional Fields

```yaml
plan_unit_id: CV-212
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  requested_billing_entity_id and effective_billing_entity_id are
  conditionally required fields included only when billing entity selection
  exists for the provider and when the field is meaningful in the current flow.
gui_related: false
gui_classification_reason: This unit defines billing schema field conditions rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: [CV-213]
acceptance_criteria:
  - "requested_billing_entity_id is included only when billing entity selection exists and is meaningful."
  - "effective_billing_entity_id is included only when billing entity selection exists and is meaningful."
  - "Fields are omitted when billing entity selection is unavailable or meaningless for the flow."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: billing_entity_field_condition_drift
reasoning_tier: high
context_scope: billing_entity_conditional_fields
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Multi-Account.md
node_compile_hint:
  mode: billing_entity_conditional_fields
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0073
preserved_exact_tokens:
  - "`requested_billing_entity_id`"
  - "`effective_billing_entity_id`"
  - "ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Multi-Account.md"
negative_constraints:
  - "Billing entity fields must not be required when billing entity selection is absent or meaningless."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Multi-Account.md
```

### CV-213 - Billing Entity Uniform Application And Tuple Sufficiency

```yaml
plan_unit_id: CV-213
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Billing entity conditional-requirement rules apply uniformly in
  EventRecord.payload, AuthState, and usage attribution; billing_entity_id alone
  is never a sufficient canonical substitute when account or entitlement context
  exists.
gui_related: false
gui_classification_reason: This unit defines billing attribution semantics rather than visual presentation.
split_recommended: false
depends_on: [CV-201, CV-212]
unblocks: []
acceptance_criteria:
  - "EventRecord.payload applies billing entity fields only when meaningful."
  - "AuthState persists selection only when the effective quota bucket depends on entity selection."
  - "Usage attribution preserves the full known attribution tuple."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: billing_entity_tuple_collapse
reasoning_tier: high
context_scope: billing_entity_uniform_application
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: billing_entity_tuple_sufficiency
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0073
preserved_exact_tokens:
  - "`EventRecord.payload`"
  - "`AuthState`"
  - "`billing_entity_id`"
  - "`(provider_id, model_id, account_id?, billing_entity_id?, entitlement_class?)`"
  - "ContractRef: ContractName:Plans/usage-feature.md, ContractName:Plans/CLI_Bridged_Providers.md"
negative_constraints:
  - "`billing_entity_id` alone is never a sufficient canonical substitute when account or entitlement context exists."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/usage-feature.md
```

### CV-214 - UI Readiness Projection Consumer Boundary

```yaml
plan_unit_id: CV-214
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  UI readiness projections that mention pm.lock, viewer-mode, MCP lazy-load, or
  startup-time are consumers of owner contracts and must preserve referenced
  owner state without minting parallel status fields.
gui_related: true
gui_classification_reason: This unit defines user-visible readiness projection boundaries.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "pm.lock and viewer-mode messaging follow the storage/runtime lock contract."
  - "MCP lazy-load and startup-time UX defer to MCP/tool owner docs."
  - "UI readiness projections do not mint parallel status fields."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: ui_readiness_parallel_status_drift
reasoning_tier: standard
context_scope: ui_readiness_projection_consumer_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: ui_readiness_projection_consumer_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0073
preserved_exact_tokens:
  - "`pm.lock`"
  - "viewer-mode"
  - "MCP lazy-load"
  - "`/startup-time`"
negative_constraints:
  - "UI readiness projections must not mint parallel status fields."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
```

### CV-215 - Scheduler Pass Wake Reasons And Legacy Alias

```yaml
plan_unit_id: CV-215
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  scheduler.pass owns canonical wake_reason values including prerequisite,
  approval, clarification, auth, startup, backoff, verification, remediation,
  startup_recovered, and watchdog_recheck; run.scheduler_analysis is a
  deprecated legacy alias accepted only during migration.
gui_related: false
gui_classification_reason: This unit defines scheduler event compatibility rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: [CV-216, CV-217]
acceptance_criteria:
  - "New producers emit scheduler.pass."
  - "Consumers may accept run.scheduler_analysis only during migration."
  - "startup_recovered and watchdog_recheck keep their scheduler-pass meanings."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: scheduler_pass_alias_drift
reasoning_tier: high
context_scope: scheduler_pass_wake_reasons
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: scheduler_pass_compatibility_disposition
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0076
preserved_exact_tokens:
  - "`scheduler.pass`"
  - "`wake_reason`"
  - "`startup_recovered`"
  - "`watchdog_recheck`"
  - "`run.scheduler_analysis`"
  - "ContractRef: EventType:scheduler.pass, ContractName:Plans/Executor_Protocol.md"
compatibility_only_notes:
  - "`run.scheduler_analysis` is a deprecated legacy alias accepted during migration."
negative_constraints:
  - "New producers MUST emit scheduler.pass instead of run.scheduler_analysis."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-216 - Scheduler Pass Minimum Payload

```yaml
plan_unit_id: CV-216
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  scheduler.pass minimum payload carries scheduler_pass_id as canonical
  identity, analysis_id as a legacy alias, run/thread/replan/wake/slot fields,
  selected and non-selected node arrays, and timestamp.
gui_related: false
gui_classification_reason: This unit defines scheduler event payload fields.
split_recommended: false
depends_on: [CV-215]
unblocks: []
acceptance_criteria:
  - "scheduler_pass_id is the canonical identity and analysis_id is a legacy alias."
  - "selected_nodes entries include node_id, score_tuple, and lane."
  - "non_selected_nodes entries include node_id and non_selected_reason."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: scheduler_pass_payload_loss
reasoning_tier: high
context_scope: scheduler_pass_minimum_payload
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: scheduler_pass_payload_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0076
preserved_exact_tokens:
  - "`scheduler_pass_id`"
  - "`analysis_id`"
  - "`selected_nodes[]`"
  - "`non_selected_nodes[]`"
  - "`score_tuple`"
  - "`lane`"
  - "`non_selected_reason`"
  - "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md"
negative_constraints: []
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-217 - Run Node Ready Payload

```yaml
plan_unit_id: CV-217
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  run.node_ready minimum payload carries run_id, node_id, ready_since_utc,
  wake_reason, and replan_generation.
gui_related: false
gui_classification_reason: This unit defines runtime scheduler payload fields.
split_recommended: false
depends_on: [CV-215]
unblocks: []
acceptance_criteria:
  - "run.node_ready payload includes run_id, node_id, ready_since_utc, wake_reason, and replan_generation."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: run_node_ready_payload_loss
reasoning_tier: standard
context_scope: run_node_ready_payload
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: run_node_ready_payload_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0077
preserved_exact_tokens:
  - "`run.node_ready`"
  - "`run_id`"
  - "`node_id`"
  - "`ready_since_utc`"
  - "`wake_reason`"
  - "`replan_generation`"
negative_constraints: []
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-218 - Node Blocked Alias And Blocked Episode Identity

```yaml
plan_unit_id: CV-218
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  node.blocked replaces deprecated run.node_blocked, and approval scopes that
  still use tier boundaries normalize to the node blocked runtime scope anchored
  by run, node, and blocked sequence rather than tier boundary, tier type, or
  page-local approval grouping.
gui_related: false
gui_classification_reason: This unit defines runtime blocked-event identity and compatibility.
split_recommended: false
depends_on: [CV-155]
unblocks: [CV-219, CV-220]
acceptance_criteria:
  - "New producers emit node.blocked."
  - "Blocked episode identity is anchored by run, node, and blocked sequence."
  - "Tier boundary, tier type, and page-local approval grouping do not replace blocked episode identity."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: node_blocked_identity_drift
reasoning_tier: high
context_scope: node_blocked_identity_compatibility
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: node_blocked_identity_compatibility
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0078
preserved_exact_tokens:
  - "`node.blocked`"
  - "`run.node_blocked`"
  - "`/node/blocked`"
  - "blocked_sequence"
  - "ContractRef: EventType:node.blocked, ContractName:Plans/Executor_Protocol.md"
compatibility_only_notes:
  - "`run.node_blocked` is a deprecated legacy alias for node.blocked."
negative_constraints:
  - "Blocked-episode identity must not be replaced by tier boundary, tier type, or page-local approval grouping."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-219 - Node Blocked Minimum Payload

```yaml
plan_unit_id: CV-219
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  node.blocked minimum payload carries run, node, optional attempt, blocked
  reason, blocked_sequence, allowed_action_ids, preserved_local_work, optional
  detail/failure/timeout/wait fields, and timestamp.
gui_related: false
gui_classification_reason: This unit defines runtime event payload fields.
split_recommended: false
depends_on: [CV-218]
unblocks: []
acceptance_criteria:
  - "node.blocked payload includes blocked_reason_code, blocked_sequence, allowed_action_ids, and preserved_local_work."
  - "Optional detail_ref, failure_class, timeout_class, and wait_state_class are present only when applicable."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: node_blocked_payload_loss
reasoning_tier: high
context_scope: node_blocked_minimum_payload
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: node_blocked_payload_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0078
preserved_exact_tokens:
  - "`blocked_reason_code`"
  - "`blocked_sequence`"
  - "`allowed_action_ids[]`"
  - "`preserved_local_work`"
  - "`detail_ref?`"
  - "`failure_class?`"
  - "`timeout_class?`"
  - "`wait_state_class?`"
  - "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md"
negative_constraints: []
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-220 - Node Unblocked Alias And Payload

```yaml
plan_unit_id: CV-220
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  node.unblocked replaces deprecated run.node_unblocked and carries run_id,
  node_id, optional attempt_id, blocked_sequence, resolution, and timestamp.
gui_related: false
gui_classification_reason: This unit defines runtime unblocked event compatibility and payload fields.
split_recommended: false
depends_on: [CV-218]
unblocks: []
acceptance_criteria:
  - "New producers emit node.unblocked."
  - "node.unblocked payload includes run_id, node_id, attempt_id, blocked_sequence, resolution, and ts."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: node_unblocked_payload_drift
reasoning_tier: standard
context_scope: node_unblocked_payload_compatibility
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: node_unblocked_payload_compatibility
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0079
preserved_exact_tokens:
  - "`node.unblocked`"
  - "`run.node_unblocked`"
  - "`attempt_id?`"
  - "`blocked_sequence`"
  - "`resolution`"
  - "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md"
compatibility_only_notes:
  - "`run.node_unblocked` is a deprecated legacy alias for node.unblocked."
negative_constraints:
  - "New producers MUST emit node.unblocked instead of run.node_unblocked."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-221 - Node Backoff Started Payload

```yaml
plan_unit_id: CV-221
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  run.node_backoff_started minimum payload carries run_id, node_id, attempt_id,
  failure_class, backoff_until_utc, retry_count, and timestamp.
gui_related: false
gui_classification_reason: This unit defines retry/backoff event payload fields.
split_recommended: false
depends_on: []
unblocks: [CV-222, CV-223]
acceptance_criteria:
  - "run.node_backoff_started payload includes run_id, node_id, attempt_id, failure_class, backoff_until_utc, retry_count, and ts."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: backoff_started_payload_loss
reasoning_tier: standard
context_scope: node_backoff_started_payload
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: node_backoff_started_payload_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0081
preserved_exact_tokens:
  - "`run.node_backoff_started`"
  - "`attempt_id`"
  - "`failure_class`"
  - "`backoff_until_utc`"
  - "`retry_count`"
negative_constraints: []
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-222 - Node Backoff Expired Payload

```yaml
plan_unit_id: CV-222
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  run.node_backoff_expired minimum payload carries run_id, node_id, attempt_id,
  failure_class, and timestamp.
gui_related: false
gui_classification_reason: This unit defines retry/backoff event payload fields.
split_recommended: false
depends_on: [CV-221]
unblocks: []
acceptance_criteria:
  - "run.node_backoff_expired payload includes run_id, node_id, attempt_id, failure_class, and ts."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: backoff_expired_payload_loss
reasoning_tier: standard
context_scope: node_backoff_expired_payload
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: node_backoff_expired_payload_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0082
preserved_exact_tokens:
  - "`run.node_backoff_expired`"
  - "`run_id`"
  - "`node_id`"
  - "`attempt_id`"
  - "`failure_class`"
negative_constraints: []
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-223 - Node Retry Scheduled Payload

```yaml
plan_unit_id: CV-223
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  run.node_retry_scheduled minimum payload carries run_id, node_id,
  prior_attempt_id, retry_count, failure_class, optional safe_point_id, and
  timestamp.
gui_related: false
gui_classification_reason: This unit defines retry scheduling event payload fields.
split_recommended: false
depends_on: [CV-221]
unblocks: []
acceptance_criteria:
  - "run.node_retry_scheduled payload includes run_id, node_id, prior_attempt_id, retry_count, failure_class, safe_point_id, and ts."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: retry_scheduled_payload_loss
reasoning_tier: standard
context_scope: node_retry_scheduled_payload
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: node_retry_scheduled_payload_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0083
preserved_exact_tokens:
  - "`run.node_retry_scheduled`"
  - "`prior_attempt_id`"
  - "`retry_count`"
  - "`failure_class`"
  - "`safe_point_id?`"
negative_constraints: []
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-224 - Safe Point Created Payload

```yaml
plan_unit_id: CV-224
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  safe_point.created minimum payload carries safe point, run, node, attempt,
  optional worktree context, baseline, replan generation, and timestamp fields.
gui_related: false
gui_classification_reason: This unit defines safe-point event payload fields.
split_recommended: false
depends_on: []
unblocks: [CV-225, CV-226, CV-228]
acceptance_criteria:
  - "safe_point.created payload includes safe_point_id, run_id, node_id, attempt_id, baseline_ref, replan_generation, and ts."
  - "Worktree-bound safe points may carry worktree_id, worktree_path, worktree_branch, and working_directory."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: safe_point_created_payload_loss
reasoning_tier: high
context_scope: safe_point_created_payload
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: safe_point_created_payload_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0085
preserved_exact_tokens:
  - "`safe_point.created`"
  - "`safe_point_id`"
  - "`worktree_id?`"
  - "`worktree_path?`"
  - "`worktree_branch?`"
  - "`working_directory?`"
  - "`baseline_ref`"
  - "`replan_generation`"
negative_constraints: []
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-225 - Safe Point Worktree Context Restoration

```yaml
plan_unit_id: CV-225
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  A safe point created from a worktree-bound execution unit carries worktree
  snapshot fields so restore, retry, and UI history return to the same worktree
  context instead of silently substituting the main project root.
gui_related: true
gui_classification_reason: This unit includes user-visible UI history restoration context.
split_recommended: false
depends_on: [CV-224]
unblocks: []
acceptance_criteria:
  - "Restore, retry, and UI history can return to the same worktree context."
  - "Main project root is not silently substituted for a worktree-bound safe point."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: safe_point_worktree_context_loss
reasoning_tier: high
context_scope: safe_point_worktree_context
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: safe_point_worktree_context_restoration
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0085
preserved_exact_tokens:
  - "UI history"
  - "main project root"
  - "`worktree_id`"
  - "`worktree_path`"
  - "`worktree_branch`"
  - "`working_directory`"
negative_constraints:
  - "Safe-point restore/retry/history must not silently substitute the main project root for a worktree-bound context."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-226 - Safe Point Restored Payload

```yaml
plan_unit_id: CV-226
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  safe_point.restored minimum payload carries safe_point_id, run_id, node_id,
  attempt_id, restore_outcome, and timestamp.
gui_related: false
gui_classification_reason: This unit defines safe-point restore event payload fields.
split_recommended: false
depends_on: [CV-224]
unblocks: [CV-227, CV-228]
acceptance_criteria:
  - "safe_point.restored payload includes safe_point_id, run_id, node_id, attempt_id, restore_outcome, and ts."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: safe_point_restored_payload_loss
reasoning_tier: standard
context_scope: safe_point_restored_payload
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: safe_point_restored_payload_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0086
preserved_exact_tokens:
  - "`safe_point.restored`"
  - "`safe_point_id`"
  - "`attempt_id`"
  - "`restore_outcome`"
negative_constraints: []
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-227 - Restore Outcome Enum

```yaml
plan_unit_id: CV-227
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  restore_outcome is closed to restored_clean, restored_with_conflicts,
  restore_failed, and restore_skipped with the source meanings for clean,
  conflicted, failed, and unnecessary restores.
gui_related: false
gui_classification_reason: This unit defines safe-point enum semantics rather than visual presentation.
split_recommended: false
depends_on: [CV-226]
unblocks: [CV-228]
acceptance_criteria:
  - "restore_outcome accepts only restored_clean, restored_with_conflicts, restore_failed, and restore_skipped."
  - "Each enum value preserves its source meaning."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: restore_outcome_enum_drift
reasoning_tier: standard
context_scope: restore_outcome_enum
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: restore_outcome_enum_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0087
preserved_exact_tokens:
  - "`restore_outcome`"
  - "`restored_clean`"
  - "`restored_with_conflicts`"
  - "`restore_failed`"
  - "`restore_skipped`"
  - "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md"
negative_constraints:
  - "restore_outcome must not accept values outside the closed enum."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-228 - FileSafe Snapshot Event Compatibility

```yaml
plan_unit_id: CV-228
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  FileSafe compatibility producer events filesafe.snapshot_created,
  filesafe.snapshot_conflict, and filesafe.snapshot_restore are wrappers for the
  Contracts-owned safe-point event contract, not separate event-family owners.
gui_related: false
gui_classification_reason: This unit defines event compatibility wrappers and ownership boundaries.
split_recommended: false
depends_on: [CV-224, CV-226, CV-227]
unblocks: []
acceptance_criteria:
  - "filesafe.snapshot_created maps to safe_point.created."
  - "filesafe.snapshot_restore maps to safe_point.restored."
  - "filesafe.snapshot_conflict carries safe-point/snapshot identity plus restore_outcome or conflict_reason_code as applicable."
  - "Minimum payload preserves snapshot_id, safe_point_id, run_id, optional node/attempt/target/conflict/restore fields, and ts."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: filesafe_safe_point_owner_split
reasoning_tier: high
context_scope: filesafe_snapshot_event_compatibility
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: filesafe_snapshot_event_compatibility
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0088
preserved_exact_tokens:
  - "`filesafe.snapshot_created`"
  - "`filesafe.snapshot_conflict`"
  - "`filesafe.snapshot_restore`"
  - "`safe_point.created`"
  - "`safe_point.restored`"
  - "`snapshot_id`"
  - "`conflict_reason_code?`"
compatibility_only_notes:
  - "FileSafe compatibility producer event names are wrappers for the Contracts-owned safe-point event contract."
negative_constraints:
  - "FileSafe compatibility names must not become separate event-family owners."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-229 - Remediation Spawned Alias And Payload

```yaml
plan_unit_id: CV-229
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  remediation.spawned replaces deprecated run.remediation_started and carries
  run_id, node_id, remediation_root_id, child_attempt_id,
  remediation_generation, parent_failure_class, and timestamp.
gui_related: false
gui_classification_reason: This unit defines remediation event compatibility and payload fields.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
  - "New producers emit remediation.spawned."
  - "remediation.spawned payload includes run_id, node_id, remediation_root_id, child_attempt_id, remediation_generation, parent_failure_class, and ts."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: remediation_spawned_alias_payload_drift
reasoning_tier: standard
context_scope: remediation_spawned_payload_compatibility
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: remediation_spawned_payload_compatibility
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0090
preserved_exact_tokens:
  - "`remediation.spawned`"
  - "`run.remediation_started`"
  - "`remediation_root_id`"
  - "`child_attempt_id`"
  - "`remediation_generation`"
  - "`parent_failure_class`"
  - "ContractRef: EventType:remediation.spawned, ContractName:Plans/Executor_Protocol.md"
  - "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md"
compatibility_only_notes:
  - "`run.remediation_started` is a deprecated legacy alias for remediation.spawned."
negative_constraints:
  - "New producers MUST emit remediation.spawned instead of run.remediation_started."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-230 - Remediation Resolved Alias And Payload

```yaml
plan_unit_id: CV-230
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  remediation.resolved replaces deprecated run.remediation_completed and
  preserves remediation resolution payload fields; the resolution enum is fixed,
  superseded, abandoned, or replan_required; legacy success|failed|ceiling_exceeded maps through
  explicit compatibility rules and remediation_ceiling_exceeded remains a blocked_reason_code.
gui_related: false
gui_classification_reason: This unit defines remediation event compatibility and payload fields.
split_recommended: false
depends_on: [CV-229]
unblocks: [CV-243, CV-246]
acceptance_criteria:
  - "New producers emit remediation.resolved instead of run.remediation_completed."
  - "Payload preserves run_id, node_id, remediation_root_id, child_attempt_id, resolution, and ts."
  - "resolution accepts fixed, superseded, abandoned, and replan_required only."
  - "Compatibility imports map success -> fixed, ceiling_exceeded -> replan_required, and failed -> abandoned only for terminal legacy failures."
  - "remediation_ceiling_exceeded remains a blocked_reason_code."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: remediation_resolved_alias_payload_drift
reasoning_tier: high
context_scope: remediation_resolved_payload_compatibility
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: remediation_resolved_payload_compatibility
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0091
  - Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/design_atoms.jsonl:13
  - Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/records/decisions.jsonl:10
  - Plans/ledgers/v2/pldg-20260613-001-cleanup-fable-audit/source_shards/section-a-conflicting-canon.md:20
preserved_exact_tokens:
  - "`remediation.resolved`"
  - "`run.remediation_completed`"
  - "`remediation_root_id`"
  - "`child_attempt_id`"
  - "`resolution`"
  - "`fixed`"
  - "`superseded`"
  - "`abandoned`"
  - "`replan_required`"
  - "`remediation_ceiling_exceeded`"
  - "`blocked_reason_code`"
  - "`success|failed|ceiling_exceeded`"
  - "success -> fixed"
  - "ceiling_exceeded -> replan_required"
  - "failed -> abandoned"
  - "ContractRef: ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage-plan.md"
compatibility_only_notes:
  - "`run.remediation_completed` is a deprecated legacy alias for remediation.resolved."
  - "The legacy remediation completion enum success|failed|ceiling_exceeded is source-lineage only."
  - "failed maps to abandoned only when the legacy producer reported terminal failure; otherwise a current value must be explicit."
negative_constraints:
  - "remediation_ceiling_exceeded must not become a remediation.resolved resolution value."
  - "Legacy failed must not be guessed into abandoned for non-terminal failures."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-231 - Plan Decomposition Degraded Payload

```yaml
plan_unit_id: CV-231
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  plan.decomposition_degraded minimum payload preserves project_id,
  source_stage, reason_code, original_shape, degraded_shape, evidence_ref, and
  timestamp.
gui_related: false
gui_classification_reason: This unit defines degradation event payload fields.
split_recommended: false
depends_on: []
unblocks: [CV-235, CV-236]
acceptance_criteria:
  - "plan.decomposition_degraded payload includes project_id, source_stage, reason_code, original_shape, degraded_shape, evidence_ref, and ts."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: decomposition_degraded_payload_loss
reasoning_tier: standard
context_scope: plan_decomposition_degraded_payload
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: plan_decomposition_degraded_payload_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0093
preserved_exact_tokens:
  - "`plan.decomposition_degraded`"
  - "`project_id`"
  - "`source_stage`"
  - "`reason_code`"
  - "`original_shape`"
  - "`degraded_shape`"
  - "`evidence_ref`"
negative_constraints: []
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-232 - Graph Integrity Failed Payload

```yaml
plan_unit_id: CV-232
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  run.graph_integrity_failed minimum payload preserves run_id, reason_code,
  detail_ref, replan_generation, and timestamp.
gui_related: false
gui_classification_reason: This unit defines graph integrity event payload fields.
split_recommended: false
depends_on: []
unblocks: [CV-235]
acceptance_criteria:
  - "run.graph_integrity_failed payload includes run_id, reason_code, detail_ref, replan_generation, and ts."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: graph_integrity_failed_payload_loss
reasoning_tier: standard
context_scope: graph_integrity_failed_payload
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: graph_integrity_failed_payload_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0094
preserved_exact_tokens:
  - "`run.graph_integrity_failed`"
  - "`run_id`"
  - "`reason_code`"
  - "`detail_ref`"
  - "`replan_generation`"
negative_constraints: []
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-233 - Wizard Blocked Routing Payload

```yaml
plan_unit_id: CV-233
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  wizard.blocked is not standalone navigation or blocked-state ownership; it
  decodes through route_target plus blocked/remediation identity, with resume_url
  as serialized transport and report_ref/detail_ref as inspection references.
gui_related: false
gui_classification_reason: This unit defines wizard blocked runtime routing and payload semantics.
split_recommended: false
depends_on: []
unblocks: [CV-234, CV-235]
acceptance_criteria:
  - "wizard.blocked decodes through route_target plus blocked/remediation identity."
  - "resume_url remains serialized transport only."
  - "Payload preserves wizard_id, thread_id, round_count, report_ref, resume_url, and ts."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wizard_blocked_route_ownership_drift
reasoning_tier: high
context_scope: wizard_blocked_routing_payload
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: wizard_blocked_route_payload_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0096
preserved_exact_tokens:
  - "`wizard.blocked`"
  - "`route_target`"
  - "`resume_url`"
  - "`report_ref`"
  - "`detail_ref`"
  - "`wizard_id`"
  - "`thread_id?`"
  - "`round_count`"
negative_constraints:
  - "wizard.blocked must not become standalone navigation or blocked-state ownership."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-234 - Wizard Unblocked Payload

```yaml
plan_unit_id: CV-234
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  wizard.unblocked minimum payload preserves wizard_id, optional thread_id,
  resolution_source, and timestamp.
gui_related: false
gui_classification_reason: This unit defines wizard unblocked event payload fields.
split_recommended: false
depends_on: [CV-233]
unblocks: []
acceptance_criteria:
  - "wizard.unblocked payload includes wizard_id, thread_id, resolution_source, and ts."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wizard_unblocked_payload_loss
reasoning_tier: standard
context_scope: wizard_unblocked_payload
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: wizard_unblocked_payload_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0097
preserved_exact_tokens:
  - "`wizard.unblocked`"
  - "`wizard_id`"
  - "`thread_id?`"
  - "`resolution_source`"
negative_constraints: []
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-235 - Canonical Event Projection Derivation

```yaml
plan_unit_id: CV-235
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  The scheduler, degradation, wizard, and recovery events in this packet are
  canonical ledger events, not debug-only instrumentation; all UI and storage
  projections derive from these events or fields normatively referenced by
  them.
gui_related: true
gui_classification_reason: This unit constrains UI and storage projections over canonical events.
split_recommended: false
depends_on: [CV-231, CV-232, CV-233]
unblocks: []
acceptance_criteria:
  - "Events above remain canonical ledger events."
  - "UI and storage projections derive from these events or normatively referenced fields."
  - "Debug-only instrumentation does not replace canonical event identity."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: projection_derivation_drift
reasoning_tier: high
context_scope: canonical_event_projection_derivation
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: canonical_event_projection_derivation
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0098
preserved_exact_tokens:
  - "debug-only instrumentation"
  - "UI"
  - "storage projections"
negative_constraints:
  - "Canonical ledger events must not be reduced to debug-only instrumentation."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### CV-236 - Safe-Point Recovery Boundary And Graph Lock

```yaml
plan_unit_id: CV-236
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  safe_point.* events are runtime-internal recovery records distinct from
  user-facing restore_point.* and rollback.* contracts, and
  plan.decomposition_degraded is allowed only before canonical graph lock.
gui_related: true
gui_classification_reason: This unit distinguishes internal recovery records from user-facing recovery contracts.
split_recommended: false
depends_on: [CV-224, CV-231]
unblocks: []
acceptance_criteria:
  - "safe_point.* remains runtime-internal recovery record vocabulary."
  - "restore_point.* and rollback.* remain distinct user-facing contracts."
  - "plan.decomposition_degraded is allowed only before canonical graph lock."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: recovery_boundary_graph_lock_drift
reasoning_tier: high
context_scope: safe_point_recovery_graph_lock_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: safe_point_recovery_graph_lock_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0098
preserved_exact_tokens:
  - "`safe_point.*`"
  - "`restore_point.*`"
  - "`rollback.*`"
  - "`plan.decomposition_degraded`"
  - "canonical graph lock"
negative_constraints:
  - "safe_point.* runtime-internal recovery records must not be collapsed into user-facing restore_point.* or rollback.* contracts."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-237 - Scheduler Addendum Required Fields

```yaml
plan_unit_id: CV-237
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Runtime scheduler addendum fields preserve run_id, thread_id,
  replan_generation, wake_reason, available_slots, ready_nodes with score
  breakdown terms, selected_nodes, non_selected with non_selected_reason, and
  capacity summary.
gui_related: false
gui_classification_reason: This unit defines scheduler event payload fields.
split_recommended: false
depends_on: [CV-215, CV-216]
unblocks: [CV-238, CV-239]
acceptance_criteria:
  - "Scheduler pass fields preserve run_id, thread_id, replan_generation, wake_reason, available_slots, ready_nodes, selected_nodes, non_selected, non_selected_reason, and capacity summary."
  - "Wake reason semantics remain aligned with Executor Protocol."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: scheduler_addendum_field_loss
reasoning_tier: high
context_scope: runtime_scheduler_addendum_fields
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: scheduler_addendum_required_fields
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0099
preserved_exact_tokens:
  - "`run_id`"
  - "`thread_id`"
  - "`replan_generation`"
  - "`wake_reason`"
  - "`available_slots`"
  - "`ready_nodes[]`"
  - "`selected_nodes[]`"
  - "`non_selected[]`"
  - "`non_selected_reason`"
  - "capacity summary"
  - "ContractRef: Plans/Executor_Protocol.md#Wake reasons and coalescing"
negative_constraints: []
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-238 - Startup-Recovered Scheduler Pass

```yaml
plan_unit_id: CV-238
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  The first scheduler pass after startup recovery persists wake_reason as
  startup_recovered, and blocked/recovery wake ownership is carried by
  scheduler.pass rather than inferred from prompt text.
gui_related: false
gui_classification_reason: This unit defines scheduler wake semantics rather than visual presentation.
split_recommended: false
depends_on: [CV-215]
unblocks: []
acceptance_criteria:
  - "The first scheduler pass after startup recovery persists wake_reason = startup_recovered."
  - "Blocked and recovery wake ownership is carried by scheduler.pass."
  - "Prompt text does not infer scheduler wake ownership."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: startup_recovered_wake_drift
reasoning_tier: high
context_scope: startup_recovered_scheduler_pass
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: startup_recovered_scheduler_pass
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0099
preserved_exact_tokens:
  - "`scheduler.pass`"
  - "`startup_recovered`"
  - "scheduler pass"
  - "`wake_reason = startup_recovered`"
negative_constraints:
  - "Blocked and recovery wake ownership must not be inferred from prompt text."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-239 - Attempt Started Payload

```yaml
plan_unit_id: CV-239
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  attempt.started payload preserves run, thread, node, and attempt identity,
  scheduler lane, effective requested/effective model snapshot, permission
  snapshot identifier, optional safe_point_id, remediation lineage, and
  replan_generation.
gui_related: false
gui_classification_reason: This unit defines attempt lifecycle payload fields.
split_recommended: false
depends_on: [CV-224, CV-229, CV-237]
unblocks: [CV-240]
acceptance_criteria:
  - "attempt.started payload includes run_id, thread_id, node_id, attempt_id, scheduler_lane, and replan_generation."
  - "Payload carries effective requested/effective model snapshot and effective permission snapshot identifier."
  - "safe_point_id and remediation lineage are present when relevant."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: attempt_started_payload_loss
reasoning_tier: high
context_scope: attempt_started_payload
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: attempt_started_payload_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0100
preserved_exact_tokens:
  - "`attempt.started`"
  - "`attempt_id`"
  - "`scheduler_lane`"
  - "effective requested/effective model snapshot"
  - "effective permission snapshot identifier"
  - "`safe_point_id`"
  - "`remediation_root_id`"
  - "`remediation_parent_attempt_id`"
  - "`replan_generation`"
negative_constraints: []
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-240 - Attempt Completed Payload

```yaml
plan_unit_id: CV-240
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  attempt.completed payload preserves run, thread, node, and attempt identity,
  terminal state, failure_class or success marker, retry/backoff metadata,
  verification or reviewer references, and resolved lineage identifiers.
gui_related: false
gui_classification_reason: This unit defines attempt completion payload fields.
split_recommended: false
depends_on: [CV-239]
unblocks: []
acceptance_criteria:
  - "attempt.completed payload includes run_id, thread_id, node_id, attempt_id, terminal state, and resolved lineage identifiers."
  - "failure_class or success marker is preserved."
  - "Retry/backoff metadata and verification/reviewer result references are preserved when relevant."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: attempt_completed_payload_loss
reasoning_tier: high
context_scope: attempt_completed_payload
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: attempt_completed_payload_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0101
preserved_exact_tokens:
  - "`attempt.completed`"
  - "`failure_class`"
  - "success marker"
  - "retry count"
  - "backoff metadata"
  - "verification / reviewer result references"
  - "resolved lineage identifiers"
negative_constraints: []
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-241 - Node Blocked Attempt-Lineage Payload

```yaml
plan_unit_id: CV-241
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  node.blocked attempt-lineage payload preserves run, thread, node, and optional
  attempt identity, blocked_reason_code, failure_class, timeout_class,
  wait_state_class, ordered allowed_action_ids, auth or side-effect metadata, and
  whether local work was preserved.
gui_related: false
gui_classification_reason: This unit defines runtime blocked event payload fields.
split_recommended: false
depends_on: [CV-218, CV-219]
unblocks: [CV-244, CV-248, CV-250]
acceptance_criteria:
  - "node.blocked payload includes run_id, thread_id, node_id, and attempt_id if an attempt existed."
  - "blocked_reason_code, failure_class, timeout_class, wait_state_class, and ordered allowed_action_ids are preserved."
  - "Auth realm, missing scopes, side-effect metadata, and preserved local work are preserved when relevant."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: node_blocked_attempt_payload_loss
reasoning_tier: high
context_scope: node_blocked_attempt_lineage_payload
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: node_blocked_attempt_lineage_payload
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0102
preserved_exact_tokens:
  - "`node.blocked`"
  - "`blocked_reason_code`"
  - "`failure_class`"
  - "`timeout_class`"
  - "`wait_state_class`"
  - "`allowed_action_ids[]`"
  - "`auth_realm`"
  - "`missing_scopes[]`"
negative_constraints: []
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-242 - Safe Point Snapshot Guard

```yaml
plan_unit_id: CV-242
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  safe_point.created and safe_point.restored preserve safe point, run, node, and
  attempt identity, workspace or worktree reference, replan generation, reason,
  and restore result; worktree-bound attempts capture worktree_id,
  worktree_path, branch_name, and HEAD_sha and report blocked/stale baseline
  instead of substituting another root or worktree.
gui_related: false
gui_classification_reason: This unit defines safe-point runtime recovery safeguards.
split_recommended: false
depends_on: [CV-224, CV-226]
unblocks: []
acceptance_criteria:
  - "safe_point.created and safe_point.restored preserve safe_point_id, run_id, node_id, attempt_id, workspace/worktree reference, replan_generation, reason, and result."
  - "Worktree-bound attempts capture worktree_id, worktree_path, branch_name, and HEAD_sha."
  - "Recovery reports blocked/stale baseline when path, branch, or HEAD state no longer matches."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: safe_point_snapshot_guard_loss
reasoning_tier: high
context_scope: safe_point_worktree_snapshot_guard
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: safe_point_snapshot_guard
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0103
preserved_exact_tokens:
  - "`safe_point.created`"
  - "`safe_point.restored`"
  - "`worktree_id`"
  - "`worktree_path`"
  - "`branch_name`"
  - "`HEAD_sha`"
  - "blocked/stale baseline"
  - "main project root"
negative_constraints:
  - "Recovery flow must not silently substitute the main project root or a different worktree when captured worktree context no longer matches."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-243 - Remediation Addendum Payload

```yaml
plan_unit_id: CV-243
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  remediation.spawned and remediation.resolved addendum payloads preserve
  remediation_root_id, remediation_parent_attempt_id, child attempt identity,
  finding or issue references, remediation_generation, and resolution enum.
gui_related: false
gui_classification_reason: This unit defines remediation lifecycle payload fields.
split_recommended: false
depends_on: [CV-229, CV-230]
unblocks: []
acceptance_criteria:
  - "Payload preserves remediation_root_id, remediation_parent_attempt_id, child attempt_id, finding/issue references, remediation_generation, and resolution enum."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: remediation_addendum_payload_loss
reasoning_tier: standard
context_scope: remediation_addendum_payload
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: remediation_addendum_payload_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0104
preserved_exact_tokens:
  - "`remediation.spawned`"
  - "`remediation.resolved`"
  - "`remediation_root_id`"
  - "`remediation_parent_attempt_id`"
  - "child `attempt_id`"
  - "finding / issue references"
  - "`remediation_generation`"
  - "`fixed`"
  - "`superseded`"
  - "`abandoned`"
  - "`replan_required`"
negative_constraints: []
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Executor_Protocol.md
```

### CV-244 - Tool Denied Runtime Mapping Fields

```yaml
plan_unit_id: CV-244
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  tool.denied carries canonical runtime mapping fields when a denial affects
  scheduler state, including blocked_reason_code, failure_class, ordered
  allowed_action_ids, headless_denied, and effective permission snapshot
  identifier; these fields are not UI-only projection conveniences.
gui_related: false
gui_classification_reason: This unit defines runtime denial payload fields and explicitly excludes UI-only projection semantics.
split_recommended: false
depends_on: [CV-241]
unblocks: []
acceptance_criteria:
  - "tool.denied carries canonical runtime mapping fields when a denial affects scheduler state."
  - "Payload includes blocked_reason_code, failure_class, ordered allowed_action_ids, headless_denied, and effective permission snapshot identifier."
  - "The fields are canonical contract fields, not UI-only projection conveniences."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: tool_denied_runtime_mapping_loss
reasoning_tier: high
context_scope: tool_denied_runtime_mapping_fields
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Tools.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: tool_denied_runtime_mapping_fields
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0105
preserved_exact_tokens:
  - "`tool.denied`"
  - "`blocked_reason_code`"
  - "`failure_class`"
  - "`allowed_action_ids[]`"
  - "`headless_denied`"
  - "effective permission snapshot identifier"
  - "not UI-only projection conveniences"
  - "ContractRef: EventType:tool.denied, ContractName:Plans/Tools.md, ContractName:Plans/Executor_Protocol.md"
negative_constraints:
  - "tool.denied runtime mapping fields must not be treated as UI-only projection conveniences."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Tools.md
  - Plans/Executor_Protocol.md
```

### CV-245 - Runtime Taxonomy Compatibility Mirror

```yaml
plan_unit_id: CV-245
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  The Canonical Runtime Taxonomy and Event Precedence alignment section is an
  exact compatibility mirror of the later canonical runtime contract so readers
  do not stop at stale transitional enum lists.
gui_related: false
gui_classification_reason: This unit defines compatibility/source-lineage boundary semantics.
split_recommended: false
depends_on: []
unblocks: [CV-246]
acceptance_criteria:
  - "The section is treated as a compatibility mirror, not a competing taxonomy owner."
  - "Stale transitional enum lists do not override the canonical runtime contract."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: stale_runtime_taxonomy_revival
reasoning_tier: high
context_scope: runtime_taxonomy_compatibility_mirror
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: runtime_taxonomy_compatibility_mirror
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0106
preserved_exact_tokens:
  - "exact compatibility mirror"
  - "stale transitional enum lists"
stale_retired_dispositions:
  - "Stale transitional enum lists are not the canonical value family."
negative_constraints:
  - "Compatibility mirror text must not become a competing runtime taxonomy owner."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-246 - Event Name Precedence Alias Table

```yaml
plan_unit_id: CV-246
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Canonical event-name precedence maps scheduler.pass over
  run.scheduler_analysis, node.blocked over run.node_blocked, node.unblocked
  over run.node_unblocked, remediation.spawned over run.remediation_started, and
  remediation.resolved over run.remediation_completed.
gui_related: false
gui_classification_reason: This unit defines event alias precedence rather than visual presentation.
split_recommended: false
depends_on: [CV-215, CV-218, CV-220, CV-229, CV-230]
unblocks: []
acceptance_criteria:
  - "Canonical event names are preferred over legacy aliases."
  - "Legacy aliases remain compatibility/source-lineage only."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: event_alias_precedence_drift
reasoning_tier: high
context_scope: event_name_precedence_aliases
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: event_name_precedence_alias_table
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0107
preserved_exact_tokens:
  - "`scheduler.pass`"
  - "`run.scheduler_analysis`"
  - "`node.blocked`"
  - "`run.node_blocked`"
  - "`node.unblocked`"
  - "`run.node_unblocked`"
  - "`remediation.spawned`"
  - "`run.remediation_started`"
  - "`remediation.resolved`"
  - "`run.remediation_completed`"
compatibility_only_notes:
  - "Legacy event aliases remain compatibility/source-lineage only."
negative_constraints:
  - "Legacy event aliases must not outrank canonical event names."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-247 - Failure Class Enum Family

```yaml
plan_unit_id: CV-247
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  The canonical failure_class enum family includes provider_transient,
  structured_output_invalid, verification_failed, reviewer_findings,
  auth_expired, storage_io, quota_exceeded, rate_limited, and graph_integrity.
gui_related: false
gui_classification_reason: This unit defines runtime enum values rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: [CV-251]
acceptance_criteria:
  - "failure_class preserves every listed canonical value."
  - "Consumers do not replace the enum with shorter local lists."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: failure_class_enum_drift
reasoning_tier: high
context_scope: failure_class_enum_family
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: failure_class_enum_family
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0108
preserved_exact_tokens:
  - "`failure_class`"
  - "`provider_transient`"
  - "`structured_output_invalid`"
  - "`verification_failed`"
  - "`reviewer_findings`"
  - "`auth_expired`"
  - "`storage_io`"
  - "`quota_exceeded`"
  - "`rate_limited`"
  - "`graph_integrity`"
negative_constraints:
  - "No shorter local enum list may replace the canonical failure_class family."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-248 - Blocked Reason Code Enum Family

```yaml
plan_unit_id: CV-248
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  The canonical blocked_reason_code enum family preserves permission,
  headless, FileSafe, network, host, replan, approval, clarification, worktree,
  plugin, validation, and remediation ceiling values.
gui_related: false
gui_classification_reason: This unit defines runtime blocked-state enum values.
split_recommended: false
depends_on: [CV-241]
unblocks: [CV-249, CV-255]
acceptance_criteria:
  - "blocked_reason_code preserves all listed values, including permission_denied, user_declined, headless_ask_denied, filesafe_blocked, external_side_effect_blocked, network_blocked_by_policy, host_unreachable, host_untrusted, replan_required, waiting_approval, clarification_blocked, worktree_conflict, dirty_worktree, plugin_hook_blocked, validation_blocked, and remediation_ceiling_exceeded."
  - "Consumers do not replace the enum with shorter local lists."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_reason_enum_drift
reasoning_tier: high
context_scope: blocked_reason_code_enum_family
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: blocked_reason_code_enum_family
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0108
preserved_exact_tokens:
  - "`blocked_reason_code`"
  - "`permission_denied`"
  - "`user_declined`"
  - "`headless_ask_denied`"
  - "`filesafe_blocked`"
  - "`external_side_effect_blocked`"
  - "`network_blocked_by_policy`"
  - "`host_unreachable`"
  - "`host_untrusted`"
  - "`replan_required`"
  - "`waiting_approval`"
  - "`clarification_blocked`"
  - "`worktree_conflict`"
  - "`dirty_worktree`"
  - "`plugin_hook_blocked`"
  - "`validation_blocked`"
  - "`remediation_ceiling_exceeded`"
negative_constraints:
  - "No shorter local enum list may replace the canonical blocked_reason_code family."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-249 - Offline Cached And Domain Payload Boundary

```yaml
plan_unit_id: CV-249
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  offline_cached is a read-only surface/projection state, not a
  blocked_reason_code; mutating runtime, registry, Kubernetes, plugin-added, or
  extensibility actions from offline_cached state still emit canonical blocked
  payloads, and domain payload details do not re-own blocked identity.
gui_related: false
gui_classification_reason: This unit defines runtime blocked-state ownership even though it mentions projection state.
split_recommended: false
depends_on: [CV-248]
unblocks: []
acceptance_criteria:
  - "offline_cached is not a blocked_reason_code."
  - "Mutating actions from offline_cached state emit canonical blocked payloads when policy or host state prevents execution."
  - "SCM, GitHub Actions, and Docker/Kubernetes payload details remain schema-bearing details on top of shared blocked-state primitives."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: offline_cached_blocked_identity_drift
reasoning_tier: high
context_scope: offline_cached_domain_payload_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: offline_cached_domain_payload_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0108
preserved_exact_tokens:
  - "`offline_cached`"
  - "`blocked_reason_code`"
  - "`/runtime`"
  - "`/registry`"
  - "Kubernetes"
  - "plugin-added"
  - "`/extensibility`"
  - "`network_blocked_by_policy`"
  - "`host_unreachable`"
  - "`host_untrusted`"
  - "SCM"
  - "GitHub Actions"
  - "Docker/Kubernetes"
negative_constraints:
  - "offline_cached must not be treated as a blocked_reason_code."
  - "Domain blocked-payload details must not re-own blocked-state identity."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-250 - Allowed Action ID And Abort Shorthand

```yaml
plan_unit_id: CV-250
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  allowed_action_id values include approve, decline, retry_now,
  resume_after_prerequisite, restore_safe_point_then_retry, start_fresh_attempt,
  replan, skip_node, abort_run, and open_details; command shorthand /abort
  resolves to abort_run or provider stream cancellation, while persisted payloads
  keep canonical action identity.
gui_related: false
gui_classification_reason: This unit defines runtime action identity values rather than visual presentation.
split_recommended: false
depends_on: [CV-241]
unblocks: [CV-255]
acceptance_criteria:
  - "allowed_action_id preserves the listed canonical values."
  - "/abort resolves to abort_run or provider-specific stream cancellation for in-progress provider calls."
  - "Persisted approval and blocked-state payloads keep canonical allowed_action_id."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: allowed_action_identity_drift
reasoning_tier: high
context_scope: allowed_action_id_abort_shorthand
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: allowed_action_id_abort_shorthand
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0108
preserved_exact_tokens:
  - "`allowed_action_id`"
  - "`approve`"
  - "`decline`"
  - "`retry_now`"
  - "`resume_after_prerequisite`"
  - "`restore_safe_point_then_retry`"
  - "`start_fresh_attempt`"
  - "`replan`"
  - "`skip_node`"
  - "`abort_run`"
  - "`open_details`"
  - "`/abort`"
negative_constraints:
  - "Persisted approval and blocked-state payloads must not store slash command shorthand as separate action identity."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-251 - Timeout Class Recovery Semantics

```yaml
plan_unit_id: CV-251
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Runtime records carry timeout_class only when a timeout-class event occurred;
  canonical values include hard_execution_timeout, inactivity_timeout,
  polling_timeout, reconnect_timeout, and user_visible_wait_timer_expiry, and
  timeout_class remains distinct from failure_class and blocked_reason_code.
gui_related: false
gui_classification_reason: This unit defines timeout recovery semantics rather than visual presentation.
split_recommended: false
depends_on: [CV-247, CV-248]
unblocks: [CV-252, CV-255]
acceptance_criteria:
  - "timeout_class appears only when a timeout-class event occurred."
  - "Canonical timeout values are preserved."
  - "timeout_class is distinct from failure_class and blocked_reason_code."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: timeout_class_semantics_drift
reasoning_tier: high
context_scope: timeout_class_recovery_semantics
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: timeout_class_recovery_semantics
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0109
preserved_exact_tokens:
  - "`timeout_class?`"
  - "`hard_execution_timeout`"
  - "`inactivity_timeout`"
  - "`polling_timeout`"
  - "`reconnect_timeout`"
  - "`user_visible_wait_timer_expiry`"
  - "`failure_class`"
  - "`blocked_reason_code`"
negative_constraints:
  - "timeout_class must not be used as a generic failure substitute."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-252 - Wait State And No-Inference Constraints

```yaml
plan_unit_id: CV-252
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Known waits use wait_state_class instead of generic deadlock or stall states;
  scheduled workflows are not skipped or failed by inference alone, future waits
  are not timeouts until their governing timer expires, and such waits must not
  produce stall banners or auto-pause behavior.
gui_related: true
gui_classification_reason: This unit includes user-visible stall banner and auto-pause projection constraints.
split_recommended: false
depends_on: [CV-251]
unblocks: [CV-255]
acceptance_criteria:
  - "wait_state_class preserves environment_wait_timer, approval_wait, queue_wait, long_governance_wait, scheduled_workflow_observation_gap, and future_timestamp_wait."
  - "Scheduled workflows are not skipped or failed by inference alone."
  - "Future timestamp waits do not produce stall banners or auto-pause until the governing timer actually expires."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: wait_state_inference_drift
reasoning_tier: high
context_scope: wait_state_no_inference_constraints
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: wait_state_no_inference_constraint
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0109
preserved_exact_tokens:
  - "`wait_state_class?`"
  - "`environment_wait_timer`"
  - "`approval_wait`"
  - "`queue_wait`"
  - "`long_governance_wait`"
  - "`scheduled_workflow_observation_gap`"
  - "`future_timestamp_wait`"
  - "`/stall`"
  - "`auto-pause`"
negative_constraints:
  - "A scheduled workflow with no fresh observation is not skipped or failed by inference alone."
  - "A known future-timestamp wait is not a timeout until its governing timer actually expires."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-253 - Timestamp Provenance And Display Rules

```yaml
plan_unit_id: CV-253
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Temporal records distinguish source_occurred_at, observed_at, and recorded_at;
  persisted timestamps are UTC ISO-8601 values with Z, UI surfaces display local
  timezone by default while exposing absolute UTC, and relative labels use one
  chosen base timestamp per surface.
gui_related: true
gui_classification_reason: This unit defines user-visible timestamp display and hover/detail behavior.
split_recommended: false
depends_on: []
unblocks: [CV-254]
acceptance_criteria:
  - "Temporal records distinguish source_occurred_at, observed_at, and recorded_at."
  - "Persisted timestamps are UTC ISO-8601 values with Z."
  - "UI surfaces display local timezone by default and expose absolute UTC in detail or hover."
  - "Relative labels such as 5m ago use one chosen base timestamp per surface."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: timestamp_display_provenance_drift
reasoning_tier: high
context_scope: timestamp_provenance_display_rules
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: timestamp_provenance_display_rules
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0109
preserved_exact_tokens:
  - "`source_occurred_at`"
  - "`observed_at`"
  - "`recorded_at`"
  - "UTC ISO-8601 values with `Z`"
  - "`5m ago`"
  - "`/update/log`"
negative_constraints:
  - "Relative labels must not silently mix receive, update/log, and persistence times."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
```

### CV-254 - Clock Skew And Scheduled Projection Rules

```yaml
plan_unit_id: CV-254
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  When remote clock skew is material, the UI warns with clock_skew_detected and
  avoids duration or staleness claims based only on remote timestamps; scheduled
  projections declare timezone, next-run source, missed-run behavior while
  closed or offline, and stale threshold, and orchestrator/receipts do not mark
  skipped or failed merely because no fresh observation arrived.
gui_related: true
gui_classification_reason: This unit defines user-visible clock-skew warnings and scheduled projection behavior.
split_recommended: false
depends_on: [CV-253]
unblocks: []
acceptance_criteria:
  - "UI warns with clock_skew_detected when skew is material."
  - "Scheduled projections declare displayed schedule timezone, next-run computation source, missed-run behavior, and stale threshold."
  - "Orchestrator and receipts do not mark skipped or failed solely because no fresh observation arrived."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: clock_skew_schedule_projection_drift
reasoning_tier: high
context_scope: clock_skew_scheduled_projection_rules
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: clock_skew_scheduled_projection_rules
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0109
preserved_exact_tokens:
  - "`clock_skew_detected`"
  - "`/staleness`"
  - "`/offline`"
  - "`next run overdue`"
  - "`/failed`"
stale_retired_dispositions:
  - "Duration and staleness claims based only on skewed remote timestamps are retired."
negative_constraints:
  - "Orchestrator and receipts must not mark a scheduled workflow skipped or failed merely because no fresh observation arrived."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/FinalGUISpec.md
```

### CV-255 - Blocking Payload Required Field Rule

```yaml
plan_unit_id: CV-255
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Every runtime-facing blocked event or projection exposes blocked_reason_code,
  ordered allowed_action_ids, prerequisite metadata, preserved_local_work,
  requires_safe_point_restore, optional failure_class, timeout_class,
  wait_state_class, and detail_ref; no section may present an earlier shorter
  enum set as canonical.
gui_related: false
gui_classification_reason: This unit defines runtime blocked payload fields rather than visual presentation.
split_recommended: false
depends_on: [CV-248, CV-250, CV-251, CV-252]
unblocks: []
acceptance_criteria:
  - "Runtime-facing blocked events and projections expose the complete blocked payload field set."
  - "prerequisite metadata binds the recovery command."
  - "No earlier shorter enum set is presented as canonical."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_payload_field_loss
reasoning_tier: high
context_scope: blocking_payload_required_fields
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
  - Plans/Executor_Protocol.md
node_compile_hint:
  mode: blocking_payload_required_field_rule
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0110
preserved_exact_tokens:
  - "`blocked_reason_code`"
  - "`allowed_action_ids[]`"
  - "`preserved_local_work`"
  - "`requires_safe_point_restore?`"
  - "`failure_class?`"
  - "`timeout_class?`"
  - "`wait_state_class?`"
  - "`detail_ref?`"
  - "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Executor_Protocol.md"
negative_constraints:
  - "No section in this file may present an earlier shorter enum set as the canonical value family."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
  - Plans/Executor_Protocol.md
```

### CV-256 - Child Crew Runtime Event Family Boundary

```yaml
plan_unit_id: CV-256
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Child runs, crew coordination, and effective-context shaping are part of the
  same runtime event and action family as parent execution; they are not an
  optional overlay and do not define a separate event grammar.
gui_related: false
gui_classification_reason: This unit defines runtime event-family ownership rather than visual presentation.
split_recommended: false
depends_on: []
unblocks: [CV-257, CV-266, CV-270]
acceptance_criteria:
  - "Child, crew, and effective-context events share the parent runtime event/action family."
  - "They are not treated as an optional overlay."
  - "They do not define a separate event grammar."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: child_crew_event_grammar_split
reasoning_tier: high
context_scope: child_crew_runtime_event_family_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: child_crew_runtime_event_family_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0111
preserved_exact_tokens:
  - "child runs"
  - "crew coordination"
  - "effective-context shaping"
  - "not an optional overlay"
  - "separate event grammar"
negative_constraints:
  - "Child, crew, and effective-context shaping contracts must not become a separate event grammar."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-257 - Child Run Unified Entity Boundary

```yaml
plan_unit_id: CV-257
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  PM child runs are canonical runtime entities with stable identity, lineage,
  and lifecycle; command subtasks, orchestrated child runs, delegated plan-mode
  research, and crew members project into one model, with disposable-by-default
  lifecycle as baseline and long-lived or reopened child identity as an
  exception path.
gui_related: false
gui_classification_reason: This unit defines runtime child-run identity rather than visual presentation.
split_recommended: false
depends_on: [CV-256]
unblocks: [CV-258, CV-259, CV-260, CV-261, CV-262, CV-263]
acceptance_criteria:
  - "Command-launched subtasks, orchestrated child runs, delegated plan-mode research, and crew members project into one model."
  - "Persona and CLI provider docs are consumers of this child-run and Persona-storage contract, not separate ontology owners."
  - "Disposable-by-default child lifecycle is baseline; long-lived or reopened child identity is an exception path."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: child_run_ontology_split
reasoning_tier: high
context_scope: child_run_unified_entity_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Personas.md
  - Plans/CLI_Bridged_Providers.md
node_compile_hint:
  mode: child_run_unified_entity_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0112
preserved_exact_tokens:
  - "PM child runs"
  - "stable identity"
  - "lineage"
  - "lifecycle"
  - "delegated plan-mode research"
  - "crew members"
  - "Disposable-by-default"
  - "Plans/Personas.md"
  - "Plans/CLI_Bridged_Providers.md"
negative_constraints:
  - "Persona and CLI provider docs must not create a separate child-run ontology."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Personas.md
  - Plans/CLI_Bridged_Providers.md
```

### CV-258 - Child Lifecycle State Enum

```yaml
plan_unit_id: CV-258
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Canonical child lifecycle states are queued, running, awaiting_parent,
  blocked, complete, failed, and cancelled; superseded remains a terminal reason
  used when replacement occurred, and consumers must not invent incompatible
  parallel enums.
gui_related: false
gui_classification_reason: This unit defines runtime lifecycle enum values.
split_recommended: false
depends_on: [CV-257]
unblocks: []
acceptance_criteria:
  - "Canonical child lifecycle states are preserved across runtime storage, event projection, chat projection, and recovery."
  - "superseded remains a terminal reason, not an incompatible parallel state family."
  - "Consumers do not invent incompatible parallel enums."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: child_lifecycle_enum_drift
reasoning_tier: high
context_scope: child_lifecycle_state_enum
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: child_lifecycle_state_enum
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0112
preserved_exact_tokens:
  - "`queued`"
  - "`running`"
  - "`awaiting_parent`"
  - "`blocked`"
  - "`complete`"
  - "`failed`"
  - "`cancelled`"
  - "`superseded`"
  - "ContractRef: Canonical child lifecycle states MUST be preserved across runtime storage, event projection, chat projection, and recovery, and consumers MUST NOT invent incompatible parallel enums. [Source: Tools.md#event-model; storage-plan.md#canonical-child-run-records-and-batch-structure]"
negative_constraints:
  - "Consumers must not invent incompatible parallel child lifecycle enums."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### CV-259 - Child Run Record Fields

```yaml
plan_unit_id: CV-259
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Canonical child-run records preserve identity lineage, role routing, lifecycle
  state, attempt/resume state, effective capabilities, handoff context,
  grouping structure, and result history references; chat storage and
  orchestration projections consume those events without inventing child-only
  shadow state machines.
gui_related: false
gui_classification_reason: This unit defines runtime/storage record fields rather than visual presentation.
split_recommended: false
depends_on: [CV-257]
unblocks: []
acceptance_criteria:
  - "Child-run records preserve identity, role, lifecycle, attempt/resume, capability, handoff, grouping, and history references."
  - "Chat storage/orchestration projections consume canonical events."
  - "Child-only shadow state machines are prohibited."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: child_record_field_loss
reasoning_tier: high
context_scope: child_run_record_fields
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: child_run_record_fields
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0112
preserved_exact_tokens:
  - "`/lineage`"
  - "`/routing`"
  - "`/runtime`"
  - "`/handoff`"
  - "`/history`"
  - "`/storage/orchestration`"
negative_constraints:
  - "Chat storage/orchestration projections MUST NOT invent child-only shadow state machines."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### CV-260 - Child-To-Parent Signals And Legacy Labels

```yaml
plan_unit_id: CV-260
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Child-to-parent signals are canonical runtime events, not ad hoc UI messages;
  progress, result, blocked, clarification_needed, context_expansion_requested,
  user_input_requested, failed, and cancelled remain canonical, while legacy
  labels such as clarification-needed, context-expansion-needed, and
  user-input-requested map back to canonical events.
gui_related: true
gui_classification_reason: This unit includes user-facing signal label compatibility and chat/crew projection semantics.
split_recommended: false
depends_on: [CV-257]
unblocks: [CV-261]
acceptance_criteria:
  - "Child-to-parent signals remain canonical runtime events."
  - "Parent orchestration may summarize, consolidate, or route signals without losing canonical event identity."
  - "Legacy user-facing labels map back to canonical events."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: child_signal_label_drift
reasoning_tier: high
context_scope: child_to_parent_signal_compatibility
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: child_to_parent_signal_compatibility
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0112
preserved_exact_tokens:
  - "`progress`"
  - "`result`"
  - "`blocked`"
  - "`clarification_needed`"
  - "`context_expansion_requested`"
  - "`user_input_requested`"
  - "`failed`"
  - "`cancelled`"
  - "`clarification-needed`"
  - "`context-expansion-needed`"
  - "`user-input-requested`"
  - "ContractRef: Child-to-parent escalation and progress signals MUST remain canonical runtime events even when parent chat or crew UI projects them into higher-level summaries. [Source: Tools.md#event-model; assistant-chat-design.md#14-subagents--crew]"
compatibility_only_notes:
  - "Legacy user-facing signal labels map back to canonical child-to-parent runtime events."
negative_constraints:
  - "Child-to-parent signals must not become ad hoc UI message strings."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
```

### CV-261 - Child Projection Identity And Reversibility

```yaml
plan_unit_id: CV-261
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Chat-facing child projection events may normalize lifecycle into UI-specific
  envelopes, but must preserve child_run_id, parent_run_id, thread_id,
  timestamps, attempt identity when relevant, requested/effective persona and
  runtime descriptors, and reversibility to canonical event payloads.
gui_related: true
gui_classification_reason: This unit defines chat/cards/groups/batch summaries and session header/sidebar projections.
split_recommended: false
depends_on: [CV-257, CV-260]
unblocks: []
acceptance_criteria:
  - "Projection events preserve child_run_id, parent_run_id, thread_id, timestamp, attempt identity, and requested/effective persona/runtime descriptors when relevant."
  - "Child runs are not demoted into anonymous status text."
  - "Session header and sidebar token/context/cost displays remain projections over canonical records and usage events."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: child_projection_identity_loss
reasoning_tier: high
context_scope: child_projection_identity_reversibility
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: child_projection_identity_reversibility
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0112
preserved_exact_tokens:
  - "`child_run_id`"
  - "`parent_run_id`"
  - "`thread_id`"
  - "requested/effective persona/runtime descriptors"
  - "anonymous status text"
  - "`/sidebar`"
  - "`/context`"
  - "ContractRef: ContractName: child_projection_identity. Any projection event that feeds chat, cards, groups, or batch summaries MUST preserve canonical child identity fields and MUST NOT demote child runs into anonymous status text. [Source: storage-plan.md#canonical-child-run-records-and-batch-structure; assistant-chat-design.md#14-subagents--crew]"
negative_constraints:
  - "Child lineage must not be over-summarized into generic status text."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### CV-262 - Retry Reroute Replacement Resume Distinction

```yaml
plan_unit_id: CV-262
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  retry, reroute, replacement, and resume are distinct runtime concepts that
  remain distinct in contracts, storage, and event history; projections may
  summarize them but must not collapse them into one generic retry or restart
  bucket, and resume/reopen is an exception path rather than baseline
  continuity for disposable helpers.
gui_related: false
gui_classification_reason: This unit defines runtime lifecycle distinctions rather than visual presentation.
split_recommended: false
depends_on: [CV-257]
unblocks: []
acceptance_criteria:
  - "resume, retry, reroute, and replacement preserve their distinct meanings."
  - "Projections do not collapse these concepts into one retry/restart bucket."
  - "Cancelled and superseded children are terminal by default; resume/reopen is an exception path."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: child_retry_resume_semantic_collapse
reasoning_tier: high
context_scope: child_retry_reroute_replacement_resume
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: child_retry_reroute_replacement_resume_distinction
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0113
preserved_exact_tokens:
  - "`retry`"
  - "`reroute`"
  - "`replacement`"
  - "`resume`"
  - "retry/restart bucket"
  - "Disposable-by-default child lifecycle"
  - "ContractRef: Runtime and storage contracts MUST preserve the semantic distinction between resume, retry, reroute, and replacement; projections MAY summarize them but MUST NOT collapse them into one generic retry/restart bucket. [Source: Tools.md#retry-reroute-replacement-and-cancel; storage-plan.md#canonical-child-run-records-and-batch-structure]"
  - "ContractRef: Disposable-by-default child lifecycle is canonical; resume/reopen behavior MUST be treated as an exception path, not the baseline continuity model. [Source: assistant-memory-subsystem.md#capability-boundary-assistant-only; assistant-chat-design.md#15-plan-mode--crew-mode]"
negative_constraints:
  - "Runtime and storage contracts must not collapse resume, retry, reroute, and replacement into one generic retry/restart bucket."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### CV-263 - Crew Side-File Retirement Boundary

```yaml
plan_unit_id: CV-263
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Older crew message-board and active-agent side-file patterns retire into the
  child-run contract; side-files may project from canonical child-run records but
  must not stand beside them as competing runtime truth.
gui_related: false
gui_classification_reason: This unit defines runtime source-of-truth compatibility boundaries.
split_recommended: false
depends_on: [CV-257]
unblocks: [CV-264, CV-265]
acceptance_criteria:
  - "Older crew message-board and active-agent side-file patterns are retired into the child-run contract."
  - "Side-files may project from canonical child-run records."
  - "Side-files must not compete as runtime truth."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: crew_side_file_runtime_truth_split
reasoning_tier: high
context_scope: crew_side_file_retirement_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/orchestrator-subagent-integration.md
node_compile_hint:
  mode: crew_side_file_retirement_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0114
preserved_exact_tokens:
  - "`Plans/orchestrator-subagent-integration.md`"
  - "`/message-board`"
  - "`active-agent`"
  - "competing source of runtime truth"
compatibility_only_notes:
  - "Older crew side-file patterns are projection-only compatibility paths."
negative_constraints:
  - "A side-file must not stand beside canonical child-run records as competing runtime truth."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/orchestrator-subagent-integration.md
```

### CV-264 - Crew Board Attribution

```yaml
plan_unit_id: CV-264
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Crew coordination uses explicit crew-board messages or crew-scoped
  coordination records; messages are task-scoped, attributable, timestamped,
  and persisted, and hidden direct peer messaging is not a canonical runtime
  channel.
gui_related: false
gui_classification_reason: This unit defines crew coordination runtime record requirements.
split_recommended: false
depends_on: [CV-263]
unblocks: []
acceptance_criteria:
  - "Crew coordination uses explicit board messages or crew-scoped records."
  - "Crew board messages are task-scoped, attributable, timestamped, and persisted."
  - "Hidden direct peer messaging is not canonical."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: hidden_peer_channel_drift
reasoning_tier: high
context_scope: crew_board_attribution
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: crew_board_attribution_contract
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0114
preserved_exact_tokens:
  - "crew board"
  - "task-scoped"
  - "attributable"
  - "timestamped"
  - "hidden direct peer messaging"
  - "ContractRef: Crew-board coordination MUST remain attributable, inspectable, and task-scoped; hidden direct peer messaging is not a canonical runtime channel. [Source: assistant-chat-design.md#14-subagents--crew; storage-plan.md#canonical-child-run-records-and-batch-structure]"
negative_constraints:
  - "Hidden direct peer messaging is not a canonical runtime channel."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
  - Plans/storage-plan.md
```

### CV-265 - Crew Coordination Authority Envelope

```yaml
plan_unit_id: CV-265
unit_type: constraint
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Crew board traffic does not widen authority; permissions, tools, skills,
  plugins, MCP access, and provider restrictions remain subject to the same
  requested/effective capability rules as any other child run.
gui_related: false
gui_classification_reason: This unit defines authority and capability boundaries for crew coordination.
split_recommended: false
depends_on: [CV-263]
unblocks: []
acceptance_criteria:
  - "Crew coordination messages do not widen authority."
  - "Permissions, tools, skills, plugins, MCP access, and provider restrictions remain bound to the child's effective runtime envelope."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: crew_authority_widening
reasoning_tier: high
context_scope: crew_coordination_authority_envelope
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Permissions_System.md
  - Plans/Skills_System.md
node_compile_hint:
  mode: crew_coordination_authority_envelope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0114
preserved_exact_tokens:
  - "permissions"
  - "tools"
  - "skills"
  - "plugins"
  - "MCP access"
  - "provider restrictions"
  - "requested/effective capability rules"
  - "ContractRef: Crew coordination messages MUST NOT widen authority, permissions, or capability availability beyond the child's effective runtime envelope. [Source: Permissions_System.md#child-permission-ceiling-and-blocked-vs-awaiting-parent; Skills_System.md#child-capability-subset-clarification]"
negative_constraints:
  - "Crew coordination messages MUST NOT widen authority, permissions, or capability availability beyond the child's effective runtime envelope."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Permissions_System.md
  - Plans/Skills_System.md
```

### CV-266 - Subagent Lineage Envelope And Alias Boundary

```yaml
plan_unit_id: CV-266
unit_type: compatibility_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Stable subagent.* event families preserve the PM lineage envelope with run,
  thread, agent, parent, child, parent-thread, and requested/effective runtime
  descriptor fields; subagent.spawn_requested and subagent.spawn_completed
  remain under subagent.*, while chat.subagent_* and chat.subagent_spawned are
  legacy source aliases only.
gui_related: false
gui_classification_reason: This unit defines runtime lineage and event alias boundaries.
split_recommended: false
depends_on: [CV-256]
unblocks: [CV-267, CV-268, CV-269]
acceptance_criteria:
  - "Every subagent.* event preserves the PM lineage envelope."
  - "subagent.spawn_requested and subagent.spawn_completed remain under subagent.*."
  - "chat.subagent_* and chat.subagent_spawned remain legacy source aliases only."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: subagent_lineage_alias_drift
reasoning_tier: high
context_scope: subagent_lineage_envelope_alias_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/storage-plan.md
  - Plans/CLI_Bridged_Providers.md
  - Plans/Run_Modes.md
node_compile_hint:
  mode: subagent_lineage_envelope_alias_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0115
preserved_exact_tokens:
  - "`subagent.*`"
  - "`run_id`"
  - "`thread_id`"
  - "`agent_id`"
  - "`parent_run_id?`"
  - "`child_run_id?`"
  - "`parent_thread_id?`"
  - "`subagent.spawn_requested`"
  - "`subagent.spawn_completed`"
  - "`chat.subagent_*`"
  - "`chat.subagent_spawned`"
  - "ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md"
  - "ContractRef: ContractName:Plans/CLI_Bridged_Providers.md, ContractName:Plans/Run_Modes.md"
compatibility_only_notes:
  - "chat.subagent_* and chat.subagent_spawned are legacy source aliases only."
negative_constraints:
  - "Child identity and lineage are not optional metadata for subagent.* events."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/storage-plan.md
```

### CV-267 - Subagent Lifecycle Events

```yaml
plan_unit_id: CV-267
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Subagent lifecycle event rows and payloads are preserved for subagent.spawned,
  subagent.started, subagent.completed, subagent.failed, subagent.cancelled,
  subagent.timeout, subagent.paused, and subagent.resumed.
gui_related: false
gui_classification_reason: This unit defines subagent runtime event table rows.
split_recommended: false
depends_on: [CV-266]
unblocks: []
acceptance_criteria:
  - "subagent.spawned, subagent.started, subagent.completed, subagent.failed, subagent.cancelled, subagent.timeout, subagent.paused, and subagent.resumed remain stable event families."
  - "Each event row preserves its source payload field list and description."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: subagent_lifecycle_event_loss
reasoning_tier: standard
context_scope: subagent_lifecycle_events
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: subagent_lifecycle_events
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0115
preserved_exact_tokens:
  - "`subagent.spawned`"
  - "`subagent.started`"
  - "`subagent.completed`"
  - "`subagent.failed`"
  - "`subagent.cancelled`"
  - "`subagent.timeout`"
  - "`subagent.paused`"
  - "`subagent.resumed`"
negative_constraints: []
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/orchestrator-subagent-integration.md
```

### CV-268 - Subagent Activity And Message Events

```yaml
plan_unit_id: CV-268
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Subagent activity and message event rows and payloads are preserved for
  subagent.progress, subagent.tool_called, subagent.tool_completed,
  subagent.message_sent, subagent.message_received, and
  subagent.output_truncated.
gui_related: false
gui_classification_reason: This unit defines subagent runtime event table rows.
split_recommended: false
depends_on: [CV-266]
unblocks: []
acceptance_criteria:
  - "Subagent progress, tool, message, and output-truncation events remain stable event families."
  - "Each event row preserves its source payload field list and description."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: subagent_activity_message_event_loss
reasoning_tier: standard
context_scope: subagent_activity_message_events
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: subagent_activity_message_events
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0115
preserved_exact_tokens:
  - "`subagent.progress`"
  - "`subagent.tool_called`"
  - "`subagent.tool_completed`"
  - "`subagent.message_sent`"
  - "`subagent.message_received`"
  - "`subagent.output_truncated`"
negative_constraints: []
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/orchestrator-subagent-integration.md
```

### CV-269 - Subagent Retry Context Budget Escalation Events

```yaml
plan_unit_id: CV-269
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Subagent retry, context, budget, model-switch, and escalation event rows and
  payloads are preserved for subagent.retried, subagent.context_warning,
  subagent.model_switched, subagent.budget_warning, and subagent.escalated.
gui_related: false
gui_classification_reason: This unit defines subagent runtime event table rows.
split_recommended: false
depends_on: [CV-266]
unblocks: []
acceptance_criteria:
  - "Subagent retry, context warning, model switch, budget warning, and escalation events remain stable event families."
  - "Each event row preserves its source payload field list and description."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: subagent_retry_budget_event_loss
reasoning_tier: standard
context_scope: subagent_retry_context_budget_escalation_events
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: subagent_retry_context_budget_escalation_events
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0115
preserved_exact_tokens:
  - "`subagent.retried`"
  - "`subagent.context_warning`"
  - "`subagent.model_switched`"
  - "`subagent.budget_warning`"
  - "`subagent.escalated`"
negative_constraints: []
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/orchestrator-subagent-integration.md
```

### CV-270 - Crew Lineage Envelope

```yaml
plan_unit_id: CV-270
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Every crew.* event preserves crew and child lineage together, including
  run_id, thread_id, crew_id, optional parent_run_id, optional child_run_id, and
  member_agent_ids when membership matters.
gui_related: false
gui_classification_reason: This unit defines crew runtime event lineage fields.
split_recommended: false
depends_on: [CV-256]
unblocks: [CV-271]
acceptance_criteria:
  - "Every crew.* event preserves run_id, thread_id, crew_id, parent_run_id, child_run_id, and member_agent_ids where relevant."
  - "Crew and child lineage remain linked in crew events."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: crew_lineage_envelope_loss
reasoning_tier: high
context_scope: crew_lineage_envelope
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: crew_lineage_envelope
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0115
preserved_exact_tokens:
  - "`crew.*`"
  - "`crew_id`"
  - "`member_agent_ids[]`"
  - "ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/orchestrator-subagent-integration.md"
negative_constraints:
  - "Crew event payloads must not drop child lineage when membership matters."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/assistant-chat-design.md
  - Plans/orchestrator-subagent-integration.md
```

### CV-271 - Crew Event Family Table

```yaml
plan_unit_id: CV-271
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Crew event-family rows and payloads are preserved for crew.formed,
  crew.member_added, crew.member_removed, crew.coordination, crew.completed,
  and crew.disbanded.
gui_related: false
gui_classification_reason: This unit defines crew runtime event table rows.
split_recommended: false
depends_on: [CV-270]
unblocks: []
acceptance_criteria:
  - "crew.formed, crew.member_added, crew.member_removed, crew.coordination, crew.completed, and crew.disbanded remain stable event families."
  - "Each event row preserves its source payload field list and description."
  - "The final storage-plan and Run_Modes ContractRef is preserved."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: crew_event_family_loss
reasoning_tier: standard
context_scope: crew_event_family_table
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Run_Modes.md
node_compile_hint:
  mode: crew_event_family_table
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0115
preserved_exact_tokens:
  - "`crew.formed`"
  - "`crew.member_added`"
  - "`crew.member_removed`"
  - "`crew.coordination`"
  - "`crew.completed`"
  - "`crew.disbanded`"
  - "ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Run_Modes.md"
negative_constraints: []
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/Run_Modes.md
```

### CV-272 - Dynamic Context Shrinking Effective-Context Boundary

```yaml
plan_unit_id: CV-272
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Dynamic context shrinking is an effective-context mechanism distinct from
  compaction, retrieval injection, rotation, and Assistant memory; it may
  replace stale effective-context blocks with shorter summaries while
  preserving canonical source state and rehydration references.
gui_related: false
gui_classification_reason: This unit defines effective-context runtime semantics, not UI presentation.
split_recommended: false
depends_on: [CV-257]
unblocks: [CV-273, CV-275, CV-276]
acceptance_criteria:
  - "Dynamic context shrinking remains distinct from compaction, retrieval injection, rotation, and Assistant memory."
  - "Shrinking operates on effective context only while preserving canonical source state and rehydration references."
  - "Shrinking does not rewrite source-of-truth history."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: effective_context_source_truth_confusion
reasoning_tier: high
context_scope: dynamic_context_shrinking_boundary
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: dynamic_context_shrinking_boundary
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0117
preserved_exact_tokens:
  - "Dynamic context shrinking"
  - "`effective-context`"
  - "`compaction`"
  - "`retrieval injection`"
  - "`rotation`"
  - "`Assistant memory`"
  - "`source-of-truth history`"
negative_constraints:
  - "Dynamic context shrinking MUST preserve canonical source state and MUST operate on effective context only, not rewrite source-of-truth history."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
```

### CV-273 - Prompt Pipeline Shrinking Ownership Floor

```yaml
plan_unit_id: CV-273
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Prompt Pipeline owns compaction/pruning, context assembly/cache preservation,
  and dynamic context shrinking; Contracts_V0 records only the cross-contract
  floor for instruction context budgets, on-demand or scoped references, replay,
  history, continuity, source refs, and drift-control lineage.
gui_related: false
gui_classification_reason: This unit defines owner/consumer and context-contract boundaries.
split_recommended: false
depends_on: [CV-272]
unblocks: [CV-274, CV-275]
acceptance_criteria:
  - "Prompt Pipeline remains the owner for compaction/pruning, context assembly/cache preservation, and dynamic context shrinking."
  - "Contracts_V0 records only the cross-contract floor for instruction context budget, scoped references, replay, history, continuity, source refs, and drift-control lineage."
  - "Effective-context summaries do not pretend to be the source of truth."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: prompt_pipeline_contract_ownership_drift
reasoning_tier: high
context_scope: prompt_pipeline_shrinking_ownership_floor
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: prompt_pipeline_shrinking_ownership_floor
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0117
preserved_exact_tokens:
  - "`Prompt Pipeline`"
  - "`## 2. Compaction and pruning`"
  - "`### 2.1 Context assembly and cache preservation`"
  - "`### 2.2 Dynamic context shrinking`"
  - "`giant-instruction-file`"
  - "`agent-visible context-budget`"
  - "`/on-demand`"
  - "`/history`"
  - "`/continuity`"
  - "`drift-control lineage`"
negative_constraints:
  - "Contracts_V0 must not become the owner of Prompt Pipeline context assembly, cache preservation, or dynamic shrinking internals."
  - "Effective-context summaries must not pretend to be source truth."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Prompt_Pipeline.md
  - Plans/storage-plan.md
```

### CV-274 - Automatic Shrinking Scope And Protection

```yaml
plan_unit_id: CV-274
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Automatic shrinking defaults to tool results; retrieved-context blocks and
  plan/report blocks are user-configurable optional categories, with
  conservative staleness/context-pressure triggers and current working set items
  protected from automatic shrinking.
gui_related: false
gui_classification_reason: This unit defines effective-context runtime scope and protection rules.
split_recommended: false
depends_on: [CV-272, CV-273]
unblocks: [CV-275, CV-276]
acceptance_criteria:
  - "Tool results are the default automatic shrinking scope."
  - "Retrieved-context blocks and plan/report blocks remain user-configurable optional shrinking categories."
  - "Current working set items are protected from automatic shrinking."
  - "Automatic shrinking does not rewrite static system/provider/persona/tool-definition content."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: automatic_context_shrinking_scope_drift
reasoning_tier: high
context_scope: automatic_shrinking_scope_and_protection
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Prompt_Pipeline.md
node_compile_hint:
  mode: automatic_shrinking_scope_and_protection
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0117
preserved_exact_tokens:
  - "`tool results`"
  - "`current working set`"
  - "`static system/provider/persona/tool-definition content`"
negative_constraints:
  - "Automatic shrinking MUST respect protected current-working-set items and MUST NOT rewrite static system/provider/persona/tool-definition content."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Prompt_Pipeline.md
```

### CV-275 - Context Shrinking Projection Events

```yaml
plan_unit_id: CV-275
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Runtime projection may emit subagent.context_shrunk and
  subagent.context_rehydrated where effective-context changes need inspection or
  replay; these events are additive effective-context projections and do not
  replace canonical child history or source references.
gui_related: false
gui_classification_reason: This unit defines runtime event projection semantics rather than visual presentation.
split_recommended: false
depends_on: [CV-272, CV-273, CV-274]
unblocks: [CV-276]
acceptance_criteria:
  - "subagent.context_shrunk and subagent.context_rehydrated may be emitted for inspectable or replayable effective-context state changes."
  - "Context-shrinking events supplement canonical child history and source references."
  - "Context-shrinking events do not become the sole durable record of planning evidence or child outputs."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: context_shrinking_projection_overauthority
reasoning_tier: high
context_scope: context_shrinking_projection_events
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: context_shrinking_projection_events
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0117
preserved_exact_tokens:
  - "`subagent.context_shrunk`"
  - "`subagent.context_rehydrated`"
negative_constraints:
  - "Context-shrinking events MUST be additive effective-context projections and MUST NOT become the sole durable record of planning evidence or child outputs."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
```

### CV-276 - Context Update Field Presence

```yaml
plan_unit_id: CV-276
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Every tool-call event that participates in effective-context shaping carries
  _context_updates; when no compression or rehydration is needed, the field is
  present as an empty array.
gui_related: false
gui_classification_reason: This unit defines event payload field presence.
split_recommended: false
depends_on: [CV-272, CV-275]
unblocks: []
acceptance_criteria:
  - "Every tool-call event participating in effective-context shaping carries _context_updates."
  - "When no compression or rehydration is needed, _context_updates is present as []."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: context_update_payload_field_absence
reasoning_tier: standard
context_scope: context_update_field_presence
implementation_surfaces:
  - Plans/Contracts_V0.md
node_compile_hint:
  mode: context_update_field_presence
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0117
preserved_exact_tokens:
  - "`_context_updates`"
  - "`[]`"
negative_constraints:
  - "Effective-context shaping tool-call events must not omit _context_updates merely because no compression or rehydration occurred."
owner_hints:
  - Plans/Contracts_V0.md
```

### CV-277 - Parent Mediation And Dependency Blocking

```yaml
plan_unit_id: CV-277
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Parent orchestration retains final mediation responsibility for child
  escalations, user questioning, and crew synthesis; required-versus-optional
  child dependency classification determines whether unresolved child work
  blocks dependent parent completion.
gui_related: false
gui_classification_reason: This unit defines orchestration dependency semantics and escalation responsibility.
split_recommended: false
depends_on: [CV-257, CV-270]
unblocks: [CV-278]
acceptance_criteria:
  - "Parent orchestration retains final mediation responsibility for child escalations, user questioning, and crew synthesis."
  - "Children do not directly interrogate the user by default."
  - "Required-versus-optional child dependency classification determines whether unresolved child work blocks dependent parent completion."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: parent_mediation_dependency_semantics_loss
reasoning_tier: high
context_scope: parent_mediation_dependency_blocking
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: parent_mediation_dependency_blocking
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0118
preserved_exact_tokens:
  - "`Parent orchestration`"
  - "`Children do not directly interrogate the user by default.`"
  - "`Required versus optional`"
negative_constraints:
  - "Children do not directly interrogate the user by default."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/orchestrator-subagent-integration.md
  - Plans/assistant-chat-design.md
```

### CV-278 - Blocked Awaiting Parent State Distinction

```yaml
plan_unit_id: CV-278
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  blocked means external or runtime constraints prevent progress, while
  awaiting_parent means the child is paused pending parent decision,
  clarification, context expansion, or user response; these states are not
  interchangeable.
gui_related: false
gui_classification_reason: This unit defines canonical runtime state semantics across events and recovery.
split_recommended: false
depends_on: [CV-277]
unblocks: []
acceptance_criteria:
  - "blocked means external or runtime constraints prevent progress."
  - "awaiting_parent means the child is paused pending parent decision, clarification, context expansion, or user response."
  - "blocked and awaiting_parent remain distinct canonical runtime meanings across permissions, events, chat projection, and recovery."
validation_surfaces:
  - python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
  - python3 scripts/pm-plan-index.py validate
risk_class: blocked_awaiting_parent_state_conflation
reasoning_tier: high
context_scope: blocked_awaiting_parent_state_distinction
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/Permissions_System.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: blocked_awaiting_parent_state_distinction
  create_worknodes: false
source_lineage:
  - Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0118
preserved_exact_tokens:
  - "`blocked`"
  - "`awaiting_parent`"
  - "`These are not interchangeable.`"
negative_constraints:
  - "`blocked` and `awaiting_parent` MUST remain distinct canonical runtime meanings across permissions, events, chat projection, and recovery."
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/Permissions_System.md
  - Plans/assistant-chat-design.md
```

### CV-001 - Contracts V0 Explicit Residual Source-Token-Bank Disposition

```yaml
plan_unit_id: CV-001
unit_type: source_lineage_residual_disposition
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'CV-001 is an explicit justified source-lineage residual disposition for Contracts_V0-S0001. The span is
  a source-token bank rather than coherent canonical product prose: it preserves exact tokens, aliases, owner hints, ContractRefs,
  audit counts, stale lineage refs, and isolated vocabulary fragments. Creating new implementation-ready PlanUnits from the
  remaining S0001 material would require inferring missing relationships and would risk duplicating completed CV-002 through
  CV-278, especially the already mapped route/open compatibility material carried by CV-005.'
gui_related: true
gui_classification_reason: The residual token bank includes UICommand, route/open, GUI, blocked-flow, and user-visible runtime/auth
  projection tokens, but it is not implementation-ready product prose.
split_recommended: true
depends_on:
- CV-005
- CV-002
- CV-003
- CV-004
- CV-006
- CV-007
- CV-008
- CV-009
- CV-010
- CV-011
- CV-012
- CV-013
- CV-014
- CV-015
- CV-016
- CV-017
- CV-018
- CV-019
- CV-020
- CV-021
- CV-022
- CV-023
- CV-024
- CV-025
- CV-026
- CV-027
- CV-028
- CV-029
- CV-030
- CV-031
- CV-032
- CV-033
- CV-034
- CV-035
- CV-036
- CV-037
- CV-038
- CV-039
- CV-040
- CV-041
- CV-042
- CV-043
- CV-044
- CV-045
- CV-046
- CV-047
- CV-048
- CV-049
- CV-050
- CV-051
- CV-052
- CV-053
- CV-054
- CV-055
- CV-056
- CV-057
- CV-058
- CV-059
- CV-060
- CV-061
- CV-062
- CV-063
- CV-064
- CV-065
- CV-066
- CV-067
- CV-068
- CV-069
- CV-070
- CV-071
- CV-072
- CV-073
- CV-074
- CV-075
- CV-076
- CV-077
- CV-078
- CV-079
- CV-080
- CV-081
- CV-082
- CV-083
- CV-084
- CV-085
- CV-086
- CV-087
- CV-088
- CV-089
- CV-090
- CV-091
- CV-092
- CV-093
- CV-094
- CV-095
- CV-096
- CV-097
- CV-098
- CV-099
- CV-100
- CV-101
- CV-102
- CV-103
- CV-104
- CV-105
- CV-106
- CV-107
- CV-108
- CV-109
- CV-110
- CV-111
- CV-112
- CV-113
- CV-114
- CV-115
- CV-116
- CV-117
- CV-118
- CV-119
- CV-120
- CV-121
- CV-122
- CV-123
- CV-124
- CV-125
- CV-126
- CV-127
- CV-128
- CV-129
- CV-130
- CV-131
- CV-132
- CV-133
- CV-134
- CV-135
- CV-136
- CV-137
- CV-138
- CV-139
- CV-140
- CV-141
- CV-142
- CV-143
- CV-144
- CV-145
- CV-146
- CV-147
- CV-148
- CV-149
- CV-150
- CV-151
- CV-152
- CV-153
- CV-154
- CV-155
- CV-156
- CV-157
- CV-158
- CV-159
- CV-160
- CV-161
- CV-162
- CV-163
- CV-164
- CV-165
- CV-166
- CV-167
- CV-168
- CV-169
- CV-170
- CV-171
- CV-172
- CV-173
- CV-174
- CV-175
- CV-176
- CV-177
- CV-178
- CV-179
- CV-180
- CV-181
- CV-182
- CV-183
- CV-184
- CV-185
- CV-186
- CV-187
- CV-188
- CV-189
- CV-190
- CV-191
- CV-192
- CV-193
- CV-194
- CV-195
- CV-196
- CV-197
- CV-198
- CV-199
- CV-200
- CV-201
- CV-202
- CV-203
- CV-204
- CV-205
- CV-206
- CV-207
- CV-208
- CV-209
- CV-210
- CV-211
- CV-212
- CV-213
- CV-214
- CV-215
- CV-216
- CV-217
- CV-218
- CV-219
- CV-220
- CV-221
- CV-222
- CV-223
- CV-224
- CV-225
- CV-226
- CV-227
- CV-228
- CV-229
- CV-230
- CV-231
- CV-232
- CV-233
- CV-234
- CV-235
- CV-236
- CV-237
- CV-238
- CV-239
- CV-240
- CV-241
- CV-242
- CV-243
- CV-244
- CV-245
- CV-246
- CV-247
- CV-248
- CV-249
- CV-250
- CV-251
- CV-252
- CV-253
- CV-254
- CV-255
- CV-256
- CV-257
- CV-258
- CV-259
- CV-260
- CV-261
- CV-262
- CV-263
- CV-264
- CV-265
- CV-266
- CV-267
- CV-268
- CV-269
- CV-270
- CV-271
- CV-272
- CV-273
- CV-274
- CV-275
- CV-276
- CV-277
- CV-278
unblocks: []
acceptance_criteria:
- Contracts_V0-S0001 remains available for exact-text audit as source-token-bank material.
- Residual source-token-bank material is not converted into new PlanUnits without evidence that doing so would not infer missing
  relationships or duplicate CV-002 through CV-278.
- Contracts_V0-S0002 through S0118 remain covered by CV-002 through CV-278 or explicit structural dispositions.
- CV-001 does not override fine-grained PlanUnits CV-002 through CV-278.
- No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this disposition.
validation_surfaces:
- python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/pds-20260611-002-atomize-planunits
- python3 scripts/pm-plan-index.py validate
risk_class: justified_source_token_bank_residual
reasoning_tier: standard
context_scope: contracts_v0_residual_source
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: source_lineage_residual_disposition
  create_worknodes: false
source_lineage:
- Plans/.plan_migration/pds-20260611-002-atomize-planunits/span_map.jsonl:Contracts_V0-S0001
preserved_exact_tokens:
- Contracts V0 (Canonical)
- 'ContractRef: ContractName:Plans/Contracts_V0.md, Primitive:RouteTarget, Primitive:OpenSubject'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/DRY_Rules.md, PolicyRule:Decision_Policy.md§2'
- active_subview
- focus_thread_usage
- navigation_wrapper
- domain_action
- backing_document_id
- last_saved_path
- object_kind = blocked_episode
- focused_run_id = run_id
- object_id = blocked_sequence
- object_kind = usage_event
- project_id = <project_id>
- thread_id = <thread_id>
- focused_run_id = <run_id>
- object_id = <attempt_id>
- object_kind = scheduler_pass
- object_id = <scheduler_pass_id>
- object_id = <safe_point_id>
- object_id = <remediation_root_id>
- object_kind = graph_generation
- object_id = <graph_generation_id>
- object_kind = graph_patch
- object_id = <graph_patch_id>
- object_id = <worktree_id>
- object_id = <lane_id>
- object_kind = feature_seam
- object_id = <feature_seam_id>
- object_kind = work_package
- object_id = <work_package_id>
- object_id = <concern_id>
- object_id = <promotion_id>
- seams
- node_graph
- 7.2 WiringEntry
- handler_location
- expected_event_types
- unknown-command rejection
- workflow_refs
- docker_refs
- kubernetes_refs
- attempt_record
- wizard-blocked
- usage_record
- evidence_record
- resume_url?
- requested_platform
- effective_platform
- requested_model
- effective_model
- worker_provider
- worker_model
- verifier_provider
- verifier_model
- request_id
- request_kind = tier_boundary_approval
- PuppetMasterEvent::TierChanged
- PuppetMasterEvent::IterationStart
- PuppetMasterEvent::EvidenceStored
- GraphNode
- GraphNodeUI
- '39'
- '22'
- '61'
- '3.13'
- '3.14'
- '3.15'
- plan_or_tier_default
- MUST RECONCILE
- MUST VERIFY
- Plans/_shards/**
- pressure-summary field
- execution_unit_context
- requested_account_binding
- requested_account_policy
- operational_identity
- active
- acknowledged
- resolved
- dismissed
- resolution_kind
- accepted_risk
- working_ledger.md:L806
- working_ledger.md:L1030
- working_ledger.md:L1035-L1036
- working_ledger.md:L1283-L1290
- working_ledger.md:L1539
- working_ledger.md:L3070-L3092
- working_ledger.md:L3170-L3182
- working_ledger.md:L5990-L6015
- working_ledger.md:L6442-L6490
negative_constraints:
- Residual source-lineage disposition must not override CV-002 through CV-278 for already atomized or structurally dispositioned
  spans.
- New implementation-ready PlanUnits must not be inferred from S0001 token-list fragments without coherent source prose or
  coverage proof.
compatibility_only_notes:
- S0001 remains residual because it is a source-token bank with runtime, event, HITL, and route/open material that has been
  partially mapped but still needs exact source-token audit preservation.
- Route/open compatibility material already mapped by CV-005 remains the implementation-facing disposition for that subset
  of S0001.
stale_retired_dispositions:
- S0001 contains stale audit counts, lineage refs, and older routing/runtime vocabulary fragments retained for source-lineage
  audit only.
owner_boundary_notes:
- Contracts_V0-S0001 preserves source-lineage fragments only; canonical product behavior lives in CV-002 through CV-278 or
  referenced owner docs.
- CV-001 is an explicit residual disposition, not final implementation-ready product coverage.
owner_hints:
- Plans/Contracts_V0.md
preserved_contractrefs:
- 'ContractRef: ContractName:Plans/Contracts_V0.md, Primitive:RouteTarget, Primitive:OpenSubject'
- 'ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/DRY_Rules.md, PolicyRule:Decision_Policy.md§2'
```
