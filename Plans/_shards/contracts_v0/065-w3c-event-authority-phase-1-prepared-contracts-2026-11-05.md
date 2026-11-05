# Shard 065: W3C Event Authority phase-1 prepared contracts - 2026-11-05

Source: `Plans/Contracts_V0.md`

Source lines: L24471-L26061

Source SHA256: `3c5400afb13804deddb9c33eecd4d1ab407b4f72e2cf24b54ecb49048dd81c65`

---

## W3C Event Authority phase-1 prepared contracts - 2026-11-05

These new per-family units are proposals prepared without admission. Existing event and storage family registries remain unchanged.


### CV-1300 - artifacts.capture_provenance.inspected closed payload

```yaml
plan_unit_id: CV-1300
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'NEWLY AUTHORED exact payload for `artifacts.capture_provenance.inspected@1.0.0`: schema_id `pm.event_payload.artifacts.capture_provenance.inspected.v1`,
  schema version 1.0.0; sole closed root at Plans/w3c_test_capture_event_contracts.schema.json#/$defs/artifacts_capture_provenance_inspected.
  Required properties are schema_id, schema_version, event_type, owner_operation_id, scope, source_record, before_record,
  permission_snapshot_ref, selection_id, subject_ref, inspection_receipt_ref. All nested records are closed; extra
  keys refuse. Source record semantics and joins are owned by Plans/Test_Capture_and_Motion_Evidence.md#TCME-1300.
  This definition adopts EventRecord/CV-317 and CV-339, not a copied envelope. Scope is application_or_project;
  validate WorkflowScopeV2 from shared_integration_runtime.schema.json and recompute the reversible Project partition.
  Whole-string and exact-type checks apply after resolving every referenced schema, even unvisited branches; inherited
  pattern-only and format-only annotations never suffice. Schema validation is necessary but owner source joins,
  current admission, custody, transition and read-time access are additional guards.


  The source record''s SHA-256 is over exact immutable stored source bytes; its own logical/media/physical hashes
  remain separate domains, with source provenance validated by the genuine owner. Body resolution validates the
  same selected schema whether inline or through SP-337 payload_ref; apply the 16384-byte limit to each complete
  stored part, including an operation wrapper after an event body is externalized. Metadata, payload BLAKE3 addressing,
  original full-value receipt commitments and producer-semantic digest keep their existing independent owner recipes.
  App physical wrappers adopt CV-366, Project physical values adopt SP-236/SP-339; no sibling or legacy schema receives
  current-write authority. No number/time implementation is authored here. Phase-2 shared NUMRULE/format adoption
  and guard-isolation proof remain required. Proposed payload existence is not event admission.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/artifacts_capture_provenance_inspected
  uses schema_id pm.event_payload.artifacts.capture_provenance.inspected.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/artifacts_capture_provenance_inspectedApplicationV1
  uses schema_id pm.event_payload.artifacts.capture_provenance.inspected.application.v1. Each root enforces its
  own scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes,
  logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage
  rows list both editions; no Project resource is nulled or rewritten.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume existing
  projections.
depends_on:
- CV-317
- CV-339
- CV-366
- TCME-006
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof is inferred.
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
- Plans/Contracts_V0.md
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


### CV-1301 - artifacts.demonstration_video.created closed payload

```yaml
plan_unit_id: CV-1301
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'NEWLY AUTHORED exact payload for `artifacts.demonstration_video.created@1.0.0`: schema_id `pm.event_payload.artifacts.demonstration_video.created.v1`,
  schema version 1.0.0; sole closed root at Plans/w3c_test_capture_event_contracts.schema.json#/$defs/artifacts_demonstration_video_created.
  Required properties are schema_id, schema_version, event_type, owner_operation_id, scope, source_record, before_record,
  permission_snapshot_ref, demonstration_video_id, derivation_manifest_ref, source_raw_capture_ids. All nested records
  are closed; extra keys refuse. Source record semantics and joins are owned by Plans/Test_Capture_and_Motion_Evidence.md#TCME-1301.
  This definition adopts EventRecord/CV-317 and CV-339, not a copied envelope. Scope is application_or_project;
  validate WorkflowScopeV2 from shared_integration_runtime.schema.json and recompute the reversible Project partition.
  Whole-string and exact-type checks apply after resolving every referenced schema, even unvisited branches; inherited
  pattern-only and format-only annotations never suffice. Schema validation is necessary but owner source joins,
  current admission, custody, transition and read-time access are additional guards.


  The source record''s SHA-256 is over exact immutable stored source bytes; its own logical/media/physical hashes
  remain separate domains, with source provenance validated by the genuine owner. Body resolution validates the
  same selected schema whether inline or through SP-337 payload_ref; apply the 16384-byte limit to each complete
  stored part, including an operation wrapper after an event body is externalized. Metadata, payload BLAKE3 addressing,
  original full-value receipt commitments and producer-semantic digest keep their existing independent owner recipes.
  App physical wrappers adopt CV-366, Project physical values adopt SP-236/SP-339; no sibling or legacy schema receives
  current-write authority. No number/time implementation is authored here. Phase-2 shared NUMRULE/format adoption
  and guard-isolation proof remain required. Proposed payload existence is not event admission.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/artifacts_demonstration_video_created
  uses schema_id pm.event_payload.artifacts.demonstration_video.created.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/artifacts_demonstration_video_createdApplicationV1
  uses schema_id pm.event_payload.artifacts.demonstration_video.created.application.v1. Each root enforces its own
  scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes,
  logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage
  rows list both editions; no Project resource is nulled or rewritten.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume existing
  projections.
depends_on:
- CV-317
- CV-339
- CV-366
- TCME-006
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof is inferred.
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
- Plans/Contracts_V0.md
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


### CV-1302 - artifacts.demonstration_video.failed closed payload

