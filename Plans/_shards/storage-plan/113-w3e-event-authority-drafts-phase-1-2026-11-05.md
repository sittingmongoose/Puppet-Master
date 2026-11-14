# Shard 113: W3E event authority drafts - phase 1 (2026-11-05)

Source: `Plans/storage-plan.md`

Source lines: L58209-L59972

Source SHA256: `5065d9e04e53131a2344a6f1759caa92647dc0714c5e80d03fd384f1779318fb`

---

## W3E event authority drafts - phase 1 (2026-11-05)

Each unit below is a newly authored per-family contract. All current writer gates remain closed pending separate admission.

### SP-1400 - backup.destination_changed source and filtered history custody

```yaml
plan_unit_id: SP-1400
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage bindings only for backup.destination_changed@1.0.0, prepared without admission.
  BRS-1400/CV-1400 own the exact semantic contract. Three closed independently keyed values live in Plans/storage_value_registry.json:
  w3e_backup_destination_changed_custody, w3e_backup_destination_changed_history and w3e_backup_destination_changed_checkpoint.
  Current writes remain missing_event_registration; retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0 (DL-453, E-CARDS-3 item 1.a, option A), kept permanently, application editions only, with no age or count expiry and no new count allowance; storage pressure refuses new history writes, and explicit application data deletion follows its existing authorized rules. Deleting the described object does not remove this separate history or keep the deleted content. The custody, history and checkpoint values below inherit this assignment; their Storage registry rows carry it at the batch-3 rebase, when every decided policy object is on the lane. Custody in
  canonical redb uses w3e_backup_destination_changed_custody.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/backup_destination_changed.schema.json#/$defs/custody. It retains original intent,
  complete before/after source refs, original owner result, semantic input, stable event identity/digest and nullable
  first append-result ref. pending_append becomes settled only with actual CV-339 full-value original result; source/receipt
  ambiguity becomes recovery_required. It is not reconstructed from the event. Domain authority remains BackupCoordinator.destination_commit@1.0.0;
  Storage owns atomic persistence only.

  Derived history in redb projections uses w3e_backup_destination_changed_history.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/backup_destination_changed.schema.json#/$defs/history. Its only producer is projector.w3e.backup_destination_changed.history@1.0.0;
  reader.w3e.backup_destination_changed.history@1.0.0 serves Settings Backup & Restore Destinations and the shared
  New Project destination consumer under source/access/deletion/withdrawal checks. It contains only the original
  event/custody/payload references, canonical sequence and publication generation, no new live domain state.

  The exact checkpoint in derived redb checkpoints is w3e_backup_destination_changed_checkpoint.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}
  and Plans/event_payloads/w3e/backup_destination_changed.schema.json#/$defs/checkpoint. Adopt SP-278 reader.storage.event_record_index@1.0.0
  by name for actual all-partition source completeness, then exact-family/scope/writer filtering. Both the projection-generation
  pointer and exact checkpoint advance with changed rows under prior-value CAS in one write transaction. Persist
  the nine-field durable generic_read_token (DL-076), never redb_snapshot_id; join a fresh live read snapshot for
  validation. Checkpoints cannot publish the generic index or select CURRENT. Inclusive restart verifies last_examined_cursor
  frame identity/end offset; no cursor regression or unsupported-source skip. Withdrawal fences source/reader and
  invalidates publication; verified shadow rebuild swaps atomically without source mutation.

  Adopt SP-286 and CV-339 first-AppendReceipt and full-value v2 custody, SP-236 physical bytes and SP-337 large-body
  addressing by name. Each encoded value has the SP-340 maximum 16384 bytes in its named canonical/derived file
  and projects_and_sources storage group; measure the entire stored wrapper. Every larger source, owner result,
  semantic input, payload or token graph is externalized with SP-337 immutable BLAKE3 id/size/media type evidence
  before its referencing acknowledgement. A large checkpoint uses its closed body_inline=null/body_ref SP-337 route; a small one uses body_inline with body_ref=null. Resolve and validate the complete immutable checkpoint_body under the same token/CAS/source fence. If even a ref-only wrapper exceeds its bound, refuse; never truncate,
  base64-wrap or silently enlarge the limit. Original source schema/recipe and access proofs travel with the referenced
  source bytes. A complete canonical backup includes source/pending/terminal, referenced payload closure, EventRecord
  group/first result and original dedupe; unresolved restore fences current publication. Derived values are omitted
  and rebuilt from verified current survivors, preserving gaps and historical schemas. Pending event retention is
  no purge authority; holds and source/receipt dependencies remain independent. No fresh Store version, native runtime,
  admission or lifetime is invented.'
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- BRS-1400
- CV-1400
- SP-278
- SP-286
- SP-337
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
context_scope: sp-1400_w3e_phase1
implementation_surfaces:
- Plans/storage-plan.md
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

### SP-1401 - backup.state_changed source and filtered history custody

```yaml
plan_unit_id: SP-1401
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage bindings only for backup.state_changed@1.0.0, prepared without admission.
  BRS-1401/CV-1401 own the exact semantic contract. Six closed independently keyed values live in Plans/storage_value_registry.json, one row per value and edition
  (INT3 integration repair, 2026-11-14): w3e_backup_state_changed_custody, w3e_backup_state_changed_history and w3e_backup_state_changed_checkpoint hold Project editions;
  w3e_backup_state_changed_custody_application, w3e_backup_state_changed_history_application and w3e_backup_state_changed_checkpoint_application hold application editions
  under the same owner value schemas. Current
  writes remain missing_event_registration; Project editions take retention_policy_ref=RP-OPERATIONAL-2555D@1.0.0 under the Storage Project first-save anchor adapter (each entry starts its clock at its own saved state change), sharing the existing 2,000,000-entry seven-year Project allowance; application editions take retention_policy_ref=RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0 in the one separate 2,000,000-entry application allowance app:operational_security (DL-455, E-CARDS-3 item 3.a, option A), seven years (220,752,000 seconds) from the original saved change, never restarted by retry, reprocessing or restore. The application policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. The custody, history and checkpoint values below inherit this assignment: the three Project rows carry RP-OPERATIONAL-2555D and the three application rows carry RP-OPERATIONAL-SECURITY-APPLICATION-2555D, bound at the batch-3 integration. Custody in canonical
  redb uses w3e_backup_state_changed_custody.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)} (Project editions; application editions use w3e_backup_state_changed_custody.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(owner_operation_id)})
  and Plans/event_payloads/w3e/backup_state_changed.schema.json#/$defs/custody. It retains original intent, complete
  before/after source refs, original owner result, semantic input, stable event identity/digest and nullable first
  append-result ref. pending_append becomes settled only with actual CV-339 full-value original result; source/receipt
  ambiguity becomes recovery_required. It is not reconstructed from the event. Domain authority remains BackupCoordinator.backup_phase_commit@1.0.0;
  Storage owns atomic persistence only.

  Derived history in redb projections uses w3e_backup_state_changed_history.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)} (Project editions; application editions use w3e_backup_state_changed_history.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(owner_operation_id)})
  and Plans/event_payloads/w3e/backup_state_changed.schema.json#/$defs/history. Its only producer is projector.w3e.backup_state_changed.history@1.0.0;
  reader.w3e.backup_state_changed.history@1.0.0 serves Backup History and the one BRS-031 backup-status projection
  under source/access/deletion/withdrawal checks. It contains only the original event/custody/payload references,
  canonical sequence and publication generation, no new live domain state.

  The exact checkpoint in derived redb checkpoints is w3e_backup_state_changed_checkpoint.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)} (Project editions; application editions use w3e_backup_state_changed_checkpoint.application.v1:{hex(storage_instance_id)}:{hex(server_id)})
  and Plans/event_payloads/w3e/backup_state_changed.schema.json#/$defs/checkpoint. Adopt SP-278 reader.storage.event_record_index@1.0.0
  by name for actual all-partition source completeness, then exact-family/scope/writer filtering. Both the projection-generation
  pointer and exact checkpoint advance with changed rows under prior-value CAS in one write transaction. Persist
  the nine-field durable generic_read_token (DL-076), never redb_snapshot_id; join a fresh live read snapshot for
  validation. Checkpoints cannot publish the generic index or select CURRENT. Inclusive restart verifies last_examined_cursor
  frame identity/end offset; no cursor regression or unsupported-source skip. Withdrawal fences source/reader and
  invalidates publication; verified shadow rebuild swaps atomically without source mutation.

  Adopt SP-286 and CV-339 first-AppendReceipt and full-value v2 custody, SP-236 physical bytes and SP-337 large-body
  addressing by name. Each encoded value has the SP-340 maximum 16384 bytes in its named canonical/derived file
  and projects_and_sources storage group; measure the entire stored wrapper. Every larger source, owner result,
  semantic input, payload or token graph is externalized with SP-337 immutable BLAKE3 id/size/media type evidence
  before its referencing acknowledgement. A large checkpoint uses its closed body_inline=null/body_ref SP-337 route; a small one uses body_inline with body_ref=null. Resolve and validate the complete immutable checkpoint_body under the same token/CAS/source fence. If even a ref-only wrapper exceeds its bound, refuse; never truncate,
  base64-wrap or silently enlarge the limit. Original source schema/recipe and access proofs travel with the referenced
  source bytes. A complete canonical backup includes source/pending/terminal, referenced payload closure, EventRecord
  group/first result and original dedupe; unresolved restore fences current publication. Derived values are omitted
  and rebuilt from verified current survivors, preserving gaps and historical schemas. Pending event retention is
  no purge authority; holds and source/receipt dependencies remain independent. No fresh Store version, native runtime,
  admission or lifetime is invented.'
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- BRS-1401
- CV-1401
- SP-278
- SP-286
- SP-337
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
context_scope: sp-1401_w3e_phase1
implementation_surfaces:
- Plans/storage-plan.md
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

### SP-1402 - remote_access.private_endpoint_state_changed source and filtered history custody

