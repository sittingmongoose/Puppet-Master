# Shard 067: Registered restore-point application, corruption and recovery-unavailable event depth (PNC-019 S3, 2026-11-14)

Source: `Plans/storage-plan.md`

Source lines: L27868-L28074

Source SHA256: `f9aeabf51a464afd2ff3660a2ecb2336a589dcf2b931c2c97868000898094b29`

---

## Registered restore-point application, corruption and recovery-unavailable event depth (PNC-019 S3, 2026-11-14)

Newly authored owner contracts under DL-045 for three registered families whose 2026-09-24 depth grades left producer, identity, replay, custody, consumer and withdrawal cells open. They follow the restore-point deletion and expiry contracts above (the rpd_ and rpe_ recipes, SP-286 adoption, the passive history reader) and change no command, argument, payload field, lifecycle edge, reason precedence or retention value. They admit nothing new; native execution remains NOT_RUN.

### SP-2202 - restore_point.applied producer, identity, result custody, consumer and withdrawal

**Producer.** `cmd.chat.branch_from_restore` with its five existing domain arguments, through `handlers::chat::branch_from_restore` (ACD-086, UCC-126), is the only route; the existing UICommand envelope supplies `idempotency_key`. The sole emitter is that handler's commit step, `assistant_chat.restore_point_application.v1`. The order is exact: (1) the global Storage gate, then exact project, point, expected hash, status, permission, writer posture and the complete protecting-ref enumeration, revalidated in the same serialized restore-point admission domain as holds, retirement, deletion and expiry; (2) one redb transaction that reserves `application_id`, writes `restore_point_application_commit` in state `pending` with the normalized request, its digest, the preflight, and the reserved `new_thread_id` and `new_branch_id`; a refusal or failure decided here is written as that row's terminal `refused` or `failed` result in the same transaction, with no target IDs and no event; (3) Chat's existing thread and conversation-branch creation materializes the frozen boundary under exactly the reserved IDs, so a resumed step adopts its own creation and can never make a second branch; (4) one redb transaction that records the materialization, adds the descendant ref `application:<application_id>` to the point's protecting refs, sets the row's result to `branched` and stores the frozen EventRecord as a durable pending event obligation; (5) the Case L-2 append as `durability_class=barrier` through the SP-286/CV-339 shared append owner; (6) SP-286 first-AppendReceipt custody through `storage.first_append_receipt.resolve.v2` and `storage.first_append_receipt.resolve_full_value.v1`; (7) the command result, published only after the receipt. A crash before (4) resumes from the row and the reserved IDs; a crash after (4) resolves the obligation or the original receipt. Source thread, branch, worktree, files, Git index, queue and safe points are never touched (ACD-086).

**Identity.** `application_id` is `rpa_` plus lowercase SHA-256 of the concatenation of each UTF-8 value preceded by its unsigned 64-bit big-endian byte length: `restore_point.applied/apply/v1`, `project_id`, the original envelope `idempotency_key`. `event_id` is `er_rpa_` plus the same digest, and the EventRecord `idempotency_key` is `application_id`. The same key with a different normalized request digest (command ID, the five domain arguments, key, authenticated actor) fails closed. Scope is `project_only`; the partition is `project~` plus unpadded base64url of the exact UTF-8 `project_id`, and envelope `project_id` equals payload `project_id`. Envelope `thread_id` is `new_thread_id`, the first of the registry row's two thread identity pointers; `source_thread_ref` stays in the payload. Run and attempt are null. A deliberate second branch is a new key and therefore a new `application_id`.

**Replay and result custody.** `restore_point_application_commit` is the recorded result that ACD-086 replays: key `restore_point_application_commit.v1:{scope_partition}:{application_id}`, schema `Plans/restore_point_application_corruption_contracts.schema.json#/$defs/application_commit`, `redb_and_seglog`, canonical MessagePack, mandatory backup, `restore_backup_then_replay`. Replay of the same key and digest returns the row's recorded result and, for `branched`, the same target IDs and original first receipt, with no second branch or event. `replay_policy=dedupe_by_idempotency_key`; `projector_replay_only` is refused as `replay_only_not_appendable` before any effect; the semantic comparison excludes Storage-assigned `sequence_id`, `observed_at_utc` and `persisted_at_utc`; a different digest is `idempotency_conflict`; unavailable dedupe proof is `dedupe_unavailable`.

