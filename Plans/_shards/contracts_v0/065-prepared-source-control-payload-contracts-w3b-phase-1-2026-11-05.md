# Shard 065: Prepared Source Control payload contracts — W3B phase 1, 2026-11-05

Source: `Plans/Contracts_V0.md`

Source lines: L24470-L25777

Source SHA256: `7c468c3eb8c08ba9874aa2eb2f2515ceb9347f564f345f99b6eb7048812ce0d0`

---

## Prepared Source Control payload contracts — W3B phase 1, 2026-11-05

Each new unit below owns exactly one closed payload and its EventRecord joins. Definitions are newly authored under deck-2 item 9.a A; membership remains ABSENT. EventRecord, number, timestamp, producer-semantic digest and physical-byte recipes remain with CV-317/CV-339 and Storage SP-236/SP-278/SP-286/SP-337. Phase 2 adopts the reviewed shared number/date-time helper and guard-isolation tool; phase 1 adds no local codec, timestamp validator or oracle implementation.

### CV-1250 — source_control.backend.detected closed payload and joins

```yaml
plan_unit_id: CV-1250
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored payload owner for exactly source_control.backend.detected@1.0.0: Plans/source_control_event_contracts.schema.json#/$defs/backend_detected_payload,
  schema_id=pm.source_control_event.backend_detected.payload.v1, schema_version=1.0.0, root additionalProperties=false
  and every listed field required. SCS-1250 owns meaning; SP-1250 owns original source/custody. The payload fields
  are schema_id, schema_version, project_id, owner_operation_id, source_fact_ref, execution_host_id, execution_environment_id,
  source_location_id, detected_backends, observation_state, setup_state_ref. Values are derived from the authenticated
  original source body, not trusted from an event caller. The original request is the exact v2 legacy_exact wrapper
  over the existing command request; cmd.source_control.backend.detect and its command_instance_id/idempotency/scope
  must join the actual source.  Validate and resolve every schema reference eagerly, including branches no positive
  visits. Before values are consumed check exact types, native tagged revision branches and full identifier/hash
  lengths; reject trailing LF/CR and string booleans/numbers, null/array/object substitutions. Enforce all inherited
  owner timestamp/URI/UUID formats through the actual shared owner profile, with fail-closed startup if unavailable;
  format annotations alone do not validate them. Native Git SHA-1/SHA-256 OID length joins its object_format; JJ
  preserves change/commit/operation/workspace/bookmarks. Source snapshot joins each of this family''s predicates:
  detected_backends is exactly the observed Git/Jujutsu set in the actual setup-state source; observation_state
  and completeness agree with the original observation; empty is not substituted for unavailable; source Host/Environment/topology
  equals the accepted backend.detect scope. source_fact_ref resolves the exact canonical fact key and does not authenticate
  a matching fixture by itself. EventRecord event_type/payload_schema_id/scope/project/lineage/actor/correlation/idempotency
  joins SCS-1250, CV-317 and the selected original source. Normal current append uses EventRecord 2.0.0 and dedupe_by_idempotency_key,
  refusing projector_replay_only. Use Storage''s exact <=16 KiB inline-body rule and SP-337 for larger bodies; decoded
  referenced payload must validate against the same closed definition, with actual BLAKE3/size/media-type checks.
  Producer semantic equality uses CV-317 and the original payload representation/recipe, never Storage-assigned
  sequence/time. History selects only authenticated original editions and cannot choose weaker rules from caller
  metadata. No local number/date-time implementation is authored; phase 2 uses the reviewed shared helper. Membership
  remains ABSENT and criterion 12 PARTIAL.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- CV-317
- CV-339
- SCS-1250
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.backend.detected
- pm.source_control_event.backend_detected.payload.v1
- 1.0.0
- SP-337
```

### CV-1251 — source_control.backend.selected closed payload and joins

```yaml
plan_unit_id: CV-1251
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored payload owner for exactly source_control.backend.selected@1.0.0: Plans/source_control_event_contracts.schema.json#/$defs/backend_selected_payload,
  schema_id=pm.source_control_event.backend_selected.payload.v1, schema_version=1.0.0, root additionalProperties=false
  and every listed field required. SCS-1251 owns meaning; SP-1251 owns original source/custody. The payload fields
  are schema_id, schema_version, project_id, owner_operation_id, source_fact_ref, execution_host_id, execution_environment_id,
  source_location_id, previous_backend, selected_backend, setup_state_ref. Values are derived from the authenticated
  original source body, not trusted from an event caller. The original request is the exact v2 legacy_exact wrapper
  over the existing command request; cmd.source_control.backend.select and its command_instance_id/idempotency/scope
  must join the actual source.  Validate and resolve every schema reference eagerly, including branches no positive
  visits. Before values are consumed check exact types, native tagged revision branches and full identifier/hash
  lengths; reject trailing LF/CR and string booleans/numbers, null/array/object substitutions. Enforce all inherited
  owner timestamp/URI/UUID formats through the actual shared owner profile, with fail-closed startup if unavailable;
  format annotations alone do not validate them. Native Git SHA-1/SHA-256 OID length joins its object_format; JJ
  preserves change/commit/operation/workspace/bookmarks. Source snapshot joins each of this family''s predicates:
  selected_backend equals the accepted request, verified effective setup and original result; previous_backend equals
  the saved pre-selection value; selection is committed, rather than a presentation-only profile preview. source_fact_ref
  resolves the exact canonical fact key and does not authenticate a matching fixture by itself. EventRecord event_type/payload_schema_id/scope/project/lineage/actor/correlation/idempotency
  joins SCS-1251, CV-317 and the selected original source. Normal current append uses EventRecord 2.0.0 and dedupe_by_idempotency_key,
  refusing projector_replay_only. Use Storage''s exact <=16 KiB inline-body rule and SP-337 for larger bodies; decoded
  referenced payload must validate against the same closed definition, with actual BLAKE3/size/media-type checks.
  Producer semantic equality uses CV-317 and the original payload representation/recipe, never Storage-assigned
  sequence/time. History selects only authenticated original editions and cannot choose weaker rules from caller
  metadata. No local number/date-time implementation is authored; phase 2 uses the reviewed shared helper. Membership
  remains ABSENT and criterion 12 PARTIAL.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- CV-317
- CV-339
- SCS-1251
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.backend.selected
- pm.source_control_event.backend_selected.payload.v1
- 1.0.0
- SP-337
```

### CV-1252 — source_control.checkpoint.created closed payload and joins

