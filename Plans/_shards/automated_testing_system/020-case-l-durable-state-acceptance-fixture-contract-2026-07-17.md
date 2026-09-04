# Shard 020: Case L Durable-State Acceptance Fixture Contract - 2026-07-17

Source: `Plans/Automated_Testing_System.md`

Source lines: L2011-L2373

Source SHA256: `18f4feddbfd15e2f5063fe7d821aac7d37c050b7c597cc8532b94f4eb86ae557`

---

## Case L Durable-State Acceptance Fixture Contract - 2026-07-17

Status: `accepted` specification only. No fixture in this section is claimed executed merely because it is named, parsed, or linked.

This section is the Automated Testing System consumer for the approved Case L durable-state owner contracts. It owns fixture orchestration, fault-injection coverage, deterministic oracle evaluation, and linked `TestRunReceipt` evidence. It does not own storage algorithms, EventRecord envelopes, restore outcomes, FileSafe equality, SCM baseline effects, migration receipts, retention policy values, or release admission. Those remain with `Plans/storage-plan.md`, `Plans/Contracts_V0.md`, `Plans/event_record.schema.json`, `Plans/FileSafe.md`, `Plans/WorktreeGitImprovement.md`, `Plans/Executor_Protocol.md`, `Plans/storage_value_registry.json`, and `Plans/Release_Supply_Chain.md`.

Each Case L fixture manifest and linked receipt records the exact fixture ID, owner-contract refs/revisions, app/store/EventRecord/registry versions, setup and fault boundary, expected closed outcome, required negative assertions, before/after semantic and byte digests where applicable, observed outcome, evidence/log/artifact refs, adapter/platform, and freshness. An unavailable adapter or absent fixture is `blocked`, not pass. `skipped` or `inconclusive` cannot satisfy a required oracle. Re-running the same bytes/state must produce the same owner-defined result where determinism is required.

### Migration, compatibility, canonical-redb recovery, and store backup/restore

| Fixture | Required oracle |
| --- | --- |
| `FX-L001-REDB-AHEAD` | One-ahead redb enters `blocked_newer_store`; no writer/projector/migration starts; target bytes are identical before/after. |
| `FX-L001-SEGLOG-AHEAD` | One-ahead seglog header/generation has the same blocked/no-mutation result. |
| `FX-L001-EVENT-AHEAD` | A future EventRecord halts before the record with unavailable projection health and pinned last-supported sequence; no skip, quarantine, append, or rewrite. |
| `FX-L001-DOWNGRADE-WRITES` | Only a compatible whole-boundary backup is offered; post-backup writes produce exact `post_backup_writes_will_be_lost` disclosure before restore. |
| `FX-L002-CRASH-AFTER-BACKUP` | Restart reconciles the durable journal and never ordinary-opens mixed state. |
| `FX-L002-CRASH-MID-STEP` | Kill at every step boundary resumes/restores idempotently and produces exactly one terminal migration receipt. |
| `FX-L002-CRASH-BEFORE-STAMP` | Pre-stamp mixed versions exist only under the active journal and restore before ordinary open after interruption. |
| `FX-L002-CRASH-AFTER-STAMP` | Restart re-verifies then commits or restores without blindly replaying committed steps. |
| `FX-L002-VERIFY-CORRUPT` | Corrupt migrated output fails full verification, protects the pre-migration backup, and permits only one automatic restore attempt. |
| `FX-L002-RECEIPT-ROUNDTRIP` | Exactly one terminal `pm.storage_value.migration_receipt.v1` identity exists and reads back every RSC-008 field, including both `store_transitions[]` and `family_transitions[]`; `rollback_result` is present on every receipt and may be null, while `verification_result` and `terminal_status` match the expected terminal state. |
| `FX-L003-CORRUPT-META` | Continuity evidence plus missing meta is never first run and never reinitializes the store. |
| `FX-L003-CORRUPT-FAMILY` | Each canonical non-rebuildable family routes to verified backup and exact loss disclosure. For `executor_intake_report` and `attempt_receipt`, exact canonical records and a durable verified Storage recovery boundary are required before ordinary Executor revalidation may admit completion or dispatch; EventRecords, runtime/audit projections, UI state, summaries, and worker/controller claims cannot reconstruct success, and unavailable or corrupt authority remains blocked or unknown. |
| `FX-L003-FRESH-BASELINE` | Verified baseline exists before first mutation-capable startup; baseline failure blocks mutation. |
| `FX-L016-ACTIVE-WRITE` | Quiesced active-load backup restores one manifest boundary with exact hashes, consistent redb/seglog/checkpoints, and rebuilt disposable projections. |
| `FX-L016-NEWER-BACKUP` | Newer-version backup is refused before mutation and current bytes remain unchanged. |
| `FX-L016-KILL-RESTORE` | Kill at every store-promotion boundary; restart converges to the fully original or fully restored verified store set, never a mixed ordinary-open state. |
| `FX-L025-PREV-MAJOR-ALIAS` | N-1 alias copy-forwards once, proves semantic equality, removes the live residual only after verification, and is idempotent on rerun. |
| `FX-L025-TOO-OLD` | N-2 without an explicit edge blocks without best-effort mutation. |
| `FX-L032-NOSPACE` | One byte below required space records exact values/reason and performs no backup or mutation; before/after target hashes match. |
| `FX-L032-PROGRESS-INTERRUPT` | Journal phases/step counts are monotonic; cancellation closes after preflight; the exact interruption copy is `Keep Puppet Master open. If interrupted, recovery will resume on the next launch.`; force-cancel/try-anyway remain absent; restart displays/resumes the journal-derived recovery phase. |
| `MIGRATION-COMMAND-INVENTORY-001` | Startup exposes read-only metadata diagnostics, state-valid retry/update/compatible-backup/quit actions, and offline journaled restore only; generic live verify/repair/salvage, Doctor mutation, store editing, bypass tokens, or retry actions that mutate bytes are absent. |

### Seglog durability and restart convergence

The exact fixture inventory is `SEG-FX-001`, `SEG-FX-002`, `SEG-FX-003`, `SEG-FX-004`, `SEG-FX-005`, `SEG-FX-006`, `SEG-FX-007`, `SEG-FX-008`, `SEG-FX-009`, `SEG-FX-010`, `SEG-FX-011`, `SEG-FX-012`, `SEG-FX-013`, `SEG-FX-014`, `SEG-FX-015`, `SEG-FX-016`, `SEG-FX-017`, and `SEG-FX-018`. The exact global-oracle inventory is `SEG-OR-001`, `SEG-OR-002`, `SEG-OR-003`, `SEG-OR-004`, `SEG-OR-005`, `SEG-OR-006`, `SEG-OR-007`, `SEG-OR-008`, `SEG-OR-009`, `SEG-OR-010`, `SEG-OR-011`, and `SEG-OR-012`. They are required without renaming or weakening. The suite covers payload/framing/header bit flips; active and closed segments; valid/unprovable resynchronization; acknowledged watermark loss; frame/segment/manifest/directory barrier faults; mutation-gating safe-point/checkpoint/approval power cuts; sequence-lease crash boundaries; checkpoint/survivor reconciliation; rotation/truncation/compaction/janitor restart cuts; disclosure precision; and stale checklist/pointer rejection.