**Custody and redaction.** The row and the payload hold IDs, hashes and refs only; no message body, file body, secret or stream state. Retention is `RP-AUTHORITY-INDEFINITE@1.0.0`, as for the sibling command results `restore_point_create_result` and `restore_point_delete_result` under Case L-3's receipt class. The `application:<application_id>` ref is the SP-269 descendant custody that protects the point; it is released only by the existing owner release evidence and never by age. Every read of the event or row rechecks viewer access, Project scope, deletion state and source visibility; a deleted or hidden source thread is never disclosed through the event. Restore keeps the row with the point and the new thread together or reports the application unavailable; it never re-materializes a branch.

**Consumer and checkpoint.** The existing passive `reader.chat.restore_point_history@2.0.0` is explicitly adopted for this family here, as the deletion contract adopted it for `restore_point.deleted`; it gives the lineage that ACD keeps queryable. It reads through SP-278 `reader.storage.event_record_index@1.0.0` over the generic checkpoint `event_record_index_checkpoint.v1:{storage_instance_id}`, adopts DL-076's nine-field durable read token, stores no family checkpoint or persisted `redb_snapshot_id`, and returns unavailable rather than an empty history when coverage does not verify. No other component consumes the event; the protecting ref is read from canonical custody.

**Compatibility and withdrawal.** Exact family, version and schema dispatch; no aliases. Withdrawal sets a writer cutoff on `assistant_chat.restore_point_application.v1` (the command then refuses before step 2), drains or fences pending rows through SP-286, keeps every row, ref and receipt under its policy, and fences this family's use of `reader.chat.restore_point_history@2.0.0` and its tokens. A historical reader reads an original by its write-time recipe and never compares it with today's point status. Withdrawal never deletes a branch or releases a protecting ref.

```yaml
plan_unit_id: SP-2202
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: restore_point.applied@2.0.0 has an exact emitter (assistant_chat.restore_point_application.v1), a
  reserve-then-materialize-then-append order under SP-286, the rpa_ identity, restore_point_application_commit result
  custody, the adopted passive history reader and a writer-cutoff withdrawal protocol.
gui_related: false
split_recommended: false
depends_on:
- SP-242
- SP-269
- SP-278
- SP-286
- CV-339
- DL-045
- DL-076
unblocks: []
acceptance_criteria:
- Only branched appends restore_point.applied, after the reserved target IDs are materialized and the commit row records them.
- application_id, event_id and the EventRecord idempotency_key follow the rpa_ recipe; envelope thread_id is new_thread_id.
- Replay returns the row's recorded result and target IDs with no second branch or event; projector_replay_only is refused.
- reader.chat.restore_point_history@2.0.0 is adopted through SP-278 with the DL-076 nine-field token.
validation_surfaces:
- Plans/Automated_Testing_System.md#ATS-2202
- Plans/restore_point_application_corruption_contracts.schema.json
risk_class: duplicate_branch_or_lost_application_result
reasoning_tier: high
context_scope: event_authority_pnc019_s3b
implementation_surfaces:
- Plans/storage-plan.md
- Plans/storage_value_registry.json
- Plans/restore_point_application_corruption_contracts.schema.json
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/assistant-chat-design.md#ACD-086
preserved_exact_tokens:
- restore_point.applied
- assistant_chat.restore_point_application.v1
- restore_point_application_commit
- rpa_
negative_constraints:
- No new command, argument, payload field, lifecycle transition, admission or native proof.
owner_hints:
- Plans/storage-plan.md
```

### SP-2203 - restore_point.corrupt producer, identity, transition order, custody, consumer and withdrawal

