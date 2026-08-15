# Shard 043: Case L Durable-State Contract Addendum - 2026-07-17

Source: `Plans/Contracts_V0.md`

Source lines: L20462-L20868

Source SHA256: `09408a3e335023db2cf93ebf921993c37ed9166827985d47eeef27ba02b99dbd`

---

## Case L Durable-State Contract Addendum - 2026-07-17

This addendum is the Contracts-owner portion of the approved Case L repair package. Approval source: `PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md`, which approves bundles A-F without exception. Storage owns framing, persistence, migration, backup, retention, compaction, quarantine custody, and recovery algorithms; FileSafe owns restore execution and equality. Contracts owns only the shared envelopes, closed outcomes, event registrations, and cross-surface status shapes below. These contracts create no runtime implementation, WorkNodes, NodeSeeds, executable queues, build tasks, or certification evidence.

### Durable append receipt and storage recovery events

`AppendReceipt` is the only successful durable-append acknowledgement shape. Required fields are `event_id`, `sequence_id`, `segment_generation`, `segment_name`, `byte_offset`, `commit_group_id`, `durability_class`, `durable_end_offset`, `durability_state`, `manifest_generation`, and `acknowledged_at_utc`. `durability_class` is `ordinary | barrier`; `durability_state` is const `synced`. The receipt becomes valid only after the storage-owned frame and manifest/watermark durability barriers complete. `EventRecord.persisted_at_utc` is the writer's commit-group time and is not proof of persistence without the matching synced receipt. A failed/unknown barrier returns no successful receipt.

Contracts registers these `application_only` EventRecord families; storage owns their exact payload schemas and recovery behavior:

| Event type | Cross-contract payload minimum |
|---|---|
| `storage.integrity_detected` | payload `schema_version`, `integrity_id`, non-secret storage-root ref/hash, segment identity/hash/state, frame version, `failure_class`, detection/last-good/next-good offsets, expected/observed CRC when known, `impact_precision`, affected byte/sequence/event ranges when proven, durable-watermark relation, `report_ref` |
| `storage.recovery_applied` | payload `schema_version`, `recovery_id`, `integrity_id?`, `action`, pre/post segment and manifest hashes, pre/post lengths, excluded ranges, sequence gaps, survivor digest, checkpoint action, projection action, `durability_receipt_ref`, `user_disclosure_required` |
| `storage.boot_recovery` | payload `schema_version`, deterministic `recovery_set_id`, referenced integrity/recovery IDs, interrupted transaction kinds, final manifest generation/recovery epoch/active segment identity, `repeat_of?` |

`impact_precision` is `exact_event | exact_byte_range | bounded_sequence_range | unknown_segment_remainder`. The IDs and idempotency keys are deterministic from action kind, target preimage hash, affected range, and precondition manifest generation. Retrying one recovery episode returns the original event/result and never appends a semantic duplicate. Application scope requires `project_id=null`; affected project/run/event identities appear only when proven in the payload and never as a fabricated envelope project.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Contracts_V0.md#EventRecord

### Retention, compaction, deletion, quarantine, and recovery-unavailable events

`CV-083` remains the boundary: `Plans/storage-plan.md` owns policy values, cadence, caps, eligibility, holds, compaction, deletion, and quarantine custody. Contracts registers only these payload envelopes:

| Event type | Scope policy | Cross-contract payload minimum and closed state |
|---|---|---|
| `storage.retention_hold_changed` | `application_or_project` | `schema_version`, `hold_id`, semantic scope ref, `action=set|clear`, actor ref, reason, occurred time, policy/anchor refs, affected semantic refs, receipt ref |
| `storage.compaction_lifecycle_changed` | `application_only` | `schema_version`, `compaction_id`, source/target generation refs, `phase=preparing|building|verified|commit_pending|committed|finalized|recovery_required|failed`, policy revision/hash, survivor/removal-map refs, `checkpoint_action=translate_by_semantic_identity|invalidate_and_rebuild`, `projection_action=activate_verified_target_shadow|rebuild_from_survivors`; non-empty `failure_reason` is required exactly for `recovery_required|failed` and forbidden for the six ordinary phases |
| `storage.value_quarantine_changed` | `application_or_project` | `schema_version`, `quarantine_id`, semantic source ref, expected/observed schema, raw-byte custody hash/ref, risk class, `state=detected|secured|migrated|rebuilt|reset_to_default|restored|recovery_blocked|purged`, actor/reason, receipt ref |
| `storage.deletion_lifecycle_changed` | `application_or_project` | `schema_version`, `deletion_id`, semantic deletion scope, `state=requested|logically_hidden|held|purge_pending|purged|failed`, actor/ref, hold blockers, purge deadline, content-free tombstone ref; generation is absent for `requested|logically_hidden|held|failed`, optional non-negative integer for `purge_pending`, and required non-negative integer for terminal `purged`; non-empty failure reason is required exactly for `failed` and forbidden otherwise |
| `safe_point.recovery_unavailable` | `project_only` | `schema_version`, `safe_point_id`, `run_id`, `node_id`, `attempt_id?`, `blocked_sequence`, missing/corrupt snapshot refs, last verified manifest hash?, preserved-local-work state, allowed action IDs, anchor ref, receipt ref |

Storage remains the sole lifecycle and visibility owner for both rows. Compaction's only ordinary chain is `preparing -> building -> verified -> commit_pending -> committed -> finalized`. Proven pre-publication source authority permits `preparing|building|verified|commit_pending -> failed`; ambiguity at any nonterminal ordinary phase, and incomplete/unproven post-`CURRENT` convergence at `commit_pending|committed`, enters `recovery_required`. Its only exits are proof-gated `recovery_required -> failed` with source authority or `recovery_required -> committed` with verified target authority, followed by ordinary finalization. `finalized` and `failed` are terminal for one `compaction_id`; retry after terminal failure is a new identity after owner revalidation. Synchronized `CURRENT` is the sole source/target visibility authority: source wins before it and target wins after it. Action tokens record selected modes but cannot claim their effect before the phase predicate.

Deletion's ordinary owner graph is `requested -> logically_hidden`, then `logically_hidden -> held|purge_pending`, `held -> purge_pending` only after owner-cleared holds and complete revalidation, and `purge_pending -> purged` only after verified committed successor-generation authority. `failed` ingress is admitted only from `requested|logically_hidden|purge_pending`; `held` remains held, and `purged` is terminal. Retry from fenced `failed` reuses the same `deletion_id` and existing deletion-operation idempotency identity and revalidates holds, tombstone, scope, storage-writer posture, and purge/compaction authority. For `application_or_project`, absent payload `project_id` requires application envelope scope with envelope `project_id=null`; present non-empty payload `project_id` requires project scope and byte equality with the envelope project ID. Conflict or ambiguity quarantines before append. These summaries consume Storage semantics and do not create a peer lifecycle owner.

Policy, hold, anchor, deletion, and quarantine references use semantic identities such as project/thread/run/event/safe-point/receipt IDs or closed selector objects. Segment offsets, file mtimes, and physical path strings are not legal retention authority. A required but unregistered policy fails safe to indefinite/no-count-eviction and marks the family materially incomplete; it never authorizes deletion.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Contracts_V0.md#EventRecord

### Restore-point lifecycle event registration

The safe-point outcome and conflict enums in §3 are authoritative. `restored_clean` requires target-manifest equality; `restore_failed` requires rollback-manifest equality; `restore_refused` precedes path mutation; `restore_recovery_required` preserves the mutation fence. Snapshot corruption and unsupported content scope are distinct from a missing snapshot.

Contracts also registers project-scoped user restore-point lifecycle events, distinct from `safe_point.*` and `runtime_artifact.restore_point`:

| Event type | Cross-contract payload minimum |
|---|---|
| `restore_point.created` | `schema_version`, `restore_point_id`, `project_id`, source thread/branch/message boundary refs, record ref/hash, context/provenance/attachment/citation refs, optional `safe_point_id`, status `available`, created time |
| `restore_point.applied` | `schema_version`, `application_id`, `restore_point_id`, `project_id`, source thread/branch refs, required new thread/branch IDs, equal lowercase 64-hex expected/observed record hashes, persisted result const `branched`, applied time |
| `restore_point.expired` | `schema_version`, `restore_point_id`, `project_id`, prior hash, status `expired`, retention policy/ref-release evidence, occurred time |
| `restore_point.deleted` | `schema_version`, `restore_point_id`, `project_id`, prior hash, status `deleted`, actor/ref, reason, occurred time |
| `restore_point.corrupt` | `schema_version`, `restore_point_id`, expected/observed hash, status `corrupt`, reason code, occurred time |

Restore-point status is `available | expired | deleted | corrupt`; successful application does not consume the record. `refused | failed` are typed `cmd.chat.branch_from_restore` command results, carry no target IDs, and emit no `restore_point.applied` EventRecord; they are not persisted payload variants. An optional `safe_point_id` is lineage only and never silently restores files. Assistant Chat owns creation/application/branch behavior; storage owns `rp:` persistence/retention; Runtime Artifacts projects the record but owns neither lifecycle nor identity.

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Runtime_Artifacts_Panel.md

### Storage fallback divergence command envelopes

Storage owns divergence detection, lock/maintenance ordering, root/binding mutation, encrypted custody, crash reconciliation, and receipt persistence. This section owns the shared typed request/result/receipt shapes consumed by command, GUI, wiring, and test surfaces. It does not authorize a consumer to select authority, infer a command from a generic disposition, or persist an EventRecord.

`StorageFallbackDispositionRequest` is a closed tagged union over exactly these command IDs:

| `command_id` | Required variant fields | Required confirmation |
|---|---|---|
| `cmd.storage.fallback.keep_logical_root` | common fields only | `retain_fallback_and_select_logical` |
| `cmd.storage.fallback.fork_new_instance` | common fields only | `create_inactive_candidate_without_switch` |
| `cmd.storage.fallback.export_both` | common fields plus `destination_ref`, `encryption_key_ref` | `encrypt_exact_bytes_and_retain_sources` |

Common required fields are `command_id`, non-empty `idempotency_key`, non-secret `actor_ref`, `confirmation`, `expected_storage_instance_id`, `expected_logical_root_fingerprint`, non-negative `expected_root_generation`, `expected_fallback_branch_id`, non-secret `expected_fallback_base_ref`, `expected_logical_head_sha256`, `expected_fallback_head_sha256`, and `expected_bootstrap_binding_sha256`. The storage/branch instance IDs are UUIDs. Every fingerprint/head/binding SHA-256 is lowercase 64-hex. The export refs are explicit, non-secret stable references; `encryption_key_ref` contains no key material. Additional or wrong-variant fields are invalid. The storage owner revalidates all eight CAS components; no consumer-computed aggregate replaces them.

`StorageFallbackDispositionResult` is closed with required fields `command_id`, `idempotency_key`, `outcome`, `reason_code`, `storage_access_mode`, `storage_mode_reason`, `active_bootstrap_binding_sha256`, `logical_head_sha256`, `fallback_head_sha256`, `retained_logical_root_ref`, `retained_fallback_root_ref`, `binding_changed`, `cleanup_performed`, `owner_receipt_ref`, `candidate_binding`, and `export_custody`. `outcome = applied | replayed | refused | failed_recoverable`. Applied/replayed requires `reason_code=null` and non-null `owner_receipt_ref`; refused/failed returns the storage-owner reason and may have a nullable receipt only when the owner could durably record the refusal/failure. `cleanup_performed` is const false.

Result variants are exact:

- Keep-logical success has `binding_changed=true`, both candidate/export fields null, and active binding equal to the verified logical-root binding. Both root refs remain retained.
- Fork success has `binding_changed=false`, export null, and non-null closed `candidate_binding = {storage_instance_id, parent_storage_instance_id, parent_fallback_branch_id, candidate_binding_ref, candidate_bootstrap_binding_sha256, candidate_binding_state:"inactive"}`. The active binding is unchanged.
- Export success has `binding_changed=false`, candidate null, and non-null closed `export_custody = {destination_ref, package_ref, manifest_ref, encryption_algorithm, encryption_key_ref, logical_bytes, logical_sha256, fallback_bytes, fallback_sha256, verified_at_utc}`. Both source heads and active binding are unchanged.
- Refused/failed results set both variant objects null and cannot claim a changed binding, cleanup, custody verification, candidate activation, or imported bytes.