```yaml
plan_unit_id: SP-1402
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage bindings only for remote_access.private_endpoint_state_changed@1.0.0, prepared
  without admission. RAS-1402/CV-1402 own the exact semantic contract. Three closed independently keyed values live
  in Plans/storage_value_registry.json: w3e_remote_access_private_endpoint_state_changed_custody, w3e_remote_access_private_endpoint_state_changed_history
  and w3e_remote_access_private_endpoint_state_changed_checkpoint. Current writes remain missing_event_registration;
  retention_policy_ref=RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0 (DL-454, E-CARDS-3 item 2.a, option A), application editions only, kept 90 days (7,776,000 seconds) from the first successful save that survives a restart, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:routine_observation (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. The custody, history and checkpoint values below inherit this assignment; their Storage registry rows carry it at the batch-3 rebase, when every decided policy object is on the lane. Custody in canonical redb uses w3e_remote_access_private_endpoint_state_changed_custody.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/remote_access_private_endpoint_state_changed.schema.json#/$defs/custody. It retains
  original intent, complete before/after source refs, original owner result, semantic input, stable event identity/digest
  and nullable first append-result ref. pending_append becomes settled only with actual CV-339 full-value original
  result; source/receipt ambiguity becomes recovery_required. It is not reconstructed from the event. Domain authority
  remains RemoteAccessRouteService.private_endpoint_commit@1.0.0; Storage owns atomic persistence only.

  Derived history in redb projections uses w3e_remote_access_private_endpoint_state_changed_history.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/remote_access_private_endpoint_state_changed.schema.json#/$defs/history. Its only
  producer is projector.w3e.remote_access_private_endpoint_state_changed.history@1.0.0; reader.w3e.remote_access_private_endpoint_state_changed.history@1.0.0
  serves Remote Access private-route status and Server endpoint Details under source/access/deletion/withdrawal
  checks. It contains only the original event/custody/payload references, canonical sequence and publication generation,
  no new live domain state.

  The exact checkpoint in derived redb checkpoints is w3e_remote_access_private_endpoint_state_changed_checkpoint.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}
  and Plans/event_payloads/w3e/remote_access_private_endpoint_state_changed.schema.json#/$defs/checkpoint. Adopt
  SP-278 reader.storage.event_record_index@1.0.0 by name for actual all-partition source completeness, then exact-family/scope/writer
  filtering. Both the projection-generation pointer and exact checkpoint advance with changed rows under prior-value
  CAS in one write transaction. Persist the nine-field durable generic_read_token (DL-076), never redb_snapshot_id;
  join a fresh live read snapshot for validation. Checkpoints cannot publish the generic index or select CURRENT.
  Inclusive restart verifies last_examined_cursor frame identity/end offset; no cursor regression or unsupported-source
  skip. Withdrawal fences source/reader and invalidates publication; verified shadow rebuild swaps atomically without
  source mutation.

  Adopt SP-286 and CV-339 first-AppendReceipt and full-value v2 custody, SP-236 physical bytes and SP-337 large-body
  addressing by name. Each encoded value has the SP-340 maximum 16384 bytes in its named canonical/derived file
  and projects_and_sources storage group; measure the entire stored wrapper. Every larger source, owner result,
  semantic input, payload or token graph is externalized with SP-337 immutable BLAKE3 id/size/media type evidence
  before its referencing acknowledgement. A large checkpoint uses its closed body_inline=null/body_ref SP-337 route; a small one uses body_inline with body_ref=null. Resolve and validate the complete immutable checkpoint_body under the same token/CAS/source fence. If even a ref-only wrapper exceeds its bound, refuse; never truncate,
  base64-wrap or silently enlarge the limit. Original source schema/recipe and access proofs travel with the referenced
  source bytes. A complete canonical backup includes source/pending/terminal, referenced payload closure, EventRecord
  group/first result and original dedupe; unresolved restore fences current publication. Derived values are omitted
  and rebuilt from verified current survivors, preserving gaps and historical schemas. Pending event retention is
  no purge authority; holds and source/receipt dependencies remain independent. No fresh Store version, native runtime,
  admission or lifetime is invented.'
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-1402
- CV-1402
- SP-278
- SP-286
- SP-337
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
context_scope: sp-1402_w3e_phase1
implementation_surfaces:
- Plans/storage-plan.md
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

### SP-1403 - remote_access.proxy_state_changed source and filtered history custody

```yaml
plan_unit_id: SP-1403
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage bindings only for remote_access.proxy_state_changed@1.0.0, prepared without
  admission. RAS-1403/CV-1403 own the exact semantic contract. Three closed independently keyed values live in Plans/storage_value_registry.json:
  w3e_remote_access_proxy_state_changed_custody, w3e_remote_access_proxy_state_changed_history and w3e_remote_access_proxy_state_changed_checkpoint.
  Current writes remain missing_event_registration; retention_policy_ref=RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0 (DL-454, E-CARDS-3 item 2.a, option A), application editions only, kept 90 days (7,776,000 seconds) from the first successful save that survives a restart, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:routine_observation (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. The custody, history and checkpoint values below inherit this assignment; their Storage registry rows carry it at the batch-3 rebase, when every decided policy object is on the lane. Custody in
  canonical redb uses w3e_remote_access_proxy_state_changed_custody.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/remote_access_proxy_state_changed.schema.json#/$defs/custody. It retains original
  intent, complete before/after source refs, original owner result, semantic input, stable event identity/digest
  and nullable first append-result ref. pending_append becomes settled only with actual CV-339 full-value original
  result; source/receipt ambiguity becomes recovery_required. It is not reconstructed from the event. Domain authority
  remains RemoteAccessRouteService.proxy_state_commit@1.0.0; Storage owns atomic persistence only.

  Derived history in redb projections uses w3e_remote_access_proxy_state_changed_history.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/remote_access_proxy_state_changed.schema.json#/$defs/history. Its only producer is
  projector.w3e.remote_access_proxy_state_changed.history@1.0.0; reader.w3e.remote_access_proxy_state_changed.history@1.0.0
  serves Remote Access proxy Details and connection-status projections under source/access/deletion/withdrawal checks.
  It contains only the original event/custody/payload references, canonical sequence and publication generation,
  no new live domain state.

  The exact checkpoint in derived redb checkpoints is w3e_remote_access_proxy_state_changed_checkpoint.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}
  and Plans/event_payloads/w3e/remote_access_proxy_state_changed.schema.json#/$defs/checkpoint. Adopt SP-278 reader.storage.event_record_index@1.0.0
  by name for actual all-partition source completeness, then exact-family/scope/writer filtering. Both the projection-generation
  pointer and exact checkpoint advance with changed rows under prior-value CAS in one write transaction. Persist
  the nine-field durable generic_read_token (DL-076), never redb_snapshot_id; join a fresh live read snapshot for
  validation. Checkpoints cannot publish the generic index or select CURRENT. Inclusive restart verifies last_examined_cursor
  frame identity/end offset; no cursor regression or unsupported-source skip. Withdrawal fences source/reader and
  invalidates publication; verified shadow rebuild swaps atomically without source mutation.

  Adopt SP-286 and CV-339 first-AppendReceipt and full-value v2 custody, SP-236 physical bytes and SP-337 large-body
  addressing by name. Each encoded value has the SP-340 maximum 16384 bytes in its named canonical/derived file
  and projects_and_sources storage group; measure the entire stored wrapper. Every larger source, owner result,
  semantic input, payload or token graph is externalized with SP-337 immutable BLAKE3 id/size/media type evidence
  before its referencing acknowledgement. A large checkpoint uses its closed body_inline=null/body_ref SP-337 route; a small one uses body_inline with body_ref=null. Resolve and validate the complete immutable checkpoint_body under the same token/CAS/source fence. If even a ref-only wrapper exceeds its bound, refuse; never truncate,
  base64-wrap or silently enlarge the limit. Original source schema/recipe and access proofs travel with the referenced
  source bytes. A complete canonical backup includes source/pending/terminal, referenced payload closure, EventRecord
  group/first result and original dedupe; unresolved restore fences current publication. Derived values are omitted
  and rebuilt from verified current survivors, preserving gaps and historical schemas. Pending event retention is
  no purge authority; holds and source/receipt dependencies remain independent. No fresh Store version, native runtime,
  admission or lifetime is invented.'
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-1403
- CV-1403
- SP-278
- SP-286
- SP-337
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
context_scope: sp-1403_w3e_phase1
implementation_surfaces:
- Plans/storage-plan.md
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

### SP-1404 - remote_access.public_security_violation_detected source and filtered history custody