```yaml
plan_unit_id: CV-1302
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'NEWLY AUTHORED exact payload for `artifacts.demonstration_video.failed@1.0.0`: schema_id `pm.event_payload.artifacts.demonstration_video.failed.v1`,
  schema version 1.0.0; sole closed root at Plans/w3c_test_capture_event_contracts.schema.json#/$defs/artifacts_demonstration_video_failed.
  Required properties are schema_id, schema_version, event_type, owner_operation_id, scope, source_record, before_record,
  permission_snapshot_ref, command_instance_id, error_code, failure_receipt_ref. All nested records are closed;
  extra keys refuse. Source record semantics and joins are owned by Plans/Test_Capture_and_Motion_Evidence.md#TCME-1302.
  This definition adopts EventRecord/CV-317 and CV-339, not a copied envelope. Scope is application_or_project;
  validate WorkflowScopeV2 from shared_integration_runtime.schema.json and recompute the reversible Project partition.
  Whole-string and exact-type checks apply after resolving every referenced schema, even unvisited branches; inherited
  pattern-only and format-only annotations never suffice. Schema validation is necessary but owner source joins,
  current admission, custody, transition and read-time access are additional guards.


  The source record''s SHA-256 is over exact immutable stored source bytes; its own logical/media/physical hashes
  remain separate domains, with source provenance validated by the genuine owner. Body resolution validates the
  same selected schema whether inline or through SP-337 payload_ref; apply the 16384-byte limit to each complete
  stored part, including an operation wrapper after an event body is externalized. Metadata, payload BLAKE3 addressing,
  original full-value receipt commitments and producer-semantic digest keep their existing independent owner recipes.
  App physical wrappers adopt CV-366, Project physical values adopt SP-236/SP-339; no sibling or legacy schema receives
  current-write authority. No number/time implementation is authored here. Phase-2 shared NUMRULE/format adoption
  and guard-isolation proof remain required. Proposed payload existence is not event admission.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/artifacts_demonstration_video_failed
  uses schema_id pm.event_payload.artifacts.demonstration_video.failed.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/artifacts_demonstration_video_failedApplicationV1
  uses schema_id pm.event_payload.artifacts.demonstration_video.failed.application.v1. Each root enforces its own
  scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes,
  logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage
  rows list both editions; no Project resource is nulled or rewritten.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume existing
  projections.
depends_on:
- CV-317
- CV-339
- CV-366
- TCME-006
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof is inferred.
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
- Plans/Contracts_V0.md
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


### CV-1303 - testing.capture.bookmarked closed payload

```yaml
plan_unit_id: CV-1303
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'NEWLY AUTHORED exact payload for `testing.capture.bookmarked@1.0.0`: schema_id `pm.event_payload.testing.capture.bookmarked.v1`,
  schema version 1.0.0; sole closed root at Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_bookmarked.
  Required properties are schema_id, schema_version, event_type, owner_operation_id, scope, source_record, before_record,
  permission_snapshot_ref, capture_session_id, bookmark_receipt_ref. All nested records are closed; extra keys refuse.
  Source record semantics and joins are owned by Plans/Test_Capture_and_Motion_Evidence.md#TCME-1303. This definition
  adopts EventRecord/CV-317 and CV-339, not a copied envelope. Scope is application_or_project; validate WorkflowScopeV2
  from shared_integration_runtime.schema.json and recompute the reversible Project partition. Whole-string and exact-type
  checks apply after resolving every referenced schema, even unvisited branches; inherited pattern-only and format-only
  annotations never suffice. Schema validation is necessary but owner source joins, current admission, custody,
  transition and read-time access are additional guards.


  The source record''s SHA-256 is over exact immutable stored source bytes; its own logical/media/physical hashes
  remain separate domains, with source provenance validated by the genuine owner. Body resolution validates the
  same selected schema whether inline or through SP-337 payload_ref; apply the 16384-byte limit to each complete
  stored part, including an operation wrapper after an event body is externalized. Metadata, payload BLAKE3 addressing,
  original full-value receipt commitments and producer-semantic digest keep their existing independent owner recipes.
  App physical wrappers adopt CV-366, Project physical values adopt SP-236/SP-339; no sibling or legacy schema receives
  current-write authority. No number/time implementation is authored here. Phase-2 shared NUMRULE/format adoption
  and guard-isolation proof remain required. Proposed payload existence is not event admission.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_bookmarked
  uses schema_id pm.event_payload.testing.capture.bookmarked.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_bookmarkedApplicationV1
  uses schema_id pm.event_payload.testing.capture.bookmarked.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage rows
  list both editions; no Project resource is nulled or rewritten.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume existing
  projections.
depends_on:
- CV-317
- CV-339
- CV-366
- TCME-006
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof is inferred.
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
- Plans/Contracts_V0.md
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


### CV-1304 - testing.capture.clip_saved closed payload

