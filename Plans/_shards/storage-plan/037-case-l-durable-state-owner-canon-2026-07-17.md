# Shard 037: Case L durable-state owner canon - 2026-07-17

Source: `Plans/storage-plan.md`

Source lines: L16834-L17719

Source SHA256: `3184c41cc0823c7cc39c93fd44bebed5bed5d784b4ac43e35979ad7b1e47ab94`

---

## Case L durable-state owner canon - 2026-07-17

Status: `accepted`

This section is the canonical storage-owner repair for Case L. It supersedes earlier same-file wording that permits payload-only framing as the first writer, one-record skip without a proven next boundary, timestamp checkpoints, optional recovery backups, silent first-run initialization, unspecified lock freshness, live best-effort viewing of newer stores, or unspecified retention/compaction aftermath. Compatibility text remains source-lineage only where retained above.

Approved source refs:

- `Plans/.audits/plan-assurance-handoff-2026-07-17/HANDOFF.md#phase-2--execute-the-case-l-repairs-parallel-with-phase-1`
- `Case-L:CASE_L_APPROVAL_2026-07-17.md`
- `Case-L:DECISION_REGISTER.md`
- `Case-L:REPAIR_BRIEF.md#L-001..L-033`
- `Case-L:planning/MIGRATION_BACKUP_REPAIR_PLAN.md`
- `Case-L:planning/SEGLOG_RECOVERY_REPAIR_PLAN.md`
- `Case-L:planning/RETENTION_COMPACTION_REPAIR_PLAN.md`
- `Case-L:planning/LOCKING_ROOT_IO_REPAIR_PLAN.md`
- `Case-L:planning/EVENT_RECORD_REPAIR_PLAN.md`
- `Case-L:planning/RESTORE_SAFEPOINT_REPAIR_PLAN.md`
- `Case-L:planning/REGISTRY_REPAIR_PLAN.md`

Approved decision binding is exact:

- Bundle A: `PD-L-01` through `PD-L-06`.
- Bundle B: `SEG-D-001` through `SEG-D-023`; `SEG-D-024` through `SEG-D-029` are canon-forced repair/acceptance rules.
- Bundle C: `PD-L005-01` through `PD-L005-07`, `PD-L010-01` through `PD-L010-03`, `PD-L015-01` through `PD-L015-05`, `PD-L033-01` through `PD-L033-03`, and `PD-SCHEMA-01`.
- Bundle D: `L012-C1` through `L012-C4`, `L014-C1` through `L014-C4`, `L018-C1` through `L018-C3`, and `L011-C1` through `L011-C3`.
- Bundle E: `EVT-01` through `EVT-07`.
- Bundle F: `PD-RSP-01` through `PD-RSP-09`.

If a planning proposal conflicts with the approved Decision Register, the approved Decision Register wins. In particular, `PD-SCHEMA-01` requires the structured retention registry successor `pm.storage_value_registry.v2` / `2.0.0`; earlier proposal text suggesting a `1.1.0` registry document is source-lineage only.

Authority is deliberately split:

1. `Plans/Contracts_V0.md` and `Plans/event_record.schema.json` own the shared EventRecord envelope and closed cross-surface enums.
2. This document owns physical persistence, store admission, migration, backup/restore, seglog durability/recovery, retention/compaction, root/lock/I/O, key namespaces, and storage aftermath.
3. `Plans/storage_value_registry.schema.json` and `Plans/storage_value_registry.json` own machine-readable family rows, value schemas, recovery dispositions, and retention-policy materialization; this prose does not duplicate their complete schemas.
4. `Plans/FileSafe.md` owns worktree restore mechanics/equality; `Plans/WorktreeGitImprovement.md` owns baseline worktree effects; `Plans/assistant-chat-design.md` owns conversation restore-point lifecycle. Storage owns their durable keys, refs, journals, and retention only.
5. Consumer docs present or invoke owner outcomes and MUST NOT define peer storage algorithms, alternate state enums, alternate key namespaces, or weaker failure behavior.

ContractRef: ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/event_record.schema.json, ContractName:Plans/storage_value_registry.schema.json, ContractName:Plans/storage_value_registry.json, ContractName:Plans/FileSafe.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/assistant-chat-design.md, PolicyRule:Decision_Policy.md§2

### Case L-1. Compatibility admission, migration, canonical redb, and backup/restore

#### Store-version admission and downgrade

Before directory initialization over an existing root, writer/projector start, migration, compatibility rewrite, or ordinary read open, read only the minimum version metadata and compare:

- redb store integer `schema_version` against the supported graph range;
- seglog frame/header version and `segment_generation` against the supported reader set;
- every encountered EventRecord `{schema_id, schema_version}` against registered readers/upgraders.

Closed `storage_open_state` values are:

`checking | compatible | migrating | recovering | blocked_newer_store | blocked_unsupported_old_store | blocked_integrity | blocked_recovery_failed | ready`

Any version above the relevant ceiling enters `blocked_newer_store`, leaves the entire target root byte-for-byte unchanged, and starts no store, projector, normal writer, janitor, or migration. A projector that encounters a future EventRecord halts before it, sets `projection_health = unavailable`, reason `unsupported_schema_version`, and preserves `last_supported_sequence_id`. It never skips or quarantines an otherwise valid future record.

Metadata-only compatibility diagnostics may show writer/supported versions without opening the store as live `/read-only` viewer. Allowed actions are update/check, choose a verified compatible backup, diagnostics, and quit; `try_anyway` does not exist. In-place/downward migration is unsupported. Downgrade means offline whole-boundary restore of a backup supported by the running app. Writes after that backup boundary are explicitly disclosed as the rollback loss window.

The blocked-newer-store startup surface displays: `This data was written by Puppet Master {writer_version}. This version supports storage through {max_supported_version}. Update Puppet Master or restore a compatible backup. Your data was not changed.` Its stable action intents are `check_for_update | choose_compatible_backup | open_diagnostics | quit`; it exposes no force-open, live-viewer, or mutation path.

SourceRef: `PD-L-04`, `PD-L-05`, `EVT-07`, `CL-L-001`, `Case-L:L-001`

#### Migration coordinator and state machine

`StorageMigrationCoordinator` is the only migration actor. It holds the aggregate canonical-store lock and maintenance lease and persists a same-root, atomic, file-and-parent-synchronized journal before backup or mutation.

Closed phases are:

`preflight | backup_in_progress | backup_verified | applying | pre_stamp_verified | stamp_committed | post_stamp_verifying | committed | restore_required | restoring | rolled_back | blocked`

Required order and aftermath:

1. Preflight source/target versions, registered graph edge, step bounds, backup capacity, root identity, lock, and required free bytes.
2. Produce and verify the shared-boundary pre-migration backup.
3. Persist `backup_verified` before the first migration step.
4. Apply stable, idempotent step IDs; each redb step is its own durable transaction and is journaled only after commit.
5. Run pre-stamp verification over every affected row/schema/key/alias/ref/checkpoint, not a sample.
6. Commit the store-level version stamp last. Store integer version chooses the migration graph; exact per-family semantic transitions validate its edge.
7. Close/reopen without product writers, run post-stamp verification, persist and read back the terminal migration receipt, then mark `committed`.

Mixed store/family versions are legal only under the matching nonterminal journal while the exclusive lock is held. Mixed versions without that journal are `half_migrated_detected` and block. Restart before `backup_verified` discards only incomplete backup staging and returns to preflight. Restart from `backup_verified` through `pre_stamp_verified` restores the verified backup before ordinary open. Restart after `stamp_committed` re-verifies and commits or restores. One automatic restore attempt is permitted; failure enters `blocked` and never loops or ordinary-opens.

`verified` requires backup manifest/schema/hash/size closure, exact step coverage/order, every affected value validating against the target family schema, alias disposition, store/family target agreement, readable retained seglog/EventRecord generations, checkpoint/index bounds, root/boundary identity agreement, read-only reopen, and migration-receipt round trip. The backup stays protected until post-stamp verification, receipt round trip, and a later compatible verified snapshot.

SourceRef: `PD-L-02`, `PD-L-03`, `CL-L-002`, `CL-L-003`, `CL-L-004`, `Case-L:L-002`

#### Canonical redb recovery and first-run proof

Registry authority classes distinguish `canonical_non_rebuildable`, `canonical_dual_homed`, `derived_rebuildable`, and compatibility/deferred state. Only a materialized derived family may rebuild from its registered retained source. Canonical non-rebuildable redb state remains canonical in redb and uses `restore_from_mandatory_backup`; it MUST NOT be described as a rebuildable projection.

A stable, out-of-root bootstrap binding and in-root `storage_instance_id`/root manifest are continuity evidence. Genuine first run requires all of these to be absent: binding/identity, redb file, retained seglog, migration/restore/maintenance journal, and backup manifest. Existing continuity evidence plus missing redb meta or `schema_version` is `corrupt_or_incomplete_store`; it never initializes or silently wipes.

Verified recovery-snapshot service level:

- verified baseline after genuine initial store creation and before mutation-capable startup;
- snapshot within five minutes after the first dirty canonical mutation;
- at least once per dirty 24-hour window;
- clean-shutdown snapshot when dirty;
- retain the three newest rolling snapshots plus protected migration/restore/hold refs.

If a required baseline/due snapshot cannot be verified, close mutation admission and enter viewer/recovery or blocked posture; diagnostics remain available. Disclose last verified boundary, affected family IDs, and maximum known loss window. Do not silently waive the requirement.

SourceRef: `PD-L-01`, `PD-L-02`, `PD-L-03`, `L018-C1`, `CL-L-005`, `CL-L-006`, `Case-L:L-003`

#### Shared-boundary backup and offline restore

Backup refs are path-independent `backup:{backup_id}`. A completed backup has closed manifest authority containing relative files, SHA-256 and size, store/app versions, root identity, backup kind, and one durable seglog boundary `{segment_generation, segment_name, byte_offset, sequence_id}`. Backup kinds are `baseline | rolling | clean_shutdown | pre_migration | pre_restore | manual`.

Backup capture pauses new canonical mutations, crosses the seglog durable barrier, lets required projectors commit through the boundary or marks them disposable/stale, closes canonical handles, copies only canonical stores into same-filesystem staging, writes/verifies the manifest last, synchronizes files/directories, atomically promotes, and reopens. JSONL/Tantivy and other derived stores rebuild after restore.

