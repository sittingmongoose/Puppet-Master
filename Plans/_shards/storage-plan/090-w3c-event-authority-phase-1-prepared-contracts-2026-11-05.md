# Shard 090: W3C Event Authority phase-1 prepared contracts - 2026-11-05

Source: `Plans/storage-plan.md`

Source lines: L29479-L32481

Source SHA256: `02630d153841f966286ae69a84d2c224090e78d963c366cba61b5ad7c25d9c1a`

---

## W3C Event Authority phase-1 prepared contracts - 2026-11-05

These new per-family units are proposals prepared without admission. Existing event and storage family registries remain unchanged.


### SP-1300 - artifacts.capture_provenance.inspected storage and reader binding

```yaml
plan_unit_id: SP-1300
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'NEWLY AUTHORED Storage binding solely for `artifacts.capture_provenance.inspected@1.0.0` (TCME-1300/CV-1300).
  Prepared value rows, not registry appends, are at Plans/w3c_test_capture_event_storage_rows.json under event_type=artifacts.capture_provenance.inspected.
  The `artifacts_capture_provenance_inspected_operation` canonical operation family preserves original owner
  intent, source refs and terminal result; key `artifacts_capture_provenance_inspected_operation.v1:{storage_instance_id}:{scope_partition}:{owner_operation_id}`.
  The `artifacts_capture_provenance_inspected_checkpoint` derived filtered-reader family has key `artifacts_capture_provenance_inspected_checkpoint.v1:{storage_instance_id}:{scope_partition}:{subject_id}:{generation_id}`,
  reader `reader.artifacts.capture_provenance.inspected@1.0.0`, schema pm.storage_value.artifacts_capture_provenance_inspected_checkpoint.v1@1.0.0.
  The exact subject is the payload''s primary selection/video/command/session/segment/switch/adapter identity,
  in that order where present. Storage identity, scope partition and subject are recomputed from actual original
  sources and must equal the key and value; never trust supplied key fragments. Source rows are immutable snapshots,
  not mutable current-head references. No event, physical family or registry membership is admitted by these
  rows.


  SP-286/CV-339 strict v2 full-value custody is explicitly adopted; this family''s producer uses the existing
  full-value request/result and original first receipt, not a subset or new digest. Ordinary source advancement,
  retry and crash recovery verify original group/receipt/source joins before publication, honoring barrier-class
  flush and restore fences. Canonical operation phases are pending -> outcome_committed -> event_committed
  -> terminal, with withdrawal fencing

  any unresolved phase; a pending effect with unknown outcome remains fenced. CAS over the complete original
  row/head guards each transition. Separate media/action transactions are reconciled by original operation
  identity and genuine result evidence; there is no distributed atomicity claim.


  SP-278 is explicitly adopted. Copy its read_token definition with redb_snapshot_id removed from both properties
  and required, preserving the other nine fields unchanged in DurableGenericToken. Form the live tenth field
  only from the actual read transaction and revalidate the complete token. Filter exact event family/version,
  storage_instance_id, scope and subject over the complete CURRENT-selected verified retained EventRecord-index
  coverage; ignored nonmatching events still count toward cursor completeness. Verify actual payload/source/full-value
  receipt and present read authorization. Publish the projection and cursor in one derived redb transaction
  with predecessor CAS only after all source proof is complete. Null last_event_id/last_sequence_id means proven
  empty coverage, never missing data. A compaction translation is accepted only by semantic identity and matching
  survivor/source coverage; otherwise invalidate and rebuild from surviving canonical originals. No source
  mutation or external effect occurs on replay.


  Operation/source-result values are canonical and require coherent BRS-031 backup with SP-337 packs and original
  append custody; missing originals cannot be reconstructed from a projection. The checkpoint is derived/rebuildable,
  has no mandatory backup and uses RP-PROJECTION-3GEN: one current plus at most two staged/retired generations,
  first current-to-retired activation is the fixed terminal anchor, seven days and cleared holds/references
  before retired deletion, serialized slot reservation, and protected-full slots block replacement. Retired
  generations are not current. A valid historical original uses its authenticated write-time schema/recipe
  even after live state changes. Withdrawal invalidates this family''s reader/generation until an approved
  compatible rebuild; current writer/retry admission cannot accept projector_replay_only.


  History retention is PENDING_RETENTION_DECISION; For artifacts.capture_provenance.inspected, what lifetime,
  expiry anchor and counting scope apply to its saved history, including manual or No project captures without
  a real run: runtime/run history only when a real run exists, non-authority operational/diagnostic history,
  or lasting receipt/source-lineage authority? Card 1 G21 does not name this fact; do not apply it by analogy.
  Canonical original operation/receipt rows use RP-AUTHORITY-INDEFINITE, not an extension to raw media policy.
  Both values declare at most 16384 encoded bytes, canonical versus derived redb files and existing SP-340
  storage groups. Oversize intent, outcome, source snapshot and projection parts independently externalize
  via SP-337; unresolved or undurable refs refuse. Safe refs never carry credentials, raw media, protected-auth
  content or secret labels. Quarantine inconsistent derived values before governed rebuild, preserve canonical
  loss for recovery, and never silently recreate originals. Physical registration, migration versions and write
  admission remain unavailable until separately reviewed registration and complete retention decisions.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/artifacts_capture_provenance_inspected
  uses schema_id pm.event_payload.artifacts.capture_provenance.inspected.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/artifacts_capture_provenance_inspectedApplicationV1
  uses schema_id pm.event_payload.artifacts.capture_provenance.inspected.application.v1. Each root enforces
  its own scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Original producer preimage custody: intent is the immutable pre-effect request described by TCME-1300, not
  an event payload. Pending has null outcome_record, producer_semantics, original_event and first_append.

  On genuine outcome commitment, CAS-bind outcome_record and producer_semantics together once and enter outcome_committed.
  producer_semantics is the immutable source_ref to the complete original EventRecord caller input selected
  by Contracts_V0.md#EventRecord, formed from the actual outcome and original request only at that boundary.

  It includes every owner-selected caller field without defining a second envelope field list; neither request
  alone nor a predicted output is that preimage. Outcome_committed has no original_event or first_append yet.
  Event_committed and terminal require all four original custody values; pending cannot masquerade as completion.

  Withdrawal preserves the entire original row at its honest pending, outcome-bound or event-bound custody
  state and cannot clear an existing binding. All phases keep the exact original request and operation identity.
  External intent resolves the selected request schema, while the outcome/event resolve their separate completed
  schemas under SP-337.

  Recovery between action and outcome commitment reads genuine original action/result evidence and binds once;
  uncertain actions stay fenced. Recovery after outcome commitment appends only the frozen input; after append
  it resolves the first original receipt without a new action/event. Separate stores are reconciled under the
  original identity and CAS, never treated as a distributed transaction. Recompute and compare against actual
  owner request/source custody. original_event is null only before issuance; event_committed/terminal require
  the exact complete original EventRecord, inline through the existing schema or independently externalized
  through SP-337. Resolve_full_value.v1 verifies that full original against the strict v2 custody commitment
  before any dependent transition. Its payload, scope, producer preimage and Storage-assigned original metadata
  must all join. An absent original is unavailable; a current clock or reconstructed partial payload cannot
  replace it.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- CV-1300
- SP-278
- SP-286
- SP-337
- SP-340
- SP-343
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 remains PARTIAL until phase 2 implements per-guard oracles with the reviewed shared tools.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- artifacts.capture_provenance.inspected
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### SP-1301 - artifacts.demonstration_video.created storage and reader binding

```yaml
plan_unit_id: SP-1301
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'NEWLY AUTHORED Storage binding solely for `artifacts.demonstration_video.created@1.0.0` (TCME-1301/CV-1301).
  Prepared value rows, not registry appends, are at Plans/w3c_test_capture_event_storage_rows.json under event_type=artifacts.demonstration_video.created.
  The `artifacts_demonstration_video_created_operation` canonical operation family preserves original owner
  intent, source refs and terminal result; key `artifacts_demonstration_video_created_operation.v1:{storage_instance_id}:{scope_partition}:{owner_operation_id}`.
  The `artifacts_demonstration_video_created_checkpoint` derived filtered-reader family has key `artifacts_demonstration_video_created_checkpoint.v1:{storage_instance_id}:{scope_partition}:{subject_id}:{generation_id}`,
  reader `reader.artifacts.demonstration_video.created@1.0.0`, schema pm.storage_value.artifacts_demonstration_video_created_checkpoint.v1@1.0.0.
  The exact subject is the payload''s primary selection/video/command/session/segment/switch/adapter identity,
  in that order where present. Storage identity, scope partition and subject are recomputed from actual original
  sources and must equal the key and value; never trust supplied key fragments. Source rows are immutable snapshots,
  not mutable current-head references. No event, physical family or registry membership is admitted by these
  rows.


  SP-286/CV-339 strict v2 full-value custody is explicitly adopted; this family''s producer uses the existing
  full-value request/result and original first receipt, not a subset or new digest. Ordinary source advancement,
  retry and crash recovery verify original group/receipt/source joins before publication, honoring barrier-class
  flush and restore fences. Canonical operation phases are pending -> outcome_committed -> event_committed
  -> terminal, with withdrawal fencing

  any unresolved phase; a pending effect with unknown outcome remains fenced. CAS over the complete original
  row/head guards each transition. Separate media/action transactions are reconciled by original operation
  identity and genuine result evidence; there is no distributed atomicity claim.


  SP-278 is explicitly adopted. Copy its read_token definition with redb_snapshot_id removed from both properties
  and required, preserving the other nine fields unchanged in DurableGenericToken. Form the live tenth field
  only from the actual read transaction and revalidate the complete token. Filter exact event family/version,
  storage_instance_id, scope and subject over the complete CURRENT-selected verified retained EventRecord-index
  coverage; ignored nonmatching events still count toward cursor completeness. Verify actual payload/source/full-value
  receipt and present read authorization. Publish the projection and cursor in one derived redb transaction
  with predecessor CAS only after all source proof is complete. Null last_event_id/last_sequence_id means proven
  empty coverage, never missing data. A compaction translation is accepted only by semantic identity and matching
  survivor/source coverage; otherwise invalidate and rebuild from surviving canonical originals. No source
  mutation or external effect occurs on replay.


  Operation/source-result values are canonical and require coherent BRS-031 backup with SP-337 packs and original
  append custody; missing originals cannot be reconstructed from a projection. The checkpoint is derived/rebuildable,
  has no mandatory backup and uses RP-PROJECTION-3GEN: one current plus at most two staged/retired generations,
  first current-to-retired activation is the fixed terminal anchor, seven days and cleared holds/references
  before retired deletion, serialized slot reservation, and protected-full slots block replacement. Retired
  generations are not current. A valid historical original uses its authenticated write-time schema/recipe
  even after live state changes. Withdrawal invalidates this family''s reader/generation until an approved
  compatible rebuild; current writer/retry admission cannot accept projector_replay_only.


  History retention is RP-AUTHORITY-INDEFINITE; Storage Case L-3 approval/receipt/source-lineage authority
  decides this exact ref-only saved fact. Canonical original operation/receipt rows use RP-AUTHORITY-INDEFINITE,
  not an extension to raw media policy. Both values declare at most 16384 encoded bytes, canonical versus derived
  redb files and existing SP-340 storage groups. Oversize intent, outcome, source snapshot and projection parts
  independently externalize via SP-337; unresolved or undurable refs refuse. Safe refs never carry credentials,
  raw media, protected-auth content or secret labels. Quarantine inconsistent derived values before governed
  rebuild, preserve canonical loss for recovery, and never silently recreate originals. Physical registration,
  migration versions and write admission remain unavailable until separately reviewed registration and complete
  retention decisions.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/artifacts_demonstration_video_created
  uses schema_id pm.event_payload.artifacts.demonstration_video.created.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/artifacts_demonstration_video_createdApplicationV1
  uses schema_id pm.event_payload.artifacts.demonstration_video.created.application.v1. Each root enforces
  its own scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Original producer preimage custody: intent is the immutable pre-effect request described by TCME-1301, not
  an event payload. Pending has null outcome_record, producer_semantics, original_event and first_append.

  On genuine outcome commitment, CAS-bind outcome_record and producer_semantics together once and enter outcome_committed.
  producer_semantics is the immutable source_ref to the complete original EventRecord caller input selected
  by Contracts_V0.md#EventRecord, formed from the actual outcome and original request only at that boundary.

  It includes every owner-selected caller field without defining a second envelope field list; neither request
  alone nor a predicted output is that preimage. Outcome_committed has no original_event or first_append yet.
  Event_committed and terminal require all four original custody values; pending cannot masquerade as completion.

  Withdrawal preserves the entire original row at its honest pending, outcome-bound or event-bound custody
  state and cannot clear an existing binding. All phases keep the exact original request and operation identity.
  External intent resolves the selected request schema, while the outcome/event resolve their separate completed
  schemas under SP-337.

  Recovery between action and outcome commitment reads genuine original action/result evidence and binds once;
  uncertain actions stay fenced. Recovery after outcome commitment appends only the frozen input; after append
  it resolves the first original receipt without a new action/event. Separate stores are reconciled under the
  original identity and CAS, never treated as a distributed transaction. Recompute and compare against actual
  owner request/source custody. original_event is null only before issuance; event_committed/terminal require
  the exact complete original EventRecord, inline through the existing schema or independently externalized
  through SP-337. Resolve_full_value.v1 verifies that full original against the strict v2 custody commitment
  before any dependent transition. Its payload, scope, producer preimage and Storage-assigned original metadata
  must all join. An absent original is unavailable; a current clock or reconstructed partial payload cannot
  replace it.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- CV-1301
- SP-278
- SP-286
- SP-337
- SP-340
- SP-343
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 remains PARTIAL until phase 2 implements per-guard oracles with the reviewed shared tools.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- artifacts.demonstration_video.created
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### SP-1302 - artifacts.demonstration_video.failed storage and reader binding