The global result must prove deterministic survivors and recovery IDs, no success before both append barriers plus directory durability, no mutation without a surviving synced prerequisite receipt, no sequence reuse, exactly one manifest-selected active generation after recovery, unchanged closed-source hashes, sequence/event rather than timestamp checkpoint truth, degraded projection health when canon has a hole, idempotent recovery events, exact/bounded/unknown disclosure fidelity, and live pointer/checklist fidelity.

### Storage I/O, aggregate lock/viewer, root continuity, and fallback

| Fixture | Required oracle |
| --- | --- |
| `STIO-001-CLOSED-CLASS` | Inject every closed storage-I/O class at seglog, redb, checkpoint, safe-point, rotation, migration/backup, JSONL, and Tantivy writes; observe the exact class, retry count, and final access mode. |
| `STIO-002-SAFEPOINT-ENOSPC` | ENOSPC during the pre-attempt safe point causes no project mutation, external side effect, or attempt dispatch. |
| `STIO-003-CHECKPOINT-ENOSPC` | ENOSPC after projection/before checkpoint keeps the old checkpoint; restart replays deterministically and no false freshness is acknowledged. |
| `STIO-004-APPEND-ENOSPC` | Failed seglog append is not acknowledged, later appends are rejected, existing verified records remain readable, and no memory-buffered event appears after recovery. |
| `STIO-005-RECOVERY-PROBE` | Explicit retry revalidates identity/version/integrity/lock/checkpoint before writer mode; outage/recovery times remain distinct and blocked attempts do not auto-resume. |
| `STIO-006-RECOVERY-FAIL` | Failed recovery probe retains viewer/blocked posture and the owned writer lock. |
| `LOCK-001-LIVE` | Live lock yields a non-writer frozen viewer with zero writer components. |
| `LOCK-002-STALE-DIAGNOSTIC` | Heartbeat older than 10 seconds never authorizes takeover while the OS lock is held. |
| `LOCK-003-STALE-OWNER-FREE-OS` | New process acquires the free OS lock first, replaces diagnostics atomically, and becomes the sole writer. |
| `LOCK-004-INDETERMINATE` | Invalid/missing owner diagnostics plus held OS lock produces `lock_indeterminate`, never forced takeover. |
| `LOCK-005-ADAPTER-RACE` | Unix `flock` and Windows `LockFileEx` two-process races produce exactly one writer and no loser writer handle. |
| `LOCK-006-VIEWER-INVENTORY` | Every command/direct handler is allowed or disabled; mutation bypass returns `storage_read_only`; no presentation-only gate exists. |
| `LOCK-007-REFRESH-PROMOTE` | Manual refresh remains coherent and write-free; promotion closes readers and reruns every startup gate; a newer store remains under L-001 refusal. |
| `ROOT-001-EMPTY-OVERRIDE` | Known populated root plus empty override creates no new store and identifies the prior instance. |
| `ROOT-002-REMOVED-OVERRIDE` | Bootstrap binding prevents silent default-root initialization when a populated override disappears. |
| `ROOT-003-IDENTITY-MISMATCH` | Another instance, markerless bytes, or corrupt/missing manifest routes to explicit block/recovery without mutating either candidate or reinitializing schema version. |
| `ROOT-004-RELOCATION-CRASH` | Kill at every relocation step opens the last verified binding or blocks; source stays recoverable and no empty product appears. |
| `ROOT-005-CROSS-VOLUME` | Destination validation precedes binding change and no cross-filesystem atomic-rename assumption is made. |
| `ROOT-006-MISSING-OR-AMBIGUOUS` | Missing bound volume or multiple lineage candidates blocks for explicit action; precedence alone never mutates a candidate. |
| `FALLBACK-001-DETERMINISTIC-ROOT` | All canonical stores and the aggregate lock move together under the deterministic fallback; unsafe bootstrap root refuses fallback. |
| `FALLBACK-002-TWO-HOST-DIVERGENCE` | A changed base closes the second host's writes and cannot auto-merge or overwrite either store. |
| `FALLBACK-003-RETURN-CRASH` | Unchanged-base return at every cut selects the last verified store or blocks with no lost fallback. |
| `FALLBACK-004-EXPLICIT-DISPOSITION` | Keep-logical and fork-local-as-new preserve unimported lineage exactly and never mutate the unselected store. |
| `FALLBACK-005-UNSTABLE-CAPTURE` | Corrupt/changing logical-root capture admits no fallback write and stays viewer/blocked. |

### EventRecord 2.0 scope, compatibility, legacy normalization, dedupe, and replay

| Fixture | Required oracle |
| --- | --- |
| `EVT2-SCOPE-001` | Application events require `scope_kind=application` and `project_id=null`; project events require `scope_kind=project` and non-empty project ID; both persist/index in the exact partition without a fake project. |
| `EVT2-SCOPE-NEG-001` | Application+project ID, project+null, missing/unknown scope, unregistered family policy, and a project sentinel are rejected/quarantined before append with no checkpoint advance. |
| `EVT2-LEGACY-GOLDEN-001` | Two runs, process restart, another locale/timezone, and two independent implementations use UTC RFC 3339 with nine fractional digits plus registered extensions/identity pointers and emit byte-identical RFC 8785 JSON, canonical MessagePack, IDs, timestamps, migration object, index row, and one projection effect from the same EventEnvelopeV1 input/context. |
| `EVT2-LEGACY-QUARANTINE-001` | Header/envelope or project conflicts, invalid time, unregistered alias, missing payload schema, and unhandled secrets quarantine with the exact reason and no checkpoint advance. |
| `EVT2-LEGACY-IMMUTABLE-001` | Legacy normalization changes neither source segment hash, append count, nor tail sequence; v2 index rebuild returns the same row/projection. |
| `EVT2-DEDUPE-001` | Global event-ID and scoped idempotency duplicates return the original only for the same semantic digest; different digest conflicts; lifetime remains longer than ordinary TTL. |
| `EVT2-DEDUPE-CRASH-001` | Crash after seglog append/before dedupe-index update catches up on restart; retry returns the original locator and canonical append count remains one; failed catch-up appends nothing. |
| `EVT2-REPLAY-ONLY-001` | Normal append rejects `projector_replay_only` without mutation; compatibility replay commits each owned rebuildable projection/checkpoint once and every tool/network/notification/scheduler/outbox/usage/command/append side-effect spy stays zero. |
| `EVT2-INDEX-001` | `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}` uses `app` or reversible project partition plus zero-padded unsigned sequence; key/value scope mismatch is corruption and rebuild returns exact rows. |
| `EVT2-VERSION-001` | V1 then V2 generations replay in stable sequence; a reader lacking V2 refuses even read-only inspection instead of a partial view; a 1.0 reader/writer performs no mutation on V2; a V2 writer never emits V1 or rewrites legacy/V1 on ordinary open. |