```yaml
plan_unit_id: CV-1304
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'NEWLY AUTHORED exact payload for `testing.capture.clip_saved@1.0.0`: schema_id `pm.event_payload.testing.capture.clip_saved.v1`,
  schema version 1.0.0; sole closed root at Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_clip_saved.
  Required properties are schema_id, schema_version, event_type, owner_operation_id, scope, source_record, before_record,
  permission_snapshot_ref, capture_session_id, raw_capture_id, clip_artifact_ref, derivation_manifest_ref. All nested
  records are closed; extra keys refuse. Source record semantics and joins are owned by Plans/Test_Capture_and_Motion_Evidence.md#TCME-1304.
  This definition adopts EventRecord/CV-317 and CV-339, not a copied envelope. Scope is application_or_project;
  validate WorkflowScopeV2 from shared_integration_runtime.schema.json and recompute the reversible Project partition.
  Whole-string and exact-type checks apply after resolving every referenced schema, even unvisited branches; inherited
  pattern-only and format-only annotations never suffice. Schema validation is necessary but owner source joins,
  current admission, custody, transition and read-time access are additional guards.


  The source record''s SHA-256 is over exact immutable stored source bytes; its own logical/media/physical hashes
  remain separate domains, with source provenance validated by the genuine owner. Body resolution validates the
  same selected schema whether inline or through SP-337 payload_ref; apply the 16384-byte limit to each complete
  stored part, including an operation wrapper after an event body is externalized. Metadata, payload BLAKE3 addressing,
  original full-value receipt commitments and producer-semantic digest keep their existing independent owner recipes.
  App physical wrappers adopt CV-366, Project physical values adopt SP-236/SP-339; no sibling or legacy schema receives
  current-write authority. No number/time implementation is authored here. Phase-2 shared NUMRULE/format adoption
  and guard-isolation proof remain required. Proposed payload existence is not event admission.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_clip_saved
  uses schema_id pm.event_payload.testing.capture.clip_saved.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_clip_savedApplicationV1
  uses schema_id pm.event_payload.testing.capture.clip_saved.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage rows
  list both editions; no Project resource is nulled or rewritten.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume existing
  projections.
depends_on:
- CV-317
- CV-339
- CV-366
- TCME-006
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof is inferred.
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
- Plans/Contracts_V0.md
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


### CV-1305 - testing.capture.effective_quality_changed closed payload

```yaml
plan_unit_id: CV-1305
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'NEWLY AUTHORED exact payload for `testing.capture.effective_quality_changed@1.0.0`: schema_id `pm.event_payload.testing.capture.effective_quality_changed.v1`,
  schema version 1.0.0; sole closed root at Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_effective_quality_changed.
  Required properties are schema_id, schema_version, event_type, owner_operation_id, scope, source_record, before_record,
  permission_snapshot_ref, capture_session_id, health_receipt_id. All nested records are closed; extra keys refuse.
  Source record semantics and joins are owned by Plans/Test_Capture_and_Motion_Evidence.md#TCME-1305. This definition
  adopts EventRecord/CV-317 and CV-339, not a copied envelope. Scope is application_or_project; validate WorkflowScopeV2
  from shared_integration_runtime.schema.json and recompute the reversible Project partition. Whole-string and exact-type
  checks apply after resolving every referenced schema, even unvisited branches; inherited pattern-only and format-only
  annotations never suffice. Schema validation is necessary but owner source joins, current admission, custody,
  transition and read-time access are additional guards.


  The source record''s SHA-256 is over exact immutable stored source bytes; its own logical/media/physical hashes
  remain separate domains, with source provenance validated by the genuine owner. Body resolution validates the
  same selected schema whether inline or through SP-337 payload_ref; apply the 16384-byte limit to each complete
  stored part, including an operation wrapper after an event body is externalized. Metadata, payload BLAKE3 addressing,
  original full-value receipt commitments and producer-semantic digest keep their existing independent owner recipes.
  App physical wrappers adopt CV-366, Project physical values adopt SP-236/SP-339; no sibling or legacy schema receives
  current-write authority. No number/time implementation is authored here. Phase-2 shared NUMRULE/format adoption
  and guard-isolation proof remain required. Proposed payload existence is not event admission.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_effective_quality_changed
  uses schema_id pm.event_payload.testing.capture.effective_quality_changed.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_effective_quality_changedApplicationV1
  uses schema_id pm.event_payload.testing.capture.effective_quality_changed.application.v1. Each root enforces its
  own scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes,
  logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage
  rows list both editions; no Project resource is nulled or rewritten.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume existing
  projections.
depends_on:
- CV-317
- CV-339
- CV-366
- TCME-006
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof is inferred.
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
- Plans/Contracts_V0.md
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


### CV-1306 - testing.capture.health_degraded closed payload

```yaml
plan_unit_id: CV-1306
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'NEWLY AUTHORED exact payload for `testing.capture.health_degraded@1.0.0`: schema_id `pm.event_payload.testing.capture.health_degraded.v1`,
  schema version 1.0.0; sole closed root at Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_health_degraded.
  Required properties are schema_id, schema_version, event_type, owner_operation_id, scope, source_record, before_record,
  permission_snapshot_ref, capture_session_id, health_receipt_id. All nested records are closed; extra keys refuse.
  Source record semantics and joins are owned by Plans/Test_Capture_and_Motion_Evidence.md#TCME-1306. This definition
  adopts EventRecord/CV-317 and CV-339, not a copied envelope. Scope is application_or_project; validate WorkflowScopeV2
  from shared_integration_runtime.schema.json and recompute the reversible Project partition. Whole-string and exact-type
  checks apply after resolving every referenced schema, even unvisited branches; inherited pattern-only and format-only
  annotations never suffice. Schema validation is necessary but owner source joins, current admission, custody,
  transition and read-time access are additional guards.


  The source record''s SHA-256 is over exact immutable stored source bytes; its own logical/media/physical hashes
  remain separate domains, with source provenance validated by the genuine owner. Body resolution validates the
  same selected schema whether inline or through SP-337 payload_ref; apply the 16384-byte limit to each complete
  stored part, including an operation wrapper after an event body is externalized. Metadata, payload BLAKE3 addressing,
  original full-value receipt commitments and producer-semantic digest keep their existing independent owner recipes.
  App physical wrappers adopt CV-366, Project physical values adopt SP-236/SP-339; no sibling or legacy schema receives
  current-write authority. No number/time implementation is authored here. Phase-2 shared NUMRULE/format adoption
  and guard-isolation proof remain required. Proposed payload existence is not event admission.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_health_degraded
  uses schema_id pm.event_payload.testing.capture.health_degraded.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_health_degradedApplicationV1
  uses schema_id pm.event_payload.testing.capture.health_degraded.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage rows
  list both editions; no Project resource is nulled or rewritten.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume existing
  projections.
depends_on:
- CV-317
- CV-339
- CV-366
- TCME-006
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof is inferred.
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
- Plans/Contracts_V0.md
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


### CV-1307 - testing.capture.health_recovered closed payload

```yaml
plan_unit_id: CV-1307
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'NEWLY AUTHORED exact payload for `testing.capture.health_recovered@1.0.0`: schema_id `pm.event_payload.testing.capture.health_recovered.v1`,
  schema version 1.0.0; sole closed root at Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_health_recovered.
  Required properties are schema_id, schema_version, event_type, owner_operation_id, scope, source_record, before_record,
  permission_snapshot_ref, capture_session_id, health_receipt_id. All nested records are closed; extra keys refuse.
  Source record semantics and joins are owned by Plans/Test_Capture_and_Motion_Evidence.md#TCME-1307. This definition
  adopts EventRecord/CV-317 and CV-339, not a copied envelope. Scope is application_or_project; validate WorkflowScopeV2
  from shared_integration_runtime.schema.json and recompute the reversible Project partition. Whole-string and exact-type
  checks apply after resolving every referenced schema, even unvisited branches; inherited pattern-only and format-only
  annotations never suffice. Schema validation is necessary but owner source joins, current admission, custody,
  transition and read-time access are additional guards.


  The source record''s SHA-256 is over exact immutable stored source bytes; its own logical/media/physical hashes
  remain separate domains, with source provenance validated by the genuine owner. Body resolution validates the
  same selected schema whether inline or through SP-337 payload_ref; apply the 16384-byte limit to each complete
  stored part, including an operation wrapper after an event body is externalized. Metadata, payload BLAKE3 addressing,
  original full-value receipt commitments and producer-semantic digest keep their existing independent owner recipes.
  App physical wrappers adopt CV-366, Project physical values adopt SP-236/SP-339; no sibling or legacy schema receives
  current-write authority. No number/time implementation is authored here. Phase-2 shared NUMRULE/format adoption
  and guard-isolation proof remain required. Proposed payload existence is not event admission.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_health_recovered
  uses schema_id pm.event_payload.testing.capture.health_recovered.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_health_recoveredApplicationV1
  uses schema_id pm.event_payload.testing.capture.health_recovered.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage rows
  list both editions; no Project resource is nulled or rewritten.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume existing
  projections.
