# Shard 052: EP-225 — scheduler.pass prepared Event Authority contract

Source: `Plans/Executor_Protocol.md`

Source lines: L12186-L12361

Source SHA256: `2572ffbe8bea64b72cb8dd8446a5265ad01885bf6fe90b1c3ea1fb279de194fc`

---

## EP-225 — scheduler.pass prepared Event Authority contract

Newly authored owner contract under DL-045, after the per-family search in reports/event-authority-20261104/DX.md. This unit governs only `scheduler.pass@1.0.0`, prepared without admission. `executor.scheduler_pass.emitter.v1@1.0.0` is the exact Executor emitter for this transition: one pending wake set -> one scored pass, before dispatch; first recovery wake is startup_recovered. Select at most available_slots using the canonical score order, retain every nonselected ready node and its exclusion reason. Legacy non_selected is import-only.

The producer validates current Project ownership, graph/replan generation, original input and referenced immutable runtime/snapshot identities, permission and worktree baseline before preparing immutable payload bytes. Every present run/thread/node/attempt join must equal its actual owner record and EventRecord envelope; never derive Project from focus. Pre-attempt blocks omit attempt_id. Requested/effective model/account/persona and package/seam/lane/worktree identity are resolved through the existing immutable runtime snapshot or execution_unit_context reference, with its full current owner equality checks, never reconstructed from today's settings. Conditional evidence (verification/reviewer, auth scope, timeout/wait, safe-point and remediation lineage) is required whenever the underlying outcome has that feature; absence cannot suppress a real outcome discriminator.

Sequence is owner admission -> immutable dependency/body commit -> validate/append -> first receipt -> terminal publication and dependent dispatch. This exact family explicitly adopts SP-286 and CV-339 including strict stored full-value v2 resolution, SP-336/SP-347 durability classes and flush fences. Lost acknowledgement resolves original full value and first receipt, never guesses success or fabricates a second effect. A barrier required before execution uses the barrier-class append. Missing original full-value custody fences retries. This event is evidence of the transition; replay cannot perform its associated worker, retry, recovery or notification action.

Event ordering follows canonical local sequence; node events remain sequential and cross-node events eventual. The later Executor Event Dedup Key Sequence Fallback governs over the old timestamp tuple. event_sequence is reserved once for the logical transition, persisted in the original owner input/transition before append, monotonic within an attempt or (when no attempt exists) this run/node or pre-lock Project decomposition stream. Retry reloads the same sequence and semantic bytes; it cannot obtain another sequence to bypass dedupe. See SP-515 for the exact family identity and historical compatibility.

Family-local source predicate contract: The exact wake set is pending with no previously committed pass. Original pass identity, ready/selected/nonselected partition, scores, capacity and first recovery wake are preserved. The unpersisted normalized source proof for this exact family is closed at Plans/executor_event_source_proofs.schema.json#/$defs/scheduler_pass. Source facts are observations resolved from the actual canonical owner records named above under the same admission/read fence; caller-supplied booleans or fixture data never establish runtime authority. Source bindings must match every payload identity/snapshot ref, independently of envelope equality; only fields actually present are compared, with conditional presence governed above. Fixtures exercise each exact field mismatch, each invalid source state and each envelope mismatch independently. No new physical state or canonical lifecycle enum is created by these normalized reader predicates.

### scheduler.pass source-read and transition closure (pass two)

Newly authored technical owner contract under DL-045 after the independent per-family pass-two search in `reports/event-authority-20261104/DX.md`: `executor.scheduler_pass.source_adapter.v1@1.0.0` is the exact unpersisted source adapter for `scheduler.pass@1.0.0`. It is invoked by `executor.scheduler_pass.emitter.v1@1.0.0` while holding the existing Project/run writer-admission fence. It is not a physical value family, lifecycle owner, new command, or permission grant. The machine companion is this family's own `semantic_adapter` object in `Plans/executor_event_contracts.json`; no sibling supplies a source role, join or transition.

Read these exact owner roles under one coherent admission/read boundary, using original immutable record refs and revisions rather than caller truth flags:

| Local source-read slot | Canonical owner and source selection |
|---|---|
| `project` | Project_System current Project identity and Storage root; never focus or a display label. |
| `operation` | Executor original reserved transition input: immutable semantic observation, event_sequence, predecessor revision and original dependency refs. The same input is reloaded after a crash. |
| `run` | Executor original run/GoalRun and installed WorkGraph generation; retain original run/thread joins and replan generation. |
| `scheduler` | Executor one original pending wake set for run/replan_generation, original scheduler_pass_id, current candidate set, scores, capacity, partition and recorded wake ordering. |

The earlier source_facts/source_bindings fixtures remain shape-only regressions; this pass-two adapter supplies the source-read and transition contract. The normalized read captures in `Plans/executor_event_semantic_fixtures.json` are static oracle inputs only. Native adapters must resolve and validate the complete existing owner records/schemas and their hashes, permissions and deletion fences; the captured join view does not replace a complete runtime snapshot or execution_unit_context schema. Every slot must match its actual source owner, exact Project/storage root, expected revision, body digest and required parent refs. Missing/unavailable originals refuse publication and retries; an empty substitute is forbidden. Payload/envelope Project, run, thread and attempt joins are exact when present. Project partition is `project~` plus unpadded base64url of UTF-8 Project ID (Storage Case L-5).

Every payload field below has this independently bound source read. Dot paths name normalized observations of those owners, not new physical keys:

| Payload field | Required owner-read equality |
|---|---|
| `schema_version` | `operation.body.schema_version` |
| `ts` | `operation.body.observed_at_utc` |
| `project_id` | `project.body.project_id` |
| `event_sequence` | `operation.body.event_sequence` |
| `run_id` | `run.body.run_id` |
| `thread_id` | `run.body.thread_id` |
| `replan_generation` | `run.body.replan_generation` |
| `scheduler_pass_id` | `operation.body.scheduler_pass_id` |
| `wake_reason` | `operation.body.wake_reason` |
| `available_slots` | `operation.body.available_slots` |
| `ready_nodes` | `operation.body.ready_nodes` |
| `selected_nodes` | `operation.body.selected_nodes` |
| `non_selected_nodes` | `operation.body.non_selected_nodes` |
| `coalesced_wake_reasons` | `operation.body.coalesced_wake_reasons` |
| `wake_event_refs` | `operation.body.wake_event_refs` |

Derive the complete original observation from every independently hashed owner-read equality in this table, including schema_version and the immutable first observation timestamp. An absent optional owner fact forbids inventing that field; an existing fact requires its field even when both the submitted payload and its capture mirror omit it. The mirror must equal that source-derived observation and is never its own presence authority. The original reserved observation determines conditional **presence as well as value**: schema optionality never permits omitting a real verification/reviewer, auth realm/missing scope, timeout/wait, safe-point restore, remediation or requested/effective snapshot fact. Require exact original payload bytes/observation, including first ts and sequence. Resolve every present `_ref`, `_snapshot_id`, safe_point_id and every evidence-list item through its existing owner; require exact scope/root, retained body/hash, fresh viewer authorization and lawful-deletion status. Runtime snapshot/execution context joins compare actual run/thread/node/attempt plus lane_id, package_id, seam_id, worktree_id, requested/effective account, requested_account_binding, operational_identity, approval_scope_key and permission_snapshot_id where the existing owner carries them. Requested/effective model, Persona, provider, mode/strategy and all resolution refs come from the whole immutable runtime owner, never current Settings. No ref is retrieval authority.

The lifecycle table for `scheduler.pass` is exhaustive for this prepared version. States are normalized reads of the existing owner lifecycle, not a new canonical enum. Every row additionally requires the exact source revision/parents, reserved event_sequence and all listed owner predicates; any other predecessor, successor, stale generation or conditional discriminator rejects.

| Before | Payload discriminator | After |
|---|---|---|
| `pending` | `{}` | `committed` |

Owner predicates, independently evaluated from the source records: `scheduler.body.prior_pass=absent`; `scheduler.body.generation_state=current`.