```yaml
plan_unit_id: SP-1302
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'NEWLY AUTHORED Storage binding solely for `artifacts.demonstration_video.failed@1.0.0` (TCME-1302/CV-1302).
  Prepared value rows, not registry appends, are at Plans/w3c_test_capture_event_storage_rows.json under event_type=artifacts.demonstration_video.failed.
  The `artifacts_demonstration_video_failed_operation` canonical operation family preserves original owner
  intent, source refs and terminal result; key `artifacts_demonstration_video_failed_operation.v1:{storage_instance_id}:{scope_partition}:{owner_operation_id}`.
  The `artifacts_demonstration_video_failed_checkpoint` derived filtered-reader family has key `artifacts_demonstration_video_failed_checkpoint.v1:{storage_instance_id}:{scope_partition}:{subject_id}:{generation_id}`,
  reader `reader.artifacts.demonstration_video.failed@1.0.0`, schema pm.storage_value.artifacts_demonstration_video_failed_checkpoint.v1@1.0.0.
  The exact subject is the payload''s primary selection/video/command/session/segment/switch/adapter identity,
  in that order where present. Storage identity, scope partition and subject are recomputed from actual original
  sources and must equal the key and value; never trust supplied key fragments. Source rows are immutable snapshots,
  not mutable current-head references. No event, physical family or registry membership is admitted by these
  rows.


  SP-286/CV-339 strict v2 full-value custody is explicitly adopted; this family''s producer uses the existing
  full-value request/result and original first receipt, not a subset or new digest. Ordinary source advancement,
  retry and crash recovery verify original group/receipt/source joins before publication, honoring barrier-class
  flush and restore fences. Canonical operation phases are pending -> outcome_committed -> event_committed
  -> terminal, with withdrawal fencing

  any unresolved phase; a pending effect with unknown outcome remains fenced. CAS over the complete original
  row/head guards each transition. Separate media/action transactions are reconciled by original operation
  identity and genuine result evidence; there is no distributed atomicity claim.


  SP-278 is explicitly adopted. Copy its read_token definition with redb_snapshot_id removed from both properties
  and required, preserving the other nine fields unchanged in DurableGenericToken. Form the live tenth field
  only from the actual read transaction and revalidate the complete token. Filter exact event family/version,
  storage_instance_id, scope and subject over the complete CURRENT-selected verified retained EventRecord-index
  coverage; ignored nonmatching events still count toward cursor completeness. Verify actual payload/source/full-value
  receipt and present read authorization. Publish the projection and cursor in one derived redb transaction
  with predecessor CAS only after all source proof is complete. Null last_event_id/last_sequence_id means proven
  empty coverage, never missing data. A compaction translation is accepted only by semantic identity and matching
  survivor/source coverage; otherwise invalidate and rebuild from surviving canonical originals. No source
  mutation or external effect occurs on replay.


  Operation/source-result values are canonical and require coherent BRS-031 backup with SP-337 packs and original
  append custody; missing originals cannot be reconstructed from a projection. The checkpoint is derived/rebuildable,
  has no mandatory backup and uses RP-PROJECTION-3GEN: one current plus at most two staged/retired generations,
  first current-to-retired activation is the fixed terminal anchor, seven days and cleared holds/references
  before retired deletion, serialized slot reservation, and protected-full slots block replacement. Retired
  generations are not current. A valid historical original uses its authenticated write-time schema/recipe
  even after live state changes. Withdrawal invalidates this family''s reader/generation until an approved
  compatible rebuild; current writer/retry admission cannot accept projector_replay_only.


  History retention is PENDING_RETENTION_DECISION; For artifacts.demonstration_video.failed, what lifetime,
  expiry anchor and counting scope apply to its saved history, including manual or No project captures without
  a real run: runtime/run history only when a real run exists, non-authority operational/diagnostic history,
  or lasting receipt/source-lineage authority? Card 1 G21 does not name this fact; do not apply it by analogy.
  Canonical original operation/receipt rows use RP-AUTHORITY-INDEFINITE, not an extension to raw media policy.
  Both values declare at most 16384 encoded bytes, canonical versus derived redb files and existing SP-340
  storage groups. Oversize intent, outcome, source snapshot and projection parts independently externalize
  via SP-337; unresolved or undurable refs refuse. Safe refs never carry credentials, raw media, protected-auth
  content or secret labels. Quarantine inconsistent derived values before governed rebuild, preserve canonical
  loss for recovery, and never silently recreate originals. Physical registration, migration versions and write
  admission remain unavailable until separately reviewed registration and complete retention decisions.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/artifacts_demonstration_video_failed
  uses schema_id pm.event_payload.artifacts.demonstration_video.failed.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/artifacts_demonstration_video_failedApplicationV1
  uses schema_id pm.event_payload.artifacts.demonstration_video.failed.application.v1. Each root enforces its
  own scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Original producer preimage custody: intent is the immutable pre-effect request described by TCME-1302, not
  an event payload. Pending has null outcome_record, producer_semantics, original_event and first_append.

  On genuine outcome commitment, CAS-bind outcome_record and producer_semantics together once and enter outcome_committed.
  producer_semantics is the immutable source_ref to the complete original EventRecord caller input selected
  by Contracts_V0.md#EventRecord, formed from the actual outcome and original request only at that boundary.

  It includes every owner-selected caller field without defining a second envelope field list; neither request
  alone nor a predicted output is that preimage. Outcome_committed has no original_event or first_append yet.
  Event_committed and terminal require all four original custody values; pending cannot masquerade as completion.

  Withdrawal preserves the entire original row at its honest pending, outcome-bound or event-bound custody
  state and cannot clear an existing binding. All phases keep the exact original request and operation identity.
  External intent resolves the selected request schema, while the outcome/event resolve their separate completed
  schemas under SP-337.

  Recovery between action and outcome commitment reads genuine original action/result evidence and binds once;
  uncertain actions stay fenced. Recovery after outcome commitment appends only the frozen input; after append
  it resolves the first original receipt without a new action/event. Separate stores are reconciled under the
  original identity and CAS, never treated as a distributed transaction. Recompute and compare against actual
  owner request/source custody. original_event is null only before issuance; event_committed/terminal require
  the exact complete original EventRecord, inline through the existing schema or independently externalized
  through SP-337. Resolve_full_value.v1 verifies that full original against the strict v2 custody commitment
  before any dependent transition. Its payload, scope, producer preimage and Storage-assigned original metadata
  must all join. An absent original is unavailable; a current clock or reconstructed partial payload cannot
  replace it.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- CV-1302
- SP-278
- SP-286
- SP-337
- SP-340
- SP-343
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 remains PARTIAL until phase 2 implements per-guard oracles with the reviewed shared tools.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- artifacts.demonstration_video.failed
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### SP-1303 - testing.capture.bookmarked storage and reader binding

```yaml
plan_unit_id: SP-1303
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'NEWLY AUTHORED Storage binding solely for `testing.capture.bookmarked@1.0.0` (TCME-1303/CV-1303).
  Prepared value rows, not registry appends, are at Plans/w3c_test_capture_event_storage_rows.json under event_type=testing.capture.bookmarked.
  The `testing_capture_bookmarked_operation` canonical operation family preserves original owner intent, source
  refs and terminal result; key `testing_capture_bookmarked_operation.v1:{storage_instance_id}:{scope_partition}:{owner_operation_id}`.
  The `testing_capture_bookmarked_checkpoint` derived filtered-reader family has key `testing_capture_bookmarked_checkpoint.v1:{storage_instance_id}:{scope_partition}:{subject_id}:{generation_id}`,
  reader `reader.testing.capture.bookmarked@1.0.0`, schema pm.storage_value.testing_capture_bookmarked_checkpoint.v1@1.0.0.
  The exact subject is the payload''s primary selection/video/command/session/segment/switch/adapter identity,
  in that order where present. Storage identity, scope partition and subject are recomputed from actual original
  sources and must equal the key and value; never trust supplied key fragments. Source rows are immutable snapshots,
  not mutable current-head references. No event, physical family or registry membership is admitted by these
  rows.


  SP-286/CV-339 strict v2 full-value custody is explicitly adopted; this family''s producer uses the existing
  full-value request/result and original first receipt, not a subset or new digest. Ordinary source advancement,
  retry and crash recovery verify original group/receipt/source joins before publication, honoring barrier-class
  flush and restore fences. Canonical operation phases are pending -> outcome_committed -> event_committed
  -> terminal, with withdrawal fencing

  any unresolved phase; a pending effect with unknown outcome remains fenced. CAS over the complete original
  row/head guards each transition. Separate media/action transactions are reconciled by original operation
  identity and genuine result evidence; there is no distributed atomicity claim.


  SP-278 is explicitly adopted. Copy its read_token definition with redb_snapshot_id removed from both properties
  and required, preserving the other nine fields unchanged in DurableGenericToken. Form the live tenth field
  only from the actual read transaction and revalidate the complete token. Filter exact event family/version,
  storage_instance_id, scope and subject over the complete CURRENT-selected verified retained EventRecord-index
  coverage; ignored nonmatching events still count toward cursor completeness. Verify actual payload/source/full-value
  receipt and present read authorization. Publish the projection and cursor in one derived redb transaction
  with predecessor CAS only after all source proof is complete. Null last_event_id/last_sequence_id means proven
  empty coverage, never missing data. A compaction translation is accepted only by semantic identity and matching
  survivor/source coverage; otherwise invalidate and rebuild from surviving canonical originals. No source
  mutation or external effect occurs on replay.


  Operation/source-result values are canonical and require coherent BRS-031 backup with SP-337 packs and original
  append custody; missing originals cannot be reconstructed from a projection. The checkpoint is derived/rebuildable,
  has no mandatory backup and uses RP-PROJECTION-3GEN: one current plus at most two staged/retired generations,
  first current-to-retired activation is the fixed terminal anchor, seven days and cleared holds/references
  before retired deletion, serialized slot reservation, and protected-full slots block replacement. Retired
  generations are not current. A valid historical original uses its authenticated write-time schema/recipe
  even after live state changes. Withdrawal invalidates this family''s reader/generation until an approved
  compatible rebuild; current writer/retry admission cannot accept projector_replay_only.


  History retention is PENDING_RETENTION_DECISION; For testing.capture.bookmarked, what lifetime, expiry anchor
  and counting scope apply to its saved history, including manual or No project captures without a real run:
  runtime/run history only when a real run exists, non-authority operational/diagnostic history, or lasting
  receipt/source-lineage authority? Card 1 G13 does not name this fact; do not apply it by analogy. Canonical
  original operation/receipt rows use RP-AUTHORITY-INDEFINITE, not an extension to raw media policy. Both values
  declare at most 16384 encoded bytes, canonical versus derived redb files and existing SP-340 storage groups.
  Oversize intent, outcome, source snapshot and projection parts independently externalize via SP-337; unresolved
  or undurable refs refuse. Safe refs never carry credentials, raw media, protected-auth content or secret
  labels. Quarantine inconsistent derived values before governed rebuild, preserve canonical loss for recovery,
  and never silently recreate originals. Physical registration, migration versions and write admission remain
  unavailable until separately reviewed registration and complete retention decisions.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_bookmarked
  uses schema_id pm.event_payload.testing.capture.bookmarked.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_bookmarkedApplicationV1
  uses schema_id pm.event_payload.testing.capture.bookmarked.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage
  rows list both editions; no Project resource is nulled or rewritten.


  Original producer preimage custody: intent is the immutable pre-effect request described by TCME-1303, not
  an event payload. Pending has null outcome_record, producer_semantics, original_event and first_append.

  On genuine outcome commitment, CAS-bind outcome_record and producer_semantics together once and enter outcome_committed.
  producer_semantics is the immutable source_ref to the complete original EventRecord caller input selected
  by Contracts_V0.md#EventRecord, formed from the actual outcome and original request only at that boundary.

  It includes every owner-selected caller field without defining a second envelope field list; neither request
  alone nor a predicted output is that preimage. Outcome_committed has no original_event or first_append yet.
  Event_committed and terminal require all four original custody values; pending cannot masquerade as completion.

  Withdrawal preserves the entire original row at its honest pending, outcome-bound or event-bound custody
  state and cannot clear an existing binding. All phases keep the exact original request and operation identity.
  External intent resolves the selected request schema, while the outcome/event resolve their separate completed
  schemas under SP-337.

  Recovery between action and outcome commitment reads genuine original action/result evidence and binds once;
  uncertain actions stay fenced. Recovery after outcome commitment appends only the frozen input; after append
  it resolves the first original receipt without a new action/event. Separate stores are reconciled under the
  original identity and CAS, never treated as a distributed transaction. Recompute and compare against actual
  owner request/source custody. original_event is null only before issuance; event_committed/terminal require
  the exact complete original EventRecord, inline through the existing schema or independently externalized
  through SP-337. Resolve_full_value.v1 verifies that full original against the strict v2 custody commitment
  before any dependent transition. Its payload, scope, producer preimage and Storage-assigned original metadata
  must all join. An absent original is unavailable; a current clock or reconstructed partial payload cannot
  replace it.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- CV-1303
- SP-278
- SP-286
- SP-337
- SP-340
- SP-343
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 remains PARTIAL until phase 2 implements per-guard oracles with the reviewed shared tools.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.bookmarked
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### SP-1304 - testing.capture.clip_saved storage and reader binding

```yaml
plan_unit_id: SP-1304
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'NEWLY AUTHORED Storage binding solely for `testing.capture.clip_saved@1.0.0` (TCME-1304/CV-1304).
  Prepared value rows, not registry appends, are at Plans/w3c_test_capture_event_storage_rows.json under event_type=testing.capture.clip_saved.
  The `testing_capture_clip_saved_operation` canonical operation family preserves original owner intent, source
  refs and terminal result; key `testing_capture_clip_saved_operation.v1:{storage_instance_id}:{scope_partition}:{owner_operation_id}`.
  The `testing_capture_clip_saved_checkpoint` derived filtered-reader family has key `testing_capture_clip_saved_checkpoint.v1:{storage_instance_id}:{scope_partition}:{subject_id}:{generation_id}`,
  reader `reader.testing.capture.clip_saved@1.0.0`, schema pm.storage_value.testing_capture_clip_saved_checkpoint.v1@1.0.0.
  The exact subject is the payload''s primary selection/video/command/session/segment/switch/adapter identity,
  in that order where present. Storage identity, scope partition and subject are recomputed from actual original
  sources and must equal the key and value; never trust supplied key fragments. Source rows are immutable snapshots,
  not mutable current-head references. No event, physical family or registry membership is admitted by these
  rows.


  SP-286/CV-339 strict v2 full-value custody is explicitly adopted; this family''s producer uses the existing
  full-value request/result and original first receipt, not a subset or new digest. Ordinary source advancement,
  retry and crash recovery verify original group/receipt/source joins before publication, honoring barrier-class
  flush and restore fences. Canonical operation phases are pending -> outcome_committed -> event_committed
  -> terminal, with withdrawal fencing

  any unresolved phase; a pending effect with unknown outcome remains fenced. CAS over the complete original
  row/head guards each transition. Separate media/action transactions are reconciled by original operation
  identity and genuine result evidence; there is no distributed atomicity claim.


  SP-278 is explicitly adopted. Copy its read_token definition with redb_snapshot_id removed from both properties
  and required, preserving the other nine fields unchanged in DurableGenericToken. Form the live tenth field
  only from the actual read transaction and revalidate the complete token. Filter exact event family/version,
  storage_instance_id, scope and subject over the complete CURRENT-selected verified retained EventRecord-index
  coverage; ignored nonmatching events still count toward cursor completeness. Verify actual payload/source/full-value
  receipt and present read authorization. Publish the projection and cursor in one derived redb transaction
  with predecessor CAS only after all source proof is complete. Null last_event_id/last_sequence_id means proven
  empty coverage, never missing data. A compaction translation is accepted only by semantic identity and matching
  survivor/source coverage; otherwise invalidate and rebuild from surviving canonical originals. No source
  mutation or external effect occurs on replay.


  Operation/source-result values are canonical and require coherent BRS-031 backup with SP-337 packs and original
  append custody; missing originals cannot be reconstructed from a projection. The checkpoint is derived/rebuildable,
  has no mandatory backup and uses RP-PROJECTION-3GEN: one current plus at most two staged/retired generations,
  first current-to-retired activation is the fixed terminal anchor, seven days and cleared holds/references
  before retired deletion, serialized slot reservation, and protected-full slots block replacement. Retired
  generations are not current. A valid historical original uses its authenticated write-time schema/recipe
  even after live state changes. Withdrawal invalidates this family''s reader/generation until an approved
  compatible rebuild; current writer/retry admission cannot accept projector_replay_only.


  History retention is RP-AUTHORITY-INDEFINITE; Storage Case L-3 approval/receipt/source-lineage authority
  decides this exact ref-only saved fact. Canonical original operation/receipt rows use RP-AUTHORITY-INDEFINITE,
  not an extension to raw media policy. Both values declare at most 16384 encoded bytes, canonical versus derived
  redb files and existing SP-340 storage groups. Oversize intent, outcome, source snapshot and projection parts
  independently externalize via SP-337; unresolved or undurable refs refuse. Safe refs never carry credentials,
  raw media, protected-auth content or secret labels. Quarantine inconsistent derived values before governed
  rebuild, preserve canonical loss for recovery, and never silently recreate originals. Physical registration,
  migration versions and write admission remain unavailable until separately reviewed registration and complete
  retention decisions.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_clip_saved
  uses schema_id pm.event_payload.testing.capture.clip_saved.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_clip_savedApplicationV1
  uses schema_id pm.event_payload.testing.capture.clip_saved.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage
  rows list both editions; no Project resource is nulled or rewritten.


  Original producer preimage custody: intent is the immutable pre-effect request described by TCME-1304, not
  an event payload. Pending has null outcome_record, producer_semantics, original_event and first_append.

  On genuine outcome commitment, CAS-bind outcome_record and producer_semantics together once and enter outcome_committed.
  producer_semantics is the immutable source_ref to the complete original EventRecord caller input selected
  by Contracts_V0.md#EventRecord, formed from the actual outcome and original request only at that boundary.

  It includes every owner-selected caller field without defining a second envelope field list; neither request
  alone nor a predicted output is that preimage. Outcome_committed has no original_event or first_append yet.
  Event_committed and terminal require all four original custody values; pending cannot masquerade as completion.

  Withdrawal preserves the entire original row at its honest pending, outcome-bound or event-bound custody
  state and cannot clear an existing binding. All phases keep the exact original request and operation identity.
  External intent resolves the selected request schema, while the outcome/event resolve their separate completed
  schemas under SP-337.

  Recovery between action and outcome commitment reads genuine original action/result evidence and binds once;
  uncertain actions stay fenced. Recovery after outcome commitment appends only the frozen input; after append
  it resolves the first original receipt without a new action/event. Separate stores are reconciled under the
  original identity and CAS, never treated as a distributed transaction. Recompute and compare against actual
  owner request/source custody. original_event is null only before issuance; event_committed/terminal require
  the exact complete original EventRecord, inline through the existing schema or independently externalized
  through SP-337. Resolve_full_value.v1 verifies that full original against the strict v2 custody commitment
  before any dependent transition. Its payload, scope, producer preimage and Storage-assigned original metadata
  must all join. An absent original is unavailable; a current clock or reconstructed partial payload cannot
  replace it.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- CV-1304
- SP-278
- SP-286
- SP-337
- SP-340
- SP-343
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 remains PARTIAL until phase 2 implements per-guard oracles with the reviewed shared tools.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.clip_saved
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### SP-1305 - testing.capture.effective_quality_changed storage and reader binding

```yaml
plan_unit_id: SP-1305
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'NEWLY AUTHORED Storage binding solely for `testing.capture.effective_quality_changed@1.0.0`
  (TCME-1305/CV-1305). Prepared value rows, not registry appends, are at Plans/w3c_test_capture_event_storage_rows.json
  under event_type=testing.capture.effective_quality_changed. The `testing_capture_effective_quality_changed_operation`
  canonical operation family preserves original owner intent, source refs and terminal result; key `testing_capture_effective_quality_changed_operation.v1:{storage_instance_id}:{scope_partition}:{owner_operation_id}`.
  The `testing_capture_effective_quality_changed_checkpoint` derived filtered-reader family has key `testing_capture_effective_quality_changed_checkpoint.v1:{storage_instance_id}:{scope_partition}:{subject_id}:{generation_id}`,
  reader `reader.testing.capture.effective_quality_changed@1.0.0`, schema pm.storage_value.testing_capture_effective_quality_changed_checkpoint.v1@1.0.0.
  The exact subject is the payload''s primary selection/video/command/session/segment/switch/adapter identity,
  in that order where present. Storage identity, scope partition and subject are recomputed from actual original
  sources and must equal the key and value; never trust supplied key fragments. Source rows are immutable snapshots,
  not mutable current-head references. No event, physical family or registry membership is admitted by these
  rows.


  SP-286/CV-339 strict v2 full-value custody is explicitly adopted; this family''s producer uses the existing
  full-value request/result and original first receipt, not a subset or new digest. Ordinary source advancement,
  retry and crash recovery verify original group/receipt/source joins before publication, honoring barrier-class
  flush and restore fences. Canonical operation phases are pending -> outcome_committed -> event_committed
  -> terminal, with withdrawal fencing

  any unresolved phase; a pending effect with unknown outcome remains fenced. CAS over the complete original
  row/head guards each transition. Separate media/action transactions are reconciled by original operation
  identity and genuine result evidence; there is no distributed atomicity claim.


  SP-278 is explicitly adopted. Copy its read_token definition with redb_snapshot_id removed from both properties
  and required, preserving the other nine fields unchanged in DurableGenericToken. Form the live tenth field
  only from the actual read transaction and revalidate the complete token. Filter exact event family/version,
  storage_instance_id, scope and subject over the complete CURRENT-selected verified retained EventRecord-index
  coverage; ignored nonmatching events still count toward cursor completeness. Verify actual payload/source/full-value
  receipt and present read authorization. Publish the projection and cursor in one derived redb transaction
  with predecessor CAS only after all source proof is complete. Null last_event_id/last_sequence_id means proven
  empty coverage, never missing data. A compaction translation is accepted only by semantic identity and matching
  survivor/source coverage; otherwise invalidate and rebuild from surviving canonical originals. No source
  mutation or external effect occurs on replay.


  Operation/source-result values are canonical and require coherent BRS-031 backup with SP-337 packs and original
  append custody; missing originals cannot be reconstructed from a projection. The checkpoint is derived/rebuildable,
  has no mandatory backup and uses RP-PROJECTION-3GEN: one current plus at most two staged/retired generations,
  first current-to-retired activation is the fixed terminal anchor, seven days and cleared holds/references
  before retired deletion, serialized slot reservation, and protected-full slots block replacement. Retired
  generations are not current. A valid historical original uses its authenticated write-time schema/recipe
  even after live state changes. Withdrawal invalidates this family''s reader/generation until an approved
  compatible rebuild; current writer/retry admission cannot accept projector_replay_only.


  History retention is PENDING_RETENTION_DECISION; For testing.capture.effective_quality_changed, what lifetime,
  expiry anchor and counting scope apply to its saved history, including manual or No project captures without
  a real run: runtime/run history only when a real run exists, non-authority operational/diagnostic history,
  or lasting receipt/source-lineage authority? Card 1 G13 does not name this fact; do not apply it by analogy.
  Canonical original operation/receipt rows use RP-AUTHORITY-INDEFINITE, not an extension to raw media policy.
  Both values declare at most 16384 encoded bytes, canonical versus derived redb files and existing SP-340
  storage groups. Oversize intent, outcome, source snapshot and projection parts independently externalize
  via SP-337; unresolved or undurable refs refuse. Safe refs never carry credentials, raw media, protected-auth
  content or secret labels. Quarantine inconsistent derived values before governed rebuild, preserve canonical
  loss for recovery, and never silently recreate originals. Physical registration, migration versions and write
  admission remain unavailable until separately reviewed registration and complete retention decisions.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_effective_quality_changed
  uses schema_id pm.event_payload.testing.capture.effective_quality_changed.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_effective_quality_changedApplicationV1
  uses schema_id pm.event_payload.testing.capture.effective_quality_changed.application.v1. Each root enforces
  its own scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Original producer preimage custody: intent is the immutable pre-effect request described by TCME-1305, not
  an event payload. Pending has null outcome_record, producer_semantics, original_event and first_append.

  On genuine outcome commitment, CAS-bind outcome_record and producer_semantics together once and enter outcome_committed.
  producer_semantics is the immutable source_ref to the complete original EventRecord caller input selected
  by Contracts_V0.md#EventRecord, formed from the actual outcome and original request only at that boundary.

  It includes every owner-selected caller field without defining a second envelope field list; neither request
  alone nor a predicted output is that preimage. Outcome_committed has no original_event or first_append yet.
  Event_committed and terminal require all four original custody values; pending cannot masquerade as completion.

  Withdrawal preserves the entire original row at its honest pending, outcome-bound or event-bound custody
  state and cannot clear an existing binding. All phases keep the exact original request and operation identity.
  External intent resolves the selected request schema, while the outcome/event resolve their separate completed
  schemas under SP-337.

  Recovery between action and outcome commitment reads genuine original action/result evidence and binds once;
  uncertain actions stay fenced. Recovery after outcome commitment appends only the frozen input; after append
  it resolves the first original receipt without a new action/event. Separate stores are reconciled under the
  original identity and CAS, never treated as a distributed transaction. Recompute and compare against actual
  owner request/source custody. original_event is null only before issuance; event_committed/terminal require
  the exact complete original EventRecord, inline through the existing schema or independently externalized
  through SP-337. Resolve_full_value.v1 verifies that full original against the strict v2 custody commitment
  before any dependent transition. Its payload, scope, producer preimage and Storage-assigned original metadata
  must all join. An absent original is unavailable; a current clock or reconstructed partial payload cannot
  replace it.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- CV-1305