#### K37 retained-inline restore and seglog EventRecord oracles

Every oracle in this subsection is `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION`. It is planned/static acceptance prose, not executed evidence. For each of `restore_point.applied`, `restore_point.created`, `restore_point.deleted`, `restore_point.expired`, and `seglog.event_appended`, a positive must use the exact registered family/event pair, inline schema `$id`, structured retention ref, EventRecord `pm.event.v0@2.0.0`, and owner scope. Project rows require a non-empty envelope project ID byte-equal to the payload project ID. `seglog.event_appended` inherits the referenced event's application/project partition. The outer event discriminator and payload-schema ID must equal the selected row. Same identity/digest returns the original durable result with one append; a different digest is `idempotency_conflict`; unavailable dedupe proof is `dedupe_unavailable`; `projector_replay_only` produces no canonical or external side effect. Wrong discriminator/schema/version/scope, missing or extra fields, wrong type, empty required identity/ref/item, illegal const/enum, invalid RFC 3339 time, unknown alias/policy/owner, unhandled secret, or unprovable join rejects or quarantines. Every negative/refusal has zero append and zero checkpoint advance; it also has zero owner mutation, projection effect, dispatch, and destructive action.

`restore_point.applied` planned/static oracle set:

- **First branched:** the exact closed twelve-field payload has `schema_version=1.0.0`, persisted `result=branched`, non-empty identities/refs/target IDs, equal lowercase 64-hex expected/observed hashes, valid `applied_at_utc`, matching project envelope, and creates exactly one target thread/branch pair and one event.
- **Replay:** the same `application_id` and application intent returns the recorded `branched` result and exact target pair with zero new branch and zero new event.
- **Project and source joins:** envelope/payload project, outer event/schema, expected/observed hash, source thread/branch, and restore-point identity all agree; first execution and replay preserve source thread, conversation branch, worktree, files, Git/index, queue, runtime safe points, and restore-point lifecycle.
- **Persisted negatives:** reject `result=refused|failed|other`, missing result, missing/empty target ID, missing/empty source/application/restore/project identity, malformed or unequal hash, wrong version/time, extra property, envelope mismatch, changed replay target, duplicate append/branch, source mutation, or restore-point consumption/transition.
- **Refused command result:** exactly `refused`, no target IDs, event-count delta zero, no source or restore-point mutation; replay returns the same no-event result.
- **Failed command result:** exactly `failed`, no target IDs, event-count delta zero, no source or restore-point mutation; replay returns the same no-event result. Any event for refused/failed first execution or replay is a hard failure.

`restore_point.created` planned/static oracle set:

- `RSC-P01` — Exact required payload, const `1.0.0`, non-empty identities/refs/hash, RFC 3339 creation time, const `available`, project equality, and arrays of non-empty strings may emit exactly one event only after the immutable record is durable.
- `RSC-P02` — Absent `safe_point_id` and present non-empty `safe_point_id` both validate; the latter is lineage only and causes no file/worktree mutation.
- `RSC-P03` — Same create identity/digest returns the original record/event result with no duplicate append.
- `RSC-N01` — Missing/extra field, wrong version/status/type, empty scalar, invalid time, bad array item, unresolved ref, record-ref/hash mismatch, project mismatch, unknown policy, or secret rejects/quarantines with no append or checkpoint advance.
- `RSC-N02` — Same identity with different content returns `idempotency_conflict`; no overwrite, second record/event, or checkpoint movement.
- `RSC-N03` — Unavailable family/schema, permission, or writer posture creates no record and no event.

`restore_point.deleted` planned/static oracle set:

- `RSD-P01` — One exact-hash unprotected `available` record with permission/writer/hold/ref authority transitions once to `deleted`; `prior_hash` identifies the pre-transition record.
- `RSD-P02` — Replay returns the recorded terminal result with no duplicate append.
- `RSD-N01` — Malformed payload, wrong version/status, empty ID/ref/hash/reason, invalid time, project/actor conflict, unresolved ref, unknown policy, or secret rejects/quarantines with record and checkpoint unchanged.
- `RSD-N02` — Protected, held, stale-hash, already-terminal/non-available, permission-denied, viewer/blocked, in-flight, source-lineage-required, or storage-preflight failure remains `available`, clears no hold, and appends nothing.
- `RSD-N03` — Replay produces no second append; same identity/different digest conflicts without mutation.

`restore_point.expired` planned/static oracle set:

- `RSE-P01` — One `available` fully eligible record at or after inclusive `reference_release + 7,776,000 seconds`, with no overriding ref, exact row/payload policy equality, prior-hash equality, at least one non-empty release-evidence ref, and valid occurrence time transitions once to `expired`.
- `RSE-P02` — Count pressure selects only the oldest eligible record at `2,048/project` and retains the required hash summary.
- `RSE-N01` — Malformed payload, wrong version/status, empty ID/hash/evidence, empty evidence array, invalid time, project/policy mismatch, unknown policy, unresolved evidence, or secret rejects/quarantines with no append or checkpoint advance.
- `RSE-N02` — Before the inclusive boundary, still held/referenced/protected, non-available, or unprovable eligibility preserves the record and performs no expiry/destructive action.
- `RSE-N03` — Policy inference from prefix/name/path/mtime/timestamp/array position/similar family fails closed with no expiry append or checkpoint advance.

`seglog.event_appended` planned/static oracle set:

- `SEA-P01` — After the referenced canonical frame and manifest watermark are synchronized, one observability payload with non-negative matching sequence, exact matching event type, resolvable event/segment refs, valid time, optional non-empty writer, and inherited scope validates against the schema and append receipt.
- `SEA-P02` — Retention resolves exactly to `RP-SEGLOG-7D@1.0.0`: creation anchor, 604,800 seconds, 500,000/instance, oldest-eligible eviction, hold protection, and compact expiry.
- `SEA-N01` — Negative/non-integer sequence, invalid type grammar, empty/unresolved ref, invalid time, empty writer, extra field, or secret rejects/quarantines without observability append or checkpoint movement.
- `SEA-N02` — Type/sequence/segment receipt mismatch or inherited-scope mismatch rejects; no partition is fabricated.
- `SEA-N03` — Missing/mismatched policy, held eviction, premature expiry, or physical-metadata inference grants no compaction/destructive eligibility.
- `SEA-N04` — Substituting the observability row for its referenced canonical event is rejected; the referenced event remains authoritative.

#### Case L exact static fixture and verifier registration

The committed static oracle for `EVT2-LEGACY-GOLDEN-001`, `EVT2-LEGACY-QUARANTINE-001`, and `EVT2-LEGACY-IMMUTABLE-001` is exactly `tests/fixtures/event_record/legacy_normalization/golden/event_envelope_v1_to_event_record_v2.json`. Its machine authorities are `Plans/event_family_registry.json`, `Plans/event_family_registry.schema.json`, `Plans/event_record.schema.json`, and the `event_record_index` row in `Plans/storage_value_registry.json`. Runtime-artifact schema coverage uses exactly `tests/fixtures/runtime_artifacts/golden/runtime_artifact_fixtures.json`, `Plans/runtime_artifact_envelope.schema.json`, the 19 `Plans/runtime_artifact_<type>.schema.json` files, and `Plans/runtime_artifact_restore_point.schema.json` as the unchanged dedicated restore-point authority.