```yaml
plan_unit_id: CV-1252
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored payload owner for exactly source_control.checkpoint.created@1.0.0: Plans/source_control_event_contracts.schema.json#/$defs/checkpoint_created_payload,
  schema_id=pm.source_control_event.checkpoint_created.payload.v1, schema_version=1.0.0, root additionalProperties=false
  and every listed field required. SCS-1252 owns meaning; SP-1252 owns original source/custody. The payload fields
  are schema_id, schema_version, project_id, owner_operation_id, source_fact_ref, execution_host_id, execution_environment_id,
  source_location_id, repo_id, scm_backend, workspace_id, checkpoint_id, checkpoint_ref, checkpoint_generation,
  checkpoint_revision. Values are derived from the authenticated original source body, not trusted from an event
  caller. The original request is the exact v2 legacy_exact wrapper over the existing command request; cmd.source_control.checkpoint.create
  and its command_instance_id/idempotency/scope must join the actual source.  Validate and resolve every schema
  reference eagerly, including branches no positive visits. Before values are consumed check exact types, native
  tagged revision branches and full identifier/hash lengths; reject trailing LF/CR and string booleans/numbers,
  null/array/object substitutions. Enforce all inherited owner timestamp/URI/UUID formats through the actual shared
  owner profile, with fail-closed startup if unavailable; format annotations alone do not validate them. Native
  Git SHA-1/SHA-256 OID length joins its object_format; JJ preserves change/commit/operation/workspace/bookmarks.
  Source snapshot joins each of this family''s predicates: checkpoint ID, purpose and expected generation join the
  original create request and saved checkpoint; checkpoint_revision is the actual Git or JJ native saved revision,
  with the exact backend tag; the checkpoint exists durably before the created fact is published. source_fact_ref
  resolves the exact canonical fact key and does not authenticate a matching fixture by itself. EventRecord event_type/payload_schema_id/scope/project/lineage/actor/correlation/idempotency
  joins SCS-1252, CV-317 and the selected original source. Normal current append uses EventRecord 2.0.0 and dedupe_by_idempotency_key,
  refusing projector_replay_only. Use Storage''s exact <=16 KiB inline-body rule and SP-337 for larger bodies; decoded
  referenced payload must validate against the same closed definition, with actual BLAKE3/size/media-type checks.
  Producer semantic equality uses CV-317 and the original payload representation/recipe, never Storage-assigned
  sequence/time. History selects only authenticated original editions and cannot choose weaker rules from caller
  metadata. No local number/date-time implementation is authored; phase 2 uses the reviewed shared helper. Membership
  remains ABSENT and criterion 12 PARTIAL.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- CV-317
- CV-339
- SCS-1252
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.checkpoint.created
- pm.source_control_event.checkpoint_created.payload.v1
- 1.0.0
- SP-337
```

### CV-1253 — source_control.checkpoint.restored closed payload and joins

```yaml
plan_unit_id: CV-1253
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored payload owner for exactly source_control.checkpoint.restored@1.0.0: Plans/source_control_event_contracts.schema.json#/$defs/checkpoint_restored_payload,
  schema_id=pm.source_control_event.checkpoint_restored.payload.v1, schema_version=1.0.0, root additionalProperties=false
  and every listed field required. SCS-1253 owns meaning; SP-1253 owns original source/custody. The payload fields
  are schema_id, schema_version, project_id, owner_operation_id, source_fact_ref, execution_host_id, execution_environment_id,
  source_location_id, repo_id, scm_backend, workspace_id, checkpoint_id, checkpoint_ref, checkpoint_generation,
  before_revision, after_revision, operation_receipt_ref. Values are derived from the authenticated original source
  body, not trusted from an event caller. The original request is the exact v2 legacy_exact wrapper over the existing
  command request; cmd.source_control.checkpoint.restore and its command_instance_id/idempotency/scope must join
  the actual source.  Validate and resolve every schema reference eagerly, including branches no positive visits.
  Before values are consumed check exact types, native tagged revision branches and full identifier/hash lengths;
  reject trailing LF/CR and string booleans/numbers, null/array/object substitutions. Enforce all inherited owner
  timestamp/URI/UUID formats through the actual shared owner profile, with fail-closed startup if unavailable; format
  annotations alone do not validate them. Native Git SHA-1/SHA-256 OID length joins its object_format; JJ preserves
  change/commit/operation/workspace/bookmarks. Source snapshot joins each of this family''s predicates: checkpoint
  ref, ID and generation resolve the same exact selected checkpoint as the accepted restore request; restore_confirmation
  is true in the original request and independent permission/FileSafe decisions admit the restore; after_revision
  matches independently observed native restoration, not merely a zero exit code. source_fact_ref resolves the exact
  canonical fact key and does not authenticate a matching fixture by itself. EventRecord event_type/payload_schema_id/scope/project/lineage/actor/correlation/idempotency
  joins SCS-1253, CV-317 and the selected original source. Normal current append uses EventRecord 2.0.0 and dedupe_by_idempotency_key,
  refusing projector_replay_only. Use Storage''s exact <=16 KiB inline-body rule and SP-337 for larger bodies; decoded
  referenced payload must validate against the same closed definition, with actual BLAKE3/size/media-type checks.
  Producer semantic equality uses CV-317 and the original payload representation/recipe, never Storage-assigned
  sequence/time. History selects only authenticated original editions and cannot choose weaker rules from caller
  metadata. No local number/date-time implementation is authored; phase 2 uses the reviewed shared helper. Membership
  remains ABSENT and criterion 12 PARTIAL.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- CV-317
- CV-339
- SCS-1253
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.checkpoint.restored
- pm.source_control_event.checkpoint_restored.payload.v1
- 1.0.0
- SP-337
```

### CV-1254 — source_control.remote.fetch_completed closed payload and joins

```yaml
plan_unit_id: CV-1254
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored payload owner for exactly source_control.remote.fetch_completed@1.0.0: Plans/source_control_event_contracts.schema.json#/$defs/remote_fetch_completed_payload,
  schema_id=pm.source_control_event.remote_fetch_completed.payload.v1, schema_version=1.0.0, root additionalProperties=false
  and every listed field required. SCS-1254 owns meaning; SP-1254 owns original source/custody. The payload fields
  are schema_id, schema_version, project_id, owner_operation_id, source_fact_ref, execution_host_id, execution_environment_id,
  source_location_id, repo_id, scm_backend, workspace_id, repository_context_ref, remote_target_ref, observable_work_id,
  before_revision, after_revision, operation_receipt_ref. Values are derived from the authenticated original source
  body, not trusted from an event caller. The original request is the exact v2 legacy_exact wrapper over the existing
  command request; cmd.source_control.remote.fetch and its command_instance_id/idempotency/scope must join the actual
  source.  Validate and resolve every schema reference eagerly, including branches no positive visits. Before values
  are consumed check exact types, native tagged revision branches and full identifier/hash lengths; reject trailing
  LF/CR and string booleans/numbers, null/array/object substitutions. Enforce all inherited owner timestamp/URI/UUID
  formats through the actual shared owner profile, with fail-closed startup if unavailable; format annotations alone
  do not validate them. Native Git SHA-1/SHA-256 OID length joins its object_format; JJ preserves change/commit/operation/workspace/bookmarks.
  Source snapshot joins each of this family''s predicates: remote_target_ref resolves the original captured repository/remote/instance/account/native
  revision, never remote display text; writer, credential, capability, permission and FileSafe evidence joins the
  actual dispatch target; the original successful receipt and native observation prove the exact after revision,
  with no unresolved effect. source_fact_ref resolves the exact canonical fact key and does not authenticate a matching
  fixture by itself. EventRecord event_type/payload_schema_id/scope/project/lineage/actor/correlation/idempotency
  joins SCS-1254, CV-317 and the selected original source. Normal current append uses EventRecord 2.0.0 and dedupe_by_idempotency_key,
  refusing projector_replay_only. Use Storage''s exact <=16 KiB inline-body rule and SP-337 for larger bodies; decoded
  referenced payload must validate against the same closed definition, with actual BLAKE3/size/media-type checks.
  Producer semantic equality uses CV-317 and the original payload representation/recipe, never Storage-assigned
  sequence/time. History selects only authenticated original editions and cannot choose weaker rules from caller
  metadata. No local number/date-time implementation is authored; phase 2 uses the reviewed shared helper. Membership
  remains ABSENT and criterion 12 PARTIAL.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- CV-317
- CV-339
- SCS-1254
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.remote.fetch_completed
- pm.source_control_event.remote_fetch_completed.payload.v1
- 1.0.0
- SP-337
```

