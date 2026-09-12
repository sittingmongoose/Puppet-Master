# Shard 030: Run-start consumer binding and recovery read boundary - 2026-09-11

Source: `Plans/Executor_Protocol.md`

Source lines: L7265-L7361

Source SHA256: `10452eeea029947d3836314274d2cde7bbeccaa79c69d4c7a346a385bcb319f1`

---

## Run-start consumer binding and recovery read boundary - 2026-09-11

**Versioned run-start reader adoption.** For `run.started`, the current reader is `executor.run_start_recovery_evidence.v2@2.0.0` through `storage.run_started_index.v2@2.0.0` and the SP-265/SP-278 successor contract. The v1 identifiers in the following predecessor text are compatibility-only; its owner behavior and restrictions apply unchanged to v2. Current publication requires the actual admitted full rebuild and complete current index/source token. Substituting version strings or accepting an old stored digest does not upgrade a v1 reader.

Under DL-045 this addendum newly defines `executor.run_start_recovery_evidence.v1@1.0.0`, a read-consumer binding through SP-265's `storage.run_started_index.v1@1.0.0` reducer and `run_started_index_checkpoint.v1:{storage_instance_id}:{scope_partition}`. It names the existing Executor restart/admission read path, not a new recovery service or handler. Its source is the CURRENT-selected EventRecord index **plus the verified source frame and immutable runtime snapshot**, not index-only run state. The consumer validates the requested run against `payload.run_id`, preserves envelope/project/thread joins, and reports the source event identity and snapshot ref. It cannot materialize missing intake, attempt, safe-point, permission or dispatch authority.

The producer remains Executor's existing immutable start barrier. It still persists and verifies the complete `pm.requested_effective_runtime@1.0.0` snapshot and six owner joins before activation, follows `candidate -> admission_validated -> runtime_identity_resolved -> activated -> start_recorded`, and obtains the synced barrier AppendReceipt before attributable provider/tool work. No GUI/index refresh timing replaces that receipt or becomes an extra provider-start condition. The EventRecord envelope remains `2.0.0`, payload remains the current closed run-start v2 root, and source retention remains `RP-RUNTIME-365D@1.0.0`.

To make the already required same-semantic-start idempotency concrete, newly define the mechanical start identity as `(storage_instance_id, project_id, run_id)` for this binding. Use `replay_policy=dedupe_by_idempotency_key`, `idempotency_key = "run-start:" + lowerhex(SHA256(RFC8785([project_id, run_id])))`, and `event_id = "evt_run_start_" + lowerhex(SHA256(RFC8785([storage_instance_id, project_id, run_id])))`. Storage supplies its actual instance ID and scopes the key by `(scope_partition, event_type, idempotency_key)` under the existing app-root lifetime rule. No account, timestamp, attempt, retry, selected tab or checkpoint generation enters those identities. These formulas are new owner definitions, not claims about existing bytes; historical event identities are never relabelled or rehashed.

The new formulas apply only to a genuinely new logical start. During handover, before treating a run as new, the existing admission path must establish from the verified canonical tail whether that exact project/run already has a committed start, including historical v2 records with other stable keys. If it does, preserve and replay that original event ID/key; never mint the new-formula identity for the same existing run. Retained-tail absence is not historical absence: lawful expiry/deletion may have removed the source. A genuinely new owner-issued run identity or surviving durable owner identity/dedupe evidence must establish that a new logical start is admissible. If neither proves the distinction, return `dedupe_unavailable`; a missing historical source cannot authorize a second start. An incomplete or ambiguous tail check fails closed. Under the existing serialized run-start admission path, first check the current app-root dedupe authority. If the same logical start is already durably committed, compare the immutable semantic request, snapshot ref/digest and producer-owned intent with that original event and return the original durable result; preserve its original authored timestamps, actor/causal fields and bytes. Do not regenerate those fields on retry. A different snapshot, scope or semantic intent under the same identity is `idempotency_conflict`; uncertain dedupe/append truth is `dedupe_unavailable` and blocks further dispatch until Storage reconciles the original append. A valid unacknowledged tail may be adopted only by Case L-2 recovery. Absence of a UI row or missing caller acknowledgement is never permission to append or execute again. Resume of an existing run keeps the same run identity and uses existing resume/attempt authority; it does not mint a second start. A genuinely new run has a new owner-issued `run_id`.

