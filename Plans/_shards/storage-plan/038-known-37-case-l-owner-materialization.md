# Shard 038: Known-37 Case L owner materialization

Source: `Plans/storage-plan.md`

Source lines: L17722-L17807

Source SHA256: `6cae6d4bebe68a39b13ecadcec32580598254209e62566daff4d272354e4dd08`

---

## Known-37 Case L owner materialization

Status: `STATICALLY_MATERIALIZED`. This section is the Storage owner contract for the approved 55-path Plans-only transaction. It does not claim fixture, validator, runtime, gate, certification, buildability, Case L closure, or closure of `CL-CRIT-EVENT-AUTHORITY-001`.

### Known-37 retention assignment (`RET-K37-ASSIGNMENT-001@1.0.0`)

The sole catalog is `Plans/storage_value_registry.json#/retention_policies`, schema `pm.storage_value_registry.v2@2.0.0`. Each event family in the historical Known-37 assignment has exactly one closed `retention_policy_ref = {registry_schema_id, policy_id, policy_version}`, with `registry_schema_id=pm.storage_value_registry.v2` and version `1.0.0`. That bounded assignment used `pm.event_family_registry.v1`, instance schema version `2.0.0`, revision `2026-07-18.2`; exactly 37 families in that historical slice have revision `2.0.0`. The live registry is now revision `2026-08-27.1` with 39 rows; that revision upgrades the existing `workspace.layout_changed` family and its closed payload contract to `1.1.0` without adding a fortieth family. The two post-Known-37 rows are not retroactively part of the Known-37 assignment, and neither the revision upgrade nor this currentness correction asserts a complete current registry or current denominator: the denominator remains `UNKNOWN_OPEN`.

Currentness boundary (2026-08-10): the July Event Authority union records 37 registered rows, at least 248 confirmed persisted-unregistered families, at least 40 unresolved exact rows, and 68 excluded rows. It proves only a source-dated persisted floor of at least 285 and leaves the complete denominator `UNKNOWN_OPEN`. This claim is bound to `EA-27_PRODUCER_UNION_AND_DENOMINATOR.json` (SHA-256 `644c6d0bc913eaed62f41e231fdb7e04f55d270549fcdede73a0869994111e47`; `union_rows_sha256=aa9c365904788eba74df73bb1b5eecaae903a6aa167e0514b7937198aa0dbf4d`) and `EA-29_TERMINAL_FINDINGS_RESIDUALS_CONTRACT_DEPTH_REPAIR_AND_WAVE1_CHECKPOINT.md` (SHA-256 `17820aef1b498acf2e5165bee106171ff1ef35a1b23fa67d0cc23e291a8ed7bf`) under external `PuppetMaster-AssuranceLab` custody. This lower-bound evidence requires fresh reconciliation against current sources; it forbids bulk registration and does not close material contract depth, Case L, PNC-019, buildability, or `CL-CRIT-EVENT-AUTHORITY-001`. Unknown or unregistered families remain quarantined without checkpoint advance.

The three catalog additions are exact:

| policy | mode/anchor/TTL | cardinality | overflow/hold/expiry |
|---|---|---|---|
| `RP-RUNTIME-365D@1.0.0` | `fixed_ttl`, `run_completion`, 31,536,000 seconds | 1,000,000/run plus 5,000,000/project | `roll_successor`, hold eligible, `compact` |
| `RP-SEGLOG-7D@1.0.0` | `fixed_ttl`, `creation`, 604,800 seconds | 500,000/instance | `evict_oldest_eligible`, hold eligible, `compact` |
| `RP-RESTOREPOINT-90D-AFTER-RELEASE@1.0.0` | `anchored_then_ttl`, `reference_release`, 7,776,000 seconds | 2,048/project | `evict_oldest_eligible`, hold eligible, `retain_hash_summary` |

All have `source_policy_ref=null`, `max_bytes=null`; only runtime has additional project cardinality. Existing `RP-AUTHORITY-INDEFINITE`, `RP-OPERATIONAL-2555D`, and `RP-SAFEPOINT-90D-AFTER-RELEASE` remain unchanged.