### CV-1255 — source_control.remote.fetch_started closed payload and joins

```yaml
plan_unit_id: CV-1255
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored payload owner for exactly source_control.remote.fetch_started@1.0.0: Plans/source_control_event_contracts.schema.json#/$defs/remote_fetch_started_payload,
  schema_id=pm.source_control_event.remote_fetch_started.payload.v1, schema_version=1.0.0, root additionalProperties=false
  and every listed field required. SCS-1255 owns meaning; SP-1255 owns original source/custody. The payload fields
  are schema_id, schema_version, project_id, owner_operation_id, source_fact_ref, execution_host_id, execution_environment_id,
  source_location_id, repo_id, scm_backend, workspace_id, repository_context_ref, remote_target_ref, observable_work_id,
  before_revision. Values are derived from the authenticated original source body, not trusted from an event caller.
  The original request is the exact v2 legacy_exact wrapper over the existing command request; cmd.source_control.remote.fetch
  and its command_instance_id/idempotency/scope must join the actual source.  Validate and resolve every schema
  reference eagerly, including branches no positive visits. Before values are consumed check exact types, native
  tagged revision branches and full identifier/hash lengths; reject trailing LF/CR and string booleans/numbers,
  null/array/object substitutions. Enforce all inherited owner timestamp/URI/UUID formats through the actual shared
  owner profile, with fail-closed startup if unavailable; format annotations alone do not validate them. Native
  Git SHA-1/SHA-256 OID length joins its object_format; JJ preserves change/commit/operation/workspace/bookmarks.
  Source snapshot joins each of this family''s predicates: remote_target_ref resolves the original captured repository/remote/instance/account/native
  revision, never remote display text; writer, credential, capability, permission and FileSafe evidence joins the
  actual dispatch target; the start source is durable before the first native effect. source_fact_ref resolves the
  exact canonical fact key and does not authenticate a matching fixture by itself. EventRecord event_type/payload_schema_id/scope/project/lineage/actor/correlation/idempotency
  joins SCS-1255, CV-317 and the selected original source. Normal current append uses EventRecord 2.0.0 and dedupe_by_idempotency_key,
  refusing projector_replay_only. Use Storage''s exact <=16 KiB inline-body rule and SP-337 for larger bodies; decoded
  referenced payload must validate against the same closed definition, with actual BLAKE3/size/media-type checks.
  Producer semantic equality uses CV-317 and the original payload representation/recipe, never Storage-assigned
  sequence/time. History selects only authenticated original editions and cannot choose weaker rules from caller
  metadata. No local number/date-time implementation is authored; phase 2 uses the reviewed shared helper. Membership
  remains ABSENT and criterion 12 PARTIAL.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- CV-317
- CV-339
- SCS-1255
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.remote.fetch_started
- pm.source_control_event.remote_fetch_started.payload.v1
- 1.0.0
- SP-337
```

### CV-1256 — source_control.remote.publish_completed closed payload and joins

```yaml
plan_unit_id: CV-1256
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored payload owner for exactly source_control.remote.publish_completed@1.0.0: Plans/source_control_event_contracts.schema.json#/$defs/remote_publish_completed_payload,
  schema_id=pm.source_control_event.remote_publish_completed.payload.v1, schema_version=1.0.0, root additionalProperties=false
  and every listed field required. SCS-1256 owns meaning; SP-1256 owns original source/custody. The payload fields
  are schema_id, schema_version, project_id, owner_operation_id, source_fact_ref, execution_host_id, execution_environment_id,
  source_location_id, repo_id, scm_backend, workspace_id, repository_context_ref, remote_target_ref, observable_work_id,
  before_revision, after_revision, operation_receipt_ref. Values are derived from the authenticated original source
  body, not trusted from an event caller. The original request is the exact v2 legacy_exact wrapper over the existing
  command request; cmd.source_control.remote.publish and its command_instance_id/idempotency/scope must join the
  actual source.  Validate and resolve every schema reference eagerly, including branches no positive visits. Before
  values are consumed check exact types, native tagged revision branches and full identifier/hash lengths; reject
  trailing LF/CR and string booleans/numbers, null/array/object substitutions. Enforce all inherited owner timestamp/URI/UUID
  formats through the actual shared owner profile, with fail-closed startup if unavailable; format annotations alone
  do not validate them. Native Git SHA-1/SHA-256 OID length joins its object_format; JJ preserves change/commit/operation/workspace/bookmarks.
  Source snapshot joins each of this family''s predicates: remote_target_ref resolves the original captured repository/remote/instance/account/native
  revision, never remote display text; writer, credential, capability, permission and FileSafe evidence joins the
  actual dispatch target; the original successful receipt and native observation prove the exact after revision,
  with no unresolved effect; partial fan-out cannot be presented as all-target success or automatically retried.
  source_fact_ref resolves the exact canonical fact key and does not authenticate a matching fixture by itself.
  EventRecord event_type/payload_schema_id/scope/project/lineage/actor/correlation/idempotency joins SCS-1256, CV-317
  and the selected original source. Normal current append uses EventRecord 2.0.0 and dedupe_by_idempotency_key,
  refusing projector_replay_only. Use Storage''s exact <=16 KiB inline-body rule and SP-337 for larger bodies; decoded
  referenced payload must validate against the same closed definition, with actual BLAKE3/size/media-type checks.
  Producer semantic equality uses CV-317 and the original payload representation/recipe, never Storage-assigned
  sequence/time. History selects only authenticated original editions and cannot choose weaker rules from caller
  metadata. No local number/date-time implementation is authored; phase 2 uses the reviewed shared helper. Membership
  remains ABSENT and criterion 12 PARTIAL.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- CV-317
- CV-339
- SCS-1256
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.remote.publish_completed
- pm.source_control_event.remote_publish_completed.payload.v1
- 1.0.0
- SP-337
```

### CV-1257 — source_control.remote.publish_started closed payload and joins

