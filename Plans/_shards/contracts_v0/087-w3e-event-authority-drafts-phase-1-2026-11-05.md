# Shard 087: W3E event authority drafts - phase 1 (2026-11-05)

Source: `Plans/Contracts_V0.md`

Source lines: L44607-L45846

Source SHA256: `7607355445ed385c0f6b89282b6688e97f8b115e7918712a620fc8f56d52bf35`

---

## W3E event authority drafts - phase 1 (2026-11-05)

Each unit below is a newly authored per-family contract. All current writer gates remain closed pending separate admission.

### CV-1400 - backup.destination_changed exact prepared payload dispatch

```yaml
plan_unit_id: CV-1400
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored exact payload dispatch for backup.destination_changed@1.0.0, prepared without admission.
  Plans/event_payloads/w3e/backup_destination_changed.schema.json is the sole closed payload schema, logical pm.event_payload.backup.destination_changed.v1;
  BRS-1400 owns its semantic fields, per-field joins, producer, identity, source custody, transitions, consumers,
  retention question and withdrawal. Adopt CV-317 EventRecord and CV-339/SP-286 full-value receipt custody by name;
  do not duplicate the envelope. Required exact fields are schema_id, schema_version, scope_kind, project_id, server_id,
  owner_operation_id, source_custody_ref, source_evidence_ref, backup_destination_id, destination_generation, prior_destination_ref,
  destination_ref, change_kind. Externalized SP-337 body dispatch validates the resolved complete payload against
  this same schema; do not validate the reference string as the object or require payload_ref=null. All $refs resolve
  eagerly. Schema integer domains are inherited, exact Python/JSON boolean-number types are distinct, and identifier/digest
  strings require full consumption without trailing LF. Timestamps, where inherited through source/token schemas,
  use their owner-selected shared profile; write no local validator. No schema or fixture admits this family. retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0 (DL-453, E-CARDS-3 item 1.a, option A), kept permanently, application editions only, with no age or count expiry and no new count allowance; storage pressure refuses new history writes, and explicit application data deletion follows its existing authorized rules. Deleting the described object does not remove this separate history or keep the deleted content. Phase 2 (2026-11-13) runs the executable synthetic oracles of this family in scripts/pm_w3e_event_oracles.py; every refusal is one named single-predicate row of a generated Method B guard table (scripts/pm_w3e_table_*.py) proved by the gated shared scripts/pm_guard_isolation.py through scripts/pm-w3e-guard-proof.py, and rows no input can refuse first stay alone in their own table with a written proof. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 date_time with the owner profile of each field. Membership is ABSENT and native execution NOT_RUN. SP-278 filtered checkpoint, SP-286 original
  receipt and SP-337 payload-store ownership are unchanged.

  change_kind is derived only from the genuine accepted create/update/remove owner result and joins the original
  source manifest. created proves original absence and a new record; updated proves exact changed before/after records;
  removed proves the original removal receipt, an existing before record and absent after record. On removed, destination_ref
  is null and the event generation is the last generation fenced by that original removal result, not a fabricated
  successor object. Removal does not delete a backup repository, revoke unrelated trust or erase historical receipts.
  No unchanged/failed result emits this event.

  '
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- BRS-1400
- CV-317
- CV-339
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: cv-1400_w3e_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- RP-AUTHORITY-INDEFINITE@1.0.0
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### CV-1401 - backup.state_changed exact prepared payload dispatch

```yaml
plan_unit_id: CV-1401
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored exact payload dispatch for backup.state_changed@1.0.0, prepared without admission.
  Plans/event_payloads/w3e/backup_state_changed.schema.json is the sole closed payload schema, logical pm.event_payload.backup.state_changed.v1;
  BRS-1401 owns its semantic fields, per-field joins, producer, identity, source custody, transitions, consumers,
  retention question and withdrawal. Adopt CV-317 EventRecord and CV-339/SP-286 full-value receipt custody by name;
  do not duplicate the envelope. Required exact fields are schema_id, schema_version, scope_kind, project_id, server_id,
  owner_operation_id, source_custody_ref, source_evidence_ref, backup_run_id, backup_id, backup_type, prior_state,
  state, phase_journal_ref, manifest_ref, verification_receipt_ref. Externalized SP-337 body dispatch validates
  the resolved complete payload against this same schema; do not validate the reference string as the object or
  require payload_ref=null. All $refs resolve eagerly. Schema integer domains are inherited, exact Python/JSON boolean-number
  types are distinct, and identifier/digest strings require full consumption without trailing LF. Timestamps, where
  inherited through source/token schemas, use their owner-selected shared profile; write no local validator. No
  schema or fixture admits this family. Project editions take retention_policy_ref=RP-OPERATIONAL-2555D@1.0.0 under the Storage Project first-save anchor adapter (each entry starts its clock at its own saved state change), sharing the existing 2,000,000-entry seven-year Project allowance; application editions take retention_policy_ref=RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0 in the one separate 2,000,000-entry application allowance app:operational_security (DL-455, E-CARDS-3 item 3.a, option A), seven years (220,752,000 seconds) from the original saved change, never restarted by retry, reprocessing or restore. The application policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. Phase 2 (2026-11-13) runs the executable synthetic oracles of this family in scripts/pm_w3e_event_oracles.py; every refusal is one named single-predicate row of a generated Method B guard table (scripts/pm_w3e_table_*.py) proved by the gated shared scripts/pm_guard_isolation.py through scripts/pm-w3e-guard-proof.py, and rows no input can refuse first stay alone in their own table with a written proof. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 date_time with the owner profile of each field. Membership is ABSENT and native execution NOT_RUN. SP-278 filtered checkpoint, SP-286 original receipt and SP-337
  payload-store ownership are unchanged.
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- BRS-1401
- CV-317
- CV-339
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: cv-1401_w3e_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- RP-OPERATIONAL-2555D@1.0.0
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### CV-1402 - remote_access.private_endpoint_state_changed exact prepared payload dispatch