depends_on:
- CV-317
- CV-339
- CV-366
- TCME-006
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof is inferred.
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
- Plans/Contracts_V0.md
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


### CV-1308 - testing.capture.interrupted closed payload

```yaml
plan_unit_id: CV-1308
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'NEWLY AUTHORED exact payload for `testing.capture.interrupted@1.0.0`: schema_id `pm.event_payload.testing.capture.interrupted.v1`,
  schema version 1.0.0; sole closed root at Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_interrupted.
  Required properties are schema_id, schema_version, event_type, owner_operation_id, scope, source_record, before_record,
  permission_snapshot_ref, capture_session_id, interruption_receipt_ref, gap_manifest_ref. All nested records are
  closed; extra keys refuse. Source record semantics and joins are owned by Plans/Test_Capture_and_Motion_Evidence.md#TCME-1308.
  This definition adopts EventRecord/CV-317 and CV-339, not a copied envelope. Scope is application_or_project;
  validate WorkflowScopeV2 from shared_integration_runtime.schema.json and recompute the reversible Project partition.
  Whole-string and exact-type checks apply after resolving every referenced schema, even unvisited branches; inherited
  pattern-only and format-only annotations never suffice. Schema validation is necessary but owner source joins,
  current admission, custody, transition and read-time access are additional guards.


  The source record''s SHA-256 is over exact immutable stored source bytes; its own logical/media/physical hashes
  remain separate domains, with source provenance validated by the genuine owner. Body resolution validates the
  same selected schema whether inline or through SP-337 payload_ref; apply the 16384-byte limit to each complete
  stored part, including an operation wrapper after an event body is externalized. Metadata, payload BLAKE3 addressing,
  original full-value receipt commitments and producer-semantic digest keep their existing independent owner recipes.
  App physical wrappers adopt CV-366, Project physical values adopt SP-236/SP-339; no sibling or legacy schema receives
  current-write authority. No number/time implementation is authored here. Phase-2 shared NUMRULE/format adoption
  and guard-isolation proof remain required. Proposed payload existence is not event admission.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_interrupted
  uses schema_id pm.event_payload.testing.capture.interrupted.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_interruptedApplicationV1
  uses schema_id pm.event_payload.testing.capture.interrupted.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage rows
  list both editions; no Project resource is nulled or rewritten.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume existing
  projections.
depends_on:
- CV-317
- CV-339
- CV-366
- TCME-006
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof is inferred.
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
- Plans/Contracts_V0.md
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


### CV-1309 - testing.capture.paused closed payload

```yaml
plan_unit_id: CV-1309
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'NEWLY AUTHORED exact payload for `testing.capture.paused@1.0.0`: schema_id `pm.event_payload.testing.capture.paused.v1`,
  schema version 1.0.0; sole closed root at Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_paused.
  Required properties are schema_id, schema_version, event_type, owner_operation_id, scope, source_record, before_record,
  permission_snapshot_ref, capture_session_id, pause_receipt_ref. All nested records are closed; extra keys refuse.
  Source record semantics and joins are owned by Plans/Test_Capture_and_Motion_Evidence.md#TCME-1309. This definition
  adopts EventRecord/CV-317 and CV-339, not a copied envelope. Scope is application_or_project; validate WorkflowScopeV2
  from shared_integration_runtime.schema.json and recompute the reversible Project partition. Whole-string and exact-type
  checks apply after resolving every referenced schema, even unvisited branches; inherited pattern-only and format-only
  annotations never suffice. Schema validation is necessary but owner source joins, current admission, custody,
  transition and read-time access are additional guards.


  The source record''s SHA-256 is over exact immutable stored source bytes; its own logical/media/physical hashes
  remain separate domains, with source provenance validated by the genuine owner. Body resolution validates the
  same selected schema whether inline or through SP-337 payload_ref; apply the 16384-byte limit to each complete
  stored part, including an operation wrapper after an event body is externalized. Metadata, payload BLAKE3 addressing,
  original full-value receipt commitments and producer-semantic digest keep their existing independent owner recipes.
  App physical wrappers adopt CV-366, Project physical values adopt SP-236/SP-339; no sibling or legacy schema receives
  current-write authority. No number/time implementation is authored here. Phase-2 shared NUMRULE/format adoption
  and guard-isolation proof remain required. Proposed payload existence is not event admission.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_paused
  uses schema_id pm.event_payload.testing.capture.paused.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_pausedApplicationV1
  uses schema_id pm.event_payload.testing.capture.paused.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage rows
  list both editions; no Project resource is nulled or rewritten.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume existing
  projections.
depends_on:
- CV-317
- CV-339
- CV-366
- TCME-006
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof is inferred.
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
- Plans/Contracts_V0.md
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


### CV-1310 - testing.capture.provenance_rejected closed payload

