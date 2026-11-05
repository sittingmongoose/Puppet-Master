# Shard 090: Event Authority W3F Phase 1 — Prepared Without Admission (2026-11-05)

Source: `Plans/storage-plan.md`

Source lines: L29479-L30445

Source SHA256: `93a5a045eaff53a34a7144e77a67761c0ccdae4484fa58826a3b0dd5e7b85ac9`

---

## Event Authority W3F Phase 1 — Prepared Without Admission (2026-11-05)

Newly authored owner contracts under deck 2 item 9.a A. This section adds no admitted family and enables no native writer. The per-family base search is recorded in `reports/event-authority-20261105/W3F-search.json`. Criterion 12 remains PARTIAL until the shared number/time rules and guard-isolation tool pass review and phase 2 runs.

### SP-1450 - autonomy.ceiling_checked Reader And Storage Adoption

```yaml
plan_unit_id: SP-1450
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |
  Newly authored Storage owner contract for `autonomy.ceiling_checked@1.0.0`, reusing CV-1450 and the family's base search. `reader.autonomy.ceiling_checked@1.0.0` is its exact versioned operating consumer. Only this exact family/payload version is read; envelope scope/subject joins and the candidate source must equal the immutable requested selector. Bounded selector contains actual storage_instance_id, scope_partition, project_id, event_type=autonomy.ceiling_checked, event_id and sequence_id, plus the exact owner subject (request_id for discovery, source_session_id/prompt_id/target_thread_id for prompts, attempt_id/receipt_id for ceiling, run_id/lock_id/replan_generation for graph). Relevant subject fields must match the decoded payload; optional foreign fields cannot redirect it.

  Explicitly adopt SP-278 `reader.storage.event_record_index@1.0.0`. In one actual redb read transaction select checkpoints root `event_record_index_checkpoint.v1:{storage_instance_id}`, its current_generation_id, exact generation node/checkpoint_ref and same-database `event_record_index.v2@{generation_id}` dataset. Lookup key is `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`, with Storage's reversible project~ partition and exact twenty-digit uint64 formatting. Verify actual CURRENT/manifest/source controls, immutable birth anchor, live frontier, complete global coverage including nonmatching scopes/families, lawful gaps, frame CRC, payload/wire/producer commitments and original admission/full-value custody through the owners; generation equality or a matching-row maximum never establishes coverage. The SP-278 durable token is its exact nine fields; add only the current transaction's redb_snapshot_id in memory and verify the full token. Same-generation append invalidates the old frontier token. Compacted source requires actual identity-preserving translation custody; a missing source never becomes a fabricated event.

  At entry independently capture original immutable selector, Storage instance, full source/read token, maintenance epoch and actual access/deletion/hold authority. Resolve the inline or SP-337 pack body and validate CV-1450's exact closed schema, family/subject/context and original producer/receipt facts. Before returning, after the last helper, independently compare the complete candidate output with the decoded actual original and original selector, then revalidate current source/frontier/access/deletion/withdrawal/maintenance authority with no helper between that pure final predicate and disclosure. Changed authority discards the result; a still leased coherent snapshot may finish only as that boundary. Retained lawful history uses its original authenticated schema/recipe and does not need a current live object, policy outcome or request cache; unsupported or invalid original admission stays unavailable.

  Explicitly adopt SP-286/CV-339 `storage.first_append_receipt.resolve.v2` as the original custody source. No consumer may substitute Storage-assigned timestamps/sequence, a supplied digest, alternate family, first-receipt locator or projection for the exact original full value. Source canonical backup/payload/identity custody is not reconstructed from the index. Return metadata/ref-only observations under current source permission and deletion; raw or no-longer-visible bodies stay inaccessible. Replay does not execute any owner effect. Retention is exactly RP-AUTHORITY-INDEFINITE@1.0.0, with the open question in CV-1450 where pending; this reader creates no new retention class.

  Compatibility/withdrawal adopts CV-1450: fence new producer at exact registry cutoff, stop withdrawn reader/in-flight lease, keep genuine original receipt reads separate, and require a reviewed versioned successor and StorageMigrationCoordinator rebuild/publication before renewed derived reads. Unknown versions fail closed, never bind an old URI to a new codec.

  The existing PS receipt paragraph requires a redb projection by attempt_id. Newly authored `projector.autonomy.ceiling_checked@1.0.0` consumes only this exact family from the full generic SP-278 scan and writes derived `autonomy_ceiling_projection` rows plus `autonomy_ceiling_checkpoint` as one redb transaction. Projection key `autonomy_ceiling_projection.v1:{scope_partition}:{attempt_id}:{event_id}` indexes each receipt within its attempt, never collapses multiple checks to one latest authority. Value schema `pm.storage_value.autonomy_ceiling_projection.v1@1.0.0` and checkpoint schema `pm.storage_value.autonomy_ceiling_checkpoint.v1@1.0.0` are closed in Plans/w3f_autonomy_storage.schema.json. Exact checkpoint key is `autonomy_ceiling_checkpoint.v1:{storage_instance_id}:{scope_partition}`. It stores the original nine-field index_read_token, complete global source_cursor and index_through_sequence_id, revision, state, projector identity/version, exact event type, storage_instance_id and scope_partition. No redb_snapshot_id persists. Projection key/value scope/attempt/event/sequence/source digest join the event and actual generic index. No copied payload, policy authority or prompt enters either row.

  For every advance validate actual complete generic source frontier in one snapshot, scan through that frontier (including skips), authenticate original admitted events and their original receipts, derive exact rows independently, CAS the actual previous checkpoint revision and all prior checkpoint bytes, then write the rows and new checkpoint atomically. A retry of a settled revision changes nothing. Recheck original token/access/maintenance/withdrawal authority immediately before commit; stale CAS/token commits neither rows nor checkpoint. Reader `reader.autonomy.ceiling_checked@1.0.0` requires that exact published projection/checkpoint and coverage of the requested event, and validates it against genuine original source before final disclosure. A partially current checkpoint cannot claim latest truth. No execution decision uses this derived view.

  Both value families use canonical MessagePack under SP-236, derived redb file/runs_and_goals group, 16 KiB maximum per complete encoded value. Oversized values fail advance closed, never evade the cap through a caller pointer. Projection rows reuse RP-EVENT-INDEX-SOURCE@1.0.0; checkpoint generations reuse RP-PROJECTION-3GEN@1.0.0. This assigns existing derived rules, no new lifetime. Corrupt/missing/withdrawn derived state is unavailable and enters existing Q-DERIVED recovery; StorageMigrationCoordinator installs exact table/schema/codec under the actual migration graph (no guessed store version), rebuilds from genuine retained seglog plus coherent original custody, and publishes a new generation. These derived rows are not mandatory backup authority and never reconstruct the canonical ceiling receipt. Clear source-coupled rows when source lawfully disappears; holds/access never change source truth. Criterion 12 remains PARTIAL until the plan's CAS/token/rollback/oversize/recovery/withdrawal cases and shared proof run.

  Family checkpoint publication custody (newly authored SP-1450 adoption of the existing RP-PROJECTION-3GEN policy). The exact same-store redb checkpoints table key autonomy_ceiling_checkpoint.v1:{storage_instance_id}:{scope_partition} contains one closed publication core plus retired_generations with zero to two closed nonrecursive entries in Plans/w3f_autonomy_storage.schema.json#/$defs/checkpoint, identically materialized in storage_value_registry. A core is every root field except retired_generations, including publication_id, first published_at_utc, required-present retired_at_utc and hold_refs. Each retired entry has exactly checkpoint (the final withdrawn prior core, no history) and successor_publication_id. No side key or generic index token supplies family history. publication_id is this family's generation identity, distinct from index_read_token.generation_id; exact discriminator is (storage_instance_id, scope_partition, projector_id, projector_version, schema_id, schema_version, publication_id). Projection rows' checkpoint_ref denotes this logical key and their source joins must match the selected core.

  StorageMigrationCoordinator allocates a fresh non-capability publication_id once for initial verified publication, deliberate rebuild or a separately reviewed supported schema/reader successor. Admission authenticates the actual coordinator operation and source coverage under prior-value CAS; matching supplied IDs or a self-consistent digest are insufficient. No guessed store version, new canonical pending journal or number/timestamp codec is introduced. First committed selection fixes published_at_utc from the existing Storage timestamp authority. Before a first commit, an in-memory retry retains its proposed ID; after uncertainty, resolve the actual committed same-store core before proceeding. On process loss without that custody do not claim a retry or reconstruct an original. A provably uncommitted attempt has no published birth/retirement; a new verified coordinator operation may then initialize. A settled retry returns the committed core unchanged, not a second generation.

  Ordinary same-generation cursor/token/revision advances preserve publication_id, published_at_utc, retired_at_utc, hold_refs and the complete history byte-for-byte; generic index/source rotation or frontier advancement alone never consumes a family slot. A first current|rebuilding -> withdrawn transition freezes retired_at_utc at its actual Storage-authorized terminal time, not birth/cursor/source completion time. Repeated withdrawal preserves that first time. withdrawn cannot refresh itself into current. Rebuild failure fences reads and may leave the selected withdrawn core; it does not discard or rebirth it. A verified successor transaction retires a still-current old core at the new first publication time, or carries an already-withdrawn old core exactly with its earlier retirement time, archives that final core, carries every eligible older entry unchanged and selects the new core atomically with rebuilt projection rows under CAS of revision AND all actual old root bytes. No helper may run after the final source/hold/ref/maintenance/withdrawal guard and before commit. Failed CAS/token/hold/slot validation commits neither rows nor checkpoint nor cleanup.

  Every core joins this exact Storage/scope/projector/schema logical owner. Publication IDs are unique; each successor link resolves the actual immediate newer retained core, ending at the selected root, never itself or a cycle. A lawful cleanup may remove only an oldest retained prefix, preserving all remaining links and sibling bytes. Retired birth <= its first retirement <= immediate successor birth; a root's birth cannot be in the future at publication/observation. Timestamp comparison and original historical validation use the existing shared Storage/EventRecord owners, not a lane codec. Retired cores never become CURRENT or confer currentness/dispatch authority; selected reads still prove fresh full SP-278 coverage and original source custody independently.

  Adopt unchanged RP-PROJECTION-3GEN@1.0.0: current_plus_history, terminal_transition, TTL 604800 seconds, max_cardinality=3 per logical_key, hold_eligible=true, overflow_action=rebuild_projection, expiry_action=rebuild. The selected root (including withdrawn) plus all retained predecessors consumes those three slots. Reserve a lawful slot before persisting any successor; no fourth staged generation, alias key or hidden history table is allowed. Cleanup of a nonselected oldest retired entry requires inclusive age >= its actual first retired_at_utc + 604800 seconds, no actual applicable retention_hold_record or live/maintenance/backup/rollback ref, and unchanged current hold/ref admission fence. Resolve both frozen hold_refs and dynamically applicable holds added after retirement; missing/unresolved custody blocks cleanup. Retention never grants content access. Serialize cleanup, slot reservation, new holds/refs and publication in one same-store atomic transition under the full old-root CAS; preserve protected siblings. If no lawful slot exists, keep the last root/rows and disclose governed rebuild/currentness unavailability; never evict early, drop a held core or reset an anchor. Every complete encoded root including history and hold refs remains <=16384 bytes under SP-236; overflow fails advance closed. These derived values remain rebuildable and are not canonical receipt backup authority. Phase 2 must implement each separate publication/retirement/history/hold/cleanup/retry negative planned for this family.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing owners.
depends_on:
- CV-1450
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- autonomy.ceiling_checked@1.0.0
- reader.autonomy.ceiling_checked@1.0.0
- reader.storage.event_record_index@1.0.0
- event_record_index_checkpoint.v1:{storage_instance_id}
- event_record_index.v2@{generation_id}
- event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}
- storage.first_append_receipt.resolve.v2
- projector.autonomy.ceiling_checked@1.0.0
- autonomy_ceiling_projection
- autonomy_ceiling_checkpoint
- autonomy_ceiling_projection.v1:{scope_partition}:{attempt_id}:{event_id}
- pm.storage_value.autonomy_ceiling_projection.v1@1.0.0
- pm.storage_value.autonomy_ceiling_checkpoint.v1@1.0.0
- autonomy_ceiling_checkpoint.v1:{storage_instance_id}:{scope_partition}
- reader.autonomy.ceiling_checked@1.0.0
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### SP-1451 - discovery.backpressure Reader And Storage Adoption

```yaml
plan_unit_id: SP-1451
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage owner contract for `discovery.backpressure@1.0.0`, reusing CV-1451 and the family's base search. `reader.discovery.backpressure@1.0.0` is its exact versioned operating consumer. Only this exact family/payload version is read; envelope scope/subject joins and the candidate source must equal the immutable requested selector. Bounded selector contains actual storage_instance_id, scope_partition, project_id, event_type=discovery.backpressure, event_id and sequence_id, plus the exact owner subject (request_id for discovery, source_session_id/prompt_id/target_thread_id for prompts, attempt_id/receipt_id for ceiling, run_id/lock_id/replan_generation for graph). Relevant subject fields must match the decoded payload; optional foreign fields cannot redirect it.

  Explicitly adopt SP-278 `reader.storage.event_record_index@1.0.0`. In one actual redb read transaction select checkpoints root `event_record_index_checkpoint.v1:{storage_instance_id}`, its current_generation_id, exact generation node/checkpoint_ref and same-database `event_record_index.v2@{generation_id}` dataset. Lookup key is `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`, with Storage's reversible project~ partition and exact twenty-digit uint64 formatting. Verify actual CURRENT/manifest/source controls, immutable birth anchor, live frontier, complete global coverage including nonmatching scopes/families, lawful gaps, frame CRC, payload/wire/producer commitments and original admission/full-value custody through the owners; generation equality or a matching-row maximum never establishes coverage. The SP-278 durable token is its exact nine fields; add only the current transaction's redb_snapshot_id in memory and verify the full token. Same-generation append invalidates the old frontier token. Compacted source requires actual identity-preserving translation custody; a missing source never becomes a fabricated event.

  At entry independently capture original immutable selector, Storage instance, full source/read token, maintenance epoch and actual access/deletion/hold authority. Resolve the inline or SP-337 pack body and validate CV-1451's exact closed schema, family/subject/context and original producer/receipt facts. Before returning, after the last helper, independently compare the complete candidate output with the decoded actual original and original selector, then revalidate current source/frontier/access/deletion/withdrawal/maintenance authority with no helper between that pure final predicate and disclosure. Changed authority discards the result; a still leased coherent snapshot may finish only as that boundary. Retained lawful history uses its original authenticated schema/recipe and does not need a current live object, policy outcome or request cache; unsupported or invalid original admission stays unavailable.

  Explicitly adopt SP-286/CV-339 `storage.first_append_receipt.resolve.v2` as the original custody source. No consumer may substitute Storage-assigned timestamps/sequence, a supplied digest, alternate family, first-receipt locator or projection for the exact original full value. Source canonical backup/payload/identity custody is not reconstructed from the index. Return metadata/ref-only observations under current source permission and deletion; raw or no-longer-visible bodies stay inaccessible. Replay does not execute any owner effect. Retention is exactly RP-AUTHORITY-INDEFINITE@1.0.0, with the open question in CV-1451 where pending; this reader creates no new retention class.

  Compatibility/withdrawal adopts CV-1451: fence new producer at exact registry cutoff, stop withdrawn reader/in-flight lease, keep genuine original receipt reads separate, and require a reviewed versioned successor and StorageMigrationCoordinator rebuild/publication before renewed derived reads. Unknown versions fail closed, never bind an old URI to a new codec.

  Family checkpoint disposition `none_required` is explicit. This stateless lookup owns zero stored family values, no projector, no family key, cursor, cache or durable output. There is no family durable advance/CAS to implement. The independently published generic SP-278 checkpoint and its validation remain mandatory. Runtime Artifacts consumes discovery metadata, the existing SessionPromptInbox consumes prompt observations, and Executor consumes graph-lock observations; none may treat this read as dispatch/verification authority or bypass their existing canonical state/admission checks. No Storage value registry row is invented for a stateless read. Criterion 12 remains PARTIAL under the per-family oracle plan.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-1451
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- discovery.backpressure@1.0.0
- reader.discovery.backpressure@1.0.0
- reader.storage.event_record_index@1.0.0
- event_record_index_checkpoint.v1:{storage_instance_id}
- event_record_index.v2@{generation_id}
- event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}
- storage.first_append_receipt.resolve.v2
- none_required
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### SP-1452 - discovery.candidates_returned Reader And Storage Adoption

