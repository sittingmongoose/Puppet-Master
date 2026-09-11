# Shard 056: Restore-point retention summary contract

Source: `Plans/storage-plan.md`

Source lines: L19774-L20428

Source SHA256: `d2846e68c4f583d8a801ed7b7253fb332619178eb9174b2b6a784e747ae8cdec`

---

## Restore-point retention summary contract

This is a NEW shared technical prerequisite under `DL-045`, owned by Storage SP-269. The existing `restore_point_record` is a full canonical record, and `storage_deletion_record` has thread/project hide-and-purge semantics with no closed restore-point identity field. Neither is an already registered restore-point retirement summary. No event-family admission, new lifecycle edge, source-body purge command or retention policy is introduced here.

The physical family is `restore_point_retention_summary@1.0.0`, key `restore_point_retention_summary.v1:{scope_partition}:{restore_point_id}`, value `pm.storage_value.restore_point_retention_summary.v1@1.0.0`. `scope_partition` is exactly `project~` plus unpadded base64url of exact UTF-8 `project_id`. Its inline closed `value_schema` is registered with the family before any writer or reader depends on it. New writer binding is `writer.storage.restore_point_retention_summary@1.0.0`. This writer is a Storage retention action, not a producer of any new EventRecord. The value is canonical, content-free and non-rebuildable; required summary custody is included in mandatory canonical backup/recovery. It is not a derived artifact or a second logical restore point.

The exact fields are the inline schema: immutable project/point/ref/original-hash identity; `representation = retained_hash_summary`; actual storage instance; an owner-verified native-or-supported-historical capture-hash relation; original created and terminal event IDs, schema IDs, payload/semantic/frame digests and verified source coordinates; existing policy ID/version/expiry action; a complete owner reference-release fact; eligibility selection/time/count and eligible-set digest; exactly one complete evaluation for each named hold/ref class; exact canonical family/key/schema/encoding/value-byte digests removed in the transaction; owner-proven flags identifying required creation/deletion companions; and the retiring actor, operation, owner gate revision, summary transaction and commit time/source generation.

These are embedded durable owner decision facts. Original evidence refs/IDs are supplemental lineage, not the only available proof after lawful source-manifest retirement. `value_bytes_sha256` is SHA-256 of the exact validated canonical encoded value bytes read for the named key, using its registered encoding; it is distinct from immutable `original_record_hash`. Event payload and frame digests are SHA-256 of the exact canonical payload/frame bytes actually verified under their owners. No digest is substituted for an unperformed check. The writer must validate the real records and receipt/source authority before recording these facts; schema-shaped, self-issued or pointer-only claims cannot create a summary. The snapshot captures only minimal content-free identity, digest and decision facts needed for future terminal verification, not original command/input, title, transcript, attachment/file bytes, runtime queue, secrets or raw machine paths.

`hold_evaluations` contains exactly one entry for each of `descendant_branch`, `application`, `preserve`, `legal_hold`, `in_flight_application`, `source_lineage`, `live_ref`, `backup`, `rollback`, `recovery_anchor`, and `maintenance`. Each records its actual owner/revision, completed scope enumeration, zero active blockers and the count plus canonical set digests of the genuine released refs/release facts evaluated. A zero released-ref count means the owner positively verified that no released refs were needed for that class in this closure; observing an empty cache is insufficient. The summary does not retain historical hold/ref/input arrays: each of the eleven fixed classes has one compact authoritative evaluated-result witness. Pending creation/deletion or other required canonical custody is a live/maintenance/source-custody blocker; do not manufacture an exception to fit an eligible snapshot. The separate `reference_release` closure must already exist as a complete owner fact and bind the exact point/ref set. No event, creation, deletion, summary or mtime timestamp supplies that anchor.

Retirement eligibility remains the exact existing `RP-RESTOREPOINT-90D-AFTER-RELEASE@1.0.0`: inclusive `reference_release + 7,776,000 seconds`, all protecting refs released, and `2,048/project` logical point count with oldest-eligible-only count pressure. `selection_kind = reference_release_ttl` requires the inclusive release age predicate. `oldest_eligible_count_pressure` additionally requires count greater than 2,048 and rank zero in the actual owner-verified eligible set; count pressure does not bypass age or holds. The 2,048 cap counts distinct full canonical `rp:` points awaiting or retaining full custody, never their companion rows. Once a point is lawfully retired, its required final hash-summary residue is not counted again as another full point; otherwise the required residue would defeat the same policy's eviction rule. Residues provide only existing-reference/history terminal inspection, not a new user history feature or point-creation surface. The summary is the existing policy's final `retain_hash_summary` residue; it is not an independently newly aging object. Do not restart 90 days at summary creation, recursively delete the required residue using that same expiry action, assign `RP-AUTHORITY-INDEFINITE`, or invent a summary TTL, cleanup timer or permanent hold. Any future change to this residual disposition requires explicit owner policy authority.

The point must already have an owner-proven terminal status `expired | deleted | corrupt`, and the terminal event's actual type must equal that status. A deleted point first requires the existing exact-hash `available -> deleted` command authorization; an expired or corrupt point uses its own existing owner transition. Retirement creates none of those transitions and emits none of their events. Logical explicit delete is not a 90-day bypass for physical custody retirement. A terminal label, corruption finding or matching hash alone is not permission to remove custody.

### Atomic owner retirement

1. Under the aggregate writer and current maintenance exclusion, resolve the exact canonical point, its required creation/application/deletion custody and current source/index generation. Verify the actual complete native creation proof or supported historical completion proof, original capture hash relation, already committed terminal owner event, and actual closed source/payload schema. No pending marker or missing native companion qualifies as historical data. Capture their exact encoded bytes/digests before retirement.
2. In the same owner authority boundary, revalidate the entire current release/ref/hold inventory, source visibility permissions, policy, inclusive age, logical count and selected eligible rank against canonical state. Freeze the exact list of eligible canonical keys to remove. The list must include the canonical `rp:` row and every required custody row whose removal is being authorized; it never invents a row for a historically never-required companion or silently omits an actual required native companion. Other retained source/event/receipt/backup objects remain under their own owners.
3. In ONE redb write transaction, compare-and-swap all frozen canonical bytes and the owner gate revision, write the complete immutable committed summary, and remove exactly the listed eligible `rp`/companion keys. Either the complete summary and every listed removal commit durably together, or none of them changes. All selected keys must be in this same admitted redb store/transaction domain; an unavailable cross-store target keeps retirement unavailable and is not handled by sequential best effort. The removable custody set is bounded by the known schema: one `restore_point_record`, at most one `restore_point_creation_commit`, and at most one separately admitted `restore_point_deletion_commit`, with unique family IDs and at most three entries. The owner-proven requirement flags must match that exact set. A future extra custody family requires a versioned contract change; applications and other objects are not silently folded into this removal batch. No seglog, blob, thread, worktree, file, Git, queue or external deletion occurs in this transaction. No hold is cleared by it.
4. A crash before commit leaves the original rows authoritative and no summary. A crash after commit leaves the summary authoritative and the exact listed rows absent; replay of the same retirement identity and facts is a no-op. A summary conflicting with remaining canonical bytes, another summary, the original hash or retirement identity is a disclosed affected-point integrity/recovery failure; do not overwrite either side, infer successful retirement, reconstruct missing points or advance dependent traversal. Writer/maintenance exclusion prevents source-generation changes racing this transaction.