```yaml
plan_unit_id: CV-1310
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'NEWLY AUTHORED exact payload for `testing.capture.provenance_rejected@1.0.0`: schema_id `pm.event_payload.testing.capture.provenance_rejected.v1`,
  schema version 1.0.0; sole closed root at Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_provenance_rejected.
  Required properties are schema_id, schema_version, event_type, owner_operation_id, scope, source_record, before_record,
  permission_snapshot_ref, selection_id, subject_ref. All nested records are closed; extra keys refuse. Source record
  semantics and joins are owned by Plans/Test_Capture_and_Motion_Evidence.md#TCME-1310. This definition adopts EventRecord/CV-317
  and CV-339, not a copied envelope. Scope is application_or_project; validate WorkflowScopeV2 from shared_integration_runtime.schema.json
  and recompute the reversible Project partition. Whole-string and exact-type checks apply after resolving every
  referenced schema, even unvisited branches; inherited pattern-only and format-only annotations never suffice.
  Schema validation is necessary but owner source joins, current admission, custody, transition and read-time access
  are additional guards.


  The source record''s SHA-256 is over exact immutable stored source bytes; its own logical/media/physical hashes
  remain separate domains, with source provenance validated by the genuine owner. Body resolution validates the
  same selected schema whether inline or through SP-337 payload_ref; apply the 16384-byte limit to each complete
  stored part, including an operation wrapper after an event body is externalized. Metadata, payload BLAKE3 addressing,
  original full-value receipt commitments and producer-semantic digest keep their existing independent owner recipes.
  App physical wrappers adopt CV-366, Project physical values adopt SP-236/SP-339; no sibling or legacy schema receives
  current-write authority. No number/time implementation is authored here. Phase-2 shared NUMRULE/format adoption
  and guard-isolation proof remain required. Proposed payload existence is not event admission.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_provenance_rejected
  uses schema_id pm.event_payload.testing.capture.provenance_rejected.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_provenance_rejectedApplicationV1
  uses schema_id pm.event_payload.testing.capture.provenance_rejected.application.v1. Each root enforces its own
  scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes,
  logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage
  rows list both editions; no Project resource is nulled or rewritten.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume existing
  projections.
depends_on:
- CV-317
- CV-339
- CV-366
- TCME-006
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof is inferred.
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
- Plans/Contracts_V0.md
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


### CV-1311 - testing.capture.provenance_verified closed payload

```yaml
plan_unit_id: CV-1311
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'NEWLY AUTHORED exact payload for `testing.capture.provenance_verified@1.0.0`: schema_id `pm.event_payload.testing.capture.provenance_verified.v1`,
  schema version 1.0.0; sole closed root at Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_provenance_verified.
  Required properties are schema_id, schema_version, event_type, owner_operation_id, scope, source_record, before_record,
  permission_snapshot_ref, selection_id, subject_ref, selected_capture_id. All nested records are closed; extra
  keys refuse. Source record semantics and joins are owned by Plans/Test_Capture_and_Motion_Evidence.md#TCME-1311.
  This definition adopts EventRecord/CV-317 and CV-339, not a copied envelope. Scope is application_or_project;
  validate WorkflowScopeV2 from shared_integration_runtime.schema.json and recompute the reversible Project partition.
  Whole-string and exact-type checks apply after resolving every referenced schema, even unvisited branches; inherited
  pattern-only and format-only annotations never suffice. Schema validation is necessary but owner source joins,
  current admission, custody, transition and read-time access are additional guards.


  The source record''s SHA-256 is over exact immutable stored source bytes; its own logical/media/physical hashes
  remain separate domains, with source provenance validated by the genuine owner. Body resolution validates the
  same selected schema whether inline or through SP-337 payload_ref; apply the 16384-byte limit to each complete
  stored part, including an operation wrapper after an event body is externalized. Metadata, payload BLAKE3 addressing,
  original full-value receipt commitments and producer-semantic digest keep their existing independent owner recipes.
  App physical wrappers adopt CV-366, Project physical values adopt SP-236/SP-339; no sibling or legacy schema receives
  current-write authority. No number/time implementation is authored here. Phase-2 shared NUMRULE/format adoption
  and guard-isolation proof remain required. Proposed payload existence is not event admission.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_provenance_verified
  uses schema_id pm.event_payload.testing.capture.provenance_verified.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_provenance_verifiedApplicationV1
  uses schema_id pm.event_payload.testing.capture.provenance_verified.application.v1. Each root enforces its own
  scope_kind; select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes,
  logical IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage
  rows list both editions; no Project resource is nulled or rewritten.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume existing
  projections.
depends_on:
- CV-317
- CV-339
- CV-366
- TCME-006
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof is inferred.
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
- Plans/Contracts_V0.md
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


### CV-1312 - testing.capture.redaction_applied closed payload