```yaml
plan_unit_id: SP-1452
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage owner contract for `discovery.candidates_returned@1.0.0`, reusing CV-1452 and the family's base search. `reader.discovery.candidates_returned@1.0.0` is its exact versioned operating consumer. Only this exact family/payload version is read; envelope scope/subject joins and the candidate source must equal the immutable requested selector. Bounded selector contains actual storage_instance_id, scope_partition, project_id, event_type=discovery.candidates_returned, event_id and sequence_id, plus the exact owner subject (request_id for discovery, source_session_id/prompt_id/target_thread_id for prompts, attempt_id/receipt_id for ceiling, run_id/lock_id/replan_generation for graph). Relevant subject fields must match the decoded payload; optional foreign fields cannot redirect it.

  Explicitly adopt SP-278 `reader.storage.event_record_index@1.0.0`. In one actual redb read transaction select checkpoints root `event_record_index_checkpoint.v1:{storage_instance_id}`, its current_generation_id, exact generation node/checkpoint_ref and same-database `event_record_index.v2@{generation_id}` dataset. Lookup key is `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`, with Storage's reversible project~ partition and exact twenty-digit uint64 formatting. Verify actual CURRENT/manifest/source controls, immutable birth anchor, live frontier, complete global coverage including nonmatching scopes/families, lawful gaps, frame CRC, payload/wire/producer commitments and original admission/full-value custody through the owners; generation equality or a matching-row maximum never establishes coverage. The SP-278 durable token is its exact nine fields; add only the current transaction's redb_snapshot_id in memory and verify the full token. Same-generation append invalidates the old frontier token. Compacted source requires actual identity-preserving translation custody; a missing source never becomes a fabricated event.

  At entry independently capture original immutable selector, Storage instance, full source/read token, maintenance epoch and actual access/deletion/hold authority. Resolve the inline or SP-337 pack body and validate CV-1452's exact closed schema, family/subject/context and original producer/receipt facts. Before returning, after the last helper, independently compare the complete candidate output with the decoded actual original and original selector, then revalidate current source/frontier/access/deletion/withdrawal/maintenance authority with no helper between that pure final predicate and disclosure. Changed authority discards the result; a still leased coherent snapshot may finish only as that boundary. Retained lawful history uses its original authenticated schema/recipe and does not need a current live object, policy outcome or request cache; unsupported or invalid original admission stays unavailable.

  Explicitly adopt SP-286/CV-339 `storage.first_append_receipt.resolve.v2` as the original custody source. No consumer may substitute Storage-assigned timestamps/sequence, a supplied digest, alternate family, first-receipt locator or projection for the exact original full value. Source canonical backup/payload/identity custody is not reconstructed from the index. Return metadata/ref-only observations under current source permission and deletion; raw or no-longer-visible bodies stay inaccessible. Replay does not execute any owner effect. Retention is exactly RP-AUTHORITY-INDEFINITE@1.0.0, with the open question in CV-1452 where pending; this reader creates no new retention class.

  Compatibility/withdrawal adopts CV-1452: fence new producer at exact registry cutoff, stop withdrawn reader/in-flight lease, keep genuine original receipt reads separate, and require a reviewed versioned successor and StorageMigrationCoordinator rebuild/publication before renewed derived reads. Unknown versions fail closed, never bind an old URI to a new codec.

  Family checkpoint disposition `none_required` is explicit. This stateless lookup owns zero stored family values, no projector, no family key, cursor, cache or durable output. There is no family durable advance/CAS to implement. The independently published generic SP-278 checkpoint and its validation remain mandatory. Runtime Artifacts consumes discovery metadata, the existing SessionPromptInbox consumes prompt observations, and Executor consumes graph-lock observations; none may treat this read as dispatch/verification authority or bypass their existing canonical state/admission checks. No Storage value registry row is invented for a stateless read. Criterion 12 remains PARTIAL under the per-family oracle plan.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-1452
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- discovery.candidates_returned@1.0.0
- reader.discovery.candidates_returned@1.0.0
- reader.storage.event_record_index@1.0.0
- event_record_index_checkpoint.v1:{storage_instance_id}
- event_record_index.v2@{generation_id}
- event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}
- storage.first_append_receipt.resolve.v2
- none_required
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### SP-1453 - discovery.disabled Reader And Storage Adoption

```yaml
plan_unit_id: SP-1453
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage owner contract for `discovery.disabled@1.0.0`, reusing CV-1453 and the family's base search. `reader.discovery.disabled@1.0.0` is its exact versioned operating consumer. Only this exact family/payload version is read; envelope scope/subject joins and the candidate source must equal the immutable requested selector. Bounded selector contains actual storage_instance_id, scope_partition, project_id, event_type=discovery.disabled, event_id and sequence_id, plus the exact owner subject (request_id for discovery, source_session_id/prompt_id/target_thread_id for prompts, attempt_id/receipt_id for ceiling, run_id/lock_id/replan_generation for graph). Relevant subject fields must match the decoded payload; optional foreign fields cannot redirect it.

  Explicitly adopt SP-278 `reader.storage.event_record_index@1.0.0`. In one actual redb read transaction select checkpoints root `event_record_index_checkpoint.v1:{storage_instance_id}`, its current_generation_id, exact generation node/checkpoint_ref and same-database `event_record_index.v2@{generation_id}` dataset. Lookup key is `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`, with Storage's reversible project~ partition and exact twenty-digit uint64 formatting. Verify actual CURRENT/manifest/source controls, immutable birth anchor, live frontier, complete global coverage including nonmatching scopes/families, lawful gaps, frame CRC, payload/wire/producer commitments and original admission/full-value custody through the owners; generation equality or a matching-row maximum never establishes coverage. The SP-278 durable token is its exact nine fields; add only the current transaction's redb_snapshot_id in memory and verify the full token. Same-generation append invalidates the old frontier token. Compacted source requires actual identity-preserving translation custody; a missing source never becomes a fabricated event.

  At entry independently capture original immutable selector, Storage instance, full source/read token, maintenance epoch and actual access/deletion/hold authority. Resolve the inline or SP-337 pack body and validate CV-1453's exact closed schema, family/subject/context and original producer/receipt facts. Before returning, after the last helper, independently compare the complete candidate output with the decoded actual original and original selector, then revalidate current source/frontier/access/deletion/withdrawal/maintenance authority with no helper between that pure final predicate and disclosure. Changed authority discards the result; a still leased coherent snapshot may finish only as that boundary. Retained lawful history uses its original authenticated schema/recipe and does not need a current live object, policy outcome or request cache; unsupported or invalid original admission stays unavailable.

  Explicitly adopt SP-286/CV-339 `storage.first_append_receipt.resolve.v2` as the original custody source. No consumer may substitute Storage-assigned timestamps/sequence, a supplied digest, alternate family, first-receipt locator or projection for the exact original full value. Source canonical backup/payload/identity custody is not reconstructed from the index. Return metadata/ref-only observations under current source permission and deletion; raw or no-longer-visible bodies stay inaccessible. Replay does not execute any owner effect. Retention is exactly RP-AUTHORITY-INDEFINITE@1.0.0, with the open question in CV-1453 where pending; this reader creates no new retention class.

  Compatibility/withdrawal adopts CV-1453: fence new producer at exact registry cutoff, stop withdrawn reader/in-flight lease, keep genuine original receipt reads separate, and require a reviewed versioned successor and StorageMigrationCoordinator rebuild/publication before renewed derived reads. Unknown versions fail closed, never bind an old URI to a new codec.

  Family checkpoint disposition `none_required` is explicit. This stateless lookup owns zero stored family values, no projector, no family key, cursor, cache or durable output. There is no family durable advance/CAS to implement. The independently published generic SP-278 checkpoint and its validation remain mandatory. Runtime Artifacts consumes discovery metadata, the existing SessionPromptInbox consumes prompt observations, and Executor consumes graph-lock observations; none may treat this read as dispatch/verification authority or bypass their existing canonical state/admission checks. No Storage value registry row is invented for a stateless read. Criterion 12 remains PARTIAL under the per-family oracle plan.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-1453
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- discovery.disabled@1.0.0
- reader.discovery.disabled@1.0.0
- reader.storage.event_record_index@1.0.0
- event_record_index_checkpoint.v1:{storage_instance_id}
- event_record_index.v2@{generation_id}
- event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}
- storage.first_append_receipt.resolve.v2
- none_required
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### SP-1454 - discovery.fallback Reader And Storage Adoption