- SP-278
- SP-286
- SP-337
- SP-340
- SP-343
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 remains PARTIAL until phase 2 implements per-guard oracles with the reviewed shared tools.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.effective_quality_changed
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### SP-1306 - testing.capture.health_degraded storage and reader binding

```yaml
plan_unit_id: SP-1306
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'NEWLY AUTHORED Storage binding solely for `testing.capture.health_degraded@1.0.0` (TCME-1306/CV-1306).
  Prepared value rows, not registry appends, are at Plans/w3c_test_capture_event_storage_rows.json under event_type=testing.capture.health_degraded.
  The `testing_capture_health_degraded_operation` canonical operation family preserves original owner intent,
  source refs and terminal result; key `testing_capture_health_degraded_operation.v1:{storage_instance_id}:{scope_partition}:{owner_operation_id}`.
  The `testing_capture_health_degraded_checkpoint` derived filtered-reader family has key `testing_capture_health_degraded_checkpoint.v1:{storage_instance_id}:{scope_partition}:{subject_id}:{generation_id}`,
  reader `reader.testing.capture.health_degraded@1.0.0`, schema pm.storage_value.testing_capture_health_degraded_checkpoint.v1@1.0.0.
  The exact subject is the payload''s primary selection/video/command/session/segment/switch/adapter identity,
  in that order where present. Storage identity, scope partition and subject are recomputed from actual original
  sources and must equal the key and value; never trust supplied key fragments. Source rows are immutable snapshots,
  not mutable current-head references. No event, physical family or registry membership is admitted by these
  rows.


  SP-286/CV-339 strict v2 full-value custody is explicitly adopted; this family''s producer uses the existing
  full-value request/result and original first receipt, not a subset or new digest. Ordinary source advancement,
  retry and crash recovery verify original group/receipt/source joins before publication, honoring barrier-class
  flush and restore fences. Canonical operation phases are pending -> outcome_committed -> event_committed
  -> terminal, with withdrawal fencing

  any unresolved phase; a pending effect with unknown outcome remains fenced. CAS over the complete original
  row/head guards each transition. Separate media/action transactions are reconciled by original operation
  identity and genuine result evidence; there is no distributed atomicity claim.


  SP-278 is explicitly adopted. Copy its read_token definition with redb_snapshot_id removed from both properties
  and required, preserving the other nine fields unchanged in DurableGenericToken. Form the live tenth field
  only from the actual read transaction and revalidate the complete token. Filter exact event family/version,
  storage_instance_id, scope and subject over the complete CURRENT-selected verified retained EventRecord-index
  coverage; ignored nonmatching events still count toward cursor completeness. Verify actual payload/source/full-value
  receipt and present read authorization. Publish the projection and cursor in one derived redb transaction
  with predecessor CAS only after all source proof is complete. Null last_event_id/last_sequence_id means proven
  empty coverage, never missing data. A compaction translation is accepted only by semantic identity and matching
  survivor/source coverage; otherwise invalidate and rebuild from surviving canonical originals. No source
  mutation or external effect occurs on replay.


  Operation/source-result values are canonical and require coherent BRS-031 backup with SP-337 packs and original
  append custody; missing originals cannot be reconstructed from a projection. The checkpoint is derived/rebuildable,
  has no mandatory backup and uses RP-PROJECTION-3GEN: one current plus at most two staged/retired generations,
  first current-to-retired activation is the fixed terminal anchor, seven days and cleared holds/references
  before retired deletion, serialized slot reservation, and protected-full slots block replacement. Retired
  generations are not current. A valid historical original uses its authenticated write-time schema/recipe
  even after live state changes. Withdrawal invalidates this family''s reader/generation until an approved
  compatible rebuild; current writer/retry admission cannot accept projector_replay_only.


  History retention is PENDING_RETENTION_DECISION; For testing.capture.health_degraded, what lifetime, expiry
  anchor and counting scope apply to its saved history, including manual or No project captures without a real
  run: runtime/run history only when a real run exists, non-authority operational/diagnostic history, or lasting
  receipt/source-lineage authority? Card 1 G13 does not name this fact; do not apply it by analogy. Canonical
  original operation/receipt rows use RP-AUTHORITY-INDEFINITE, not an extension to raw media policy. Both values
  declare at most 16384 encoded bytes, canonical versus derived redb files and existing SP-340 storage groups.
  Oversize intent, outcome, source snapshot and projection parts independently externalize via SP-337; unresolved
  or undurable refs refuse. Safe refs never carry credentials, raw media, protected-auth content or secret
  labels. Quarantine inconsistent derived values before governed rebuild, preserve canonical loss for recovery,
  and never silently recreate originals. Physical registration, migration versions and write admission remain
  unavailable until separately reviewed registration and complete retention decisions.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_health_degraded
  uses schema_id pm.event_payload.testing.capture.health_degraded.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_health_degradedApplicationV1
  uses schema_id pm.event_payload.testing.capture.health_degraded.application.v1. Each root enforces its own
  scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Original producer preimage custody: intent is the immutable pre-effect request described by TCME-1306, not
  an event payload. Pending has null outcome_record, producer_semantics, original_event and first_append.

  On genuine outcome commitment, CAS-bind outcome_record and producer_semantics together once and enter outcome_committed.
  producer_semantics is the immutable source_ref to the complete original EventRecord caller input selected
  by Contracts_V0.md#EventRecord, formed from the actual outcome and original request only at that boundary.

  It includes every owner-selected caller field without defining a second envelope field list; neither request
  alone nor a predicted output is that preimage. Outcome_committed has no original_event or first_append yet.
  Event_committed and terminal require all four original custody values; pending cannot masquerade as completion.

  Withdrawal preserves the entire original row at its honest pending, outcome-bound or event-bound custody
  state and cannot clear an existing binding. All phases keep the exact original request and operation identity.
  External intent resolves the selected request schema, while the outcome/event resolve their separate completed
  schemas under SP-337.

  Recovery between action and outcome commitment reads genuine original action/result evidence and binds once;
  uncertain actions stay fenced. Recovery after outcome commitment appends only the frozen input; after append
  it resolves the first original receipt without a new action/event. Separate stores are reconciled under the
  original identity and CAS, never treated as a distributed transaction. Recompute and compare against actual
  owner request/source custody. original_event is null only before issuance; event_committed/terminal require
  the exact complete original EventRecord, inline through the existing schema or independently externalized
  through SP-337. Resolve_full_value.v1 verifies that full original against the strict v2 custody commitment
  before any dependent transition. Its payload, scope, producer preimage and Storage-assigned original metadata
  must all join. An absent original is unavailable; a current clock or reconstructed partial payload cannot
  replace it.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- CV-1306
- SP-278
- SP-286
- SP-337
- SP-340
- SP-343
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 remains PARTIAL until phase 2 implements per-guard oracles with the reviewed shared tools.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.health_degraded
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### SP-1307 - testing.capture.health_recovered storage and reader binding

```yaml
plan_unit_id: SP-1307
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'NEWLY AUTHORED Storage binding solely for `testing.capture.health_recovered@1.0.0` (TCME-1307/CV-1307).
  Prepared value rows, not registry appends, are at Plans/w3c_test_capture_event_storage_rows.json under event_type=testing.capture.health_recovered.
  The `testing_capture_health_recovered_operation` canonical operation family preserves original owner intent,
  source refs and terminal result; key `testing_capture_health_recovered_operation.v1:{storage_instance_id}:{scope_partition}:{owner_operation_id}`.
  The `testing_capture_health_recovered_checkpoint` derived filtered-reader family has key `testing_capture_health_recovered_checkpoint.v1:{storage_instance_id}:{scope_partition}:{subject_id}:{generation_id}`,
  reader `reader.testing.capture.health_recovered@1.0.0`, schema pm.storage_value.testing_capture_health_recovered_checkpoint.v1@1.0.0.
  The exact subject is the payload''s primary selection/video/command/session/segment/switch/adapter identity,
  in that order where present. Storage identity, scope partition and subject are recomputed from actual original
  sources and must equal the key and value; never trust supplied key fragments. Source rows are immutable snapshots,
  not mutable current-head references. No event, physical family or registry membership is admitted by these
  rows.


  SP-286/CV-339 strict v2 full-value custody is explicitly adopted; this family''s producer uses the existing
  full-value request/result and original first receipt, not a subset or new digest. Ordinary source advancement,
  retry and crash recovery verify original group/receipt/source joins before publication, honoring barrier-class
  flush and restore fences. Canonical operation phases are pending -> outcome_committed -> event_committed
  -> terminal, with withdrawal fencing

  any unresolved phase; a pending effect with unknown outcome remains fenced. CAS over the complete original
  row/head guards each transition. Separate media/action transactions are reconciled by original operation
  identity and genuine result evidence; there is no distributed atomicity claim.


  SP-278 is explicitly adopted. Copy its read_token definition with redb_snapshot_id removed from both properties
  and required, preserving the other nine fields unchanged in DurableGenericToken. Form the live tenth field
  only from the actual read transaction and revalidate the complete token. Filter exact event family/version,
  storage_instance_id, scope and subject over the complete CURRENT-selected verified retained EventRecord-index
  coverage; ignored nonmatching events still count toward cursor completeness. Verify actual payload/source/full-value
  receipt and present read authorization. Publish the projection and cursor in one derived redb transaction
  with predecessor CAS only after all source proof is complete. Null last_event_id/last_sequence_id means proven
  empty coverage, never missing data. A compaction translation is accepted only by semantic identity and matching
  survivor/source coverage; otherwise invalidate and rebuild from surviving canonical originals. No source
  mutation or external effect occurs on replay.


  Operation/source-result values are canonical and require coherent BRS-031 backup with SP-337 packs and original
  append custody; missing originals cannot be reconstructed from a projection. The checkpoint is derived/rebuildable,
  has no mandatory backup and uses RP-PROJECTION-3GEN: one current plus at most two staged/retired generations,
  first current-to-retired activation is the fixed terminal anchor, seven days and cleared holds/references
  before retired deletion, serialized slot reservation, and protected-full slots block replacement. Retired
  generations are not current. A valid historical original uses its authenticated write-time schema/recipe
  even after live state changes. Withdrawal invalidates this family''s reader/generation until an approved
  compatible rebuild; current writer/retry admission cannot accept projector_replay_only.


  History retention is PENDING_RETENTION_DECISION; For testing.capture.health_recovered, what lifetime, expiry
  anchor and counting scope apply to its saved history, including manual or No project captures without a real
  run: runtime/run history only when a real run exists, non-authority operational/diagnostic history, or lasting
  receipt/source-lineage authority? Card 1 G13 does not name this fact; do not apply it by analogy. Canonical
  original operation/receipt rows use RP-AUTHORITY-INDEFINITE, not an extension to raw media policy. Both values
  declare at most 16384 encoded bytes, canonical versus derived redb files and existing SP-340 storage groups.
  Oversize intent, outcome, source snapshot and projection parts independently externalize via SP-337; unresolved
  or undurable refs refuse. Safe refs never carry credentials, raw media, protected-auth content or secret
  labels. Quarantine inconsistent derived values before governed rebuild, preserve canonical loss for recovery,
  and never silently recreate originals. Physical registration, migration versions and write admission remain
  unavailable until separately reviewed registration and complete retention decisions.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_health_recovered
  uses schema_id pm.event_payload.testing.capture.health_recovered.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_health_recoveredApplicationV1
  uses schema_id pm.event_payload.testing.capture.health_recovered.application.v1. Each root enforces its own
  scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Original producer preimage custody: intent is the immutable pre-effect request described by TCME-1307, not
  an event payload. Pending has null outcome_record, producer_semantics, original_event and first_append.

  On genuine outcome commitment, CAS-bind outcome_record and producer_semantics together once and enter outcome_committed.
  producer_semantics is the immutable source_ref to the complete original EventRecord caller input selected
  by Contracts_V0.md#EventRecord, formed from the actual outcome and original request only at that boundary.

  It includes every owner-selected caller field without defining a second envelope field list; neither request
  alone nor a predicted output is that preimage. Outcome_committed has no original_event or first_append yet.
  Event_committed and terminal require all four original custody values; pending cannot masquerade as completion.

  Withdrawal preserves the entire original row at its honest pending, outcome-bound or event-bound custody
  state and cannot clear an existing binding. All phases keep the exact original request and operation identity.
  External intent resolves the selected request schema, while the outcome/event resolve their separate completed
  schemas under SP-337.

  Recovery between action and outcome commitment reads genuine original action/result evidence and binds once;
  uncertain actions stay fenced. Recovery after outcome commitment appends only the frozen input; after append
  it resolves the first original receipt without a new action/event. Separate stores are reconciled under the
  original identity and CAS, never treated as a distributed transaction. Recompute and compare against actual
  owner request/source custody. original_event is null only before issuance; event_committed/terminal require
  the exact complete original EventRecord, inline through the existing schema or independently externalized
  through SP-337. Resolve_full_value.v1 verifies that full original against the strict v2 custody commitment
  before any dependent transition. Its payload, scope, producer preimage and Storage-assigned original metadata
  must all join. An absent original is unavailable; a current clock or reconstructed partial payload cannot
  replace it.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- CV-1307