Restore selection occurs in the startup recovery shell; `StorageRecoveryCoordinator` executes offline with canonical stores closed:

1. verify manifest/root/hash/size/version ceilings before live mutation;
2. refuse a newer backup; an older supported backup may migrate forward in staging;
3. capture verified `pre_restore` state when readable, otherwise quarantine exact current bytes;
4. materialize/verify staging and persist the restore journal before promotion;
5. quarantine current files, promote staged files through same-filesystem atomic operations, and journal every promotion;
6. after interruption, complete only a verified staging set or restore verified quarantine; never ordinary-open mixed stores;
7. rebuild disposable projections and verify the restored boundary before terminal success.

Closed `data_loss_risk.class` is `none | post_backup_writes_will_be_lost | unknown_due_corruption`. Non-`none` requires explicit confirmation and boundary/family disclosure. JSON/JSONL export is not an importable MVP backup.

SourceRef: `PD-L-05`, `PD-L-06`, `CL-L-007`, `CL-L-008`, `Case-L:L-016`

#### Alias lifecycle, migration history, and preflight

App major N MUST register a migration edge from supported N-1. N-2 needs an explicit edge or blocks as unsupported old state. Aliases are migration-reader inputs only: copy-forward to the canonical key, validate semantic equality, stop new alias writes, remove the live residual only after pre-stamp verification, and preserve prior bytes in the protected backup. Rerun yields the same canonical value and no duplicate receipt.

The machine registry must materialize one migration-receipt family produced by `StorageMigrationCoordinator`; release validation consumes it rather than defining a peer receipt. Completed history carries store and family transitions, preflight, backup ref, steps, verification, rollback, data-loss risk, terminal status, app/journal refs, and timestamps. Failed/nonterminal attempts remain discoverable through external journal evidence.

Each step declares `max_extra_bytes`. Preflight requires:

`required_free_bytes = backup_bytes + staging_bytes + max(268435456, ceil(0.10 * (backup_bytes + staging_bytes)))`

`MigrationPreflightResult` is owned by `Plans/storage_recovery_contracts.schema.json#/$defs/migration_preflight_result` and has exactly the required fields `outcome`, `reason_code`, `filesystem_ref`, `free_bytes`, `required_free_bytes`, `backup_bytes`, `staging_bytes`, `reserve_bytes`, and `checked_at_utc`. `filesystem_ref` is a non-secret stable identity, never an absolute path. `reserve_bytes` MUST equal `max(268435456, ceil(0.10 * (backup_bytes + staging_bytes)))`, and `required_free_bytes` MUST equal `backup_bytes + staging_bytes + reserve_bytes`. The sidecar's mandatory `x-puppet-master-assertions` vocabulary enforces those relations; an implementation or validation path that cannot enforce it fails preflight and MUST NOT treat structural Draft 2020-12 validation alone as `ready`.

The approved result vocabulary is exact: `outcome = ready | blocked`, with required-present `reason_code = null | blocked_insufficient_space`. `ready` requires `reason_code = null` and `free_bytes >= required_free_bytes`. `blocked` requires `reason_code = blocked_insufficient_space` and `free_bytes < required_free_bytes`. No other outcome/reason pairing exists. Inability to measure every required input or construct a conforming result blocks outside the result contract rather than fabricating a schema-valid value. A blocked preflight starts no backup, writes no migration journal beyond any already-created no-mutation admission evidence, and mutates no canonical store.

`MigrationProgressSnapshot` is owned by `Plans/storage_recovery_contracts.schema.json#/$defs/migration_progress_snapshot` and is derived only from the matching durable migration journal. Its phase is exactly one of the twelve coordinator phases above. `completed_steps` and `total_steps` are non-negative with `completed_steps <= total_steps`. `bytes_done` and `bytes_total` are either both absent or both present and non-negative with `bytes_done <= bytes_total`; they are present only when the journal has a measurable byte boundary. Percentage and ETA fields are forbidden. `cancellable=true` exists only during `preflight`; every later phase requires false. Cancellation during preflight produces no migration receipt. From `backup_in_progress` onward, interruption is recovered from the journal and cannot become a force-cancel or try-anyway path.

Terminal receipt linkage is exact. `committed` and `rolled_back` require `terminal_receipt_ref` to the one storage-registry `pm.storage_value.migration_receipt.v1` value. `blocked` after a `ready` preflight requires that same receipt authority; `blocked` caused by the no-mutation `blocked_insufficient_space` preflight has no terminal migration receipt and carries only its preflight result. Every nonterminal phase forbids `terminal_receipt_ref`. The snapshot is never a receipt, and neither this sidecar nor Contracts creates a peer migration receipt.

From `backup_in_progress` through every nonterminal post-preflight phase, the visible interruption copy is: `Keep Puppet Master open. If interrupted, recovery will resume on the next launch.` Force-cancel and try-anyway are absent after preflight. A blocked migration/restore offers only the state-valid subset of retry recovery, update, compatible-backup selection, metadata diagnostics, and quit.

ContractRef: ContractName:Plans/storage_recovery_contracts.schema.json#/$defs/migration_preflight_result, ContractName:Plans/storage_recovery_contracts.schema.json#/$defs/migration_progress_snapshot, ContractName:Plans/Contracts_V0.md#storage-compatibility-and-migration-status-envelope, ContractName:Plans/storage_value_registry.json#/families/migration_receipt/value_schema

#### MVP verification, repair, and salvage invocation boundary

The approved MVP exposes read-only metadata diagnostics plus the startup recovery shell operations above. It does not expose a generic user- or support-invocable live verify/repair/salvage command, a Doctor mutation mode, an in-place store editor, or a bypass token. `Retry storage` and retry-recovery actions re-run closed admission/verification gates; they do not repair bytes. Backup restore remains offline and journaled. Internal migration, restore, compaction, quarantine, and any future salvage algorithm remain coordinator-owned maintenance operations under the aggregate lock and maintenance lease. Adding a generic repair/salvage command is a new product decision requiring Contracts/command/wiring/security ownership; consumers MUST NOT invent one from diagnostics wording.

SourceRef: `PD-L-04`, `PD-L-05`, `PD-L-06`, `CL-L-009`, `CL-L-010`, `CL-L-011`, `Case-L:L-025`, `Case-L:L-031`, `Case-L:L-032`

### Case L-2. SeglogFrameV2, acknowledgement, corruption, and crash convergence

#### Frame generation and validation

The first implementation writes `SeglogFrameV2`; generation 1 is read-only compatibility and is never mixed with V2 in one segment. Every V2 frame starts with a fixed 48-byte little-endian prefix containing magic `PMSEGR2\0`, frame version, bounded header/payload lengths, flags, segment generation, sequence ID, header CRC, payload CRC, prefix CRC, and zero reserved field. CRC uses CRC32/ISO-HDLC; `prefix_crc32` covers the prefix with its own field zeroed. Header metadata is canonical fixed-order MessagePack, at most 4 KiB; inline payload is at most 16 MiB, with larger content using `payload_ref`.

Validation order is fixed: magic; prefix CRC; supported frame version/reserved zero; caps/file bounds; generation/strict sequence; header CRC/decode; payload CRC; decompression bounds; EventRecord schema; duplicate identity cross-check. Resynchronization scans bytewise to the first candidate passing every check. A trustworthy frame length permits one-frame skip only when the computed next boundary validates. Otherwise loss is the exact byte range to the next valid candidate or segment remainder.

Loss disposition is closed:

| Condition | Physical action | Aftermath |
|---|---|---|
| Invalid active EOF wholly after durable watermark | journaled truncate after adopting valid unacknowledged frames | clean recovery summary; no acknowledged-loss claim |
| Proven one-frame or bounded resync hole | active file seals degraded; closed file unchanged | disclosed hole; rebuild projections from survivors |
| No later valid candidate | truncate only if wholly unacknowledged tail; otherwise preserve/seal | remainder unavailable; mutation blocked |
| Any possible loss at/below durable watermark | never clean or silently accepted | global integrity block until verified backup restore or separately governed future loss acceptance |

SourceRef: `SEG-D-001` through `SEG-D-005`, `Case-L:L-004`

#### Manifest, append acknowledgement, and sequence authority

`storage/seglog/manifest.v1.msgpack` is disk-first publication/recovery control metadata, never a second EventRecord source. It records manifest/recovery generation, segment inventory/hashes/ranges/states, active durable commit watermark/group digest, sequence lease/high-water mark, excluded ranges, retired inputs, and survivor-prefix digest.

Append success requires two barriers:

1. complete frame writes plus active-segment `sync_all`;
2. atomic manifest watermark promotion plus parent-directory synchronization.

Only then may append resolve with a synced `AppendReceipt`. `persisted_at_utc` is assigned at commit-group seal and becomes persistence evidence only with that receipt. Ordinary group commit seals on the first of 10 ms, 64 records, or 1 MiB. `durability_class = barrier` forces immediate commit for safe points, runtime checkpoints, approvals, mutation-authorizing receipts/outboxes, and storage recovery events. No mutation or external side effect may continue without the synced prerequisite receipt.

Sequence ranges are durably leased in blocks of 4,096 before issuance; unused IDs after crash are abandoned, never reused. Gaps are legal only with closed reason `allocator_lease_abandoned | corruption_loss | retention_compaction`.

Every file create/rename/unlink/promotion synchronizes the file and destination parent directory; canonical operations fail closed when platform-equivalent directory-entry durability cannot be established.

SourceRef: `SEG-D-006` through `SEG-D-011`, `Case-L:L-007`, `Case-L:L-029`

#### Survivor checkpoints and projection aftermath

Seglog-derived checkpoints contain `manifest_generation`, `recovery_epoch`, segment cursor, `last_sequence_id`, `last_event_id`, `survivor_prefix_sha256`, and projector schema version. Timestamp is observation metadata only. Compaction remaps by semantic sequence/event only when the survivor digest matches; otherwise invalidate/rebuild.

Loss impact uses verified frame metadata first, then neighboring sequences/filename range/watermark/lease, then advisory index rows cross-checked by hashes/identity. It records exact/bounded/unknown precision without promoting projections to authority. A projector that may have consumed excluded bytes discards affected derived state and rebuilds from the nearest matching survivor checkpoint or the first retained event. Freshness may become `current` relative to the survivor set, but health remains `degraded` with gap/recovery provenance.