```yaml
plan_unit_id: SP-1454
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage owner contract for `discovery.fallback@1.0.0`, reusing CV-1454 and the family's base search. `reader.discovery.fallback@1.0.0` is its exact versioned operating consumer. Only this exact family/payload version is read; envelope scope/subject joins and the candidate source must equal the immutable requested selector. Bounded selector contains actual storage_instance_id, scope_partition, project_id, event_type=discovery.fallback, event_id and sequence_id, plus the exact owner subject (request_id for discovery, source_session_id/prompt_id/target_thread_id for prompts, attempt_id/receipt_id for ceiling, run_id/lock_id/replan_generation for graph). Relevant subject fields must match the decoded payload; optional foreign fields cannot redirect it.

  Explicitly adopt SP-278 `reader.storage.event_record_index@1.0.0`. In one actual redb read transaction select checkpoints root `event_record_index_checkpoint.v1:{storage_instance_id}`, its current_generation_id, exact generation node/checkpoint_ref and same-database `event_record_index.v2@{generation_id}` dataset. Lookup key is `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`, with Storage's reversible project~ partition and exact twenty-digit uint64 formatting. Verify actual CURRENT/manifest/source controls, immutable birth anchor, live frontier, complete global coverage including nonmatching scopes/families, lawful gaps, frame CRC, payload/wire/producer commitments and original admission/full-value custody through the owners; generation equality or a matching-row maximum never establishes coverage. The SP-278 durable token is its exact nine fields; add only the current transaction's redb_snapshot_id in memory and verify the full token. Same-generation append invalidates the old frontier token. Compacted source requires actual identity-preserving translation custody; a missing source never becomes a fabricated event.

  At entry independently capture original immutable selector, Storage instance, full source/read token, maintenance epoch and actual access/deletion/hold authority. Resolve the inline or SP-337 pack body and validate CV-1454's exact closed schema, family/subject/context and original producer/receipt facts. Before returning, after the last helper, independently compare the complete candidate output with the decoded actual original and original selector, then revalidate current source/frontier/access/deletion/withdrawal/maintenance authority with no helper between that pure final predicate and disclosure. Changed authority discards the result; a still leased coherent snapshot may finish only as that boundary. Retained lawful history uses its original authenticated schema/recipe and does not need a current live object, policy outcome or request cache; unsupported or invalid original admission stays unavailable.

  Explicitly adopt SP-286/CV-339 `storage.first_append_receipt.resolve.v2` as the original custody source. No consumer may substitute Storage-assigned timestamps/sequence, a supplied digest, alternate family, first-receipt locator or projection for the exact original full value. Source canonical backup/payload/identity custody is not reconstructed from the index. Return metadata/ref-only observations under current source permission and deletion; raw or no-longer-visible bodies stay inaccessible. Replay does not execute any owner effect. Retention is exactly RP-AUTHORITY-INDEFINITE@1.0.0, with the open question in CV-1454 where pending; this reader creates no new retention class.

  Compatibility/withdrawal adopts CV-1454: fence new producer at exact registry cutoff, stop withdrawn reader/in-flight lease, keep genuine original receipt reads separate, and require a reviewed versioned successor and StorageMigrationCoordinator rebuild/publication before renewed derived reads. Unknown versions fail closed, never bind an old URI to a new codec.

  Family checkpoint disposition `none_required` is explicit. This stateless lookup owns zero stored family values, no projector, no family key, cursor, cache or durable output. There is no family durable advance/CAS to implement. The independently published generic SP-278 checkpoint and its validation remain mandatory. Runtime Artifacts consumes discovery metadata, the existing SessionPromptInbox consumes prompt observations, and Executor consumes graph-lock observations; none may treat this read as dispatch/verification authority or bypass their existing canonical state/admission checks. No Storage value registry row is invented for a stateless read. Criterion 12 remains PARTIAL under the per-family oracle plan.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-1454
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- discovery.fallback@1.0.0
- reader.discovery.fallback@1.0.0
- reader.storage.event_record_index@1.0.0
- event_record_index_checkpoint.v1:{storage_instance_id}
- event_record_index.v2@{generation_id}
- event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}
- storage.first_append_receipt.resolve.v2
- none_required
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### SP-1455 - discovery.invoked Reader And Storage Adoption

```yaml
plan_unit_id: SP-1455
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage owner contract for `discovery.invoked@1.0.0`, reusing CV-1455 and the family's base search. `reader.discovery.invoked@1.0.0` is its exact versioned operating consumer. Only this exact family/payload version is read; envelope scope/subject joins and the candidate source must equal the immutable requested selector. Bounded selector contains actual storage_instance_id, scope_partition, project_id, event_type=discovery.invoked, event_id and sequence_id, plus the exact owner subject (request_id for discovery, source_session_id/prompt_id/target_thread_id for prompts, attempt_id/receipt_id for ceiling, run_id/lock_id/replan_generation for graph). Relevant subject fields must match the decoded payload; optional foreign fields cannot redirect it.

  Explicitly adopt SP-278 `reader.storage.event_record_index@1.0.0`. In one actual redb read transaction select checkpoints root `event_record_index_checkpoint.v1:{storage_instance_id}`, its current_generation_id, exact generation node/checkpoint_ref and same-database `event_record_index.v2@{generation_id}` dataset. Lookup key is `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`, with Storage's reversible project~ partition and exact twenty-digit uint64 formatting. Verify actual CURRENT/manifest/source controls, immutable birth anchor, live frontier, complete global coverage including nonmatching scopes/families, lawful gaps, frame CRC, payload/wire/producer commitments and original admission/full-value custody through the owners; generation equality or a matching-row maximum never establishes coverage. The SP-278 durable token is its exact nine fields; add only the current transaction's redb_snapshot_id in memory and verify the full token. Same-generation append invalidates the old frontier token. Compacted source requires actual identity-preserving translation custody; a missing source never becomes a fabricated event.

  At entry independently capture original immutable selector, Storage instance, full source/read token, maintenance epoch and actual access/deletion/hold authority. Resolve the inline or SP-337 pack body and validate CV-1455's exact closed schema, family/subject/context and original producer/receipt facts. Before returning, after the last helper, independently compare the complete candidate output with the decoded actual original and original selector, then revalidate current source/frontier/access/deletion/withdrawal/maintenance authority with no helper between that pure final predicate and disclosure. Changed authority discards the result; a still leased coherent snapshot may finish only as that boundary. Retained lawful history uses its original authenticated schema/recipe and does not need a current live object, policy outcome or request cache; unsupported or invalid original admission stays unavailable.

  Explicitly adopt SP-286/CV-339 `storage.first_append_receipt.resolve.v2` as the original custody source. No consumer may substitute Storage-assigned timestamps/sequence, a supplied digest, alternate family, first-receipt locator or projection for the exact original full value. Source canonical backup/payload/identity custody is not reconstructed from the index. Return metadata/ref-only observations under current source permission and deletion; raw or no-longer-visible bodies stay inaccessible. Replay does not execute any owner effect. Retention is exactly RP-AUTHORITY-INDEFINITE@1.0.0, with the open question in CV-1455 where pending; this reader creates no new retention class.

  Compatibility/withdrawal adopts CV-1455: fence new producer at exact registry cutoff, stop withdrawn reader/in-flight lease, keep genuine original receipt reads separate, and require a reviewed versioned successor and StorageMigrationCoordinator rebuild/publication before renewed derived reads. Unknown versions fail closed, never bind an old URI to a new codec.

  Family checkpoint disposition `none_required` is explicit. This stateless lookup owns zero stored family values, no projector, no family key, cursor, cache or durable output. There is no family durable advance/CAS to implement. The independently published generic SP-278 checkpoint and its validation remain mandatory. Runtime Artifacts consumes discovery metadata, the existing SessionPromptInbox consumes prompt observations, and Executor consumes graph-lock observations; none may treat this read as dispatch/verification authority or bypass their existing canonical state/admission checks. No Storage value registry row is invented for a stateless read. Criterion 12 remains PARTIAL under the per-family oracle plan.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-1455
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- discovery.invoked@1.0.0
- reader.discovery.invoked@1.0.0
- reader.storage.event_record_index@1.0.0
- event_record_index_checkpoint.v1:{storage_instance_id}
- event_record_index.v2@{generation_id}
- event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}
- storage.first_append_receipt.resolve.v2
- none_required
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### SP-1456 - discovery.selected Reader And Storage Adoption