| event types | exact policy | count |
|---|---|---:|
| `goal.blocked`, `goal.cancelled`, `goal.child_status_changed`, `goal.completed`, `goal.created`, `goal.degraded`, `goal.evidence_captured`, `goal.progressed`, `goal.receipt_recorded`, `goal.replanned`, `goal.scheduled`, `goal.stopped`, `goal.tool_check_recorded`, `goal.updated`, `goal.verification_decided`, `goal_run.blocked`, `goal_run.cancelled`, `goal_run.certified`, `goal_run.stopped`, `storage.deletion_lifecycle_changed`, `storage.integrity_detected`, `storage.retention_hold_changed`, `storage.value_quarantine_changed` | `RP-AUTHORITY-INDEFINITE@1.0.0` | 23 |
| `platform.capability_evaluated`, `storage.boot_recovery`, `storage.compaction_lifecycle_changed`, `storage.recovery_applied` | `RP-OPERATIONAL-2555D@1.0.0` | 4 |
| `restore_point.applied`, `restore_point.corrupt`, `restore_point.created`, `restore_point.deleted`, `restore_point.expired` | `RP-RESTOREPOINT-90D-AFTER-RELEASE@1.0.0` | 5 |
| `goal_run.replanned`, `goal_run.started`, `run.started` | `RP-RUNTIME-365D@1.0.0` | 3 |
| `safe_point.recovery_unavailable` | `RP-SAFEPOINT-90D-AFTER-RELEASE@1.0.0` | 1 |
| `seglog.event_appended` | `RP-SEGLOG-7D@1.0.0` | 1 |

`goal.evidence_captured.payload.retention_policy_ref` is evidence-object policy and cannot shorten the row policy. `restore_point.expired.payload.retention_policy_ref` must equal row policy ID `RP-RESTOREPOINT-90D-AFTER-RELEASE`. `storage.retention_hold_changed.payload.policy_ref` is the held target policy and need not equal the row policy.

`MIG-EVENT-RETENTION-KNOWN37-001` is the historical Known-37 migration only. It requires exact source registry `1.0.0/2026-07-18.1`, the exact 37 stable event/family pairs with no refs, mandatory backup, exact event-type assignment, unchanged EventRecord bytes/identity, full set/referential/hold verification, and one existing `pm.storage_value.migration_receipt.v1`. It is not a migration recipe or currentness proof for the live 39-row registry. Missing/extra/duplicate/conflicting/unknown input quarantines; a blocked or rolled-back migration cannot expose the new assignment.

### Goal Runtime persistence and dispatch

The 21 v2 Goal roots at `Plans/event_payloads/goal_runtime/*.schema.json#` are the sole new writers. The legacy aggregate `Plans/goal_runtime_events.schema.json` is immutable reader-only input. V1 may enter only a registered legacy normalizer and `projector_replay_only`; it may rebuild disposable projections but may not emit, mutate, schedule, approve, charge, write a receipt, or certify.

All v2 rows use `replay_policy=dedupe_by_idempotency_key`, reject unhandled secrets, have no redaction transform, and use the matrix semantic identity tuple. Same identity/digest returns the original durable result; same identity/different digest is `idempotency_conflict`; unavailable proof is `dedupe_unavailable`. Stale CAS is `revision_conflict`. Unknown schema/event/enum, illegal transition, unresolved ref, identity join conflict, raw secret, viewer storage, or unknown recovery truth appends nothing and advances no checkpoint. Canonical receipts stay distinct from disposable projections.

### Event-specific v1 reader to v2 writer bindings

Each old object remains exact, immutable, reader/upgrader-only inside its event-specific artifact. New append admission accepts only root `#`.