```yaml
plan_unit_id: SP-1404
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage bindings only for remote_access.public_security_violation_detected@1.0.0,
  prepared without admission. RAS-1404/CV-1404 own the exact semantic contract. Three closed independently keyed
  values live in Plans/storage_value_registry.json: w3e_remote_access_public_security_violation_detected_custody,
  w3e_remote_access_public_security_violation_detected_history and w3e_remote_access_public_security_violation_detected_checkpoint.
  Current writes remain missing_event_registration; retention_policy_ref=RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0 (DL-455, E-CARDS-3 item 3.a, option A), application editions only, kept seven years (220,752,000 seconds) from the original saved change, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:operational_security (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. The custody, history and checkpoint values below inherit this assignment; their Storage registry rows carry it at the batch-3 rebase, when every decided policy object is on the lane. Custody in
  canonical redb uses w3e_remote_access_public_security_violation_detected_custody.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/remote_access_public_security_violation_detected.schema.json#/$defs/custody. It retains
  original intent, complete before/after source refs, original owner result, semantic input, stable event identity/digest
  and nullable first append-result ref. pending_append becomes settled only with actual CV-339 full-value original
  result; source/receipt ambiguity becomes recovery_required. It is not reconstructed from the event. Domain authority
  remains PublicIngressGuard.record_violation@1.0.0; Storage owns atomic persistence only.

  Derived history in redb projections uses w3e_remote_access_public_security_violation_detected_history.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/remote_access_public_security_violation_detected.schema.json#/$defs/history. Its
  only producer is projector.w3e.remote_access_public_security_violation_detected.history@1.0.0; reader.w3e.remote_access_public_security_violation_detected.history@1.0.0
  serves Remote Access security Details and Doctor redacted diagnostic history under source/access/deletion/withdrawal
  checks. It contains only the original event/custody/payload references, canonical sequence and publication generation,
  no new live domain state.

  The exact checkpoint in derived redb checkpoints is w3e_remote_access_public_security_violation_detected_checkpoint.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}
  and Plans/event_payloads/w3e/remote_access_public_security_violation_detected.schema.json#/$defs/checkpoint. Adopt
  SP-278 reader.storage.event_record_index@1.0.0 by name for actual all-partition source completeness, then exact-family/scope/writer
  filtering. Both the projection-generation pointer and exact checkpoint advance with changed rows under prior-value
  CAS in one write transaction. Persist the nine-field durable generic_read_token (DL-076), never redb_snapshot_id;
  join a fresh live read snapshot for validation. Checkpoints cannot publish the generic index or select CURRENT.
  Inclusive restart verifies last_examined_cursor frame identity/end offset; no cursor regression or unsupported-source
  skip. Withdrawal fences source/reader and invalidates publication; verified shadow rebuild swaps atomically without
  source mutation.

  Adopt SP-286 and CV-339 first-AppendReceipt and full-value v2 custody, SP-236 physical bytes and SP-337 large-body
  addressing by name. Each encoded value has the SP-340 maximum 16384 bytes in its named canonical/derived file
  and projects_and_sources storage group; measure the entire stored wrapper. Every larger source, owner result,
  semantic input, payload or token graph is externalized with SP-337 immutable BLAKE3 id/size/media type evidence
  before its referencing acknowledgement. A large checkpoint uses its closed body_inline=null/body_ref SP-337 route; a small one uses body_inline with body_ref=null. Resolve and validate the complete immutable checkpoint_body under the same token/CAS/source fence. If even a ref-only wrapper exceeds its bound, refuse; never truncate,
  base64-wrap or silently enlarge the limit. Original source schema/recipe and access proofs travel with the referenced
  source bytes. A complete canonical backup includes source/pending/terminal, referenced payload closure, EventRecord
  group/first result and original dedupe; unresolved restore fences current publication. Derived values are omitted
  and rebuilt from verified current survivors, preserving gaps and historical schemas. Pending event retention is
  no purge authority; holds and source/receipt dependencies remain independent. No fresh Store version, native runtime,
  admission or lifetime is invented.'
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-1404
- CV-1404
- SP-278
- SP-286
- SP-337
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
context_scope: sp-1404_w3e_phase1
implementation_surfaces:
- Plans/storage-plan.md
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

### SP-1405 - remote_access.remote_link_state_changed source and filtered history custody

```yaml
plan_unit_id: SP-1405
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage bindings only for remote_access.remote_link_state_changed@1.0.0, prepared
  without admission. RAS-1405/CV-1405 own the exact semantic contract. Three closed independently keyed values live
  in Plans/storage_value_registry.json: w3e_remote_access_remote_link_state_changed_custody, w3e_remote_access_remote_link_state_changed_history
  and w3e_remote_access_remote_link_state_changed_checkpoint. Current writes remain missing_event_registration;
  retention_policy_ref=RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0 (DL-454, E-CARDS-3 item 2.a, option A), application editions only, kept 90 days (7,776,000 seconds) from the first successful save that survives a restart, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:routine_observation (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. The custody, history and checkpoint values below inherit this assignment; their Storage registry rows carry it at the batch-3 rebase, when every decided policy object is on the lane. Custody in canonical redb uses w3e_remote_access_remote_link_state_changed_custody.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/remote_access_remote_link_state_changed.schema.json#/$defs/custody. It retains original
  intent, complete before/after source refs, original owner result, semantic input, stable event identity/digest
  and nullable first append-result ref. pending_append becomes settled only with actual CV-339 full-value original
  result; source/receipt ambiguity becomes recovery_required. It is not reconstructed from the event. Domain authority
  remains RemoteAccessRouteService.remote_link_state_commit@1.0.0; Storage owns atomic persistence only.

  Derived history in redb projections uses w3e_remote_access_remote_link_state_changed_history.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/remote_access_remote_link_state_changed.schema.json#/$defs/history. Its only producer
  is projector.w3e.remote_access_remote_link_state_changed.history@1.0.0; reader.w3e.remote_access_remote_link_state_changed.history@1.0.0
  serves Remote Link Direct/Relay/attention status and Server route Details under source/access/deletion/withdrawal
  checks. It contains only the original event/custody/payload references, canonical sequence and publication generation,
  no new live domain state.

  The exact checkpoint in derived redb checkpoints is w3e_remote_access_remote_link_state_changed_checkpoint.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}
  and Plans/event_payloads/w3e/remote_access_remote_link_state_changed.schema.json#/$defs/checkpoint. Adopt SP-278
  reader.storage.event_record_index@1.0.0 by name for actual all-partition source completeness, then exact-family/scope/writer
  filtering. Both the projection-generation pointer and exact checkpoint advance with changed rows under prior-value
  CAS in one write transaction. Persist the nine-field durable generic_read_token (DL-076), never redb_snapshot_id;
  join a fresh live read snapshot for validation. Checkpoints cannot publish the generic index or select CURRENT.
  Inclusive restart verifies last_examined_cursor frame identity/end offset; no cursor regression or unsupported-source
  skip. Withdrawal fences source/reader and invalidates publication; verified shadow rebuild swaps atomically without
  source mutation.

  Adopt SP-286 and CV-339 first-AppendReceipt and full-value v2 custody, SP-236 physical bytes and SP-337 large-body
  addressing by name. Each encoded value has the SP-340 maximum 16384 bytes in its named canonical/derived file
  and projects_and_sources storage group; measure the entire stored wrapper. Every larger source, owner result,
  semantic input, payload or token graph is externalized with SP-337 immutable BLAKE3 id/size/media type evidence
  before its referencing acknowledgement. A large checkpoint uses its closed body_inline=null/body_ref SP-337 route; a small one uses body_inline with body_ref=null. Resolve and validate the complete immutable checkpoint_body under the same token/CAS/source fence. If even a ref-only wrapper exceeds its bound, refuse; never truncate,
  base64-wrap or silently enlarge the limit. Original source schema/recipe and access proofs travel with the referenced
  source bytes. A complete canonical backup includes source/pending/terminal, referenced payload closure, EventRecord
  group/first result and original dedupe; unresolved restore fences current publication. Derived values are omitted
  and rebuilt from verified current survivors, preserving gaps and historical schemas. Pending event retention is
  no purge authority; holds and source/receipt dependencies remain independent. No fresh Store version, native runtime,
  admission or lifetime is invented.'
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-1405
- CV-1405
- SP-278
- SP-286
- SP-337
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
context_scope: sp-1405_w3e_phase1
implementation_surfaces:
- Plans/storage-plan.md
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

### SP-1406 - remote_access.route_migration_state_changed source and filtered history custody

```yaml
plan_unit_id: SP-1406
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage bindings only for remote_access.route_migration_state_changed@1.0.0, prepared
  without admission. RAS-1406/CV-1406 own the exact semantic contract. Three closed independently keyed values live
  in Plans/storage_value_registry.json: w3e_remote_access_route_migration_state_changed_custody, w3e_remote_access_route_migration_state_changed_history
  and w3e_remote_access_route_migration_state_changed_checkpoint. Current writes remain missing_event_registration;
  retention_policy_ref=RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0 (DL-455, E-CARDS-3 item 3.a, option A), application editions only, kept seven years (220,752,000 seconds) from the original saved change, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:operational_security (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. The custody, history and checkpoint values below inherit this assignment; their Storage registry rows carry it at the batch-3 rebase, when every decided policy object is on the lane. Custody in canonical redb uses w3e_remote_access_route_migration_state_changed_custody.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/remote_access_route_migration_state_changed.schema.json#/$defs/custody. It retains
  original intent, complete before/after source refs, original owner result, semantic input, stable event identity/digest
  and nullable first append-result ref. pending_append becomes settled only with actual CV-339 full-value original
  result; source/receipt ambiguity becomes recovery_required. It is not reconstructed from the event. Domain authority
  remains RemoteAccessRouteService.migration_phase_commit@1.0.0; Storage owns atomic persistence only.

  Derived history in redb projections uses w3e_remote_access_route_migration_state_changed_history.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/remote_access_route_migration_state_changed.schema.json#/$defs/history. Its only
  producer is projector.w3e.remote_access_route_migration_state_changed.history@1.0.0; reader.w3e.remote_access_route_migration_state_changed.history@1.0.0
  serves Remote Access migration progress/receipt Details under source/access/deletion/withdrawal checks. It contains
  only the original event/custody/payload references, canonical sequence and publication generation, no new live
  domain state.

  The exact checkpoint in derived redb checkpoints is w3e_remote_access_route_migration_state_changed_checkpoint.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}
  and Plans/event_payloads/w3e/remote_access_route_migration_state_changed.schema.json#/$defs/checkpoint. Adopt
  SP-278 reader.storage.event_record_index@1.0.0 by name for actual all-partition source completeness, then exact-family/scope/writer
  filtering. Both the projection-generation pointer and exact checkpoint advance with changed rows under prior-value
  CAS in one write transaction. Persist the nine-field durable generic_read_token (DL-076), never redb_snapshot_id;
  join a fresh live read snapshot for validation. Checkpoints cannot publish the generic index or select CURRENT.
  Inclusive restart verifies last_examined_cursor frame identity/end offset; no cursor regression or unsupported-source
  skip. Withdrawal fences source/reader and invalidates publication; verified shadow rebuild swaps atomically without
  source mutation.

  Adopt SP-286 and CV-339 first-AppendReceipt and full-value v2 custody, SP-236 physical bytes and SP-337 large-body
  addressing by name. Each encoded value has the SP-340 maximum 16384 bytes in its named canonical/derived file
  and projects_and_sources storage group; measure the entire stored wrapper. Every larger source, owner result,
  semantic input, payload or token graph is externalized with SP-337 immutable BLAKE3 id/size/media type evidence
  before its referencing acknowledgement. A large checkpoint uses its closed body_inline=null/body_ref SP-337 route; a small one uses body_inline with body_ref=null. Resolve and validate the complete immutable checkpoint_body under the same token/CAS/source fence. If even a ref-only wrapper exceeds its bound, refuse; never truncate,
  base64-wrap or silently enlarge the limit. Original source schema/recipe and access proofs travel with the referenced
  source bytes. A complete canonical backup includes source/pending/terminal, referenced payload closure, EventRecord
  group/first result and original dedupe; unresolved restore fences current publication. Derived values are omitted
  and rebuilt from verified current survivors, preserving gaps and historical schemas. Pending event retention is
  no purge authority; holds and source/receipt dependencies remain independent. No fresh Store version, native runtime,
  admission or lifetime is invented.'
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-1406
- CV-1406
- SP-278
- SP-286
- SP-337
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
context_scope: sp-1406_w3e_phase1
implementation_surfaces:
- Plans/storage-plan.md
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

### SP-1407 - remote_access.route_preference_changed source and filtered history custody

```yaml
plan_unit_id: SP-1407
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage bindings only for remote_access.route_preference_changed@1.0.0, prepared
  without admission. RAS-1407/CV-1407 own the exact semantic contract. Three closed independently keyed values live
  in Plans/storage_value_registry.json: w3e_remote_access_route_preference_changed_custody, w3e_remote_access_route_preference_changed_history
  and w3e_remote_access_route_preference_changed_checkpoint. Current writes remain missing_event_registration; retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0 (DL-453, E-CARDS-3 item 1.a, option A), kept permanently, application editions only, with no age or count expiry and no new count allowance; storage pressure refuses new history writes, and explicit application data deletion follows its existing authorized rules. Deleting the described object does not remove this separate history or keep the deleted content. The custody, history and checkpoint values below inherit this assignment; their Storage registry rows carry it at the batch-3 rebase, when every decided policy object is on the lane.
  Custody in canonical redb uses w3e_remote_access_route_preference_changed_custody.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/remote_access_route_preference_changed.schema.json#/$defs/custody. It retains original
  intent, complete before/after source refs, original owner result, semantic input, stable event identity/digest
  and nullable first append-result ref. pending_append becomes settled only with actual CV-339 full-value original
  result; source/receipt ambiguity becomes recovery_required. It is not reconstructed from the event. Domain authority
  remains RemoteAccessRouteService.preference_commit@1.0.0; Storage owns atomic persistence only.

  Derived history in redb projections uses w3e_remote_access_route_preference_changed_history.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/remote_access_route_preference_changed.schema.json#/$defs/history. Its only producer
  is projector.w3e.remote_access_route_preference_changed.history@1.0.0; reader.w3e.remote_access_route_preference_changed.history@1.0.0
  serves Remote Access preferred-route and Server connection summary under source/access/deletion/withdrawal checks.
  It contains only the original event/custody/payload references, canonical sequence and publication generation,
  no new live domain state.

  The exact checkpoint in derived redb checkpoints is w3e_remote_access_route_preference_changed_checkpoint.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}
  and Plans/event_payloads/w3e/remote_access_route_preference_changed.schema.json#/$defs/checkpoint. Adopt SP-278
  reader.storage.event_record_index@1.0.0 by name for actual all-partition source completeness, then exact-family/scope/writer
  filtering. Both the projection-generation pointer and exact checkpoint advance with changed rows under prior-value
  CAS in one write transaction. Persist the nine-field durable generic_read_token (DL-076), never redb_snapshot_id;
  join a fresh live read snapshot for validation. Checkpoints cannot publish the generic index or select CURRENT.
  Inclusive restart verifies last_examined_cursor frame identity/end offset; no cursor regression or unsupported-source
  skip. Withdrawal fences source/reader and invalidates publication; verified shadow rebuild swaps atomically without
  source mutation.

  Adopt SP-286 and CV-339 first-AppendReceipt and full-value v2 custody, SP-236 physical bytes and SP-337 large-body
  addressing by name. Each encoded value has the SP-340 maximum 16384 bytes in its named canonical/derived file
  and projects_and_sources storage group; measure the entire stored wrapper. Every larger source, owner result,
  semantic input, payload or token graph is externalized with SP-337 immutable BLAKE3 id/size/media type evidence
  before its referencing acknowledgement. A large checkpoint uses its closed body_inline=null/body_ref SP-337 route; a small one uses body_inline with body_ref=null. Resolve and validate the complete immutable checkpoint_body under the same token/CAS/source fence. If even a ref-only wrapper exceeds its bound, refuse; never truncate,
  base64-wrap or silently enlarge the limit. Original source schema/recipe and access proofs travel with the referenced
  source bytes. A complete canonical backup includes source/pending/terminal, referenced payload closure, EventRecord
  group/first result and original dedupe; unresolved restore fences current publication. Derived values are omitted
  and rebuilt from verified current survivors, preserving gaps and historical schemas. Pending event retention is
  no purge authority; holds and source/receipt dependencies remain independent. No fresh Store version, native runtime,
  admission or lifetime is invented.'
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-1407
- CV-1407
- SP-278
- SP-286
- SP-337
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
context_scope: sp-1407_w3e_phase1
implementation_surfaces:
- Plans/storage-plan.md
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