Unknown or mutation-authorizing loss blocks mutation-capable runtime. Read-only History/Ledger/evidence inspection may continue. Persistent disclosure distinguishes unacknowledged tail, one record, bounded range, and unknown remainder; it never says repaired when canonical bytes were lost.

SourceRef: `SEG-D-012` through `SEG-D-016`, `Case-L:L-013`, `Case-L:L-028`

#### Crash-idempotent maintenance

Every destructive/namespace-changing recovery persists a same-directory intent with deterministic recovery ID, target preimage hash/length, exact postcondition, and manifest precondition before mutation. Restart applies from the precondition, continues from the exact postcondition, or fails closed on a third state. Semantic recovery events dedupe by deterministic ID.

Rotation seals pending groups, persists intent, closes/renames the old active, creates `.opening`, promotes one new active, publishes the manifest, and removes the intent. Startup resolves zero/two-active states from intent+manifest+ranges; ambiguity fails closed, never by mtime.

Tail truncation records target length and prefix/tail hashes, truncates only matching preimage, synchronizes file, publishes watermark/recovery epoch, and dedupes the barrier recovery event. Active midstream corruption seals degraded; closed corruption never changes bytes.

Boot recovery completes seglog recovery before redb projectors or mutation admission. Janitor removes only intent-governed/unreferenced artifacts and emits one summary per deterministic recovery set.

SourceRef: `SEG-D-017` through `SEG-D-023`, `Case-L:L-019`

### Case L-3. Retention, holds, compaction, deletion, and quarantine

#### Retention authority and defaults

Every materialized family/event registration carries an exact structured `retention_policy_ref`; prefix, filename, key name, and mtime MUST NOT infer destructive policy. Unknown policy defaults to indefinite/no-count-eviction and is `materially_incomplete`.

Minimum event-class defaults:

| Class | Window/cardinality | Expiry behavior |
|---|---|---|
| Approval, receipt, audit authority, deletion tombstone, source lineage | indefinite; no count eviction | storage pressure fails closed |
| Non-authority security diagnostics and migration/recovery operational history | 2,555 days; 2,000,000/project | expired unheld rows only; otherwise fail closed |
| Runtime/run/node/attempt | 365 days after run completion; 1,000,000/run and 5,000,000/project | successor compaction |
| Chat content | indefinite while thread exists; 250,000/thread | roll linked successor; never evict content silently |
| Usage/ordinary telemetry | 90 days; 2,000,000/project | compact expired unheld rows |
| `seglog.event_appended` | 7 days; 500,000/instance | compact expired unheld rows |
| Coordination | 180 days after run completion; 1,000,000/project | compact expired unheld rows |
| Released safe points | 90 days after last hold release; 64/run and 2,048/project | oldest eligible only; retained hash summary 365 days |

Expiry is inclusive at `anchor + ttl`. Count order is `(retention_anchor_at_utc, sequence_id?, stable_object_id)`. Legal hold, recovery/preserved/recent-run anchor, live ref, backup, rollback, or maintenance ref overrides age/count eligibility. Latest 25 terminal runs/project receive the automatic `recent_run` anchor; becoming 26th clears only that automatic anchor.

Janitor runs after lock/recovery at startup and every 6 hours, processing at most 10,000 keys or 512 MiB per pass with a durable cursor and frozen cutoff. Compaction evaluates every 24 hours and at 20% reclaimable, 1 GiB reclaimable, or priority deletion intent.

The search-first Settings inventory exposes `Advanced > Storage & Retention`. It permits user configuration of history, diagnostic, and released-safe-point windows only at or above the owner minima; attempts to shorten below those minima are rejected with the owner reason. It shows effective chat/runtime/diagnostic/safe-point policies, the latest-25-run preservation default, compaction/storage-pressure status, and read-only legal-hold/quarantine state. Legal-hold set/clear remains the protected `storage.legal_hold.manage` command rather than an ordinary toggle; manual compaction is an owner-routed maintenance request and cannot bypass eligibility, hold, or maintenance-lease rules.

SourceRef: `PD-L005-01` through `PD-L005-07`, `PD-SCHEMA-01`, `Case-L:L-005`

#### Holds and recovery anchors

Legal holds require `storage.legal_hold.manage`, actor, reason, and durable set/clear receipt; they never clear automatically. Multiple holds compose by union.

A blocked episode with `requires_safe_point_restore = true`, its canonical safe-point record, snapshot/blob refs, and `recovery_anchor_record` publish as one durability unit. Release is allowed only for `resolved | superseded_with_verified_successor | abandoned_by_user`; run completion, age, archive, exit, or worktree unbinding is insufficient. If a required snapshot is missing/corrupt, state becomes `recovery_unavailable`, remains blocked and anchored, preserves local work, disables restore, and requires locate/verified recovery, replan, or explicit abandonment with receipt.

SourceRef: `PD-L010-01` through `PD-L010-03`, `PD-RSP-06`, `Case-L:L-010`

#### Immutable-segment compaction and publication

Migration, compaction, restore, salvage, and backup-boundary capture are mutually exclusive under the aggregate lock plus one maintenance lease. Compaction operates only on a frozen closed source boundary.

Closed phases are:

`preparing | building | verified | commit_pending | committed | finalized | recovery_required | failed`

The builder copies the exact retained EventRecord set in original semantic order to `segment_generation = source + 1`, preserving `sequence_id`, `event_id`, idempotency, causality, timestamps, payload bytes/hash, and gaps. It builds complete target index/checkpoints/shadow projections and a content-free removal/translation manifest. The active segment is excluded.

Publication order is:

1. persist redb `pending_generation` plus target refs/manifest hash;
2. atomically replace same-directory `storage/seglog/CURRENT` and synchronize its parent; this is visibility authority;
3. activate target redb generation, clear pending, finalize, then create the next target active segment.

Before `CURRENT`, source wins. After `CURRENT`, target wins and startup finalizes or blocks; it never chooses newest by mtime. Old source deletion waits for target verification and cleared refs. Checkpoints translate by semantic identity or rebuild; index rows never retain retired physical refs.

##### Compaction lifecycle event action and exceptional-phase contract

`storage.compaction_lifecycle_changed` records the deterministic aftermath modes selected for one `compaction_id`; the action tokens do not by themselves claim that an outcome has been applied. `checkpoint_action` is closed, in order, to `translate_by_semantic_identity | invalidate_and_rebuild`. Translation is admitted only when the survivor digest matches and every carried checkpoint/index position resolves by preserved semantic `sequence_id`/`event_id`; no retired physical segment ref survives, and the prior authoritative checkpoint remains in force until target verification. If survivor equality or any semantic mapping is absent, mismatched, ambiguous, timestamp-derived, or physical-ref-derived, `invalidate_and_rebuild` invalidates the affected checkpoint/index rows and rebuilds from the nearest matching survivor checkpoint or, when none matches, the first retained event. Checkpoint authority advances only after byte/semantic equality and target-generation coverage are proven.

`projection_action` is closed, in order, to `activate_verified_target_shadow | rebuild_from_survivors`. `activate_verified_target_shadow` activates only the complete target-generation shadow verified against the exact retained EventRecord set, survivor/removal map, target indexes/checkpoints, and target generation, and only after synchronized `CURRENT` selects that target; activation and pending-state clear occur once. When a complete target shadow is absent or unprovable, `rebuild_from_survivors` discards affected derived state and rebuilds from the nearest matching survivor checkpoint or the first retained event. No target projection or projector checkpoint is published until that rebuild covers the authoritative target survivor set. There is no `none`, `preserve`, `advance`, generic `recovery`, `swap`, `resume`, generic `rebuild`, packet-007 token, open-string member, or best-effort fallback in either domain.

The exact phase meanings and terminality for one `compaction_id` are:

| Phase | Storage authority meaning | Terminal? |
|---|---|---:|
| `preparing` | Aggregate lock and maintenance lease are held; the closed source boundary, policy revision/hash, target identity, and aftermath modes are selected; no target publication authority exists. | no |
| `building` | The immutable source remains authoritative while the successor EventRecord set, indexes, checkpoints, shadow projections, and removal/translation manifest are built. | no |
| `verified` | Target bytes and required target artifacts verify against the exact retained semantic set; source still wins because `CURRENT` has not changed. | no |
| `commit_pending` | `pending_generation` plus target refs/manifest hash are durable; source still wins while `CURRENT` is proven unchanged. Unknown or target-selected `CURRENT` cannot remain ordinary `commit_pending`. | no |
| `committed` | Synchronized `CURRENT` selects the verified target and target redb activation is complete or proven complete; target wins while finalization may remain. | no |
| `finalized` | Target is authoritative, pending state is cleared, finalization is complete, the next active target segment exists, and old-source deletion remains separately gated by cleared refs. | yes, success |
| `recovery_required` | Authority or post-publication convergence is unresolved; mutation-capable runtime and new maintenance remain fenced while both sides are reconciled from bytes, intent/journal, manifest, and `CURRENT`, never mtime. | no; only the two proof-gated exits below |
| `failed` | The attempt ended before target publication with source authority proven, or recovery ambiguity resolved to that source-authoritative failure; target publication/activation is not claimed. | yes, non-success |

The only ordinary chain is `preparing -> building -> verified -> commit_pending -> committed -> finalized`. Each successor requires the predecessor's complete durable postcondition; skipped, reversed, same-state-as-new, and alternate ordinary edges are illegal. The complete adjacency is:

```text
preparing         -> building | failed | recovery_required
building          -> verified | failed | recovery_required
verified          -> commit_pending | failed | recovery_required
commit_pending    -> committed | failed | recovery_required
committed         -> finalized | recovery_required
recovery_required -> committed | failed
finalized         -> <terminal>
failed            -> <terminal>
```