The summary itself is the canonical atomic retirement result, not a promise that another manifest will later prove it. Existing seglog compaction may later remove eligible event frames under its independent verified successor protocol and frozen semantic set, which must preserve this required canonical summary custody. A source range no longer present still needs the existing verified compaction/source-range handoff before a projector translates its cursor; a summary cannot certify an arbitrary missing range. Required canonical backup/restore sets include the retained summary. A restored pre-retirement point cannot become available while a valid retained summary says it was retired; recovery must carry and honor that terminal authority before any read/action publication. A backup or rollback set missing required summary custody is incomplete and yields disclosed recovery-unavailable; do not silently select it as a complete authority or invent a new backup-retention window.

### Typed terminal traversal

The created/deleted reader may return `kind = terminal_retention_summary` only by reading this exact registered summary in the current storage instance/project partition, validating its schema and immutable record/hash/event joins, and proving it was admitted through the actual owner summary transaction/source-generation path. The named event's surviving payload/frame must match the stored original digest and identity. For native-created data, `retired_custody` must explicitly cover its required creation companion at `restore_point_creation_commit.v1:{project_id}:{restore_point_id}` as well as the `rp` key. Each additional required native companion is checked against its own owner introduction and exact key; absence never proves it was optional. Supported historical status is proven from genuine admitted history, not timestamps or key spelling.

This terminal result needs no present `rp` bytes or lawfully removed companion. It authorizes only passive traversal and terminal/hash-summary display with the actual unavailable reason. It never becomes native or historical live completion, successful create replay, action/branch permission, restored source visibility, a reconstructed point, another EventRecord or a hold clear. Missing/corrupt summary or unexplained missing canonical custody preserves the existing affected-record fence and prior traversal checkpoint. Actual current-generation/index/cursor proof remains mandatory regardless of result kind.

ContractRef: ContractName:Plans/storage_value_registry.json, ContractName:Plans/assistant-chat-design.md#immutable-conversation-restore-point-lifecycle, ContractName:Plans/storage-plan.md#restore-point-created-consumer-checkpoint-contract, DecisionID:DL-045

### SP-269 — Restore-point final retention summary custody

```yaml
plan_unit_id: SP-269
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage defines one canonical content-free restore-point retention summary family as the existing retain_hash_summary policy residue. A single owner-authorized redb transaction writes complete validated terminal identity, hash, release, hold, selection and exact retired-custody facts while removing only the named eligible point and companion keys. The summary permits typed passive terminal traversal after lawful removal without requiring those removed rows, and never supplies live completion, action, reconstruction or source visibility.
gui_related: false
gui_classification_reason: This unit defines canonical storage custody, atomic retirement and passive reader proof.
split_recommended: false
depends_on:
- SP-242
- CV-320
- DL-045
unblocks: []
acceptance_criteria:
- Exact registered summary key, closed value schema and mandatory-backup recovery are required before use; generic storage deletion scope is not a substitute.
- Owner-proven release plus 7776000 seconds, all holds, 2048 logical points and oldest-eligible selection remain unchanged; residue gains no independent TTL, timer, policy or hold.
- Summary publication and exact listed redb removals commit together or not at all; pending native custody, changed owner revisions and unexplained loss fail closed.
- Embedded content-free validated facts survive lawful original-manifest retirement and are not mere unresolved proof pointers.
- Typed terminal traversal is distinct from present native and supported historical completion and cannot authorize an action or resurrect source content.
- Missing required canonical summary custody is disclosed recovery loss, not an invitation to reconstruct a point from events.
validation_surfaces:
- Plans/storage_value_registry.json
- Plans/restore_point_retention_summary_fixtures.json
- python3 scripts/pm-plans-verify.py run-gates
- python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
risk_class: restore_point_terminal_retention_authority
reasoning_tier: high
context_scope: restore_point_retention_summary
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: restore_point_retention_summary_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/assistant-chat-design.md#immutable-conversation-restore-point-lifecycle
preserved_exact_tokens:
- RP-RESTOREPOINT-90D-AFTER-RELEASE
- retain_hash_summary
- restore_point_retention_summary
- terminal_retention_summary
negative_constraints:
- No new event admission, lifecycle edge, source-body deletion command, retention policy, independent summary TTL, runtime proof or governance seal.
- No inference of release or successful retirement from missing rows, wall time, pointer-only claims or deleted-source UI state.
owner_hints:
- Plans/assistant-chat-design.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
```


### SP-274 - Create restore-point original result custody

```yaml
plan_unit_id: SP-274
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage supplies canonical content-free custody of the original create-restore-point command
  identity, typed owner result, authenticated shared-runtime outcome, original UI response and synced
  append receipt. Pending custody commits atomically with the point and creation intent; terminal custody
  commits atomically with the committed creation marker. Original command replay survives lawful point
  retirement without creating current point availability or accessing retired content.
gui_related: false
gui_classification_reason: This unit defines durable authority, authenticated custody and replay, with
  no visual presentation contract.
split_recommended: false
depends_on:
- CV-333
- SP-281
- DL-045
unblocks: []
acceptance_criteria:
- The exact registered result key binds the original scope, idempotency key and canonical request digest;
  a changed request or hash-key collision fails without another point.
- Pre-dispatch rejection writes nothing. Native point, pending companion and pending result commit together;
  terminal companion, original owner result, actual outcome and original response commit together after
  the real synced append.
- Original typed result, normalized request identity, CommandOutcomeRecord, UICommandResponse and AppendReceipt
  agree through exact field, hash, reference and authenticated producer joins; the result hash excludes
  the containing record and outcome.
- Unknown append effects remain pending and recovery-required; an admitted terminal refusal or failure
  requires actual no-created-effect proof and cannot erase an acknowledged effect.
- Original content-free result custody follows the existing app-root lifetime, mandatory backup and permission
  rules; RP90 point retirement neither erases it nor grants current availability, branching, recovery
  or source visibility.
- Missing required native result custody is disclosed and fenced; events, dedupe locators, summaries,
  current points and schema-shaped outcomes cannot reconstruct it.
validation_surfaces:
- Plans/restore_point_create_result.schema.json
- Plans/restore_point_create_result_fixtures.json
- Plans/restore_point_create_result_join_fixtures.json
- Plans/restore_point_create_result_native_pairs.json
- Plans/storage_value_registry.json
risk_class: restore_point_original_result_authority
reasoning_tier: high
context_scope: restore_point_create_original_result
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: restore_point_create_result_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/UI_Command_Catalog.md#UCC-164
- Plans/Contracts_V0.md#CV-333
preserved_exact_tokens:
- cmd.chat.create_restore_point
- RP-AUTHORITY-INDEFINITE
- CommandOutcomeRecord
- pre_dispatch_rejection
negative_constraints:
- No new event admission, retention policy, global command architecture, launch-critical promotion, native
  execution proof, readiness clearance or governance seal.
- No guessed original outcome, hidden pre-dispatch writer, point resurrection, source visibility grant
  or passive replay mutation.
owner_hints:
- Plans/storage-plan.md
- Plans/assistant-chat-design.md
- Plans/Shared_Integration_Runtime.md
- Plans/Contracts_V0.md
```