### SP-1408 - remote_access.route_state_changed source and filtered history custody

```yaml
plan_unit_id: SP-1408
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage bindings only for remote_access.route_state_changed@1.0.0, prepared without
  admission. RAS-1408/CV-1408 own the exact semantic contract. Three closed independently keyed values live in Plans/storage_value_registry.json:
  w3e_remote_access_route_state_changed_custody, w3e_remote_access_route_state_changed_history and w3e_remote_access_route_state_changed_checkpoint.
  Current writes remain missing_event_registration; retention_policy_ref=RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0 (DL-454, E-CARDS-3 item 2.a, option A), application editions only, kept 90 days (7,776,000 seconds) from the first successful save that survives a restart, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:routine_observation (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. The custody, history and checkpoint values below inherit this assignment; their Storage registry rows carry it at the batch-3 rebase, when every decided policy object is on the lane. Custody in
  canonical redb uses w3e_remote_access_route_state_changed_custody.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/remote_access_route_state_changed.schema.json#/$defs/custody. It retains original
  intent, complete before/after source refs, original owner result, semantic input, stable event identity/digest
  and nullable first append-result ref. pending_append becomes settled only with actual CV-339 full-value original
  result; source/receipt ambiguity becomes recovery_required. It is not reconstructed from the event. Domain authority
  remains RemoteAccessRouteService.route_state_commit@1.0.0; Storage owns atomic persistence only.

  Derived history in redb projections uses w3e_remote_access_route_state_changed_history.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/remote_access_route_state_changed.schema.json#/$defs/history. Its only producer is
  projector.w3e.remote_access_route_state_changed.history@1.0.0; reader.w3e.remote_access_route_state_changed.history@1.0.0
  serves Remote Access route list/Details and Server status under source/access/deletion/withdrawal checks. It contains
  only the original event/custody/payload references, canonical sequence and publication generation, no new live
  domain state.

  The exact checkpoint in derived redb checkpoints is w3e_remote_access_route_state_changed_checkpoint.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}
  and Plans/event_payloads/w3e/remote_access_route_state_changed.schema.json#/$defs/checkpoint. Adopt SP-278 reader.storage.event_record_index@1.0.0
  by name for actual all-partition source completeness, then exact-family/scope/writer filtering. Both the projection-generation
  pointer and exact checkpoint advance with changed rows under prior-value CAS in one write transaction. Persist
  the nine-field durable generic_read_token (DL-076), never redb_snapshot_id; join a fresh live read snapshot for
  validation. Checkpoints cannot publish the generic index or select CURRENT. Inclusive restart verifies last_examined_cursor
  frame identity/end offset; no cursor regression or unsupported-source skip. Withdrawal fences source/reader and
  invalidates publication; verified shadow rebuild swaps atomically without source mutation.

  Adopt SP-286 and CV-339 first-AppendReceipt and full-value v2 custody, SP-236 physical bytes and SP-337 large-body
  addressing by name. Each encoded value has the SP-340 maximum 16384 bytes in its named canonical/derived file
  and projects_and_sources storage group; measure the entire stored wrapper. Every larger source, owner result,
  semantic input, payload or token graph is externalized with SP-337 immutable BLAKE3 id/size/media type evidence
  before its referencing acknowledgement. A large checkpoint uses its closed body_inline=null/body_ref SP-337 route; a small one uses body_inline with body_ref=null. Resolve and validate the complete immutable checkpoint_body under the same token/CAS/source fence. If even a ref-only wrapper exceeds its bound, refuse; never truncate,
  base64-wrap or silently enlarge the limit. Original source schema/recipe and access proofs travel with the referenced
  source bytes. A complete canonical backup includes source/pending/terminal, referenced payload closure, EventRecord
  group/first result and original dedupe; unresolved restore fences current publication. Derived values are omitted
  and rebuilt from verified current survivors, preserving gaps and historical schemas. Pending event retention is
  no purge authority; holds and source/receipt dependencies remain independent. No fresh Store version, native runtime,
  admission or lifetime is invented.'
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-1408
- CV-1408
- SP-278
- SP-286
- SP-337
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
context_scope: sp-1408_w3e_phase1
implementation_surfaces:
- Plans/storage-plan.md
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

### SP-1409 - remote_access.route_test_completed source and filtered history custody

```yaml
plan_unit_id: SP-1409
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage bindings only for remote_access.route_test_completed@1.0.0, prepared without
  admission. RAS-1409/CV-1409 own the exact semantic contract. Three closed independently keyed values live in Plans/storage_value_registry.json:
  w3e_remote_access_route_test_completed_custody, w3e_remote_access_route_test_completed_history and w3e_remote_access_route_test_completed_checkpoint.
  Current writes remain missing_event_registration; retention_policy_ref=RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0 (DL-455, E-CARDS-3 item 3.a, option A), application editions only, kept seven years (220,752,000 seconds) from the original saved change, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:operational_security (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. The custody, history and checkpoint values below inherit this assignment; their Storage registry rows carry it at the batch-3 rebase, when every decided policy object is on the lane. Custody in
  canonical redb uses w3e_remote_access_route_test_completed_custody.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/remote_access_route_test_completed.schema.json#/$defs/custody. It retains original
  intent, complete before/after source refs, original owner result, semantic input, stable event identity/digest
  and nullable first append-result ref. pending_append becomes settled only with actual CV-339 full-value original
  result; source/receipt ambiguity becomes recovery_required. It is not reconstructed from the event. Domain authority
  remains RemoteAccessRouteService.test_terminal_commit@1.0.0; Storage owns atomic persistence only.

  Derived history in redb projections uses w3e_remote_access_route_test_completed_history.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/remote_access_route_test_completed.schema.json#/$defs/history. Its only producer
  is projector.w3e.remote_access_route_test_completed.history@1.0.0; reader.w3e.remote_access_route_test_completed.history@1.0.0
  serves Remote Access Test result/Doctor and route Details under source/access/deletion/withdrawal checks. It contains
  only the original event/custody/payload references, canonical sequence and publication generation, no new live
  domain state.

  The exact checkpoint in derived redb checkpoints is w3e_remote_access_route_test_completed_checkpoint.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}
  and Plans/event_payloads/w3e/remote_access_route_test_completed.schema.json#/$defs/checkpoint. Adopt SP-278 reader.storage.event_record_index@1.0.0
  by name for actual all-partition source completeness, then exact-family/scope/writer filtering. Both the projection-generation
  pointer and exact checkpoint advance with changed rows under prior-value CAS in one write transaction. Persist
  the nine-field durable generic_read_token (DL-076), never redb_snapshot_id; join a fresh live read snapshot for
  validation. Checkpoints cannot publish the generic index or select CURRENT. Inclusive restart verifies last_examined_cursor
  frame identity/end offset; no cursor regression or unsupported-source skip. Withdrawal fences source/reader and
  invalidates publication; verified shadow rebuild swaps atomically without source mutation.

  Adopt SP-286 and CV-339 first-AppendReceipt and full-value v2 custody, SP-236 physical bytes and SP-337 large-body
  addressing by name. Each encoded value has the SP-340 maximum 16384 bytes in its named canonical/derived file
  and projects_and_sources storage group; measure the entire stored wrapper. Every larger source, owner result,
  semantic input, payload or token graph is externalized with SP-337 immutable BLAKE3 id/size/media type evidence
  before its referencing acknowledgement. A large checkpoint uses its closed body_inline=null/body_ref SP-337 route; a small one uses body_inline with body_ref=null. Resolve and validate the complete immutable checkpoint_body under the same token/CAS/source fence. If even a ref-only wrapper exceeds its bound, refuse; never truncate,
  base64-wrap or silently enlarge the limit. Original source schema/recipe and access proofs travel with the referenced
  source bytes. A complete canonical backup includes source/pending/terminal, referenced payload closure, EventRecord
  group/first result and original dedupe; unresolved restore fences current publication. Derived values are omitted
  and rebuilt from verified current survivors, preserving gaps and historical schemas. Pending event retention is
  no purge authority; holds and source/receipt dependencies remain independent. No fresh Store version, native runtime,
  admission or lifetime is invented.'
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- RAS-1409
- CV-1409
- SP-278
- SP-286
- SP-337
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
context_scope: sp-1409_w3e_phase1
implementation_surfaces:
- Plans/storage-plan.md
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