`StorageFallbackResolutionReceipt` is closed and requires `receipt_id`, `command_id`, `idempotency_key`, `canonical_request_sha256`, `disposition`, `outcome`, `reason_code`, `actor_ref`, `observed_cas`, `before_active_bootstrap_binding_sha256`, `after_active_bootstrap_binding_sha256`, `before_logical_head_sha256`, `after_logical_head_sha256`, `before_fallback_head_sha256`, `after_fallback_head_sha256`, `retained_logical_root_ref`, `retained_fallback_root_ref`, `resulting_storage_instance_id`, `candidate_binding_ref`, `candidate_bootstrap_binding_sha256`, `export_package_ref`, `export_manifest_ref`, `encryption_key_ref`, `binding_changed`, `cleanup_performed`, and `completed_at_utc`; nullable variant fields remain required-present. `observed_cas` repeats exactly the eight common CAS components. `canonical_request_sha256` and every recorded hash are lowercase 64-hex. The receipt is durable owner audit/query evidence only: it is not an EventRecord payload, does not register `storage.fallback_reconciled`, and cannot be substituted by a command dispatch receipt or GUI projection.

ContractRef: ContractName:Plans/storage-plan.md#approved-fallback-divergence-disposition-owner-contract, ContractName:Plans/Decision_Log.md#DL-033

### Storage compatibility and migration status envelope

`StorageCompatibilityStatus` is a cross-surface startup diagnostic, not an EventRecord written into the store being diagnosed. Required fields are `status_id`, `storage_root_ref`, `open_state`, `store_results[]`, `writer_app_version?`, `running_app_version`, `max_supported_versions`, `data_unchanged`, `allowed_action_ids[]`, `diagnostic_ref?`, and `checked_at_utc`. `open_state` is `checking_compatibility | blocked_newer_store | blocked_corrupt_or_incomplete_store | blocked_recovery_failed | ready`. Each store result names a stable store kind/ref, observed version, maximum supported version, reader availability, and reason code without exposing an absolute local path. `blocked_newer_store` requires `data_unchanged=true` and allows only update check, compatible-backup choice, diagnostics, or quit; it never exposes `try_anyway` or live viewer mode.

`MigrationPreflightResult` resolves to `Plans/storage_recovery_contracts.schema.json#/$defs/migration_preflight_result`. It requires exactly `outcome`, required-present `reason_code`, `filesystem_ref`, `free_bytes`, `required_free_bytes`, `backup_bytes`, `staging_bytes`, `reserve_bytes`, and `checked_at_utc`. The selected vocabulary is `outcome = ready | blocked` and `reason_code = null | blocked_insufficient_space`; ready pairs only with null and sufficient free bytes, while blocked pairs only with `blocked_insufficient_space` and insufficient free bytes. The storage sidecar's mandatory arithmetic assertions own the reserve and required-free formulas. Contracts does not restate or weaken them.

`MigrationProgressSnapshot` resolves to `Plans/storage_recovery_contracts.schema.json#/$defs/migration_progress_snapshot` and is derived only from the matching durable migration journal. Required fields are `migration_id`, `journal_ref`, `phase`, `stable_step_label`, `completed_steps`, `total_steps`, `cancellable`, and `updated_at_utc`; paired optional `bytes_done`/`bytes_total`, `preflight_result`, `backup_ref`, `data_loss_risk`, and `terminal_receipt_ref` are admitted only as the sidecar permits. Closed phases are exactly `preflight | backup_in_progress | backup_verified | applying | pre_stamp_verified | stamp_committed | post_stamp_verifying | committed | restore_required | restoring | rolled_back | blocked`. Counts obey `0 <= completed_steps <= total_steps`; byte fields are both present or both absent and, when present, obey `0 <= bytes_done <= bytes_total`. Only preflight is cancellable. Percentage and ETA fields are forbidden rather than inferred.