```yaml
plan_unit_id: CV-1257
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored payload owner for exactly source_control.remote.publish_started@1.0.0: Plans/source_control_event_contracts.schema.json#/$defs/remote_publish_started_payload,
  schema_id=pm.source_control_event.remote_publish_started.payload.v1, schema_version=1.0.0, root additionalProperties=false
  and every listed field required. SCS-1257 owns meaning; SP-1257 owns original source/custody. The payload fields
  are schema_id, schema_version, project_id, owner_operation_id, source_fact_ref, execution_host_id, execution_environment_id,
  source_location_id, repo_id, scm_backend, workspace_id, repository_context_ref, remote_target_ref, observable_work_id,
  before_revision. Values are derived from the authenticated original source body, not trusted from an event caller.
  The original request is the exact v2 legacy_exact wrapper over the existing command request; cmd.source_control.remote.publish
  and its command_instance_id/idempotency/scope must join the actual source.  Validate and resolve every schema
  reference eagerly, including branches no positive visits. Before values are consumed check exact types, native
  tagged revision branches and full identifier/hash lengths; reject trailing LF/CR and string booleans/numbers,
  null/array/object substitutions. Enforce all inherited owner timestamp/URI/UUID formats through the actual shared
  owner profile, with fail-closed startup if unavailable; format annotations alone do not validate them. Native
  Git SHA-1/SHA-256 OID length joins its object_format; JJ preserves change/commit/operation/workspace/bookmarks.
  Source snapshot joins each of this family''s predicates: remote_target_ref resolves the original captured repository/remote/instance/account/native
  revision, never remote display text; writer, credential, capability, permission and FileSafe evidence joins the
  actual dispatch target; the start source is durable before the first native effect; partial fan-out cannot be
  presented as all-target success or automatically retried. source_fact_ref resolves the exact canonical fact key
  and does not authenticate a matching fixture by itself. EventRecord event_type/payload_schema_id/scope/project/lineage/actor/correlation/idempotency
  joins SCS-1257, CV-317 and the selected original source. Normal current append uses EventRecord 2.0.0 and dedupe_by_idempotency_key,
  refusing projector_replay_only. Use Storage''s exact <=16 KiB inline-body rule and SP-337 for larger bodies; decoded
  referenced payload must validate against the same closed definition, with actual BLAKE3/size/media-type checks.
  Producer semantic equality uses CV-317 and the original payload representation/recipe, never Storage-assigned
  sequence/time. History selects only authenticated original editions and cannot choose weaker rules from caller
  metadata. No local number/date-time implementation is authored; phase 2 uses the reviewed shared helper. Membership
  remains ABSENT and criterion 12 PARTIAL.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- CV-317
- CV-339
- SCS-1257
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.remote.publish_started
- pm.source_control_event.remote_publish_started.payload.v1
- 1.0.0
- SP-337
```

### CV-1258 — source_control.remote.sync_completed closed payload and joins

```yaml
plan_unit_id: CV-1258
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored payload owner for exactly source_control.remote.sync_completed@1.0.0: Plans/source_control_event_contracts.schema.json#/$defs/remote_sync_completed_payload,
  schema_id=pm.source_control_event.remote_sync_completed.payload.v1, schema_version=1.0.0, root additionalProperties=false
  and every listed field required. SCS-1258 owns meaning; SP-1258 owns original source/custody. The payload fields
  are schema_id, schema_version, project_id, owner_operation_id, source_fact_ref, execution_host_id, execution_environment_id,
  source_location_id, repo_id, scm_backend, workspace_id, repository_context_ref, remote_target_ref, observable_work_id,
  before_revision, after_revision, operation_receipt_ref, sync_variant. Values are derived from the authenticated
  original source body, not trusted from an event caller. The original request is the exact v2 legacy_exact wrapper
  over the existing command request; cmd.source_control.remote.sync and its command_instance_id/idempotency/scope
  must join the actual source. The separately owned v2 local_reconcile_only request is also accepted exactly as
  SCS-025 defines; it never inherits transport-only v1 fields or invents a command-instance field absent from that
  selected schema.  Validate and resolve every schema reference eagerly, including branches no positive visits.
  Before values are consumed check exact types, native tagged revision branches and full identifier/hash lengths;
  reject trailing LF/CR and string booleans/numbers, null/array/object substitutions. Enforce all inherited owner
  timestamp/URI/UUID formats through the actual shared owner profile, with fail-closed startup if unavailable; format
  annotations alone do not validate them. Native Git SHA-1/SHA-256 OID length joins its object_format; JJ preserves
  change/commit/operation/workspace/bookmarks. Source snapshot joins each of this family''s predicates: remote_target_ref
  resolves the original captured repository/remote/instance/account/native revision, never remote display text;
  writer, credential, capability, permission and FileSafe evidence joins the actual dispatch target; the original
  successful receipt and native observation prove the exact after revision, with no unresolved effect; local_reconcile_only
  has an empty push-target set and no publication; resolved strategy and both original/fork revisions match the
  accepted v2 request. source_fact_ref resolves the exact canonical fact key and does not authenticate a matching
  fixture by itself. EventRecord event_type/payload_schema_id/scope/project/lineage/actor/correlation/idempotency
  joins SCS-1258, CV-317 and the selected original source. Normal current append uses EventRecord 2.0.0 and dedupe_by_idempotency_key,
  refusing projector_replay_only. Use Storage''s exact <=16 KiB inline-body rule and SP-337 for larger bodies; decoded
  referenced payload must validate against the same closed definition, with actual BLAKE3/size/media-type checks.
  Producer semantic equality uses CV-317 and the original payload representation/recipe, never Storage-assigned
  sequence/time. History selects only authenticated original editions and cannot choose weaker rules from caller
  metadata. No local number/date-time implementation is authored; phase 2 uses the reviewed shared helper. Membership
  remains ABSENT and criterion 12 PARTIAL.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- CV-317
- CV-339
- SCS-1258
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.remote.sync_completed
- pm.source_control_event.remote_sync_completed.payload.v1
- 1.0.0
- SP-337
```

### CV-1259 — source_control.remote.sync_started closed payload and joins