**Existing obligation and precise gap.** UI Command Catalog Case L requires original owner-result replay for the app-root lifetime. CV-333 preserves actual command, scope, outcome, result, receipt, error and event identities. The four-field `original_append_result` in existing EventRecord dedupe indexes proves an append locator, not an original command request or typed owner result. `thread_command_outbox_record` has delivery custody and RP-DELIVERY-365D; `receipt_record_baseline` is deferred. Neither supplies this command's app-root original-result authority. The RP90 creation companion and SP-269 terminal summary cannot supply successful original command replay once the companion retires. This unit fills exactly that create-command custody gap, without changing point retention or shared command architecture.

**Physical and result authority.** Define NEW `restore_point_create_result` redb canonical family, value `pm.storage_value.restore_point_create_result.v1@1.0.0`, at `Plans/restore_point_create_result.schema.json#` and its exact registered physical row. The key is `restore_point_create_result.v1:{sha256_utf8(scope_partition)}:{sha256_utf8(idempotency_key)}`. Use raw UTF-8 SHA-256 with lowercase hex, no normalization; retain the unhashed values in the closed row and reject any key/value collision. Only `cmd.chat.create_restore_point` and project scope are admitted. Partition follows existing reversible project encoding. Same key is scoped command identity; do not key on request hash, point ID, attempt, dispatch time or current conversation content. The first admitted original command/request hash binds identity permanently.

`original_owner_result` is NEW Chat-owned content-free `RestorePointCreateCommandResult`, distinct from the exact embedded existing Full Thread `CommandOutcomeRecord`. Created result holds only original point ID, canonical record ref, original record hash, event ID, original AppendReceipt hash and owner receipt ref. It is historical command success, never current `available`, permission, record contents, FileSafe recovery or branch success. Refused/failed results have no created target/event/hash claim and use an actual owner reason ref. `cleanup_performed=false` always. No frozen append input, source message bodies, provenance arrays, attachments, filesystem contents, raw machine paths, secret or arbitrary dynamic text is retained here. Original identifiers in the authentic existing Full Thread outcome remain content-free command evidence.

The embedded `original_command_outcome` is the actual existing SIR-owned record, captured through SIR-044, not a locally authored substitute. Its schema definition and identity semantics remain byte-identical to current `Plans/full_thread_runtime_contracts.schema.json#/$defs/CommandOutcomeRecord`; the containing schema imports its exact definitions. `original_ui_response` is a frozen exact existing CV-333 2.0.0 projection for that same authenticated terminal result, retained to preserve original error/status/request/dispatch/receipt/event references. It is not domain authority. No second global Full Thread producer or response format is created.

**Admission boundary.** Existing global registry/handler/schema, permission, storage access, backup/custody and actual operation dispatch gates precede durable admission. A pre-dispatch refusal, including read-only storage, writes no result, outbox, receipt, point or event and fabricates no operation/Full Thread outcome. Its CV-333 response_kind is `pre_dispatch_rejection`, with existing closed error code and null owner/operation refs; no ninth generic error code or receipt-writer exemption is introduced. A retry that can only read may return an already durable permitted historical result; it cannot mutate or perform recovery. Once accepted by the actual owner operation, native terminal refused/failed results may be stored under this command-specific identity only when authoritative no-created-effect proof exists. This does not convert a failed pre-dispatch gate into an accepted operation.

**Three barriers and terminal publication.** Extend native creation barrier1: atomically commit the original immutable `rp`, frozen pending creation companion, and `admitted_pending` result custody row in the SAME redb transaction, with the genuine initial Full Thread outcome/dispatch identity. The row binds the exact companion `command_request_sha256`, frozen input hash and producer semantic digest. No terminal owner result/response/hash/time exists yet. Pending already protects replay identity; a retry compares the original canonical command request digest before consulting changed live content. It resumes the same authenticated operation and frozen append input, never recaptures from current thread state.

Barrier2 remains the same genuine synced seglog append and AppendReceipt; no cross-redb/seglog transaction is asserted. Barrier3 verifies that source and CASes the same companion committed AND result row terminal in one redb transaction. The actual SIR owner supplies/authenticates its terminal original outcome, matching this separately computed typed result; the dispatcher supplies the exact original CV-333 response. None is exposed as terminal until this commit. Retention cannot observe completed creation with missing required terminal result custody. An admitted no-effect refusal/failure commits its terminal typed result/outcome/response without a created event or point; it must prove no created effect and must not fabricate a pending capture for a rejected source. After any possible append or unknown effect, failed/no-effect is forbidden: keep pending, reconcile under the existing owner gates, and expose the existing recovery-required/effect-unknown posture without replacing the original terminal result with guessed failure.

Before barrier1, no creation effect exists. After barrier1, original pending custody can recover the same frozen input. After barrier2 before3, recovery verifies the real original source/dedupe result and finishes the same barrier3 without reappend. After barrier3 before response, replay returns the original result/outcome/response identities. Outcome and response publication use this same committed custody boundary; an independently emitted premature success cannot be repaired by claiming later storage. Concurrent retries serialize under existing owner/aggregate fences and exact key/request CAS. Unsupported/unregistered required family or unresolved mandatory backup fails before admission. Passive event/projector replay never writes this family or repairs command state.

**Hash graph and joins.** `command_request_sha256` is the exact already defined creation companion canonical request digest, distinct from Full Thread payload_sha256 and the event producer digest. Compare incoming normalized domain request to this original digest; transport retry dispatch identifiers do not re-key it. Validate the original Full Thread envelope joins independently. Hash `original_owner_result` alone with RFC8785 UTF-8 SHA-256; the object contains neither its own hash nor outcome/container/response. Use that hash and the exact schema path/root definition to bind Full Thread owner_result_sha256/ref/schema_ref. The owner-result ref resolves to this row's `#/original_owner_result`; the outcome ref resolves to `#/original_command_outcome`. The typed receipt_ref resolves to the same authenticated committed command result evidence. References are identities, not recursively dereferenced hash inputs. The result's AppendReceipt digest is computed from the original exact synced AppendReceipt before retirement; it is evidence of the original creation, not a live source locator. Do not invent a later receipt from an event index.