```yaml
plan_unit_id: SP-1456
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage owner contract for `discovery.selected@1.0.0`, reusing CV-1456 and the family's base search. `reader.discovery.selected@1.0.0` is its exact versioned operating consumer. Only this exact family/payload version is read; envelope scope/subject joins and the candidate source must equal the immutable requested selector. Bounded selector contains actual storage_instance_id, scope_partition, project_id, event_type=discovery.selected, event_id and sequence_id, plus the exact owner subject (request_id for discovery, source_session_id/prompt_id/target_thread_id for prompts, attempt_id/receipt_id for ceiling, run_id/lock_id/replan_generation for graph). Relevant subject fields must match the decoded payload; optional foreign fields cannot redirect it.

  Explicitly adopt SP-278 `reader.storage.event_record_index@1.0.0`. In one actual redb read transaction select checkpoints root `event_record_index_checkpoint.v1:{storage_instance_id}`, its current_generation_id, exact generation node/checkpoint_ref and same-database `event_record_index.v2@{generation_id}` dataset. Lookup key is `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`, with Storage's reversible project~ partition and exact twenty-digit uint64 formatting. Verify actual CURRENT/manifest/source controls, immutable birth anchor, live frontier, complete global coverage including nonmatching scopes/families, lawful gaps, frame CRC, payload/wire/producer commitments and original admission/full-value custody through the owners; generation equality or a matching-row maximum never establishes coverage. The SP-278 durable token is its exact nine fields; add only the current transaction's redb_snapshot_id in memory and verify the full token. Same-generation append invalidates the old frontier token. Compacted source requires actual identity-preserving translation custody; a missing source never becomes a fabricated event.

  At entry independently capture original immutable selector, Storage instance, full source/read token, maintenance epoch and actual access/deletion/hold authority. Resolve the inline or SP-337 pack body and validate CV-1456's exact closed schema, family/subject/context and original producer/receipt facts. Before returning, after the last helper, independently compare the complete candidate output with the decoded actual original and original selector, then revalidate current source/frontier/access/deletion/withdrawal/maintenance authority with no helper between that pure final predicate and disclosure. Changed authority discards the result; a still leased coherent snapshot may finish only as that boundary. Retained lawful history uses its original authenticated schema/recipe and does not need a current live object, policy outcome or request cache; unsupported or invalid original admission stays unavailable.

  Explicitly adopt SP-286/CV-339 `storage.first_append_receipt.resolve.v2` as the original custody source. No consumer may substitute Storage-assigned timestamps/sequence, a supplied digest, alternate family, first-receipt locator or projection for the exact original full value. Source canonical backup/payload/identity custody is not reconstructed from the index. Return metadata/ref-only observations under current source permission and deletion; raw or no-longer-visible bodies stay inaccessible. Replay does not execute any owner effect. Retention is exactly RP-AUTHORITY-INDEFINITE@1.0.0, with the open question in CV-1456 where pending; this reader creates no new retention class.

  Compatibility/withdrawal adopts CV-1456: fence new producer at exact registry cutoff, stop withdrawn reader/in-flight lease, keep genuine original receipt reads separate, and require a reviewed versioned successor and StorageMigrationCoordinator rebuild/publication before renewed derived reads. Unknown versions fail closed, never bind an old URI to a new codec.

  Family checkpoint disposition `none_required` is explicit. This stateless lookup owns zero stored family values, no projector, no family key, cursor, cache or durable output. There is no family durable advance/CAS to implement. The independently published generic SP-278 checkpoint and its validation remain mandatory. Runtime Artifacts consumes discovery metadata, the existing SessionPromptInbox consumes prompt observations, and Executor consumes graph-lock observations; none may treat this read as dispatch/verification authority or bypass their existing canonical state/admission checks. No Storage value registry row is invented for a stateless read. Criterion 12 remains PARTIAL under the per-family oracle plan.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-1456
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- discovery.selected@1.0.0
- reader.discovery.selected@1.0.0
- reader.storage.event_record_index@1.0.0
- event_record_index_checkpoint.v1:{storage_instance_id}
- event_record_index.v2@{generation_id}
- event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}
- storage.first_append_receipt.resolve.v2
- none_required
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### SP-1457 - discovery.unsupported Reader And Storage Adoption

```yaml
plan_unit_id: SP-1457
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage owner contract for `discovery.unsupported@1.0.0`, reusing CV-1457 and the family's base search. `reader.discovery.unsupported@1.0.0` is its exact versioned operating consumer. Only this exact family/payload version is read; envelope scope/subject joins and the candidate source must equal the immutable requested selector. Bounded selector contains actual storage_instance_id, scope_partition, project_id, event_type=discovery.unsupported, event_id and sequence_id, plus the exact owner subject (request_id for discovery, source_session_id/prompt_id/target_thread_id for prompts, attempt_id/receipt_id for ceiling, run_id/lock_id/replan_generation for graph). Relevant subject fields must match the decoded payload; optional foreign fields cannot redirect it.

  Explicitly adopt SP-278 `reader.storage.event_record_index@1.0.0`. In one actual redb read transaction select checkpoints root `event_record_index_checkpoint.v1:{storage_instance_id}`, its current_generation_id, exact generation node/checkpoint_ref and same-database `event_record_index.v2@{generation_id}` dataset. Lookup key is `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`, with Storage's reversible project~ partition and exact twenty-digit uint64 formatting. Verify actual CURRENT/manifest/source controls, immutable birth anchor, live frontier, complete global coverage including nonmatching scopes/families, lawful gaps, frame CRC, payload/wire/producer commitments and original admission/full-value custody through the owners; generation equality or a matching-row maximum never establishes coverage. The SP-278 durable token is its exact nine fields; add only the current transaction's redb_snapshot_id in memory and verify the full token. Same-generation append invalidates the old frontier token. Compacted source requires actual identity-preserving translation custody; a missing source never becomes a fabricated event.

  At entry independently capture original immutable selector, Storage instance, full source/read token, maintenance epoch and actual access/deletion/hold authority. Resolve the inline or SP-337 pack body and validate CV-1457's exact closed schema, family/subject/context and original producer/receipt facts. Before returning, after the last helper, independently compare the complete candidate output with the decoded actual original and original selector, then revalidate current source/frontier/access/deletion/withdrawal/maintenance authority with no helper between that pure final predicate and disclosure. Changed authority discards the result; a still leased coherent snapshot may finish only as that boundary. Retained lawful history uses its original authenticated schema/recipe and does not need a current live object, policy outcome or request cache; unsupported or invalid original admission stays unavailable.

  Explicitly adopt SP-286/CV-339 `storage.first_append_receipt.resolve.v2` as the original custody source. No consumer may substitute Storage-assigned timestamps/sequence, a supplied digest, alternate family, first-receipt locator or projection for the exact original full value. Source canonical backup/payload/identity custody is not reconstructed from the index. Return metadata/ref-only observations under current source permission and deletion; raw or no-longer-visible bodies stay inaccessible. Replay does not execute any owner effect. Retention is exactly RP-AUTHORITY-INDEFINITE@1.0.0, with the open question in CV-1457 where pending; this reader creates no new retention class.

  Compatibility/withdrawal adopts CV-1457: fence new producer at exact registry cutoff, stop withdrawn reader/in-flight lease, keep genuine original receipt reads separate, and require a reviewed versioned successor and StorageMigrationCoordinator rebuild/publication before renewed derived reads. Unknown versions fail closed, never bind an old URI to a new codec.

  Family checkpoint disposition `none_required` is explicit. This stateless lookup owns zero stored family values, no projector, no family key, cursor, cache or durable output. There is no family durable advance/CAS to implement. The independently published generic SP-278 checkpoint and its validation remain mandatory. Runtime Artifacts consumes discovery metadata, the existing SessionPromptInbox consumes prompt observations, and Executor consumes graph-lock observations; none may treat this read as dispatch/verification authority or bypass their existing canonical state/admission checks. No Storage value registry row is invented for a stateless read. Criterion 12 remains PARTIAL under the per-family oracle plan.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-1457
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- discovery.unsupported@1.0.0
- reader.discovery.unsupported@1.0.0
- reader.storage.event_record_index@1.0.0
- event_record_index_checkpoint.v1:{storage_instance_id}
- event_record_index.v2@{generation_id}
- event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}
- storage.first_append_receipt.resolve.v2
- none_required
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### SP-1458 - discovery.verified Reader And Storage Adoption