- SP-278
- SP-286
- SP-337
- SP-340
- SP-343
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 remains PARTIAL until phase 2 implements per-guard oracles with the reviewed shared tools.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.health_recovered
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### SP-1308 - testing.capture.interrupted storage and reader binding

```yaml
plan_unit_id: SP-1308
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'NEWLY AUTHORED Storage binding solely for `testing.capture.interrupted@1.0.0` (TCME-1308/CV-1308).
  Prepared value rows, not registry appends, are at Plans/w3c_test_capture_event_storage_rows.json under event_type=testing.capture.interrupted.
  The `testing_capture_interrupted_operation` canonical operation family preserves original owner intent, source
  refs and terminal result; key `testing_capture_interrupted_operation.v1:{storage_instance_id}:{scope_partition}:{owner_operation_id}`.
  The `testing_capture_interrupted_checkpoint` derived filtered-reader family has key `testing_capture_interrupted_checkpoint.v1:{storage_instance_id}:{scope_partition}:{subject_id}:{generation_id}`,
  reader `reader.testing.capture.interrupted@1.0.0`, schema pm.storage_value.testing_capture_interrupted_checkpoint.v1@1.0.0.
  The exact subject is the payload''s primary selection/video/command/session/segment/switch/adapter identity,
  in that order where present. Storage identity, scope partition and subject are recomputed from actual original
  sources and must equal the key and value; never trust supplied key fragments. Source rows are immutable snapshots,
  not mutable current-head references. No event, physical family or registry membership is admitted by these
  rows.


  SP-286/CV-339 strict v2 full-value custody is explicitly adopted; this family''s producer uses the existing
  full-value request/result and original first receipt, not a subset or new digest. Ordinary source advancement,
  retry and crash recovery verify original group/receipt/source joins before publication, honoring barrier-class
  flush and restore fences. Canonical operation phases are pending -> outcome_committed -> event_committed
  -> terminal, with withdrawal fencing

  any unresolved phase; a pending effect with unknown outcome remains fenced. CAS over the complete original
  row/head guards each transition. Separate media/action transactions are reconciled by original operation
  identity and genuine result evidence; there is no distributed atomicity claim.


  SP-278 is explicitly adopted. Copy its read_token definition with redb_snapshot_id removed from both properties
  and required, preserving the other nine fields unchanged in DurableGenericToken. Form the live tenth field
  only from the actual read transaction and revalidate the complete token. Filter exact event family/version,
  storage_instance_id, scope and subject over the complete CURRENT-selected verified retained EventRecord-index
  coverage; ignored nonmatching events still count toward cursor completeness. Verify actual payload/source/full-value
  receipt and present read authorization. Publish the projection and cursor in one derived redb transaction
  with predecessor CAS only after all source proof is complete. Null last_event_id/last_sequence_id means proven
  empty coverage, never missing data. A compaction translation is accepted only by semantic identity and matching
  survivor/source coverage; otherwise invalidate and rebuild from surviving canonical originals. No source
  mutation or external effect occurs on replay.


  Operation/source-result values are canonical and require coherent BRS-031 backup with SP-337 packs and original
  append custody; missing originals cannot be reconstructed from a projection. The checkpoint is derived/rebuildable,
  has no mandatory backup and uses RP-PROJECTION-3GEN: one current plus at most two staged/retired generations,
  first current-to-retired activation is the fixed terminal anchor, seven days and cleared holds/references
  before retired deletion, serialized slot reservation, and protected-full slots block replacement. Retired
  generations are not current. A valid historical original uses its authenticated write-time schema/recipe
  even after live state changes. Withdrawal invalidates this family''s reader/generation until an approved
  compatible rebuild; current writer/retry admission cannot accept projector_replay_only.


  History retention is PENDING_RETENTION_DECISION; For testing.capture.interrupted, what lifetime, expiry anchor
  and counting scope apply to its saved history, including manual or No project captures without a real run:
  runtime/run history only when a real run exists, non-authority operational/diagnostic history, or lasting
  receipt/source-lineage authority? Card 1 G13 does not name this fact; do not apply it by analogy. Canonical
  original operation/receipt rows use RP-AUTHORITY-INDEFINITE, not an extension to raw media policy. Both values
  declare at most 16384 encoded bytes, canonical versus derived redb files and existing SP-340 storage groups.
  Oversize intent, outcome, source snapshot and projection parts independently externalize via SP-337; unresolved
  or undurable refs refuse. Safe refs never carry credentials, raw media, protected-auth content or secret
  labels. Quarantine inconsistent derived values before governed rebuild, preserve canonical loss for recovery,
  and never silently recreate originals. Physical registration, migration versions and write admission remain
  unavailable until separately reviewed registration and complete retention decisions.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_interrupted
  uses schema_id pm.event_payload.testing.capture.interrupted.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_interruptedApplicationV1
  uses schema_id pm.event_payload.testing.capture.interrupted.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage
  rows list both editions; no Project resource is nulled or rewritten.


  Original producer preimage custody: intent is the immutable pre-effect request described by TCME-1308, not
  an event payload. Pending has null outcome_record, producer_semantics, original_event and first_append.

  On genuine outcome commitment, CAS-bind outcome_record and producer_semantics together once and enter outcome_committed.
  producer_semantics is the immutable source_ref to the complete original EventRecord caller input selected
  by Contracts_V0.md#EventRecord, formed from the actual outcome and original request only at that boundary.

  It includes every owner-selected caller field without defining a second envelope field list; neither request
  alone nor a predicted output is that preimage. Outcome_committed has no original_event or first_append yet.
  Event_committed and terminal require all four original custody values; pending cannot masquerade as completion.

  Withdrawal preserves the entire original row at its honest pending, outcome-bound or event-bound custody
  state and cannot clear an existing binding. All phases keep the exact original request and operation identity.
  External intent resolves the selected request schema, while the outcome/event resolve their separate completed
  schemas under SP-337.

  Recovery between action and outcome commitment reads genuine original action/result evidence and binds once;
  uncertain actions stay fenced. Recovery after outcome commitment appends only the frozen input; after append
  it resolves the first original receipt without a new action/event. Separate stores are reconciled under the
  original identity and CAS, never treated as a distributed transaction. Recompute and compare against actual
  owner request/source custody. original_event is null only before issuance; event_committed/terminal require
  the exact complete original EventRecord, inline through the existing schema or independently externalized
  through SP-337. Resolve_full_value.v1 verifies that full original against the strict v2 custody commitment
  before any dependent transition. Its payload, scope, producer preimage and Storage-assigned original metadata
  must all join. An absent original is unavailable; a current clock or reconstructed partial payload cannot
  replace it.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- CV-1308
- SP-278
- SP-286
- SP-337
- SP-340
- SP-343
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 remains PARTIAL until phase 2 implements per-guard oracles with the reviewed shared tools.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.interrupted
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### SP-1309 - testing.capture.paused storage and reader binding

```yaml
plan_unit_id: SP-1309
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'NEWLY AUTHORED Storage binding solely for `testing.capture.paused@1.0.0` (TCME-1309/CV-1309).
  Prepared value rows, not registry appends, are at Plans/w3c_test_capture_event_storage_rows.json under event_type=testing.capture.paused.
  The `testing_capture_paused_operation` canonical operation family preserves original owner intent, source
  refs and terminal result; key `testing_capture_paused_operation.v1:{storage_instance_id}:{scope_partition}:{owner_operation_id}`.
  The `testing_capture_paused_checkpoint` derived filtered-reader family has key `testing_capture_paused_checkpoint.v1:{storage_instance_id}:{scope_partition}:{subject_id}:{generation_id}`,
  reader `reader.testing.capture.paused@1.0.0`, schema pm.storage_value.testing_capture_paused_checkpoint.v1@1.0.0.
  The exact subject is the payload''s primary selection/video/command/session/segment/switch/adapter identity,
  in that order where present. Storage identity, scope partition and subject are recomputed from actual original
  sources and must equal the key and value; never trust supplied key fragments. Source rows are immutable snapshots,
  not mutable current-head references. No event, physical family or registry membership is admitted by these
  rows.


  SP-286/CV-339 strict v2 full-value custody is explicitly adopted; this family''s producer uses the existing
  full-value request/result and original first receipt, not a subset or new digest. Ordinary source advancement,
  retry and crash recovery verify original group/receipt/source joins before publication, honoring barrier-class
  flush and restore fences. Canonical operation phases are pending -> outcome_committed -> event_committed
  -> terminal, with withdrawal fencing

  any unresolved phase; a pending effect with unknown outcome remains fenced. CAS over the complete original
  row/head guards each transition. Separate media/action transactions are reconciled by original operation
  identity and genuine result evidence; there is no distributed atomicity claim.


  SP-278 is explicitly adopted. Copy its read_token definition with redb_snapshot_id removed from both properties
  and required, preserving the other nine fields unchanged in DurableGenericToken. Form the live tenth field
  only from the actual read transaction and revalidate the complete token. Filter exact event family/version,
  storage_instance_id, scope and subject over the complete CURRENT-selected verified retained EventRecord-index
  coverage; ignored nonmatching events still count toward cursor completeness. Verify actual payload/source/full-value
  receipt and present read authorization. Publish the projection and cursor in one derived redb transaction
  with predecessor CAS only after all source proof is complete. Null last_event_id/last_sequence_id means proven
  empty coverage, never missing data. A compaction translation is accepted only by semantic identity and matching
  survivor/source coverage; otherwise invalidate and rebuild from surviving canonical originals. No source
  mutation or external effect occurs on replay.


  Operation/source-result values are canonical and require coherent BRS-031 backup with SP-337 packs and original
  append custody; missing originals cannot be reconstructed from a projection. The checkpoint is derived/rebuildable,
  has no mandatory backup and uses RP-PROJECTION-3GEN: one current plus at most two staged/retired generations,
  first current-to-retired activation is the fixed terminal anchor, seven days and cleared holds/references
  before retired deletion, serialized slot reservation, and protected-full slots block replacement. Retired
  generations are not current. A valid historical original uses its authenticated write-time schema/recipe
  even after live state changes. Withdrawal invalidates this family''s reader/generation until an approved
  compatible rebuild; current writer/retry admission cannot accept projector_replay_only.


  History retention is PENDING_RETENTION_DECISION; For testing.capture.paused, what lifetime, expiry anchor
  and counting scope apply to its saved history, including manual or No project captures without a real run:
  runtime/run history only when a real run exists, non-authority operational/diagnostic history, or lasting
  receipt/source-lineage authority? Card 1 G13 does not name this fact; do not apply it by analogy. Canonical
  original operation/receipt rows use RP-AUTHORITY-INDEFINITE, not an extension to raw media policy. Both values
  declare at most 16384 encoded bytes, canonical versus derived redb files and existing SP-340 storage groups.
  Oversize intent, outcome, source snapshot and projection parts independently externalize via SP-337; unresolved
  or undurable refs refuse. Safe refs never carry credentials, raw media, protected-auth content or secret
  labels. Quarantine inconsistent derived values before governed rebuild, preserve canonical loss for recovery,
  and never silently recreate originals. Physical registration, migration versions and write admission remain
  unavailable until separately reviewed registration and complete retention decisions.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_paused
  uses schema_id pm.event_payload.testing.capture.paused.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_pausedApplicationV1
  uses schema_id pm.event_payload.testing.capture.paused.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage
  rows list both editions; no Project resource is nulled or rewritten.


  Original producer preimage custody: intent is the immutable pre-effect request described by TCME-1309, not
  an event payload. Pending has null outcome_record, producer_semantics, original_event and first_append.

  On genuine outcome commitment, CAS-bind outcome_record and producer_semantics together once and enter outcome_committed.
  producer_semantics is the immutable source_ref to the complete original EventRecord caller input selected
  by Contracts_V0.md#EventRecord, formed from the actual outcome and original request only at that boundary.

  It includes every owner-selected caller field without defining a second envelope field list; neither request
  alone nor a predicted output is that preimage. Outcome_committed has no original_event or first_append yet.
  Event_committed and terminal require all four original custody values; pending cannot masquerade as completion.

  Withdrawal preserves the entire original row at its honest pending, outcome-bound or event-bound custody
  state and cannot clear an existing binding. All phases keep the exact original request and operation identity.
  External intent resolves the selected request schema, while the outcome/event resolve their separate completed
  schemas under SP-337.

  Recovery between action and outcome commitment reads genuine original action/result evidence and binds once;
  uncertain actions stay fenced. Recovery after outcome commitment appends only the frozen input; after append
  it resolves the first original receipt without a new action/event. Separate stores are reconciled under the
  original identity and CAS, never treated as a distributed transaction. Recompute and compare against actual
  owner request/source custody. original_event is null only before issuance; event_committed/terminal require
  the exact complete original EventRecord, inline through the existing schema or independently externalized
  through SP-337. Resolve_full_value.v1 verifies that full original against the strict v2 custody commitment
  before any dependent transition. Its payload, scope, producer preimage and Storage-assigned original metadata
  must all join. An absent original is unavailable; a current clock or reconstructed partial payload cannot
  replace it.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- CV-1309
- SP-278
- SP-286
- SP-337
- SP-340
- SP-343
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 remains PARTIAL until phase 2 implements per-guard oracles with the reviewed shared tools.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.paused
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### SP-1310 - testing.capture.provenance_rejected storage and reader binding