Command ID, project/partition, idempotency key, request hash, original dispatch, actual Full Thread command instance/operation/topology/payload/generation/frames, typed owner result and CV-333 response must agree through their existing contracts. The initial response is not replayed; replay sets only CV-333's replay/dispatch presentation fields as that contract permits while preserving original status/error/request/outcome/result/receipt/events and original_dispatch_id. Its timestamp follows the original projection's semantics; do not mint domain completion time. References to external acknowledgements or historical request lineage remain genuine original refs, never self-issued replacements; this retained actual terminal outcome and result is the custody proof, not re-performing the retired operation. Missing genuine evidence during first publication fails closed.

**Retention and recovery.** Assign this one new row `RP-AUTHORITY-INDEFINITE@1.0.0`, whose existing no-TTL/no-cardinality/fail-closed policy materializes UCC's existing app-root original-owner-result duty. No policy object or new retention choice is created. The point/companion retain RP90 and their existing release/hold/cap rules; this content-free result is not a second point, capture hold, 365-day delivery record or SP-269 terminal summary. Point expiry/deletion does not remove original command result custody. Existing project deletion/tombstone/access policy still governs disclosure; historical success cannot unhide a thread, provide retained content, branch, restore files or release holds. Original results may remain internally authoritative but access-refused to an unauthorized caller.

This family is canonical_non_rebuildable, mandatory-backup, restore-from-backup, with a mutation fence limited to commands dependent on the unresolved identity. The embedded outcome is canonical delegated custody under SIR-044, not rebuildable from current shared-runtime views. Preserve its terminal bytes/schema and authentic record provenance for app-root lifetime. Missing/corrupt native result cannot be reconstructed from the event, terminal summary, dedupe locator, current point or default-filled outcome; disclose/fence, never create a second point. Backup must contain the committed joint value. Existing historical completed point inspection remains unchanged; absent original command evidence means command replay unavailable, not an invalid historical point. Coordinator backfill requires complete genuine original request, typed result, outcome and response evidence with exact hashes and identities; no fabricated historical receipt, dispatch, field or date.

The physical row must be materialized with normal coordinator/version admission before native creation depends on it. It is not silently added to launch-critical/MVP arrays, and it creates no global CommandOutcome physical family. This specification is static contract/schema/oracle work; native durability, authentication, replay, deletion, crash and CV-333 publication tests remain NOT_RUN.

**Retained original evidence closure.** The same row also retains the exact authenticated `original_normalized_request` identity projection used by CV-333 (request ref, command/instance/operation, original full owner identity, payload digest, idempotency key, target generation and dispatch frame), plus the original successful synced `AppendReceipt` object. These are closed content-free evidence, not a new UICommand envelope or recaptured domain arguments. The canonical domain request digest remains the companion's separate exact recipe. First capture must authenticate the actual original request; a fixture-shaped identity cannot establish it. Successful terminal publication proves the receipt's event/frame/durable watermark through barrier2 and requires its canonical digest to equal the typed result's append_receipt_sha256. Thereafter lawful point/event retirement need not preserve the old segment: the original receipt is historical committed command evidence, never a live locator or authority to read purged bytes. Pending and no-effect refused/failed rows have null original_append_receipt. Native retained outcome/request/response resolution is delegated through the one canonical row; original refs remain exact, with no replacement identities. The complete command-result row is preserved atomically in mandatory backup, separately from expiring point/companion custody.

**Closed semantic publication guards.** Pending custody requires both frozen append-input and producer semantic digests, each equal to the same admitted creation companion. A terminal created result requires those same non-null original digests, actual successful outcome, accepted/succeeded response with no error, the exact point/ref/hash/event identity, and the original synced receipt with `durable_end_offset > byte_offset`. A terminal refused result requires the actual rejected outcome, rejected response with its original error and null result status, no event refs, no append receipt and no frozen append-input or producer digests. A terminal failed no-effect result requires the actual failed outcome, accepted/failed response with its original error, and the same absence of created-event/append/digest claims. All result/receipt/outcome references resolve through this one committed value's exact typed members; the canonical schema pointer is `Plans/restore_point_create_result.schema.json#/$defs/RestorePointCreateCommandResult`. Request and outcome identity joins remain mandatory in every state. The terminal time cannot precede admission; an admitted terminal value is immutable. Shape validation alone cannot establish these relational guards or native provenance.

### SP-271 - Historical child-status exact source reader

```yaml
plan_unit_id: SP-271
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: Storage defines an exact read-only historical goal.child_status_changed adapter over the
  existing current EventRecord index and verified retained source. It owns no projection, durable state,
  checkpoint, append or recovery write. The generic index checkpoint and source publication proof remain
  independently required; unresolved shared custody makes interpretation unavailable.
gui_related: false
gui_classification_reason: This exact-row contract defines historical validation and read-only storage
  interpretation without a new GUI or active child projection.
split_recommended: false
depends_on:
- GRS-052
- CV-334
- DL-045
unblocks: []
acceptance_criteria:
- The sole adapter storage.goal_child_status_history_read.v1@1.0.0 accepts exact authorized project/event/original-sequence
  identity and validates key, partition, index, source frame and payload joins.
- A consistent CURRENT-selected index generation, its actual admitted generic checkpoint, complete declared
  coverage, source watermark and committed translation authority are verified before releasing the ephemeral
  result; stale generations discard it.
- Family checkpoint disposition is none_required because there is no family-owned durable effect, projection,
  acknowledgement, idempotency ledger or progress cursor; another family checkpoint is never borrowed.
- Current producer rejection precedes dedupe/CAS/outbox/append. Passive historical lookup cannot rebuild
  child topology, run a prior transition, schedule work, approve, charge, notify, append, write quarantine
  or alter canonical state.
- Exact original v2 schema and supported registered v1 normalization preserve historical source identity
  and genuine custody; missing evidence or unsupported routes never produce synthetic history.
- Existing source/index retention, backup, holds, tombstones, authorization and secret-handling rules
  remain intact; the adapter owns no new retention clock or material.
validation_surfaces:
- Plans/goal_child_status_history_contract_fixtures.json
- Plans/event_payloads/goal_runtime/goal_child_status_changed.schema.json
- Plans/event_family_registry.json
- Plans/storage_value_registry.json
risk_class: retired_goal_child_writer_reintroduction
reasoning_tier: high
context_scope: goal_child_status_historical_event
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: goal_child_status_history_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Goal_Runtime_System.md#GRS-052
preserved_exact_tokens:
- goal.child_status_changed
- pm.goal_runtime_event.goal_child_status_changed.schema.v2
- RP-AUTHORITY-INDEFINITE
- none_required
- projector_replay_only
negative_constraints:
- No event/schema/registry/physical/policy mutation, sibling disposition, new child topology, To-Do translation,
  runtime proof, WorkNode/readiness admission or governance seal.
- No current append success from historical dedupe, guessed source custody, unresolved generic checkpoint,
  read-triggered write or fabricated historical default.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Contracts_V0.md
- Plans/storage-plan.md
- Plans/Runtime_Artifacts_Panel.md
```