Terminal linkage follows the sidecar: committed/rolled-back progress and post-admission blocked progress reference the one storage-registry `pm.storage_value.migration_receipt.v1`; an insufficient-space no-mutation preflight block has no terminal migration receipt; nonterminal progress forbids one. The progress snapshot is not durable receipt authority, and Contracts creates no peer migration receipt.

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/storage_recovery_contracts.schema.json#/$defs/migration_preflight_result, ContractName:Plans/storage_recovery_contracts.schema.json#/$defs/migration_progress_snapshot, ContractName:Plans/storage_value_registry.json#/families/migration_receipt/value_schema, ContractName:Plans/Release_Supply_Chain.md, ContractName:Plans/FinalGUISpec.md

### CV-317 - Case L EventRecord Scope, Legacy Normalization, And Replay Contract

```yaml
plan_unit_id: CV-317
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  EventRecord 2.0 requires scope_kind application or project and conditionally
  null/non-empty project_id; enforces app-root-global event identity and
  scope-partition/event-type lifetime idempotency; normalizes admitted
  EventEnvelopeV1 values deterministically in memory only; and makes
  projector_replay_only non-appendable, idempotent, checkpoint-atomic, and
  incapable of external or canonical side effects.
gui_related: false
gui_classification_reason: Defines durable event identity, compatibility normalization, and replay safety.
depends_on: [CV-087, CV-088, CV-309]
unblocks: []
acceptance_criteria:
  - Application events validate only with scope_kind application and project_id null; project events require a non-empty project_id.
  - Repeated legacy normalization under the same verified source context and registry revision is byte-identical and does not mutate source bytes or append.
  - Global event-id and scoped idempotency duplicates return the original only for the same semantic digest; conflicts do not append.
  - A stale/unavailable dedupe accelerator catches up through the verified tail or append fails closed.
  - projector_replay_only cannot produce external, canonical-storage, scheduling, outbox, usage, command, tool, network, notification, or append side effects.
validation_surfaces:
  - python3 -m json.tool Plans/event_record.schema.json
  - future EventRecord scope, legacy golden-file, dedupe, and replay-only fixtures
risk_class: case_l_eventrecord_scope_replay_drift
reasoning_tier: high
context_scope: case_l_eventrecord_contract
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/event_record.schema.json
  - Plans/storage-plan.md
  - Plans/storage_value_registry.json
node_compile_hint:
  mode: case_l_eventrecord_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-008
  - Case-L:L-009
  - Case-L:L-023
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/EVENT_RECORD_REPAIR_PLAN.md
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/CASE_L_APPROVAL_2026-07-17.md
preserved_exact_tokens:
  - scope_kind
  - application
  - project
  - projector_replay_only
  - dedupe_unavailable
  - legacy-event-v1
negative_constraints:
  - Do not fabricate a project for application scope.
  - Do not append or durably rewrite EventEnvelopeV1 during ordinary replay.
  - Do not admit an append while dedupe state is behind the verified seglog tail.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/event_record.schema.json
```

### CV-318 - Case L Durable Append And Recovery Event Envelopes

```yaml
plan_unit_id: CV-318
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  AppendReceipt proves a synced frame-plus-manifest durability boundary, and
  application-scoped storage.integrity_detected, storage.recovery_applied, and
  storage.boot_recovery payloads carry deterministic recovery identity, proven
  impact, survivor/checkpoint aftermath, and truthful disclosure references
  without fabricating a project or re-owning storage algorithms.
gui_related: false
gui_classification_reason: Defines shared durability and recovery payloads; GUI consumes disclosure separately.
depends_on: [CV-309, CV-317, SP-230]
unblocks: []
acceptance_criteria:
  - AppendReceipt success is possible only with durability_state synced after both storage barriers.
  - Recovery events are application-scoped, deterministic, idempotent, and carry only proven impact identities.
  - persisted_at_utc without a matching synced AppendReceipt is not successful persistence evidence.
validation_surfaces:
  - future seglog durability and crash-recovery fixture suite
risk_class: case_l_append_recovery_contract_drift
reasoning_tier: high
context_scope: case_l_seglog_contract_envelopes
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
node_compile_hint:
  mode: case_l_append_recovery_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-004
  - Case-L:L-007
  - Case-L:L-013
  - Case-L:L-019
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/SEGLOG_RECOVERY_REPAIR_PLAN.md
negative_constraints:
  - Do not treat write or buffer-flush completion as durable acknowledgement.
  - Do not use timestamps or projections to invent lost event identity.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### CV-319 - Case L Retention And Quarantine Event Envelopes

```yaml
plan_unit_id: CV-319
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Contracts registers closed retention-hold, compaction, deletion, quarantine,
  and recovery-unavailable event payload envelopes using semantic scope and
  policy/anchor refs, while storage and FileSafe retain ownership of policy
  values, custody, eligibility, recovery anchors, and lifecycle mechanics.
