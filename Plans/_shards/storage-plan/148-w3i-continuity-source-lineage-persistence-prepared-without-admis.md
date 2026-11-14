# Shard 148: W3I continuity source-lineage persistence — prepared without admission (2026-11-05)

Source: `Plans/storage-plan.md`

Source lines: L64782-L66098

Source SHA256: `955d7fb440299fd63a0735130db45cb7b4826067df3498d471d40ffcd2c3575a`

---

## W3I continuity source-lineage persistence — prepared without admission (2026-11-05)

### SP-1600 — `continuity.actor_identified` append, read, and custody

**NEWLY AUTHORED Storage owner contract** under DL-450, separately adopted for `continuity.actor_identified@1.0.0`. Exact producer `orchestrator.continuity_actor_identified.v1@1.0.0` calls `storage.continuity_append.v1@1.0.0`; direct consumer is `storage.continuity_projector.v1@1.0.0`. `reader.orchestrator.continuity_audit.v1@1.0.0` is the operating audit-only reader. No sibling event or `runtime_continuity.*` admission follows. The family uses ordinary CV-317 EventRecord append and Case L-2 / SP-026 / SP-236 canonical SeglogFrameV2 bytes, without a local codec.

**Producer ordering and retry.** First verify this family/version's actual registry admission, supported complete resource graph, current Project/source access and tombstones, original source fact and CV-1600 identity/body joins. An absent registry entry returns `missing_event_registration` with no append, projection, success receipt, buffering, or outbox. Under Storage's writer lock catch lifetime dedupe up to the verified tail or return `dedupe_unavailable`. For a genuinely new fact, validate/pack the body, then append; explicitly adopt SP-286/CV-339 full-value v2 first issuance via `storage.first_append_receipt.issue.v2`, and lost-ack resolution via `storage.first_append_receipt.resolve.v2`. The group's actual durability and issued original receipt precede any success/publication. Verify the full original EventRecord value, group, scope, body and all eleven receipt fields on every initial, retry, recovery and retained path; a caller receipt is insufficient. Unknown outcome fences the same source fact until resolved; never remint continuity/fact identity. Restored absence never proves never-issued; SP-286's actual accepted-operation and completed-restore gates remain required. No command/result authority is synthesized.

**Payload and values.** The exact stored event body is CV-1600's payload. Above 16 KiB encoded body bytes use SP-337's immutable BLAKE3 payload pack and exact `payload_ref`; forbid base64 wrapping or silent trimming. Recompute the pack ID/size/media-type/body relation from actual bytes. A returned pack ref cannot change the logical body or original semantic digest on retry; SP-337 supplies the fixed original route. Each stored part is measured, including the derived projection and checkpoint. A derived value exceeding 16 KiB is refused before its transaction, without trimming, partial advance or deleting held history. Derived projections store an exact immutable ref to the verified EventRecord body; they do not duplicate a large body. No canonical extra operation table is introduced.

**This family's projection and checkpoint.** The existing logical keys `continuity_record.v1:{project_id}:{continuity_id}` and `continuity_replay_checkpoint.v1:{project_id}:{stream_id}` use exact identity joins; key components are unambiguous length-framed UTF-8 under the table adapter, never parsed by splitting embedded colons. The first key holds only the complete latest snapshot pointer plus original event identity, canonical sequence and publication; `body_event_id=event_id` resolves the entire original continuity payload. The original Continuity Record Family fields remain the exact logical read view, including actor, provenance, redaction and creation time. They are not duplicated into a second authoritative body or aggregated from unrelated observations. This family's successful transition replaces that snapshot only when the new matching canonical sequence is greater, for the same actual Project/continuity/source stream, under exact prior-value CAS. Replay of the same event is a no-op; an older event cannot regress it. Actor, provenance, redaction and source-position facts still come from the original snapshot, never from another family's current row.

For `continuity.actor_identified`, explicitly adopt SP-278 through `reader.storage.event_record_index@1.0.0`: one actual current derived-database snapshot resolves `checkpoints`, `event_record_index_checkpoint.v1:{storage_instance_id}`, its uniquely current generation, exact original row birth anchor and `event_record_index.v2@{generation_id}`. Scan a complete captured global prefix, including nonmatching records, filter by exact Project/stream and this family when admitted, and verify original frame bounds/CRCs/watermarks, original first receipt, and original body. The captured admitted set lists the exact separately admitted families this projector can read, never a namespace wildcard. Changed projection rows and the inclusive global frontier advance atomically in one redb transaction under exact old-checkpoint CAS. Persist only SP-278's nine durable fields (DL-076); the actual live read supplies its own snapshot ID after helpers, never a stored `redb_snapshot_id`. Checkpoint source/root/generation/token/dataset, frame cursor, Project, stream, family/schema, publication, and examined-through bound must agree. Every failure quarantines or returns unavailable without partial advance. A filtered checkpoint cannot stand in for a complete global read. An empty prefix publishes no checkpoint until an actual examined frontier exists.

The operating reader verifies the current supported publication, complete prefix coverage through the requested event and actual final source/access boundaries after all helpers; an unrelated, withdrawn, incomplete, or stale-source publication is unavailable. Rebuild reads retained authentic originals in canonical order and changes only derived rows/checkpoint. It does not re-run source work, transforms, scheduler wakes, network calls, appends, Usage charges, or notifications. Historical readers verify original edition/recipe/custody and current permitted disclosure; a later live-state change does not invalidate valid retained history. Retained compatibility/replay-only inputs may rebuild only the same derived state after original verification.

**Retention, privacy and withdrawal.** `continuity.actor_identified` records source lineage for audit continuity, the exact source-lineage class in Case L-3: event body and original fact custody use `RP-AUTHORITY-INDEFINITE@1.0.0`, no age/count eviction; storage pressure fails closed. G05 is GitHub sign-in only and is not used. The rebuilt snapshot/checkpoint use existing `RP-PROJECTION-3GEN@1.0.0`: one current plus at most two retired publications, first withdrawal time anchors a retired publication, holds prevent cleanup, and a fourth waits for lawful retirement cleanup. Projection rows contain only current latest source refs; governed rebuild replaces the publication and removes rows it does not rewrite. Keep complete current/retired checkpoint cores together, including their original tokens, frontiers, source identities and holds; each retired core must have state=withdrawn, its once-set first withdrawal time, and a distinct publication ID. Ordinary advance preserves publication ID, first-withdrawal metadata and history. A fourth publication waits for lawful cleanup; never prune original canonical history to satisfy derived limits. References to source outputs, source checkpoints, redaction results and bodies have active-ref holds for as long as needed to authenticate this retained fact; they keep their own deletion/access rules and no linked content is retained or disclosed merely by this assignment. Storage owns originals in seglog/payload packs and SP-286 custody; mandatory coherent backup/restore includes their authentic source evidence, first receipts and retained recipe selectors. Missing originals return unavailable/data-loss disclosure, never a reconstructed valid answer. Current Project permission, principal visibility, redaction policy, tombstones, holds, backup, and deletion eligibility gate every read; opaque refs grant no access. Raw secrets, prompts, outputs, file content, credentials and local paths are refused before append.

Unknown versions are unavailable; no automatic `runtime_continuity.*`, route-object, file-mirror or memory-directory conversion is supplied. Current schema installation uses StorageMigrationCoordinator's actual graph; no invented store-version number. Withdrawal first cuts off this family's writers, then marks the affected publication withdrawn once and fences projector/readers. A new supported publication is rebuilt from authentic retained sources under the new declared admitted set and CAS-switched only after complete verification. No zero-cursor reset, backdated receipt, sibling fallback, canonical rewrite or source deletion follows. Historical access remains subject to the original admission and reader fences.

```yaml
plan_unit_id: SP-1600
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: NEWLY AUTHORED continuity.actor_identified@1.0.0 individually adopts CV-1600, SP-286/CV-339 v2 full-value
  custody, SP-337 and SP-278. Exact append, audit reader, prefix checkpoint CAS, retention, coherent backup, retained-version
  and withdrawal rules are defined above. Source lineage uses RP-AUTHORITY-INDEFINITE; derived values use RP-PROJECTION-3GEN.
  Nothing is admitted.
gui_related: false
gui_classification_reason: Audit lineage, storage, and test contracts; no new presentation behavior.
depends_on:
- OSI-1600
- CV-1600
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- No accepted effect or success precedes exact admission, source verification and original full first receipt.
- Projection and complete source prefix advance atomically; read/replay has no external effect.
- Retention, custody, source access and withdrawal cover this exact family.
validation_surfaces:
- Plans/Automated_Testing_System.md#ATS-1280
- Plans/storage_value_registry.json
risk_class: continuity_source_custody_drift
reasoning_tier: high
context_scope: event_authority_w3i_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/continuity_event_contracts.schema.json
node_compile_hint:
  mode: prepared_without_admission
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-2 item 9.a A; answer i approve all of it; DL-450 on plans/ea-cards2-answers-20261105
- reports/event-authority-20261105/W3I.md#sp-1600
preserved_exact_tokens:
- continuity.actor_identified
- SP-278
- SP-286
- RP-AUTHORITY-INDEFINITE
- RP-PROJECTION-3GEN
negative_constraints:
- No event-family admission, native execution, registry append, or PNC-019 clearance.
- No runtime_continuity alias or receipt reconstructed from current state.
```

### SP-1601 — `continuity.provenance_recorded` append, read, and custody

**NEWLY AUTHORED Storage owner contract** under DL-450, separately adopted for `continuity.provenance_recorded@1.0.0`. Exact producer `orchestrator.continuity_provenance_recorded.v1@1.0.0` calls `storage.continuity_append.v1@1.0.0`; direct consumer is `storage.continuity_projector.v1@1.0.0`. `reader.orchestrator.continuity_audit.v1@1.0.0` is the operating audit-only reader. No sibling event or `runtime_continuity.*` admission follows. The family uses ordinary CV-317 EventRecord append and Case L-2 / SP-026 / SP-236 canonical SeglogFrameV2 bytes, without a local codec.

**Producer ordering and retry.** First verify this family/version's actual registry admission, supported complete resource graph, current Project/source access and tombstones, original source fact and CV-1601 identity/body joins. An absent registry entry returns `missing_event_registration` with no append, projection, success receipt, buffering, or outbox. Under Storage's writer lock catch lifetime dedupe up to the verified tail or return `dedupe_unavailable`. For a genuinely new fact, validate/pack the body, then append; explicitly adopt SP-286/CV-339 full-value v2 first issuance via `storage.first_append_receipt.issue.v2`, and lost-ack resolution via `storage.first_append_receipt.resolve.v2`. The group's actual durability and issued original receipt precede any success/publication. Verify the full original EventRecord value, group, scope, body and all eleven receipt fields on every initial, retry, recovery and retained path; a caller receipt is insufficient. Unknown outcome fences the same source fact until resolved; never remint continuity/fact identity. Restored absence never proves never-issued; SP-286's actual accepted-operation and completed-restore gates remain required. No command/result authority is synthesized.

**Payload and values.** The exact stored event body is CV-1601's payload. Above 16 KiB encoded body bytes use SP-337's immutable BLAKE3 payload pack and exact `payload_ref`; forbid base64 wrapping or silent trimming. Recompute the pack ID/size/media-type/body relation from actual bytes. A returned pack ref cannot change the logical body or original semantic digest on retry; SP-337 supplies the fixed original route. Each stored part is measured, including the derived projection and checkpoint. A derived value exceeding 16 KiB is refused before its transaction, without trimming, partial advance or deleting held history. Derived projections store an exact immutable ref to the verified EventRecord body; they do not duplicate a large body. No canonical extra operation table is introduced.

**This family's projection and checkpoint.** The existing logical keys `continuity_record.v1:{project_id}:{continuity_id}` and `continuity_replay_checkpoint.v1:{project_id}:{stream_id}` use exact identity joins; key components are unambiguous length-framed UTF-8 under the table adapter, never parsed by splitting embedded colons. The first key holds only the complete latest snapshot pointer plus original event identity, canonical sequence and publication; `body_event_id=event_id` resolves the entire original continuity payload. The original Continuity Record Family fields remain the exact logical read view, including actor, provenance, redaction and creation time. They are not duplicated into a second authoritative body or aggregated from unrelated observations. This family's successful transition replaces that snapshot only when the new matching canonical sequence is greater, for the same actual Project/continuity/source stream, under exact prior-value CAS. Replay of the same event is a no-op; an older event cannot regress it. Actor, provenance, redaction and source-position facts still come from the original snapshot, never from another family's current row.

For `continuity.provenance_recorded`, explicitly adopt SP-278 through `reader.storage.event_record_index@1.0.0`: one actual current derived-database snapshot resolves `checkpoints`, `event_record_index_checkpoint.v1:{storage_instance_id}`, its uniquely current generation, exact original row birth anchor and `event_record_index.v2@{generation_id}`. Scan a complete captured global prefix, including nonmatching records, filter by exact Project/stream and this family when admitted, and verify original frame bounds/CRCs/watermarks, original first receipt, and original body. The captured admitted set lists the exact separately admitted families this projector can read, never a namespace wildcard. Changed projection rows and the inclusive global frontier advance atomically in one redb transaction under exact old-checkpoint CAS. Persist only SP-278's nine durable fields (DL-076); the actual live read supplies its own snapshot ID after helpers, never a stored `redb_snapshot_id`. Checkpoint source/root/generation/token/dataset, frame cursor, Project, stream, family/schema, publication, and examined-through bound must agree. Every failure quarantines or returns unavailable without partial advance. A filtered checkpoint cannot stand in for a complete global read. An empty prefix publishes no checkpoint until an actual examined frontier exists.

The operating reader verifies the current supported publication, complete prefix coverage through the requested event and actual final source/access boundaries after all helpers; an unrelated, withdrawn, incomplete, or stale-source publication is unavailable. Rebuild reads retained authentic originals in canonical order and changes only derived rows/checkpoint. It does not re-run source work, transforms, scheduler wakes, network calls, appends, Usage charges, or notifications. Historical readers verify original edition/recipe/custody and current permitted disclosure; a later live-state change does not invalidate valid retained history. Retained compatibility/replay-only inputs may rebuild only the same derived state after original verification.

**Retention, privacy and withdrawal.** `continuity.provenance_recorded` records source lineage for audit continuity, the exact source-lineage class in Case L-3: event body and original fact custody use `RP-AUTHORITY-INDEFINITE@1.0.0`, no age/count eviction; storage pressure fails closed. G05 is GitHub sign-in only and is not used. The rebuilt snapshot/checkpoint use existing `RP-PROJECTION-3GEN@1.0.0`: one current plus at most two retired publications, first withdrawal time anchors a retired publication, holds prevent cleanup, and a fourth waits for lawful retirement cleanup. Projection rows contain only current latest source refs; governed rebuild replaces the publication and removes rows it does not rewrite. Keep complete current/retired checkpoint cores together, including their original tokens, frontiers, source identities and holds; each retired core must have state=withdrawn, its once-set first withdrawal time, and a distinct publication ID. Ordinary advance preserves publication ID, first-withdrawal metadata and history. A fourth publication waits for lawful cleanup; never prune original canonical history to satisfy derived limits. References to source outputs, source checkpoints, redaction results and bodies have active-ref holds for as long as needed to authenticate this retained fact; they keep their own deletion/access rules and no linked content is retained or disclosed merely by this assignment. Storage owns originals in seglog/payload packs and SP-286 custody; mandatory coherent backup/restore includes their authentic source evidence, first receipts and retained recipe selectors. Missing originals return unavailable/data-loss disclosure, never a reconstructed valid answer. Current Project permission, principal visibility, redaction policy, tombstones, holds, backup, and deletion eligibility gate every read; opaque refs grant no access. Raw secrets, prompts, outputs, file content, credentials and local paths are refused before append.