Order wakes by (recorded_at_utc,event_id); preserve the first primary reason and every additional coalesced reason/ref. First recovery wake is startup_recovered; watchdog_recheck cannot supersede pending event-driven work. Select exactly min(ready count, available_slots) using the canonical score tuple, retaining every nonselected candidate and its original exclusion reason. Every selected score/lane equals the original candidate record. Apply the existing EP-052 score-term domain to both ready_nodes[].manual_priority and selected_nodes[].score_tuple.manual_priority and to the original normalized owner scores: integer 0..100 inclusive, default 50. A missing configured priority normalizes to 50 before scoring; the emitted/captured score carries that explicit value. Reject each lower/upper violation independently, even when payload, mirror and hashed source agree on the invalid integer. Publish pass history before dispatch. SP-515 binds its existing canonical runtime classification to RP-RUNTIME-365D@1.0.0; admission remains separately absent.

Ordering barrier for `scheduler.pass`: admission -> immutable dependency commit -> immutable body commit -> append -> original first receipt -> owner revision CAS/post-state -> publication/dependent effects. Adopt **SP-286/CV-339 full-value v2** and SP-336/SP-347 durability, with the existing pre-execution barrier where required. The post-state revision is the expected original revision plus one and retains the same reserved sequence; a losing CAS publishes nothing. Original terminal/dispatch effect accounting is `{"pass_publications": 1, "worker_dispatches": 0}`. This is an oracle accounting view, not new stored state. Replay performs zero new effects, reuses original semantic bytes and returns the first receipt/result. Crash recovery may reconcile the original committed operation after writer cutoff but cannot admit a new operation. Native transaction/flush/interleaving proof remains NOT_RUN.

```yaml
plan_unit_id: EP-225
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
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
- Plans/Executor_Protocol.md
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

### EP-200 - Workflow run stop and block writers

```yaml
plan_unit_id: EP-200
unit_type: requirement
status: accepted
owner_doc: Plans/Executor_Protocol.md
canonical_text: |-
  Newly authored owner contract under DL-045, written for DL-080 (2026-11-04). It is the Workflow writer listing DL-080 requires for goal_run.stopped and goal_run.blocked, Project edition only. Two writers are named: owner.executor.workflow_run.stop.v1, entered from handlers::orchestrator::pause (cmd.orchestrator.pause) and handlers::runtime::abort_run (cmd.runtime.abort_run); and owner.executor.workflow_run.block.v1, entered from the Executor scheduler when a run-level block is admitted. Each moves the native Workflow body status once, under the D01 update_workflow observation, and its own event follows in the order below. Installation: EP-118 keeps refusing every unlisted writer (RequiredOtherWorkflowWriterSource=false), and the all_writers.v7 descriptor (EP-124) lists neither writer, so neither can run on any existing birth. They become available only on a fresh Workflow source edition whose all-writers descriptor lists them; that edition is a separate dependency this unit does not author, and no existing birth is enrolled or cast.