```yaml
plan_unit_id: SP-1310
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'NEWLY AUTHORED Storage binding solely for `testing.capture.provenance_rejected@1.0.0` (TCME-1310/CV-1310).
  Prepared value rows, not registry appends, are at Plans/w3c_test_capture_event_storage_rows.json under event_type=testing.capture.provenance_rejected.
  The `testing_capture_provenance_rejected_operation` canonical operation family preserves original owner intent,
  source refs and terminal result; key `testing_capture_provenance_rejected_operation.v1:{storage_instance_id}:{scope_partition}:{owner_operation_id}`.
  The `testing_capture_provenance_rejected_checkpoint` derived filtered-reader family has key `testing_capture_provenance_rejected_checkpoint.v1:{storage_instance_id}:{scope_partition}:{subject_id}:{generation_id}`,
  reader `reader.testing.capture.provenance_rejected@1.0.0`, schema pm.storage_value.testing_capture_provenance_rejected_checkpoint.v1@1.0.0.
  The exact subject is the payload''s primary selection/video/command/session/segment/switch/adapter identity,
  in that order where present. Storage identity, scope partition and subject are recomputed from actual original
  sources and must equal the key and value; never trust supplied key fragments. Source rows are immutable snapshots,
  not mutable current-head references. No event, physical family or registry membership is admitted by these
  rows.


  SP-286/CV-339 strict v2 full-value custody is explicitly adopted; this family''s producer uses the existing
  full-value request/result and original first receipt, not a subset or new digest. Ordinary source advancement,
  retry and crash recovery verify original group/receipt/source joins before publication, honoring barrier-class
  flush and restore fences. Canonical operation phases are pending -> outcome_committed -> event_committed
  -> terminal, with withdrawal fencing

  any unresolved phase; a pending effect with unknown outcome remains fenced. CAS over the complete original
  row/head guards each transition. Separate media/action transactions are reconciled by original operation
  identity and genuine result evidence; there is no distributed atomicity claim.


  SP-278 is explicitly adopted. Copy its read_token definition with redb_snapshot_id removed from both properties
  and required, preserving the other nine fields unchanged in DurableGenericToken. Form the live tenth field
  only from the actual read transaction and revalidate the complete token. Filter exact event family/version,
  storage_instance_id, scope and subject over the complete CURRENT-selected verified retained EventRecord-index
  coverage; ignored nonmatching events still count toward cursor completeness. Verify actual payload/source/full-value
  receipt and present read authorization. Publish the projection and cursor in one derived redb transaction
  with predecessor CAS only after all source proof is complete. Null last_event_id/last_sequence_id means proven
  empty coverage, never missing data. A compaction translation is accepted only by semantic identity and matching
  survivor/source coverage; otherwise invalidate and rebuild from surviving canonical originals. No source
  mutation or external effect occurs on replay.


  Operation/source-result values are canonical and require coherent BRS-031 backup with SP-337 packs and original
  append custody; missing originals cannot be reconstructed from a projection. The checkpoint is derived/rebuildable,
  has no mandatory backup and uses RP-PROJECTION-3GEN: one current plus at most two staged/retired generations,
  first current-to-retired activation is the fixed terminal anchor, seven days and cleared holds/references
  before retired deletion, serialized slot reservation, and protected-full slots block replacement. Retired
  generations are not current. A valid historical original uses its authenticated write-time schema/recipe
  even after live state changes. Withdrawal invalidates this family''s reader/generation until an approved
  compatible rebuild; current writer/retry admission cannot accept projector_replay_only.


  History retention is RP-AUTHORITY-INDEFINITE; Storage Case L-3 approval/receipt/source-lineage authority
  decides this exact ref-only saved fact. Canonical original operation/receipt rows use RP-AUTHORITY-INDEFINITE,
  not an extension to raw media policy. Both values declare at most 16384 encoded bytes, canonical versus derived
  redb files and existing SP-340 storage groups. Oversize intent, outcome, source snapshot and projection parts
  independently externalize via SP-337; unresolved or undurable refs refuse. Safe refs never carry credentials,
  raw media, protected-auth content or secret labels. Quarantine inconsistent derived values before governed
  rebuild, preserve canonical loss for recovery, and never silently recreate originals. Physical registration,
  migration versions and write admission remain unavailable until separately reviewed registration and complete
  retention decisions.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_provenance_rejected
  uses schema_id pm.event_payload.testing.capture.provenance_rejected.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_provenance_rejectedApplicationV1
  uses schema_id pm.event_payload.testing.capture.provenance_rejected.application.v1. Each root enforces its
  own scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Original producer preimage custody: intent is the immutable pre-effect request described by TCME-1310, not
  an event payload. Pending has null outcome_record, producer_semantics, original_event and first_append.

  On genuine outcome commitment, CAS-bind outcome_record and producer_semantics together once and enter outcome_committed.
  producer_semantics is the immutable source_ref to the complete original EventRecord caller input selected
  by Contracts_V0.md#EventRecord, formed from the actual outcome and original request only at that boundary.

  It includes every owner-selected caller field without defining a second envelope field list; neither request
  alone nor a predicted output is that preimage. Outcome_committed has no original_event or first_append yet.
  Event_committed and terminal require all four original custody values; pending cannot masquerade as completion.

  Withdrawal preserves the entire original row at its honest pending, outcome-bound or event-bound custody
  state and cannot clear an existing binding. All phases keep the exact original request and operation identity.
  External intent resolves the selected request schema, while the outcome/event resolve their separate completed
  schemas under SP-337.

  Recovery between action and outcome commitment reads genuine original action/result evidence and binds once;
  uncertain actions stay fenced. Recovery after outcome commitment appends only the frozen input; after append
  it resolves the first original receipt without a new action/event. Separate stores are reconciled under the
  original identity and CAS, never treated as a distributed transaction. Recompute and compare against actual
  owner request/source custody. original_event is null only before issuance; event_committed/terminal require
  the exact complete original EventRecord, inline through the existing schema or independently externalized
  through SP-337. Resolve_full_value.v1 verifies that full original against the strict v2 custody commitment
  before any dependent transition. Its payload, scope, producer preimage and Storage-assigned original metadata
  must all join. An absent original is unavailable; a current clock or reconstructed partial payload cannot
  replace it.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- CV-1310
- SP-278
- SP-286
- SP-337
- SP-340
- SP-343
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 remains PARTIAL until phase 2 implements per-guard oracles with the reviewed shared tools.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.provenance_rejected
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### SP-1311 - testing.capture.provenance_verified storage and reader binding

```yaml
plan_unit_id: SP-1311
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'NEWLY AUTHORED Storage binding solely for `testing.capture.provenance_verified@1.0.0` (TCME-1311/CV-1311).
  Prepared value rows, not registry appends, are at Plans/w3c_test_capture_event_storage_rows.json under event_type=testing.capture.provenance_verified.
  The `testing_capture_provenance_verified_operation` canonical operation family preserves original owner intent,
  source refs and terminal result; key `testing_capture_provenance_verified_operation.v1:{storage_instance_id}:{scope_partition}:{owner_operation_id}`.
  The `testing_capture_provenance_verified_checkpoint` derived filtered-reader family has key `testing_capture_provenance_verified_checkpoint.v1:{storage_instance_id}:{scope_partition}:{subject_id}:{generation_id}`,
  reader `reader.testing.capture.provenance_verified@1.0.0`, schema pm.storage_value.testing_capture_provenance_verified_checkpoint.v1@1.0.0.
  The exact subject is the payload''s primary selection/video/command/session/segment/switch/adapter identity,
  in that order where present. Storage identity, scope partition and subject are recomputed from actual original
  sources and must equal the key and value; never trust supplied key fragments. Source rows are immutable snapshots,
  not mutable current-head references. No event, physical family or registry membership is admitted by these
  rows.


  SP-286/CV-339 strict v2 full-value custody is explicitly adopted; this family''s producer uses the existing
  full-value request/result and original first receipt, not a subset or new digest. Ordinary source advancement,
  retry and crash recovery verify original group/receipt/source joins before publication, honoring barrier-class
  flush and restore fences. Canonical operation phases are pending -> outcome_committed -> event_committed
  -> terminal, with withdrawal fencing

  any unresolved phase; a pending effect with unknown outcome remains fenced. CAS over the complete original
  row/head guards each transition. Separate media/action transactions are reconciled by original operation
  identity and genuine result evidence; there is no distributed atomicity claim.


  SP-278 is explicitly adopted. Copy its read_token definition with redb_snapshot_id removed from both properties
  and required, preserving the other nine fields unchanged in DurableGenericToken. Form the live tenth field
  only from the actual read transaction and revalidate the complete token. Filter exact event family/version,
  storage_instance_id, scope and subject over the complete CURRENT-selected verified retained EventRecord-index
  coverage; ignored nonmatching events still count toward cursor completeness. Verify actual payload/source/full-value
  receipt and present read authorization. Publish the projection and cursor in one derived redb transaction
  with predecessor CAS only after all source proof is complete. Null last_event_id/last_sequence_id means proven
  empty coverage, never missing data. A compaction translation is accepted only by semantic identity and matching
  survivor/source coverage; otherwise invalidate and rebuild from surviving canonical originals. No source
  mutation or external effect occurs on replay.


  Operation/source-result values are canonical and require coherent BRS-031 backup with SP-337 packs and original
  append custody; missing originals cannot be reconstructed from a projection. The checkpoint is derived/rebuildable,
  has no mandatory backup and uses RP-PROJECTION-3GEN: one current plus at most two staged/retired generations,
  first current-to-retired activation is the fixed terminal anchor, seven days and cleared holds/references
  before retired deletion, serialized slot reservation, and protected-full slots block replacement. Retired
  generations are not current. A valid historical original uses its authenticated write-time schema/recipe
  even after live state changes. Withdrawal invalidates this family''s reader/generation until an approved
  compatible rebuild; current writer/retry admission cannot accept projector_replay_only.


  History retention is RP-AUTHORITY-INDEFINITE; Storage Case L-3 approval/receipt/source-lineage authority
  decides this exact ref-only saved fact. Canonical original operation/receipt rows use RP-AUTHORITY-INDEFINITE,
  not an extension to raw media policy. Both values declare at most 16384 encoded bytes, canonical versus derived
  redb files and existing SP-340 storage groups. Oversize intent, outcome, source snapshot and projection parts
  independently externalize via SP-337; unresolved or undurable refs refuse. Safe refs never carry credentials,
  raw media, protected-auth content or secret labels. Quarantine inconsistent derived values before governed
  rebuild, preserve canonical loss for recovery, and never silently recreate originals. Physical registration,
  migration versions and write admission remain unavailable until separately reviewed registration and complete
  retention decisions.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_provenance_verified
  uses schema_id pm.event_payload.testing.capture.provenance_verified.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_provenance_verifiedApplicationV1
  uses schema_id pm.event_payload.testing.capture.provenance_verified.application.v1. Each root enforces its
  own scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Original producer preimage custody: intent is the immutable pre-effect request described by TCME-1311, not
  an event payload. Pending has null outcome_record, producer_semantics, original_event and first_append.

  On genuine outcome commitment, CAS-bind outcome_record and producer_semantics together once and enter outcome_committed.
  producer_semantics is the immutable source_ref to the complete original EventRecord caller input selected
  by Contracts_V0.md#EventRecord, formed from the actual outcome and original request only at that boundary.

  It includes every owner-selected caller field without defining a second envelope field list; neither request
  alone nor a predicted output is that preimage. Outcome_committed has no original_event or first_append yet.
  Event_committed and terminal require all four original custody values; pending cannot masquerade as completion.

  Withdrawal preserves the entire original row at its honest pending, outcome-bound or event-bound custody
  state and cannot clear an existing binding. All phases keep the exact original request and operation identity.
  External intent resolves the selected request schema, while the outcome/event resolve their separate completed
  schemas under SP-337.

  Recovery between action and outcome commitment reads genuine original action/result evidence and binds once;
  uncertain actions stay fenced. Recovery after outcome commitment appends only the frozen input; after append
  it resolves the first original receipt without a new action/event. Separate stores are reconciled under the
  original identity and CAS, never treated as a distributed transaction. Recompute and compare against actual
  owner request/source custody. original_event is null only before issuance; event_committed/terminal require
  the exact complete original EventRecord, inline through the existing schema or independently externalized
  through SP-337. Resolve_full_value.v1 verifies that full original against the strict v2 custody commitment
  before any dependent transition. Its payload, scope, producer preimage and Storage-assigned original metadata
  must all join. An absent original is unavailable; a current clock or reconstructed partial payload cannot
  replace it.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- CV-1311
- SP-278
- SP-286
- SP-337
- SP-340
- SP-343
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 remains PARTIAL until phase 2 implements per-guard oracles with the reviewed shared tools.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.provenance_verified
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### SP-1312 - testing.capture.redaction_applied storage and reader binding

```yaml
plan_unit_id: SP-1312
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'NEWLY AUTHORED Storage binding solely for `testing.capture.redaction_applied@1.0.0` (TCME-1312/CV-1312).
  Prepared value rows, not registry appends, are at Plans/w3c_test_capture_event_storage_rows.json under event_type=testing.capture.redaction_applied.
  The `testing_capture_redaction_applied_operation` canonical operation family preserves original owner intent,
  source refs and terminal result; key `testing_capture_redaction_applied_operation.v1:{storage_instance_id}:{scope_partition}:{owner_operation_id}`.
  The `testing_capture_redaction_applied_checkpoint` derived filtered-reader family has key `testing_capture_redaction_applied_checkpoint.v1:{storage_instance_id}:{scope_partition}:{subject_id}:{generation_id}`,
  reader `reader.testing.capture.redaction_applied@1.0.0`, schema pm.storage_value.testing_capture_redaction_applied_checkpoint.v1@1.0.0.
  The exact subject is the payload''s primary selection/video/command/session/segment/switch/adapter identity,
  in that order where present. Storage identity, scope partition and subject are recomputed from actual original
  sources and must equal the key and value; never trust supplied key fragments. Source rows are immutable snapshots,
  not mutable current-head references. No event, physical family or registry membership is admitted by these
  rows.


  SP-286/CV-339 strict v2 full-value custody is explicitly adopted; this family''s producer uses the existing
  full-value request/result and original first receipt, not a subset or new digest. Ordinary source advancement,
  retry and crash recovery verify original group/receipt/source joins before publication, honoring barrier-class
  flush and restore fences. Canonical operation phases are pending -> outcome_committed -> event_committed
  -> terminal, with withdrawal fencing

  any unresolved phase; a pending effect with unknown outcome remains fenced. CAS over the complete original
  row/head guards each transition. Separate media/action transactions are reconciled by original operation
  identity and genuine result evidence; there is no distributed atomicity claim.


  SP-278 is explicitly adopted. Copy its read_token definition with redb_snapshot_id removed from both properties
  and required, preserving the other nine fields unchanged in DurableGenericToken. Form the live tenth field
  only from the actual read transaction and revalidate the complete token. Filter exact event family/version,
  storage_instance_id, scope and subject over the complete CURRENT-selected verified retained EventRecord-index
  coverage; ignored nonmatching events still count toward cursor completeness. Verify actual payload/source/full-value
  receipt and present read authorization. Publish the projection and cursor in one derived redb transaction
  with predecessor CAS only after all source proof is complete. Null last_event_id/last_sequence_id means proven
  empty coverage, never missing data. A compaction translation is accepted only by semantic identity and matching
  survivor/source coverage; otherwise invalidate and rebuild from surviving canonical originals. No source
  mutation or external effect occurs on replay.


  Operation/source-result values are canonical and require coherent BRS-031 backup with SP-337 packs and original
  append custody; missing originals cannot be reconstructed from a projection. The checkpoint is derived/rebuildable,
  has no mandatory backup and uses RP-PROJECTION-3GEN: one current plus at most two staged/retired generations,
  first current-to-retired activation is the fixed terminal anchor, seven days and cleared holds/references
  before retired deletion, serialized slot reservation, and protected-full slots block replacement. Retired
  generations are not current. A valid historical original uses its authenticated write-time schema/recipe
  even after live state changes. Withdrawal invalidates this family''s reader/generation until an approved
  compatible rebuild; current writer/retry admission cannot accept projector_replay_only.


  History retention is RP-AUTHORITY-INDEFINITE; Storage Case L-3 approval/receipt/source-lineage authority
  decides this exact ref-only saved fact. Canonical original operation/receipt rows use RP-AUTHORITY-INDEFINITE,
  not an extension to raw media policy. Both values declare at most 16384 encoded bytes, canonical versus derived
  redb files and existing SP-340 storage groups. Oversize intent, outcome, source snapshot and projection parts
  independently externalize via SP-337; unresolved or undurable refs refuse. Safe refs never carry credentials,
  raw media, protected-auth content or secret labels. Quarantine inconsistent derived values before governed
  rebuild, preserve canonical loss for recovery, and never silently recreate originals. Physical registration,
  migration versions and write admission remain unavailable until separately reviewed registration and complete
  retention decisions.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_redaction_applied
  uses schema_id pm.event_payload.testing.capture.redaction_applied.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_redaction_appliedApplicationV1
  uses schema_id pm.event_payload.testing.capture.redaction_applied.application.v1. Each root enforces its
  own scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Original producer preimage custody: intent is the immutable pre-effect request described by TCME-1312, not
  an event payload. Pending has null outcome_record, producer_semantics, original_event and first_append.

  On genuine outcome commitment, CAS-bind outcome_record and producer_semantics together once and enter outcome_committed.
  producer_semantics is the immutable source_ref to the complete original EventRecord caller input selected
  by Contracts_V0.md#EventRecord, formed from the actual outcome and original request only at that boundary.

  It includes every owner-selected caller field without defining a second envelope field list; neither request
  alone nor a predicted output is that preimage. Outcome_committed has no original_event or first_append yet.
  Event_committed and terminal require all four original custody values; pending cannot masquerade as completion.

  Withdrawal preserves the entire original row at its honest pending, outcome-bound or event-bound custody
  state and cannot clear an existing binding. All phases keep the exact original request and operation identity.
  External intent resolves the selected request schema, while the outcome/event resolve their separate completed
  schemas under SP-337.

  Recovery between action and outcome commitment reads genuine original action/result evidence and binds once;
  uncertain actions stay fenced. Recovery after outcome commitment appends only the frozen input; after append
  it resolves the first original receipt without a new action/event. Separate stores are reconciled under the
  original identity and CAS, never treated as a distributed transaction. Recompute and compare against actual
  owner request/source custody. original_event is null only before issuance; event_committed/terminal require
  the exact complete original EventRecord, inline through the existing schema or independently externalized
  through SP-337. Resolve_full_value.v1 verifies that full original against the strict v2 custody commitment
  before any dependent transition. Its payload, scope, producer preimage and Storage-assigned original metadata
  must all join. An absent original is unavailable; a current clock or reconstructed partial payload cannot
  replace it.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- CV-1312
- SP-278
- SP-286
- SP-337
- SP-340
- SP-343
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 remains PARTIAL until phase 2 implements per-guard oracles with the reviewed shared tools.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.redaction_applied
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### SP-1313 - testing.capture.resumed storage and reader binding

```yaml
plan_unit_id: SP-1313
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'NEWLY AUTHORED Storage binding solely for `testing.capture.resumed@1.0.0` (TCME-1313/CV-1313).
  Prepared value rows, not registry appends, are at Plans/w3c_test_capture_event_storage_rows.json under event_type=testing.capture.resumed.
  The `testing_capture_resumed_operation` canonical operation family preserves original owner intent, source
  refs and terminal result; key `testing_capture_resumed_operation.v1:{storage_instance_id}:{scope_partition}:{owner_operation_id}`.
  The `testing_capture_resumed_checkpoint` derived filtered-reader family has key `testing_capture_resumed_checkpoint.v1:{storage_instance_id}:{scope_partition}:{subject_id}:{generation_id}`,
  reader `reader.testing.capture.resumed@1.0.0`, schema pm.storage_value.testing_capture_resumed_checkpoint.v1@1.0.0.
  The exact subject is the payload''s primary selection/video/command/session/segment/switch/adapter identity,
  in that order where present. Storage identity, scope partition and subject are recomputed from actual original
  sources and must equal the key and value; never trust supplied key fragments. Source rows are immutable snapshots,
  not mutable current-head references. No event, physical family or registry membership is admitted by these
  rows.


  SP-286/CV-339 strict v2 full-value custody is explicitly adopted; this family''s producer uses the existing
  full-value request/result and original first receipt, not a subset or new digest. Ordinary source advancement,
  retry and crash recovery verify original group/receipt/source joins before publication, honoring barrier-class
  flush and restore fences. Canonical operation phases are pending -> outcome_committed -> event_committed
  -> terminal, with withdrawal fencing

  any unresolved phase; a pending effect with unknown outcome remains fenced. CAS over the complete original
  row/head guards each transition. Separate media/action transactions are reconciled by original operation
  identity and genuine result evidence; there is no distributed atomicity claim.


  SP-278 is explicitly adopted. Copy its read_token definition with redb_snapshot_id removed from both properties
  and required, preserving the other nine fields unchanged in DurableGenericToken. Form the live tenth field
  only from the actual read transaction and revalidate the complete token. Filter exact event family/version,
  storage_instance_id, scope and subject over the complete CURRENT-selected verified retained EventRecord-index
  coverage; ignored nonmatching events still count toward cursor completeness. Verify actual payload/source/full-value
  receipt and present read authorization. Publish the projection and cursor in one derived redb transaction
  with predecessor CAS only after all source proof is complete. Null last_event_id/last_sequence_id means proven
  empty coverage, never missing data. A compaction translation is accepted only by semantic identity and matching
  survivor/source coverage; otherwise invalidate and rebuild from surviving canonical originals. No source
  mutation or external effect occurs on replay.


  Operation/source-result values are canonical and require coherent BRS-031 backup with SP-337 packs and original
  append custody; missing originals cannot be reconstructed from a projection. The checkpoint is derived/rebuildable,
  has no mandatory backup and uses RP-PROJECTION-3GEN: one current plus at most two staged/retired generations,
  first current-to-retired activation is the fixed terminal anchor, seven days and cleared holds/references
  before retired deletion, serialized slot reservation, and protected-full slots block replacement. Retired
  generations are not current. A valid historical original uses its authenticated write-time schema/recipe
  even after live state changes. Withdrawal invalidates this family''s reader/generation until an approved
  compatible rebuild; current writer/retry admission cannot accept projector_replay_only.


  History retention is PENDING_RETENTION_DECISION; For testing.capture.resumed, what lifetime, expiry anchor
  and counting scope apply to its saved history, including manual or No project captures without a real run:
  runtime/run history only when a real run exists, non-authority operational/diagnostic history, or lasting
  receipt/source-lineage authority? Card 1 G13 does not name this fact; do not apply it by analogy. Canonical
  original operation/receipt rows use RP-AUTHORITY-INDEFINITE, not an extension to raw media policy. Both values
  declare at most 16384 encoded bytes, canonical versus derived redb files and existing SP-340 storage groups.
  Oversize intent, outcome, source snapshot and projection parts independently externalize via SP-337; unresolved
  or undurable refs refuse. Safe refs never carry credentials, raw media, protected-auth content or secret
  labels. Quarantine inconsistent derived values before governed rebuild, preserve canonical loss for recovery,
  and never silently recreate originals. Physical registration, migration versions and write admission remain
  unavailable until separately reviewed registration and complete retention decisions.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_resumed
  uses schema_id pm.event_payload.testing.capture.resumed.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_resumedApplicationV1
  uses schema_id pm.event_payload.testing.capture.resumed.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage
  rows list both editions; no Project resource is nulled or rewritten.


  Original producer preimage custody: intent is the immutable pre-effect request described by TCME-1313, not
  an event payload. Pending has null outcome_record, producer_semantics, original_event and first_append.

  On genuine outcome commitment, CAS-bind outcome_record and producer_semantics together once and enter outcome_committed.
  producer_semantics is the immutable source_ref to the complete original EventRecord caller input selected
  by Contracts_V0.md#EventRecord, formed from the actual outcome and original request only at that boundary.

  It includes every owner-selected caller field without defining a second envelope field list; neither request
  alone nor a predicted output is that preimage. Outcome_committed has no original_event or first_append yet.
  Event_committed and terminal require all four original custody values; pending cannot masquerade as completion.

  Withdrawal preserves the entire original row at its honest pending, outcome-bound or event-bound custody
  state and cannot clear an existing binding. All phases keep the exact original request and operation identity.
  External intent resolves the selected request schema, while the outcome/event resolve their separate completed
  schemas under SP-337.

  Recovery between action and outcome commitment reads genuine original action/result evidence and binds once;
  uncertain actions stay fenced. Recovery after outcome commitment appends only the frozen input; after append
  it resolves the first original receipt without a new action/event. Separate stores are reconciled under the
  original identity and CAS, never treated as a distributed transaction. Recompute and compare against actual
  owner request/source custody. original_event is null only before issuance; event_committed/terminal require
  the exact complete original EventRecord, inline through the existing schema or independently externalized
  through SP-337. Resolve_full_value.v1 verifies that full original against the strict v2 custody commitment
  before any dependent transition. Its payload, scope, producer preimage and Storage-assigned original metadata
  must all join. An absent original is unavailable; a current clock or reconstructed partial payload cannot
  replace it.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- CV-1313