Targeted static commands are:

```text
python3 scripts/pm-plans-verify.py validate-runtime-artifact-schemas
python3 scripts/pm-plans-verify.py validate-case-l-non-event-materialization
python3 scripts/pm-implementation-readiness.py self-test
python3 scripts/pm-implementation-readiness.py validate
python3 scripts/pm-plans-verify.py validate-implementation-readiness
```

`validate-case-l-non-event-materialization` is a static owner/consumer oracle for only the approved `PD-PROBE-L011-01 A/A/A/A/A`, `PD-PROBE-L020-01 A/A/A`, `PD-PROBE-L032-01 A`, and mechanical `PGF-010` materialization. Its pass result cannot close an EventRecord denominator/depth obligation and cannot certify runtime behavior, buildability, governance, PNC-019, or Case L.

The L-032 oracle loads `Plans/storage_recovery_contracts.schema.json` as Draft 2020-12 and requires exactly `migration_preflight_result` and `migration_progress_snapshot`. Its in-memory suite has six named positives and fourteen named negatives. Positives cover ready at the exact free-space boundary, blocked one byte below with `blocked_insufficient_space`, the ten-percent reserve branch, cancellable preflight, non-cancellable applying with paired bytes, and committed progress linked to the sole `pm.storage_value.migration_receipt.v1` terminal receipt. Negatives cover wrong outcome/reason pairings, both wrong free-space comparisons, both arithmetic formulas, an unknown phase, unpaired or overrun bytes, overrun steps, post-preflight cancellation, ETA, percentage, and committed-without-receipt. The assertion evaluator uses integer ceiling arithmetic for `reserve_bytes = max(268435456, ceil(0.10 * (backup_bytes + staging_bytes)))`, exact addition for `required_free_bytes`, `0 <= completed_steps <= total_steps`, and `0 <= bytes_done <= bytes_total` when paired bytes are present. It also compares `migration_receipt.value_schema.properties.preflight_result` to the sidecar definition after recursively removing only `$comment`; no other keyword or value is ignored. `migration_receipt` remains the only migration storage family and sole terminal durable query authority. `migration_progress_snapshot` is journal-derived, is not a receipt or storage family, and must not be registered as an EventRecord family.

The L-011 static oracle loads the live `Approved fallback-divergence disposition owner contract` from Storage and the live `Storage fallback divergence command envelopes` from Contracts, then requires owner equality in the Catalog, Commands System, and exactly one production row at each of `storage.fallback.keep_logical_root`, `storage.fallback.fork_new_instance`, and `storage.fallback.export_both`; `cmd.storage.fallback.resolve_divergence` is rejected. The complete Args-schema and ownership/result cells of each of the three primary Catalog rows must equal the closed owner declaration, not merely contain selected markers: `StorageFallbackDispositionRequest` has the common fields `command_id`, `idempotency_key`, `actor_ref`, `confirmation`, and all eight explicit CAS components; keep/fork admit only those 12 fields, while export admits only those 12 plus `destination_ref` and `encryption_key_ref`. An added or wrong-variant field in any primary row fails closed even when the later shared prose block remains correct. Commands System must state the exact storage/Contracts-owned request/result relationship and Catalog registration/consumer-only boundary; catalog ownership is invalid. The exact confirmations are `retain_fallback_and_select_logical`, `create_inactive_candidate_without_switch`, and `encrypt_exact_bytes_and_retain_sources`; `confirmation_strength` is not a substitute, and request-side `manifest_ref`, result variants, receipts, or custody fields fail closed. Every row must also preserve the lowercase 64-hex rule, a distinct sole storage handler, command-envelope replay identity, both-root retention, and receipt-only/no-EventRecord effects.

The same oracle requires each complete production `acceptance_checks[0]` request declaration to equal its owner-derived grammar exactly. It does not stop at the first semicolon or use a finite forbidden-field blacklist as proof of closure, so an appended field-bearing suffix or analogous unknown extra on any of the three rows fails closed. It also requires the closed 16-field `StorageFallbackDispositionResult` with only `applied | replayed | refused | failed_recoverable`; `candidate_binding` and `export_custody` are required-present nullable fields. Keep success changes only the governed active binding and has both variants null. Fork success returns only the closed inactive candidate, keeps `export_custody=null`, and leaves the active binding unchanged. Export success keeps `candidate_binding=null`, leaves active binding and both source heads unchanged, and carries `manifest_ref` only inside the closed output `export_custody`; refused/failed variants are null and cannot claim binding change, cleanup, or custody verification. The Contracts owner list for `StorageFallbackResolutionReceipt` must equal exactly all 26 required fields from `receipt_id` through `completed_at_utc`, with nullable variant fields required-present. The receipt remains the sole durable audit artifact and no EventRecord is permitted. Missing/duplicate reverse coverage, shared/wrong handlers, a generic receipt placeholder, an event effect, any receipt-field omission, missing or extra request/result fields, wrong command confirmation, active-binding mutation, lossy export, or source-root cleanup fails the static oracle.

The L-020 static oracle scans exactly the nine current command surfaces—UI Command Catalog, production Wiring Matrix, UI Wiring Rules, Commands System, Assistant Chat, Final GUI, Worktree Git Improvement, Executor Protocol, and Orchestrator Page—and requires zero `retry_scope`. The canonical runtime command, Orchestrator wrapper, and compatibility alias must have one production row each, the same `handlers::runtime::restore_safe_point_then_retry`, `safe_point.restored`, event effect, state/disabled projections, idempotency, result, and admission contract. Wrapper and alias accept the same canonical fields plus optional `permission_snapshot_id`; admission validates it against current permission state, consumes it, and applies the identical deterministic transform before the sole handler. A peer Orchestrator handler, wrapper-only field reaching runtime, receipt-only/no-event peer path, mismatched effect, or divergent admission fails closed.

The `PGF-010` static oracle derives command existence from the live catalog and reverse coverage from the live production matrix. `cmd.chat.branch_from_restore` must resolve only to `handlers::chat::branch_from_restore`; result is closed to `branched | refused | failed`; only first `branched` returns target IDs and emits exactly one `restore_point.applied`; replay returns the same result/target IDs without duplicate emission; refused/failed return no target IDs and no event. First execution and replay preserve source thread, source conversation branch, worktree, files, Git/index state, queue, and runtime safe points. UI Wiring Rules must keep the ghost-command check live-derived from current normative references, catalog membership, and production handler/reverse coverage; a stale example list cannot satisfy it.