**Authority and producer.** This exact row stays registered with its current v2 payload root, project-only scope and `RP-AUTHORITY-INDEFINITE@1.0.0`. GRS-060/CV-334 forbid every current producer append before dedupe/CAS. There is no new publication/outbox, payload, canonical receipt, physical family, launch-critical dependency, retention policy, projector or checkpoint writer. The earlier sole-new-writers clause carries the exact CV-334 historical-only exception. SP-214's `goal_child_index.v1` and child-state reconstruction do not apply to this row in the current runtime; preserving old bytes does not authorize rebuilding retired child topology.

**Named consumer binding.** Define NEW read-adapter binding `storage.goal_child_status_history_read.v1`, version `1.0.0`, over the existing Storage EventRecord direct inspection and Runtime Artifacts Panel/Goal history validated read paths. This is a technical name for the existing bounded lookup behavior, not an assertion that a previously named adapter was found. Consumers use it only for read-only historical diagnostic inspection. Request exactly project ID, event ID and original sequence ID under normal project read authorization. No current selected-project fallback, name-prefix scan, history pagination, notification, scheduling, approval, accounting or file mutation is owned by this adapter.

**Key, value, cursor and shared proof.** Resolve `event_record_index` by family ID, using existing key `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}` and value `pm.storage_value.event_record_index.v2@2.0.0`. Partition is `project~{base64url_no_pad(UTF8(project_id))}`; sequence uses exact nonnegative integer arithmetic and 20-digit zero padding within the EventRecord owner's admitted domain. Validate the existing closed value schema. Index key/value/project/event/sequence/type must match the request, exact family name and source EventRecord. The physical cursor is the value's full `(segment_generation, segment_name, byte_offset, sequence_id)`, never an offset alone.

The generic index projector remains independently owned. Read a consistent CURRENT-selected committed generation and require publication_locator's manifest_generation, recovery_epoch and survivor_prefix_sha256 to match that authority. Resolve its checkpoint_ref to the independently published generic index checkpoint and prove the requested sequence belongs to its complete validated coverage and surviving source set, with the index and checkpoint published together under the existing generic contract. A nonempty ref alone proves nothing. Do not substitute application dedupe, `run.started`'s filtered checkpoint or another family checkpoint. If generic checkpoint proof cannot be resolved, this read is unavailable; this contract does not invent its shape or infer proof from max sequence. Validate any compaction translation through the committed translation manifest and exact source identity. Read and validate the complete source frame within the durable watermark; verify payload hash and producer digest by the existing Contracts formulas and immutable frame identity. Index metadata is never payload authority. Revalidate the selected publication before releasing the in-memory answer; a changed/recovered generation discards the answer and requires a fresh bounded read. No cross-generation patched offset is permitted.

**Checkpoint and owned effect.** Family checkpoint disposition is explicitly `none_required`: there is no family projection, durable progress, acknowledge token, replay position, idempotency ledger or owned write. Repeated lookups recompute an ephemeral answer; interruption leaves no family state. The requested exact event tuple is a lookup selector, not a durable cursor. The source index's independently owned checkpoint proof above remains required. Zero durable owned effect means no atomic family write transaction and no checkpoint advance; returning the complete validated answer is the only success boundary. A missing index does not trigger a rebuild or write in this adapter; the existing independent generic recovery owner may rebuild it through its own contract.

**History and replay.** Historical eligibility means source bytes already in verified retained seglog or their byte/identity-preserving restoration from an authenticated existing backup generation with the existing recovery receipt and source manifest. Timestamp, payload schema promotion date, imported JSON, synthetic migration marker and current dedupe records cannot establish historical custody. Existing invalid material is preserved for diagnostics and cannot be interpreted as authority. V2 validates against the unchanged schema and historical D-R03 predicates, without running them. Exact v1 normalization is transient and allowed only through the pre-existing registered event-specific legacy route, source header/cursor and identity candidates; unsupported/absent route refuses interpretation and leaves bytes intact. No default-filled rewritten payload or new idempotency identity is persisted. Neither v1 nor v2 inspection creates parent/child projections or dispatches any original side effect.

**Failure, retention and recovery.** Same exact source/identity/digest is the same historical observation, not current append success. Conflicting bytes, ambiguous identity, missing original proof, unsupported future schema, wrong scope, stale publication or unresolved source return unavailable/invalid diagnostic disposition without successful interpretation. Current writer rejection is unconditional even if historical bytes with the same idempotency key exist. Canonical seglog and any referenced historical canonical receipts remain subject to their existing backup/custody rules; loss is not repaired from an index or guessed child state. `RP-AUTHORITY-INDEFINITE@1.0.0` keeps source authority; `RP-EVENT-INDEX-SOURCE@1.0.0` couples the existing lookup row to that source. Adapter holds no independent retained material and owns no new clock. Existing project deletion, legal holds, retained-source access and tombstone rules still govern access. Exact committed deleted/expired translations return unavailable, never fabricated history. Raw secrets are not exposed: use existing reject-unhandled-secrets with no new redaction transform. Reader failure is read-only refusal, not an instruction to write quarantine from this adapter.

**Withdrawal.** Unsupported adapter/payload/envelope version disables the family read, preserves original bytes and indexes under their owners, and grants no fallthrough writer, parent projection or alias. Removing reader availability does not change registry membership or retention. Contract/schema/oracle materialization is not native proof, checker success, registry admission, WorkNode/readiness admission or a governance seal.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-060, ContractName:Plans/Contracts_V0.md#CV-334, ContractName:Plans/Runtime_Artifacts_Panel.md, SchemaID:pm.storage_value.event_record_index.v2

### SP-277 - Historical Goal degradation direct source reader