The exceptional predicates are exact. `preparing | building | verified | commit_pending -> failed` is admitted only when readable `CURRENT` is proven unchanged on the valid source generation, no target visibility or activation occurred, and the durable non-empty `failure_reason` records the fenced non-success. Those same phases enter `recovery_required` when `CURRENT`, intent/journal, manifest, pending-generation state, target state, or publication postcondition is ambiguous, conflicting, or cannot prove source authority; both sides are preserved and mutation, maintenance, projector publication, and checkpoint advance remain fenced. `commit_pending -> recovery_required` is mandatory when `CURRENT` may select the target but activation/finalization is incomplete or unproven. `committed -> recovery_required` preserves target authority when finalization, pending clear, next-active creation, or their postconditions are incomplete, conflicting, or unproven; source rollback and direct failure are forbidden.

`recovery_required -> failed` requires proof that `CURRENT` remained on the valid source, the source boundary is authoritative, and no target visibility/activation occurred. `recovery_required -> committed` requires proof that synchronized `CURRENT` selects the already-verified target, target bytes/artifacts match, and target activation is complete or is completed idempotently; it then continues through `committed -> finalized`. Direct `recovery_required -> finalized`, `committed -> failed`, and any edge out of `finalized | failed` are forbidden. Even when physical finalization is already complete after restart, the lifecycle first proves `committed` and then records the ordinary `committed -> finalized` successor without repeating physical effects.

`failure_reason` is the sole exceptional evidence field: a non-empty string required exactly for `recovery_required | failed` and forbidden for all six ordinary phases. No reason-code enum or peer recovery-evidence field is authorized. Action tokens name selected modes during early, exceptional, or failed phases without fabricating success. For `verified | commit_pending`, required target artifacts are verified but source remains authoritative while `CURRENT` is unchanged. For `committed | finalized`, the selected outcomes are applied and proven against the target selected by `CURRENT`. `recovery_required` preserves the selected/last-proven modes without a success claim; `failed` preserves the attempted modes while forbidding target activation, target checkpoint advance, and source deletion.

Authority order is fixed: verified immutable source/target bytes plus the frozen semantic set; same-directory intent/journal and manifest under lock/lease; target artifact verification; synchronized `storage/seglog/CURRENT` as the sole visibility selector; redb pending/active generation reconciled to `CURRENT`; the admitted lifecycle EventRecord and disposable projection as observations; then GUI, diagnostics, search, indexes, mtimes, and filenames as non-authoritative views. No later layer overrides an earlier disagreement.

Restart of a nonterminal ordinary phase resumes the same `compaction_id` and `storage_maintenance_operation` only at the next legal edge whose predecessor postcondition is proven; missing or conflicting proof enters `recovery_required`. Restart in `recovery_required` retains the same identities, lineage, refs, policy revision/hash, and action tokens and stays fenced until one proof-gated exit is established. Restart after `finalized | failed` returns the original terminal result. Explicit retry after `failed` is a new attempt with a new `compaction_id`, after revalidating current `CURRENT`, frozen source generation, policy revision/hash, retention/hold/live-ref/backup/rollback eligibility, aggregate lock, maintenance lease, and target allocation. Reusing a terminal identity with the same semantic digest returns the original result; a different digest returns `idempotency_conflict`. A later compaction after `finalized` is likewise a new operation.

Global `event_id` and scoped `(scope_partition, event_type, idempotency_key)` identities remain authoritative for app-root lifetime. Same identity and semantic digest returns the original durable result; different digest returns `idempotency_conflict`; unavailable dedupe proof returns `dedupe_unavailable`. Re-observation without a new postcondition is replay, not a new append. `projector_replay_only` rebuilds only owned disposable projections/checkpoints and cannot append, dispatch, notify, charge, mutate canonical values, or select Storage authority. Unknown or unregistered action, phase, schema, owner, alias, transition, retention, identity, or secret authority quarantines without checkpoint advance; raw credentials, secrets, local paths, and machine-local state are rejected before append. Every refusal/rejection has zero append, zero projection effect, zero checkpoint advance, zero command/tool/provider/network dispatch, and zero source/target namespace mutation.

SourceRef: `PD-L015-01` through `PD-L015-03`, `SEG-D-021`, `Case-L:L-015`, `Case-L:L-030`

#### Thread/project deletion

Thread deletion immediately persists a content-free tombstone/deletion record and removes the thread from normal navigation/search/context/export projections. It forces rotation when needed and physically purges active canonical content, message/attachment/blob content, mirrors, search, and derived rows within 24 hours unless held. Non-content audit/runtime receipts remain under their owner policy. Backups retain deleted bytes at most 30 days unless held and MUST replay tombstones before visibility after restore.

`Remove project from list` remains a registry/UI tombstone only. `Delete Puppet Master project data` is a separately confirmed destructive intent that compacts project content from the app-global seglog. Ambiguous/cross-project reachability blocks instead of inferring from path/name/time.

`storage.deletion_lifecycle_changed` uses required spine `schema_version`, `deletion_id`, semantic `deletion_scope_ref`, `state`, `actor_ref`, `hold_blockers`, `purge_deadline_utc`, and content-free `tombstone_ref`; only `project_id`, `compaction_generation`, and `failure_reason` are conditional. Event-payload state conditions are exact: `requested | logically_hidden | held` forbid both conditional evidence fields; `purge_pending` permits an absent or non-negative integer `compaction_generation` and forbids `failure_reason`; `purged` requires non-negative integer `compaction_generation` and forbids `failure_reason`; `failed` forbids `compaction_generation` and requires a non-empty `failure_reason`. A pending generation is not visibility authority, and `purged` is admitted only after owner compaction proves a verified committed successor generation.

The ordinary graph is `requested -> logically_hidden`; `logically_hidden -> held` when current hold evaluation yields blockers; `logically_hidden -> purge_pending` when holds are absent and scope, tombstone, writer, and purge/compaction authority are current; `held -> purge_pending` only after every blocking hold is owner-cleared and the complete eligibility set is revalidated; and `purge_pending -> purged` only with verified committed successor-generation and content-free tombstone authority. Direct `requested -> purge_pending|purged`, `logically_hidden -> purged`, `held -> purged`, purge while a blocker remains, and every transition out of terminal `purged` are forbidden.

Failure ingress is closed to `requested | logically_hidden | purge_pending -> failed`. `held -> failed` is forbidden because hold disclosure remains `held`; `purged -> failed` is forbidden because purge is terminal. `failed` is fenced, retryable non-success. Retry reuses the same `deletion_id` and existing deletion-operation idempotency identity, does not mint a new lifecycle or retry identity, and revalidates holds, tombstone, scope, storage-writer posture, and purge/compaction authority before a graph-valid successor. It creates no fixed bypass from `failed` to `purge_pending` or `purged`.

Admission order is fail closed: validate the EventRecord/payload discriminator, schema/version, current-state conditional, and dual-scope equality; resolve the same durable deletion record/current state and replay identity; revalidate deletion scope and cross-project reachability; revalidate all holds; prove the content-free tombstone and logical hide; prove writer and owner maintenance/compaction authority; for `purged`, prove the verified committed successor generation; then append at most one semantic event and advance owned projections/checkpoints only after those proofs. UI/command acceptance is not purge authority. Same EventRecord identity/digest returns the original durable result with one append and no duplicate purge/projection effect; a different digest returns `idempotency_conflict`; unavailable dedupe proof returns `dedupe_unavailable`. Every refusal or rejection has zero new append, zero owner-state mutation, zero projection effect, zero checkpoint advance, zero purge/compaction dispatch, and zero hold clear.

SourceRef: `PD-L015-04`, `PD-L015-05`, `Case-L:L-005`, `Case-L:L-015`

#### Invalid-value quarantine

Before invalid canonical bytes are reset, removed, migrated, or replaced, write exact `raw.bin` plus closed custody manifest and append-only recovery receipts under same-filesystem quarantine; synchronize file and parent before live-key mutation. Closed states are:

Closed transition edges are exactly: `detected -> secured`; `secured -> migrated | rebuilt | reset_to_default | restored | recovery_blocked`; and `migrated | rebuilt | reset_to_default | restored -> purged`. There is no direct `detected` resolution, no `recovery_blocked -> purged`, and no transition out of `purged`.

Only resettable GUI/projection state may secure then reset to owner defaults. Authority, receipts, blocked state, safe points, holds, and audit state fail closed. Unknown schema/upgrader stays `recovery_blocked`.

Risk classes are `Q-CRITICAL | Q-RESETTABLE | Q-DERIVED | Q-MIRROR`. Unresolved critical quarantine is indefinite and never cap-evicted; cap pressure blocks new mutation-capable writes. Raw bytes inherit source permissions, stay out of routine export, and require protected explicit export.

SourceRef: `PD-L033-01` through `PD-L033-03`, `Case-L:L-033`

### Case L-4. Storage I/O, aggregate lock/viewer, root continuity, and fallback

#### Closed operational vocabulary

Required identities are `bootstrap_root`, `logical_root`, `active_root`, stable random `storage_instance_id`, normalized-path `logical_root_fingerprint`, monotonic `root_generation`, `fallback_branch_id`, and exact `fallback_base`.

Closed `storage_access_mode` is `writer | viewer | blocked`. Closed minimum `storage_mode_reason` is:

`normal | lock_held | lock_indeterminate | unsupported_store_version | unsafe_filesystem_no_fallback | storage_io_exhausted | root_mismatch | root_unavailable | fallback_diverged`

The bootstrap binding is outside root-selection precedence; the in-root identity manifest carries instance/generation and optional fallback lineage. Raw local locators remain local/redacted.

SourceRef: `L018-C1`, `Case-L:L-018`

#### Storage-I/O taxonomy and failure gate

Closed `storage_io_class` is:

`interrupted | transient_busy | capacity_exhausted | quota_exhausted | read_only_media | permission_denied | device_unavailable | lock_conflict | integrity_failure | invalid_path`

`interrupted` retries the same syscall at most three immediate adapter attempts. `transient_busy` retries exactly once after 250 ms. Nothing else auto-retries; unknown maps fail-closed to `device_unavailable`.

Exhausted/nonretryable canonical I/O closes the global write gate, rejects new canonical writes/mutation-capable attempts, stops projectors/checkpoints/analytics/maintenance writers, retains an already-held lock, and enters validated viewer or blocked. No canonical event/receipt is buffered as pseudo-durable memory state. ENOSPC never deletes authority, active segments, backups, or safe points to continue. An optional 8 MiB diagnostic reserve is best effort only.