### SP-1410 - restore.state_changed source and filtered history custody

```yaml
plan_unit_id: SP-1410
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage bindings only for restore.state_changed@1.0.0, prepared without admission.
  BRS-1410/CV-1410 own the exact semantic contract. Six closed independently keyed values live in Plans/storage_value_registry.json, one row per value and edition
  (INT3 integration repair, 2026-11-14): w3e_restore_state_changed_custody, w3e_restore_state_changed_history and w3e_restore_state_changed_checkpoint hold Project editions;
  w3e_restore_state_changed_custody_application, w3e_restore_state_changed_history_application and w3e_restore_state_changed_checkpoint_application hold application editions
  under the same owner value schemas.
  Current writes remain missing_event_registration; Project editions take retention_policy_ref=RP-OPERATIONAL-2555D@1.0.0 under the Storage Project first-save anchor adapter (each entry starts its clock at its own saved state change), sharing the existing 2,000,000-entry seven-year Project allowance; application editions take retention_policy_ref=RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0 in the one separate 2,000,000-entry application allowance app:operational_security (DL-455, E-CARDS-3 item 3.a, option A), seven years (220,752,000 seconds) from the original saved change, never restarted by retry, reprocessing or restore. The application policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. The custody, history and checkpoint values below inherit this assignment: the three Project rows carry RP-OPERATIONAL-2555D and the three application rows carry RP-OPERATIONAL-SECURITY-APPLICATION-2555D, bound at the batch-3 integration. Custody in
  canonical redb uses w3e_restore_state_changed_custody.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)} (Project editions; application editions use w3e_restore_state_changed_custody.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(owner_operation_id)})
  and Plans/event_payloads/w3e/restore_state_changed.schema.json#/$defs/custody. It retains original intent, complete
  before/after source refs, original owner result, semantic input, stable event identity/digest and nullable first
  append-result ref. pending_append becomes settled only with actual CV-339 full-value original result; source/receipt
  ambiguity becomes recovery_required. It is not reconstructed from the event. Domain authority remains BackupCoordinator.restore_phase_commit@1.0.0;
  Storage owns atomic persistence only.

  Derived history in redb projections uses w3e_restore_state_changed_history.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)} (Project editions; application editions use w3e_restore_state_changed_history.application.v1:{hex(storage_instance_id)}:{hex(server_id)}:{hex(owner_operation_id)})
  and Plans/event_payloads/w3e/restore_state_changed.schema.json#/$defs/history. Its only producer is projector.w3e.restore_state_changed.history@1.0.0;
  reader.w3e.restore_state_changed.history@1.0.0 serves Restore History/preview/result Details and shared backup
  status under source/access/deletion/withdrawal checks. It contains only the original event/custody/payload references,
  canonical sequence and publication generation, no new live domain state.

  The exact checkpoint in derived redb checkpoints is w3e_restore_state_changed_checkpoint.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)} (Project editions; application editions use w3e_restore_state_changed_checkpoint.application.v1:{hex(storage_instance_id)}:{hex(server_id)})
  and Plans/event_payloads/w3e/restore_state_changed.schema.json#/$defs/checkpoint. Adopt SP-278 reader.storage.event_record_index@1.0.0
  by name for actual all-partition source completeness, then exact-family/scope/writer filtering. Both the projection-generation
  pointer and exact checkpoint advance with changed rows under prior-value CAS in one write transaction. Persist
  the nine-field durable generic_read_token (DL-076), never redb_snapshot_id; join a fresh live read snapshot for
  validation. Checkpoints cannot publish the generic index or select CURRENT. Inclusive restart verifies last_examined_cursor
  frame identity/end offset; no cursor regression or unsupported-source skip. Withdrawal fences source/reader and
  invalidates publication; verified shadow rebuild swaps atomically without source mutation.

  Adopt SP-286 and CV-339 first-AppendReceipt and full-value v2 custody, SP-236 physical bytes and SP-337 large-body
  addressing by name. Each encoded value has the SP-340 maximum 16384 bytes in its named canonical/derived file
  and projects_and_sources storage group; measure the entire stored wrapper. Every larger source, owner result,
  semantic input, payload or token graph is externalized with SP-337 immutable BLAKE3 id/size/media type evidence
  before its referencing acknowledgement. A large checkpoint uses its closed body_inline=null/body_ref SP-337 route; a small one uses body_inline with body_ref=null. Resolve and validate the complete immutable checkpoint_body under the same token/CAS/source fence. If even a ref-only wrapper exceeds its bound, refuse; never truncate,
  base64-wrap or silently enlarge the limit. Original source schema/recipe and access proofs travel with the referenced
  source bytes. A complete canonical backup includes source/pending/terminal, referenced payload closure, EventRecord
  group/first result and original dedupe; unresolved restore fences current publication. Derived values are omitted
  and rebuilt from verified current survivors, preserving gaps and historical schemas. Pending event retention is
  no purge authority; holds and source/receipt dependencies remain independent. No fresh Store version, native runtime,
  admission or lifetime is invented.'
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- BRS-1410
- CV-1410
- SP-278
- SP-286
- SP-337
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
context_scope: sp-1410_w3e_phase1
implementation_surfaces:
- Plans/storage-plan.md
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

### SP-1411 - server.catalog_changed source and filtered history custody

```yaml
plan_unit_id: SP-1411
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage bindings only for server.catalog_changed@1.0.0, prepared without admission.
  SRV-1411/CV-1411 own the exact semantic contract. Three closed independently keyed values live in Plans/storage_value_registry.json:
  w3e_server_catalog_changed_custody, w3e_server_catalog_changed_history and w3e_server_catalog_changed_checkpoint.
  Current writes remain missing_event_registration; retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0 (DL-453, E-CARDS-3 item 1.a, option A), kept permanently, application editions only, with no age or count expiry and no new count allowance; storage pressure refuses new history writes, and explicit application data deletion follows its existing authorized rules. Deleting the described object does not remove this separate history or keep the deleted content. The custody, history and checkpoint values below inherit this assignment; their Storage registry rows carry it at the batch-3 rebase, when every decided policy object is on the lane. Custody in
  canonical redb uses w3e_server_catalog_changed_custody.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/server_catalog_changed.schema.json#/$defs/custody. It retains original intent, complete
  before/after source refs, original owner result, semantic input, stable event identity/digest and nullable first
  append-result ref. pending_append becomes settled only with actual CV-339 full-value original result; source/receipt
  ambiguity becomes recovery_required. It is not reconstructed from the event. Domain authority remains ServerCatalogService.catalog_commit@1.0.0;
  Storage owns atomic persistence only.

  Derived history in redb projections uses w3e_server_catalog_changed_history.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/server_catalog_changed.schema.json#/$defs/history. Its only producer is projector.w3e.server_catalog_changed.history@1.0.0;
  reader.w3e.server_catalog_changed.history@1.0.0 serves Server manager Catalog and Doctor catalog diagnostics under
  source/access/deletion/withdrawal checks. It contains only the original event/custody/payload references, canonical
  sequence and publication generation, no new live domain state.

  The exact checkpoint in derived redb checkpoints is w3e_server_catalog_changed_checkpoint.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}
  and Plans/event_payloads/w3e/server_catalog_changed.schema.json#/$defs/checkpoint. Adopt SP-278 reader.storage.event_record_index@1.0.0
  by name for actual all-partition source completeness, then exact-family/scope/writer filtering. Both the projection-generation
  pointer and exact checkpoint advance with changed rows under prior-value CAS in one write transaction. Persist
  the nine-field durable generic_read_token (DL-076), never redb_snapshot_id; join a fresh live read snapshot for
  validation. Checkpoints cannot publish the generic index or select CURRENT. Inclusive restart verifies last_examined_cursor
  frame identity/end offset; no cursor regression or unsupported-source skip. Withdrawal fences source/reader and
  invalidates publication; verified shadow rebuild swaps atomically without source mutation.

  Adopt SP-286 and CV-339 first-AppendReceipt and full-value v2 custody, SP-236 physical bytes and SP-337 large-body
  addressing by name. Each encoded value has the SP-340 maximum 16384 bytes in its named canonical/derived file
  and projects_and_sources storage group; measure the entire stored wrapper. Every larger source, owner result,
  semantic input, payload or token graph is externalized with SP-337 immutable BLAKE3 id/size/media type evidence
  before its referencing acknowledgement. A large checkpoint uses its closed body_inline=null/body_ref SP-337 route; a small one uses body_inline with body_ref=null. Resolve and validate the complete immutable checkpoint_body under the same token/CAS/source fence. If even a ref-only wrapper exceeds its bound, refuse; never truncate,
  base64-wrap or silently enlarge the limit. Original source schema/recipe and access proofs travel with the referenced
  source bytes. A complete canonical backup includes source/pending/terminal, referenced payload closure, EventRecord
  group/first result and original dedupe; unresolved restore fences current publication. Derived values are omitted
  and rebuilt from verified current survivors, preserving gaps and historical schemas. Pending event retention is
  no purge authority; holds and source/receipt dependencies remain independent. No fresh Store version, native runtime,
  admission or lifetime is invented.'
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- SRV-1411
- CV-1411
- SP-278
- SP-286
- SP-337
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
context_scope: sp-1411_w3e_phase1
implementation_surfaces:
- Plans/storage-plan.md
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

### SP-1412 - server.client_pairing_state_changed source and filtered history custody