Unknown versions are unavailable; no automatic `runtime_continuity.*`, route-object, file-mirror or memory-directory conversion is supplied. Current schema installation uses StorageMigrationCoordinator's actual graph; no invented store-version number. Withdrawal first cuts off this family's writers, then marks the affected publication withdrawn once and fences projector/readers. A new supported publication is rebuilt from authentic retained sources under the new declared admitted set and CAS-switched only after complete verification. No zero-cursor reset, backdated receipt, sibling fallback, canonical rewrite or source deletion follows. Historical access remains subject to the original admission and reader fences.

```yaml
plan_unit_id: SP-1601
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: NEWLY AUTHORED continuity.provenance_recorded@1.0.0 individually adopts CV-1601, SP-286/CV-339 v2
  full-value custody, SP-337 and SP-278. Exact append, audit reader, prefix checkpoint CAS, retention, coherent
  backup, retained-version and withdrawal rules are defined above. Source lineage uses RP-AUTHORITY-INDEFINITE;
  derived values use RP-PROJECTION-3GEN. Nothing is admitted.
gui_related: false
gui_classification_reason: Audit lineage, storage, and test contracts; no new presentation behavior.
depends_on:
- OSI-1601
- CV-1601
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- No accepted effect or success precedes exact admission, source verification and original full first receipt.
- Projection and complete source prefix advance atomically; read/replay has no external effect.
- Retention, custody, source access and withdrawal cover this exact family.
validation_surfaces:
- Plans/Automated_Testing_System.md#ATS-1281
- Plans/storage_value_registry.json
risk_class: continuity_source_custody_drift
reasoning_tier: high
context_scope: event_authority_w3i_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/continuity_event_contracts.schema.json
node_compile_hint:
  mode: prepared_without_admission
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-2 item 9.a A; answer i approve all of it; DL-450 on plans/ea-cards2-answers-20261105
- reports/event-authority-20261105/W3I.md#sp-1601
preserved_exact_tokens:
- continuity.provenance_recorded
- SP-278
- SP-286
- RP-AUTHORITY-INDEFINITE
- RP-PROJECTION-3GEN
negative_constraints:
- No event-family admission, native execution, registry append, or PNC-019 clearance.
- No runtime_continuity alias or receipt reconstructed from current state.
```

### SP-1602 — `continuity.redaction_applied` append, read, and custody

**NEWLY AUTHORED Storage owner contract** under DL-450, separately adopted for `continuity.redaction_applied@1.0.0`. Exact producer `orchestrator.continuity_redaction_applied.v1@1.0.0` calls `storage.continuity_append.v1@1.0.0`; direct consumer is `storage.continuity_projector.v1@1.0.0`. `reader.orchestrator.continuity_audit.v1@1.0.0` is the operating audit-only reader. No sibling event or `runtime_continuity.*` admission follows. The family uses ordinary CV-317 EventRecord append and Case L-2 / SP-026 / SP-236 canonical SeglogFrameV2 bytes, without a local codec.

**Producer ordering and retry.** First verify this family/version's actual registry admission, supported complete resource graph, current Project/source access and tombstones, original source fact and CV-1602 identity/body joins. An absent registry entry returns `missing_event_registration` with no append, projection, success receipt, buffering, or outbox. Under Storage's writer lock catch lifetime dedupe up to the verified tail or return `dedupe_unavailable`. For a genuinely new fact, validate/pack the body, then append; explicitly adopt SP-286/CV-339 full-value v2 first issuance via `storage.first_append_receipt.issue.v2`, and lost-ack resolution via `storage.first_append_receipt.resolve.v2`. The group's actual durability and issued original receipt precede any success/publication. Verify the full original EventRecord value, group, scope, body and all eleven receipt fields on every initial, retry, recovery and retained path; a caller receipt is insufficient. Unknown outcome fences the same source fact until resolved; never remint continuity/fact identity. Restored absence never proves never-issued; SP-286's actual accepted-operation and completed-restore gates remain required. No command/result authority is synthesized.

**Payload and values.** The exact stored event body is CV-1602's payload. Above 16 KiB encoded body bytes use SP-337's immutable BLAKE3 payload pack and exact `payload_ref`; forbid base64 wrapping or silent trimming. Recompute the pack ID/size/media-type/body relation from actual bytes. A returned pack ref cannot change the logical body or original semantic digest on retry; SP-337 supplies the fixed original route. Each stored part is measured, including the derived projection and checkpoint. A derived value exceeding 16 KiB is refused before its transaction, without trimming, partial advance or deleting held history. Derived projections store an exact immutable ref to the verified EventRecord body; they do not duplicate a large body. No canonical extra operation table is introduced.

**This family's projection and checkpoint.** The existing logical keys `continuity_record.v1:{project_id}:{continuity_id}` and `continuity_replay_checkpoint.v1:{project_id}:{stream_id}` use exact identity joins; key components are unambiguous length-framed UTF-8 under the table adapter, never parsed by splitting embedded colons. The first key holds only the complete latest snapshot pointer plus original event identity, canonical sequence and publication; `body_event_id=event_id` resolves the entire original continuity payload. The original Continuity Record Family fields remain the exact logical read view, including actor, provenance, redaction and creation time. They are not duplicated into a second authoritative body or aggregated from unrelated observations. This family's successful transition replaces that snapshot only when the new matching canonical sequence is greater, for the same actual Project/continuity/source stream, under exact prior-value CAS. Replay of the same event is a no-op; an older event cannot regress it. Actor, provenance, redaction and source-position facts still come from the original snapshot, never from another family's current row.

For `continuity.redaction_applied`, explicitly adopt SP-278 through `reader.storage.event_record_index@1.0.0`: one actual current derived-database snapshot resolves `checkpoints`, `event_record_index_checkpoint.v1:{storage_instance_id}`, its uniquely current generation, exact original row birth anchor and `event_record_index.v2@{generation_id}`. Scan a complete captured global prefix, including nonmatching records, filter by exact Project/stream and this family when admitted, and verify original frame bounds/CRCs/watermarks, original first receipt, and original body. The captured admitted set lists the exact separately admitted families this projector can read, never a namespace wildcard. Changed projection rows and the inclusive global frontier advance atomically in one redb transaction under exact old-checkpoint CAS. Persist only SP-278's nine durable fields (DL-076); the actual live read supplies its own snapshot ID after helpers, never a stored `redb_snapshot_id`. Checkpoint source/root/generation/token/dataset, frame cursor, Project, stream, family/schema, publication, and examined-through bound must agree. Every failure quarantines or returns unavailable without partial advance. A filtered checkpoint cannot stand in for a complete global read. An empty prefix publishes no checkpoint until an actual examined frontier exists.

The operating reader verifies the current supported publication, complete prefix coverage through the requested event and actual final source/access boundaries after all helpers; an unrelated, withdrawn, incomplete, or stale-source publication is unavailable. Rebuild reads retained authentic originals in canonical order and changes only derived rows/checkpoint. It does not re-run source work, transforms, scheduler wakes, network calls, appends, Usage charges, or notifications. Historical readers verify original edition/recipe/custody and current permitted disclosure; a later live-state change does not invalidate valid retained history. Retained compatibility/replay-only inputs may rebuild only the same derived state after original verification.

**Retention, privacy and withdrawal.** `continuity.redaction_applied` records source lineage for audit continuity, the exact source-lineage class in Case L-3: event body and original fact custody use `RP-AUTHORITY-INDEFINITE@1.0.0`, no age/count eviction; storage pressure fails closed. G05 is GitHub sign-in only and is not used. The rebuilt snapshot/checkpoint use existing `RP-PROJECTION-3GEN@1.0.0`: one current plus at most two retired publications, first withdrawal time anchors a retired publication, holds prevent cleanup, and a fourth waits for lawful retirement cleanup. Projection rows contain only current latest source refs; governed rebuild replaces the publication and removes rows it does not rewrite. Keep complete current/retired checkpoint cores together, including their original tokens, frontiers, source identities and holds; each retired core must have state=withdrawn, its once-set first withdrawal time, and a distinct publication ID. Ordinary advance preserves publication ID, first-withdrawal metadata and history. A fourth publication waits for lawful cleanup; never prune original canonical history to satisfy derived limits. References to source outputs, source checkpoints, redaction results and bodies have active-ref holds for as long as needed to authenticate this retained fact; they keep their own deletion/access rules and no linked content is retained or disclosed merely by this assignment. Storage owns originals in seglog/payload packs and SP-286 custody; mandatory coherent backup/restore includes their authentic source evidence, first receipts and retained recipe selectors. Missing originals return unavailable/data-loss disclosure, never a reconstructed valid answer. Current Project permission, principal visibility, redaction policy, tombstones, holds, backup, and deletion eligibility gate every read; opaque refs grant no access. Raw secrets, prompts, outputs, file content, credentials and local paths are refused before append.

Unknown versions are unavailable; no automatic `runtime_continuity.*`, route-object, file-mirror or memory-directory conversion is supplied. Current schema installation uses StorageMigrationCoordinator's actual graph; no invented store-version number. Withdrawal first cuts off this family's writers, then marks the affected publication withdrawn once and fences projector/readers. A new supported publication is rebuilt from authentic retained sources under the new declared admitted set and CAS-switched only after complete verification. No zero-cursor reset, backdated receipt, sibling fallback, canonical rewrite or source deletion follows. Historical access remains subject to the original admission and reader fences.

```yaml
plan_unit_id: SP-1602
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: NEWLY AUTHORED continuity.redaction_applied@1.0.0 individually adopts CV-1602, SP-286/CV-339 v2
  full-value custody, SP-337 and SP-278. Exact append, audit reader, prefix checkpoint CAS, retention, coherent
  backup, retained-version and withdrawal rules are defined above. Source lineage uses RP-AUTHORITY-INDEFINITE;
  derived values use RP-PROJECTION-3GEN. Nothing is admitted.
gui_related: false
gui_classification_reason: Audit lineage, storage, and test contracts; no new presentation behavior.
depends_on:
- OSI-1602
- CV-1602
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- No accepted effect or success precedes exact admission, source verification and original full first receipt.
- Projection and complete source prefix advance atomically; read/replay has no external effect.
- Retention, custody, source access and withdrawal cover this exact family.
validation_surfaces:
- Plans/Automated_Testing_System.md#ATS-1282
- Plans/storage_value_registry.json
risk_class: continuity_source_custody_drift
reasoning_tier: high
context_scope: event_authority_w3i_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/continuity_event_contracts.schema.json
node_compile_hint:
  mode: prepared_without_admission
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-2 item 9.a A; answer i approve all of it; DL-450 on plans/ea-cards2-answers-20261105
- reports/event-authority-20261105/W3I.md#sp-1602
preserved_exact_tokens:
- continuity.redaction_applied
- SP-278
- SP-286
- RP-AUTHORITY-INDEFINITE
- RP-PROJECTION-3GEN
negative_constraints:
- No event-family admission, native execution, registry append, or PNC-019 clearance.
- No runtime_continuity alias or receipt reconstructed from current state.
```

### SP-1603 — `continuity.replay_checkpointed` append, read, and custody

**NEWLY AUTHORED Storage owner contract** under DL-450, separately adopted for `continuity.replay_checkpointed@1.0.0`. Exact producer `orchestrator.continuity_replay_checkpointed.v1@1.0.0` calls `storage.continuity_append.v1@1.0.0`; direct consumer is `storage.continuity_projector.v1@1.0.0`. `reader.orchestrator.continuity_audit.v1@1.0.0` is the operating audit-only reader. No sibling event or `runtime_continuity.*` admission follows. The family uses ordinary CV-317 EventRecord append and Case L-2 / SP-026 / SP-236 canonical SeglogFrameV2 bytes, without a local codec.

**Producer ordering and retry.** First verify this family/version's actual registry admission, supported complete resource graph, current Project/source access and tombstones, original source fact and CV-1603 identity/body joins. An absent registry entry returns `missing_event_registration` with no append, projection, success receipt, buffering, or outbox. Under Storage's writer lock catch lifetime dedupe up to the verified tail or return `dedupe_unavailable`. For a genuinely new fact, validate/pack the body, then append; explicitly adopt SP-286/CV-339 full-value v2 first issuance via `storage.first_append_receipt.issue.v2`, and lost-ack resolution via `storage.first_append_receipt.resolve.v2`. The group's actual durability and issued original receipt precede any success/publication. Verify the full original EventRecord value, group, scope, body and all eleven receipt fields on every initial, retry, recovery and retained path; a caller receipt is insufficient. Unknown outcome fences the same source fact until resolved; never remint continuity/fact identity. Restored absence never proves never-issued; SP-286's actual accepted-operation and completed-restore gates remain required. No command/result authority is synthesized.

**Payload and values.** The exact stored event body is CV-1603's payload. Above 16 KiB encoded body bytes use SP-337's immutable BLAKE3 payload pack and exact `payload_ref`; forbid base64 wrapping or silent trimming. Recompute the pack ID/size/media-type/body relation from actual bytes. A returned pack ref cannot change the logical body or original semantic digest on retry; SP-337 supplies the fixed original route. Each stored part is measured, including the derived projection and checkpoint. A derived value exceeding 16 KiB is refused before its transaction, without trimming, partial advance or deleting held history. Derived projections store an exact immutable ref to the verified EventRecord body; they do not duplicate a large body. No canonical extra operation table is introduced.

**This family's projection and checkpoint.** The existing logical keys `continuity_record.v1:{project_id}:{continuity_id}` and `continuity_replay_checkpoint.v1:{project_id}:{stream_id}` use exact identity joins; key components are unambiguous length-framed UTF-8 under the table adapter, never parsed by splitting embedded colons. The first key holds only the complete latest snapshot pointer plus original event identity, canonical sequence and publication; `body_event_id=event_id` resolves the entire original continuity payload. The original Continuity Record Family fields remain the exact logical read view, including actor, provenance, redaction and creation time. They are not duplicated into a second authoritative body or aggregated from unrelated observations. This family's successful transition replaces that snapshot only when the new matching canonical sequence is greater, for the same actual Project/continuity/source stream, under exact prior-value CAS. Replay of the same event is a no-op; an older event cannot regress it. Actor, provenance, redaction and source-position facts still come from the original snapshot, never from another family's current row.

For `continuity.replay_checkpointed`, explicitly adopt SP-278 through `reader.storage.event_record_index@1.0.0`: one actual current derived-database snapshot resolves `checkpoints`, `event_record_index_checkpoint.v1:{storage_instance_id}`, its uniquely current generation, exact original row birth anchor and `event_record_index.v2@{generation_id}`. Scan a complete captured global prefix, including nonmatching records, filter by exact Project/stream and this family when admitted, and verify original frame bounds/CRCs/watermarks, original first receipt, and original body. The captured admitted set lists the exact separately admitted families this projector can read, never a namespace wildcard. Changed projection rows and the inclusive global frontier advance atomically in one redb transaction under exact old-checkpoint CAS. Persist only SP-278's nine durable fields (DL-076); the actual live read supplies its own snapshot ID after helpers, never a stored `redb_snapshot_id`. Checkpoint source/root/generation/token/dataset, frame cursor, Project, stream, family/schema, publication, and examined-through bound must agree. Every failure quarantines or returns unavailable without partial advance. A filtered checkpoint cannot stand in for a complete global read. An empty prefix publishes no checkpoint until an actual examined frontier exists.

The operating reader verifies the current supported publication, complete prefix coverage through the requested event and actual final source/access boundaries after all helpers; an unrelated, withdrawn, incomplete, or stale-source publication is unavailable. Rebuild reads retained authentic originals in canonical order and changes only derived rows/checkpoint. It does not re-run source work, transforms, scheduler wakes, network calls, appends, Usage charges, or notifications. Historical readers verify original edition/recipe/custody and current permitted disclosure; a later live-state change does not invalidate valid retained history. Retained compatibility/replay-only inputs may rebuild only the same derived state after original verification.