Explicit `Retry storage` probes writeability, root identity, versions, integrity, lock, and checkpoints before writer mode; blocked attempts do not auto-resume.

SourceRef: `L012-C1` through `L012-C4`, `Case-L:L-012`

#### Aggregate OS lock and viewer envelope

One aggregate canonical-store `pm.lock` per active root is held for the OS handle lifetime. Unix uses nonblocking exclusive `flock`; Windows uses `CreateFileW` plus nonblocking exclusive `LockFileEx`; result is `acquired | held | indeterminate | unsupported`. Unsupported/untrustworthy semantics route to unsafe-root handling.

PID, mtime, owner file, and heartbeat are diagnostics only. Heartbeat interval is 2 seconds and diagnostic stale threshold 10 seconds. A stale heartbeat never authorizes takeover while the OS lock is held. Takeover acquires OS lock first, then replaces/synchronizes owner diagnostics; the lock file is never deleted/renamed to seize authority.

Lock-conflict viewer is a frozen, manually refreshable compatible snapshot at one high-water mark. It starts no writer, migration, janitor, projector/checkpoint writer, analytics, compaction, backup, settings/history/session writer, agent/run/provider side effect, or external mutation. View-local state is visibly ephemeral. Mutation-capable commands remain discoverable but disabled with `storage_read_only`. Promotion is never automatic: close readers, rerun continuity/safety/version/integrity/generation checks, acquire lock, run recovery/migration, then start writers. Newer-store policy remains the metadata-only block above.

A writer degraded by I/O to viewer retains its owned lock until recovery/exit. A process that cannot establish a safe read snapshot is `blocked`, not an empty viewer.

SourceRef: `L014-C1` through `L014-C4`, `PD-L-04`, `Case-L:L-014`

#### Root continuity, relocation, and unsafe fallback

Probe before directory creation. Binding/candidate outcomes are deterministic:

- no binding plus absent/empty candidate: genuine first run after lock;
- matching instance: ordinary continuity;
- binding plus absent/empty candidate, different instance, missing prior volume, or corrupt identity: block/recovery, never initialize;
- populated markerless candidate: `legacy_unbound` viewer/recovery, never first run.

Mismatch offers use previous, choose, copy-and-switch, or strongly confirmed new instance. Relocation is copy-validate-switch: lock source/destination deterministically, freeze verified source boundary, stage destination, verify identity/checksums/versions/replay, promote, update bootstrap binding last, reopen/verify, and retain source as recovery copy. Crash selects the last verified binding or blocks; cross-volume rename atomicity is never assumed.

Unsafe fallback uses exactly `<bootstrap_root>/storage-fallbacks/<logical_root_fingerprint>/` after safety probe. Every canonical store and aggregate lock moves together. It is a detached branch with stable instance, unique branch ID, and exact `fallback_base`; cross-host exclusion is not claimed. Return is explicit fast-forward-only when logical root still equals base. Changed base closes local writes as `fallback_diverged`; automatic merge/overwrite is forbidden and both stores remain recoverable. Preserving logical, forking fallback as a new instance, or exporting both are explicit dispositions.

SourceRef: `L018-C1` through `L018-C3`, `L011-C1` through `L011-C3`, `Case-L:L-011`, `Case-L:L-018`

#### Approved fallback-divergence disposition owner contract

`PD-PROBE-L011-01 A/A/A/A/A` fixes three distinct owner actions. Their exact IDs are `cmd.storage.fallback.keep_logical_root`, `cmd.storage.fallback.fork_new_instance`, and `cmd.storage.fallback.export_both`. They are independently visible and independently permission-admitted; no generic `resolve_divergence` command, disposition enum dispatch, automatic merge, overwrite, authority inference, or cleanup shortcut is equivalent.

The divergence lifecycle is closed to `awaiting_disposition | applying_keep_logical_root | applying_fork_new_instance | applying_export_both | logical_root_selected | fork_candidate_ready | export_custody_complete | recovery_required`. `fallback_diverged` keeps local write admission closed. `logical_root_selected` is the only one of these commands that changes active bootstrap selection. `fork_candidate_ready` returns an inactive candidate and leaves the active bootstrap binding byte-for-byte unchanged. `export_custody_complete` is custody evidence only and leaves divergence/authority selection unchanged. Refusal or recoverable failure returns to `awaiting_disposition` or `recovery_required`, keeps writes closed, and preserves both roots.

Every command uses the common typed input envelope in `Plans/Contracts_V0.md#storage-fallback-divergence-command-envelopes`. It requires `command_id`, `idempotency_key`, `actor_ref`, command-specific confirmation, and all eight explicit compare-and-swap fields: `expected_storage_instance_id`, `expected_logical_root_fingerprint`, `expected_root_generation`, `expected_fallback_branch_id`, `expected_fallback_base_ref`, `expected_logical_head_sha256`, `expected_fallback_head_sha256`, and `expected_bootstrap_binding_sha256`. Every SHA-256 value is lowercase 64-hex. The handler re-reads and revalidates every component under the aggregate fallback lock, the logical-root lock when safely acquirable, and the maintenance lease; a compound digest or a consumer's cached availability state cannot replace any component.

Authority order is normative:

1. Validate the closed command variant and required fields; reject wrong-variant or unexpected fields.
2. Evaluate current authorization for that exact command ID and its command-specific confirmation. Visibility, a stale permission snapshot, or access to one sibling command grants no authority.
3. Resolve `(command_id, idempotency_key)`. The same canonical request digest returns the original result and owner receipt; a different digest is `idempotency_conflict` and mutates nothing.
4. Acquire the owner maintenance/lock boundary, prove `fallback_diverged`, and compare all eight current values with the supplied CAS values. Any mismatch is `state_changed`, releases newly acquired locks, and mutates neither root, binding, destination, nor receipt authority.
5. Persist crash-reconciliation intent before any mutation, execute only the selected operation, verify its postcondition, and finalize exactly one owner receipt. Startup converges to the pre-operation state with no success receipt or the verified post-operation state with the same receipt; it never guesses from mtime or partial output.

Operation semantics are exact:

- `cmd.storage.fallback.keep_logical_root` verifies the current logical root, records that fallback changes were not imported, selects the logical root by a binding-last crash-convergent transition, and retains the fallback at its verified head as a recovery copy. It never copies fallback bytes into, merges with, overwrites, or cleans the logical root.
- `cmd.storage.fallback.fork_new_instance` mints a new `storage_instance_id`, validates the fallback bytes and parent lineage, and returns `candidate_binding_ref` plus `candidate_bootstrap_binding_sha256` with `candidate_binding_state = inactive`. It does not update active bootstrap selection, logical-root bytes, or the active binding hash. A later explicit activation is a separate owner operation outside this command.
- `cmd.storage.fallback.export_both` additionally requires explicit `destination_ref` and non-secret `encryption_key_ref`. It captures the exact bytes of both verified source roots, writes an encrypted recovery-custody package, and verifies the package can reproduce every manifest length and SHA-256 before success. Its non-secret manifest records the package/root refs, byte lengths/hashes, encryption algorithm/version, and key ref but no key material, credential, token, or raw local path. Both source roots remain retained after success or failure; there is no automatic cleanup, deletion, import, binding change, or authority switch.

The typed result is `applied | replayed | refused | failed_recoverable`. `applied`/`replayed` require `reason_code=null` and the same durable `owner_receipt_ref`; refusal is limited to `invalid_request | permission_denied | confirmation_required | state_changed | idempotency_conflict | operation_in_progress | invalid_destination`, while recoverable failure is limited to `integrity_failure | storage_io_exhausted | encryption_unavailable | custody_verification_failed`. No failure makes either root disposable or reopens write admission.

`StorageFallbackResolutionReceipt` is the sole durable audit record for these commands. It carries `receipt_id`, `command_id`, `idempotency_key`, canonical request SHA-256, disposition, outcome/reason, actor ref, all eight observed CAS fields, before/after active binding SHA-256, before/after logical/fallback head SHA-256, retained logical/fallback refs, optional new instance/candidate binding fields, optional export package/manifest/key refs, `binding_changed`, `cleanup_performed=false`, and completion time. It contains no secrets or raw paths. These actions emit no `EventRecord`; in particular they do not register or produce `storage.fallback_reconciled` or any substitute event family.

Acceptance oracles:

- Altering any one CAS component returns `state_changed`, creates no successful receipt, and leaves both roots, active binding, and export destination unchanged.
- Keep-logical success changes only the governed selection/diagnostic metadata, leaves both captured heads recoverable, and imports zero fallback bytes.
- Fork success has a new instance with verified parent lineage, an inactive candidate binding, unchanged logical root and active bootstrap binding, and no automatic activation on restart.
- Export success decrypts/verifies to the exact captured bytes for both roots, exposes only non-secret manifest/key refs, changes neither source head nor binding, and performs no cleanup.
- Same-key/same-request retry returns the byte-equivalent result and same receipt; same-key/different-request is a no-mutation conflict. Crash cuts at every intent/copy/manifest/binding/receipt boundary converge to one verified outcome without duplicate receipt or action.
- Event-family inventory remains unchanged; the only durable audit artifact is the owner receipt.

ContractRef: ContractName:Plans/Contracts_V0.md#storage-fallback-divergence-command-envelopes, ContractName:Plans/storage-plan.md#root-continuity-relocation-and-unsafe-fallback, ContractName:Plans/Decision_Log.md#DL-033

### Case L-5. EventRecord persistence, legacy normalization, and dedupe

Contracts owns the EventRecord `2.0.0` envelope. Storage enforces:

- `scope_kind = application | project`; application requires `project_id = null`, project requires a non-empty project ID; no sentinel/fake project;
- `scope_partition = app` or `project~{base64url_no_pad(UTF8(project_id))}`;
- each persisted event family has closed `scope_policy = application_only | project_only | application_or_project | inherits_referenced_event`; unknown mapping quarantines;
- v1 EventRecord remains project-scope compatibility input and is not rewritten merely to add scope;
- new writers emit only `2.0.0`; older writers do not mutate it.

Read-only inspection of an EventRecord `2.0.0` root requires a reader that validates `2.0.0`; a reader lacking that support refuses open rather than projecting a partial or best-effort view. Canonical lookup keys are `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`, where application scope uses `app`, project scope uses `project~{base64url_no_pad(UTF8(project_id))}`, and `sequence_id_20` is zero-padded unsigned decimal. Key/value scope mismatch is corruption.