```yaml
plan_unit_id: SP-1458
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage owner contract for `discovery.verified@1.0.0`, reusing CV-1458 and the family's base search. `reader.discovery.verified@1.0.0` is its exact versioned operating consumer. Only this exact family/payload version is read; envelope scope/subject joins and the candidate source must equal the immutable requested selector. Bounded selector contains actual storage_instance_id, scope_partition, project_id, event_type=discovery.verified, event_id and sequence_id, plus the exact owner subject (request_id for discovery, source_session_id/prompt_id/target_thread_id for prompts, attempt_id/receipt_id for ceiling, run_id/lock_id/replan_generation for graph). Relevant subject fields must match the decoded payload; optional foreign fields cannot redirect it.

  Explicitly adopt SP-278 `reader.storage.event_record_index@1.0.0`. In one actual redb read transaction select checkpoints root `event_record_index_checkpoint.v1:{storage_instance_id}`, its current_generation_id, exact generation node/checkpoint_ref and same-database `event_record_index.v2@{generation_id}` dataset. Lookup key is `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`, with Storage's reversible project~ partition and exact twenty-digit uint64 formatting. Verify actual CURRENT/manifest/source controls, immutable birth anchor, live frontier, complete global coverage including nonmatching scopes/families, lawful gaps, frame CRC, payload/wire/producer commitments and original admission/full-value custody through the owners; generation equality or a matching-row maximum never establishes coverage. The SP-278 durable token is its exact nine fields; add only the current transaction's redb_snapshot_id in memory and verify the full token. Same-generation append invalidates the old frontier token. Compacted source requires actual identity-preserving translation custody; a missing source never becomes a fabricated event.

  At entry independently capture original immutable selector, Storage instance, full source/read token, maintenance epoch and actual access/deletion/hold authority. Resolve the inline or SP-337 pack body and validate CV-1458's exact closed schema, family/subject/context and original producer/receipt facts. Before returning, after the last helper, independently compare the complete candidate output with the decoded actual original and original selector, then revalidate current source/frontier/access/deletion/withdrawal/maintenance authority with no helper between that pure final predicate and disclosure. Changed authority discards the result; a still leased coherent snapshot may finish only as that boundary. Retained lawful history uses its original authenticated schema/recipe and does not need a current live object, policy outcome or request cache; unsupported or invalid original admission stays unavailable.

  Explicitly adopt SP-286/CV-339 `storage.first_append_receipt.resolve.v2` as the original custody source. No consumer may substitute Storage-assigned timestamps/sequence, a supplied digest, alternate family, first-receipt locator or projection for the exact original full value. Source canonical backup/payload/identity custody is not reconstructed from the index. Return metadata/ref-only observations under current source permission and deletion; raw or no-longer-visible bodies stay inaccessible. Replay does not execute any owner effect. Retention is exactly RP-AUTHORITY-INDEFINITE@1.0.0, with the open question in CV-1458 where pending; this reader creates no new retention class.

  Compatibility/withdrawal adopts CV-1458: fence new producer at exact registry cutoff, stop withdrawn reader/in-flight lease, keep genuine original receipt reads separate, and require a reviewed versioned successor and StorageMigrationCoordinator rebuild/publication before renewed derived reads. Unknown versions fail closed, never bind an old URI to a new codec.

  Family checkpoint disposition `none_required` is explicit. This stateless lookup owns zero stored family values, no projector, no family key, cursor, cache or durable output. There is no family durable advance/CAS to implement. The independently published generic SP-278 checkpoint and its validation remain mandatory. Runtime Artifacts consumes discovery metadata, the existing SessionPromptInbox consumes prompt observations, and Executor consumes graph-lock observations; none may treat this read as dispatch/verification authority or bypass their existing canonical state/admission checks. No Storage value registry row is invented for a stateless read. Criterion 12 remains PARTIAL under the per-family oracle plan.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-1458
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- discovery.verified@1.0.0
- reader.discovery.verified@1.0.0
- reader.storage.event_record_index@1.0.0
- event_record_index_checkpoint.v1:{storage_instance_id}
- event_record_index.v2@{generation_id}
- event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}
- storage.first_append_receipt.resolve.v2
- none_required
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### SP-1460 - run.graph_canonical_locked Reader And Storage Adoption

```yaml
plan_unit_id: SP-1460
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage owner contract for `run.graph_canonical_locked@1.0.0`, reusing CV-1460 and the family's base search. `reader.run.graph_canonical_locked@1.0.0` is its exact versioned operating consumer. Only this exact family/payload version is read; envelope scope/subject joins and the candidate source must equal the immutable requested selector. Bounded selector contains actual storage_instance_id, scope_partition, project_id, event_type=run.graph_canonical_locked, event_id and sequence_id, plus the exact owner subject (request_id for discovery, source_session_id/prompt_id/target_thread_id for prompts, attempt_id/receipt_id for ceiling, run_id/lock_id/replan_generation for graph). Relevant subject fields must match the decoded payload; optional foreign fields cannot redirect it.

  Explicitly adopt SP-278 `reader.storage.event_record_index@1.0.0`. In one actual redb read transaction select checkpoints root `event_record_index_checkpoint.v1:{storage_instance_id}`, its current_generation_id, exact generation node/checkpoint_ref and same-database `event_record_index.v2@{generation_id}` dataset. Lookup key is `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`, with Storage's reversible project~ partition and exact twenty-digit uint64 formatting. Verify actual CURRENT/manifest/source controls, immutable birth anchor, live frontier, complete global coverage including nonmatching scopes/families, lawful gaps, frame CRC, payload/wire/producer commitments and original admission/full-value custody through the owners; generation equality or a matching-row maximum never establishes coverage. The SP-278 durable token is its exact nine fields; add only the current transaction's redb_snapshot_id in memory and verify the full token. Same-generation append invalidates the old frontier token. Compacted source requires actual identity-preserving translation custody; a missing source never becomes a fabricated event.

  At entry independently capture original immutable selector, Storage instance, full source/read token, maintenance epoch and actual access/deletion/hold authority. Resolve the inline or SP-337 pack body and validate CV-1460's exact closed schema, family/subject/context and original producer/receipt facts. Before returning, after the last helper, independently compare the complete candidate output with the decoded actual original and original selector, then revalidate current source/frontier/access/deletion/withdrawal/maintenance authority with no helper between that pure final predicate and disclosure. Changed authority discards the result; a still leased coherent snapshot may finish only as that boundary. Retained lawful history uses its original authenticated schema/recipe and does not need a current live object, policy outcome or request cache; unsupported or invalid original admission stays unavailable.

  Explicitly adopt SP-286/CV-339 `storage.first_append_receipt.resolve.v2` as the original custody source. No consumer may substitute Storage-assigned timestamps/sequence, a supplied digest, alternate family, first-receipt locator or projection for the exact original full value. Source canonical backup/payload/identity custody is not reconstructed from the index. Return metadata/ref-only observations under current source permission and deletion; raw or no-longer-visible bodies stay inaccessible. Replay does not execute any owner effect. Retention is exactly RP-RUNTIME-365D@1.0.0, with the open question in CV-1460 where pending; this reader creates no new retention class.

  Compatibility/withdrawal adopts CV-1460: fence new producer at exact registry cutoff, stop withdrawn reader/in-flight lease, keep genuine original receipt reads separate, and require a reviewed versioned successor and StorageMigrationCoordinator rebuild/publication before renewed derived reads. Unknown versions fail closed, never bind an old URI to a new codec.

  Family checkpoint disposition `none_required` is explicit. This stateless lookup owns zero stored family values, no projector, no family key, cursor, cache or durable output. There is no family durable advance/CAS to implement. The independently published generic SP-278 checkpoint and its validation remain mandatory. Runtime Artifacts consumes discovery metadata, the existing SessionPromptInbox consumes prompt observations, and Executor consumes graph-lock observations; none may treat this read as dispatch/verification authority or bypass their existing canonical state/admission checks. No Storage value registry row is invented for a stateless read. Criterion 12 remains PARTIAL under the per-family oracle plan.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-1460
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- run.graph_canonical_locked@1.0.0
- reader.run.graph_canonical_locked@1.0.0
- reader.storage.event_record_index@1.0.0
- event_record_index_checkpoint.v1:{storage_instance_id}
- event_record_index.v2@{generation_id}
- event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}
- storage.first_append_receipt.resolve.v2
- none_required
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### SP-1461 - session_prompt.admitted Reader And Storage Adoption