```yaml
plan_unit_id: CV-1312
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'NEWLY AUTHORED exact payload for `testing.capture.redaction_applied@1.0.0`: schema_id `pm.event_payload.testing.capture.redaction_applied.v1`,
  schema version 1.0.0; sole closed root at Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_redaction_applied.
  Required properties are schema_id, schema_version, event_type, owner_operation_id, scope, source_record, before_record,
  permission_snapshot_ref, capture_session_id, capture_artifact_id, redaction_receipt_ref. All nested records are
  closed; extra keys refuse. Source record semantics and joins are owned by Plans/Test_Capture_and_Motion_Evidence.md#TCME-1312.
  This definition adopts EventRecord/CV-317 and CV-339, not a copied envelope. Scope is application_or_project;
  validate WorkflowScopeV2 from shared_integration_runtime.schema.json and recompute the reversible Project partition.
  Whole-string and exact-type checks apply after resolving every referenced schema, even unvisited branches; inherited
  pattern-only and format-only annotations never suffice. Schema validation is necessary but owner source joins,
  current admission, custody, transition and read-time access are additional guards.


  The source record''s SHA-256 is over exact immutable stored source bytes; its own logical/media/physical hashes
  remain separate domains, with source provenance validated by the genuine owner. Body resolution validates the
  same selected schema whether inline or through SP-337 payload_ref; apply the 16384-byte limit to each complete
  stored part, including an operation wrapper after an event body is externalized. Metadata, payload BLAKE3 addressing,
  original full-value receipt commitments and producer-semantic digest keep their existing independent owner recipes.
  App physical wrappers adopt CV-366, Project physical values adopt SP-236/SP-339; no sibling or legacy schema receives
  current-write authority. No number/time implementation is authored here. Phase-2 shared NUMRULE/format adoption
  and guard-isolation proof remain required. Proposed payload existence is not event admission.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_redaction_applied
  uses schema_id pm.event_payload.testing.capture.redaction_applied.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_redaction_appliedApplicationV1
  uses schema_id pm.event_payload.testing.capture.redaction_applied.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage rows
  list both editions; no Project resource is nulled or rewritten.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume existing
  projections.
depends_on:
- CV-317
- CV-339
- CV-366
- TCME-006
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof is inferred.
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
- Plans/Contracts_V0.md
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


### CV-1313 - testing.capture.resumed closed payload

```yaml
plan_unit_id: CV-1313
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'NEWLY AUTHORED exact payload for `testing.capture.resumed@1.0.0`: schema_id `pm.event_payload.testing.capture.resumed.v1`,
  schema version 1.0.0; sole closed root at Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_resumed.
  Required properties are schema_id, schema_version, event_type, owner_operation_id, scope, source_record, before_record,
  permission_snapshot_ref, capture_session_id, resume_receipt_ref. All nested records are closed; extra keys refuse.
  Source record semantics and joins are owned by Plans/Test_Capture_and_Motion_Evidence.md#TCME-1313. This definition
  adopts EventRecord/CV-317 and CV-339, not a copied envelope. Scope is application_or_project; validate WorkflowScopeV2
  from shared_integration_runtime.schema.json and recompute the reversible Project partition. Whole-string and exact-type
  checks apply after resolving every referenced schema, even unvisited branches; inherited pattern-only and format-only
  annotations never suffice. Schema validation is necessary but owner source joins, current admission, custody,
  transition and read-time access are additional guards.


  The source record''s SHA-256 is over exact immutable stored source bytes; its own logical/media/physical hashes
  remain separate domains, with source provenance validated by the genuine owner. Body resolution validates the
  same selected schema whether inline or through SP-337 payload_ref; apply the 16384-byte limit to each complete
  stored part, including an operation wrapper after an event body is externalized. Metadata, payload BLAKE3 addressing,
  original full-value receipt commitments and producer-semantic digest keep their existing independent owner recipes.
  App physical wrappers adopt CV-366, Project physical values adopt SP-236/SP-339; no sibling or legacy schema receives
  current-write authority. No number/time implementation is authored here. Phase-2 shared NUMRULE/format adoption
  and guard-isolation proof remain required. Proposed payload existence is not event admission.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_resumed
  uses schema_id pm.event_payload.testing.capture.resumed.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_resumedApplicationV1
  uses schema_id pm.event_payload.testing.capture.resumed.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage rows
  list both editions; no Project resource is nulled or rewritten.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume existing
  projections.
depends_on:
- CV-317
- CV-339
- CV-366
- TCME-006
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof is inferred.
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
- Plans/Contracts_V0.md
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


### CV-1314 - testing.capture.segment_corrupt closed payload

```yaml
plan_unit_id: CV-1314
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'NEWLY AUTHORED exact payload for `testing.capture.segment_corrupt@1.0.0`: schema_id `pm.event_payload.testing.capture.segment_corrupt.v1`,
  schema version 1.0.0; sole closed root at Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_segment_corrupt.
  Required properties are schema_id, schema_version, event_type, owner_operation_id, scope, source_record, before_record,
  permission_snapshot_ref, capture_session_id, segment_id. All nested records are closed; extra keys refuse. Source
  record semantics and joins are owned by Plans/Test_Capture_and_Motion_Evidence.md#TCME-1314. This definition adopts
  EventRecord/CV-317 and CV-339, not a copied envelope. Scope is application_or_project; validate WorkflowScopeV2
  from shared_integration_runtime.schema.json and recompute the reversible Project partition. Whole-string and exact-type
  checks apply after resolving every referenced schema, even unvisited branches; inherited pattern-only and format-only
  annotations never suffice. Schema validation is necessary but owner source joins, current admission, custody,
  transition and read-time access are additional guards.


  The source record''s SHA-256 is over exact immutable stored source bytes; its own logical/media/physical hashes
  remain separate domains, with source provenance validated by the genuine owner. Body resolution validates the
  same selected schema whether inline or through SP-337 payload_ref; apply the 16384-byte limit to each complete
  stored part, including an operation wrapper after an event body is externalized. Metadata, payload BLAKE3 addressing,
  original full-value receipt commitments and producer-semantic digest keep their existing independent owner recipes.
  App physical wrappers adopt CV-366, Project physical values adopt SP-236/SP-339; no sibling or legacy schema receives
  current-write authority. No number/time implementation is authored here. Phase-2 shared NUMRULE/format adoption
  and guard-isolation proof remain required. Proposed payload existence is not event admission.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_segment_corrupt
  uses schema_id pm.event_payload.testing.capture.segment_corrupt.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_segment_corruptApplicationV1
  uses schema_id pm.event_payload.testing.capture.segment_corrupt.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage rows
  list both editions; no Project resource is nulled or rewritten.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume existing
  projections.
depends_on:
- CV-317
- CV-339
- CV-366
- TCME-006
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof is inferred.
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
- Plans/Contracts_V0.md
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


### CV-1315 - testing.capture.segment_finalized closed payload

```yaml
plan_unit_id: CV-1315
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'NEWLY AUTHORED exact payload for `testing.capture.segment_finalized@1.0.0`: schema_id `pm.event_payload.testing.capture.segment_finalized.v1`,
  schema version 1.0.0; sole closed root at Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_segment_finalized.
  Required properties are schema_id, schema_version, event_type, owner_operation_id, scope, source_record, before_record,
  permission_snapshot_ref, capture_session_id, segment_id. All nested records are closed; extra keys refuse. Source
  record semantics and joins are owned by Plans/Test_Capture_and_Motion_Evidence.md#TCME-1315. This definition adopts
  EventRecord/CV-317 and CV-339, not a copied envelope. Scope is application_or_project; validate WorkflowScopeV2
  from shared_integration_runtime.schema.json and recompute the reversible Project partition. Whole-string and exact-type
  checks apply after resolving every referenced schema, even unvisited branches; inherited pattern-only and format-only
  annotations never suffice. Schema validation is necessary but owner source joins, current admission, custody,
  transition and read-time access are additional guards.


  The source record''s SHA-256 is over exact immutable stored source bytes; its own logical/media/physical hashes
  remain separate domains, with source provenance validated by the genuine owner. Body resolution validates the
  same selected schema whether inline or through SP-337 payload_ref; apply the 16384-byte limit to each complete
  stored part, including an operation wrapper after an event body is externalized. Metadata, payload BLAKE3 addressing,
  original full-value receipt commitments and producer-semantic digest keep their existing independent owner recipes.
  App physical wrappers adopt CV-366, Project physical values adopt SP-236/SP-339; no sibling or legacy schema receives
  current-write authority. No number/time implementation is authored here. Phase-2 shared NUMRULE/format adoption
  and guard-isolation proof remain required. Proposed payload existence is not event admission.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_segment_finalized
  uses schema_id pm.event_payload.testing.capture.segment_finalized.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_segment_finalizedApplicationV1
  uses schema_id pm.event_payload.testing.capture.segment_finalized.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage rows
  list both editions; no Project resource is nulled or rewritten.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume existing
  projections.