**Retention, privacy and withdrawal.** `continuity.replay_checkpointed` records source lineage for audit continuity, the exact source-lineage class in Case L-3: event body and original fact custody use `RP-AUTHORITY-INDEFINITE@1.0.0`, no age/count eviction; storage pressure fails closed. G05 is GitHub sign-in only and is not used. The rebuilt snapshot/checkpoint use existing `RP-PROJECTION-3GEN@1.0.0`: one current plus at most two retired publications, first withdrawal time anchors a retired publication, holds prevent cleanup, and a fourth waits for lawful retirement cleanup. Projection rows contain only current latest source refs; governed rebuild replaces the publication and removes rows it does not rewrite. Keep complete current/retired checkpoint cores together, including their original tokens, frontiers, source identities and holds; each retired core must have state=withdrawn, its once-set first withdrawal time, and a distinct publication ID. Ordinary advance preserves publication ID, first-withdrawal metadata and history. A fourth publication waits for lawful cleanup; never prune original canonical history to satisfy derived limits. References to source outputs, source checkpoints, redaction results and bodies have active-ref holds for as long as needed to authenticate this retained fact; they keep their own deletion/access rules and no linked content is retained or disclosed merely by this assignment. Storage owns originals in seglog/payload packs and SP-286 custody; mandatory coherent backup/restore includes their authentic source evidence, first receipts and retained recipe selectors. Missing originals return unavailable/data-loss disclosure, never a reconstructed valid answer. Current Project permission, principal visibility, redaction policy, tombstones, holds, backup, and deletion eligibility gate every read; opaque refs grant no access. Raw secrets, prompts, outputs, file content, credentials and local paths are refused before append.

Unknown versions are unavailable; no automatic `runtime_continuity.*`, route-object, file-mirror or memory-directory conversion is supplied. Current schema installation uses StorageMigrationCoordinator's actual graph; no invented store-version number. Withdrawal first cuts off this family's writers, then marks the affected publication withdrawn once and fences projector/readers. A new supported publication is rebuilt from authentic retained sources under the new declared admitted set and CAS-switched only after complete verification. No zero-cursor reset, backdated receipt, sibling fallback, canonical rewrite or source deletion follows. Historical access remains subject to the original admission and reader fences.

```yaml
plan_unit_id: SP-1603
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: NEWLY AUTHORED continuity.replay_checkpointed@1.0.0 individually adopts CV-1603, SP-286/CV-339 v2
  full-value custody, SP-337 and SP-278. Exact append, audit reader, prefix checkpoint CAS, retention, coherent
  backup, retained-version and withdrawal rules are defined above. Source lineage uses RP-AUTHORITY-INDEFINITE;
  derived values use RP-PROJECTION-3GEN. Nothing is admitted.
gui_related: false
gui_classification_reason: Audit lineage, storage, and test contracts; no new presentation behavior.
depends_on:
- OSI-1603
- CV-1603
- SP-278
- SP-286
- SP-337
unblocks: []
acceptance_criteria:
- No accepted effect or success precedes exact admission, source verification and original full first receipt.
- Projection and complete source prefix advance atomically; read/replay has no external effect.
- Retention, custody, source access and withdrawal cover this exact family.
validation_surfaces:
- Plans/Automated_Testing_System.md#ATS-1283
- Plans/storage_value_registry.json
risk_class: continuity_source_custody_drift
reasoning_tier: high
context_scope: event_authority_w3i_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/continuity_event_contracts.schema.json
node_compile_hint:
  mode: prepared_without_admission
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- E-CARDS-2 item 9.a A; answer i approve all of it; DL-450 on plans/ea-cards2-answers-20261105
- reports/event-authority-20261105/W3I.md#sp-1603
preserved_exact_tokens:
- continuity.replay_checkpointed
- SP-278
- SP-286
- RP-AUTHORITY-INDEFINITE
- RP-PROJECTION-3GEN
negative_constraints:
- No event-family admission, native execution, registry append, or PNC-019 clearance.
- No runtime_continuity alias or receipt reconstructed from current state.
```


### SP-1350 - bsd.advice_emitted candidate Storage custody

```yaml
plan_unit_id: SP-1350
unit_type: event_contract
status: draft
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract for bsd.advice_emitted, prepared without admission. SP-318's physical_family_registration_pending and handler_unavailable remain in force. SP-1365 separately stages the exact original lifecycle-source wrappers. The candidate rows in Plans/bsd_event_storage_candidates.json for bsd_advice_emitted_operation, bsd_advice_emitted_projection and bsd_advice_emitted_checkpoint are reviewable proposed values, not appended registry families, storage admission, a budget decision or a readiness-denominator change. An integrator must separately admit exact physical families/migration/budgets after review; no event can be made writable by these candidate rows alone. Each value uses its exact closed Plans/bsd_event_storage_contracts.schema.json definition.
  The canonical operation key is bsd_advice_emitted_operation.v1:{scope_partition}:{hex(owner_operation_id)}; state pending_event carries the original authenticated source, event ID, key, semantic digest and durable SP-337 payload reference. state complete additionally requires the exact original first AppendReceipt. It never stores a second EventRecord or copied private body. Operation refs and their packs remain while original pending/result/receipt custody is needed, under RP-EVENT-IDENTITY-APPROOT; that lifetime protects identity and an immutable receipt, not linked content. It adopts SP-286/CV-339 first receipt/full-value v2 and SP-336/SP-347 durability explicitly. Coherent mandatory backup restores the operation, complete original source, receipt controls and payload packs together. Missing original is unavailable; it cannot be reconstructed from a GUI model or a supplied hash.
  The derived projection key is bsd_advice_emitted_projection.v1:{scope_partition}:{hex(owner_operation_id)}. It holds only the original source/event refs and Storage identities. The derived checkpoint key is bsd_advice_emitted_checkpoint.v1:{scope_partition}:{storage_instance_id} for projector.bsd.advice_emitted@1.0.0. Both use RP-PROJECTION-3GEN with holds; source event retention is independently {"registry_schema_id": "pm.storage_value_registry.v2", "policy_id": "RP-RUNTIME-365D", "policy_version": "1.0.0"}. A pending retention marker is never a valid production registry reference. Every complete encoded value must stay at or below 16 KiB; SP-337 externalizes referenced bodies before limits, rather than leaving an oversized operation value. Canonical/derived placement and actual disk budgets require existing SP-340 admission, never unbounded storage.
  The exact operational reader is reader.bsd.advice_emitted@1.0.0 for AssistantChat::bsd_advisor_note. It explicitly adopts SP-278 reader.storage.event_record_index@1.0.0, its CURRENT-selected actual root, globally complete verified source selection/coverage, authenticated generation anchor and advancing frontier. It scans in ascending Storage sequence, never timestamp order; the examined cursor cannot regress. It scans the complete captured range with exactly the bsd.advice_emitted/Project/version filter, resolves full values/payload refs, verifies actual storage_instance_id, partition, sequence/event/payload/source joins and original full-value custody before processing a match. Verified nonmatches are scanned; corruption, unsupported input or missing proof is unavailable/degraded, never skipped as empty. Apply the immutable event reference to only its rebuildable derived row. In one actual redb transaction compare-and-swap the entire old checkpoint and atomically commit all changed rows with last_scanned_sequence, last_matched_event_id, source selection and the nine-field durable read token. An empty source has a null cursor; a nonempty zero-match range still advances its examined cursor. Each durable token field is rejoined to actual Storage controls, then the current live snapshot supplies its transient tenth redb_snapshot_id field. Same generation alone cannot prove a frontier unchanged. Inclusive restart rechecks the last exact event/frame/offset; replay produces no review, advice delivery, notification, Usage charge, canonical write or new event.
  Historical inspection validates authenticated original admission/schema/recipe and source custody before the retained event, but never reruns current live-epoch/state/precondition checks. Current access, deletion and withdrawal checks still apply. Genuine older history after a live change stays readable; substituted or withdrawn originals refuse. Schema/version selection cannot be caller-chosen to weaken validation. Complete withdrawal fences writer admission at the actual cutoff, resolves pending issued results, invalidates reader/checkpoint publications and requires governed successor rebuild; missing source is explicitly unavailable, not a rebuilt success. Physical replay/restore/migration remains unimplemented and unadmitted.
gui_related: false
gui_classification_reason: Defines internal event, identity, Storage custody or validation, without changing presentation.
depends_on:
- SP-318
- SP-278
- SP-286
- SP-337
- CV-1350
unblocks: []
acceptance_criteria:
- Exact family semantics, payload, original-source identity and retry custody are bound.
- No unregistered append, physical admission or native/runtime success is implied.
- Phase-2 oracle and shared guard-isolation proof remain mandatory before review/admission.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
- Plans/bsd_event_oracle_plan.json
risk_class: advisory_history_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3d_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/bsd_event_payloads.schema.json
- Plans/bsd_event_storage_contracts.schema.json
- Plans/bsd_event_storage_candidates.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3D.md
- Deck-2 item 9.a A (answer record 2026-11-05; DL-450 application pending)
preserved_exact_tokens:
- bsd.advice_emitted
- SP-318
- SP-278
- SP-286
- SP-337
- RP-EVENT-IDENTITY-APPROOT
- RP-PROJECTION-3GEN
negative_constraints:
- Do not append a registry family, admit an event, enable BSD commands or treat static definitions as runtime evidence.
- Do not define a local number/timestamp implementation or guard-isolation proof engine.
owner_hints:
- Plans/storage-plan.md
```


### SP-1351 - bsd.assignment_paused candidate Storage custody

```yaml
plan_unit_id: SP-1351
unit_type: event_contract
status: draft
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract for bsd.assignment_paused, prepared without admission. SP-318's physical_family_registration_pending and handler_unavailable remain in force. SP-1365 separately stages the exact original lifecycle-source wrappers. The candidate rows in Plans/bsd_event_storage_candidates.json for bsd_assignment_paused_operation, bsd_assignment_paused_projection and bsd_assignment_paused_checkpoint are reviewable proposed values, not appended registry families, storage admission, a budget decision or a readiness-denominator change. An integrator must separately admit exact physical families/migration/budgets after review; no event can be made writable by these candidate rows alone. Each value uses its exact closed Plans/bsd_event_storage_contracts.schema.json definition.
  The canonical operation key is bsd_assignment_paused_operation.v1:{scope_partition}:{hex(owner_operation_id)}; state pending_event carries the original authenticated source, event ID, key, semantic digest and durable SP-337 payload reference. state complete additionally requires the exact original first AppendReceipt. It never stores a second EventRecord or copied private body. Operation refs and their packs remain while original pending/result/receipt custody is needed, under RP-EVENT-IDENTITY-APPROOT; that lifetime protects identity and an immutable receipt, not linked content. It adopts SP-286/CV-339 first receipt/full-value v2 and SP-336/SP-347 durability explicitly. Coherent mandatory backup restores the operation, complete original source, receipt controls and payload packs together. Missing original is unavailable; it cannot be reconstructed from a GUI model or a supplied hash.
  The derived projection key is bsd_assignment_paused_projection.v1:{scope_partition}:{hex(owner_operation_id)}. It holds only the original source/event refs and Storage identities. The derived checkpoint key is bsd_assignment_paused_checkpoint.v1:{scope_partition}:{storage_instance_id} for projector.bsd.assignment_paused@1.0.0. Both use RP-PROJECTION-3GEN with holds; source event retention is independently {"registry_schema_id": "pm.storage_value_registry.v2", "policy_id": "RP-RUNTIME-365D", "policy_version": "1.0.0"}. A pending retention marker is never a valid production registry reference. Every complete encoded value must stay at or below 16 KiB; SP-337 externalizes referenced bodies before limits, rather than leaving an oversized operation value. Canonical/derived placement and actual disk budgets require existing SP-340 admission, never unbounded storage.
  The exact operational reader is reader.bsd.assignment_paused@1.0.0 for AssistantContext::bsd_pause_projection. It explicitly adopts SP-278 reader.storage.event_record_index@1.0.0, its CURRENT-selected actual root, globally complete verified source selection/coverage, authenticated generation anchor and advancing frontier. It scans in ascending Storage sequence, never timestamp order; the examined cursor cannot regress. It scans the complete captured range with exactly the bsd.assignment_paused/Project/version filter, resolves full values/payload refs, verifies actual storage_instance_id, partition, sequence/event/payload/source joins and original full-value custody before processing a match. Verified nonmatches are scanned; corruption, unsupported input or missing proof is unavailable/degraded, never skipped as empty. Apply the immutable event reference to only its rebuildable derived row. In one actual redb transaction compare-and-swap the entire old checkpoint and atomically commit all changed rows with last_scanned_sequence, last_matched_event_id, source selection and the nine-field durable read token. An empty source has a null cursor; a nonempty zero-match range still advances its examined cursor. Each durable token field is rejoined to actual Storage controls, then the current live snapshot supplies its transient tenth redb_snapshot_id field. Same generation alone cannot prove a frontier unchanged. Inclusive restart rechecks the last exact event/frame/offset; replay produces no review, advice delivery, notification, Usage charge, canonical write or new event.
  Historical inspection validates authenticated original admission/schema/recipe and source custody before the retained event, but never reruns current live-epoch/state/precondition checks. Current access, deletion and withdrawal checks still apply. Genuine older history after a live change stays readable; substituted or withdrawn originals refuse. Schema/version selection cannot be caller-chosen to weaken validation. Complete withdrawal fences writer admission at the actual cutoff, resolves pending issued results, invalidates reader/checkpoint publications and requires governed successor rebuild; missing source is explicitly unavailable, not a rebuilt success. Physical replay/restore/migration remains unimplemented and unadmitted.
gui_related: false
gui_classification_reason: Defines internal event, identity, Storage custody or validation, without changing presentation.
depends_on:
- SP-318
- SP-278
- SP-286
- SP-337
- CV-1351
unblocks: []
acceptance_criteria:
- Exact family semantics, payload, original-source identity and retry custody are bound.
- No unregistered append, physical admission or native/runtime success is implied.
- Phase-2 oracle and shared guard-isolation proof remain mandatory before review/admission.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
- Plans/bsd_event_oracle_plan.json
risk_class: advisory_history_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3d_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/bsd_event_payloads.schema.json
- Plans/bsd_event_storage_contracts.schema.json
- Plans/bsd_event_storage_candidates.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3D.md
- Deck-2 item 9.a A (answer record 2026-11-05; DL-450 application pending)
preserved_exact_tokens:
- bsd.assignment_paused
- SP-318
- SP-278
- SP-286
- SP-337
- RP-EVENT-IDENTITY-APPROOT
- RP-PROJECTION-3GEN
negative_constraints:
- Do not append a registry family, admit an event, enable BSD commands or treat static definitions as runtime evidence.
- Do not define a local number/timestamp implementation or guard-isolation proof engine.
owner_hints:
- Plans/storage-plan.md
```


### SP-1352 - bsd.assignment_resumed candidate Storage custody

