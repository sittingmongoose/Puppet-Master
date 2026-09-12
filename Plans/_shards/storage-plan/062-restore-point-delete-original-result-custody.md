# Shard 062: Restore-point delete original-result custody

Source: `Plans/storage-plan.md`

Source lines: L22025-L22115

Source SHA256: `716ae8fd1126a7b7ff901d65dfc0730c645783b3471f938df5c2191b9deefa21`

---

## Restore-point delete original-result custody

Point/event/deletion companion use existing RP-RESTOREPOINT-90D-AFTER-RELEASE@1.0.0 unchanged: inclusive owner-proven reference_release+7,776,000 seconds, max2,048 full logical points per project, oldest eligible only, every owner hold/ref overrides. Deletion timestamp is not release. Pending custody never retires. SP-269 summary and exact retired-key proof are committed atomically before removal; its complete summary contract is an explicit shared prerequisite. No 24-hour thread hide, 30-day deletion backup, deletion-time TTL or independent companion purge is borrowed.

UCC Case L expressly requires original owner result for the app-root lifetime. SP-272 materializes only the cmd.chat.delete_restore_point typed result custody needed by that existing requirement, mapped to existing RP-AUTHORITY-INDEFINITE@1.0.0 (creation anchor, retain indefinitely, no TTL/count/byte expiry, fail-closed overflow). This is separate from RP90 point/operation and summary. Store only original request/idempotency digest, compact identity/custody references and closed original typed result, never transcript/source capture. It is canonical nonrebuildable; coherent backup/restore must preserve it. After source retirement it still returns exact original result for matching request; it never reconstructs point bytes or performs deletion again. Conflicting digest fails closed. Missing required native result custody fences and discloses loss rather than recreating operation.

A durable owner-admitted refusal or failed-before-B1 result has closed outcome/project/point/reason/effect=none. Its commit is the owner's durable admission under global writer authority; if that commit fails, do not claim a durable terminal result. Pending result has no terminal result/time and requires its native operation. Deleted result requires matching operation/event/digest and original success result. State/result outcome and reason must exactly match. Pre-global-gate rejections remain non-durable, with no hidden writer exception. Unknown terminal effect after B1 remains reconciliation/recovery_required.

### Original shared outcome custody — SIR-045

The exact existing SIR-owned CommandOutcomeRecord has no separately admitted app-root physical family; thread_command_outbox_record's RP-DELIVERY-365D cannot preserve it indefinitely. The delete result family therefore carries an immutable original_dispatch_custody capsule as narrow custody of the ORIGINAL authenticated record, not a peer outcome producer. Its closed schema references the exact existing full_thread_runtime_contracts CommandOutcomeRecord and current ui_command_response schema; it retains the original normalized request identity/payload digest/idempotency/target generation/dispatch frame, actual original outcome/ref, original response snapshot, capture authority/time and content hashes. A successful result separately retains the actual original barrier/synced AppendReceipt bytes with exact event identity; pending and no-effect results have null original append receipt. This preserves receipt custody after the point/native operation/event retires. B3 and owner-admitted terminal no-effect refusal/failure commit that complete custody with the result before returning it. Pending has no terminal capsule. Failure to capture the actual original outcome is not permission to synthesize it or expose success; reconcile under its existing SIR owner. No deferred global receipt store is borrowed.

The separately closed typed result has its own schema identity and hash. CommandOutcomeRecord.owner_result_sha256 hashes ONLY that typed result, excluding custody container/outcome/response; container digests hash the captured original records, avoiding a recursive outcome-to-result-to-outcome hash. Exact command, request, instance, operation/topology, key, payload digest, generation, frame, outcome/result/error/receipt and original dispatch joins remain mandatory. Retained normalized request and original response preserve original error/status/request/dispatch semantics after transient sources expire. No current topology, availability, error or response is reconstructed in place of original values. The resolver may return that authentic retained original record through the same SIR semantic owner. SIR-045 is a narrow delete-only custody cross-reference; SP-272 owns bytes and lifetime.