```yaml
unit_type: storage_contract
status: accepted
gui_related: false
gui_classification_reason: Defines exact event admission, historical interpretation and storage read authority
  without adding a GUI.
split_recommended: false
unblocks: []
reasoning_tier: high
context_scope: goal_degraded_exact_family_historical_contract
validation_surfaces:
- Plans/goal_degraded_history_contract_fixtures.json
- Plans/event_payloads/goal_runtime/goal_degraded.schema.json
- Plans/goal_runtime_events.schema.json
- Plans/storage_value_registry.json
- python3 scripts/pm-plan-index.py validate
- Native exact-family retirement/read/recovery/action-spy oracles remain NOT_RUN.
node_compile_hint:
  mode: goal_degraded_historical_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Goal_Runtime_System.md#GRS-048
- Plans/Goal_Runtime_System.md#GRS-049
- Plans/Goal_Runtime_System.md#GRS-014
- EA-UND-0006-GOAL:D-R06
- Plans/Decision_Log.md#DL-045
source_atom_ids: []
negative_constraints:
- No blanket21 retirement, registry/schema/retention mutation, alias, new current producer, active Goal
  state, role/tier, phase/tranche/child/budget, To-Do or GoalRun translation.
- No native/runtime/readiness/gate/seal proof, canonical receipt reconstruction, automatic recovery/continuation,
  notification, Usage, approval or hold effect.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
plan_unit_id: SP-277
owner_doc: Plans/storage-plan.md
depends_on:
- GRS-061
- CV-335
- SP-235
- SP-236
- SP-237
- SP-241
risk_class: historical_goal_event_source_and_checkpoint_authority
implementation_surfaces:
- Plans/storage-plan.md
- Plans/storage_value_registry.json
canonical_text: 'Define NEW read-adapter binding `storage.goal_degraded_history_read.v1`, version `1.0.0`,
  for the existing Storage/Goal/Runtime Artifacts validated EventRecord inspection path. The ID is a new
  explicit technical definition, not a claim of a previously registered adapter. It serves exactly the
  already registered `event-family-goal-degraded@2.0.0` under GRS-061/CV-335''s historical-only disposition.
  There is no current producer, family projector, new physical value, critical/MVP dependency, new policy
  or active lifecycle effect. The existing v2 payload and immutable legacy aggregate are unchanged. This
  binding does not reuse the child-status adapter as authority; both consume the independently owned generic
  index through their own exact-family constraints.


  The bounded lookup selector contains exactly project_id, goal_id, event_id and sequence_id. Normal authenticated
  project/historical-read access applies; a live Goal object need not be fabricated for a retained historical
  event. Resolve the existing `event_record_index` family by ID, schema `pm.storage_value.event_record_index.v2@2.0.0`,
  using key `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`. Project partition is
  exactly `project~{base64url_no_pad(UTF8(project_id))}` and sequence formatting follows the existing
  exact EventRecord integer domain and twenty-digit unsigned decimal padding. Do not round through floating
  point, substitute selected project, infer the event from its name or omit event ID. Validate the closed
  current index schema and exact key/value/project/sequence/event/family joins, then validate source payload
  goal_id against the selector.


  Read a consistent CURRENT-selected committed index/source publication. Resolve the index publication_locator''s
  manifest_generation, recovery_epoch, survivor_prefix_sha256 and checkpoint_ref to the independently
  owned generic index publication and actual checkpoint. Prove complete generic index coverage includes
  the exact requested sequence in the surviving source set; a nonempty reference, maximum sequence, family-filtered
  checkpoint, application dedupe checkpoint or another event''s cursor is not coverage proof. If the actual
  generic checkpoint cannot be resolved, return unavailable instead of inventing a checkpoint contract.
  This family owns no full-range scan or catch-up. It relies on verified generic full-range publication
  and validates this exact complete source frame.


  The source cursor is the full tuple segment_generation, segment_name, byte_offset and sequence_id from
  the validated row. Check current generation, complete frame bounds/CRC, durable watermark, original
  event identity, payload hash and existing producer-semantic digest with their actual owner algorithms.
  The index contains lookup metadata, not event or receipt authority. Compaction translations must resolve
  an actual committed translation manifest and preserve exact source identity; a guessed retired offset
  is forbidden. Revalidate CURRENT/publication selection before releasing the complete in-memory answer.
  If recovery/generation changed, discard the answer and perform a fresh bounded read. A missing index
  does not cause this adapter to write/rebuild; only the independent generic recovery owner may do so
  under its contract.


  Family checkpoint disposition is explicitly `none_required`. The adapter owns zero durable state: no
  projection row, progress/cursor value, acknowledgement, family idempotency record, receipt, checkpoint,
  cache materialization, hold or index write. Repeated/interrupted lookups leave no owned effect. The
  exact selector is a lookup request, not a resumable cursor. The sole success boundary is release of
  one fully validated in-memory historical answer; there is no atomic family write transaction or checkpoint
  advance. The independently required generic checkpoint proof is not waived by none_required. No child-status/run.started/Goal-state
  checkpoint is borrowed.


  Genuine historical eligibility is established by actual retained immutable seglog source or its authenticated
  byte/identity-preserving restoration from an existing verified backup generation with the original source/restore
  custody. A timestamp, schema promotion date, imported caller JSON, migration marker or absent current
  writer does not prove history. A record must validate under its actual supported original schema and
  source provenance. Legacy aggregate `pm.goal_runtime_events.schema.v1` shape remains read/import evidence
  only; an exact established generic legacy normalization route may supply its own transient envelope/identity
  view when all registered original candidates/header/cursor proofs exist. No new event-specific v1-to-v2
  payload converter is defined; unsupported original semantics stay explicitly unresolved instead of default-filled
  or rewritten as v2. Source bytes are never changed on read. D-R06 predicates remain historical diagnostic
  checks; their actions, role/tier requirements and state transitions are not executed.


  Same exact source identity/digest yields the same historical observation. Conflicting source bytes,
  goal/project joins or digest evidence fail interpretation without selecting a winner. Every attempted
  current append is independently rejected before dedupe or CAS. Unknown schema, malformed frame, absent
  canonical source, unsupported reader, stale publication or unresolved receipt/predecessor facts return
  invalid/unavailable or explicitly unresolved historical validation; they grant no current lifecycle
  truth. Read refusal does not instruct the adapter to write quarantine records. Existing Storage recovery
  owns any separate integrity handling.


  Historical source keeps `RP-AUTHORITY-INDEFINITE@1.0.0`, with its original backup/hold/canonical authority.
  Existing lookup rows keep `RP-EVENT-INDEX-SOURCE@1.0.0`; no family-local timer is introduced. The adapter
  retains nothing independently. Canonical goal receipts remain mandatory-backup/non-rebuildable and cannot
  be regenerated from this event or index. Unavailable required evidence remains unavailable; original
  historical meaning is not converted to a current block on a retired verifier. Existing actual recovery/continuation
  owners still fence mutation and false completion when canonical authority is unknown. Survivor-projection
  degraded quality/provenance remains valid under GRS-042, without emitting this event or writing a fifth
  Goal state.


  Existing deletion/tombstone/access and hold rules apply to source and original refs. Indefinite audit
  custody does not unhide deleted Goal/thread content or grant dereference permission. A committed unavailable/deleted
  source translation returns truthful unavailable; no missing record is reconstructed. Reject unhandled
  secrets under the existing family rule and use no new redaction transform; do not expose secret-bearing
  original bytes as a successful view. Unsupported adapter/envelope/payload/index schema or explicit withdrawal
  stops this exact family interpretation, preserves original custody under its owners and admits no fallback
  current producer, projection, alias or event. These definitions provide contract depth, not native reader,
  storage, recovery, permission, lifecycle or governance proof.


  Historical eligibility additionally requires actual retained source-generation/compatibility custody
  establishing the original applicable contract; an invalid current append does not become lawful history
  merely by already being in seglog. No claim is made that a historical v2 instance exists. Timestamps
  or the current schema promotion cannot supply the missing original admission proof.


  At this source snapshot, no concrete generic EventRecord-index checkpoint family/schema is materialized:
  checkpoint_ref is only a reference. The positive lookup path therefore remains blocked on the separately
  owned shared checkpoint/publication prerequisite. Fail-closed text is not an operating positive path
  or completed reader-depth evidence. This unit does not define that missing shared checkpoint; root must
  integrate the independently reviewed exact shared authority before admitting the reader.'
acceptance_criteria:
- Exact four-field project/goal/event/sequence lookup validates existing generic index key/value and complete
  canonical source frame, payload/hash and goal joins.
- Actual generic checkpoint/coverage, CURRENT, generation/recovery/survivor and committed translation
  proof are required; no sibling or nonempty-reference substitute is accepted.
- Changed publication before response invalidates the answer; index/source missing does not trigger adapter
  writes or guessed offsets.
- Family checkpoint is none_required because no durable family effect exists; repeated/interrupted reads
  leave all Goal/projection/receipt/index/checkpoint state unchanged.
- Genuine original source/backup custody establishes history; timestamps, source absence, imported JSON
  and default-filled migration data do not.
- Unchanged v2 schema and supported original v1 route are reader-only; no new v1-to-v2 payload upgrader
  or active D-R06 transition exists.
- Historical source and canonical receipt custody/holds retain existing policies; lookup rows are source-coupled
  and no new family/timer/launch tier is created.
- Projection degraded quality and recovery fences remain with existing owners; reading historical data
  cannot create a fifth Goal state, recover a receipt or certify success.
- Deletion/permission/secret/unsupported-version/withdrawal cases preserve original bytes and return truthful
  unavailable without action, hold, notification or writer effects.
- Positive reader admission remains blocked until the actual generic EventRecord-index checkpoint/publication
  contract is separately materialized and bound; a required reference alone is not operating-path proof.
preserved_exact_tokens:
- storage.goal_degraded_history_read.v1
- none_required
- event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}
- pm.storage_value.event_record_index.v2
- RP-EVENT-INDEX-SOURCE
- RP-AUTHORITY-INDEFINITE
- projector_replay_only
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-061, ContractName:Plans/Contracts_V0.md#CV-335, ContractName:Plans/storage-plan.md#SP-277, ContractName:Plans/Decision_Log.md#DL-039

### SP-280 - Exact historical Goal scheduling contract

```yaml
unit_type: requirement
status: accepted
gui_related: false
gui_classification_reason: Defines exact event admission and historical source interpretation without
  adding a GUI or changing current Scheduling controls.