```yaml
plan_unit_id: SP-1352
unit_type: event_contract
status: draft
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract for bsd.assignment_resumed, prepared without admission. SP-318's physical_family_registration_pending and handler_unavailable remain in force. SP-1365 separately stages the exact original lifecycle-source wrappers. The candidate rows in Plans/bsd_event_storage_candidates.json for bsd_assignment_resumed_operation, bsd_assignment_resumed_projection and bsd_assignment_resumed_checkpoint are reviewable proposed values, not appended registry families, storage admission, a budget decision or a readiness-denominator change. An integrator must separately admit exact physical families/migration/budgets after review; no event can be made writable by these candidate rows alone. Each value uses its exact closed Plans/bsd_event_storage_contracts.schema.json definition.
  The canonical operation key is bsd_assignment_resumed_operation.v1:{scope_partition}:{hex(owner_operation_id)}; state pending_event carries the original authenticated source, event ID, key, semantic digest and durable SP-337 payload reference. state complete additionally requires the exact original first AppendReceipt. It never stores a second EventRecord or copied private body. Operation refs and their packs remain while original pending/result/receipt custody is needed, under RP-EVENT-IDENTITY-APPROOT; that lifetime protects identity and an immutable receipt, not linked content. It adopts SP-286/CV-339 first receipt/full-value v2 and SP-336/SP-347 durability explicitly. Coherent mandatory backup restores the operation, complete original source, receipt controls and payload packs together. Missing original is unavailable; it cannot be reconstructed from a GUI model or a supplied hash.
  The derived projection key is bsd_assignment_resumed_projection.v1:{scope_partition}:{hex(owner_operation_id)}. It holds only the original source/event refs and Storage identities. The derived checkpoint key is bsd_assignment_resumed_checkpoint.v1:{scope_partition}:{storage_instance_id} for projector.bsd.assignment_resumed@1.0.0. Both use RP-PROJECTION-3GEN with holds; source event retention is independently {"registry_schema_id": "pm.storage_value_registry.v2", "policy_id": "RP-RUNTIME-365D", "policy_version": "1.0.0"}. A pending retention marker is never a valid production registry reference. Every complete encoded value must stay at or below 16 KiB; SP-337 externalizes referenced bodies before limits, rather than leaving an oversized operation value. Canonical/derived placement and actual disk budgets require existing SP-340 admission, never unbounded storage.
  The exact operational reader is reader.bsd.assignment_resumed@1.0.0 for AssistantContext::bsd_resume_projection. It explicitly adopts SP-278 reader.storage.event_record_index@1.0.0, its CURRENT-selected actual root, globally complete verified source selection/coverage, authenticated generation anchor and advancing frontier. It scans in ascending Storage sequence, never timestamp order; the examined cursor cannot regress. It scans the complete captured range with exactly the bsd.assignment_resumed/Project/version filter, resolves full values/payload refs, verifies actual storage_instance_id, partition, sequence/event/payload/source joins and original full-value custody before processing a match. Verified nonmatches are scanned; corruption, unsupported input or missing proof is unavailable/degraded, never skipped as empty. Apply the immutable event reference to only its rebuildable derived row. In one actual redb transaction compare-and-swap the entire old checkpoint and atomically commit all changed rows with last_scanned_sequence, last_matched_event_id, source selection and the nine-field durable read token. An empty source has a null cursor; a nonempty zero-match range still advances its examined cursor. Each durable token field is rejoined to actual Storage controls, then the current live snapshot supplies its transient tenth redb_snapshot_id field. Same generation alone cannot prove a frontier unchanged. Inclusive restart rechecks the last exact event/frame/offset; replay produces no review, advice delivery, notification, Usage charge, canonical write or new event.
  Historical inspection validates authenticated original admission/schema/recipe and source custody before the retained event, but never reruns current live-epoch/state/precondition checks. Current access, deletion and withdrawal checks still apply. Genuine older history after a live change stays readable; substituted or withdrawn originals refuse. Schema/version selection cannot be caller-chosen to weaken validation. Complete withdrawal fences writer admission at the actual cutoff, resolves pending issued results, invalidates reader/checkpoint publications and requires governed successor rebuild; missing source is explicitly unavailable, not a rebuilt success. Physical replay/restore/migration remains unimplemented and unadmitted.
gui_related: false
gui_classification_reason: Defines internal event, identity, Storage custody or validation, without changing presentation.
depends_on:
- SP-318
- SP-278
- SP-286
- SP-337
- CV-1352
unblocks: []
acceptance_criteria:
- Exact family semantics, payload, original-source identity and retry custody are bound.
- No unregistered append, physical admission or native/runtime success is implied.
- Phase-2 oracle and shared guard-isolation proof remain mandatory before review/admission.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
- Plans/bsd_event_oracle_plan.json
risk_class: advisory_history_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3d_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/bsd_event_payloads.schema.json
- Plans/bsd_event_storage_contracts.schema.json
- Plans/bsd_event_storage_candidates.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3D.md
- Deck-2 item 9.a A (answer record 2026-11-05; DL-450 application pending)
preserved_exact_tokens:
- bsd.assignment_resumed
- SP-318
- SP-278
- SP-286
- SP-337
- RP-EVENT-IDENTITY-APPROOT
- RP-PROJECTION-3GEN
negative_constraints:
- Do not append a registry family, admit an event, enable BSD commands or treat static definitions as runtime evidence.
- Do not define a local number/timestamp implementation or guard-isolation proof engine.
owner_hints:
- Plans/storage-plan.md
```


### SP-1353 - bsd.assignment_started candidate Storage custody

```yaml
plan_unit_id: SP-1353
unit_type: event_contract
status: draft
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract for bsd.assignment_started, prepared without admission. SP-318's physical_family_registration_pending and handler_unavailable remain in force. SP-1365 separately stages the exact original lifecycle-source wrappers. The candidate rows in Plans/bsd_event_storage_candidates.json for bsd_assignment_started_operation, bsd_assignment_started_projection and bsd_assignment_started_checkpoint are reviewable proposed values, not appended registry families, storage admission, a budget decision or a readiness-denominator change. An integrator must separately admit exact physical families/migration/budgets after review; no event can be made writable by these candidate rows alone. Each value uses its exact closed Plans/bsd_event_storage_contracts.schema.json definition.
  The canonical operation key is bsd_assignment_started_operation.v1:{scope_partition}:{hex(owner_operation_id)}; state pending_event carries the original authenticated source, event ID, key, semantic digest and durable SP-337 payload reference. state complete additionally requires the exact original first AppendReceipt. It never stores a second EventRecord or copied private body. Operation refs and their packs remain while original pending/result/receipt custody is needed, under RP-EVENT-IDENTITY-APPROOT; that lifetime protects identity and an immutable receipt, not linked content. It adopts SP-286/CV-339 first receipt/full-value v2 and SP-336/SP-347 durability explicitly. Coherent mandatory backup restores the operation, complete original source, receipt controls and payload packs together. Missing original is unavailable; it cannot be reconstructed from a GUI model or a supplied hash.
  The derived projection key is bsd_assignment_started_projection.v1:{scope_partition}:{hex(owner_operation_id)}. It holds only the original source/event refs and Storage identities. The derived checkpoint key is bsd_assignment_started_checkpoint.v1:{scope_partition}:{storage_instance_id} for projector.bsd.assignment_started@1.0.0. Both use RP-PROJECTION-3GEN with holds; source event retention is independently {"registry_schema_id": "pm.storage_value_registry.v2", "policy_id": "RP-RUNTIME-365D", "policy_version": "1.0.0"}. A pending retention marker is never a valid production registry reference. Every complete encoded value must stay at or below 16 KiB; SP-337 externalizes referenced bodies before limits, rather than leaving an oversized operation value. Canonical/derived placement and actual disk budgets require existing SP-340 admission, never unbounded storage.
  The exact operational reader is reader.bsd.assignment_started@1.0.0 for AssistantContext::bsd_assignment_projection. It explicitly adopts SP-278 reader.storage.event_record_index@1.0.0, its CURRENT-selected actual root, globally complete verified source selection/coverage, authenticated generation anchor and advancing frontier. It scans in ascending Storage sequence, never timestamp order; the examined cursor cannot regress. It scans the complete captured range with exactly the bsd.assignment_started/Project/version filter, resolves full values/payload refs, verifies actual storage_instance_id, partition, sequence/event/payload/source joins and original full-value custody before processing a match. Verified nonmatches are scanned; corruption, unsupported input or missing proof is unavailable/degraded, never skipped as empty. Apply the immutable event reference to only its rebuildable derived row. In one actual redb transaction compare-and-swap the entire old checkpoint and atomically commit all changed rows with last_scanned_sequence, last_matched_event_id, source selection and the nine-field durable read token. An empty source has a null cursor; a nonempty zero-match range still advances its examined cursor. Each durable token field is rejoined to actual Storage controls, then the current live snapshot supplies its transient tenth redb_snapshot_id field. Same generation alone cannot prove a frontier unchanged. Inclusive restart rechecks the last exact event/frame/offset; replay produces no review, advice delivery, notification, Usage charge, canonical write or new event.
  Historical inspection validates authenticated original admission/schema/recipe and source custody before the retained event, but never reruns current live-epoch/state/precondition checks. Current access, deletion and withdrawal checks still apply. Genuine older history after a live change stays readable; substituted or withdrawn originals refuse. Schema/version selection cannot be caller-chosen to weaken validation. Complete withdrawal fences writer admission at the actual cutoff, resolves pending issued results, invalidates reader/checkpoint publications and requires governed successor rebuild; missing source is explicitly unavailable, not a rebuilt success. Physical replay/restore/migration remains unimplemented and unadmitted.
gui_related: false
gui_classification_reason: Defines internal event, identity, Storage custody or validation, without changing presentation.
depends_on:
- SP-318
- SP-278
- SP-286
- SP-337
- CV-1353
unblocks: []
acceptance_criteria:
- Exact family semantics, payload, original-source identity and retry custody are bound.
- No unregistered append, physical admission or native/runtime success is implied.
- Phase-2 oracle and shared guard-isolation proof remain mandatory before review/admission.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
- Plans/bsd_event_oracle_plan.json
risk_class: advisory_history_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3d_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/bsd_event_payloads.schema.json
- Plans/bsd_event_storage_contracts.schema.json
- Plans/bsd_event_storage_candidates.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3D.md
- Deck-2 item 9.a A (answer record 2026-11-05; DL-450 application pending)
preserved_exact_tokens:
- bsd.assignment_started
- SP-318
- SP-278
- SP-286
- SP-337
- RP-EVENT-IDENTITY-APPROOT
- RP-PROJECTION-3GEN
negative_constraints:
- Do not append a registry family, admit an event, enable BSD commands or treat static definitions as runtime evidence.
- Do not define a local number/timestamp implementation or guard-isolation proof engine.
owner_hints:
- Plans/storage-plan.md
```


### SP-1354 - bsd.assignment_stopped candidate Storage custody

```yaml
plan_unit_id: SP-1354
unit_type: event_contract
status: draft
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract for bsd.assignment_stopped, prepared without admission. SP-318's physical_family_registration_pending and handler_unavailable remain in force. SP-1365 separately stages the exact original lifecycle-source wrappers. The candidate rows in Plans/bsd_event_storage_candidates.json for bsd_assignment_stopped_operation, bsd_assignment_stopped_projection and bsd_assignment_stopped_checkpoint are reviewable proposed values, not appended registry families, storage admission, a budget decision or a readiness-denominator change. An integrator must separately admit exact physical families/migration/budgets after review; no event can be made writable by these candidate rows alone. Each value uses its exact closed Plans/bsd_event_storage_contracts.schema.json definition.
  The canonical operation key is bsd_assignment_stopped_operation.v1:{scope_partition}:{hex(owner_operation_id)}; state pending_event carries the original authenticated source, event ID, key, semantic digest and durable SP-337 payload reference. state complete additionally requires the exact original first AppendReceipt. It never stores a second EventRecord or copied private body. Operation refs and their packs remain while original pending/result/receipt custody is needed, under RP-EVENT-IDENTITY-APPROOT; that lifetime protects identity and an immutable receipt, not linked content. It adopts SP-286/CV-339 first receipt/full-value v2 and SP-336/SP-347 durability explicitly. Coherent mandatory backup restores the operation, complete original source, receipt controls and payload packs together. Missing original is unavailable; it cannot be reconstructed from a GUI model or a supplied hash.
  The derived projection key is bsd_assignment_stopped_projection.v1:{scope_partition}:{hex(owner_operation_id)}. It holds only the original source/event refs and Storage identities. The derived checkpoint key is bsd_assignment_stopped_checkpoint.v1:{scope_partition}:{storage_instance_id} for projector.bsd.assignment_stopped@1.0.0. Both use RP-PROJECTION-3GEN with holds; source event retention is independently {"registry_schema_id": "pm.storage_value_registry.v2", "policy_id": "RP-RUNTIME-365D", "policy_version": "1.0.0"}. A pending retention marker is never a valid production registry reference. Every complete encoded value must stay at or below 16 KiB; SP-337 externalizes referenced bodies before limits, rather than leaving an oversized operation value. Canonical/derived placement and actual disk budgets require existing SP-340 admission, never unbounded storage.
  The exact operational reader is reader.bsd.assignment_stopped@1.0.0 for AssistantContext::bsd_stopped_projection. It explicitly adopts SP-278 reader.storage.event_record_index@1.0.0, its CURRENT-selected actual root, globally complete verified source selection/coverage, authenticated generation anchor and advancing frontier. It scans in ascending Storage sequence, never timestamp order; the examined cursor cannot regress. It scans the complete captured range with exactly the bsd.assignment_stopped/Project/version filter, resolves full values/payload refs, verifies actual storage_instance_id, partition, sequence/event/payload/source joins and original full-value custody before processing a match. Verified nonmatches are scanned; corruption, unsupported input or missing proof is unavailable/degraded, never skipped as empty. Apply the immutable event reference to only its rebuildable derived row. In one actual redb transaction compare-and-swap the entire old checkpoint and atomically commit all changed rows with last_scanned_sequence, last_matched_event_id, source selection and the nine-field durable read token. An empty source has a null cursor; a nonempty zero-match range still advances its examined cursor. Each durable token field is rejoined to actual Storage controls, then the current live snapshot supplies its transient tenth redb_snapshot_id field. Same generation alone cannot prove a frontier unchanged. Inclusive restart rechecks the last exact event/frame/offset; replay produces no review, advice delivery, notification, Usage charge, canonical write or new event.
  Historical inspection validates authenticated original admission/schema/recipe and source custody before the retained event, but never reruns current live-epoch/state/precondition checks. Current access, deletion and withdrawal checks still apply. Genuine older history after a live change stays readable; substituted or withdrawn originals refuse. Schema/version selection cannot be caller-chosen to weaken validation. Complete withdrawal fences writer admission at the actual cutoff, resolves pending issued results, invalidates reader/checkpoint publications and requires governed successor rebuild; missing source is explicitly unavailable, not a rebuilt success. Physical replay/restore/migration remains unimplemented and unadmitted.
gui_related: false
gui_classification_reason: Defines internal event, identity, Storage custody or validation, without changing presentation.
depends_on:
- SP-318
- SP-278
- SP-286
- SP-337
- CV-1354
unblocks: []
acceptance_criteria:
- Exact family semantics, payload, original-source identity and retry custody are bound.
- No unregistered append, physical admission or native/runtime success is implied.
- Phase-2 oracle and shared guard-isolation proof remain mandatory before review/admission.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
- Plans/bsd_event_oracle_plan.json
risk_class: advisory_history_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3d_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/bsd_event_payloads.schema.json
- Plans/bsd_event_storage_contracts.schema.json
- Plans/bsd_event_storage_candidates.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3D.md
- Deck-2 item 9.a A (answer record 2026-11-05; DL-450 application pending)
preserved_exact_tokens:
- bsd.assignment_stopped
- SP-318
- SP-278
- SP-286
- SP-337
- RP-EVENT-IDENTITY-APPROOT
- RP-PROJECTION-3GEN
negative_constraints:
- Do not append a registry family, admit an event, enable BSD commands or treat static definitions as runtime evidence.
- Do not define a local number/timestamp implementation or guard-isolation proof engine.
owner_hints:
- Plans/storage-plan.md
```


### SP-1355 - bsd.finding_cleared candidate Storage custody