`executor.run_start_recovery_evidence.v1` treats a verified start as evidence of the original start barrier, never evidence that an attempt is live, complete, safe to retry or authorized now. Recovery still requires canonical `executor_intake_report`, `attempt_receipt`, runtime checkpoint markers, safe points, current permissions, worktree/baseline and currentness checks from their owners. Missing canonical records require verified mandatory-backup recovery; neither EventRecord fields nor this disposable checkpoint reconstruct them. Storage recovery, projection rebuild, historical replay or a late start row cannot auto-resume work, repeat provider/tool/network effects, change terminal run state or create Usage charges.

Consumer-only invalidation/withdrawal fences this read path and any recovery admission that requires it, while retaining existing owner behavior for independent new-run admission. Withdrawal of the run-start writer itself stops new activation/start writes until the explicit compatible successor is adopted; it does not remove registration or rewrite history. SP-265 owns checkpoint rebuild and custody; this owner retains execution admission and all current no-auto-resume rules.

ContractRef: ContractName:Plans/Decision_Log.md#DL-045, ContractName:Plans/storage-plan.md#SP-265, ContractName:Plans/Contracts_V0.md#EventRecord, SchemaID:pm.requested_effective_runtime

### Original run-start first-receipt recovery adoption

For exactly the existing `run.started` start barrier and `executor.run_start_recovery_evidence.v2@2.0.0`, Executor explicitly adopts SP-286/CV-339's `storage.first_append_receipt.resolve.v2`. The request is the original admitted EventRecord identity/semantic request under its existing replay policy, not a caller custody row or receipt. Preserve the original Storage instance, project/run identity, actual original event ID and scoped idempotency key, immutable snapshot ref/digest, producer intent and authored semantic fields. Resolve historical original identities before applying the new-run formula; an allowed scoped alternate incoming event ID resolves the original ID and cannot create another logical start. Storage authenticates actual global/scoped key/raw identity, source semantic tuple and canonical issued custody in its original database. The returned eleven-field AppendReceipt and the retained four-field original_append_result must join that original event/sequence and Storage-owned original segment reference/offset. Exact original durability class is the required synced start barrier; a newer locator, timestamp, supplied digest or four-field dedupe result alone cannot satisfy it.

An intact already-issued receipt replays unchanged after lost delivery or interrupted dependent acknowledgement. This passive receipt resolution does not reopen a retired source, reacquire the old manifest/group/request or establish present execution authority. The existing recovery reader still needs its independently verified current SP-265/SP-278 source/index boundary and original runtime snapshot when it claims those source facts; source or snapshot unavailability refuses that claim without erasing an intact receipt. Original full-frame/source/CRC/durability and complete snapshot/six-owner joins remain mandatory where required by the existing start barrier. Receipt-only resolution is not proof that a supplied complete EventRecord equals its originally issued value. For that stronger claim this owner explicitly adopts `storage.first_append_receipt.resolve_full_value.v1` with exact `full_value_request = {event: <the available complete original EventRecord>}` and `full_value_result` from `Plans/event_append_receipt_contracts.schema.json`: compare the original first receipt, original segment ref and CV-339 complete-value commitment to the independently selected original source. It requires actual v2 custody and exact original event ID. An unavailable full-value route cannot be downgraded to semantic replay; an intact v1 row retains only its existing semantic receipt use. No raw value is reconstructed for this call.

Uncertain append is resolved by the actual Storage owner before any dependent start acknowledgement or attributable dispatch. Only an authenticated never-issued complete current protected group may reach `storage.first_append_receipt.issue.v2`, after the original source/manifest barriers and complete current group/source/dedupe/restore checks. Executor never calls first mint from a missing receipt, lost delivery, tail absence or a supplied never-issued flag. A proper subset, lost previously issued custody, restored old pending request or ambiguous original group remains fenced under existing `dedupe_unavailable`/integrity/recovery behavior. In-place restart after actual protected promotion follows SP-286's original group handoff without reconstructing old transient capabilities. A verified older restore does not make omitted run-start work fresh. Only an actual newly accepted owner-issued run after the coordinator's completed restore occurrence/session may use its fresh-operation admission; existing lost/restored run IDs and pending work cannot be renamed or reaccepted as a new start.