```yaml
plan_unit_id: SP-1412
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage bindings only for server.client_pairing_state_changed@1.0.0, prepared without
  admission. SRV-1412/CV-1412 own the exact semantic contract. Three closed independently keyed values live in Plans/storage_value_registry.json:
  w3e_server_client_pairing_state_changed_custody, w3e_server_client_pairing_state_changed_history and w3e_server_client_pairing_state_changed_checkpoint.
  Current writes remain missing_event_registration; retention_policy_ref=RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0 (DL-455, E-CARDS-3 item 3.a, option A), application editions only, kept seven years (220,752,000 seconds) from the original saved change, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:operational_security (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. The custody, history and checkpoint values below inherit this assignment; their Storage registry rows carry it at the batch-3 rebase, when every decided policy object is on the lane. Custody in
  canonical redb uses w3e_server_client_pairing_state_changed_custody.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/server_client_pairing_state_changed.schema.json#/$defs/custody. It retains original
  intent, complete before/after source refs, original owner result, semantic input, stable event identity/digest
  and nullable first append-result ref. pending_append becomes settled only with actual CV-339 full-value original
  result; source/receipt ambiguity becomes recovery_required. It is not reconstructed from the event. Domain authority
  remains ClientTrustRegistry.pairing_phase_commit@1.0.0; Storage owns atomic persistence only.

  Derived history in redb projections uses w3e_server_client_pairing_state_changed_history.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/server_client_pairing_state_changed.schema.json#/$defs/history. Its only producer
  is projector.w3e.server_client_pairing_state_changed.history@1.0.0; reader.w3e.server_client_pairing_state_changed.history@1.0.0
  serves Server pairing/Client management and permanent web pairing result under source/access/deletion/withdrawal
  checks. It contains only the original event/custody/payload references, canonical sequence and publication generation,
  no new live domain state.

  The exact checkpoint in derived redb checkpoints is w3e_server_client_pairing_state_changed_checkpoint.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}
  and Plans/event_payloads/w3e/server_client_pairing_state_changed.schema.json#/$defs/checkpoint. Adopt SP-278 reader.storage.event_record_index@1.0.0
  by name for actual all-partition source completeness, then exact-family/scope/writer filtering. Both the projection-generation
  pointer and exact checkpoint advance with changed rows under prior-value CAS in one write transaction. Persist
  the nine-field durable generic_read_token (DL-076), never redb_snapshot_id; join a fresh live read snapshot for
  validation. Checkpoints cannot publish the generic index or select CURRENT. Inclusive restart verifies last_examined_cursor
  frame identity/end offset; no cursor regression or unsupported-source skip. Withdrawal fences source/reader and
  invalidates publication; verified shadow rebuild swaps atomically without source mutation.

  Adopt SP-286 and CV-339 first-AppendReceipt and full-value v2 custody, SP-236 physical bytes and SP-337 large-body
  addressing by name. Each encoded value has the SP-340 maximum 16384 bytes in its named canonical/derived file
  and projects_and_sources storage group; measure the entire stored wrapper. Every larger source, owner result,
  semantic input, payload or token graph is externalized with SP-337 immutable BLAKE3 id/size/media type evidence
  before its referencing acknowledgement. A large checkpoint uses its closed body_inline=null/body_ref SP-337 route; a small one uses body_inline with body_ref=null. Resolve and validate the complete immutable checkpoint_body under the same token/CAS/source fence. If even a ref-only wrapper exceeds its bound, refuse; never truncate,
  base64-wrap or silently enlarge the limit. Original source schema/recipe and access proofs travel with the referenced
  source bytes. A complete canonical backup includes source/pending/terminal, referenced payload closure, EventRecord
  group/first result and original dedupe; unresolved restore fences current publication. Derived values are omitted
  and rebuilt from verified current survivors, preserving gaps and historical schemas. Pending event retention is
  no purge authority; holds and source/receipt dependencies remain independent. No fresh Store version, native runtime,
  admission or lifetime is invented.'
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- SRV-1412
- CV-1412
- SP-278
- SP-286
- SP-337
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
context_scope: sp-1412_w3e_phase1
implementation_surfaces:
- Plans/storage-plan.md
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

### SP-1413 - server.client_revoked source and filtered history custody

```yaml
plan_unit_id: SP-1413
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage bindings only for server.client_revoked@1.0.0, prepared without admission.
  SRV-1413/CV-1413 own the exact semantic contract. Three closed independently keyed values live in Plans/storage_value_registry.json:
  w3e_server_client_revoked_custody, w3e_server_client_revoked_history and w3e_server_client_revoked_checkpoint.
  Current writes remain missing_event_registration; retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0 (DL-453, E-CARDS-3 item 1.a, option A), kept permanently, application editions only, with no age or count expiry and no new count allowance; storage pressure refuses new history writes, and explicit application data deletion follows its existing authorized rules. Deleting the described object does not remove this separate history or keep the deleted content. The custody, history and checkpoint values below inherit this assignment; their Storage registry rows carry it at the batch-3 rebase, when every decided policy object is on the lane. Custody in
  canonical redb uses w3e_server_client_revoked_custody.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/server_client_revoked.schema.json#/$defs/custody. It retains original intent, complete
  before/after source refs, original owner result, semantic input, stable event identity/digest and nullable first
  append-result ref. pending_append becomes settled only with actual CV-339 full-value original result; source/receipt
  ambiguity becomes recovery_required. It is not reconstructed from the event. Domain authority remains ClientTrustRegistry.revoke_commit@1.0.0;
  Storage owns atomic persistence only.

  Derived history in redb projections uses w3e_server_client_revoked_history.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/server_client_revoked.schema.json#/$defs/history. Its only producer is projector.w3e.server_client_revoked.history@1.0.0;
  reader.w3e.server_client_revoked.history@1.0.0 serves Server Client Details and revocation-aware session/command
  availability under source/access/deletion/withdrawal checks. It contains only the original event/custody/payload
  references, canonical sequence and publication generation, no new live domain state.

  The exact checkpoint in derived redb checkpoints is w3e_server_client_revoked_checkpoint.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}
  and Plans/event_payloads/w3e/server_client_revoked.schema.json#/$defs/checkpoint. Adopt SP-278 reader.storage.event_record_index@1.0.0
  by name for actual all-partition source completeness, then exact-family/scope/writer filtering. Both the projection-generation
  pointer and exact checkpoint advance with changed rows under prior-value CAS in one write transaction. Persist
  the nine-field durable generic_read_token (DL-076), never redb_snapshot_id; join a fresh live read snapshot for
  validation. Checkpoints cannot publish the generic index or select CURRENT. Inclusive restart verifies last_examined_cursor
  frame identity/end offset; no cursor regression or unsupported-source skip. Withdrawal fences source/reader and
  invalidates publication; verified shadow rebuild swaps atomically without source mutation.

  Adopt SP-286 and CV-339 first-AppendReceipt and full-value v2 custody, SP-236 physical bytes and SP-337 large-body
  addressing by name. Each encoded value has the SP-340 maximum 16384 bytes in its named canonical/derived file
  and projects_and_sources storage group; measure the entire stored wrapper. Every larger source, owner result,
  semantic input, payload or token graph is externalized with SP-337 immutable BLAKE3 id/size/media type evidence
  before its referencing acknowledgement. A large checkpoint uses its closed body_inline=null/body_ref SP-337 route; a small one uses body_inline with body_ref=null. Resolve and validate the complete immutable checkpoint_body under the same token/CAS/source fence. If even a ref-only wrapper exceeds its bound, refuse; never truncate,
  base64-wrap or silently enlarge the limit. Original source schema/recipe and access proofs travel with the referenced
  source bytes. A complete canonical backup includes source/pending/terminal, referenced payload closure, EventRecord
  group/first result and original dedupe; unresolved restore fences current publication. Derived values are omitted
  and rebuilt from verified current survivors, preserving gaps and historical schemas. Pending event retention is
  no purge authority; holds and source/receipt dependencies remain independent. No fresh Store version, native runtime,
  admission or lifetime is invented.'
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- SRV-1413
- CV-1413
- SP-278
- SP-286
- SP-337
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
context_scope: sp-1413_w3e_phase1
implementation_surfaces:
- Plans/storage-plan.md
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

### SP-1414 - server.client_trust_changed source and filtered history custody

