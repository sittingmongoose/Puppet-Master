# Shard 056: Restore-point retention summary contract

Source: `Plans/storage-plan.md`

Source lines: L19768-L19957

Source SHA256: `7d1d0bb2f109eb645d674e7848036caf8fc70e5c1ec095b730787e8ac16f5739`

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