**Producer.** The sole emitter is `assistant_chat.restore_point_corruption.v1`, the Chat restore-point lifecycle owner's corruption step. Any reader that verifies a point's record or referenced material (branch-from-restore admission, deletion and expiry preflight, the SP-281 and SP-269 readers) only reports a candidate finding; it never appends or changes status. The order is exact: (1) FileSafe attests the immutable evidence under its Known-37 corruption evidence section; (2) in the serialized restore-point admission domain, the owner re-reads the actual current point and applies the fixed reason precedence of the ACD Known-37 completion section; missing record or material and indeterminate I/O stop here; (3) one redb transaction writes `restore_point_corruption_commit` with the reason, the evidence and the frozen EventRecord as a durable pending obligation, and only if no deletion or expiry commit for the point exists; (4) the Case L-2 append as `durability_class=barrier` through the SP-286/CV-339 shared append owner; (5) first-AppendReceipt custody through `storage.first_append_receipt.resolve.v2`; (6) publication of the unavailable reason. Because the record bytes themselves may be the corrupt part, the corrupt status lives in `restore_point_corruption_commit`, not in a rewrite of the record; readers treat a point with a settled corruption commit as `corrupt`.

**Transition order.** The only edge is `available -> corrupt`. Corruption, deletion (B1) and expiry (E1) admit in the same serialized domain, and each commit refuses when another terminal commit for the point exists, so exactly one terminal status wins. A corrupt point is never deleted, expired or branched afterwards; its retention follows the point's own release evidence.

**Identity.** One point becomes corrupt at most once. `corruption_id` is `rpx_` plus lowercase SHA-256 of the length-prefixed UTF-8 values `restore_point.corrupt/corrupt/v1`, `project_id`, `restore_point_id`. `event_id` is `er_rpx_` plus the same digest, and the EventRecord `idempotency_key` is `corruption_id`. A re-detection resolves to the existing commit and mints nothing; the reason fixed by the first commit stands. Scope is `project_only` with the `project~` partition and envelope Project equality; envelope `thread_id` is the point's `source_thread_id` when the record is readable and null otherwise; run and attempt are null.

**Replay.** `replay_policy=dedupe_by_idempotency_key`; `projector_replay_only` is refused as `replay_only_not_appendable`; Storage-assigned fields are excluded from the semantic comparison; same identity and digest returns the original receipt; a different digest is `idempotency_conflict`; unavailable dedupe proof is `dedupe_unavailable`. Recovery resolves the pending obligation or the original receipt and never re-runs detection against a newer state.

**Custody and redaction.** `restore_point_corruption_commit` (key `restore_point_corruption_commit.v1:{scope_partition}:{corruption_id}`, schema `Plans/restore_point_application_corruption_contracts.schema.json#/$defs/corruption_commit`, `redb_and_seglog`, mandatory backup, `restore_backup_then_replay`) holds the FileSafe evidence as refs, lowercase SHA-256 values and lengths only, never record bodies, snapshot bytes, raw local paths or secrets. Retention is `RP-RESTOREPOINT-90D-AFTER-RELEASE@1.0.0`, the policy the registry binds to every `restore_point.*` row and that `restore_point_deletion_commit` uses. Every read rechecks viewer access, Project scope and deletion state. Restore keeps the commit with the point or reports the status unavailable; it never turns a corrupt point back to available.

**Consumer and checkpoint.** `reader.chat.restore_point_history@2.0.0` is explicitly adopted for this family exactly as SP-2202 adopts it (SP-278, generic checkpoint, DL-076 nine-field token, no family checkpoint). The SP-269 summary records a corrupt terminal status from the commit, not from the event, and is not an event consumer.

**Compatibility and withdrawal.** The v2 writer and the reader-only v1 with `MIG-RESTORE-POINT-CORRUPT-PAYLOAD-001@1.0.0` stay as written. Withdrawal of v2 sets a writer cutoff on `assistant_chat.restore_point_corruption.v1`, drains or fences pending commits through SP-286, keeps commits and evidence under their policy, and fences this family's history reading and its tokens. A withdrawn reader is fenced for historical events too.

