# Shard 099: SP-508 — remediation.spawned prepared Event Authority contract

Source: `Plans/storage-plan.md`

Source lines: L37972-L38029

Source SHA256: `061de9812b079dcc649e9397de0071aa2472ce57e36117379778cf0cb70047f1`

---

## SP-508 — remediation.spawned prepared Event Authority contract

Newly authored owner contract under DL-045 for `remediation.spawned@1.0.0` only. Family-specific search and negative evidence: reports/event-authority-20261104/DX.md. This is prepared without admission. replay_policy=dedupe_by_idempotency_key. Before admission, dedupe lookup, receipt return or any effect, reject projector_replay_only as replay_only_not_appendable and reject any other policy for this current writer. Compatibility-only projector replay stays on the read/rebuild path and cannot append or perform canonical effects. This family independently tests both the capture refusal and zero-effect append/retry refusal in Plans/executor_event_semantic_fixtures.json. Define I = RFC8785([project_id, run_id, node_id, child_attempt_id, remediation_root_id, remediation_generation, event_sequence]) using those required payload values in exactly that order; idempotency_key = "executor:remediation.spawned:v1:" + lowerhex(SHA256(I)); event_id = "evt_executor_" + lowerhex(SHA256(RFC8785([storage_instance_id, "remediation.spawned", I]))), where I in the latter array is the UTF-8 JSON string of the first canonical array. Same scoped identity and semantic digest returns the exact original SP-286/CV-339 first receipt and full original result; different digest is idempotency_conflict; unavailable proof is dedupe_unavailable. ts is immutable first observation evidence, never dedupe input. Event bus delivery does not weaken the app-root dedupe indexes or writer-lock catch-up.

For `remediation.spawned` independently, adopt EventRecord and SP-337 before append: the uncompressed canonical MessagePack logical body (SP-1100 `pm.seglog_frame_v2.event_value.canonical_msgpack.v1`) may be inline only at or below 16,384 bytes; a larger body uses payload_ref into the content-addressed payload packs, never a family detail/evidence ref or an inline base64 body. Verify exact BLAKE3, byte size, media type, original logical source-body equality, actual Project/Storage custody, retained/authorized access and durable pack bytes/index before acknowledging the referencing record. Keep larger logical bodies valid through this path. The normalized static oracle resolves payload_ref to the SP-337 descriptor and retained pack bytes; its application/msgpack descriptor is a test representation, not a new persisted EventRecord wire schema or producer-semantic digest. Each family tests exact boundary, oversized inline refusal, referenced success and independently corrupted hash/size/type/source/custody. Existing receipt, retention, holds, deletion and backup owners remain authoritative.


The exact operating consumer is `executor.remediation_spawned.history_reader.v1@1.0.0`: an on-demand read-only history/recovery-evidence view for this family, never a command dispatcher. It adopts SP-278 by name and calls reader.storage.event_record_index@1.0.0. Reuse projector.storage.event_record_index@1.0.0, actual checkpoints table key event_record_index_checkpoint.v1:{storage_instance_id}, schema Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, current_generation_id and exact #/generations/{generation_id} node, same-database dataset event_record_index.v2@{generation_id}, row key event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}. Verify complete CURRENT-selected global source coverage including nonmatching records, actual immutable birth anchor and current frontier before filtering this family's Project rows. The generic projector atomically CASes its expected generation/frontier and publishes dataset rows plus advancing frontier in one transaction; stale CAS exposes nothing. Consumer has no durable local cursor or new stored value/projection family: its exact checkpoint is the existing generic one. Existing attempt_record/blocked_projection/scheduler_pass records keep their owners; this reader cannot turn them into canonical authority or claim their independent contract is complete.

This family explicitly adopts SP-278's DL-076 nine-field durable read token: storage_instance_id, checkpoint_key, checkpoint_ref, generation_id, generation_anchor_sha256, frontier_revision, frontier_sha256, index_dataset_name, source_selection. No persisted redb_snapshot_id. Read within one actual redb transaction by adding that transaction's live redb_snapshot_id, verify the whole token against actual synchronized source and current frontier; revalidate before disclosure. Append, compaction, epoch change or withdrawal invalidates stale reads. Unavailable source yields unavailable/degraded evidence, never fabricated empty history. Rebuild through the generic owner from retained canonical source, with lawful gaps and source retirement translation; a matching-family maximum cannot advance its checkpoint. Replay/rebuild never appends, dispatches, retries, charges, notifies or mutates canonical bodies.

Source event retention_policy_ref = `{"policy_id": "RP-RUNTIME-365D", "policy_version": "1.0.0", "registry_schema_id": "pm.storage_value_registry.v2"}`. Case L-3 explicitly names Runtime/run/node/attempt: 365 days from run completion, 1,000,000/run and 5,000,000/project, successor compaction, latest-25 terminal runs and all stronger holds unchanged. Generic checkpoint remains under existing RP-PROJECTION-3GEN; index rows remain RP-EVENT-INDEX-SOURCE. No new local checkpoint/projection retention assignment is made.