gui_related: false
gui_classification_reason: Defines backend event envelopes consumed by later settings, recovery, and audit presentation.
depends_on: [CV-083, CV-309, CV-317]
unblocks: []
acceptance_criteria:
  - Every registered payload uses the closed action/phase/state enum and semantic identity refs.
  - Physical offsets, mtimes, and local paths cannot become retention or legal-hold authority.
  - Missing policy registration fails safe to indefinite/no-count-eviction and materially incomplete.
validation_surfaces:
  - future retention, compaction, deletion, and quarantine fixture suite
risk_class: case_l_retention_quarantine_contract_drift
reasoning_tier: high
context_scope: case_l_retention_event_envelopes
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/FileSafe.md
node_compile_hint:
  mode: case_l_retention_event_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-005
  - Case-L:L-010
  - Case-L:L-015
  - Case-L:L-033
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/RETENTION_COMPACTION_REPAIR_PLAN.md
negative_constraints:
  - Do not let this envelope table re-own storage retention or compaction mechanics.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### CV-320 - Case L Restore Outcomes And Restore-Point Events

```yaml
plan_unit_id: CV-320
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Restore outcomes distinguish verified target equality, verified rollback,
  no-mutation refusal/skipping, and unresolved recovery; the closed conflict
  family distinguishes missing, corrupt, unsupported, concurrent, and recovery
  states; safe-point payloads carry manifest/digest evidence; and user-facing
  restore-point lifecycle events remain distinct from safe points and artifacts.
gui_related: true
gui_classification_reason: Restore outcomes and restore-point lifecycle are surfaced to users, while mechanics remain owner-routed.
depends_on: [CV-224, CV-225, CV-226, CV-227, CV-228, CV-309]
unblocks: []
acceptance_criteria:
  - restored_clean and restore_failed cannot be emitted without target or rollback equality respectively.
  - restore_refused performs no path mutation and restore_recovery_required retains the mutation fence.
  - Safe-point created/restored payloads carry snapshot and pre/target/post digest evidence.
  - Restore-point application creates new thread/branch identity and never silently restores files.
validation_surfaces:
  - future FileSafe restore, corruption, restart, and restore-point lifecycle fixture suite
risk_class: case_l_restore_outcome_contract_drift
reasoning_tier: high
context_scope: case_l_restore_contracts
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/FileSafe.md
  - Plans/storage-plan.md
  - Plans/assistant-chat-design.md
node_compile_hint:
  mode: case_l_restore_outcome_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-006
  - Case-L:L-010
  - Case-L:L-020
  - Case-L:L-021
  - Case-L:L-022
  - Case-L:L-024
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/RESTORE_SAFEPOINT_REPAIR_PLAN.md
negative_constraints:
  - Do not claim original state preserved unless rollback equality is verified.
  - Do not collapse restore points into safe points or runtime artifacts.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/FileSafe.md
```

### CV-321 - Case L Storage Compatibility And Migration Status Envelope

