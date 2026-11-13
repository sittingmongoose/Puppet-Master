# Shard 106: SP-515 — scheduler.pass prepared Event Authority contract

Source: `Plans/storage-plan.md`

Source lines: L38393-L42553

Source SHA256: `db2a94f673296fff30ba523c868ea8be1f79b97ad4996f105c90470d08e4fa46`

---

## SP-515 — scheduler.pass prepared Event Authority contract

Newly authored owner contract under DL-045 for `scheduler.pass@1.0.0` only. Family-specific search and negative evidence: reports/event-authority-20261104/DX.md. This is prepared without admission. replay_policy=dedupe_by_idempotency_key. Before admission, dedupe lookup, receipt return or any effect, reject projector_replay_only as replay_only_not_appendable and reject any other policy for this current writer. Compatibility-only projector replay stays on the read/rebuild path and cannot append or perform canonical effects. This family independently tests both the capture refusal and zero-effect append/retry refusal in Plans/executor_event_semantic_fixtures.json. Define I = RFC8785([project_id, run_id, scheduler_pass_id, event_sequence]) using those required payload values in exactly that order; idempotency_key = "executor:scheduler.pass:v1:" + lowerhex(SHA256(I)); event_id = "evt_executor_" + lowerhex(SHA256(RFC8785([storage_instance_id, "scheduler.pass", I]))), where I in the latter array is the UTF-8 JSON string of the first canonical array. Same scoped identity and semantic digest returns the exact original SP-286/CV-339 first receipt and full original result; different digest is idempotency_conflict; unavailable proof is dedupe_unavailable. ts is immutable first observation evidence, never dedupe input. Event bus delivery does not weaken the app-root dedupe indexes or writer-lock catch-up.

For `scheduler.pass` independently, adopt EventRecord and SP-337 before append: the uncompressed canonical MessagePack logical body (SP-1100 `pm.seglog_frame_v2.event_value.canonical_msgpack.v1`) may be inline only at or below 16,384 bytes; a larger body uses payload_ref into the content-addressed payload packs, never a family detail/evidence ref or an inline base64 body. Verify exact BLAKE3, byte size, media type, original logical source-body equality, actual Project/Storage custody, retained/authorized access and durable pack bytes/index before acknowledging the referencing record. Keep larger logical bodies valid through this path. The normalized static oracle resolves payload_ref to the SP-337 descriptor and retained pack bytes; its application/msgpack descriptor is a test representation, not a new persisted EventRecord wire schema or producer-semantic digest. Each family tests exact boundary, oversized inline refusal, referenced success and independently corrupted hash/size/type/source/custody. Existing receipt, retention, holds, deletion and backup owners remain authoritative.


The exact operating consumer is `executor.scheduler_pass.history_reader.v1@1.0.0`: an on-demand read-only history/recovery-evidence view for this family, never a command dispatcher. It adopts SP-278 by name and calls reader.storage.event_record_index@1.0.0. Reuse projector.storage.event_record_index@1.0.0, actual checkpoints table key event_record_index_checkpoint.v1:{storage_instance_id}, schema Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, current_generation_id and exact #/generations/{generation_id} node, same-database dataset event_record_index.v2@{generation_id}, row key event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}. Verify complete CURRENT-selected global source coverage including nonmatching records, actual immutable birth anchor and current frontier before filtering this family's Project rows. The generic projector atomically CASes its expected generation/frontier and publishes dataset rows plus advancing frontier in one transaction; stale CAS exposes nothing. Consumer has no durable local cursor or new stored value/projection family: its exact checkpoint is the existing generic one. Existing attempt_record/blocked_projection/scheduler_pass records keep their owners; this reader cannot turn them into canonical authority or claim their independent contract is complete.

This family explicitly adopts SP-278's DL-076 nine-field durable read token: storage_instance_id, checkpoint_key, checkpoint_ref, generation_id, generation_anchor_sha256, frontier_revision, frontier_sha256, index_dataset_name, source_selection. No persisted redb_snapshot_id. Read within one actual redb transaction by adding that transaction's live redb_snapshot_id, verify the whole token against actual synchronized source and current frontier; revalidate before disclosure. Append, compaction, epoch change or withdrawal invalidates stale reads. Unavailable source yields unavailable/degraded evidence, never fabricated empty history. Rebuild through the generic owner from retained canonical source, with lawful gaps and source retirement translation; a matching-family maximum cannot advance its checkpoint. Replay/rebuild never appends, dispatches, retries, charges, notifies or mutates canonical bodies.

Source event retention_policy_ref = `{"policy_id": "RP-RUNTIME-365D", "policy_version": "1.0.0", "registry_schema_id": "pm.storage_value_registry.v2"}`. Contracts_V0 explicitly classifies scheduler.pass as a canonical runtime event family; Storage’s Scheduler Runtime addendum and SP-198 preserve that runtime classification. Apply Case L-3 and the existing RP-RUNTIME-365D@1.0.0 catalog mechanically: 365 days (31,536,000 seconds) after actual run completion, 1,000,000/run and 5,000,000/project, with existing stronger holds, latest-25 terminal-run preservation, and successor compaction (roll_successor/compact). A retry, replay, index rebuild or re-observation never resets the original actual run-completion anchor. This is an assignment of the existing runtime class, not a new deletion-policy choice. Generic checkpoint remains under existing RP-PROJECTION-3GEN; index rows remain RP-EVENT-INDEX-SOURCE. No new local checkpoint/projection retention assignment is made.

Storage holds the immutable EventRecord and exact original first receipt under SP-286 full-value v2 custody; referenced bodies remain with their existing owners and policies. Settled coherent Server/Project backup and restore must preserve source, dedupe, original receipt and referenced canonical dependencies together with actual scope/root lineage; source loss fences recovery, never synthesizes historical originals. At every read/disclosure/export recheck viewer access, Project/scope, lawful deletion, holds and source availability. Event retention grants no linked-body access or extra body lifetime. Redacted refs only; any unhandled secret rejects before append.

Compatibility is exact-version dispatch; explicit legacy import from CV-515 is read-only and uses original provenance, not a second write path. Withdrawal closes this family's emitter admission under the writer fence, drains/reconciles existing original operations and retains their original receipts, then fences `executor.scheduler_pass.history_reader.v1@1.0.0` and invalidates its tokens. Generic-index retention and other families continue under their own owners. No old reader may mark this family current after withdrawal. A successor requires explicit schema/version owner installation, source-backed rebuild, original identity preservation and fresh coverage validation before reader activation. This contract registers nothing.

Pass-two semantic oracles for `scheduler.pass` explicitly adopt this family's source adapter `executor.scheduler_pass.source_adapter.v1@1.0.0` (EP-225) and its original input/revision/sequence custody. Authored positive and negative traces in `Plans/executor_event_semantic_fixtures.json` cover lost acknowledgment/crash/duplicate returning the same first receipt with one original effect, same-identity body conflict, missing original custody refusing replay, writer cutoff with original reconciliation, reader withdrawal refusing disclosure, compaction invalidating stale tokens, source-backed rebuild and missing originals. `scripts/pm_executor_event_semantics.py` exercises these as a finite static model; the actual SP-278 nine-field token, source translation, checkpoint CAS, SP-286 v2 codec/flush/restore and withdrawal concurrency remain separate native NOT_RUN acceptance obligations. No two-field model token is a persisted SP-278 token.

The former runtime-versus-telemetry question is closed by the current explicit runtime classification and existing Case L-3 policy above. Queue analysis being append-only observability does not reclassify this canonical runtime history. Family admission remains separately absent.

For `scheduler.pass` independently, select numeric and format rules from authenticated write-time Storage custody, per retained original and per stored source/dependency record. New writes and current identity inputs use `executor-jcs-binary64-v1`: RFC8785 bytes qualified under CV-1100 (each integer's binary64 value and its emitted JCS decimal must both equal the original integer: 2^53 passes, while 2^53+1 and 2^60 refuse before effects; no float aliases). Current raw integer spellings and payload integer slots use CV-1100's shared current-input admission (no `-0`, leading zeros, fractions, exponents or booleans; schema minima apply), and typed source joins compare exact owner values without imposing a JCS range (SP-1100). Retained/compatibility `executor-json-integer-v0` originals keep their then-valid integer JSON recipe: UTF-8, lexicographic string-key ordering, no insignificant whitespace, exact decimal integers; preserve original bytes, IDs, source hashes and first receipt. Every stored-value validator/hash route must use the same `record_rules` selection: outer retained custody, original identity, source/dependency/evidence hashes, typed joins, logical payload/pack validation and fresh owner-read dependency checks. Original edition and complete original/body digest are bound by independently authenticated append custody; reader/caller fields cannot register an edition, downgrade a current write, select a weaker recipe, or trigger a try-old-hash fallback. Missing/unsupported provenance fails closed; current-edition retained controls also pin their original append custody. Retained reads resolve through SP-1101's shared authenticated dispatch: the custody-selected recipe tuple pins the frozen payload-schema and source-adapter resources of the original, so a replaced same-URI resource or an original authenticated for another family refuses. The static custody fixture catalogue models that owner read only; it is never a native admission list or a new persisted payload field.

```yaml
plan_unit_id: SP-515
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: scheduler.pass@1.0.0 has the exact family-local prepared contract
  in this unit, without Event Authority admission.
gui_related: false
depends_on:
- DL-045
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- scheduler.pass uses its own closed payload, immutable identity, source-backed reader
  and publication/withdrawal fences.
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
- scheduler.pass
negative_constraints:
- No admission, runtime proof, retention choice, WorkNode or governance seal.
```

ContractRef: ContractName:Plans/Executor_Protocol.md#EP-225, ContractName:Plans/Contracts_V0.md#CV-515, ContractName:Plans/storage-plan.md#SP-515


### SP-630 - memory.dedup_sweep.completed persistence and history

```yaml
plan_unit_id: SP-630
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract under DL-045 for exactly memory.dedup_sweep.completed@1.0.0; search scope and negative evidence are the family's row in reports/event-authority-20261104/DMEM-search.json. The family remains absent from event_family_registry.json, quarantined before append or projection. Retention is PENDING_RETENTION_DECISION: candidate ordinary telemetry (Case L-3, 90 days/2,000,000 per Project) versus audit authority (indefinite/no count eviction); neither is selected. Unknown policy is materially incomplete and permits no destructive inference. Operation custody has the same pending assignment, and actual native activation is fenced until it resolves.
  Identity recipe for this family: use strict UTF-8 canonical JSON of the array ["pm.memory.maintenance.event.v1",storage_instance_id,project_id,operation_id,"memory.dedup_sweep.completed"] with no whitespace, ensure_ascii=false; SHA-256 lower hex. event_id="evt_mem_"+digest and idempotency_key="memory-maintenance:"+digest. All ids are nonempty bounded opaque owner-generated identifiers, not user content. The actual native acceptance generates operation_id once, persists it before publication and retries reuse it. request_sha256 binds the exact accepted command arguments and scope; a changed request under the same operation fails idempotency_conflict. Envelope type, payload type, project, correlation and causation must join CV-650.
  Original operation custody is the newly authored memory_dedup_sweep_operation family, closed schema Plans/memory_maintenance_operation.schema.json#/$defs/dedup_sweep, key memory_dedup_sweep_operation.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(operation_id)} in canonical redb table memory_maintenance_operations. Hex is lowercase UTF-8 bytes, reversible and separator-safe. Admit its schema through the actual StorageMigrationCoordinator before any write, never inferred store versions. No duplicate command journal or gist store is created. Initial accepted row and request digest commit before append. This family explicitly adopts SP-286 and CV-339 full-value v2 first-AppendReceipt custody: validate admission, append barrier-class SeglogFrameV2 through SP-026/SP-236 with full flush, durably settle original receipt, then advance operation state. New issuance uses v2; resolve_full_value.v1 verifies the exact original event; missing/legacy-only proof fences dependent state. Lost delivery resolves the original receipt and cannot mint another event.
  The operation state machine is accepted -> started -> effect_committed -> completed. The started event's durable receipt is required before started state and before any effect. Freeze the original started id. Canonical gist mutation and effect_committed outcome/ref/hash commit atomically in assistant_memory.redb under its single writer; partially applied sweeps resume only from recorded owner progress or roll back the transaction, never rerun committed merges or verification. Derived index rebuilds prepare a source-revision-bound shadow and durably record its exact target identity before swap; on recovery inspect that exact selected target and settle the same outcome under the maintenance lease, never republish a different target or infer success from mtime. Recheck source revision and permission before effect; stale source records a settled failure without changing gists. The completed event appends only from effect_committed with its frozen succeeded/failed result. Its original receipt precedes completed row and terminal disclosure. If append succeeds but row advancement crashes, recover the stored original receipt and apply the same transition by CAS against exact prior row; failure before receipt cannot authorize a transition. Pending/ambiguous effect is unavailable until original owner recovery settles it. Event replay never runs maintenance. This family records only the unique original terminal outcome; it cannot occur before the original start or be followed by another terminal result.
  Exact consumer reader.memory.dedup_sweep.completed.history.v1@1.0.0 is a newly authored stateless read-only binding used by Memory maintenance history and audit lookup for this exact type. It explicitly adopts SP-278: use reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, checkpoint table checkpoints, key event_record_index_checkpoint.v1:{storage_instance_id}, closed value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, generation-qualified event_record_index.v2@{generation_id}. The generic projector atomically CAS-advances complete rows and root frontier, never this reader. No new filtered durable cursor or projection value exists. Each read joins original source bytes, exact payload and operation/result custody, complete CURRENT-selected root/generation/frontier, original row birth anchor, actual permission/deletion/hold state. Recheck every fence after helpers and immediately before disclosure. Missing or stale authority returns unavailable; timestamps and cached views cannot substitute. Uses the ten-field live read token in its actual read transaction; any durable generic token is exactly SP-278/DL-076's nine fields, with redb_snapshot_id excluded. Reader output is ephemeral and never a persisted token. Generic checkpoint retains existing RP-PROJECTION-3GEN and index RP-EVENT-INDEX-SOURCE; missing derived state quarantines/rebuilds from retained source and never restores deleted gists.
  Original operation/result, canonical gists, EventRecord and SP-286 receipts join coherent BRS-031 capture/restore boundaries; derived indexes are rebuilt, never backed up as canonical gists (DL-270). Ref resolution checks current Project access, source tombstones and holds on every read; ref/hash grants no access and body unavailability is disclosed without reconstructing content. Preserve original history and never retain deleted content inside audit metadata. Unknown retention and operation-custody deletion remain pending, not an indefinite assignment.
  Only exact version 1.0.0 has this writer/reader; unknown or incompatible editions fail closed with original bytes preserved for authorized history. No implicit alias/migration. Withdrawal first fences new command acceptance and this family's writer admission, drains or explicitly leaves unresolved existing original operations without reissuing them, then under the same maintenance/read fence disables reader.memory.dedup_sweep.completed.history.v1@1.0.0 publication and invalidates live tokens. Generic index readers for other families continue. A successor must be explicitly admitted and rebuild from retained authenticated source with its own version; no withdrawn reader checkpoint can authorize effects. No event, policy, registry membership, readiness or native execution is admitted here.

  Operation rows use the phase constraints of their closed schema: accepted has no event receipt or outcome; started has only the original start receipt; effect_committed has a complete frozen outcome and no terminal receipt; completed has both receipts and the same outcome. A withdrawn pseudo-phase is invalid: withdrawal fences admission externally and preserves the last durable phase. Every mutation is a whole-value CAS against the exact prior operation row under the single maintenance writer; request, scope, source, start time and receipt identities never change. started_occurred_at_utc freezes at acceptance; completed_occurred_at_utc freezes with effect_committed. Reconstruct payload fields from these values, never the retry clock. result_ref="memresult_"+SHA-256(strict UTF-8 compact JSON ["pm.memory.maintenance.result_ref.v1",storage_instance_id,project_id,operation_id]); resolve it only through that exact tuple and its canonical operation key under current Project permission, never as a free-standing body locator. result_sha256 is SHA-256 of strict UTF-8 compact JSON ["pm.memory.maintenance.result.v1",storage_instance_id,project_id,operation_id,command_id,source_revision_sha256,status,target_id_or_null]; target_id_or_null is the prepared target id for rebuilds, null otherwise. This binds the outcome in the original operation row without an unspecified external result body. Operation and selector values explicitly adopt SP-340's canonical/derived file split and 16 KiB MessagePack value cap, with coordination_and_storage and search_and_indexes profiles respectively. UTC timestamp fields are at most 64 characters. Preparation must reserve room for the worst-case completed row (both event ids, succeeded, result ref/hash and a 64-character terminal timestamp) within that cap before selector CAS. Oversize metadata fails before publication; never truncate an inventory to fit. Completed payload status/ref/hash and frozen time must equal that row and, when present, the exact retained SP-286 full-value original. Started retries likewise equal the original full value. A hash or Boolean proof flag alone is insufficient.

  Newly authored current-writer boundary for exactly memory.dedup_sweep.completed@1.0.0, after the independent round-2 search in reports/event-authority-20261104/DMEM-search.json: reuse Contracts_V0.md#EventRecord at schema_version=2.0.0; payload_schema_id=https://puppetmaster.local/Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_dedup_sweep_completed; replay_policy=dedupe_by_idempotency_key. Normal append and retry reject projector_replay_only as replay_only_not_appendable before returning an original, appending or applying an effect; compatibility-reader-only policy grants no writer path. Use Storage section 2.2.5 project~{base64url_no_pad(UTF8(project_id))} for the scoped dedupe identity, with this exact event type and the existing idempotency key. Validate the canonical envelope and all payload/identity/causality joins; full-value originals remain SP-286 custody. The independent ATS-315 canonical boundary suite is separate from the reduced synthetic phase values. Recovery rechecks current Project permission and family withdrawal before any original disclosure, including completed operations; refusal returns no output and leaves durable state unchanged. Original start custody on every path, including post-completion retry and recovery, follows the start custody gate below. Lane-owned identifier schemas require exact fixed lengths or a full-input regex guard; trailing LF is invalid.

  Start custody gate for exactly memory.dedup_sweep.completed@1.0.0, newly authored owner contract (DMEM fix round 4): the one rule behind every start-custody sentence in AMS-100, CV-650 and this SP-630. It adopts SP-286 and CV-339 first-AppendReceipt full-value custody and replaces none of their terms. Every path after first start admission goes through it: the completed append and its retry, the effect_committed to completed row CAS, the effect and its settlement, retry and replay of either retained original, recovery from every phase, the canonical current-writer append and retry, boundary acceptance and the history reader. Before such a path appends, CAS-publishes a row or selector, settles an effect, or returns or discloses an original, it resolves the exact original start record, the SP-286 retained full-value original of memory.dedup_sweep.started@1.0.0 under this operation's memory_dedup_sweep_operation.v1 key, authenticated through storage.first_append_receipt.resolve_full_value.v1, and verifies all of: identity (event_id and idempotency_key recompute from the SP-631 recipe for this storage_instance_id, project_id and operation_id); digest (the retained full-value commitment recomputes from the retained value); operation (correlation_id and payload operation, Project, source revision, command and frozen start time equal the operation row); phase (the event type is exactly memory.dedup_sweep.started and the row is accepted only before the start receipt, otherwise a later lawful phase); receipt (the first AppendReceipt settled under full flush, and the row's started_event_id and this event's causation_event_id and payload started_event_id name exactly that record); and no withdrawal fence on this family or memory.dedup_sweep.started@1.0.0. Missing, corrupted, mismatched or withdrawn custody refuses with start_receipt_missing, or permission_or_withdrawal for a withdrawal fence, before any append, CAS, selector change, effect or output; the operation stays at its last durable phase and is never reissued. The gate is evaluated on the prior durable state and again on the tentative result immediately before commit, after any path-specific refusal, so no path, including one added later, can append, publish or return without it. The only relaxation belongs to memory.dedup_sweep.started's own first append from an accepted row with no start receipt and no later original; no path of this family has it. Terminal custody stays the separate status/result/hash check above. The history reader returns a retained original that verified when written whatever the operation's current live state (later phase, source revision, selector, counters or request), and still refuses a withdrawal fence, revoked Project access, a forged or unverifiable original or missing start custody; it changes no state. Retention stays pending: this gate selects no retention period.

  The static oracle in ATS-315 checks actual operation instances, exact expected/actual CAS rows, immutable retained synthetic full event values, and durable effect/selection counters through interrupted traces. Its crash action drops only volatile publication state. Replaying or retrying a retained event can return only that original value and changes neither the effect ledger nor a selector. Physical transaction/flush/receipt authenticity remains native NOT_RUN.

  Current producer-semantic projections and current identity inputs follow CV-1100 (current recipe cv1100-exact-integer-write-v3): every numeric leaf is an exact integer primitive, never a boolean, runtime float or fraction/exponent token, within the range its field owner schema declares; no global safe-integer ceiling applies, and raw input uses the CV-1100 current JSON integer grammar (scripts/pm_event_numbers.py loads_current_json), so 01, +1, -0, 1.0 and 1e0 are never read as integers. This producer route excludes Storage-assigned sequence_id, observed_at_utc and persisted_at_utc under Contracts_V0.md#EventRecord. Storage sequence_id independently adopts SP-236 exact uint64, 0 through 18446744073709551615 inclusive, with exact integer type; booleans, floats and strings refuse. Fresh writes and metadata-only retries preserve that full domain without a producer-number ceiling. Decimal and exponent tokens decode losslessly to exact decimal carriers before validation and are never folded into integers. Identity, idempotency, result and target commitments keep their local recipes, sorted-key compact UTF-8 JSON over unchanged preimages, and admit only exact integers: a fraction, exponent or float spelling, a nonfinite value or an integer outside the range of its field owner refuses before hashing or append instead of being normalized. A current-writer retained EventRecord carries the unchanged CV-339 full-value commitment (pm.storage.original_event_value_commitment.v1 over the complete 2.0.0 EventRecord map in SP-236 EVENT_VALUE bytes, scripts/pm_event_numbers.py full_value_commitment) with exact Storage uint64 metadata; no new serializer is introduced. Historical originals instead use their frozen write-time recipe integer-json-v1: pm.event.v0 envelope editions 1.0.0 and 2.0.0 both retain their original unbounded integral sequence domains; operation/target edition 1.0.0 uses the explicit historical_ definitions frozen from 77323e87d65908dbce2ea655ee344b6185a13ff1, including artifact byte_length up to 9223372036854775807. The two frozen envelope editions share the integer-json-v1 numeric/hash recipe, and no record field, edition included, selects a recipe. Reader dispatch follows SP-1101: each retained canonical original (the writer's returned or canonical start original, a canonical history original and its start record, a checkpoint-joined original) resolves once through the shared RetainedDispatcher, which takes the write-time recipe tuple (envelope edition, writer recipe, full-value profile and resources) from Storage's sealed custody of that exact retained record, never from the record's schema_id/schema_version, a recipe field or the caller, and the composition-installed frozen verifier of that tuple then runs its checks. An original Storage did not seal at its seglog ref, one sealed with more than one binding or recipe, a sealed binding that is not the reader's, or a recipe with no installed verifier refuses at the site's custody guard; there is no current-then-legacy probing, permissive fallback or current writer predicate. The original full-value commitment is recomputed under that recipe with no rewrite of retained values, hashes, frozen operation or receipt. Historical numeric decoding preserves the original typed integer or binary64 stored value; a current lossless decimal parse never reinterprets an older binary64 original. Original verification in current-writer retries and checkpoint reader projections uses the sealed recipe of that original (CV-339 for a current-writer original, frozen integer-json-v1 for an older one); only the new caller producer-semantic projection and new-write producer admission use the strict current recipe; new caller Storage metadata is independently checked against SP-236. Valid retained large integers remain readable in canonical, replay-only, compatibility and compatibility-replay modes after live state/admission/cutoffs change; forged commitments, rehashed foreign values, unknown editions/recipe fields, lost custody, revoked permission and withdrawal still refuse. Plans/memory_maintenance_event_record.schema.json keeps SP-236 current Storage uint64 bounds (SP-1100, checked with storage_uint64), the producer_sequence_id domain of the EventRecord owner without an added ceiling, and unchanged frozen reader definitions; operation/target schemas keep current definitions and their frozen historical_ counterparts. Generic Storage metadata ownership is unchanged. Every declared date-time format is enforced by the shared CV-1101 predicate (scripts/pm_event_datetime.py date_time) with the explicit profile of its field owner, without optional validator packages: payload and EventRecord occurred_at_utc and the SP-278 checkpoint times take the broad event_record profile (RFC 3339 with an explicit zone, lowercase t or z, offsets, year 0000, any fraction length and announced leap seconds); Storage-assigned observed_at_utc and persisted_at_utc take CV-253 storage_utc_z at the current and every retained envelope edition; the operation row's frozen started_occurred_at_utc and completed_occurred_at_utc keep their terminal-uppercase-Z owner pattern and take storage_utc_z. Bad calendar fields or separators, missing zones, an unannounced second 60 and trailing LF refuse, and a skipped old format check never authorizes invalid retained history. Existing length constraints remain. Timestamp strings retain their exact hash bytes. UUID uses the full 8-4-4-4-12 hexadecimal grammar. The selected recipe's frozen verifier applies the same profiles to retained originals; there is no narrower historical format edition.

  Permission/admission and withdrawal fields, and every Boolean boundary receipt/source/acceptance fence, require the exact Boolean type before their value is evaluated; strings, numeric 0/1, null, arrays and objects never grant authority or clear a fence. Historical reads still use current typed permission/withdrawal only, not current admission or cutoffs.

  DL-444 and DL-445 apply E-CARDS-2 Card 6.a and 6.b option A. Among owner-eligible identical embed_text_hash memories, keep the oldest by original created_at, breaking a tie by the unchanging note ID (lexical id order). Preserve every original EvidenceRef and the merge record identifying every original and the survivor; the survivor retains the union of evidence references. Archive the other eligible originals with their original identities, evidence references, versions and links to the survivor intact. They remain available in history and are never automatically deleted. Only the user deletes memories. Pinned memories stay excluded; skip any merge that pin protection forbids. These decisions do not broaden existing eligibility or scope, admit a writer, settle operation retention or bypass start custody. Scores for separate archive jobs do not select a duplicate survivor. Source E-CARDS-2 as presented, Card 6 options A, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30; decision-answers/E-CARDS-2.as-presented-6db25be3.md and ANSWERS_E-CARDS-2_20261105.md under /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104; DL-444 through DL-447, landed in Plans/Decision_Log.md on main.
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- SP-278
- SP-286
- AMS-100
- CV-650
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### SP-631 - memory.dedup_sweep.started persistence and history

```yaml
plan_unit_id: SP-631
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract under DL-045 for exactly memory.dedup_sweep.started@1.0.0; search scope and negative evidence are the family's row in reports/event-authority-20261104/DMEM-search.json. The family remains absent from event_family_registry.json, quarantined before append or projection. Retention is PENDING_RETENTION_DECISION: candidate ordinary telemetry (Case L-3, 90 days/2,000,000 per Project) versus audit authority (indefinite/no count eviction); neither is selected. Unknown policy is materially incomplete and permits no destructive inference. Operation custody has the same pending assignment, and actual native activation is fenced until it resolves.
  Identity recipe for this family: use strict UTF-8 canonical JSON of the array ["pm.memory.maintenance.event.v1",storage_instance_id,project_id,operation_id,"memory.dedup_sweep.started"] with no whitespace, ensure_ascii=false; SHA-256 lower hex. event_id="evt_mem_"+digest and idempotency_key="memory-maintenance:"+digest. All ids are nonempty bounded opaque owner-generated identifiers, not user content. The actual native acceptance generates operation_id once, persists it before publication and retries reuse it. request_sha256 binds the exact accepted command arguments and scope; a changed request under the same operation fails idempotency_conflict. Envelope type, payload type, project, correlation and causation must join CV-651.
  Original operation custody is the newly authored memory_dedup_sweep_operation family, closed schema Plans/memory_maintenance_operation.schema.json#/$defs/dedup_sweep, key memory_dedup_sweep_operation.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(operation_id)} in canonical redb table memory_maintenance_operations. Hex is lowercase UTF-8 bytes, reversible and separator-safe. Admit its schema through the actual StorageMigrationCoordinator before any write, never inferred store versions. No duplicate command journal or gist store is created. Initial accepted row and request digest commit before append. This family explicitly adopts SP-286 and CV-339 full-value v2 first-AppendReceipt custody: validate admission, append barrier-class SeglogFrameV2 through SP-026/SP-236 with full flush, durably settle original receipt, then advance operation state. New issuance uses v2; resolve_full_value.v1 verifies the exact original event; missing/legacy-only proof fences dependent state. Lost delivery resolves the original receipt and cannot mint another event.
  The operation state machine is accepted -> started -> effect_committed -> completed. The started event's durable receipt is required before started state and before any effect. Freeze the original started id. Canonical gist mutation and effect_committed outcome/ref/hash commit atomically in assistant_memory.redb under its single writer; partially applied sweeps resume only from recorded owner progress or roll back the transaction, never rerun committed merges or verification. Derived index rebuilds prepare a source-revision-bound shadow and durably record its exact target identity before swap; on recovery inspect that exact selected target and settle the same outcome under the maintenance lease, never republish a different target or infer success from mtime. Recheck source revision and permission before effect; stale source records a settled failure without changing gists. The completed event appends only from effect_committed with its frozen succeeded/failed result. Its original receipt precedes completed row and terminal disclosure. If append succeeds but row advancement crashes, recover the stored original receipt and apply the same transition by CAS against exact prior row; failure before receipt cannot authorize a transition. Pending/ambiguous effect is unavailable until original owner recovery settles it. Event replay never runs maintenance. This family records only the acceptance transition; it may not be reinterpreted as completion.
  Exact consumer reader.memory.dedup_sweep.started.history.v1@1.0.0 is a newly authored stateless read-only binding used by Memory maintenance history and audit lookup for this exact type. It explicitly adopts SP-278: use reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, checkpoint table checkpoints, key event_record_index_checkpoint.v1:{storage_instance_id}, closed value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, generation-qualified event_record_index.v2@{generation_id}. The generic projector atomically CAS-advances complete rows and root frontier, never this reader. No new filtered durable cursor or projection value exists. Each read joins original source bytes, exact payload and operation/result custody, complete CURRENT-selected root/generation/frontier, original row birth anchor, actual permission/deletion/hold state. Recheck every fence after helpers and immediately before disclosure. Missing or stale authority returns unavailable; timestamps and cached views cannot substitute. Uses the ten-field live read token in its actual read transaction; any durable generic token is exactly SP-278/DL-076's nine fields, with redb_snapshot_id excluded. Reader output is ephemeral and never a persisted token. Generic checkpoint retains existing RP-PROJECTION-3GEN and index RP-EVENT-INDEX-SOURCE; missing derived state quarantines/rebuilds from retained source and never restores deleted gists.
  Original operation/result, canonical gists, EventRecord and SP-286 receipts join coherent BRS-031 capture/restore boundaries; derived indexes are rebuilt, never backed up as canonical gists (DL-270). Ref resolution checks current Project access, source tombstones and holds on every read; ref/hash grants no access and body unavailability is disclosed without reconstructing content. Preserve original history and never retain deleted content inside audit metadata. Unknown retention and operation-custody deletion remain pending, not an indefinite assignment.
  Only exact version 1.0.0 has this writer/reader; unknown or incompatible editions fail closed with original bytes preserved for authorized history. No implicit alias/migration. Withdrawal first fences new command acceptance and this family's writer admission, drains or explicitly leaves unresolved existing original operations without reissuing them, then under the same maintenance/read fence disables reader.memory.dedup_sweep.started.history.v1@1.0.0 publication and invalidates live tokens. Generic index readers for other families continue. A successor must be explicitly admitted and rebuild from retained authenticated source with its own version; no withdrawn reader checkpoint can authorize effects. No event, policy, registry membership, readiness or native execution is admitted here.

  Operation rows use the phase constraints of their closed schema: accepted has no event receipt or outcome; started has only the original start receipt; effect_committed has a complete frozen outcome and no terminal receipt; completed has both receipts and the same outcome. A withdrawn pseudo-phase is invalid: withdrawal fences admission externally and preserves the last durable phase. Every mutation is a whole-value CAS against the exact prior operation row under the single maintenance writer; request, scope, source, start time and receipt identities never change. started_occurred_at_utc freezes at acceptance; completed_occurred_at_utc freezes with effect_committed. Reconstruct payload fields from these values, never the retry clock. result_ref="memresult_"+SHA-256(strict UTF-8 compact JSON ["pm.memory.maintenance.result_ref.v1",storage_instance_id,project_id,operation_id]); resolve it only through that exact tuple and its canonical operation key under current Project permission, never as a free-standing body locator. result_sha256 is SHA-256 of strict UTF-8 compact JSON ["pm.memory.maintenance.result.v1",storage_instance_id,project_id,operation_id,command_id,source_revision_sha256,status,target_id_or_null]; target_id_or_null is the prepared target id for rebuilds, null otherwise. This binds the outcome in the original operation row without an unspecified external result body. Operation and selector values explicitly adopt SP-340's canonical/derived file split and 16 KiB MessagePack value cap, with coordination_and_storage and search_and_indexes profiles respectively. UTC timestamp fields are at most 64 characters. Preparation must reserve room for the worst-case completed row (both event ids, succeeded, result ref/hash and a 64-character terminal timestamp) within that cap before selector CAS. Oversize metadata fails before publication; never truncate an inventory to fit. Completed payload status/ref/hash and frozen time must equal that row and, when present, the exact retained SP-286 full-value original. Started retries likewise equal the original full value. A hash or Boolean proof flag alone is insufficient.

  Newly authored current-writer boundary for exactly memory.dedup_sweep.started@1.0.0, after the independent round-2 search in reports/event-authority-20261104/DMEM-search.json: reuse Contracts_V0.md#EventRecord at schema_version=2.0.0; payload_schema_id=https://puppetmaster.local/Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_dedup_sweep_started; replay_policy=dedupe_by_idempotency_key. Normal append and retry reject projector_replay_only as replay_only_not_appendable before returning an original, appending or applying an effect; compatibility-reader-only policy grants no writer path. Use Storage section 2.2.5 project~{base64url_no_pad(UTF8(project_id))} for the scoped dedupe identity, with this exact event type and the existing idempotency key. Validate the canonical envelope and all payload/identity/causality joins; full-value originals remain SP-286 custody. The independent ATS-315 canonical boundary suite is separate from the reduced synthetic phase values. Recovery rechecks current Project permission and family withdrawal before any original disclosure, including completed operations; refusal returns no output and leaves durable state unchanged. Original start custody on every path, including post-completion retry and recovery, follows the start custody gate below. Lane-owned identifier schemas require exact fixed lengths or a full-input regex guard; trailing LF is invalid.

  Start custody gate for exactly memory.dedup_sweep.started@1.0.0, newly authored owner contract (DMEM fix round 4): the one rule behind every start-custody sentence in AMS-101, CV-651 and this SP-631. It adopts SP-286 and CV-339 first-AppendReceipt full-value custody and replaces none of their terms. Every path after first start admission goes through it: retry of this family's first append, the accepted to started row CAS, the effect and its settlement, the terminal append and row CAS of memory.dedup_sweep.completed, retry and replay of this original before and after completion, recovery from every phase, the canonical current-writer retry at every phase, boundary acceptance and the history reader. Before such a path appends, CAS-publishes a row or selector, settles an effect, or returns or discloses an original, it resolves the exact original start record, this family's own SP-286 retained full-value original under this operation's memory_dedup_sweep_operation.v1 key; this event is the start record of its operation, authenticated through storage.first_append_receipt.resolve_full_value.v1, and verifies all of: identity (event_id and idempotency_key recompute from this unit's recipe for this storage_instance_id, project_id and operation_id); digest (the retained full-value commitment recomputes from the retained value); operation (correlation_id and payload operation, Project, source revision, command and frozen start time equal the operation row); phase (the event type is exactly memory.dedup_sweep.started and the row is accepted only before the start receipt, otherwise a later lawful phase); receipt (the first AppendReceipt settled under full flush, and the row's started_event_id and any retained memory.dedup_sweep.completed original's causation_event_id and payload started_event_id name exactly that record); and no withdrawal fence on this family or memory.dedup_sweep.completed@1.0.0. Missing, corrupted, mismatched or withdrawn custody refuses with start_receipt_missing, or permission_or_withdrawal for a withdrawal fence, before any append, CAS, selector change, effect or output; the operation stays at its last durable phase and is never reissued. The gate is evaluated on the prior durable state and again on the tentative result immediately before commit, after any path-specific refusal, so no path, including one added later, can append, publish or return without it. The only relaxation is this family's first append from an accepted row with no start receipt and no later original: the record may then be absent, but one that is present is still verified, and the append must leave a verified record. Terminal custody stays the separate status/result/hash check above. The history reader returns a retained original that verified when written whatever the operation's current live state (later phase, source revision, selector, counters or request), and still refuses a withdrawal fence, revoked Project access, a forged or unverifiable original or missing start custody; it changes no state. Retention stays pending: this gate selects no retention period.

  The static oracle in ATS-315 checks actual operation instances, exact expected/actual CAS rows, immutable retained synthetic full event values, and durable effect/selection counters through interrupted traces. Its crash action drops only volatile publication state. Replaying or retrying a retained event can return only that original value and changes neither the effect ledger nor a selector. Physical transaction/flush/receipt authenticity remains native NOT_RUN.

  Current producer-semantic projections and current identity inputs follow CV-1100 (current recipe cv1100-exact-integer-write-v3): every numeric leaf is an exact integer primitive, never a boolean, runtime float or fraction/exponent token, within the range its field owner schema declares; no global safe-integer ceiling applies, and raw input uses the CV-1100 current JSON integer grammar (scripts/pm_event_numbers.py loads_current_json), so 01, +1, -0, 1.0 and 1e0 are never read as integers. This producer route excludes Storage-assigned sequence_id, observed_at_utc and persisted_at_utc under Contracts_V0.md#EventRecord. Storage sequence_id independently adopts SP-236 exact uint64, 0 through 18446744073709551615 inclusive, with exact integer type; booleans, floats and strings refuse. Fresh writes and metadata-only retries preserve that full domain without a producer-number ceiling. Decimal and exponent tokens decode losslessly to exact decimal carriers before validation and are never folded into integers. Identity, idempotency, result and target commitments keep their local recipes, sorted-key compact UTF-8 JSON over unchanged preimages, and admit only exact integers: a fraction, exponent or float spelling, a nonfinite value or an integer outside the range of its field owner refuses before hashing or append instead of being normalized. A current-writer retained EventRecord carries the unchanged CV-339 full-value commitment (pm.storage.original_event_value_commitment.v1 over the complete 2.0.0 EventRecord map in SP-236 EVENT_VALUE bytes, scripts/pm_event_numbers.py full_value_commitment) with exact Storage uint64 metadata; no new serializer is introduced. Historical originals instead use their frozen write-time recipe integer-json-v1: pm.event.v0 envelope editions 1.0.0 and 2.0.0 both retain their original unbounded integral sequence domains; operation/target edition 1.0.0 uses the explicit historical_ definitions frozen from 77323e87d65908dbce2ea655ee344b6185a13ff1, including artifact byte_length up to 9223372036854775807. The two frozen envelope editions share the integer-json-v1 numeric/hash recipe, and no record field, edition included, selects a recipe. Reader dispatch follows SP-1101: each retained canonical original (the writer's returned or canonical start original, a canonical history original and its start record, a checkpoint-joined original) resolves once through the shared RetainedDispatcher, which takes the write-time recipe tuple (envelope edition, writer recipe, full-value profile and resources) from Storage's sealed custody of that exact retained record, never from the record's schema_id/schema_version, a recipe field or the caller, and the composition-installed frozen verifier of that tuple then runs its checks. An original Storage did not seal at its seglog ref, one sealed with more than one binding or recipe, a sealed binding that is not the reader's, or a recipe with no installed verifier refuses at the site's custody guard; there is no current-then-legacy probing, permissive fallback or current writer predicate. The original full-value commitment is recomputed under that recipe with no rewrite of retained values, hashes, frozen operation or receipt. Historical numeric decoding preserves the original typed integer or binary64 stored value; a current lossless decimal parse never reinterprets an older binary64 original. Original verification in current-writer retries and checkpoint reader projections uses the sealed recipe of that original (CV-339 for a current-writer original, frozen integer-json-v1 for an older one); only the new caller producer-semantic projection and new-write producer admission use the strict current recipe; new caller Storage metadata is independently checked against SP-236. Valid retained large integers remain readable in canonical, replay-only, compatibility and compatibility-replay modes after live state/admission/cutoffs change; forged commitments, rehashed foreign values, unknown editions/recipe fields, lost custody, revoked permission and withdrawal still refuse. Plans/memory_maintenance_event_record.schema.json keeps SP-236 current Storage uint64 bounds (SP-1100, checked with storage_uint64), the producer_sequence_id domain of the EventRecord owner without an added ceiling, and unchanged frozen reader definitions; operation/target schemas keep current definitions and their frozen historical_ counterparts. Generic Storage metadata ownership is unchanged. Every declared date-time format is enforced by the shared CV-1101 predicate (scripts/pm_event_datetime.py date_time) with the explicit profile of its field owner, without optional validator packages: payload and EventRecord occurred_at_utc and the SP-278 checkpoint times take the broad event_record profile (RFC 3339 with an explicit zone, lowercase t or z, offsets, year 0000, any fraction length and announced leap seconds); Storage-assigned observed_at_utc and persisted_at_utc take CV-253 storage_utc_z at the current and every retained envelope edition; the operation row's frozen started_occurred_at_utc and completed_occurred_at_utc keep their terminal-uppercase-Z owner pattern and take storage_utc_z. Bad calendar fields or separators, missing zones, an unannounced second 60 and trailing LF refuse, and a skipped old format check never authorizes invalid retained history. Existing length constraints remain. Timestamp strings retain their exact hash bytes. UUID uses the full 8-4-4-4-12 hexadecimal grammar. The selected recipe's frozen verifier applies the same profiles to retained originals; there is no narrower historical format edition.

  Permission/admission and withdrawal fields, and every Boolean boundary receipt/source/acceptance fence, require the exact Boolean type before their value is evaluated; strings, numeric 0/1, null, arrays and objects never grant authority or clear a fence. Historical reads still use current typed permission/withdrawal only, not current admission or cutoffs.

  DL-444 and DL-445 apply E-CARDS-2 Card 6.a and 6.b option A. Among owner-eligible identical embed_text_hash memories, keep the oldest by original created_at, breaking a tie by the unchanging note ID (lexical id order). Preserve every original EvidenceRef and the merge record identifying every original and the survivor; the survivor retains the union of evidence references. Archive the other eligible originals with their original identities, evidence references, versions and links to the survivor intact. They remain available in history and are never automatically deleted. Only the user deletes memories. Pinned memories stay excluded; skip any merge that pin protection forbids. These decisions do not broaden existing eligibility or scope, admit a writer, settle operation retention or bypass start custody. Scores for separate archive jobs do not select a duplicate survivor. Source E-CARDS-2 as presented, Card 6 options A, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30; decision-answers/E-CARDS-2.as-presented-6db25be3.md and ANSWERS_E-CARDS-2_20261105.md under /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104; DL-444 through DL-447, landed in Plans/Decision_Log.md on main.
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- SP-278
- SP-286
- AMS-101
- CV-651
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### SP-632 - memory.index.lexical.rebuild.completed persistence and history

```yaml
plan_unit_id: SP-632
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract under DL-045 for exactly memory.index.lexical.rebuild.completed@1.0.0; search scope and negative evidence are the family's row in reports/event-authority-20261104/DMEM-search.json. The family remains absent from event_family_registry.json, quarantined before append or projection. Retention is PENDING_RETENTION_DECISION: candidate ordinary telemetry (Case L-3, 90 days/2,000,000 per Project) versus audit authority (indefinite/no count eviction); neither is selected. Unknown policy is materially incomplete and permits no destructive inference. Operation custody has the same pending assignment, and actual native activation is fenced until it resolves.
  Identity recipe for this family: use strict UTF-8 canonical JSON of the array ["pm.memory.maintenance.event.v1",storage_instance_id,project_id,operation_id,"memory.index.lexical.rebuild.completed"] with no whitespace, ensure_ascii=false; SHA-256 lower hex. event_id="evt_mem_"+digest and idempotency_key="memory-maintenance:"+digest. All ids are nonempty bounded opaque owner-generated identifiers, not user content. The actual native acceptance generates operation_id once, persists it before publication and retries reuse it. request_sha256 binds the exact accepted command arguments and scope; a changed request under the same operation fails idempotency_conflict. Envelope type, payload type, project, correlation and causation must join CV-652.
  Original operation custody is the newly authored memory_index_lexical_rebuild_operation family, closed schema Plans/memory_maintenance_operation.schema.json#/$defs/index_lexical_rebuild, key memory_index_lexical_rebuild_operation.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(operation_id)} in canonical redb table memory_maintenance_operations. Hex is lowercase UTF-8 bytes, reversible and separator-safe. Admit its schema through the actual StorageMigrationCoordinator before any write, never inferred store versions. No duplicate command journal or gist store is created. Initial accepted row and request digest commit before append. This family explicitly adopts SP-286 and CV-339 full-value v2 first-AppendReceipt custody: validate admission, append barrier-class SeglogFrameV2 through SP-026/SP-236 with full flush, durably settle original receipt, then advance operation state. New issuance uses v2; resolve_full_value.v1 verifies the exact original event; missing/legacy-only proof fences dependent state. Lost delivery resolves the original receipt and cannot mint another event.
  The operation state machine is accepted -> started -> prepared -> effect_committed -> completed; a settled pre-preparation failure may go from started directly to effect_committed. The started event's durable receipt is required before started state and before any effect. Freeze the original started id. This rebuild never mutates canonical gists. Durable preparation, exact derived selection and effect_committed outcome/ref/hash follow the target protocol below; never substitute a candidate, infer success from mtime or repeat a committed swap. Recheck source revision and permission before effect; stale source records a settled failure without changing gists. The completed event appends only from effect_committed with its frozen succeeded/failed result. Its original receipt precedes completed row and terminal disclosure. If append succeeds but row advancement crashes, recover the stored original receipt and apply the same transition by CAS against exact prior row; failure before receipt cannot authorize a transition. Pending/ambiguous effect is unavailable until original owner recovery settles it. Event replay never runs maintenance. This family records only the unique original terminal outcome; it cannot occur before the original start or be followed by another terminal result.
  Exact consumer reader.memory.index.lexical.rebuild.completed.history.v1@1.0.0 is a newly authored stateless read-only binding used by Memory maintenance history and audit lookup for this exact type. It explicitly adopts SP-278: use reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, checkpoint table checkpoints, key event_record_index_checkpoint.v1:{storage_instance_id}, closed value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, generation-qualified event_record_index.v2@{generation_id}. The generic projector atomically CAS-advances complete rows and root frontier, never this reader. No new filtered durable cursor or projection value exists. Each read joins original source bytes, exact payload and operation/result custody, complete CURRENT-selected root/generation/frontier, original row birth anchor, actual permission/deletion/hold state. Recheck every fence after helpers and immediately before disclosure. Missing or stale authority returns unavailable; timestamps and cached views cannot substitute. Uses the ten-field live read token in its actual read transaction; any durable generic token is exactly SP-278/DL-076's nine fields, with redb_snapshot_id excluded. Reader output is ephemeral and never a persisted token. Generic checkpoint retains existing RP-PROJECTION-3GEN and index RP-EVENT-INDEX-SOURCE; missing derived state quarantines/rebuilds from retained source and never restores deleted gists.
  Original operation/result, canonical gists, EventRecord and SP-286 receipts join coherent BRS-031 capture/restore boundaries; derived indexes are rebuilt, never backed up as canonical gists (DL-270). Ref resolution checks current Project access, source tombstones and holds on every read; ref/hash grants no access and body unavailability is disclosed without reconstructing content. Preserve original history and never retain deleted content inside audit metadata. Unknown retention and operation-custody deletion remain pending, not an indefinite assignment.
  Only exact version 1.0.0 has this writer/reader; unknown or incompatible editions fail closed with original bytes preserved for authorized history. No implicit alias/migration. Withdrawal first fences new command acceptance and this family's writer admission, drains or explicitly leaves unresolved existing original operations without reissuing them, then under the same maintenance/read fence disables reader.memory.index.lexical.rebuild.completed.history.v1@1.0.0 publication and invalidates live tokens. Generic index readers for other families continue. A successor must be explicitly admitted and rebuild from retained authenticated source with its own version; no withdrawn reader checkpoint can authorize effects. No event, policy, registry membership, readiness or native execution is admitted here.

  Operation rows use the phase constraints of their closed schema: accepted has no event receipt or outcome; started has only the original start receipt; effect_committed has a complete frozen outcome and no terminal receipt; completed has both receipts and the same outcome. A withdrawn pseudo-phase is invalid: withdrawal fences admission externally and preserves the last durable phase. Every mutation is a whole-value CAS against the exact prior operation row under the single maintenance writer; request, scope, source, start time and receipt identities never change. started_occurred_at_utc freezes at acceptance; completed_occurred_at_utc freezes with effect_committed. Reconstruct payload fields from these values, never the retry clock. result_ref="memresult_"+SHA-256(strict UTF-8 compact JSON ["pm.memory.maintenance.result_ref.v1",storage_instance_id,project_id,operation_id]); resolve it only through that exact tuple and its canonical operation key under current Project permission, never as a free-standing body locator. result_sha256 is SHA-256 of strict UTF-8 compact JSON ["pm.memory.maintenance.result.v1",storage_instance_id,project_id,operation_id,command_id,source_revision_sha256,status,target_id_or_null]; target_id_or_null is the prepared target id for rebuilds, null otherwise. This binds the outcome in the original operation row without an unspecified external result body. Operation and selector values explicitly adopt SP-340's canonical/derived file split and 16 KiB MessagePack value cap, with coordination_and_storage and search_and_indexes profiles respectively. UTC timestamp fields are at most 64 characters. Preparation must reserve room for the worst-case completed row (both event ids, succeeded, result ref/hash and a 64-character terminal timestamp) within that cap before selector CAS. Oversize metadata fails before publication; never truncate an inventory to fit. Completed payload status/ref/hash and frozen time must equal that row and, when present, the exact retained SP-286 full-value original. Started retries likewise equal the original full value. A hash or Boolean proof flag alone is insufficient.

  Newly authored current-writer boundary for exactly memory.index.lexical.rebuild.completed@1.0.0, after the independent round-2 search in reports/event-authority-20261104/DMEM-search.json: reuse Contracts_V0.md#EventRecord at schema_version=2.0.0; payload_schema_id=https://puppetmaster.local/Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_index_lexical_rebuild_completed; replay_policy=dedupe_by_idempotency_key. Normal append and retry reject projector_replay_only as replay_only_not_appendable before returning an original, appending or applying an effect; compatibility-reader-only policy grants no writer path. Use Storage section 2.2.5 project~{base64url_no_pad(UTF8(project_id))} for the scoped dedupe identity, with this exact event type and the existing idempotency key. Validate the canonical envelope and all payload/identity/causality joins; full-value originals remain SP-286 custody. The independent ATS-315 canonical boundary suite is separate from the reduced synthetic phase values. Recovery rechecks current Project permission and family withdrawal before any original disclosure, including completed operations; refusal returns no output and leaves durable state unchanged. Original start custody on every path, including post-completion retry and recovery, follows the start custody gate below. Lane-owned identifier schemas require exact fixed lengths or a full-input regex guard; trailing LF is invalid.

  Start custody gate for exactly memory.index.lexical.rebuild.completed@1.0.0, newly authored owner contract (DMEM fix round 4): the one rule behind every start-custody sentence in AMS-102, CV-652 and this SP-632. It adopts SP-286 and CV-339 first-AppendReceipt full-value custody and replaces none of their terms. Every path after first start admission goes through it: the completed append and its retry, the effect_committed to completed row CAS, durable target preparation, selector CAS, settlement, retry and replay of either retained original, recovery from every phase, the canonical current-writer append and retry, boundary acceptance and the history reader. Before such a path appends, CAS-publishes a row or selector, settles an effect, or returns or discloses an original, it resolves the exact original start record, the SP-286 retained full-value original of memory.index.lexical.rebuild.started@1.0.0 under this operation's memory_index_lexical_rebuild_operation.v1 key, authenticated through storage.first_append_receipt.resolve_full_value.v1, and verifies all of: identity (event_id and idempotency_key recompute from the SP-633 recipe for this storage_instance_id, project_id and operation_id); digest (the retained full-value commitment recomputes from the retained value); operation (correlation_id and payload operation, Project, source revision, command and frozen start time equal the operation row); phase (the event type is exactly memory.index.lexical.rebuild.started and the row is accepted only before the start receipt, otherwise a later lawful phase); receipt (the first AppendReceipt settled under full flush, and the row's started_event_id and this event's causation_event_id and payload started_event_id name exactly that record); and no withdrawal fence on this family or memory.index.lexical.rebuild.started@1.0.0. Missing, corrupted, mismatched or withdrawn custody refuses with start_receipt_missing, or permission_or_withdrawal for a withdrawal fence, before any append, CAS, selector change, effect or output; the operation stays at its last durable phase and is never reissued. The gate is evaluated on the prior durable state and again on the tentative result immediately before commit, after any path-specific refusal, so no path, including one added later, can append, publish or return without it. The only relaxation belongs to memory.index.lexical.rebuild.started's own first append from an accepted row with no start receipt and no later original; no path of this family has it. Terminal custody stays the separate status/result/hash check above. The history reader returns a retained original that verified when written whatever the operation's current live state (later phase, source revision, selector, counters or request), and still refuses a withdrawal fence, revoked Project access, a forged or unverifiable original or missing start custody; it changes no state. Retention stays pending: this gate selects no retention period.

  The static oracle in ATS-315 checks actual operation instances, exact expected/actual CAS rows, immutable retained synthetic full event values, and durable effect/selection counters through interrupted traces. Its crash action drops only volatile publication state. Replaying or retrying a retained event can return only that original value and changes neither the effect ledger nor a selector. Physical transaction/flush/receipt authenticity remains native NOT_RUN.

  Newly authored lexical target/selection custody for this exact family (per-family round-1 search in DMEM-search.json) uses required nullable prepared_target in index_lexical_rebuild. It is null in accepted/started; the new prepared phase requires the closed lexical_target descriptor in Plans/memory_maintenance_rebuild_target.schema.json. A successful effect requires that same descriptor thereafter; failure before preparation may retain null. Its index_kind, target_id, source_revision_sha256, manifest_sha256, artifacts and prior_selector_sha256 are closed metadata. Artifacts have unique, strictly bytewise-sorted safe relative_name values, role, sha256 and byte_length. Lexical descriptors list every Tantivy generation file; semantic descriptors contain exactly one usearch_file and one mapping_redb snapshot, including vector slots/tombstones together as DL-270 requires. No paths to canonical gists or content bodies enter the descriptor.

  manifest_sha256 hashes strict UTF-8 compact JSON of artifacts (object keys sorted); target_id="memtarget_"+SHA-256(compact UTF-8 JSON ["pm.memory.maintenance.target.v1",storage_instance_id,project_id,operation_id,"lexical",source_revision_sha256,manifest_sha256]). Each immutable generation lives at the existing lexical index root's generations/{target_id} directory, with exactly the relative_name/hash/length inventory. Flush every artifact and generation directory before CAS-persisting the exact descriptor in the operation's prepared row in assistant_memory.redb/memory_maintenance_operations at the existing operation key. That row is the mandatory-backup original pre-swap target custody; result_ref is not target custody. No selected target or descriptor may be substituted on retry.

  The newly authored memory_index_lexical_selector value uses closed lexical_selector at Plans/memory_maintenance_rebuild_target.schema.json, in assistant_memory_derived.redb table memory_index_selectors, key memory_index_lexical_selector.v1:{hex(storage_instance_id)}:{hex(project_id)}. It stores schema id/version, storage/Project/operation and the complete target descriptor; its schema is admitted by StorageMigrationCoordinator before use. This is a separate derived selector, not SP-278's generic EventRecord CURRENT root. prior_selector_sha256 in prepared_target hashes the exact prior selector's compact sorted-key JSON; null means verified absence. After durable preparation, recheck exact operation, permission and source under the maintenance lease, then atomically CAS this selector from that exact prior value to this operation's descriptor and durably flush before publishing to readers. Readers resolve only this selector's verified generation inventory, source revision and current access/deletion fences; directory presence or mtime never selects a target.

  Recovery before selector CAS may publish only the already prepared target while the exact prior selector and all fences still match. Recovery after CAS and before effect_committed requires byte-for-byte selector equality to this operation's complete descriptor and validated immutable files; it settles the same succeeded outcome without another swap. A different selector, mismatched/missing artifact, lost preparation or source/permission change fences publication as unavailable; it never overwrites an intervening target or guesses which swap happened. A settled pre-swap failure leaves the prior selector unchanged. Once effect_committed exists, recovery/retry returns the original outcome without another effect, even if later source invalidation makes the derived index unavailable. Missing derived selector/files after restore quarantine index reads and require a separately accepted rebuild from canonical gists, never reissuing the old operation or restoring deleted content. Selector/target retention remains PENDING_RETENTION_DECISION; this binding authorizes no collection, source deletion, survivor policy or new feature.

  Current producer-semantic projections and current identity inputs follow CV-1100 (current recipe cv1100-exact-integer-write-v3): every numeric leaf is an exact integer primitive, never a boolean, runtime float or fraction/exponent token, within the range its field owner schema declares; no global safe-integer ceiling applies, and raw input uses the CV-1100 current JSON integer grammar (scripts/pm_event_numbers.py loads_current_json), so 01, +1, -0, 1.0 and 1e0 are never read as integers. This producer route excludes Storage-assigned sequence_id, observed_at_utc and persisted_at_utc under Contracts_V0.md#EventRecord. Storage sequence_id independently adopts SP-236 exact uint64, 0 through 18446744073709551615 inclusive, with exact integer type; booleans, floats and strings refuse. Fresh writes and metadata-only retries preserve that full domain without a producer-number ceiling. Decimal and exponent tokens decode losslessly to exact decimal carriers before validation and are never folded into integers. Identity, idempotency, result and target commitments keep their local recipes, sorted-key compact UTF-8 JSON over unchanged preimages, and admit only exact integers: a fraction, exponent or float spelling, a nonfinite value or an integer outside the range of its field owner refuses before hashing or append instead of being normalized. A current-writer retained EventRecord carries the unchanged CV-339 full-value commitment (pm.storage.original_event_value_commitment.v1 over the complete 2.0.0 EventRecord map in SP-236 EVENT_VALUE bytes, scripts/pm_event_numbers.py full_value_commitment) with exact Storage uint64 metadata; no new serializer is introduced. Historical originals instead use their frozen write-time recipe integer-json-v1: pm.event.v0 envelope editions 1.0.0 and 2.0.0 both retain their original unbounded integral sequence domains; operation/target edition 1.0.0 uses the explicit historical_ definitions frozen from 77323e87d65908dbce2ea655ee344b6185a13ff1, including artifact byte_length up to 9223372036854775807. The two frozen envelope editions share the integer-json-v1 numeric/hash recipe, and no record field, edition included, selects a recipe. Reader dispatch follows SP-1101: each retained canonical original (the writer's returned or canonical start original, a canonical history original and its start record, a checkpoint-joined original) resolves once through the shared RetainedDispatcher, which takes the write-time recipe tuple (envelope edition, writer recipe, full-value profile and resources) from Storage's sealed custody of that exact retained record, never from the record's schema_id/schema_version, a recipe field or the caller, and the composition-installed frozen verifier of that tuple then runs its checks. An original Storage did not seal at its seglog ref, one sealed with more than one binding or recipe, a sealed binding that is not the reader's, or a recipe with no installed verifier refuses at the site's custody guard; there is no current-then-legacy probing, permissive fallback or current writer predicate. The original full-value commitment is recomputed under that recipe with no rewrite of retained values, hashes, frozen operation or receipt. Historical numeric decoding preserves the original typed integer or binary64 stored value; a current lossless decimal parse never reinterprets an older binary64 original. Original verification in current-writer retries and checkpoint reader projections uses the sealed recipe of that original (CV-339 for a current-writer original, frozen integer-json-v1 for an older one); only the new caller producer-semantic projection and new-write producer admission use the strict current recipe; new caller Storage metadata is independently checked against SP-236. Valid retained large integers remain readable in canonical, replay-only, compatibility and compatibility-replay modes after live state/admission/cutoffs change; forged commitments, rehashed foreign values, unknown editions/recipe fields, lost custody, revoked permission and withdrawal still refuse. Plans/memory_maintenance_event_record.schema.json keeps SP-236 current Storage uint64 bounds (SP-1100, checked with storage_uint64), the producer_sequence_id domain of the EventRecord owner without an added ceiling, and unchanged frozen reader definitions; operation/target schemas keep current definitions and their frozen historical_ counterparts. Generic Storage metadata ownership is unchanged. Every declared date-time format is enforced by the shared CV-1101 predicate (scripts/pm_event_datetime.py date_time) with the explicit profile of its field owner, without optional validator packages: payload and EventRecord occurred_at_utc and the SP-278 checkpoint times take the broad event_record profile (RFC 3339 with an explicit zone, lowercase t or z, offsets, year 0000, any fraction length and announced leap seconds); Storage-assigned observed_at_utc and persisted_at_utc take CV-253 storage_utc_z at the current and every retained envelope edition; the operation row's frozen started_occurred_at_utc and completed_occurred_at_utc keep their terminal-uppercase-Z owner pattern and take storage_utc_z. Bad calendar fields or separators, missing zones, an unannounced second 60 and trailing LF refuse, and a skipped old format check never authorizes invalid retained history. Existing length constraints remain. Timestamp strings retain their exact hash bytes. UUID uses the full 8-4-4-4-12 hexadecimal grammar. The selected recipe's frozen verifier applies the same profiles to retained originals; there is no narrower historical format edition.

  Permission/admission and withdrawal fields, and every Boolean boundary receipt/source/acceptance fence, require the exact Boolean type before their value is evaluated; strings, numeric 0/1, null, arrays and objects never grant authority or clear a fence. Historical reads still use current typed permission/withdrawal only, not current admission or cutoffs.
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- SP-278
- SP-286
- AMS-102
- CV-652
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### SP-633 - memory.index.lexical.rebuild.started persistence and history

```yaml
plan_unit_id: SP-633
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract under DL-045 for exactly memory.index.lexical.rebuild.started@1.0.0; search scope and negative evidence are the family's row in reports/event-authority-20261104/DMEM-search.json. The family remains absent from event_family_registry.json, quarantined before append or projection. Retention is PENDING_RETENTION_DECISION: candidate ordinary telemetry (Case L-3, 90 days/2,000,000 per Project) versus audit authority (indefinite/no count eviction); neither is selected. Unknown policy is materially incomplete and permits no destructive inference. Operation custody has the same pending assignment, and actual native activation is fenced until it resolves.
  Identity recipe for this family: use strict UTF-8 canonical JSON of the array ["pm.memory.maintenance.event.v1",storage_instance_id,project_id,operation_id,"memory.index.lexical.rebuild.started"] with no whitespace, ensure_ascii=false; SHA-256 lower hex. event_id="evt_mem_"+digest and idempotency_key="memory-maintenance:"+digest. All ids are nonempty bounded opaque owner-generated identifiers, not user content. The actual native acceptance generates operation_id once, persists it before publication and retries reuse it. request_sha256 binds the exact accepted command arguments and scope; a changed request under the same operation fails idempotency_conflict. Envelope type, payload type, project, correlation and causation must join CV-653.
  Original operation custody is the newly authored memory_index_lexical_rebuild_operation family, closed schema Plans/memory_maintenance_operation.schema.json#/$defs/index_lexical_rebuild, key memory_index_lexical_rebuild_operation.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(operation_id)} in canonical redb table memory_maintenance_operations. Hex is lowercase UTF-8 bytes, reversible and separator-safe. Admit its schema through the actual StorageMigrationCoordinator before any write, never inferred store versions. No duplicate command journal or gist store is created. Initial accepted row and request digest commit before append. This family explicitly adopts SP-286 and CV-339 full-value v2 first-AppendReceipt custody: validate admission, append barrier-class SeglogFrameV2 through SP-026/SP-236 with full flush, durably settle original receipt, then advance operation state. New issuance uses v2; resolve_full_value.v1 verifies the exact original event; missing/legacy-only proof fences dependent state. Lost delivery resolves the original receipt and cannot mint another event.
  The operation state machine is accepted -> started -> prepared -> effect_committed -> completed; a settled pre-preparation failure may go from started directly to effect_committed. The started event's durable receipt is required before started state and before any effect. Freeze the original started id. This rebuild never mutates canonical gists. Durable preparation, exact derived selection and effect_committed outcome/ref/hash follow the target protocol below; never substitute a candidate, infer success from mtime or repeat a committed swap. Recheck source revision and permission before effect; stale source records a settled failure without changing gists. The completed event appends only from effect_committed with its frozen succeeded/failed result. Its original receipt precedes completed row and terminal disclosure. If append succeeds but row advancement crashes, recover the stored original receipt and apply the same transition by CAS against exact prior row; failure before receipt cannot authorize a transition. Pending/ambiguous effect is unavailable until original owner recovery settles it. Event replay never runs maintenance. This family records only the acceptance transition; it may not be reinterpreted as completion.
  Exact consumer reader.memory.index.lexical.rebuild.started.history.v1@1.0.0 is a newly authored stateless read-only binding used by Memory maintenance history and audit lookup for this exact type. It explicitly adopts SP-278: use reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, checkpoint table checkpoints, key event_record_index_checkpoint.v1:{storage_instance_id}, closed value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, generation-qualified event_record_index.v2@{generation_id}. The generic projector atomically CAS-advances complete rows and root frontier, never this reader. No new filtered durable cursor or projection value exists. Each read joins original source bytes, exact payload and operation/result custody, complete CURRENT-selected root/generation/frontier, original row birth anchor, actual permission/deletion/hold state. Recheck every fence after helpers and immediately before disclosure. Missing or stale authority returns unavailable; timestamps and cached views cannot substitute. Uses the ten-field live read token in its actual read transaction; any durable generic token is exactly SP-278/DL-076's nine fields, with redb_snapshot_id excluded. Reader output is ephemeral and never a persisted token. Generic checkpoint retains existing RP-PROJECTION-3GEN and index RP-EVENT-INDEX-SOURCE; missing derived state quarantines/rebuilds from retained source and never restores deleted gists.
  Original operation/result, canonical gists, EventRecord and SP-286 receipts join coherent BRS-031 capture/restore boundaries; derived indexes are rebuilt, never backed up as canonical gists (DL-270). Ref resolution checks current Project access, source tombstones and holds on every read; ref/hash grants no access and body unavailability is disclosed without reconstructing content. Preserve original history and never retain deleted content inside audit metadata. Unknown retention and operation-custody deletion remain pending, not an indefinite assignment.
  Only exact version 1.0.0 has this writer/reader; unknown or incompatible editions fail closed with original bytes preserved for authorized history. No implicit alias/migration. Withdrawal first fences new command acceptance and this family's writer admission, drains or explicitly leaves unresolved existing original operations without reissuing them, then under the same maintenance/read fence disables reader.memory.index.lexical.rebuild.started.history.v1@1.0.0 publication and invalidates live tokens. Generic index readers for other families continue. A successor must be explicitly admitted and rebuild from retained authenticated source with its own version; no withdrawn reader checkpoint can authorize effects. No event, policy, registry membership, readiness or native execution is admitted here.

  Operation rows use the phase constraints of their closed schema: accepted has no event receipt or outcome; started has only the original start receipt; effect_committed has a complete frozen outcome and no terminal receipt; completed has both receipts and the same outcome. A withdrawn pseudo-phase is invalid: withdrawal fences admission externally and preserves the last durable phase. Every mutation is a whole-value CAS against the exact prior operation row under the single maintenance writer; request, scope, source, start time and receipt identities never change. started_occurred_at_utc freezes at acceptance; completed_occurred_at_utc freezes with effect_committed. Reconstruct payload fields from these values, never the retry clock. result_ref="memresult_"+SHA-256(strict UTF-8 compact JSON ["pm.memory.maintenance.result_ref.v1",storage_instance_id,project_id,operation_id]); resolve it only through that exact tuple and its canonical operation key under current Project permission, never as a free-standing body locator. result_sha256 is SHA-256 of strict UTF-8 compact JSON ["pm.memory.maintenance.result.v1",storage_instance_id,project_id,operation_id,command_id,source_revision_sha256,status,target_id_or_null]; target_id_or_null is the prepared target id for rebuilds, null otherwise. This binds the outcome in the original operation row without an unspecified external result body. Operation and selector values explicitly adopt SP-340's canonical/derived file split and 16 KiB MessagePack value cap, with coordination_and_storage and search_and_indexes profiles respectively. UTC timestamp fields are at most 64 characters. Preparation must reserve room for the worst-case completed row (both event ids, succeeded, result ref/hash and a 64-character terminal timestamp) within that cap before selector CAS. Oversize metadata fails before publication; never truncate an inventory to fit. Completed payload status/ref/hash and frozen time must equal that row and, when present, the exact retained SP-286 full-value original. Started retries likewise equal the original full value. A hash or Boolean proof flag alone is insufficient.

  Newly authored current-writer boundary for exactly memory.index.lexical.rebuild.started@1.0.0, after the independent round-2 search in reports/event-authority-20261104/DMEM-search.json: reuse Contracts_V0.md#EventRecord at schema_version=2.0.0; payload_schema_id=https://puppetmaster.local/Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_index_lexical_rebuild_started; replay_policy=dedupe_by_idempotency_key. Normal append and retry reject projector_replay_only as replay_only_not_appendable before returning an original, appending or applying an effect; compatibility-reader-only policy grants no writer path. Use Storage section 2.2.5 project~{base64url_no_pad(UTF8(project_id))} for the scoped dedupe identity, with this exact event type and the existing idempotency key. Validate the canonical envelope and all payload/identity/causality joins; full-value originals remain SP-286 custody. The independent ATS-315 canonical boundary suite is separate from the reduced synthetic phase values. Recovery rechecks current Project permission and family withdrawal before any original disclosure, including completed operations; refusal returns no output and leaves durable state unchanged. Original start custody on every path, including post-completion retry and recovery, follows the start custody gate below. Lane-owned identifier schemas require exact fixed lengths or a full-input regex guard; trailing LF is invalid.

  Start custody gate for exactly memory.index.lexical.rebuild.started@1.0.0, newly authored owner contract (DMEM fix round 4): the one rule behind every start-custody sentence in AMS-103, CV-653 and this SP-633. It adopts SP-286 and CV-339 first-AppendReceipt full-value custody and replaces none of their terms. Every path after first start admission goes through it: retry of this family's first append, the accepted to started row CAS, durable target preparation, selector CAS, settlement, the terminal append and row CAS of memory.index.lexical.rebuild.completed, retry and replay of this original before and after completion, recovery from every phase, the canonical current-writer retry at every phase, boundary acceptance and the history reader. Before such a path appends, CAS-publishes a row or selector, settles an effect, or returns or discloses an original, it resolves the exact original start record, this family's own SP-286 retained full-value original under this operation's memory_index_lexical_rebuild_operation.v1 key; this event is the start record of its operation, authenticated through storage.first_append_receipt.resolve_full_value.v1, and verifies all of: identity (event_id and idempotency_key recompute from this unit's recipe for this storage_instance_id, project_id and operation_id); digest (the retained full-value commitment recomputes from the retained value); operation (correlation_id and payload operation, Project, source revision, command and frozen start time equal the operation row); phase (the event type is exactly memory.index.lexical.rebuild.started and the row is accepted only before the start receipt, otherwise a later lawful phase); receipt (the first AppendReceipt settled under full flush, and the row's started_event_id and any retained memory.index.lexical.rebuild.completed original's causation_event_id and payload started_event_id name exactly that record); and no withdrawal fence on this family or memory.index.lexical.rebuild.completed@1.0.0. Missing, corrupted, mismatched or withdrawn custody refuses with start_receipt_missing, or permission_or_withdrawal for a withdrawal fence, before any append, CAS, selector change, effect or output; the operation stays at its last durable phase and is never reissued. The gate is evaluated on the prior durable state and again on the tentative result immediately before commit, after any path-specific refusal, so no path, including one added later, can append, publish or return without it. The only relaxation is this family's first append from an accepted row with no start receipt and no later original: the record may then be absent, but one that is present is still verified, and the append must leave a verified record. Terminal custody stays the separate status/result/hash check above. The history reader returns a retained original that verified when written whatever the operation's current live state (later phase, source revision, selector, counters or request), and still refuses a withdrawal fence, revoked Project access, a forged or unverifiable original or missing start custody; it changes no state. Retention stays pending: this gate selects no retention period.

  The static oracle in ATS-315 checks actual operation instances, exact expected/actual CAS rows, immutable retained synthetic full event values, and durable effect/selection counters through interrupted traces. Its crash action drops only volatile publication state. Replaying or retrying a retained event can return only that original value and changes neither the effect ledger nor a selector. Physical transaction/flush/receipt authenticity remains native NOT_RUN.

  Newly authored lexical target/selection custody for this exact family (per-family round-1 search in DMEM-search.json) uses required nullable prepared_target in index_lexical_rebuild. It is null in accepted/started; the new prepared phase requires the closed lexical_target descriptor in Plans/memory_maintenance_rebuild_target.schema.json. A successful effect requires that same descriptor thereafter; failure before preparation may retain null. Its index_kind, target_id, source_revision_sha256, manifest_sha256, artifacts and prior_selector_sha256 are closed metadata. Artifacts have unique, strictly bytewise-sorted safe relative_name values, role, sha256 and byte_length. Lexical descriptors list every Tantivy generation file; semantic descriptors contain exactly one usearch_file and one mapping_redb snapshot, including vector slots/tombstones together as DL-270 requires. No paths to canonical gists or content bodies enter the descriptor.

  manifest_sha256 hashes strict UTF-8 compact JSON of artifacts (object keys sorted); target_id="memtarget_"+SHA-256(compact UTF-8 JSON ["pm.memory.maintenance.target.v1",storage_instance_id,project_id,operation_id,"lexical",source_revision_sha256,manifest_sha256]). Each immutable generation lives at the existing lexical index root's generations/{target_id} directory, with exactly the relative_name/hash/length inventory. Flush every artifact and generation directory before CAS-persisting the exact descriptor in the operation's prepared row in assistant_memory.redb/memory_maintenance_operations at the existing operation key. That row is the mandatory-backup original pre-swap target custody; result_ref is not target custody. No selected target or descriptor may be substituted on retry.

  The newly authored memory_index_lexical_selector value uses closed lexical_selector at Plans/memory_maintenance_rebuild_target.schema.json, in assistant_memory_derived.redb table memory_index_selectors, key memory_index_lexical_selector.v1:{hex(storage_instance_id)}:{hex(project_id)}. It stores schema id/version, storage/Project/operation and the complete target descriptor; its schema is admitted by StorageMigrationCoordinator before use. This is a separate derived selector, not SP-278's generic EventRecord CURRENT root. prior_selector_sha256 in prepared_target hashes the exact prior selector's compact sorted-key JSON; null means verified absence. After durable preparation, recheck exact operation, permission and source under the maintenance lease, then atomically CAS this selector from that exact prior value to this operation's descriptor and durably flush before publishing to readers. Readers resolve only this selector's verified generation inventory, source revision and current access/deletion fences; directory presence or mtime never selects a target.

  Recovery before selector CAS may publish only the already prepared target while the exact prior selector and all fences still match. Recovery after CAS and before effect_committed requires byte-for-byte selector equality to this operation's complete descriptor and validated immutable files; it settles the same succeeded outcome without another swap. A different selector, mismatched/missing artifact, lost preparation or source/permission change fences publication as unavailable; it never overwrites an intervening target or guesses which swap happened. A settled pre-swap failure leaves the prior selector unchanged. Once effect_committed exists, recovery/retry returns the original outcome without another effect, even if later source invalidation makes the derived index unavailable. Missing derived selector/files after restore quarantine index reads and require a separately accepted rebuild from canonical gists, never reissuing the old operation or restoring deleted content. Selector/target retention remains PENDING_RETENTION_DECISION; this binding authorizes no collection, source deletion, survivor policy or new feature.

  Current producer-semantic projections and current identity inputs follow CV-1100 (current recipe cv1100-exact-integer-write-v3): every numeric leaf is an exact integer primitive, never a boolean, runtime float or fraction/exponent token, within the range its field owner schema declares; no global safe-integer ceiling applies, and raw input uses the CV-1100 current JSON integer grammar (scripts/pm_event_numbers.py loads_current_json), so 01, +1, -0, 1.0 and 1e0 are never read as integers. This producer route excludes Storage-assigned sequence_id, observed_at_utc and persisted_at_utc under Contracts_V0.md#EventRecord. Storage sequence_id independently adopts SP-236 exact uint64, 0 through 18446744073709551615 inclusive, with exact integer type; booleans, floats and strings refuse. Fresh writes and metadata-only retries preserve that full domain without a producer-number ceiling. Decimal and exponent tokens decode losslessly to exact decimal carriers before validation and are never folded into integers. Identity, idempotency, result and target commitments keep their local recipes, sorted-key compact UTF-8 JSON over unchanged preimages, and admit only exact integers: a fraction, exponent or float spelling, a nonfinite value or an integer outside the range of its field owner refuses before hashing or append instead of being normalized. A current-writer retained EventRecord carries the unchanged CV-339 full-value commitment (pm.storage.original_event_value_commitment.v1 over the complete 2.0.0 EventRecord map in SP-236 EVENT_VALUE bytes, scripts/pm_event_numbers.py full_value_commitment) with exact Storage uint64 metadata; no new serializer is introduced. Historical originals instead use their frozen write-time recipe integer-json-v1: pm.event.v0 envelope editions 1.0.0 and 2.0.0 both retain their original unbounded integral sequence domains; operation/target edition 1.0.0 uses the explicit historical_ definitions frozen from 77323e87d65908dbce2ea655ee344b6185a13ff1, including artifact byte_length up to 9223372036854775807. The two frozen envelope editions share the integer-json-v1 numeric/hash recipe, and no record field, edition included, selects a recipe. Reader dispatch follows SP-1101: each retained canonical original (the writer's returned or canonical start original, a canonical history original and its start record, a checkpoint-joined original) resolves once through the shared RetainedDispatcher, which takes the write-time recipe tuple (envelope edition, writer recipe, full-value profile and resources) from Storage's sealed custody of that exact retained record, never from the record's schema_id/schema_version, a recipe field or the caller, and the composition-installed frozen verifier of that tuple then runs its checks. An original Storage did not seal at its seglog ref, one sealed with more than one binding or recipe, a sealed binding that is not the reader's, or a recipe with no installed verifier refuses at the site's custody guard; there is no current-then-legacy probing, permissive fallback or current writer predicate. The original full-value commitment is recomputed under that recipe with no rewrite of retained values, hashes, frozen operation or receipt. Historical numeric decoding preserves the original typed integer or binary64 stored value; a current lossless decimal parse never reinterprets an older binary64 original. Original verification in current-writer retries and checkpoint reader projections uses the sealed recipe of that original (CV-339 for a current-writer original, frozen integer-json-v1 for an older one); only the new caller producer-semantic projection and new-write producer admission use the strict current recipe; new caller Storage metadata is independently checked against SP-236. Valid retained large integers remain readable in canonical, replay-only, compatibility and compatibility-replay modes after live state/admission/cutoffs change; forged commitments, rehashed foreign values, unknown editions/recipe fields, lost custody, revoked permission and withdrawal still refuse. Plans/memory_maintenance_event_record.schema.json keeps SP-236 current Storage uint64 bounds (SP-1100, checked with storage_uint64), the producer_sequence_id domain of the EventRecord owner without an added ceiling, and unchanged frozen reader definitions; operation/target schemas keep current definitions and their frozen historical_ counterparts. Generic Storage metadata ownership is unchanged. Every declared date-time format is enforced by the shared CV-1101 predicate (scripts/pm_event_datetime.py date_time) with the explicit profile of its field owner, without optional validator packages: payload and EventRecord occurred_at_utc and the SP-278 checkpoint times take the broad event_record profile (RFC 3339 with an explicit zone, lowercase t or z, offsets, year 0000, any fraction length and announced leap seconds); Storage-assigned observed_at_utc and persisted_at_utc take CV-253 storage_utc_z at the current and every retained envelope edition; the operation row's frozen started_occurred_at_utc and completed_occurred_at_utc keep their terminal-uppercase-Z owner pattern and take storage_utc_z. Bad calendar fields or separators, missing zones, an unannounced second 60 and trailing LF refuse, and a skipped old format check never authorizes invalid retained history. Existing length constraints remain. Timestamp strings retain their exact hash bytes. UUID uses the full 8-4-4-4-12 hexadecimal grammar. The selected recipe's frozen verifier applies the same profiles to retained originals; there is no narrower historical format edition.

  Permission/admission and withdrawal fields, and every Boolean boundary receipt/source/acceptance fence, require the exact Boolean type before their value is evaluated; strings, numeric 0/1, null, arrays and objects never grant authority or clear a fence. Historical reads still use current typed permission/withdrawal only, not current admission or cutoffs.
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- SP-278
- SP-286
- AMS-103
- CV-653
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### SP-634 - memory.index.semantic.rebuild.completed persistence and history

```yaml
plan_unit_id: SP-634
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract under DL-045 for exactly memory.index.semantic.rebuild.completed@1.0.0; search scope and negative evidence are the family's row in reports/event-authority-20261104/DMEM-search.json. The family remains absent from event_family_registry.json, quarantined before append or projection. Retention is PENDING_RETENTION_DECISION: candidate ordinary telemetry (Case L-3, 90 days/2,000,000 per Project) versus audit authority (indefinite/no count eviction); neither is selected. Unknown policy is materially incomplete and permits no destructive inference. Operation custody has the same pending assignment, and actual native activation is fenced until it resolves.
  Identity recipe for this family: use strict UTF-8 canonical JSON of the array ["pm.memory.maintenance.event.v1",storage_instance_id,project_id,operation_id,"memory.index.semantic.rebuild.completed"] with no whitespace, ensure_ascii=false; SHA-256 lower hex. event_id="evt_mem_"+digest and idempotency_key="memory-maintenance:"+digest. All ids are nonempty bounded opaque owner-generated identifiers, not user content. The actual native acceptance generates operation_id once, persists it before publication and retries reuse it. request_sha256 binds the exact accepted command arguments and scope; a changed request under the same operation fails idempotency_conflict. Envelope type, payload type, project, correlation and causation must join CV-654.
  Original operation custody is the newly authored memory_index_semantic_rebuild_operation family, closed schema Plans/memory_maintenance_operation.schema.json#/$defs/index_semantic_rebuild, key memory_index_semantic_rebuild_operation.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(operation_id)} in canonical redb table memory_maintenance_operations. Hex is lowercase UTF-8 bytes, reversible and separator-safe. Admit its schema through the actual StorageMigrationCoordinator before any write, never inferred store versions. No duplicate command journal or gist store is created. Initial accepted row and request digest commit before append. This family explicitly adopts SP-286 and CV-339 full-value v2 first-AppendReceipt custody: validate admission, append barrier-class SeglogFrameV2 through SP-026/SP-236 with full flush, durably settle original receipt, then advance operation state. New issuance uses v2; resolve_full_value.v1 verifies the exact original event; missing/legacy-only proof fences dependent state. Lost delivery resolves the original receipt and cannot mint another event.
  The operation state machine is accepted -> started -> prepared -> effect_committed -> completed; a settled pre-preparation failure may go from started directly to effect_committed. The started event's durable receipt is required before started state and before any effect. Freeze the original started id. This rebuild never mutates canonical gists. Durable preparation, exact derived selection and effect_committed outcome/ref/hash follow the target protocol below; never substitute a candidate, infer success from mtime or repeat a committed swap. Recheck source revision and permission before effect; stale source records a settled failure without changing gists. The completed event appends only from effect_committed with its frozen succeeded/failed result. Its original receipt precedes completed row and terminal disclosure. If append succeeds but row advancement crashes, recover the stored original receipt and apply the same transition by CAS against exact prior row; failure before receipt cannot authorize a transition. Pending/ambiguous effect is unavailable until original owner recovery settles it. Event replay never runs maintenance. This family records only the unique original terminal outcome; it cannot occur before the original start or be followed by another terminal result.
  Exact consumer reader.memory.index.semantic.rebuild.completed.history.v1@1.0.0 is a newly authored stateless read-only binding used by Memory maintenance history and audit lookup for this exact type. It explicitly adopts SP-278: use reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, checkpoint table checkpoints, key event_record_index_checkpoint.v1:{storage_instance_id}, closed value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, generation-qualified event_record_index.v2@{generation_id}. The generic projector atomically CAS-advances complete rows and root frontier, never this reader. No new filtered durable cursor or projection value exists. Each read joins original source bytes, exact payload and operation/result custody, complete CURRENT-selected root/generation/frontier, original row birth anchor, actual permission/deletion/hold state. Recheck every fence after helpers and immediately before disclosure. Missing or stale authority returns unavailable; timestamps and cached views cannot substitute. Uses the ten-field live read token in its actual read transaction; any durable generic token is exactly SP-278/DL-076's nine fields, with redb_snapshot_id excluded. Reader output is ephemeral and never a persisted token. Generic checkpoint retains existing RP-PROJECTION-3GEN and index RP-EVENT-INDEX-SOURCE; missing derived state quarantines/rebuilds from retained source and never restores deleted gists.
  Original operation/result, canonical gists, EventRecord and SP-286 receipts join coherent BRS-031 capture/restore boundaries; derived indexes are rebuilt, never backed up as canonical gists (DL-270). Ref resolution checks current Project access, source tombstones and holds on every read; ref/hash grants no access and body unavailability is disclosed without reconstructing content. Preserve original history and never retain deleted content inside audit metadata. Unknown retention and operation-custody deletion remain pending, not an indefinite assignment.
  Only exact version 1.0.0 has this writer/reader; unknown or incompatible editions fail closed with original bytes preserved for authorized history. No implicit alias/migration. Withdrawal first fences new command acceptance and this family's writer admission, drains or explicitly leaves unresolved existing original operations without reissuing them, then under the same maintenance/read fence disables reader.memory.index.semantic.rebuild.completed.history.v1@1.0.0 publication and invalidates live tokens. Generic index readers for other families continue. A successor must be explicitly admitted and rebuild from retained authenticated source with its own version; no withdrawn reader checkpoint can authorize effects. No event, policy, registry membership, readiness or native execution is admitted here.

  Operation rows use the phase constraints of their closed schema: accepted has no event receipt or outcome; started has only the original start receipt; effect_committed has a complete frozen outcome and no terminal receipt; completed has both receipts and the same outcome. A withdrawn pseudo-phase is invalid: withdrawal fences admission externally and preserves the last durable phase. Every mutation is a whole-value CAS against the exact prior operation row under the single maintenance writer; request, scope, source, start time and receipt identities never change. started_occurred_at_utc freezes at acceptance; completed_occurred_at_utc freezes with effect_committed. Reconstruct payload fields from these values, never the retry clock. result_ref="memresult_"+SHA-256(strict UTF-8 compact JSON ["pm.memory.maintenance.result_ref.v1",storage_instance_id,project_id,operation_id]); resolve it only through that exact tuple and its canonical operation key under current Project permission, never as a free-standing body locator. result_sha256 is SHA-256 of strict UTF-8 compact JSON ["pm.memory.maintenance.result.v1",storage_instance_id,project_id,operation_id,command_id,source_revision_sha256,status,target_id_or_null]; target_id_or_null is the prepared target id for rebuilds, null otherwise. This binds the outcome in the original operation row without an unspecified external result body. Operation and selector values explicitly adopt SP-340's canonical/derived file split and 16 KiB MessagePack value cap, with coordination_and_storage and search_and_indexes profiles respectively. UTC timestamp fields are at most 64 characters. Preparation must reserve room for the worst-case completed row (both event ids, succeeded, result ref/hash and a 64-character terminal timestamp) within that cap before selector CAS. Oversize metadata fails before publication; never truncate an inventory to fit. Completed payload status/ref/hash and frozen time must equal that row and, when present, the exact retained SP-286 full-value original. Started retries likewise equal the original full value. A hash or Boolean proof flag alone is insufficient.

  Newly authored current-writer boundary for exactly memory.index.semantic.rebuild.completed@1.0.0, after the independent round-2 search in reports/event-authority-20261104/DMEM-search.json: reuse Contracts_V0.md#EventRecord at schema_version=2.0.0; payload_schema_id=https://puppetmaster.local/Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_index_semantic_rebuild_completed; replay_policy=dedupe_by_idempotency_key. Normal append and retry reject projector_replay_only as replay_only_not_appendable before returning an original, appending or applying an effect; compatibility-reader-only policy grants no writer path. Use Storage section 2.2.5 project~{base64url_no_pad(UTF8(project_id))} for the scoped dedupe identity, with this exact event type and the existing idempotency key. Validate the canonical envelope and all payload/identity/causality joins; full-value originals remain SP-286 custody. The independent ATS-315 canonical boundary suite is separate from the reduced synthetic phase values. Recovery rechecks current Project permission and family withdrawal before any original disclosure, including completed operations; refusal returns no output and leaves durable state unchanged. Original start custody on every path, including post-completion retry and recovery, follows the start custody gate below. Lane-owned identifier schemas require exact fixed lengths or a full-input regex guard; trailing LF is invalid.

  Start custody gate for exactly memory.index.semantic.rebuild.completed@1.0.0, newly authored owner contract (DMEM fix round 4): the one rule behind every start-custody sentence in AMS-104, CV-654 and this SP-634. It adopts SP-286 and CV-339 first-AppendReceipt full-value custody and replaces none of their terms. Every path after first start admission goes through it: the completed append and its retry, the effect_committed to completed row CAS, durable target preparation, selector CAS, settlement, retry and replay of either retained original, recovery from every phase, the canonical current-writer append and retry, boundary acceptance and the history reader. Before such a path appends, CAS-publishes a row or selector, settles an effect, or returns or discloses an original, it resolves the exact original start record, the SP-286 retained full-value original of memory.index.semantic.rebuild.started@1.0.0 under this operation's memory_index_semantic_rebuild_operation.v1 key, authenticated through storage.first_append_receipt.resolve_full_value.v1, and verifies all of: identity (event_id and idempotency_key recompute from the SP-635 recipe for this storage_instance_id, project_id and operation_id); digest (the retained full-value commitment recomputes from the retained value); operation (correlation_id and payload operation, Project, source revision, command and frozen start time equal the operation row); phase (the event type is exactly memory.index.semantic.rebuild.started and the row is accepted only before the start receipt, otherwise a later lawful phase); receipt (the first AppendReceipt settled under full flush, and the row's started_event_id and this event's causation_event_id and payload started_event_id name exactly that record); and no withdrawal fence on this family or memory.index.semantic.rebuild.started@1.0.0. Missing, corrupted, mismatched or withdrawn custody refuses with start_receipt_missing, or permission_or_withdrawal for a withdrawal fence, before any append, CAS, selector change, effect or output; the operation stays at its last durable phase and is never reissued. The gate is evaluated on the prior durable state and again on the tentative result immediately before commit, after any path-specific refusal, so no path, including one added later, can append, publish or return without it. The only relaxation belongs to memory.index.semantic.rebuild.started's own first append from an accepted row with no start receipt and no later original; no path of this family has it. Terminal custody stays the separate status/result/hash check above. The history reader returns a retained original that verified when written whatever the operation's current live state (later phase, source revision, selector, counters or request), and still refuses a withdrawal fence, revoked Project access, a forged or unverifiable original or missing start custody; it changes no state. Retention stays pending: this gate selects no retention period.

  The static oracle in ATS-315 checks actual operation instances, exact expected/actual CAS rows, immutable retained synthetic full event values, and durable effect/selection counters through interrupted traces. Its crash action drops only volatile publication state. Replaying or retrying a retained event can return only that original value and changes neither the effect ledger nor a selector. Physical transaction/flush/receipt authenticity remains native NOT_RUN.

  Newly authored semantic target/selection custody for this exact family (per-family round-1 search in DMEM-search.json) uses required nullable prepared_target in index_semantic_rebuild. It is null in accepted/started; the new prepared phase requires the closed semantic_target descriptor in Plans/memory_maintenance_rebuild_target.schema.json. A successful effect requires that same descriptor thereafter; failure before preparation may retain null. Its index_kind, target_id, source_revision_sha256, manifest_sha256, artifacts and prior_selector_sha256 are closed metadata. Artifacts have unique, strictly bytewise-sorted safe relative_name values, role, sha256 and byte_length. Lexical descriptors list every Tantivy generation file; semantic descriptors contain exactly one usearch_file and one mapping_redb snapshot, including vector slots/tombstones together as DL-270 requires. No paths to canonical gists or content bodies enter the descriptor.

  manifest_sha256 hashes strict UTF-8 compact JSON of artifacts (object keys sorted); target_id="memtarget_"+SHA-256(compact UTF-8 JSON ["pm.memory.maintenance.target.v1",storage_instance_id,project_id,operation_id,"semantic",source_revision_sha256,manifest_sha256]). Each immutable generation lives at the existing semantic index root's generations/{target_id} directory, with exactly the relative_name/hash/length inventory. Flush every artifact and generation directory before CAS-persisting the exact descriptor in the operation's prepared row in assistant_memory.redb/memory_maintenance_operations at the existing operation key. That row is the mandatory-backup original pre-swap target custody; result_ref is not target custody. No selected target or descriptor may be substituted on retry.

  The newly authored memory_index_semantic_selector value uses closed semantic_selector at Plans/memory_maintenance_rebuild_target.schema.json, in assistant_memory_derived.redb table memory_index_selectors, key memory_index_semantic_selector.v1:{hex(storage_instance_id)}:{hex(project_id)}. It stores schema id/version, storage/Project/operation and the complete target descriptor; its schema is admitted by StorageMigrationCoordinator before use. This is a separate derived selector, not SP-278's generic EventRecord CURRENT root. prior_selector_sha256 in prepared_target hashes the exact prior selector's compact sorted-key JSON; null means verified absence. After durable preparation, recheck exact operation, permission and source under the maintenance lease, then atomically CAS this selector from that exact prior value to this operation's descriptor and durably flush before publishing to readers. Readers resolve only this selector's verified generation inventory, source revision and current access/deletion fences; directory presence or mtime never selects a target.

  Recovery before selector CAS may publish only the already prepared target while the exact prior selector and all fences still match. Recovery after CAS and before effect_committed requires byte-for-byte selector equality to this operation's complete descriptor and validated immutable files; it settles the same succeeded outcome without another swap. A different selector, mismatched/missing artifact, lost preparation or source/permission change fences publication as unavailable; it never overwrites an intervening target or guesses which swap happened. A settled pre-swap failure leaves the prior selector unchanged. Once effect_committed exists, recovery/retry returns the original outcome without another effect, even if later source invalidation makes the derived index unavailable. Missing derived selector/files after restore quarantine index reads and require a separately accepted rebuild from canonical gists, never reissuing the old operation or restoring deleted content. Selector/target retention remains PENDING_RETENTION_DECISION; this binding authorizes no collection, source deletion, survivor policy or new feature.

  Current producer-semantic projections and current identity inputs follow CV-1100 (current recipe cv1100-exact-integer-write-v3): every numeric leaf is an exact integer primitive, never a boolean, runtime float or fraction/exponent token, within the range its field owner schema declares; no global safe-integer ceiling applies, and raw input uses the CV-1100 current JSON integer grammar (scripts/pm_event_numbers.py loads_current_json), so 01, +1, -0, 1.0 and 1e0 are never read as integers. This producer route excludes Storage-assigned sequence_id, observed_at_utc and persisted_at_utc under Contracts_V0.md#EventRecord. Storage sequence_id independently adopts SP-236 exact uint64, 0 through 18446744073709551615 inclusive, with exact integer type; booleans, floats and strings refuse. Fresh writes and metadata-only retries preserve that full domain without a producer-number ceiling. Decimal and exponent tokens decode losslessly to exact decimal carriers before validation and are never folded into integers. Identity, idempotency, result and target commitments keep their local recipes, sorted-key compact UTF-8 JSON over unchanged preimages, and admit only exact integers: a fraction, exponent or float spelling, a nonfinite value or an integer outside the range of its field owner refuses before hashing or append instead of being normalized. A current-writer retained EventRecord carries the unchanged CV-339 full-value commitment (pm.storage.original_event_value_commitment.v1 over the complete 2.0.0 EventRecord map in SP-236 EVENT_VALUE bytes, scripts/pm_event_numbers.py full_value_commitment) with exact Storage uint64 metadata; no new serializer is introduced. Historical originals instead use their frozen write-time recipe integer-json-v1: pm.event.v0 envelope editions 1.0.0 and 2.0.0 both retain their original unbounded integral sequence domains; operation/target edition 1.0.0 uses the explicit historical_ definitions frozen from 77323e87d65908dbce2ea655ee344b6185a13ff1, including artifact byte_length up to 9223372036854775807. The two frozen envelope editions share the integer-json-v1 numeric/hash recipe, and no record field, edition included, selects a recipe. Reader dispatch follows SP-1101: each retained canonical original (the writer's returned or canonical start original, a canonical history original and its start record, a checkpoint-joined original) resolves once through the shared RetainedDispatcher, which takes the write-time recipe tuple (envelope edition, writer recipe, full-value profile and resources) from Storage's sealed custody of that exact retained record, never from the record's schema_id/schema_version, a recipe field or the caller, and the composition-installed frozen verifier of that tuple then runs its checks. An original Storage did not seal at its seglog ref, one sealed with more than one binding or recipe, a sealed binding that is not the reader's, or a recipe with no installed verifier refuses at the site's custody guard; there is no current-then-legacy probing, permissive fallback or current writer predicate. The original full-value commitment is recomputed under that recipe with no rewrite of retained values, hashes, frozen operation or receipt. Historical numeric decoding preserves the original typed integer or binary64 stored value; a current lossless decimal parse never reinterprets an older binary64 original. Original verification in current-writer retries and checkpoint reader projections uses the sealed recipe of that original (CV-339 for a current-writer original, frozen integer-json-v1 for an older one); only the new caller producer-semantic projection and new-write producer admission use the strict current recipe; new caller Storage metadata is independently checked against SP-236. Valid retained large integers remain readable in canonical, replay-only, compatibility and compatibility-replay modes after live state/admission/cutoffs change; forged commitments, rehashed foreign values, unknown editions/recipe fields, lost custody, revoked permission and withdrawal still refuse. Plans/memory_maintenance_event_record.schema.json keeps SP-236 current Storage uint64 bounds (SP-1100, checked with storage_uint64), the producer_sequence_id domain of the EventRecord owner without an added ceiling, and unchanged frozen reader definitions; operation/target schemas keep current definitions and their frozen historical_ counterparts. Generic Storage metadata ownership is unchanged. Every declared date-time format is enforced by the shared CV-1101 predicate (scripts/pm_event_datetime.py date_time) with the explicit profile of its field owner, without optional validator packages: payload and EventRecord occurred_at_utc and the SP-278 checkpoint times take the broad event_record profile (RFC 3339 with an explicit zone, lowercase t or z, offsets, year 0000, any fraction length and announced leap seconds); Storage-assigned observed_at_utc and persisted_at_utc take CV-253 storage_utc_z at the current and every retained envelope edition; the operation row's frozen started_occurred_at_utc and completed_occurred_at_utc keep their terminal-uppercase-Z owner pattern and take storage_utc_z. Bad calendar fields or separators, missing zones, an unannounced second 60 and trailing LF refuse, and a skipped old format check never authorizes invalid retained history. Existing length constraints remain. Timestamp strings retain their exact hash bytes. UUID uses the full 8-4-4-4-12 hexadecimal grammar. The selected recipe's frozen verifier applies the same profiles to retained originals; there is no narrower historical format edition.

  Permission/admission and withdrawal fields, and every Boolean boundary receipt/source/acceptance fence, require the exact Boolean type before their value is evaluated; strings, numeric 0/1, null, arrays and objects never grant authority or clear a fence. Historical reads still use current typed permission/withdrawal only, not current admission or cutoffs.
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- SP-278
- SP-286
- AMS-104
- CV-654
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### SP-635 - memory.index.semantic.rebuild.started persistence and history

```yaml
plan_unit_id: SP-635
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract under DL-045 for exactly memory.index.semantic.rebuild.started@1.0.0; search scope and negative evidence are the family's row in reports/event-authority-20261104/DMEM-search.json. The family remains absent from event_family_registry.json, quarantined before append or projection. Retention is PENDING_RETENTION_DECISION: candidate ordinary telemetry (Case L-3, 90 days/2,000,000 per Project) versus audit authority (indefinite/no count eviction); neither is selected. Unknown policy is materially incomplete and permits no destructive inference. Operation custody has the same pending assignment, and actual native activation is fenced until it resolves.
  Identity recipe for this family: use strict UTF-8 canonical JSON of the array ["pm.memory.maintenance.event.v1",storage_instance_id,project_id,operation_id,"memory.index.semantic.rebuild.started"] with no whitespace, ensure_ascii=false; SHA-256 lower hex. event_id="evt_mem_"+digest and idempotency_key="memory-maintenance:"+digest. All ids are nonempty bounded opaque owner-generated identifiers, not user content. The actual native acceptance generates operation_id once, persists it before publication and retries reuse it. request_sha256 binds the exact accepted command arguments and scope; a changed request under the same operation fails idempotency_conflict. Envelope type, payload type, project, correlation and causation must join CV-655.
  Original operation custody is the newly authored memory_index_semantic_rebuild_operation family, closed schema Plans/memory_maintenance_operation.schema.json#/$defs/index_semantic_rebuild, key memory_index_semantic_rebuild_operation.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(operation_id)} in canonical redb table memory_maintenance_operations. Hex is lowercase UTF-8 bytes, reversible and separator-safe. Admit its schema through the actual StorageMigrationCoordinator before any write, never inferred store versions. No duplicate command journal or gist store is created. Initial accepted row and request digest commit before append. This family explicitly adopts SP-286 and CV-339 full-value v2 first-AppendReceipt custody: validate admission, append barrier-class SeglogFrameV2 through SP-026/SP-236 with full flush, durably settle original receipt, then advance operation state. New issuance uses v2; resolve_full_value.v1 verifies the exact original event; missing/legacy-only proof fences dependent state. Lost delivery resolves the original receipt and cannot mint another event.
  The operation state machine is accepted -> started -> prepared -> effect_committed -> completed; a settled pre-preparation failure may go from started directly to effect_committed. The started event's durable receipt is required before started state and before any effect. Freeze the original started id. This rebuild never mutates canonical gists. Durable preparation, exact derived selection and effect_committed outcome/ref/hash follow the target protocol below; never substitute a candidate, infer success from mtime or repeat a committed swap. Recheck source revision and permission before effect; stale source records a settled failure without changing gists. The completed event appends only from effect_committed with its frozen succeeded/failed result. Its original receipt precedes completed row and terminal disclosure. If append succeeds but row advancement crashes, recover the stored original receipt and apply the same transition by CAS against exact prior row; failure before receipt cannot authorize a transition. Pending/ambiguous effect is unavailable until original owner recovery settles it. Event replay never runs maintenance. This family records only the acceptance transition; it may not be reinterpreted as completion.
  Exact consumer reader.memory.index.semantic.rebuild.started.history.v1@1.0.0 is a newly authored stateless read-only binding used by Memory maintenance history and audit lookup for this exact type. It explicitly adopts SP-278: use reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, checkpoint table checkpoints, key event_record_index_checkpoint.v1:{storage_instance_id}, closed value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, generation-qualified event_record_index.v2@{generation_id}. The generic projector atomically CAS-advances complete rows and root frontier, never this reader. No new filtered durable cursor or projection value exists. Each read joins original source bytes, exact payload and operation/result custody, complete CURRENT-selected root/generation/frontier, original row birth anchor, actual permission/deletion/hold state. Recheck every fence after helpers and immediately before disclosure. Missing or stale authority returns unavailable; timestamps and cached views cannot substitute. Uses the ten-field live read token in its actual read transaction; any durable generic token is exactly SP-278/DL-076's nine fields, with redb_snapshot_id excluded. Reader output is ephemeral and never a persisted token. Generic checkpoint retains existing RP-PROJECTION-3GEN and index RP-EVENT-INDEX-SOURCE; missing derived state quarantines/rebuilds from retained source and never restores deleted gists.
  Original operation/result, canonical gists, EventRecord and SP-286 receipts join coherent BRS-031 capture/restore boundaries; derived indexes are rebuilt, never backed up as canonical gists (DL-270). Ref resolution checks current Project access, source tombstones and holds on every read; ref/hash grants no access and body unavailability is disclosed without reconstructing content. Preserve original history and never retain deleted content inside audit metadata. Unknown retention and operation-custody deletion remain pending, not an indefinite assignment.
  Only exact version 1.0.0 has this writer/reader; unknown or incompatible editions fail closed with original bytes preserved for authorized history. No implicit alias/migration. Withdrawal first fences new command acceptance and this family's writer admission, drains or explicitly leaves unresolved existing original operations without reissuing them, then under the same maintenance/read fence disables reader.memory.index.semantic.rebuild.started.history.v1@1.0.0 publication and invalidates live tokens. Generic index readers for other families continue. A successor must be explicitly admitted and rebuild from retained authenticated source with its own version; no withdrawn reader checkpoint can authorize effects. No event, policy, registry membership, readiness or native execution is admitted here.

  Operation rows use the phase constraints of their closed schema: accepted has no event receipt or outcome; started has only the original start receipt; effect_committed has a complete frozen outcome and no terminal receipt; completed has both receipts and the same outcome. A withdrawn pseudo-phase is invalid: withdrawal fences admission externally and preserves the last durable phase. Every mutation is a whole-value CAS against the exact prior operation row under the single maintenance writer; request, scope, source, start time and receipt identities never change. started_occurred_at_utc freezes at acceptance; completed_occurred_at_utc freezes with effect_committed. Reconstruct payload fields from these values, never the retry clock. result_ref="memresult_"+SHA-256(strict UTF-8 compact JSON ["pm.memory.maintenance.result_ref.v1",storage_instance_id,project_id,operation_id]); resolve it only through that exact tuple and its canonical operation key under current Project permission, never as a free-standing body locator. result_sha256 is SHA-256 of strict UTF-8 compact JSON ["pm.memory.maintenance.result.v1",storage_instance_id,project_id,operation_id,command_id,source_revision_sha256,status,target_id_or_null]; target_id_or_null is the prepared target id for rebuilds, null otherwise. This binds the outcome in the original operation row without an unspecified external result body. Operation and selector values explicitly adopt SP-340's canonical/derived file split and 16 KiB MessagePack value cap, with coordination_and_storage and search_and_indexes profiles respectively. UTC timestamp fields are at most 64 characters. Preparation must reserve room for the worst-case completed row (both event ids, succeeded, result ref/hash and a 64-character terminal timestamp) within that cap before selector CAS. Oversize metadata fails before publication; never truncate an inventory to fit. Completed payload status/ref/hash and frozen time must equal that row and, when present, the exact retained SP-286 full-value original. Started retries likewise equal the original full value. A hash or Boolean proof flag alone is insufficient.

  Newly authored current-writer boundary for exactly memory.index.semantic.rebuild.started@1.0.0, after the independent round-2 search in reports/event-authority-20261104/DMEM-search.json: reuse Contracts_V0.md#EventRecord at schema_version=2.0.0; payload_schema_id=https://puppetmaster.local/Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_index_semantic_rebuild_started; replay_policy=dedupe_by_idempotency_key. Normal append and retry reject projector_replay_only as replay_only_not_appendable before returning an original, appending or applying an effect; compatibility-reader-only policy grants no writer path. Use Storage section 2.2.5 project~{base64url_no_pad(UTF8(project_id))} for the scoped dedupe identity, with this exact event type and the existing idempotency key. Validate the canonical envelope and all payload/identity/causality joins; full-value originals remain SP-286 custody. The independent ATS-315 canonical boundary suite is separate from the reduced synthetic phase values. Recovery rechecks current Project permission and family withdrawal before any original disclosure, including completed operations; refusal returns no output and leaves durable state unchanged. Original start custody on every path, including post-completion retry and recovery, follows the start custody gate below. Lane-owned identifier schemas require exact fixed lengths or a full-input regex guard; trailing LF is invalid.

  Start custody gate for exactly memory.index.semantic.rebuild.started@1.0.0, newly authored owner contract (DMEM fix round 4): the one rule behind every start-custody sentence in AMS-105, CV-655 and this SP-635. It adopts SP-286 and CV-339 first-AppendReceipt full-value custody and replaces none of their terms. Every path after first start admission goes through it: retry of this family's first append, the accepted to started row CAS, durable target preparation, selector CAS, settlement, the terminal append and row CAS of memory.index.semantic.rebuild.completed, retry and replay of this original before and after completion, recovery from every phase, the canonical current-writer retry at every phase, boundary acceptance and the history reader. Before such a path appends, CAS-publishes a row or selector, settles an effect, or returns or discloses an original, it resolves the exact original start record, this family's own SP-286 retained full-value original under this operation's memory_index_semantic_rebuild_operation.v1 key; this event is the start record of its operation, authenticated through storage.first_append_receipt.resolve_full_value.v1, and verifies all of: identity (event_id and idempotency_key recompute from this unit's recipe for this storage_instance_id, project_id and operation_id); digest (the retained full-value commitment recomputes from the retained value); operation (correlation_id and payload operation, Project, source revision, command and frozen start time equal the operation row); phase (the event type is exactly memory.index.semantic.rebuild.started and the row is accepted only before the start receipt, otherwise a later lawful phase); receipt (the first AppendReceipt settled under full flush, and the row's started_event_id and any retained memory.index.semantic.rebuild.completed original's causation_event_id and payload started_event_id name exactly that record); and no withdrawal fence on this family or memory.index.semantic.rebuild.completed@1.0.0. Missing, corrupted, mismatched or withdrawn custody refuses with start_receipt_missing, or permission_or_withdrawal for a withdrawal fence, before any append, CAS, selector change, effect or output; the operation stays at its last durable phase and is never reissued. The gate is evaluated on the prior durable state and again on the tentative result immediately before commit, after any path-specific refusal, so no path, including one added later, can append, publish or return without it. The only relaxation is this family's first append from an accepted row with no start receipt and no later original: the record may then be absent, but one that is present is still verified, and the append must leave a verified record. Terminal custody stays the separate status/result/hash check above. The history reader returns a retained original that verified when written whatever the operation's current live state (later phase, source revision, selector, counters or request), and still refuses a withdrawal fence, revoked Project access, a forged or unverifiable original or missing start custody; it changes no state. Retention stays pending: this gate selects no retention period.

  The static oracle in ATS-315 checks actual operation instances, exact expected/actual CAS rows, immutable retained synthetic full event values, and durable effect/selection counters through interrupted traces. Its crash action drops only volatile publication state. Replaying or retrying a retained event can return only that original value and changes neither the effect ledger nor a selector. Physical transaction/flush/receipt authenticity remains native NOT_RUN.

  Newly authored semantic target/selection custody for this exact family (per-family round-1 search in DMEM-search.json) uses required nullable prepared_target in index_semantic_rebuild. It is null in accepted/started; the new prepared phase requires the closed semantic_target descriptor in Plans/memory_maintenance_rebuild_target.schema.json. A successful effect requires that same descriptor thereafter; failure before preparation may retain null. Its index_kind, target_id, source_revision_sha256, manifest_sha256, artifacts and prior_selector_sha256 are closed metadata. Artifacts have unique, strictly bytewise-sorted safe relative_name values, role, sha256 and byte_length. Lexical descriptors list every Tantivy generation file; semantic descriptors contain exactly one usearch_file and one mapping_redb snapshot, including vector slots/tombstones together as DL-270 requires. No paths to canonical gists or content bodies enter the descriptor.

  manifest_sha256 hashes strict UTF-8 compact JSON of artifacts (object keys sorted); target_id="memtarget_"+SHA-256(compact UTF-8 JSON ["pm.memory.maintenance.target.v1",storage_instance_id,project_id,operation_id,"semantic",source_revision_sha256,manifest_sha256]). Each immutable generation lives at the existing semantic index root's generations/{target_id} directory, with exactly the relative_name/hash/length inventory. Flush every artifact and generation directory before CAS-persisting the exact descriptor in the operation's prepared row in assistant_memory.redb/memory_maintenance_operations at the existing operation key. That row is the mandatory-backup original pre-swap target custody; result_ref is not target custody. No selected target or descriptor may be substituted on retry.

  The newly authored memory_index_semantic_selector value uses closed semantic_selector at Plans/memory_maintenance_rebuild_target.schema.json, in assistant_memory_derived.redb table memory_index_selectors, key memory_index_semantic_selector.v1:{hex(storage_instance_id)}:{hex(project_id)}. It stores schema id/version, storage/Project/operation and the complete target descriptor; its schema is admitted by StorageMigrationCoordinator before use. This is a separate derived selector, not SP-278's generic EventRecord CURRENT root. prior_selector_sha256 in prepared_target hashes the exact prior selector's compact sorted-key JSON; null means verified absence. After durable preparation, recheck exact operation, permission and source under the maintenance lease, then atomically CAS this selector from that exact prior value to this operation's descriptor and durably flush before publishing to readers. Readers resolve only this selector's verified generation inventory, source revision and current access/deletion fences; directory presence or mtime never selects a target.

  Recovery before selector CAS may publish only the already prepared target while the exact prior selector and all fences still match. Recovery after CAS and before effect_committed requires byte-for-byte selector equality to this operation's complete descriptor and validated immutable files; it settles the same succeeded outcome without another swap. A different selector, mismatched/missing artifact, lost preparation or source/permission change fences publication as unavailable; it never overwrites an intervening target or guesses which swap happened. A settled pre-swap failure leaves the prior selector unchanged. Once effect_committed exists, recovery/retry returns the original outcome without another effect, even if later source invalidation makes the derived index unavailable. Missing derived selector/files after restore quarantine index reads and require a separately accepted rebuild from canonical gists, never reissuing the old operation or restoring deleted content. Selector/target retention remains PENDING_RETENTION_DECISION; this binding authorizes no collection, source deletion, survivor policy or new feature.

  Current producer-semantic projections and current identity inputs follow CV-1100 (current recipe cv1100-exact-integer-write-v3): every numeric leaf is an exact integer primitive, never a boolean, runtime float or fraction/exponent token, within the range its field owner schema declares; no global safe-integer ceiling applies, and raw input uses the CV-1100 current JSON integer grammar (scripts/pm_event_numbers.py loads_current_json), so 01, +1, -0, 1.0 and 1e0 are never read as integers. This producer route excludes Storage-assigned sequence_id, observed_at_utc and persisted_at_utc under Contracts_V0.md#EventRecord. Storage sequence_id independently adopts SP-236 exact uint64, 0 through 18446744073709551615 inclusive, with exact integer type; booleans, floats and strings refuse. Fresh writes and metadata-only retries preserve that full domain without a producer-number ceiling. Decimal and exponent tokens decode losslessly to exact decimal carriers before validation and are never folded into integers. Identity, idempotency, result and target commitments keep their local recipes, sorted-key compact UTF-8 JSON over unchanged preimages, and admit only exact integers: a fraction, exponent or float spelling, a nonfinite value or an integer outside the range of its field owner refuses before hashing or append instead of being normalized. A current-writer retained EventRecord carries the unchanged CV-339 full-value commitment (pm.storage.original_event_value_commitment.v1 over the complete 2.0.0 EventRecord map in SP-236 EVENT_VALUE bytes, scripts/pm_event_numbers.py full_value_commitment) with exact Storage uint64 metadata; no new serializer is introduced. Historical originals instead use their frozen write-time recipe integer-json-v1: pm.event.v0 envelope editions 1.0.0 and 2.0.0 both retain their original unbounded integral sequence domains; operation/target edition 1.0.0 uses the explicit historical_ definitions frozen from 77323e87d65908dbce2ea655ee344b6185a13ff1, including artifact byte_length up to 9223372036854775807. The two frozen envelope editions share the integer-json-v1 numeric/hash recipe, and no record field, edition included, selects a recipe. Reader dispatch follows SP-1101: each retained canonical original (the writer's returned or canonical start original, a canonical history original and its start record, a checkpoint-joined original) resolves once through the shared RetainedDispatcher, which takes the write-time recipe tuple (envelope edition, writer recipe, full-value profile and resources) from Storage's sealed custody of that exact retained record, never from the record's schema_id/schema_version, a recipe field or the caller, and the composition-installed frozen verifier of that tuple then runs its checks. An original Storage did not seal at its seglog ref, one sealed with more than one binding or recipe, a sealed binding that is not the reader's, or a recipe with no installed verifier refuses at the site's custody guard; there is no current-then-legacy probing, permissive fallback or current writer predicate. The original full-value commitment is recomputed under that recipe with no rewrite of retained values, hashes, frozen operation or receipt. Historical numeric decoding preserves the original typed integer or binary64 stored value; a current lossless decimal parse never reinterprets an older binary64 original. Original verification in current-writer retries and checkpoint reader projections uses the sealed recipe of that original (CV-339 for a current-writer original, frozen integer-json-v1 for an older one); only the new caller producer-semantic projection and new-write producer admission use the strict current recipe; new caller Storage metadata is independently checked against SP-236. Valid retained large integers remain readable in canonical, replay-only, compatibility and compatibility-replay modes after live state/admission/cutoffs change; forged commitments, rehashed foreign values, unknown editions/recipe fields, lost custody, revoked permission and withdrawal still refuse. Plans/memory_maintenance_event_record.schema.json keeps SP-236 current Storage uint64 bounds (SP-1100, checked with storage_uint64), the producer_sequence_id domain of the EventRecord owner without an added ceiling, and unchanged frozen reader definitions; operation/target schemas keep current definitions and their frozen historical_ counterparts. Generic Storage metadata ownership is unchanged. Every declared date-time format is enforced by the shared CV-1101 predicate (scripts/pm_event_datetime.py date_time) with the explicit profile of its field owner, without optional validator packages: payload and EventRecord occurred_at_utc and the SP-278 checkpoint times take the broad event_record profile (RFC 3339 with an explicit zone, lowercase t or z, offsets, year 0000, any fraction length and announced leap seconds); Storage-assigned observed_at_utc and persisted_at_utc take CV-253 storage_utc_z at the current and every retained envelope edition; the operation row's frozen started_occurred_at_utc and completed_occurred_at_utc keep their terminal-uppercase-Z owner pattern and take storage_utc_z. Bad calendar fields or separators, missing zones, an unannounced second 60 and trailing LF refuse, and a skipped old format check never authorizes invalid retained history. Existing length constraints remain. Timestamp strings retain their exact hash bytes. UUID uses the full 8-4-4-4-12 hexadecimal grammar. The selected recipe's frozen verifier applies the same profiles to retained originals; there is no narrower historical format edition.

  Permission/admission and withdrawal fields, and every Boolean boundary receipt/source/acceptance fence, require the exact Boolean type before their value is evaluated; strings, numeric 0/1, null, arrays and objects never grant authority or clear a fence. Historical reads still use current typed permission/withdrawal only, not current admission or cutoffs.
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- SP-278
- SP-286
- AMS-105
- CV-655
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### SP-636 - memory.verification_sweep.completed persistence and history

```yaml
plan_unit_id: SP-636
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract under DL-045 for exactly memory.verification_sweep.completed@1.0.0; search scope and negative evidence are the family's row in reports/event-authority-20261104/DMEM-search.json. The family remains absent from event_family_registry.json, quarantined before append or projection. Retention is PENDING_RETENTION_DECISION: candidate ordinary telemetry (Case L-3, 90 days/2,000,000 per Project) versus audit authority (indefinite/no count eviction); neither is selected. Unknown policy is materially incomplete and permits no destructive inference. Operation custody has the same pending assignment, and actual native activation is fenced until it resolves.
  Identity recipe for this family: use strict UTF-8 canonical JSON of the array ["pm.memory.maintenance.event.v1",storage_instance_id,project_id,operation_id,"memory.verification_sweep.completed"] with no whitespace, ensure_ascii=false; SHA-256 lower hex. event_id="evt_mem_"+digest and idempotency_key="memory-maintenance:"+digest. All ids are nonempty bounded opaque owner-generated identifiers, not user content. The actual native acceptance generates operation_id once, persists it before publication and retries reuse it. request_sha256 binds the exact accepted command arguments and scope; a changed request under the same operation fails idempotency_conflict. Envelope type, payload type, project, correlation and causation must join CV-656.
  Original operation custody is the newly authored memory_verification_sweep_operation family, closed schema Plans/memory_maintenance_operation.schema.json#/$defs/verification_sweep, key memory_verification_sweep_operation.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(operation_id)} in canonical redb table memory_maintenance_operations. Hex is lowercase UTF-8 bytes, reversible and separator-safe. Admit its schema through the actual StorageMigrationCoordinator before any write, never inferred store versions. No duplicate command journal or gist store is created. Initial accepted row and request digest commit before append. This family explicitly adopts SP-286 and CV-339 full-value v2 first-AppendReceipt custody: validate admission, append barrier-class SeglogFrameV2 through SP-026/SP-236 with full flush, durably settle original receipt, then advance operation state. New issuance uses v2; resolve_full_value.v1 verifies the exact original event; missing/legacy-only proof fences dependent state. Lost delivery resolves the original receipt and cannot mint another event.
  The operation state machine is accepted -> started -> effect_committed -> completed. The started event's durable receipt is required before started state and before any effect. Freeze the original started id. Canonical gist mutation and effect_committed outcome/ref/hash commit atomically in assistant_memory.redb under its single writer; partially applied sweeps resume only from recorded owner progress or roll back the transaction, never rerun committed merges or verification. Derived index rebuilds prepare a source-revision-bound shadow and durably record its exact target identity before swap; on recovery inspect that exact selected target and settle the same outcome under the maintenance lease, never republish a different target or infer success from mtime. Recheck source revision and permission before effect; stale source records a settled failure without changing gists. The completed event appends only from effect_committed with its frozen succeeded/failed result. Its original receipt precedes completed row and terminal disclosure. If append succeeds but row advancement crashes, recover the stored original receipt and apply the same transition by CAS against exact prior row; failure before receipt cannot authorize a transition. Pending/ambiguous effect is unavailable until original owner recovery settles it. Event replay never runs maintenance. This family records only the unique original terminal outcome; it cannot occur before the original start or be followed by another terminal result.
  Exact consumer reader.memory.verification_sweep.completed.history.v1@1.0.0 is a newly authored stateless read-only binding used by Memory maintenance history and audit lookup for this exact type. It explicitly adopts SP-278: use reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, checkpoint table checkpoints, key event_record_index_checkpoint.v1:{storage_instance_id}, closed value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, generation-qualified event_record_index.v2@{generation_id}. The generic projector atomically CAS-advances complete rows and root frontier, never this reader. No new filtered durable cursor or projection value exists. Each read joins original source bytes, exact payload and operation/result custody, complete CURRENT-selected root/generation/frontier, original row birth anchor, actual permission/deletion/hold state. Recheck every fence after helpers and immediately before disclosure. Missing or stale authority returns unavailable; timestamps and cached views cannot substitute. Uses the ten-field live read token in its actual read transaction; any durable generic token is exactly SP-278/DL-076's nine fields, with redb_snapshot_id excluded. Reader output is ephemeral and never a persisted token. Generic checkpoint retains existing RP-PROJECTION-3GEN and index RP-EVENT-INDEX-SOURCE; missing derived state quarantines/rebuilds from retained source and never restores deleted gists.
  Original operation/result, canonical gists, EventRecord and SP-286 receipts join coherent BRS-031 capture/restore boundaries; derived indexes are rebuilt, never backed up as canonical gists (DL-270). Ref resolution checks current Project access, source tombstones and holds on every read; ref/hash grants no access and body unavailability is disclosed without reconstructing content. Preserve original history and never retain deleted content inside audit metadata. Unknown retention and operation-custody deletion remain pending, not an indefinite assignment.
  Only exact version 1.0.0 has this writer/reader; unknown or incompatible editions fail closed with original bytes preserved for authorized history. No implicit alias/migration. Withdrawal first fences new command acceptance and this family's writer admission, drains or explicitly leaves unresolved existing original operations without reissuing them, then under the same maintenance/read fence disables reader.memory.verification_sweep.completed.history.v1@1.0.0 publication and invalidates live tokens. Generic index readers for other families continue. A successor must be explicitly admitted and rebuild from retained authenticated source with its own version; no withdrawn reader checkpoint can authorize effects. No event, policy, registry membership, readiness or native execution is admitted here.

  Operation rows use the phase constraints of their closed schema: accepted has no event receipt or outcome; started has only the original start receipt; effect_committed has a complete frozen outcome and no terminal receipt; completed has both receipts and the same outcome. A withdrawn pseudo-phase is invalid: withdrawal fences admission externally and preserves the last durable phase. Every mutation is a whole-value CAS against the exact prior operation row under the single maintenance writer; request, scope, source, start time and receipt identities never change. started_occurred_at_utc freezes at acceptance; completed_occurred_at_utc freezes with effect_committed. Reconstruct payload fields from these values, never the retry clock. result_ref="memresult_"+SHA-256(strict UTF-8 compact JSON ["pm.memory.maintenance.result_ref.v1",storage_instance_id,project_id,operation_id]); resolve it only through that exact tuple and its canonical operation key under current Project permission, never as a free-standing body locator. result_sha256 is SHA-256 of strict UTF-8 compact JSON ["pm.memory.maintenance.result.v1",storage_instance_id,project_id,operation_id,command_id,source_revision_sha256,status,target_id_or_null]; target_id_or_null is the prepared target id for rebuilds, null otherwise. This binds the outcome in the original operation row without an unspecified external result body. Operation and selector values explicitly adopt SP-340's canonical/derived file split and 16 KiB MessagePack value cap, with coordination_and_storage and search_and_indexes profiles respectively. UTC timestamp fields are at most 64 characters. Preparation must reserve room for the worst-case completed row (both event ids, succeeded, result ref/hash and a 64-character terminal timestamp) within that cap before selector CAS. Oversize metadata fails before publication; never truncate an inventory to fit. Completed payload status/ref/hash and frozen time must equal that row and, when present, the exact retained SP-286 full-value original. Started retries likewise equal the original full value. A hash or Boolean proof flag alone is insufficient.

  Newly authored current-writer boundary for exactly memory.verification_sweep.completed@1.0.0, after the independent round-2 search in reports/event-authority-20261104/DMEM-search.json: reuse Contracts_V0.md#EventRecord at schema_version=2.0.0; payload_schema_id=https://puppetmaster.local/Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_verification_sweep_completed; replay_policy=dedupe_by_idempotency_key. Normal append and retry reject projector_replay_only as replay_only_not_appendable before returning an original, appending or applying an effect; compatibility-reader-only policy grants no writer path. Use Storage section 2.2.5 project~{base64url_no_pad(UTF8(project_id))} for the scoped dedupe identity, with this exact event type and the existing idempotency key. Validate the canonical envelope and all payload/identity/causality joins; full-value originals remain SP-286 custody. The independent ATS-315 canonical boundary suite is separate from the reduced synthetic phase values. Recovery rechecks current Project permission and family withdrawal before any original disclosure, including completed operations; refusal returns no output and leaves durable state unchanged. Original start custody on every path, including post-completion retry and recovery, follows the start custody gate below. Lane-owned identifier schemas require exact fixed lengths or a full-input regex guard; trailing LF is invalid.

  Start custody gate for exactly memory.verification_sweep.completed@1.0.0, newly authored owner contract (DMEM fix round 4): the one rule behind every start-custody sentence in AMS-106, CV-656 and this SP-636. It adopts SP-286 and CV-339 first-AppendReceipt full-value custody and replaces none of their terms. Every path after first start admission goes through it: the completed append and its retry, the effect_committed to completed row CAS, the effect and its settlement, retry and replay of either retained original, recovery from every phase, the canonical current-writer append and retry, boundary acceptance and the history reader. Before such a path appends, CAS-publishes a row or selector, settles an effect, or returns or discloses an original, it resolves the exact original start record, the SP-286 retained full-value original of memory.verification_sweep.started@1.0.0 under this operation's memory_verification_sweep_operation.v1 key, authenticated through storage.first_append_receipt.resolve_full_value.v1, and verifies all of: identity (event_id and idempotency_key recompute from the SP-637 recipe for this storage_instance_id, project_id and operation_id); digest (the retained full-value commitment recomputes from the retained value); operation (correlation_id and payload operation, Project, source revision, command and frozen start time equal the operation row); phase (the event type is exactly memory.verification_sweep.started and the row is accepted only before the start receipt, otherwise a later lawful phase); receipt (the first AppendReceipt settled under full flush, and the row's started_event_id and this event's causation_event_id and payload started_event_id name exactly that record); and no withdrawal fence on this family or memory.verification_sweep.started@1.0.0. Missing, corrupted, mismatched or withdrawn custody refuses with start_receipt_missing, or permission_or_withdrawal for a withdrawal fence, before any append, CAS, selector change, effect or output; the operation stays at its last durable phase and is never reissued. The gate is evaluated on the prior durable state and again on the tentative result immediately before commit, after any path-specific refusal, so no path, including one added later, can append, publish or return without it. The only relaxation belongs to memory.verification_sweep.started's own first append from an accepted row with no start receipt and no later original; no path of this family has it. Terminal custody stays the separate status/result/hash check above. The history reader returns a retained original that verified when written whatever the operation's current live state (later phase, source revision, selector, counters or request), and still refuses a withdrawal fence, revoked Project access, a forged or unverifiable original or missing start custody; it changes no state. Retention stays pending: this gate selects no retention period.

  The static oracle in ATS-315 checks actual operation instances, exact expected/actual CAS rows, immutable retained synthetic full event values, and durable effect/selection counters through interrupted traces. Its crash action drops only volatile publication state. Replaying or retrying a retained event can return only that original value and changes neither the effect ledger nor a selector. Physical transaction/flush/receipt authenticity remains native NOT_RUN.

  Current producer-semantic projections and current identity inputs follow CV-1100 (current recipe cv1100-exact-integer-write-v3): every numeric leaf is an exact integer primitive, never a boolean, runtime float or fraction/exponent token, within the range its field owner schema declares; no global safe-integer ceiling applies, and raw input uses the CV-1100 current JSON integer grammar (scripts/pm_event_numbers.py loads_current_json), so 01, +1, -0, 1.0 and 1e0 are never read as integers. This producer route excludes Storage-assigned sequence_id, observed_at_utc and persisted_at_utc under Contracts_V0.md#EventRecord. Storage sequence_id independently adopts SP-236 exact uint64, 0 through 18446744073709551615 inclusive, with exact integer type; booleans, floats and strings refuse. Fresh writes and metadata-only retries preserve that full domain without a producer-number ceiling. Decimal and exponent tokens decode losslessly to exact decimal carriers before validation and are never folded into integers. Identity, idempotency, result and target commitments keep their local recipes, sorted-key compact UTF-8 JSON over unchanged preimages, and admit only exact integers: a fraction, exponent or float spelling, a nonfinite value or an integer outside the range of its field owner refuses before hashing or append instead of being normalized. A current-writer retained EventRecord carries the unchanged CV-339 full-value commitment (pm.storage.original_event_value_commitment.v1 over the complete 2.0.0 EventRecord map in SP-236 EVENT_VALUE bytes, scripts/pm_event_numbers.py full_value_commitment) with exact Storage uint64 metadata; no new serializer is introduced. Historical originals instead use their frozen write-time recipe integer-json-v1: pm.event.v0 envelope editions 1.0.0 and 2.0.0 both retain their original unbounded integral sequence domains; operation/target edition 1.0.0 uses the explicit historical_ definitions frozen from 77323e87d65908dbce2ea655ee344b6185a13ff1, including artifact byte_length up to 9223372036854775807. The two frozen envelope editions share the integer-json-v1 numeric/hash recipe, and no record field, edition included, selects a recipe. Reader dispatch follows SP-1101: each retained canonical original (the writer's returned or canonical start original, a canonical history original and its start record, a checkpoint-joined original) resolves once through the shared RetainedDispatcher, which takes the write-time recipe tuple (envelope edition, writer recipe, full-value profile and resources) from Storage's sealed custody of that exact retained record, never from the record's schema_id/schema_version, a recipe field or the caller, and the composition-installed frozen verifier of that tuple then runs its checks. An original Storage did not seal at its seglog ref, one sealed with more than one binding or recipe, a sealed binding that is not the reader's, or a recipe with no installed verifier refuses at the site's custody guard; there is no current-then-legacy probing, permissive fallback or current writer predicate. The original full-value commitment is recomputed under that recipe with no rewrite of retained values, hashes, frozen operation or receipt. Historical numeric decoding preserves the original typed integer or binary64 stored value; a current lossless decimal parse never reinterprets an older binary64 original. Original verification in current-writer retries and checkpoint reader projections uses the sealed recipe of that original (CV-339 for a current-writer original, frozen integer-json-v1 for an older one); only the new caller producer-semantic projection and new-write producer admission use the strict current recipe; new caller Storage metadata is independently checked against SP-236. Valid retained large integers remain readable in canonical, replay-only, compatibility and compatibility-replay modes after live state/admission/cutoffs change; forged commitments, rehashed foreign values, unknown editions/recipe fields, lost custody, revoked permission and withdrawal still refuse. Plans/memory_maintenance_event_record.schema.json keeps SP-236 current Storage uint64 bounds (SP-1100, checked with storage_uint64), the producer_sequence_id domain of the EventRecord owner without an added ceiling, and unchanged frozen reader definitions; operation/target schemas keep current definitions and their frozen historical_ counterparts. Generic Storage metadata ownership is unchanged. Every declared date-time format is enforced by the shared CV-1101 predicate (scripts/pm_event_datetime.py date_time) with the explicit profile of its field owner, without optional validator packages: payload and EventRecord occurred_at_utc and the SP-278 checkpoint times take the broad event_record profile (RFC 3339 with an explicit zone, lowercase t or z, offsets, year 0000, any fraction length and announced leap seconds); Storage-assigned observed_at_utc and persisted_at_utc take CV-253 storage_utc_z at the current and every retained envelope edition; the operation row's frozen started_occurred_at_utc and completed_occurred_at_utc keep their terminal-uppercase-Z owner pattern and take storage_utc_z. Bad calendar fields or separators, missing zones, an unannounced second 60 and trailing LF refuse, and a skipped old format check never authorizes invalid retained history. Existing length constraints remain. Timestamp strings retain their exact hash bytes. UUID uses the full 8-4-4-4-12 hexadecimal grammar. The selected recipe's frozen verifier applies the same profiles to retained originals; there is no narrower historical format edition.

  Permission/admission and withdrawal fields, and every Boolean boundary receipt/source/acceptance fence, require the exact Boolean type before their value is evaluated; strings, numeric 0/1, null, arrays and objects never grant authority or clear a fence. Historical reads still use current typed permission/withdrawal only, not current admission or cutoffs.
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- SP-278
- SP-286
- AMS-106
- CV-656
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### SP-637 - memory.verification_sweep.started persistence and history

```yaml
plan_unit_id: SP-637
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  Newly authored owner contract under DL-045 for exactly memory.verification_sweep.started@1.0.0; search scope and negative evidence are the family's row in reports/event-authority-20261104/DMEM-search.json. The family remains absent from event_family_registry.json, quarantined before append or projection. Retention is PENDING_RETENTION_DECISION: candidate ordinary telemetry (Case L-3, 90 days/2,000,000 per Project) versus audit authority (indefinite/no count eviction); neither is selected. Unknown policy is materially incomplete and permits no destructive inference. Operation custody has the same pending assignment, and actual native activation is fenced until it resolves.
  Identity recipe for this family: use strict UTF-8 canonical JSON of the array ["pm.memory.maintenance.event.v1",storage_instance_id,project_id,operation_id,"memory.verification_sweep.started"] with no whitespace, ensure_ascii=false; SHA-256 lower hex. event_id="evt_mem_"+digest and idempotency_key="memory-maintenance:"+digest. All ids are nonempty bounded opaque owner-generated identifiers, not user content. The actual native acceptance generates operation_id once, persists it before publication and retries reuse it. request_sha256 binds the exact accepted command arguments and scope; a changed request under the same operation fails idempotency_conflict. Envelope type, payload type, project, correlation and causation must join CV-657.
  Original operation custody is the newly authored memory_verification_sweep_operation family, closed schema Plans/memory_maintenance_operation.schema.json#/$defs/verification_sweep, key memory_verification_sweep_operation.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(operation_id)} in canonical redb table memory_maintenance_operations. Hex is lowercase UTF-8 bytes, reversible and separator-safe. Admit its schema through the actual StorageMigrationCoordinator before any write, never inferred store versions. No duplicate command journal or gist store is created. Initial accepted row and request digest commit before append. This family explicitly adopts SP-286 and CV-339 full-value v2 first-AppendReceipt custody: validate admission, append barrier-class SeglogFrameV2 through SP-026/SP-236 with full flush, durably settle original receipt, then advance operation state. New issuance uses v2; resolve_full_value.v1 verifies the exact original event; missing/legacy-only proof fences dependent state. Lost delivery resolves the original receipt and cannot mint another event.
  The operation state machine is accepted -> started -> effect_committed -> completed. The started event's durable receipt is required before started state and before any effect. Freeze the original started id. Canonical gist mutation and effect_committed outcome/ref/hash commit atomically in assistant_memory.redb under its single writer; partially applied sweeps resume only from recorded owner progress or roll back the transaction, never rerun committed merges or verification. Derived index rebuilds prepare a source-revision-bound shadow and durably record its exact target identity before swap; on recovery inspect that exact selected target and settle the same outcome under the maintenance lease, never republish a different target or infer success from mtime. Recheck source revision and permission before effect; stale source records a settled failure without changing gists. The completed event appends only from effect_committed with its frozen succeeded/failed result. Its original receipt precedes completed row and terminal disclosure. If append succeeds but row advancement crashes, recover the stored original receipt and apply the same transition by CAS against exact prior row; failure before receipt cannot authorize a transition. Pending/ambiguous effect is unavailable until original owner recovery settles it. Event replay never runs maintenance. This family records only the acceptance transition; it may not be reinterpreted as completion.
  Exact consumer reader.memory.verification_sweep.started.history.v1@1.0.0 is a newly authored stateless read-only binding used by Memory maintenance history and audit lookup for this exact type. It explicitly adopts SP-278: use reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, checkpoint table checkpoints, key event_record_index_checkpoint.v1:{storage_instance_id}, closed value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, generation-qualified event_record_index.v2@{generation_id}. The generic projector atomically CAS-advances complete rows and root frontier, never this reader. No new filtered durable cursor or projection value exists. Each read joins original source bytes, exact payload and operation/result custody, complete CURRENT-selected root/generation/frontier, original row birth anchor, actual permission/deletion/hold state. Recheck every fence after helpers and immediately before disclosure. Missing or stale authority returns unavailable; timestamps and cached views cannot substitute. Uses the ten-field live read token in its actual read transaction; any durable generic token is exactly SP-278/DL-076's nine fields, with redb_snapshot_id excluded. Reader output is ephemeral and never a persisted token. Generic checkpoint retains existing RP-PROJECTION-3GEN and index RP-EVENT-INDEX-SOURCE; missing derived state quarantines/rebuilds from retained source and never restores deleted gists.
  Original operation/result, canonical gists, EventRecord and SP-286 receipts join coherent BRS-031 capture/restore boundaries; derived indexes are rebuilt, never backed up as canonical gists (DL-270). Ref resolution checks current Project access, source tombstones and holds on every read; ref/hash grants no access and body unavailability is disclosed without reconstructing content. Preserve original history and never retain deleted content inside audit metadata. Unknown retention and operation-custody deletion remain pending, not an indefinite assignment.
  Only exact version 1.0.0 has this writer/reader; unknown or incompatible editions fail closed with original bytes preserved for authorized history. No implicit alias/migration. Withdrawal first fences new command acceptance and this family's writer admission, drains or explicitly leaves unresolved existing original operations without reissuing them, then under the same maintenance/read fence disables reader.memory.verification_sweep.started.history.v1@1.0.0 publication and invalidates live tokens. Generic index readers for other families continue. A successor must be explicitly admitted and rebuild from retained authenticated source with its own version; no withdrawn reader checkpoint can authorize effects. No event, policy, registry membership, readiness or native execution is admitted here.

  Operation rows use the phase constraints of their closed schema: accepted has no event receipt or outcome; started has only the original start receipt; effect_committed has a complete frozen outcome and no terminal receipt; completed has both receipts and the same outcome. A withdrawn pseudo-phase is invalid: withdrawal fences admission externally and preserves the last durable phase. Every mutation is a whole-value CAS against the exact prior operation row under the single maintenance writer; request, scope, source, start time and receipt identities never change. started_occurred_at_utc freezes at acceptance; completed_occurred_at_utc freezes with effect_committed. Reconstruct payload fields from these values, never the retry clock. result_ref="memresult_"+SHA-256(strict UTF-8 compact JSON ["pm.memory.maintenance.result_ref.v1",storage_instance_id,project_id,operation_id]); resolve it only through that exact tuple and its canonical operation key under current Project permission, never as a free-standing body locator. result_sha256 is SHA-256 of strict UTF-8 compact JSON ["pm.memory.maintenance.result.v1",storage_instance_id,project_id,operation_id,command_id,source_revision_sha256,status,target_id_or_null]; target_id_or_null is the prepared target id for rebuilds, null otherwise. This binds the outcome in the original operation row without an unspecified external result body. Operation and selector values explicitly adopt SP-340's canonical/derived file split and 16 KiB MessagePack value cap, with coordination_and_storage and search_and_indexes profiles respectively. UTC timestamp fields are at most 64 characters. Preparation must reserve room for the worst-case completed row (both event ids, succeeded, result ref/hash and a 64-character terminal timestamp) within that cap before selector CAS. Oversize metadata fails before publication; never truncate an inventory to fit. Completed payload status/ref/hash and frozen time must equal that row and, when present, the exact retained SP-286 full-value original. Started retries likewise equal the original full value. A hash or Boolean proof flag alone is insufficient.

  Newly authored current-writer boundary for exactly memory.verification_sweep.started@1.0.0, after the independent round-2 search in reports/event-authority-20261104/DMEM-search.json: reuse Contracts_V0.md#EventRecord at schema_version=2.0.0; payload_schema_id=https://puppetmaster.local/Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_verification_sweep_started; replay_policy=dedupe_by_idempotency_key. Normal append and retry reject projector_replay_only as replay_only_not_appendable before returning an original, appending or applying an effect; compatibility-reader-only policy grants no writer path. Use Storage section 2.2.5 project~{base64url_no_pad(UTF8(project_id))} for the scoped dedupe identity, with this exact event type and the existing idempotency key. Validate the canonical envelope and all payload/identity/causality joins; full-value originals remain SP-286 custody. The independent ATS-315 canonical boundary suite is separate from the reduced synthetic phase values. Recovery rechecks current Project permission and family withdrawal before any original disclosure, including completed operations; refusal returns no output and leaves durable state unchanged. Original start custody on every path, including post-completion retry and recovery, follows the start custody gate below. Lane-owned identifier schemas require exact fixed lengths or a full-input regex guard; trailing LF is invalid.

  Start custody gate for exactly memory.verification_sweep.started@1.0.0, newly authored owner contract (DMEM fix round 4): the one rule behind every start-custody sentence in AMS-107, CV-657 and this SP-637. It adopts SP-286 and CV-339 first-AppendReceipt full-value custody and replaces none of their terms. Every path after first start admission goes through it: retry of this family's first append, the accepted to started row CAS, the effect and its settlement, the terminal append and row CAS of memory.verification_sweep.completed, retry and replay of this original before and after completion, recovery from every phase, the canonical current-writer retry at every phase, boundary acceptance and the history reader. Before such a path appends, CAS-publishes a row or selector, settles an effect, or returns or discloses an original, it resolves the exact original start record, this family's own SP-286 retained full-value original under this operation's memory_verification_sweep_operation.v1 key; this event is the start record of its operation, authenticated through storage.first_append_receipt.resolve_full_value.v1, and verifies all of: identity (event_id and idempotency_key recompute from this unit's recipe for this storage_instance_id, project_id and operation_id); digest (the retained full-value commitment recomputes from the retained value); operation (correlation_id and payload operation, Project, source revision, command and frozen start time equal the operation row); phase (the event type is exactly memory.verification_sweep.started and the row is accepted only before the start receipt, otherwise a later lawful phase); receipt (the first AppendReceipt settled under full flush, and the row's started_event_id and any retained memory.verification_sweep.completed original's causation_event_id and payload started_event_id name exactly that record); and no withdrawal fence on this family or memory.verification_sweep.completed@1.0.0. Missing, corrupted, mismatched or withdrawn custody refuses with start_receipt_missing, or permission_or_withdrawal for a withdrawal fence, before any append, CAS, selector change, effect or output; the operation stays at its last durable phase and is never reissued. The gate is evaluated on the prior durable state and again on the tentative result immediately before commit, after any path-specific refusal, so no path, including one added later, can append, publish or return without it. The only relaxation is this family's first append from an accepted row with no start receipt and no later original: the record may then be absent, but one that is present is still verified, and the append must leave a verified record. Terminal custody stays the separate status/result/hash check above. The history reader returns a retained original that verified when written whatever the operation's current live state (later phase, source revision, selector, counters or request), and still refuses a withdrawal fence, revoked Project access, a forged or unverifiable original or missing start custody; it changes no state. Retention stays pending: this gate selects no retention period.

  The static oracle in ATS-315 checks actual operation instances, exact expected/actual CAS rows, immutable retained synthetic full event values, and durable effect/selection counters through interrupted traces. Its crash action drops only volatile publication state. Replaying or retrying a retained event can return only that original value and changes neither the effect ledger nor a selector. Physical transaction/flush/receipt authenticity remains native NOT_RUN.

  Current producer-semantic projections and current identity inputs follow CV-1100 (current recipe cv1100-exact-integer-write-v3): every numeric leaf is an exact integer primitive, never a boolean, runtime float or fraction/exponent token, within the range its field owner schema declares; no global safe-integer ceiling applies, and raw input uses the CV-1100 current JSON integer grammar (scripts/pm_event_numbers.py loads_current_json), so 01, +1, -0, 1.0 and 1e0 are never read as integers. This producer route excludes Storage-assigned sequence_id, observed_at_utc and persisted_at_utc under Contracts_V0.md#EventRecord. Storage sequence_id independently adopts SP-236 exact uint64, 0 through 18446744073709551615 inclusive, with exact integer type; booleans, floats and strings refuse. Fresh writes and metadata-only retries preserve that full domain without a producer-number ceiling. Decimal and exponent tokens decode losslessly to exact decimal carriers before validation and are never folded into integers. Identity, idempotency, result and target commitments keep their local recipes, sorted-key compact UTF-8 JSON over unchanged preimages, and admit only exact integers: a fraction, exponent or float spelling, a nonfinite value or an integer outside the range of its field owner refuses before hashing or append instead of being normalized. A current-writer retained EventRecord carries the unchanged CV-339 full-value commitment (pm.storage.original_event_value_commitment.v1 over the complete 2.0.0 EventRecord map in SP-236 EVENT_VALUE bytes, scripts/pm_event_numbers.py full_value_commitment) with exact Storage uint64 metadata; no new serializer is introduced. Historical originals instead use their frozen write-time recipe integer-json-v1: pm.event.v0 envelope editions 1.0.0 and 2.0.0 both retain their original unbounded integral sequence domains; operation/target edition 1.0.0 uses the explicit historical_ definitions frozen from 77323e87d65908dbce2ea655ee344b6185a13ff1, including artifact byte_length up to 9223372036854775807. The two frozen envelope editions share the integer-json-v1 numeric/hash recipe, and no record field, edition included, selects a recipe. Reader dispatch follows SP-1101: each retained canonical original (the writer's returned or canonical start original, a canonical history original and its start record, a checkpoint-joined original) resolves once through the shared RetainedDispatcher, which takes the write-time recipe tuple (envelope edition, writer recipe, full-value profile and resources) from Storage's sealed custody of that exact retained record, never from the record's schema_id/schema_version, a recipe field or the caller, and the composition-installed frozen verifier of that tuple then runs its checks. An original Storage did not seal at its seglog ref, one sealed with more than one binding or recipe, a sealed binding that is not the reader's, or a recipe with no installed verifier refuses at the site's custody guard; there is no current-then-legacy probing, permissive fallback or current writer predicate. The original full-value commitment is recomputed under that recipe with no rewrite of retained values, hashes, frozen operation or receipt. Historical numeric decoding preserves the original typed integer or binary64 stored value; a current lossless decimal parse never reinterprets an older binary64 original. Original verification in current-writer retries and checkpoint reader projections uses the sealed recipe of that original (CV-339 for a current-writer original, frozen integer-json-v1 for an older one); only the new caller producer-semantic projection and new-write producer admission use the strict current recipe; new caller Storage metadata is independently checked against SP-236. Valid retained large integers remain readable in canonical, replay-only, compatibility and compatibility-replay modes after live state/admission/cutoffs change; forged commitments, rehashed foreign values, unknown editions/recipe fields, lost custody, revoked permission and withdrawal still refuse. Plans/memory_maintenance_event_record.schema.json keeps SP-236 current Storage uint64 bounds (SP-1100, checked with storage_uint64), the producer_sequence_id domain of the EventRecord owner without an added ceiling, and unchanged frozen reader definitions; operation/target schemas keep current definitions and their frozen historical_ counterparts. Generic Storage metadata ownership is unchanged. Every declared date-time format is enforced by the shared CV-1101 predicate (scripts/pm_event_datetime.py date_time) with the explicit profile of its field owner, without optional validator packages: payload and EventRecord occurred_at_utc and the SP-278 checkpoint times take the broad event_record profile (RFC 3339 with an explicit zone, lowercase t or z, offsets, year 0000, any fraction length and announced leap seconds); Storage-assigned observed_at_utc and persisted_at_utc take CV-253 storage_utc_z at the current and every retained envelope edition; the operation row's frozen started_occurred_at_utc and completed_occurred_at_utc keep their terminal-uppercase-Z owner pattern and take storage_utc_z. Bad calendar fields or separators, missing zones, an unannounced second 60 and trailing LF refuse, and a skipped old format check never authorizes invalid retained history. Existing length constraints remain. Timestamp strings retain their exact hash bytes. UUID uses the full 8-4-4-4-12 hexadecimal grammar. The selected recipe's frozen verifier applies the same profiles to retained originals; there is no narrower historical format edition.

  Permission/admission and withdrawal fields, and every Boolean boundary receipt/source/acceptance fence, require the exact Boolean type before their value is evaluated; strings, numeric 0/1, null, arrays and objects never grant authority or clear a fence. Historical reads still use current typed permission/withdrawal only, not current admission or cutoffs.
gui_related: false
gui_classification_reason: Typed events, identity, custody and recovery; no visual behavior.
depends_on:
- DL-045
- SP-278
- SP-286
- AMS-107
- CV-657
unblocks: []
acceptance_criteria:
- Exact family remains quarantined until its own admission and retention resolution.
- Schema, identity, custody, replay and withdrawal match this unit.
validation_surfaces:
- python3 scripts/pm_memory_maintenance_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_wave2_DMEM_20261104
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-search.json
preserved_exact_tokens: []
negative_constraints:
- No admission, deletion-policy decision, app-scope expansion or native proof.
```


### SP-638 - memory.monthly_summary.completed Card 1b contract

```yaml
plan_unit_id: SP-638
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.monthly_summary.completed@1.0.0,
  prepared without admission. Search and negative evidence: this exact family''s row in reports/event-authority-20261104/DMEM-card1b-search.json.
  Semantic owner is Plans/assistant-memory-subsystem.md section 7.2, as amended by DL-402, DL-403 and DL-446. This
  unit owns this family''s payload and storage contract. Its producer is MemoryMaintenance.monthly_summary.completed.v1@1.0.0
  through cmd.chat.memory.summarize_monthly, the same authenticated in-process handler for GUI and internal maintenance.
  Project-only edition, never a synthetic Project for AMS-054 app-thread memory; application editions and their
  count bucket require separate owner work.


  Consolidate eligible older low-activation Note originals into a monthly Note; archive every selected original
  with all its EvidenceRefs and original version history. No original is deleted or stripped of evidence. Never
  include a pinned original, including in a merge. The month argument remains the existing UCC-085 optional month,
  not a schedule or a new selection UI. Both jobs only archive and only the user deletes a memory (DL-402); pins
  still permit verification, index rebuilds and out-of-date marking. The separate duplicate-sweep survivor and archive disposition follow DL-444 and DL-445; they do not set these archive-job cutoffs.


  Explicit adoption for this exact family: adopt every producer, first-append, operation-CAS, outcome, replay, redaction,
  backup/restore, access, generic checkpoint, compatibility and withdrawal obligation in Plans/storage-plan.md#SP-636,
  including its round-4 start custody gate, and the closed payload/joins of Plans/Contracts_V0.md#CV-656, with the
  following exhaustive substitutions. Replace verification_sweep by monthly_summary, command_id by cmd.chat.memory.summarize_monthly,
  current family by memory.monthly_summary.completed, counterpart by memory.monthly_summary.started, operation definition
  by Plans/memory_maintenance_operation.schema.json#/$defs/monthly_summary, operation family by memory_monthly_summary_operation,
  schema_id by pm.storage_value.memory_monthly_summary_operation.v1, and history consumer by reader.memory.monthly_summary.completed.history.v1@1.0.0.
  No verification action or index target/selector behavior is adopted: this is the four-phase non-index atomic gist
  transaction accepted -> started -> effect_committed -> completed. The payload is its own closed definition Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_monthly_summary_completed;
  all declared fields required, additionalProperties=false, version=1.0.0, payload_ref=null. Completed status/result
  ref/hash and started_event_id equal the frozen operation and retained original. Started payload uses the frozen
  acceptance time. Every identifier has exact lengths or full-input guards, including trailing-LF negatives. Ordinary
  inline payloads and operation values stay within 16 KiB under SP-337/SP-340; oversized data uses Storage''s SP-337
  payload-reference protocol rather than embedding memory/evidence bodies, but this bounded edition never accepts
  an oversized inline body or silently changes its schema.


  Identity for exactly memory.monthly_summary.completed: event_id="evt_mem_"+SHA-256(strict UTF-8 compact JSON ["pm.memory.maintenance.event.v1",storage_instance_id,project_id,operation_id,"memory.monthly_summary.completed"]);
  idempotency_key="memory-maintenance:"+the same lower-hex digest. The caller-supplied semantic EventRecord fields
  and payload alone participate in retry equality; sequence_id, observed_at_utc and persisted_at_utc are Storage-assigned
  and excluded. Scope joins use project~{base64url_no_pad(UTF8(project_id))}, never a raw Project or an Application
  key. Replay policy is dedupe_by_idempotency_key. Exact payload_schema_id=https://puppetmaster.local/Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_monthly_summary_completed.
  Current append and retry refuse projector_replay_only as replay_only_not_appendable, before any original return
  or effect. The closed operation key is memory_monthly_summary_operation.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(operation_id)}
  in memory_maintenance_operations; its schema is admitted only by StorageMigrationCoordinator. Add immutable cutoff_ref
  and cutoff_sha256 to this family''s row; bind the approved cutoff and exact command arguments into the accepted
  request digest. No separate gist store or command journal.


  Start custody gate for exactly memory.monthly_summary.completed@1.0.0: SP-638 explicitly adopts SP-286/CV-339
  and the whole SP-636 start custody rule for this exact operation, not a sibling''s admission. On every path after
  first start admission, resolve the full-flush original memory.monthly_summary.started under this operation key
  through storage.first_append_receipt.resolve_full_value.v1. Check recomputed identity, digest, exact Project/operation/source/command/frozen
  time, lawful phase, settled receipt, and all later causation/started_event_id joins; fence withdrawal of either
  edition. Before and again at commit, missing/corrupted/mismatched custody refuses start_receipt_missing, withdrawal
  permission_or_withdrawal; no append, CAS, effect, output or reissuance. The only absence relaxation is memory.monthly_summary.started''s
  first append from accepted with no receipt and no later original; an original already present is always verified.
  The terminal advance, retries of either original, recovery in every phase, canonical writer, boundary and history
  read all use this rule. The counterpart''s own unit is SP-639.


  DL-446 answers DL-403 for this exact job with E-CARDS-2 Card 6.c option A. Allow monthly summary to select Note memories idle for at least 90 days AND with usefulness score below 0.10. Apply the test separately inside each Project. If a chat outside a Project later receives its own fully specified and reviewed saved maintenance record and separate approval to record it, apply the test only inside that calling chat; never pool chats or Projects. Count idle days from the later of the last edit and last access, using creation time when either is absent. Use the existing computed usefulness ranking with inputs captured when the job chooses memories. Exclude pins before scoring. A crowded list alone must never trigger archiving. Keep the existing monthly grouping. Create the monthly summary and archive every selected original, retaining all evidence references and versions. Deletion remains your action. This cutoff choice supplies no separate permission to run outside a Project. The usefulness ranking is the existing section 6.3 formula, including per-kind and Done decay and zero contribution for missing retrieval scores; captured scores are owner-declared numeric values compared directly with the approved threshold, not integer identity inputs. Do not round scores or introduce a lane-local score range, number cap or serializer.

  The authenticated cutoff binding remains additional to admission and start custody. The missing-cutoffs product decision is resolved, but automatic and Memory-panel dispatch remain unavailable until all remaining definition, review and recording approvals pass. Resolve the exact authenticated owner policy for this job and Project, freeze its ref/content hash and captured selection inputs in the accepted operation/source/request binding, and recheck it before each current writer/effect boundary. If the binding is unavailable, refuse cutoffs_unavailable with unchanged durable state and no output; the panel explains the actual missing approval/binding. Direct invocation, a Boolean, caller policy argument, wrong-scope ref, altered digest or sibling-job approval cannot bypass this gate. Lookup key, resolved self-reference and frozen operation ref identify exactly one owner record; resolved job/scope/Project and recomputed hash agree with every operation/request/start/terminal copy. A coherent rehash cannot authorize contradictory refs. Fixtures inject synthetic resolver authority only to exercise the approved cutoffs, never runtime admission. Source E-CARDS-2 as presented, Card 6 options A, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30; decision-answers/E-CARDS-2.as-presented-6db25be3.md and ANSWERS_E-CARDS-2_20261105.md under /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104; DL-444 through DL-447, landed in Plans/Decision_Log.md on main. History reads do not
  require a currently available cutoff: a retained authentic event valid when written remains readable after cutoffs,
  source, request or live counters change; withdrawal, revoked permission, missing start custody or forgery still
  refuses.


  This family''s exact reader reader.memory.monthly_summary.completed.history.v1@1.0.0 explicitly adopts SP-278:
  reader.storage.event_record_index@1.0.0, projector.storage.event_record_index@1.0.0, checkpoints/event_record_index_checkpoint.v1:{storage_instance_id},
  Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, atomic root/frontier CAS and generation-qualified
  event_record_index.v2@{generation_id}. Nine-field durable token excludes redb_snapshot_id; ten-field live token
  stays in its read transaction. No family-owned cursor or checkpoint. Join the actual event''s storage identity
  and root; mismatches fail. Preserve BRS-031 coherent canonical memory/operation/receipt/EventRecord boundaries;
  derived indexes rebuild and cannot resurrect deleted gists. All history/ref disclosure rechecks current access,
  deletion/hold state and withdrawal, and never exposes note, prompt, embedding, path, secret or EvidenceRef bodies.
  Result refs are opaque and grant no access.


  Retention for this exact Project event is RP-OPERATIONAL-2555D@1.0.0 under DL-401/G04, landed in Plans/Decision_Log.md on main with the CA-RET assignment in Plans/storage-plan.md and Plans/storage_value_registry.json
  (read on this lane at origin/plans/ea-retention-cards1-20261104 2663667e14346235daaa561d193e959422640b6e): 2,555 days, terminal-transition anchor, 2,000,000 per Project, refuse
  new records at cap, all existing holds/live/recovery/backup references override expiry. Counts/outcomes only,
  never memory text. This supersedes only SP-636''s pending EVENT assignment for this adoption. Canonical operation/result
  custody retention remains PENDING_RETENTION_DECISION and native activation stays fenced until its owner resolves
  that independent policy; no retention rule for underlying memories is selected. Generic index/checkpoint policies
  stay RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN. Application count bucket is unresolved and no Application event
  edition is prepared.


  Only exact edition 1.0.0 is specified. Incompatible/unknown editions fail closed while original bytes survive
  authorized historical reads. Withdrawal first fences this family''s command/writer, retains unresolved original
  custody without reissue, then fences its exact reader and invalidates its live tokens under the same maintenance/read
  fence; other generic readers continue. A successor requires explicit admission and retained-source rebuild; no
  alias or migration by resemblance. Oracles are ATS-316 and scripts/pm_memory_archive_events.py, including positive
  conditional lifecycle, failed outcome, original retry, crash/recovery, historical independence, archive/evidence/pin
  negatives, unavailable buttons and guard-removal proof. Native execution is NOT_RUN. Membership is ABSENT; no
  admission or readiness follows from this unit. The started and completed payloads also require cutoff_ref and
  cutoff_sha256 exactly equal to the immutable operation fields, so start custody freezes the selected approval
  across recovery and retries. The closed operation and both payloads additionally require month, the exact accepted
  UCC-085 optional month in YYYY-MM form or null when omitted. Freeze the caller argument unchanged, including null;
  neither retries nor recovery substitute the current month. This selects no default-month behavior or cutoff.

  Current producer-semantic projections and current identity inputs follow CV-1100 (current recipe cv1100-exact-integer-write-v3): every numeric leaf is an exact integer primitive, never a boolean, runtime float or fraction/exponent token, within the range its field owner schema declares; no global safe-integer ceiling applies, and raw input uses the CV-1100 current JSON integer grammar (scripts/pm_event_numbers.py loads_current_json), so 01, +1, -0, 1.0 and 1e0 are never read as integers. This producer route excludes Storage-assigned sequence_id, observed_at_utc and persisted_at_utc under Contracts_V0.md#EventRecord. Storage sequence_id independently adopts SP-236 exact uint64, 0 through 18446744073709551615 inclusive, with exact integer type; booleans, floats and strings refuse. Fresh writes and metadata-only retries preserve that full domain without a producer-number ceiling. Decimal and exponent tokens decode losslessly to exact decimal carriers before validation and are never folded into integers. Identity, idempotency, result and target commitments keep their local recipes, sorted-key compact UTF-8 JSON over unchanged preimages, and admit only exact integers: a fraction, exponent or float spelling, a nonfinite value or an integer outside the range of its field owner refuses before hashing or append instead of being normalized. A current-writer retained EventRecord carries the unchanged CV-339 full-value commitment (pm.storage.original_event_value_commitment.v1 over the complete 2.0.0 EventRecord map in SP-236 EVENT_VALUE bytes, scripts/pm_event_numbers.py full_value_commitment) with exact Storage uint64 metadata; no new serializer is introduced. Historical originals instead use their frozen write-time recipe integer-json-v1: pm.event.v0 envelope editions 1.0.0 and 2.0.0 both retain their original unbounded integral sequence domains; operation/target edition 1.0.0 uses the explicit historical_ definitions frozen from 77323e87d65908dbce2ea655ee344b6185a13ff1, including artifact byte_length up to 9223372036854775807. The two frozen envelope editions share the integer-json-v1 numeric/hash recipe, and no record field, edition included, selects a recipe. Reader dispatch follows SP-1101: each retained canonical original (the writer''s returned or canonical start original, a canonical history original and its start record, a checkpoint-joined original) resolves once through the shared RetainedDispatcher, which takes the write-time recipe tuple (envelope edition, writer recipe, full-value profile and resources) from Storage''s sealed custody of that exact retained record, never from the record''s schema_id/schema_version, a recipe field or the caller, and the composition-installed frozen verifier of that tuple then runs its checks. An original Storage did not seal at its seglog ref, one sealed with more than one binding or recipe, a sealed binding that is not the reader''s, or a recipe with no installed verifier refuses at the site''s custody guard; there is no current-then-legacy probing, permissive fallback or current writer predicate. The original full-value commitment is recomputed under that recipe with no rewrite of retained values, hashes, frozen operation or receipt. Historical numeric decoding preserves the original typed integer or binary64 stored value; a current lossless decimal parse never reinterprets an older binary64 original. Original verification in current-writer retries and checkpoint reader projections uses the sealed recipe of that original (CV-339 for a current-writer original, frozen integer-json-v1 for an older one); only the new caller producer-semantic projection and new-write producer admission use the strict current recipe; new caller Storage metadata is independently checked against SP-236. Valid retained large integers remain readable in canonical, replay-only, compatibility and compatibility-replay modes after live state/admission/cutoffs change; forged commitments, rehashed foreign values, unknown editions/recipe fields, lost custody, revoked permission and withdrawal still refuse. Plans/memory_maintenance_event_record.schema.json keeps SP-236 current Storage uint64 bounds (SP-1100, checked with storage_uint64), the producer_sequence_id domain of the EventRecord owner without an added ceiling, and unchanged frozen reader definitions; operation/target schemas keep current definitions and their frozen historical_ counterparts. Generic Storage metadata ownership is unchanged. Every declared date-time format is enforced by the shared CV-1101 predicate (scripts/pm_event_datetime.py date_time) with the explicit profile of its field owner, without optional validator packages: payload and EventRecord occurred_at_utc and the SP-278 checkpoint times take the broad event_record profile (RFC 3339 with an explicit zone, lowercase t or z, offsets, year 0000, any fraction length and announced leap seconds); Storage-assigned observed_at_utc and persisted_at_utc take CV-253 storage_utc_z at the current and every retained envelope edition; the operation row''s frozen started_occurred_at_utc and completed_occurred_at_utc keep their terminal-uppercase-Z owner pattern and take storage_utc_z. Bad calendar fields or separators, missing zones, an unannounced second 60 and trailing LF refuse, and a skipped old format check never authorizes invalid retained history. Existing length constraints remain. Timestamp strings retain their exact hash bytes. UUID uses the full 8-4-4-4-12 hexadecimal grammar. The selected recipe''s frozen verifier applies the same profiles to retained originals; there is no narrower historical format edition.

  Permission/admission and withdrawal fields, and every Boolean boundary receipt/source/acceptance fence, require the exact Boolean type before their value is evaluated; strings, numeric 0/1, null, arrays and objects never grant authority or clear a fence. Historical reads still use current typed permission/withdrawal only, not current admission or cutoffs.

  Before archive selection and post-state validation, every resolved memory''s pinned and archived fields in both input and output must have the exact Boolean type. A malformed flag refuses the whole settlement without state change or output; correctly typed pins and all original versions/EvidenceRefs retain the existing DL-402 preservation rules.'
gui_related: true
gui_classification_reason: Binds unavailable Memory-panel buttons as well as typed maintenance events.
depends_on:
- DL-045
- SP-636
- CV-656
- SP-278
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- Exact family has its own conditional contract; approved DL-446 cutoff; no admission.
- Archive-only, pin/evidence preservation and cutoff refusal pass ATS-316.
validation_surfaces:
- python3 scripts/pm_memory_archive_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_DMEM_card1b_20261104
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-card1b-search.json
- DL-402/DL-403 on origin/plans/ea-cards1-answers-20261104 at b6332f391a7870bad5f01a29a7e9d080050dac27
preserved_exact_tokens:
- memory.monthly_summary.completed
- cutoffs_unavailable
- RP-OPERATIONAL-2555D@1.0.0
negative_constraints:
- No admission, automatic deletion, user deletion policy expansion, app edition or native proof.
```


### SP-639 - memory.monthly_summary.started Card 1b contract

```yaml
plan_unit_id: SP-639
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored owner contract under DL-045 for exactly memory.monthly_summary.started@1.0.0, prepared
  without admission. Search and negative evidence: this exact family''s row in reports/event-authority-20261104/DMEM-card1b-search.json.
  Semantic owner is Plans/assistant-memory-subsystem.md section 7.2, as amended by DL-402, DL-403 and DL-446. This
  unit owns this family''s payload and storage contract. Its producer is MemoryMaintenance.monthly_summary.started.v1@1.0.0
  through cmd.chat.memory.summarize_monthly, the same authenticated in-process handler for GUI and internal maintenance.
  Project-only edition, never a synthetic Project for AMS-054 app-thread memory; application editions and their
  count bucket require separate owner work.


  Consolidate eligible older low-activation Note originals into a monthly Note; archive every selected original
  with all its EvidenceRefs and original version history. No original is deleted or stripped of evidence. Never
  include a pinned original, including in a merge. The month argument remains the existing UCC-085 optional month,
  not a schedule or a new selection UI. Both jobs only archive and only the user deletes a memory (DL-402); pins
  still permit verification, index rebuilds and out-of-date marking. The separate duplicate-sweep survivor and archive disposition follow DL-444 and DL-445; they do not set these archive-job cutoffs.


  Explicit adoption for this exact family: adopt every producer, first-append, operation-CAS, outcome, replay, redaction,
  backup/restore, access, generic checkpoint, compatibility and withdrawal obligation in Plans/storage-plan.md#SP-637,
  including its round-4 start custody gate, and the closed payload/joins of Plans/Contracts_V0.md#CV-657, with the
  following exhaustive substitutions. Replace verification_sweep by monthly_summary, command_id by cmd.chat.memory.summarize_monthly,
  current family by memory.monthly_summary.started, counterpart by memory.monthly_summary.completed, operation definition
  by Plans/memory_maintenance_operation.schema.json#/$defs/monthly_summary, operation family by memory_monthly_summary_operation,
  schema_id by pm.storage_value.memory_monthly_summary_operation.v1, and history consumer by reader.memory.monthly_summary.started.history.v1@1.0.0.
  No verification action or index target/selector behavior is adopted: this is the four-phase non-index atomic gist
  transaction accepted -> started -> effect_committed -> completed. The payload is its own closed definition Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_monthly_summary_started;
  all declared fields required, additionalProperties=false, version=1.0.0, payload_ref=null. Completed status/result
  ref/hash and started_event_id equal the frozen operation and retained original. Started payload uses the frozen
  acceptance time. Every identifier has exact lengths or full-input guards, including trailing-LF negatives. Ordinary
  inline payloads and operation values stay within 16 KiB under SP-337/SP-340; oversized data uses Storage''s SP-337
  payload-reference protocol rather than embedding memory/evidence bodies, but this bounded edition never accepts
  an oversized inline body or silently changes its schema.


  Identity for exactly memory.monthly_summary.started: event_id="evt_mem_"+SHA-256(strict UTF-8 compact JSON ["pm.memory.maintenance.event.v1",storage_instance_id,project_id,operation_id,"memory.monthly_summary.started"]);
  idempotency_key="memory-maintenance:"+the same lower-hex digest. The caller-supplied semantic EventRecord fields
  and payload alone participate in retry equality; sequence_id, observed_at_utc and persisted_at_utc are Storage-assigned
  and excluded. Scope joins use project~{base64url_no_pad(UTF8(project_id))}, never a raw Project or an Application
  key. Replay policy is dedupe_by_idempotency_key. Exact payload_schema_id=https://puppetmaster.local/Plans/memory_maintenance_event_payloads.schema.json#/$defs/memory_monthly_summary_started.
  Current append and retry refuse projector_replay_only as replay_only_not_appendable, before any original return
  or effect. The closed operation key is memory_monthly_summary_operation.v1:{hex(storage_instance_id)}:{hex(project_id)}:{hex(operation_id)}
  in memory_maintenance_operations; its schema is admitted only by StorageMigrationCoordinator. Add immutable cutoff_ref
  and cutoff_sha256 to this family''s row; bind the approved cutoff and exact command arguments into the accepted
  request digest. No separate gist store or command journal.


  Start custody gate for exactly memory.monthly_summary.started@1.0.0: SP-639 explicitly adopts SP-286/CV-339 and
  the whole SP-637 start custody rule for this exact operation, not a sibling''s admission. On every path after
  first start admission, resolve the full-flush original memory.monthly_summary.started under this operation key
  through storage.first_append_receipt.resolve_full_value.v1. Check recomputed identity, digest, exact Project/operation/source/command/frozen
  time, lawful phase, settled receipt, and all later causation/started_event_id joins; fence withdrawal of either
  edition. Before and again at commit, missing/corrupted/mismatched custody refuses start_receipt_missing, withdrawal
  permission_or_withdrawal; no append, CAS, effect, output or reissuance. The only absence relaxation is memory.monthly_summary.started''s
  first append from accepted with no receipt and no later original; an original already present is always verified.
  The terminal advance, retries of either original, recovery in every phase, canonical writer, boundary and history
  read all use this rule. The counterpart''s own unit is SP-638.


  DL-446 answers DL-403 for this exact job with E-CARDS-2 Card 6.c option A. Allow monthly summary to select Note memories idle for at least 90 days AND with usefulness score below 0.10. Apply the test separately inside each Project. If a chat outside a Project later receives its own fully specified and reviewed saved maintenance record and separate approval to record it, apply the test only inside that calling chat; never pool chats or Projects. Count idle days from the later of the last edit and last access, using creation time when either is absent. Use the existing computed usefulness ranking with inputs captured when the job chooses memories. Exclude pins before scoring. A crowded list alone must never trigger archiving. Keep the existing monthly grouping. Create the monthly summary and archive every selected original, retaining all evidence references and versions. Deletion remains your action. This cutoff choice supplies no separate permission to run outside a Project. The usefulness ranking is the existing section 6.3 formula, including per-kind and Done decay and zero contribution for missing retrieval scores; captured scores are owner-declared numeric values compared directly with the approved threshold, not integer identity inputs. Do not round scores or introduce a lane-local score range, number cap or serializer.

  The authenticated cutoff binding remains additional to admission and start custody. The missing-cutoffs product decision is resolved, but automatic and Memory-panel dispatch remain unavailable until all remaining definition, review and recording approvals pass. Resolve the exact authenticated owner policy for this job and Project, freeze its ref/content hash and captured selection inputs in the accepted operation/source/request binding, and recheck it before each current writer/effect boundary. If the binding is unavailable, refuse cutoffs_unavailable with unchanged durable state and no output; the panel explains the actual missing approval/binding. Direct invocation, a Boolean, caller policy argument, wrong-scope ref, altered digest or sibling-job approval cannot bypass this gate. Lookup key, resolved self-reference and frozen operation ref identify exactly one owner record; resolved job/scope/Project and recomputed hash agree with every operation/request/start/terminal copy. A coherent rehash cannot authorize contradictory refs. Fixtures inject synthetic resolver authority only to exercise the approved cutoffs, never runtime admission. Source E-CARDS-2 as presented, Card 6 options A, SHA-256 6db25be3dd290ab0083af482383e469a78dc109a037ad0fd0ece5d8f15679b30; decision-answers/E-CARDS-2.as-presented-6db25be3.md and ANSWERS_E-CARDS-2_20261105.md under /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104; DL-444 through DL-447, landed in Plans/Decision_Log.md on main. History reads do not
  require a currently available cutoff: a retained authentic event valid when written remains readable after cutoffs,
  source, request or live counters change; withdrawal, revoked permission, missing start custody or forgery still
  refuses.


  This family''s exact reader reader.memory.monthly_summary.started.history.v1@1.0.0 explicitly adopts SP-278: reader.storage.event_record_index@1.0.0,
  projector.storage.event_record_index@1.0.0, checkpoints/event_record_index_checkpoint.v1:{storage_instance_id},
  Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, atomic root/frontier CAS and generation-qualified
  event_record_index.v2@{generation_id}. Nine-field durable token excludes redb_snapshot_id; ten-field live token
  stays in its read transaction. No family-owned cursor or checkpoint. Join the actual event''s storage identity
  and root; mismatches fail. Preserve BRS-031 coherent canonical memory/operation/receipt/EventRecord boundaries;
  derived indexes rebuild and cannot resurrect deleted gists. All history/ref disclosure rechecks current access,
  deletion/hold state and withdrawal, and never exposes note, prompt, embedding, path, secret or EvidenceRef bodies.
  Result refs are opaque and grant no access.


  Retention for this exact Project event is RP-OPERATIONAL-2555D@1.0.0 under DL-401/G04, landed in Plans/Decision_Log.md on main with the CA-RET assignment in Plans/storage-plan.md and Plans/storage_value_registry.json
  (read on this lane at origin/plans/ea-retention-cards1-20261104 2663667e14346235daaa561d193e959422640b6e): 2,555 days, terminal-transition anchor, 2,000,000 per Project, refuse
  new records at cap, all existing holds/live/recovery/backup references override expiry. Counts/outcomes only,
  never memory text. This supersedes only SP-637''s pending EVENT assignment for this adoption. Canonical operation/result
  custody retention remains PENDING_RETENTION_DECISION and native activation stays fenced until its owner resolves
  that independent policy; no retention rule for underlying memories is selected. Generic index/checkpoint policies
  stay RP-EVENT-INDEX-SOURCE and RP-PROJECTION-3GEN. Application count bucket is unresolved and no Application event
  edition is prepared.


  Only exact edition 1.0.0 is specified. Incompatible/unknown editions fail closed while original bytes survive
  authorized historical reads. Withdrawal first fences this family''s command/writer, retains unresolved original
  custody without reissue, then fences its exact reader and invalidates its live tokens under the same maintenance/read
  fence; other generic readers continue. A successor requires explicit admission and retained-source rebuild; no
  alias or migration by resemblance. Oracles are ATS-316 and scripts/pm_memory_archive_events.py, including positive
  conditional lifecycle, failed outcome, original retry, crash/recovery, historical independence, archive/evidence/pin
  negatives, unavailable buttons and guard-removal proof. Native execution is NOT_RUN. Membership is ABSENT; no
  admission or readiness follows from this unit. The started and completed payloads also require cutoff_ref and
  cutoff_sha256 exactly equal to the immutable operation fields, so start custody freezes the selected approval
  across recovery and retries. The closed operation and both payloads additionally require month, the exact accepted
  UCC-085 optional month in YYYY-MM form or null when omitted. Freeze the caller argument unchanged, including null;
  neither retries nor recovery substitute the current month. This selects no default-month behavior or cutoff.

  Current producer-semantic projections and current identity inputs follow CV-1100 (current recipe cv1100-exact-integer-write-v3): every numeric leaf is an exact integer primitive, never a boolean, runtime float or fraction/exponent token, within the range its field owner schema declares; no global safe-integer ceiling applies, and raw input uses the CV-1100 current JSON integer grammar (scripts/pm_event_numbers.py loads_current_json), so 01, +1, -0, 1.0 and 1e0 are never read as integers. This producer route excludes Storage-assigned sequence_id, observed_at_utc and persisted_at_utc under Contracts_V0.md#EventRecord. Storage sequence_id independently adopts SP-236 exact uint64, 0 through 18446744073709551615 inclusive, with exact integer type; booleans, floats and strings refuse. Fresh writes and metadata-only retries preserve that full domain without a producer-number ceiling. Decimal and exponent tokens decode losslessly to exact decimal carriers before validation and are never folded into integers. Identity, idempotency, result and target commitments keep their local recipes, sorted-key compact UTF-8 JSON over unchanged preimages, and admit only exact integers: a fraction, exponent or float spelling, a nonfinite value or an integer outside the range of its field owner refuses before hashing or append instead of being normalized. A current-writer retained EventRecord carries the unchanged CV-339 full-value commitment (pm.storage.original_event_value_commitment.v1 over the complete 2.0.0 EventRecord map in SP-236 EVENT_VALUE bytes, scripts/pm_event_numbers.py full_value_commitment) with exact Storage uint64 metadata; no new serializer is introduced. Historical originals instead use their frozen write-time recipe integer-json-v1: pm.event.v0 envelope editions 1.0.0 and 2.0.0 both retain their original unbounded integral sequence domains; operation/target edition 1.0.0 uses the explicit historical_ definitions frozen from 77323e87d65908dbce2ea655ee344b6185a13ff1, including artifact byte_length up to 9223372036854775807. The two frozen envelope editions share the integer-json-v1 numeric/hash recipe, and no record field, edition included, selects a recipe. Reader dispatch follows SP-1101: each retained canonical original (the writer''s returned or canonical start original, a canonical history original and its start record, a checkpoint-joined original) resolves once through the shared RetainedDispatcher, which takes the write-time recipe tuple (envelope edition, writer recipe, full-value profile and resources) from Storage''s sealed custody of that exact retained record, never from the record''s schema_id/schema_version, a recipe field or the caller, and the composition-installed frozen verifier of that tuple then runs its checks. An original Storage did not seal at its seglog ref, one sealed with more than one binding or recipe, a sealed binding that is not the reader''s, or a recipe with no installed verifier refuses at the site''s custody guard; there is no current-then-legacy probing, permissive fallback or current writer predicate. The original full-value commitment is recomputed under that recipe with no rewrite of retained values, hashes, frozen operation or receipt. Historical numeric decoding preserves the original typed integer or binary64 stored value; a current lossless decimal parse never reinterprets an older binary64 original. Original verification in current-writer retries and checkpoint reader projections uses the sealed recipe of that original (CV-339 for a current-writer original, frozen integer-json-v1 for an older one); only the new caller producer-semantic projection and new-write producer admission use the strict current recipe; new caller Storage metadata is independently checked against SP-236. Valid retained large integers remain readable in canonical, replay-only, compatibility and compatibility-replay modes after live state/admission/cutoffs change; forged commitments, rehashed foreign values, unknown editions/recipe fields, lost custody, revoked permission and withdrawal still refuse. Plans/memory_maintenance_event_record.schema.json keeps SP-236 current Storage uint64 bounds (SP-1100, checked with storage_uint64), the producer_sequence_id domain of the EventRecord owner without an added ceiling, and unchanged frozen reader definitions; operation/target schemas keep current definitions and their frozen historical_ counterparts. Generic Storage metadata ownership is unchanged. Every declared date-time format is enforced by the shared CV-1101 predicate (scripts/pm_event_datetime.py date_time) with the explicit profile of its field owner, without optional validator packages: payload and EventRecord occurred_at_utc and the SP-278 checkpoint times take the broad event_record profile (RFC 3339 with an explicit zone, lowercase t or z, offsets, year 0000, any fraction length and announced leap seconds); Storage-assigned observed_at_utc and persisted_at_utc take CV-253 storage_utc_z at the current and every retained envelope edition; the operation row''s frozen started_occurred_at_utc and completed_occurred_at_utc keep their terminal-uppercase-Z owner pattern and take storage_utc_z. Bad calendar fields or separators, missing zones, an unannounced second 60 and trailing LF refuse, and a skipped old format check never authorizes invalid retained history. Existing length constraints remain. Timestamp strings retain their exact hash bytes. UUID uses the full 8-4-4-4-12 hexadecimal grammar. The selected recipe''s frozen verifier applies the same profiles to retained originals; there is no narrower historical format edition.

  Permission/admission and withdrawal fields, and every Boolean boundary receipt/source/acceptance fence, require the exact Boolean type before their value is evaluated; strings, numeric 0/1, null, arrays and objects never grant authority or clear a fence. Historical reads still use current typed permission/withdrawal only, not current admission or cutoffs.

  Before archive selection and post-state validation, every resolved memory''s pinned and archived fields in both input and output must have the exact Boolean type. A malformed flag refuses the whole settlement without state change or output; correctly typed pins and all original versions/EvidenceRefs retain the existing DL-402 preservation rules.'
gui_related: true
gui_classification_reason: Binds unavailable Memory-panel buttons as well as typed maintenance events.
depends_on:
- DL-045
- SP-637
- CV-657
- SP-278
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- Exact family has its own conditional contract; approved DL-446 cutoff; no admission.
- Archive-only, pin/evidence preservation and cutoff refusal pass ATS-316.
validation_surfaces:
- python3 scripts/pm_memory_archive_events.py
risk_class: event_authority_contract
reasoning_tier: high
context_scope: ea_DMEM_card1b_20261104
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: planning_contract
  create_worknodes: false
source_lineage:
- reports/event-authority-20261104/DMEM-card1b-search.json
- DL-402/DL-403 on origin/plans/ea-cards1-answers-20261104 at b6332f391a7870bad5f01a29a7e9d080050dac27
preserved_exact_tokens:
- memory.monthly_summary.started
- cutoffs_unavailable
- RP-OPERATIONAL-2555D@1.0.0
negative_constraints:
- No admission, automatic deletion, user deletion policy expansion, app edition or native proof.
```


### SP-640 — doctor.custom_headless.checked Storage adoption.

```yaml
plan_unit_id: SP-640
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  doctor.custom_headless.checked Storage adoption.
  This exact family adopts Plans/newtools.md#N2-217 in full, including SP-286/CV-339 original receipt/full-value custody and SP-278/DL-076 checkpoint semantics. The only new stored value is projector.checkpoint.ds15.doctor_custom_headless_checked:{project_id} with closed schema Plans/ds15_doctor_custom_headless_checked_checkpoint.schema.json and reader reader.ds15.doctor_custom_headless_checked.v1@1.0.0. No source body is duplicated. retention_policy_ref = PENDING_RETENTION_DECISION for event and checkpoint; do not admit or enable writes/advance. Original log and first receipt retain their existing Storage custody, backup and recovery requirements. This is a newly authored owner contract, never evidence of existing implementation.
  Physical storage profile: derived redb, coordination_and_storage budget group, messagepack_canonical, at most 16384 encoded bytes (SP-339/SP-340); oversize refuses before commit. Budget eviction permits only rebuildable derived data and never deletes canonical sources or assigns retention.
  Round 7 doctor.custom_headless.checked: adopt the exact authenticated retained-reader, per-row original Storage joins and exact authority types in Plans/newtools.md#N2-217. No checkpoint/rebuild bypasses original payload/version, outcome, coherent backup, receipt or current disclosure/withdrawal fences. Historical replay-only originals remain readable; append/retry policy stays writer-only.
gui_related: false
gui_classification_reason: Durable event contract only; existing presentation is consumed.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SP-640
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/storage-plan.md
```


### SP-641 — tool.custom_headless.skipped — withdrawn DS15 draft; DT question reference

```yaml
{
  "plan_unit_id": "SP-641",
  "unit_type": "contract",
  "status": "superseded",
  "owner_doc": "Plans/storage-plan.md",
  "canonical_text": "Historical withdrawal of the unsupported tool.custom_headless.skipped draft. DL-436 (deck-2 item 4.f) now resolves first-absent-check eligibility/reset/import/restore; the newly authored DS15 owner contract is Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-326. DT cites DS15 rather than holding a separate row. This old unit id remains retired and is not reused; it grants no admission.",
  "gui_related": false,
  "gui_classification_reason": "Durable event contract only; existing presentation is consumed.",
  "depends_on": [
    "DL-045"
  ],
  "unblocks": [],
  "acceptance_criteria": [
    "No DS15 draft remains; DT question stays unresolved."
  ],
  "validation_surfaces": [
    "python3 scripts/pm-ds15-event-contracts.py"
  ],
  "risk_class": "event_authority_contract_drift",
  "reasoning_tier": "high",
  "context_scope": "ds15_event_preparation",
  "implementation_surfaces": [
    "Plans/storage-plan.md"
  ],
  "node_compile_hint": {
    "mode": "contract_only",
    "create_worknodes": false,
    "create_nodeseeds": false
  },
  "source_lineage": [
    "Plans/Decision_Log.md#DL-045"
  ],
  "preserved_exact_tokens": [
    "SP-641"
  ],
  "negative_constraints": [
    "No admission, retention decision, native proof, WorkNodes or NodeSeeds."
  ],
  "owner_hints": [
    "Plans/storage-plan.md"
  ]
}
```


### SP-642 — live.session.started Storage adoption.

```yaml
plan_unit_id: SP-642
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  live.session.started Storage adoption.
  This exact family adopts Plans/newtools.md#N2-219 in full, including SP-286/CV-339 original receipt/full-value custody and SP-278/DL-076 checkpoint semantics. The only new stored value is projector.checkpoint.ds15.live_session_started:{project_id} with closed schema Plans/ds15_live_session_started_checkpoint.schema.json and reader reader.ds15.live_session_started.v1@1.0.0. No source body is duplicated. retention_policy_ref = PENDING_RETENTION_DECISION for event and checkpoint; do not admit or enable writes/advance. Original log and first receipt retain their existing Storage custody, backup and recovery requirements. This is a newly authored owner contract, never evidence of existing implementation.
  Physical storage profile: derived redb, coordination_and_storage budget group, messagepack_canonical, at most 16384 encoded bytes (SP-339/SP-340); oversize refuses before commit. Budget eviction permits only rebuildable derived data and never deletes canonical sources or assigns retention.
  Round 7 live.session.started: adopt the exact authenticated retained-reader, per-row original Storage joins and exact authority types in Plans/newtools.md#N2-219. No checkpoint/rebuild bypasses original payload/version, outcome, coherent backup, receipt or current disclosure/withdrawal fences. Historical replay-only originals remain readable; append/retry policy stays writer-only.
gui_related: false
gui_classification_reason: Durable event contract only; existing presentation is consumed.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SP-642
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/storage-plan.md
```


### SP-643 — live.step.updated Storage adoption.

```yaml
plan_unit_id: SP-643
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  live.step.updated Storage adoption.
  This exact family adopts Plans/newtools.md#N2-220 in full, including SP-286/CV-339 original receipt/full-value custody and SP-278/DL-076 checkpoint semantics. The only new stored value is projector.checkpoint.ds15.live_step_updated:{project_id} with closed schema Plans/ds15_live_step_updated_checkpoint.schema.json and reader reader.ds15.live_step_updated.v1@1.0.0. No source body is duplicated. retention_policy_ref = PENDING_RETENTION_DECISION for event and checkpoint; do not admit or enable writes/advance. Original log and first receipt retain their existing Storage custody, backup and recovery requirements. This is a newly authored owner contract, never evidence of existing implementation.
  Physical storage profile: derived redb, coordination_and_storage budget group, messagepack_canonical, at most 16384 encoded bytes (SP-339/SP-340); oversize refuses before commit. Budget eviction permits only rebuildable derived data and never deletes canonical sources or assigns retention.
  Round 7 live.step.updated: adopt the exact authenticated retained-reader, per-row original Storage joins and exact authority types in Plans/newtools.md#N2-220. No checkpoint/rebuild bypasses original payload/version, outcome, coherent backup, receipt or current disclosure/withdrawal fences. Historical replay-only originals remain readable; append/retry policy stays writer-only.
gui_related: false
gui_classification_reason: Durable event contract only; existing presentation is consumed.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SP-643
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/storage-plan.md
```


### SP-644 — live.artifact.created Storage adoption.

```yaml
plan_unit_id: SP-644
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  live.artifact.created Storage adoption.
  This exact family adopts Plans/newtools.md#N2-221 in full, including SP-286/CV-339 original receipt/full-value custody and SP-278/DL-076 checkpoint semantics. The only new stored value is projector.checkpoint.ds15.live_artifact_created:{project_id} with closed schema Plans/ds15_live_artifact_created_checkpoint.schema.json and reader reader.ds15.live_artifact_created.v1@1.0.0. No source body is duplicated. retention_policy_ref = PENDING_RETENTION_DECISION for event and checkpoint; do not admit or enable writes/advance. Original log and first receipt retain their existing Storage custody, backup and recovery requirements. This is a newly authored owner contract, never evidence of existing implementation.
  Physical storage profile: derived redb, coordination_and_storage budget group, messagepack_canonical, at most 16384 encoded bytes (SP-339/SP-340); oversize refuses before commit. Budget eviction permits only rebuildable derived data and never deletes canonical sources or assigns retention.
  Round 7 live.artifact.created: adopt the exact authenticated retained-reader, per-row original Storage joins and exact authority types in Plans/newtools.md#N2-221. No checkpoint/rebuild bypasses original payload/version, outcome, coherent backup, receipt or current disclosure/withdrawal fences. Historical replay-only originals remain readable; append/retry policy stays writer-only.
gui_related: false
gui_classification_reason: Durable event contract only; existing presentation is consumed.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SP-644
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/storage-plan.md
```


### SP-645 — live.session.completed Storage adoption.

```yaml
plan_unit_id: SP-645
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  live.session.completed Storage adoption.
  This exact family adopts Plans/newtools.md#N2-222 in full, including SP-286/CV-339 original receipt/full-value custody and SP-278/DL-076 checkpoint semantics. The only new stored value is projector.checkpoint.ds15.live_session_completed:{project_id} with closed schema Plans/ds15_live_session_completed_checkpoint.schema.json and reader reader.ds15.live_session_completed.v1@1.0.0. No source body is duplicated. retention_policy_ref = PENDING_RETENTION_DECISION for event and checkpoint; do not admit or enable writes/advance. Original log and first receipt retain their existing Storage custody, backup and recovery requirements. This is a newly authored owner contract, never evidence of existing implementation.
  Physical storage profile: derived redb, coordination_and_storage budget group, messagepack_canonical, at most 16384 encoded bytes (SP-339/SP-340); oversize refuses before commit. Budget eviction permits only rebuildable derived data and never deletes canonical sources or assigns retention.
  Round 7 live.session.completed: adopt the exact authenticated retained-reader, per-row original Storage joins and exact authority types in Plans/newtools.md#N2-222. No checkpoint/rebuild bypasses original payload/version, outcome, coherent backup, receipt or current disclosure/withdrawal fences. Historical replay-only originals remain readable; append/retry policy stays writer-only.
gui_related: false
gui_classification_reason: Durable event contract only; existing presentation is consumed.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SP-645
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/storage-plan.md
```


### SP-646 — live.session.degraded Storage adoption.

```yaml
plan_unit_id: SP-646
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  live.session.degraded Storage adoption.
  This exact family adopts Plans/newtools.md#N2-223 in full, including SP-286/CV-339 original receipt/full-value custody and SP-278/DL-076 checkpoint semantics. The only new stored value is projector.checkpoint.ds15.live_session_degraded:{project_id} with closed schema Plans/ds15_live_session_degraded_checkpoint.schema.json and reader reader.ds15.live_session_degraded.v1@1.0.0. No source body is duplicated. retention_policy_ref = PENDING_RETENTION_DECISION for event and checkpoint; do not admit or enable writes/advance. Original log and first receipt retain their existing Storage custody, backup and recovery requirements. This is a newly authored owner contract, never evidence of existing implementation.
  Physical storage profile: derived redb, coordination_and_storage budget group, messagepack_canonical, at most 16384 encoded bytes (SP-339/SP-340); oversize refuses before commit. Budget eviction permits only rebuildable derived data and never deletes canonical sources or assigns retention.
  Round 7 live.session.degraded: adopt the exact authenticated retained-reader, per-row original Storage joins and exact authority types in Plans/newtools.md#N2-223. No checkpoint/rebuild bypasses original payload/version, outcome, coherent backup, receipt or current disclosure/withdrawal fences. Historical replay-only originals remain readable; append/retry policy stays writer-only.
gui_related: false
gui_classification_reason: Durable event contract only; existing presentation is consumed.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SP-646
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/storage-plan.md
```


### SP-647 — browser.context_captured Storage binding

```yaml
plan_unit_id: SP-647
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  browser.context_captured independently adopts Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-310 in full, SP-286/CV-339 full-value v2 and SP-278/DL-076. Own checkpoint projector.checkpoint.ds15.browser_context_captured:{scope_key} uses Plans/ds15_browser_context_captured_checkpoint.schema.json and exact reader reader.ds15.browser_context_captured.v1@1.0.0. Physical profile: derived redb, coordination_and_storage, messagepack_canonical, maximum 16384 bytes under SP-339/SP-340. Oversize refuses; no canonical budget-based deletion. Event/checkpoint retention PENDING_RETENTION_DECISION; RT owns assignment. Original custody/recovery follows its actual source owner. Chip value binding: Plans/ds15_browser_capture_chip_v2.schema.json governs the typed browser entry inside composer_prep_state.v1:{thread_id}. No browser-owned composer or separate chip storage family. Migration validates actual thread/namespace and preserves sibling entries and draft bytes; unresolved legacy chip stays visibly unavailable, never silently reassigned. Append/passive replay cannot recreate a chip that the user sent or removed. Read/serialization rechecks current permissions, source deletion and chip blocked/expired/scrubbed/revoked state; unavailable chips may remain visible but never serialize as successful attachments.
  Application identity follows CV-366 exactly: application@1:{hex(server_id)}:{hex(owner_operation_id)}, using UTF-8 lowercase hex of OriginalBrowserTransitionSource.server_id and immutable original_operation_id through owner.browser.transition.application@1.0.0. Preserve original source/thread/chip/ordinary user/Computer/profile/BrowserSession joins and SP-286 full-value custody. Wrong or absent original identity and a raw tuple/scope hash refuse. The Project MessagePack recipe remains unchanged; scope_key is a checkpoint namespace only. Append recovery rejects projector_replay_only as replay_only_not_appendable; publication rechecks current permission/source/access while retained receipt resolution remains independent of retired controls.
  Round 7 browser.context_captured: adopt the exact authenticated retained-reader, per-row original Storage joins and exact authority types in Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-310. No checkpoint/rebuild bypasses original payload/version, outcome, coherent backup, receipt or current disclosure/withdrawal fences. Historical replay-only originals remain readable; append/retry policy stays writer-only.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SP-647
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/storage-plan.md
```


### SP-648 — dev.session.started Storage binding

```yaml
plan_unit_id: SP-648
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  dev.session.started independently adopts Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-311 in full, SP-286/CV-339 full-value v2 and SP-278/DL-076. Own checkpoint projector.checkpoint.ds15.dev_session_started:{project_id} uses Plans/ds15_dev_session_started_checkpoint.schema.json and exact reader reader.ds15.dev_session_started.v1@1.0.0. Physical profile: derived redb, coordination_and_storage, messagepack_canonical, maximum 16384 bytes under SP-339/SP-340. Oversize refuses; no canonical budget-based deletion. Event/checkpoint retention PENDING_RETENTION_DECISION; RT owns assignment. Original custody/recovery follows its actual source owner. Value binding: SP-655/CV-675 and Plans/ds15_dev_session_record_v2.schema.json version the existing dev_session_record.v1 key; workflow and subordinate DAP state are distinct, with explicit legacy DAP-only migration. Stop/restart never rewrites terminal history. DAP transitions require their own verified DebugSessionBroker outcome, not a workflow-state alias.
  Round 7 dev.session.started: adopt the exact authenticated retained-reader, per-row original Storage joins and exact authority types in Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-311. No checkpoint/rebuild bypasses original payload/version, outcome, coherent backup, receipt or current disclosure/withdrawal fences. Historical replay-only originals remain readable; append/retry policy stays writer-only.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SP-648
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/storage-plan.md
```


### SP-649 — dev.session.stopping Storage binding

```yaml
plan_unit_id: SP-649
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  dev.session.stopping independently adopts Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-312 in full, SP-286/CV-339 full-value v2 and SP-278/DL-076. Own checkpoint projector.checkpoint.ds15.dev_session_stopping:{project_id} uses Plans/ds15_dev_session_stopping_checkpoint.schema.json and exact reader reader.ds15.dev_session_stopping.v1@1.0.0. Physical profile: derived redb, coordination_and_storage, messagepack_canonical, maximum 16384 bytes under SP-339/SP-340. Oversize refuses; no canonical budget-based deletion. Event/checkpoint retention PENDING_RETENTION_DECISION; RT owns assignment. Original custody/recovery follows its actual source owner. Value binding: SP-655/CV-675 and Plans/ds15_dev_session_record_v2.schema.json version the existing dev_session_record.v1 key; workflow and subordinate DAP state are distinct, with explicit legacy DAP-only migration. Stop/restart never rewrites terminal history. DAP transitions require their own verified DebugSessionBroker outcome, not a workflow-state alias.
  Round 7 dev.session.stopping: adopt the exact authenticated retained-reader, per-row original Storage joins and exact authority types in Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-312. No checkpoint/rebuild bypasses original payload/version, outcome, coherent backup, receipt or current disclosure/withdrawal fences. Historical replay-only originals remain readable; append/retry policy stays writer-only.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SP-649
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/storage-plan.md
```


### SP-650 — dev.session.stopped Storage binding

```yaml
plan_unit_id: SP-650
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  dev.session.stopped independently adopts Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-313 in full, SP-286/CV-339 full-value v2 and SP-278/DL-076. Own checkpoint projector.checkpoint.ds15.dev_session_stopped:{project_id} uses Plans/ds15_dev_session_stopped_checkpoint.schema.json and exact reader reader.ds15.dev_session_stopped.v1@1.0.0. Physical profile: derived redb, coordination_and_storage, messagepack_canonical, maximum 16384 bytes under SP-339/SP-340. Oversize refuses; no canonical budget-based deletion. Event/checkpoint retention PENDING_RETENTION_DECISION; RT owns assignment. Original custody/recovery follows its actual source owner. Value binding: SP-655/CV-675 and Plans/ds15_dev_session_record_v2.schema.json version the existing dev_session_record.v1 key; workflow and subordinate DAP state are distinct, with explicit legacy DAP-only migration. Stop/restart never rewrites terminal history. DAP transitions require their own verified DebugSessionBroker outcome, not a workflow-state alias.
  Round 7 dev.session.stopped: adopt the exact authenticated retained-reader, per-row original Storage joins and exact authority types in Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-313. No checkpoint/rebuild bypasses original payload/version, outcome, coherent backup, receipt or current disclosure/withdrawal fences. Historical replay-only originals remain readable; append/retry policy stays writer-only.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SP-650
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/storage-plan.md
```


### SP-651 — dev.session.restarting Storage binding

```yaml
plan_unit_id: SP-651
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  dev.session.restarting independently adopts Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-314 in full, SP-286/CV-339 full-value v2 and SP-278/DL-076. Own checkpoint projector.checkpoint.ds15.dev_session_restarting:{project_id} uses Plans/ds15_dev_session_restarting_checkpoint.schema.json and exact reader reader.ds15.dev_session_restarting.v1@1.0.0. Physical profile: derived redb, coordination_and_storage, messagepack_canonical, maximum 16384 bytes under SP-339/SP-340. Oversize refuses; no canonical budget-based deletion. Event/checkpoint retention PENDING_RETENTION_DECISION; RT owns assignment. Original custody/recovery follows its actual source owner. Value binding: SP-655/CV-675 and Plans/ds15_dev_session_record_v2.schema.json version the existing dev_session_record.v1 key; workflow and subordinate DAP state are distinct, with explicit legacy DAP-only migration. Stop/restart never rewrites terminal history. DAP transitions require their own verified DebugSessionBroker outcome, not a workflow-state alias.
  Round 7 dev.session.restarting: adopt the exact authenticated retained-reader, per-row original Storage joins and exact authority types in Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-314. No checkpoint/rebuild bypasses original payload/version, outcome, coherent backup, receipt or current disclosure/withdrawal fences. Historical replay-only originals remain readable; append/retry policy stays writer-only.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SP-651
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/storage-plan.md
```


### SP-652 — preview.session.started Storage binding

```yaml
plan_unit_id: SP-652
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  preview.session.started independently adopts Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-315 in full, SP-286/CV-339 full-value v2 and SP-278/DL-076. Own checkpoint projector.checkpoint.ds15.preview_session_started:{project_id} uses Plans/ds15_preview_session_started_checkpoint.schema.json and exact reader reader.ds15.preview_session_started.v1@1.0.0. Physical profile: derived redb, coordination_and_storage, messagepack_canonical, maximum 16384 bytes under SP-339/SP-340. Oversize refuses; no canonical budget-based deletion. Event/checkpoint retention PENDING_RETENTION_DECISION; RT owns assignment. Original custody/recovery follows its actual source owner. Value binding: SP-656/CV-676 and Plans/ds15_preview_state_v2.schema.json bind subject-keyed UI/restore state separately from live preview_session_id and optional browser_session_id. No cached running value is liveness proof. Legacy preview_id mapping requires owner-verified subject identity and keeps historical runtime state; ambiguous identity refuses migration. Restore intent is reconstructed through existing owner policy; it grants no automation resume or browser launch authority.
  Round 7 preview.session.started: adopt the exact authenticated retained-reader, per-row original Storage joins and exact authority types in Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-315. No checkpoint/rebuild bypasses original payload/version, outcome, coherent backup, receipt or current disclosure/withdrawal fences. Historical replay-only originals remain readable; append/retry policy stays writer-only.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SP-652
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/storage-plan.md
```


### SP-653 — preview.session.refreshed Storage binding

```yaml
plan_unit_id: SP-653
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  preview.session.refreshed independently adopts Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-316 in full, SP-286/CV-339 full-value v2 and SP-278/DL-076. Own checkpoint projector.checkpoint.ds15.preview_session_refreshed:{project_id} uses Plans/ds15_preview_session_refreshed_checkpoint.schema.json and exact reader reader.ds15.preview_session_refreshed.v1@1.0.0. Physical profile: derived redb, coordination_and_storage, messagepack_canonical, maximum 16384 bytes under SP-339/SP-340. Oversize refuses; no canonical budget-based deletion. Event/checkpoint retention PENDING_RETENTION_DECISION; RT owns assignment. Original custody/recovery follows its actual source owner. Value binding: SP-656/CV-676 and Plans/ds15_preview_state_v2.schema.json bind subject-keyed UI/restore state separately from live preview_session_id and optional browser_session_id. No cached running value is liveness proof. Legacy preview_id mapping requires owner-verified subject identity and keeps historical runtime state; ambiguous identity refuses migration. Restore intent is reconstructed through existing owner policy; it grants no automation resume or browser launch authority.
  Round 7 preview.session.refreshed: adopt the exact authenticated retained-reader, per-row original Storage joins and exact authority types in Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-316. No checkpoint/rebuild bypasses original payload/version, outcome, coherent backup, receipt or current disclosure/withdrawal fences. Historical replay-only originals remain readable; append/retry policy stays writer-only.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SP-653
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/storage-plan.md
```


### SP-654 — preview.session.stopped Storage binding

```yaml
plan_unit_id: SP-654
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  preview.session.stopped independently adopts Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-317 in full, SP-286/CV-339 full-value v2 and SP-278/DL-076. Own checkpoint projector.checkpoint.ds15.preview_session_stopped:{project_id} uses Plans/ds15_preview_session_stopped_checkpoint.schema.json and exact reader reader.ds15.preview_session_stopped.v1@1.0.0. Physical profile: derived redb, coordination_and_storage, messagepack_canonical, maximum 16384 bytes under SP-339/SP-340. Oversize refuses; no canonical budget-based deletion. Event/checkpoint retention PENDING_RETENTION_DECISION; RT owns assignment. Original custody/recovery follows its actual source owner. Value binding: SP-656/CV-676 and Plans/ds15_preview_state_v2.schema.json bind subject-keyed UI/restore state separately from live preview_session_id and optional browser_session_id. No cached running value is liveness proof. Legacy preview_id mapping requires owner-verified subject identity and keeps historical runtime state; ambiguous identity refuses migration. Restore intent is reconstructed through existing owner policy; it grants no automation resume or browser launch authority.
  Round 7 preview.session.stopped: adopt the exact authenticated retained-reader, per-row original Storage joins and exact authority types in Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-317. No checkpoint/rebuild bypasses original payload/version, outcome, coherent backup, receipt or current disclosure/withdrawal fences. Historical replay-only originals remain readable; append/retry policy stays writer-only.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SP-654
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/storage-plan.md
```


### SP-655 — Developer workflow and subordinate DAP value v2

```yaml
plan_unit_id: SP-655
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  dev_session_record.v1 versioned aggregate value binding (newly authored technical closure, DL-045). Section15 owns the developer workflow (209,244-247,9433); Shared Runtime 10.1 owns subordinate DebugSessionBroker mechanics. The physical key remains dev_session_record.v1:{project_id}:{dev_session_id}, value version 2.0.0, schema pm.storage_value.dev_session_record.v2 at Plans/ds15_dev_session_record_v2.schema.json#/$defs/dev_session_record. No parallel root identity or fabricated DAP id. workflow carries its state/revision/operation/outcome and actual optional run/thread/workspace/terminal links; dap is null for non-debug work, else the unchanged complete DAP v1 value with its independent generation/state/waiter evidence. Outer and nested project_id/dev_session_id and DAP topology.project_id must agree. Workflow state is never used as DAP state or PTY liveness. A DAP state change needs its own verified DebugSessionBroker outcome and existing waiter/trigger checks; workflow stop alone authorizes none.
  Migration: keep the original exact closed shared_runtime_contracts.schema.json DAP v1 codec for read-only import. Validate its schema AND existing pm-shared-runtime-contracts.py semantic rules first; copy every DAP field byte-equivalently to dap under the same outer root ids, set workflow=null when no verified workflow source exists, and never infer workflow state from DAP state. A verified legacy Section15 workflow source may populate workflow without DAP; validate exact links/outcome. Ambiguous root joins or missing original outcome refuse. StorageMigrationCoordinator makes a backed-up transaction, verifies canonical MessagePack codec roundtrip and full-value SP-286 outcome/first-receipt custody, then writes the schema/store version last. No lazy rewrite. Original per-transition outcomes remain immutable in adopted SP-286/CV-339 full-value v2 custody; the mutable latest workflow row cannot substitute for an earlier outcome on retry.
  Recovery: this existing canonical_non_rebuildable family retains mandatory backup and disclosure on absent/corrupt bytes; do not rebuild from events or infer live PTY/DAP state. After restart verify runtime owners before any mutation. Writer/reader withdrawal follows each event contract. SP-339/SP-340 existing canonical projects_and_sources profile and 16384-byte encoded ceiling remain. Retention for the expanded v2 workflow/DAP combination is PENDING_RETENTION_DECISION for RT; existing DAP-only v1 remains RP-DEBUG-30D under its unchanged scope, never extended to workflow by inference. No retention/deletion ruling. Static codec/schema/migration vectors in Plans/ds15_value_contract_fixtures.json run through scripts/pm-ds15-event-contracts.py; native execution NOT_RUN.
gui_related: false
gui_classification_reason: Durable event/runtime contract.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SP-655
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/storage-plan.md
```


### SP-656 — Preview subject UI and runtime identity mapping

```yaml
plan_unit_id: SP-656
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  preview_state subject/UI v2 technical binding (DL-045). FinalGUISpec:3584 and rewrite-tie-in-memo:231-302 establish subject-owned UI restore intent distinct from runtime PreviewSession and BrowserSession. Canonical write key preview_state.v1:{project_id}:{preview_subject_id}; a legacy preview_id key is read-only input, never a second subject identity. Plans/ds15_preview_state_v2.schema.json closes value version 2.0.0 with actual subject/source ref, restore intent, attachment target, export-prefs ref, scroll sync, last error and historical runtime/revision refs. runtime_verification is always unverified in persisted UI state. Runtime state created/loading/ready/stale/degraded/error/closed belongs to the actual live PreviewSession, not this UI cache. Opening/revealing preserves runtime identity when the existing subject/source_revision/surface-kind/transport tuple is unchanged; source changes use owner-resolved identity, never a guessed old live session. Optional BrowserSession overlay stays independent. No DOM/browser-storage/live instance serialization or automatic automation resume.
  Migration: old preview_state.v1:{project_id}:{preview_id} with legacy starting/running/stopped/error is accepted only with an owner-verified exact mapping of legacy preview_id/source_file to preview_subject_id/source ref, and authoritative saved intent/attachment/export/scroll/error state. Never equate preview_id with preview_session_id. Missing or multiple mappings are unavailable; do not guess a subject, invent UI preferences or a live session. Preserve legacy status for diagnostics, set runtime_verification=unverified and last_preview_session_id=null when no verified historical identity exists. Explicit StorageMigrationCoordinator backup/copy-forward/codec verification writes the new key/version last and records the old key read-only; fail closed on ambiguous migration. Preserve all existing UI preferences and owned refs. Restore uses subject intent and creates a new live runtime as needed through existing commands, never deserializes old running.
  The materialized ds15_preview_subject_ui_state family is canonical UI intent with mandatory backup, bounded to SP-339/SP-340 16384 encoded bytes in canonical redb settings_and_layout; original transition outcomes are held by SP-286/CV-339 full-value v2, not reconstructed from latest UI state. Grouped deferred inventory is lineage only and excludes this now-materialized key. No retention/deletion policy is selected: its new exact policy is PENDING_RETENTION_DECISION for RT. Existing refresh/hot-reload actions bind independently in SMPFS-316; ordinary browser reload uses UCC-117, non-browser refresh never dispatches browser commands. Versioned schema/migration plus runtime/subject mismatch oracles run via scripts/pm-ds15-event-contracts.py; native execution NOT_RUN.
gui_related: true
gui_classification_reason: Pending composer or preview UI state.
depends_on:
- DL-045
unblocks: []
acceptance_criteria:
- Exact family closure is checked by scripts/pm-ds15-event-contracts.py; production admission remains absent.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SP-656
negative_constraints:
- No admission, retention decision, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/storage-plan.md
```


### SP-657 — catalog.install.started Storage contract

```yaml
plan_unit_id: SP-657
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: catalog.install.started@1.0.0 independently adopts Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-318,
  SP-286/CV-339 ordinary SeglogFrameV2 append and SP-278 complete-source checkpoint/CAS. Producer is catalog lifecycle controller
  over the existing item subsystem install outcome, never queue acceptance. Exact original source/outcome/event/first receipt
  and full-value commitment survive retry/recovery/backup; every read/checkpoint/rebuild checks original custody and current
  disclosure/withdrawal. Consumer reader.ds15.catalog_install_started.v1@1.0.0; checkpoint key projector.checkpoint.ds15.catalog_install_started:{scope_key};
  exact value Plans/ds15_catalog_install_started_checkpoint.schema.json. Current append rejects replay-only; authenticated
  supported retained replay-only history is valid. Caller Storage metadata is excluded from retry equality; original metadata
  must join selected global index. SP-337 16 KiB body/value ceilings, nine-field token, no persisted snapshot. Event and checkpoint
  retention_policy_ref=PENDING_RETENTION_DECISION, no expiry/deletion decision. Compatibility, withdrawal/reinstall and all
  field joins are independently governed by Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-318. Newly authored technical
  binding; native NOT_RUN; no admission.
gui_related: false
gui_classification_reason: Event identity, original outcome custody and reader contracts.
depends_on:
- SMPFS-318
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Exact family positive and negative static oracles pass; no production admission or native proof.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SP-657
negative_constraints:
- No admission, retention/deletion decision, update/remove policy, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/storage-plan.md
```


### SP-658 — catalog.install.completed Storage contract

```yaml
plan_unit_id: SP-658
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: catalog.install.completed@1.0.0 independently adopts Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-319,
  SP-286/CV-339 ordinary SeglogFrameV2 append and SP-278 complete-source checkpoint/CAS. Producer is catalog lifecycle controller
  over the existing item subsystem install outcome, never queue acceptance. Exact original source/outcome/event/first receipt
  and full-value commitment survive retry/recovery/backup; every read/checkpoint/rebuild checks original custody and current
  disclosure/withdrawal. Consumer reader.ds15.catalog_install_completed.v1@1.0.0; checkpoint key projector.checkpoint.ds15.catalog_install_completed:{scope_key};
  exact value Plans/ds15_catalog_install_completed_checkpoint.schema.json. Current append rejects replay-only; authenticated
  supported retained replay-only history is valid. Caller Storage metadata is excluded from retry equality; original metadata
  must join selected global index. SP-337 16 KiB body/value ceilings, nine-field token, no persisted snapshot. Event and checkpoint
  retention_policy_ref=PENDING_RETENTION_DECISION, no expiry/deletion decision. Compatibility, withdrawal/reinstall and all
  field joins are independently governed by Plans/Section15_MVP_Promoted_Features_Spec.md#SMPFS-319. Newly authored technical
  binding; native NOT_RUN; no admission.
gui_related: false
gui_classification_reason: Event identity, original outcome custody and reader contracts.
depends_on:
- SMPFS-319
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Exact family positive and negative static oracles pass; no production admission or native proof.
validation_surfaces:
- python3 scripts/pm-ds15-event-contracts.py
risk_class: event_authority_contract_drift
reasoning_tier: high
context_scope: ds15_event_preparation
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
preserved_exact_tokens:
- SP-658
negative_constraints:
- No admission, retention/deletion decision, update/remove policy, native proof, WorkNodes or NodeSeeds.
owner_hints:
- Plans/storage-plan.md
```

### SP-660 - alert.acknowledged original custody and history

```yaml
plan_unit_id: SP-660
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Newly authored technical custody binding: original_command is the complete closed normalized accepted command context with every candidate payload field except schema_id, schema_version and result_* fields. It retains the original subject/source reference, actor, prior revision/state, currentness, options, correlation, idempotency key and original ts; optional fields retain original presence. This private snapshot does not expand the public command signature. request_digest is lowercase SHA-256 of canonical MessagePack {original_command: operation.original_command, candidate_payload: operation.payload}; every field and optional presence participates, with no Storage-assigned metadata. Both owner snapshots join Project, subject, immutable source, revision and lifecycle state to the frozen command/payload; unchanged fields agree with the prior snapshot and only the specified action effects differ. No supplied digest or snapshot copy grants authority. Newly authored owner contract for alert.acknowledged 1.0.0 under DL-045; prepared without admission.\
  \ Only cmd.alert.acknowledge, handled by handlers::alert::acknowledge, produces this exact family. Existing closed\
  \ payload is Plans/event_payloads/attention/alert_acknowledged.schema.json (pm.attention_event.alert_acknowledged.schema.v1);\
  \ no sibling admission. Semantic owner is F3-700, payload route CV-680, storage route SP-660. Transition: unacknowledged\
  \ or snoozed -> acknowledged; clear unread only; never resolve the underlying condition. Current owner must prove\
  \ the action is allowed, including permission, current subject revision and currentness_basis_ref. Mute/snooze\
  \ cannot suppress blocking confirmations or security-sensitive failures; dismissal cannot clear a blocker. A refusal,\
  \ stale result, no change, rollback or failed persistence produces no event.\n\nIdentity is Project-scoped EventRecord\
  \ v2, scope_partition project~base64url_no_pad(UTF8(project_id)); envelope project_id equals payload project_id,\
  \ actor_ref/correlation_id/idempotency_key/occurred_at_utc equal the payload fields (ts for occurrence); thread/run/node/attempt\
  \ and parent/causation refs are null unless an authentic caller supplies the corresponding original linkage, never\
  \ ambient defaults. Let H be lowercase SHA-256 of canonical MessagePack of the array [storage_instance_id, project_id,\
  \ \"alert.acknowledged\", idempotency_key]. event_id is evt_alert_acknowledged_ followed by H; operation_digest\
  \ is H. The idempotency key is the original accepted command key, not reminted on recovery. Request digest covers\
  \ the full admitted command, subject alert_id, actor, current revision and exact candidate payload. Same key with\
  \ unequal digest fails conflict before effects. The command's original revision and subject ref must equal the\
  \ independently read owner record, and result_revision equals prior_revision + 1. Server-side secret screening\
  \ rejects secret-bearing strings even if the lexical schema accepts them.\n\nOrdering: under the original Project\
  \ permission/currentness/owner mutation fence, validate exact registry membership FIRST; currently absent means\
  \ deny before journal/body/effect/checkpoint. On future admission, freeze original payload and identity in alert_acknowledged_operation.v1:{project_id}:{operation_digest}\
  \ before mutation. State prepared has all four result/commit/receipt refs null. CAS the exact subject revision\
  \ and commit its candidate owner state together with the committed operation in one owner-coordinated transaction;\
  \ committed has original owner_commit_ref, result_ref and dispatch_receipt_ref, with original_append_result_ref\
  \ null. If that atomic boundary cannot be established, the action remains unavailable. The shared alert store\
  \ stays F3-453's one store, with no per-surface copy. Append only after authenticated owner commit/readback. Explicitly\
  \ adopt SP-286/CV-339 storage.first_append_receipt.resolve.v2 including its full-value v2 successor, genuine original\
  \ eleven-field first AppendReceipt, retained four-field original_append_result and actual original EventRecord.\
  \ Exact identity, semantic payload, Storage instance, sequence, segment/offset and durability must all join independently.\
  \ Only then set settled with all four refs nonnull and publish terminal success. An uncertain append fences later\
  \ writes to that subject; recovery resolves the ORIGINAL identity, never reruns the command or fabricates a receipt.\
  \ Prepared with no commit may abandon only after original absence proof; ambiguous state fences. Committed retries\
  \ recover append with frozen semantics; settled retries return original result/receipt. No wall clock renewal.\n\
  \nOriginal operation custody is canonical and non-rebuildable; its schema is Plans/alert_event_contracts/alert_acknowledged_operation.schema.json.\
  \ The owner commit ref resolves original shared alert state, never a current replacement with the same revision.\
  \ Backup/restore must include coherent original operation, shared alert/rule state, Storage source and first/full-value\
  \ receipt custody and source/deletion dependencies under one verified recovery boundary. Missing/mixed instances\
  \ or missing original evidence fence mutation and disclose unavailable. History cannot recreate deleted source\
  \ bodies. Reads authenticate current Project membership, source access and deletion tombstones at disclosure,\
  \ including after every returning helper; IDs/hashes/refs confer no access. No raw alert text, private rationale\
  \ or source content is copied into the event or custody.\n\nNewly authored projector.alert_acknowledged.history@1.0.0\
  \ and reader.alert_acknowledged.history@1.0.0 expose this family's passive History audit refs; GUI inbox state\
  \ is independently read from F3-453, never inferred as mutation authority from History. Checkpoint key alert_acknowledged_checkpoint.v1:{project_id}:{storage_instance_id},\
  \ schema Plans/alert_event_contracts/alert_acknowledged_checkpoint.schema.json. Explicitly adopt SP-278 and DL-076:\
  \ CURRENT-selected complete generic EventRecord index, whole nine-field durable index_read_token (no persisted\
  \ redb_snapshot_id); live snapshot id is rejoined and authenticated on each scan/read/advance. Scan every source\
  \ sequence through the captured frontier, filter exact Project and alert.acknowledged, validate each matching\
  \ EventRecord/payload and atomically CAS the whole prior checkpoint to the verified frontier in ONE derived-redb\
  \ transaction. The checkpoint stores only this constant-count token/frontier/last-match value, never an event_refs\
  \ array, page list or retained-history manifest. through_sequence_id is the complete scanned frontier, not merely\
  \ the last match; last_event_id is the final matching event id or null for no matches. Never skip corrupt/unknown\
  \ source or advance past an inadmissible event. Reader requires current publication/state, exact scope/instance\
  \ and adequate verified frontier or returns unavailable, never empty success. No checkpoint may advance while\
  \ this family is absent. Lost ack/replay never dispatches an owner command. Rebuild stages a separate publication\
  \ from retained CURRENT-selected source, verifies complete coverage, then atomically withdraws old and publishes\
  \ new; pruning, source-generation or schema change requires rebuild rather than zeroing a live cursor. Legal source\
  \ deletion rebuilds only retained refs, never resurrects deleted content.\n\nCompatibility/withdrawal: only payload\
  \ 1.0.0 and the explicit value schema versions are readable; unknown versions fence without coercion. No historical\
  \ write is claimed. StorageMigrationCoordinator must install these exact value schemas before activation; no invented\
  \ store version. Withdrawal first closes writer admission and fences subject mutations, settles every original\
  \ in-flight obligation under its original evidence, then marks this checkpoint withdrawn under whole-value CAS.\
  \ Readers refuse withdrawn/staged publications; a future version requires its own contract/admission and verified\
  \ rebuild, not an alias or in-place event rewrite. Source custody remains subject to holds and its own lifetime.\n\
  \nretention_policy_ref: PENDING_RETENTION_DECISION for this event, its operation and its History checkpoint. Case\
  \ L-3 (SP-026 retention section) offers audit-authority/receipt RP-AUTHORITY-INDEFINITE versus ordinary telemetry\
  \ ordinary telemetry class (policy identifier not assigned here) for event history; RP-PROJECTION-3GEN is a checkpoint\
  \ candidate only. No existing text names alert.acknowledged in a decided class. RT must decide/confirm exact assignment\
  \ and dependent body deletion; do not choose by prefix or expire anything pending that decision. Native execution\
  \ NOT_RUN. Static validation: python3 scripts/pm-alert-event-contracts-check.py.\n Original shared state for this\
  \ family is shared_alert_state.v1:{project_id}:{alert_id}, closed schema Plans/alert_event_contracts/shared_alert_state.schema.json.\
  \ This is a newly authored technical representation of F3-453 existing behavior, reused by each exact handler,\
  \ not another UI store. prior_owner_state and candidate_owner_state are complete frozen original bytes in this\
  \ family operation; exact key/Project/subject/source identity must agree with payload and both snapshots. Candidate\
  \ revision is prior + 1; source_record_ref is unchanged. CAS compares the full prior value, not revision alone,\
  \ and atomically writes candidate plus committed operation before append. No prepared operation may authorize\
  \ mutation without exact family admission. Acknowledge clears unread and preserves presentation/source truth;\
  \ dismiss clears inbox_visible only and preserves source truth; snooze sets original snooze_until and hides until\
  \ the deadline without deleting; mute changes only exact rule state/deadline. Fields unrelated to the exact action\
  \ remain byte-equal. Expiry/read projection is the existing owner behavior and creates no fabricated action event.\
  \ Original immutable owner_commit_ref resolves the operation candidate snapshot even after later revisions. Shared\
  \ state backup is canonical and mandatory; its retention remains PENDING_RETENTION_DECISION independently of the\
  \ source record.\n\nBounded History read-through (newly authored technical binding): reader.alert_acknowledged.history@1.0.0\
  \ reads the exact published checkpoint and its nine-field durable token through SP-278 reader.storage.event_record_index.\
  \ Request carries publication_id, the entire durable token and after_sequence_id (0 initially; unsigned 64-bit).\
  \ These are untrusted resumable read inputs, never new persisted state. Authenticate the original token and join\
  \ its Storage instance to both checkpoint and source_selection; rejoin the actual live redb snapshot on every\
  \ call. Source generation/selection must still validate under SP-278; do not silently substitute a fresh token\
  \ into an old continuation. Changed source needs SP-278 verified translation or a new verified publication and\
  \ a restarted traversal, otherwise unavailable. Scan in canonical sequence order only through the checkpoint's\
  \ through_sequence_id, at most 256 source sequences per response; return at most 64 authenticated exact-family/Project\
  \ event refs and at most 16384 canonical MessagePack response bytes. Stop before the first ref that would exceed\
  \ either response bound. An individual ref or token that cannot fit is invalid source/metadata, never silently\
  \ dropped. A continuation repeats publication_id and the complete token and advances after_sequence_id to the\
  \ last actually examined source sequence; it must not advance past an unreturned match. Empty filtered pages carry\
  \ continuation until complete=true at the frontier. Complete=true with zero matches is empty History only after\
  \ full verified coverage, never because a scan budget expired. Reader holds/revalidates publication, original\
  \ source access, deletion and withdrawal at disclosure; invalid/withdrawn publication or a cursor beyond frontier\
  \ returns unavailable. No History read dispatches an action or changes the checkpoint. Rebuild/withdrawal fences\
  \ apply equally to every continuation. This bounds a read, not retention: all retained History remains reachable\
  \ through repeated calls.\n\nSP-340 physical binding: alert_acknowledged_operation is canonical MessagePack in\
  \ the canonical redb file, coordination_and_storage group (advisory canonical budget); alert_acknowledged_checkpoint\
  \ is canonical MessagePack in the derived redb file, event_log group (hard derived budget with eviction/rebuild).\
  \ Each value is at most 16384 encoded bytes, measured before CAS. F3-453 shared_alert_state/shared_alert_rule_state\
  \ use canonical MessagePack in canonical redb, settings_and_layout group, same maximum. Their original snapshots\
  \ remain in this family's canonical operation. Budget pressure never refuses canonical history or prunes it; derived\
  \ eviction makes History unavailable until verified rebuild. Metadata/ref values exceeding the physical maximum\
  \ are invalid and cannot commit; no accumulating history/body is placed in them. No duration, history-count cap\
  \ or retention assignment is added. Size-boundary and 1000-match read-through oracles are in this family's fixture.\
  \ The unadmitted earlier draft's event_refs checkpoint is not a current schema; if encountered as an installation\
  \ input it requires a governed rebuild, never truncation or in-place relabeling.\n\nCurrent append and original retry select replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and must fail replay_only_not_appendable before any canonical write or effect. EventRecord inline bodies at most 16 KiB; above that use the SP-337 BLAKE3/size/media-type payload_ref, never base64 body stuffing. This does not relax the 16384-byte closed operation/checkpoint maximum: oversized metadata is refused before effects. Identifier patterns require full-string matching, including rejection of a trailing LF; no trimming or normalization. History response is exactly the closed object {publication_id, index_read_token, after_sequence_id, event_refs, complete}; index_read_token is the full nine-field durable token. Measure canonical MessagePack of that entire object for every candidate response, including an empty completion/continuation. Metadata or one matching ref that cannot individually fit returns unavailable without advancing past the match. Static large-valid-token, exact-response-boundary, unpageable-metadata and replay-only negatives do not replace native authorization/byte/CAS proofs. Numbers follow CV-1100 and SP-1100 beside the SP-278, SP-286 and CV-339 profile owners: each schema integer slot admits current_integer within its own bounds with no lane-wide cap, Storage sequences are uint64, and the producer route is qualified JCS; a retained original keeps its write-time recipe, whose authenticated selection is SP-1101. Every retained read and retained retry first resolves its original through the SP-1101 RetainedDispatcher: the sealed Storage custody at the original event_ref, the exact sealed binding and an installed frozen recipe tuple that pins the exact schema bytes of the edition and selects its payload validator; the frozen verifier recomputes the value commitment, family and event identity of the original. An original without custody, with unsealed bytes, a foreign binding or an uninstalled or foreign recipe refuses as unavailable or unsupported, with no fallback, caller selection or current-then-legacy probing. Timestamps follow CV-1101 with the owner profile of each field (CV-253 storage_utc_z for the two Storage-assigned EventRecord instants it binds)."
gui_related: false
gui_classification_reason: Storage/event contract, no new UI.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- alert.acknowledged is denied until its own admission; exact identity, custody, recovery and negative paths are
  checked.
- Retention remains PENDING_RETENTION_DECISION; native execution NOT_RUN.
validation_surfaces:
- python3 scripts/pm-alert-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: alert_acknowledged
implementation_surfaces:
- Plans/event_payloads/attention/alert_acknowledged.schema.json
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/FinalGUISpec.md#F3-453
preserved_exact_tokens:
- alert.acknowledged
- PENDING_RETENTION_DECISION
negative_constraints:
- No append, native activation, checkpoint advance or admission from this preparation.
```

### SP-661 - alert.dismissed original custody and history

```yaml
plan_unit_id: SP-661
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Newly authored technical custody binding: original_command is the complete closed normalized accepted command context with every candidate payload field except schema_id, schema_version and result_* fields. It retains the original subject/source reference, actor, prior revision/state, currentness, options, correlation, idempotency key and original ts; optional fields retain original presence. This private snapshot does not expand the public command signature. request_digest is lowercase SHA-256 of canonical MessagePack {original_command: operation.original_command, candidate_payload: operation.payload}; every field and optional presence participates, with no Storage-assigned metadata. Both owner snapshots join Project, subject, immutable source, revision and lifecycle state to the frozen command/payload; unchanged fields agree with the prior snapshot and only the specified action effects differ. No supplied digest or snapshot copy grants authority. Newly authored owner contract for alert.dismissed 1.0.0 under DL-045; prepared without admission.\
  \ Only cmd.alert.dismiss, handled by handlers::alert::dismiss, produces this exact family. Existing closed payload\
  \ is Plans/event_payloads/attention/alert_dismissed.schema.json (pm.attention_event.alert_dismissed.schema.v1);\
  \ no sibling admission. Semantic owner is F3-701, payload route CV-681, storage route SP-661. Transition: unacknowledged,\
  \ acknowledged or snoozed -> dismissed; rationale required; remove inbox presentation only; no approval, denial,\
  \ resolution or source deletion. Current owner must prove the action is allowed, including permission, current\
  \ subject revision and currentness_basis_ref. Mute/snooze cannot suppress blocking confirmations or security-sensitive\
  \ failures; dismissal cannot clear a blocker. A refusal, stale result, no change, rollback or failed persistence\
  \ produces no event.\n\nIdentity is Project-scoped EventRecord v2, scope_partition project~base64url_no_pad(UTF8(project_id));\
  \ envelope project_id equals payload project_id, actor_ref/correlation_id/idempotency_key/occurred_at_utc equal\
  \ the payload fields (ts for occurrence); thread/run/node/attempt and parent/causation refs are null unless an\
  \ authentic caller supplies the corresponding original linkage, never ambient defaults. Let H be lowercase SHA-256\
  \ of canonical MessagePack of the array [storage_instance_id, project_id, \"alert.dismissed\", idempotency_key].\
  \ event_id is evt_alert_dismissed_ followed by H; operation_digest is H. The idempotency key is the original accepted\
  \ command key, not reminted on recovery. Request digest covers the full admitted command, subject alert_id, actor,\
  \ current revision and exact candidate payload. Same key with unequal digest fails conflict before effects. The\
  \ command's original revision and subject ref must equal the independently read owner record, and result_revision\
  \ equals prior_revision + 1. Server-side secret screening rejects secret-bearing strings even if the lexical schema\
  \ accepts them.\n\nOrdering: under the original Project permission/currentness/owner mutation fence, validate\
  \ exact registry membership FIRST; currently absent means deny before journal/body/effect/checkpoint. On future\
  \ admission, freeze original payload and identity in alert_dismissed_operation.v1:{project_id}:{operation_digest}\
  \ before mutation. State prepared has all four result/commit/receipt refs null. CAS the exact subject revision\
  \ and commit its candidate owner state together with the committed operation in one owner-coordinated transaction;\
  \ committed has original owner_commit_ref, result_ref and dispatch_receipt_ref, with original_append_result_ref\
  \ null. If that atomic boundary cannot be established, the action remains unavailable. The shared alert store\
  \ stays F3-453's one store, with no per-surface copy. Append only after authenticated owner commit/readback. Explicitly\
  \ adopt SP-286/CV-339 storage.first_append_receipt.resolve.v2 including its full-value v2 successor, genuine original\
  \ eleven-field first AppendReceipt, retained four-field original_append_result and actual original EventRecord.\
  \ Exact identity, semantic payload, Storage instance, sequence, segment/offset and durability must all join independently.\
  \ Only then set settled with all four refs nonnull and publish terminal success. An uncertain append fences later\
  \ writes to that subject; recovery resolves the ORIGINAL identity, never reruns the command or fabricates a receipt.\
  \ Prepared with no commit may abandon only after original absence proof; ambiguous state fences. Committed retries\
  \ recover append with frozen semantics; settled retries return original result/receipt. No wall clock renewal.\n\
  \nOriginal operation custody is canonical and non-rebuildable; its schema is Plans/alert_event_contracts/alert_dismissed_operation.schema.json.\
  \ The owner commit ref resolves original shared alert state, never a current replacement with the same revision.\
  \ Backup/restore must include coherent original operation, shared alert/rule state, Storage source and first/full-value\
  \ receipt custody and source/deletion dependencies under one verified recovery boundary. Missing/mixed instances\
  \ or missing original evidence fence mutation and disclose unavailable. History cannot recreate deleted source\
  \ bodies. Reads authenticate current Project membership, source access and deletion tombstones at disclosure,\
  \ including after every returning helper; IDs/hashes/refs confer no access. No raw alert text, private rationale\
  \ or source content is copied into the event or custody.\n\nNewly authored projector.alert_dismissed.history@1.0.0\
  \ and reader.alert_dismissed.history@1.0.0 expose this family's passive History audit refs; GUI inbox state is\
  \ independently read from F3-453, never inferred as mutation authority from History. Checkpoint key alert_dismissed_checkpoint.v1:{project_id}:{storage_instance_id},\
  \ schema Plans/alert_event_contracts/alert_dismissed_checkpoint.schema.json. Explicitly adopt SP-278 and DL-076:\
  \ CURRENT-selected complete generic EventRecord index, whole nine-field durable index_read_token (no persisted\
  \ redb_snapshot_id); live snapshot id is rejoined and authenticated on each scan/read/advance. Scan every source\
  \ sequence through the captured frontier, filter exact Project and alert.dismissed, validate each matching EventRecord/payload\
  \ and atomically CAS the whole prior checkpoint to the verified frontier in ONE derived-redb transaction. The\
  \ checkpoint stores only this constant-count token/frontier/last-match value, never an event_refs array, page\
  \ list or retained-history manifest. through_sequence_id is the complete scanned frontier, not merely the last\
  \ match; last_event_id is the final matching event id or null for no matches. Never skip corrupt/unknown source\
  \ or advance past an inadmissible event. Reader requires current publication/state, exact scope/instance and adequate\
  \ verified frontier or returns unavailable, never empty success. No checkpoint may advance while this family is\
  \ absent. Lost ack/replay never dispatches an owner command. Rebuild stages a separate publication from retained\
  \ CURRENT-selected source, verifies complete coverage, then atomically withdraws old and publishes new; pruning,\
  \ source-generation or schema change requires rebuild rather than zeroing a live cursor. Legal source deletion\
  \ rebuilds only retained refs, never resurrects deleted content.\n\nCompatibility/withdrawal: only payload 1.0.0\
  \ and the explicit value schema versions are readable; unknown versions fence without coercion. No historical\
  \ write is claimed. StorageMigrationCoordinator must install these exact value schemas before activation; no invented\
  \ store version. Withdrawal first closes writer admission and fences subject mutations, settles every original\
  \ in-flight obligation under its original evidence, then marks this checkpoint withdrawn under whole-value CAS.\
  \ Readers refuse withdrawn/staged publications; a future version requires its own contract/admission and verified\
  \ rebuild, not an alias or in-place event rewrite. Source custody remains subject to holds and its own lifetime.\n\
  \nretention_policy_ref: PENDING_RETENTION_DECISION for this event, its operation and its History checkpoint. Case\
  \ L-3 (SP-026 retention section) offers audit-authority/receipt RP-AUTHORITY-INDEFINITE versus ordinary telemetry\
  \ ordinary telemetry class (policy identifier not assigned here) for event history; RP-PROJECTION-3GEN is a checkpoint\
  \ candidate only. No existing text names alert.dismissed in a decided class. RT must decide/confirm exact assignment\
  \ and dependent body deletion; do not choose by prefix or expire anything pending that decision. Native execution\
  \ NOT_RUN. Static validation: python3 scripts/pm-alert-event-contracts-check.py.\n Original shared state for this\
  \ family is shared_alert_state.v1:{project_id}:{alert_id}, closed schema Plans/alert_event_contracts/shared_alert_state.schema.json.\
  \ This is a newly authored technical representation of F3-453 existing behavior, reused by each exact handler,\
  \ not another UI store. prior_owner_state and candidate_owner_state are complete frozen original bytes in this\
  \ family operation; exact key/Project/subject/source identity must agree with payload and both snapshots. Candidate\
  \ revision is prior + 1; source_record_ref is unchanged. CAS compares the full prior value, not revision alone,\
  \ and atomically writes candidate plus committed operation before append. No prepared operation may authorize\
  \ mutation without exact family admission. Acknowledge clears unread and preserves presentation/source truth;\
  \ dismiss clears inbox_visible only and preserves source truth; snooze sets original snooze_until and hides until\
  \ the deadline without deleting; mute changes only exact rule state/deadline. Fields unrelated to the exact action\
  \ remain byte-equal. Expiry/read projection is the existing owner behavior and creates no fabricated action event.\
  \ Original immutable owner_commit_ref resolves the operation candidate snapshot even after later revisions. Shared\
  \ state backup is canonical and mandatory; its retention remains PENDING_RETENTION_DECISION independently of the\
  \ source record.\n\nBounded History read-through (newly authored technical binding): reader.alert_dismissed.history@1.0.0\
  \ reads the exact published checkpoint and its nine-field durable token through SP-278 reader.storage.event_record_index.\
  \ Request carries publication_id, the entire durable token and after_sequence_id (0 initially; unsigned 64-bit).\
  \ These are untrusted resumable read inputs, never new persisted state. Authenticate the original token and join\
  \ its Storage instance to both checkpoint and source_selection; rejoin the actual live redb snapshot on every\
  \ call. Source generation/selection must still validate under SP-278; do not silently substitute a fresh token\
  \ into an old continuation. Changed source needs SP-278 verified translation or a new verified publication and\
  \ a restarted traversal, otherwise unavailable. Scan in canonical sequence order only through the checkpoint's\
  \ through_sequence_id, at most 256 source sequences per response; return at most 64 authenticated exact-family/Project\
  \ event refs and at most 16384 canonical MessagePack response bytes. Stop before the first ref that would exceed\
  \ either response bound. An individual ref or token that cannot fit is invalid source/metadata, never silently\
  \ dropped. A continuation repeats publication_id and the complete token and advances after_sequence_id to the\
  \ last actually examined source sequence; it must not advance past an unreturned match. Empty filtered pages carry\
  \ continuation until complete=true at the frontier. Complete=true with zero matches is empty History only after\
  \ full verified coverage, never because a scan budget expired. Reader holds/revalidates publication, original\
  \ source access, deletion and withdrawal at disclosure; invalid/withdrawn publication or a cursor beyond frontier\
  \ returns unavailable. No History read dispatches an action or changes the checkpoint. Rebuild/withdrawal fences\
  \ apply equally to every continuation. This bounds a read, not retention: all retained History remains reachable\
  \ through repeated calls.\n\nSP-340 physical binding: alert_dismissed_operation is canonical MessagePack in the\
  \ canonical redb file, coordination_and_storage group (advisory canonical budget); alert_dismissed_checkpoint\
  \ is canonical MessagePack in the derived redb file, event_log group (hard derived budget with eviction/rebuild).\
  \ Each value is at most 16384 encoded bytes, measured before CAS. F3-453 shared_alert_state/shared_alert_rule_state\
  \ use canonical MessagePack in canonical redb, settings_and_layout group, same maximum. Their original snapshots\
  \ remain in this family's canonical operation. Budget pressure never refuses canonical history or prunes it; derived\
  \ eviction makes History unavailable until verified rebuild. Metadata/ref values exceeding the physical maximum\
  \ are invalid and cannot commit; no accumulating history/body is placed in them. No duration, history-count cap\
  \ or retention assignment is added. Size-boundary and 1000-match read-through oracles are in this family's fixture.\
  \ The unadmitted earlier draft's event_refs checkpoint is not a current schema; if encountered as an installation\
  \ input it requires a governed rebuild, never truncation or in-place relabeling.\n\nCurrent append and original retry select replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and must fail replay_only_not_appendable before any canonical write or effect. EventRecord inline bodies at most 16 KiB; above that use the SP-337 BLAKE3/size/media-type payload_ref, never base64 body stuffing. This does not relax the 16384-byte closed operation/checkpoint maximum: oversized metadata is refused before effects. Identifier patterns require full-string matching, including rejection of a trailing LF; no trimming or normalization. History response is exactly the closed object {publication_id, index_read_token, after_sequence_id, event_refs, complete}; index_read_token is the full nine-field durable token. Measure canonical MessagePack of that entire object for every candidate response, including an empty completion/continuation. Metadata or one matching ref that cannot individually fit returns unavailable without advancing past the match. Static large-valid-token, exact-response-boundary, unpageable-metadata and replay-only negatives do not replace native authorization/byte/CAS proofs. Numbers follow CV-1100 and SP-1100 beside the SP-278, SP-286 and CV-339 profile owners: each schema integer slot admits current_integer within its own bounds with no lane-wide cap, Storage sequences are uint64, and the producer route is qualified JCS; a retained original keeps its write-time recipe, whose authenticated selection is SP-1101. Every retained read and retained retry first resolves its original through the SP-1101 RetainedDispatcher: the sealed Storage custody at the original event_ref, the exact sealed binding and an installed frozen recipe tuple that pins the exact schema bytes of the edition and selects its payload validator; the frozen verifier recomputes the value commitment, family and event identity of the original. An original without custody, with unsealed bytes, a foreign binding or an uninstalled or foreign recipe refuses as unavailable or unsupported, with no fallback, caller selection or current-then-legacy probing. Timestamps follow CV-1101 with the owner profile of each field (CV-253 storage_utc_z for the two Storage-assigned EventRecord instants it binds)."
gui_related: false
gui_classification_reason: Storage/event contract, no new UI.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- alert.dismissed is denied until its own admission; exact identity, custody, recovery and negative paths are checked.
- Retention remains PENDING_RETENTION_DECISION; native execution NOT_RUN.
validation_surfaces:
- python3 scripts/pm-alert-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: alert_dismissed
implementation_surfaces:
- Plans/event_payloads/attention/alert_dismissed.schema.json
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/FinalGUISpec.md#F3-453
preserved_exact_tokens:
- alert.dismissed
- PENDING_RETENTION_DECISION
negative_constraints:
- No append, native activation, checkpoint advance or admission from this preparation.
```

### SP-662 - alert.rule_muted original custody and history

```yaml
plan_unit_id: SP-662
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Newly authored technical custody binding: original_command is the complete closed normalized accepted command context with every candidate payload field except schema_id, schema_version and result_* fields. It retains the original subject/source reference, actor, prior revision/state, currentness, options, correlation, idempotency key and original ts; optional fields retain original presence. This private snapshot does not expand the public command signature. request_digest is lowercase SHA-256 of canonical MessagePack {original_command: operation.original_command, candidate_payload: operation.payload}; every field and optional presence participates, with no Storage-assigned metadata. Both owner snapshots join Project, subject, immutable source, revision and lifecycle state to the frozen command/payload; unchanged fields agree with the prior snapshot and only the specified action effects differ. No supplied digest or snapshot copy grants authority. Newly authored owner contract for alert.rule_muted 1.0.0 under DL-045; prepared without admission.\
  \ Only cmd.alert.mute_rule, handled by handlers::alert::mute_rule, produces this exact family. Existing closed\
  \ payload is Plans/event_payloads/attention/alert_rule_muted.schema.json (pm.attention_event.alert_rule_muted.schema.v1);\
  \ no sibling admission. Semantic owner is F3-702, payload route CV-682, storage route SP-662. Transition: unmuted\
  \ or expired -> muted for the exact Project rule; keep the issue visible in its owning surface; expiry follows\
  \ the original explicit deadline, never retry time. Current owner must prove the action is allowed, including\
  \ permission, current subject revision and currentness_basis_ref. Mute/snooze cannot suppress blocking confirmations\
  \ or security-sensitive failures; dismissal cannot clear a blocker. A refusal, stale result, no change, rollback\
  \ or failed persistence produces no event.\n\nIdentity is Project-scoped EventRecord v2, scope_partition project~base64url_no_pad(UTF8(project_id));\
  \ envelope project_id equals payload project_id, actor_ref/correlation_id/idempotency_key/occurred_at_utc equal\
  \ the payload fields (ts for occurrence); thread/run/node/attempt and parent/causation refs are null unless an\
  \ authentic caller supplies the corresponding original linkage, never ambient defaults. Let H be lowercase SHA-256\
  \ of canonical MessagePack of the array [storage_instance_id, project_id, \"alert.rule_muted\", idempotency_key].\
  \ event_id is evt_alert_rule_muted_ followed by H; operation_digest is H. The idempotency key is the original\
  \ accepted command key, not reminted on recovery. Request digest covers the full admitted command, subject alert_rule_id,\
  \ actor, current revision and exact candidate payload. Same key with unequal digest fails conflict before effects.\
  \ The command's original revision and subject ref must equal the independently read owner record, and result_revision\
  \ equals prior_revision + 1. Server-side secret screening rejects secret-bearing strings even if the lexical schema\
  \ accepts them.\n\nOrdering: under the original Project permission/currentness/owner mutation fence, validate\
  \ exact registry membership FIRST; currently absent means deny before journal/body/effect/checkpoint. On future\
  \ admission, freeze original payload and identity in alert_rule_muted_operation.v1:{project_id}:{operation_digest}\
  \ before mutation. State prepared has all four result/commit/receipt refs null. CAS the exact subject revision\
  \ and commit its candidate owner state together with the committed operation in one owner-coordinated transaction;\
  \ committed has original owner_commit_ref, result_ref and dispatch_receipt_ref, with original_append_result_ref\
  \ null. If that atomic boundary cannot be established, the action remains unavailable. The shared alert store\
  \ stays F3-453's one store, with no per-surface copy. Append only after authenticated owner commit/readback. Explicitly\
  \ adopt SP-286/CV-339 storage.first_append_receipt.resolve.v2 including its full-value v2 successor, genuine original\
  \ eleven-field first AppendReceipt, retained four-field original_append_result and actual original EventRecord.\
  \ Exact identity, semantic payload, Storage instance, sequence, segment/offset and durability must all join independently.\
  \ Only then set settled with all four refs nonnull and publish terminal success. An uncertain append fences later\
  \ writes to that subject; recovery resolves the ORIGINAL identity, never reruns the command or fabricates a receipt.\
  \ Prepared with no commit may abandon only after original absence proof; ambiguous state fences. Committed retries\
  \ recover append with frozen semantics; settled retries return original result/receipt. No wall clock renewal.\n\
  \nOriginal operation custody is canonical and non-rebuildable; its schema is Plans/alert_event_contracts/alert_rule_muted_operation.schema.json.\
  \ The owner commit ref resolves original shared alert state, never a current replacement with the same revision.\
  \ Backup/restore must include coherent original operation, shared alert/rule state, Storage source and first/full-value\
  \ receipt custody and source/deletion dependencies under one verified recovery boundary. Missing/mixed instances\
  \ or missing original evidence fence mutation and disclose unavailable. History cannot recreate deleted source\
  \ bodies. Reads authenticate current Project membership, source access and deletion tombstones at disclosure,\
  \ including after every returning helper; IDs/hashes/refs confer no access. No raw alert text, private rationale\
  \ or source content is copied into the event or custody.\n\nNewly authored projector.alert_rule_muted.history@1.0.0\
  \ and reader.alert_rule_muted.history@1.0.0 expose this family's passive History audit refs; GUI inbox state is\
  \ independently read from F3-453, never inferred as mutation authority from History. Checkpoint key alert_rule_muted_checkpoint.v1:{project_id}:{storage_instance_id},\
  \ schema Plans/alert_event_contracts/alert_rule_muted_checkpoint.schema.json. Explicitly adopt SP-278 and DL-076:\
  \ CURRENT-selected complete generic EventRecord index, whole nine-field durable index_read_token (no persisted\
  \ redb_snapshot_id); live snapshot id is rejoined and authenticated on each scan/read/advance. Scan every source\
  \ sequence through the captured frontier, filter exact Project and alert.rule_muted, validate each matching EventRecord/payload\
  \ and atomically CAS the whole prior checkpoint to the verified frontier in ONE derived-redb transaction. The\
  \ checkpoint stores only this constant-count token/frontier/last-match value, never an event_refs array, page\
  \ list or retained-history manifest. through_sequence_id is the complete scanned frontier, not merely the last\
  \ match; last_event_id is the final matching event id or null for no matches. Never skip corrupt/unknown source\
  \ or advance past an inadmissible event. Reader requires current publication/state, exact scope/instance and adequate\
  \ verified frontier or returns unavailable, never empty success. No checkpoint may advance while this family is\
  \ absent. Lost ack/replay never dispatches an owner command. Rebuild stages a separate publication from retained\
  \ CURRENT-selected source, verifies complete coverage, then atomically withdraws old and publishes new; pruning,\
  \ source-generation or schema change requires rebuild rather than zeroing a live cursor. Legal source deletion\
  \ rebuilds only retained refs, never resurrects deleted content.\n\nCompatibility/withdrawal: only payload 1.0.0\
  \ and the explicit value schema versions are readable; unknown versions fence without coercion. No historical\
  \ write is claimed. StorageMigrationCoordinator must install these exact value schemas before activation; no invented\
  \ store version. Withdrawal first closes writer admission and fences subject mutations, settles every original\
  \ in-flight obligation under its original evidence, then marks this checkpoint withdrawn under whole-value CAS.\
  \ Readers refuse withdrawn/staged publications; a future version requires its own contract/admission and verified\
  \ rebuild, not an alias or in-place event rewrite. Source custody remains subject to holds and its own lifetime.\n\
  \nretention_policy_ref: PENDING_RETENTION_DECISION for this event, its operation and its History checkpoint. Case\
  \ L-3 (SP-026 retention section) offers audit-authority/receipt RP-AUTHORITY-INDEFINITE versus ordinary telemetry\
  \ ordinary telemetry class (policy identifier not assigned here) for event history; RP-PROJECTION-3GEN is a checkpoint\
  \ candidate only. No existing text names alert.rule_muted in a decided class. RT must decide/confirm exact assignment\
  \ and dependent body deletion; do not choose by prefix or expire anything pending that decision. Native execution\
  \ NOT_RUN. Static validation: python3 scripts/pm-alert-event-contracts-check.py.\n Original shared state for this\
  \ family is shared_alert_rule_state.v1:{project_id}:{alert_rule_id}, closed schema Plans/alert_event_contracts/shared_alert_rule_state.schema.json.\
  \ This is a newly authored technical representation of F3-453 existing behavior, reused by each exact handler,\
  \ not another UI store. prior_owner_state and candidate_owner_state are complete frozen original bytes in this\
  \ family operation; exact key/Project/subject/source identity must agree with payload and both snapshots. Candidate\
  \ revision is prior + 1; source_record_ref is unchanged. CAS compares the full prior value, not revision alone,\
  \ and atomically writes candidate plus committed operation before append. No prepared operation may authorize\
  \ mutation without exact family admission. Acknowledge clears unread and preserves presentation/source truth;\
  \ dismiss clears inbox_visible only and preserves source truth; snooze sets original snooze_until and hides until\
  \ the deadline without deleting; mute changes only exact rule state/deadline. Fields unrelated to the exact action\
  \ remain byte-equal. Expiry/read projection is the existing owner behavior and creates no fabricated action event.\
  \ Original immutable owner_commit_ref resolves the operation candidate snapshot even after later revisions. Shared\
  \ state backup is canonical and mandatory; its retention remains PENDING_RETENTION_DECISION independently of the\
  \ source record.\n\nBounded History read-through (newly authored technical binding): reader.alert_rule_muted.history@1.0.0\
  \ reads the exact published checkpoint and its nine-field durable token through SP-278 reader.storage.event_record_index.\
  \ Request carries publication_id, the entire durable token and after_sequence_id (0 initially; unsigned 64-bit).\
  \ These are untrusted resumable read inputs, never new persisted state. Authenticate the original token and join\
  \ its Storage instance to both checkpoint and source_selection; rejoin the actual live redb snapshot on every\
  \ call. Source generation/selection must still validate under SP-278; do not silently substitute a fresh token\
  \ into an old continuation. Changed source needs SP-278 verified translation or a new verified publication and\
  \ a restarted traversal, otherwise unavailable. Scan in canonical sequence order only through the checkpoint's\
  \ through_sequence_id, at most 256 source sequences per response; return at most 64 authenticated exact-family/Project\
  \ event refs and at most 16384 canonical MessagePack response bytes. Stop before the first ref that would exceed\
  \ either response bound. An individual ref or token that cannot fit is invalid source/metadata, never silently\
  \ dropped. A continuation repeats publication_id and the complete token and advances after_sequence_id to the\
  \ last actually examined source sequence; it must not advance past an unreturned match. Empty filtered pages carry\
  \ continuation until complete=true at the frontier. Complete=true with zero matches is empty History only after\
  \ full verified coverage, never because a scan budget expired. Reader holds/revalidates publication, original\
  \ source access, deletion and withdrawal at disclosure; invalid/withdrawn publication or a cursor beyond frontier\
  \ returns unavailable. No History read dispatches an action or changes the checkpoint. Rebuild/withdrawal fences\
  \ apply equally to every continuation. This bounds a read, not retention: all retained History remains reachable\
  \ through repeated calls.\n\nSP-340 physical binding: alert_rule_muted_operation is canonical MessagePack in the\
  \ canonical redb file, coordination_and_storage group (advisory canonical budget); alert_rule_muted_checkpoint\
  \ is canonical MessagePack in the derived redb file, event_log group (hard derived budget with eviction/rebuild).\
  \ Each value is at most 16384 encoded bytes, measured before CAS. F3-453 shared_alert_state/shared_alert_rule_state\
  \ use canonical MessagePack in canonical redb, settings_and_layout group, same maximum. Their original snapshots\
  \ remain in this family's canonical operation. Budget pressure never refuses canonical history or prunes it; derived\
  \ eviction makes History unavailable until verified rebuild. Metadata/ref values exceeding the physical maximum\
  \ are invalid and cannot commit; no accumulating history/body is placed in them. No duration, history-count cap\
  \ or retention assignment is added. Size-boundary and 1000-match read-through oracles are in this family's fixture.\
  \ The unadmitted earlier draft's event_refs checkpoint is not a current schema; if encountered as an installation\
  \ input it requires a governed rebuild, never truncation or in-place relabeling.\n\nCurrent append and original retry select replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and must fail replay_only_not_appendable before any canonical write or effect. EventRecord inline bodies at most 16 KiB; above that use the SP-337 BLAKE3/size/media-type payload_ref, never base64 body stuffing. This does not relax the 16384-byte closed operation/checkpoint maximum: oversized metadata is refused before effects. Identifier patterns require full-string matching, including rejection of a trailing LF; no trimming or normalization. History response is exactly the closed object {publication_id, index_read_token, after_sequence_id, event_refs, complete}; index_read_token is the full nine-field durable token. Measure canonical MessagePack of that entire object for every candidate response, including an empty completion/continuation. Metadata or one matching ref that cannot individually fit returns unavailable without advancing past the match. Static large-valid-token, exact-response-boundary, unpageable-metadata and replay-only negatives do not replace native authorization/byte/CAS proofs. Numbers follow CV-1100 and SP-1100 beside the SP-278, SP-286 and CV-339 profile owners: each schema integer slot admits current_integer within its own bounds with no lane-wide cap, Storage sequences are uint64, and the producer route is qualified JCS; a retained original keeps its write-time recipe, whose authenticated selection is SP-1101. Every retained read and retained retry first resolves its original through the SP-1101 RetainedDispatcher: the sealed Storage custody at the original event_ref, the exact sealed binding and an installed frozen recipe tuple that pins the exact schema bytes of the edition and selects its payload validator; the frozen verifier recomputes the value commitment, family and event identity of the original. An original without custody, with unsealed bytes, a foreign binding or an uninstalled or foreign recipe refuses as unavailable or unsupported, with no fallback, caller selection or current-then-legacy probing. Timestamps follow CV-1101 with the owner profile of each field (CV-253 storage_utc_z for the two Storage-assigned EventRecord instants it binds)."
gui_related: false
gui_classification_reason: Storage/event contract, no new UI.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- alert.rule_muted is denied until its own admission; exact identity, custody, recovery and negative paths are checked.
- Retention remains PENDING_RETENTION_DECISION; native execution NOT_RUN.
validation_surfaces:
- python3 scripts/pm-alert-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: alert_rule_muted
implementation_surfaces:
- Plans/event_payloads/attention/alert_rule_muted.schema.json
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/FinalGUISpec.md#F3-453
preserved_exact_tokens:
- alert.rule_muted
- PENDING_RETENTION_DECISION
negative_constraints:
- No append, native activation, checkpoint advance or admission from this preparation.
```

### SP-663 - alert.snoozed original custody and history

```yaml
plan_unit_id: SP-663
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: "Newly authored technical custody binding: original_command is the complete closed normalized accepted command context with every candidate payload field except schema_id, schema_version and result_* fields. It retains the original subject/source reference, actor, prior revision/state, currentness, options, correlation, idempotency key and original ts; optional fields retain original presence. This private snapshot does not expand the public command signature. request_digest is lowercase SHA-256 of canonical MessagePack {original_command: operation.original_command, candidate_payload: operation.payload}; every field and optional presence participates, with no Storage-assigned metadata. Both owner snapshots join Project, subject, immutable source, revision and lifecycle state to the frozen command/payload; unchanged fields agree with the prior snapshot and only the specified action effects differ. No supplied digest or snapshot copy grants authority. Newly authored owner contract for alert.snoozed 1.0.0 under DL-045; prepared without admission.\
  \ Only cmd.alert.snooze, handled by handlers::alert::snooze, produces this exact family. Existing closed payload\
  \ is Plans/event_payloads/attention/alert_snoozed.schema.json (pm.attention_event.alert_snoozed.schema.v1); no\
  \ sibling admission. Semantic owner is F3-703, payload route CV-683, storage route SP-663. Transition: unacknowledged\
  \ or acknowledged -> snoozed until snooze_until, strictly after ts; keep original deadline on replay; never suppress\
  \ blocking confirmations or security-sensitive failures. Current owner must prove the action is allowed, including\
  \ permission, current subject revision and currentness_basis_ref. Mute/snooze cannot suppress blocking confirmations\
  \ or security-sensitive failures; dismissal cannot clear a blocker. A refusal, stale result, no change, rollback\
  \ or failed persistence produces no event.\n\nIdentity is Project-scoped EventRecord v2, scope_partition project~base64url_no_pad(UTF8(project_id));\
  \ envelope project_id equals payload project_id, actor_ref/correlation_id/idempotency_key/occurred_at_utc equal\
  \ the payload fields (ts for occurrence); thread/run/node/attempt and parent/causation refs are null unless an\
  \ authentic caller supplies the corresponding original linkage, never ambient defaults. Let H be lowercase SHA-256\
  \ of canonical MessagePack of the array [storage_instance_id, project_id, \"alert.snoozed\", idempotency_key].\
  \ event_id is evt_alert_snoozed_ followed by H; operation_digest is H. The idempotency key is the original accepted\
  \ command key, not reminted on recovery. Request digest covers the full admitted command, subject alert_id, actor,\
  \ current revision and exact candidate payload. Same key with unequal digest fails conflict before effects. The\
  \ command's original revision and subject ref must equal the independently read owner record, and result_revision\
  \ equals prior_revision + 1. Server-side secret screening rejects secret-bearing strings even if the lexical schema\
  \ accepts them.\n\nOrdering: under the original Project permission/currentness/owner mutation fence, validate\
  \ exact registry membership FIRST; currently absent means deny before journal/body/effect/checkpoint. On future\
  \ admission, freeze original payload and identity in alert_snoozed_operation.v1:{project_id}:{operation_digest}\
  \ before mutation. State prepared has all four result/commit/receipt refs null. CAS the exact subject revision\
  \ and commit its candidate owner state together with the committed operation in one owner-coordinated transaction;\
  \ committed has original owner_commit_ref, result_ref and dispatch_receipt_ref, with original_append_result_ref\
  \ null. If that atomic boundary cannot be established, the action remains unavailable. The shared alert store\
  \ stays F3-453's one store, with no per-surface copy. Append only after authenticated owner commit/readback. Explicitly\
  \ adopt SP-286/CV-339 storage.first_append_receipt.resolve.v2 including its full-value v2 successor, genuine original\
  \ eleven-field first AppendReceipt, retained four-field original_append_result and actual original EventRecord.\
  \ Exact identity, semantic payload, Storage instance, sequence, segment/offset and durability must all join independently.\
  \ Only then set settled with all four refs nonnull and publish terminal success. An uncertain append fences later\
  \ writes to that subject; recovery resolves the ORIGINAL identity, never reruns the command or fabricates a receipt.\
  \ Prepared with no commit may abandon only after original absence proof; ambiguous state fences. Committed retries\
  \ recover append with frozen semantics; settled retries return original result/receipt. No wall clock renewal.\n\
  \nOriginal operation custody is canonical and non-rebuildable; its schema is Plans/alert_event_contracts/alert_snoozed_operation.schema.json.\
  \ The owner commit ref resolves original shared alert state, never a current replacement with the same revision.\
  \ Backup/restore must include coherent original operation, shared alert/rule state, Storage source and first/full-value\
  \ receipt custody and source/deletion dependencies under one verified recovery boundary. Missing/mixed instances\
  \ or missing original evidence fence mutation and disclose unavailable. History cannot recreate deleted source\
  \ bodies. Reads authenticate current Project membership, source access and deletion tombstones at disclosure,\
  \ including after every returning helper; IDs/hashes/refs confer no access. No raw alert text, private rationale\
  \ or source content is copied into the event or custody.\n\nNewly authored projector.alert_snoozed.history@1.0.0\
  \ and reader.alert_snoozed.history@1.0.0 expose this family's passive History audit refs; GUI inbox state is independently\
  \ read from F3-453, never inferred as mutation authority from History. Checkpoint key alert_snoozed_checkpoint.v1:{project_id}:{storage_instance_id},\
  \ schema Plans/alert_event_contracts/alert_snoozed_checkpoint.schema.json. Explicitly adopt SP-278 and DL-076:\
  \ CURRENT-selected complete generic EventRecord index, whole nine-field durable index_read_token (no persisted\
  \ redb_snapshot_id); live snapshot id is rejoined and authenticated on each scan/read/advance. Scan every source\
  \ sequence through the captured frontier, filter exact Project and alert.snoozed, validate each matching EventRecord/payload\
  \ and atomically CAS the whole prior checkpoint to the verified frontier in ONE derived-redb transaction. The\
  \ checkpoint stores only this constant-count token/frontier/last-match value, never an event_refs array, page\
  \ list or retained-history manifest. through_sequence_id is the complete scanned frontier, not merely the last\
  \ match; last_event_id is the final matching event id or null for no matches. Never skip corrupt/unknown source\
  \ or advance past an inadmissible event. Reader requires current publication/state, exact scope/instance and adequate\
  \ verified frontier or returns unavailable, never empty success. No checkpoint may advance while this family is\
  \ absent. Lost ack/replay never dispatches an owner command. Rebuild stages a separate publication from retained\
  \ CURRENT-selected source, verifies complete coverage, then atomically withdraws old and publishes new; pruning,\
  \ source-generation or schema change requires rebuild rather than zeroing a live cursor. Legal source deletion\
  \ rebuilds only retained refs, never resurrects deleted content.\n\nCompatibility/withdrawal: only payload 1.0.0\
  \ and the explicit value schema versions are readable; unknown versions fence without coercion. No historical\
  \ write is claimed. StorageMigrationCoordinator must install these exact value schemas before activation; no invented\
  \ store version. Withdrawal first closes writer admission and fences subject mutations, settles every original\
  \ in-flight obligation under its original evidence, then marks this checkpoint withdrawn under whole-value CAS.\
  \ Readers refuse withdrawn/staged publications; a future version requires its own contract/admission and verified\
  \ rebuild, not an alias or in-place event rewrite. Source custody remains subject to holds and its own lifetime.\n\
  \nretention_policy_ref: PENDING_RETENTION_DECISION for this event, its operation and its History checkpoint. Case\
  \ L-3 (SP-026 retention section) offers audit-authority/receipt RP-AUTHORITY-INDEFINITE versus ordinary telemetry\
  \ ordinary telemetry class (policy identifier not assigned here) for event history; RP-PROJECTION-3GEN is a checkpoint\
  \ candidate only. No existing text names alert.snoozed in a decided class. RT must decide/confirm exact assignment\
  \ and dependent body deletion; do not choose by prefix or expire anything pending that decision. Native execution\
  \ NOT_RUN. Static validation: python3 scripts/pm-alert-event-contracts-check.py.\n Original shared state for this\
  \ family is shared_alert_state.v1:{project_id}:{alert_id}, closed schema Plans/alert_event_contracts/shared_alert_state.schema.json.\
  \ This is a newly authored technical representation of F3-453 existing behavior, reused by each exact handler,\
  \ not another UI store. prior_owner_state and candidate_owner_state are complete frozen original bytes in this\
  \ family operation; exact key/Project/subject/source identity must agree with payload and both snapshots. Candidate\
  \ revision is prior + 1; source_record_ref is unchanged. CAS compares the full prior value, not revision alone,\
  \ and atomically writes candidate plus committed operation before append. No prepared operation may authorize\
  \ mutation without exact family admission. Acknowledge clears unread and preserves presentation/source truth;\
  \ dismiss clears inbox_visible only and preserves source truth; snooze sets original snooze_until and hides until\
  \ the deadline without deleting; mute changes only exact rule state/deadline. Fields unrelated to the exact action\
  \ remain byte-equal. Expiry/read projection is the existing owner behavior and creates no fabricated action event.\
  \ Original immutable owner_commit_ref resolves the operation candidate snapshot even after later revisions. Shared\
  \ state backup is canonical and mandatory; its retention remains PENDING_RETENTION_DECISION independently of the\
  \ source record.\n\nBounded History read-through (newly authored technical binding): reader.alert_snoozed.history@1.0.0\
  \ reads the exact published checkpoint and its nine-field durable token through SP-278 reader.storage.event_record_index.\
  \ Request carries publication_id, the entire durable token and after_sequence_id (0 initially; unsigned 64-bit).\
  \ These are untrusted resumable read inputs, never new persisted state. Authenticate the original token and join\
  \ its Storage instance to both checkpoint and source_selection; rejoin the actual live redb snapshot on every\
  \ call. Source generation/selection must still validate under SP-278; do not silently substitute a fresh token\
  \ into an old continuation. Changed source needs SP-278 verified translation or a new verified publication and\
  \ a restarted traversal, otherwise unavailable. Scan in canonical sequence order only through the checkpoint's\
  \ through_sequence_id, at most 256 source sequences per response; return at most 64 authenticated exact-family/Project\
  \ event refs and at most 16384 canonical MessagePack response bytes. Stop before the first ref that would exceed\
  \ either response bound. An individual ref or token that cannot fit is invalid source/metadata, never silently\
  \ dropped. A continuation repeats publication_id and the complete token and advances after_sequence_id to the\
  \ last actually examined source sequence; it must not advance past an unreturned match. Empty filtered pages carry\
  \ continuation until complete=true at the frontier. Complete=true with zero matches is empty History only after\
  \ full verified coverage, never because a scan budget expired. Reader holds/revalidates publication, original\
  \ source access, deletion and withdrawal at disclosure; invalid/withdrawn publication or a cursor beyond frontier\
  \ returns unavailable. No History read dispatches an action or changes the checkpoint. Rebuild/withdrawal fences\
  \ apply equally to every continuation. This bounds a read, not retention: all retained History remains reachable\
  \ through repeated calls.\n\nSP-340 physical binding: alert_snoozed_operation is canonical MessagePack in the\
  \ canonical redb file, coordination_and_storage group (advisory canonical budget); alert_snoozed_checkpoint is\
  \ canonical MessagePack in the derived redb file, event_log group (hard derived budget with eviction/rebuild).\
  \ Each value is at most 16384 encoded bytes, measured before CAS. F3-453 shared_alert_state/shared_alert_rule_state\
  \ use canonical MessagePack in canonical redb, settings_and_layout group, same maximum. Their original snapshots\
  \ remain in this family's canonical operation. Budget pressure never refuses canonical history or prunes it; derived\
  \ eviction makes History unavailable until verified rebuild. Metadata/ref values exceeding the physical maximum\
  \ are invalid and cannot commit; no accumulating history/body is placed in them. No duration, history-count cap\
  \ or retention assignment is added. Size-boundary and 1000-match read-through oracles are in this family's fixture.\
  \ The unadmitted earlier draft's event_refs checkpoint is not a current schema; if encountered as an installation\
  \ input it requires a governed rebuild, never truncation or in-place relabeling.\n\nCurrent append and original retry select replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and must fail replay_only_not_appendable before any canonical write or effect. EventRecord inline bodies at most 16 KiB; above that use the SP-337 BLAKE3/size/media-type payload_ref, never base64 body stuffing. This does not relax the 16384-byte closed operation/checkpoint maximum: oversized metadata is refused before effects. Identifier patterns require full-string matching, including rejection of a trailing LF; no trimming or normalization. History response is exactly the closed object {publication_id, index_read_token, after_sequence_id, event_refs, complete}; index_read_token is the full nine-field durable token. Measure canonical MessagePack of that entire object for every candidate response, including an empty completion/continuation. Metadata or one matching ref that cannot individually fit returns unavailable without advancing past the match. Static large-valid-token, exact-response-boundary, unpageable-metadata and replay-only negatives do not replace native authorization/byte/CAS proofs. Numbers follow CV-1100 and SP-1100 beside the SP-278, SP-286 and CV-339 profile owners: each schema integer slot admits current_integer within its own bounds with no lane-wide cap, Storage sequences are uint64, and the producer route is qualified JCS; a retained original keeps its write-time recipe, whose authenticated selection is SP-1101. Every retained read and retained retry first resolves its original through the SP-1101 RetainedDispatcher: the sealed Storage custody at the original event_ref, the exact sealed binding and an installed frozen recipe tuple that pins the exact schema bytes of the edition and selects its payload validator; the frozen verifier recomputes the value commitment, family and event identity of the original. An original without custody, with unsealed bytes, a foreign binding or an uninstalled or foreign recipe refuses as unavailable or unsupported, with no fallback, caller selection or current-then-legacy probing. Timestamps follow CV-1101 with the owner profile of each field (CV-253 storage_utc_z for the two Storage-assigned EventRecord instants it binds)."
gui_related: false
gui_classification_reason: Storage/event contract, no new UI.
split_recommended: false
depends_on: []
unblocks: []
acceptance_criteria:
- alert.snoozed is denied until its own admission; exact identity, custody, recovery and negative paths are checked.
- Retention remains PENDING_RETENTION_DECISION; native execution NOT_RUN.
validation_surfaces:
- python3 scripts/pm-alert-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: alert_snoozed
implementation_surfaces:
- Plans/event_payloads/attention/alert_snoozed.schema.json
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/FinalGUISpec.md#F3-453
preserved_exact_tokens:
- alert.snoozed
- PENDING_RETENTION_DECISION
negative_constraints:
- No append, native activation, checkpoint advance or admission from this preparation.
```

### SP-664 - panel.redocked current chat-only audit and history

```yaml
plan_unit_id: SP-664
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored owner contract for panel.redocked 2.0.0 under DL-045, prepared without admission.
  CV-361, SP-330, UCC-203 and F3-637 already govern the product: only the desktop chat can pop out and return, the
  web client has no Pop out, and restart puts chat in its column without dispatching redock. cmd.panel.redock, handled
  by handlers::panel::redock in the shared panel shell, is this family''s sole producer. Successful transition is
  detached_window -> chat_column for panel_id=chat and the same window_id. A redock must name the currently detached
  window; an undock must verify the actual newly settled window for this command. Refusal, stale session/revision,
  wrong target, web unsupported, no change, preview, cancellation, failed persistence or rollback emits nothing.
  Neither event advances a Home layout revision, saves popped-out state, writes a host into the Home record or co-emits
  workspace.layout_changed. persisted=true describes the audit event; host_state_persisted=false is mandatory. The
  existing expected_layout_revision command input remains a checked original Home-context precondition where supplied,
  never a host revision or an instruction to advance layout. The current payload is Plans/event_payloads/panel_redocked_v2.schema.json,
  schema pm.event.panel_redocked.v2; semantic route F3-704, payload route CV-684.


  Identity: EventRecord v2 uses actual original project_id and project~base64url_no_pad(UTF8(project_id)) when Project-scoped;
  a global_shell invocation without a Project uses null project_id and the unchanged app partition, with actual
  storage_instance_id/server_id under CV-366. A home_workspace origin requires original Project/workspace_tab_id.
  No focus/main/empty-Project fallback. Envelope scope, actor_ref, correlation_id, idempotency_key and occurred_at_utc
  join the frozen payload (settled_at_utc); thread/run/node/attempt/parent/causation are null unless independently
  authenticated original linkage exists. app_session_id is a fresh opaque identity issued by the shell once per
  process lifetime and shared by its chat column/window, never a Home tab or a restored identifier. Host revision
  starts at zero for that session; compare the entire in-memory prior snapshot and advance exactly one for a settled
  move. Let H be lowercase SHA-256 of canonical MessagePack [storage_instance_id, server_id, scope_partition, app_session_id,
  "panel.redocked", idempotency_key]. event_id=evt_panel_redocked_H and operation_digest=H. Request digest is lowercase SHA-256 of canonical MessagePack of the exact closed preimage {original_command: operation.original_command, candidate_payload: operation.payload}. Both values are the complete frozen closed objects, with every field including settled_at_utc and interaction_transaction_id; omit, normalize or regenerate nothing. original_command retains actor, actual scope/session/window and original expected revisions. Neither changed payload nor changed command may reuse the original digest. Same key with unequal command/digest is conflict before any effect. Session/scope/window
  joins must match the independently read shell owner, not caller claims.


  Producer ordering: validate exact event registry membership before journal, window effect, append or checkpoint;
  currently absent is deny. On future admission, under original permission/currentness/session and single-chat-host
  fence, freeze original command/payload and prior/candidate snapshots into panel_redocked_operation.v1:{storage_instance_id}:{scope_partition}:{app_session_id}:{operation_digest},
  schema Plans/panel_event_contracts/panel_redocked_operation.schema.json. A prepared journal has null commit/result/receipt
  refs. The shell may then perform this single host move and verify the actual OS/shell settled state for the same
  session/window, holding all other host moves. Persist the authenticated original outcome and immutable candidate
  snapshot as the committed operation with nonnull owner_commit_ref, result_ref and dispatch_receipt_ref, before
  append. These refs resolve that operation''s original immutable evidence, never live host state after another
  move. If the effect cannot be proven or the commit fails, keep the operation fenced; terminal success is unavailable.
  Transient OS/shell state and redb are not claimed to share a transaction. The journal''s durable commit records
  evidence that the transient move really settled; it is never a saved layout and never instructs restart to restore
  it.


  Explicitly adopt SP-286/CV-339 storage.first_append_receipt.resolve.v2, including the full-value v2 successor,
  genuine original eleven-field first AppendReceipt, retained four-field original_append_result and actual original
  EventRecord. Append only the frozen exact event after durable original commit/readback; independently join instance,
  identity, semantic payload, sequence, segment/offset and durability. Only then CAS committed -> settled with original_append_result_ref
  nonnull and publish terminal success. An uncertain append fences later host mutations. Committed/settled retries
  recover/return the original result and receipt without opening/closing/moving a window or renewing a timestamp.
  Prepared ambiguity remains fenced while the session lives. After verified old-process termination, no transient
  host survives: a prepared operation may become abandoned_uncommitted only with original durable-commit and append
  absence proofs; never infer absence just from a missing window. A committed operation after restart still owes
  append recovery under its original identity, but never restores its candidate host or dispatches a command. A
  settled old-session result is historical evidence, never proof of a current popped-out host. No restart redock
  event is fabricated.


  Custody: the operation is canonical non-rebuildable original audit evidence; it retains frozen prior/candidate
  host observations, immutable result/dispatch refs and first/full-value receipt custody. No raw chat text, title,
  window geometry, credentials, account material or absolute local path enters payload/journal; server-side secret
  screening applies to all strings. Refs grant no access. Disclosure requires current scope membership/source access,
  deletion checks and current host/session proof for any action after returning helpers. Coherent mandatory backup
  includes operations, source EventRecords and genuine original receipts under the same Storage recovery boundary.
  Restored journals are historical evidence only and never input to host restoration. Missing/mixed originals fence
  mutations and disclose unavailable. No event reader can reconstruct deleted chat bodies.


  Newly authored projector.panel_redocked.history@1.0.0 and reader.panel_redocked.history@1.0.0 expose passive record-backed
  History audit only; current host is independently read from the running shell. Checkpoint key panel_redocked_checkpoint.v1:{storage_instance_id}:{scope_partition},
  schema Plans/panel_event_contracts/panel_redocked_checkpoint.schema.json. Explicitly adopt SP-278/DL-076: complete
  CURRENT-selected generic EventRecord index, full nine-field durable token, no persisted redb_snapshot_id; rejoin/authenticate
  actual live snapshot each scan/read/advance. Scan every source sequence through captured frontier, authenticate
  each exact panel.redocked/scope match, and whole-value CAS prior token/publication/state/frontier/last_event_id
  in one derived-redb transaction. Checkpoint is bounded frontier only, never an all-history event_refs array. through_sequence_id
  is complete scanned coverage; last_event_id is last matching event or null. Corrupt/unknown/inadmissible source
  cannot be skipped. Registry absence forbids advance.


  Reader request binds publication_id, complete durable token and unsigned after_sequence_id (0 initially), all
  authenticated as untrusted inputs. Verify Storage instance, server/scope and Project joins, live SP-278 source
  selection and publication state before reading and at disclosure. At most 256 source sequences, 64 exact matching
  refs and 16384 canonical MessagePack response bytes per page; measure the complete response, stopping before an
  unreturned match. A single oversized ref/token is invalid metadata, never silently dropped. Continuation repeats
  exact publication/token and last actually scanned sequence; empty filtered page is incomplete until frontier is
  reached. No history-count or duration cap is added. Invalid/withdrawn token, cursor beyond frontier or missing
  coverage returns unavailable, never empty success. A changed generation needs verified SP-278 translation or a
  verified new publication and restart; no silent substitution. No History call performs a shell action. Rebuild
  stages a separate publication from verified retained CURRENT-selected source, proves coverage then atomically
  withdraws old/publishes new. Source deletion rebuilds retained coverage only. Derived eviction makes History unavailable
  until rebuild; it cannot erase canonical audit.


  Compatibility and withdrawal: immutable Plans/event_payloads/panel_redocked.schema.json is the original 1.0.0
  reader only. Its generic hosts, durable settled_panel_state_ref, layout revisions and optional co-emission are
  historical interpretation, never current chat authority or a new writer. Dispatch reads by the stored payload
  schema id/version, without rewriting events or treating v1 as v2; unknown versions and unverifiable historical
  originals remain unavailable. Current writes require only the exact 2.0.0 schema/contract and their own future
  admission. StorageMigrationCoordinator must install exact new value schemas before activation, with no invented
  store version. Withdrawal closes writer admission first, fences host moves, settles original in-flight obligations
  without repeating OS effects, then CAS marks checkpoint withdrawn. Readers refuse staged/withdrawn publications
  and stale continuations; successor versions require own contract/admission and verified rebuild, never layout
  aliasing.


  SP-340 physical binding: panel_redocked_operation uses canonical MessagePack in canonical redb, settings_and_layout
  advisory canonical budget, maximum 16384 encoded bytes checked before effect/commit; panel_redocked_checkpoint
  uses canonical MessagePack in derived redb, event_log hard derived budget, same maximum. The operation is one
  bounded original receipt, not an accumulating host/history store; oversized metadata is invalid before effects.
  Budget pressure never prunes canonical audit or refuses a canonical write; derived pressure evicts/rebuilds. Retention
  remains PENDING_RETENTION_DECISION independently for event, operation and checkpoint. Case L-3 audit-authority/receipt
  versus telemetry and RP-PROJECTION-3GEN are candidates, not assignments; the saved-layout class is not silently
  applied to this restart-unsaved host transition. No deletion policy is invented. Fixtures Plans/panel_event_contracts/panel_redocked.fixtures.json
  and python3 scripts/pm-panel-event-contracts-check.py supply this family''s positive/negative schema, identity,
  retry, original-custody, history boundary and withdrawal oracles. Native OS/storage atomicity, receipt authenticity,
  SP-278 source proof, crash/recovery, permissions and backup tests remain NOT_RUN.

  Current append and original retry select replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and must fail replay_only_not_appendable before any canonical write or effect. EventRecord inline bodies at most 16 KiB; above that use the SP-337 BLAKE3/size/media-type payload_ref, never base64 body stuffing. This does not relax the 16384-byte closed operation/checkpoint maximum: oversized metadata is refused before effects. Identifier patterns require full-string matching, including rejection of a trailing LF; no trimming or normalization. History response is exactly the closed object {publication_id, index_read_token, after_sequence_id, event_refs, complete}; index_read_token is the full nine-field durable token. Measure canonical MessagePack of that entire object for every candidate response, including an empty completion/continuation. Metadata or one matching ref that cannot individually fit returns unavailable without advancing past the match. Static large-valid-token, exact-response-boundary, unpageable-metadata and replay-only negatives do not replace native authorization/byte/CAS proofs.

  For an application-scope invocation, CV-366 idempotency_key is exactly application@1:{hex(server_id)}:{hex(interaction_transaction_id)}. interaction_transaction_id is the original shell owner operation identity, not a retry timestamp; hex encodes the exact UTF-8 bytes in lowercase. An arbitrary caller key is refused. Project-scope original keys retain their existing format. Numbers follow CV-1100 and SP-1100 beside the SP-278, SP-286 and CV-339 profile owners: each schema integer slot admits current_integer within its own bounds with no lane-wide cap, Storage sequences are uint64, and the producer route is qualified JCS; a retained original keeps its write-time recipe, whose authenticated selection is SP-1101. Every retained read and retained retry first resolves its original through the SP-1101 RetainedDispatcher: the sealed Storage custody at the original event_ref, the exact sealed binding and an installed frozen recipe tuple that pins the exact schema bytes of the edition and selects its payload validator; the frozen verifier recomputes the value commitment, family and event identity of the original. An original without custody, with unsealed bytes, a foreign binding or an uninstalled or foreign recipe refuses as unavailable or unsupported, with no fallback, caller selection or current-then-legacy probing. Timestamps follow CV-1101 with the owner profile of each field (CV-253 storage_utc_z for the two Storage-assigned EventRecord instants it binds).'
gui_related: false
gui_classification_reason: Event custody and validation, no new UI.
split_recommended: false
depends_on:
- CV-361
- SP-330
- SP-278
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- SP-664 binds only its explicitly named exact family, prepared without admission; native execution NOT_RUN.
- Exact event admission precedes effects; retention remains PENDING_RETENTION_DECISION.
validation_surfaces:
- python3 scripts/pm-panel-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: chat_panel_event_authority
implementation_surfaces:
- Plans/storage-plan.md
- Plans/panel_event_contracts/
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Contracts_V0.md#CV-361
- Plans/storage-plan.md#SP-330
preserved_exact_tokens:
- PENDING_RETENTION_DECISION
- SP-278
- SP-286
negative_constraints:
- No event admission, saved pop-out host, Home revision advance, replayed OS window effect, retention decision or
  native execution proof.
```

### SP-665 - panel.undocked current chat-only audit and history

```yaml
plan_unit_id: SP-665
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored owner contract for panel.undocked 2.0.0 under DL-045, prepared without admission.
  CV-361, SP-330, UCC-203 and F3-637 already govern the product: only the desktop chat can pop out and return, the
  web client has no Pop out, and restart puts chat in its column without dispatching redock. cmd.panel.undock, handled
  by handlers::panel::undock in the shared panel shell, is this family''s sole producer. Successful transition is
  chat_column -> detached_window for panel_id=chat and the same window_id. A redock must name the currently detached
  window; an undock must verify the actual newly settled window for this command. Refusal, stale session/revision,
  wrong target, web unsupported, no change, preview, cancellation, failed persistence or rollback emits nothing.
  Neither event advances a Home layout revision, saves popped-out state, writes a host into the Home record or co-emits
  workspace.layout_changed. persisted=true describes the audit event; host_state_persisted=false is mandatory. The
  existing expected_layout_revision command input remains a checked original Home-context precondition where supplied,
  never a host revision or an instruction to advance layout. The current payload is Plans/event_payloads/panel_undocked_v2.schema.json,
  schema pm.event.panel_undocked.v2; semantic route F3-705, payload route CV-685.


  Identity: EventRecord v2 uses actual original project_id and project~base64url_no_pad(UTF8(project_id)) when Project-scoped;
  a global_shell invocation without a Project uses null project_id and the unchanged app partition, with actual
  storage_instance_id/server_id under CV-366. A home_workspace origin requires original Project/workspace_tab_id.
  No focus/main/empty-Project fallback. Envelope scope, actor_ref, correlation_id, idempotency_key and occurred_at_utc
  join the frozen payload (settled_at_utc); thread/run/node/attempt/parent/causation are null unless independently
  authenticated original linkage exists. app_session_id is a fresh opaque identity issued by the shell once per
  process lifetime and shared by its chat column/window, never a Home tab or a restored identifier. Host revision
  starts at zero for that session; compare the entire in-memory prior snapshot and advance exactly one for a settled
  move. Let H be lowercase SHA-256 of canonical MessagePack [storage_instance_id, server_id, scope_partition, app_session_id,
  "panel.undocked", idempotency_key]. event_id=evt_panel_undocked_H and operation_digest=H. Request digest is lowercase SHA-256 of canonical MessagePack of the exact closed preimage {original_command: operation.original_command, candidate_payload: operation.payload}. Both values are the complete frozen closed objects, with every field including settled_at_utc and interaction_transaction_id; omit, normalize or regenerate nothing. original_command retains actor, actual scope/session/window and original expected revisions. Neither changed payload nor changed command may reuse the original digest. Same key with unequal command/digest is conflict before any effect. Session/scope/window
  joins must match the independently read shell owner, not caller claims.


  Producer ordering: validate exact event registry membership before journal, window effect, append or checkpoint;
  currently absent is deny. On future admission, under original permission/currentness/session and single-chat-host
  fence, freeze original command/payload and prior/candidate snapshots into panel_undocked_operation.v1:{storage_instance_id}:{scope_partition}:{app_session_id}:{operation_digest},
  schema Plans/panel_event_contracts/panel_undocked_operation.schema.json. A prepared journal has null commit/result/receipt
  refs. The shell may then perform this single host move and verify the actual OS/shell settled state for the same
  session/window, holding all other host moves. Persist the authenticated original outcome and immutable candidate
  snapshot as the committed operation with nonnull owner_commit_ref, result_ref and dispatch_receipt_ref, before
  append. These refs resolve that operation''s original immutable evidence, never live host state after another
  move. If the effect cannot be proven or the commit fails, keep the operation fenced; terminal success is unavailable.
  Transient OS/shell state and redb are not claimed to share a transaction. The journal''s durable commit records
  evidence that the transient move really settled; it is never a saved layout and never instructs restart to restore
  it.


  Explicitly adopt SP-286/CV-339 storage.first_append_receipt.resolve.v2, including the full-value v2 successor,
  genuine original eleven-field first AppendReceipt, retained four-field original_append_result and actual original
  EventRecord. Append only the frozen exact event after durable original commit/readback; independently join instance,
  identity, semantic payload, sequence, segment/offset and durability. Only then CAS committed -> settled with original_append_result_ref
  nonnull and publish terminal success. An uncertain append fences later host mutations. Committed/settled retries
  recover/return the original result and receipt without opening/closing/moving a window or renewing a timestamp.
  Prepared ambiguity remains fenced while the session lives. After verified old-process termination, no transient
  host survives: a prepared operation may become abandoned_uncommitted only with original durable-commit and append
  absence proofs; never infer absence just from a missing window. A committed operation after restart still owes
  append recovery under its original identity, but never restores its candidate host or dispatches a command. A
  settled old-session result is historical evidence, never proof of a current popped-out host. No restart redock
  event is fabricated.


  Custody: the operation is canonical non-rebuildable original audit evidence; it retains frozen prior/candidate
  host observations, immutable result/dispatch refs and first/full-value receipt custody. No raw chat text, title,
  window geometry, credentials, account material or absolute local path enters payload/journal; server-side secret
  screening applies to all strings. Refs grant no access. Disclosure requires current scope membership/source access,
  deletion checks and current host/session proof for any action after returning helpers. Coherent mandatory backup
  includes operations, source EventRecords and genuine original receipts under the same Storage recovery boundary.
  Restored journals are historical evidence only and never input to host restoration. Missing/mixed originals fence
  mutations and disclose unavailable. No event reader can reconstruct deleted chat bodies.


  Newly authored projector.panel_undocked.history@1.0.0 and reader.panel_undocked.history@1.0.0 expose passive record-backed
  History audit only; current host is independently read from the running shell. Checkpoint key panel_undocked_checkpoint.v1:{storage_instance_id}:{scope_partition},
  schema Plans/panel_event_contracts/panel_undocked_checkpoint.schema.json. Explicitly adopt SP-278/DL-076: complete
  CURRENT-selected generic EventRecord index, full nine-field durable token, no persisted redb_snapshot_id; rejoin/authenticate
  actual live snapshot each scan/read/advance. Scan every source sequence through captured frontier, authenticate
  each exact panel.undocked/scope match, and whole-value CAS prior token/publication/state/frontier/last_event_id
  in one derived-redb transaction. Checkpoint is bounded frontier only, never an all-history event_refs array. through_sequence_id
  is complete scanned coverage; last_event_id is last matching event or null. Corrupt/unknown/inadmissible source
  cannot be skipped. Registry absence forbids advance.


  Reader request binds publication_id, complete durable token and unsigned after_sequence_id (0 initially), all
  authenticated as untrusted inputs. Verify Storage instance, server/scope and Project joins, live SP-278 source
  selection and publication state before reading and at disclosure. At most 256 source sequences, 64 exact matching
  refs and 16384 canonical MessagePack response bytes per page; measure the complete response, stopping before an
  unreturned match. A single oversized ref/token is invalid metadata, never silently dropped. Continuation repeats
  exact publication/token and last actually scanned sequence; empty filtered page is incomplete until frontier is
  reached. No history-count or duration cap is added. Invalid/withdrawn token, cursor beyond frontier or missing
  coverage returns unavailable, never empty success. A changed generation needs verified SP-278 translation or a
  verified new publication and restart; no silent substitution. No History call performs a shell action. Rebuild
  stages a separate publication from verified retained CURRENT-selected source, proves coverage then atomically
  withdraws old/publishes new. Source deletion rebuilds retained coverage only. Derived eviction makes History unavailable
  until rebuild; it cannot erase canonical audit.


  Compatibility and withdrawal: immutable Plans/event_payloads/panel_undocked.schema.json is the original 1.0.0
  reader only. Its generic hosts, durable settled_panel_state_ref, layout revisions and optional co-emission are
  historical interpretation, never current chat authority or a new writer. Dispatch reads by the stored payload
  schema id/version, without rewriting events or treating v1 as v2; unknown versions and unverifiable historical
  originals remain unavailable. Current writes require only the exact 2.0.0 schema/contract and their own future
  admission. StorageMigrationCoordinator must install exact new value schemas before activation, with no invented
  store version. Withdrawal closes writer admission first, fences host moves, settles original in-flight obligations
  without repeating OS effects, then CAS marks checkpoint withdrawn. Readers refuse staged/withdrawn publications
  and stale continuations; successor versions require own contract/admission and verified rebuild, never layout
  aliasing.


  SP-340 physical binding: panel_undocked_operation uses canonical MessagePack in canonical redb, settings_and_layout
  advisory canonical budget, maximum 16384 encoded bytes checked before effect/commit; panel_undocked_checkpoint
  uses canonical MessagePack in derived redb, event_log hard derived budget, same maximum. The operation is one
  bounded original receipt, not an accumulating host/history store; oversized metadata is invalid before effects.
  Budget pressure never prunes canonical audit or refuses a canonical write; derived pressure evicts/rebuilds. Retention
  remains PENDING_RETENTION_DECISION independently for event, operation and checkpoint. Case L-3 audit-authority/receipt
  versus telemetry and RP-PROJECTION-3GEN are candidates, not assignments; the saved-layout class is not silently
  applied to this restart-unsaved host transition. No deletion policy is invented. Fixtures Plans/panel_event_contracts/panel_undocked.fixtures.json
  and python3 scripts/pm-panel-event-contracts-check.py supply this family''s positive/negative schema, identity,
  retry, original-custody, history boundary and withdrawal oracles. Native OS/storage atomicity, receipt authenticity,
  SP-278 source proof, crash/recovery, permissions and backup tests remain NOT_RUN.

  Current append and original retry select replay_policy=dedupe_by_idempotency_key; projector_replay_only is compatibility-reader-only and must fail replay_only_not_appendable before any canonical write or effect. EventRecord inline bodies at most 16 KiB; above that use the SP-337 BLAKE3/size/media-type payload_ref, never base64 body stuffing. This does not relax the 16384-byte closed operation/checkpoint maximum: oversized metadata is refused before effects. Identifier patterns require full-string matching, including rejection of a trailing LF; no trimming or normalization. History response is exactly the closed object {publication_id, index_read_token, after_sequence_id, event_refs, complete}; index_read_token is the full nine-field durable token. Measure canonical MessagePack of that entire object for every candidate response, including an empty completion/continuation. Metadata or one matching ref that cannot individually fit returns unavailable without advancing past the match. Static large-valid-token, exact-response-boundary, unpageable-metadata and replay-only negatives do not replace native authorization/byte/CAS proofs.

  For an application-scope invocation, CV-366 idempotency_key is exactly application@1:{hex(server_id)}:{hex(interaction_transaction_id)}. interaction_transaction_id is the original shell owner operation identity, not a retry timestamp; hex encodes the exact UTF-8 bytes in lowercase. An arbitrary caller key is refused. Project-scope original keys retain their existing format. Numbers follow CV-1100 and SP-1100 beside the SP-278, SP-286 and CV-339 profile owners: each schema integer slot admits current_integer within its own bounds with no lane-wide cap, Storage sequences are uint64, and the producer route is qualified JCS; a retained original keeps its write-time recipe, whose authenticated selection is SP-1101. Every retained read and retained retry first resolves its original through the SP-1101 RetainedDispatcher: the sealed Storage custody at the original event_ref, the exact sealed binding and an installed frozen recipe tuple that pins the exact schema bytes of the edition and selects its payload validator; the frozen verifier recomputes the value commitment, family and event identity of the original. An original without custody, with unsealed bytes, a foreign binding or an uninstalled or foreign recipe refuses as unavailable or unsupported, with no fallback, caller selection or current-then-legacy probing. Timestamps follow CV-1101 with the owner profile of each field (CV-253 storage_utc_z for the two Storage-assigned EventRecord instants it binds).'
gui_related: false
gui_classification_reason: Event custody and validation, no new UI.
split_recommended: false
depends_on:
- CV-361
- SP-330
- SP-278
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- SP-665 binds only its explicitly named exact family, prepared without admission; native execution NOT_RUN.
- Exact event admission precedes effects; retention remains PENDING_RETENTION_DECISION.
validation_surfaces:
- python3 scripts/pm-panel-event-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: chat_panel_event_authority
implementation_surfaces:
- Plans/storage-plan.md
- Plans/panel_event_contracts/
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Contracts_V0.md#CV-361
- Plans/storage-plan.md#SP-330
preserved_exact_tokens:
- PENDING_RETENTION_DECISION
- SP-278
- SP-286
negative_constraints:
- No event admission, saved pop-out host, Home revision advance, replayed OS window effect, retention decision or
  native execution proof.
```

### SP-666 - concern.created authorized original creation and History custody

```yaml
plan_unit_id: SP-666
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored owner contract for concern.created 1.0.0 under DL-045, prepared without admission.
  Semantic authority remains Orchestrator_Page OP-002/OP-004 and Executor_Protocol: runtime, package overseer, seam
  overseer, corroboration outcome and graph-patch logic may create canonical concerns. Workers nominate; they cannot
  directly mint concern records. The owner labels User, External Resource and Recovery do not grant direct creation.
  This contract adds no creator and decides none of the six stopped action/confirmation questions. Only cmd.concern.create
  through handlers::concern::create commits this family, after independently authenticating one of those five creator
  identities, its actual scope and current source/authority/permission evidence. A nomination is source evidence
  until an already authorized creator accepts it; acceptance does not grant the nominator a creator role. UI navigation/acknowledge/dismiss
  and true HITL rules remain OP-002''s narrow GUI/runtime split.


  Payload route CV-686 selects the existing closed Plans/event_payloads/concern/concern_created.schema.json, pm.concern_event.concern_created.schema.v1,
  version 1.0.0. Birth is absent -> active at concern_revision=1, never acknowledged/resolved/dismissed, never a
  source-event or projection rewrite. Creator is distinct from accountable owner and resolver. Existing active/acknowledged
  concerns with the same subject/category/owner follow the existing update rule; do not mint another birth to evade
  it. The corresponding update event/action remains stopped pending its own authority contract. A duplicate original
  key returns its original result, not an update or another birth. Refusal, missing permission/currentness, stale
  source, conflict, existing concern key, no change or failed persistence emits nothing. A source sighting is not
  itself concern.created.


  Identity: Project-only EventRecord 2.0.0, scope_kind=project, envelope project_id equals payload and original
  command project_id; the exact reversible partition is project~base64url_no_pad(UTF8(project_id)). No application/default/focus
  Project fallback is added. H is lowercase SHA-256 of canonical MessagePack [storage_instance_id, project_id, "concern.created",
  idempotency_key]. operation_digest=H, event_id=evt_concern_created_H, and the originally allocated concern_id=concern_H.
  Persist that identity once; no retry clock/randomness can remint it. concern_record_ref is exactly pmref:concern_record:{project_id}/{concern_id}/r1
  and resolves the immutable original revision-one snapshot, not a later current value. Payload actor_ref=created_by_ref=the
  original authenticated creator; ts is original accepted creation time. Envelope actor/correlation/idempotency/occurred_at
  joins payload, ts for occurrence. Thread/run/node/attempt/account/parent/causation joins use independently authenticated
  original context or explicit null; do not infer envelope run_id by parsing an opaque run_ref. Redaction profile
  is secret_refs_only; current writer/retry selects replay_policy=dedupe_by_idempotency_key. projector_replay_only
  is compatibility-reader-only and is refused as replay_only_not_appendable before any write or effect.


  Frozen operation schema Plans/concern_created_contracts/concern_created_operation.schema.json closes the original
  normalized owner command, complete candidate payload, prior_record=null and complete candidate_record. The normalized
  original_command retains cmd.concern.create''s exact project/severity/category/source_refs/idempotency key and
  a title_ref resolving its exact original title bytes, plus the authenticated creator/authority/permission/currentness
  and already resolved owner/classification context. This is private owner custody, not an expanded public command
  signature or a new authority policy. title_ref and record.summary resolve the same original bounded/ref-only summary
  source; no lossy title normalization or mutable source replacement. Every ref is authenticated and commits to
  immutable original body identity, including SP-337 BLAKE3 id/byte size/media type for packed detail. Request digest
  is lowercase SHA-256 of canonical MessagePack of the exact closed preimage {original_command: operation.original_command,
  candidate_payload: operation.payload, candidate_record: operation.candidate_record}. Every field participates.
  Same scoped event/idempotency identity with any unequal original command, payload, record or digest is idempotency_conflict
  before effects; authoritative dedupe unavailable is dedupe_unavailable with zero effect. Identity joins cannot
  be repaired by hashing another actor''s evidence.


  Ordering: authenticate the exact event-family registry admission FIRST under original Project permission/currentness
  and owner single-writer fences. This family is currently absent: deny before journal, record/body write, append
  or checkpoint advance. On future admission, resolve immutable original source and accepted command, secret-screen
  all strings and verify key absence plus the existing same-subject rule. Freeze the prepared original in concern_created_operation.v1:{project_id}:{operation_digest};
  all four commit/result/receipt refs are null. Full absence CAS creates concern_record.v1:{project_id}:{concern_id}
  at revision one and commits its complete candidate snapshot plus committed operation in ONE canonical-redb owner
  transaction under the same source/permission fence. committed has nonnull owner_commit_ref, result_ref and dispatch_receipt_ref,
  with original_append_result_ref=null. If body dependencies are needed, durably commit/authenticate them before
  that atomic owner transaction; unreachable orphan body cleanup is Storage-owned and no event success follows.
  If the atomic boundary cannot be provided, creation stays unavailable. Commit evidence authenticates the original
  immutable revision-one record and original command result; a later concern revision cannot substitute for it.


  Explicitly adopt SP-286/CV-339 storage.first_append_receipt.resolve.v2, including the full-value v2 successor,
  genuine original eleven-field first AppendReceipt, retained four-field original_append_result and actual original
  EventRecord. Append the frozen candidate only after authenticated original owner commit/readback. Independently
  join Storage instance, identity, semantic digest/payload, sequence, segment/offset and durability. Only then whole-value
  CAS committed -> settled with all four original refs nonnull and publish terminal success. Uncertain append fences
  related mutations; recovery resolves the ORIGINAL receipt/identity and never recreates the record, changes owner/severity,
  executes a sibling action, reaccepts a nomination or renews ts. Prepared may abandon only after authenticated
  original commit/append absence proofs; ambiguity remains fenced. Committed retries recover append; settled retries
  return the original record ref/result/receipt. Replay and History never dispatch cmd.concern.create.


  The formerly deferred concern_record key keeps its existing identity. Its newly authored complete encoding is
  Plans/concern_created_contracts/concern_record.schema.json, pm.storage_value.concern_record.v1, 1.0.0. It carries
  the shared record envelope/minimum concern fields with a ref-valued summary, source/evidence/artifact/lineage
  refs, subject/run/scope, severity/category/status, visibility/attention/chatworthy/blocking-effect context, and
  separate creator/owner/resolver fields. The original command''s owner context supplies these values; this technical
  materialization assigns no new roles, severity consequences, confirmation policy or user-visible behavior. concern_category
  joins payload category; creator_ref and created_by_ref join the original creator; source_event_refs join source_refs;
  created_at=updated_at=payload ts for birth. resolution_kind/resolver_ref/resolved_at are null at birth. OP-004''s
  four status values and eight resolution_kind values remain authoritative; no fifth lifecycle state is added from
  stale consumer prose. Later action schemas still need their own settled owner/authority contracts; this encoding
  grants none. concern_source_event_ref/source_event_refs, canonical record and concern_projection stay distinct.
  A current Orchestrator action reads/revalidates the actual canonical concern record and current source/permissions,
  never a History row or page-local status.


  Custody: canonical record and original operation are non-rebuildable original authority. Preserve immutable original
  candidate, source/detail dependencies, accepted command and genuine first/full-value receipt custody. Coherent
  mandatory backup/restore includes all of them with the original Storage source under one verified recovery boundary.
  Missing/mixed-instance originals fence creation and disclose unavailable; a projection cannot recreate lost authority.
  Refs/IDs/digests grant no access. At read/disclosure and after returning helpers, revalidate current Project membership,
  source/body permission, deletion tombstones, original source selection and withdrawal. Never resurrect deleted
  source content from a History ref. No raw title, private rationale, source text, credentials, account material
  or absolute local path is copied into event/journal/checkpoint; ref resolution remains owner-governed.


  Newly authored projector.concern_created.history@1.0.0 and reader.concern_created.history@1.0.0 expose passive
  record-backed History audit refs for this exact family only. Checkpoint concern_created_checkpoint.v1:{project_id}:{storage_instance_id},
  schema Plans/concern_created_contracts/concern_created_checkpoint.schema.json. Explicitly adopt SP-278/DL-076:
  complete CURRENT-selected generic EventRecord index and full nine-field durable index_read_token, no persisted
  redb_snapshot_id. Authenticate/rejoin actual live redb snapshot and Storage/source_selection instance each scan/read/advance.
  Scan every source sequence through the captured frontier, authenticate each exact Project/concern.created payload
  and original receipt, and whole-value CAS prior token/publication/state/frontier/last_event_id to verified coverage
  in ONE derived-redb transaction. through_sequence_id is complete scanned coverage, last_event_id is last match
  or null. No event_refs array or accumulating manifest is persisted; registry absence forbids advance. Corrupt,
  unknown-version or inadmissible source is unavailable, never skipped.


  History request contains exact publication_id, complete durable token and unsigned after_sequence_id (0 initially).
  Return the exact closed object {publication_id, index_read_token, after_sequence_id, event_refs, complete}. Authenticate
  original publication/token, exact scope/Storage/source-generation, source access/deletion and live snapshot before
  read and at disclosure. Scan at most 256 source sequences and return at most 64 matching refs and 16384 canonical
  MessagePack bytes of the COMPLETE response. Stop before an unreturned match; an individually unpageable ref or
  metadata value returns unavailable with no skipped match. Empty filtered pages continue with last actually scanned
  sequence until complete=true at verified frontier, never empty success merely because a budget expired. Cursor
  beyond frontier, stale/withdrawn publication or missing coverage is unavailable. Source-generation change requires
  SP-278 verified translation or verified new publication and restarted traversal, never silent token substitution.
  This bounds each response, not retained History. Readers perform no mutation/dispatch and do not advance the persisted
  checkpoint.


  Rebuild stages a separate publication from retained verified CURRENT-selected source and proves complete coverage
  before atomically withdrawing old/publishing new. Legal source deletion rebuilds retained refs only. Withdrawal
  closes this family''s writer admission, fences new creations, settles original in-flight obligations under original
  evidence without redoing creation, then CAS marks its checkpoint withdrawn. Readers refuse staged/withdrawn publications
  and stale continuations. Compatibility: only the exact current payload 1.0.0 and declared value schemas are selected;
  unknown/old unversioned/deferred placeholder values are unavailable until StorageMigrationCoordinator''s governed
  validation/recovery, never guessed upgraded. It installs these exact schemas before activation, without an invented
  store version. Any future event version needs its own contract/admission and verified rebuild; no sibling or alias
  admission, historical rewrite or automatic retention/deletion follows.


  Numbers follow CV-1100 and SP-1100 beside the SP-278, SP-286 and CV-339 profile owners: each schema integer slot admits current_integer within its own bounds with no lane-wide cap, Storage sequences are uint64, and the producer route is qualified JCS; a retained original keeps its write-time recipe, whose authenticated selection is SP-1101. Every retained read and retained retry first resolves its original through the SP-1101 RetainedDispatcher: the sealed Storage custody at the original event_ref, the exact sealed binding and an installed frozen recipe tuple that pins the exact schema bytes of the edition and selects its payload validator; the frozen verifier recomputes the value commitment, family and event identity of the original. An original without custody, with unsealed bytes, a foreign binding or an uninstalled or foreign recipe refuses as unavailable or unsupported, with no fallback, caller selection or current-then-legacy probing. Timestamps follow CV-1101 with the owner profile of each field (CV-253 storage_utc_z for the two Storage-assigned EventRecord instants it binds).


  SP-340 physical binding: concern_created_operation uses canonical MessagePack in canonical redb, coordination_and_storage
  advisory budget. concern_record preserves its existing canonical-redb/runs_and_goals profile, 16384-byte maximum
  and unchanged group budget. concern_created_checkpoint uses derived redb/event_log hard budget. Each complete
  value is at most 16384 encoded bytes before journal/CAS/commit; unpageable metadata is invalid, never truncated.
  Body content above EventRecord''s 16 KiB inline cap uses SP-337 payload_ref (BLAKE3 id, byte size, media type),
  never inline base64. Original title/detail refs retain the same immutable bytes; canonical budget pressure neither
  prunes authority nor authorizes loss, derived eviction makes History unavailable until rebuild. Existing concern_record
  retention_policy_ref=RP-AUTHORITY-INDEFINITE and linked-source/blocked-episode holds are preserved from its current
  registry row; this is no extension to a different event. Event, original operation and History checkpoint remain
  independently PENDING_RETENTION_DECISION, with Case L-3 audit-authority/ordinary telemetry and RP-PROJECTION-3GEN
  only candidates for RT. No expiration/deletion decision is invented. Identifier patterns match entire strings
  including trailing-LF refusal, with no trimming. Fixtures Plans/concern_created_contracts/concern_created.fixtures.json
  and python3 scripts/pm-concern-created-contracts-check.py cover the exact family. Native source/creator/permission
  authentication, atomic create/commit/CAS, genuine append/receipts, crash recovery, rebuild/withdrawal and coherent
  backup/deletion remain NOT_RUN. Nothing here admits an event or makes a native writer available.'
gui_related: false
gui_classification_reason: Event identity, authority, custody and storage contract; existing GUI action model is
  preserved.
split_recommended: false
depends_on:
- OP-002
- OP-004
- SP-278
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- concern.created is prepared without admission; no writer/checkpoint/effect while absent.
- No additional creator or sibling action authority; retention pending and native execution NOT_RUN.
validation_surfaces:
- python3 scripts/pm-concern-created-contracts-check.py
risk_class: event_authority
reasoning_tier: high
context_scope: concern_created
implementation_surfaces:
- Plans/concern_created_contracts/
- Plans/event_payloads/concern/concern_created.schema.json
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/Orchestrator_Page.md#OP-002
- Plans/Orchestrator_Page.md#OP-004
- Plans/Executor_Protocol.md
- Plans/UI_Command_Catalog.md#UCC-147
preserved_exact_tokens:
- concern.created
- SP-278
- SP-286
- PENDING_RETENTION_DECISION
negative_constraints:
- No creator expansion, worker direct creation, admission, sibling action grants, retention decision or native proof.

```


### SP-760 - browser.session.created storage and read custody

```yaml
plan_unit_id: SP-760
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage owner contract for exactly browser.session.created@1.0.0 under DL-045; prepared
  without admission. SMPFS-244 and CV-780 own its real transition and exact identity. Reuse the existing EventRecord
  canonical seglog plus event_record_index, never a second event log or new canonical session/gist store. Explicitly
  adopt SP-026/SP-236 first-native wire, SP-278 full generic index/read selection, SP-286/CV-339 full-value v2 first
  receipt and recovery, and SP-337 payload custody. Each closed metadata payload in Plans/card2_event_payloads.schema.json#/$defs/browser_session_created
  is bounded below 16 KiB even at all maximum lengths (browser <=4096 bytes; memory <=6144 bytes). No inline base64
  or embedded body is permitted; if a future separately governed successor needs a larger body, it must use SP-337
  BLAKE3 pack payload_ref with id, byte size and media type, durable bytes before acknowledgment, never an enlarged
  inline limit.

  Exact retention_policy_ref is RP-AUTHORITY-INDEFINITE@1.0.0, by the per-name G03/G10 assignment landed as
  Plans/Decision_Log.md#DL-401 in Case L-3, Card 1 retention assignments (G10 for this exact browser.session name);
  lineage pin 2663667e14346235daaa561d193e959422640b6e:Plans/storage-plan.md#retention-authority-and-defaults, its
  source hash pinned in the DCN report. This is a citation and adoption of that assignment, not
  another retention choice. That Storage text governs holds, backups, Project-data deletion and storage-pressure
  refusal, and this contract does not restate different terms. Metadata outlives the subject as assigned; it never
  keeps the subject''s body alive merely to render history. Resolve each body/evidence ref only through the current
  owner access/deletion gates, showing unavailable redacted metadata when lawful; never resurrect deleted content.
  The canonical original transition/operation result, event obligation, event/receipt custody and referent custody
  are backed up/restored coherently through the existing Project memory/browser stores or CV-366 full application
  source graph and Full Server Backup. Restore verifies original storage/scope/server/Computer/subject identity,
  version, cutoffs and receipt commitments before new append or read. Memory still obeys AMS-054 thread-private
  custody; Browser excludes protected authentication profiles and sessions. Live references and holds follow their
  existing owners, not a new retention floor.

  browser.session.created is read by reader.browser.session.created.history@1.0.0 for the existing manual Browser
  history consumers, without driving a browser, granting a controller lease, or recreating a process. This reader
  explicitly adopts SP-278 and reader.storage.event_record_index@1.0.0. It reuses projector.storage.event_record_index@1.0.0
  only for complete generic metadata indexing: checkpoints table, key event_record_index_checkpoint.v1:{storage_instance_id},
  the uniquely current #/generations/{generation_id} value in Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint,
  and event_record_index.v2@{generation_id}. Verify the original generation birth anchor and actual complete coverage,
  including nonmatching application/Project rows, not a matching-row maximum. Resolve exact scope partition, event_type,
  event_id, sequence_id, publication_locator, source frame/CRC and payload commitment in one redb snapshot under
  the actual CURRENT/manifest maintenance fence. The complete SP-278 live read token contains storage_instance_id,
  checkpoint_key, checkpoint_ref, generation_id, generation_anchor_sha256, frontier_revision, frontier_sha256, index_dataset_name,
  source_selection and live redb_snapshot_id. A persisted read token is only its nine-field durable projection under
  DL-076; no redb_snapshot_id is stored. source_selection binds storage_instance_id, CURRENT path/bytes, selected
  segment generation, manifest path/bytes/generation, recovery epoch, survivor prefix, retained inventory, durable
  watermarks, excluded ranges and retired inputs. Generation-only comparison is insufficient: a same-generation
  frontier change invalidates publication. Revalidate access, deletion and that complete token at disclosure; changed
  fences discard the answer. The generic owner''s checkpoint CAS/complete-source transaction remains SP-278''s,
  not this reader''s. Family checkpoint disposition is none_required: the family creates no projector, durable history
  view, family checkpoint, cursor or ACK; its sole effect is an ephemeral read answer. It never writes or advances
  the generic checkpoint. Crash/rebuild reacquires the generic index and recomputes the answer, never reruns an
  owner command, emits an event, restores a lease, charges Usage or injects a prompt. Historical validation evaluates
  the genuine original committed transition under its original schema/policy; disappearance or changed current state
  of the live subject does not invalidate a retained event. Withdrawn or forged sources still refuse.

  No new durable family projection/checkpoint exists, so there is no derived retention object to assign; the unchanged
  generic index/checkpoint retains its own SP-278 policy. No registry admission, storage registry family, duplicate
  mirror, policy object, Spec Lock or governance refresh is implied.

  Recompute checkpoint commitments from genuine Storage source bytes and records, never from two matching
  caller token copies. SHA-256 the exact CURRENT and manifest bytes. Apply the unchanged SP-278 canonical
  MessagePack binding codec to its source-value commitments, birth anchor, generation identity and current frontier;
  verify all source selection generations/epoch against decoded owner controls. Independently join token Storage
  identity to this event, source identity to token identity, checkpoint key/reference and dataset to the selected
  generation. A valid checkpoint from another Storage database is still foreign. Recompute every hash even when
  capture and disclosure tokens agree. Source adapters, frame validation, complete coverage and authentic generation
  admission remain native obligations; synthetic fixture bytes are explicit owner-codec witnesses, never production
  control encodings. Do not require obsolete birth CURRENT/manifest files to survive beyond SP-278 custody.

  Numbers, sweep 2026-11-10 (SP-1100 beside the unchanged SP-026/SP-236 and SP-278 profiles):
  browser.session.created sequence_id in the EventRecord, the receipt and every join is exact uint64
  (storage_uint64), never capped at 2^53 and never part of producer semantics. Joins compare typed values exactly:
  an integer never equals a float and signed zero is kept. The browser_session_state.v1 source facts keep their
  physical domains: viewport width and height are u32, scroll position and zoom are finite f64 (an integer only
  when exactly representable). SP-278 binding values stay uint-only. Retained originals, sweep 2026-11-11 (SP-1101
  beside SP-236, SP-278 and SP-286): a retry original or a retained read resolves once through the shared
  RetainedDispatcher from Storage''s sealed write custody (static stand-in Plans/card2_original_custody.json)
  before any original check. A Store outside that custody is original_unavailable and a sealed recipe with no
  installed frozen verifier is recipe_unknown, with no fallback. The sealed card2@1 tuple pins the EventRecord and
  family payload schema bytes and the CV-1101 field profiles (event_record for occurred_at_utc and ts, CV-253
  storage_utc_z for observed_at_utc and persisted_at_utc), so a replaced resource or a weakened profile installs no
  verifier for it. Native custody, durability and admission remain NOT_RUN.
'
gui_related: false
gui_classification_reason: Defines event semantics, metadata and custody for existing behavior; no visual presentation.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-366
unblocks: []
acceptance_criteria:
- owner_change_id is the authenticated canonical change identity shared across overlapping owner routes, never an after-record reference. Same operation and owner_change_id cannot record the same fact in both vocabularies; distinct real changes retain distinct identities.
- Exact source/index/token/identity/scope and no-effect read oracles pass.
- Retained reads ignore changed live state but refuse withdrawn/forged sources and deleted body disclosure.
validation_surfaces:
- python3 scripts/pm_card2_events.py
- Plans/card2_event_fixtures.json
- Plans/card2_event_payloads.schema.json
risk_class: duplicate_or_unauthenticated_card2_event_history
reasoning_tier: high
context_scope: event_authority_card2_sp-760
implementation_surfaces:
- Plans/storage-plan.md
- Plans/card2_event_contracts.json
- Plans/card2_event_payloads.schema.json
node_compile_hint:
  mode: prepared_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-1.as-presented-578a6774.md
preserved_exact_tokens:
- browser.session.created
negative_constraints:
- Preparation is not admission, native execution, checkpoint authority, readiness, or a governance seal.
- No registry entry, Decision Log entry, retention policy or competing-owner decision is created.
```


### SP-761 - browser.session.state_changed storage and read custody

```yaml
plan_unit_id: SP-761
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage owner contract for exactly browser.session.state_changed@1.0.0 under DL-045;
  prepared without admission. SMPFS-245 and CV-781 own its real transition and exact identity. Reuse the existing
  EventRecord canonical seglog plus event_record_index, never a second event log or new canonical session/gist store.
  Explicitly adopt SP-026/SP-236 first-native wire, SP-278 full generic index/read selection, SP-286/CV-339 full-value
  v2 first receipt and recovery, and SP-337 payload custody. Each closed metadata payload in Plans/card2_event_payloads.schema.json#/$defs/browser_session_state_changed
  is bounded below 16 KiB even at all maximum lengths (browser <=4096 bytes; memory <=6144 bytes). No inline base64
  or embedded body is permitted; if a future separately governed successor needs a larger body, it must use SP-337
  BLAKE3 pack payload_ref with id, byte size and media type, durable bytes before acknowledgment, never an enlarged
  inline limit.

  Exact retention_policy_ref is RP-AUTHORITY-INDEFINITE@1.0.0, by the per-name G03/G10 assignment landed as
  Plans/Decision_Log.md#DL-401 in Case L-3, Card 1 retention assignments (G10 for this exact browser.session name);
  lineage pin 2663667e14346235daaa561d193e959422640b6e:Plans/storage-plan.md#retention-authority-and-defaults, its
  source hash pinned in the DCN report. This is a citation and adoption of that assignment, not
  another retention choice. That Storage text governs holds, backups, Project-data deletion and storage-pressure
  refusal, and this contract does not restate different terms. Metadata outlives the subject as assigned; it never
  keeps the subject''s body alive merely to render history. Resolve each body/evidence ref only through the current
  owner access/deletion gates, showing unavailable redacted metadata when lawful; never resurrect deleted content.
  The canonical original transition/operation result, event obligation, event/receipt custody and referent custody
  are backed up/restored coherently through the existing Project memory/browser stores or CV-366 full application
  source graph and Full Server Backup. Restore verifies original storage/scope/server/Computer/subject identity,
  version, cutoffs and receipt commitments before new append or read. Memory still obeys AMS-054 thread-private
  custody; Browser excludes protected authentication profiles and sessions. Live references and holds follow their
  existing owners, not a new retention floor.

  browser.session.state_changed is read by reader.browser.session.state_changed.history@1.0.0 for the existing manual
  Browser history consumers, without driving a browser, granting a controller lease, or recreating a process. This
  reader explicitly adopts SP-278 and reader.storage.event_record_index@1.0.0. It reuses projector.storage.event_record_index@1.0.0
  only for complete generic metadata indexing: checkpoints table, key event_record_index_checkpoint.v1:{storage_instance_id},
  the uniquely current #/generations/{generation_id} value in Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint,
  and event_record_index.v2@{generation_id}. Verify the original generation birth anchor and actual complete coverage,
  including nonmatching application/Project rows, not a matching-row maximum. Resolve exact scope partition, event_type,
  event_id, sequence_id, publication_locator, source frame/CRC and payload commitment in one redb snapshot under
  the actual CURRENT/manifest maintenance fence. The complete SP-278 live read token contains storage_instance_id,
  checkpoint_key, checkpoint_ref, generation_id, generation_anchor_sha256, frontier_revision, frontier_sha256, index_dataset_name,
  source_selection and live redb_snapshot_id. A persisted read token is only its nine-field durable projection under
  DL-076; no redb_snapshot_id is stored. source_selection binds storage_instance_id, CURRENT path/bytes, selected
  segment generation, manifest path/bytes/generation, recovery epoch, survivor prefix, retained inventory, durable
  watermarks, excluded ranges and retired inputs. Generation-only comparison is insufficient: a same-generation
  frontier change invalidates publication. Revalidate access, deletion and that complete token at disclosure; changed
  fences discard the answer. The generic owner''s checkpoint CAS/complete-source transaction remains SP-278''s,
  not this reader''s. Family checkpoint disposition is none_required: the family creates no projector, durable history
  view, family checkpoint, cursor or ACK; its sole effect is an ephemeral read answer. It never writes or advances
  the generic checkpoint. Crash/rebuild reacquires the generic index and recomputes the answer, never reruns an
  owner command, emits an event, restores a lease, charges Usage or injects a prompt. Historical validation evaluates
  the genuine original committed transition under its original schema/policy; disappearance or changed current state
  of the live subject does not invalidate a retained event. Withdrawn or forged sources still refuse.

  No new durable family projection/checkpoint exists, so there is no derived retention object to assign; the unchanged
  generic index/checkpoint retains its own SP-278 policy. No registry admission, storage registry family, duplicate
  mirror, policy object, Spec Lock or governance refresh is implied.

  Recompute checkpoint commitments from genuine Storage source bytes and records, never from two matching
  caller token copies. SHA-256 the exact CURRENT and manifest bytes. Apply the unchanged SP-278 canonical
  MessagePack binding codec to its source-value commitments, birth anchor, generation identity and current frontier;
  verify all source selection generations/epoch against decoded owner controls. Independently join token Storage
  identity to this event, source identity to token identity, checkpoint key/reference and dataset to the selected
  generation. A valid checkpoint from another Storage database is still foreign. Recompute every hash even when
  capture and disclosure tokens agree. Source adapters, frame validation, complete coverage and authentic generation
  admission remain native obligations; synthetic fixture bytes are explicit owner-codec witnesses, never production
  control encodings. Do not require obsolete birth CURRENT/manifest files to survive beyond SP-278 custody.

  Numbers, sweep 2026-11-10 (SP-1100 beside the unchanged SP-026/SP-236 and SP-278 profiles):
  browser.session.state_changed sequence_id in the EventRecord, the receipt and every join is exact uint64
  (storage_uint64), never capped at 2^53 and never part of producer semantics. Joins compare typed values exactly:
  an integer never equals a float and signed zero is kept. The browser_session_state.v1 source facts keep their
  physical domains: viewport width and height are u32, scroll position and zoom are finite f64 (an integer only
  when exactly representable). SP-278 binding values stay uint-only. Retained originals, sweep 2026-11-11 (SP-1101
  beside SP-236, SP-278 and SP-286): a retry original or a retained read resolves once through the shared
  RetainedDispatcher from Storage''s sealed write custody (static stand-in Plans/card2_original_custody.json)
  before any original check. A Store outside that custody is original_unavailable and a sealed recipe with no
  installed frozen verifier is recipe_unknown, with no fallback. The sealed card2@1 tuple pins the EventRecord and
  family payload schema bytes and the CV-1101 field profiles (event_record for occurred_at_utc and ts, CV-253
  storage_utc_z for observed_at_utc and persisted_at_utc), so a replaced resource or a weakened profile installs no
  verifier for it. Native custody, durability and admission remain NOT_RUN.
'
gui_related: false
gui_classification_reason: Defines event semantics, metadata and custody for existing behavior; no visual presentation.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-366
unblocks: []
acceptance_criteria:
- owner_change_id is the authenticated canonical change identity shared across overlapping owner routes, never an after-record reference. Same operation and owner_change_id cannot record the same fact in both vocabularies; distinct real changes retain distinct identities.
- Exact source/index/token/identity/scope and no-effect read oracles pass.
- Retained reads ignore changed live state but refuse withdrawn/forged sources and deleted body disclosure.
validation_surfaces:
- python3 scripts/pm_card2_events.py
- Plans/card2_event_fixtures.json
- Plans/card2_event_payloads.schema.json
risk_class: duplicate_or_unauthenticated_card2_event_history
reasoning_tier: high
context_scope: event_authority_card2_sp-761
implementation_surfaces:
- Plans/storage-plan.md
- Plans/card2_event_contracts.json
- Plans/card2_event_payloads.schema.json
node_compile_hint:
  mode: prepared_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-1.as-presented-578a6774.md
preserved_exact_tokens:
- browser.session.state_changed
negative_constraints:
- Preparation is not admission, native execution, checkpoint authority, readiness, or a governance seal.
- No registry entry, Decision Log entry, retention policy or competing-owner decision is created.
```


### SP-762 - browser.session.closed storage and read custody

```yaml
plan_unit_id: SP-762
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage owner contract for exactly browser.session.closed@1.0.0 under DL-045; prepared
  without admission. SMPFS-246 and CV-782 own its real transition and exact identity. Reuse the existing EventRecord
  canonical seglog plus event_record_index, never a second event log or new canonical session/gist store. Explicitly
  adopt SP-026/SP-236 first-native wire, SP-278 full generic index/read selection, SP-286/CV-339 full-value v2 first
  receipt and recovery, and SP-337 payload custody. Each closed metadata payload in Plans/card2_event_payloads.schema.json#/$defs/browser_session_closed
  is bounded below 16 KiB even at all maximum lengths (browser <=4096 bytes; memory <=6144 bytes). No inline base64
  or embedded body is permitted; if a future separately governed successor needs a larger body, it must use SP-337
  BLAKE3 pack payload_ref with id, byte size and media type, durable bytes before acknowledgment, never an enlarged
  inline limit.

  Exact retention_policy_ref is RP-AUTHORITY-INDEFINITE@1.0.0, by the per-name G03/G10 assignment landed as
  Plans/Decision_Log.md#DL-401 in Case L-3, Card 1 retention assignments (G10 for this exact browser.session name);
  lineage pin 2663667e14346235daaa561d193e959422640b6e:Plans/storage-plan.md#retention-authority-and-defaults, its
  source hash pinned in the DCN report. This is a citation and adoption of that assignment, not
  another retention choice. That Storage text governs holds, backups, Project-data deletion and storage-pressure
  refusal, and this contract does not restate different terms. Metadata outlives the subject as assigned; it never
  keeps the subject''s body alive merely to render history. Resolve each body/evidence ref only through the current
  owner access/deletion gates, showing unavailable redacted metadata when lawful; never resurrect deleted content.
  The canonical original transition/operation result, event obligation, event/receipt custody and referent custody
  are backed up/restored coherently through the existing Project memory/browser stores or CV-366 full application
  source graph and Full Server Backup. Restore verifies original storage/scope/server/Computer/subject identity,
  version, cutoffs and receipt commitments before new append or read. Memory still obeys AMS-054 thread-private
  custody; Browser excludes protected authentication profiles and sessions. Live references and holds follow their
  existing owners, not a new retention floor.

  browser.session.closed is read by reader.browser.session.closed.history@1.0.0 for the existing manual Browser
  history consumers, without driving a browser, granting a controller lease, or recreating a process. This reader
  explicitly adopts SP-278 and reader.storage.event_record_index@1.0.0. It reuses projector.storage.event_record_index@1.0.0
  only for complete generic metadata indexing: checkpoints table, key event_record_index_checkpoint.v1:{storage_instance_id},
  the uniquely current #/generations/{generation_id} value in Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint,
  and event_record_index.v2@{generation_id}. Verify the original generation birth anchor and actual complete coverage,
  including nonmatching application/Project rows, not a matching-row maximum. Resolve exact scope partition, event_type,
  event_id, sequence_id, publication_locator, source frame/CRC and payload commitment in one redb snapshot under
  the actual CURRENT/manifest maintenance fence. The complete SP-278 live read token contains storage_instance_id,
  checkpoint_key, checkpoint_ref, generation_id, generation_anchor_sha256, frontier_revision, frontier_sha256, index_dataset_name,
  source_selection and live redb_snapshot_id. A persisted read token is only its nine-field durable projection under
  DL-076; no redb_snapshot_id is stored. source_selection binds storage_instance_id, CURRENT path/bytes, selected
  segment generation, manifest path/bytes/generation, recovery epoch, survivor prefix, retained inventory, durable
  watermarks, excluded ranges and retired inputs. Generation-only comparison is insufficient: a same-generation
  frontier change invalidates publication. Revalidate access, deletion and that complete token at disclosure; changed
  fences discard the answer. The generic owner''s checkpoint CAS/complete-source transaction remains SP-278''s,
  not this reader''s. Family checkpoint disposition is none_required: the family creates no projector, durable history
  view, family checkpoint, cursor or ACK; its sole effect is an ephemeral read answer. It never writes or advances
  the generic checkpoint. Crash/rebuild reacquires the generic index and recomputes the answer, never reruns an
  owner command, emits an event, restores a lease, charges Usage or injects a prompt. Historical validation evaluates
  the genuine original committed transition under its original schema/policy; disappearance or changed current state
  of the live subject does not invalidate a retained event. Withdrawn or forged sources still refuse.

  No new durable family projection/checkpoint exists, so there is no derived retention object to assign; the unchanged
  generic index/checkpoint retains its own SP-278 policy. No registry admission, storage registry family, duplicate
  mirror, policy object, Spec Lock or governance refresh is implied.

  Recompute checkpoint commitments from genuine Storage source bytes and records, never from two matching
  caller token copies. SHA-256 the exact CURRENT and manifest bytes. Apply the unchanged SP-278 canonical
  MessagePack binding codec to its source-value commitments, birth anchor, generation identity and current frontier;
  verify all source selection generations/epoch against decoded owner controls. Independently join token Storage
  identity to this event, source identity to token identity, checkpoint key/reference and dataset to the selected
  generation. A valid checkpoint from another Storage database is still foreign. Recompute every hash even when
  capture and disclosure tokens agree. Source adapters, frame validation, complete coverage and authentic generation
  admission remain native obligations; synthetic fixture bytes are explicit owner-codec witnesses, never production
  control encodings. Do not require obsolete birth CURRENT/manifest files to survive beyond SP-278 custody.

  Numbers, sweep 2026-11-10 (SP-1100 beside the unchanged SP-026/SP-236 and SP-278 profiles):
  browser.session.closed sequence_id in the EventRecord, the receipt and every join is exact uint64
  (storage_uint64), never capped at 2^53 and never part of producer semantics. Joins compare typed values exactly:
  an integer never equals a float and signed zero is kept. The browser_session_state.v1 source facts keep their
  physical domains: viewport width and height are u32, scroll position and zoom are finite f64 (an integer only
  when exactly representable). SP-278 binding values stay uint-only. Retained originals, sweep 2026-11-11 (SP-1101
  beside SP-236, SP-278 and SP-286): a retry original or a retained read resolves once through the shared
  RetainedDispatcher from Storage''s sealed write custody (static stand-in Plans/card2_original_custody.json)
  before any original check. A Store outside that custody is original_unavailable and a sealed recipe with no
  installed frozen verifier is recipe_unknown, with no fallback. The sealed card2@1 tuple pins the EventRecord and
  family payload schema bytes and the CV-1101 field profiles (event_record for occurred_at_utc and ts, CV-253
  storage_utc_z for observed_at_utc and persisted_at_utc), so a replaced resource or a weakened profile installs no
  verifier for it. Native custody, durability and admission remain NOT_RUN.
'
gui_related: false
gui_classification_reason: Defines event semantics, metadata and custody for existing behavior; no visual presentation.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-366
unblocks: []
acceptance_criteria:
- owner_change_id is the authenticated canonical change identity shared across overlapping owner routes, never an after-record reference. Same operation and owner_change_id cannot record the same fact in both vocabularies; distinct real changes retain distinct identities.
- Exact source/index/token/identity/scope and no-effect read oracles pass.
- Retained reads ignore changed live state but refuse withdrawn/forged sources and deleted body disclosure.
validation_surfaces:
- python3 scripts/pm_card2_events.py
- Plans/card2_event_fixtures.json
- Plans/card2_event_payloads.schema.json
risk_class: duplicate_or_unauthenticated_card2_event_history
reasoning_tier: high
context_scope: event_authority_card2_sp-762
implementation_surfaces:
- Plans/storage-plan.md
- Plans/card2_event_contracts.json
- Plans/card2_event_payloads.schema.json
node_compile_hint:
  mode: prepared_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-1.as-presented-578a6774.md
preserved_exact_tokens:
- browser.session.closed
negative_constraints:
- Preparation is not admission, native execution, checkpoint authority, readiness, or a governance seal.
- No registry entry, Decision Log entry, retention policy or competing-owner decision is created.
```


### SP-763 - browser.session.promoted storage and read custody

```yaml
plan_unit_id: SP-763
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage owner contract for exactly browser.session.promoted@1.0.0 under DL-045;
  prepared without admission. SMPFS-247 and CV-783 own its real transition and exact identity. Reuse the existing
  EventRecord canonical seglog plus event_record_index, never a second event log or new canonical session/gist store.
  Explicitly adopt SP-026/SP-236 first-native wire, SP-278 full generic index/read selection, SP-286/CV-339 full-value
  v2 first receipt and recovery, and SP-337 payload custody. Each closed metadata payload in Plans/card2_event_payloads.schema.json#/$defs/browser_session_promoted
  is bounded below 16 KiB even at all maximum lengths (browser <=4096 bytes; memory <=6144 bytes). No inline base64
  or embedded body is permitted; if a future separately governed successor needs a larger body, it must use SP-337
  BLAKE3 pack payload_ref with id, byte size and media type, durable bytes before acknowledgment, never an enlarged
  inline limit.

  Exact retention_policy_ref is RP-AUTHORITY-INDEFINITE@1.0.0, by the per-name G03/G10 assignment landed as
  Plans/Decision_Log.md#DL-401 in Case L-3, Card 1 retention assignments (G10 for this exact browser.session name);
  lineage pin 2663667e14346235daaa561d193e959422640b6e:Plans/storage-plan.md#retention-authority-and-defaults, its
  source hash pinned in the DCN report. This is a citation and adoption of that assignment, not
  another retention choice. That Storage text governs holds, backups, Project-data deletion and storage-pressure
  refusal, and this contract does not restate different terms. Metadata outlives the subject as assigned; it never
  keeps the subject''s body alive merely to render history. Resolve each body/evidence ref only through the current
  owner access/deletion gates, showing unavailable redacted metadata when lawful; never resurrect deleted content.
  The canonical original transition/operation result, event obligation, event/receipt custody and referent custody
  are backed up/restored coherently through the existing Project memory/browser stores or CV-366 full application
  source graph and Full Server Backup. Restore verifies original storage/scope/server/Computer/subject identity,
  version, cutoffs and receipt commitments before new append or read. Memory still obeys AMS-054 thread-private
  custody; Browser excludes protected authentication profiles and sessions. Live references and holds follow their
  existing owners, not a new retention floor.

  browser.session.promoted is read by reader.browser.session.promoted.history@1.0.0 for the existing manual Browser
  history consumers, without driving a browser, granting a controller lease, or recreating a process. This reader
  explicitly adopts SP-278 and reader.storage.event_record_index@1.0.0. It reuses projector.storage.event_record_index@1.0.0
  only for complete generic metadata indexing: checkpoints table, key event_record_index_checkpoint.v1:{storage_instance_id},
  the uniquely current #/generations/{generation_id} value in Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint,
  and event_record_index.v2@{generation_id}. Verify the original generation birth anchor and actual complete coverage,
  including nonmatching application/Project rows, not a matching-row maximum. Resolve exact scope partition, event_type,
  event_id, sequence_id, publication_locator, source frame/CRC and payload commitment in one redb snapshot under
  the actual CURRENT/manifest maintenance fence. The complete SP-278 live read token contains storage_instance_id,
  checkpoint_key, checkpoint_ref, generation_id, generation_anchor_sha256, frontier_revision, frontier_sha256, index_dataset_name,
  source_selection and live redb_snapshot_id. A persisted read token is only its nine-field durable projection under
  DL-076; no redb_snapshot_id is stored. source_selection binds storage_instance_id, CURRENT path/bytes, selected
  segment generation, manifest path/bytes/generation, recovery epoch, survivor prefix, retained inventory, durable
  watermarks, excluded ranges and retired inputs. Generation-only comparison is insufficient: a same-generation
  frontier change invalidates publication. Revalidate access, deletion and that complete token at disclosure; changed
  fences discard the answer. The generic owner''s checkpoint CAS/complete-source transaction remains SP-278''s,
  not this reader''s. Family checkpoint disposition is none_required: the family creates no projector, durable history
  view, family checkpoint, cursor or ACK; its sole effect is an ephemeral read answer. It never writes or advances
  the generic checkpoint. Crash/rebuild reacquires the generic index and recomputes the answer, never reruns an
  owner command, emits an event, restores a lease, charges Usage or injects a prompt. Historical validation evaluates
  the genuine original committed transition under its original schema/policy; disappearance or changed current state
  of the live subject does not invalidate a retained event. Withdrawn or forged sources still refuse.

  No new durable family projection/checkpoint exists, so there is no derived retention object to assign; the unchanged
  generic index/checkpoint retains its own SP-278 policy. No registry admission, storage registry family, duplicate
  mirror, policy object, Spec Lock or governance refresh is implied.

  Recompute checkpoint commitments from genuine Storage source bytes and records, never from two matching
  caller token copies. SHA-256 the exact CURRENT and manifest bytes. Apply the unchanged SP-278 canonical
  MessagePack binding codec to its source-value commitments, birth anchor, generation identity and current frontier;
  verify all source selection generations/epoch against decoded owner controls. Independently join token Storage
  identity to this event, source identity to token identity, checkpoint key/reference and dataset to the selected
  generation. A valid checkpoint from another Storage database is still foreign. Recompute every hash even when
  capture and disclosure tokens agree. Source adapters, frame validation, complete coverage and authentic generation
  admission remain native obligations; synthetic fixture bytes are explicit owner-codec witnesses, never production
  control encodings. Do not require obsolete birth CURRENT/manifest files to survive beyond SP-278 custody.

  Numbers, sweep 2026-11-10 (SP-1100 beside the unchanged SP-026/SP-236 and SP-278 profiles):
  browser.session.promoted sequence_id in the EventRecord, the receipt and every join is exact uint64
  (storage_uint64), never capped at 2^53 and never part of producer semantics. Joins compare typed values exactly:
  an integer never equals a float and signed zero is kept. The browser_session_state.v1 source facts keep their
  physical domains: viewport width and height are u32, scroll position and zoom are finite f64 (an integer only
  when exactly representable). SP-278 binding values stay uint-only. Retained originals, sweep 2026-11-11 (SP-1101
  beside SP-236, SP-278 and SP-286): a retry original or a retained read resolves once through the shared
  RetainedDispatcher from Storage''s sealed write custody (static stand-in Plans/card2_original_custody.json)
  before any original check. A Store outside that custody is original_unavailable and a sealed recipe with no
  installed frozen verifier is recipe_unknown, with no fallback. The sealed card2@1 tuple pins the EventRecord and
  family payload schema bytes and the CV-1101 field profiles (event_record for occurred_at_utc and ts, CV-253
  storage_utc_z for observed_at_utc and persisted_at_utc), so a replaced resource or a weakened profile installs no
  verifier for it. Native custody, durability and admission remain NOT_RUN.
'
gui_related: false
gui_classification_reason: Defines event semantics, metadata and custody for existing behavior; no visual presentation.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-366
unblocks: []
acceptance_criteria:
- owner_change_id is the authenticated canonical change identity shared across overlapping owner routes, never an after-record reference. Same operation and owner_change_id cannot record the same fact in both vocabularies; distinct real changes retain distinct identities.
- Exact source/index/token/identity/scope and no-effect read oracles pass.
- Retained reads ignore changed live state but refuse withdrawn/forged sources and deleted body disclosure.
validation_surfaces:
- python3 scripts/pm_card2_events.py
- Plans/card2_event_fixtures.json
- Plans/card2_event_payloads.schema.json
risk_class: duplicate_or_unauthenticated_card2_event_history
reasoning_tier: high
context_scope: event_authority_card2_sp-763
implementation_surfaces:
- Plans/storage-plan.md
- Plans/card2_event_contracts.json
- Plans/card2_event_payloads.schema.json
node_compile_hint:
  mode: prepared_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-1.as-presented-578a6774.md
preserved_exact_tokens:
- browser.session.promoted
negative_constraints:
- Preparation is not admission, native execution, checkpoint authority, readiness, or a governance seal.
- No registry entry, Decision Log entry, retention policy or competing-owner decision is created.
```


### SP-764 - browser.session.takeover_state_changed storage and read custody

```yaml
plan_unit_id: SP-764
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage owner contract for exactly browser.session.takeover_state_changed@1.0.0
  under DL-045; prepared without admission. SMPFS-248 and CV-784 own its real transition and exact identity. Reuse
  the existing EventRecord canonical seglog plus event_record_index, never a second event log or new canonical session/gist
  store. Explicitly adopt SP-026/SP-236 first-native wire, SP-278 full generic index/read selection, SP-286/CV-339
  full-value v2 first receipt and recovery, and SP-337 payload custody. Each closed metadata payload in Plans/card2_event_payloads.schema.json#/$defs/browser_session_takeover_state_changed
  is bounded below 16 KiB even at all maximum lengths (browser <=4096 bytes; memory <=6144 bytes). No inline base64
  or embedded body is permitted; if a future separately governed successor needs a larger body, it must use SP-337
  BLAKE3 pack payload_ref with id, byte size and media type, durable bytes before acknowledgment, never an enlarged
  inline limit.

  Exact retention_policy_ref is RP-AUTHORITY-INDEFINITE@1.0.0, by the per-name G03/G10 assignment landed as
  Plans/Decision_Log.md#DL-401 in Case L-3, Card 1 retention assignments (G10 for this exact browser.session name);
  lineage pin 2663667e14346235daaa561d193e959422640b6e:Plans/storage-plan.md#retention-authority-and-defaults, its
  source hash pinned in the DCN report. This is a citation and adoption of that assignment, not
  another retention choice. That Storage text governs holds, backups, Project-data deletion and storage-pressure
  refusal, and this contract does not restate different terms. Metadata outlives the subject as assigned; it never
  keeps the subject''s body alive merely to render history. Resolve each body/evidence ref only through the current
  owner access/deletion gates, showing unavailable redacted metadata when lawful; never resurrect deleted content.
  The canonical original transition/operation result, event obligation, event/receipt custody and referent custody
  are backed up/restored coherently through the existing Project memory/browser stores or CV-366 full application
  source graph and Full Server Backup. Restore verifies original storage/scope/server/Computer/subject identity,
  version, cutoffs and receipt commitments before new append or read. Memory still obeys AMS-054 thread-private
  custody; Browser excludes protected authentication profiles and sessions. Live references and holds follow their
  existing owners, not a new retention floor.

  browser.session.takeover_state_changed is read by reader.browser.session.takeover_state_changed.history@1.0.0
  for the existing manual Browser history consumers, without driving a browser, granting a controller lease, or
  recreating a process. This reader explicitly adopts SP-278 and reader.storage.event_record_index@1.0.0. It reuses
  projector.storage.event_record_index@1.0.0 only for complete generic metadata indexing: checkpoints table, key
  event_record_index_checkpoint.v1:{storage_instance_id}, the uniquely current #/generations/{generation_id} value
  in Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, and event_record_index.v2@{generation_id}.
  Verify the original generation birth anchor and actual complete coverage, including nonmatching application/Project
  rows, not a matching-row maximum. Resolve exact scope partition, event_type, event_id, sequence_id, publication_locator,
  source frame/CRC and payload commitment in one redb snapshot under the actual CURRENT/manifest maintenance fence.
  The complete SP-278 live read token contains storage_instance_id, checkpoint_key, checkpoint_ref, generation_id,
  generation_anchor_sha256, frontier_revision, frontier_sha256, index_dataset_name, source_selection and live redb_snapshot_id.
  A persisted read token is only its nine-field durable projection under DL-076; no redb_snapshot_id is stored.
  source_selection binds storage_instance_id, CURRENT path/bytes, selected segment generation, manifest path/bytes/generation,
  recovery epoch, survivor prefix, retained inventory, durable watermarks, excluded ranges and retired inputs. Generation-only
  comparison is insufficient: a same-generation frontier change invalidates publication. Revalidate access, deletion
  and that complete token at disclosure; changed fences discard the answer. The generic owner''s checkpoint CAS/complete-source
  transaction remains SP-278''s, not this reader''s. Family checkpoint disposition is none_required: the family
  creates no projector, durable history view, family checkpoint, cursor or ACK; its sole effect is an ephemeral
  read answer. It never writes or advances the generic checkpoint. Crash/rebuild reacquires the generic index and
  recomputes the answer, never reruns an owner command, emits an event, restores a lease, charges Usage or injects
  a prompt. Historical validation evaluates the genuine original committed transition under its original schema/policy;
  disappearance or changed current state of the live subject does not invalidate a retained event. Withdrawn or
  forged sources still refuse.

  No new durable family projection/checkpoint exists, so there is no derived retention object to assign; the unchanged
  generic index/checkpoint retains its own SP-278 policy. No registry admission, storage registry family, duplicate
  mirror, policy object, Spec Lock or governance refresh is implied.

  Recompute checkpoint commitments from genuine Storage source bytes and records, never from two matching
  caller token copies. SHA-256 the exact CURRENT and manifest bytes. Apply the unchanged SP-278 canonical
  MessagePack binding codec to its source-value commitments, birth anchor, generation identity and current frontier;
  verify all source selection generations/epoch against decoded owner controls. Independently join token Storage
  identity to this event, source identity to token identity, checkpoint key/reference and dataset to the selected
  generation. A valid checkpoint from another Storage database is still foreign. Recompute every hash even when
  capture and disclosure tokens agree. Source adapters, frame validation, complete coverage and authentic generation
  admission remain native obligations; synthetic fixture bytes are explicit owner-codec witnesses, never production
  control encodings. Do not require obsolete birth CURRENT/manifest files to survive beyond SP-278 custody.

  Numbers, sweep 2026-11-10 (SP-1100 beside the unchanged SP-026/SP-236 and SP-278 profiles):
  browser.session.takeover_state_changed sequence_id in the EventRecord, the receipt and every join is exact
  uint64 (storage_uint64), never capped at 2^53 and never part of producer semantics. Joins compare typed values
  exactly: an integer never equals a float and signed zero is kept. The browser_session_state.v1 source facts keep
  their physical domains: viewport width and height are u32, scroll position and zoom are finite f64 (an integer
  only when exactly representable). SP-278 binding values stay uint-only. Retained originals, sweep 2026-11-11
  (SP-1101 beside SP-236, SP-278 and SP-286): a retry original or a retained read resolves once through the shared
  RetainedDispatcher from Storage''s sealed write custody (static stand-in Plans/card2_original_custody.json)
  before any original check. A Store outside that custody is original_unavailable and a sealed recipe with no
  installed frozen verifier is recipe_unknown, with no fallback. The sealed card2@1 tuple pins the EventRecord and
  family payload schema bytes and the CV-1101 field profiles (event_record for occurred_at_utc and ts, CV-253
  storage_utc_z for observed_at_utc and persisted_at_utc), so a replaced resource or a weakened profile installs no
  verifier for it. Native custody, durability and admission remain NOT_RUN.
'
gui_related: false
gui_classification_reason: Defines event semantics, metadata and custody for existing behavior; no visual presentation.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-366
unblocks: []
acceptance_criteria:
- owner_change_id is the authenticated canonical change identity shared across overlapping owner routes, never an after-record reference. Same operation and owner_change_id cannot record the same fact in both vocabularies; distinct real changes retain distinct identities.
- Exact source/index/token/identity/scope and no-effect read oracles pass.
- Retained reads ignore changed live state but refuse withdrawn/forged sources and deleted body disclosure.
validation_surfaces:
- python3 scripts/pm_card2_events.py
- Plans/card2_event_fixtures.json
- Plans/card2_event_payloads.schema.json
risk_class: duplicate_or_unauthenticated_card2_event_history
reasoning_tier: high
context_scope: event_authority_card2_sp-764
implementation_surfaces:
- Plans/storage-plan.md
- Plans/card2_event_contracts.json
- Plans/card2_event_payloads.schema.json
node_compile_hint:
  mode: prepared_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-1.as-presented-578a6774.md
preserved_exact_tokens:
- browser.session.takeover_state_changed
negative_constraints:
- Preparation is not admission, native execution, checkpoint authority, readiness, or a governance seal.
- No registry entry, Decision Log entry, retention policy or competing-owner decision is created.
```


### SP-765 - memory.gist_state_changed storage and read custody

```yaml
plan_unit_id: SP-765
unit_type: interface_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: 'Newly authored Storage owner contract for exactly memory.gist_state_changed@1.0.0 under DL-045;
  prepared without admission. AMS-130 and CV-785 own its real transition and exact identity. Reuse the existing
  EventRecord canonical seglog plus event_record_index, never a second event log or new canonical session/gist store.
  Explicitly adopt SP-026/SP-236 first-native wire, SP-278 full generic index/read selection, SP-286/CV-339 full-value
  v2 first receipt and recovery, and SP-337 payload custody. Each closed metadata payload in Plans/card2_event_payloads.schema.json#/$defs/memory_gist_state_changed
  obeys the existing 16 KiB inline ceiling without a new evidence-reference count limit. AMS-130 carries the
  complete ordered opaque evidence list inline when the whole metadata body fits; otherwise its evidence_refs
  field carries the closed SP-337 collection reference with BLAKE3 id, exact byte size and media type. The complete
  canonical MessagePack pointer array is stored once in the existing payload pack store. Authenticate original
  Storage/server/scope/thread custody, resolve exact bytes, recompute BLAKE3/size/canonical encoding, and compare
  every resolved pointer to the original MemoryGist version before append, retry or historical disclosure. Pack
  bytes and their index are durable before acknowledgment; ordinary SP-337 holds, backups, access and deleting-owner
  deadlines apply. The resulting complete inline metadata body still fits within 16 KiB. Envelope payload_ref
  stays null because this field-level reference externalizes only the evidence collection. No gist/claim/evidence
  content or inline base64 is permitted, no truncation or enlarged inline ceiling, and no successor is required
  merely because a valid gist has more than sixteen evidence references.

  Exact retention_policy_ref is RP-AUTHORITY-INDEFINITE@1.0.0, by the per-name G03/G10 assignment landed as
  Plans/Decision_Log.md#DL-401 in Case L-3, Card 1 retention assignments (G03 exactly memory.gist_state_changed);
  lineage pin 2663667e14346235daaa561d193e959422640b6e:Plans/storage-plan.md#retention-authority-and-defaults, its
  source hash pinned in the DCN report. This is a citation and adoption of that assignment, not
  another retention choice. That Storage text governs holds, backups, Project-data deletion and storage-pressure
  refusal, and this contract does not restate different terms. Metadata outlives the subject as assigned; it never
  keeps the subject''s body alive merely to render history. Resolve each body/evidence ref only through the current
  owner access/deletion gates, showing unavailable redacted metadata when lawful; never resurrect deleted content.
  The canonical original transition/operation result, event obligation, event/receipt custody and referent custody
  are backed up/restored coherently through the existing Project memory/browser stores or CV-366 full application
  source graph and Full Server Backup. Restore verifies original storage/scope/server/Computer/subject identity,
  version, cutoffs and receipt commitments before new append or read. Memory still obeys AMS-054 thread-private
  custody; Browser excludes protected authentication profiles and sessions. Live references and holds follow their
  existing owners, not a new retention floor.

  memory.gist_state_changed is read by reader.memory.gist_state_changed.history@1.0.0 for the existing memory GUI
  and audit consumers; prompt assembly reads the current authorized MemoryGist under AMS-054, never an event body
  as injection authority. This reader explicitly adopts SP-278 and reader.storage.event_record_index@1.0.0. It reuses
  projector.storage.event_record_index@1.0.0 only for complete generic metadata indexing: checkpoints table, key
  event_record_index_checkpoint.v1:{storage_instance_id}, the uniquely current #/generations/{generation_id} value
  in Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint, and event_record_index.v2@{generation_id}.
  Verify the original generation birth anchor and actual complete coverage, including nonmatching application/Project
  rows, not a matching-row maximum. Resolve exact scope partition, event_type, event_id, sequence_id, publication_locator,
  source frame/CRC and payload commitment in one redb snapshot under the actual CURRENT/manifest maintenance fence.
  The complete SP-278 live read token contains storage_instance_id, checkpoint_key, checkpoint_ref, generation_id,
  generation_anchor_sha256, frontier_revision, frontier_sha256, index_dataset_name, source_selection and live redb_snapshot_id.
  A persisted read token is only its nine-field durable projection under DL-076; no redb_snapshot_id is stored.
  source_selection binds storage_instance_id, CURRENT path/bytes, selected segment generation, manifest path/bytes/generation,
  recovery epoch, survivor prefix, retained inventory, durable watermarks, excluded ranges and retired inputs. Generation-only
  comparison is insufficient: a same-generation frontier change invalidates publication. Revalidate access, deletion
  and that complete token at disclosure; changed fences discard the answer. The generic owner''s checkpoint CAS/complete-source
  transaction remains SP-278''s, not this reader''s. Family checkpoint disposition is none_required: the family
  creates no projector, durable history view, family checkpoint, cursor or ACK; its sole effect is an ephemeral
  read answer. It never writes or advances the generic checkpoint. Crash/rebuild reacquires the generic index and
  recomputes the answer, never reruns an owner command, emits an event, restores a lease, charges Usage or injects
  a prompt. Historical validation evaluates the genuine original committed transition under its original schema/policy;
  disappearance or changed current state of the live subject does not invalidate a retained event. Withdrawn or
  forged sources still refuse.

  No new durable family projection/checkpoint exists, so there is no derived retention object to assign; the unchanged
  generic index/checkpoint retains its own SP-278 policy. No registry admission, storage registry family, duplicate
  mirror, policy object, Spec Lock or governance refresh is implied.

  Recompute checkpoint commitments from genuine Storage source bytes and records, never from two matching
  caller token copies. SHA-256 the exact CURRENT and manifest bytes. Apply the unchanged SP-278 canonical
  MessagePack binding codec to its source-value commitments, birth anchor, generation identity and current frontier;
  verify all source selection generations/epoch against decoded owner controls. Independently join token Storage
  identity to this event, source identity to token identity, checkpoint key/reference and dataset to the selected
  generation. A valid checkpoint from another Storage database is still foreign. Recompute every hash even when
  capture and disclosure tokens agree. Source adapters, frame validation, complete coverage and authentic generation
  admission remain native obligations; synthetic fixture bytes are explicit owner-codec witnesses, never production
  control encodings. Do not require obsolete birth CURRENT/manifest files to survive beyond SP-278 custody.

  Numbers, sweep 2026-11-10 (SP-1100 beside the unchanged SP-026/SP-236 and SP-278 profiles):
  memory.gist_state_changed sequence_id in the EventRecord, the receipt and every join is exact uint64
  (storage_uint64), never capped at 2^53 and never part of producer semantics. Joins compare typed values exactly:
  an integer never equals a float and signed zero is kept. The memory source facts keep their exact integer
  domains: access_count is a current integer of at least 0 and half_life_days null or a current integer of at
  least 1. SP-278 binding values stay uint-only. Retained originals, sweep 2026-11-11 (SP-1101 beside SP-236,
  SP-278 and SP-286): a retry original or a retained read resolves once through the shared RetainedDispatcher from
  Storage''s sealed write custody (static stand-in Plans/card2_original_custody.json) before any original check. A
  Store outside that custody is original_unavailable and a sealed recipe with no installed frozen verifier is
  recipe_unknown, with no fallback. The sealed card2@1 tuple pins the EventRecord and family payload schema bytes
  and the CV-1101 field profiles (event_record for occurred_at_utc and ts, CV-253 storage_utc_z for observed_at_utc
  and persisted_at_utc), so a replaced resource or a weakened profile installs no verifier for it. Native custody,
  durability and admission remain NOT_RUN.
'
gui_related: false
gui_classification_reason: Defines event semantics, metadata and custody for existing behavior; no visual presentation.
depends_on:
- SP-278
- SP-286
- SP-337
- CV-366
unblocks: []
acceptance_criteria:
- owner_change_id is the authenticated canonical change identity shared across overlapping owner routes, never an
  after-record reference. Same operation and owner_change_id cannot record the same fact in both vocabularies; distinct
  real changes retain distinct identities.
- Exact source/index/token/identity/scope and no-effect read oracles pass.
- Retained reads ignore changed live state but refuse withdrawn/forged sources and deleted body disclosure.
validation_surfaces:
- python3 scripts/pm_card2_events.py
- Plans/card2_event_fixtures.json
- Plans/card2_event_payloads.schema.json
risk_class: duplicate_or_unauthenticated_card2_event_history
reasoning_tier: high
context_scope: event_authority_card2_sp-765
implementation_surfaces:
- Plans/storage-plan.md
- Plans/card2_event_contracts.json
- Plans/card2_event_payloads.schema.json
node_compile_hint:
  mode: prepared_owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
  runtime_enabled: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/decision-answers/E-CARDS-1.as-presented-578a6774.md
preserved_exact_tokens:
- memory.gist_state_changed
negative_constraints:
- Preparation is not admission, native execution, checkpoint authority, readiness, or a governance seal.
- No registry entry, Decision Log entry, retention policy or competing-owner decision is created.
```

### SP-560 - FileManager prepared persistence routing

- file.copied@1.0.0: Plans/FileManager.md#F-150 owns this exact producer, identity, first-receipt, SP-278 history-only reader and withdrawal contract. retention_policy_ref: PENDING_RETENTION_DECISION.
- file.created@1.0.0: Plans/FileManager.md#F-151 owns this exact producer, identity, first-receipt, SP-278 history-only reader and withdrawal contract. retention_policy_ref: PENDING_RETENTION_DECISION.
- file.deleted@1.0.0: Plans/FileManager.md#F-152 owns this exact producer, identity, first-receipt, SP-278 history-only reader and withdrawal contract. retention_policy_ref: PENDING_RETENTION_DECISION.
- file.exported@1.0.0: Plans/FileManager.md#F-153 owns this exact producer, identity, first-receipt, SP-278 history-only reader and withdrawal contract. retention_policy_ref: PENDING_RETENTION_DECISION.
- file.moved@1.0.0: Plans/FileManager.md#F-154 owns this exact producer, identity, first-receipt, SP-278 history-only reader and withdrawal contract. retention_policy_ref: PENDING_RETENTION_DECISION.
- file.renamed@1.0.0: Plans/FileManager.md#F-155 owns this exact producer, identity, first-receipt, SP-278 history-only reader and withdrawal contract. retention_policy_ref: PENDING_RETENTION_DECISION.
- folder.copied@1.0.0: Plans/FileManager.md#F-156 owns this exact producer, identity, first-receipt, SP-278 history-only reader and withdrawal contract. retention_policy_ref: PENDING_RETENTION_DECISION.
- folder.created@1.0.0: Plans/FileManager.md#F-157 owns this exact producer, identity, first-receipt, SP-278 history-only reader and withdrawal contract. retention_policy_ref: PENDING_RETENTION_DECISION.
- folder.deleted@1.0.0: Plans/FileManager.md#F-158 owns this exact producer, identity, first-receipt, SP-278 history-only reader and withdrawal contract. retention_policy_ref: PENDING_RETENTION_DECISION.
- folder.exported@1.0.0: Plans/FileManager.md#F-159 owns this exact producer, identity, first-receipt, SP-278 history-only reader and withdrawal contract. retention_policy_ref: PENDING_RETENTION_DECISION.
- folder.moved@1.0.0: Plans/FileManager.md#F-160 owns this exact producer, identity, first-receipt, SP-278 history-only reader and withdrawal contract. retention_policy_ref: PENDING_RETENTION_DECISION.
- folder.renamed@1.0.0: Plans/FileManager.md#F-161 owns this exact producer, identity, first-receipt, SP-278 history-only reader and withdrawal contract. retention_policy_ref: PENDING_RETENTION_DECISION.
**Newly authored original-operation custody.** The twelve routes above each adopt the following
physical companion through their own F unit. These bindings are scoped to those exact DL-045
families and already specified commands. The reviewed search found no closed normal FileManager
operation/path custody in current canon; generic receipt_record_baseline is deferred and is not used.

Plans/filemanager_operation_contracts.schema.json owns the closed operation_custody and
family_control values and their closed nested types; CV-560 adopts their cross-field rules.
Plans/storage_value_registry.json adds only filemanager_operation_custody and
filemanager_family_control; neither is an EventRecord family, generic checkpoint or event admission.
Both are canonical_non_rebuildable, mandatory-backup redb values using SP-339 canonical MessagePack.
No critical/MVP array changes. Exact table names are filemanager_operation_custody.v1 and
filemanager_family_control.v1 in the actual selected Storage-instance database. No alternate store,
flat-key alias, generic receipt key, SQLite fallback or lazy migration exists.

For operation custody let K = hex(UTF8(storage_instance_id)) + ":" + hex(UTF8(project_id)) + ":" +
hex(UTF8(operation_id)) + ":" + hex(UTF8(root_slot_id)), all lowercase without normalization.
Let H = lowercase SHA-256(UTF8(K)). The exact UTF-8 key is filemanager_operation_custody.v1:<H>;
the payload receipt_ref is exactly pmref:filemanager_operation:<H>. This fixed-size token fits the
existing receipt-ref schema even at the maximum allowed raw identity lengths. root_slot_id is allocated once by the original accepting handler
for each selected root (including the prospective creation slot), never by a retry or a reader.
The original handler's filemanager.operation_custody.commit.v1 durably creates phase=accepted,
revision=0, the actual storage_instance_id/recovery_epoch/Project/OperationId/family, closed
accepted_command and accepted_path_snapshots before any filesystem effect. Creation records the
absent destination and existing parent; copy/move/export record their original source and destination;
delete/rename record their original target. Revalidate current permission, native source identity,
FileSafe admission and conflict resolution before execution. The descriptor and acceptance epoch are
immutable; no acceptance can be reconstructed from a replayed EventRecord after restore.

The domain mutation owner authenticates its actual settled filesystem outcome, including native
node kind, source/result/container identities, source/destination edges, affected set, confirmation,
FileSafe/transfer evidence and descendant count where applicable. A same-key revision CAS changes
accepted to effect_settled, freezing the complete closed family payload and settled path_snapshots
in settlement. Intent and settlement original fields are never changed thereafter. The complete
payload receipt_ref, Project/OperationId/family/command/handler/correlation/origin join the accepted
row; payload ts is the original completion time, never a replay clock. A duplicate unequal settlement
is an integrity conflict. This is a domain receipt, not an append queue or effect-retry authorization.
A failed, cancelled or no-op accepted original instead CASes accepted -> no_event_settled with
closed noncompletion (terminal_status, effect_state, original evidence_refs and settled_at_utc),
null settlement/complete_event/first_append_receipt, and no completed EventRecord. The native owner
must authenticate a known no-effect, rolled-back or partial-but-settled outcome; uncertainty cannot
use this terminal branch and stays fenced. This original receipt may resolve a drain member without
advancing last_admitted_sequence. No_event_settled is immutable and never becomes a completed
operation on retry. This records the already specified noncompletion behavior, not a new rollback.
Filesystem effect and redb are not one transaction: crash/uncertainty between them fences; the actual
native owner reconciles its original journal/transfer evidence or reports unresolved, never repeats an
uncertain effect or fabricates success. Lost accepted custody never becomes a new command.

Each path_snapshot_entry binds path_ref, Project, path_snapshot_revision, Computer, original
root_identity_ref, exact relative_components and captured node_ref/node_kind (or absent/null).
Path refs in source/destination/affected_path_refs are exactly covered once in the settled receipt;
no duplicate handle, cross-Project/revision/root substitution, absolute path, separator, dot/dot-dot or
NUL component is accepted. The private components preserve original spelling and platform identity;
current root relocation never rewrites a historical snapshot. Event payloads remain opaque refs only.
filemanager.operation_custody.resolve.v1 takes the original receipt_ref and authenticated current
Project/access context, selects H directly, reads the actual table/store/key, validates closed schema and every
raw/key/hash/acceptance/settlement join, then returns the exact closed operation_custody row.
Completed readers extract only its original settlement; a no_event_settled row resolves only its
original noncompletion and cannot terminalize a completed event. It cannot accept a caller's
row as origin. filemanager.path_snapshot.resolve.v1 additionally takes the exact path_ref/revision,
selects its unique entry and checks current permission/deletion/retention before returning private
location evidence. Resolution grants no filesystem action or access to a deleted/unavailable body.
Root metadata needed for a path must resolve through its original FileManager/Computer owner with
current access; absent original root custody yields unavailable, never a current-path fallback.

Append uses only the frozen settled payload/identity and current native admission. After issuance,
a final same-key CAS to history_settled stores the exact complete original EventRecord and original
AppendReceipt after the family's separate strict-v2 resolve_full_value.v1 verification. Terminal
completion follows this durable CAS. A lost append acknowledgement can retrieve the ORIGINAL full
EventRecord through current authenticated SP-278 retained source (or the already settled domain
row); its entire payload and owner envelope must match the frozen settlement and actual original
acceptance epoch. Use the exact full-value request/result and final equality checks in each F unit.
Missing original full value, v2 witness or native domain evidence fences; semantic resolution alone
cannot fill it. Lost domain terminal CAS retries resolve the same original, never a second effect or
append. SP-336 full-flush-before-durable-redb rules and barrier-class receipts apply to UI completion.
This domain row does not change SP-286 first issuance or reconstruct a missing first acknowledgement.

**Newly authored exact-family withdrawal control.** For each exact route the key is
filemanager_family_control.v1:{hex(UTF8(storage_instance_id))}:{event_type}:1.0.0. The closed value
has storage/family/version, control_revision, state, admission_revision, last_admitted_sequence,
writer_cutoff_sequence, reader_enabled, drain_operation_keys and redaction_profile, with no open map.
Prepared has no admission, no cutoff, sequence 0, reader disabled and no drain keys. Only a future
actual exact-family Event Authority admission plus installed native gates can CAS prepared to active;
this draft creates no active control or admission record. Missing control refuses dispatch/delivery.
storage.filemanager_family_control.cas.v1 is the sole writer. It reads the actual current selected
row, schema and raw/key identities, checks expected control_revision and exact authorized owner
transition, and commits the full next value in one durable redb transaction under Storage's existing
writer/coordinator exclusion. A revision changes on every publication; no ABA, blind overwrite or
caller-supplied active flag. Each issued append advances last_admitted_sequence from its exact
SP-286 receipt before terminal publication, under that gate. It is the maximum issued sequence of
this exact family, not a contiguous family sequence count. Gate failure with issued custody blocks
further admission until native recovery reconciles the original; it never hides an issued append.

Active-to-draining CAS closes new command acceptance, records the exact accepted operation keys
and preserves readers. Only those originals may settle/append under the gate. Late accepted keys,
new effects, crossed versions, unresolved originals or inconsistent receipt boundaries fence the
transition. When all drain operations are reconciled, a single draining-to-withdrawn CAS sets
writer_cutoff_sequence=last_admitted_sequence and empties drain_operation_keys under the append
gate. In the zero-event case both sequence values are 0. A pending uncertain operation prevents
final cutoff; its truthful recovery state remains durable. No append can occur after that commit.
The same-version withdrawn writer is never reopened; a successor requires its own explicit contract
and admission. Reader retirement CAS sets reader_enabled=false before replacement. Each read
joins exact current control/version, final cutoff when withdrawn (otherwise current issued high-water),
current SP-278 token/snapshot, access and retained original, and rechecks revision before disclosure.
Retirement or any concurrent change retries/refuses the delivery. SP-278 rebuild changes no cutoff.

**SP-337/SP-340 physical profiles and bounded values (new technical binding).** Both
filemanager_operation_custody and filemanager_family_control have explicit family_profiles:
redb_file=canonical, storage_group=coordination_and_storage, encoding_target=messagepack_canonical,
max_value_bytes=16384. They use that existing group's 2147483648-byte advisory canonical budget;
SP-340 budget notices/reclaim apply without pruning or refusing canonical writes. SP-339 canonical
MessagePack byte length, not JSON character count, selects the representation. The literal tables
and keys above are unchanged. The closed operation_custody and family_control are LOGICAL values.
The actual redb value validates operation_custody_value or family_control_value: either that exact
logical value at <=16384 bytes, or its closed reference alternative at <=16384 bytes. A reference has
exactly the same literal family schema_id (pm.storage_value.filemanager_operation_custody.v1 or
pm.storage_value.filemanager_family_control.v1), schema_version=1.0.0 and value_ref. Closed field sets
distinguish the inline and reference branches; the reference is not a logical original. The referenced
complete logical value must exceed 16384 bytes and independently validate its original closed schema.
This avoids imposing an arbitrary cap on accepted path evidence or the frozen drain membership.

The newly authored reference spelling, reused for both value_ref and EventRecord.payload_ref, is
pm-payload-ref:v1:blake3:<64 lowercase hex digits>:<positive unpadded decimal byte size>:application/vnd.msgpack.
It denotes SP-337's exact canonical MessagePack bytes, BLAKE3 content identity and media type; it is
not a path, URL, base64 body or caller assertion of origin. The actual selected SP-337
payload_pack_index entry at payload:v1:<blake3_hex> in canonical redb resolves the original pack,
offset, length, media type and reference count to durable pack bytes. It must resolve those exact
bytes and size under current permission/deletion/retention; a caller's supplied row is not origin. Verify BLAKE3,
length, canonical decoding and type-sensitive equality before using the resolved original. Missing,
changed, oversized-inline, wrong-media, wrong-size or unauthenticated pack values fence, without
reconstructing custody from current disk or events. Each identifier pattern uses a full-match tail;
trailing LF is never normalized away as part of an identity.

An EventRecord's canonical MessagePack payload body at <=16384 bytes remains the complete closed
family payload with payload_ref=null. A larger body has payload={} and that exact payload_ref;
resolve the pack bytes to the complete family payload for its closed schema and settlement joins.
The strict CV-339 full-value commitment still covers the ORIGINAL stored EventRecord including its
empty inline body and reference, never an expanded/re-encoded substitute. Operation originals may
therefore refer both to the packed event body and to a packed complete logical operation value.
Content-addressed identical bytes are stored once. The resolver returns the original logical row only
after proving the actual table/key/physical reference and every original join; a caller-provided
logical row is not its source. A large family-control drain set uses the same complete-value reference
alternative. CAS compares the actual selected physical value plus the resolved logical revision under
the same writer/coordinator gate, verifies both before/after representations, and atomically publishes
the next bounded physical value. A missing pack or changed pointer/referent refuses CAS.

SP-337 pack bytes/index/refcounts are durable before any referencing redb CAS or event acknowledgement.
Coherent backup includes both tables and every transitively referenced pack/index value, original
EventRecord and append custody at the same boundary. Restore verifies this complete graph before
writers/readers enable; lost pack data stays unavailable, never a smaller drain set or empty payload.
Currentness/access, selected physical values and resolved bytes are rechecked after copying and
immediately before CAS/terminal publication/disclosure. Retention/holds and garbage collection remain
SP-337 and the original owners' rules; no new deletion or event-history policy is selected.

For every exact family, history_settled additionally proves EventRecord event_type/scope/Project,
operation identity, command correlation, original completion time, payload schema, decoded complete
payload and event/idempotency IDs against the immutable settlement/acceptance. Its first receipt
must equal the selected v2 original and the complete event's sequence/event IDs. The terminal CAS
selects the actual effect_settled pre-CAS row and compares it exactly to before; its uncommitted
history_settled candidate cannot stand in for that original. It validates the candidate against the
frozen pre-CAS acceptance/settlement and runs the same separate resolve_full_value.v1 request/result,
strict v2 witness/commitment, original
source/control/access/currentness and final equality checks as recovery; shape validity alone or an
unrelated complete EventRecord is insufficient. Current append and retry both refuse
projector_replay_only as replay_only_not_appendable. Retry/idempotency equality uses only CV-339's
explicit producer semantic fields; Storage-assigned metadata is excluded from that comparison and
retained unchanged in the independently verified ORIGINAL full-value request.

**Activation, backup, restore and retention boundary.** StorageMigrationCoordinator installs both
literal tables, exact schemas/codecs, resolvers, CAS gates and mandatory backup membership together
through protected preflight/backup/verification/version-last activation. Old generic receipts have no
verified mapping and receive no historical backfill. Unknown versions fence pending explicit migration.
BRS-031's brief capture barrier and SP-286 backup_gate.v2 capture both entire tables, canonical
seglog/source/custody and original root/source dependencies at the same verified boundary/epoch;
background copy uses that fixed snapshot. An unresolved operation is disclosed and fences dependent
completion on restore; no snapshot is permission to execute it. Exact original operation/epoch/payload/
paths and cutoff/revision/reader flags survive backup/restore, never rebuild from events or current disk.
Verify completeness and all joins before enabling either writer or reader. Source/custody/control skew,
missing rows or mixed epochs fence. A confirmed older restore follows SP-286's actual restore journal,
loss disclosure and pre_restore evidence: absent post-backup originals stay unavailable, and an older
active control cannot reopen a subsequently withdrawn version. Preserve verified newer withdrawal
control or fence until its actual authority is resolved; equal hashes or a lower restored revision do
not supply that authority. Actual fresh operations require current admission and a new native owner
acceptance under the current restore session; old retries keep their original epoch and identity.

Case L-3 explicitly assigns receipts, audit authority and source lineage indefinite/no-count-eviction;
these two ORIGINAL RECEIPT / ADMISSION AUTHORITY companions bind the existing
RP-AUTHORITY-INDEFINITE (no new policy or deletion choice). They never store file bodies and never
grant access. All twelve EVENT HISTORY retention_policy_ref values stay PENDING_RETENTION_DECISION;
no class is selected for them. SP-278 retains its existing checkpoint policy; no family projection or
checkpoint is added. No event registry row is appended. Native execution remains NOT_RUN.

```yaml
plan_unit_id: SP-560
unit_type: contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: >-
  FileManager prepared persistence routing: the preceding per-family routes and obligations are prepared without admission.
  Each family retains its own semantic contract; retention is PENDING_RETENTION_DECISION.
gui_related: false
gui_classification_reason: Internal event contract routing and static assurance.
split_recommended: false
depends_on: [DL-045]
unblocks: []
acceptance_criteria:
  - No registry append, policy selection or native readiness claim.
validation_surfaces:
  - python3 scripts/pm-filemanager-event-contracts.py
risk_class: file_event_contract_routing
reasoning_tier: high
context_scope: filemanager_event_authority
implementation_surfaces: [Plans/storage-plan.md, Plans/filemanager_operation_contracts.schema.json, Plans/storage_value_registry.json]
node_compile_hint: {mode: prepared_without_admission, create_worknodes: false}
source_lineage: [Plans/FileManager.md, Plans/Decision_Log.md#DL-045]
preserved_exact_tokens: ["PENDING_RETENTION_DECISION"]
negative_constraints:
  - Do not treat prepared contracts as event admission.
owner_hints: [Plans/storage-plan.md]
```


### SP-600 - Event Authority format.applied persistence and passive reader

```yaml
plan_unit_id: SP-600
unit_type: event_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  format.applied persistence and passive reader
  format.applied 1.0.0 — newly authored owner contract under DL-045.
  Prepared without admission. Exact payload is Plans/event_payloads/format_applied.schema.json (pm.event_payload.format_applied.v1); no sibling or legacy spelling is admitted. Scope is project_only; project_id is a real immutable Project ID; application scope, null, empty and sentinel Project identities are forbidden. Payload project_id equals the envelope join. Existing CV-365 scope rules remain mandatory. Optional envelope lineage comes from the original operation, never ambient focus. Schema-only validity is insufficient.
  Producer: HTE formatter completion adapter. After a successful HTE write/edit formatter changes the tool output beyond whitespace, capture the tool-output and formatted-output evidence refs before publication. DAE remains unenforceable; whitespace-only changes and failed formatter output emit no format.applied.
  Freeze operation_id from fresh entropy in the original owning operation before its effect; preserve it and all source facts on retry/restart. Freeze the completion payload after owner success, before append. If the original operation cannot durably retain its intent/result, publication fails closed: never rerun the effect to reconstruct evidence. This contract creates no independent operation journal or stored value. The owner retains its existing intent/result and source refs under its existing storage contract.
  Adopt SP-286 first-AppendReceipt custody and CV-339 full-value v2 successor by name, including SP-336/SP-347 current group-commit rules. Validate admission before append; absent membership, unresolved retention or unavailable source custody prevents activation. Referenced bodies commit under SP-337 before append. The first original AppendReceipt is exposed only after the durable group frame; terminal event success publication follows that receipt. Lost acknowledgement returns that original full stored result and receipt, never a second effect or new receipt; equal identity with different semantic digest is a conflict, not a retry.
  Identity digest is SHA-256 of UTF-8 compact JSON array ["format.applied", "1.0.0", storage_instance_id, payload.project_id, payload.operation_id], with ensure_ascii=false, no whitespace and array order preserved. event_id="evt_"+digest; idempotency_key="format.applied:"+digest; family_revision=1.0.0, replay_policy=dedupe_by_idempotency_key, redaction_profile=secret_refs_only. Use Contracts_V0.md#EventRecord for the closed envelope, not a local field list. Envelope occurred_at_utc equals payload.timestamp byte-for-byte from the original HTE write/edit operation; retry time is forbidden. Storage alone assigns sequence_id, observed_at_utc and persisted_at_utc. Full producer semantic digest uses EventRecord and CV-339, not only the identity tuple.
  Exact envelope joins for format.applied: actor_ref is the non-empty non-secret actor reference retained by the original HTE write/edit operation from its accepted owner request, never the retrying Client. correlation_id is the non-empty correlation_id frozen by that same original owner operation; payload.operation_id equals its immutable operation_id. Never synthesize either required value as null. Scope/project and the entire frozen payload must equal that original operation result. The original HTE result must join formatter_id, project-relative file_path, diff_bytes and both output refs exactly. Other nullable EventRecord lineage, account, causal and upstream-sequence joins copy the retained original operation facts, including required-present nulls only when that original has no such join; they are never populated from ambient focus. payload_ref is null for this bounded inline payload; enforce Storage's 16 KiB inline canonical MessagePack byte limit before append; new-native migration fields are null. Freeze all these producer values before append and resolve the complete original EventRecord through storage.first_append_receipt.resolve_full_value.v1 on receipt-dependent recovery. Required non-null fields retain their schema-required types.
  Operating consumer reader.evidence.format_applied@1.0.0 uses reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, explicitly adopting SP-278. It reads this exact event_type/revision/scope only after the complete CURRENT-selected global frontier is verified. Its checkpoint is the existing checkpoints key event_record_index_checkpoint.v1:{storage_instance_id}, value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint; no family-specific persisted cursor or projection is introduced. Generic rows and frontier advance atomically by the existing SP-278 CAS; a failed CAS preserves the old publication and is retried from a fresh snapshot. Operating reads are passive with no durable progress, so their own checkpoint is explicitly none. Each read uses the exact live ten-field read_token in one real redb snapshot; any stored read token must instead be the nine-field DL-076 durable token with redb_snapshot_id removed, never a persisted snapshot identity. Rebuild uses original retained seglog through SP-278, preserving identity and no side effects. Unauthorized, deleted, unsupported, stale or unresolved source reads return unavailable; they cannot produce empty-success evidence.
  Profile rationale for format.applied: HTE formatter output and formatted body remain behind the two authorized evidence refs; redaction_profile=secret_refs_only is an existing EventRecord value and does not grant source access.
  Custody remains with HTE formatter completion adapter and Storage's original seglog/payload owners. Store only bounded metadata and opaque authorized source refs; no transcript, diff body, secrets, provider response, private absolute path or credential content. file_path, where present, is a FileSafe-approved project-relative display path. Recheck current permission, source deletion/tombstone and hold gates before each disclosure; a ref is not permission. Backup captures coherent original events, refs and first-receipt custody under BRS-031; derived index is rebuildable, never backup authority. Restore verifies original identities and current source availability; missing originals remain unavailable rather than reconstructed from an index.
  Retention policy: PENDING_RETENTION_DECISION. For a PENDING marker no class is selected: candidate RP-RUNTIME-365D (runtime observation), RP-OPERATIONAL-2555D (operational diagnostic), or RP-AUTHORITY-INDEFINITE (audit/source lineage) per Case L-3; RT must settle the actual role. Existing generic checkpoint/index retain RP-PROJECTION-3GEN and SP-278 source-coupled constraints; no new stored derived record is owned here.
  Compatibility: only this exact 1.0.0 schema is a current writer candidate. Historical names/bytes remain unchanged; unknown future revisions halt the consumer before advance, never normalize by guessed payload. Withdrawal first disables the exact producer's admission, drains/fences outstanding intents and prohibits append under stale admission. Then reader.evidence.format_applied@1.0.0 refuses disclosure and fences its in-memory token; generic global indexing remains available for other families. Re-enable only after governed schema/admission validation and verified SP-278 rebuild/currentness. No source deletion, history rewrite or zero-cursor substitution is authorized.
  Exact-family oracle matrix for format.applied: Plans/small_owner_event_fixtures.json owns its full EventRecord, independent original owner operation/result, original eleven-field receipt and four-field append result, full-value commitment, and positive/negative vectors; scripts/pm-small-owner-events.py validates them without registry admission. Positive append vectors assume fixture-only resolved membership/retention; actual absent membership and PENDING_RETENTION_DECISION refuse activation. Every required envelope field, profile (including redacted_refs_only), actor/correlation/time/payload/subject join and same-identity changed semantic value has a refusal vector. The admission matrix cuts missing membership/schema/retention/permission/dedupe/source/original intent/original result/current owner acceptance/body commit/current lease/restore controls before append, then cuts uncommitted group, unsynced group, receipt exposure and terminal publication. A durable commit with lost acknowledgement or lagging custody rows returns the same original result/receipt; no durable commit returns no receipt. The original owner acceptance freezes its admission epoch, actual owner session and restore occurrence; seal compares all three to current owner/Storage controls. Re-enable never relabels an old intent: fresh acceptance uses a different logical operation_id. Recovery never reruns HTE formatter completion adapter or reconstructs old owner admission. Withdrawal vectors fence pending/prepared and stale-epoch intents, preserve previously issued immutable replay without effects, refuse the withdrawn operating reader, keep unrelated global indexing, and require governed new admission plus verified SP-278 rebuild/currentness before fresh work. Backup/source-deletion/unsupported-version/read-token/CAS negatives refuse disclosure or preserve the old complete publication; they cannot fabricate missing originals. Native fsync, concurrent CAS, restore authority and action-spy execution of these authored cases remain NOT_RUN.
  Static schema and semantic oracles are Plans/small_owner_event_fixtures.json and scripts/pm-small-owner-events.py. Native append durability, crash cuts, backup/restore and live permission/CAS tests are authored obligations, NOT_RUN. No writer, handler or native availability follows from this preparation.
  format.applied append and current retry reject replay_policy=projector_replay_only as replay_only_not_appendable before semantic receipt resolution. That policy remains compatibility-reader-only; immutable historical semantic/full-value reads retain their separate role and unchanged digest. Before terminal publication validate the delivered eleven-field first AppendReceipt against protected original committed full-value custody and its exact EventRecord/result; a foreign, missing or mutated receipt publishes no success and never undoes or duplicates the already durable frame. Each identifier/path regex uses a full-match guard plus CR/LF refusal, with trailing-LF negatives. Its exact-family fixture matrix tests replay-only append/retry, every receipt-publication field, encoded project~ partitions, the inline byte cap and (where reachable) 16383/16384/16385-byte and SP-337 external-body boundaries.
  Checkpoint identity for format.applied: before atomic rebuild publication, validate the nine-field durable token against the SP-278 read_token schema with redb_snapshot_id removed and full-match identifier checks. Its storage_instance_id, source_selection.storage_instance_id and event_record_index_checkpoint.v1:{storage_instance_id} key must identify the Storage instance of this original event; its index_dataset_name must identify its generation_id. Match every durable field to the independently captured CURRENT-selected live token after removing only redb_snapshot_id, and match the publication frontier_revision to that token. Missing, malformed, foreign, coherently substituted, trailing-LF or stale tokens preserve the old rows and checkpoint without effects; never copy an unchecked proposed checkpoint. Passive reads validate the same Storage/key/generation joins before comparing the exact selected live token. Each exact-family oracle includes these identity failures, persisted-snapshot refusal and immutable-publication checks.
  Historical operating reads and rebuild for format.applied authenticate the retained EventRecord against Storage's protected original source and full-value commitment at the selected CURRENT frontier, including Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. A retained event valid when written remains readable after live owner request/session/admission retirement, including compatibility-reader-only projector_replay_only history; never rerun current-writer admission or require a transient old owner request. Current reader withdrawal, permission, source presence/deletion/hold and supported-version fences still apply. Forged bytes, foreign family/Storage/source selection or missing protected originals refuse disclosure and preserve the old rebuild publication. Caller semantic retry continues to exclude Storage-assigned metadata; append/current retry still refuse replay_only_not_appendable. Check 11 isolation is exercised by the Method B guard tables in scripts/pm_small_owner_table_*.py under the gated scripts/pm_guard_isolation.py: each refusal witness starts from a valid case, changes one semantic fact and keeps all Storage/source, generation/dataset and selected/durable observation copies coherent. The tool cuts each guard row in turn; its witnesses must become accepted, unrelated witnesses must still reject, and the complete checker must fail. Identifier grammar failures are separate from valid-grammar identity mismatches; no production guard is weakened.
  Sweep part 2A/2B numbers for format.applied: current input uses the shared CV-1100 calls (current_integer_token/current_integer at every integer slot, producer_semantic_bytes/producer_semantic_digest over the unchanged full producer projection beside CV-317, storage_value_bytes with EVENT_VALUE beside SP-026/SP-236, and storage_uint64 beside SP-1100 at the Storage sequence joins); no lane-local integer cap, serializer or normalization remains. Retained originals verify under the frozen dm-retained-producer-v1 recipe beside SP-1101/SP-286, selected only through the protected original custody, never through current request data; full Storage uint64, physical float bytes and signed zero are preserved. Current and retained timestamps are checked by the shared CV-1101 predicate pm_event_datetime.date_time: occurred_at_utc and the family payload clock use the event_record profile, and Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile beside CV-253; the frozen dm-retained-producer-v1 recipe beside SP-1101 selects those profiles, and request data cannot select a profile.
gui_related: false
gui_classification_reason: Backend EventRecord contract, not a visual specification.
depends_on:
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Exact family semantics, schema, identity, replay and withdrawal checks pass; no admission or native proof follows.
validation_surfaces:
- python3 scripts/pm-small-owner-events.py
risk_class: event_authority_binding_drift
reasoning_tier: high
context_scope: event_authority_DM_20261104
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DM-search.json
preserved_exact_tokens: []
negative_constraints:
- No Event Authority admission, native readiness, retention choice or new user-visible behavior.
```


### SP-601 - Event Authority lsp.server.lifecycle_changed persistence and passive reader

```yaml
plan_unit_id: SP-601
unit_type: event_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  lsp.server.lifecycle_changed persistence and passive reader
  lsp.server.lifecycle_changed 1.0.0 — newly authored owner contract under DL-045.
  Prepared without admission. Exact payload is Plans/event_payloads/lsp_server_lifecycle_changed.schema.json (pm.event_payload.lsp_server_lifecycle_changed.v1); no sibling or legacy spelling is admitted. Scope is project_only; project_id is a real immutable Project ID; application scope, null, empty and sentinel Project identities are forbidden. Payload project_id equals the envelope join. Existing CV-365 scope rules remain mandatory. Optional envelope lineage comes from the original operation, never ambient focus. Schema-only validity is insufficient. LSP previous_state and state must differ and the original supervisor observation must prove that exact Host/server/root/session edge under LSPSupport section 14.3. A valid enum alone never proves a transition.
  Producer: LspSupervisor lifecycle adapter. Observe one LspSupervisor transition for the exact Host/server/root attachment. Use canonical states Starting, Initializing, Ready, RestartBackoff, Degraded, ShuttingDown, Stopped (LSPSupport section 14.3); legacy stopped/starting/initializing/ready/degraded/stopping map by meaning, and a crash is a reason on RestartBackoff or Stopped rather than a new canonical state. No replay spawns a server, sends initialize, reopens a document or retries a crash.
  Freeze operation_id from fresh entropy in the original owning operation before its effect; preserve it and all source facts on retry/restart. Freeze the completion payload after owner success, before append. If the original operation cannot durably retain its intent/result, publication fails closed: never rerun the effect to reconstruct evidence. This contract creates no independent operation journal or stored value. The owner retains its existing intent/result and source refs under its existing storage contract.
  Adopt SP-286 first-AppendReceipt custody and CV-339 full-value v2 successor by name, including SP-336/SP-347 current group-commit rules. Validate admission before append; absent membership, unresolved retention or unavailable source custody prevents activation. Referenced bodies commit under SP-337 before append. The first original AppendReceipt is exposed only after the durable group frame; terminal event success publication follows that receipt. Lost acknowledgement returns that original full stored result and receipt, never a second effect or new receipt; equal identity with different semantic digest is a conflict, not a retry.
  Identity digest is SHA-256 of UTF-8 compact JSON array ["lsp.server.lifecycle_changed", "1.0.0", storage_instance_id, payload.project_id, payload.operation_id], with ensure_ascii=false, no whitespace and array order preserved. event_id="evt_"+digest; idempotency_key="lsp.server.lifecycle_changed:"+digest; family_revision=1.0.0, replay_policy=dedupe_by_idempotency_key, redaction_profile=no_secrets. Use Contracts_V0.md#EventRecord for the closed envelope, not a local field list. Envelope occurred_at_utc equals payload.ts byte-for-byte from the original LspSupervisor Host/server/root/session observation; retry time is forbidden. Storage alone assigns sequence_id, observed_at_utc and persisted_at_utc. Full producer semantic digest uses EventRecord and CV-339, not only the identity tuple.
  Exact envelope joins for lsp.server.lifecycle_changed: actor_ref is the non-empty non-secret actor reference retained by the original LspSupervisor Host/server/root/session observation identifying the actual LspSupervisor service for payload.host_id (not the focused editor user). correlation_id is the non-empty correlation_id frozen by that same original owner operation; payload.operation_id equals its immutable operation_id. Never synthesize either required value as null. Scope/project and the entire frozen payload must equal that original operation result. The original observation must join payload.host_id, server_id, root_identity, lsp_session_id, previous_state, state and ts exactly. Other nullable EventRecord lineage, account, causal and upstream-sequence joins copy the retained original operation facts, including required-present nulls only when that original has no such join; they are never populated from ambient focus. payload_ref is null for this bounded inline payload; enforce Storage's 16 KiB inline canonical MessagePack byte limit before append; new-native migration fields are null. Freeze all these producer values before append and resolve the complete original EventRecord through storage.first_append_receipt.resolve_full_value.v1 on receipt-dependent recovery. Required non-null fields retain their schema-required types.
  Operating consumer reader.lsp.lifecycle@1.0.0 uses reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, explicitly adopting SP-278. It reads this exact event_type/revision/scope only after the complete CURRENT-selected global frontier is verified. Its checkpoint is the existing checkpoints key event_record_index_checkpoint.v1:{storage_instance_id}, value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint; no family-specific persisted cursor or projection is introduced. Generic rows and frontier advance atomically by the existing SP-278 CAS; a failed CAS preserves the old publication and is retried from a fresh snapshot. Operating reads are passive with no durable progress, so their own checkpoint is explicitly none. Each read uses the exact live ten-field read_token in one real redb snapshot; any stored read token must instead be the nine-field DL-076 durable token with redb_snapshot_id removed, never a persisted snapshot identity. Rebuild uses original retained seglog through SP-278, preserving identity and no side effects. Unauthorized, deleted, unsupported, stale or unresolved source reads return unavailable; they cannot produce empty-success evidence.
  Profile rationale for lsp.server.lifecycle_changed: only opaque attachment identities, canonical states and a sanitized bounded reason code are inline; raw logs, URIs, paths and server stderr are forbidden; redaction_profile=no_secrets is an existing EventRecord value and does not grant source access.
  Custody remains with LspSupervisor lifecycle adapter and Storage's original seglog/payload owners. Store only bounded metadata and opaque authorized source refs; no transcript, diff body, secrets, provider response, private absolute path or credential content. Recheck current permission, source deletion/tombstone and hold gates before each disclosure; a ref is not permission. Backup captures coherent original events, refs and first-receipt custody under BRS-031; derived index is rebuildable, never backup authority. Restore verifies original identities and current source availability; missing originals remain unavailable rather than reconstructed from an index.
  Retention policy: PENDING_RETENTION_DECISION. For a PENDING marker no class is selected: candidate RP-RUNTIME-365D (runtime observation), RP-OPERATIONAL-2555D (operational diagnostic), or RP-AUTHORITY-INDEFINITE (audit/source lineage) per Case L-3; RT must settle the actual role. Existing generic checkpoint/index retain RP-PROJECTION-3GEN and SP-278 source-coupled constraints; no new stored derived record is owned here.
  Compatibility: only this exact 1.0.0 schema is a current writer candidate. Historical names/bytes remain unchanged; unknown future revisions halt the consumer before advance, never normalize by guessed payload. Withdrawal first disables the exact producer's admission, drains/fences outstanding intents and prohibits append under stale admission. Then reader.lsp.lifecycle@1.0.0 refuses disclosure and fences its in-memory token; generic global indexing remains available for other families. Re-enable only after governed schema/admission validation and verified SP-278 rebuild/currentness. No source deletion, history rewrite or zero-cursor substitution is authorized.
  Exact-family oracle matrix for lsp.server.lifecycle_changed: Plans/small_owner_event_fixtures.json owns its full EventRecord, independent original owner operation/result, original eleven-field receipt and four-field append result, full-value commitment, and positive/negative vectors; scripts/pm-small-owner-events.py validates them without registry admission. Positive append vectors assume fixture-only resolved membership/retention; actual absent membership and PENDING_RETENTION_DECISION refuse activation. Every required envelope field, profile (including redacted_refs_only), actor/correlation/time/payload/subject join and same-identity changed semantic value has a refusal vector. The admission matrix cuts missing membership/schema/retention/permission/dedupe/source/original intent/original result/current owner acceptance/body commit/current lease/restore controls before append, then cuts uncommitted group, unsynced group, receipt exposure and terminal publication. A durable commit with lost acknowledgement or lagging custody rows returns the same original result/receipt; no durable commit returns no receipt. The original owner acceptance freezes its admission epoch, actual owner session and restore occurrence; seal compares all three to current owner/Storage controls. Re-enable never relabels an old intent: fresh acceptance uses a different logical operation_id. Recovery never reruns LspSupervisor lifecycle adapter or reconstructs old owner admission. Withdrawal vectors fence pending/prepared and stale-epoch intents, preserve previously issued immutable replay without effects, refuse the withdrawn operating reader, keep unrelated global indexing, and require governed new admission plus verified SP-278 rebuild/currentness before fresh work. Backup/source-deletion/unsupported-version/read-token/CAS negatives refuse disclosure or preserve the old complete publication; they cannot fabricate missing originals. Native fsync, concurrent CAS, restore authority and action-spy execution of these authored cases remain NOT_RUN.
  Static schema and semantic oracles are Plans/small_owner_event_fixtures.json and scripts/pm-small-owner-events.py. Native append durability, crash cuts, backup/restore and live permission/CAS tests are authored obligations, NOT_RUN. No writer, handler or native availability follows from this preparation.
  lsp.server.lifecycle_changed append and current retry reject replay_policy=projector_replay_only as replay_only_not_appendable before semantic receipt resolution. That policy remains compatibility-reader-only; immutable historical semantic/full-value reads retain their separate role and unchanged digest. Before terminal publication validate the delivered eleven-field first AppendReceipt against protected original committed full-value custody and its exact EventRecord/result; a foreign, missing or mutated receipt publishes no success and never undoes or duplicates the already durable frame. Each identifier/path regex uses a full-match guard plus CR/LF refusal, with trailing-LF negatives. Its exact-family fixture matrix tests replay-only append/retry, every receipt-publication field, encoded project~ partitions, the inline byte cap and (where reachable) 16383/16384/16385-byte and SP-337 external-body boundaries.
  Checkpoint identity for lsp.server.lifecycle_changed: before atomic rebuild publication, validate the nine-field durable token against the SP-278 read_token schema with redb_snapshot_id removed and full-match identifier checks. Its storage_instance_id, source_selection.storage_instance_id and event_record_index_checkpoint.v1:{storage_instance_id} key must identify the Storage instance of this original event; its index_dataset_name must identify its generation_id. Match every durable field to the independently captured CURRENT-selected live token after removing only redb_snapshot_id, and match the publication frontier_revision to that token. Missing, malformed, foreign, coherently substituted, trailing-LF or stale tokens preserve the old rows and checkpoint without effects; never copy an unchecked proposed checkpoint. Passive reads validate the same Storage/key/generation joins before comparing the exact selected live token. Each exact-family oracle includes these identity failures, persisted-snapshot refusal and immutable-publication checks.
  Historical operating reads and rebuild for lsp.server.lifecycle_changed authenticate the retained EventRecord against Storage's protected original source and full-value commitment at the selected CURRENT frontier, including Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. A retained event valid when written remains readable after live owner request/session/admission retirement, including compatibility-reader-only projector_replay_only history; never rerun current-writer admission or require a transient old owner request. Current reader withdrawal, permission, source presence/deletion/hold and supported-version fences still apply. Forged bytes, foreign family/Storage/source selection or missing protected originals refuse disclosure and preserve the old rebuild publication. Caller semantic retry continues to exclude Storage-assigned metadata; append/current retry still refuse replay_only_not_appendable. Check 11 isolation is exercised by the Method B guard tables in scripts/pm_small_owner_table_*.py under the gated scripts/pm_guard_isolation.py: each refusal witness starts from a valid case, changes one semantic fact and keeps all Storage/source, generation/dataset and selected/durable observation copies coherent. The tool cuts each guard row in turn; its witnesses must become accepted, unrelated witnesses must still reject, and the complete checker must fail. Identifier grammar failures are separate from valid-grammar identity mismatches; no production guard is weakened.
  Sweep part 2A/2B numbers for lsp.server.lifecycle_changed: current input uses the shared CV-1100 calls (current_integer_token/current_integer at every integer slot, producer_semantic_bytes/producer_semantic_digest over the unchanged full producer projection beside CV-317, storage_value_bytes with EVENT_VALUE beside SP-026/SP-236, and storage_uint64 beside SP-1100 at the Storage sequence joins); no lane-local integer cap, serializer or normalization remains. Retained originals verify under the frozen dm-retained-producer-v1 recipe beside SP-1101/SP-286, selected only through the protected original custody, never through current request data; full Storage uint64, physical float bytes and signed zero are preserved. Current and retained timestamps are checked by the shared CV-1101 predicate pm_event_datetime.date_time: occurred_at_utc and the family payload clock use the event_record profile, and Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile beside CV-253; the frozen dm-retained-producer-v1 recipe beside SP-1101 selects those profiles, and request data cannot select a profile.
gui_related: false
gui_classification_reason: Backend EventRecord contract, not a visual specification.
depends_on:
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Exact family semantics, schema, identity, replay and withdrawal checks pass; no admission or native proof follows.
validation_surfaces:
- python3 scripts/pm-small-owner-events.py
risk_class: event_authority_binding_drift
reasoning_tier: high
context_scope: event_authority_DM_20261104
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DM-search.json
preserved_exact_tokens: []
negative_constraints:
- No Event Authority admission, native readiness, retention choice or new user-visible behavior.
```


### SP-602 - Event Authority model.catalog_refreshed persistence and passive reader

```yaml
plan_unit_id: SP-602
unit_type: event_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  model.catalog_refreshed persistence and passive reader
  model.catalog_refreshed 1.0.0 — newly authored owner contract under DL-045.
  Prepared without admission. Exact payload is Plans/event_payloads/model_catalog_refreshed.schema.json (pm.event_payload.model_catalog_refreshed.v1); no sibling or legacy spelling is admitted. Scope is application_or_project; project_id is a real immutable Project ID or, only for application scope, null; never an empty or sentinel Project. Payload project_id equals the envelope join. Existing CV-365 scope rules remain mandatory. Optional envelope lineage comes from the original operation, never ambient focus. Schema-only validity is insufficient.
  Producer: shared model capability resolver refresh completion adapter. Capture completion of cmd.model.refresh, or the already specified automatic refresh, after the resolver publishes its exact catalog revision and provider status refs. A partial refresh remains partial in those status refs; stale cached entries never imply provider readiness. Failure before a new revision publishes emits no completion.
  Freeze operation_id from fresh entropy in the original owning operation before its effect; preserve it and all source facts on retry/restart. Freeze the completion payload after owner success, before append. If the original operation cannot durably retain its intent/result, publication fails closed: never rerun the effect to reconstruct evidence. This contract creates no independent operation journal or stored value. The owner retains its existing intent/result and source refs under its existing storage contract.
  Adopt SP-286 first-AppendReceipt custody and CV-339 full-value v2 successor by name, including SP-336/SP-347 current group-commit rules. Validate admission before append; absent membership, unresolved retention or unavailable source custody prevents activation. Referenced bodies commit under SP-337 before append. The first original AppendReceipt is exposed only after the durable group frame; terminal event success publication follows that receipt. Lost acknowledgement returns that original full stored result and receipt, never a second effect or new receipt; equal identity with different semantic digest is a conflict, not a retry.
  Identity digest is SHA-256 of UTF-8 compact JSON array ["model.catalog_refreshed", "1.0.0", storage_instance_id, payload.project_id, payload.operation_id], with ensure_ascii=false, no whitespace and array order preserved. event_id="evt_"+digest; Project idempotency_key="model.catalog_refreshed:"+digest; application idempotency_key=application@1:{hex(server_id)}:{hex(owner_operation_id)} exactly under CV-366. For model.catalog_refreshed, server_id is the actual Server identity durably frozen by its original shared model capability resolver refresh completion adapter; owner_operation_id is that same original payload.operation_id. Encode each complete exact UTF-8 byte string as lowercase hexadecimal without hashing, trimming or normalization; absent original Server identity refuses publication. Never take Server identity from the retrying Client, current focus or storage_instance_id; family_revision=1.0.0, replay_policy=dedupe_by_idempotency_key, redaction_profile=secret_refs_only. Use Contracts_V0.md#EventRecord for the closed envelope, not a local field list. Envelope occurred_at_utc equals payload.completed_at_utc byte-for-byte from the original Models manual or automatic catalog refresh; retry time is forbidden. Storage alone assigns sequence_id, observed_at_utc and persisted_at_utc. Full producer semantic digest uses EventRecord and CV-339, not only the identity tuple.
  Exact envelope joins for model.catalog_refreshed: actor_ref is the non-empty non-secret actor reference retained by the original Models manual or automatic catalog refresh: the accepted cmd.model.refresh actor for a manual refresh, or the actual resolver service actor for an automatic refresh. correlation_id is the non-empty correlation_id frozen by that same original owner operation; payload.operation_id equals its immutable operation_id. Never synthesize either required value as null. Scope/project and the entire frozen payload must equal that original operation result. The published original Models revision must join model_catalog_revision, provider_status_refs, provider_id and account_id exactly. Other nullable EventRecord lineage, account, causal and upstream-sequence joins copy the retained original operation facts, including required-present nulls only when that original has no such join; they are never populated from ambient focus. For model.catalog_refreshed, measure the exact uncompressed canonical MessagePack logical body bytes under Case L-2. At most 16 KiB stays inline with payload_ref=null. Above 16 KiB, SP-337 owns the pack bytes/index: payload={} and payload_ref is UTF-8 compact JSON with lexicographically sorted keys {"blake3_id":<lowercase BLAKE3 of those exact bytes>,"byte_size":<exact uncompressed byte count>,"media_type":"application/msgpack"}, no whitespace. This newly authored owner binding preserves EventRecord's existing string ref type and the same exact closed logical payload schema after authorized resolution. In external mode every payload field join and identity recipe in this unit refers to that resolved logical body; the stored inline map stays empty. Freeze body, descriptor and representation before append; pack bytes and index must be durable before receipt issuance. Reject oversized inline bodies, inline/base64 duplicates, missing or uncommitted pack/index, changed bytes/id/size/media type, unavailable permission/deletion/hold/source, and substituted refs. Do not hash payload-store bytes with SHA-256; CV-339 semantic/full-value domains remain unchanged. Resolved logical payload joins the complete original result; immutable replay returns the original stored representation and receipt. New-native migration fields are null. Freeze all these producer values before append and resolve the complete original EventRecord through storage.first_append_receipt.resolve_full_value.v1 on receipt-dependent recovery. Required non-null fields retain their schema-required types.
  Operating consumer reader.models.catalog_refresh@1.0.0 uses reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, explicitly adopting SP-278. It reads this exact event_type/revision/scope only after the complete CURRENT-selected global frontier is verified. Its checkpoint is the existing checkpoints key event_record_index_checkpoint.v1:{storage_instance_id}, value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint; no family-specific persisted cursor or projection is introduced. Generic rows and frontier advance atomically by the existing SP-278 CAS; a failed CAS preserves the old publication and is retried from a fresh snapshot. Operating reads are passive with no durable progress, so their own checkpoint is explicitly none. Each read uses the exact live ten-field read_token in one real redb snapshot; any stored read token must instead be the nine-field DL-076 durable token with redb_snapshot_id removed, never a persisted snapshot identity. Rebuild uses original retained seglog through SP-278, preserving identity and no side effects. Unauthorized, deleted, unsupported, stale or unresolved source reads return unavailable; they cannot produce empty-success evidence.
  Profile rationale for model.catalog_refreshed: provider status bodies and sensitive provider/account details remain behind authorized refs; account_id is an opaque Models identifier, never credentials; redaction_profile=secret_refs_only is an existing EventRecord value and does not grant source access.
  Custody remains with shared model capability resolver refresh completion adapter and Storage's original seglog/payload owners. Store only bounded metadata and opaque authorized source refs; no transcript, diff body, secrets, provider response, private absolute path or credential content. Recheck current permission, source deletion/tombstone and hold gates before each disclosure; a ref is not permission. Backup captures coherent original events, refs and first-receipt custody under BRS-031; derived index is rebuildable, never backup authority. Restore verifies original identities and current source availability; missing originals remain unavailable rather than reconstructed from an index.
  Retention policy: PENDING_RETENTION_DECISION. For a PENDING marker no class is selected: candidate RP-RUNTIME-365D (runtime observation), RP-OPERATIONAL-2555D (operational diagnostic), or RP-AUTHORITY-INDEFINITE (audit/source lineage) per Case L-3; RT must settle the actual role. Existing generic checkpoint/index retain RP-PROJECTION-3GEN and SP-278 source-coupled constraints; no new stored derived record is owned here.
  Compatibility: only this exact 1.0.0 schema is a current writer candidate. Historical names/bytes remain unchanged; unknown future revisions halt the consumer before advance, never normalize by guessed payload. Withdrawal first disables the exact producer's admission, drains/fences outstanding intents and prohibits append under stale admission. Then reader.models.catalog_refresh@1.0.0 refuses disclosure and fences its in-memory token; generic global indexing remains available for other families. Re-enable only after governed schema/admission validation and verified SP-278 rebuild/currentness. No source deletion, history rewrite or zero-cursor substitution is authorized.
  Exact-family oracle matrix for model.catalog_refreshed: Plans/small_owner_event_fixtures.json owns its full EventRecord, independent original owner operation/result, original eleven-field receipt and four-field append result, full-value commitment, and positive/negative vectors; scripts/pm-small-owner-events.py validates them without registry admission. Positive append vectors assume fixture-only resolved membership/retention; actual absent membership and PENDING_RETENTION_DECISION refuse activation. Every required envelope field, profile (including redacted_refs_only), actor/correlation/time/payload/subject join and same-identity changed semantic value has a refusal vector. The admission matrix cuts missing membership/schema/retention/permission/dedupe/source/original intent/original result/current owner acceptance/body commit/current lease/restore controls before append, then cuts uncommitted group, unsynced group, receipt exposure and terminal publication. A durable commit with lost acknowledgement or lagging custody rows returns the same original result/receipt; no durable commit returns no receipt. The original owner acceptance freezes its admission epoch, actual owner session and restore occurrence; seal compares all three to current owner/Storage controls. Re-enable never relabels an old intent: fresh acceptance uses a different logical operation_id. Recovery never reruns shared model capability resolver refresh completion adapter or reconstructs old owner admission. Withdrawal vectors fence pending/prepared and stale-epoch intents, preserve previously issued immutable replay without effects, refuse the withdrawn operating reader, keep unrelated global indexing, and require governed new admission plus verified SP-278 rebuild/currentness before fresh work. Backup/source-deletion/unsupported-version/read-token/CAS negatives refuse disclosure or preserve the old complete publication; they cannot fabricate missing originals. Native fsync, concurrent CAS, restore authority and action-spy execution of these authored cases remain NOT_RUN.
  Static schema and semantic oracles are Plans/small_owner_event_fixtures.json and scripts/pm-small-owner-events.py. Native append durability, crash cuts, backup/restore and live permission/CAS tests are authored obligations, NOT_RUN. No writer, handler or native availability follows from this preparation.
  model.catalog_refreshed append and current retry reject replay_policy=projector_replay_only as replay_only_not_appendable before semantic receipt resolution. That policy remains compatibility-reader-only; immutable historical semantic/full-value reads retain their separate role and unchanged digest. Before terminal publication validate the delivered eleven-field first AppendReceipt against protected original committed full-value custody and its exact EventRecord/result; a foreign, missing or mutated receipt publishes no success and never undoes or duplicates the already durable frame. Each identifier/path regex uses a full-match guard plus CR/LF refusal, with trailing-LF negatives. Its exact-family fixture matrix tests replay-only append/retry, every receipt-publication field, encoded project~ partitions, the inline byte cap and (where reachable) 16383/16384/16385-byte and SP-337 external-body boundaries.
  Checkpoint identity for model.catalog_refreshed: before atomic rebuild publication, validate the nine-field durable token against the SP-278 read_token schema with redb_snapshot_id removed and full-match identifier checks. Its storage_instance_id, source_selection.storage_instance_id and event_record_index_checkpoint.v1:{storage_instance_id} key must identify the Storage instance of this original event; its index_dataset_name must identify its generation_id. Match every durable field to the independently captured CURRENT-selected live token after removing only redb_snapshot_id, and match the publication frontier_revision to that token. Missing, malformed, foreign, coherently substituted, trailing-LF or stale tokens preserve the old rows and checkpoint without effects; never copy an unchecked proposed checkpoint. Passive reads validate the same Storage/key/generation joins before comparing the exact selected live token. Each exact-family oracle includes these identity failures, persisted-snapshot refusal and immutable-publication checks.
  Historical operating reads and rebuild for model.catalog_refreshed authenticate the retained EventRecord against Storage's protected original source and full-value commitment at the selected CURRENT frontier, including Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. A retained event valid when written remains readable after live owner request/session/admission retirement, including compatibility-reader-only projector_replay_only history; never rerun current-writer admission or require a transient old owner request. Current reader withdrawal, permission, source presence/deletion/hold and supported-version fences still apply. Forged bytes, foreign family/Storage/source selection or missing protected originals refuse disclosure and preserve the old rebuild publication. Caller semantic retry continues to exclude Storage-assigned metadata; append/current retry still refuse replay_only_not_appendable. Check 11 isolation is exercised by the Method B guard tables in scripts/pm_small_owner_table_*.py under the gated scripts/pm_guard_isolation.py: each refusal witness starts from a valid case, changes one semantic fact and keeps all Storage/source, generation/dataset and selected/durable observation copies coherent. The tool cuts each guard row in turn; its witnesses must become accepted, unrelated witnesses must still reject, and the complete checker must fail. Identifier grammar failures are separate from valid-grammar identity mismatches; no production guard is weakened.
  Sweep part 2A/2B numbers for model.catalog_refreshed: current input uses the shared CV-1100 calls (current_integer_token/current_integer at every integer slot, producer_semantic_bytes/producer_semantic_digest over the unchanged full producer projection beside CV-317, storage_value_bytes with EVENT_VALUE beside SP-026/SP-236, and storage_uint64 beside SP-1100 at the Storage sequence joins); no lane-local integer cap, serializer or normalization remains. Retained originals verify under the frozen dm-retained-producer-v1 recipe beside SP-1101/SP-286, selected only through the protected original custody, never through current request data; full Storage uint64, physical float bytes and signed zero are preserved. Current and retained timestamps are checked by the shared CV-1101 predicate pm_event_datetime.date_time: occurred_at_utc and the family payload clock use the event_record profile, and Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile beside CV-253; the frozen dm-retained-producer-v1 recipe beside SP-1101 selects those profiles, and request data cannot select a profile.
gui_related: false
gui_classification_reason: Backend EventRecord contract, not a visual specification.
depends_on:
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Exact family semantics, schema, identity, replay and withdrawal checks pass; no admission or native proof follows.
validation_surfaces:
- python3 scripts/pm-small-owner-events.py
risk_class: event_authority_binding_drift
reasoning_tier: high
context_scope: event_authority_DM_20261104
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DM-search.json
preserved_exact_tokens: []
negative_constraints:
- No Event Authority admission, native readiness, retention choice or new user-visible behavior.
```


### SP-603 - Event Authority subagent.context_rehydrated persistence and passive reader

```yaml
plan_unit_id: SP-603
unit_type: event_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  subagent.context_rehydrated persistence and passive reader
  subagent.context_rehydrated 1.0.0 — newly authored owner contract under DL-045.
  Prepared without admission. Exact payload is Plans/event_payloads/subagent_context_rehydrated.schema.json (pm.event_payload.subagent_context_rehydrated.v1); no sibling or legacy spelling is admitted. Scope is application_or_project; project_id is a real immutable Project ID or, only for application scope, null; never an empty or sentinel Project. Payload project_id equals the envelope join. Existing CV-365 scope rules remain mandatory. CV-366 child lineage joins remain mandatory. Optional envelope lineage comes from the original operation, never ambient focus. Schema-only validity is insufficient. Context before_revision and after_revision require after=before+1; payload.run_id and envelope.run_id identify the parent and payload.child_run_id the exact child, joined to the original accepted child lineage.
  Producer: effective-context runtime rehydration adapter. When an already supported rehydration restores effective context, bind the original source refs and before/after effective-context revisions to the exact child identity. Source access/deletion checks precede restoration. No source history is rewritten, no missing source is fabricated, and replay never rehydrates or calls a provider.
  Freeze operation_id from fresh entropy in the original owning operation before its effect; preserve it and all source facts on retry/restart. Freeze the completion payload after owner success, before append. If the original operation cannot durably retain its intent/result, publication fails closed: never rerun the effect to reconstruct evidence. This contract creates no independent operation journal or stored value. The owner retains its existing intent/result and source refs under its existing storage contract.
  Adopt SP-286 first-AppendReceipt custody and CV-339 full-value v2 successor by name, including SP-336/SP-347 current group-commit rules. Validate admission before append; absent membership, unresolved retention or unavailable source custody prevents activation. Referenced bodies commit under SP-337 before append. The first original AppendReceipt is exposed only after the durable group frame; terminal event success publication follows that receipt. Lost acknowledgement returns that original full stored result and receipt, never a second effect or new receipt; equal identity with different semantic digest is a conflict, not a retry.
  Identity digest is SHA-256 of UTF-8 compact JSON array ["subagent.context_rehydrated", "1.0.0", storage_instance_id, payload.project_id, payload.operation_id], with ensure_ascii=false, no whitespace and array order preserved. event_id="evt_"+digest; Project idempotency_key="subagent.context_rehydrated:"+digest; application idempotency_key=application@1:{hex(server_id)}:{hex(owner_operation_id)} exactly under CV-366. For subagent.context_rehydrated, server_id is the actual Server identity durably frozen by its original effective-context runtime rehydration adapter; owner_operation_id is that same original payload.operation_id. Encode each complete exact UTF-8 byte string as lowercase hexadecimal without hashing, trimming or normalization; absent original Server identity refuses publication. Never take Server identity from the retrying Client, current focus or storage_instance_id; family_revision=1.0.0, replay_policy=dedupe_by_idempotency_key, redaction_profile=secret_refs_only. Use Contracts_V0.md#EventRecord for the closed envelope, not a local field list. Envelope occurred_at_utc equals payload.occurred_at_utc byte-for-byte from the original accepted child-context rehydration operation; retry time is forbidden. Storage alone assigns sequence_id, observed_at_utc and persisted_at_utc. Full producer semantic digest uses EventRecord and CV-339, not only the identity tuple.
  Exact envelope joins for subagent.context_rehydrated: actor_ref is the non-empty non-secret actor reference retained by the original accepted child-context rehydration operation for payload.agent_id and the exact payload.child_run_id. correlation_id is the non-empty correlation_id frozen by that same original owner operation; payload.operation_id equals its immutable operation_id. Never synthesize either required value as null. Scope/project and the entire frozen payload must equal that original operation result. Envelope run_id equals payload.run_id and the original parent run; the original source must also join payload.agent_id, child_run_id and before/after revisions. Other nullable EventRecord lineage, account, causal and upstream-sequence joins copy the retained original operation facts, including required-present nulls only when that original has no such join; they are never populated from ambient focus. For subagent.context_rehydrated, measure the exact uncompressed canonical MessagePack logical body bytes under Case L-2. At most 16 KiB stays inline with payload_ref=null. Above 16 KiB, SP-337 owns the pack bytes/index: payload={} and payload_ref is UTF-8 compact JSON with lexicographically sorted keys {"blake3_id":<lowercase BLAKE3 of those exact bytes>,"byte_size":<exact uncompressed byte count>,"media_type":"application/msgpack"}, no whitespace. This newly authored owner binding preserves EventRecord's existing string ref type and the same exact closed logical payload schema after authorized resolution. In external mode every payload field join and identity recipe in this unit refers to that resolved logical body; the stored inline map stays empty. Freeze body, descriptor and representation before append; pack bytes and index must be durable before receipt issuance. Reject oversized inline bodies, inline/base64 duplicates, missing or uncommitted pack/index, changed bytes/id/size/media type, unavailable permission/deletion/hold/source, and substituted refs. Do not hash payload-store bytes with SHA-256; CV-339 semantic/full-value domains remain unchanged. Resolved logical payload joins the complete original result; immutable replay returns the original stored representation and receipt. New-native migration fields are null. Freeze all these producer values before append and resolve the complete original EventRecord through storage.first_append_receipt.resolve_full_value.v1 on receipt-dependent recovery. Required non-null fields retain their schema-required types.
  Operating consumer reader.context.rehydrated@1.0.0 uses reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, explicitly adopting SP-278. It reads this exact event_type/revision/scope only after the complete CURRENT-selected global frontier is verified. Its checkpoint is the existing checkpoints key event_record_index_checkpoint.v1:{storage_instance_id}, value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint; no family-specific persisted cursor or projection is introduced. Generic rows and frontier advance atomically by the existing SP-278 CAS; a failed CAS preserves the old publication and is retried from a fresh snapshot. Operating reads are passive with no durable progress, so their own checkpoint is explicitly none. Each read uses the exact live ten-field read_token in one real redb snapshot; any stored read token must instead be the nine-field DL-076 durable token with redb_snapshot_id removed, never a persisted snapshot identity. Rebuild uses original retained seglog through SP-278, preserving identity and no side effects. Unauthorized, deleted, unsupported, stale or unresolved source reads return unavailable; they cannot produce empty-success evidence.
  Profile rationale for subagent.context_rehydrated: source and effective-context bodies remain behind authorized refs; redaction_profile=secret_refs_only is an existing EventRecord value and does not grant source access.
  Custody remains with effective-context runtime rehydration adapter and Storage's original seglog/payload owners. Store only bounded metadata and opaque authorized source refs; no transcript, diff body, secrets, provider response, private absolute path or credential content. Recheck current permission, source deletion/tombstone and hold gates before each disclosure; a ref is not permission. Backup captures coherent original events, refs and first-receipt custody under BRS-031; derived index is rebuildable, never backup authority. Restore verifies original identities and current source availability; missing originals remain unavailable rather than reconstructed from an index.
  Retention policy: RP-RUNTIME-365D. Runtime context events are Runtime/run/child attempt evidence under Storage Case L-3, 365 days, subject to existing holds and source anchors. For a PENDING marker no class is selected: candidate RP-RUNTIME-365D (runtime observation), RP-OPERATIONAL-2555D (operational diagnostic), or RP-AUTHORITY-INDEFINITE (audit/source lineage) per Case L-3; RT must settle the actual role. Existing generic checkpoint/index retain RP-PROJECTION-3GEN and SP-278 source-coupled constraints; no new stored derived record is owned here.
  Compatibility: only this exact 1.0.0 schema is a current writer candidate. Historical names/bytes remain unchanged; unknown future revisions halt the consumer before advance, never normalize by guessed payload. Withdrawal first disables the exact producer's admission, drains/fences outstanding intents and prohibits append under stale admission. Then reader.context.rehydrated@1.0.0 refuses disclosure and fences its in-memory token; generic global indexing remains available for other families. Re-enable only after governed schema/admission validation and verified SP-278 rebuild/currentness. No source deletion, history rewrite or zero-cursor substitution is authorized.
  Exact-family oracle matrix for subagent.context_rehydrated: Plans/small_owner_event_fixtures.json owns its full EventRecord, independent original owner operation/result, original eleven-field receipt and four-field append result, full-value commitment, and positive/negative vectors; scripts/pm-small-owner-events.py validates them without registry admission. Positive append vectors assume fixture-only resolved membership/retention; actual absent membership and PENDING_RETENTION_DECISION refuse activation. Every required envelope field, profile (including redacted_refs_only), actor/correlation/time/payload/subject join and same-identity changed semantic value has a refusal vector. The admission matrix cuts missing membership/schema/retention/permission/dedupe/source/original intent/original result/current owner acceptance/body commit/current lease/restore controls before append, then cuts uncommitted group, unsynced group, receipt exposure and terminal publication. A durable commit with lost acknowledgement or lagging custody rows returns the same original result/receipt; no durable commit returns no receipt. The original owner acceptance freezes its admission epoch, actual owner session and restore occurrence; seal compares all three to current owner/Storage controls. Re-enable never relabels an old intent: fresh acceptance uses a different logical operation_id. Recovery never reruns effective-context runtime rehydration adapter or reconstructs old owner admission. Withdrawal vectors fence pending/prepared and stale-epoch intents, preserve previously issued immutable replay without effects, refuse the withdrawn operating reader, keep unrelated global indexing, and require governed new admission plus verified SP-278 rebuild/currentness before fresh work. Backup/source-deletion/unsupported-version/read-token/CAS negatives refuse disclosure or preserve the old complete publication; they cannot fabricate missing originals. Native fsync, concurrent CAS, restore authority and action-spy execution of these authored cases remain NOT_RUN.
  Static schema and semantic oracles are Plans/small_owner_event_fixtures.json and scripts/pm-small-owner-events.py. Native append durability, crash cuts, backup/restore and live permission/CAS tests are authored obligations, NOT_RUN. No writer, handler or native availability follows from this preparation.
  subagent.context_rehydrated append and current retry reject replay_policy=projector_replay_only as replay_only_not_appendable before semantic receipt resolution. That policy remains compatibility-reader-only; immutable historical semantic/full-value reads retain their separate role and unchanged digest. Before terminal publication validate the delivered eleven-field first AppendReceipt against protected original committed full-value custody and its exact EventRecord/result; a foreign, missing or mutated receipt publishes no success and never undoes or duplicates the already durable frame. Each identifier/path regex uses a full-match guard plus CR/LF refusal, with trailing-LF negatives. Its exact-family fixture matrix tests replay-only append/retry, every receipt-publication field, encoded project~ partitions, the inline byte cap and (where reachable) 16383/16384/16385-byte and SP-337 external-body boundaries.
  Checkpoint identity for subagent.context_rehydrated: before atomic rebuild publication, validate the nine-field durable token against the SP-278 read_token schema with redb_snapshot_id removed and full-match identifier checks. Its storage_instance_id, source_selection.storage_instance_id and event_record_index_checkpoint.v1:{storage_instance_id} key must identify the Storage instance of this original event; its index_dataset_name must identify its generation_id. Match every durable field to the independently captured CURRENT-selected live token after removing only redb_snapshot_id, and match the publication frontier_revision to that token. Missing, malformed, foreign, coherently substituted, trailing-LF or stale tokens preserve the old rows and checkpoint without effects; never copy an unchecked proposed checkpoint. Passive reads validate the same Storage/key/generation joins before comparing the exact selected live token. Each exact-family oracle includes these identity failures, persisted-snapshot refusal and immutable-publication checks.
  Historical operating reads and rebuild for subagent.context_rehydrated authenticate the retained EventRecord against Storage's protected original source and full-value commitment at the selected CURRENT frontier, including Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. A retained event valid when written remains readable after live owner request/session/admission retirement, including compatibility-reader-only projector_replay_only history; never rerun current-writer admission or require a transient old owner request. Current reader withdrawal, permission, source presence/deletion/hold and supported-version fences still apply. Forged bytes, foreign family/Storage/source selection or missing protected originals refuse disclosure and preserve the old rebuild publication. Caller semantic retry continues to exclude Storage-assigned metadata; append/current retry still refuse replay_only_not_appendable. Check 11 isolation is exercised by the Method B guard tables in scripts/pm_small_owner_table_*.py under the gated scripts/pm_guard_isolation.py: each refusal witness starts from a valid case, changes one semantic fact and keeps all Storage/source, generation/dataset and selected/durable observation copies coherent. The tool cuts each guard row in turn; its witnesses must become accepted, unrelated witnesses must still reject, and the complete checker must fail. Identifier grammar failures are separate from valid-grammar identity mismatches; no production guard is weakened.
  Sweep part 2A/2B numbers for subagent.context_rehydrated: current input uses the shared CV-1100 calls (current_integer_token/current_integer at every integer slot, producer_semantic_bytes/producer_semantic_digest over the unchanged full producer projection beside CV-317, storage_value_bytes with EVENT_VALUE beside SP-026/SP-236, and storage_uint64 beside SP-1100 at the Storage sequence joins); no lane-local integer cap, serializer or normalization remains. Retained originals verify under the frozen dm-retained-producer-v1 recipe beside SP-1101/SP-286, selected only through the protected original custody, never through current request data; full Storage uint64, physical float bytes and signed zero are preserved. Current and retained timestamps are checked by the shared CV-1101 predicate pm_event_datetime.date_time: occurred_at_utc and the family payload clock use the event_record profile, and Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile beside CV-253; the frozen dm-retained-producer-v1 recipe beside SP-1101 selects those profiles, and request data cannot select a profile.
gui_related: false
gui_classification_reason: Backend EventRecord contract, not a visual specification.
depends_on:
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Exact family semantics, schema, identity, replay and withdrawal checks pass; no admission or native proof follows.
validation_surfaces:
- python3 scripts/pm-small-owner-events.py
risk_class: event_authority_binding_drift
reasoning_tier: high
context_scope: event_authority_DM_20261104
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DM-search.json
preserved_exact_tokens: []
negative_constraints:
- No Event Authority admission, native readiness, retention choice or new user-visible behavior.
```


### SP-604 - Event Authority subagent.context_shrunk persistence and passive reader

```yaml
plan_unit_id: SP-604
unit_type: event_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  subagent.context_shrunk persistence and passive reader
  subagent.context_shrunk 1.0.0 — newly authored owner contract under DL-045.
  Prepared without admission. Exact payload is Plans/event_payloads/subagent_context_shrunk.schema.json (pm.event_payload.subagent_context_shrunk.v1); no sibling or legacy spelling is admitted. Scope is application_or_project; project_id is a real immutable Project ID or, only for application scope, null; never an empty or sentinel Project. Payload project_id equals the envelope join. Existing CV-365 scope rules remain mandatory. CV-366 child lineage joins remain mandatory. Optional envelope lineage comes from the original operation, never ambient focus. Schema-only validity is insufficient. Context before_revision and after_revision require after=before+1; payload.run_id and envelope.run_id identify the parent and payload.child_run_id the exact child, joined to the original accepted child lineage.
  Producer: effective-context runtime shrinking adapter. When the existing effective-context shrinker commits a shorter replacement, preserve source refs and rehydration handles. Automatic default scope remains tool results; optional retrieved/plan blocks require their existing configuration. Protected working-set, system/provider/persona/tool definitions remain immune. No original history is rewritten and replay never shrinks or calls a provider.
  Freeze operation_id from fresh entropy in the original owning operation before its effect; preserve it and all source facts on retry/restart. Freeze the completion payload after owner success, before append. If the original operation cannot durably retain its intent/result, publication fails closed: never rerun the effect to reconstruct evidence. This contract creates no independent operation journal or stored value. The owner retains its existing intent/result and source refs under its existing storage contract.
  Adopt SP-286 first-AppendReceipt custody and CV-339 full-value v2 successor by name, including SP-336/SP-347 current group-commit rules. Validate admission before append; absent membership, unresolved retention or unavailable source custody prevents activation. Referenced bodies commit under SP-337 before append. The first original AppendReceipt is exposed only after the durable group frame; terminal event success publication follows that receipt. Lost acknowledgement returns that original full stored result and receipt, never a second effect or new receipt; equal identity with different semantic digest is a conflict, not a retry.
  Identity digest is SHA-256 of UTF-8 compact JSON array ["subagent.context_shrunk", "1.0.0", storage_instance_id, payload.project_id, payload.operation_id], with ensure_ascii=false, no whitespace and array order preserved. event_id="evt_"+digest; Project idempotency_key="subagent.context_shrunk:"+digest; application idempotency_key=application@1:{hex(server_id)}:{hex(owner_operation_id)} exactly under CV-366. For subagent.context_shrunk, server_id is the actual Server identity durably frozen by its original effective-context runtime shrinking adapter; owner_operation_id is that same original payload.operation_id. Encode each complete exact UTF-8 byte string as lowercase hexadecimal without hashing, trimming or normalization; absent original Server identity refuses publication. Never take Server identity from the retrying Client, current focus or storage_instance_id; family_revision=1.0.0, replay_policy=dedupe_by_idempotency_key, redaction_profile=secret_refs_only. Use Contracts_V0.md#EventRecord for the closed envelope, not a local field list. Envelope occurred_at_utc equals payload.occurred_at_utc byte-for-byte from the original accepted child-context shrink operation; retry time is forbidden. Storage alone assigns sequence_id, observed_at_utc and persisted_at_utc. Full producer semantic digest uses EventRecord and CV-339, not only the identity tuple.
  Exact envelope joins for subagent.context_shrunk: actor_ref is the non-empty non-secret actor reference retained by the original accepted child-context shrink operation for payload.agent_id and the exact payload.child_run_id. correlation_id is the non-empty correlation_id frozen by that same original owner operation; payload.operation_id equals its immutable operation_id. Never synthesize either required value as null. Scope/project and the entire frozen payload must equal that original operation result. Envelope run_id equals payload.run_id and the original parent run; the original source must also join payload.agent_id, child_run_id and before/after revisions. Other nullable EventRecord lineage, account, causal and upstream-sequence joins copy the retained original operation facts, including required-present nulls only when that original has no such join; they are never populated from ambient focus. For subagent.context_shrunk, measure the exact uncompressed canonical MessagePack logical body bytes under Case L-2. At most 16 KiB stays inline with payload_ref=null. Above 16 KiB, SP-337 owns the pack bytes/index: payload={} and payload_ref is UTF-8 compact JSON with lexicographically sorted keys {"blake3_id":<lowercase BLAKE3 of those exact bytes>,"byte_size":<exact uncompressed byte count>,"media_type":"application/msgpack"}, no whitespace. This newly authored owner binding preserves EventRecord's existing string ref type and the same exact closed logical payload schema after authorized resolution. In external mode every payload field join and identity recipe in this unit refers to that resolved logical body; the stored inline map stays empty. Freeze body, descriptor and representation before append; pack bytes and index must be durable before receipt issuance. Reject oversized inline bodies, inline/base64 duplicates, missing or uncommitted pack/index, changed bytes/id/size/media type, unavailable permission/deletion/hold/source, and substituted refs. Do not hash payload-store bytes with SHA-256; CV-339 semantic/full-value domains remain unchanged. Resolved logical payload joins the complete original result; immutable replay returns the original stored representation and receipt. New-native migration fields are null. Freeze all these producer values before append and resolve the complete original EventRecord through storage.first_append_receipt.resolve_full_value.v1 on receipt-dependent recovery. Required non-null fields retain their schema-required types.
  Operating consumer reader.context.shrunk@1.0.0 uses reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, explicitly adopting SP-278. It reads this exact event_type/revision/scope only after the complete CURRENT-selected global frontier is verified. Its checkpoint is the existing checkpoints key event_record_index_checkpoint.v1:{storage_instance_id}, value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint; no family-specific persisted cursor or projection is introduced. Generic rows and frontier advance atomically by the existing SP-278 CAS; a failed CAS preserves the old publication and is retried from a fresh snapshot. Operating reads are passive with no durable progress, so their own checkpoint is explicitly none. Each read uses the exact live ten-field read_token in one real redb snapshot; any stored read token must instead be the nine-field DL-076 durable token with redb_snapshot_id removed, never a persisted snapshot identity. Rebuild uses original retained seglog through SP-278, preserving identity and no side effects. Unauthorized, deleted, unsupported, stale or unresolved source reads return unavailable; they cannot produce empty-success evidence.
  Profile rationale for subagent.context_shrunk: source and effective-context bodies remain behind authorized refs; redaction_profile=secret_refs_only is an existing EventRecord value and does not grant source access.
  Custody remains with effective-context runtime shrinking adapter and Storage's original seglog/payload owners. Store only bounded metadata and opaque authorized source refs; no transcript, diff body, secrets, provider response, private absolute path or credential content. Recheck current permission, source deletion/tombstone and hold gates before each disclosure; a ref is not permission. Backup captures coherent original events, refs and first-receipt custody under BRS-031; derived index is rebuildable, never backup authority. Restore verifies original identities and current source availability; missing originals remain unavailable rather than reconstructed from an index.
  Retention policy: RP-RUNTIME-365D. Runtime context events are Runtime/run/child attempt evidence under Storage Case L-3, 365 days, subject to existing holds and source anchors. For a PENDING marker no class is selected: candidate RP-RUNTIME-365D (runtime observation), RP-OPERATIONAL-2555D (operational diagnostic), or RP-AUTHORITY-INDEFINITE (audit/source lineage) per Case L-3; RT must settle the actual role. Existing generic checkpoint/index retain RP-PROJECTION-3GEN and SP-278 source-coupled constraints; no new stored derived record is owned here.
  Compatibility: only this exact 1.0.0 schema is a current writer candidate. Historical names/bytes remain unchanged; unknown future revisions halt the consumer before advance, never normalize by guessed payload. Withdrawal first disables the exact producer's admission, drains/fences outstanding intents and prohibits append under stale admission. Then reader.context.shrunk@1.0.0 refuses disclosure and fences its in-memory token; generic global indexing remains available for other families. Re-enable only after governed schema/admission validation and verified SP-278 rebuild/currentness. No source deletion, history rewrite or zero-cursor substitution is authorized.
  Exact-family oracle matrix for subagent.context_shrunk: Plans/small_owner_event_fixtures.json owns its full EventRecord, independent original owner operation/result, original eleven-field receipt and four-field append result, full-value commitment, and positive/negative vectors; scripts/pm-small-owner-events.py validates them without registry admission. Positive append vectors assume fixture-only resolved membership/retention; actual absent membership and PENDING_RETENTION_DECISION refuse activation. Every required envelope field, profile (including redacted_refs_only), actor/correlation/time/payload/subject join and same-identity changed semantic value has a refusal vector. The admission matrix cuts missing membership/schema/retention/permission/dedupe/source/original intent/original result/current owner acceptance/body commit/current lease/restore controls before append, then cuts uncommitted group, unsynced group, receipt exposure and terminal publication. A durable commit with lost acknowledgement or lagging custody rows returns the same original result/receipt; no durable commit returns no receipt. The original owner acceptance freezes its admission epoch, actual owner session and restore occurrence; seal compares all three to current owner/Storage controls. Re-enable never relabels an old intent: fresh acceptance uses a different logical operation_id. Recovery never reruns effective-context runtime shrinking adapter or reconstructs old owner admission. Withdrawal vectors fence pending/prepared and stale-epoch intents, preserve previously issued immutable replay without effects, refuse the withdrawn operating reader, keep unrelated global indexing, and require governed new admission plus verified SP-278 rebuild/currentness before fresh work. Backup/source-deletion/unsupported-version/read-token/CAS negatives refuse disclosure or preserve the old complete publication; they cannot fabricate missing originals. Native fsync, concurrent CAS, restore authority and action-spy execution of these authored cases remain NOT_RUN.
  Static schema and semantic oracles are Plans/small_owner_event_fixtures.json and scripts/pm-small-owner-events.py. Native append durability, crash cuts, backup/restore and live permission/CAS tests are authored obligations, NOT_RUN. No writer, handler or native availability follows from this preparation.
  subagent.context_shrunk append and current retry reject replay_policy=projector_replay_only as replay_only_not_appendable before semantic receipt resolution. That policy remains compatibility-reader-only; immutable historical semantic/full-value reads retain their separate role and unchanged digest. Before terminal publication validate the delivered eleven-field first AppendReceipt against protected original committed full-value custody and its exact EventRecord/result; a foreign, missing or mutated receipt publishes no success and never undoes or duplicates the already durable frame. Each identifier/path regex uses a full-match guard plus CR/LF refusal, with trailing-LF negatives. Its exact-family fixture matrix tests replay-only append/retry, every receipt-publication field, encoded project~ partitions, the inline byte cap and (where reachable) 16383/16384/16385-byte and SP-337 external-body boundaries.
  Checkpoint identity for subagent.context_shrunk: before atomic rebuild publication, validate the nine-field durable token against the SP-278 read_token schema with redb_snapshot_id removed and full-match identifier checks. Its storage_instance_id, source_selection.storage_instance_id and event_record_index_checkpoint.v1:{storage_instance_id} key must identify the Storage instance of this original event; its index_dataset_name must identify its generation_id. Match every durable field to the independently captured CURRENT-selected live token after removing only redb_snapshot_id, and match the publication frontier_revision to that token. Missing, malformed, foreign, coherently substituted, trailing-LF or stale tokens preserve the old rows and checkpoint without effects; never copy an unchecked proposed checkpoint. Passive reads validate the same Storage/key/generation joins before comparing the exact selected live token. Each exact-family oracle includes these identity failures, persisted-snapshot refusal and immutable-publication checks.
  Historical operating reads and rebuild for subagent.context_shrunk authenticate the retained EventRecord against Storage's protected original source and full-value commitment at the selected CURRENT frontier, including Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. A retained event valid when written remains readable after live owner request/session/admission retirement, including compatibility-reader-only projector_replay_only history; never rerun current-writer admission or require a transient old owner request. Current reader withdrawal, permission, source presence/deletion/hold and supported-version fences still apply. Forged bytes, foreign family/Storage/source selection or missing protected originals refuse disclosure and preserve the old rebuild publication. Caller semantic retry continues to exclude Storage-assigned metadata; append/current retry still refuse replay_only_not_appendable. Check 11 isolation is exercised by the Method B guard tables in scripts/pm_small_owner_table_*.py under the gated scripts/pm_guard_isolation.py: each refusal witness starts from a valid case, changes one semantic fact and keeps all Storage/source, generation/dataset and selected/durable observation copies coherent. The tool cuts each guard row in turn; its witnesses must become accepted, unrelated witnesses must still reject, and the complete checker must fail. Identifier grammar failures are separate from valid-grammar identity mismatches; no production guard is weakened.
  Sweep part 2A/2B numbers for subagent.context_shrunk: current input uses the shared CV-1100 calls (current_integer_token/current_integer at every integer slot, producer_semantic_bytes/producer_semantic_digest over the unchanged full producer projection beside CV-317, storage_value_bytes with EVENT_VALUE beside SP-026/SP-236, and storage_uint64 beside SP-1100 at the Storage sequence joins); no lane-local integer cap, serializer or normalization remains. Retained originals verify under the frozen dm-retained-producer-v1 recipe beside SP-1101/SP-286, selected only through the protected original custody, never through current request data; full Storage uint64, physical float bytes and signed zero are preserved. Current and retained timestamps are checked by the shared CV-1101 predicate pm_event_datetime.date_time: occurred_at_utc and the family payload clock use the event_record profile, and Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile beside CV-253; the frozen dm-retained-producer-v1 recipe beside SP-1101 selects those profiles, and request data cannot select a profile.
gui_related: false
gui_classification_reason: Backend EventRecord contract, not a visual specification.
depends_on:
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Exact family semantics, schema, identity, replay and withdrawal checks pass; no admission or native proof follows.
validation_surfaces:
- python3 scripts/pm-small-owner-events.py
risk_class: event_authority_binding_drift
reasoning_tier: high
context_scope: event_authority_DM_20261104
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DM-search.json
preserved_exact_tokens: []
negative_constraints:
- No Event Authority admission, native readiness, retention choice or new user-visible behavior.
```


### SP-605 - Event Authority project.added persistence and passive reader

```yaml
plan_unit_id: SP-605
unit_type: event_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  project.added persistence and passive reader
  project.added 1.0.0 — newly authored owner contract under DL-045.
  Prepared without admission. Exact payload is Plans/event_payloads/project_added.schema.json (pm.event_payload.project_added.v1); no sibling or legacy spelling is admitted. Scope is project_only; project_id is a real immutable Project ID; application scope, null, empty and sentinel Project identities are forbidden. Payload project_id equals the envelope join. Existing CV-365 scope rules remain mandatory. Optional envelope lineage comes from the original operation, never ambient focus. Schema-only validity is insufficient.
  Producer: Project registration commit adapter. After cmd.project.add_existing completes atomic projects:v1 identity/config/permission/owner handoff and readback, record its existing-content registration once. A failed registration, temporary mount, list-only open/archive/remove, or unverified restore creates no completion. Restore-as-new requires its verified Backup terminal receipt first. This event observes the completed registration; it does not grant permission, create files or replace the Project result.
  Freeze operation_id from fresh entropy in the original owning operation before its effect; preserve it and all source facts on retry/restart. Freeze the completion payload after owner success, before append. If the original operation cannot durably retain its intent/result, publication fails closed: never rerun the effect to reconstruct evidence. This contract creates no independent operation journal or stored value. The owner retains its existing intent/result and source refs under its existing storage contract.
  Adopt SP-286 first-AppendReceipt custody and CV-339 full-value v2 successor by name, including SP-336/SP-347 current group-commit rules. Validate admission before append; absent membership, unresolved retention or unavailable source custody prevents activation. Referenced bodies commit under SP-337 before append. The first original AppendReceipt is exposed only after the durable group frame; terminal event success publication follows that receipt. Lost acknowledgement returns that original full stored result and receipt, never a second effect or new receipt; equal identity with different semantic digest is a conflict, not a retry.
  Identity digest is SHA-256 of UTF-8 compact JSON array ["project.added", "1.0.0", storage_instance_id, payload.project_id, payload.operation_id], with ensure_ascii=false, no whitespace and array order preserved. event_id="evt_"+digest; idempotency_key="project.added:"+digest; family_revision=1.0.0, replay_policy=dedupe_by_idempotency_key, redaction_profile=secret_refs_only. Use Contracts_V0.md#EventRecord for the closed envelope, not a local field list. Envelope occurred_at_utc equals payload.completed_at_utc byte-for-byte from the original completed Project existing-content registration; retry time is forbidden. Storage alone assigns sequence_id, observed_at_utc and persisted_at_utc. Full producer semantic digest uses EventRecord and CV-339, not only the identity tuple.
  Exact envelope joins for project.added: actor_ref is the non-empty non-secret actor reference retained by the original completed Project existing-content registration from its accepted owner request, never the retrying Client. correlation_id is the non-empty correlation_id frozen by that same original owner operation; payload.operation_id equals its immutable operation_id. Never synthesize either required value as null. Scope/project and the entire frozen payload must equal that original operation result. The original atomic registry/readback result must join payload.project_id, project_revision, stable_config_ref and operation_receipt_ref exactly. Other nullable EventRecord lineage, account, causal and upstream-sequence joins copy the retained original operation facts, including required-present nulls only when that original has no such join; they are never populated from ambient focus. payload_ref is null for this bounded inline payload; enforce Storage's 16 KiB inline canonical MessagePack byte limit before append; new-native migration fields are null. Freeze all these producer values before append and resolve the complete original EventRecord through storage.first_append_receipt.resolve_full_value.v1 on receipt-dependent recovery. Required non-null fields retain their schema-required types.
  Operating consumer reader.project.added@1.0.0 uses reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, explicitly adopting SP-278. It reads this exact event_type/revision/scope only after the complete CURRENT-selected global frontier is verified. Its checkpoint is the existing checkpoints key event_record_index_checkpoint.v1:{storage_instance_id}, value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint; no family-specific persisted cursor or projection is introduced. Generic rows and frontier advance atomically by the existing SP-278 CAS; a failed CAS preserves the old publication and is retried from a fresh snapshot. Operating reads are passive with no durable progress, so their own checkpoint is explicitly none. Each read uses the exact live ten-field read_token in one real redb snapshot; any stored read token must instead be the nine-field DL-076 durable token with redb_snapshot_id removed, never a persisted snapshot identity. Rebuild uses original retained seglog through SP-278, preserving identity and no side effects. Unauthorized, deleted, unsupported, stale or unresolved source reads return unavailable; they cannot produce empty-success evidence.
  Profile rationale for project.added: stable config and original registration result remain behind authorized refs; redaction_profile=secret_refs_only is an existing EventRecord value and does not grant source access.
  Custody remains with Project registration commit adapter and Storage's original seglog/payload owners. Store only bounded metadata and opaque authorized source refs; no transcript, diff body, secrets, provider response, private absolute path or credential content. Recheck current permission, source deletion/tombstone and hold gates before each disclosure; a ref is not permission. Backup captures coherent original events, refs and first-receipt custody under BRS-031; derived index is rebuildable, never backup authority. Restore verifies original identities and current source availability; missing originals remain unavailable rather than reconstructed from an index.
  Retention policy: PENDING_RETENTION_DECISION. For a PENDING marker no class is selected: candidate RP-RUNTIME-365D (runtime observation), RP-OPERATIONAL-2555D (operational diagnostic), or RP-AUTHORITY-INDEFINITE (audit/source lineage) per Case L-3; RT must settle the actual role. Existing generic checkpoint/index retain RP-PROJECTION-3GEN and SP-278 source-coupled constraints; no new stored derived record is owned here.
  Compatibility: only this exact 1.0.0 schema is a current writer candidate. Historical names/bytes remain unchanged; unknown future revisions halt the consumer before advance, never normalize by guessed payload. Withdrawal first disables the exact producer's admission, drains/fences outstanding intents and prohibits append under stale admission. Then reader.project.added@1.0.0 refuses disclosure and fences its in-memory token; generic global indexing remains available for other families. Re-enable only after governed schema/admission validation and verified SP-278 rebuild/currentness. No source deletion, history rewrite or zero-cursor substitution is authorized.
  Exact-family oracle matrix for project.added: Plans/small_owner_event_fixtures.json owns its full EventRecord, independent original owner operation/result, original eleven-field receipt and four-field append result, full-value commitment, and positive/negative vectors; scripts/pm-small-owner-events.py validates them without registry admission. Positive append vectors assume fixture-only resolved membership/retention; actual absent membership and PENDING_RETENTION_DECISION refuse activation. Every required envelope field, profile (including redacted_refs_only), actor/correlation/time/payload/subject join and same-identity changed semantic value has a refusal vector. The admission matrix cuts missing membership/schema/retention/permission/dedupe/source/original intent/original result/current owner acceptance/body commit/current lease/restore controls before append, then cuts uncommitted group, unsynced group, receipt exposure and terminal publication. A durable commit with lost acknowledgement or lagging custody rows returns the same original result/receipt; no durable commit returns no receipt. The original owner acceptance freezes its admission epoch, actual owner session and restore occurrence; seal compares all three to current owner/Storage controls. Re-enable never relabels an old intent: fresh acceptance uses a different logical operation_id. Recovery never reruns Project registration commit adapter or reconstructs old owner admission. Withdrawal vectors fence pending/prepared and stale-epoch intents, preserve previously issued immutable replay without effects, refuse the withdrawn operating reader, keep unrelated global indexing, and require governed new admission plus verified SP-278 rebuild/currentness before fresh work. Backup/source-deletion/unsupported-version/read-token/CAS negatives refuse disclosure or preserve the old complete publication; they cannot fabricate missing originals. Native fsync, concurrent CAS, restore authority and action-spy execution of these authored cases remain NOT_RUN.
  Static schema and semantic oracles are Plans/small_owner_event_fixtures.json and scripts/pm-small-owner-events.py. Native append durability, crash cuts, backup/restore and live permission/CAS tests are authored obligations, NOT_RUN. No writer, handler or native availability follows from this preparation.
  project.added append and current retry reject replay_policy=projector_replay_only as replay_only_not_appendable before semantic receipt resolution. That policy remains compatibility-reader-only; immutable historical semantic/full-value reads retain their separate role and unchanged digest. Before terminal publication validate the delivered eleven-field first AppendReceipt against protected original committed full-value custody and its exact EventRecord/result; a foreign, missing or mutated receipt publishes no success and never undoes or duplicates the already durable frame. Each identifier/path regex uses a full-match guard plus CR/LF refusal, with trailing-LF negatives. Its exact-family fixture matrix tests replay-only append/retry, every receipt-publication field, encoded project~ partitions, the inline byte cap and (where reachable) 16383/16384/16385-byte and SP-337 external-body boundaries.
  Checkpoint identity for project.added: before atomic rebuild publication, validate the nine-field durable token against the SP-278 read_token schema with redb_snapshot_id removed and full-match identifier checks. Its storage_instance_id, source_selection.storage_instance_id and event_record_index_checkpoint.v1:{storage_instance_id} key must identify the Storage instance of this original event; its index_dataset_name must identify its generation_id. Match every durable field to the independently captured CURRENT-selected live token after removing only redb_snapshot_id, and match the publication frontier_revision to that token. Missing, malformed, foreign, coherently substituted, trailing-LF or stale tokens preserve the old rows and checkpoint without effects; never copy an unchecked proposed checkpoint. Passive reads validate the same Storage/key/generation joins before comparing the exact selected live token. Each exact-family oracle includes these identity failures, persisted-snapshot refusal and immutable-publication checks.
  Historical operating reads and rebuild for project.added authenticate the retained EventRecord against Storage's protected original source and full-value commitment at the selected CURRENT frontier, including Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. A retained event valid when written remains readable after live owner request/session/admission retirement, including compatibility-reader-only projector_replay_only history; never rerun current-writer admission or require a transient old owner request. Current reader withdrawal, permission, source presence/deletion/hold and supported-version fences still apply. Forged bytes, foreign family/Storage/source selection or missing protected originals refuse disclosure and preserve the old rebuild publication. Caller semantic retry continues to exclude Storage-assigned metadata; append/current retry still refuse replay_only_not_appendable. Check 11 isolation is exercised by the Method B guard tables in scripts/pm_small_owner_table_*.py under the gated scripts/pm_guard_isolation.py: each refusal witness starts from a valid case, changes one semantic fact and keeps all Storage/source, generation/dataset and selected/durable observation copies coherent. The tool cuts each guard row in turn; its witnesses must become accepted, unrelated witnesses must still reject, and the complete checker must fail. Identifier grammar failures are separate from valid-grammar identity mismatches; no production guard is weakened.
  Sweep part 2A/2B numbers for project.added: current input uses the shared CV-1100 calls (current_integer_token/current_integer at every integer slot, producer_semantic_bytes/producer_semantic_digest over the unchanged full producer projection beside CV-317, storage_value_bytes with EVENT_VALUE beside SP-026/SP-236, and storage_uint64 beside SP-1100 at the Storage sequence joins); no lane-local integer cap, serializer or normalization remains. Retained originals verify under the frozen dm-retained-producer-v1 recipe beside SP-1101/SP-286, selected only through the protected original custody, never through current request data; full Storage uint64, physical float bytes and signed zero are preserved. Current and retained timestamps are checked by the shared CV-1101 predicate pm_event_datetime.date_time: occurred_at_utc and the family payload clock use the event_record profile, and Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile beside CV-253; the frozen dm-retained-producer-v1 recipe beside SP-1101 selects those profiles, and request data cannot select a profile.
gui_related: false
gui_classification_reason: Backend EventRecord contract, not a visual specification.
depends_on:
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Exact family semantics, schema, identity, replay and withdrawal checks pass; no admission or native proof follows.
validation_surfaces:
- python3 scripts/pm-small-owner-events.py
risk_class: event_authority_binding_drift
reasoning_tier: high
context_scope: event_authority_DM_20261104
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DM-search.json
preserved_exact_tokens: []
negative_constraints:
- No Event Authority admission, native readiness, retention choice or new user-visible behavior.
```


### SP-606 - Event Authority project.created persistence and passive reader

```yaml
plan_unit_id: SP-606
unit_type: event_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  project.created persistence and passive reader
  project.created 1.0.0 — newly authored owner contract under DL-045.
  Prepared without admission. Exact payload is Plans/event_payloads/project_created.schema.json (pm.event_payload.project_created.v1); no sibling or legacy spelling is admitted. Scope is project_only; project_id is a real immutable Project ID; application scope, null, empty and sentinel Project identities are forbidden. Payload project_id equals the envelope join. Existing CV-365 scope rules remain mandatory. Optional envelope lineage comes from the original operation, never ambient focus. Schema-only validity is insufficient.
  Producer: Project creation composition terminal adapter. After cmd.project.new_local or an admitted current forge-create composition completes all reviewed owner steps and atomic Project registry/readback, capture the exact new identity and terminal receipt. Remote create alone, effect_unknown, partial failure and merely reserving a Project ID never produce completion. Resume publishes only after verified remaining steps complete under its original root creation intent; retry never repeats forge or filesystem effects. Existing-content add alone produces no project.created. The two Project event candidates are distinct by original semantic action, not command-name aliases.
  Freeze operation_id from fresh entropy in the original owning operation before its effect; preserve it and all source facts on retry/restart. Freeze the completion payload after owner success, before append. If the original operation cannot durably retain its intent/result, publication fails closed: never rerun the effect to reconstruct evidence. This contract creates no independent operation journal or stored value. The owner retains its existing intent/result and source refs under its existing storage contract.
  Adopt SP-286 first-AppendReceipt custody and CV-339 full-value v2 successor by name, including SP-336/SP-347 current group-commit rules. Validate admission before append; absent membership, unresolved retention or unavailable source custody prevents activation. Referenced bodies commit under SP-337 before append. The first original AppendReceipt is exposed only after the durable group frame; terminal event success publication follows that receipt. Lost acknowledgement returns that original full stored result and receipt, never a second effect or new receipt; equal identity with different semantic digest is a conflict, not a retry.
  Identity digest is SHA-256 of UTF-8 compact JSON array ["project.created", "1.0.0", storage_instance_id, payload.project_id, payload.operation_id], with ensure_ascii=false, no whitespace and array order preserved. event_id="evt_"+digest; idempotency_key="project.created:"+digest; family_revision=1.0.0, replay_policy=dedupe_by_idempotency_key, redaction_profile=secret_refs_only. Use Contracts_V0.md#EventRecord for the closed envelope, not a local field list. Envelope occurred_at_utc equals payload.completed_at_utc byte-for-byte from the original root Project creation composition; retry time is forbidden. Storage alone assigns sequence_id, observed_at_utc and persisted_at_utc. Full producer semantic digest uses EventRecord and CV-339, not only the identity tuple.
  Exact envelope joins for project.created: actor_ref is the non-empty non-secret actor reference retained by the original root Project creation composition from its accepted owner request, never the retrying Client. correlation_id is the non-empty correlation_id frozen by that same original owner operation; payload.operation_id equals its immutable operation_id. Never synthesize either required value as null. Scope/project and the entire frozen payload must equal that original operation result. The original atomic registry/readback result must join payload.project_id, project_revision, stable_config_ref and operation_receipt_ref exactly. Other nullable EventRecord lineage, account, causal and upstream-sequence joins copy the retained original operation facts, including required-present nulls only when that original has no such join; they are never populated from ambient focus. payload_ref is null for this bounded inline payload; enforce Storage's 16 KiB inline canonical MessagePack byte limit before append; new-native migration fields are null. Freeze all these producer values before append and resolve the complete original EventRecord through storage.first_append_receipt.resolve_full_value.v1 on receipt-dependent recovery. Required non-null fields retain their schema-required types.
  Operating consumer reader.project.created@1.0.0 uses reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, explicitly adopting SP-278. It reads this exact event_type/revision/scope only after the complete CURRENT-selected global frontier is verified. Its checkpoint is the existing checkpoints key event_record_index_checkpoint.v1:{storage_instance_id}, value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint; no family-specific persisted cursor or projection is introduced. Generic rows and frontier advance atomically by the existing SP-278 CAS; a failed CAS preserves the old publication and is retried from a fresh snapshot. Operating reads are passive with no durable progress, so their own checkpoint is explicitly none. Each read uses the exact live ten-field read_token in one real redb snapshot; any stored read token must instead be the nine-field DL-076 durable token with redb_snapshot_id removed, never a persisted snapshot identity. Rebuild uses original retained seglog through SP-278, preserving identity and no side effects. Unauthorized, deleted, unsupported, stale or unresolved source reads return unavailable; they cannot produce empty-success evidence.
  Profile rationale for project.created: stable config, verified creation result and original terminal receipt remain behind authorized refs; redaction_profile=secret_refs_only is an existing EventRecord value and does not grant source access.
  Custody remains with Project creation composition terminal adapter and Storage's original seglog/payload owners. Store only bounded metadata and opaque authorized source refs; no transcript, diff body, secrets, provider response, private absolute path or credential content. Recheck current permission, source deletion/tombstone and hold gates before each disclosure; a ref is not permission. Backup captures coherent original events, refs and first-receipt custody under BRS-031; derived index is rebuildable, never backup authority. Restore verifies original identities and current source availability; missing originals remain unavailable rather than reconstructed from an index.
  Retention policy: PENDING_RETENTION_DECISION. For a PENDING marker no class is selected: candidate RP-RUNTIME-365D (runtime observation), RP-OPERATIONAL-2555D (operational diagnostic), or RP-AUTHORITY-INDEFINITE (audit/source lineage) per Case L-3; RT must settle the actual role. Existing generic checkpoint/index retain RP-PROJECTION-3GEN and SP-278 source-coupled constraints; no new stored derived record is owned here.
  Compatibility: only this exact 1.0.0 schema is a current writer candidate. Historical names/bytes remain unchanged; unknown future revisions halt the consumer before advance, never normalize by guessed payload. Withdrawal first disables the exact producer's admission, drains/fences outstanding intents and prohibits append under stale admission. Then reader.project.created@1.0.0 refuses disclosure and fences its in-memory token; generic global indexing remains available for other families. Re-enable only after governed schema/admission validation and verified SP-278 rebuild/currentness. No source deletion, history rewrite or zero-cursor substitution is authorized.
  Exact-family oracle matrix for project.created: Plans/small_owner_event_fixtures.json owns its full EventRecord, independent original owner operation/result, original eleven-field receipt and four-field append result, full-value commitment, and positive/negative vectors; scripts/pm-small-owner-events.py validates them without registry admission. Positive append vectors assume fixture-only resolved membership/retention; actual absent membership and PENDING_RETENTION_DECISION refuse activation. Every required envelope field, profile (including redacted_refs_only), actor/correlation/time/payload/subject join and same-identity changed semantic value has a refusal vector. The admission matrix cuts missing membership/schema/retention/permission/dedupe/source/original intent/original result/current owner acceptance/body commit/current lease/restore controls before append, then cuts uncommitted group, unsynced group, receipt exposure and terminal publication. A durable commit with lost acknowledgement or lagging custody rows returns the same original result/receipt; no durable commit returns no receipt. The original owner acceptance freezes its admission epoch, actual owner session and restore occurrence; seal compares all three to current owner/Storage controls. Re-enable never relabels an old intent: fresh acceptance uses a different logical operation_id. Recovery never reruns Project creation composition terminal adapter or reconstructs old owner admission. Withdrawal vectors fence pending/prepared and stale-epoch intents, preserve previously issued immutable replay without effects, refuse the withdrawn operating reader, keep unrelated global indexing, and require governed new admission plus verified SP-278 rebuild/currentness before fresh work. Backup/source-deletion/unsupported-version/read-token/CAS negatives refuse disclosure or preserve the old complete publication; they cannot fabricate missing originals. Native fsync, concurrent CAS, restore authority and action-spy execution of these authored cases remain NOT_RUN.
  Static schema and semantic oracles are Plans/small_owner_event_fixtures.json and scripts/pm-small-owner-events.py. Native append durability, crash cuts, backup/restore and live permission/CAS tests are authored obligations, NOT_RUN. No writer, handler or native availability follows from this preparation.
  project.created append and current retry reject replay_policy=projector_replay_only as replay_only_not_appendable before semantic receipt resolution. That policy remains compatibility-reader-only; immutable historical semantic/full-value reads retain their separate role and unchanged digest. Before terminal publication validate the delivered eleven-field first AppendReceipt against protected original committed full-value custody and its exact EventRecord/result; a foreign, missing or mutated receipt publishes no success and never undoes or duplicates the already durable frame. Each identifier/path regex uses a full-match guard plus CR/LF refusal, with trailing-LF negatives. Its exact-family fixture matrix tests replay-only append/retry, every receipt-publication field, encoded project~ partitions, the inline byte cap and (where reachable) 16383/16384/16385-byte and SP-337 external-body boundaries.
  Checkpoint identity for project.created: before atomic rebuild publication, validate the nine-field durable token against the SP-278 read_token schema with redb_snapshot_id removed and full-match identifier checks. Its storage_instance_id, source_selection.storage_instance_id and event_record_index_checkpoint.v1:{storage_instance_id} key must identify the Storage instance of this original event; its index_dataset_name must identify its generation_id. Match every durable field to the independently captured CURRENT-selected live token after removing only redb_snapshot_id, and match the publication frontier_revision to that token. Missing, malformed, foreign, coherently substituted, trailing-LF or stale tokens preserve the old rows and checkpoint without effects; never copy an unchecked proposed checkpoint. Passive reads validate the same Storage/key/generation joins before comparing the exact selected live token. Each exact-family oracle includes these identity failures, persisted-snapshot refusal and immutable-publication checks.
  Historical operating reads and rebuild for project.created authenticate the retained EventRecord against Storage's protected original source and full-value commitment at the selected CURRENT frontier, including Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. A retained event valid when written remains readable after live owner request/session/admission retirement, including compatibility-reader-only projector_replay_only history; never rerun current-writer admission or require a transient old owner request. Current reader withdrawal, permission, source presence/deletion/hold and supported-version fences still apply. Forged bytes, foreign family/Storage/source selection or missing protected originals refuse disclosure and preserve the old rebuild publication. Caller semantic retry continues to exclude Storage-assigned metadata; append/current retry still refuse replay_only_not_appendable. Check 11 isolation is exercised by the Method B guard tables in scripts/pm_small_owner_table_*.py under the gated scripts/pm_guard_isolation.py: each refusal witness starts from a valid case, changes one semantic fact and keeps all Storage/source, generation/dataset and selected/durable observation copies coherent. The tool cuts each guard row in turn; its witnesses must become accepted, unrelated witnesses must still reject, and the complete checker must fail. Identifier grammar failures are separate from valid-grammar identity mismatches; no production guard is weakened.
  Sweep part 2A/2B numbers for project.created: current input uses the shared CV-1100 calls (current_integer_token/current_integer at every integer slot, producer_semantic_bytes/producer_semantic_digest over the unchanged full producer projection beside CV-317, storage_value_bytes with EVENT_VALUE beside SP-026/SP-236, and storage_uint64 beside SP-1100 at the Storage sequence joins); no lane-local integer cap, serializer or normalization remains. Retained originals verify under the frozen dm-retained-producer-v1 recipe beside SP-1101/SP-286, selected only through the protected original custody, never through current request data; full Storage uint64, physical float bytes and signed zero are preserved. Current and retained timestamps are checked by the shared CV-1101 predicate pm_event_datetime.date_time: occurred_at_utc and the family payload clock use the event_record profile, and Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile beside CV-253; the frozen dm-retained-producer-v1 recipe beside SP-1101 selects those profiles, and request data cannot select a profile.
gui_related: false
gui_classification_reason: Backend EventRecord contract, not a visual specification.
depends_on:
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Exact family semantics, schema, identity, replay and withdrawal checks pass; no admission or native proof follows.
validation_surfaces:
- python3 scripts/pm-small-owner-events.py
risk_class: event_authority_binding_drift
reasoning_tier: high
context_scope: event_authority_DM_20261104
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DM-search.json
preserved_exact_tokens: []
negative_constraints:
- No Event Authority admission, native readiness, retention choice or new user-visible behavior.
```


### SP-607 - Event Authority git.clone.completed persistence and passive reader

```yaml
plan_unit_id: SP-607
unit_type: event_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: |-
  git.clone.completed persistence and passive reader
  git.clone.completed 1.0.0 — newly authored owner contract under DL-045.
  Prepared without admission. Exact payload is Plans/event_payloads/git_clone_completed.schema.json (pm.event_payload.git_clone_completed.v1); no sibling or legacy spelling is admitted. Scope is project_only; project_id is a real immutable Project ID; application scope, null, empty and sentinel Project identities are forbidden. Payload project_id equals the envelope join. Existing CV-365 scope rules remain mandatory. Optional envelope lineage comes from the original operation, never ambient focus. Schema-only validity is insufficient.
  Producer: ordinary Git clone terminal adapter. Observe succeeded cmd.source_control.repository.clone with scm_backend=git only after owner native completion, destination verification and terminal operation receipt. The reserved Project/repository/workspace/Host/Environment lineage is original intent data, never focused Project. This precedes Project registration and cannot certify its success. Jujutsu cmd.jujutsu.git.clone is distinct and never normalized to this spelling. Failed, cancelled, effect_unknown or merely accepted ObservableWork emits no completion. Current Source_Control_System sections 7/9 route the old catalog spelling to this ordinary Git producer without reviving cmd.git.clone.
  Freeze operation_id from fresh entropy in the original owning operation before its effect; preserve it and all source facts on retry/restart. Freeze the completion payload after owner success, before append. If the original operation cannot durably retain its intent/result, publication fails closed: never rerun the effect to reconstruct evidence. This contract creates no independent operation journal or stored value. The owner retains its existing intent/result and source refs under its existing storage contract.
  Adopt SP-286 first-AppendReceipt custody and CV-339 full-value v2 successor by name, including SP-336/SP-347 current group-commit rules. Validate admission before append; absent membership, unresolved retention or unavailable source custody prevents activation. Referenced bodies commit under SP-337 before append. The first original AppendReceipt is exposed only after the durable group frame; terminal event success publication follows that receipt. Lost acknowledgement returns that original full stored result and receipt, never a second effect or new receipt; equal identity with different semantic digest is a conflict, not a retry.
  Identity digest is SHA-256 of UTF-8 compact JSON array ["git.clone.completed", "1.0.0", storage_instance_id, payload.project_id, payload.operation_id], with ensure_ascii=false, no whitespace and array order preserved. event_id="evt_"+digest; idempotency_key="git.clone.completed:"+digest; family_revision=1.0.0, replay_policy=dedupe_by_idempotency_key, redaction_profile=secret_refs_only. Use Contracts_V0.md#EventRecord for the closed envelope, not a local field list. Envelope occurred_at_utc equals payload.completed_at_utc byte-for-byte from the original ordinary Git clone command operation; retry time is forbidden. Storage alone assigns sequence_id, observed_at_utc and persisted_at_utc. Full producer semantic digest uses EventRecord and CV-339, not only the identity tuple.
  Exact envelope joins for git.clone.completed: actor_ref is the non-empty non-secret actor reference retained by the original ordinary Git clone command operation from its accepted owner request, never the retrying Client. correlation_id is the non-empty correlation_id frozen by that same original owner operation; payload.operation_id equals its immutable operation_id. Never synthesize either required value as null. Scope/project and the entire frozen payload must equal that original operation result. The original terminal result must join payload.repo_id, workspace_id, host_id, environment_id, source_location_ref and operation_receipt_ref exactly, including the reserved Project identity. Other nullable EventRecord lineage, account, causal and upstream-sequence joins copy the retained original operation facts, including required-present nulls only when that original has no such join; they are never populated from ambient focus. payload_ref is null for this bounded inline payload; enforce Storage's 16 KiB inline canonical MessagePack byte limit before append; new-native migration fields are null. Freeze all these producer values before append and resolve the complete original EventRecord through storage.first_append_receipt.resolve_full_value.v1 on receipt-dependent recovery. Required non-null fields retain their schema-required types.
  Operating consumer reader.scm.git_clone_completed@1.0.0 uses reader.storage.event_record_index@1.0.0 and projector.storage.event_record_index@1.0.0, explicitly adopting SP-278. It reads this exact event_type/revision/scope only after the complete CURRENT-selected global frontier is verified. Its checkpoint is the existing checkpoints key event_record_index_checkpoint.v1:{storage_instance_id}, value Plans/event_record_index_checkpoint.schema.json#/$defs/checkpoint; no family-specific persisted cursor or projection is introduced. Generic rows and frontier advance atomically by the existing SP-278 CAS; a failed CAS preserves the old publication and is retried from a fresh snapshot. Operating reads are passive with no durable progress, so their own checkpoint is explicitly none. Each read uses the exact live ten-field read_token in one real redb snapshot; any stored read token must instead be the nine-field DL-076 durable token with redb_snapshot_id removed, never a persisted snapshot identity. Rebuild uses original retained seglog through SP-278, preserving identity and no side effects. Unauthorized, deleted, unsupported, stale or unresolved source reads return unavailable; they cannot produce empty-success evidence.
  Profile rationale for git.clone.completed: source location and original terminal receipt remain behind authorized refs; URLs with credentials and private absolute destinations are forbidden; redaction_profile=secret_refs_only is an existing EventRecord value and does not grant source access.
  Custody remains with ordinary Git clone terminal adapter and Storage's original seglog/payload owners. Store only bounded metadata and opaque authorized source refs; no transcript, diff body, secrets, provider response, private absolute path or credential content. Recheck current permission, source deletion/tombstone and hold gates before each disclosure; a ref is not permission. Backup captures coherent original events, refs and first-receipt custody under BRS-031; derived index is rebuildable, never backup authority. Restore verifies original identities and current source availability; missing originals remain unavailable rather than reconstructed from an index.
  Retention policy: PENDING_RETENTION_DECISION. For a PENDING marker no class is selected: candidate RP-RUNTIME-365D (runtime observation), RP-OPERATIONAL-2555D (operational diagnostic), or RP-AUTHORITY-INDEFINITE (audit/source lineage) per Case L-3; RT must settle the actual role. Existing generic checkpoint/index retain RP-PROJECTION-3GEN and SP-278 source-coupled constraints; no new stored derived record is owned here.
  Compatibility: only this exact 1.0.0 schema is a current writer candidate. Historical names/bytes remain unchanged; unknown future revisions halt the consumer before advance, never normalize by guessed payload. Withdrawal first disables the exact producer's admission, drains/fences outstanding intents and prohibits append under stale admission. Then reader.scm.git_clone_completed@1.0.0 refuses disclosure and fences its in-memory token; generic global indexing remains available for other families. Re-enable only after governed schema/admission validation and verified SP-278 rebuild/currentness. No source deletion, history rewrite or zero-cursor substitution is authorized.
  Exact-family oracle matrix for git.clone.completed: Plans/small_owner_event_fixtures.json owns its full EventRecord, independent original owner operation/result, original eleven-field receipt and four-field append result, full-value commitment, and positive/negative vectors; scripts/pm-small-owner-events.py validates them without registry admission. Positive append vectors assume fixture-only resolved membership/retention; actual absent membership and PENDING_RETENTION_DECISION refuse activation. Every required envelope field, profile (including redacted_refs_only), actor/correlation/time/payload/subject join and same-identity changed semantic value has a refusal vector. The admission matrix cuts missing membership/schema/retention/permission/dedupe/source/original intent/original result/current owner acceptance/body commit/current lease/restore controls before append, then cuts uncommitted group, unsynced group, receipt exposure and terminal publication. A durable commit with lost acknowledgement or lagging custody rows returns the same original result/receipt; no durable commit returns no receipt. The original owner acceptance freezes its admission epoch, actual owner session and restore occurrence; seal compares all three to current owner/Storage controls. Re-enable never relabels an old intent: fresh acceptance uses a different logical operation_id. Recovery never reruns ordinary Git clone terminal adapter or reconstructs old owner admission. Withdrawal vectors fence pending/prepared and stale-epoch intents, preserve previously issued immutable replay without effects, refuse the withdrawn operating reader, keep unrelated global indexing, and require governed new admission plus verified SP-278 rebuild/currentness before fresh work. Backup/source-deletion/unsupported-version/read-token/CAS negatives refuse disclosure or preserve the old complete publication; they cannot fabricate missing originals. Native fsync, concurrent CAS, restore authority and action-spy execution of these authored cases remain NOT_RUN.
  Static schema and semantic oracles are Plans/small_owner_event_fixtures.json and scripts/pm-small-owner-events.py. Native append durability, crash cuts, backup/restore and live permission/CAS tests are authored obligations, NOT_RUN. No writer, handler or native availability follows from this preparation.
  git.clone.completed append and current retry reject replay_policy=projector_replay_only as replay_only_not_appendable before semantic receipt resolution. That policy remains compatibility-reader-only; immutable historical semantic/full-value reads retain their separate role and unchanged digest. Before terminal publication validate the delivered eleven-field first AppendReceipt against protected original committed full-value custody and its exact EventRecord/result; a foreign, missing or mutated receipt publishes no success and never undoes or duplicates the already durable frame. Each identifier/path regex uses a full-match guard plus CR/LF refusal, with trailing-LF negatives. Its exact-family fixture matrix tests replay-only append/retry, every receipt-publication field, encoded project~ partitions, the inline byte cap and (where reachable) 16383/16384/16385-byte and SP-337 external-body boundaries.
  Checkpoint identity for git.clone.completed: before atomic rebuild publication, validate the nine-field durable token against the SP-278 read_token schema with redb_snapshot_id removed and full-match identifier checks. Its storage_instance_id, source_selection.storage_instance_id and event_record_index_checkpoint.v1:{storage_instance_id} key must identify the Storage instance of this original event; its index_dataset_name must identify its generation_id. Match every durable field to the independently captured CURRENT-selected live token after removing only redb_snapshot_id, and match the publication frontier_revision to that token. Missing, malformed, foreign, coherently substituted, trailing-LF or stale tokens preserve the old rows and checkpoint without effects; never copy an unchecked proposed checkpoint. Passive reads validate the same Storage/key/generation joins before comparing the exact selected live token. Each exact-family oracle includes these identity failures, persisted-snapshot refusal and immutable-publication checks.
  Historical operating reads and rebuild for git.clone.completed authenticate the retained EventRecord against Storage's protected original source and full-value commitment at the selected CURRENT frontier, including Storage-assigned sequence_id, observed_at_utc and persisted_at_utc. A retained event valid when written remains readable after live owner request/session/admission retirement, including compatibility-reader-only projector_replay_only history; never rerun current-writer admission or require a transient old owner request. Current reader withdrawal, permission, source presence/deletion/hold and supported-version fences still apply. Forged bytes, foreign family/Storage/source selection or missing protected originals refuse disclosure and preserve the old rebuild publication. Caller semantic retry continues to exclude Storage-assigned metadata; append/current retry still refuse replay_only_not_appendable. Check 11 isolation is exercised by the Method B guard tables in scripts/pm_small_owner_table_*.py under the gated scripts/pm_guard_isolation.py: each refusal witness starts from a valid case, changes one semantic fact and keeps all Storage/source, generation/dataset and selected/durable observation copies coherent. The tool cuts each guard row in turn; its witnesses must become accepted, unrelated witnesses must still reject, and the complete checker must fail. Identifier grammar failures are separate from valid-grammar identity mismatches; no production guard is weakened.
  Sweep part 2A/2B numbers for git.clone.completed: current input uses the shared CV-1100 calls (current_integer_token/current_integer at every integer slot, producer_semantic_bytes/producer_semantic_digest over the unchanged full producer projection beside CV-317, storage_value_bytes with EVENT_VALUE beside SP-026/SP-236, and storage_uint64 beside SP-1100 at the Storage sequence joins); no lane-local integer cap, serializer or normalization remains. Retained originals verify under the frozen dm-retained-producer-v1 recipe beside SP-1101/SP-286, selected only through the protected original custody, never through current request data; full Storage uint64, physical float bytes and signed zero are preserved. Current and retained timestamps are checked by the shared CV-1101 predicate pm_event_datetime.date_time: occurred_at_utc and the family payload clock use the event_record profile, and Storage-assigned observed_at_utc and persisted_at_utc use the storage_utc_z profile beside CV-253; the frozen dm-retained-producer-v1 recipe beside SP-1101 selects those profiles, and request data cannot select a profile.
gui_related: false
gui_classification_reason: Backend EventRecord contract, not a visual specification.
depends_on:
- SP-278
- SP-286
unblocks: []
acceptance_criteria:
- Exact family semantics, schema, identity, replay and withdrawal checks pass; no admission or native proof follows.
validation_surfaces:
- python3 scripts/pm-small-owner-events.py
risk_class: event_authority_binding_drift
reasoning_tier: high
context_scope: event_authority_DM_20261104
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20261104/DM-search.json
preserved_exact_tokens: []
negative_constraints:
- No Event Authority admission, native readiness, retention choice or new user-visible behavior.
```

<a id="home4-v2-layout-slot-receipt-dl-045-20261104"></a>