```yaml
plan_unit_id: SP-1355
unit_type: event_contract
status: draft
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract for bsd.finding_cleared, prepared without admission. SP-318's physical_family_registration_pending and handler_unavailable remain in force. SP-1365 separately stages the exact original lifecycle-source wrappers. The candidate rows in Plans/bsd_event_storage_candidates.json for bsd_finding_cleared_operation, bsd_finding_cleared_projection and bsd_finding_cleared_checkpoint are reviewable proposed values, not appended registry families, storage admission, a budget decision or a readiness-denominator change. An integrator must separately admit exact physical families/migration/budgets after review; no event can be made writable by these candidate rows alone. Each value uses its exact closed Plans/bsd_event_storage_contracts.schema.json definition.
  The canonical operation key is bsd_finding_cleared_operation.v1:{scope_partition}:{hex(owner_operation_id)}; state pending_event carries the original authenticated source, event ID, key, semantic digest and durable SP-337 payload reference. state complete additionally requires the exact original first AppendReceipt. It never stores a second EventRecord or copied private body. Operation refs and their packs remain while original pending/result/receipt custody is needed, under RP-EVENT-IDENTITY-APPROOT; that lifetime protects identity and an immutable receipt, not linked content. It adopts SP-286/CV-339 first receipt/full-value v2 and SP-336/SP-347 durability explicitly. Coherent mandatory backup restores the operation, complete original source, receipt controls and payload packs together. Missing original is unavailable; it cannot be reconstructed from a GUI model or a supplied hash.
  The derived projection key is bsd_finding_cleared_projection.v1:{scope_partition}:{hex(owner_operation_id)}. It holds only the original source/event refs and Storage identities. The derived checkpoint key is bsd_finding_cleared_checkpoint.v1:{scope_partition}:{storage_instance_id} for projector.bsd.finding_cleared@1.0.0. Both use RP-PROJECTION-3GEN with holds; source event retention is independently {"registry_schema_id": "pm.storage_value_registry.v2", "policy_id": "RP-RUNTIME-365D", "policy_version": "1.0.0"}. A pending retention marker is never a valid production registry reference. Every complete encoded value must stay at or below 16 KiB; SP-337 externalizes referenced bodies before limits, rather than leaving an oversized operation value. Canonical/derived placement and actual disk budgets require existing SP-340 admission, never unbounded storage.
  The exact operational reader is reader.bsd.finding_cleared@1.0.0 for AssistantContext::bsd_finding_projection. It explicitly adopts SP-278 reader.storage.event_record_index@1.0.0, its CURRENT-selected actual root, globally complete verified source selection/coverage, authenticated generation anchor and advancing frontier. It scans in ascending Storage sequence, never timestamp order; the examined cursor cannot regress. It scans the complete captured range with exactly the bsd.finding_cleared/Project/version filter, resolves full values/payload refs, verifies actual storage_instance_id, partition, sequence/event/payload/source joins and original full-value custody before processing a match. Verified nonmatches are scanned; corruption, unsupported input or missing proof is unavailable/degraded, never skipped as empty. Apply the immutable event reference to only its rebuildable derived row. In one actual redb transaction compare-and-swap the entire old checkpoint and atomically commit all changed rows with last_scanned_sequence, last_matched_event_id, source selection and the nine-field durable read token. An empty source has a null cursor; a nonempty zero-match range still advances its examined cursor. Each durable token field is rejoined to actual Storage controls, then the current live snapshot supplies its transient tenth redb_snapshot_id field. Same generation alone cannot prove a frontier unchanged. Inclusive restart rechecks the last exact event/frame/offset; replay produces no review, advice delivery, notification, Usage charge, canonical write or new event.
  Historical inspection validates authenticated original admission/schema/recipe and source custody before the retained event, but never reruns current live-epoch/state/precondition checks. Current access, deletion and withdrawal checks still apply. Genuine older history after a live change stays readable; substituted or withdrawn originals refuse. Schema/version selection cannot be caller-chosen to weaken validation. Complete withdrawal fences writer admission at the actual cutoff, resolves pending issued results, invalidates reader/checkpoint publications and requires governed successor rebuild; missing source is explicitly unavailable, not a rebuilt success. Physical replay/restore/migration remains unimplemented and unadmitted.
gui_related: false
gui_classification_reason: Defines internal event, identity, Storage custody or validation, without changing presentation.
depends_on:
- SP-318
- SP-278
- SP-286
- SP-337
- CV-1355
unblocks: []
acceptance_criteria:
- Exact family semantics, payload, original-source identity and retry custody are bound.
- No unregistered append, physical admission or native/runtime success is implied.
- Phase-2 oracle and shared guard-isolation proof remain mandatory before review/admission.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
- Plans/bsd_event_oracle_plan.json
risk_class: advisory_history_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3d_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/bsd_event_payloads.schema.json
- Plans/bsd_event_storage_contracts.schema.json
- Plans/bsd_event_storage_candidates.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3D.md
- Deck-2 item 9.a A (answer record 2026-11-05; DL-450 application pending)
preserved_exact_tokens:
- bsd.finding_cleared
- SP-318
- SP-278
- SP-286
- SP-337
- RP-EVENT-IDENTITY-APPROOT
- RP-PROJECTION-3GEN
negative_constraints:
- Do not append a registry family, admit an event, enable BSD commands or treat static definitions as runtime evidence.
- Do not define a local number/timestamp implementation or guard-isolation proof engine.
owner_hints:
- Plans/storage-plan.md
```


### SP-1356 - bsd.finding_held candidate Storage custody

```yaml
plan_unit_id: SP-1356
unit_type: event_contract
status: draft
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract for bsd.finding_held, prepared without admission. SP-318's physical_family_registration_pending and handler_unavailable remain in force. SP-1365 separately stages the exact original lifecycle-source wrappers. The candidate rows in Plans/bsd_event_storage_candidates.json for bsd_finding_held_operation, bsd_finding_held_projection and bsd_finding_held_checkpoint are reviewable proposed values, not appended registry families, storage admission, a budget decision or a readiness-denominator change. An integrator must separately admit exact physical families/migration/budgets after review; no event can be made writable by these candidate rows alone. Each value uses its exact closed Plans/bsd_event_storage_contracts.schema.json definition.
  The canonical operation key is bsd_finding_held_operation.v1:{scope_partition}:{hex(owner_operation_id)}; state pending_event carries the original authenticated source, event ID, key, semantic digest and durable SP-337 payload reference. state complete additionally requires the exact original first AppendReceipt. It never stores a second EventRecord or copied private body. Operation refs and their packs remain while original pending/result/receipt custody is needed, under RP-EVENT-IDENTITY-APPROOT; that lifetime protects identity and an immutable receipt, not linked content. It adopts SP-286/CV-339 first receipt/full-value v2 and SP-336/SP-347 durability explicitly. Coherent mandatory backup restores the operation, complete original source, receipt controls and payload packs together. Missing original is unavailable; it cannot be reconstructed from a GUI model or a supplied hash.
  The derived projection key is bsd_finding_held_projection.v1:{scope_partition}:{hex(owner_operation_id)}. It holds only the original source/event refs and Storage identities. The derived checkpoint key is bsd_finding_held_checkpoint.v1:{scope_partition}:{storage_instance_id} for projector.bsd.finding_held@1.0.0. Both use RP-PROJECTION-3GEN with holds; source event retention is independently {"registry_schema_id": "pm.storage_value_registry.v2", "policy_id": "RP-RUNTIME-365D", "policy_version": "1.0.0"}. A pending retention marker is never a valid production registry reference. Every complete encoded value must stay at or below 16 KiB; SP-337 externalizes referenced bodies before limits, rather than leaving an oversized operation value. Canonical/derived placement and actual disk budgets require existing SP-340 admission, never unbounded storage.
  The exact operational reader is reader.bsd.finding_held@1.0.0 for AssistantContext::bsd_held_projection. It explicitly adopts SP-278 reader.storage.event_record_index@1.0.0, its CURRENT-selected actual root, globally complete verified source selection/coverage, authenticated generation anchor and advancing frontier. It scans in ascending Storage sequence, never timestamp order; the examined cursor cannot regress. It scans the complete captured range with exactly the bsd.finding_held/Project/version filter, resolves full values/payload refs, verifies actual storage_instance_id, partition, sequence/event/payload/source joins and original full-value custody before processing a match. Verified nonmatches are scanned; corruption, unsupported input or missing proof is unavailable/degraded, never skipped as empty. Apply the immutable event reference to only its rebuildable derived row. In one actual redb transaction compare-and-swap the entire old checkpoint and atomically commit all changed rows with last_scanned_sequence, last_matched_event_id, source selection and the nine-field durable read token. An empty source has a null cursor; a nonempty zero-match range still advances its examined cursor. Each durable token field is rejoined to actual Storage controls, then the current live snapshot supplies its transient tenth redb_snapshot_id field. Same generation alone cannot prove a frontier unchanged. Inclusive restart rechecks the last exact event/frame/offset; replay produces no review, advice delivery, notification, Usage charge, canonical write or new event.
  Historical inspection validates authenticated original admission/schema/recipe and source custody before the retained event, but never reruns current live-epoch/state/precondition checks. Current access, deletion and withdrawal checks still apply. Genuine older history after a live change stays readable; substituted or withdrawn originals refuse. Schema/version selection cannot be caller-chosen to weaken validation. Complete withdrawal fences writer admission at the actual cutoff, resolves pending issued results, invalidates reader/checkpoint publications and requires governed successor rebuild; missing source is explicitly unavailable, not a rebuilt success. Physical replay/restore/migration remains unimplemented and unadmitted.
gui_related: false
gui_classification_reason: Defines internal event, identity, Storage custody or validation, without changing presentation.
depends_on:
- SP-318
- SP-278
- SP-286
- SP-337
- CV-1356
unblocks: []
acceptance_criteria:
- Exact family semantics, payload, original-source identity and retry custody are bound.
- No unregistered append, physical admission or native/runtime success is implied.
- Phase-2 oracle and shared guard-isolation proof remain mandatory before review/admission.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
- Plans/bsd_event_oracle_plan.json
risk_class: advisory_history_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3d_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/bsd_event_payloads.schema.json
- Plans/bsd_event_storage_contracts.schema.json
- Plans/bsd_event_storage_candidates.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3D.md
- Deck-2 item 9.a A (answer record 2026-11-05; DL-450 application pending)
preserved_exact_tokens:
- bsd.finding_held
- SP-318
- SP-278
- SP-286
- SP-337
- RP-EVENT-IDENTITY-APPROOT
- RP-PROJECTION-3GEN
negative_constraints:
- Do not append a registry family, admit an event, enable BSD commands or treat static definitions as runtime evidence.
- Do not define a local number/timestamp implementation or guard-isolation proof engine.
owner_hints:
- Plans/storage-plan.md
```


### SP-1357 - bsd.finding_reconfirmed candidate Storage custody

```yaml
plan_unit_id: SP-1357
unit_type: event_contract
status: draft
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract for bsd.finding_reconfirmed, prepared without admission. SP-318's physical_family_registration_pending and handler_unavailable remain in force. SP-1365 separately stages the exact original lifecycle-source wrappers. The candidate rows in Plans/bsd_event_storage_candidates.json for bsd_finding_reconfirmed_operation, bsd_finding_reconfirmed_projection and bsd_finding_reconfirmed_checkpoint are reviewable proposed values, not appended registry families, storage admission, a budget decision or a readiness-denominator change. An integrator must separately admit exact physical families/migration/budgets after review; no event can be made writable by these candidate rows alone. Each value uses its exact closed Plans/bsd_event_storage_contracts.schema.json definition.
  The canonical operation key is bsd_finding_reconfirmed_operation.v1:{scope_partition}:{hex(owner_operation_id)}; state pending_event carries the original authenticated source, event ID, key, semantic digest and durable SP-337 payload reference. state complete additionally requires the exact original first AppendReceipt. It never stores a second EventRecord or copied private body. Operation refs and their packs remain while original pending/result/receipt custody is needed, under RP-EVENT-IDENTITY-APPROOT; that lifetime protects identity and an immutable receipt, not linked content. It adopts SP-286/CV-339 first receipt/full-value v2 and SP-336/SP-347 durability explicitly. Coherent mandatory backup restores the operation, complete original source, receipt controls and payload packs together. Missing original is unavailable; it cannot be reconstructed from a GUI model or a supplied hash.
  The derived projection key is bsd_finding_reconfirmed_projection.v1:{scope_partition}:{hex(owner_operation_id)}. It holds only the original source/event refs and Storage identities. The derived checkpoint key is bsd_finding_reconfirmed_checkpoint.v1:{scope_partition}:{storage_instance_id} for projector.bsd.finding_reconfirmed@1.0.0. Both use RP-PROJECTION-3GEN with holds; source event retention is independently {"registry_schema_id": "pm.storage_value_registry.v2", "policy_id": "RP-RUNTIME-365D", "policy_version": "1.0.0"}. A pending retention marker is never a valid production registry reference. Every complete encoded value must stay at or below 16 KiB; SP-337 externalizes referenced bodies before limits, rather than leaving an oversized operation value. Canonical/derived placement and actual disk budgets require existing SP-340 admission, never unbounded storage.
  The exact operational reader is reader.bsd.finding_reconfirmed@1.0.0 for AssistantContext::bsd_reconfirmation_projection. It explicitly adopts SP-278 reader.storage.event_record_index@1.0.0, its CURRENT-selected actual root, globally complete verified source selection/coverage, authenticated generation anchor and advancing frontier. It scans in ascending Storage sequence, never timestamp order; the examined cursor cannot regress. It scans the complete captured range with exactly the bsd.finding_reconfirmed/Project/version filter, resolves full values/payload refs, verifies actual storage_instance_id, partition, sequence/event/payload/source joins and original full-value custody before processing a match. Verified nonmatches are scanned; corruption, unsupported input or missing proof is unavailable/degraded, never skipped as empty. Apply the immutable event reference to only its rebuildable derived row. In one actual redb transaction compare-and-swap the entire old checkpoint and atomically commit all changed rows with last_scanned_sequence, last_matched_event_id, source selection and the nine-field durable read token. An empty source has a null cursor; a nonempty zero-match range still advances its examined cursor. Each durable token field is rejoined to actual Storage controls, then the current live snapshot supplies its transient tenth redb_snapshot_id field. Same generation alone cannot prove a frontier unchanged. Inclusive restart rechecks the last exact event/frame/offset; replay produces no review, advice delivery, notification, Usage charge, canonical write or new event.
  Historical inspection validates authenticated original admission/schema/recipe and source custody before the retained event, but never reruns current live-epoch/state/precondition checks. Current access, deletion and withdrawal checks still apply. Genuine older history after a live change stays readable; substituted or withdrawn originals refuse. Schema/version selection cannot be caller-chosen to weaken validation. Complete withdrawal fences writer admission at the actual cutoff, resolves pending issued results, invalidates reader/checkpoint publications and requires governed successor rebuild; missing source is explicitly unavailable, not a rebuilt success. Physical replay/restore/migration remains unimplemented and unadmitted.
gui_related: false
gui_classification_reason: Defines internal event, identity, Storage custody or validation, without changing presentation.
depends_on:
- SP-318
- SP-278
- SP-286
- SP-337
- CV-1357
unblocks: []
acceptance_criteria:
- Exact family semantics, payload, original-source identity and retry custody are bound.
- No unregistered append, physical admission or native/runtime success is implied.
- Phase-2 oracle and shared guard-isolation proof remain mandatory before review/admission.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
- Plans/bsd_event_oracle_plan.json
risk_class: advisory_history_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3d_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/bsd_event_payloads.schema.json
- Plans/bsd_event_storage_contracts.schema.json
- Plans/bsd_event_storage_candidates.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3D.md
- Deck-2 item 9.a A (answer record 2026-11-05; DL-450 application pending)
preserved_exact_tokens:
- bsd.finding_reconfirmed
- SP-318
- SP-278
- SP-286
- SP-337
- RP-EVENT-IDENTITY-APPROOT
- RP-PROJECTION-3GEN
negative_constraints:
- Do not append a registry family, admit an event, enable BSD commands or treat static definitions as runtime evidence.
- Do not define a local number/timestamp implementation or guard-isolation proof engine.
owner_hints:
- Plans/storage-plan.md
```