```yaml
plan_unit_id: SP-1414
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage bindings only for server.client_trust_changed@1.0.0, prepared without admission.
  SRV-1414/CV-1414 own the exact semantic contract. Three closed independently keyed values live in Plans/storage_value_registry.json:
  w3e_server_client_trust_changed_custody, w3e_server_client_trust_changed_history and w3e_server_client_trust_changed_checkpoint.
  Current writes remain missing_event_registration; retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0 (DL-453, E-CARDS-3 item 1.a, option A), kept permanently, application editions only, with no age or count expiry and no new count allowance; storage pressure refuses new history writes, and explicit application data deletion follows its existing authorized rules. Deleting the described object does not remove this separate history or keep the deleted content. The custody, history and checkpoint values below inherit this assignment; their Storage registry rows carry it at the batch-3 rebase, when every decided policy object is on the lane. Custody in
  canonical redb uses w3e_server_client_trust_changed_custody.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/server_client_trust_changed.schema.json#/$defs/custody. It retains original intent,
  complete before/after source refs, original owner result, semantic input, stable event identity/digest and nullable
  first append-result ref. pending_append becomes settled only with actual CV-339 full-value original result; source/receipt
  ambiguity becomes recovery_required. It is not reconstructed from the event. Domain authority remains ClientTrustRegistry.trust_commit@1.0.0;
  Storage owns atomic persistence only.

  Derived history in redb projections uses w3e_server_client_trust_changed_history.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/server_client_trust_changed.schema.json#/$defs/history. Its only producer is projector.w3e.server_client_trust_changed.history@1.0.0;
  reader.w3e.server_client_trust_changed.history@1.0.0 serves Server Clients/access policy Details and session availability
  under source/access/deletion/withdrawal checks. It contains only the original event/custody/payload references,
  canonical sequence and publication generation, no new live domain state.

  The exact checkpoint in derived redb checkpoints is w3e_server_client_trust_changed_checkpoint.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}
  and Plans/event_payloads/w3e/server_client_trust_changed.schema.json#/$defs/checkpoint. Adopt SP-278 reader.storage.event_record_index@1.0.0
  by name for actual all-partition source completeness, then exact-family/scope/writer filtering. Both the projection-generation
  pointer and exact checkpoint advance with changed rows under prior-value CAS in one write transaction. Persist
  the nine-field durable generic_read_token (DL-076), never redb_snapshot_id; join a fresh live read snapshot for
  validation. Checkpoints cannot publish the generic index or select CURRENT. Inclusive restart verifies last_examined_cursor
  frame identity/end offset; no cursor regression or unsupported-source skip. Withdrawal fences source/reader and
  invalidates publication; verified shadow rebuild swaps atomically without source mutation.

  Adopt SP-286 and CV-339 first-AppendReceipt and full-value v2 custody, SP-236 physical bytes and SP-337 large-body
  addressing by name. Each encoded value has the SP-340 maximum 16384 bytes in its named canonical/derived file
  and projects_and_sources storage group; measure the entire stored wrapper. Every larger source, owner result,
  semantic input, payload or token graph is externalized with SP-337 immutable BLAKE3 id/size/media type evidence
  before its referencing acknowledgement. A large checkpoint uses its closed body_inline=null/body_ref SP-337 route; a small one uses body_inline with body_ref=null. Resolve and validate the complete immutable checkpoint_body under the same token/CAS/source fence. If even a ref-only wrapper exceeds its bound, refuse; never truncate,
  base64-wrap or silently enlarge the limit. Original source schema/recipe and access proofs travel with the referenced
  source bytes. A complete canonical backup includes source/pending/terminal, referenced payload closure, EventRecord
  group/first result and original dedupe; unresolved restore fences current publication. Derived values are omitted
  and rebuilt from verified current survivors, preserving gaps and historical schemas. Pending event retention is
  no purge authority; holds and source/receipt dependencies remain independent. No fresh Store version, native runtime,
  admission or lifetime is invented.'
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- SRV-1414
- CV-1414
- SP-278
- SP-286
- SP-337
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
context_scope: sp-1414_w3e_phase1
implementation_surfaces:
- Plans/storage-plan.md
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

### SP-1415 - server.connection_state_changed source and filtered history custody

```yaml
plan_unit_id: SP-1415
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage bindings only for server.connection_state_changed@1.0.0, prepared without
  admission. SRV-1415/CV-1415 own the exact semantic contract. Three closed independently keyed values live in Plans/storage_value_registry.json:
  w3e_server_connection_state_changed_custody, w3e_server_connection_state_changed_history and w3e_server_connection_state_changed_checkpoint.
  Current writes remain missing_event_registration; retention_policy_ref=RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0 (DL-454, E-CARDS-3 item 2.a, option A), application editions only, kept 90 days (7,776,000 seconds) from the first successful save that survives a restart, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:routine_observation (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. The custody, history and checkpoint values below inherit this assignment; their Storage registry rows carry it at the batch-3 rebase, when every decided policy object is on the lane. Custody in
  canonical redb uses w3e_server_connection_state_changed_custody.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/server_connection_state_changed.schema.json#/$defs/custody. It retains original intent,
  complete before/after source refs, original owner result, semantic input, stable event identity/digest and nullable
  first append-result ref. pending_append becomes settled only with actual CV-339 full-value original result; source/receipt
  ambiguity becomes recovery_required. It is not reconstructed from the event. Domain authority remains ServerConnectionService.connection_state_commit@1.0.0;
  Storage owns atomic persistence only.

  Derived history in redb projections uses w3e_server_connection_state_changed_history.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/server_connection_state_changed.schema.json#/$defs/history. Its only producer is
  projector.w3e.server_connection_state_changed.history@1.0.0; reader.w3e.server_connection_state_changed.history@1.0.0
  serves Connected Server status/Details and permanent native/web catch-up under source/access/deletion/withdrawal
  checks. It contains only the original event/custody/payload references, canonical sequence and publication generation,
  no new live domain state.

  The exact checkpoint in derived redb checkpoints is w3e_server_connection_state_changed_checkpoint.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}
  and Plans/event_payloads/w3e/server_connection_state_changed.schema.json#/$defs/checkpoint. Adopt SP-278 reader.storage.event_record_index@1.0.0
  by name for actual all-partition source completeness, then exact-family/scope/writer filtering. Both the projection-generation
  pointer and exact checkpoint advance with changed rows under prior-value CAS in one write transaction. Persist
  the nine-field durable generic_read_token (DL-076), never redb_snapshot_id; join a fresh live read snapshot for
  validation. Checkpoints cannot publish the generic index or select CURRENT. Inclusive restart verifies last_examined_cursor
  frame identity/end offset; no cursor regression or unsupported-source skip. Withdrawal fences source/reader and
  invalidates publication; verified shadow rebuild swaps atomically without source mutation.

  Adopt SP-286 and CV-339 first-AppendReceipt and full-value v2 custody, SP-236 physical bytes and SP-337 large-body
  addressing by name. Each encoded value has the SP-340 maximum 16384 bytes in its named canonical/derived file
  and projects_and_sources storage group; measure the entire stored wrapper. Every larger source, owner result,
  semantic input, payload or token graph is externalized with SP-337 immutable BLAKE3 id/size/media type evidence
  before its referencing acknowledgement. A large checkpoint uses its closed body_inline=null/body_ref SP-337 route; a small one uses body_inline with body_ref=null. Resolve and validate the complete immutable checkpoint_body under the same token/CAS/source fence. If even a ref-only wrapper exceeds its bound, refuse; never truncate,
  base64-wrap or silently enlarge the limit. Original source schema/recipe and access proofs travel with the referenced
  source bytes. A complete canonical backup includes source/pending/terminal, referenced payload closure, EventRecord
  group/first result and original dedupe; unresolved restore fences current publication. Derived values are omitted
  and rebuilt from verified current survivors, preserving gaps and historical schemas. Pending event retention is
  no purge authority; holds and source/receipt dependencies remain independent. No fresh Store version, native runtime,
  admission or lifetime is invented.'
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- SRV-1415
- CV-1415
- SP-278
- SP-286
- SP-337
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
context_scope: sp-1415_w3e_phase1
implementation_surfaces:
- Plans/storage-plan.md
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

### SP-1416 - server.discovery_expired source and filtered history custody

```yaml
plan_unit_id: SP-1416
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage bindings only for server.discovery_expired@1.0.0, prepared without admission.
  SRV-1416/CV-1416 own the exact semantic contract. Three closed independently keyed values live in Plans/storage_value_registry.json:
  w3e_server_discovery_expired_custody, w3e_server_discovery_expired_history and w3e_server_discovery_expired_checkpoint.
  Current writes remain missing_event_registration; retention_policy_ref=RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0 (DL-454, E-CARDS-3 item 2.a, option A), application editions only, kept 90 days (7,776,000 seconds) from the first successful save that survives a restart, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:routine_observation (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. The custody, history and checkpoint values below inherit this assignment; their Storage registry rows carry it at the batch-3 rebase, when every decided policy object is on the lane. Custody in
  canonical redb uses w3e_server_discovery_expired_custody.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/server_discovery_expired.schema.json#/$defs/custody. It retains original intent,
  complete before/after source refs, original owner result, semantic input, stable event identity/digest and nullable
  first append-result ref. pending_append becomes settled only with actual CV-339 full-value original result; source/receipt
  ambiguity becomes recovery_required. It is not reconstructed from the event. Domain authority remains ServerDiscoveryService.expiry_commit@1.0.0;
  Storage owns atomic persistence only.

  Derived history in redb projections uses w3e_server_discovery_expired_history.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/server_discovery_expired.schema.json#/$defs/history. Its only producer is projector.w3e.server_discovery_expired.history@1.0.0;
  reader.w3e.server_discovery_expired.history@1.0.0 serves Nearby/Known discovery freshness and Server candidate
  Details under source/access/deletion/withdrawal checks. It contains only the original event/custody/payload references,
  canonical sequence and publication generation, no new live domain state.

  The exact checkpoint in derived redb checkpoints is w3e_server_discovery_expired_checkpoint.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}
  and Plans/event_payloads/w3e/server_discovery_expired.schema.json#/$defs/checkpoint. Adopt SP-278 reader.storage.event_record_index@1.0.0
  by name for actual all-partition source completeness, then exact-family/scope/writer filtering. Both the projection-generation
  pointer and exact checkpoint advance with changed rows under prior-value CAS in one write transaction. Persist
  the nine-field durable generic_read_token (DL-076), never redb_snapshot_id; join a fresh live read snapshot for
  validation. Checkpoints cannot publish the generic index or select CURRENT. Inclusive restart verifies last_examined_cursor
  frame identity/end offset; no cursor regression or unsupported-source skip. Withdrawal fences source/reader and
  invalidates publication; verified shadow rebuild swaps atomically without source mutation.

  Adopt SP-286 and CV-339 first-AppendReceipt and full-value v2 custody, SP-236 physical bytes and SP-337 large-body
  addressing by name. Each encoded value has the SP-340 maximum 16384 bytes in its named canonical/derived file
  and projects_and_sources storage group; measure the entire stored wrapper. Every larger source, owner result,
  semantic input, payload or token graph is externalized with SP-337 immutable BLAKE3 id/size/media type evidence
  before its referencing acknowledgement. A large checkpoint uses its closed body_inline=null/body_ref SP-337 route; a small one uses body_inline with body_ref=null. Resolve and validate the complete immutable checkpoint_body under the same token/CAS/source fence. If even a ref-only wrapper exceeds its bound, refuse; never truncate,
  base64-wrap or silently enlarge the limit. Original source schema/recipe and access proofs travel with the referenced
  source bytes. A complete canonical backup includes source/pending/terminal, referenced payload closure, EventRecord
  group/first result and original dedupe; unresolved restore fences current publication. Derived values are omitted
  and rebuilt from verified current survivors, preserving gaps and historical schemas. Pending event retention is
  no purge authority; holds and source/receipt dependencies remain independent. No fresh Store version, native runtime,
  admission or lifetime is invented.'
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- SRV-1416
- CV-1416
- SP-278
- SP-286
- SP-337
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
context_scope: sp-1416_w3e_phase1
implementation_surfaces:
- Plans/storage-plan.md
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

### SP-1417 - server.discovery_observed source and filtered history custody

```yaml
plan_unit_id: SP-1417
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage bindings only for server.discovery_observed@1.0.0, prepared without admission.
  SRV-1417/CV-1417 own the exact semantic contract. Three closed independently keyed values live in Plans/storage_value_registry.json:
  w3e_server_discovery_observed_custody, w3e_server_discovery_observed_history and w3e_server_discovery_observed_checkpoint.
  Current writes remain missing_event_registration; retention_policy_ref=RP-ROUTINE-OBSERVATION-APPLICATION-90D@1.0.0 (DL-454, E-CARDS-3 item 2.a, option A), application editions only, kept 90 days (7,776,000 seconds) from the first successful save that survives a restart, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:routine_observation (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. The custody, history and checkpoint values below inherit this assignment; their Storage registry rows carry it at the batch-3 rebase, when every decided policy object is on the lane. Custody in
  canonical redb uses w3e_server_discovery_observed_custody.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/server_discovery_observed.schema.json#/$defs/custody. It retains original intent,
  complete before/after source refs, original owner result, semantic input, stable event identity/digest and nullable
  first append-result ref. pending_append becomes settled only with actual CV-339 full-value original result; source/receipt
  ambiguity becomes recovery_required. It is not reconstructed from the event. Domain authority remains ServerDiscoveryService.observation_commit@1.0.0;
  Storage owns atomic persistence only.

  Derived history in redb projections uses w3e_server_discovery_observed_history.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/server_discovery_observed.schema.json#/$defs/history. Its only producer is projector.w3e.server_discovery_observed.history@1.0.0;
  reader.w3e.server_discovery_observed.history@1.0.0 serves Nearby/Known Server candidates and identity-confirmation
  Details under source/access/deletion/withdrawal checks. It contains only the original event/custody/payload references,
  canonical sequence and publication generation, no new live domain state.

  The exact checkpoint in derived redb checkpoints is w3e_server_discovery_observed_checkpoint.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}
  and Plans/event_payloads/w3e/server_discovery_observed.schema.json#/$defs/checkpoint. Adopt SP-278 reader.storage.event_record_index@1.0.0
  by name for actual all-partition source completeness, then exact-family/scope/writer filtering. Both the projection-generation
  pointer and exact checkpoint advance with changed rows under prior-value CAS in one write transaction. Persist
  the nine-field durable generic_read_token (DL-076), never redb_snapshot_id; join a fresh live read snapshot for
  validation. Checkpoints cannot publish the generic index or select CURRENT. Inclusive restart verifies last_examined_cursor
  frame identity/end offset; no cursor regression or unsupported-source skip. Withdrawal fences source/reader and
  invalidates publication; verified shadow rebuild swaps atomically without source mutation.

  Adopt SP-286 and CV-339 first-AppendReceipt and full-value v2 custody, SP-236 physical bytes and SP-337 large-body
  addressing by name. Each encoded value has the SP-340 maximum 16384 bytes in its named canonical/derived file
  and projects_and_sources storage group; measure the entire stored wrapper. Every larger source, owner result,
  semantic input, payload or token graph is externalized with SP-337 immutable BLAKE3 id/size/media type evidence
  before its referencing acknowledgement. A large checkpoint uses its closed body_inline=null/body_ref SP-337 route; a small one uses body_inline with body_ref=null. Resolve and validate the complete immutable checkpoint_body under the same token/CAS/source fence. If even a ref-only wrapper exceeds its bound, refuse; never truncate,
  base64-wrap or silently enlarge the limit. Original source schema/recipe and access proofs travel with the referenced
  source bytes. A complete canonical backup includes source/pending/terminal, referenced payload closure, EventRecord
  group/first result and original dedupe; unresolved restore fences current publication. Derived values are omitted
  and rebuilt from verified current survivors, preserving gaps and historical schemas. Pending event retention is
  no purge authority; holds and source/receipt dependencies remain independent. No fresh Store version, native runtime,
  admission or lifetime is invented.'
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- SRV-1417
- CV-1417
- SP-278
- SP-286
- SP-337
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
context_scope: sp-1417_w3e_phase1
implementation_surfaces:
- Plans/storage-plan.md
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