`self-test` must recompute both positive legacy normalizations, canonical JSON and MessagePack bytes, generation-qualified index rows, projection digests/counts, source immutability/deltas, the complete named quarantine matrix, the L-032 six-positive/fourteen-negative matrix, and the L-011 owner-equality negative matrix. L-011 mutations must reject missing reverse wiring, shared/wrong handlers, `confirmation_strength`, missing and wrong command confirmation, missing `actor_ref`, every missing CAS position, export request `manifest_ref`, request-side custody, each retired success token `kept_logical_root | fork_candidate_created | exported`, an omitted required result field, non-null wrong variants, fork/export active-binding changes, a generic receipt placeholder, and an invented EventRecord. In addition, it must reject an unknown extra in each complete primary Catalog Args cell, the exact catalog-owned Commands regression, an appended unknown request suffix in each of the three complete production request declarations, and omission of every one of the 26 `StorageFallbackResolutionReceipt` fields in turn, including `completed_at_utc`. Existing L-020 retry/effect divergence, `PGF-010` event/ghost drift, and comment-only versus semantic registry mutations remain mandatory. `validate` and its wrapper remain fail-closed while `event_denominator_unresolved`, event-family contract-depth obligations, Spec Lock hashes, generated currentness, or PNC-019 executable authority are unresolved. A red result caused by those named residuals is truthful; removing the residual, accepting an unknown family, registering a wildcard/default family, or treating an open `{}` payload/item schema as depth-complete is not an allowed repair.

The historical Known-37 event-family slice is a **KNOWN-KERNEL STATIC contract-depth set at 37/37**: each row in that bounded slice has an exact owner-routed payload contract, closed required spine and applicable enums/conditions, retention authority, and planned positive/negative/replay/quarantine oracles at canonical Plans surfaces. The live registry is revision `2026-08-27.1` with 39 rows; the two later rows do not retroactively enlarge the Known-37 assignment, and the 2026-08-27 `workspace.layout_changed` 1.1.0 upgrade changes an existing row rather than adding a family. July Event Authority evidence records the 37-row slice plus at least 248 confirmed persisted-unregistered families, at least 40 unresolved exact rows, and 68 excluded rows. It proves only a source-dated persisted floor of at least 285 with denominator status `UNKNOWN_OPEN`; bulk registration is forbidden and fresh reconciliation is required. The bound external-custody inputs are `EA-27_PRODUCER_UNION_AND_DENOMINATOR.json` (SHA-256 `644c6d0bc913eaed62f41e231fdb7e04f55d270549fcdede73a0869994111e47`; `union_rows_sha256=aa9c365904788eba74df73bb1b5eecaae903a6aa167e0514b7937198aa0dbf4d`) and `EA-29_TERMINAL_FINDINGS_RESIDUALS_CONTRACT_DEPTH_REPAIR_AND_WAVE1_CHECKPOINT.md` (SHA-256 `17820aef1b498acf2e5165bee106171ff1ef35a1b23fa67d0cc23e291a8ed7bf`) under `PuppetMaster-AssuranceLab` custody. Static prose/schema presence is not fixture execution, validator or gate success, shard or generated-governance currentness, runtime behavior, harness evidence, certification, buildability, Case L closure, or denominator completion. Unknown/unregistered events still quarantine without checkpoint advance.

These checks are static plan/schema/fixture evidence. The PNC-019 harness must run the non-event validator before constructing a harness result or writing a receipt, then stop fail-closed on the live EventRecord denominator/depth critical. Updating its source-consumer and preflight shape is not a harness execution, runtime lifecycle result, certification receipt, buildability proof, or Case L finding closure.

### Exact-replace restore, truthful envelopes, and SCM boundaries

| Fixture | Required oracle |
| --- | --- |
| `RSP-ATOMIC-001` | Kill after every multi-path operation; restart ends at exact target, exact rollback, or fenced recovery-required, and the outcome matches the proven digest. |
| `RSP-ATOMIC-002` | Apply failure plus verified rollback emits only `restore_failed`; post digest equals pre/admission digest. |
| `RSP-ATOMIC-003` | Concurrent third state is not overwritten; `restore_recovery_required` persists and dispatch remains fenced. |
| `RSP-EQUAL-001` | Complete manifest/SCM equality emits `restore_skipped` with zero target-path mutations. |
| `RSP-INTEGRITY-001` / `RSP-INTEGRITY-002` | Corrupt manifest or missing/corrupt blob emits `restore_refused` plus exact reason before mutation; admission digest is unchanged. |
| `RSP-INTEGRITY-003` | Post-apply mismatch verifies rollback and `restore_failed` or remains recovery-required; never `restored_clean`. |
| `RSP-SCOPE-001` | Tracked, staged, unstaged, untracked, explicitly mutation-scoped ignored, symlink, executable, and submodule cases include/exclude and round-trip exactly within the FileSafe manifest boundary. |
| `RSP-BASELINE-001` | `safe_point` exact-replaces only the named worktree/branch, restores captured pre-attempt dirty state, and admits exactly one successor attempt after durable proof. |
| `RSP-BASELINE-002` | `historical_commit` uses a full immutable commit OID to create a distinct clean worktree; dirty source bytes/index/branch/ownership remain unchanged. |
| `RSP-BASELINE-003` | `worktree_head` validates exact full HEAD plus state digest and explicit dirt confirmation with zero SCM/file mutation. |
| `RSP-BASELINE-004` | Unknown target, missing conditional field, moving/abbreviated ref, missing/non-commit OID, identity mismatch, or digest drift refuses with no substitution or successor attempt. |
| `RSP-RETENTION-001` through `RSP-RETENTION-003` | Open recovery holds outlive ordinary retention; release permits only later owner cleanup; missing/corrupt recovery material preserves local work and never falsely resolves. |
| `RSP-KEY-001`, `RSP-REGISTRY-001`, `RSP-REGISTRY-002` | Only canonical `sp:` writes exist; aliases resolve uniquely or fail closed; required split rows are materialized and a deferred/bundled launch dependency is rejected. |
| `RSP-RP-001` through `RSP-RP-004` | Conversation restore points branch to a new thread/branch, preserve the source thread/worktree/files, apply `RP-RESTOREPOINT-90D-AFTER-RELEASE@1.0.0` with its exact release boundary/cap/oldest-eligible/overriding-ref rules, and refuse stale/corrupt input without filesystem restore. Create/apply/delete and replay/refusal/failure leave Executor attempt, successor-attempt, runtime-safe-point, worktree/file, and dispatch state unchanged; no retention timer or expiry transition is Executor-owned. |
| `RSP-CMD-001` / `RSP-CHAT-001` | Command IDs/conditional fields/wiring are singular and complete; multi-file Chat revert has the same FileSafe transaction truth and does not rewind the conversation. |

The exact restore inventory is `RSP-ATOMIC-001`, `RSP-ATOMIC-002`, `RSP-ATOMIC-003`, `RSP-EQUAL-001`, `RSP-INTEGRITY-001`, `RSP-INTEGRITY-002`, `RSP-INTEGRITY-003`, `RSP-SCOPE-001`, `RSP-RETENTION-001`, `RSP-RETENTION-002`, `RSP-RETENTION-003`, `RSP-KEY-001`, `RSP-REGISTRY-001`, `RSP-REGISTRY-002`, `RSP-BASELINE-001`, `RSP-BASELINE-002`, `RSP-BASELINE-003`, `RSP-BASELINE-004`, `RSP-RP-001`, `RSP-RP-002`, `RSP-RP-003`, `RSP-RP-004`, `RSP-CMD-001`, and `RSP-CHAT-001`.