- SP-278
- SP-286
- SP-337
- SP-340
- SP-343
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 remains PARTIAL until phase 2 implements per-guard oracles with the reviewed shared tools.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.resumed
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### SP-1314 - testing.capture.segment_corrupt storage and reader binding

```yaml
plan_unit_id: SP-1314
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'NEWLY AUTHORED Storage binding solely for `testing.capture.segment_corrupt@1.0.0` (TCME-1314/CV-1314).
  Prepared value rows, not registry appends, are at Plans/w3c_test_capture_event_storage_rows.json under event_type=testing.capture.segment_corrupt.
  The `testing_capture_segment_corrupt_operation` canonical operation family preserves original owner intent,
  source refs and terminal result; key `testing_capture_segment_corrupt_operation.v1:{storage_instance_id}:{scope_partition}:{owner_operation_id}`.
  The `testing_capture_segment_corrupt_checkpoint` derived filtered-reader family has key `testing_capture_segment_corrupt_checkpoint.v1:{storage_instance_id}:{scope_partition}:{subject_id}:{generation_id}`,
  reader `reader.testing.capture.segment_corrupt@1.0.0`, schema pm.storage_value.testing_capture_segment_corrupt_checkpoint.v1@1.0.0.
  The exact subject is the payload''s primary selection/video/command/session/segment/switch/adapter identity,
  in that order where present. Storage identity, scope partition and subject are recomputed from actual original
  sources and must equal the key and value; never trust supplied key fragments. Source rows are immutable snapshots,
  not mutable current-head references. No event, physical family or registry membership is admitted by these
  rows.


  SP-286/CV-339 strict v2 full-value custody is explicitly adopted; this family''s producer uses the existing
  full-value request/result and original first receipt, not a subset or new digest. Ordinary source advancement,
  retry and crash recovery verify original group/receipt/source joins before publication, honoring barrier-class
  flush and restore fences. Canonical operation phases are pending -> outcome_committed -> event_committed
  -> terminal, with withdrawal fencing

  any unresolved phase; a pending effect with unknown outcome remains fenced. CAS over the complete original
  row/head guards each transition. Separate media/action transactions are reconciled by original operation
  identity and genuine result evidence; there is no distributed atomicity claim.


  SP-278 is explicitly adopted. Copy its read_token definition with redb_snapshot_id removed from both properties
  and required, preserving the other nine fields unchanged in DurableGenericToken. Form the live tenth field
  only from the actual read transaction and revalidate the complete token. Filter exact event family/version,
  storage_instance_id, scope and subject over the complete CURRENT-selected verified retained EventRecord-index
  coverage; ignored nonmatching events still count toward cursor completeness. Verify actual payload/source/full-value
  receipt and present read authorization. Publish the projection and cursor in one derived redb transaction
  with predecessor CAS only after all source proof is complete. Null last_event_id/last_sequence_id means proven
  empty coverage, never missing data. A compaction translation is accepted only by semantic identity and matching
  survivor/source coverage; otherwise invalidate and rebuild from surviving canonical originals. No source
  mutation or external effect occurs on replay.


  Operation/source-result values are canonical and require coherent BRS-031 backup with SP-337 packs and original
  append custody; missing originals cannot be reconstructed from a projection. The checkpoint is derived/rebuildable,
  has no mandatory backup and uses RP-PROJECTION-3GEN: one current plus at most two staged/retired generations,
  first current-to-retired activation is the fixed terminal anchor, seven days and cleared holds/references
  before retired deletion, serialized slot reservation, and protected-full slots block replacement. Retired
  generations are not current. A valid historical original uses its authenticated write-time schema/recipe
  even after live state changes. Withdrawal invalidates this family''s reader/generation until an approved
  compatible rebuild; current writer/retry admission cannot accept projector_replay_only.


  History retention is PENDING_RETENTION_DECISION; For testing.capture.segment_corrupt, what lifetime, expiry
  anchor and counting scope apply to its saved history, including manual or No project captures without a real
  run: runtime/run history only when a real run exists, non-authority operational/diagnostic history, or lasting
  receipt/source-lineage authority? Card 1 G13 does not name this fact; do not apply it by analogy. Canonical
  original operation/receipt rows use RP-AUTHORITY-INDEFINITE, not an extension to raw media policy. Both values
  declare at most 16384 encoded bytes, canonical versus derived redb files and existing SP-340 storage groups.
  Oversize intent, outcome, source snapshot and projection parts independently externalize via SP-337; unresolved
  or undurable refs refuse. Safe refs never carry credentials, raw media, protected-auth content or secret
  labels. Quarantine inconsistent derived values before governed rebuild, preserve canonical loss for recovery,
  and never silently recreate originals. Physical registration, migration versions and write admission remain
  unavailable until separately reviewed registration and complete retention decisions.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_segment_corrupt
  uses schema_id pm.event_payload.testing.capture.segment_corrupt.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_segment_corruptApplicationV1
  uses schema_id pm.event_payload.testing.capture.segment_corrupt.application.v1. Each root enforces its own
  scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Original producer preimage custody: intent is the immutable pre-effect request described by TCME-1314, not
  an event payload. Pending has null outcome_record, producer_semantics, original_event and first_append.

  On genuine outcome commitment, CAS-bind outcome_record and producer_semantics together once and enter outcome_committed.
  producer_semantics is the immutable source_ref to the complete original EventRecord caller input selected
  by Contracts_V0.md#EventRecord, formed from the actual outcome and original request only at that boundary.

  It includes every owner-selected caller field without defining a second envelope field list; neither request
  alone nor a predicted output is that preimage. Outcome_committed has no original_event or first_append yet.
  Event_committed and terminal require all four original custody values; pending cannot masquerade as completion.

  Withdrawal preserves the entire original row at its honest pending, outcome-bound or event-bound custody
  state and cannot clear an existing binding. All phases keep the exact original request and operation identity.
  External intent resolves the selected request schema, while the outcome/event resolve their separate completed
  schemas under SP-337.

  Recovery between action and outcome commitment reads genuine original action/result evidence and binds once;
  uncertain actions stay fenced. Recovery after outcome commitment appends only the frozen input; after append
  it resolves the first original receipt without a new action/event. Separate stores are reconciled under the
  original identity and CAS, never treated as a distributed transaction. Recompute and compare against actual
  owner request/source custody. original_event is null only before issuance; event_committed/terminal require
  the exact complete original EventRecord, inline through the existing schema or independently externalized
  through SP-337. Resolve_full_value.v1 verifies that full original against the strict v2 custody commitment
  before any dependent transition. Its payload, scope, producer preimage and Storage-assigned original metadata
  must all join. An absent original is unavailable; a current clock or reconstructed partial payload cannot
  replace it.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- CV-1314
- SP-278
- SP-286
- SP-337
- SP-340
- SP-343
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 remains PARTIAL until phase 2 implements per-guard oracles with the reviewed shared tools.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.segment_corrupt
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### SP-1315 - testing.capture.segment_finalized storage and reader binding

```yaml
plan_unit_id: SP-1315
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'NEWLY AUTHORED Storage binding solely for `testing.capture.segment_finalized@1.0.0` (TCME-1315/CV-1315).
  Prepared value rows, not registry appends, are at Plans/w3c_test_capture_event_storage_rows.json under event_type=testing.capture.segment_finalized.
  The `testing_capture_segment_finalized_operation` canonical operation family preserves original owner intent,
  source refs and terminal result; key `testing_capture_segment_finalized_operation.v1:{storage_instance_id}:{scope_partition}:{owner_operation_id}`.
  The `testing_capture_segment_finalized_checkpoint` derived filtered-reader family has key `testing_capture_segment_finalized_checkpoint.v1:{storage_instance_id}:{scope_partition}:{subject_id}:{generation_id}`,
  reader `reader.testing.capture.segment_finalized@1.0.0`, schema pm.storage_value.testing_capture_segment_finalized_checkpoint.v1@1.0.0.
  The exact subject is the payload''s primary selection/video/command/session/segment/switch/adapter identity,
  in that order where present. Storage identity, scope partition and subject are recomputed from actual original
  sources and must equal the key and value; never trust supplied key fragments. Source rows are immutable snapshots,
  not mutable current-head references. No event, physical family or registry membership is admitted by these
  rows.


  SP-286/CV-339 strict v2 full-value custody is explicitly adopted; this family''s producer uses the existing
  full-value request/result and original first receipt, not a subset or new digest. Ordinary source advancement,
  retry and crash recovery verify original group/receipt/source joins before publication, honoring barrier-class
  flush and restore fences. Canonical operation phases are pending -> outcome_committed -> event_committed
  -> terminal, with withdrawal fencing

  any unresolved phase; a pending effect with unknown outcome remains fenced. CAS over the complete original
  row/head guards each transition. Separate media/action transactions are reconciled by original operation
  identity and genuine result evidence; there is no distributed atomicity claim.


  SP-278 is explicitly adopted. Copy its read_token definition with redb_snapshot_id removed from both properties
  and required, preserving the other nine fields unchanged in DurableGenericToken. Form the live tenth field
  only from the actual read transaction and revalidate the complete token. Filter exact event family/version,
  storage_instance_id, scope and subject over the complete CURRENT-selected verified retained EventRecord-index
  coverage; ignored nonmatching events still count toward cursor completeness. Verify actual payload/source/full-value
  receipt and present read authorization. Publish the projection and cursor in one derived redb transaction
  with predecessor CAS only after all source proof is complete. Null last_event_id/last_sequence_id means proven
  empty coverage, never missing data. A compaction translation is accepted only by semantic identity and matching
  survivor/source coverage; otherwise invalidate and rebuild from surviving canonical originals. No source
  mutation or external effect occurs on replay.


  Operation/source-result values are canonical and require coherent BRS-031 backup with SP-337 packs and original
  append custody; missing originals cannot be reconstructed from a projection. The checkpoint is derived/rebuildable,
  has no mandatory backup and uses RP-PROJECTION-3GEN: one current plus at most two staged/retired generations,
  first current-to-retired activation is the fixed terminal anchor, seven days and cleared holds/references
  before retired deletion, serialized slot reservation, and protected-full slots block replacement. Retired
  generations are not current. A valid historical original uses its authenticated write-time schema/recipe
  even after live state changes. Withdrawal invalidates this family''s reader/generation until an approved
  compatible rebuild; current writer/retry admission cannot accept projector_replay_only.


  History retention is RP-AUTHORITY-INDEFINITE; Storage Case L-3 approval/receipt/source-lineage authority
  decides this exact ref-only saved fact. Canonical original operation/receipt rows use RP-AUTHORITY-INDEFINITE,
  not an extension to raw media policy. Both values declare at most 16384 encoded bytes, canonical versus derived
  redb files and existing SP-340 storage groups. Oversize intent, outcome, source snapshot and projection parts
  independently externalize via SP-337; unresolved or undurable refs refuse. Safe refs never carry credentials,
  raw media, protected-auth content or secret labels. Quarantine inconsistent derived values before governed
  rebuild, preserve canonical loss for recovery, and never silently recreate originals. Physical registration,
  migration versions and write admission remain unavailable until separately reviewed registration and complete
  retention decisions.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_segment_finalized
  uses schema_id pm.event_payload.testing.capture.segment_finalized.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_segment_finalizedApplicationV1
  uses schema_id pm.event_payload.testing.capture.segment_finalized.application.v1. Each root enforces its
  own scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Original producer preimage custody: intent is the immutable pre-effect request described by TCME-1315, not
  an event payload. Pending has null outcome_record, producer_semantics, original_event and first_append.

  On genuine outcome commitment, CAS-bind outcome_record and producer_semantics together once and enter outcome_committed.
  producer_semantics is the immutable source_ref to the complete original EventRecord caller input selected
  by Contracts_V0.md#EventRecord, formed from the actual outcome and original request only at that boundary.

  It includes every owner-selected caller field without defining a second envelope field list; neither request
  alone nor a predicted output is that preimage. Outcome_committed has no original_event or first_append yet.
  Event_committed and terminal require all four original custody values; pending cannot masquerade as completion.

  Withdrawal preserves the entire original row at its honest pending, outcome-bound or event-bound custody
  state and cannot clear an existing binding. All phases keep the exact original request and operation identity.
  External intent resolves the selected request schema, while the outcome/event resolve their separate completed
  schemas under SP-337.

  Recovery between action and outcome commitment reads genuine original action/result evidence and binds once;
  uncertain actions stay fenced. Recovery after outcome commitment appends only the frozen input; after append
  it resolves the first original receipt without a new action/event. Separate stores are reconciled under the
  original identity and CAS, never treated as a distributed transaction. Recompute and compare against actual
  owner request/source custody. original_event is null only before issuance; event_committed/terminal require
  the exact complete original EventRecord, inline through the existing schema or independently externalized
  through SP-337. Resolve_full_value.v1 verifies that full original against the strict v2 custody commitment
  before any dependent transition. Its payload, scope, producer preimage and Storage-assigned original metadata
  must all join. An absent original is unavailable; a current clock or reconstructed partial payload cannot
  replace it.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- CV-1315