### SP-1358 - bsd.finding_suppressed candidate Storage custody

```yaml
plan_unit_id: SP-1358
unit_type: event_contract
status: draft
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract for bsd.finding_suppressed, prepared without admission. SP-318's physical_family_registration_pending and handler_unavailable remain in force. SP-1365 separately stages the exact original lifecycle-source wrappers. The candidate rows in Plans/bsd_event_storage_candidates.json for bsd_finding_suppressed_operation, bsd_finding_suppressed_projection and bsd_finding_suppressed_checkpoint are reviewable proposed values, not appended registry families, storage admission, a budget decision or a readiness-denominator change. An integrator must separately admit exact physical families/migration/budgets after review; no event can be made writable by these candidate rows alone. Each value uses its exact closed Plans/bsd_event_storage_contracts.schema.json definition.
  The canonical operation key is bsd_finding_suppressed_operation.v1:{scope_partition}:{hex(owner_operation_id)}; state pending_event carries the original authenticated source, event ID, key, semantic digest and durable SP-337 payload reference. state complete additionally requires the exact original first AppendReceipt. It never stores a second EventRecord or copied private body. Operation refs and their packs remain while original pending/result/receipt custody is needed, under RP-EVENT-IDENTITY-APPROOT; that lifetime protects identity and an immutable receipt, not linked content. It adopts SP-286/CV-339 first receipt/full-value v2 and SP-336/SP-347 durability explicitly. Coherent mandatory backup restores the operation, complete original source, receipt controls and payload packs together. Missing original is unavailable; it cannot be reconstructed from a GUI model or a supplied hash.
  The derived projection key is bsd_finding_suppressed_projection.v1:{scope_partition}:{hex(owner_operation_id)}. It holds only the original source/event refs and Storage identities. The derived checkpoint key is bsd_finding_suppressed_checkpoint.v1:{scope_partition}:{storage_instance_id} for projector.bsd.finding_suppressed@1.0.0. Both use RP-PROJECTION-3GEN with holds; source event retention is independently {"registry_schema_id": "pm.storage_value_registry.v2", "policy_id": "RP-RUNTIME-365D", "policy_version": "1.0.0"}. A pending retention marker is never a valid production registry reference. Every complete encoded value must stay at or below 16 KiB; SP-337 externalizes referenced bodies before limits, rather than leaving an oversized operation value. Canonical/derived placement and actual disk budgets require existing SP-340 admission, never unbounded storage.
  The exact operational reader is reader.bsd.finding_suppressed@1.0.0 for Usage::bsd_suppression_counters. It explicitly adopts SP-278 reader.storage.event_record_index@1.0.0, its CURRENT-selected actual root, globally complete verified source selection/coverage, authenticated generation anchor and advancing frontier. It scans in ascending Storage sequence, never timestamp order; the examined cursor cannot regress. It scans the complete captured range with exactly the bsd.finding_suppressed/Project/version filter, resolves full values/payload refs, verifies actual storage_instance_id, partition, sequence/event/payload/source joins and original full-value custody before processing a match. Verified nonmatches are scanned; corruption, unsupported input or missing proof is unavailable/degraded, never skipped as empty. Apply the immutable event reference to only its rebuildable derived row. In one actual redb transaction compare-and-swap the entire old checkpoint and atomically commit all changed rows with last_scanned_sequence, last_matched_event_id, source selection and the nine-field durable read token. An empty source has a null cursor; a nonempty zero-match range still advances its examined cursor. Each durable token field is rejoined to actual Storage controls, then the current live snapshot supplies its transient tenth redb_snapshot_id field. Same generation alone cannot prove a frontier unchanged. Inclusive restart rechecks the last exact event/frame/offset; replay produces no review, advice delivery, notification, Usage charge, canonical write or new event.
  Historical inspection validates authenticated original admission/schema/recipe and source custody before the retained event, but never reruns current live-epoch/state/precondition checks. Current access, deletion and withdrawal checks still apply. Genuine older history after a live change stays readable; substituted or withdrawn originals refuse. Schema/version selection cannot be caller-chosen to weaken validation. Complete withdrawal fences writer admission at the actual cutoff, resolves pending issued results, invalidates reader/checkpoint publications and requires governed successor rebuild; missing source is explicitly unavailable, not a rebuilt success. Physical replay/restore/migration remains unimplemented and unadmitted.
gui_related: false
gui_classification_reason: Defines internal event, identity, Storage custody or validation, without changing presentation.
depends_on:
- SP-318
- SP-278
- SP-286
- SP-337
- CV-1358
unblocks: []
acceptance_criteria:
- Exact family semantics, payload, original-source identity and retry custody are bound.
- No unregistered append, physical admission or native/runtime success is implied.
- Phase-2 oracle and shared guard-isolation proof remain mandatory before review/admission.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
- Plans/bsd_event_oracle_plan.json
risk_class: advisory_history_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3d_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/bsd_event_payloads.schema.json
- Plans/bsd_event_storage_contracts.schema.json
- Plans/bsd_event_storage_candidates.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3D.md
- Deck-2 item 9.a A (answer record 2026-11-05; DL-450 application pending)
preserved_exact_tokens:
- bsd.finding_suppressed
- SP-318
- SP-278
- SP-286
- SP-337
- RP-EVENT-IDENTITY-APPROOT
- RP-PROJECTION-3GEN
negative_constraints:
- Do not append a registry family, admit an event, enable BSD commands or treat static definitions as runtime evidence.
- Do not define a local number/timestamp implementation or guard-isolation proof engine.
owner_hints:
- Plans/storage-plan.md
```


### SP-1359 - bsd.output_quarantined candidate Storage custody

```yaml
plan_unit_id: SP-1359
unit_type: event_contract
status: draft
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract for bsd.output_quarantined, prepared without admission. SP-318's physical_family_registration_pending and handler_unavailable remain in force. SP-1365 separately stages the exact original lifecycle-source wrappers. The candidate rows in Plans/bsd_event_storage_candidates.json for bsd_output_quarantined_operation, bsd_output_quarantined_projection and bsd_output_quarantined_checkpoint are reviewable proposed values, not appended registry families, storage admission, a budget decision or a readiness-denominator change. An integrator must separately admit exact physical families/migration/budgets after review; no event can be made writable by these candidate rows alone. Each value uses its exact closed Plans/bsd_event_storage_contracts.schema.json definition.
  The canonical operation key is bsd_output_quarantined_operation.v1:{scope_partition}:{hex(owner_operation_id)}; state pending_event carries the original authenticated source, event ID, key, semantic digest and durable SP-337 payload reference. state complete additionally requires the exact original first AppendReceipt. It never stores a second EventRecord or copied private body. Operation refs and their packs remain while original pending/result/receipt custody is needed, under RP-EVENT-IDENTITY-APPROOT; that lifetime protects identity and an immutable receipt, not linked content. It adopts SP-286/CV-339 first receipt/full-value v2 and SP-336/SP-347 durability explicitly. Coherent mandatory backup restores the operation, complete original source, receipt controls and payload packs together. Missing original is unavailable; it cannot be reconstructed from a GUI model or a supplied hash.
  The derived projection key is bsd_output_quarantined_projection.v1:{scope_partition}:{hex(owner_operation_id)}. It holds only the original source/event refs and Storage identities. The derived checkpoint key is bsd_output_quarantined_checkpoint.v1:{scope_partition}:{storage_instance_id} for projector.bsd.output_quarantined@1.0.0. Both use RP-PROJECTION-3GEN with holds; source event retention is independently {"registry_schema_id": "pm.storage_value_registry.v2", "policy_id": "RP-RUNTIME-365D", "policy_version": "1.0.0"}. A pending retention marker is never a valid production registry reference. Every complete encoded value must stay at or below 16 KiB; SP-337 externalizes referenced bodies before limits, rather than leaving an oversized operation value. Canonical/derived placement and actual disk budgets require existing SP-340 admission, never unbounded storage.
  The exact operational reader is reader.bsd.output_quarantined@1.0.0 for AssistantContext::bsd_quarantine_projection. It explicitly adopts SP-278 reader.storage.event_record_index@1.0.0, its CURRENT-selected actual root, globally complete verified source selection/coverage, authenticated generation anchor and advancing frontier. It scans in ascending Storage sequence, never timestamp order; the examined cursor cannot regress. It scans the complete captured range with exactly the bsd.output_quarantined/Project/version filter, resolves full values/payload refs, verifies actual storage_instance_id, partition, sequence/event/payload/source joins and original full-value custody before processing a match. Verified nonmatches are scanned; corruption, unsupported input or missing proof is unavailable/degraded, never skipped as empty. Apply the immutable event reference to only its rebuildable derived row. In one actual redb transaction compare-and-swap the entire old checkpoint and atomically commit all changed rows with last_scanned_sequence, last_matched_event_id, source selection and the nine-field durable read token. An empty source has a null cursor; a nonempty zero-match range still advances its examined cursor. Each durable token field is rejoined to actual Storage controls, then the current live snapshot supplies its transient tenth redb_snapshot_id field. Same generation alone cannot prove a frontier unchanged. Inclusive restart rechecks the last exact event/frame/offset; replay produces no review, advice delivery, notification, Usage charge, canonical write or new event.
  Historical inspection validates authenticated original admission/schema/recipe and source custody before the retained event, but never reruns current live-epoch/state/precondition checks. Current access, deletion and withdrawal checks still apply. Genuine older history after a live change stays readable; substituted or withdrawn originals refuse. Schema/version selection cannot be caller-chosen to weaken validation. Complete withdrawal fences writer admission at the actual cutoff, resolves pending issued results, invalidates reader/checkpoint publications and requires governed successor rebuild; missing source is explicitly unavailable, not a rebuilt success. Physical replay/restore/migration remains unimplemented and unadmitted.
gui_related: false
gui_classification_reason: Defines internal event, identity, Storage custody or validation, without changing presentation.
depends_on:
- SP-318
- SP-278
- SP-286
- SP-337
- CV-1359
unblocks: []
acceptance_criteria:
- Exact family semantics, payload, original-source identity and retry custody are bound.
- No unregistered append, physical admission or native/runtime success is implied.
- Phase-2 oracle and shared guard-isolation proof remain mandatory before review/admission.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
- Plans/bsd_event_oracle_plan.json
risk_class: advisory_history_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3d_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/bsd_event_payloads.schema.json
- Plans/bsd_event_storage_contracts.schema.json
- Plans/bsd_event_storage_candidates.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3D.md
- Deck-2 item 9.a A (answer record 2026-11-05; DL-450 application pending)
preserved_exact_tokens:
- bsd.output_quarantined
- SP-318
- SP-278
- SP-286
- SP-337
- RP-EVENT-IDENTITY-APPROOT
- RP-PROJECTION-3GEN
negative_constraints:
- Do not append a registry family, admit an event, enable BSD commands or treat static definitions as runtime evidence.
- Do not define a local number/timestamp implementation or guard-isolation proof engine.
owner_hints:
- Plans/storage-plan.md
```


### SP-1360 - bsd.policy_changed candidate Storage custody

```yaml
plan_unit_id: SP-1360
unit_type: event_contract
status: draft
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract for bsd.policy_changed, prepared without admission. SP-318's physical_family_registration_pending and handler_unavailable remain in force. SP-1365 separately stages the exact original lifecycle-source wrappers. The candidate rows in Plans/bsd_event_storage_candidates.json for bsd_policy_changed_operation, bsd_policy_changed_projection and bsd_policy_changed_checkpoint are reviewable proposed values, not appended registry families, storage admission, a budget decision or a readiness-denominator change. An integrator must separately admit exact physical families/migration/budgets after review; no event can be made writable by these candidate rows alone. Each value uses its exact closed Plans/bsd_event_storage_contracts.schema.json definition.
  The canonical operation key is bsd_policy_changed_operation.v1:{scope_partition}:{hex(owner_operation_id)}; state pending_event carries the original authenticated source, event ID, key, semantic digest and durable SP-337 payload reference. state complete additionally requires the exact original first AppendReceipt. It never stores a second EventRecord or copied private body. Operation refs and their packs remain while original pending/result/receipt custody is needed, under RP-EVENT-IDENTITY-APPROOT; that lifetime protects identity and an immutable receipt, not linked content. It adopts SP-286/CV-339 first receipt/full-value v2 and SP-336/SP-347 durability explicitly. Coherent mandatory backup restores the operation, complete original source, receipt controls and payload packs together. Missing original is unavailable; it cannot be reconstructed from a GUI model or a supplied hash.
  The derived projection key is bsd_policy_changed_projection.v1:{scope_partition}:{hex(owner_operation_id)}. It holds only the original source/event refs and Storage identities. The derived checkpoint key is bsd_policy_changed_checkpoint.v1:{scope_partition}:{storage_instance_id} for projector.bsd.policy_changed@1.0.0. Both use RP-PROJECTION-3GEN with holds; source event retention is independently "PENDING_RETENTION_DECISION". A pending retention marker is never a valid production registry reference. Every complete encoded value must stay at or below 16 KiB; SP-337 externalizes referenced bodies before limits, rather than leaving an oversized operation value. Canonical/derived placement and actual disk budgets require existing SP-340 admission, never unbounded storage.
  The exact operational reader is reader.bsd.policy_changed@1.0.0 for Settings::bsd_policy_projection. It explicitly adopts SP-278 reader.storage.event_record_index@1.0.0, its CURRENT-selected actual root, globally complete verified source selection/coverage, authenticated generation anchor and advancing frontier. It scans in ascending Storage sequence, never timestamp order; the examined cursor cannot regress. It scans the complete captured range with exactly the bsd.policy_changed/Project/version filter, resolves full values/payload refs, verifies actual storage_instance_id, partition, sequence/event/payload/source joins and original full-value custody before processing a match. Verified nonmatches are scanned; corruption, unsupported input or missing proof is unavailable/degraded, never skipped as empty. Apply the immutable event reference to only its rebuildable derived row. In one actual redb transaction compare-and-swap the entire old checkpoint and atomically commit all changed rows with last_scanned_sequence, last_matched_event_id, source selection and the nine-field durable read token. An empty source has a null cursor; a nonempty zero-match range still advances its examined cursor. Each durable token field is rejoined to actual Storage controls, then the current live snapshot supplies its transient tenth redb_snapshot_id field. Same generation alone cannot prove a frontier unchanged. Inclusive restart rechecks the last exact event/frame/offset; replay produces no review, advice delivery, notification, Usage charge, canonical write or new event.
  Historical inspection validates authenticated original admission/schema/recipe and source custody before the retained event, but never reruns current live-epoch/state/precondition checks. Current access, deletion and withdrawal checks still apply. Genuine older history after a live change stays readable; substituted or withdrawn originals refuse. Schema/version selection cannot be caller-chosen to weaken validation. Complete withdrawal fences writer admission at the actual cutoff, resolves pending issued results, invalidates reader/checkpoint publications and requires governed successor rebuild; missing source is explicitly unavailable, not a rebuilt success. Physical replay/restore/migration remains unimplemented and unadmitted.
gui_related: false
gui_classification_reason: Defines internal event, identity, Storage custody or validation, without changing presentation.
depends_on:
- SP-318
- SP-278
- SP-286
- SP-337
- CV-1360
unblocks: []
acceptance_criteria:
- Exact family semantics, payload, original-source identity and retry custody are bound.
- No unregistered append, physical admission or native/runtime success is implied.
- Phase-2 oracle and shared guard-isolation proof remain mandatory before review/admission.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
- Plans/bsd_event_oracle_plan.json
risk_class: advisory_history_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3d_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/bsd_event_payloads.schema.json
- Plans/bsd_event_storage_contracts.schema.json
- Plans/bsd_event_storage_candidates.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3D.md
- Deck-2 item 9.a A (answer record 2026-11-05; DL-450 application pending)
preserved_exact_tokens:
- bsd.policy_changed
- SP-318
- SP-278
- SP-286
- SP-337
- RP-EVENT-IDENTITY-APPROOT
- RP-PROJECTION-3GEN
negative_constraints:
- Do not append a registry family, admit an event, enable BSD commands or treat static definitions as runtime evidence.
- Do not define a local number/timestamp implementation or guard-isolation proof engine.
owner_hints:
- Plans/storage-plan.md
```