```yaml
plan_unit_id: CV-1259
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored payload owner for exactly source_control.remote.sync_started@1.0.0: Plans/source_control_event_contracts.schema.json#/$defs/remote_sync_started_payload,
  schema_id=pm.source_control_event.remote_sync_started.payload.v1, schema_version=1.0.0, root additionalProperties=false
  and every listed field required. SCS-1259 owns meaning; SP-1259 owns original source/custody. The payload fields
  are schema_id, schema_version, project_id, owner_operation_id, source_fact_ref, execution_host_id, execution_environment_id,
  source_location_id, repo_id, scm_backend, workspace_id, repository_context_ref, remote_target_ref, observable_work_id,
  before_revision, sync_variant. Values are derived from the authenticated original source body, not trusted from
  an event caller. The original request is the exact v2 legacy_exact wrapper over the existing command request;
  cmd.source_control.remote.sync and its command_instance_id/idempotency/scope must join the actual source. The
  separately owned v2 local_reconcile_only request is also accepted exactly as SCS-025 defines; it never inherits
  transport-only v1 fields or invents a command-instance field absent from that selected schema.  Validate and resolve
  every schema reference eagerly, including branches no positive visits. Before values are consumed check exact
  types, native tagged revision branches and full identifier/hash lengths; reject trailing LF/CR and string booleans/numbers,
  null/array/object substitutions. Enforce all inherited owner timestamp/URI/UUID formats through the actual shared
  owner profile, with fail-closed startup if unavailable; format annotations alone do not validate them. Native
  Git SHA-1/SHA-256 OID length joins its object_format; JJ preserves change/commit/operation/workspace/bookmarks.
  Source snapshot joins each of this family''s predicates: remote_target_ref resolves the original captured repository/remote/instance/account/native
  revision, never remote display text; writer, credential, capability, permission and FileSafe evidence joins the
  actual dispatch target; the start source is durable before the first native effect; local_reconcile_only has an
  empty push-target set and no publication; resolved strategy and both original/fork revisions match the accepted
  v2 request. source_fact_ref resolves the exact canonical fact key and does not authenticate a matching fixture
  by itself. EventRecord event_type/payload_schema_id/scope/project/lineage/actor/correlation/idempotency joins
  SCS-1259, CV-317 and the selected original source. Normal current append uses EventRecord 2.0.0 and dedupe_by_idempotency_key,
  refusing projector_replay_only. Use Storage''s exact <=16 KiB inline-body rule and SP-337 for larger bodies; decoded
  referenced payload must validate against the same closed definition, with actual BLAKE3/size/media-type checks.
  Producer semantic equality uses CV-317 and the original payload representation/recipe, never Storage-assigned
  sequence/time. History selects only authenticated original editions and cannot choose weaker rules from caller
  metadata. No local number/date-time implementation is authored; phase 2 uses the reviewed shared helper. Membership
  remains ABSENT and criterion 12 PARTIAL.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- CV-317
- CV-339
- SCS-1259
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.remote.sync_started
- pm.source_control_event.remote_sync_started.payload.v1
- 1.0.0
- SP-337
```

### CV-1260 — source_control.repository.bound closed payload and joins

```yaml
plan_unit_id: CV-1260
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored payload owner for exactly source_control.repository.bound@1.0.0: Plans/source_control_event_contracts.schema.json#/$defs/repository_bound_payload,
  schema_id=pm.source_control_event.repository_bound.payload.v1, schema_version=1.0.0, root additionalProperties=false
  and every listed field required. SCS-1260 owns meaning; SP-1260 owns original source/custody. The payload fields
  are schema_id, schema_version, project_id, owner_operation_id, source_fact_ref, execution_host_id, execution_environment_id,
  source_location_id, repo_id, scm_backend, workspace_id, repository_context_ref, binding_ref, binding_generation,
  native_revision. Values are derived from the authenticated original source body, not trusted from an event caller.
  The original request is the exact v2 legacy_exact wrapper over the existing command request; cmd.source_control.repository.bind
  and its command_instance_id/idempotency/scope must join the actual source.  Validate and resolve every schema
  reference eagerly, including branches no positive visits. Before values are consumed check exact types, native
  tagged revision branches and full identifier/hash lengths; reject trailing LF/CR and string booleans/numbers,
  null/array/object substitutions. Enforce all inherited owner timestamp/URI/UUID formats through the actual shared
  owner profile, with fail-closed startup if unavailable; format annotations alone do not validate them. Native
  Git SHA-1/SHA-256 OID length joins its object_format; JJ preserves change/commit/operation/workspace/bookmarks.
  Source snapshot joins each of this family''s predicates: binding resolves the requested Project/repository/backend/workspace
  and independent forge binding; native_revision equals the verified existing checkout, never a path or remote-name
  guess; a conflicting existing binding refuses without overwrite. source_fact_ref resolves the exact canonical
  fact key and does not authenticate a matching fixture by itself. EventRecord event_type/payload_schema_id/scope/project/lineage/actor/correlation/idempotency
  joins SCS-1260, CV-317 and the selected original source. Normal current append uses EventRecord 2.0.0 and dedupe_by_idempotency_key,
  refusing projector_replay_only. Use Storage''s exact <=16 KiB inline-body rule and SP-337 for larger bodies; decoded
  referenced payload must validate against the same closed definition, with actual BLAKE3/size/media-type checks.
  Producer semantic equality uses CV-317 and the original payload representation/recipe, never Storage-assigned
  sequence/time. History selects only authenticated original editions and cannot choose weaker rules from caller
  metadata. No local number/date-time implementation is authored; phase 2 uses the reviewed shared helper. Membership
  remains ABSENT and criterion 12 PARTIAL.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- CV-317
- CV-339
- SCS-1260
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.repository.bound
- pm.source_control_event.repository_bound.payload.v1
- 1.0.0
- SP-337
```

### CV-1261 — source_control.repository.unbound closed payload and joins

```yaml
plan_unit_id: CV-1261
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored payload owner for exactly source_control.repository.unbound@1.0.0: Plans/source_control_event_contracts.schema.json#/$defs/repository_unbound_payload,
  schema_id=pm.source_control_event.repository_unbound.payload.v1, schema_version=1.0.0, root additionalProperties=false
  and every listed field required. SCS-1261 owns meaning; SP-1261 owns original source/custody. The payload fields
  are schema_id, schema_version, project_id, owner_operation_id, source_fact_ref, execution_host_id, execution_environment_id,
  source_location_id, repo_id, scm_backend, workspace_id, repository_context_ref, binding_ref, binding_generation,
  disposition_receipt_ref. Values are derived from the authenticated original source body, not trusted from an event
  caller. The original request is the exact v2 legacy_exact wrapper over the existing command request; cmd.source_control.repository.unbind
  and its command_instance_id/idempotency/scope must join the actual source.  Validate and resolve every schema
  reference eagerly, including branches no positive visits. Before values are consumed check exact types, native
  tagged revision branches and full identifier/hash lengths; reject trailing LF/CR and string booleans/numbers,
  null/array/object substitutions. Enforce all inherited owner timestamp/URI/UUID formats through the actual shared
  owner profile, with fail-closed startup if unavailable; format annotations alone do not validate them. Native
  Git SHA-1/SHA-256 OID length joins its object_format; JJ preserves change/commit/operation/workspace/bookmarks.
  Source snapshot joins each of this family''s predicates: the pre-removal binding is the same captured Project/repository/workspace
  binding; dependency and active-work disposition is actually settled in the original disposition receipt; only
  the selected binding is removed and native repository bytes are not inferred deleted. source_fact_ref resolves
  the exact canonical fact key and does not authenticate a matching fixture by itself. EventRecord event_type/payload_schema_id/scope/project/lineage/actor/correlation/idempotency
  joins SCS-1261, CV-317 and the selected original source. Normal current append uses EventRecord 2.0.0 and dedupe_by_idempotency_key,
  refusing projector_replay_only. Use Storage''s exact <=16 KiB inline-body rule and SP-337 for larger bodies; decoded
  referenced payload must validate against the same closed definition, with actual BLAKE3/size/media-type checks.
  Producer semantic equality uses CV-317 and the original payload representation/recipe, never Storage-assigned
  sequence/time. History selects only authenticated original editions and cannot choose weaker rules from caller
  metadata. No local number/date-time implementation is authored; phase 2 uses the reviewed shared helper. Membership
  remains ABSENT and criterion 12 PARTIAL.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- CV-317
- CV-339
- SCS-1261
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.repository.unbound
- pm.source_control_event.repository_unbound.payload.v1
- 1.0.0
- SP-337
```