Legacy `EventEnvelopeV1` normalization uses the exact `{ts, seq, type, payload}` envelope plus admitted extensions, verified physical cursor/header, and registered family identity JSON pointers only. It MUST NOT use current time, random ID, mtime, absolute path, process, UI selection, or mutable session/account state. Conflicting identity candidates quarantine rather than choosing one. Define `canonical_ts` as UTC RFC 3339 with exactly nine fractional digits and trailing `Z`; RFC 8785-canonicalize `{ts: canonical_ts, seq, type, payload, extensions: recognized_extensions_sorted_by_name}` and take its lowercase SHA-256 as `legacy_digest`.

Every synthesized/copied field has this closed formula:

| EventRecord 2.0 field | Legacy normalization formula |
|---|---|
| `schema_id`, `schema_version` | constants `pm.event.v0`, `2.0.0` in the transient normalized view |
| `scope_kind`, `project_id` | apply registered `scope_policy`; project uses the conflict-checked registered candidate, application uses null, and missing/unknown required scope quarantines |
| `event_id`, `idempotency_key` | `legacy-event-v1:{legacy_digest}`; `legacy-envelope-v1:{legacy_digest}` |
| `event_type` | exact legacy `type` after registered compatibility-alias normalization; unregistered alias quarantines |
| `thread_id`, `run_id`, `node_id`, `attempt_id` | conflict-checked registered candidate or null |
| `actor_ref` | registered non-secret actor ref or reserved `pm.actor_ref/legacy-unknown` |
| `requested_account_ref`, `effective_account_ref` | registered non-secret ref or null |
| `occurred_at_utc` | `canonical_ts`; invalid/ambiguous legacy timestamp quarantines |
| `observed_at_utc` | verified header `observed_timestamp_ns` rendered identically, otherwise `occurred_at_utc` |
| `persisted_at_utc` | `observed_at_utc`; legacy read time is forbidden |
| `sequence_id` | verified header sequence when present and equal to legacy `seq`, otherwise legacy `seq`; disagreement quarantines |
| `producer_sequence_id` | null |
| `correlation_id` | registered correlation ref or `event_id` |
| `causation_event_id`, `parent_event_id` | registered candidate or null; never infer adjacency |
| `payload_schema_id` | registered compatibility payload schema for normalized `event_type`; missing registration quarantines |
| `payload`, `payload_ref` | payload unchanged after schema/no-secret validation; registered legacy ref or null |
| `redaction_profile` | `no_secrets`, or `redacted` only through a registered versioned transform; otherwise quarantine |
| `replay_policy` | constant `projector_replay_only` |
| `migration.*` | source ID `pm.event.envelope_v1`, null source version, migration ID `event-envelope-v1-to-event-record-v2@1`, and exact original `type` as compatibility event type |

Canonical MessagePack recursively orders maps by UTF-8 key bytes and uses shortest valid encodings with no NaN/infinity. Re-normalization of the same envelope, verified header/cursor, and registry revision yields identical canonical JSON/MessagePack/index/projection effect. Identity conflicts, invalid time, missing scope/payload schema, and unhandled secrets quarantine without checkpoint advance.

`projector_replay_only` is constructed only by compatibility replay from existing bytes; normal append rejects `replay_only_not_appendable`. It may atomically update owned rebuildable projections/checkpoints/index/mirrors only. It MUST NOT append seglog, mutate canonical values, dispatch work/commands/tools/providers/network, notify, charge usage, publish outbox, mutate safe points, or create another canonical event.

Global `event_id` and scoped `(scope_partition, event_type, idempotency_key)` identities are enforced for app-root lifetime. Same identity+semantic digest returns the original result; different digest is `idempotency_conflict`. Dedicated dedupe indexes are rebuildable accelerators with a verified tail checkpoint. Stale/absent/corrupt indexes synchronously catch up under writer lock or append fails `dedupe_unavailable`; no buffer/defer.

SourceRef: `EVT-01` through `EVT-07`, `Case-L:L-008`, `Case-L:L-009`, `Case-L:L-023`

### Case L-6. Safe-point, restore transaction, restore point, and required-MVP persistence

Storage owns persistence only; FileSafe/Worktree/Assistant Chat retain behavior ownership.

Canonical safe-point key is:

`sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}`

`safe_point.sp:{...}` is read-only copy-forward migration alias. `safe_point:<safe_point_id>` is lookup-only and resolves through a unique canonical identity; ambiguity is integrity failure. New writes use only `sp:`.

The machine registry must split/materialize distinct families for `safe_point_record`, `safe_point_restore_transaction`, and `restore_point_record`; critical safe-point/restore-transaction rows are launch-critical and may not remain in a deferred bundled permission row. Permission snapshot remains separately owner-routed. Restore-point persistence key is `rp:{project_id}:{restore_point_id}`; an optional safe-point ref is lineage only and cannot silently restore files.

Storage persists FileSafe transaction phases exactly:

`prepared | applying | verifying_target | committed | rolling_back | verifying_rollback | rolled_back | recovery_required`

Only verified `committed` and `rolled_back` resolve automatically. `recovery_required` retains mutation fence, transaction, safe-point, worktree, and blocked holds. Contracts owns outcomes/reason enums; storage MUST NOT record `restored_clean` without exact target digest or `restore_failed` without exact pre-restore rollback digest.

Snapshot manifests/blobs live content-addressed under the resolved storage root outside the worktree; events/values contain refs/hashes, never file bodies. Remote projects keep custody on the authorized remote with no silent local fallback. Safe-point hold refs include attempt, blocked episode, nonterminal restore transaction, preserved run, and legal hold.

Required-MVP storage family routing also includes these distinct materialized families and keys:

- per-file `editor_buffer_recovery_state` at `editor_state.v1:{project_id}:{file_path_hash}`;
- sibling project-wide `editor_workspace_state` at `editor_workspace_state.v1:{project_id}`; Final GUI's `editor_state:v1:{project_id}` is its read-only migration alias and MUST NOT route to the per-file family or contain unsaved buffer bytes;
- `hotreload_state` at `hotreload_state.v1:{project_id}`, with `hotreload_state:v1:{project_id}` read-only during migration;
- `onboarding_state` at `onboarding_state.v1:{project_id}`, with global `onboarding:v1` read-only and copy-forward permitted only when the project target is unambiguous.

Storage prose is routing inventory until the machine registry owner materializes the rows; this section does not hand-author their closed value schemas. Required-family aliases are coordinator-owned copy-forward inputs, not lazy ordinary-writer rewrite-on-save rules.

SourceRef: `PD-RSP-01` through `PD-RSP-09`, `Case-L:L-006`, `Case-L:L-017`, `Case-L:L-020`, `Case-L:L-021`, `Case-L:L-022`, `Case-L:L-024`

### Case L-7. Required acceptance oracles

Owner acceptance is fixture/oracle based; prose or green governance alone is not runtime proof.

| Findings | Required oracle families |
|---|---|
| `L-001`, `L-002`, `L-003`, `L-016`, `L-025`, `L-031`, `L-032` | `FX-L001-*`, `FX-L002-*`, `FX-L003-*`, `FX-L016-*`, `FX-L025-*`, `FX-L032-*` from migration/backup planning; before/after target hash proves no mutation on refused open/preflight; command inventory proves diagnostics/retry do not expose generic repair/salvage mutation |
| `L-004`, `L-007`, `L-013`, `L-019`, `L-026`, `L-028`, `L-029`, `L-030` | `SEG-FX-001..018` and `SEG-OR-001..012`; bit flips, barrier faults, sequence leases, rotation/truncation/compaction cuts, survivor determinism, closed immutability, directory durability, truthful disclosure |
| `L-005`, `L-010`, `L-015`, `L-033` | `RET-*`, `ANCHOR-*`, `CMP-*`, `DEL-*`, `Q-*`; exact expiry/count/hold behavior, atomic anchor publication, generation recovery, deletion SLO, secured-before-reset and cap failure |
| `L-011`, `L-012`, `L-014`, `L-018` | closed-class I/O injection, two-process Unix/Windows races, complete viewer command inventory/direct-handler bypass, empty-known-root/relocation crash cuts, two-host fallback divergence |
| `L-008`, `L-009`, `L-023` | app/project scope schema/index round trips, two-implementation legacy golden bytes, dedupe catch-up/crash, replay-only side-effect spies at zero |
| `L-006`, `L-020`, `L-021`, `L-022`, `L-024` | `RSP-ATOMIC-*`, `RSP-EQUAL-*`, `RSP-INTEGRITY-*`, `RSP-RETENTION-*`, `RSP-KEY-*`, `RSP-REGISTRY-*`, `RSP-BASELINE-*`, `RSP-RP-*`, `RSP-CMD-*`, `RSP-CHAT-*` |

Mandatory global outcomes:

- no ordinary-open half-migrated/mixed restore state;
- no acknowledged append without segment+manifest+directory barriers;
- no mutation without a surviving synced safe-point/checkpoint/approval prerequisite;
- no sequence reuse; every gap has a closed reason;
- repeated recovery over identical bytes yields the same survivor set, IDs, manifest, and projection aftermath;
- no closed source-segment byte changes;
- no cleanup deletes held/anchored/referenced authority;
- no viewer or direct-handler path mutates durable/runtime/external state;
- no newer/incompatible/corrupt root is silently initialized or best-effort opened;
- no restore success/failure outcome is stronger than verified final equality;
- no registry/gate pass is reported as executed runtime durability proof.

ContractRef: ContractName:Plans/Automated_Testing_System.md, ContractName:Plans/Release_Supply_Chain.md, PolicyRule:Decision_Policy.md§2

### SP-235 - Case L Migration Backup And Canonical Redb Recovery