gui_related: false
gui_classification_reason: Defines event, writer, persistence or projection contracts; no visual surface.
split_recommended: false
depends_on:
- EP-118
- EP-119
- EP-124
- SP-286
- SP-309
- SP-426
- SP-427
- DL-080
- DL-045
unblocks: []
acceptance_criteria:
- The stop writer is reached only from cmd.orchestrator.pause and cmd.runtime.abort_run; the block writer only from the Executor scheduler; no other route appends either family.
- Each writer orders admission, settlement or block receipt, native status update, append with SP-286 first receipt, then terminal command publication; no step is reordered or skipped.
- On every existing birth both writers stay refused by RequiredOtherWorkflowWriterSource=false; only a fresh source edition that lists them may install them.
- A lost acknowledgement resolves through SP-286 retained receipt resolution; the writer never re-dispatches, rolls back or mints a new event value.
validation_surfaces:
- Plans/executor_cancellation_contracts/schemas/goal-run-stopped.v3.schema.json
- Plans/executor_cancellation_contracts/schemas/goal-run-blocked.v3.schema.json
- Plans/goal_run_stop_block_oracle_fixtures.json
- python3 scripts/pm_goal_run_stop_block_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: unlisted_workflow_writer_admission
reasoning_tier: high
context_scope: workflow_run_stop_block_writers
implementation_surfaces:
- Plans/Executor_Protocol.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-080
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/surveys/D1a/REPORT.md (item 3)
preserved_exact_tokens:
- "owner.executor.workflow_run.stop.v1"
- "owner.executor.workflow_run.block.v1"
- "RequiredOtherWorkflowWriterSource=false"
negative_constraints:
- No completion, certification, replan, resume or ownership-transfer writer.
- No enrollment of an existing birth and no application-scope writer.
owner_hints:
- Plans/Executor_Protocol.md
```

**Why a listing and not an installation.** DL-080 says "Each contract names the family's writer, which the Workflow writer list lacks today". EP-118 lists the original materialized, stage-entrypoint, prepare-start, prestart-abort, original-start and D06 writers and refuses every other one; EP-124 binds the entire `all_writers.v7` descriptor before birth. Naming the two writers here closes the listing gap; installing them needs a fresh Workflow source edition with these writers in its descriptor, and that edition is not written here.

**Stop writer order** (`owner.executor.workflow_run.stop.v1`).
1. Admission at the writer's final predicate: current Project permission for the command, writer-capable Storage, no recovery hold, the native status is one D-R21 source (`ready`, `running`, `provisional_success`, `verifying`, `failed_verification`, `repairing`, `blocked`, or `stopped` with new settlement or recovery evidence), and the expected GoalRun revision is current.
2. Settlement: the bounded safe-stop owner (EP-119, SP-309) settles the run's in-flight effects and returns durable settlement dispositions. `resumable=true` additionally needs a validated safe point and no unresolved mutation fence; otherwise the writer sets `resumable=false`.
3. Native update: the native body status becomes `stopped` and the GoalRun revision advances exactly once; D01 `update_workflow.v3` observes the update and never issues it. The Goal body, revision and four-state lifecycle are unchanged.
4. Append: the frozen goal_run.stopped v3 EventRecord (SP-426 identity) is appended through Storage; the first AppendReceipt is retained under SP-286 by name.
5. Terminal publication: the command result is published only after the first receipt (CV-333 central response). A refusal after step 3 keeps every genuine earlier effect and reports recovery, never rollback.

**Block writer order** (`owner.executor.workflow_run.block.v1`).
1. Admission: the scheduler has a run-level block cause from the v2 `blocked_reason_code` list, the native status is one D-R16 source (`ready`, `running`, `provisional_success`, `verifying`, `failed_verification`, `repairing`, or `blocked` with new evidence, action or recovery revision), and the expected GoalRun revision is current.
2. Block receipt: the owner of the cause (Permissions for denial, Storage for storage blocks, the approval owner for approval) has issued the receipt the payload names; D-R16 requires it to exist before append.
3. Native update: status `blocked`, GoalRun revision advances once, D01 observes; Goal state unchanged.
4. Append with SP-286 first receipt (SP-427 identity).
5. No command result: the scheduler records its pass outcome after the first receipt.

**Search (DL-045).** Scope: EP-116..124, EP-132, GRS-026, GRS-027, GRS-071, GRS-075, GRS-079..085, SP-309..317, CV-340, `Plans/Wiring_Matrix.production.json` rows `catalog.orchestrator_pause` and `catalog.runtime_abort_run`, `Plans/workflow_standard_source_contracts/` and the Known-37 matrix rows EA-UND-0016 and EA-UND-0021. Found: both wiring rows expect `goal_run.stopped`; EP-118 refuses unlisted writers; no unit names a stop or block writer, method or entrypoint. These two writer identities are newly authored.

ContractRef: ContractName:Plans/Executor_Protocol.md#EP-118, ContractName:Plans/Executor_Protocol.md#EP-124, ContractName:Plans/Goal_Runtime_System.md#GRS-200, ContractName:Plans/Goal_Runtime_System.md#GRS-201, ContractName:Plans/Decision_Log.md#DL-080
