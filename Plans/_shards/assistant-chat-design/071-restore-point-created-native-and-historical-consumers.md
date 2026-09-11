# Shard 071: Restore-point created native and historical consumers

Source: `Plans/assistant-chat-design.md`

Source lines: L25387-L25534

Source SHA256: `89eb140b2ed704c7e5733438fd216ff5594967366837f2e0323175f4c9b5cfdd`

---

## Restore-point created native and historical consumers

This addendum defines the previously missing restore-created bindings under `DL-045` for already specified behavior. These are new owner definitions, not claims that the identifiers pre-existed. The existing `event-family-restore-point-created@2.0.0`, `restore_point.created`, project-only scope, EventRecord `pm.event.v0@2.0.0`, inline payload `https://puppetmaster.local/schemas/event_payloads/restore_point_created/1.0.0` and source policy `RP-RESTOREPOINT-90D-AFTER-RELEASE@1.0.0` remain unchanged. This is a static contract; native runtime, crash, GUI and durable-storage behavior remain unproven. No sibling event is admitted.

Assistant Chat newly owns `consumer.chat.restore_point_created@1.0.0`, `reader.chat.restore_point_history@1.0.0` and `reader.chat.branch_from_restore@1.0.0`. They consume the Storage SP-281 verified logical record/event-index view. They are passive read consumers: an event never dispatches create/branch/delete, emits another event or performs filesystem work. `cmd.chat.create_restore_point` and its existing planned `handlers::chat::create_restore_point` remain the sole creation boundary. `reader.runtime_artifacts.restore_point_record@1.0.0` is separately owned by Runtime Artifacts.

At create admission, resolve the exact command identity, project, current source branch and inclusive message boundary. The envelope's project, payload project, canonical `rp:` key/value project and permission/storage target must agree. Payload `restore_point_id`, `record_ref`, `record_hash`, time and source refs must resolve to the immutable canonical record and frozen capture: `source_thread_ref` resolves to `source_thread_id`, `source_branch_ref` to `source_branch_id`, and `message_boundary_ref` to `source_message_id`; no textual resemblance or thread label is a join. Optional payload `safe_point_id` is absent exactly when the canonical nullable field is null, otherwise equal and nonempty.

`context_refs` and `provenance_refs` preserve their frozen capture categories. Their unique union must equal canonical `context_provenance_refs`; attachment and citation sets match their canonical lists. Resolve each ref under authorized storage custody and verify the owner's associated hashes/content scope. Do not manufacture a category split from the merged record field. Creation time and hash come from the same durable original capture, not retry time. Ephemeral stream/queue data, workspace file bodies, secrets and credentials are forbidden. No new redaction transform is authorized; unresolved/unhandled material refuses or quarantines.

#### New required creation custody and commit marker

The source search inspected exact materialized candidate rows and owners. `plan_approved_outbox` is Planning-Wizard approval-only. `thread_command_outbox_record` is the cross-platform command-delivery family and stores a payload digest, not this complete frozen event. `storage_maintenance_operation` is maintenance-only. `receipt_record_baseline` is deferred. None authorizes restore-created capture storage; no such family is borrowed.

The minimal new custody family is `restore_point_creation_commit@1.0.0`, key `restore_point_creation_commit.v1:{project_id}:{restore_point_id}`, closed value ID `pm.storage_value.restore_point_creation_commit.v1`. Storage SP-281 owns physical persistence with Chat owning its create semantics. The materialized `restore_point_creation_commit` row in `Plans/storage_value_registry.json` carries all required physical-family fields, its exact inline closed `value_schema`, encoding, migration and mandatory-backup recovery. This is required canonical source custody, **canonical_non_rebuildable**, not a disposable outbox or peer restore point. It holds:

- exact original five-field command request (command ID, project, thread, source message and idempotency key) plus canonical request digest;
- complete frozen producer append input, including the exact category-separated payload and every EventRecord field except the two writer-assigned fields `sequence_id` and `persisted_at_utc`, plus canonical input digest;
- immutable project/restore identity, canonical record ref/hash and capture time;
- state `pending_append | committed`, nullable synced `AppendReceipt` and nullable commit time; pending requires both null, committed requires both nonnull.