Storage holds the immutable EventRecord and exact original first receipt under SP-286 full-value v2 custody; referenced bodies remain with their existing owners and policies. Settled coherent Server/Project backup and restore must preserve source, dedupe, original receipt and referenced canonical dependencies together with actual scope/root lineage; source loss fences recovery, never synthesizes historical originals. At every read/disclosure/export recheck viewer access, Project/scope, lawful deletion, holds and source availability. Event retention grants no linked-body access or extra body lifetime. Redacted refs only; any unhandled secret rejects before append.

Compatibility is exact-version dispatch; explicit legacy import from CV-508 is read-only and uses original provenance, not a second write path. Withdrawal closes this family's emitter admission under the writer fence, drains/reconciles existing original operations and retains their original receipts, then fences `executor.remediation_spawned.history_reader.v1@1.0.0` and invalidates its tokens. Generic-index retention and other families continue under their own owners. No old reader may mark this family current after withdrawal. A successor requires explicit schema/version owner installation, source-backed rebuild, original identity preservation and fresh coverage validation before reader activation. This contract registers nothing.

Pass-two semantic oracles for `remediation.spawned` explicitly adopt this family's source adapter `executor.remediation_spawned.source_adapter.v1@1.0.0` (EP-218) and its original input/revision/sequence custody. Authored positive and negative traces in `Plans/executor_event_semantic_fixtures.json` cover lost acknowledgment/crash/duplicate returning the same first receipt with one original effect, same-identity body conflict, missing original custody refusing replay, writer cutoff with original reconciliation, reader withdrawal refusing disclosure, compaction invalidating stale tokens, source-backed rebuild and missing originals. `scripts/pm_executor_event_semantics.py` exercises these as a finite static model; the actual SP-278 nine-field token, source translation, checkpoint CAS, SP-286 v2 codec/flush/restore and withdrawal concurrency remain separate native NOT_RUN acceptance obligations. No two-field model token is a persisted SP-278 token.

For `remediation.spawned` independently, select numeric and format rules from authenticated write-time Storage custody, per retained original and per stored source/dependency record. New writes and current identity inputs use `executor-jcs-binary64-v1`: RFC8785 bytes qualified under CV-1100 (each integer's binary64 value and its emitted JCS decimal must both equal the original integer: 2^53 passes, while 2^53+1 and 2^60 refuse before effects; no float aliases). Current raw integer spellings and payload integer slots use CV-1100's shared current-input admission (no `-0`, leading zeros, fractions, exponents or booleans; schema minima apply), and typed source joins compare exact owner values without imposing a JCS range (SP-1100). Retained/compatibility `executor-json-integer-v0` originals keep their then-valid integer JSON recipe: UTF-8, lexicographic string-key ordering, no insignificant whitespace, exact decimal integers; preserve original bytes, IDs, source hashes and first receipt. Every stored-value validator/hash route must use the same `record_rules` selection: outer retained custody, original identity, source/dependency/evidence hashes, typed joins, logical payload/pack validation and fresh owner-read dependency checks. Original edition and complete original/body digest are bound by independently authenticated append custody; reader/caller fields cannot register an edition, downgrade a current write, select a weaker recipe, or trigger a try-old-hash fallback. Missing/unsupported provenance fails closed; current-edition retained controls also pin their original append custody. Retained reads resolve through SP-1101's shared authenticated dispatch: the custody-selected recipe tuple pins the frozen payload-schema and source-adapter resources of the original, so a replaced same-URI resource or an original authenticated for another family refuses. The static custody fixture catalogue models that owner read only; it is never a native admission list or a new persisted payload field.

```yaml
plan_unit_id: SP-508
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: remediation.spawned@1.0.0 has the exact family-local prepared contract
  in this unit, without Event Authority admission.
gui_related: false
depends_on:
- DL-045
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- remediation.spawned uses its own closed payload, immutable identity, source-backed
  reader and publication/withdrawal fences.
validation_surfaces:
- Plans/executor_event_contract_fixtures.json
- scripts/pm_executor_event_contracts.py
risk_class: unadmitted_or_duplicate_executor_effect
reasoning_tier: high
context_scope: event_authority_wave2_DX
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- remediation.spawned
negative_constraints:
- No admission, runtime proof, retention choice, WorkNode or governance seal.
```

ContractRef: ContractName:Plans/Executor_Protocol.md#EP-218, ContractName:Plans/Contracts_V0.md#CV-508, ContractName:Plans/storage-plan.md#SP-508