### SP-1361 - bsd.review_failed candidate Storage custody

```yaml
plan_unit_id: SP-1361
unit_type: event_contract
status: draft
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract for bsd.review_failed, prepared without admission. SP-318's physical_family_registration_pending and handler_unavailable remain in force. SP-1365 separately stages the exact original lifecycle-source wrappers. The candidate rows in Plans/bsd_event_storage_candidates.json for bsd_review_failed_operation, bsd_review_failed_projection and bsd_review_failed_checkpoint are reviewable proposed values, not appended registry families, storage admission, a budget decision or a readiness-denominator change. An integrator must separately admit exact physical families/migration/budgets after review; no event can be made writable by these candidate rows alone. Each value uses its exact closed Plans/bsd_event_storage_contracts.schema.json definition.
  The canonical operation key is bsd_review_failed_operation.v1:{scope_partition}:{hex(owner_operation_id)}; state pending_event carries the original authenticated source, event ID, key, semantic digest and durable SP-337 payload reference. state complete additionally requires the exact original first AppendReceipt. It never stores a second EventRecord or copied private body. Operation refs and their packs remain while original pending/result/receipt custody is needed, under RP-EVENT-IDENTITY-APPROOT; that lifetime protects identity and an immutable receipt, not linked content. It adopts SP-286/CV-339 first receipt/full-value v2 and SP-336/SP-347 durability explicitly. Coherent mandatory backup restores the operation, complete original source, receipt controls and payload packs together. Missing original is unavailable; it cannot be reconstructed from a GUI model or a supplied hash.
  The derived projection key is bsd_review_failed_projection.v1:{scope_partition}:{hex(owner_operation_id)}. It holds only the original source/event refs and Storage identities. The derived checkpoint key is bsd_review_failed_checkpoint.v1:{scope_partition}:{storage_instance_id} for projector.bsd.review_failed@1.0.0. Both use RP-PROJECTION-3GEN with holds; source event retention is independently {"registry_schema_id": "pm.storage_value_registry.v2", "policy_id": "RP-RUNTIME-365D", "policy_version": "1.0.0"}. A pending retention marker is never a valid production registry reference. Every complete encoded value must stay at or below 16 KiB; SP-337 externalizes referenced bodies before limits, rather than leaving an oversized operation value. Canonical/derived placement and actual disk budgets require existing SP-340 admission, never unbounded storage.
  The exact operational reader is reader.bsd.review_failed@1.0.0 for Usage::bsd_failure_attribution. It explicitly adopts SP-278 reader.storage.event_record_index@1.0.0, its CURRENT-selected actual root, globally complete verified source selection/coverage, authenticated generation anchor and advancing frontier. It scans in ascending Storage sequence, never timestamp order; the examined cursor cannot regress. It scans the complete captured range with exactly the bsd.review_failed/Project/version filter, resolves full values/payload refs, verifies actual storage_instance_id, partition, sequence/event/payload/source joins and original full-value custody before processing a match. Verified nonmatches are scanned; corruption, unsupported input or missing proof is unavailable/degraded, never skipped as empty. Apply the immutable event reference to only its rebuildable derived row. In one actual redb transaction compare-and-swap the entire old checkpoint and atomically commit all changed rows with last_scanned_sequence, last_matched_event_id, source selection and the nine-field durable read token. An empty source has a null cursor; a nonempty zero-match range still advances its examined cursor. Each durable token field is rejoined to actual Storage controls, then the current live snapshot supplies its transient tenth redb_snapshot_id field. Same generation alone cannot prove a frontier unchanged. Inclusive restart rechecks the last exact event/frame/offset; replay produces no review, advice delivery, notification, Usage charge, canonical write or new event.
  Historical inspection validates authenticated original admission/schema/recipe and source custody before the retained event, but never reruns current live-epoch/state/precondition checks. Current access, deletion and withdrawal checks still apply. Genuine older history after a live change stays readable; substituted or withdrawn originals refuse. Schema/version selection cannot be caller-chosen to weaken validation. Complete withdrawal fences writer admission at the actual cutoff, resolves pending issued results, invalidates reader/checkpoint publications and requires governed successor rebuild; missing source is explicitly unavailable, not a rebuilt success. Physical replay/restore/migration remains unimplemented and unadmitted.
gui_related: false
gui_classification_reason: Defines internal event, identity, Storage custody or validation, without changing presentation.
depends_on:
- SP-318
- SP-278
- SP-286
- SP-337
- CV-1361
unblocks: []
acceptance_criteria:
- Exact family semantics, payload, original-source identity and retry custody are bound.
- No unregistered append, physical admission or native/runtime success is implied.
- Phase-2 oracle and shared guard-isolation proof remain mandatory before review/admission.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
- Plans/bsd_event_oracle_plan.json
risk_class: advisory_history_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3d_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/bsd_event_payloads.schema.json
- Plans/bsd_event_storage_contracts.schema.json
- Plans/bsd_event_storage_candidates.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3D.md
- Deck-2 item 9.a A (answer record 2026-11-05; DL-450 application pending)
preserved_exact_tokens:
- bsd.review_failed
- SP-318
- SP-278
- SP-286
- SP-337
- RP-EVENT-IDENTITY-APPROOT
- RP-PROJECTION-3GEN
negative_constraints:
- Do not append a registry family, admit an event, enable BSD commands or treat static definitions as runtime evidence.
- Do not define a local number/timestamp implementation or guard-isolation proof engine.
owner_hints:
- Plans/storage-plan.md
```


### SP-1362 - bsd.review_started candidate Storage custody

```yaml
plan_unit_id: SP-1362
unit_type: event_contract
status: draft
owner_doc: Plans/storage-plan.md
canonical_text: |-
  For bsd.review_started the exact original source is SP-1365 source_review_start, not source_review_cycle. The current review-cycle head initially selects that admission wrapper only after the original start barrier receipt; it selects a terminal wrapper later only after genuine outcome custody and a verified review_start_ref join. A settled start operation needs no terminal review result.
  Newly authored owner contract for bsd.review_started, prepared without admission. SP-318's physical_family_registration_pending and handler_unavailable remain in force. SP-1365 separately stages the exact original lifecycle-source wrappers. The candidate rows in Plans/bsd_event_storage_candidates.json for bsd_review_started_operation, bsd_review_started_projection and bsd_review_started_checkpoint are reviewable proposed values, not appended registry families, storage admission, a budget decision or a readiness-denominator change. An integrator must separately admit exact physical families/migration/budgets after review; no event can be made writable by these candidate rows alone. Each value uses its exact closed Plans/bsd_event_storage_contracts.schema.json definition.
  The canonical operation key is bsd_review_started_operation.v1:{scope_partition}:{hex(owner_operation_id)}; state pending_event carries the original authenticated source, event ID, key, semantic digest and durable SP-337 payload reference. state complete additionally requires the exact original first AppendReceipt. It never stores a second EventRecord or copied private body. Operation refs and their packs remain while original pending/result/receipt custody is needed, under RP-EVENT-IDENTITY-APPROOT; that lifetime protects identity and an immutable receipt, not linked content. It adopts SP-286/CV-339 first receipt/full-value v2 and SP-336/SP-347 durability explicitly. Coherent mandatory backup restores the operation, complete original source, receipt controls and payload packs together. Missing original is unavailable; it cannot be reconstructed from a GUI model or a supplied hash.
  The derived projection key is bsd_review_started_projection.v1:{scope_partition}:{hex(owner_operation_id)}. It holds only the original source/event refs and Storage identities. The derived checkpoint key is bsd_review_started_checkpoint.v1:{scope_partition}:{storage_instance_id} for projector.bsd.review_started@1.0.0. Both use RP-PROJECTION-3GEN with holds; source event retention is independently {"registry_schema_id": "pm.storage_value_registry.v2", "policy_id": "RP-RUNTIME-365D", "policy_version": "1.0.0"}. A pending retention marker is never a valid production registry reference. Every complete encoded value must stay at or below 16 KiB; SP-337 externalizes referenced bodies before limits, rather than leaving an oversized operation value. Canonical/derived placement and actual disk budgets require existing SP-340 admission, never unbounded storage.
  The exact operational reader is reader.bsd.review_started@1.0.0 for AssistantContext::bsd_review_projection. It explicitly adopts SP-278 reader.storage.event_record_index@1.0.0, its CURRENT-selected actual root, globally complete verified source selection/coverage, authenticated generation anchor and advancing frontier. It scans in ascending Storage sequence, never timestamp order; the examined cursor cannot regress. It scans the complete captured range with exactly the bsd.review_started/Project/version filter, resolves full values/payload refs, verifies actual storage_instance_id, partition, sequence/event/payload/source joins and original full-value custody before processing a match. Verified nonmatches are scanned; corruption, unsupported input or missing proof is unavailable/degraded, never skipped as empty. Apply the immutable event reference to only its rebuildable derived row. In one actual redb transaction compare-and-swap the entire old checkpoint and atomically commit all changed rows with last_scanned_sequence, last_matched_event_id, source selection and the nine-field durable read token. An empty source has a null cursor; a nonempty zero-match range still advances its examined cursor. Each durable token field is rejoined to actual Storage controls, then the current live snapshot supplies its transient tenth redb_snapshot_id field. Same generation alone cannot prove a frontier unchanged. Inclusive restart rechecks the last exact event/frame/offset; replay produces no review, advice delivery, notification, Usage charge, canonical write or new event.
  Historical inspection validates authenticated original admission/schema/recipe and source custody before the retained event, but never reruns current live-epoch/state/precondition checks. Current access, deletion and withdrawal checks still apply. Genuine older history after a live change stays readable; substituted or withdrawn originals refuse. Schema/version selection cannot be caller-chosen to weaken validation. Complete withdrawal fences writer admission at the actual cutoff, resolves pending issued results, invalidates reader/checkpoint publications and requires governed successor rebuild; missing source is explicitly unavailable, not a rebuilt success. Physical replay/restore/migration remains unimplemented and unadmitted.
gui_related: false
gui_classification_reason: Defines internal event, identity, Storage custody or validation, without changing presentation.
depends_on:
- SP-318
- SP-278
- SP-286
- SP-337
- CV-1362
unblocks: []
acceptance_criteria:
- Exact family semantics, payload, original-source identity and retry custody are bound.
- No unregistered append, physical admission or native/runtime success is implied.
- Phase-2 oracle and shared guard-isolation proof remain mandatory before review/admission.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
- Plans/bsd_event_oracle_plan.json
risk_class: advisory_history_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3d_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/bsd_event_payloads.schema.json
- Plans/bsd_event_storage_contracts.schema.json
- Plans/bsd_event_storage_candidates.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3D.md
- Deck-2 item 9.a A (answer record 2026-11-05; DL-450 application pending)
preserved_exact_tokens:
- bsd.review_started
- SP-318
- SP-278
- SP-286
- SP-337
- RP-EVENT-IDENTITY-APPROOT
- RP-PROJECTION-3GEN
negative_constraints:
- Do not append a registry family, admit an event, enable BSD commands or treat static definitions as runtime evidence.
- Do not define a local number/timestamp implementation or guard-isolation proof engine.
owner_hints:
- Plans/storage-plan.md
```


### SP-1363 - bsd.review_timed_out candidate Storage custody

```yaml
plan_unit_id: SP-1363
unit_type: event_contract
status: draft
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract for bsd.review_timed_out, prepared without admission. SP-318's physical_family_registration_pending and handler_unavailable remain in force. SP-1365 separately stages the exact original lifecycle-source wrappers. The candidate rows in Plans/bsd_event_storage_candidates.json for bsd_review_timed_out_operation, bsd_review_timed_out_projection and bsd_review_timed_out_checkpoint are reviewable proposed values, not appended registry families, storage admission, a budget decision or a readiness-denominator change. An integrator must separately admit exact physical families/migration/budgets after review; no event can be made writable by these candidate rows alone. Each value uses its exact closed Plans/bsd_event_storage_contracts.schema.json definition.
  The canonical operation key is bsd_review_timed_out_operation.v1:{scope_partition}:{hex(owner_operation_id)}; state pending_event carries the original authenticated source, event ID, key, semantic digest and durable SP-337 payload reference. state complete additionally requires the exact original first AppendReceipt. It never stores a second EventRecord or copied private body. Operation refs and their packs remain while original pending/result/receipt custody is needed, under RP-EVENT-IDENTITY-APPROOT; that lifetime protects identity and an immutable receipt, not linked content. It adopts SP-286/CV-339 first receipt/full-value v2 and SP-336/SP-347 durability explicitly. Coherent mandatory backup restores the operation, complete original source, receipt controls and payload packs together. Missing original is unavailable; it cannot be reconstructed from a GUI model or a supplied hash.
  The derived projection key is bsd_review_timed_out_projection.v1:{scope_partition}:{hex(owner_operation_id)}. It holds only the original source/event refs and Storage identities. The derived checkpoint key is bsd_review_timed_out_checkpoint.v1:{scope_partition}:{storage_instance_id} for projector.bsd.review_timed_out@1.0.0. Both use RP-PROJECTION-3GEN with holds; source event retention is independently {"registry_schema_id": "pm.storage_value_registry.v2", "policy_id": "RP-RUNTIME-365D", "policy_version": "1.0.0"}. A pending retention marker is never a valid production registry reference. Every complete encoded value must stay at or below 16 KiB; SP-337 externalizes referenced bodies before limits, rather than leaving an oversized operation value. Canonical/derived placement and actual disk budgets require existing SP-340 admission, never unbounded storage.
  The exact operational reader is reader.bsd.review_timed_out@1.0.0 for Usage::bsd_timeout_attribution. It explicitly adopts SP-278 reader.storage.event_record_index@1.0.0, its CURRENT-selected actual root, globally complete verified source selection/coverage, authenticated generation anchor and advancing frontier. It scans in ascending Storage sequence, never timestamp order; the examined cursor cannot regress. It scans the complete captured range with exactly the bsd.review_timed_out/Project/version filter, resolves full values/payload refs, verifies actual storage_instance_id, partition, sequence/event/payload/source joins and original full-value custody before processing a match. Verified nonmatches are scanned; corruption, unsupported input or missing proof is unavailable/degraded, never skipped as empty. Apply the immutable event reference to only its rebuildable derived row. In one actual redb transaction compare-and-swap the entire old checkpoint and atomically commit all changed rows with last_scanned_sequence, last_matched_event_id, source selection and the nine-field durable read token. An empty source has a null cursor; a nonempty zero-match range still advances its examined cursor. Each durable token field is rejoined to actual Storage controls, then the current live snapshot supplies its transient tenth redb_snapshot_id field. Same generation alone cannot prove a frontier unchanged. Inclusive restart rechecks the last exact event/frame/offset; replay produces no review, advice delivery, notification, Usage charge, canonical write or new event.
  Historical inspection validates authenticated original admission/schema/recipe and source custody before the retained event, but never reruns current live-epoch/state/precondition checks. Current access, deletion and withdrawal checks still apply. Genuine older history after a live change stays readable; substituted or withdrawn originals refuse. Schema/version selection cannot be caller-chosen to weaken validation. Complete withdrawal fences writer admission at the actual cutoff, resolves pending issued results, invalidates reader/checkpoint publications and requires governed successor rebuild; missing source is explicitly unavailable, not a rebuilt success. Physical replay/restore/migration remains unimplemented and unadmitted.
gui_related: false
gui_classification_reason: Defines internal event, identity, Storage custody or validation, without changing presentation.
depends_on:
- SP-318
- SP-278
- SP-286
- SP-337
- CV-1363
unblocks: []
acceptance_criteria:
- Exact family semantics, payload, original-source identity and retry custody are bound.
- No unregistered append, physical admission or native/runtime success is implied.
- Phase-2 oracle and shared guard-isolation proof remain mandatory before review/admission.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
- Plans/bsd_event_oracle_plan.json
risk_class: advisory_history_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3d_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/bsd_event_payloads.schema.json
- Plans/bsd_event_storage_contracts.schema.json
- Plans/bsd_event_storage_candidates.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3D.md
- Deck-2 item 9.a A (answer record 2026-11-05; DL-450 application pending)
preserved_exact_tokens:
- bsd.review_timed_out
- SP-318
- SP-278
- SP-286
- SP-337
- RP-EVENT-IDENTITY-APPROOT
- RP-PROJECTION-3GEN
negative_constraints:
- Do not append a registry family, admit an event, enable BSD commands or treat static definitions as runtime evidence.
- Do not define a local number/timestamp implementation or guard-isolation proof engine.
owner_hints:
- Plans/storage-plan.md
```