depends_on:
- CV-317
- CV-339
- CV-366
- TCME-006
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof is inferred.
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
- Plans/Contracts_V0.md
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


### CV-1316 - testing.capture.segment_recovered closed payload

```yaml
plan_unit_id: CV-1316
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'NEWLY AUTHORED exact payload for `testing.capture.segment_recovered@1.0.0`: schema_id `pm.event_payload.testing.capture.segment_recovered.v1`,
  schema version 1.0.0; sole closed root at Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_segment_recovered.
  Required properties are schema_id, schema_version, event_type, owner_operation_id, scope, source_record, before_record,
  permission_snapshot_ref, capture_session_id, segment_id, recovery_receipt_ref. All nested records are closed;
  extra keys refuse. Source record semantics and joins are owned by Plans/Test_Capture_and_Motion_Evidence.md#TCME-1316.
  This definition adopts EventRecord/CV-317 and CV-339, not a copied envelope. Scope is application_or_project;
  validate WorkflowScopeV2 from shared_integration_runtime.schema.json and recompute the reversible Project partition.
  Whole-string and exact-type checks apply after resolving every referenced schema, even unvisited branches; inherited
  pattern-only and format-only annotations never suffice. Schema validation is necessary but owner source joins,
  current admission, custody, transition and read-time access are additional guards.


  The source record''s SHA-256 is over exact immutable stored source bytes; its own logical/media/physical hashes
  remain separate domains, with source provenance validated by the genuine owner. Body resolution validates the
  same selected schema whether inline or through SP-337 payload_ref; apply the 16384-byte limit to each complete
  stored part, including an operation wrapper after an event body is externalized. Metadata, payload BLAKE3 addressing,
  original full-value receipt commitments and producer-semantic digest keep their existing independent owner recipes.
  App physical wrappers adopt CV-366, Project physical values adopt SP-236/SP-339; no sibling or legacy schema receives
  current-write authority. No number/time implementation is authored here. Phase-2 shared NUMRULE/format adoption
  and guard-isolation proof remain required. Proposed payload existence is not event admission.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_segment_recovered
  uses schema_id pm.event_payload.testing.capture.segment_recovered.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_segment_recoveredApplicationV1
  uses schema_id pm.event_payload.testing.capture.segment_recovered.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage rows
  list both editions; no Project resource is nulled or rewritten.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume existing
  projections.
depends_on:
- CV-317
- CV-339
- CV-366
- TCME-006
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof is inferred.
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
- Plans/Contracts_V0.md
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


### CV-1317 - testing.capture.started closed payload

```yaml
plan_unit_id: CV-1317
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'NEWLY AUTHORED exact payload for `testing.capture.started@1.0.0`: schema_id `pm.event_payload.testing.capture.started.v1`,
  schema version 1.0.0; sole closed root at Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_started.
  Required properties are schema_id, schema_version, event_type, owner_operation_id, scope, source_record, before_record,
  permission_snapshot_ref, capture_session_id, start_receipt_ref. All nested records are closed; extra keys refuse.
  Source record semantics and joins are owned by Plans/Test_Capture_and_Motion_Evidence.md#TCME-1317. This definition
  adopts EventRecord/CV-317 and CV-339, not a copied envelope. Scope is application_or_project; validate WorkflowScopeV2
  from shared_integration_runtime.schema.json and recompute the reversible Project partition. Whole-string and exact-type
  checks apply after resolving every referenced schema, even unvisited branches; inherited pattern-only and format-only
  annotations never suffice. Schema validation is necessary but owner source joins, current admission, custody,
  transition and read-time access are additional guards.


  The source record''s SHA-256 is over exact immutable stored source bytes; its own logical/media/physical hashes
  remain separate domains, with source provenance validated by the genuine owner. Body resolution validates the
  same selected schema whether inline or through SP-337 payload_ref; apply the 16384-byte limit to each complete
  stored part, including an operation wrapper after an event body is externalized. Metadata, payload BLAKE3 addressing,
  original full-value receipt commitments and producer-semantic digest keep their existing independent owner recipes.
  App physical wrappers adopt CV-366, Project physical values adopt SP-236/SP-339; no sibling or legacy schema receives
  current-write authority. No number/time implementation is authored here. Phase-2 shared NUMRULE/format adoption
  and guard-isolation proof remain required. Proposed payload existence is not event admission.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_started
  uses schema_id pm.event_payload.testing.capture.started.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_startedApplicationV1
  uses schema_id pm.event_payload.testing.capture.started.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage rows
  list both editions; no Project resource is nulled or rewritten.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume existing
  projections.
depends_on:
- CV-317
- CV-339
- CV-366
- TCME-006
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof is inferred.
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
- Plans/Contracts_V0.md
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


### CV-1318 - testing.capture.stopped closed payload