split_recommended: false
unblocks: []
reasoning_tier: high
context_scope: goal_scheduled_exact_family_historical_contract
validation_surfaces:
- Plans/goal_scheduled_history_contract_fixtures.json
- Plans/event_payloads/goal_runtime/goal_scheduled.schema.json
- Plans/goal_runtime_events.schema.json
- Plans/storage_value_registry.json
- python3 scripts/pm-plan-index.py validate
- Native exact-family historical-read and scheduling action-spy oracles remain NOT_RUN.
node_compile_hint:
  mode: goal_scheduled_historical_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-039
- Plans/Decision_Log.md#DL-045
- Plans/Goal_Runtime_System.md#GRS-048
- Plans/Goal_Runtime_System.md#GRS-050
- Plans/Goal_Runtime_System.md#GRS-051
- Plans/Scheduling_and_Quota_Resume.md
- EA-UND-0011-GOAL:D-R11
source_atom_ids: []
negative_constraints:
- No sibling disposition, registry/schema/retention mutation, alias, current producer, scheduled Goal
  state, Goal budget, child/phase/role, or GoalRun/To-Do/Plan conversion.
- No native/readiness/seal proof, canonical receipt reconstruction, timer/queue/dispatch/Usage/approval/hold/epoch
  effect, or shared-checkpoint waiver.