```yaml
plan_unit_id: SP-235
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Storage admits stores only after version-ceiling and continuity checks; runs migration through a crash-decidable external journal, verified shared-boundary backup, exact arithmetic preflight, journal-derived bounded progress, last stamp, post-stamp verification, and the one durable registry receipt; keeps canonical non-rebuildable redb state recoverable through mandatory verified snapshots; and permits downgrade only through offline compatible whole-boundary restore with explicit data-loss disclosure.
gui_related: true
gui_classification_reason: Compatibility, migration, backup failure, corruption, and restore produce blocking startup/recovery states and exact user actions.
split_recommended: false
depends_on: [SP-048, SP-053, SP-133, SP-180, SP-182, SP-187, SP-191, SP-231]
unblocks: []
acceptance_criteria:
  - One-version-ahead redb, seglog, and EventRecord fixtures leave target hashes unchanged and enter blocked_newer_store.
  - Every migration crash cut converges to verified committed or verified rollback with exactly one receipt and no ordinary-open mixed state.
  - Fresh install has a verified baseline before mutation; corrupt meta never becomes first run.
  - Active-write backup and kill-mid-restore fixtures restore one verified shared boundary or retain the verified original.
  - Alias and disk-preflight fixtures are idempotent and mutate nothing on unsupported-old/insufficient-space outcomes.
  - The recovery sidecar enforces the exact required-free formula, ready/blocked reason and free-byte pairings, all twelve phases, paired byte counts, bounded step counts, preflight-only cancellation, and terminal receipt relationships.
  - Startup command inventory exposes only approved diagnostics/recovery actions and no generic user/support live repair, salvage, Doctor mutation, or bypass path.
validation_surfaces:
  - future Case L migration backup fixture suite
  - python3 scripts/pm-plan-index.py validate
risk_class: migration_backup_canonical_redb_recovery
reasoning_tier: high
context_scope: case_l_durable_state
implementation_surfaces: [Plans/storage-plan.md, Plans/storage_recovery_contracts.schema.json, Plans/storage_value_registry.json, Plans/Contracts_V0.md, Plans/Release_Supply_Chain.md]
node_compile_hint:
  mode: migration_backup_recovery_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage: [Case-L:L-001, Case-L:L-002, Case-L:L-003, Case-L:L-016, Case-L:L-025, Case-L:L-031, Case-L:L-032, Case-L:PD-L-01..PD-L-06]
preserved_exact_tokens: [blocked_newer_store, StorageMigrationCoordinator, backup-before-any-migration-step, migration_preflight_result, migration_progress_snapshot, blocked_insufficient_space, data_loss_risk]
negative_constraints:
  - Do not in-place downgrade, try anyway, ordinary-open a mixed store, or describe canonical redb state as rebuildable.
  - Do not claim runtime backup or migration execution from plan validation.
owner_hints: [Plans/storage-plan.md]
```

### SP-236 - Case L SeglogFrameV2 Durability And Recovery

```yaml
plan_unit_id: SP-236
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  SeglogFrameV2 independently protects framing, header metadata, and payload; resynchronizes only through fully validated candidates; acknowledges only after segment and manifest barriers plus directory durability; never reuses sequence IDs; and converges rotation, truncation, recovery, janitor, and compaction through deterministic intents while disclosing every canonical-history gap and rebuilding projections from the survivor set.
gui_related: true
gui_classification_reason: Integrity loss and recovery create persistent blocked/read-only disclosure and recovery-report actions.
split_recommended: false
depends_on: [SP-025, SP-026, SP-027, SP-028, SP-131, SP-139, SP-179, SP-180, SP-200, SP-230]
unblocks: []
acceptance_criteria:
  - Payload/framing bit flips in active and closed segments yield the exact documented loss unit and identical survivors on rerun.
  - No append reports success before both durable barriers and required parent-directory synchronization.
  - Safe-point/checkpoint/approval barrier fault injection proves no downstream mutation without a surviving synced receipt.
  - Rotation, truncation, janitor, and compaction crash cuts converge with one semantic recovery episode and unchanged closed-source hashes.
  - Checkpoints never use timestamps and rebuilt projections with a hole remain health degraded with exact provenance.
validation_surfaces:
  - future Case L seglog durability recovery fixture suite
  - python3 scripts/pm-plan-index.py validate
risk_class: seglog_durability_recovery_drift
reasoning_tier: high
context_scope: case_l_seglog_recovery
implementation_surfaces: [Plans/storage-plan.md, Plans/Contracts_V0.md, Plans/Runtime_Artifacts_Panel.md]
node_compile_hint:
  mode: seglog_frame_v2_recovery_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage: [Case-L:L-004, Case-L:L-007, Case-L:L-013, Case-L:L-019, Case-L:L-026, Case-L:L-028, Case-L:L-029, Case-L:L-030, Case-L:SEG-D-001..SEG-D-029]
preserved_exact_tokens: [SeglogFrameV2, PMSEGR2, prefix_crc32, commit watermark, survivor_prefix_sha256]
negative_constraints:
  - Do not claim one-record loss without a validated next boundary or modify closed segments in place.
  - Do not acknowledge on write or buffer flush alone.
owner_hints: [Plans/storage-plan.md]
```

### SP-237 - Case L Retention Compaction Deletion And Quarantine

```yaml
plan_unit_id: SP-237
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Structured storage-owned retention policies define exact windows, cardinalities, holds, janitor budgets, and fail-safe unknown-policy behavior; safe-point recovery anchors survive unresolved blocks; compaction publishes a verified immutable successor generation through CURRENT; thread/project deletion has explicit logical and physical outcomes; and invalid values are durably quarantined before any governed reset, rebuild, migration, or replacement.
gui_related: true
gui_classification_reason: Retention settings, legal holds, deletion status, and quarantine recovery require user-visible protected surfaces.
split_recommended: false
depends_on: [SP-028, SP-135, SP-137, SP-138, SP-139, SP-180, SP-182, SP-200, SP-231]
unblocks: []
acceptance_criteria:
  - Expiry/cardinality fixtures choose the same eligible set and never select held/anchored/referenced authority.
  - An unresolved restore-required block older than 90 days retains its safe point, blobs, worktree refs, and recovery receipts.
  - Compaction crash cuts yield exactly one CURRENT-selected generation, complete target indexes/checkpoints, and unchanged semantic identities.
  - Thread/project deletion fixtures meet logical-hide and physical-purge rules without affecting unrelated app/project records.
  - Invalid critical values never reset or cap-evict before exact-byte custody; resettable/derived fixtures follow their closed outcomes.
  - Storage and Retention settings accept longer windows, reject values below owner minima, expose holds read-only, and route hold mutation through the protected command.
validation_surfaces:
  - future Case L retention compaction quarantine fixture suite
  - python3 scripts/pm-plan-index.py validate
risk_class: retention_compaction_recovery_loss
reasoning_tier: high
context_scope: case_l_retention_compaction
implementation_surfaces: [Plans/storage-plan.md, Plans/storage_value_registry.json, Plans/FileSafe.md]
node_compile_hint:
  mode: retention_compaction_quarantine_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage: [Case-L:L-005, Case-L:L-010, Case-L:L-015, Case-L:L-033, Case-L:PD-L005-01..PD-L033-03]
preserved_exact_tokens: [retention_policy_ref, storage.legal_hold.manage, CURRENT, recovery_unavailable, Q-CRITICAL]
negative_constraints:
  - Do not infer destructive retention from prefix, path, filename, or mtime.
  - Do not call validators or registry presence runtime retention/compaction proof.
owner_hints: [Plans/storage-plan.md]
```

### SP-238 - Case L Storage IO Admission And Recovery

```yaml
plan_unit_id: SP-238
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Canonical storage I/O uses a closed storage_io_class taxonomy, exact bounded retry budgets, write-site-specific ENOSPC/EDQUOT aftermath, fail-closed canonical-write admission, validated viewer-or-blocked degradation with owned-lock retention, and explicit recovery without memory pseudo-durability or automatic blocked-agent resume.
gui_related: true
gui_classification_reason: Storage exhaustion produces a visible read-only/blocked state and explicit recovery actions.
split_recommended: false
depends_on: [SP-131, SP-180, SP-181, SP-187]
unblocks: []
acceptance_criteria:
  - Every named write site maps injected OS errors to one class, exact retry count, and exact final access mode.
  - ENOSPC at seglog, redb, checkpoint, safe point, rotation, migration, and projection sites yields no partial success or unsafe follow-on mutation.
  - Exhausted canonical I/O retains an already-held lock and admits no new mutation-capable attempt.
  - Recovery revalidates identity, integrity, version, lock, and checkpoints before writer mode; blocked attempts remain blocked.
validation_surfaces: [future Case L storage I/O fault fixture suite]
risk_class: storage_io_aftermath_drift
reasoning_tier: high
context_scope: canonical_storage_io
implementation_surfaces: [Plans/storage-plan.md, Plans/Executor_Protocol.md, Plans/FinalGUISpec.md]
node_compile_hint:
  mode: storage_io_taxonomy_and_degradation
  create_worknodes: false
  create_nodeseeds: false
source_lineage: [Case-L:L-012, Case-L:L012-C1..L012-C4]
preserved_exact_tokens: [storage_io_class, ENOSPC, EDQUOT, 250 ms, storage_io_exhausted]
negative_constraints:
  - Canonical writes are not buffered and later represented as durable.
  - Consumers cannot broaden nonretryable classes.
owner_hints: [Plans/storage-plan.md]
```

### SP-239 - Case L Aggregate Lock And Viewer Envelope

```yaml
plan_unit_id: SP-239
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  The aggregate canonical-store pm.lock uses handle-lifetime OS authority with diagnostic heartbeat, OS-lock-first stale takeover, Unix flock and Windows LockFileEx parity, a complete frozen/manual-refresh viewer envelope, direct-handler storage gating, and explicit full-revalidation promotion.
gui_related: true
gui_classification_reason: Lock conflict and promotion govern visible viewer state, disabled actions, refresh, and recovery copy.
split_recommended: false
depends_on: [SP-129, SP-134, SP-180, SP-187, SP-238]
unblocks: []
acceptance_criteria:
  - Two racing processes on each supported adapter produce exactly one writer.
  - Stale diagnostics never authorize takeover while the OS lock is held.
  - Viewer starts no writer-capable subsystem and every mutating command/direct handler reports storage_read_only.
  - Promotion closes viewers and reruns every startup gate before enabling writer services.
validation_surfaces: [future Case L storage lock viewer fixture suite]
risk_class: storage_lock_split_brain
reasoning_tier: high
context_scope: aggregate_storage_lock_and_viewer
implementation_surfaces: [Plans/storage-plan.md, Plans/FinalGUISpec.md, Plans/UI_Command_Catalog.md]
node_compile_hint:
  mode: aggregate_storage_lock_and_viewer_envelope
  create_worknodes: false
  create_nodeseeds: false
source_lineage: [Case-L:L-014, Case-L:L014-C1..L014-C4]
preserved_exact_tokens: [pm.lock, flock, LockFileEx, storage_read_only, Try write mode]
negative_constraints:
  - Diagnostic metadata is not lock authority.
  - Viewer promotion is never automatic and never authorizes newer-store access.
owner_hints: [Plans/storage-plan.md]
```