### Retention, anchors, compaction, deletion, quarantine, and maintenance exclusion

- `RET-001-expiry-boundary`, `RET-002-cardinality-tie`, `RET-003-hold-set-clear`, `RET-004-unknown-policy`, `RET-005-janitor-resume`, and `RET-006-settings-minimum` prove inclusive expiry, deterministic count ties, hold set/clear, fail-safe unknown policy, journal restart cursor, and reject-not-clamp settings minima.
- `ANCHOR-001-old-open-block`, `ANCHOR-002-release`, `ANCHOR-003-multiple-anchors`, `ANCHOR-004-snapshot-missing`, and `ANCHOR-005-atomic-publish` prove blocked recovery survival, exact release conditions, unioned anchors, truthful `recovery_unavailable`, and no half-published blocked episode/anchor.
- `CMP-001-retained-set`, `CMP-002-index-checkpoint`, `CMP-003-projection-rebuild`, `CMP-004-crash-phases`, `CMP-005-maintenance-exclusion`, and `CMP-006-backup-pin` prove the exact retained set and unchanged semantic IDs, index/checkpoint translation, shadow projection swap, phase-driven crash recovery with one `CURRENT` generation, maintenance-lease exclusion, and pre-migration backup pinning.

#### K37 compaction lifecycle event owner oracles (K37-CMP-OC-001)

Every `K37-CMP-P01..P13` and `K37-CMP-N01..N15` oracle is `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION`. `CMP-004-crash-phases` is the crash-cut consumer anchor. Prose registration does not mean passed; Storage remains the semantic owner.

- `K37-CMP-P01` — Matching survivor digest and complete semantic map select `translate_by_semantic_identity`; every entry preserves sequence/event identity, target refs are current, retired refs are absent, and checkpoint advance waits for verification.
- `K37-CMP-P02` — Mismatch or unprovable translation selects `invalidate_and_rebuild`; affected rows invalidate and rebuild from the nearest matching survivor checkpoint or first retained event, with no interim advance.
- `K37-CMP-P03` — Complete verified target shadow plus synchronized target `CURRENT` selects `activate_verified_target_shadow`; target generation activates once and pending state clears once.
- `K37-CMP-P04` — Unprovable/nonexistent shadow selects `rebuild_from_survivors`; affected derived state is discarded and rebuilt over the authoritative target survivor set before publication or checkpoint advance.
- `K37-CMP-P05` — Each action member traverses exactly `preparing -> building -> verified -> commit_pending -> committed -> finalized` with every predecessor postcondition, target proof, survivor/removal map, and action/phase join established and closed-source hashes unchanged.
- `K37-CMP-P06` — Failure from `preparing|building|verified|commit_pending` with unchanged source `CURRENT` reaches only `failed`, carries non-empty reason, preserves source authority, and publishes no target/checkpoint/projection.
- `K37-CMP-P07` — Publication ambiguity from each nonterminal ordinary phase reaches `recovery_required`, carries non-empty reason, preserves both sides, and keeps mutation/maintenance/projector/checkpoint fences active.
- `K37-CMP-P08` — Crash after target `CURRENT` and before activation/finalization converges on the same identity through `recovery_required -> committed -> finalized` with one target and no duplicate physical/event effect.
- `K37-CMP-P09` — Proof that `CURRENT` never left the valid source converges `recovery_required -> failed`, preserves source authority, and leaves immutable failed history.
- `K37-CMP-P10` — Crash at every builder, artifact, pending-generation, `CURRENT`, activation, pending-clear, finalization, and next-active cut yields exactly one `CURRENT` generation and never selects by mtime/filename.
- `K37-CMP-P11` — `recovery_required|failed` require one non-empty `failure_reason`; the six ordinary phases forbid it; no peer evidence property is admitted.
- `K37-CMP-P12` — Identical transition replay after restart returns the original durable result with append count/effect one; terminal failure retry uses a new `compaction_id` only after every current gate revalidates.
- `K37-CMP-P13` — Compaction raced against migration, restore, salvage, and backup-boundary capture admits exactly one lock/lease holder; refusal emits no lifecycle success event or overlapping write.
- `K37-CMP-N01` — Reject unknown, empty, alias, case variant, generic, packet-007, or third action-domain member; analogy grants no compatibility.
- `K37-CMP-N02` — Reject semantic translation without matching survivor digest and complete unambiguous sequence/event mapping, including timestamp/physical-ref derivation.
- `K37-CMP-N03` — Reject target-shadow activation before complete target proof/target `CURRENT`, with source `CURRENT`, or with shadow/index/checkpoint/removal-map disagreement.
- `K37-CMP-N04` — Reject skipped, reversed, same-state-as-new, unlisted, or terminal outgoing edges, including direct recovery finalization, committed failure, and edges from terminal states.
- `K37-CMP-N05` — Reject `failed` without proven unchanged pre-`CURRENT` source authority; ambiguous or possibly post-`CURRENT` failure is `recovery_required`.
- `K37-CMP-N06` — Reject recovery egress without exact source-failure or verified-target-commit proof and reject fence clearing while unresolved.
- `K37-CMP-N07` — Reject missing/empty/null exceptional reason, reason on an ordinary phase, or a new evidence field.
- `K37-CMP-N08` — Reject source mutation, active-segment inclusion, wrong target generation, changed semantic bytes/identity/order/hash/gaps, early source deletion, or retired physical refs.
- `K37-CMP-N09` — Reject mtime, filename, newest-looking directory, advisory index, projection freshness, or event order as visibility authority; synchronized `CURRENT` alone selects.
- `K37-CMP-N10` — Reject stale policy revision/hash, unresolved refs, ineligible held/live/backup/rollback source, missing lock/lease, or competing owner; no success append.
- `K37-CMP-N11` — Different digest for one identity returns `idempotency_conflict`; unavailable proof returns `dedupe_unavailable`; neither appends, projects, advances, dispatches, or mutates.
- `K37-CMP-N12` — Reject replay that repeats physical effect, semantic append, checkpoint advance, dispatch, or namespace mutation.
- `K37-CMP-N13` — Reject raw secret/credential/token/path/machine identity/event content or unregistered redaction transform.
- `K37-CMP-N14` — Reject treating action selection as applied before the phase predicate; early/exceptional/failed rows cannot activate, publish, clear pending, or delete source.
- `K37-CMP-N15` — Reject reuse of terminal identity for a new attempt; same digest returns original, different digest conflicts, and a new attempt uses a new identity after revalidation.

Every `K37-CMP-N01..N15` rejection has zero append, zero owner mutation, zero projection effect, zero checkpoint advance, zero command/tool/provider/network dispatch, and zero source/target namespace mutation.