owner_hints:
- Plans/Goal_Runtime_System.md
- Plans/Scheduling_and_Quota_Resume.md
- Plans/storage-plan.md
- Plans/Contracts_V0.md
plan_unit_id: SP-280
owner_doc: Plans/storage-plan.md
depends_on:
- GRS-062
- CV-336
- SP-235
- SP-236
- SP-237
- SP-241
risk_class: historical_scheduling_source_and_checkpoint_authority
implementation_surfaces:
- Plans/storage-plan.md
canonical_text: 'Define NEW read-adapter binding `storage.goal_scheduled_history_read.v1`, version `1.0.0`,
  for the existing Storage/Goal/Runtime Artifacts validated EventRecord inspection path. The ID is a new
  explicit technical definition, not a claim of a previously registered adapter. It serves exactly the
  already registered `event-family-goal-scheduled@2.0.0` under GRS-062/CV-336''s historical-only disposition.
  There is no current producer, family projector, new physical value, critical/MVP dependency, new policy
  or active lifecycle effect. The existing v2 payload and immutable legacy aggregate are unchanged. The
  child-status and degraded adapters do not supply authority for this row. Each exact-family binding consumes
  the independently owned generic index on its own constraints.


  The bounded lookup selector contains exactly project_id, goal_id, event_id and sequence_id. Normal authenticated
  project/historical-read access applies; a live Goal object need not be fabricated for a retained historical
  event. Resolve the existing `event_record_index` family by ID, schema `pm.storage_value.event_record_index.v2@2.0.0`,
  using key `event_record_index.v2:{scope_partition}:{sequence_id_20}:{event_id}`. Project partition is
  exactly `project~{base64url_no_pad(UTF8(project_id))}` and sequence formatting follows the existing
  exact EventRecord integer domain and twenty-digit unsigned decimal padding. Do not round through floating
  point, substitute selected project, infer the event from its name or omit event ID. Validate the closed
  current index schema and exact key/value/project/sequence/event/family joins, then validate source payload
  goal_id against the selector.


  Read a consistent CURRENT-selected committed index/source publication. Resolve the index publication_locator''s
  manifest_generation, recovery_epoch, survivor_prefix_sha256 and checkpoint_ref to the independently
  owned generic index publication and actual checkpoint. Prove complete generic index coverage includes
  the exact requested sequence in the surviving source set; a nonempty reference, maximum sequence, family-filtered
  checkpoint, application dedupe checkpoint or another event''s cursor is not coverage proof. If the actual
  generic checkpoint cannot be resolved, return unavailable instead of inventing a checkpoint contract.
  This family owns no full-range scan or catch-up. It relies on verified generic full-range publication
  and validates this exact complete source frame.


  The source cursor is the full tuple segment_generation, segment_name, byte_offset and sequence_id from
  the validated row. Check current generation, complete frame bounds/CRC, durable watermark, original
  event identity, payload hash and existing producer-semantic digest with their actual owner algorithms.
  The index contains lookup metadata, not event or receipt authority. Compaction translations must resolve
  an actual committed translation manifest and preserve exact source identity; a guessed retired offset
  is forbidden. Revalidate CURRENT/publication selection before releasing the complete in-memory answer.
  If recovery/generation changed, discard the answer and perform a fresh bounded read. A missing index
  does not cause this adapter to write/rebuild; only the independent generic recovery owner may do so
  under its contract.


  Family checkpoint disposition is explicitly `none_required`. The adapter owns zero durable state: no
  projection row, progress/cursor value, acknowledgement, family idempotency record, receipt, checkpoint,
  cache materialization, hold or index write. Repeated/interrupted lookups leave no owned effect. The
  exact selector is a lookup request, not a resumable cursor. The sole success boundary is release of
  one fully validated in-memory historical answer; there is no atomic family write transaction or checkpoint
  advance. The independently required generic checkpoint proof is not waived by none_required. No child-status/run.started/Goal-state
  checkpoint is borrowed.


  Genuine historical eligibility is established by actual retained immutable seglog source or its authenticated
  byte/identity-preserving restoration from an existing verified backup generation with the original source/restore
  custody. A timestamp, schema promotion date, imported caller JSON, migration marker or absent current
  writer does not prove history. A record must validate under its actual supported original schema and
  source provenance. Legacy aggregate `pm.goal_runtime_events.schema.v1` shape remains read/import evidence
  only; an exact established generic legacy normalization route may supply its own transient envelope/identity
  view when all registered original candidates/header/cursor proofs exist. No new event-specific v1-to-v2
  payload converter is defined; unsupported original semantics stay explicitly unresolved instead of default-filled
  or rewritten as v2. Source bytes are never changed on read. D-R11 predicates remain historical diagnostic
  checks; its next_action, queue/budget eligibility and scheduled-state transition are not executed.


  Same exact source identity/digest yields the same historical observation. Conflicting source bytes,
  goal/project joins or digest evidence fail interpretation without selecting a winner. Every attempted
  current append is independently rejected before dedupe or CAS. Unknown schema, malformed frame, absent
  canonical source, unsupported reader, stale publication or unresolved receipt/predecessor facts return
  invalid/unavailable or explicitly unresolved historical validation; they grant no current lifecycle
  truth. Read refusal does not instruct the adapter to write quarantine records. Existing Storage recovery
  owns any separate integrity handling.


  Historical source keeps `RP-AUTHORITY-INDEFINITE@1.0.0`, with its original backup/hold/canonical authority.
  Existing lookup rows keep `RP-EVENT-INDEX-SOURCE@1.0.0`; no family-local timer is introduced. The adapter
  retains nothing independently. Canonical goal receipts remain mandatory-backup/non-rebuildable and cannot
  be regenerated from this event or index. Unavailable required evidence remains unavailable; original
  historical meaning is not converted to a new Goal budget requirement or permission to resume manually
  stopped work. Existing actual recovery/continuation owners still fence mutation and false completion
  when canonical authority is unknown. Survivor-projection degraded quality/provenance remains valid under
  GRS-042 and its exact-event qualifications, without writing a fifth Goal state. Reading this event cannot
  bypass Scheduling user_stop_epoch, consent, eligibility or dispatch-time revalidation.


  Existing deletion/tombstone/access and hold rules apply to source and original refs. Indefinite audit
  custody does not unhide deleted Goal/thread content or grant dereference permission. A committed unavailable/deleted
  source translation returns truthful unavailable; no missing record is reconstructed. Reject unhandled
  secrets under the existing family rule and use no new redaction transform; do not expose secret-bearing
  original bytes as a successful view. Unsupported adapter/envelope/payload/index schema or explicit withdrawal
  stops this exact family interpretation, preserves original custody under its owners and admits no fallback
  current producer, projection, alias or event. These definitions provide contract depth, not native reader,
  storage, recovery, permission, lifecycle or governance proof.


  Historical eligibility additionally requires actual retained source-generation/compatibility custody
  establishing the original applicable contract; an invalid current append does not become lawful history
  merely by already being in seglog. No claim is made that a historical v2 instance exists. Timestamps
  or the current schema promotion cannot supply the missing original admission proof.


  The positive lookup path remains blocked on the independently owned generic EventRecord-index checkpoint/publication
  contract and its concrete schema, key, complete source coverage and currentness joins. A nonempty checkpoint_ref
  or refusal path does not establish an operating reader. Until that shared authority and this exact family
  adoption are materialized and reviewed, consumer/checkpoint/replay depth remains partial and historical
  read success is unavailable. This unit defines no substitute shared checkpoint. Historical dispatch/await
  values remain data only: the adapter owns no timer, queue enqueue, provider/tool call, quota charge,
  stop-epoch clearing, schedule or Goal mutation.'
acceptance_criteria:
- Four-field project/goal/event/sequence selector joins actual generic index key/value, canonical source
  frame and payload identity.
- Actual generic checkpoint/coverage and CURRENT/survivor/manifest/translation joins are required; unresolved
  SP278 leaves operating path blocked.
- Family none_required checkpoint follows zero durable effects, not waiver of shared proof; stale publication
  discards complete answer before release.
- Original supported source/backup custody establishes history; timestamp/schema-valid JSON and fabricated
  import cannot establish original semantics.
- Read never schedules, dispatches, charges, approves, clears stop epoch, writes receipt or creates a
  Goal projection.
- Unchanged authority/index retention and canonical receipt backup rules, deletion/permission/secret/version/withdrawal
  refusal preserve source without current lifecycle effects.
preserved_exact_tokens:
- goal.scheduled
- pm.goal_runtime_event.goal_scheduled.schema.v2
- D-R11
- active|paused|blocked|completed
- user_stop_epoch
- RP-AUTHORITY-INDEFINITE
- RP-EVENT-INDEX-SOURCE
- none_required
- storage.goal_scheduled_history_read.v1
```

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-062, ContractName:Plans/Contracts_V0.md#CV-336, ContractName:Plans/storage-plan.md#SP-280, ContractName:Plans/Scheduling_and_Quota_Resume.md, ContractName:Plans/Decision_Log.md#DL-045