- SP-278
- SP-286
- SP-337
- SP-340
- SP-343
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 remains PARTIAL until phase 2 implements per-guard oracles with the reviewed shared tools.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.segment_finalized
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### SP-1316 - testing.capture.segment_recovered storage and reader binding

```yaml
plan_unit_id: SP-1316
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'NEWLY AUTHORED Storage binding solely for `testing.capture.segment_recovered@1.0.0` (TCME-1316/CV-1316).
  Prepared value rows, not registry appends, are at Plans/w3c_test_capture_event_storage_rows.json under event_type=testing.capture.segment_recovered.
  The `testing_capture_segment_recovered_operation` canonical operation family preserves original owner intent,
  source refs and terminal result; key `testing_capture_segment_recovered_operation.v1:{storage_instance_id}:{scope_partition}:{owner_operation_id}`.
  The `testing_capture_segment_recovered_checkpoint` derived filtered-reader family has key `testing_capture_segment_recovered_checkpoint.v1:{storage_instance_id}:{scope_partition}:{subject_id}:{generation_id}`,
  reader `reader.testing.capture.segment_recovered@1.0.0`, schema pm.storage_value.testing_capture_segment_recovered_checkpoint.v1@1.0.0.
  The exact subject is the payload''s primary selection/video/command/session/segment/switch/adapter identity,
  in that order where present. Storage identity, scope partition and subject are recomputed from actual original
  sources and must equal the key and value; never trust supplied key fragments. Source rows are immutable snapshots,
  not mutable current-head references. No event, physical family or registry membership is admitted by these
  rows.


  SP-286/CV-339 strict v2 full-value custody is explicitly adopted; this family''s producer uses the existing
  full-value request/result and original first receipt, not a subset or new digest. Ordinary source advancement,
  retry and crash recovery verify original group/receipt/source joins before publication, honoring barrier-class
  flush and restore fences. Canonical operation phases are pending -> outcome_committed -> event_committed
  -> terminal, with withdrawal fencing

  any unresolved phase; a pending effect with unknown outcome remains fenced. CAS over the complete original
  row/head guards each transition. Separate media/action transactions are reconciled by original operation
  identity and genuine result evidence; there is no distributed atomicity claim.


  SP-278 is explicitly adopted. Copy its read_token definition with redb_snapshot_id removed from both properties
  and required, preserving the other nine fields unchanged in DurableGenericToken. Form the live tenth field
  only from the actual read transaction and revalidate the complete token. Filter exact event family/version,
  storage_instance_id, scope and subject over the complete CURRENT-selected verified retained EventRecord-index
  coverage; ignored nonmatching events still count toward cursor completeness. Verify actual payload/source/full-value
  receipt and present read authorization. Publish the projection and cursor in one derived redb transaction
  with predecessor CAS only after all source proof is complete. Null last_event_id/last_sequence_id means proven
  empty coverage, never missing data. A compaction translation is accepted only by semantic identity and matching
  survivor/source coverage; otherwise invalidate and rebuild from surviving canonical originals. No source
  mutation or external effect occurs on replay.


  Operation/source-result values are canonical and require coherent BRS-031 backup with SP-337 packs and original
  append custody; missing originals cannot be reconstructed from a projection. The checkpoint is derived/rebuildable,
  has no mandatory backup and uses RP-PROJECTION-3GEN: one current plus at most two staged/retired generations,
  first current-to-retired activation is the fixed terminal anchor, seven days and cleared holds/references
  before retired deletion, serialized slot reservation, and protected-full slots block replacement. Retired
  generations are not current. A valid historical original uses its authenticated write-time schema/recipe
  even after live state changes. Withdrawal invalidates this family''s reader/generation until an approved
  compatible rebuild; current writer/retry admission cannot accept projector_replay_only.


  History retention is RP-AUTHORITY-INDEFINITE; Storage Case L-3 approval/receipt/source-lineage authority
  decides this exact ref-only saved fact. Canonical original operation/receipt rows use RP-AUTHORITY-INDEFINITE,
  not an extension to raw media policy. Both values declare at most 16384 encoded bytes, canonical versus derived
  redb files and existing SP-340 storage groups. Oversize intent, outcome, source snapshot and projection parts
  independently externalize via SP-337; unresolved or undurable refs refuse. Safe refs never carry credentials,
  raw media, protected-auth content or secret labels. Quarantine inconsistent derived values before governed
  rebuild, preserve canonical loss for recovery, and never silently recreate originals. Physical registration,
  migration versions and write admission remain unavailable until separately reviewed registration and complete
  retention decisions.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_segment_recovered
  uses schema_id pm.event_payload.testing.capture.segment_recovered.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_segment_recoveredApplicationV1
  uses schema_id pm.event_payload.testing.capture.segment_recovered.application.v1. Each root enforces its
  own scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Original producer preimage custody: intent is the immutable pre-effect request described by TCME-1316, not
  an event payload. Pending has null outcome_record, producer_semantics, original_event and first_append.

  On genuine outcome commitment, CAS-bind outcome_record and producer_semantics together once and enter outcome_committed.
  producer_semantics is the immutable source_ref to the complete original EventRecord caller input selected
  by Contracts_V0.md#EventRecord, formed from the actual outcome and original request only at that boundary.

  It includes every owner-selected caller field without defining a second envelope field list; neither request
  alone nor a predicted output is that preimage. Outcome_committed has no original_event or first_append yet.
  Event_committed and terminal require all four original custody values; pending cannot masquerade as completion.

  Withdrawal preserves the entire original row at its honest pending, outcome-bound or event-bound custody
  state and cannot clear an existing binding. All phases keep the exact original request and operation identity.
  External intent resolves the selected request schema, while the outcome/event resolve their separate completed
  schemas under SP-337.

  Recovery between action and outcome commitment reads genuine original action/result evidence and binds once;
  uncertain actions stay fenced. Recovery after outcome commitment appends only the frozen input; after append
  it resolves the first original receipt without a new action/event. Separate stores are reconciled under the
  original identity and CAS, never treated as a distributed transaction. Recompute and compare against actual
  owner request/source custody. original_event is null only before issuance; event_committed/terminal require
  the exact complete original EventRecord, inline through the existing schema or independently externalized
  through SP-337. Resolve_full_value.v1 verifies that full original against the strict v2 custody commitment
  before any dependent transition. Its payload, scope, producer preimage and Storage-assigned original metadata
  must all join. An absent original is unavailable; a current clock or reconstructed partial payload cannot
  replace it.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- CV-1316
- SP-278
- SP-286
- SP-337
- SP-340
- SP-343
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 remains PARTIAL until phase 2 implements per-guard oracles with the reviewed shared tools.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.segment_recovered
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### SP-1317 - testing.capture.started storage and reader binding

```yaml
plan_unit_id: SP-1317
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'NEWLY AUTHORED Storage binding solely for `testing.capture.started@1.0.0` (TCME-1317/CV-1317).
  Prepared value rows, not registry appends, are at Plans/w3c_test_capture_event_storage_rows.json under event_type=testing.capture.started.
  The `testing_capture_started_operation` canonical operation family preserves original owner intent, source
  refs and terminal result; key `testing_capture_started_operation.v1:{storage_instance_id}:{scope_partition}:{owner_operation_id}`.
  The `testing_capture_started_checkpoint` derived filtered-reader family has key `testing_capture_started_checkpoint.v1:{storage_instance_id}:{scope_partition}:{subject_id}:{generation_id}`,
  reader `reader.testing.capture.started@1.0.0`, schema pm.storage_value.testing_capture_started_checkpoint.v1@1.0.0.
  The exact subject is the payload''s primary selection/video/command/session/segment/switch/adapter identity,
  in that order where present. Storage identity, scope partition and subject are recomputed from actual original
  sources and must equal the key and value; never trust supplied key fragments. Source rows are immutable snapshots,
  not mutable current-head references. No event, physical family or registry membership is admitted by these
  rows.


  SP-286/CV-339 strict v2 full-value custody is explicitly adopted; this family''s producer uses the existing
  full-value request/result and original first receipt, not a subset or new digest. Ordinary source advancement,
  retry and crash recovery verify original group/receipt/source joins before publication, honoring barrier-class
  flush and restore fences. Canonical operation phases are pending -> outcome_committed -> event_committed
  -> terminal, with withdrawal fencing

  any unresolved phase; a pending effect with unknown outcome remains fenced. CAS over the complete original
  row/head guards each transition. Separate media/action transactions are reconciled by original operation
  identity and genuine result evidence; there is no distributed atomicity claim.


  SP-278 is explicitly adopted. Copy its read_token definition with redb_snapshot_id removed from both properties
  and required, preserving the other nine fields unchanged in DurableGenericToken. Form the live tenth field
  only from the actual read transaction and revalidate the complete token. Filter exact event family/version,
  storage_instance_id, scope and subject over the complete CURRENT-selected verified retained EventRecord-index
  coverage; ignored nonmatching events still count toward cursor completeness. Verify actual payload/source/full-value
  receipt and present read authorization. Publish the projection and cursor in one derived redb transaction
  with predecessor CAS only after all source proof is complete. Null last_event_id/last_sequence_id means proven
  empty coverage, never missing data. A compaction translation is accepted only by semantic identity and matching
  survivor/source coverage; otherwise invalidate and rebuild from surviving canonical originals. No source
  mutation or external effect occurs on replay.


  Operation/source-result values are canonical and require coherent BRS-031 backup with SP-337 packs and original
  append custody; missing originals cannot be reconstructed from a projection. The checkpoint is derived/rebuildable,
  has no mandatory backup and uses RP-PROJECTION-3GEN: one current plus at most two staged/retired generations,
  first current-to-retired activation is the fixed terminal anchor, seven days and cleared holds/references
  before retired deletion, serialized slot reservation, and protected-full slots block replacement. Retired
  generations are not current. A valid historical original uses its authenticated write-time schema/recipe
  even after live state changes. Withdrawal invalidates this family''s reader/generation until an approved
  compatible rebuild; current writer/retry admission cannot accept projector_replay_only.


  History retention is PENDING_RETENTION_DECISION; For testing.capture.started, what lifetime, expiry anchor
  and counting scope apply to its saved history, including manual or No project captures without a real run:
  runtime/run history only when a real run exists, non-authority operational/diagnostic history, or lasting
  receipt/source-lineage authority? Card 1 G13 does not name this fact; do not apply it by analogy. Canonical
  original operation/receipt rows use RP-AUTHORITY-INDEFINITE, not an extension to raw media policy. Both values
  declare at most 16384 encoded bytes, canonical versus derived redb files and existing SP-340 storage groups.
  Oversize intent, outcome, source snapshot and projection parts independently externalize via SP-337; unresolved
  or undurable refs refuse. Safe refs never carry credentials, raw media, protected-auth content or secret
  labels. Quarantine inconsistent derived values before governed rebuild, preserve canonical loss for recovery,
  and never silently recreate originals. Physical registration, migration versions and write admission remain
  unavailable until separately reviewed registration and complete retention decisions.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_started
  uses schema_id pm.event_payload.testing.capture.started.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_startedApplicationV1
  uses schema_id pm.event_payload.testing.capture.started.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage
  rows list both editions; no Project resource is nulled or rewritten.


  Original producer preimage custody: intent is the immutable pre-effect request described by TCME-1317, not
  an event payload. Pending has null outcome_record, producer_semantics, original_event and first_append.

  On genuine outcome commitment, CAS-bind outcome_record and producer_semantics together once and enter outcome_committed.
  producer_semantics is the immutable source_ref to the complete original EventRecord caller input selected
  by Contracts_V0.md#EventRecord, formed from the actual outcome and original request only at that boundary.

  It includes every owner-selected caller field without defining a second envelope field list; neither request
  alone nor a predicted output is that preimage. Outcome_committed has no original_event or first_append yet.
  Event_committed and terminal require all four original custody values; pending cannot masquerade as completion.

  Withdrawal preserves the entire original row at its honest pending, outcome-bound or event-bound custody
  state and cannot clear an existing binding. All phases keep the exact original request and operation identity.
  External intent resolves the selected request schema, while the outcome/event resolve their separate completed
  schemas under SP-337.

  Recovery between action and outcome commitment reads genuine original action/result evidence and binds once;
  uncertain actions stay fenced. Recovery after outcome commitment appends only the frozen input; after append
  it resolves the first original receipt without a new action/event. Separate stores are reconciled under the
  original identity and CAS, never treated as a distributed transaction. Recompute and compare against actual
  owner request/source custody. original_event is null only before issuance; event_committed/terminal require
  the exact complete original EventRecord, inline through the existing schema or independently externalized
  through SP-337. Resolve_full_value.v1 verifies that full original against the strict v2 custody commitment
  before any dependent transition. Its payload, scope, producer preimage and Storage-assigned original metadata
  must all join. An absent original is unavailable; a current clock or reconstructed partial payload cannot
  replace it.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- CV-1317
- SP-278
- SP-286
- SP-337
- SP-340
- SP-343
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 remains PARTIAL until phase 2 implements per-guard oracles with the reviewed shared tools.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.started
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### SP-1318 - testing.capture.stopped storage and reader binding