- `DEL-001-thread`, `DEL-002-held-thread`, `DEL-003-shared-project-seglog`, and `DEL-004-backup-restore` prove immediate logical hide, held purge disclosure, cross-project isolation, the 24-hour purge contract, content-free tombstone retention, and tombstone replay preventing deleted content from reappearing after backup restore.
- `Q-001-gui-reset`, `Q-002-critical-invalid`, `Q-003-derived-rebuild`, `Q-004-recovery-migration`, `Q-005-quarantine-cap`, `Q-006-raw-export-redaction`, and `Q-007-corrupt-quarantine` prove raw-byte custody before reset/migration, critical-family fail-closed behavior, derived rebuild, CAS-published recovery, no unresolved critical cap eviction, routine-export redaction, and quarantine-integrity refusal.

#### K37 deletion lifecycle event owner oracles (K37-DEL-OC-001)

Every case in this subsection is `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION`; it is planned/static acceptance prose and never a runtime, fixture, gate, or certification claim.

Shared envelope admission for the four Storage rows is exact. `storage.compaction_lifecycle_changed` requires application scope and envelope `project_id=null`. For deletion, retention hold, and quarantine, absent payload `project_id` requires application scope with envelope `project_id=null`; a present non-empty payload `project_id` requires project scope and byte-equal envelope project ID. Empty, sentinel, multiple, conflicting, or unprovable candidates quarantine before append with no checkpoint advance. In every row, outer `event_type`, `payload_schema_id`, inline `$id`, family revision, structured retention ref, replay identity, and registered redaction posture must join exactly.

Positive cases require:

- application scope with payload project ID absent, envelope `project_id=null`, exact row/schema/version/retention, and required spine;
- project scope with the same non-empty project ID in payload/envelope and one scope partition;
- ordinary thread deletion `requested -> logically_hidden`, immediate ordinary projection removal, content-free tombstone preservation, and eligible unheld purge through owner compaction within the 24-hour contract;
- held deletion `logically_hidden -> held`, disclosure of current blockers, and no purge until owner-cleared holds plus complete revalidation;
- `purge_pending` both without generation and with a non-negative integer generation, never as visibility or success authority;
- terminal `purge_pending -> purged` only after verified committed successor authority, with required non-negative generation matching the durable deletion record;
- each admitted `requested|logically_hidden|purge_pending -> failed` carrying non-empty reason, no generation, fencing, and no success claim;
- retry after failure with the same `deletion_id` and existing deletion-operation idempotency identity, after revalidating holds, tombstone, scope, storage writer, and purge/compaction authority;
- backup restore replaying tombstones before visibility so deleted content does not reappear; and
- identical replay returning the original result with append count one and no duplicate purge/projection effect.

Negative/zero-effect cases require:

- reject/quarantine missing/extra/wrong schema, version, type, enum, empty ID/ref/item, duplicate hold item, invalid deadline, or other malformed payload;
- quarantine application+project ID, project+missing/null/mismatched payload project ID, unknown scope, sentinel, or conflicting candidates with no scope substitution;
- reject negative, fractional, string, or null event generation; generation outside `purge_pending|purged`; missing generation for `purged`; missing/empty failure reason for `failed`; or failure reason on any other state;
- reject `held -> failed|purged`, purge while blockers remain, `purged -> *`, or any unlisted edge while preserving the prior valid state;
- refuse direct UI/command/segment purge, missing tombstone, unverified/uncommitted generation, newest-by-mtime authority, ambiguous/cross-project reachability, or path/name/time/focus/order scope inference;
- refuse/quarantine viewer/blocked storage, missing writer, unavailable maintenance/compaction/family/schema/retention authority, or unavailable dedupe proof;
- return `idempotency_conflict` for one identity with a different digest;
- reject raw secret/credential/token/password/API key/OAuth/local path/deleted content in event or tombstone; and
- fail backup restore that exposes deleted content before tombstone replay.

Every deletion rejection/refusal has zero new append, zero owner-state mutation, zero projection effect, zero checkpoint advance, zero purge/compaction dispatch, and zero hold clear.

#### K37 retention-hold lifecycle event owner oracles

All are `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION`. Positives cover application/project set and clear through protected `cmd.storage.legal_hold.manage`, matching optional project identity, exact actor/reason/semantic scope/target policy/anchor/affected refs/receipt, one scoped event, and union composition of multiple holds. Clearing one hold never clears another and holds never clear automatically. Row retention remains `RP-AUTHORITY-INDEFINITE@1.0.0` even when payload `policy_ref` names a finite held-target policy.

Negatives reject malformed schema/version/scope, empty ref/item, duplicate affected ref, unknown action, policy/row conflation, unauthorized or missing actor/reason/expected state, missing writer/family, scope conflict, automatic clear, clearing another hold, refusal, and replay duplication. Each has zero append, zero owner mutation, zero projection effect, zero checkpoint advance, zero dispatch, and zero unauthorized hold set/clear.

#### K37 value-quarantine lifecycle event owner oracles

All are `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION`. Positives cover each admitted risk/state pair and legal edge: `detected -> secured`; `secured -> migrated|restored|recovery_blocked`, plus `reset_to_default` only for `Q-RESETTABLE` and `rebuilt` only for `Q-DERIVED|Q-MIRROR`; and resolved `migrated|rebuilt|reset_to_default|restored -> purged`. Exact `raw.bin`, custody manifest, and append-only recovery receipt synchronize before live-key mutation. Unknown schema/upgrader remains `recovery_blocked`; unresolved `Q-CRITICAL` remains indefinite and cap pressure blocks new mutation-capable writes.

Negatives reject direct detected-to-resolution, resolution before secured, critical reset/rebuild, class-invalid reset/rebuild, `recovery_blocked -> purged`, transition out of `purged`, purge without resolved custody/hold authority, cap eviction, missing/empty raw custody hash/ref, schema identity conflict, illegal risk/state pair, project/scope conflict, raw secret/content in the event, defaulting unknown content, refusal, and replay duplication. Each has zero append, zero live-value mutation, zero projection effect, zero checkpoint advance, zero dispatch, and zero unauthorized purge/hold action.

Migration, compaction, store restore, salvage, and backup-boundary capture must be raced in both orders. Exactly one maintenance lease holder proceeds; the second operation receives the owner-defined refusal and no overlapping canonical write occurs. Kill/restart cases must use the storage-owned phase tables and must never pick authority by mtime, filename, or newest-looking directory.

### Required-MVP storage-family registry routing