The append input is not a persisted EventRecord or a peer envelope. It freezes producer-owned values for the existing append API. It must satisfy the current EventRecord 2.0 schema when the writer supplies its two fields and the exact registered payload schema. It cannot carry `projector_replay_only` or legacy migration fields; new-write migration fields are null. Persisting the two writer fields early is forbidden. `AppendReceipt` fields and synced semantics are copied exactly from Contracts’ AppendReceipt contract; no receipt can be fabricated from `persisted_at_utc`. The schema is closed at every object and preserves the original context/provenance category split even though `rp` merges those refs.

Digests of the frozen command/input use UTF-8 canonical JSON with object keys ordered by UTF-8 bytes, compact separators, unchanged array order, no NaN/infinity and shortest finite-number representation; these objects contain no floating-point fields. Hash excludes its containing digest field because it hashes only the named nested object. Semantic joins require project/idempotency/thread/message request identity, frozen envelope identity, payload identity, canonical record fields and hashes to agree. The canonical record hash uses the explicit immutable-capture recipe and adoption contract below; it is never recomputed from the companion container.

New first executions use this deterministic identity lookup to find the companion: `restore_point_id = rpc_` plus lowercase SHA-256 of the unsigned64-bit-big-endian-length-prefixed UTF-8 tuple `('restore_point.created/create/v1', project_id, idempotency_key)`; `event_id = er_rpc_` plus the same digest. Existing successful dedupe results take precedence and are never renamed. Hash collision or conflicting original request/capture refuses without overwrite. Determinism supplies identity only; the durable companion supplies all original data. This is a new technical identity definition under DL-045, not a historical ID rewrite.

#### Enforceable three-barrier producer protocol

1. **Admission and redb capture.** Under existing aggregate writer/maintenance authority, perform current registry/schema, permission, original command identity, dedupe and source-boundary/ref/hold checks. Commit the immutable `rp` record and its complete `pending_append` companion in **one redb transaction**, with required lineage refs durable before publication. Either both rows commit or neither commits. No successful creation result is published yet. The existing in-flight/required-source-lineage rules protect this pending point; no new permanent hold is introduced.
2. **Canonical seglog append.** Read the durable frozen input, validate all joins/digests, and pass it unchanged to the existing append API. Use barrier durability because it is a prerequisite for action publication. The writer supplies sequence/persisted time and returns only a matching synced `AppendReceipt` after its frame and manifest/watermark barriers. Seglog and redb are not one transaction. If crash occurs here, the pending companion retains every original payload category, actor, correlation, occurrence/observation time and command identity. Retry/restart never recaptures from changed live conversation state.
3. **Commit marker.** Under the same owner gate, prove the exact source event is durable and matches the frozen input, canonical record and dedupe identity. In a second redb transaction CAS the same pending companion to committed, retaining every frozen field and storing the exact synced receipt/commit time. Only after this transaction may creation return success or a reader publish completed creation. A commit marker is an accelerator, not independent evidence; all reads/recovery still verify the matching canonical source through the receipt/index/manifest.

Ordinary crashes are fully recoverable from committed custody: before barrier1 neither row exists; after barrier1 retry has complete frozen input and appends at most once; after barrier2-before3 recovery validates the durable event/dedupe then marks committed with no reappend; after barrier3-before-reply it returns the original result. A lost append acknowledgement first runs Storage recovery and checks dedupe/source proof; it never assumes the append failed. Valid unacknowledged frames follow existing Case L recovery. Changed storage/permission posture fences reconciliation until existing authority permits it. Missing/corrupt companion/input/record or unprovable identity is a disclosed recovery failure requiring canonical backup/owner recovery, distinct from an ordinary intact-custody crash.