### SP-240 - Case L Root Continuity Relocation And Fallback Branch

```yaml
plan_unit_id: SP-240
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Startup proves storage continuity with an out-of-root bootstrap binding and stable in-root identity before creation; mismatches fail closed; relocation is copy-validate-switch with binding update last and source retention; and unsafe fallback is one deterministic detached exact-base branch whose divergence exposes only three independently admitted explicit-CAS owner commands for logical-root selection, inactive-candidate fork, or exact-byte encrypted dual-root custody, with no automatic merge, overwrite, activation, cleanup, or EventRecord.
gui_related: true
gui_classification_reason: Root mismatch, relocation, fallback, and divergence require startup recovery and persistent attention surfaces.
split_recommended: false
depends_on: [SP-015, SP-129, SP-132, SP-133, SP-187, SP-191, SP-239]
unblocks: []
acceptance_criteria:
  - Known prior state plus an empty selected root never initializes silently.
  - Relocation crash cuts select the verified source/destination or block and preserve the source.
  - All fallback stores/locks move together and carry unique branch plus exact base identity.
  - Two-host changed-base reconciliation closes writes and preserves both stores without automatic merge/overwrite.
  - All eight explicit CAS components are revalidated owner-side; any changed component mutates no root, binding, destination, or successful receipt.
  - Fork returns an inactive candidate and leaves active bootstrap selection unchanged; export decrypts/verifies exact source bytes and cleans up neither source.
  - Idempotent retry returns the same owner receipt, and no fallback-divergence disposition emits or registers an EventRecord.
validation_surfaces: [future Case L root continuity fallback fixture suite]
risk_class: storage_root_orphan_and_fallback_divergence
reasoning_tier: high
context_scope: root_continuity_and_fallback
implementation_surfaces: [Plans/storage-plan.md, Plans/Contracts_V0.md, Plans/FinalGUISpec.md, Plans/Commands_System.md]
node_compile_hint:
  mode: storage_root_continuity_and_fallback_branch
  create_worknodes: false
  create_nodeseeds: false
source_lineage: [Case-L:L-011, Case-L:L-018, Case-L:L011-C1..L018-C3, Case-L:PD-PROBE-L011-01-A/A/A/A/A]
preserved_exact_tokens: [storage_instance_id, root_generation, fallback_branch_id, fallback_base, fallback_diverged, cmd.storage.fallback.keep_logical_root, cmd.storage.fallback.fork_new_instance, cmd.storage.fallback.export_both]
negative_constraints:
  - Root precedence cannot replace continuity proof.
  - Fallback never claims cross-host exclusion or automatic merge.
  - Fork cannot switch active bootstrap selection, export cannot clean either source, and owner audit cannot mint a new EventRecord family.
owner_hints: [Plans/storage-plan.md]
```

### SP-241 - Case L EventRecord Scope Legacy And Dedupe Persistence

```yaml
plan_unit_id: SP-241
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Storage persists EventRecord 2.0 with explicit application/project scope partitions, globally unique event IDs, scoped store-lifetime idempotency, fail-closed dedupe-index catch-up, deterministic in-memory-only EventEnvelopeV1 normalization, and a projector_replay_only envelope that can mutate only owned rebuildable projections atomically.
gui_related: false
gui_classification_reason: This unit defines event persistence, replay, normalization, and dedupe rather than presentation.
split_recommended: false
depends_on: [SP-230, SP-231, CV-309]
unblocks: []
acceptance_criteria:
  - App/project scope fixtures validate/index without fake project identities and reject every invalid cross-field pair.
  - Two independent normalizers emit byte-identical legacy EventRecord/index/projection results and never change source bytes/tail.
  - Every synthesized legacy field matches the closed formula table; conflicting identity, scope, payload-schema, time, or secret inputs quarantine without checkpoint advance.
  - Dedupe catch-up/crash fixtures keep one canonical append and return the original result; unavailable catch-up appends nothing.
  - Replay-only side-effect spies remain zero and projector/checkpoint writes commit atomically once.
validation_surfaces:
  - future Case L EventRecord fixture suite
  - python3 scripts/pm-plan-index.py validate
risk_class: eventrecord_scope_legacy_dedupe_drift
reasoning_tier: high
context_scope: eventrecord_persistence_v2
implementation_surfaces: [Plans/storage-plan.md, Plans/Contracts_V0.md, Plans/event_record.schema.json, Plans/storage_value_registry.json]
node_compile_hint:
  mode: eventrecord_v2_persistence_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage: [Case-L:L-008, Case-L:L-009, Case-L:L-023, Case-L:EVT-01..EVT-07]
preserved_exact_tokens: [scope_kind, scope_partition, projector_replay_only, dedupe_unavailable, legacy-event-v1]
negative_constraints:
  - Do not invent a fake project, rewrite legacy bytes on ordinary open, or admit replay-only through normal append.
  - Do not use timestamps for ordering or dedupe.
owner_hints: [Plans/storage-plan.md, Plans/Contracts_V0.md]
```

### SP-242 - Case L Safe Point Restore Transaction And Restore Point Storage

```yaml
plan_unit_id: SP-242
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  Storage owns the canonical sp key, read-only legacy aliases, content-addressed snapshot custody, launch-critical safe-point and restore-transaction persistence, nonterminal transaction holds/restart phases, reference-based retention anchors, and the rp restore-point persistence namespace while FileSafe, Worktree, Contracts, and Assistant Chat retain mechanics, outcome, baseline, and product-lifecycle ownership.
gui_related: true
gui_classification_reason: Persisted restore/recovery state and restore-point availability drive visible recovery and branch actions.
split_recommended: false
depends_on: [SP-144, SP-170, SP-200, SP-207, SP-231, F2-189]
unblocks: []
acceptance_criteria:
  - New writes use only canonical sp identity; aliases resolve/copy-forward uniquely or fail closed.
  - Critical safe-point and restore-transaction families are materialized and no mutation path depends on a deferred bundled row.
  - Nonterminal restore restart ends at verified target/rollback or recovery_required with holds/fence intact.
  - Storage never records restored_clean or restore_failed without the Contracts/FileSafe-owned equality proof.
  - Restore-point records branch conversation state without silently restoring files and remain separate from runtime safe points.
validation_surfaces:
  - future Case L restore safe-point fixture suite
  - python3 scripts/pm-plan-index.py validate
risk_class: safe_point_restore_storage_drift
reasoning_tier: high
context_scope: safe_point_restore_persistence
implementation_surfaces: [Plans/storage-plan.md, Plans/storage_value_registry.json, Plans/FileSafe.md, Plans/assistant-chat-design.md]
node_compile_hint:
  mode: safe_point_restore_storage_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage: [Case-L:L-006, Case-L:L-010, Case-L:L-020, Case-L:L-021, Case-L:L-022, Case-L:L-024, Case-L:PD-RSP-01..PD-RSP-09]
preserved_exact_tokens:
  - "sp:{run_id}:{node_id}:{attempt_id}:{safe_point_id}"
  - recovery_required
  - "rp:{project_id}:{restore_point_id}"
negative_constraints:
  - Do not duplicate FileSafe restore mechanics, Worktree baseline effects, Contracts outcome enums, or Chat restore-point lifecycle in storage.
  - Do not treat safe points and restore points as one family.
owner_hints: [Plans/storage-plan.md, Plans/FileSafe.md]
```

### SP-243 - Case L Required MVP Storage Family Routing

```yaml
plan_unit_id: SP-243
unit_type: schema_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  The machine storage registry must materialize migration receipt, editor buffer recovery, editor workspace state, hotreload state, onboarding state, safe-point record, safe-point restore transaction, restore-point record, dedupe indexes/checkpoint, retention/anchor/maintenance/quarantine/deletion records, and truthful recovery/retention dispositions before any build path depends on them; storage prose remains routing inventory rather than a peer value schema.
gui_related: false
gui_classification_reason: This unit routes backend machine registry authority and does not define GUI presentation.
split_recommended: false
depends_on: [SP-231, SP-235, SP-237, SP-241, SP-242]
unblocks: []
acceptance_criteria:
  - Every required family has exactly one machine registry row, canonical key, closed materialized value schema, owner, producer/consumer, migration, recovery, retention, and redaction disposition.
  - Compatibility keys are read-only aliases and are never another row's canonical write key.
  - Every critical family exists, is materialized, and is launch-critical; no mixed-owner bundled row remains.
  - Registry v2 structured retention and recovery metadata validates without changing storage behavior authority.
validation_surfaces:
  - python3 scripts/pm-implementation-readiness.py validate
  - python3 scripts/pm-implementation-readiness.py self-test
risk_class: required_mvp_storage_registry_omission
reasoning_tier: high
context_scope: case_l_registry_owner_routing
implementation_surfaces: [Plans/storage-plan.md, Plans/storage_value_registry.schema.json, Plans/storage_value_registry.json]
node_compile_hint:
  mode: case_l_required_storage_family_routing
  create_worknodes: false
  create_nodeseeds: false
source_lineage: [Case-L:L-002, Case-L:L-003, Case-L:L-005, Case-L:L-008, Case-L:L-010, Case-L:L-015, Case-L:L-017, Case-L:L-021, Case-L:L-023, Case-L:L-033]
preserved_exact_tokens: [pm.storage_value_registry.v2, migration_receipt, safe_point_record, retention_policy_ref, recovery_disposition]
negative_constraints:
  - Do not hand-edit generated shards/evidence or claim runtime proof from registry validation.
  - Do not let prose-only templates become implementation authority.
owner_hints: [Plans/storage-plan.md, Plans/storage_value_registry.json]
```
