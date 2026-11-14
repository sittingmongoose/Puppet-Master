# Shard 148: W3I continuity source-lineage persistence — prepared without admission (2026-11-05)

Source: `Plans/storage-plan.md`

Source lines: L64782-L65054

Source SHA256: `5065d9e04e53131a2344a6f1759caa92647dc0714c5e80d03fd384f1779318fb`

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