The **native new-write** reader predicate, including existing branch and artifact paths for those new records, is: in one current redb snapshot join project-matched `rp`, matching committed companion, matching original record/frozen payload hashes and the existing event-index entry; resolve that entry/receipt to the verified canonical synced frame under current Storage source/generation authority. The current lifecycle/holds/permission/source visibility must also pass the existing owner check. `rp.status=available` alone never constitutes completed creation. Pending companion or missing matching event yields in-progress/unavailable, no branch route, no artifact completion and no success result; a forged committed marker yields integrity/recovery unavailable. Only owner command/restart reconciliation can complete the marker; passive event replay cannot create or mutate canonical companion state.

#### Supported historical completion reader

A restore point that predates this new native creation-custody contract has a separately explicit validating read path. A valid existing point does not become unusable solely because no new companion exists or its original command request cannot now be reconstructed. For this read path, prove all of the following from evidence actually retained:

1. The canonical `rp` value is current-schema or admitted legacy-supported data resolved by the existing coordinator/alias rules, with valid project/restore identity, record hash, current lifecycle and owner custody. The read is read-only: no lazy copy-forward or new companion is minted.
2. A genuine matching committed `restore_point.created` source event exists in an admitted envelope/payload version, or its registered read-only normalized compatibility form. Verify its frame/source durability, exact project/record/source-boundary/hash joins and required retained refs. The genuine event supplies its own category-separated payload; it is not reconstructed from the merged record field. Its actual durable source is sufficient completion proof for this historical path; a contemporary stored AppendReceipt object or today's original command-request fields is not required if existing Storage durability/source proof establishes that historical commit.
3. Existing migration/source-generation custody proves that this is a previously completed record from before introduction of the native companion requirement. Use actual admitted source-store history and the StorageMigrationCoordinator introduction's verified source snapshot/journal/receipt evidence, never a timestamp, ID prefix or the mere absence of a companion. The existing committed `MigrationReceipt` already carries its source/target store/family transitions, backup_ref, verified applied steps and journal_ref. This rule adds no receipt field, guessed store version or permanent new backup hold; acceptance must cite the actual retained source-generation evidence. A source-native pending/failed creation, or a native companion that is missing/corrupt, cannot opt into historical mode by deleting its companion.
4. Current source visibility, retained-material availability, permissions, lifecycle and holds pass the same existing Chat read/action preflight. Passive history and the existing branch flow remain available to the extent those owners already permit; no new action or automatic branch occurs. Deleted source visibility stays deleted, and missing source content gives the existing unavailable reason.

This validates an old completed creation; it does not assert enough data exists to reconstruct the new companion. Missing original command request alone does not fail the historical reader. Missing genuine completion, source-generation or required custody proof does fail it, with truthful unavailable/recovery state. The result is qualified as historical completion verification, not a new native commit or an invented command receipt.

Coordinator backfill remains separate and optional: materialize a committed companion only when complete genuine original command, frozen input and matching source evidence are actually available. Otherwise retain the valid historical read path without minting/guessing any new fields. Backfill emits no created event, replays no command and changes no successful original identity. Future native writes require the full companion protocol.

#### Affected-record mutation fence

`restore_point_creation_commit.restore_disposition.mutation_fence_on_unresolved = true`. Missing/corrupt required native creation custody, pending completion, unproved joins or a forged marker fences canonical mutations **dependent on that exact project_id/restore_point_id**: publishing native creation success, branching from it, transitioning/deleting it or releasing its required capture cannot proceed. Read-only diagnostics and owner-authorized recovery remain possible. The fence is not a project-wide filesystem/runtime mutation fence and cannot authorize FileSafe rollback or block unrelated points. A historical point satisfying the separate complete historical reader predicate has no missing *required native* companion and does not acquire this fence merely through companion absence. Canonical owner recovery releases the affected-record fence only after proving valid native completion or the valid historical predicate; a UI cannot clear it.


ContractRef: ContractName:Plans/storage-plan.md#restore-point-created-consumer-checkpoint-contract, ContractName:Plans/Contracts_V0.md#restore-point-lifecycle-event-registration, ContractName:Plans/Runtime_Artifacts_Panel.md, DecisionID:DL-045

### Immutable capture hash and adoption