| event | old reader pointer | v2 writer ID | upgrader | quarantine reason |
|---|---|---|---|---|
| `platform.capability_evaluated` | `Plans/event_payload_platform_capability_evaluated.schema.json#/$defs/platform_capability_evaluated_1_0_0_compatibility_reader` | `https://puppetmaster.local/schemas/event_payloads/platform_capability_evaluated/2.0.0` | `MIG-PLATFORM-CAPABILITY-EVALUATED-PAYLOAD-001@1.0.0` | `quarantine_without_checkpoint_advance` |
| `restore_point.corrupt` | `Plans/event_payload_restore_point_corrupt.schema.json#/$defs/restore_point_corrupt_1_0_0_compatibility_reader` | `https://puppetmaster.local/schemas/event_payloads/restore_point_corrupt/2.0.0` | `MIG-RESTORE-POINT-CORRUPT-PAYLOAD-001@1.0.0` | `restore_point_corrupt_v1_upgrade_unresolvable` |
| `run.started` | `Plans/event_payload_run_started.schema.json#/$defs/run_started_1_0_0_compatibility_reader` | `https://puppetmaster.local/schemas/event_payloads/run_started/2.0.0` | `MIG-RUN-STARTED-PAYLOAD-001@1.0.0` | `run_started_v1_upgrade_unresolvable` |
| `safe_point.recovery_unavailable` | `Plans/event_payload_safe_point_recovery_unavailable.schema.json#/$defs/safe_point_recovery_unavailable_1_0_0_compatibility_reader` | `https://puppetmaster.local/schemas/event_payloads/safe_point_recovery_unavailable/2.0.0` | `MIG-SAFE-POINT-RECOVERY-UNAVAILABLE-PAYLOAD-001@1.0.0` | `safe_point_recovery_unavailable_v1_upgrade_unresolvable` |
| `storage.boot_recovery` | `Plans/event_payload_storage_boot_recovery.schema.json#/$defs/storage_boot_recovery_1_0_0_compatibility_reader` | `https://puppetmaster.local/schemas/event_payloads/storage_boot_recovery/2.0.0` | `MIG-STORAGE-BOOT-RECOVERY-PAYLOAD-001@1.0.0` | `storage_boot_recovery_v1_upgrade_unresolvable` |
| `storage.integrity_detected` | `Plans/event_payload_storage_integrity_detected.schema.json#/$defs/storage_integrity_detected_1_0_0_compatibility_reader` | `https://puppetmaster.local/schemas/event_payloads/storage_integrity_detected/2.0.0` | `MIG-STORAGE-INTEGRITY-DETECTED-PAYLOAD-001@1.0.0` | `storage_integrity_detected_v1_upgrade_unresolvable` |
| `storage.recovery_applied` | `Plans/event_payload_storage_recovery_applied.schema.json#/$defs/storage_recovery_applied_1_0_0_compatibility_reader` | `https://puppetmaster.local/schemas/event_payloads/storage_recovery_applied/2.0.0` | `MIG-STORAGE-RECOVERY-APPLIED-PAYLOAD-001@1.0.0` | `storage_recovery_applied_v1_upgrade_unresolvable` |

Every binding first validates the exact old ID/pointer, derives every v2 value only from immutable owner evidence, validates the root, records source/target/upgrader lineage, preserves source bytes and semantic-event cardinality, and never appends a replacement event. Any missing, conflicting, ambiguous, secret-bearing, or unprovable input takes the listed quarantine disposition with no successor publication, checkpoint advance, projection mutation, dispatch, release, or default.

### Requested/effective runtime custody

`requested_effective_runtime` is a launch-critical `redb` / `messagepack_canonical` family, schema `pm.requested_effective_runtime@1.0.0`, owned by Contracts and produced by Executor before run activation. Key and `snapshot_ref` are byte-identical:

`requested_effective_runtime.v1:{project~base64url_no_pad(UTF8(project_id))}:{snapshot_id}:{snapshot_sha256}`.

`snapshot_sha256` is lowercase SHA-256 of RFC 8785 canonical JSON with only `snapshot_ref` and `snapshot_sha256` omitted. All 34 fields are required; exactly `thread_id`, `requested_strategy`, `requested_account_id`, `effective_account_id`, and `account_switch_reason` are nullable. The six owner joins are `run_modes_resolution_ref`, `models_resolution_ref`, `capability_snapshot_ref`, `multi_account_resolution_ref`, `persona_resolution_ref`, and `auth_resolution_ref`.

This family is `canonical_non_rebuildable`, requires mandatory backup, restore from backup, user disclosure on loss, and a mutation fence while unresolved. It is retained at least as long as every referencing EventRecord/hold. Historical replay resolves exact bytes and never reconstructs from current settings. Same key/different bytes is `requested_effective_runtime_identity_conflict`.

### Recovery-unavailable event, receipt, and release

The v2 event reasons are exactly `snapshot_missing | snapshot_corrupt | snapshot_scope_unsupported | snapshot_identity_stale | snapshot_unanchored`. Its allowed actions are exactly the base or conditional isolated-successor arrays issued by FileSafe/Executor. The anchor is established only with event, blocked episode, holds, preserved local work, action list, and establishing receipt as one durability unit.