### SP-1418 - server.endpoint_changed source and filtered history custody

```yaml
plan_unit_id: SP-1418
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage bindings only for server.endpoint_changed@1.0.0, prepared without admission.
  SRV-1418/CV-1418 own the exact semantic contract. Three closed independently keyed values live in Plans/storage_value_registry.json:
  w3e_server_endpoint_changed_custody, w3e_server_endpoint_changed_history and w3e_server_endpoint_changed_checkpoint.
  Current writes remain missing_event_registration; retention_policy_ref=RP-AUTHORITY-INDEFINITE@1.0.0 (DL-453, E-CARDS-3 item 1.a, option A), kept permanently, application editions only, with no age or count expiry and no new count allowance; storage pressure refuses new history writes, and explicit application data deletion follows its existing authorized rules. Deleting the described object does not remove this separate history or keep the deleted content. The custody, history and checkpoint values below inherit this assignment; their Storage registry rows carry it at the batch-3 rebase, when every decided policy object is on the lane. Custody in
  canonical redb uses w3e_server_endpoint_changed_custody.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/server_endpoint_changed.schema.json#/$defs/custody. It retains original intent, complete
  before/after source refs, original owner result, semantic input, stable event identity/digest and nullable first
  append-result ref. pending_append becomes settled only with actual CV-339 full-value original result; source/receipt
  ambiguity becomes recovery_required. It is not reconstructed from the event. Domain authority remains ServerCatalogService.endpoint_commit@1.0.0;
  Storage owns atomic persistence only.

  Derived history in redb projections uses w3e_server_endpoint_changed_history.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/server_endpoint_changed.schema.json#/$defs/history. Its only producer is projector.w3e.server_endpoint_changed.history@1.0.0;
  reader.w3e.server_endpoint_changed.history@1.0.0 serves Server endpoint list/Details and Remote Access endpoint
  association under source/access/deletion/withdrawal checks. It contains only the original event/custody/payload
  references, canonical sequence and publication generation, no new live domain state.

  The exact checkpoint in derived redb checkpoints is w3e_server_endpoint_changed_checkpoint.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}
  and Plans/event_payloads/w3e/server_endpoint_changed.schema.json#/$defs/checkpoint. Adopt SP-278 reader.storage.event_record_index@1.0.0
  by name for actual all-partition source completeness, then exact-family/scope/writer filtering. Both the projection-generation
  pointer and exact checkpoint advance with changed rows under prior-value CAS in one write transaction. Persist
  the nine-field durable generic_read_token (DL-076), never redb_snapshot_id; join a fresh live read snapshot for
  validation. Checkpoints cannot publish the generic index or select CURRENT. Inclusive restart verifies last_examined_cursor
  frame identity/end offset; no cursor regression or unsupported-source skip. Withdrawal fences source/reader and
  invalidates publication; verified shadow rebuild swaps atomically without source mutation.

  Adopt SP-286 and CV-339 first-AppendReceipt and full-value v2 custody, SP-236 physical bytes and SP-337 large-body
  addressing by name. Each encoded value has the SP-340 maximum 16384 bytes in its named canonical/derived file
  and projects_and_sources storage group; measure the entire stored wrapper. Every larger source, owner result,
  semantic input, payload or token graph is externalized with SP-337 immutable BLAKE3 id/size/media type evidence
  before its referencing acknowledgement. A large checkpoint uses its closed body_inline=null/body_ref SP-337 route; a small one uses body_inline with body_ref=null. Resolve and validate the complete immutable checkpoint_body under the same token/CAS/source fence. If even a ref-only wrapper exceeds its bound, refuse; never truncate,
  base64-wrap or silently enlarge the limit. Original source schema/recipe and access proofs travel with the referenced
  source bytes. A complete canonical backup includes source/pending/terminal, referenced payload closure, EventRecord
  group/first result and original dedupe; unresolved restore fences current publication. Derived values are omitted
  and rebuilt from verified current survivors, preserving gaps and historical schemas. Pending event retention is
  no purge authority; holds and source/receipt dependencies remain independent. No fresh Store version, native runtime,
  admission or lifetime is invented.'
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- SRV-1418
- CV-1418
- SP-278
- SP-286
- SP-337
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
context_scope: sp-1418_w3e_phase1
implementation_surfaces:
- Plans/storage-plan.md
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

### SP-1419 - server.identity_mismatch_detected source and filtered history custody

```yaml
plan_unit_id: SP-1419
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage bindings only for server.identity_mismatch_detected@1.0.0, prepared without
  admission. SRV-1419/CV-1419 own the exact semantic contract. Three closed independently keyed values live in Plans/storage_value_registry.json:
  w3e_server_identity_mismatch_detected_custody, w3e_server_identity_mismatch_detected_history and w3e_server_identity_mismatch_detected_checkpoint.
  Current writes remain missing_event_registration; retention_policy_ref=RP-OPERATIONAL-SECURITY-APPLICATION-2555D@1.0.0 (DL-455, E-CARDS-3 item 3.a, option A), application editions only, kept seven years (220,752,000 seconds) from the original saved change, never restarted by retry, reprocessing or restore, in the one separate 2,000,000-entry application allowance app:operational_security (fail_closed overflow, hold eligible; only expired unprotected entries are removed). The policy object is defined on main (Plans/storage-plan.md third-sitting retention assignments) and arrives on this lane with the batch-3 rebase. The custody, history and checkpoint values below inherit this assignment; their Storage registry rows carry it at the batch-3 rebase, when every decided policy object is on the lane. Custody in
  canonical redb uses w3e_server_identity_mismatch_detected_custody.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/server_identity_mismatch_detected.schema.json#/$defs/custody. It retains original
  intent, complete before/after source refs, original owner result, semantic input, stable event identity/digest
  and nullable first append-result ref. pending_append becomes settled only with actual CV-339 full-value original
  result; source/receipt ambiguity becomes recovery_required. It is not reconstructed from the event. Domain authority
  remains ServerIdentityVerifier.mismatch_commit@1.0.0; Storage owns atomic persistence only.

  Derived history in redb projections uses w3e_server_identity_mismatch_detected_history.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}:{hex(owner_operation_id)}
  and Plans/event_payloads/w3e/server_identity_mismatch_detected.schema.json#/$defs/history. Its only producer is
  projector.w3e.server_identity_mismatch_detected.history@1.0.0; reader.w3e.server_identity_mismatch_detected.history@1.0.0
  serves Server/Remote Access mismatch attention and identity-confirmation Details under source/access/deletion/withdrawal
  checks. It contains only the original event/custody/payload references, canonical sequence and publication generation,
  no new live domain state.

  The exact checkpoint in derived redb checkpoints is w3e_server_identity_mismatch_detected_checkpoint.v1:{hex(storage_instance_id)}:{scope_partition}:{hex(server_id)}
  and Plans/event_payloads/w3e/server_identity_mismatch_detected.schema.json#/$defs/checkpoint. Adopt SP-278 reader.storage.event_record_index@1.0.0
  by name for actual all-partition source completeness, then exact-family/scope/writer filtering. Both the projection-generation
  pointer and exact checkpoint advance with changed rows under prior-value CAS in one write transaction. Persist
  the nine-field durable generic_read_token (DL-076), never redb_snapshot_id; join a fresh live read snapshot for
  validation. Checkpoints cannot publish the generic index or select CURRENT. Inclusive restart verifies last_examined_cursor
  frame identity/end offset; no cursor regression or unsupported-source skip. Withdrawal fences source/reader and
  invalidates publication; verified shadow rebuild swaps atomically without source mutation.

  Adopt SP-286 and CV-339 first-AppendReceipt and full-value v2 custody, SP-236 physical bytes and SP-337 large-body
  addressing by name. Each encoded value has the SP-340 maximum 16384 bytes in its named canonical/derived file
  and projects_and_sources storage group; measure the entire stored wrapper. Every larger source, owner result,
  semantic input, payload or token graph is externalized with SP-337 immutable BLAKE3 id/size/media type evidence
  before its referencing acknowledgement. A large checkpoint uses its closed body_inline=null/body_ref SP-337 route; a small one uses body_inline with body_ref=null. Resolve and validate the complete immutable checkpoint_body under the same token/CAS/source fence. If even a ref-only wrapper exceeds its bound, refuse; never truncate,
  base64-wrap or silently enlarge the limit. Original source schema/recipe and access proofs travel with the referenced
  source bytes. A complete canonical backup includes source/pending/terminal, referenced payload closure, EventRecord
  group/first result and original dedupe; unresolved restore fences current publication. Derived values are omitted
  and rebuilt from verified current survivors, preserving gaps and historical schemas. Pending event retention is
  no purge authority; holds and source/receipt dependencies remain independent. No fresh Store version, native runtime,
  admission or lifetime is invented.'
gui_related: false
gui_classification_reason: Defines event data, source custody, replay and internal checkpoints; existing surfaces
  only.
depends_on:
- SRV-1419
- CV-1419
- SP-278
- SP-286
- SP-337
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
context_scope: sp-1419_w3e_phase1
implementation_surfaces:
- Plans/storage-plan.md
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