### CV-1262 — source_control.status.refreshed closed payload and joins

```yaml
plan_unit_id: CV-1262
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored payload owner for exactly source_control.status.refreshed@1.0.0: Plans/source_control_event_contracts.schema.json#/$defs/status_refreshed_payload,
  schema_id=pm.source_control_event.status_refreshed.payload.v1, schema_version=1.0.0, root additionalProperties=false
  and every listed field required. SCS-1262 owns meaning; SP-1262 owns original source/custody. The payload fields
  are schema_id, schema_version, project_id, owner_operation_id, source_fact_ref, execution_host_id, execution_environment_id,
  source_location_id, repo_id, scm_backend, workspace_id, repository_context_ref, status_snapshot_ref, native_revision,
  observation_state. Values are derived from the authenticated original source body, not trusted from an event caller.
  The original request is the exact v2 legacy_exact wrapper over the existing command request; cmd.source_control.status.refresh
  and its command_instance_id/idempotency/scope must join the actual source.  Validate and resolve every schema
  reference eagerly, including branches no positive visits. Before values are consumed check exact types, native
  tagged revision branches and full identifier/hash lengths; reject trailing LF/CR and string booleans/numbers,
  null/array/object substitutions. Enforce all inherited owner timestamp/URI/UUID formats through the actual shared
  owner profile, with fail-closed startup if unavailable; format annotations alone do not validate them. Native
  Git SHA-1/SHA-256 OID length joins its object_format; JJ preserves change/commit/operation/workspace/bookmarks.
  Source snapshot joins each of this family''s predicates: status_snapshot_ref resolves the original bounded native
  status result for this repository/workspace; observation_state and native_revision agree with the actual observation
  and completeness; read-only observation did not execute hooks, filters or a JJ snapshot. source_fact_ref resolves
  the exact canonical fact key and does not authenticate a matching fixture by itself. EventRecord event_type/payload_schema_id/scope/project/lineage/actor/correlation/idempotency
  joins SCS-1262, CV-317 and the selected original source. Normal current append uses EventRecord 2.0.0 and dedupe_by_idempotency_key,
  refusing projector_replay_only. Use Storage''s exact <=16 KiB inline-body rule and SP-337 for larger bodies; decoded
  referenced payload must validate against the same closed definition, with actual BLAKE3/size/media-type checks.
  Producer semantic equality uses CV-317 and the original payload representation/recipe, never Storage-assigned
  sequence/time. History selects only authenticated original editions and cannot choose weaker rules from caller
  metadata. No local number/date-time implementation is authored; phase 2 uses the reviewed shared helper. Membership
  remains ABSENT and criterion 12 PARTIAL.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- CV-317
- CV-339
- SCS-1262
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.status.refreshed
- pm.source_control_event.status_refreshed.payload.v1
- 1.0.0
- SP-337
```

### CV-1263 — source_control.workspace.created closed payload and joins

```yaml
plan_unit_id: CV-1263
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored payload owner for exactly source_control.workspace.created@1.0.0: Plans/source_control_event_contracts.schema.json#/$defs/workspace_created_payload,
  schema_id=pm.source_control_event.workspace_created.payload.v1, schema_version=1.0.0, root additionalProperties=false
  and every listed field required. SCS-1263 owns meaning; SP-1263 owns original source/custody. The payload fields
  are schema_id, schema_version, project_id, owner_operation_id, source_fact_ref, execution_host_id, execution_environment_id,
  source_location_id, repo_id, scm_backend, workspace_id, repository_context_ref, created_workspace_id, native_revision,
  operation_receipt_ref. Values are derived from the authenticated original source body, not trusted from an event
  caller. The original request is the exact v2 legacy_exact wrapper over the existing command request; cmd.source_control.workspace.create
  and its command_instance_id/idempotency/scope must join the actual source.  Validate and resolve every schema
  reference eagerly, including branches no positive visits. Before values are consumed check exact types, native
  tagged revision branches and full identifier/hash lengths; reject trailing LF/CR and string booleans/numbers,
  null/array/object substitutions. Enforce all inherited owner timestamp/URI/UUID formats through the actual shared
  owner profile, with fail-closed startup if unavailable; format annotations alone do not validate them. Native
  Git SHA-1/SHA-256 OID length joins its object_format; JJ preserves change/commit/operation/workspace/bookmarks.
  Source snapshot joins each of this family''s predicates: created_workspace_id equals the requested_workspace_id
  and observed native workspace; conflict plan and current writer/permission/FileSafe evidence admit that exact
  destination; original receipt proves known successful creation and exact caller return. source_fact_ref resolves
  the exact canonical fact key and does not authenticate a matching fixture by itself. EventRecord event_type/payload_schema_id/scope/project/lineage/actor/correlation/idempotency
  joins SCS-1263, CV-317 and the selected original source. Normal current append uses EventRecord 2.0.0 and dedupe_by_idempotency_key,
  refusing projector_replay_only. Use Storage''s exact <=16 KiB inline-body rule and SP-337 for larger bodies; decoded
  referenced payload must validate against the same closed definition, with actual BLAKE3/size/media-type checks.
  Producer semantic equality uses CV-317 and the original payload representation/recipe, never Storage-assigned
  sequence/time. History selects only authenticated original editions and cannot choose weaker rules from caller
  metadata. No local number/date-time implementation is authored; phase 2 uses the reviewed shared helper. Membership
  remains ABSENT and criterion 12 PARTIAL.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- CV-317
- CV-339
- SCS-1263
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.workspace.created
- pm.source_control_event.workspace_created.payload.v1
- 1.0.0
- SP-337
```

### CV-1264 — source_control.workspace.opened closed payload and joins