```yaml
plan_unit_id: CV-1402
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored exact payload dispatch for remote_access.private_endpoint_state_changed@1.0.0, prepared
  without admission. Plans/event_payloads/w3e/remote_access_private_endpoint_state_changed.schema.json is the sole
  closed payload schema, logical pm.event_payload.remote_access.private_endpoint_state_changed.v1; RAS-1402 owns
  its semantic fields, per-field joins, producer, identity, source custody, transitions, consumers, retention question
  and withdrawal. Adopt CV-317 EventRecord and CV-339/SP-286 full-value receipt custody by name; do not duplicate
  the envelope. Required exact fields are schema_id, schema_version, scope_kind, project_id, server_id, owner_operation_id,
  source_custody_ref, source_evidence_ref, server_endpoint_id, remote_route_id, connector_id, prior_state, state,
  route_generation, connector_revision. Externalized SP-337 body dispatch validates the resolved complete payload
  against this same schema; do not validate the reference string as the object or require payload_ref=null. All
  $refs resolve eagerly. Schema integer domains are inherited, exact Python/JSON boolean-number types are distinct,
  and identifier/digest strings require full consumption without trailing LF. Timestamps, where inherited through
  source/token schemas, use their owner-selected shared profile; write no local validator. No schema or fixture
  admits this family. retention_policy_ref=RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0 (DL-454, E-CARDS-3 item 2.a, option A), application editions only, kept 90 days (7,776,000 seconds) from the first successful save that survives a restart, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:routine_observation (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. Phase 2 (2026-11-13) runs the executable synthetic oracles of this family in scripts/pm_w3e_event_oracles.py; every refusal is one named single-predicate row of a generated Method B guard table (scripts/pm_w3e_table_*.py) proved by the gated shared scripts/pm_guard_isolation.py through scripts/pm-w3e-guard-proof.py, and rows no input can refuse first stay alone in their own table with a written proof. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 date_time with the owner profile of each field. Membership is ABSENT and native execution NOT_RUN. SP-278 filtered checkpoint, SP-286 original receipt and SP-337 payload-store ownership
  are unchanged.
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-1402
- CV-317
- CV-339
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: cv-1402_w3e_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### CV-1403 - remote_access.proxy_state_changed exact prepared payload dispatch

```yaml
plan_unit_id: CV-1403
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored exact payload dispatch for remote_access.proxy_state_changed@1.0.0, prepared without
  admission. Plans/event_payloads/w3e/remote_access_proxy_state_changed.schema.json is the sole closed payload schema,
  logical pm.event_payload.remote_access.proxy_state_changed.v1; RAS-1403 owns its semantic fields, per-field joins,
  producer, identity, source custody, transitions, consumers, retention question and withdrawal. Adopt CV-317 EventRecord
  and CV-339/SP-286 full-value receipt custody by name; do not duplicate the envelope. Required exact fields are
  schema_id, schema_version, scope_kind, project_id, server_id, owner_operation_id, source_custody_ref, source_evidence_ref,
  remote_route_id, server_endpoint_id, configuration_ref, prior_state, state, route_generation. Externalized SP-337
  body dispatch validates the resolved complete payload against this same schema; do not validate the reference
  string as the object or require payload_ref=null. All $refs resolve eagerly. Schema integer domains are inherited,
  exact Python/JSON boolean-number types are distinct, and identifier/digest strings require full consumption without
  trailing LF. Timestamps, where inherited through source/token schemas, use their owner-selected shared profile;
  write no local validator. No schema or fixture admits this family. retention_policy_ref=RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0 (DL-454, E-CARDS-3 item 2.a, option A), application editions only, kept 90 days (7,776,000 seconds) from the first successful save that survives a restart, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:routine_observation (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. Phase 2 (2026-11-13) runs the executable synthetic oracles of this family in scripts/pm_w3e_event_oracles.py; every refusal is one named single-predicate row of a generated Method B guard table (scripts/pm_w3e_table_*.py) proved by the gated shared scripts/pm_guard_isolation.py through scripts/pm-w3e-guard-proof.py, and rows no input can refuse first stay alone in their own table with a written proof. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 date_time with the owner profile of each field. Membership is ABSENT and native execution NOT_RUN. SP-278 filtered checkpoint, SP-286 original
  receipt and SP-337 payload-store ownership are unchanged.
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-1403
- CV-317
- CV-339
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: cv-1403_w3e_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### CV-1404 - remote_access.public_security_violation_detected exact prepared payload dispatch

```yaml
plan_unit_id: CV-1404
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored exact payload dispatch for remote_access.public_security_violation_detected@1.0.0,
  prepared without admission. Plans/event_payloads/w3e/remote_access_public_security_violation_detected.schema.json
  is the sole closed payload schema, logical pm.event_payload.remote_access.public_security_violation_detected.v1;
  RAS-1404 owns its semantic fields, per-field joins, producer, identity, source custody, transitions, consumers,
  retention question and withdrawal. Adopt CV-317 EventRecord and CV-339/SP-286 full-value receipt custody by name;
  do not duplicate the envelope. Required exact fields are schema_id, schema_version, scope_kind, project_id, server_id,
  owner_operation_id, source_custody_ref, source_evidence_ref, remote_route_id, server_endpoint_id, policy_id, policy_generation,
  detection_id, violated_control, detection_evidence_ref. Externalized SP-337 body dispatch validates the resolved
  complete payload against this same schema; do not validate the reference string as the object or require payload_ref=null.
  All $refs resolve eagerly. Schema integer domains are inherited, exact Python/JSON boolean-number types are distinct,
  and identifier/digest strings require full consumption without trailing LF. Timestamps, where inherited through
  source/token schemas, use their owner-selected shared profile; write no local validator. No schema or fixture
  admits this family. retention_policy_ref=RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0 (DL-455, E-CARDS-3 item 3.a, option A), application editions only, kept seven years (220,752,000 seconds) from the original saved change, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:operational_security (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. Phase 2 (2026-11-13) runs the executable synthetic oracles of this family in scripts/pm_w3e_event_oracles.py; every refusal is one named single-predicate row of a generated Method B guard table (scripts/pm_w3e_table_*.py) proved by the gated shared scripts/pm_guard_isolation.py through scripts/pm-w3e-guard-proof.py, and rows no input can refuse first stay alone in their own table with a written proof. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 date_time with the owner profile of each field. Membership is ABSENT and native execution NOT_RUN. SP-278 filtered checkpoint, SP-286 original receipt and SP-337 payload-store ownership
  are unchanged.
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-1404
- CV-317
- CV-339
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: cv-1404_w3e_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### CV-1405 - remote_access.remote_link_state_changed exact prepared payload dispatch

```yaml
plan_unit_id: CV-1405
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored exact payload dispatch for remote_access.remote_link_state_changed@1.0.0, prepared
  without admission. Plans/event_payloads/w3e/remote_access_remote_link_state_changed.schema.json is the sole closed
  payload schema, logical pm.event_payload.remote_access.remote_link_state_changed.v1; RAS-1405 owns its semantic
  fields, per-field joins, producer, identity, source custody, transitions, consumers, retention question and withdrawal.
  Adopt CV-317 EventRecord and CV-339/SP-286 full-value receipt custody by name; do not duplicate the envelope.
  Required exact fields are schema_id, schema_version, scope_kind, project_id, server_id, owner_operation_id, source_custody_ref,
  source_evidence_ref, configuration_id, remote_route_id, prior_state, state, provider_ref, transport_evidence_ref.
  Externalized SP-337 body dispatch validates the resolved complete payload against this same schema; do not validate
  the reference string as the object or require payload_ref=null. All $refs resolve eagerly. Schema integer domains
  are inherited, exact Python/JSON boolean-number types are distinct, and identifier/digest strings require full
  consumption without trailing LF. Timestamps, where inherited through source/token schemas, use their owner-selected
  shared profile; write no local validator. No schema or fixture admits this family. retention_policy_ref=RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0 (DL-454, E-CARDS-3 item 2.a, option A), application editions only, kept 90 days (7,776,000 seconds) from the first successful save that survives a restart, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:routine_observation (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. Phase 2 (2026-11-13) runs the executable synthetic oracles of this family in scripts/pm_w3e_event_oracles.py; every refusal is one named single-predicate row of a generated Method B guard table (scripts/pm_w3e_table_*.py) proved by the gated shared scripts/pm_guard_isolation.py through scripts/pm-w3e-guard-proof.py, and rows no input can refuse first stay alone in their own table with a written proof. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 date_time with the owner profile of each field. Membership is ABSENT and native execution NOT_RUN. SP-278 filtered checkpoint, SP-286 original
  receipt and SP-337 payload-store ownership are unchanged.
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-1405
- CV-317
- CV-339
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: cv-1405_w3e_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### CV-1406 - remote_access.route_migration_state_changed exact prepared payload dispatch

```yaml
plan_unit_id: CV-1406
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored exact payload dispatch for remote_access.route_migration_state_changed@1.0.0, prepared
  without admission. Plans/event_payloads/w3e/remote_access_route_migration_state_changed.schema.json is the sole
  closed payload schema, logical pm.event_payload.remote_access.route_migration_state_changed.v1; RAS-1406 owns
  its semantic fields, per-field joins, producer, identity, source custody, transitions, consumers, retention question
  and withdrawal. Adopt CV-317 EventRecord and CV-339/SP-286 full-value receipt custody by name; do not duplicate
  the envelope. Required exact fields are schema_id, schema_version, scope_kind, project_id, server_id, owner_operation_id,
  source_custody_ref, source_evidence_ref, migration_id, from_remote_route_id, to_remote_route_id, prior_phase,
  phase, journal_ref, migration_receipt_ref. Externalized SP-337 body dispatch validates the resolved complete payload
  against this same schema; do not validate the reference string as the object or require payload_ref=null. All
  $refs resolve eagerly. Schema integer domains are inherited, exact Python/JSON boolean-number types are distinct,
  and identifier/digest strings require full consumption without trailing LF. Timestamps, where inherited through
  source/token schemas, use their owner-selected shared profile; write no local validator. No schema or fixture
  admits this family. retention_policy_ref=RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0 (DL-455, E-CARDS-3 item 3.a, option A), application editions only, kept seven years (220,752,000 seconds) from the original saved change, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:operational_security (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. Phase 2 (2026-11-13) runs the executable synthetic oracles of this family in scripts/pm_w3e_event_oracles.py; every refusal is one named single-predicate row of a generated Method B guard table (scripts/pm_w3e_table_*.py) proved by the gated shared scripts/pm_guard_isolation.py through scripts/pm-w3e-guard-proof.py, and rows no input can refuse first stay alone in their own table with a written proof. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 date_time with the owner profile of each field. Membership is ABSENT and native execution NOT_RUN. SP-278 filtered checkpoint, SP-286 original receipt and SP-337 payload-store ownership
  are unchanged.
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-1406
- CV-317
- CV-339
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: cv-1406_w3e_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### CV-1407 - remote_access.route_preference_changed exact prepared payload dispatch

```yaml
plan_unit_id: CV-1407
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored exact payload dispatch for remote_access.route_preference_changed@1.0.0, prepared
  without admission. Plans/event_payloads/w3e/remote_access_route_preference_changed.schema.json is the sole closed
  payload schema, logical pm.event_payload.remote_access.route_preference_changed.v1; RAS-1407 owns its semantic
  fields, per-field joins, producer, identity, source custody, transitions, consumers, retention question and withdrawal.
  Adopt CV-317 EventRecord and CV-339/SP-286 full-value receipt custody by name; do not duplicate the envelope.
  Required exact fields are schema_id, schema_version, scope_kind, project_id, server_id, owner_operation_id, source_custody_ref,
  source_evidence_ref, remote_route_id, previous_route_id, policy_ref, policy_generation, preference_receipt_ref.
  Externalized SP-337 body dispatch validates the resolved complete payload against this same schema; do not validate
  the reference string as the object or require payload_ref=null. All $refs resolve eagerly. Schema integer domains
  are inherited, exact Python/JSON boolean-number types are distinct, and identifier/digest strings require full
  consumption without trailing LF. Timestamps, where inherited through source/token schemas, use their owner-selected
  shared profile; write no local validator. No schema or fixture admits this family. retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0 (DL-453, E-CARDS-3 item 1.a, option A), kept permanently, application editions only, with no age or count expiry and no new count allowance; storage pressure refuses new history writes, and explicit application data deletion follows its existing authorized rules. Deleting the described object does not remove this separate history or keep the deleted content. Phase 2 (2026-11-13) runs the executable synthetic oracles of this family in scripts/pm_w3e_event_oracles.py; every refusal is one named single-predicate row of a generated Method B guard table (scripts/pm_w3e_table_*.py) proved by the gated shared scripts/pm_guard_isolation.py through scripts/pm-w3e-guard-proof.py, and rows no input can refuse first stay alone in their own table with a written proof. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 date_time with the owner profile of each field. Membership is ABSENT and native execution NOT_RUN. SP-278 filtered checkpoint, SP-286 original
  receipt and SP-337 payload-store ownership are unchanged.
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-1407
- CV-317
- CV-339
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: cv-1407_w3e_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- RP-AUTHORITY-INDEFINITE@1.0.0
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### CV-1408 - remote_access.route_state_changed exact prepared payload dispatch

```yaml
plan_unit_id: CV-1408
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored exact payload dispatch for remote_access.route_state_changed@1.0.0, prepared without
  admission. Plans/event_payloads/w3e/remote_access_route_state_changed.schema.json is the sole closed payload schema,
  logical pm.event_payload.remote_access.route_state_changed.v1; RAS-1408 owns its semantic fields, per-field joins,
  producer, identity, source custody, transitions, consumers, retention question and withdrawal. Adopt CV-317 EventRecord
  and CV-339/SP-286 full-value receipt custody by name; do not duplicate the envelope. Required exact fields are
  schema_id, schema_version, scope_kind, project_id, server_id, owner_operation_id, source_custody_ref, source_evidence_ref,
  remote_route_id, server_endpoint_id, route_type, prior_state, state, route_generation, test_receipt_ref. Externalized
  SP-337 body dispatch validates the resolved complete payload against this same schema; do not validate the reference
  string as the object or require payload_ref=null. All $refs resolve eagerly. Schema integer domains are inherited,
  exact Python/JSON boolean-number types are distinct, and identifier/digest strings require full consumption without
  trailing LF. Timestamps, where inherited through source/token schemas, use their owner-selected shared profile;
  write no local validator. No schema or fixture admits this family. retention_policy_ref=RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0 (DL-454, E-CARDS-3 item 2.a, option A), application editions only, kept 90 days (7,776,000 seconds) from the first successful save that survives a restart, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:routine_observation (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. Phase 2 (2026-11-13) runs the executable synthetic oracles of this family in scripts/pm_w3e_event_oracles.py; every refusal is one named single-predicate row of a generated Method B guard table (scripts/pm_w3e_table_*.py) proved by the gated shared scripts/pm_guard_isolation.py through scripts/pm-w3e-guard-proof.py, and rows no input can refuse first stay alone in their own table with a written proof. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 date_time with the owner profile of each field. Membership is ABSENT and native execution NOT_RUN. SP-278 filtered checkpoint, SP-286 original
  receipt and SP-337 payload-store ownership are unchanged.
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-1408
- CV-317
- CV-339
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: cv-1408_w3e_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### CV-1409 - remote_access.route_test_completed exact prepared payload dispatch

```yaml
plan_unit_id: CV-1409
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored exact payload dispatch for remote_access.route_test_completed@1.0.0, prepared without
  admission. Plans/event_payloads/w3e/remote_access_route_test_completed.schema.json is the sole closed payload
  schema, logical pm.event_payload.remote_access.route_test_completed.v1; RAS-1409 owns its semantic fields, per-field
  joins, producer, identity, source custody, transitions, consumers, retention question and withdrawal. Adopt CV-317
  EventRecord and CV-339/SP-286 full-value receipt custody by name; do not duplicate the envelope. Required exact
  fields are schema_id, schema_version, scope_kind, project_id, server_id, owner_operation_id, source_custody_ref,
  source_evidence_ref, receipt_id, remote_route_id, server_endpoint_id, route_type, route_generation, terminal_status,
  test_receipt_ref. Externalized SP-337 body dispatch validates the resolved complete payload against this same
  schema; do not validate the reference string as the object or require payload_ref=null. All $refs resolve eagerly.
  Schema integer domains are inherited, exact Python/JSON boolean-number types are distinct, and identifier/digest
  strings require full consumption without trailing LF. Timestamps, where inherited through source/token schemas,
  use their owner-selected shared profile; write no local validator. No schema or fixture admits this family. retention_policy_ref=RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0 (DL-455, E-CARDS-3 item 3.a, option A), application editions only, kept seven years (220,752,000 seconds) from the original saved change, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:operational_security (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. Phase 2 (2026-11-13) runs the executable synthetic oracles of this family in scripts/pm_w3e_event_oracles.py; every refusal is one named single-predicate row of a generated Method B guard table (scripts/pm_w3e_table_*.py) proved by the gated shared scripts/pm_guard_isolation.py through scripts/pm-w3e-guard-proof.py, and rows no input can refuse first stay alone in their own table with a written proof. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 date_time with the owner profile of each field. Membership is ABSENT and native execution NOT_RUN. SP-278 filtered checkpoint, SP-286 original
  receipt and SP-337 payload-store ownership are unchanged.
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-1409
- CV-317
- CV-339
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: cv-1409_w3e_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### CV-1410 - restore.state_changed exact prepared payload dispatch

```yaml
plan_unit_id: CV-1410
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored exact payload dispatch for restore.state_changed@1.0.0, prepared without admission.
  Plans/event_payloads/w3e/restore_state_changed.schema.json is the sole closed payload schema, logical pm.event_payload.restore.state_changed.v1;
  BRS-1410 owns its semantic fields, per-field joins, producer, identity, source custody, transitions, consumers,
  retention question and withdrawal. Adopt CV-317 EventRecord and CV-339/SP-286 full-value receipt custody by name;
  do not duplicate the envelope. Required exact fields are schema_id, schema_version, scope_kind, project_id, server_id,
  owner_operation_id, source_custody_ref, source_evidence_ref, restore_run_id, mode, prior_state, state, phase_journal_ref,
  restore_receipt_ref, preview_receipt_ref. Externalized SP-337 body dispatch validates the resolved complete payload
  against this same schema; do not validate the reference string as the object or require payload_ref=null. All
  $refs resolve eagerly. Schema integer domains are inherited, exact Python/JSON boolean-number types are distinct,
  and identifier/digest strings require full consumption without trailing LF. Timestamps, where inherited through
  source/token schemas, use their owner-selected shared profile; write no local validator. No schema or fixture
  admits this family. Project editions take retention_policy_ref=RP-OPERATIONAL-2555D@1.0.0 under the Storage Project first-save anchor adapter (each entry starts its clock at its own saved state change), sharing the existing 2,000,000-entry seven-year Project allowance; application editions take retention_policy_ref=RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0 in the one separate 2,000,000-entry application allowance app:operational_security (DL-455, E-CARDS-3 item 3.a, option A), seven years (220,752,000 seconds) from the original saved change, never restarted by retry, reprocessing or restore. The application policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. Phase 2 (2026-11-13) runs the executable synthetic oracles of this family in scripts/pm_w3e_event_oracles.py; every refusal is one named single-predicate row of a generated Method B guard table (scripts/pm_w3e_table_*.py) proved by the gated shared scripts/pm_guard_isolation.py through scripts/pm-w3e-guard-proof.py, and rows no input can refuse first stay alone in their own table with a written proof. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 date_time with the owner profile of each field. Membership is ABSENT and native execution NOT_RUN. SP-278 filtered checkpoint, SP-286 original receipt and SP-337 payload-store ownership
  are unchanged.
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- BRS-1410
- CV-317
- CV-339
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: cv-1410_w3e_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- RP-OPERATIONAL-2555D@1.0.0
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### CV-1411 - server.catalog_changed exact prepared payload dispatch

```yaml
plan_unit_id: CV-1411
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored exact payload dispatch for server.catalog_changed@1.0.0, prepared without admission.
  Plans/event_payloads/w3e/server_catalog_changed.schema.json is the sole closed payload schema, logical pm.event_payload.server.catalog_changed.v1;
  SRV-1411 owns its semantic fields, per-field joins, producer, identity, source custody, transitions, consumers,
  retention question and withdrawal. Adopt CV-317 EventRecord and CV-339/SP-286 full-value receipt custody by name;
  do not duplicate the envelope. Required exact fields are schema_id, schema_version, scope_kind, project_id, server_id,
  owner_operation_id, source_custody_ref, source_evidence_ref, catalog_id, previous_catalog_revision, catalog_revision,
  catalog_ref. Externalized SP-337 body dispatch validates the resolved complete payload against this same schema;
  do not validate the reference string as the object or require payload_ref=null. All $refs resolve eagerly. Schema
  integer domains are inherited, exact Python/JSON boolean-number types are distinct, and identifier/digest strings
  require full consumption without trailing LF. Timestamps, where inherited through source/token schemas, use their
  owner-selected shared profile; write no local validator. No schema or fixture admits this family. retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0 (DL-453, E-CARDS-3 item 1.a, option A), kept permanently, application editions only, with no age or count expiry and no new count allowance; storage pressure refuses new history writes, and explicit application data deletion follows its existing authorized rules. Deleting the described object does not remove this separate history or keep the deleted content. Phase 2 (2026-11-13) runs the executable synthetic oracles of this family in scripts/pm_w3e_event_oracles.py; every refusal is one named single-predicate row of a generated Method B guard table (scripts/pm_w3e_table_*.py) proved by the gated shared scripts/pm_guard_isolation.py through scripts/pm-w3e-guard-proof.py, and rows no input can refuse first stay alone in their own table with a written proof. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 date_time with the owner profile of each field. Membership is ABSENT and native execution NOT_RUN. SP-278 filtered checkpoint, SP-286 original
  receipt and SP-337 payload-store ownership are unchanged.
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- SRV-1411
- CV-317
- CV-339
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: cv-1411_w3e_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- RP-AUTHORITY-INDEFINITE@1.0.0
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### CV-1412 - server.client_pairing_state_changed exact prepared payload dispatch

```yaml
plan_unit_id: CV-1412
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored exact payload dispatch for server.client_pairing_state_changed@1.0.0, prepared without
  admission. Plans/event_payloads/w3e/server_client_pairing_state_changed.schema.json is the sole closed payload
  schema, logical pm.event_payload.server.client_pairing_state_changed.v1; SRV-1412 owns its semantic fields, per-field
  joins, producer, identity, source custody, transitions, consumers, retention question and withdrawal. Adopt CV-317
  EventRecord and CV-339/SP-286 full-value receipt custody by name; do not duplicate the envelope. Required exact
  fields are schema_id, schema_version, scope_kind, project_id, server_id, owner_operation_id, source_custody_ref,
  source_evidence_ref, pairing_session_id, pairing_candidate_id, candidate_client_id, pairing_generation, prior_state,
  state, pairing_receipt_ref. Externalized SP-337 body dispatch validates the resolved complete payload against
  this same schema; do not validate the reference string as the object or require payload_ref=null. All $refs resolve
  eagerly. Schema integer domains are inherited, exact Python/JSON boolean-number types are distinct, and identifier/digest
  strings require full consumption without trailing LF. Timestamps, where inherited through source/token schemas,
  use their owner-selected shared profile; write no local validator. No schema or fixture admits this family. retention_policy_ref=RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0 (DL-455, E-CARDS-3 item 3.a, option A), application editions only, kept seven years (220,752,000 seconds) from the original saved change, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:operational_security (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. Phase 2 (2026-11-13) runs the executable synthetic oracles of this family in scripts/pm_w3e_event_oracles.py; every refusal is one named single-predicate row of a generated Method B guard table (scripts/pm_w3e_table_*.py) proved by the gated shared scripts/pm_guard_isolation.py through scripts/pm-w3e-guard-proof.py, and rows no input can refuse first stay alone in their own table with a written proof. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 date_time with the owner profile of each field. Membership is ABSENT and native execution NOT_RUN. SP-278 filtered checkpoint, SP-286 original
  receipt and SP-337 payload-store ownership are unchanged.
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- SRV-1412
- CV-317
- CV-339
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: cv-1412_w3e_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### CV-1413 - server.client_revoked exact prepared payload dispatch

```yaml
plan_unit_id: CV-1413
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored exact payload dispatch for server.client_revoked@1.0.0, prepared without admission.
  Plans/event_payloads/w3e/server_client_revoked.schema.json is the sole closed payload schema, logical pm.event_payload.server.client_revoked.v1;
  SRV-1413 owns its semantic fields, per-field joins, producer, identity, source custody, transitions, consumers,
  retention question and withdrawal. Adopt CV-317 EventRecord and CV-339/SP-286 full-value receipt custody by name;
  do not duplicate the envelope. Required exact fields are schema_id, schema_version, scope_kind, project_id, server_id,
  owner_operation_id, source_custody_ref, source_evidence_ref, client_id, revocation_record_id, previous_trust_generation,
  effective_trust_generation, reason_code, revocation_receipt_ref. Externalized SP-337 body dispatch validates the
  resolved complete payload against this same schema; do not validate the reference string as the object or require
  payload_ref=null. All $refs resolve eagerly. Schema integer domains are inherited, exact Python/JSON boolean-number
  types are distinct, and identifier/digest strings require full consumption without trailing LF. Timestamps, where
  inherited through source/token schemas, use their owner-selected shared profile; write no local validator. No
  schema or fixture admits this family. retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0 (DL-453, E-CARDS-3 item 1.a, option A), kept permanently, application editions only, with no age or count expiry and no new count allowance; storage pressure refuses new history writes, and explicit application data deletion follows its existing authorized rules. Deleting the described object does not remove this separate history or keep the deleted content. Phase 2 (2026-11-13) runs the executable synthetic oracles of this family in scripts/pm_w3e_event_oracles.py; every refusal is one named single-predicate row of a generated Method B guard table (scripts/pm_w3e_table_*.py) proved by the gated shared scripts/pm_guard_isolation.py through scripts/pm-w3e-guard-proof.py, and rows no input can refuse first stay alone in their own table with a written proof. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 date_time with the owner profile of each field. Membership is ABSENT and native execution NOT_RUN. SP-278 filtered checkpoint, SP-286 original receipt and SP-337
  payload-store ownership are unchanged.
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- SRV-1413
- CV-317
- CV-339
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: cv-1413_w3e_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- RP-AUTHORITY-INDEFINITE@1.0.0
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### CV-1414 - server.client_trust_changed exact prepared payload dispatch

```yaml
plan_unit_id: CV-1414
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored exact payload dispatch for server.client_trust_changed@1.0.0, prepared without admission.
  Plans/event_payloads/w3e/server_client_trust_changed.schema.json is the sole closed payload schema, logical pm.event_payload.server.client_trust_changed.v1;
  SRV-1414 owns its semantic fields, per-field joins, producer, identity, source custody, transitions, consumers,
  retention question and withdrawal. Adopt CV-317 EventRecord and CV-339/SP-286 full-value receipt custody by name;
  do not duplicate the envelope. Required exact fields are schema_id, schema_version, scope_kind, project_id, server_id,
  owner_operation_id, source_custody_ref, source_evidence_ref, client_trust_id, client_id, client_access_policy_id,
  policy_generation, trust_generation, prior_state, state, trust_receipt_ref. Externalized SP-337 body dispatch
  validates the resolved complete payload against this same schema; do not validate the reference string as the
  object or require payload_ref=null. All $refs resolve eagerly. Schema integer domains are inherited, exact Python/JSON
  boolean-number types are distinct, and identifier/digest strings require full consumption without trailing LF.
  Timestamps, where inherited through source/token schemas, use their owner-selected shared profile; write no local
  validator. No schema or fixture admits this family. retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0 (DL-453, E-CARDS-3 item 1.a, option A), kept permanently, application editions only, with no age or count expiry and no new count allowance; storage pressure refuses new history writes, and explicit application data deletion follows its existing authorized rules. Deleting the described object does not remove this separate history or keep the deleted content. Phase 2 (2026-11-13) runs the executable synthetic oracles of this family in scripts/pm_w3e_event_oracles.py; every refusal is one named single-predicate row of a generated Method B guard table (scripts/pm_w3e_table_*.py) proved by the gated shared scripts/pm_guard_isolation.py through scripts/pm-w3e-guard-proof.py, and rows no input can refuse first stay alone in their own table with a written proof. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 date_time with the owner profile of each field. Membership is ABSENT and native execution NOT_RUN. SP-278 filtered checkpoint, SP-286 original receipt
  and SP-337 payload-store ownership are unchanged.
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- SRV-1414
- CV-317
- CV-339
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: cv-1414_w3e_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- RP-AUTHORITY-INDEFINITE@1.0.0
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### CV-1415 - server.connection_state_changed exact prepared payload dispatch

```yaml
plan_unit_id: CV-1415
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored exact payload dispatch for server.connection_state_changed@1.0.0, prepared without
  admission. Plans/event_payloads/w3e/server_connection_state_changed.schema.json is the sole closed payload schema,
  logical pm.event_payload.server.connection_state_changed.v1; SRV-1415 owns its semantic fields, per-field joins,
  producer, identity, source custody, transitions, consumers, retention question and withdrawal. Adopt CV-317 EventRecord
  and CV-339/SP-286 full-value receipt custody by name; do not duplicate the envelope. Required exact fields are
  schema_id, schema_version, scope_kind, project_id, server_id, owner_operation_id, source_custody_ref, source_evidence_ref,
  projection_id, client_id, server_endpoint_id, remote_route_id, prior_state, state, connection_source_ref. Externalized
  SP-337 body dispatch validates the resolved complete payload against this same schema; do not validate the reference
  string as the object or require payload_ref=null. All $refs resolve eagerly. Schema integer domains are inherited,
  exact Python/JSON boolean-number types are distinct, and identifier/digest strings require full consumption without
  trailing LF. Timestamps, where inherited through source/token schemas, use their owner-selected shared profile;
  write no local validator. No schema or fixture admits this family. retention_policy_ref=RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0 (DL-454, E-CARDS-3 item 2.a, option A), application editions only, kept 90 days (7,776,000 seconds) from the first successful save that survives a restart, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:routine_observation (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. Phase 2 (2026-11-13) runs the executable synthetic oracles of this family in scripts/pm_w3e_event_oracles.py; every refusal is one named single-predicate row of a generated Method B guard table (scripts/pm_w3e_table_*.py) proved by the gated shared scripts/pm_guard_isolation.py through scripts/pm-w3e-guard-proof.py, and rows no input can refuse first stay alone in their own table with a written proof. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 date_time with the owner profile of each field. Membership is ABSENT and native execution NOT_RUN. SP-278 filtered checkpoint, SP-286 original
  receipt and SP-337 payload-store ownership are unchanged.
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- SRV-1415
- CV-317
- CV-339
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: cv-1415_w3e_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### CV-1416 - server.discovery_expired exact prepared payload dispatch

```yaml
plan_unit_id: CV-1416
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored exact payload dispatch for server.discovery_expired@1.0.0, prepared without admission.
  Plans/event_payloads/w3e/server_discovery_expired.schema.json is the sole closed payload schema, logical pm.event_payload.server.discovery_expired.v1;
  SRV-1416 owns its semantic fields, per-field joins, producer, identity, source custody, transitions, consumers,
  retention question and withdrawal. Adopt CV-317 EventRecord and CV-339/SP-286 full-value receipt custody by name;
  do not duplicate the envelope. Required exact fields are schema_id, schema_version, scope_kind, project_id, server_id,
  owner_operation_id, source_custody_ref, source_evidence_ref, observation_id, discovery_source, server_identity_fingerprint,
  expiry_decision_ref. Externalized SP-337 body dispatch validates the resolved complete payload against this same
  schema; do not validate the reference string as the object or require payload_ref=null. All $refs resolve eagerly.
  Schema integer domains are inherited, exact Python/JSON boolean-number types are distinct, and identifier/digest
  strings require full consumption without trailing LF. Timestamps, where inherited through source/token schemas,
  use their owner-selected shared profile; write no local validator. No schema or fixture admits this family. retention_policy_ref=RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0 (DL-454, E-CARDS-3 item 2.a, option A), application editions only, kept 90 days (7,776,000 seconds) from the first successful save that survives a restart, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:routine_observation (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. Phase 2 (2026-11-13) runs the executable synthetic oracles of this family in scripts/pm_w3e_event_oracles.py; every refusal is one named single-predicate row of a generated Method B guard table (scripts/pm_w3e_table_*.py) proved by the gated shared scripts/pm_guard_isolation.py through scripts/pm-w3e-guard-proof.py, and rows no input can refuse first stay alone in their own table with a written proof. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 date_time with the owner profile of each field. Membership is ABSENT and native execution NOT_RUN. SP-278 filtered checkpoint, SP-286 original
  receipt and SP-337 payload-store ownership are unchanged.
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- SRV-1416
- CV-317
- CV-339
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: cv-1416_w3e_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### CV-1417 - server.discovery_observed exact prepared payload dispatch

```yaml
plan_unit_id: CV-1417
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored exact payload dispatch for server.discovery_observed@1.0.0, prepared without admission.
  Plans/event_payloads/w3e/server_discovery_observed.schema.json is the sole closed payload schema, logical pm.event_payload.server.discovery_observed.v1;
  SRV-1417 owns its semantic fields, per-field joins, producer, identity, source custody, transitions, consumers,
  retention question and withdrawal. Adopt CV-317 EventRecord and CV-339/SP-286 full-value receipt custody by name;
  do not duplicate the envelope. Required exact fields are schema_id, schema_version, scope_kind, project_id, server_id,
  owner_operation_id, source_custody_ref, source_evidence_ref, observation_id, discovery_source, server_identity_fingerprint,
  observation_ref, grants_trust. Externalized SP-337 body dispatch validates the resolved complete payload against
  this same schema; do not validate the reference string as the object or require payload_ref=null. All $refs resolve
  eagerly. Schema integer domains are inherited, exact Python/JSON boolean-number types are distinct, and identifier/digest
  strings require full consumption without trailing LF. Timestamps, where inherited through source/token schemas,
  use their owner-selected shared profile; write no local validator. No schema or fixture admits this family. retention_policy_ref=RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0 (DL-454, E-CARDS-3 item 2.a, option A), application editions only, kept 90 days (7,776,000 seconds) from the first successful save that survives a restart, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:routine_observation (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. Phase 2 (2026-11-13) runs the executable synthetic oracles of this family in scripts/pm_w3e_event_oracles.py; every refusal is one named single-predicate row of a generated Method B guard table (scripts/pm_w3e_table_*.py) proved by the gated shared scripts/pm_guard_isolation.py through scripts/pm-w3e-guard-proof.py, and rows no input can refuse first stay alone in their own table with a written proof. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 date_time with the owner profile of each field. Membership is ABSENT and native execution NOT_RUN. SP-278 filtered checkpoint, SP-286 original
  receipt and SP-337 payload-store ownership are unchanged.
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- SRV-1417
- CV-317
- CV-339
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: cv-1417_w3e_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### CV-1418 - server.endpoint_changed exact prepared payload dispatch

```yaml
plan_unit_id: CV-1418
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: 'Newly authored exact payload dispatch for server.endpoint_changed@1.0.0, prepared without admission.
  Plans/event_payloads/w3e/server_endpoint_changed.schema.json is the sole closed payload schema, logical pm.event_payload.server.endpoint_changed.v1;
  SRV-1418 owns its semantic fields, per-field joins, producer, identity, source custody, transitions, consumers,
  retention question and withdrawal. Adopt CV-317 EventRecord and CV-339/SP-286 full-value receipt custody by name;
  do not duplicate the envelope. Required exact fields are schema_id, schema_version, scope_kind, project_id, server_id,
  owner_operation_id, source_custody_ref, source_evidence_ref, server_endpoint_id, endpoint_generation, identity_verification,
  endpoint_ref, prior_endpoint_ref, change_kind. Externalized SP-337 body dispatch validates the resolved complete
  payload against this same schema; do not validate the reference string as the object or require payload_ref=null.
  All $refs resolve eagerly. Schema integer domains are inherited, exact Python/JSON boolean-number types are distinct,
  and identifier/digest strings require full consumption without trailing LF. Timestamps, where inherited through
  source/token schemas, use their owner-selected shared profile; write no local validator. No schema or fixture
  admits this family. retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0 (DL-453, E-CARDS-3 item 1.a, option A), kept permanently, application editions only, with no age or count expiry and no new count allowance; storage pressure refuses new history writes, and explicit application data deletion follows its existing authorized rules. Deleting the described object does not remove this separate history or keep the deleted content. Phase 2 (2026-11-13) runs the executable synthetic oracles of this family in scripts/pm_w3e_event_oracles.py; every refusal is one named single-predicate row of a generated Method B guard table (scripts/pm_w3e_table_*.py) proved by the gated shared scripts/pm_guard_isolation.py through scripts/pm-w3e-guard-proof.py, and rows no input can refuse first stay alone in their own table with a written proof. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 date_time with the owner profile of each field. Membership is ABSENT and native execution NOT_RUN. SP-278 filtered checkpoint, SP-286 original receipt and SP-337 payload-store ownership
  are unchanged.

  change_kind is derived only from the genuine accepted create/update/remove owner result and joins the original
  source manifest. created proves original absence and a new record; updated proves exact changed before/after records;
  removed proves the original removal receipt, an existing before record and absent after record. On removed, endpoint_ref
  is null and the event generation is the last generation fenced by that original removal result, not a fabricated
  successor object. Removal does not delete a backup repository, revoke unrelated trust or erase historical receipts.
  No unchanged/failed result emits this event.

  '
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- SRV-1418
- CV-317
- CV-339
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: cv-1418_w3e_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- RP-AUTHORITY-INDEFINITE@1.0.0
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```

### CV-1419 - server.identity_mismatch_detected exact prepared payload dispatch

```yaml
plan_unit_id: CV-1419
unit_type: contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: Newly authored exact payload dispatch for server.identity_mismatch_detected@1.0.0, prepared without
  admission. Plans/event_payloads/w3e/server_identity_mismatch_detected.schema.json is the sole closed payload schema,
  logical pm.event_payload.server.identity_mismatch_detected.v1; SRV-1419 owns its semantic fields, per-field joins,
  producer, identity, source custody, transitions, consumers, retention question and withdrawal. Adopt CV-317 EventRecord
  and CV-339/SP-286 full-value receipt custody by name; do not duplicate the envelope. Required exact fields are
  schema_id, schema_version, scope_kind, project_id, server_id, owner_operation_id, source_custody_ref, source_evidence_ref,
  server_endpoint_id, expected_fingerprint, observed_fingerprint, detection_id, mismatch_evidence_ref. Externalized
  SP-337 body dispatch validates the resolved complete payload against this same schema; do not validate the reference
  string as the object or require payload_ref=null. All $refs resolve eagerly. Schema integer domains are inherited,
  exact Python/JSON boolean-number types are distinct, and identifier/digest strings require full consumption without
  trailing LF. Timestamps, where inherited through source/token schemas, use their owner-selected shared profile;
  write no local validator. No schema or fixture admits this family. retention_policy_ref=RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0 (DL-455, E-CARDS-3 item 3.a, option A), application editions only, kept seven years (220,752,000 seconds) from the original saved change, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:operational_security (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. Phase 2 (2026-11-13) runs the executable synthetic oracles of this family in scripts/pm_w3e_event_oracles.py; every refusal is one named single-predicate row of a generated Method B guard table (scripts/pm_w3e_table_*.py) proved by the gated shared scripts/pm_guard_isolation.py through scripts/pm-w3e-guard-proof.py, and rows no input can refuse first stay alone in their own table with a written proof. Numbers use the shared CV-1100/SP-1100 calls and timestamps the shared CV-1101 date_time with the owner profile of each field. Membership is ABSENT and native execution NOT_RUN. SP-278 filtered checkpoint, SP-286 original
  receipt and SP-337 payload-store ownership are unchanged.
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- SRV-1419
- CV-317
- CV-339
unblocks: []
acceptance_criteria:
- This exact family remains prepared without admission; current writes stay missing_event_registration.
- Every stated join and refusal has a positive and a single-defect negative planned; native execution is NOT_RUN.
- Retention is unresolved where explicitly marked; no lifetime or deletion policy is inferred.
validation_surfaces:
- Plans/event_authority_w3e_oracle_plan.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_identity_custody_or_replay
reasoning_tier: high
context_scope: cv-1419_w3e_phase1
implementation_surfaces:
- Plans/Contracts_V0.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- source_ref:decision:E-CARDS-2:9.a:A:2026-11-05
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/lanes/wave3/W3E-rows.jsonl
preserved_exact_tokens:
- prepared without admission
- RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0
- SP-278
- SP-286
- CV-339
- SP-337
negative_constraints:
- No admission, registry family append, Decision Log entry or native execution claim.
- No independent number/timestamp implementation or retention decision.
```