- `REGISTRY-MVP-001` asserts exactly one materialized machine row, canonical key, closed value schema, owner/producer/consumer, migration, recovery, retention, and redaction disposition for every storage-owner-required MVP family, including `migration_receipt`, `editor_buffer_recovery_state`, `editor_workspace_state`, `hotreload_state`, `onboarding_state`, safe-point/restore transaction/restore point, EventRecord dedupe/index/checkpoint, and hold/anchor/maintenance/quarantine/deletion families.
- `REGISTRY-MVP-002` separates current-key cases from compatibility cases. First-launch, valid-current-row, and corrupt-current-row oracles use the canonical keys `editor_state.v1:{project_id}:{file_path_hash}`, `editor_workspace_state.v1:{project_id}`, `hotreload_state.v1:{project_id}`, and `onboarding_state.v1:{project_id}`. `editor_buffer_recovery_state` uses the per-file canonical key and has no compatibility alias or copy-forward case. Coordinator-owned old-key copy-forward cases are exactly `editor_state:v1:{project_id}` for `editor_workspace_state`, `hotreload_state:v1:{project_id}` for `hotreload_state`, and `onboarding:v1` for `onboarding_state`; the global onboarding alias fails closed when project identity is ambiguous. All compatibility aliases are read-only and never receive new writes.
- `REGISTRY-MVP-NEG-001` removes or defers each launch-critical family and falsifies recovery/retention metadata in turn; validation and mutation admission fail closed, and no prose key template or bundled multi-owner row substitutes for machine authority.

### Mandatory negative acceptance

No Case L suite passes if any of the following occurs: incompatible/preflight refusal mutates target bytes; a half-migrated or mixed-restored store ordinary-opens; a canonical redb family is reported recovered by projection rebuild; a committed migration lacks verification/receipt read-back; a future EventRecord is skipped or rewritten; legacy normalization appends or changes source bytes; replay-only causes external/canonical side effects; `restored_clean` lacks target equality; `restore_failed` lacks rollback equality; exact restore emits `restored_with_conflicts`; a third-party SCM state is overwritten; a moving/abbreviated ref substitutes for an immutable OID; cleanup deletes held/anchored/referenced authority; compaction rewrites closed source bytes or selects by mtime; Executor accepts completion or dispatch from EventRecords, projections, UI state, summaries, or worker/controller claims while `executor_intake_report` or `attempt_receipt` is corrupt, unavailable, or not restored behind a durable verified Storage recovery boundary; a conversation restore-point create/apply/delete path creates or reuses an Executor attempt, successor attempt, runtime safe point, worktree/file/repository/index mutation, worker/scheduler dispatch, or Executor-owned retention timer; or schema/plan/fixture registration is reported as executed runtime proof.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#EventRecord, ContractName:Plans/event_record.schema.json, ContractName:Plans/FileSafe.md, ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/storage_value_registry.json, ContractName:Plans/Release_Supply_Chain.md, DecisionID:PD-RSP-01, DecisionID:PD-RSP-07, DecisionID:PD-L015-03

### ATS-024 - Case L Durable-State Fault, Compatibility, Restore, And Retention Fixtures

```yaml
plan_unit_id: ATS-024
unit_type: requirement
status: accepted
owner_doc: Plans/Automated_Testing_System.md
canonical_text: >-
  Automated Testing executes the approved Case L migration, newer-store, mandatory-backup, crash/restart,
  seglog durability, storage-I/O, lock/viewer, root/fallback, EventRecord 2.0 and legacy-normalization,
  exact-replace restore, SCM-baseline, retention/anchor/compaction/deletion/quarantine, and
  maintenance-exclusion fixtures against their canonical owners. Every positive outcome and negative
  no-mutation/no-false-success oracle is receipt-backed; fixture registration, schema validity,
  skipped/inconclusive results, and owner prose never substitute for execution.
gui_related: false
gui_classification_reason: This unit owns automated backend durability, compatibility, fault-injection, and receipt evidence rather than presentation.
depends_on: [ATS-001, ATS-003, ATS-004]
unblocks: [RSC-009]
acceptance_criteria:
  - FX-L001-*, FX-L002-*, FX-L003-*, FX-L016-*, FX-L025-*, and FX-L032-* prove exact refusal, migration, receipt, backup, restore, compatibility, and disk/progress outcomes with byte-digest evidence.
  - Migration command-inventory evidence proves diagnostics/retry are read-only gates and exposes no generic live repair/salvage/Doctor mutation, bypass, post-preflight force-cancel, or try-anyway path.
  - SEG-FX-001..018 plus SEG-OR-001..012 prove barrier durability, survivor determinism, sequence nonreuse, crash convergence, closed immutability, checkpoint/projection truth, and disclosure fidelity.
  - STIO, LOCK, ROOT, and FALLBACK fixtures prove exact retry/failure posture, one OS-authoritative writer, mutation-proof viewer behavior, continuity/relocation recovery, and no automatic divergent-store merge or overwrite.
  - EventRecord 2.0 fixtures prove closed scope pairs, exact v2 lookup keys, byte-identical in-memory-only legacy normalization, lifetime dedupe/catch-up, strict V1/V2 reader compatibility, and replay-only side-effect isolation.
  - RSP fixture families prove exact target/rollback equality, truthful restore envelopes, restart fencing, canonical safe-point identity, SCM baseline effects, source preservation, and Chat parity.
  - RET, ANCHOR, CMP, DEL, and Q fixtures consume the named K37 retained-inline owner-oracle subsections and prove both compaction action domains, the complete ordinary/exceptional graph, exactly one CURRENT-selected generation, retention/hold/cleanup behavior, deletion aftermath, quarantine custody, envelope/scope joins, replay idempotency, and the no-append/zero-effect posture with owner-backed evidence.
  - REGISTRY-MVP fixtures prove complete machine routing for every required family and reject missing, deferred, bundled, or false recovery/retention authority.
  - Missing, blocked, skipped, inconclusive, stale, or merely schema-valid evidence cannot satisfy a required oracle or release gate.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - future Case L durable-state fixture adapter and TestRunReceipt suite
risk_class: case_l_durable_state_false_positive_oracle
reasoning_tier: high
context_scope: case_l_migration_restore_eventrecord_retention_testing
implementation_surfaces:
  - Plans/Automated_Testing_System.md
  - Plans/storage-plan.md
  - Plans/Contracts_V0.md
  - Plans/event_record.schema.json
  - Plans/FileSafe.md
  - Plans/WorktreeGitImprovement.md
  - Plans/Executor_Protocol.md
  - Plans/storage_value_registry.json
  - Plans/Release_Supply_Chain.md
node_compile_hint:
  mode: case_l_durable_state_fixture_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-001..L-033
  - Case-L:PD-L-01..PD-L-06
  - Case-L:EVT-01..EVT-07
  - Case-L:PD-RSP-01..PD-RSP-09
  - Case-L:PD-L005-01..PD-L033-03
  - Case-L:SEG-D-001..SEG-D-029
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/CONSUMER_PROPAGATION_MAP.md
preserved_exact_tokens:
  - "blocked_newer_store"
  - "projector_replay_only"
  - "restore_refused"
  - "restore_recovery_required"
  - "historical_commit_oid"
  - "expected_state_sha256"
  - "CURRENT"
  - "recovery_unavailable"
negative_constraints:
  - Do not redefine owner algorithms, enums, keys, retention values, receipt schemas, or SCM effects in testing.
  - Do not report restored_clean without target equality or restore_failed without rollback equality.
  - Do not treat green parsers, validators, registered fixtures, or unexecuted receipts as runtime, closure, buildability, certification, or completeness proof.
owner_hints:
  - Plans/Automated_Testing_System.md
  - Plans/storage-plan.md
  - Plans/FileSafe.md
```
