# Shard 071: Registered Storage, platform and seglog family depth completion (PNC-019 S3, 2026-11-14)

Source: `Plans/storage-plan.md`

Source lines: L28674-L28954

Source SHA256: `26be045fbcda9f9e366bcd4ec34e607c4213b9aba56a5aacb0c34042a6992c18`

---

## Registered Storage, platform and seglog family depth completion (PNC-019 S3, 2026-11-14)

Newly authored owner contracts under DL-045 that close the cells the 2026-09-24 depth grade left open for six registered families: post-restore admission for Boot and Hold, the event consumers of Boot, compaction and recovery, and the platform read output. Each adopts an existing shared mechanism by name (SP-286's fresh-operation admission after verified restore, SP-278's generic EventRecord index and DL-076's nine-field durable token). None changes a payload, policy value, edge, bucket or retention assignment, and none admits anything. Native execution remains NOT_RUN.

### SP-2205 - storage.boot_recovery after a verified restore, and its event consumer

**Post-restore transition.** After a verified terminal restore or reopen, a Boot issuance is a genuinely new owner operation of `storage.boot_recovery.publish.v1` only when SP-286's "Actual fresh-operation admission after verified restore" admits it: `StorageRecoveryCoordinator` establishes the restore occurrence and its new recovery epoch, the Boot owner accepts the new operation after the acceptance session opens, and its owner-operation identity is the `recovery_set_id` that the existing deterministic recipe derives from the post-restore work set and the new epoch. A set ID from the restored image belongs to an older epoch and can never equal it, so no restored pending Boot intent is first-minted; a surviving exact receipt is replayed as before. The transient capability, the protected group's `restore_admission` and one logical publication follow SP-286 unchanged. Floor and anchor: when the restored floor equals the external anchor, earliest completeness continues as SP-292 states; when the anchor is ahead of the restored floor (a confirmed older restore) or the anchor is absent, the instance's floor becomes the existing unavailable variant with its closed reason, the anchor is never rolled back, and later fresh issuances advance only the unavailable floor's revision. Earliest completeness is never re-established from a restored image or from later receipts, so `storage.boot_recovery.resolve_earliest.v1` then answers unavailable while new Boot events keep their own first receipts. No new floor state, reason, field or restore family is added.

**Consumer and checkpoint.** `storage.boot_recovery.resolve_earliest.v1` reads SP-286 custody and the floor, not EventRecords, and stays checkpoint-free. The only consumer of the EventRecords is `reader.storage.boot_recovery_history@1.0.0`, a passive on-demand history view that adopts SP-278 by name, reads through `reader.storage.event_record_index@1.0.0` over the generic checkpoint `event_record_index_checkpoint.v1:{storage_instance_id}`, adopts DL-076's nine-field durable token, stores no checkpoint, and returns unavailable rather than an empty history when coverage does not verify. CV-318's GUI disclosure, when its owner adds it, reads through this reader; no disclosure is added here.

```yaml
plan_unit_id: SP-2205
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: storage.boot_recovery admits a post-restore Boot issuance only through SP-286 fresh-operation admission
  with the new-epoch recovery_set_id, keeps earliest completeness unavailable after an older restore without rolling
  back the anchor, and has one passive SP-278 history reader.
gui_related: false
split_recommended: false
depends_on:
- SP-278
- SP-286
- SP-291
- SP-292
- DL-045
- DL-076
unblocks: []
acceptance_criteria:
- A restored pending Boot intent never first-mints; a fresh post-restore issuance uses the new epoch's set ID and SP-286 restore_admission.
- An older restore leaves the floor unavailable; later receipts advance only its revision; the anchor never rolls back.
- reader.storage.boot_recovery_history@1.0.0 adopts SP-278 and the DL-076 nine-field token and stores no checkpoint.
validation_surfaces:
- Plans/Automated_Testing_System.md#ATS-2205
risk_class: boot_continuity_restore_drift
reasoning_tier: high
context_scope: event_authority_pnc019_s3b
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/storage-plan.md#SP-292
preserved_exact_tokens:
- storage.boot_recovery.publish.v1
- reader.storage.boot_recovery_history@1.0.0
negative_constraints:
- No new floor state, reason, field, restore family or native proof.
owner_hints:
- Plans/storage-plan.md
```

### SP-2206 - storage.compaction_lifecycle_changed event consumer

Compaction authority is never read from these EventRecords: the authority order of Immutable-segment compaction and publication puts the lifecycle EventRecord after synchronized CURRENT, the journal and redb, and SP-295..SP-297 drive every translation, retirement and checkpoint effect from that native custody. `storage.compaction.native_read.v1` reads journal, terminal and detail custody and stays checkpoint-free. The only consumer of the lifecycle EventRecords is `reader.storage.compaction_lifecycle_history@1.0.0`, a passive on-demand history view (the "disposable projection" of that authority order is this reader's use of the generic index): it adopts SP-278 by name, reads through `reader.storage.event_record_index@1.0.0` over the generic checkpoint, adopts DL-076's nine-field durable token, stores no checkpoint and never selects Storage authority. Replay and rebuild never append, dispatch or compact. Withdrawal of the lifecycle writer fences this reader and its tokens with it.

```yaml
plan_unit_id: SP-2206
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: storage.compaction_lifecycle_changed EventRecords are observations with one passive SP-278 history
  reader; compaction effects are driven only by SP-295..SP-297 native custody.
gui_related: false
split_recommended: false
depends_on:
- SP-278
- SP-295
- SP-296
- SP-297
- DL-045
- DL-076
unblocks: []
acceptance_criteria:
- reader.storage.compaction_lifecycle_history@1.0.0 adopts SP-278 and the DL-076 nine-field token, stores no checkpoint and never selects authority.
validation_surfaces:
- Plans/Automated_Testing_System.md#ATS-2205
risk_class: compaction_observation_used_as_authority
reasoning_tier: medium
context_scope: event_authority_pnc019_s3b
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- reader.storage.compaction_lifecycle_history@1.0.0
negative_constraints:
- No compaction effect is driven from an EventRecord.
owner_hints:
- Plans/storage-plan.md
```

### SP-2207 - storage.recovery_applied aftermath consumer

The "existing coordinator/projector" that performs the recovery aftermath is exactly `storage.recovery_applied.aftermath.v1`, a step of `StorageRecoveryCoordinator`. It acts only on a recovery event whose first receipt is verified, read through SP-278 `reader.storage.event_record_index@1.0.0` with DL-076's nine-field durable token joined to the live snapshot, and only under current proof that no newer block applies. It applies the event's `checkpoint_action` and `projection_action` only through the generic projector's own owner: `invalidate_and_rebuild` and `rebuild_from_survivors` make `projector.storage.event_record_index@1.0.0` publish a new generation rebuilt from surviving retained source; `translate_by_semantic_identity` and `activate_verified_target_shadow` keep the generation and translate by semantic identity. Its durable advance is that projector's existing generation and frontier compare-and-swap on `event_record_index_checkpoint.v1:{storage_instance_id}`; the aftermath of a recovery event is complete exactly when that checkpoint's frontier covers the event's sequence under a generation the action requires, so a restart recomputes pending aftermath from the checkpoint and repeats nothing. It keeps no cursor or stored value of its own and never writes another owner's checkpoint. Family readers derived from the generic index see the new generation through their own SP-278 token validation. `storage.recovery_applied.read.v1` stays passive with `action_authority=none`.

**2026-11-15 clarification (PNC-019 C12-SS).** The recovery event's closed payload fixes `checkpoint_action` and `projection_action` by action (the `oneOf` of `Plans/event_payload_storage_recovery_applied.schema.json`), and the aftermath follows that pair. `exclude_proven_range` (`invalidate_and_rebuild`, `rebuild_from_verified_survivor`) and `restore_verified_backup` (`restore_verified_checkpoint`, `rebuild_from_verified_survivor`) make the projector publish a new generation rebuilt from surviving retained source; `rebuild_from_survivors` above is this payload's `rebuild_from_verified_survivor`. `adopt_valid_tail` (`advance_to_verified_survivor`) and `truncate_unacknowledged_tail` (`preserve_verified_checkpoint`, RA-P02), both with `resume_from_verified_checkpoint`, keep the generation, and the projector's frontier advances over the event. `seal_degraded` and `block_mutation` (`hold_without_advance`, `remain_stopped`) start no projector and advance no checkpoint or frontier; their aftermath holds and has no effect. `translate_by_semantic_identity` and `activate_verified_target_shadow` are `storage.compaction_lifecycle_changed` tokens and never occur in this payload. ATS-3900 executes these three classes. No payload, action, policy or stored value changes.

```yaml
plan_unit_id: SP-2207
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The storage.recovery_applied aftermath consumer is storage.recovery_applied.aftermath.v1 in
  StorageRecoveryCoordinator; it applies checkpoint and projection actions only through the generic SP-278 projector,
  whose generation and frontier CAS is its durable advance.
gui_related: false
split_recommended: false
depends_on:
- SP-278
- SP-286
- SP-293
- DL-045
- DL-076
unblocks: []
acceptance_criteria:
- Aftermath starts only after the recovery event's verified first receipt and repeats nothing on restart.
- Per the 2026-11-15 clarification, exclude_proven_range and restore_verified_backup publish a new generation rebuilt from surviving retained source; adopt_valid_tail and truncate_unacknowledged_tail keep the generation while the frontier advances; seal_degraded and block_mutation start no projector and advance nothing.
- The aftermath stores no cursor of its own and writes no other owner's checkpoint.
validation_surfaces:
- Plans/Automated_Testing_System.md#ATS-2205
risk_class: recovery_aftermath_repeat_or_skip
reasoning_tier: high
context_scope: event_authority_pnc019_s3b
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/storage-plan.md#SP-293
preserved_exact_tokens:
- storage.recovery_applied.aftermath.v1
negative_constraints:
- No new stored value, action, or native proof.
owner_hints:
- Plans/storage-plan.md
```

### SP-2208 - storage.retention_hold_changed fresh admission after a verified restore

The Hold-specific first-mint path that SP-288 left "unavailable until separately adopted" is adopted here against SP-286's "Actual fresh-operation admission after verified restore". A legal-hold `set` or `clear` after a verified restore is a new owner operation only when its original SIR command (SIR-047) was accepted after `StorageRecoveryCoordinator` opened the post-restore acceptance session, and its owner-operation identity is the existing SP-288 hold operation identity of that SIR command. The transient capability binds that identity, the complete accepted-operation digest, the hold EventRecord's event ID, scope partition, event type, idempotency key and producer-semantic digest, the restore occurrence, the current acceptance lease revision and one logical publication ID, exactly as SP-286 states. A restored pending Hold intent from before the restore keeps SP-288's rule: it may resolve an exact surviving original event or receipt, and receipt absence never first-mints it. No fresh-origin flag, restore family, receipt field or copied group capability is added; Hold's set/clear graph, union protection and custody are unchanged.

```yaml
plan_unit_id: SP-2208
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: storage.retention_hold_changed adopts SP-286 fresh-operation admission after verified restore for
  legal-hold commands accepted after the post-restore acceptance session opens; restored pending Hold intents never
  first-mint.
gui_related: false
split_recommended: false
depends_on:
- SP-286
- SP-288
- SIR-047
- DL-045
unblocks: []
acceptance_criteria:
- A post-restore set or clear first-mints only with a SIR command accepted after the acceptance session opened and SP-286's capability.
- A restored pending Hold intent resolves only an exact surviving event or receipt.
validation_surfaces:
- Plans/Automated_Testing_System.md#ATS-2205
risk_class: hold_restore_first_mint
reasoning_tier: high
context_scope: event_authority_pnc019_s3b
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/storage-plan.md#SP-288
preserved_exact_tokens:
- storage.retention_hold_changed
negative_constraints:
- No fresh-origin flag, restore family, receipt field or Hold graph change.
owner_hints:
- Plans/storage-plan.md
```

### SP-2209 - platform.capability_evaluated read output

`storage.platform_capability_decision.read.v1` returns exactly `Plans/platform_capability_decision_read_output.schema.json#/$defs/read_output`: either `status=read_through` with the original retained `decision`, the complete current `read_through_marker` and `action_authority=none`, or `status=unavailable` with one closed reason and no decision. The marker is closed: `storage_instance_id`, the selected `event_id` and its `sequence_id`, the current source cursor `source_cursor_sequence_id`, `coverage_complete=true`, and the live SP-278 `read_token` of the read (all ten fields, including the transaction's `redb_snapshot_id`); it is a read result and is never persisted, so DL-076 is not engaged. The per-evaluation run-context consumer `platform.capability_run_context.consume.v1@1.0.0` keeps `checkpoint_disposition none_required`. No current consumer uses a multi-capability requirement set: N2-157 makes that use unavailable until the owning context supplies its own requirement-set contract, and a consumer that needs it must bring that contract before it reads. The catalog stays empty until build time (DL-082).

```yaml
plan_unit_id: SP-2209
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: storage.platform_capability_decision.read.v1 returns the closed read_output of
  Plans/platform_capability_decision_read_output.schema.json with a complete, never-persisted read-through marker.
gui_related: false
split_recommended: false
depends_on:
- SP-278
- SP-290
- DL-045
- DL-082
unblocks: []
acceptance_criteria:
- The read output is read_through with decision, marker and action_authority none, or unavailable with one closed reason.
validation_surfaces:
- Plans/platform_capability_decision_read_output.schema.json
- Plans/Automated_Testing_System.md#ATS-2205
risk_class: platform_read_output_open_shape
reasoning_tier: medium
context_scope: event_authority_pnc019_s3b
implementation_surfaces:
- Plans/storage-plan.md
- Plans/platform_capability_decision_read_output.schema.json
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/storage-plan.md#SP-290
preserved_exact_tokens:
- storage.platform_capability_decision.read.v1
negative_constraints:
- No catalog entry, requirement-set contract or persisted read token.
owner_hints:
- Plans/storage-plan.md
```

### SP-2210 - seglog.event_appended semantic owner route and stored token

The semantic owner of `seglog.event_appended` is SP-270, Seglog append observability producer and read contract; 2.2.5 EventRecord persistence boundary, the registry row's `semantic_owner_doc` anchor, routes to it. The SP-270 reader stores only the nine-field durable read token as `index_read_token` (DL-076); the actual `redb_snapshot_id` is joined at each read and never stored. Its relational oracle suite must store that nine-field token, with a stored-snapshot negative, before criterion 12 can pass.

```yaml
plan_unit_id: SP-2210
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: SP-270 is the semantic owner of seglog.event_appended, reached from 2.2.5, and its reader stores
  only the DL-076 nine-field durable token.
gui_related: false
split_recommended: false
depends_on:
- SP-270
- SP-278
- DL-076
unblocks: []
acceptance_criteria:
- 2.2.5 routes seglog.event_appended semantics to SP-270; no stored index_read_token carries redb_snapshot_id.
validation_surfaces:
- Plans/Automated_Testing_System.md#ATS-2205
risk_class: seglog_owner_route_drift
reasoning_tier: low
context_scope: event_authority_pnc019_s3b
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-076
- Plans/storage-plan.md#SP-270
preserved_exact_tokens:
- seglog.event_appended
negative_constraints:
- No registry row change.
owner_hints:
- Plans/storage-plan.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/storage-plan.md#SP-292, ContractName:Plans/storage-plan.md#SP-288, ContractName:Plans/storage-plan.md#SP-290, ContractName:Plans/storage-plan.md#SP-293