```yaml
plan_unit_id: SP-2203
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: restore_point.corrupt@2.0.0 has an exact emitter (assistant_chat.restore_point_corruption.v1), an
  attest-then-commit-then-append order serialized with deletion and expiry, the one-per-point rpx_ identity,
  restore_point_corruption_commit custody, the adopted passive history reader and a writer-cutoff withdrawal protocol.
gui_related: false
split_recommended: false
depends_on:
- SP-242
- SP-269
- SP-278
- SP-285
- SP-286
- CV-339
- DL-045
- DL-076
unblocks: []
acceptance_criteria:
- Readers only report findings; only assistant_chat.restore_point_corruption.v1 commits and appends the corrupt status.
- Corruption, deletion and expiry serialize so exactly one terminal commit exists per point.
- corruption_id, event_id and idempotency_key follow the rpx_ recipe; re-detection mints nothing.
- Evidence is refs, hashes and lengths only, kept in restore_point_corruption_commit under the restore-point policy.
validation_surfaces:
- Plans/Automated_Testing_System.md#ATS-2203
- Plans/restore_point_application_corruption_contracts.schema.json
risk_class: restore_point_terminal_status_race
reasoning_tier: high
context_scope: event_authority_pnc019_s3b
implementation_surfaces:
- Plans/storage-plan.md
- Plans/storage_value_registry.json
- Plans/restore_point_application_corruption_contracts.schema.json
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- Plans/FileSafe.md
preserved_exact_tokens:
- restore_point.corrupt
- assistant_chat.restore_point_corruption.v1
- restore_point_corruption_commit
- rpx_
negative_constraints:
- No new reason, evidence kind, lifecycle edge, admission or native proof.
owner_hints:
- Plans/storage-plan.md
```

### SP-2204 - safe_point.recovery_unavailable producer, establishing receipt, identity, custody, consumer and withdrawal