At the final held Executor acknowledgement/admission boundary, after all receipt/source/snapshot/currentness helpers, compare the complete original request, resolved receipt/result, actual run/source identity, immutable snapshot and current required permission/Stop/intake/attempt/safe-point/worktree/admission facts. No helper may change those facts between the final check and publication. A passive recovery read instead applies its existing current inspection/access/source token and no-auto-resume predicates; it does not require or grant live-run authority merely to return historical receipt evidence. Any later refusal preserves actual prior start/receipt effects. Receipt recovery cannot activate or resume work, repeat provider/tool/network effects, manufacture missing owner records, change terminal run state or charge Usage. This is explicit adoption of existing shared interfaces, not a new event, source provider, native implementation claim or checkpoint.

ContractRef: ContractName:Plans/Executor_Protocol.md#EP-116, ContractName:Plans/storage-plan.md#SP-265, ContractName:Plans/storage-plan.md#SP-278, ContractName:Plans/storage-plan.md#SP-286, ContractName:Plans/Contracts_V0.md#CV-339, ContractName:Plans/event_append_receipt_contracts.schema.json

### EP-116 - Run-start identity and recovery consumer

```yaml
plan_unit_id: EP-116
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: 'Executor newly defines executor.run_start_recovery_evidence.v2@2.0.0 through SP-265 and
  keeps its existing complete immutable runtime-snapshot barrier before attributable execution. A genuinely
  new logical start uses idempotency_key run-start: plus lowercase SHA-256 of RFC8785([project_id,run_id])
  and event_id evt_run_start_ plus lowercase SHA-256 of RFC8785([storage_instance_id,project_id,run_id]).
  Historical committed identities take precedence; retained-tail absence after lawful removal never proves
  a new run. Equal semantic retries return original durable results and preserve authored bytes, while
  conflicting or uncertain identity fails idempotency_conflict or dedupe_unavailable. The recovery reader
  supplies verified historical start evidence only; canonical intake, attempt, permissions, safe-point
  and currentness authority remain independently required, with no replay dispatch, resume, canonical
  reconstruction or Usage charge. The v1 reader is compatibility-only for this family; current v2 publication
  requires the explicitly admitted SP-265/SP-278 successor and complete current source/index token, with
  unchanged owner behavior.'
gui_related: false
gui_classification_reason: Defines storage or execution contracts, not a new visual surface.
depends_on:
- SP-265
- SP-278
- SP-286
- CV-339
unblocks: []
acceptance_criteria:
- Immutable snapshot and six owner joins precede the existing durable start barrier and attributable execution.
- New mechanical identity formulas preserve existing historical event IDs/keys; retained-tail absence
  cannot prove a new logical run, and unknown durable identity is dedupe_unavailable.
- Same semantic start returns the original durable result; conflicting snapshot/intent and uncertain append
  truth produce no second event or dispatch.
- Explicit SP-286/CV-339 receipt resolution preserves issued replay, authentic never-issued protected-group
  recovery and restored/lost-work fencing; full-value-dependent claims require the separate exact v2
  original-value interface without downgrading unavailable proof.
- Final receipt/source/snapshot/admission joins precede dependent publication; passive recovery grants no
  live-run authority and never reacquires retired source solely for an intact receipt.
- The recovery consumer never reconstructs canonical intake/attempt authority, changes terminal state,
  auto-resumes work or charges Usage.
validation_surfaces:
- Plans/run_started_consumer_contracts.schema.json
- Plans/run_started_consumer_contract_fixtures.json
- Native execution of the named replay, crash, source-lookup and custody pairs remains required.
- Plans/event_index_consumer_adoption.schema.json
- Plans/event_index_consumer_adoption_fixtures.json
risk_class: event_source_and_checkpoint_authority_drift
reasoning_tier: high
context_scope: run_started_single_family_depth
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: run_started_owner_contract
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-045
- reports/event-authority-20260911/step-08-run-started-depth.json
- Plans/storage-plan.md#run-start-and-restore-created-versioned-index-adoption
source_atom_ids: []
negative_constraints:
- No event membership, retention-policy definition, frozen accounting, runtime-proof or governance change.
- No canonical source reconstruction from a checkpoint or UI projection.
owner_hints:
- Plans/storage-plan.md
- Plans/Executor_Protocol.md
```