`pm.restore_point.immutable_capture_sha256.v1` is a **new explicit native recipe**, not a claim that historical owners already defined it. Its preimage is an object containing exactly these thirteen fields copied from the validated canonical `rp` value: `schema_id`, `schema_version`, `project_id`, `restore_point_id`, `source_thread_id`, `source_branch_id`, `source_message_id`, `context_provenance_refs`, `attachment_refs`, `citation_refs`, `safe_point_id`, `created_at_utc`, and `redaction_profile`. The self field `record_sha256` and mutable lifecycle fields `status` and `hold_refs` are excluded. No companion fields, command identity, EventRecord envelope, created-event category split, backing-store encoding or mutable referenced-object bytes enter the preimage. All immutable capture fields are required; preserve nullable `safe_point_id` as JSON null and preserve the exact unique-array order frozen at capture. The recipe hashes references, not their dereferenced bodies; owner verification of referenced content hashes/custody remains independently required.

Serialize that thirteen-field object as RFC 8785 canonical JSON, encode as UTF-8 with no BOM or trailing newline, and take lowercase SHA-256 hex. This follows the existing Contracts canonical-JSON primitive while defining a new restore-specific preimage. The schema has no floating-point or numeric fields. No Unicode normalization, timestamp rewriting, sorting/deduping arrays, omission of nulls, or locale-dependent encoding occurs during hashing. Reject non-Unicode-scalar strings rather than guessing surrogate repair. The immutable capture arrays/time/string spellings are frozen at original creation. Canonicalizing object member order is required; reordering array elements changes the hash. Changing `status` or `hold_refs` alone cannot invalidate the immutable hash; a change to any preimage field does. Validate schema and current lifecycle/holds independently: exclusion from the hash never authorizes an invalid status, unauthorized hold mutation or a release inference.

New native companion schema requires constant `record_hash_recipe_id = pm.restore_point.immutable_capture_sha256.v1`. Compute the canonical hash before committing `rp` and its pending companion; require equality with companion `record_sha256`, created payload `record_hash`, and the owner's expected-record-hash checks. The companion is not part of the preimage, so no recursion exists. Native reader admission proves this recipe marker plus source-store introduction evidence; bare `rp` schema version, a timestamp or absence/presence of an arbitrary key cannot select it. The StorageMigrationCoordinator introduction must bind this recipe and companion requirement to its actual verified source/target generation/transition record. No guessed store version or new field in the existing `rp`/event payload schema is introduced.

Preserve genuine historical `record_sha256` and event `record_hash` exactly. Historical completion uses the admitted original hash recipe and retained original hash/custody proof under the supported historical reader. If original recipe reconstruction is unavailable but trusted existing integrity/commit evidence proves the stored historical hash and frozen capture relation under an admitted historical reader, that evidence may validate the historical relation; it is not a recomputation with the new recipe. An equal digest across record/event alone is insufficient evidence. Unknown hash semantics with no such admitted proof yields unavailable/recovery, never silent adoption. Coordinator backfill may create a new-recipe companion only if complete genuine original data exists **and** recomputation using this recipe already equals the original stored hash; otherwise preserve the historical path with no new-recipe marker. Never overwrite genuine historical hashes, rewrite historical created/applied payloads, or mint a native marker around a different historical hash. A future recipe change requires an explicit supported version/adoption contract.

### Concrete typed terminal-summary result

The third result is `kind = terminal_retention_summary`, backed by the exact registered `restore_point_retention_summary` family and Storage SP-269 atomic retirement contract. Its `summary_ref` resolves to `restore_point_retention_summary.v1:{scope_partition}:{restore_point_id}`; project/point/ref/original-hash and the surviving created event's ID/schema/payload/frame/semantic digests match the embedded summary facts. Required native creation custody is explicitly present in the summary's retired-key set. The summary is independently canonical atomic retirement authority, so this branch does not first require a present `rp`, a removed native companion, a removed original request or the present-point historical completion predicate.

Only `reader.chat.restore_point_history` and `reader.runtime_artifacts.restore_point_record` consume this third result for passive terminal/hash-summary inspection. It carries the actual terminal status and no action authority. `reader.chat.branch_from_restore` accepts only a present point satisfying native or supported historical creation completion plus its full fresh Chat preflight; it never accepts the summary result. Missing/unproven summary authority keeps unexplained-loss recovery/fencing and does not produce a terminal result. The common typed result contract distinguishes `native_completion`, `historical_completion`, and `terminal_retention_summary`; they are not interchangeable truthy success values.