**Producer.** The sole emitter is `filesafe.recovery_unavailable.durability_unit.v1`, the "FileSafe blocked-episode durability unit" that the `recovery_anchor_record` row names as producer. Executor supplies the episode facts (run, node, attempt, blocked sequence) and the admitted action array form under the Executor Known-37 admission section; it never appends this family. The order is exact: (1) FileSafe classifies one of the five reasons and proves `preserved_local_work=true`; (2) one redb transaction writes the blocked episode, `recovery_anchor_record` (state set, with `set_event_ref` naming this event's reserved `event_id`), the holds and the action list, and stores the frozen EventRecord as a durable pending event obligation; protection starts at this commit; (3) the Case L-2 append as `durability_class=barrier` through the SP-286/CV-339 shared append owner; (4) first-AppendReceipt custody; (5) only then are the actions offered and the episode shown. A crash resumes the obligation or resolves the original receipt; it never releases the anchor, reclassifies the reason or re-runs FileSafe's checks against a newer state.

**Establishing receipt.** The "establishing receipt" of the durability unit is exactly this event's own SP-286 first AppendReceipt. The payload `receipt_ref` is its custody key `event_append_receipt_custody.v1:{storage_instance_id}:{event_id_sha256}` for this event's own `event_id`, known before the append because the identity is reserved in step (2). The unit is established when that receipt resolves. `recovery_unavailable_resolution_receipt` stays the sole resolution receipt family and is not the establishing receipt.

**Identity.** One blocked episode yields one event. The owner component is the UTF-8 string `safe_point.recovery_unavailable:` + `anchor_id`. `event_id` is `er_sru_` plus lowercase SHA-256 of the length-prefixed UTF-8 values `safe_point.recovery_unavailable/establish/v1`, `project_id`, `anchor_id`, and the EventRecord `idempotency_key` is `sru_` plus the same digest. `anchor_id` is the anchor record's existing identity; a re-detection of the same episode resolves to the existing anchor and mints nothing. Envelope scope is `project_only` with the `project~` partition; envelope run and node equal the payload's; envelope attempt is null before an attempt and the exact prior attempt after one (Executor Known-37 admission).

**Replay.** `replay_policy=dedupe_by_idempotency_key`; `projector_replay_only` is refused as `replay_only_not_appendable`; Storage-assigned fields are excluded from the semantic comparison; same identity and digest returns the original receipt; a different digest is `idempotency_conflict`; unavailable dedupe proof is `dedupe_unavailable` with zero effect.

**Custody and redaction.** The anchor and the resolution receipts keep their existing custody (indefinite, `canonical_dual_homed`, mandatory backup, `restore_backup_then_replay`). Every disclosure of the event or the anchor to Run Graph, Runtime Artifacts, the Chat recovery UI or Executor retry admission rechecks viewer access, Project scope and the run's deletion state at read time; a deleted run's episode is shown only as unavailable. Refs only; no snapshot bytes, local paths or secrets.

**Consumer and checkpoint.** The recovery UI, Run Graph actions, the Runtime Artifacts projection and Executor retry admission read canonical anchor state (`recovery_anchor_record`, the resolution receipts) and the current ordered `allowed_action_ids`, not an event checkpoint; none keeps an event cursor. The only event consumer is `reader.storage.recovery_unavailable_history@1.0.0`, a passive on-demand history view that adopts SP-278 by name, reads through `reader.storage.event_record_index@1.0.0` over the generic checkpoint `event_record_index_checkpoint.v1:{storage_instance_id}`, adopts DL-076's nine-field durable token, stores no checkpoint of its own and returns unavailable rather than an empty history when coverage does not verify.

**Compatibility and withdrawal.** The v2 writer, the v1 reader and `MIG-SAFE-POINT-RECOVERY-UNAVAILABLE-PAYLOAD-001@1.0.0` stay as written. Withdrawal of v2 sets a writer cutoff on the durability-unit writer, drains or fences pending obligations through SP-286, keeps every anchor, hold and receipt (withdrawal never releases an anchor), and fences `reader.storage.recovery_unavailable_history@1.0.0` and its tokens.

Oracle plans: ATS-2202, ATS-2203 and ATS-2204.

```yaml
plan_unit_id: SP-2204
unit_type: storage_contract
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: safe_point.recovery_unavailable@2.0.0 has an exact emitter (filesafe.recovery_unavailable.durability_unit.v1),
  a commit-then-append order under SP-286 in which the event's own first AppendReceipt is the establishing receipt,
  the per-anchor sru_ identity, read-time disclosure checks, canonical-state consumers with SP-278 history and a
  writer-cutoff withdrawal protocol.
gui_related: false
split_recommended: false
depends_on:
- SP-237
- SP-278
- SP-286
- CV-339
- DL-045
- DL-076
unblocks: []
acceptance_criteria:
- Executor supplies facts; only the FileSafe durability-unit writer appends the family, after the anchor commit.
- payload receipt_ref is the event's own SP-286 custody key; the unit is established when that receipt resolves.
- One anchor yields one event identity; re-detection mints nothing; projector_replay_only is refused.
- Consumers read canonical anchor state; history reads adopt SP-278 with the DL-076 nine-field token.
validation_surfaces:
- Plans/Automated_Testing_System.md#ATS-2204
risk_class: recovery_anchor_event_identity_drift
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
- Plans/FileSafe.md
- Plans/Executor_Protocol.md
preserved_exact_tokens:
- safe_point.recovery_unavailable
- filesafe.recovery_unavailable.durability_unit.v1
- recovery_unavailable_resolution_receipt
negative_constraints:
- No new reason, action, receipt family, release reason, admission or native proof; withdrawal never releases an anchor.
owner_hints:
- Plans/storage-plan.md
```

ContractRef: ContractName:Plans/storage-plan.md#SP-242, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/assistant-chat-design.md#ACD-086, ContractName:Plans/FileSafe.md