CV-333 remains the sole UICommandResponse contract: this result is separately typed owner_result, not a second Full Thread CommandOutcomeRecord. Existing Full Thread outcome owns request/command-instance/operation/topology/target-generation and dispatch-frame joins. Admission is conditional on actually resolving that existing owner contract; no fake topology or deferred peer store is invented. Terminal result ref/schema/hash is separately bound by the existing outcome; UI dispatcher maps exact original result and outcome to v2 response. Refused owner admission uses the existing rejected outcome mapping; failed is failed; deleted is succeeded; pending stays pending and unknown effects recovery_required. storage_read_only remains an owner reason in the existing closed UI error vocabulary, not a new error enum token. Replay preserves original request/instance/outcome/result/receipt/event identities, with the current dispatch wrapper marking replay and original_dispatch_id.

### Original request/outcome/result joins and safe logical references

The original deletion domain request is exactly the command ID, three existing arguments, original envelope key and authenticated actor. Its existing canonical JSON digest remains independent of the SIR normalized payload digest. Actual SIR payload bytes/normalization are resolved under SIR's owner and their digest is joined separately. Matching domain arguments do not permit a fabricated command instance, operation/topology, target generation, dispatch frame or authenticated actor.

Every original terminal result is checked as a complete typed value. Deleted results must equal the exact derived deletion/event identity, project/point/ref and original hash; they require actual SIR `succeeded`, CV-333 accepted/succeeded, no error, and exactly the original deleted event ref. They cannot accept `no_op`, a rejected response or a failed outcome even if all supplied result/outcome/response hashes are repaired. Owner-admitted refusal maps to rejected and failure to failed, with the original error/reason and no event/effect. Flat request/response operation and instance fields equal the full retained IdentityEnvelope. Exact original owner result schema/ref, outcome ref, owner receipt ref, payload hash, key, generation and frame relations are all joined. A same-frame acknowledgement has the actual same frame and offset zero. Pre-dispatch rejection remains non-durable and cannot fabricate an owner operation.

The physical result key contains `project~...`, but CV-333's existing `non_secret_ref` grammar does not admit `~`. Keep that physical key unchanged. Define the narrow delete-owner logical custody locator `restore-point-delete-result:{sha256_utf8(exact_physical_result_key)}`. Its `#/result` identifies the original typed result; `#/original_dispatch_custody/original_command_outcome` identifies the original SIR record. The resolver reads the actual authenticated result row, rederives its exact physical key from the retained scope/idempotency identity, hashes exact UTF-8 bytes with no normalization, and verifies the locator plus field pointer. This is not a physical key alias, second store, peer outcome, generic routing scheme or permission to guess a row from a digest. A collision/conflicting key or unresolved source fails closed.

RFC8785 hashes only the closed typed original result for `CommandOutcomeRecord.owner_result_sha256`, as required by CV-333. This result contains fixed ASCII member names and string/boolean values; no numeric serialization ambiguity arises. The original deletion request/frozen input/outcome-capture/response-capture digest recipe stays the exact canonical-JSON binding recipe: UTF-8, no BOM/whitespace, minimal JSON punctuation, fixed member ordering by scalar/UTF-8 lexicographic key order, native exact decimal integer encoding, no ASCII escaping of valid non-ASCII text, no Unicode normalization, and standard JSON string escapes. Its admitted values contain no floating point fields; surrogate/invalid UTF-8 input is rejected. It must not round integer identities through IEEE754 or impose an invented 53-bit cap. SP-278's MessagePack binding codec is used only for the new generic selection bindings. Existing producer, immutable capture, command, payload and registered canonical value-byte hash meanings are not replaced by that codec.

