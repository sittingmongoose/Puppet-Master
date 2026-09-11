# Shard 030: Run-start consumer binding and recovery read boundary - 2026-09-11

Source: `Plans/Executor_Protocol.md`

Source lines: L7265-L7331

Source SHA256: `259780459d60b5d51fd5f8be31960f99c7f81d9e0b9ec9703dc9984db2ccc059`

---

## Run-start consumer binding and recovery read boundary - 2026-09-11

Under DL-045 this addendum newly defines `executor.run_start_recovery_evidence.v1@1.0.0`, a read-consumer binding through SP-265's `storage.run_started_index.v1@1.0.0` reducer and `run_started_index_checkpoint.v1:{storage_instance_id}:{scope_partition}`. It names the existing Executor restart/admission read path, not a new recovery service or handler. Its source is the CURRENT-selected EventRecord index **plus the verified source frame and immutable runtime snapshot**, not index-only run state. The consumer validates the requested run against `payload.run_id`, preserves envelope/project/thread joins, and reports the source event identity and snapshot ref. It cannot materialize missing intake, attempt, safe-point, permission or dispatch authority.

The producer remains Executor's existing immutable start barrier. It still persists and verifies the complete `pm.requested_effective_runtime@1.0.0` snapshot and six owner joins before activation, follows `candidate -> admission_validated -> runtime_identity_resolved -> activated -> start_recorded`, and obtains the synced barrier AppendReceipt before attributable provider/tool work. No GUI/index refresh timing replaces that receipt or becomes an extra provider-start condition. The EventRecord envelope remains `2.0.0`, payload remains the current closed run-start v2 root, and source retention remains `RP-RUNTIME-365D@1.0.0`.

To make the already required same-semantic-start idempotency concrete, newly define the mechanical start identity as `(storage_instance_id, project_id, run_id)` for this binding. Use `replay_policy=dedupe_by_idempotency_key`, `idempotency_key = "run-start:" + lowerhex(SHA256(RFC8785([project_id, run_id])))`, and `event_id = "evt_run_start_" + lowerhex(SHA256(RFC8785([storage_instance_id, project_id, run_id])))`. Storage supplies its actual instance ID and scopes the key by `(scope_partition, event_type, idempotency_key)` under the existing app-root lifetime rule. No account, timestamp, attempt, retry, selected tab or checkpoint generation enters those identities. These formulas are new owner definitions, not claims about existing bytes; historical event identities are never relabelled or rehashed.

The new formulas apply only to a genuinely new logical start. During handover, before treating a run as new, the existing admission path must establish from the verified canonical tail whether that exact project/run already has a committed start, including historical v2 records with other stable keys. If it does, preserve and replay that original event ID/key; never mint the new-formula identity for the same existing run. Retained-tail absence is not historical absence: lawful expiry/deletion may have removed the source. A genuinely new owner-issued run identity or surviving durable owner identity/dedupe evidence must establish that a new logical start is admissible. If neither proves the distinction, return `dedupe_unavailable`; a missing historical source cannot authorize a second start. An incomplete or ambiguous tail check fails closed. Under the existing serialized run-start admission path, first check the current app-root dedupe authority. If the same logical start is already durably committed, compare the immutable semantic request, snapshot ref/digest and producer-owned intent with that original event and return the original durable result; preserve its original authored timestamps, actor/causal fields and bytes. Do not regenerate those fields on retry. A different snapshot, scope or semantic intent under the same identity is `idempotency_conflict`; uncertain dedupe/append truth is `dedupe_unavailable` and blocks further dispatch until Storage reconciles the original append. A valid unacknowledged tail may be adopted only by Case L-2 recovery. Absence of a UI row or missing caller acknowledgement is never permission to append or execute again. Resume of an existing run keeps the same run identity and uses existing resume/attempt authority; it does not mint a second start. A genuinely new run has a new owner-issued `run_id`.

`executor.run_start_recovery_evidence.v1` treats a verified start as evidence of the original start barrier, never evidence that an attempt is live, complete, safe to retry or authorized now. Recovery still requires canonical `executor_intake_report`, `attempt_receipt`, runtime checkpoint markers, safe points, current permissions, worktree/baseline and currentness checks from their owners. Missing canonical records require verified mandatory-backup recovery; neither EventRecord fields nor this disposable checkpoint reconstruct them. Storage recovery, projection rebuild, historical replay or a late start row cannot auto-resume work, repeat provider/tool/network effects, change terminal run state or create Usage charges.

Consumer-only invalidation/withdrawal fences this read path and any recovery admission that requires it, while retaining existing owner behavior for independent new-run admission. Withdrawal of the run-start writer itself stops new activation/start writes until the explicit compatible successor is adopted; it does not remove registration or rewrite history. SP-265 owns checkpoint rebuild and custody; this owner retains execution admission and all current no-auto-resume rules.

ContractRef: ContractName:Plans/Decision_Log.md#DL-045, ContractName:Plans/storage-plan.md#SP-265, ContractName:Plans/Contracts_V0.md#EventRecord, SchemaID:pm.requested_effective_runtime

### EP-116 - Run-start identity and recovery consumer

```yaml
plan_unit_id: EP-116
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: >-
  Executor newly defines executor.run_start_recovery_evidence.v1@1.0.0 through SP-265 and keeps its
  existing complete immutable runtime-snapshot barrier before attributable execution. A genuinely new
  logical start uses idempotency_key run-start: plus lowercase SHA-256 of RFC8785([project_id,run_id]) and
  event_id evt_run_start_ plus lowercase SHA-256 of RFC8785([storage_instance_id,project_id,run_id]).
  Historical committed identities take precedence; retained-tail absence after lawful removal never proves
  a new run. Equal semantic retries return original durable results and preserve authored bytes, while
  conflicting or uncertain identity fails idempotency_conflict or dedupe_unavailable. The recovery reader
  supplies verified historical start evidence only; canonical intake, attempt, permissions, safe-point and
  currentness authority remain independently required, with no replay dispatch, resume, canonical
  reconstruction or Usage charge.
gui_related: false
gui_classification_reason: "Defines storage or execution contracts, not a new visual surface."
depends_on: [SP-265]
unblocks: []
acceptance_criteria:
  - "Immutable snapshot and six owner joins precede the existing durable start barrier and attributable execution."
  - "New mechanical identity formulas preserve existing historical event IDs/keys; retained-tail absence cannot prove a new logical run, and unknown durable identity is dedupe_unavailable."
  - "Same semantic start returns the original durable result; conflicting snapshot/intent and uncertain append truth produce no second event or dispatch."
  - "The recovery consumer never reconstructs canonical intake/attempt authority, changes terminal state, auto-resumes work or charges Usage."
validation_surfaces:
  - Plans/run_started_consumer_contracts.schema.json
  - Plans/run_started_consumer_contract_fixtures.json
  - Native execution of the named replay, crash, source-lookup and custody pairs remains required.
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
source_atom_ids: []
negative_constraints:
  - No event membership, retention-policy definition, frozen accounting, runtime-proof or governance change.
  - No canonical source reconstruction from a checkpoint or UI projection.
owner_hints:
  - Plans/storage-plan.md
  - Plans/Executor_Protocol.md
```