```yaml
plan_unit_id: CV-1264
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored payload owner for exactly source_control.workspace.opened@1.0.0: Plans/source_control_event_contracts.schema.json#/$defs/workspace_opened_payload,
  schema_id=pm.source_control_event.workspace_opened.payload.v1, schema_version=1.0.0, root additionalProperties=false
  and every listed field required. SCS-1264 owns meaning; SP-1264 owns original source/custody. The payload fields
  are schema_id, schema_version, project_id, owner_operation_id, source_fact_ref, execution_host_id, execution_environment_id,
  source_location_id, repo_id, scm_backend, workspace_id, repository_context_ref, opened_workspace_id, native_revision,
  open_result_ref. Values are derived from the authenticated original source body, not trusted from an event caller.
  The original request is the exact v2 legacy_exact wrapper over the existing command request; cmd.source_control.workspace.open
  and its command_instance_id/idempotency/scope must join the actual source.  Validate and resolve every schema
  reference eagerly, including branches no positive visits. Before values are consumed check exact types, native
  tagged revision branches and full identifier/hash lengths; reject trailing LF/CR and string booleans/numbers,
  null/array/object substitutions. Enforce all inherited owner timestamp/URI/UUID formats through the actual shared
  owner profile, with fail-closed startup if unavailable; format annotations alone do not validate them. Native
  Git SHA-1/SHA-256 OID length joins its object_format; JJ preserves change/commit/operation/workspace/bookmarks.
  Source snapshot joins each of this family''s predicates: opened_workspace_id equals the existing requested native
  workspace and original open result; native_revision/backend/currentness are actual read evidence; open is not
  substituted for workspace.switch or creation. source_fact_ref resolves the exact canonical fact key and does not
  authenticate a matching fixture by itself. EventRecord event_type/payload_schema_id/scope/project/lineage/actor/correlation/idempotency
  joins SCS-1264, CV-317 and the selected original source. Normal current append uses EventRecord 2.0.0 and dedupe_by_idempotency_key,
  refusing projector_replay_only. Use Storage''s exact <=16 KiB inline-body rule and SP-337 for larger bodies; decoded
  referenced payload must validate against the same closed definition, with actual BLAKE3/size/media-type checks.
  Producer semantic equality uses CV-317 and the original payload representation/recipe, never Storage-assigned
  sequence/time. History selects only authenticated original editions and cannot choose weaker rules from caller
  metadata. No local number/date-time implementation is authored; phase 2 uses the reviewed shared helper. Membership
  remains ABSENT and criterion 12 PARTIAL.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- CV-317
- CV-339
- SCS-1264
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.workspace.opened
- pm.source_control_event.workspace_opened.payload.v1
- 1.0.0
- SP-337
```

### CV-1265 — source_control.workspace.removed closed payload and joins

```yaml
plan_unit_id: CV-1265
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored payload owner for exactly source_control.workspace.removed@1.0.0: Plans/source_control_event_contracts.schema.json#/$defs/workspace_removed_payload,
  schema_id=pm.source_control_event.workspace_removed.payload.v1, schema_version=1.0.0, root additionalProperties=false
  and every listed field required. SCS-1265 owns meaning; SP-1265 owns original source/custody. The payload fields
  are schema_id, schema_version, project_id, owner_operation_id, source_fact_ref, execution_host_id, execution_environment_id,
  source_location_id, repo_id, scm_backend, workspace_id, repository_context_ref, removed_workspace_id, before_revision,
  disposition_receipt_ref, operation_receipt_ref. Values are derived from the authenticated original source body,
  not trusted from an event caller. The original request is the exact v2 legacy_exact wrapper over the existing
  command request; cmd.source_control.workspace.remove and its command_instance_id/idempotency/scope must join the
  actual source.  Validate and resolve every schema reference eagerly, including branches no positive visits. Before
  values are consumed check exact types, native tagged revision branches and full identifier/hash lengths; reject
  trailing LF/CR and string booleans/numbers, null/array/object substitutions. Enforce all inherited owner timestamp/URI/UUID
  formats through the actual shared owner profile, with fail-closed startup if unavailable; format annotations alone
  do not validate them. Native Git SHA-1/SHA-256 OID length joins its object_format; JJ preserves change/commit/operation/workspace/bookmarks.
  Source snapshot joins each of this family''s predicates: removed_workspace_id matches the exact original workspace
  and native removal result; ownership/dependency/active-work/data-disposition checks are independently settled;
  receipt distinguishes native removal from merely unbinding and does not infer cleanup from expiry. source_fact_ref
  resolves the exact canonical fact key and does not authenticate a matching fixture by itself. EventRecord event_type/payload_schema_id/scope/project/lineage/actor/correlation/idempotency
  joins SCS-1265, CV-317 and the selected original source. Normal current append uses EventRecord 2.0.0 and dedupe_by_idempotency_key,
  refusing projector_replay_only. Use Storage''s exact <=16 KiB inline-body rule and SP-337 for larger bodies; decoded
  referenced payload must validate against the same closed definition, with actual BLAKE3/size/media-type checks.
  Producer semantic equality uses CV-317 and the original payload representation/recipe, never Storage-assigned
  sequence/time. History selects only authenticated original editions and cannot choose weaker rules from caller
  metadata. No local number/date-time implementation is authored; phase 2 uses the reviewed shared helper. Membership
  remains ABSENT and criterion 12 PARTIAL.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- CV-317
- CV-339
- SCS-1265
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.workspace.removed
- pm.source_control_event.workspace_removed.payload.v1
- 1.0.0
- SP-337
```

### CV-1266 — source_control.workspace.switched closed payload and joins

```yaml
plan_unit_id: CV-1266
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored payload owner for exactly source_control.workspace.switched@1.0.0: Plans/source_control_event_contracts.schema.json#/$defs/workspace_switched_payload,
  schema_id=pm.source_control_event.workspace_switched.payload.v1, schema_version=1.0.0, root additionalProperties=false
  and every listed field required. SCS-1266 owns meaning; SP-1266 owns original source/custody. The payload fields
  are schema_id, schema_version, project_id, owner_operation_id, source_fact_ref, execution_host_id, execution_environment_id,
  source_location_id, repo_id, scm_backend, workspace_id, repository_context_ref, previous_workspace_id, selected_workspace_id,
  before_revision, after_revision, operation_receipt_ref. Values are derived from the authenticated original source
  body, not trusted from an event caller. The original request is the exact v2 legacy_exact wrapper over the existing
  command request; cmd.source_control.workspace.switch and its command_instance_id/idempotency/scope must join the
  actual source.  Validate and resolve every schema reference eagerly, including branches no positive visits. Before
  values are consumed check exact types, native tagged revision branches and full identifier/hash lengths; reject
  trailing LF/CR and string booleans/numbers, null/array/object substitutions. Enforce all inherited owner timestamp/URI/UUID
  formats through the actual shared owner profile, with fail-closed startup if unavailable; format annotations alone
  do not validate them. Native Git SHA-1/SHA-256 OID length joins its object_format; JJ preserves change/commit/operation/workspace/bookmarks.
  Source snapshot joins each of this family''s predicates: selected_workspace_id equals the original requested native
  workspace and observed switch result; previous_workspace_id is the captured actual selection, not current UI focus;
  compatibility select_worktree normalization occurs before one canonical command dispatch. source_fact_ref resolves
  the exact canonical fact key and does not authenticate a matching fixture by itself. EventRecord event_type/payload_schema_id/scope/project/lineage/actor/correlation/idempotency
  joins SCS-1266, CV-317 and the selected original source. Normal current append uses EventRecord 2.0.0 and dedupe_by_idempotency_key,
  refusing projector_replay_only. Use Storage''s exact <=16 KiB inline-body rule and SP-337 for larger bodies; decoded
  referenced payload must validate against the same closed definition, with actual BLAKE3/size/media-type checks.
  Producer semantic equality uses CV-317 and the original payload representation/recipe, never Storage-assigned
  sequence/time. History selects only authenticated original editions and cannot choose weaker rules from caller
  metadata. No local number/date-time implementation is authored; phase 2 uses the reviewed shared helper. Membership
  remains ABSENT and criterion 12 PARTIAL.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- CV-317
- CV-339
- SCS-1266
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.workspace.switched
- pm.source_control_event.workspace_switched.payload.v1
- 1.0.0
- SP-337
```