```yaml
plan_unit_id: SP-1461
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage owner contract for `session_prompt.admitted@1.0.0`, reusing CV-1461 and the family's base search. `reader.session_prompt.admitted@1.0.0` is its exact versioned operating consumer. Only this exact family/payload version is read; envelope scope/subject joins and the candidate source must equal the immutable requested selector. Bounded selector contains actual storage_instance_id, scope_partition, project_id, event_type=session_prompt.admitted, event_id and sequence_id, plus the exact owner subject (request_id for discovery, source_session_id/prompt_id/target_thread_id for prompts, attempt_id/receipt_id for ceiling, run_id/lock_id/replan_generation for graph). Relevant subject fields must match the decoded payload; optional foreign fields cannot redirect it.

  Explicitly adopt SP-278 `reader.storage.event_record_index@1.0.0`. In one actual redb read transaction select checkpoints root `event_record_index_checkpoint.v1:{storage_instance_id}`, its current_generation_id, exact generation node/checkpoint_ref and same-database `event_record_index.v2@{generation_id}` dataset. Lookup key is `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`, with Storage's reversible project~ partition and exact twenty-digit uint64 formatting. Verify actual CURRENT/manifest/source controls, immutable birth anchor, live frontier, complete global coverage including nonmatching scopes/families, lawful gaps, frame CRC, payload/wire/producer commitments and original admission/full-value custody through the owners; generation equality or a matching-row maximum never establishes coverage. The SP-278 durable token is its exact nine fields; add only the current transaction's redb_snapshot_id in memory and verify the full token. Same-generation append invalidates the old frontier token. Compacted source requires actual identity-preserving translation custody; a missing source never becomes a fabricated event.

  At entry independently capture original immutable selector, Storage instance, full source/read token, maintenance epoch and actual access/deletion/hold authority. Resolve the inline or SP-337 pack body and validate CV-1461's exact closed schema, family/subject/context and original producer/receipt facts. Before returning, after the last helper, independently compare the complete candidate output with the decoded actual original and original selector, then revalidate current source/frontier/access/deletion/withdrawal/maintenance authority with no helper between that pure final predicate and disclosure. Changed authority discards the result; a still leased coherent snapshot may finish only as that boundary. Retained lawful history uses its original authenticated schema/recipe and does not need a current live object, policy outcome or request cache; unsupported or invalid original admission stays unavailable.

  Explicitly adopt SP-286/CV-339 `storage.first_append_receipt.resolve.v2` as the original custody source. No consumer may substitute Storage-assigned timestamps/sequence, a supplied digest, alternate family, first-receipt locator or projection for the exact original full value. Source canonical backup/payload/identity custody is not reconstructed from the index. Return metadata/ref-only observations under current source permission and deletion; raw or no-longer-visible bodies stay inaccessible. Replay does not execute any owner effect. Retention is exactly PENDING_RETENTION_DECISION, with the open question in CV-1461 where pending; this reader creates no new retention class.

  Compatibility/withdrawal adopts CV-1461: fence new producer at exact registry cutoff, stop withdrawn reader/in-flight lease, keep genuine original receipt reads separate, and require a reviewed versioned successor and StorageMigrationCoordinator rebuild/publication before renewed derived reads. Unknown versions fail closed, never bind an old URI to a new codec.

  Family checkpoint disposition `none_required` is explicit. This stateless lookup owns zero stored family values, no projector, no family key, cursor, cache or durable output. There is no family durable advance/CAS to implement. The independently published generic SP-278 checkpoint and its validation remain mandatory. Runtime Artifacts consumes discovery metadata, the existing SessionPromptInbox consumes prompt observations, and Executor consumes graph-lock observations; none may treat this read as dispatch/verification authority or bypass their existing canonical state/admission checks. No Storage value registry row is invented for a stateless read. Criterion 12 remains PARTIAL under the per-family oracle plan.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-1461
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- session_prompt.admitted@1.0.0
- reader.session_prompt.admitted@1.0.0
- reader.storage.event_record_index@1.0.0
- event_record_index_checkpoint.v1:{storage_instance_id}
- event_record_index.v2@{generation_id}
- event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}
- storage.first_append_receipt.resolve.v2
- none_required
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### SP-1462 - session_prompt.cancelled Reader And Storage Adoption

```yaml
plan_unit_id: SP-1462
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage owner contract for `session_prompt.cancelled@1.0.0`, reusing CV-1462 and the family's base search. `reader.session_prompt.cancelled@1.0.0` is its exact versioned operating consumer. Only this exact family/payload version is read; envelope scope/subject joins and the candidate source must equal the immutable requested selector. Bounded selector contains actual storage_instance_id, scope_partition, project_id, event_type=session_prompt.cancelled, event_id and sequence_id, plus the exact owner subject (request_id for discovery, source_session_id/prompt_id/target_thread_id for prompts, attempt_id/receipt_id for ceiling, run_id/lock_id/replan_generation for graph). Relevant subject fields must match the decoded payload; optional foreign fields cannot redirect it.

  Explicitly adopt SP-278 `reader.storage.event_record_index@1.0.0`. In one actual redb read transaction select checkpoints root `event_record_index_checkpoint.v1:{storage_instance_id}`, its current_generation_id, exact generation node/checkpoint_ref and same-database `event_record_index.v2@{generation_id}` dataset. Lookup key is `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`, with Storage's reversible project~ partition and exact twenty-digit uint64 formatting. Verify actual CURRENT/manifest/source controls, immutable birth anchor, live frontier, complete global coverage including nonmatching scopes/families, lawful gaps, frame CRC, payload/wire/producer commitments and original admission/full-value custody through the owners; generation equality or a matching-row maximum never establishes coverage. The SP-278 durable token is its exact nine fields; add only the current transaction's redb_snapshot_id in memory and verify the full token. Same-generation append invalidates the old frontier token. Compacted source requires actual identity-preserving translation custody; a missing source never becomes a fabricated event.

  At entry independently capture original immutable selector, Storage instance, full source/read token, maintenance epoch and actual access/deletion/hold authority. Resolve the inline or SP-337 pack body and validate CV-1462's exact closed schema, family/subject/context and original producer/receipt facts. Before returning, after the last helper, independently compare the complete candidate output with the decoded actual original and original selector, then revalidate current source/frontier/access/deletion/withdrawal/maintenance authority with no helper between that pure final predicate and disclosure. Changed authority discards the result; a still leased coherent snapshot may finish only as that boundary. Retained lawful history uses its original authenticated schema/recipe and does not need a current live object, policy outcome or request cache; unsupported or invalid original admission stays unavailable.

  Explicitly adopt SP-286/CV-339 `storage.first_append_receipt.resolve.v2` as the original custody source. No consumer may substitute Storage-assigned timestamps/sequence, a supplied digest, alternate family, first-receipt locator or projection for the exact original full value. Source canonical backup/payload/identity custody is not reconstructed from the index. Return metadata/ref-only observations under current source permission and deletion; raw or no-longer-visible bodies stay inaccessible. Replay does not execute any owner effect. Retention is exactly PENDING_RETENTION_DECISION, with the open question in CV-1462 where pending; this reader creates no new retention class.

  Compatibility/withdrawal adopts CV-1462: fence new producer at exact registry cutoff, stop withdrawn reader/in-flight lease, keep genuine original receipt reads separate, and require a reviewed versioned successor and StorageMigrationCoordinator rebuild/publication before renewed derived reads. Unknown versions fail closed, never bind an old URI to a new codec.

  Family checkpoint disposition `none_required` is explicit. This stateless lookup owns zero stored family values, no projector, no family key, cursor, cache or durable output. There is no family durable advance/CAS to implement. The independently published generic SP-278 checkpoint and its validation remain mandatory. Runtime Artifacts consumes discovery metadata, the existing SessionPromptInbox consumes prompt observations, and Executor consumes graph-lock observations; none may treat this read as dispatch/verification authority or bypass their existing canonical state/admission checks. No Storage value registry row is invented for a stateless read. Criterion 12 remains PARTIAL under the per-family oracle plan.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-1462
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- session_prompt.cancelled@1.0.0
- reader.session_prompt.cancelled@1.0.0
- reader.storage.event_record_index@1.0.0
- event_record_index_checkpoint.v1:{storage_instance_id}
- event_record_index.v2@{generation_id}
- event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}
- storage.first_append_receipt.resolve.v2
- none_required
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### SP-1463 - session_prompt.expired Reader And Storage Adoption