After lawful point/companion/event/source retirement, the canonical retained result and authentic SIR/dispatcher custody still supply the complete original normalized request, outcome, response and original receipt. Original-result replay requires current authenticated row resolution and applicable disclosure permissions; it does not re-require removed source/operation rows or rerun deletion. Native completion establishes the full original B1/B2/B3 predicates before publishing this custody. The source-aware read adapter is `Plans/restore_point_deleted_read_adapter.schema.json`; the exact persisted result is `Plans/restore_point_deleted_contracts.schema.json#/$defs/command_result_receipt`. Initial source authentication remains mandatory, but later SP-285 canonical retained-row resolution must not reacquire retired original normalized payload/dispatch bytes or B1/B2/B3/append-group controls. SIR remains the original outcome owner and current disclosure policy still gates replay.

### SP-272 — Restore-point delete original-result custody

```yaml
plan_unit_id: SP-272
unit_type: requirement
status: accepted
owner_doc: Plans/storage-plan.md
canonical_text: The restore_point_delete_result family preserves the delete command owner’s original typed
  result and delegated original SIR request/outcome/CV-333 response plus complete original append receipt
  for the existing app-root replay duty. Authentic retained-row resolution survives lawful RP90 source
  retirement and cannot execute deletion again. Original source authentication gates first capture; later
  SP-285 resolution uses authentic retained canonical rows and current disclosure policy without retired
  raw SIR/transaction/append controls.
  SP-285 pending recovery explicitly requires the installed SP-286 full-value resolver at terminal staging and final publication, authenticating the original complete event and actual v2 receipt custody before the complete owner-local guard; no dependent resolver intervenes before atomic terminal publication.
gui_related: false
gui_classification_reason: Defines backend custody, source validation and owner-result authority.
split_recommended: false
depends_on:
- SP-274
- CV-333
- DL-045
- SP-285
- SP-286
unblocks: []
acceptance_criteria:
- Exact physical result key and RP-AUTHORITY-INDEFINITE preserve app-root original result independently
  of RP90 point/operation custody and mandatory canonical backup.
- Pre-dispatch rejections remain non-durable; owner-admitted no-effect refusal/failure requires committed
  original custody, while pending has no terminal capsule.
- Deleted requires genuine succeeded/accepted original outcome and response with exact identity/topology/generation/frame/result/receipt/event
  joins.
- Owner-result hash covers only closed typed result; captured containers preserve original record hashes
  without circular outcome hashing or changing SIR normalization.
- Logical locator rederives the actual physical key from authenticated row identity and binds exact member
  pointer; digest alone cannot resolve authority.
- Replay returns original result under current access policy after lawful source retirement without reconstructing
  point, current topology or original receipt.
- Initial source authentication remains complete; later original-result reads authenticate immutable retained
  canonical custody and current disclosure authority without retired raw source/transaction controls or
  reconstructed outcome/receipt facts.
- SP-285 pending recovery explicitly requires the installed SP-286 full-value resolver at terminal staging and final publication, authenticating the original complete event and actual v2 receipt custody before the complete owner-local guard; no dependent resolver intervenes before atomic terminal publication.
- Authentic admitted pending custody replaces disposed original admission controls only on the exact installed recovery route; final completion preserves independently current point holds.
validation_surfaces:
- Plans/restore_point_deleted_contracts.schema.json
- Plans/restore_point_deleted_read_adapter.schema.json
- reports/event-authority-20260911/step-08-restore-pair-validation.md
- Plans/restore_point_retained_read.schema.json
- Plans/restore_point_retained_read_result.schema.json
- Plans/restore_point_retained_creation_read.schema.json
- Plans/restore_point_retained_creation_read_result.schema.json
risk_class: restore_point_terminal_custody_or_false_completion
reasoning_tier: high
context_scope: event_authority_step08_restore_pair
implementation_surfaces:
- Plans/storage-plan.md
node_compile_hint:
  mode: contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- EA-BINDINGS-285-RESPONSE-001
```