```yaml
plan_unit_id: CV-1318
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'NEWLY AUTHORED exact payload for `testing.capture.stopped@1.0.0`: schema_id `pm.event_payload.testing.capture.stopped.v1`,
  schema version 1.0.0; sole closed root at Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_stopped.
  Required properties are schema_id, schema_version, event_type, owner_operation_id, scope, source_record, before_record,
  permission_snapshot_ref, capture_session_id, stop_receipt_ref. All nested records are closed; extra keys refuse.
  Source record semantics and joins are owned by Plans/Test_Capture_and_Motion_Evidence.md#TCME-1318. This definition
  adopts EventRecord/CV-317 and CV-339, not a copied envelope. Scope is application_or_project; validate WorkflowScopeV2
  from shared_integration_runtime.schema.json and recompute the reversible Project partition. Whole-string and exact-type
  checks apply after resolving every referenced schema, even unvisited branches; inherited pattern-only and format-only
  annotations never suffice. Schema validation is necessary but owner source joins, current admission, custody,
  transition and read-time access are additional guards.


  The source record''s SHA-256 is over exact immutable stored source bytes; its own logical/media/physical hashes
  remain separate domains, with source provenance validated by the genuine owner. Body resolution validates the
  same selected schema whether inline or through SP-337 payload_ref; apply the 16384-byte limit to each complete
  stored part, including an operation wrapper after an event body is externalized. Metadata, payload BLAKE3 addressing,
  original full-value receipt commitments and producer-semantic digest keep their existing independent owner recipes.
  App physical wrappers adopt CV-366, Project physical values adopt SP-236/SP-339; no sibling or legacy schema receives
  current-write authority. No number/time implementation is authored here. Phase-2 shared NUMRULE/format adoption
  and guard-isolation proof remain required. Proposed payload existence is not event admission.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_stopped
  uses schema_id pm.event_payload.testing.capture.stopped.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_stoppedApplicationV1
  uses schema_id pm.event_payload.testing.capture.stopped.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage rows
  list both editions; no Project resource is nulled or rewritten.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume existing
  projections.
depends_on:
- CV-317
- CV-339
- CV-366
- TCME-006
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof is inferred.
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
- Plans/Contracts_V0.md
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


### CV-1319 - testing.capture.target_changed closed payload

```yaml
plan_unit_id: CV-1319
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'NEWLY AUTHORED exact payload for `testing.capture.target_changed@1.0.0`: schema_id `pm.event_payload.testing.capture.target_changed.v1`,
  schema version 1.0.0; sole closed root at Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_target_changed.
  Required properties are schema_id, schema_version, event_type, owner_operation_id, scope, source_record, before_record,
  permission_snapshot_ref, capture_session_id, switch_id. All nested records are closed; extra keys refuse. Source
  record semantics and joins are owned by Plans/Test_Capture_and_Motion_Evidence.md#TCME-1319. This definition adopts
  EventRecord/CV-317 and CV-339, not a copied envelope. Scope is application_or_project; validate WorkflowScopeV2
  from shared_integration_runtime.schema.json and recompute the reversible Project partition. Whole-string and exact-type
  checks apply after resolving every referenced schema, even unvisited branches; inherited pattern-only and format-only
  annotations never suffice. Schema validation is necessary but owner source joins, current admission, custody,
  transition and read-time access are additional guards.


  The source record''s SHA-256 is over exact immutable stored source bytes; its own logical/media/physical hashes
  remain separate domains, with source provenance validated by the genuine owner. Body resolution validates the
  same selected schema whether inline or through SP-337 payload_ref; apply the 16384-byte limit to each complete
  stored part, including an operation wrapper after an event body is externalized. Metadata, payload BLAKE3 addressing,
  original full-value receipt commitments and producer-semantic digest keep their existing independent owner recipes.
  App physical wrappers adopt CV-366, Project physical values adopt SP-236/SP-339; no sibling or legacy schema receives
  current-write authority. No number/time implementation is authored here. Phase-2 shared NUMRULE/format adoption
  and guard-isolation proof remain required. Proposed payload existence is not event admission.


  Exact scope-edition selection: Project payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_target_changed
  uses schema_id pm.event_payload.testing.capture.target_changed.v1 and application payload Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_capture_target_changedApplicationV1
  uses schema_id pm.event_payload.testing.capture.target_changed.application.v1. Each root enforces its own scope_kind;
  select no mixed edition. Its operation/checkpoint application value roots have ApplicationV1 suffixes, logical
  IDs .application.v1, and distinct .application.v1: physical keys with app partition. Exact prepared Storage rows
  list both editions; no Project resource is nulled or rewritten.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume existing
  projections.
depends_on:
- CV-317
- CV-339
- CV-366
- TCME-006
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof is inferred.
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
- Plans/Contracts_V0.md
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


### CV-1320 - testing.runtime_enabled_for_adapter closed payload

```yaml
plan_unit_id: CV-1320
unit_type: interface_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'NEWLY AUTHORED exact payload for `testing.runtime_enabled_for_adapter@1.0.0`: schema_id `pm.event_payload.testing.runtime_enabled_for_adapter.v1`,
  schema version 1.0.0; sole closed root at Plans/w3c_test_capture_event_contracts.schema.json#/$defs/testing_runtime_enabled_for_adapter.
  Required properties are schema_id, schema_version, event_type, owner_operation_id, scope, source_record, before_record,
  permission_snapshot_ref, adapter_id, project_id, capability_probe_ref, permission_snapshot_id, enabled_at_utc,
  reason_code. All nested records are closed; extra keys refuse. Source record semantics and joins are owned by
  Plans/Automated_Testing_System.md#ATS-1220. This definition adopts EventRecord/CV-317 and CV-339, not a copied
  envelope. Scope is project_only; validate WorkflowScopeV2 from shared_integration_runtime.schema.json and recompute
  the reversible Project partition. Whole-string and exact-type checks apply after resolving every referenced schema,
  even unvisited branches; inherited pattern-only and format-only annotations never suffice. Schema validation is
  necessary but owner source joins, current admission, custody, transition and read-time access are additional guards.


  The source record''s SHA-256 is over exact immutable stored source bytes; its own logical/media/physical hashes
  remain separate domains, with source provenance validated by the genuine owner. Body resolution validates the
  same selected schema whether inline or through SP-337 payload_ref; apply the 16384-byte limit to each complete
  stored part, including an operation wrapper after an event body is externalized. Metadata, payload BLAKE3 addressing,
  original full-value receipt commitments and producer-semantic digest keep their existing independent owner recipes.
  App physical wrappers adopt CV-366, Project physical values adopt SP-236/SP-339; no sibling or legacy schema receives
  current-write authority. No number/time implementation is authored here. Phase-2 shared NUMRULE/format adoption
  and guard-isolation proof remain required. Proposed payload existence is not event admission.'
gui_related: false
gui_classification_reason: Owns persisted event/receipt and validation semantics; visible surfaces consume existing
  projections.
depends_on:
- CV-317
- CV-339
- CV-366
- ATS-026
unblocks: []
acceptance_criteria:
- The exact family uses its own newly authored prepared contract without event admission.
- All enumerated joins, lifecycle predicates, custody and withdrawal guards are required; no runtime proof is inferred.
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
- Plans/Contracts_V0.md
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