```yaml
plan_unit_id: SP-1463
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage owner contract for `session_prompt.expired@1.0.0`, reusing CV-1463 and the family's base search. `reader.session_prompt.expired@1.0.0` is its exact versioned operating consumer. Only this exact family/payload version is read; envelope scope/subject joins and the candidate source must equal the immutable requested selector. Bounded selector contains actual storage_instance_id, scope_partition, project_id, event_type=session_prompt.expired, event_id and sequence_id, plus the exact owner subject (request_id for discovery, source_session_id/prompt_id/target_thread_id for prompts, attempt_id/receipt_id for ceiling, run_id/lock_id/replan_generation for graph). Relevant subject fields must match the decoded payload; optional foreign fields cannot redirect it.

  Explicitly adopt SP-278 `reader.storage.event_record_index@1.0.0`. In one actual redb read transaction select checkpoints root `event_record_index_checkpoint.v1:{storage_instance_id}`, its current_generation_id, exact generation node/checkpoint_ref and same-database `event_record_index.v2@{generation_id}` dataset. Lookup key is `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`, with Storage's reversible project~ partition and exact twenty-digit uint64 formatting. Verify actual CURRENT/manifest/source controls, immutable birth anchor, live frontier, complete global coverage including nonmatching scopes/families, lawful gaps, frame CRC, payload/wire/producer commitments and original admission/full-value custody through the owners; generation equality or a matching-row maximum never establishes coverage. The SP-278 durable token is its exact nine fields; add only the current transaction's redb_snapshot_id in memory and verify the full token. Same-generation append invalidates the old frontier token. Compacted source requires actual identity-preserving translation custody; a missing source never becomes a fabricated event.

  At entry independently capture original immutable selector, Storage instance, full source/read token, maintenance epoch and actual access/deletion/hold authority. Resolve the inline or SP-337 pack body and validate CV-1463's exact closed schema, family/subject/context and original producer/receipt facts. Before returning, after the last helper, independently compare the complete candidate output with the decoded actual original and original selector, then revalidate current source/frontier/access/deletion/withdrawal/maintenance authority with no helper between that pure final predicate and disclosure. Changed authority discards the result; a still leased coherent snapshot may finish only as that boundary. Retained lawful history uses its original authenticated schema/recipe and does not need a current live object, policy outcome or request cache; unsupported or invalid original admission stays unavailable.

  Explicitly adopt SP-286/CV-339 `storage.first_append_receipt.resolve.v2` as the original custody source. No consumer may substitute Storage-assigned timestamps/sequence, a supplied digest, alternate family, first-receipt locator or projection for the exact original full value. Source canonical backup/payload/identity custody is not reconstructed from the index. Return metadata/ref-only observations under current source permission and deletion; raw or no-longer-visible bodies stay inaccessible. Replay does not execute any owner effect. Retention is exactly PENDING_RETENTION_DECISION, with the open question in CV-1463 where pending; this reader creates no new retention class.

  Compatibility/withdrawal adopts CV-1463: fence new producer at exact registry cutoff, stop withdrawn reader/in-flight lease, keep genuine original receipt reads separate, and require a reviewed versioned successor and StorageMigrationCoordinator rebuild/publication before renewed derived reads. Unknown versions fail closed, never bind an old URI to a new codec.

  Family checkpoint disposition `none_required` is explicit. This stateless lookup owns zero stored family values, no projector, no family key, cursor, cache or durable output. There is no family durable advance/CAS to implement. The independently published generic SP-278 checkpoint and its validation remain mandatory. Runtime Artifacts consumes discovery metadata, the existing SessionPromptInbox consumes prompt observations, and Executor consumes graph-lock observations; none may treat this read as dispatch/verification authority or bypass their existing canonical state/admission checks. No Storage value registry row is invented for a stateless read. Criterion 12 remains PARTIAL under the per-family oracle plan.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-1463
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- session_prompt.expired@1.0.0
- reader.session_prompt.expired@1.0.0
- reader.storage.event_record_index@1.0.0
- event_record_index_checkpoint.v1:{storage_instance_id}
- event_record_index.v2@{generation_id}
- event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}
- storage.first_append_receipt.resolve.v2
- none_required
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

### SP-1464 - session_prompt.rejected Reader And Storage Adoption

```yaml
plan_unit_id: SP-1464
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage owner contract for `session_prompt.rejected@1.0.0`, reusing CV-1464 and the family's base search. `reader.session_prompt.rejected@1.0.0` is its exact versioned operating consumer. Only this exact family/payload version is read; envelope scope/subject joins and the candidate source must equal the immutable requested selector. Bounded selector contains actual storage_instance_id, scope_partition, project_id, event_type=session_prompt.rejected, event_id and sequence_id, plus the exact owner subject (request_id for discovery, source_session_id/prompt_id/target_thread_id for prompts, attempt_id/receipt_id for ceiling, run_id/lock_id/replan_generation for graph). Relevant subject fields must match the decoded payload; optional foreign fields cannot redirect it.

  Explicitly adopt SP-278 `reader.storage.event_record_index@1.0.0`. In one actual redb read transaction select checkpoints root `event_record_index_checkpoint.v1:{storage_instance_id}`, its current_generation_id, exact generation node/checkpoint_ref and same-database `event_record_index.v2@{generation_id}` dataset. Lookup key is `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`, with Storage's reversible project~ partition and exact twenty-digit uint64 formatting. Verify actual CURRENT/manifest/source controls, immutable birth anchor, live frontier, complete global coverage including nonmatching scopes/families, lawful gaps, frame CRC, payload/wire/producer commitments and original admission/full-value custody through the owners; generation equality or a matching-row maximum never establishes coverage. The SP-278 durable token is its exact nine fields; add only the current transaction's redb_snapshot_id in memory and verify the full token. Same-generation append invalidates the old frontier token. Compacted source requires actual identity-preserving translation custody; a missing source never becomes a fabricated event.

  At entry independently capture original immutable selector, Storage instance, full source/read token, maintenance epoch and actual access/deletion/hold authority. Resolve the inline or SP-337 pack body and validate CV-1464's exact closed schema, family/subject/context and original producer/receipt facts. Before returning, after the last helper, independently compare the complete candidate output with the decoded actual original and original selector, then revalidate current source/frontier/access/deletion/withdrawal/maintenance authority with no helper between that pure final predicate and disclosure. Changed authority discards the result; a still leased coherent snapshot may finish only as that boundary. Retained lawful history uses its original authenticated schema/recipe and does not need a current live object, policy outcome or request cache; unsupported or invalid original admission stays unavailable.

  Explicitly adopt SP-286/CV-339 `storage.first_append_receipt.resolve.v2` as the original custody source. No consumer may substitute Storage-assigned timestamps/sequence, a supplied digest, alternate family, first-receipt locator or projection for the exact original full value. Source canonical backup/payload/identity custody is not reconstructed from the index. Return metadata/ref-only observations under current source permission and deletion; raw or no-longer-visible bodies stay inaccessible. Replay does not execute any owner effect. Retention is exactly PENDING_RETENTION_DECISION, with the open question in CV-1464 where pending; this reader creates no new retention class.

  Compatibility/withdrawal adopts CV-1464: fence new producer at exact registry cutoff, stop withdrawn reader/in-flight lease, keep genuine original receipt reads separate, and require a reviewed versioned successor and StorageMigrationCoordinator rebuild/publication before renewed derived reads. Unknown versions fail closed, never bind an old URI to a new codec.

  Family checkpoint disposition `none_required` is explicit. This stateless lookup owns zero stored family values, no projector, no family key, cursor, cache or durable output. There is no family durable advance/CAS to implement. The independently published generic SP-278 checkpoint and its validation remain mandatory. Runtime Artifacts consumes discovery metadata, the existing SessionPromptInbox consumes prompt observations, and Executor consumes graph-lock observations; none may treat this read as dispatch/verification authority or bypass their existing canonical state/admission checks. No Storage value registry row is invented for a stateless read. Criterion 12 remains PARTIAL under the per-family oracle plan.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing
  owners.