```yaml
plan_unit_id: CV-321
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  StorageCompatibilityStatus carries fail-closed version/open diagnostics and
  exact allowed actions without mutating an incompatible target, while
  the strict storage recovery sidecar owns MigrationPreflightResult arithmetic,
  ready/blocked pairing, and MigrationProgressSnapshot journal projection with
  closed phases, paired bounded counts, preflight-only cancellation, and exact
  terminal relationships to the one durable migration receipt authority.
gui_related: true
gui_classification_reason: Defines the shared status/progress envelopes rendered by startup and recovery UI.
depends_on: [CV-309, CV-317]
unblocks: []
acceptance_criteria:
  - A newer-store status is diagnostic-only, data_unchanged, and never appended to the incompatible EventRecord target.
  - Blocked newer-store actions exclude try-anyway and live viewer mode.
  - Preflight uses the approved required-free formula and only ready/null/sufficient or blocked/blocked_insufficient_space/insufficient pairings.
  - Migration progress uses all twelve exact journal phases, paired measurable bytes, bounded steps, and never invents percentage or ETA.
  - Only preflight is cancellable; terminal receipt refs obey the sidecar and reference rather than duplicate the storage-owned migration receipt.
validation_surfaces:
  - python3 Draft202012Validator check and representative sidecar instance suite
  - future storage compatibility, downgrade, migration, and recovery fixture suite
risk_class: case_l_storage_compatibility_envelope_drift
reasoning_tier: high
context_scope: case_l_migration_status_contract
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/storage_recovery_contracts.schema.json
  - Plans/Release_Supply_Chain.md
  - Plans/FinalGUISpec.md
node_compile_hint:
  mode: case_l_storage_compatibility_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-001
  - Case-L:L-002
  - Case-L:L-003
  - Case-L:L-016
  - Case-L:L-025
  - Case-L:L-032
  - PuppetMaster-AssuranceLab/orchestration-2026-07-17/phase2-case-L/planning/MIGRATION_BACKUP_REPAIR_PLAN.md
negative_constraints:
  - Do not append compatibility status to a store whose EventRecord version is unsupported.
  - Do not let a cross-surface envelope re-own storage migration or backup algorithms.
  - Do not create a peer migration receipt or accept structural schema validation without mandatory arithmetic assertions.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```

### CV-322 - Case L Fallback Divergence Command Envelopes

```yaml
plan_unit_id: CV-322
unit_type: schema_contract
status: accepted
owner_doc: Plans/Contracts_V0.md
canonical_text: >-
  Three closed fallback-divergence requests carry exact command identity,
  command-specific confirmation, and eight owner-revalidated CAS components;
  their closed results distinguish keep-logical binding selection, inactive
  fork candidate, and exact-byte encrypted dual-root custody; and one owner
  receipt supplies durable audit without an EventRecord family.
gui_related: true
gui_classification_reason: The shared request/result shapes drive three independently visible recovery controls and their blocking outcomes.
depends_on: [CV-309, CV-321, SP-240]
unblocks: []
acceptance_criteria:
  - The request union contains exactly cmd.storage.fallback.keep_logical_root, cmd.storage.fallback.fork_new_instance, and cmd.storage.fallback.export_both with no generic disposition command.
  - Each command carries and owner-revalidates all eight explicit CAS fields; any mismatch returns state_changed with no root, binding, destination, or successful-receipt mutation.
  - Fork success returns candidate_binding_state inactive and binding_changed false; export success verifies exact bytes, reports non-secret manifest/key refs, and performs no cleanup.
  - Same-key retry returns the same owner receipt; no success or failure requires or emits storage.fallback_reconciled or any other new EventRecord family.
validation_surfaces:
  - future fallback divergence request/result/receipt and crash-cut fixture suite
risk_class: fallback_divergence_authority_and_custody_drift
reasoning_tier: high
context_scope: case_l_fallback_divergence_envelopes
implementation_surfaces:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
  - Plans/UI_Command_Catalog.md
  - Plans/Wiring_Matrix.production.json
node_compile_hint:
  mode: case_l_fallback_divergence_envelopes
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Case-L:L-011
  - Case-L:PD-PROBE-L011-01-A/A/A/A/A
  - Plans/Decision_Log.md#DL-033
negative_constraints:
  - Do not switch active bootstrap selection during fork or cleanup either source after export.
  - Do not replace explicit CAS fields with a compound digest or create a fallback-reconciled EventRecord.
owner_hints:
  - Plans/Contracts_V0.md
  - Plans/storage-plan.md
```