### CV-1267 — source_control.writer_lease.granted closed payload and joins

```yaml
plan_unit_id: CV-1267
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored payload owner for exactly source_control.writer_lease.granted@1.0.0: Plans/source_control_event_contracts.schema.json#/$defs/writer_lease_granted_payload,
  schema_id=pm.source_control_event.writer_lease_granted.payload.v1, schema_version=1.0.0, root additionalProperties=false
  and every listed field required. SCS-1267 owns meaning; SP-1267 owns original source/custody. The payload fields
  are schema_id, schema_version, project_id, owner_operation_id, source_fact_ref, execution_host_id, execution_environment_id,
  source_location_id, repo_id, scm_backend, workspace_id, lease_id, lease_ref, holder_ref, lease_generation, lease_epoch,
  prior_state, state. Values are derived from the authenticated original source body, not trusted from an event
  caller. original_request is null; the actual authenticated WriterLeaseCoordinator acceptance and original lease
  transition are the source, never a caller-created request.  Validate and resolve every schema reference eagerly,
  including branches no positive visits. Before values are consumed check exact types, native tagged revision branches
  and full identifier/hash lengths; reject trailing LF/CR and string booleans/numbers, null/array/object substitutions.
  Enforce all inherited owner timestamp/URI/UUID formats through the actual shared owner profile, with fail-closed
  startup if unavailable; format annotations alone do not validate them. Native Git SHA-1/SHA-256 OID length joins
  its object_format; JJ preserves change/commit/operation/workspace/bookmarks. Source snapshot joins each of this
  family''s predicates: the actual writer lease has the same repository/workspace/backend/holder/generation/epoch
  as the fact; no competing active writer exists and required previous reconciliation is clean; acquired/expiry
  times and currentness are verified by the lease owner, not supplied as payload authority. source_fact_ref resolves
  the exact canonical fact key and does not authenticate a matching fixture by itself. EventRecord event_type/payload_schema_id/scope/project/lineage/actor/correlation/idempotency
  joins SCS-1267, CV-317 and the selected original source. Normal current append uses EventRecord 2.0.0 and dedupe_by_idempotency_key,
  refusing projector_replay_only. Use Storage''s exact <=16 KiB inline-body rule and SP-337 for larger bodies; decoded
  referenced payload must validate against the same closed definition, with actual BLAKE3/size/media-type checks.
  Producer semantic equality uses CV-317 and the original payload representation/recipe, never Storage-assigned
  sequence/time. History selects only authenticated original editions and cannot choose weaker rules from caller
  metadata. No local number/date-time implementation is authored; phase 2 uses the reviewed shared helper. Membership
  remains ABSENT and criterion 12 PARTIAL.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- CV-317
- CV-339
- SCS-1267
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.writer_lease.granted
- pm.source_control_event.writer_lease_granted.payload.v1
- 1.0.0
- SP-337
```

### CV-1268 — source_control.writer_lease.lost closed payload and joins

```yaml
plan_unit_id: CV-1268
unit_type: requirement
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored payload owner for exactly source_control.writer_lease.lost@1.0.0: Plans/source_control_event_contracts.schema.json#/$defs/writer_lease_lost_payload,
  schema_id=pm.source_control_event.writer_lease_lost.payload.v1, schema_version=1.0.0, root additionalProperties=false
  and every listed field required. SCS-1268 owns meaning; SP-1268 owns original source/custody. The payload fields
  are schema_id, schema_version, project_id, owner_operation_id, source_fact_ref, execution_host_id, execution_environment_id,
  source_location_id, repo_id, scm_backend, workspace_id, lease_id, lease_ref, holder_ref, lease_generation, lease_epoch,
  prior_state, state, reconciliation_state. Values are derived from the authenticated original source body, not
  trusted from an event caller. original_request is null; the actual authenticated WriterLeaseCoordinator acceptance
  and original lease transition are the source, never a caller-created request.  Validate and resolve every schema
  reference eagerly, including branches no positive visits. Before values are consumed check exact types, native
  tagged revision branches and full identifier/hash lengths; reject trailing LF/CR and string booleans/numbers,
  null/array/object substitutions. Enforce all inherited owner timestamp/URI/UUID formats through the actual shared
  owner profile, with fail-closed startup if unavailable; format annotations alone do not validate them. Native
  Git SHA-1/SHA-256 OID length joins its object_format; JJ preserves change/commit/operation/workspace/bookmarks.
  Source snapshot joins each of this family''s predicates: prior active lease and resulting non-authorizing state
  belong to the same original holder/generation/epoch; further mutation is fenced before effect after loss; expiry/revocation
  never becomes clean reconciliation or proof of removed resources. source_fact_ref resolves the exact canonical
  fact key and does not authenticate a matching fixture by itself. EventRecord event_type/payload_schema_id/scope/project/lineage/actor/correlation/idempotency
  joins SCS-1268, CV-317 and the selected original source. Normal current append uses EventRecord 2.0.0 and dedupe_by_idempotency_key,
  refusing projector_replay_only. Use Storage''s exact <=16 KiB inline-body rule and SP-337 for larger bodies; decoded
  referenced payload must validate against the same closed definition, with actual BLAKE3/size/media-type checks.
  Producer semantic equality uses CV-317 and the original payload representation/recipe, never Storage-assigned
  sequence/time. History selects only authenticated original editions and cannot choose weaker rules from caller
  metadata. No local number/date-time implementation is authored; phase 2 uses the reviewed shared helper. Membership
  remains ABSENT and criterion 12 PARTIAL.'
gui_related: false
gui_classification_reason: Defines saved-history contracts and verification, without changing product presentation.
depends_on:
- CV-317
- CV-339
- SCS-1268
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission.
- Every named identity, original source, receipt and read-token join is checked; no replay effect.
- Pending retention or phase-2 oracles cannot be represented as DEPTH_PASS.
validation_surfaces:
- Plans/source_control_event_contracts.schema.json
- Plans/source_control_event_preparation.json
- reports/event-authority-20261105/W3B-oracle-plan.json
risk_class: source_control_history_identity_custody_or_duplicate_effect
reasoning_tier: high
context_scope: w3b_source_control_event_authority
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: prepared_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- deck 2 item 9.a A (2026-11-05)
- Plans/Source_Control_System.md#3.2-canonical-events
negative_constraints:
- No admission, current writer activation, invented retention or native proof.
- No new number/timestamp codec or lane-local guard-isolation machinery.
preserved_exact_tokens:
- source_control.writer_lease.lost
- pm.source_control_event.writer_lease_lost.payload.v1
- 1.0.0
- SP-337
```