depends_on:
- CV-1464
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- session_prompt.rejected@1.0.0
- reader.session_prompt.rejected@1.0.0
- reader.storage.event_record_index@1.0.0
- event_record_index_checkpoint.v1:{storage_instance_id}
- event_record_index.v2@{generation_id}
- event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}
- storage.first_append_receipt.resolve.v2
- none_required
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```


### SP-1459 - planning.question_budget_exhausted Operating Reader And Storage Contract

```yaml
plan_unit_id: SP-1459
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored Storage owner contract for `planning.question_budget_exhausted@1.0.0`, reusing CV-1459 and the family's base search. `reader.planning.question_budget_exhausted@1.0.0` is its exact versioned operating consumer. Only this exact family/payload version is read; envelope scope/subject joins and the candidate source must equal the immutable requested selector. Bounded selector contains actual storage_instance_id, scope_partition, project_id, event_type=planning.question_budget_exhausted, event_id and sequence_id, plus the exact owner subject budget_run_id, workflow_kind, backend and exhaustion_id. Relevant subject fields must match the decoded payload; optional foreign fields cannot redirect it.

  Explicitly adopt SP-278 `reader.storage.event_record_index@1.0.0`. In one actual redb read transaction select checkpoints root `event_record_index_checkpoint.v1:{storage_instance_id}`, its current_generation_id, exact generation node/checkpoint_ref and same-database `event_record_index.v2@{generation_id}` dataset. Lookup key is `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`, with Storage's reversible project~ partition and exact twenty-digit uint64 formatting. Verify actual CURRENT/manifest/source controls, immutable birth anchor, live frontier, complete global coverage including nonmatching scopes/families, lawful gaps, frame CRC, payload/wire/producer commitments and original admission/full-value custody through the owners; generation equality or a matching-row maximum never establishes coverage. The SP-278 durable token is its exact nine fields; add only the current transaction's redb_snapshot_id in memory and verify the full token. Same-generation append invalidates the old frontier token. Compacted source requires actual identity-preserving translation custody; a missing source never becomes a fabricated event.

  At entry independently capture original immutable selector, Storage instance, full source/read token, maintenance epoch and actual access/deletion/hold authority. Resolve the inline or SP-337 pack body and validate CV-1459's exact closed schema, family/subject/context and original producer/receipt facts. Before returning, after the last helper, independently compare the complete candidate output with the decoded actual original and original selector, then revalidate current source/frontier/access/deletion/withdrawal/maintenance authority with no helper between that pure final predicate and disclosure. Changed authority discards the result; a still leased coherent snapshot may finish only as that boundary. Retained lawful history uses its original authenticated schema/recipe and does not need a current live object, policy outcome or request cache; unsupported or invalid original admission stays unavailable.

  Explicitly adopt SP-286/CV-339 `storage.first_append_receipt.resolve.v2` as the original custody source. No consumer may substitute Storage-assigned timestamps/sequence, a supplied digest, alternate family, first-receipt locator or projection for the exact original full value. Source canonical backup/payload/identity custody is not reconstructed from the index. Return metadata/ref-only observations under current source permission and deletion; raw or no-longer-visible bodies stay inaccessible. Replay does not execute any owner effect. Retention is exactly PENDING_RETENTION_DECISION, with the open question in CV-1459 where pending; this reader creates no new retention class.

  Compatibility/withdrawal adopts CV-1459: fence new producer at exact registry cutoff, stop withdrawn reader/in-flight lease, keep genuine original receipt reads separate, and require a reviewed versioned successor and StorageMigrationCoordinator rebuild/publication before renewed derived reads. Unknown versions fail closed, never bind an old URI to a new codec.

  Family checkpoint disposition `none_required` is explicit. This stateless lookup owns zero stored family values, no projector, no family key, cursor, cache or durable output. There is no family durable advance/CAS to implement. The independently published generic SP-278 checkpoint and its validation remain mandatory. The planning-runtime history reader consumes only this typed-result observation; it never treats the read as question-admission, Grill confirmation or Build authority and cannot bypass those owners' canonical checks. No Storage value registry row is invented for a stateless read. Criterion 12 remains PARTIAL under the per-family oracle plan.

  This exact operating consumer is a stateless planning-history observation only. It resolves the original typed refusal and continuation with its charged-record/policy snapshot, never recomputes history from today's allowance, and performs no question charge, confirmation or Build action. family_checkpoint=none_required, zero durable family effects, no family CAS; the independently complete generic SP-278 checkpoint remains mandatory. No family-specific Storage value is added. Retention stays PENDING_RETENTION_DECISION with CV-1459's exact question; no deletion/lifetime rule is inferred.
gui_related: false
gui_classification_reason: Event storage, identity and custody contract; visual presentation belongs to existing owners.
depends_on:
- CV-1459
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Only the exact named family/version and original owner facts can satisfy this contract.
- Prepared without admission; no native append, runtime enablement or readiness claim.
- Phase 2 must implement the per-guard oracle plan and shared isolation proof before review.
validation_surfaces:
- Plans/w3f_event_oracle_plan.json
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
- python3 scripts/pm-plan-index.py validate
risk_class: event_authority_original_custody_and_scope
reasoning_tier: high
context_scope: event_authority_w3f_phase1
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- reports/event-authority-20261105/W3F-search.json
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/ANSWERS_E-CARDS-2_20261105.md
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-2.as-presented-6db25be3.md#9.a
preserved_exact_tokens:
- planning.question_budget_exhausted@1.0.0
- reader.planning.question_budget_exhausted@1.0.0
- PENDING_RETENTION_DECISION
negative_constraints:
- No registry family append, admission record, Decision Log change, governance reseal or native execution.
- Never infer a binding, policy, source authority or migration from a sibling family.
```

ContractRef: ContractName:Plans/Contracts_V0.md#CV-1459, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286