### ACD-465 — Restore-point created consumers

```yaml
plan_unit_id: ACD-465
unit_type: requirement
status: accepted
owner_doc: Plans/assistant-chat-design.md
canonical_text: Assistant Chat defines restore-created passive consumers and native creation custody under
  DL-045. Native creation commits immutable rp plus full frozen pending companion atomically in redb,
  appends the genuine event through synced storage, then proves and marks completion; all affected actions
  require verified current completion. Supported previously completed points retain a separate genuine-event/custody
  validating reader without fabricated companion or command fields. Missing required native custody fences
  only the affected restore-point operations; old completion validity and companion backfill are distinct.
  Passive history additionally accepts a separately verified terminal-retention-summary result, with no action authority.
gui_related: true
gui_classification_reason: This unit governs existing visible restore-point history and branch availability.
split_recommended: false
depends_on:
- SP-269
- ACD-086
- ACD-087
- SP-281
- CV-320
unblocks: []
acceptance_criteria:
- History accepts the independently typed SP-269 terminal-summary result without a present point/companion; branch reader never accepts that result.
- Native immutable capture SHA-256 uses the exact thirteen-field preimage, RFC 8785 UTF-8 bytes and required new-recipe companion discriminator; lifecycle and hold changes do not change that digest.
- Historical hash adoption never overwrites genuine stored hashes or adds a new-recipe marker without equal recomputation and complete genuine custody.
- Native ordinary crash after either persistence barrier recovers the exact frozen payload once without
  live recapture or duplicate append.
- Native rp.available without committed matching source proof cannot enable branch or artifact completion.
- Supported historical rp plus genuine matching durable created event and owner custody remains readable
  with no new companion or reconstructed command request.
- Affected-record custody fence leaves unrelated records and read-only diagnostics usable.
validation_surfaces:
- Plans/restore_point_created_contract_fixtures.json
- Plans/storage_value_registry.json
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: restore_point_created_completion_authority
reasoning_tier: high
context_scope: restore_point_created_event_authority
implementation_surfaces:
- Plans/assistant-chat-design.md
node_compile_hint:
  mode: restore_point_created_consumer_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20260911/step-08-depth-binding-work-records.md#ea-s8-restore-binding--restore-consumercheckpoint-evidence
preserved_exact_tokens:
- restore_point.created
- event-family-restore-point-created
- RP-RESTOREPOINT-90D-AFTER-RELEASE
- RP-PROJECTION-3GEN
- projector_replay_only
negative_constraints:
- No new event-family admission, retention policy, runtime proof, readiness clearance, WorkNodes, NodeSeeds
  or governance seal.
- No recreation of missing canonical creation custody from projections or guessed original command data.
- No passive replay side effects, hold clearing, source resurrection or filesystem restore.
owner_hints:
- Plans/assistant-chat-design.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
- Plans/FileSafe.md
```


#### Original create-command result after lawful point retirement

The create command's original result is the SP-274 content-free `RestorePointCreateCommandResult`, with original point/ref/hash/event/receipt identities for success. Equal original command identity and request digest returns this exact owner result for the app-root lifetime, even after lawful removal of point/capture bytes. This reports the original creation, never current point availability or action permission. Fresh branch/materialization still requires current canonical point, completion and Chat/FileSafe preflight. SP-269's terminal-summary result remains a separate passive history result and cannot substitute for original command replay.

Extend native creation barriers1/3 with the exact SP-274 result custody transaction; do not weaken any frozen input, source append, lifecycle/hold, historical reader or affected-point recovery requirement. The typed owner result body and schema are NEW narrow materialization; the embedded original Full Thread outcome and central UI response preserve their existing schemas/owners. Refused/failed admitted outcomes have no created target and require actual no-effect evidence; pre-dispatch refusals write nothing. Unknown effects never become false no-effect failure or automatic new creation.