### SP-1364 - bsd.workflow_binding_created candidate Storage custody

```yaml
plan_unit_id: SP-1364
unit_type: event_contract
status: draft
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract for bsd.workflow_binding_created, prepared without admission. SP-318's physical_family_registration_pending and handler_unavailable remain in force. SP-1365 separately stages the exact original lifecycle-source wrappers. The candidate rows in Plans/bsd_event_storage_candidates.json for bsd_workflow_binding_created_operation, bsd_workflow_binding_created_projection and bsd_workflow_binding_created_checkpoint are reviewable proposed values, not appended registry families, storage admission, a budget decision or a readiness-denominator change. An integrator must separately admit exact physical families/migration/budgets after review; no event can be made writable by these candidate rows alone. Each value uses its exact closed Plans/bsd_event_storage_contracts.schema.json definition.
  The canonical operation key is bsd_workflow_binding_created_operation.v1:{scope_partition}:{hex(owner_operation_id)}; state pending_event carries the original authenticated source, event ID, key, semantic digest and durable SP-337 payload reference. state complete additionally requires the exact original first AppendReceipt. It never stores a second EventRecord or copied private body. Operation refs and their packs remain while original pending/result/receipt custody is needed, under RP-EVENT-IDENTITY-APPROOT; that lifetime protects identity and an immutable receipt, not linked content. It adopts SP-286/CV-339 first receipt/full-value v2 and SP-336/SP-347 durability explicitly. Coherent mandatory backup restores the operation, complete original source, receipt controls and payload packs together. Missing original is unavailable; it cannot be reconstructed from a GUI model or a supplied hash.
  The derived projection key is bsd_workflow_binding_created_projection.v1:{scope_partition}:{hex(owner_operation_id)}. It holds only the original source/event refs and Storage identities. The derived checkpoint key is bsd_workflow_binding_created_checkpoint.v1:{scope_partition}:{storage_instance_id} for projector.bsd.workflow_binding_created@1.0.0. Both use RP-PROJECTION-3GEN with holds; source event retention is independently "PENDING_RETENTION_DECISION". A pending retention marker is never a valid production registry reference. Every complete encoded value must stay at or below 16 KiB; SP-337 externalizes referenced bodies before limits, rather than leaving an oversized operation value. Canonical/derived placement and actual disk budgets require existing SP-340 admission, never unbounded storage.
  The exact operational reader is reader.bsd.workflow_binding_created@1.0.0 for PlanningWorkflow::bsd_stage_binding_projection. It explicitly adopts SP-278 reader.storage.event_record_index@1.0.0, its CURRENT-selected actual root, globally complete verified source selection/coverage, authenticated generation anchor and advancing frontier. It scans in ascending Storage sequence, never timestamp order; the examined cursor cannot regress. It scans the complete captured range with exactly the bsd.workflow_binding_created/Project/version filter, resolves full values/payload refs, verifies actual storage_instance_id, partition, sequence/event/payload/source joins and original full-value custody before processing a match. Verified nonmatches are scanned; corruption, unsupported input or missing proof is unavailable/degraded, never skipped as empty. Apply the immutable event reference to only its rebuildable derived row. In one actual redb transaction compare-and-swap the entire old checkpoint and atomically commit all changed rows with last_scanned_sequence, last_matched_event_id, source selection and the nine-field durable read token. An empty source has a null cursor; a nonempty zero-match range still advances its examined cursor. Each durable token field is rejoined to actual Storage controls, then the current live snapshot supplies its transient tenth redb_snapshot_id field. Same generation alone cannot prove a frontier unchanged. Inclusive restart rechecks the last exact event/frame/offset; replay produces no review, advice delivery, notification, Usage charge, canonical write or new event.
  Historical inspection validates authenticated original admission/schema/recipe and source custody before the retained event, but never reruns current live-epoch/state/precondition checks. Current access, deletion and withdrawal checks still apply. Genuine older history after a live change stays readable; substituted or withdrawn originals refuse. Schema/version selection cannot be caller-chosen to weaken validation. Complete withdrawal fences writer admission at the actual cutoff, resolves pending issued results, invalidates reader/checkpoint publications and requires governed successor rebuild; missing source is explicitly unavailable, not a rebuilt success. Physical replay/restore/migration remains unimplemented and unadmitted.
gui_related: false
gui_classification_reason: Defines internal event, identity, Storage custody or validation, without changing presentation.
depends_on:
- SP-318
- SP-278
- SP-286
- SP-337
- CV-1364
unblocks: []
acceptance_criteria:
- Exact family semantics, payload, original-source identity and retry custody are bound.
- No unregistered append, physical admission or native/runtime success is implied.
- Phase-2 oracle and shared guard-isolation proof remain mandatory before review/admission.
validation_surfaces:
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
- Plans/bsd_event_oracle_plan.json
risk_class: advisory_history_identity_custody_or_replay_drift
reasoning_tier: high
context_scope: event_authority_w3d_phase1
implementation_surfaces:
- Plans/storage-plan.md
- Plans/bsd_event_payloads.schema.json
- Plans/bsd_event_storage_contracts.schema.json
- Plans/bsd_event_storage_candidates.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3D.md
- Deck-2 item 9.a A (answer record 2026-11-05; DL-450 application pending)
preserved_exact_tokens:
- bsd.workflow_binding_created
- SP-318
- SP-278
- SP-286
- SP-337
- RP-EVENT-IDENTITY-APPROOT
- RP-PROJECTION-3GEN
negative_constraints:
- Do not append a registry family, admit an event, enable BSD commands or treat static definitions as runtime evidence.
- Do not define a local number/timestamp implementation or guard-isolation proof engine.
owner_hints:
- Plans/storage-plan.md
```


### SP-1365 - Pending BSD original lifecycle source graph

```yaml
plan_unit_id: SP-1365
unit_type: storage_contract
status: draft
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored pending original-source graph for the fifteen W3D event contracts. SP-318 remains physical_family_registration_pending
  and no physical registry family is appended. Plans/bsd_event_storage_candidates.json stages seven canonical immutable source
  wrapper rows: bsd_source_policy, bsd_source_workflow_binding, bsd_source_assignment, bsd_source_review_cycle, bsd_source_finding
  and bsd_source_quarantine, plus bsd_source_review_start for pre-dispatch admission. The original six preserve, rather than fork, the complete logical definitions pm.bsd.policy.v1, pm.bsd.workflow_binding.v1,
  pm.bsd.assignment.v1, pm.bsd.review_cycle.v1, pm.bsd.finding.v1 and pm.bsd.quarantine.v1 in Plans/back_seat_driver_contracts.schema.json.
  Each proposed key is bsd_source_<kind>.v1:{scope_partition}:{hex(subject_id)}:{hex(owner_operation_id)}; project_id supplies
  the existing policy subject, then binding_id, bsd_assignment_id, review_cycle_id, bsd_finding_id and quarantine_id supply
  the other subjects. Exact UTF-8 byte hex is injective and never a time/counter recipe. source_state_ref names this actual
  immutable wrapper, not an arbitrary caller snapshot. Its opaque SP-337 payload reference, byte size and media type identify
  the complete logical body under Storage''s declared MessagePack profile; validate logical schema and all source joins before
  use. Every complete encoded wrapper separately obeys 16 KiB and actual SP-340 budgets. No unredacted transcript, protected-authentication
  content or raw quarantine output is added to an event.

  The separate bsd_source_review_start wrapper uses subject_id=review_cycle_id and logical_schema_id=pm.bsd.review_start.v1,
  with the closed review_start body in Plans/bsd_event_storage_contracts.schema.json. Its exact fields are schema tags,
  review_admission_id, project_id, policy_revision, binding_id, bsd_assignment_id, primary_run_id, epoch, primary_generation,
  review_cycle_id, trigger_kind, trigger_reason, input_manifest_ref, redaction_receipt_ref, frozen_boundary, assignment_ref,
  binding_ref, admission_ref, origin_context_ref, cursor_ref, stable_prefix_hash and requested_effective_snapshot_ref.
  These are the owner start facts from BSD sections 4/5/6/16; references resolve immutable originals, not current caller flags.
  review_admission_id is the actual owner-issued identity of accepted review admission before provider work, never a local
  timestamp/counter or future provider-result identity. original_source_ref resolves that admission; admission_ref proves
  actual Shared Integration Runtime acceptance, and origin_context_ref preserves its authentic envelope lineage, actor,
  requested/effective account and causal facts. source_state_ref and the start payload review_start_ref name this same wrapper.
  No result, latency, no-call placeholder or terminal body is present at start. The six logical schemas remain unchanged.
  After genuine outcome evidence exists, source_review_cycle preserves the complete existing pm.bsd.review_cycle.v1 plus
  required review_start_ref in its wrapper. That reference joins the authentic original admission: cycle, assignment, trigger,
  primary generation, input manifest and frozen-boundary facts must match field by field. Never synthesize silent, null or
  another outcome to satisfy start custody, and never rewrite the start when an outcome arrives. No-call-only cycles remain
  on their existing owner path and cannot masquerade as this started-review route. The existing review-cycle head selects the
  start wrapper after the start barrier receipt, then a matching terminal wrapper by exact old-head CAS only when its result
  exists. A completed start operation acknowledges its own append receipt, not a completed review. Both wrappers and all linked
  pack bodies/receipts restore as one coherent cut; retry/recovery resolves original admission before any permitted dispatch,
  and historical replay dispatches none. The additional start wrapper uses the same actual assignment/run RP-RUNTIME-365D
  source-value rule and reference protections as the review wrapper; no event-history retention decision is added.

  Every immutable source wrapper also stores original_source_ref, resolving the genuine original owner operation and its captured accepted inputs. The finding wrapper additionally requires identity_inputs_ref, pointing to SP-337 pack bytes validated by the exact closed finding_identity_inputs definition in Plans/bsd_event_storage_contracts.schema.json. This metadata-only manifest preserves original_source_ref, the original finding_family classification token, exact affected_object_refs and rule_or_constraint_refs, and the verified evidence_fingerprint/evidence_source_ref. Its refs and fingerprint must agree with the actual original logical finding and evidence-owner commitment. It supplies the operands for CV-1350 and CV-1355..CV-1358 finding-key recomputation, never a trusted caller key. Original source custody preserves these immutable operands and their actual original admission/recipe evidence; a retained read does not reacquire a now-retired provider session or current mutable evidence. Missing original custody is still unavailable. No finding claim or raw advisor output is copied into this identity manifest.
  An original operation comes from the genuine accepted command/start/lifecycle/deadline/provider result, carrying the real
  actor, Project, thread/run, binding, assignment, epoch, generation, permission/Stop/writer-generation and causal commitments
  that actually apply. A source wrapper and its exact-family pending_event operation are prepared together under the original
  owner compare-and-swap; the selected current lifecycle head cannot publish this new state before SP-286/CV-339 original
  first receipt/full-value v2 resolution. The complete operation and actual owning head are published atomically after the
  barrier receipt. A pending source is not current state, and a supplied hash/reference or synthetic all-true fixture is not
  an owner capability. Recovery authenticates the original accepted source, wrapper/body, pending operation, genuine Storage
  receipt/full original value and current restore controls before settling; it never first-mints a prior success or dispatches
  a second review. Missing pending/original evidence remains unavailable. A canonical head must use the existing owner/migration
  binding on physical admission; these wrappers are immutable history/source custody, not a replacement head or a new preference
  engine.

  Policy and binding source values use the existing RP-CONFIG-CURRENT current-plus-history policy, with frozen run/review/live
  references and coherent backups holding any referenced historical version; this is a current configuration value policy
  and does not assign the two event-history lifetimes, which DL-453 item 1.a now assigns to RP-AUTHORITY-INDEFINITE@1.0.0
  (Plans/storage-plan.md:17638,17642 at main f8b2098608). Assignment, review, finding and quarantine source values use
  RP-RUNTIME-365D through their actual primary assignment/run, with held/closure/recovery/live/backup references protected
  before run-completion expiry. Raw advisor transcript/output retains its independently owned content deletion/retention rules
  and is not kept merely because a metadata wrapper survives. The actual immutable closure and held records live outside the
  transcript and restore before another review; current head/epoch joins, not model memory, decide delivery eligibility.

  Mandatory coherent backup includes source wrappers and their logical pack bodies, actual owner heads, exact-family operation
  values and SP-286 receipt/full-value controls in the same verified cut. Preserve original logical and physical identities,
  schema versions and access/deletion/withdrawal state; a missing or conflicting source is unavailable, never reconstructed
  from bsd_runtime_record or a filtered event projection. Physical family/migration/budget/readiness admission and native
  restore proof remain separately required. No command is enabled; the two configuration event histories carry the DL-453
  RP-AUTHORITY-INDEFINITE@1.0.0 assignment and the thirteen assignment-backed histories carry RP-RUNTIME-365D@1.0.0,
  and no EventRecord is admitted by this source graph.'
gui_related: false
gui_classification_reason: Defines original-source custody and pending storage shapes.
depends_on:
- SP-318
- SP-286
- SP-337
- BSD-024
unblocks: []
acceptance_criteria:
- Source wrappers bind all six existing logical kinds and the separate pre-dispatch review admission without registry append or handler activation.
- Original source, lifecycle head and operation settlement use authentic custody and coherent backup.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- Plans/bsd_event_oracle_plan.json
risk_class: unproved_original_advisor_source_custody
reasoning_tier: high
context_scope: event_authority_w3d_source_graph
implementation_surfaces:
- Plans/storage-plan.md
- Plans/bsd_event_storage_contracts.schema.json
- Plans/bsd_event_storage_candidates.json
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/storage-plan.md#SP-318
- reports/event-authority-20261105/W3D.md
preserved_exact_tokens:
- SP-318
- SP-286
- SP-337
- RP-CONFIG-CURRENT
- RP-RUNTIME-365D
negative_constraints:
- No physical or event family append, admission, new preference engine, command activation or native proof.
owner_hints:
- Plans/storage-plan.md
```