The sole receipt family is `recovery_unavailable_resolution_receipt`, schema `pm.storage_value.recovery_unavailable_resolution_receipt.v1@1.0.0`, key `recovery_unavailable_resolution_receipt.v1:{project_id}:{anchor_id}:{receipt_id}`, `redb_and_seglog`, `messagepack_canonical`, launch-critical, and present once in both required-family arrays. All 30 fields are required; nullable fields are `attempt_id, reason_code, confirmation_ref, recovery_source_ref, release_reason, verified_manifest_sha256, verification_evidence_ref`. `cleanup_performed=false`.

Receipt command is `cmd.runtime.locate_and_verify_recovery | cmd.runtime.abandon_recovery`; resolution is `owner_verified_recovery | abandoned_by_user`; outcomes are `applied | replayed | refused | failed_recoverable`. Locate success releases `resolved` with verified refs/hash/evidence. Abandon success releases `abandoned_by_user` with confirmation and no cleanup. Every nonsuccess preserves `recovery_unavailable`, null release, and the before snapshot set. Replay returns the original result/receipt and performs no second transition. The authority is indefinite, `canonical_dual_homed`, `restore_backup_then_replay`, mandatory-backup, fail-closed, and never deleted by age, exit, archive, completion, pressure, worktree unbinding, compaction, or cleanup.

### Storage recovery event payloads

All three current writers are self-contained v2 roots with exact frozen v1 readers and the bindings above.

- `storage.boot_recovery`: interrupted kinds are exactly `migration | backup_restore | rotation_truncation | compaction | deletion_quarantine | root_relocation`. Segment state is `opening | active | closed | sealed_degraded`. At least one integrity/recovery ref exists; arrays are sorted/unique/bounded at 4096. Deterministic `recovery_set_id` uses RFC 8785/SHA-256. Same episode replays; an exact later work-set repeat uses a new epoch/set ID and direct `repeat_of` to the earliest matching event.
- `storage.integrity_detected`: failure class is exactly `frame_integrity | header_integrity | payload_integrity | segment_integrity | manifest_integrity | watermark_integrity | sequence_integrity`; watermark relation is `wholly_above_durable_watermark | at_or_below_durable_watermark | straddles_durable_watermark | unknown_durable_watermark_relation`; precision remains `exact_event | exact_byte_range | bounded_sequence_range | unknown_segment_remainder`. CRC pairs, offsets, ranges, event refs, and class/precision products follow the closed schema; detection never performs recovery or advances a checkpoint.
- `storage.recovery_applied`: action is exactly `adopt_valid_tail | seal_degraded | truncate_unacknowledged_tail | exclude_proven_range | restore_verified_backup | block_mutation`; checkpoint action is `advance_to_verified_survivor | preserve_verified_checkpoint | invalidate_and_rebuild | restore_verified_checkpoint | hold_without_advance`; projection action is `resume_from_verified_checkpoint | rebuild_from_verified_survivor | remain_stopped`. The exact schema enforces the integrity-link, pre/post hash/length, excluded-range, sequence-gap, survivor-digest, receipt, disclosure, and aftermath cross-products. Recovery converges and durably appends before projector/mutation admission.

Identifiers are `pm.storage.integrity.v1:{sha256}`, `pm.storage.recovery.v1:{sha256}`, and `pm.storage.recovery_set.v1:{sha256}` over their canonical owner input objects. Unsigned values are `0..18446744073709551615`, CRC is `0..4294967295`, hashes are lowercase 64-hex, ranges are canonical/coalesced, and collections are capped at 4096. Unknown enum/schema/identity/range/receipt/relation authority quarantines without checkpoint advance and blocks mutation.

### Owner-oracle status

`P1..P9`, `N1..N10`; the Goal row/common cases; `CAP-POS-001..010`, `CAP-NEG-001..014`; `EA-OC-004-POS-01..06`, `EA-OC-004-NEG-01..11`; run-start positive 1..12 and negative 1..21; recovery-unavailable `P01..P10`, `N01..N15`; and `BR/IN/RA` positive/negative IDs are normative. Schema/registry structure is `STATICALLY_MATERIALIZED`. Replay, crash-cut, append-count, durability, filesystem, projector, checkpoint, disclosure, command, release, and mutation behavior is `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION`. No case is claimed passed.