```yaml
plan_unit_id: SP-1318
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'NEWLY AUTHORED Storage binding solely for `testing.capture.stopped@1.0.0` (TCME-1318/CV-1318).
  Prepared value rows, not registry appends, are at Plans/w3c_test_capture_event_storage_rows.json under event_type=testing.capture.stopped.
  The `testing_capture_stopped_operation` canonical operation family preserves original owner intent, source
  refs and terminal result; key `testing_capture_stopped_operation.v1:{storage_instance_id}:{scope_partition}:{owner_operation_id}`.
  The `testing_capture_stopped_checkpoint` derived filtered-reader family has key `testing_capture_stopped_checkpoint.v1:{storage_instance_id}:{scope_partition}:{subject_id}:{generation_id}`,
  reader `reader.testing.capture.stopped@1.0.0`, schema pm.storage_value.testing_capture_stopped_checkpoint.v1@1.0.0.
  The exact subject is the payload''s primary selection/video/command/session/segment/switch/adapter identity,
  in that order where present. Storage identity, scope partition and subject are recomputed from actual original
  sources and must equal the key and value; never trust supplied key fragments. Source rows are immutable snapshots,
  not mutable current-head references. No event, physical family or registry membership is admitted by these
  rows.


  SP-286/CV-339 strict v2 full-value custody is explicitly adopted; this family''s producer uses the existing
  full-value request/result and original first receipt, not a subset or new digest. Ordinary source advancement,
  retry and crash recovery verify original group/receipt/source joins before publication, honoring barrier-class
  flush and restore fences. Canonical operation phases are pending -> outcome_committed -> event_committed
  -> terminal, with withdrawal fencing

  any unresolved phase; a pending effect with unknown outcome remains fenced. CAS over the complete original
  row/head guards each transition. Separate media/action transactions are reconciled by original operation
  identity and genuine result evidence; there is no distributed atomicity claim.


  SP-278 is explicitly adopted. Copy its read_token definition with redb_snapshot_id removed from both properties
  and required, preserving the other nine fields unchanged in DurableGenericToken. Form the live tenth field
  only from the actual read transaction and revalidate the complete token. Filter exact event family/version,
  storage_instance_id, scope and subject over the complete CURRENT-selected verified retained EventRecord-index
  coverage; ignored nonmatching events still count toward cursor completeness. Verify actual payload/source/full-value
  receipt and present read authorization. Publish the projection and cursor in one derived redb transaction
  with predecessor CAS only after all source proof is complete. Null last_event_id/last_sequence_id means proven
  empty coverage, never missing data. A compaction translation is accepted only by semantic identity and matching
  survivor/source coverage; otherwise invalidate and rebuild from surviving canonical originals. No source
  mutation or external effect occurs on replay.


  Operation/source-result values are canonical and require coherent BRS-031 backup with SP-337 packs and original
  append custody; missing originals cannot be reconstructed from a projection. The checkpoint is derived/rebuildable,
  has no mandatory backup and uses RP-PROJECTION-3GEN: one current plus at most two staged/retired generations,
  first current-to-retired activation is the fixed terminal anchor, seven days and cleared holds/references
  before retired deletion, serialized slot reservation, and protected-full slots block replacement. Retired
  generations are not current. A valid historical original uses its authenticated write-time schema/recipe
  even after live state changes. Withdrawal invalidates this family''s reader/generation until an approved
  compatible rebuild; current writer/retry admission cannot accept projector_replay_only.


  History retention is PENDING_RETENTION_DECISION; For testing.capture.stopped, what lifetime, expiry anchor
  and counting scope apply to its saved history, including manual or No project captures without a real run:
  runtime/run history only when a real run exists, non-authority operational/diagnostic history, or lasting
  receipt/source-lineage authority? Card 1 G13 does not name this fact; do not apply it by analogy. Canonical
  original operation/receipt rows use RP-AUTHORITY-INDEFINITE, not an extension to raw media policy. Both values
  declare at most 16384 encoded bytes, canonical versus derived redb files and existing SP-340 storage groups.
  Oversize intent, outcome, source snapshot and projection parts independently externalize via SP-337; unresolved
  or undurable refs refuse. Safe refs never carry credentials, raw media, protected-auth content or secret
  labels. Quarantine inconsistent derived values before governed rebuild, preserve canonical loss for recovery,
  and never silently recreate originals. Physical registration, migration versions and write admission remain
  unavailable until separately reviewed registration and complete retention decisions.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_stopped
  uses schema_id pm.event_payload.testing.capture.stopped.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_stoppedApplicationV1
  uses schema_id pm.event_payload.testing.capture.stopped.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage
  rows list both editions; no Project resource is nulled or rewritten.


  Original producer preimage custody: intent is the immutable pre-effect request described by TCME-1318, not
  an event payload. Pending has null outcome_record, producer_semantics, original_event and first_append.

  On genuine outcome commitment, CAS-bind outcome_record and producer_semantics together once and enter outcome_committed.
  producer_semantics is the immutable source_ref to the complete original EventRecord caller input selected
  by Contracts_V0.md#EventRecord, formed from the actual outcome and original request only at that boundary.

  It includes every owner-selected caller field without defining a second envelope field list; neither request
  alone nor a predicted output is that preimage. Outcome_committed has no original_event or first_append yet.
  Event_committed and terminal require all four original custody values; pending cannot masquerade as completion.

  Withdrawal preserves the entire original row at its honest pending, outcome-bound or event-bound custody
  state and cannot clear an existing binding. All phases keep the exact original request and operation identity.
  External intent resolves the selected request schema, while the outcome/event resolve their separate completed
  schemas under SP-337.

  Recovery between action and outcome commitment reads genuine original action/result evidence and binds once;
  uncertain actions stay fenced. Recovery after outcome commitment appends only the frozen input; after append
  it resolves the first original receipt without a new action/event. Separate stores are reconciled under the
  original identity and CAS, never treated as a distributed transaction. Recompute and compare against actual
  owner request/source custody. original_event is null only before issuance; event_committed/terminal require
  the exact complete original EventRecord, inline through the existing schema or independently externalized
  through SP-337. Resolve_full_value.v1 verifies that full original against the strict v2 custody commitment
  before any dependent transition. Its payload, scope, producer preimage and Storage-assigned original metadata
  must all join. An absent original is unavailable; a current clock or reconstructed partial payload cannot
  replace it.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- CV-1318
- SP-278
- SP-286
- SP-337
- SP-340
- SP-343
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 remains PARTIAL until phase 2 implements per-guard oracles with the reviewed shared tools.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.stopped
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### SP-1319 - testing.capture.target_changed storage and reader binding

```yaml
plan_unit_id: SP-1319
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'NEWLY AUTHORED Storage binding solely for `testing.capture.target_changed@1.0.0` (TCME-1319/CV-1319).
  Prepared value rows, not registry appends, are at Plans/w3c_test_capture_event_storage_rows.json under event_type=testing.capture.target_changed.
  The `testing_capture_target_changed_operation` canonical operation family preserves original owner intent,
  source refs and terminal result; key `testing_capture_target_changed_operation.v1:{storage_instance_id}:{scope_partition}:{owner_operation_id}`.
  The `testing_capture_target_changed_checkpoint` derived filtered-reader family has key `testing_capture_target_changed_checkpoint.v1:{storage_instance_id}:{scope_partition}:{subject_id}:{generation_id}`,
  reader `reader.testing.capture.target_changed@1.0.0`, schema pm.storage_value.testing_capture_target_changed_checkpoint.v1@1.0.0.
  The exact subject is the payload''s primary selection/video/command/session/segment/switch/adapter identity,
  in that order where present. Storage identity, scope partition and subject are recomputed from actual original
  sources and must equal the key and value; never trust supplied key fragments. Source rows are immutable snapshots,
  not mutable current-head references. No event, physical family or registry membership is admitted by these
  rows.


  SP-286/CV-339 strict v2 full-value custody is explicitly adopted; this family''s producer uses the existing
  full-value request/result and original first receipt, not a subset or new digest. Ordinary source advancement,
  retry and crash recovery verify original group/receipt/source joins before publication, honoring barrier-class
  flush and restore fences. Canonical operation phases are pending -> outcome_committed -> event_committed
  -> terminal, with withdrawal fencing

  any unresolved phase; a pending effect with unknown outcome remains fenced. CAS over the complete original
  row/head guards each transition. Separate media/action transactions are reconciled by original operation
  identity and genuine result evidence; there is no distributed atomicity claim.


  SP-278 is explicitly adopted. Copy its read_token definition with redb_snapshot_id removed from both properties
  and required, preserving the other nine fields unchanged in DurableGenericToken. Form the live tenth field
  only from the actual read transaction and revalidate the complete token. Filter exact event family/version,
  storage_instance_id, scope and subject over the complete CURRENT-selected verified retained EventRecord-index
  coverage; ignored nonmatching events still count toward cursor completeness. Verify actual payload/source/full-value
  receipt and present read authorization. Publish the projection and cursor in one derived redb transaction
  with predecessor CAS only after all source proof is complete. Null last_event_id/last_sequence_id means proven
  empty coverage, never missing data. A compaction translation is accepted only by semantic identity and matching
  survivor/source coverage; otherwise invalidate and rebuild from surviving canonical originals. No source
  mutation or external effect occurs on replay.


  Operation/source-result values are canonical and require coherent BRS-031 backup with SP-337 packs and original
  append custody; missing originals cannot be reconstructed from a projection. The checkpoint is derived/rebuildable,
  has no mandatory backup and uses RP-PROJECTION-3GEN: one current plus at most two staged/retired generations,
  first current-to-retired activation is the fixed terminal anchor, seven days and cleared holds/references
  before retired deletion, serialized slot reservation, and protected-full slots block replacement. Retired
  generations are not current. A valid historical original uses its authenticated write-time schema/recipe
  even after live state changes. Withdrawal invalidates this family''s reader/generation until an approved
  compatible rebuild; current writer/retry admission cannot accept projector_replay_only.


  History retention is PENDING_RETENTION_DECISION; For testing.capture.target_changed, what lifetime, expiry
  anchor and counting scope apply to its saved history, including manual or No project captures without a real
  run: runtime/run history only when a real run exists, non-authority operational/diagnostic history, or lasting
  receipt/source-lineage authority? Card 1 G13 does not name this fact; do not apply it by analogy. Canonical
  original operation/receipt rows use RP-AUTHORITY-INDEFINITE, not an extension to raw media policy. Both values
  declare at most 16384 encoded bytes, canonical versus derived redb files and existing SP-340 storage groups.
  Oversize intent, outcome, source snapshot and projection parts independently externalize via SP-337; unresolved
  or undurable refs refuse. Safe refs never carry credentials, raw media, protected-auth content or secret
  labels. Quarantine inconsistent derived values before governed rebuild, preserve canonical loss for recovery,
  and never silently recreate originals. Physical registration, migration versions and write admission remain
  unavailable until separately reviewed registration and complete retention decisions.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_target_changed
  uses schema_id pm.event_payload.testing.capture.target_changed.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_target_changedApplicationV1
  uses schema_id pm.event_payload.testing.capture.target_changed.application.v1. Each root enforces its own
  scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1
  suffixes, logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact
  prepared Storage rows list both editions; no Project resource is nulled or rewritten.


  Original producer preimage custody: intent is the immutable pre-effect request described by TCME-1319, not
  an event payload. Pending has null outcome_record, producer_semantics, original_event and first_append.

  On genuine outcome commitment, CAS-bind outcome_record and producer_semantics together once and enter outcome_committed.
  producer_semantics is the immutable source_ref to the complete original EventRecord caller input selected
  by Contracts_V0.md#EventRecord, formed from the actual outcome and original request only at that boundary.

  It includes every owner-selected caller field without defining a second envelope field list; neither request
  alone nor a predicted output is that preimage. Outcome_committed has no original_event or first_append yet.
  Event_committed and terminal require all four original custody values; pending cannot masquerade as completion.

  Withdrawal preserves the entire original row at its honest pending, outcome-bound or event-bound custody
  state and cannot clear an existing binding. All phases keep the exact original request and operation identity.
  External intent resolves the selected request schema, while the outcome/event resolve their separate completed
  schemas under SP-337.

  Recovery between action and outcome commitment reads genuine original action/result evidence and binds once;
  uncertain actions stay fenced. Recovery after outcome commitment appends only the frozen input; after append
  it resolves the first original receipt without a new action/event. Separate stores are reconciled under the
  original identity and CAS, never treated as a distributed transaction. Recompute and compare against actual
  owner request/source custody. original_event is null only before issuance; event_committed/terminal require
  the exact complete original EventRecord, inline through the existing schema or independently externalized
  through SP-337. Resolve_full_value.v1 verifies that full original against the strict v2 custody commitment
  before any dependent transition. Its payload, scope, producer preimage and Storage-assigned original metadata
  must all join. An absent original is unavailable; a current clock or reconstructed partial payload cannot
  replace it.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- CV-1319
- SP-278
- SP-286
- SP-337
- SP-340
- SP-343
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 remains PARTIAL until phase 2 implements per-guard oracles with the reviewed shared tools.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.capture.target_changed
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```


### SP-1320 - testing.runtime_enabled_for_adapter storage and reader binding

```yaml
plan_unit_id: SP-1320
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'NEWLY AUTHORED Storage binding solely for `testing.runtime_enabled_for_adapter@1.0.0` (ATS-1220/CV-1320).
  Prepared value rows, not registry appends, are at Plans/w3c_test_capture_event_storage_rows.json under event_type=testing.runtime_enabled_for_adapter.
  The `testing_runtime_enabled_for_adapter_operation` canonical operation family preserves original owner intent,
  source refs and terminal result; key `testing_runtime_enabled_for_adapter_operation.v1:{storage_instance_id}:{scope_partition}:{owner_operation_id}`.
  The `testing_runtime_enabled_for_adapter_checkpoint` derived filtered-reader family has key `testing_runtime_enabled_for_adapter_checkpoint.v1:{storage_instance_id}:{scope_partition}:{subject_id}:{generation_id}`,
  reader `reader.testing.runtime_enabled_for_adapter@1.0.0`, schema pm.storage_value.testing_runtime_enabled_for_adapter_checkpoint.v1@1.0.0.
  The exact subject is the payload''s primary selection/video/command/session/segment/switch/adapter identity,
  in that order where present. Storage identity, scope partition and subject are recomputed from actual original
  sources and must equal the key and value; never trust supplied key fragments. Source rows are immutable snapshots,
  not mutable current-head references. No event, physical family or registry membership is admitted by these
  rows.


  SP-286/CV-339 strict v2 full-value custody is explicitly adopted; this family''s producer uses the existing
  full-value request/result and original first receipt, not a subset or new digest. Ordinary source advancement,
  retry and crash recovery verify original group/receipt/source joins before publication, honoring barrier-class
  flush and restore fences. Canonical operation phases are pending -> outcome_committed -> event_committed
  -> terminal, with withdrawal fencing

  any unresolved phase; a pending effect with unknown outcome remains fenced. CAS over the complete original
  row/head guards each transition. Separate media/action transactions are reconciled by original operation
  identity and genuine result evidence; there is no distributed atomicity claim.


  SP-278 is explicitly adopted. Copy its read_token definition with redb_snapshot_id removed from both properties
  and required, preserving the other nine fields unchanged in DurableGenericToken. Form the live tenth field
  only from the actual read transaction and revalidate the complete token. Filter exact event family/version,
  storage_instance_id, scope and subject over the complete CURRENT-selected verified retained EventRecord-index
  coverage; ignored nonmatching events still count toward cursor completeness. Verify actual payload/source/full-value
  receipt and present read authorization. Publish the projection and cursor in one derived redb transaction
  with predecessor CAS only after all source proof is complete. Null last_event_id/last_sequence_id means proven
  empty coverage, never missing data. A compaction translation is accepted only by semantic identity and matching
  survivor/source coverage; otherwise invalidate and rebuild from surviving canonical originals. No source
  mutation or external effect occurs on replay.


  Operation/source-result values are canonical and require coherent BRS-031 backup with SP-337 packs and original
  append custody; missing originals cannot be reconstructed from a projection. The checkpoint is derived/rebuildable,
  has no mandatory backup and uses RP-PROJECTION-3GEN: one current plus at most two staged/retired generations,
  first current-to-retired activation is the fixed terminal anchor, seven days and cleared holds/references
  before retired deletion, serialized slot reservation, and protected-full slots block replacement. Retired
  generations are not current. A valid historical original uses its authenticated write-time schema/recipe
  even after live state changes. Withdrawal invalidates this family''s reader/generation until an approved
  compatible rebuild; current writer/retry admission cannot accept projector_replay_only.


  History retention is RP-AUTHORITY-INDEFINITE; Storage Case L-3 approval/receipt/source-lineage authority
  decides this exact ref-only saved fact. Canonical original operation/receipt rows use RP-AUTHORITY-INDEFINITE,
  not an extension to raw media policy. Both values declare at most 16384 encoded bytes, canonical versus derived
  redb files and existing SP-340 storage groups. Oversize intent, outcome, source snapshot and projection parts
  independently externalize via SP-337; unresolved or undurable refs refuse. Safe refs never carry credentials,
  raw media, protected-auth content or secret labels. Quarantine inconsistent derived values before governed
  rebuild, preserve canonical loss for recovery, and never silently recreate originals. Physical registration,
  migration versions and write admission remain unavailable until separately reviewed registration and complete
  retention decisions.


  Original producer preimage custody: intent is the immutable pre-effect request described by ATS-1220, not
  an event payload. Pending has null outcome_record, producer_semantics, original_event and first_append.

  On genuine outcome commitment, CAS-bind outcome_record and producer_semantics together once and enter outcome_committed.
  producer_semantics is the immutable source_ref to the complete original EventRecord caller input selected
  by Contracts_V0.md#EventRecord, formed from the actual outcome and original request only at that boundary.

  It includes every owner-selected caller field without defining a second envelope field list; neither request
  alone nor a predicted output is that preimage. Outcome_committed has no original_event or first_append yet.
  Event_committed and terminal require all four original custody values; pending cannot masquerade as completion.

  Withdrawal preserves the entire original row at its honest pending, outcome-bound or event-bound custody
  state and cannot clear an existing binding. All phases keep the exact original request and operation identity.
  External intent resolves the selected request schema, while the outcome/event resolve their separate completed
  schemas under SP-337.

  Recovery between action and outcome commitment reads genuine original action/result evidence and binds once;
  uncertain actions stay fenced. Recovery after outcome commitment appends only the frozen input; after append
  it resolves the first original receipt without a new action/event. Separate stores are reconciled under the
  original identity and CAS, never treated as a distributed transaction. Recompute and compare against actual
  owner request/source custody. original_event is null only before issuance; event_committed/terminal require
  the exact complete original EventRecord, inline through the existing schema or independently externalized
  through SP-337. Resolve_full_value.v1 verifies that full original against the strict v2 custody commitment
  before any dependent transition. Its payload, scope, producer preimage and Storage-assigned original metadata
  must all join. An absent original is unavailable; a current clock or reconstructed partial payload cannot
  replace it.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume
  existing projections.
depends_on:
- CV-1320
- SP-278
- SP-286
- SP-337
- SP-340
- SP-343
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof
  is inferred.
- Criterion 12 remains PARTIAL until phase 2 implements per-guard oracles with the reviewed shared tools.
validation_surfaces:
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_identity_custody_and_false_evidence
reasoning_tier: high
context_scope: event_authority_wave3_w3c_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/w3c_test_capture_event_contracts.schema.json
- Plans/w3c_test_capture_event_storage_rows.json
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Test_Capture_and_Motion_Evidence.md#8-observablework-receipts-events-and-projections
- Plans/Automated_Testing_System.md#runtime-disabled-to-enabled-trigger
- reports/event-authority-20261105/W3C.md
preserved_exact_tokens:
- testing.runtime_enabled_for_adapter
negative_constraints:
- Do not append an unregistered event, claim execution, or infer an undecided retention rule.
```
