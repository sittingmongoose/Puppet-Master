# S2-writer: who can be the named writer of `goal_run.stopped`

This is a read-only scoping note for A3, family `goal_run.stopped` only. Everything cited was read as git objects:

- `origin/main` = `63cf2cb97f936c91dd7bb5c585d9a35d8409ed61`, fetched 2026-09-25
- A1 branch `origin/plans/replan-v8-a1-20260925` = `74c79b5bf900b37a7437ac3999bf546fca7b1827` (pending, not canon)
- process answers `origin/plans/replan-v8-process-answers-20260925` = `616f12bfde2fa2ebbed1fd2b0e762a670f742282`

Line numbers are origin/main unless marked A1.

SHA-256 of files cited (origin/main):
- `Plans/event_family_registry.json` 0be544181eda423dcea4d8661206e7da6d066fdcf51913d5962f1a283635c842
- `Plans/executor_cancellation_contracts/methods.json` 0fbb8d53064eaffd091cb0a1f071453e8cf9e460f897a41369f2b284b1cc08d1 (the same hash is pinned as the whole inherited map in `workflow_standard_source_contracts/methods.json` and `native-v7/methods.json`)
- `Plans/executor_cancellation_contracts/physical-families.json` 782a05664faaf36dcbaf92c0b0f9d162a67c48b6da687a05b2b9de86ba382a6a
- `Plans/workflow_standard_source_contracts/native-v7/fresh-profile-methods.json` f23bee216c0871c7d5205c85bf2706eedc8c778a59fc84958199709dcf981cea
- `Plans/workflow_standard_source_contracts/native-v7/schemas/workflow-original-start.v6.schema.json` 8e82034b4874fa7397c3ea44d7785b290ed2253281731648846505516914d376
- `Plans/event_payloads/goal_runtime/goal_run_stopped.schema.json` 043212b8d2cdc1f65ffcac057f38f7b24ce82e7d46dc193f9975ba45ba545297

## 0. Short answer

- **No existing source method moves a v6 or v7 Workflow run to `stopped`, and none can carry an EventRecord.**
  - `owner.executor.workflow_source.record_stop.v1` is a D01 scheduler-stop recorder. It is not a Workflow body writer.
  - Its closed `StopResult` has no append slot.
  - Its `scheduler_fenced` branch requires a native `RunOperationResult(operation=cancel)`. Only `owner.executor.native.record_cancellation.v1` issues that result, and that method is dependency-only. That is exactly the "D06" issuer Q-12 forbids the contract to depend on.
- **A1's EP-127/GRS-089 add no writer for v8 births either, and they say so in words.** The v8 limited revocation writes only Slot, SlotRevision and SlotOrigin: no Workflow body change, no Event. For the ordinary idle phase, v8 still uses the ordinary route, which needs native cancel.
- **The writer therefore has to be new, separately admitted owner work.** The recommended candidate is W-C below: a stop-disposition publisher of the Workflow run lifecycle owner, modelled on the D06 and start-commit joint publishers. D01 observes it through a new transition rule, and it is installed in a fresh all-writers profile.
- **Two blockers stand before W-C can be written without D06.** B1: canon has no D06-free settlement or quiescence source for in-flight work. B2: adding a writer needs a new all-writers profile, or an A1 amendment before it lands.

## 1. Findings (evidence)

### F1. The Workflow writer list is closed, and it has no stop writer

- **EP-118 (`Plans/Executor_Protocol.md` 7523):** `update_workflow.v3` observes "the original materialized, stage-entrypoint, prepare-start, prestart-abort, separately admitted original-start or D06 writer. D01 never becomes the issuer of the underlying native effect. All unlisted Workflow writers remain refused by `RequiredOtherWorkflowWriterSource=false`; this adoption supplies no completion, certification, ownership-transfer or optional/replanned materialization route."
- **GRS-082 (`Plans/Goal_Runtime_System.md` 7662):** "this source adds no direct verifying/replan/repair writer". The certified writers (v6/v7) added only standard success rules.
- **Schema check.** `BoundTransitionRule` is the closed enum of D01 transition rules.
  - In `workflow-original-start.v2` it has 8 values:
    - `activation_begin`
    - `activation_materialized`
    - `activation_entrypoints`
    - `activation_prepare_start`
    - `activation_abort_prestart`
    - `d06_cancel_nonterminal`
    - `d06_preserve_terminal`
    - `original_workflow_start`
  - v5 (all_writers.v6) and v6 (native-v7, all_writers.v7) add three more: `original_execution_progress`, `original_provisional_success` and `original_standard_certification`.
  - On the A1 branch, v7 (native-v8) is unchanged.
  - **No value produces `stopped`.**
  - `OriginalWriterOrigin` kinds are `activation_original | d06_original | original_workflow_start | standard_original`. There is no stop kind.
- **Native status enum.** `GoalRunBody.status` does contain `stopped` (`Plans/workflow_activation_contracts/schemas/workflow-activation.v4.schema.json`, `$defs/GoalRunBody`), so the state exists but nothing writes it.
- **Depth42 grading agrees.** The producer cell is PARTIAL: "EP-118 refuses unlisted Workflow writers, and the skip_node row requires a separately owner-admitted run-stop transition" (`reports/event-authority-20260911/step-08-depth42-assessment-20260924.json`, row `goal_run.stopped`).

### F2. `record_stop.v1` (v6 and v7 births) is a scheduler-stop recorder, not a body writer

**Declaration.** `Plans/executor_cancellation_contracts/methods.json` lines 148-156 (`workflow_source_methods`) and 489-506 (phase arguments):
- `private_source_schema` `…executor_workflow_original_start.v2…#/$defs/CurrentSource`
- `result_schema` `…#/$defs/StopResult`
- `boundary` `record_stop`
- `protocol` `Plans/Executor_Protocol.md#EP-118`
- `activation_source_phase_arguments: []`
- `mandatory_goal_argument` `CurrentGoalArgument`

For v6 and v7 births the same declaration is re-identified:
- `Plans/workflow_standard_source_contracts/fresh-profile-methods.json` 148-152 (`…original_start.v5…#/$defs/StopResult`)
- `…/native-v7/fresh-profile-methods.json` 148-152 (`…original_start.v6…#/$defs/StopResult`)

**What it writes.** Physical families in `Plans/executor_cancellation_contracts/physical-families.json` that list `record_stop.v1` as producer:
- `executor_workflow_current_pointer`
- `executor_workflow_scheduler_control`
- `executor_workflow_scheduler_stop` (sole producer)
- `executor_workflow_mutation_origin`

It is **not** a producer of `executor_workflow_workflow_update` or `executor_workflow_workflow_head`. Their producers are only `enroll_workflow_birth.v3` and `update_workflow.v3`.

**What it returns.** `StopResult` in the v6 schema (`$defs/StopResult`) is closed. It is `oneOf` one of:
- `{kind: "scheduler_fenced", source: StopSource}`
- `{kind: "unavailable", unavailable}`

It has no EventRecord, append or first-receipt member. Compare the started writer: `PublicationResult.original_append` → `FullOriginalAppend` → EventRecord (`Plans/executor_cancellation_contracts/schemas/workflow-start-custody.v2.schema.json`, `$defs/PublicationResult`).

**Its Stop is the Goal cancellation Stop.**
- `SchedulerStop` requires `goal_stop`, `native_cancel_result`, `native_cancel_origin`, `run_control_after` and `stopped_at_utc`. `StopSource` requires `native_cancel_result` (RunOperationResult) and `native_cancel_origin`.
- EP-119 (7674) reads StopIntent and StopReceipt "from the original Goal cancellation owner" and says: "the original native `RunOperationResult(operation=cancel)` and PublicationOrigin, and the immutable SchedulerStop/inventory cut are distinct real originals. Their root cancellation operation IDs … must join exactly."
- EP-119 (7676): "Stop must already fence the original run."

### F3. The native cancel result that `record_stop` needs has an unbound issuer, which is the D06 of Q-12

- EP-117 (7440): "`owner.executor.native.record_cancellation.v1` | Complete dependency contract only; no dispatch or later-state admission through this unit."
- `RunOperationResult.operation` is one of `materialize|graph_lock|replan|cancel`, in `native-worknode-current-activation.v1`. The family `executor_run_operation_result` has producers `materialize.v1`, `record_cancellation.v1` and `apply_graph_lock.v1` (`Plans/storage-plan.md` 25538). So `operation=cancel` comes only from `record_cancellation.v1`.
- The process answers name this the D06 issuer. Q-12: "no package supplies the issuer's source contract (`owner.executor.native.record_cancellation.v1` stays 'Complete dependency contract only' …) … the `goal_run.stopped` contract in A3 must not depend on D06 being available."
- A1's `stop-protocol.md` line 84 calls it "Original EP-119/D06 `StopSource`", which "requires its genuine original `SchedulerStop` … native `RunOperationResult` with `operation=cancel` …".
- **Result: any writer that requires `StopResult.scheduler_fenced`, `StopSource`, `SchedulerStop`, D05 or D06 violates Q-12.** D05 is included because EP-119 7674 makes D05 consume the native cancel and SchedulerStop.

### F4. D06 is the cancelled writer, and it moves a run to `cancelled`, never to `stopped`

- EP-118 (7565): "For a nonterminal Workflow, status becomes cancelled … Publish … original typed goal_run.cancelled/v3 EventRecord/own first barrier and D01 update".
- EP-121 (8395): "Original D01 update is owner_status with rule d06_cancel_nonterminal".
- GRS-080 (7502): "positive native cancellation from a genuine legal nonterminal Workflow, including blocked or stopped". So `stopped` is a source state of cancellation, not a product of it.
- GRS-080 (7506): "Only user_cancelled is admitted by this positive route". This is the precedent for admitting a single reason code.

### F5. What the precedent writers look like

| Family | Named writer (native owner) | Storage or coordinator participant | D01 observation rule | EventRecord in result |
|---|---|---|---|---|
| started v3 | `owner.workflow.activation.commit_start.v2` (EP-118 7535; GRS-079) | `owner.storage.workflow_start.commit_original.v2` | `original_workflow_start` | `PublicationResult.original_append` (EP-118 7541: "one authentic EventRecord append, its synced first barrier …") |
| cancelled v3 | D06 `owner.workflow.executor_cancel.publish_disposition.v3` under `original_bounded_safe_stop_terminal_publication.v1` (EP-118 7555; EP-121 8387) | same D06 coordinated outcome | `d06_cancel_nonterminal` (owner_status) | goal_run.cancelled/v3 EventRecord plus first barrier (EP-118 7565) |
| certified v3 | `owner.workflow.standard.publish_certified_joint.v1` and `owner.executor.workflow_standard.update_certified.v1`, both with an `event` realm argument `workflow_standard_event_prerequisite.v4#/$defs/OriginalEventPrerequisite` (native-v7 `methods.json`) | `Plans/goal_certified_event_coordinator_contracts/` | `original_standard_certification` (completion_certification) | through the coordinator (native-v7 `protocol.md` 99: "Only the genuine joint native transaction can make the native certified body … visible together with its required original Event publication") |

What all three share:
- The native owner changes the body status, and body revision advances once.
- D01 `update_workflow.v3` observes the change through a named `BoundTransitionRule`. D01 is never the issuer (EP-118 7523).
- The EventRecord and its first barrier are in the same joint native outcome.
- Each writer belongs to a fresh all-writers profile installed before birth. Examples:
  - `workflow_standard_source_contracts/protocol.md` 11: "applies only to a fresh original workflow birth … The previous all-writers v5 birth … cannot be retroactively enrolled"
  - GRS-084/085: certified v3 applies "only for a genuine fresh pm.executor.workflow_source.all_writers.v7 birth".

### F6. A1 EP-127/GRS-089 (v8 births) add a Stop route but no stopped writer

These are pending text on the A1 branch, not canon.

EP-127 (A1 `Plans/Executor_Protocol.md` 8915 ff.):
- 8923: "v6 and v7 births keep the ordinary Stop route of EP-118."
- 8938: "ordinary idle has only the ordinary Stop route, whose native cancel and SchedulerStop sources are not supplied here".
- 8946: "no WorkNode, attempt, effect, run control or result, scheduler value, SchedulerStop, Workflow body, Event or coordinator control changes".
- 8955: "No running external effect is undone, and nothing is declared cancelled or completed."
- 8957: Slot, SlotRevision and SlotOrigin "are the only durable afterimages; no header, family, audit stream, Event or retention rule is added".
- 8979-8982: record_cancellation.v1 "is an unbound dependency"; the revocation "never validate[s] as or substitute[s] for a D06 StopSource, SchedulerStop or RunOperationResult(operation=cancel)".
- 8985: "The limited operation appends no Event and adds no goal_run.stopped, goal_run.blocked or goal_run.cancelled writer."

GRS-089 (A1 `Plans/Goal_Runtime_System.md` 8267 ff.):
- 8278: "At ordinary idle the ordinary StopResult still needs its genuine native cancel and SchedulerStop sources, which this source does not supply."
- 8294: "Pause stays addressed by run ID and Abort is not a constant false permission."
- 8297: "The limited revocation appends no Event: no goal_run.stopped or goal_run.blocked writer is added (A3), and the D-R21 transitions are unchanged."

A1 v8 schema, `workflow-combined-stop-execution-revocation.v2`:
- `StopAcceptedRevocation` has `kind: "stop_execution_revoked_publication_pending"`, `action_authority: "revocation_only"` and `d06_coherent_publication: "requires_separate_original_cancellation_source"`.
- There is no event member.

**What v8 does give A3:** two sources that do not need D06, `RunRevocationCurrent` (`execution_revoked`) and `GoalStoppedCurrentAcquisition` (`goal_execution_revoked`). Both exist only for held Replan or certified slot phases. The ordinary idle phase still falls back to the D06-dependent route.

### F7. The Goal Stop latch does not need D06, but it is not settlement

- GRS-073 (6830): "manual Goal Stop/Pause/Resume/Cancel and actual run-binding changes must read/update this same original host-selected row".
- GRS 258: `cmd.chat.goal.pause` "Sets `paused`, latches the stop epoch, and cancels no workflow-owned record."
- native-v7 `protocol.md` 33 (U3): "New native work requires an admissible current Goal action and no accepted Stop/cancel/owner conflict". So a latched Goal Stop blocks *new* work in every profile.
- It does not prove that in-flight dispatches, attempts or effects are quiescent or settled. In canon, that aggregate is D05 (EP-119), which depends on StopSource and native cancel (F3).

### F8. The event's own contract requires settlement

D-R21 (`Plans/Goal_Runtime_System.md` 3764-3769):
- "`resumable=true` requires `safe_point_ref`, all child settlements, current storage/restore/permission evidence, and no unresolved mutation fence."
- Transition: `ready|running|provisional_success|verifying|failed_verification|repairing|blocked -> stopped`.
- The negative oracle for EA-UND-0021 (GRS 3799) rejects "unsettled child work … terminal source, or silent resume without new valid replan revision".

The v2 payload (`goal_run_stopped.schema.json`) requires `expected_goal_revision` (the Goal clock). There is no `goal_run_revision` or `idempotency_key`, unlike started and cancelled v3.

### F9. Callers and command expectations (DL-080 changes none of them)

- `Plans/UI_Command_Catalog.md` 8108: `cmd.orchestrator.pause` {`run_id`, `pause_scope`, `pause_reason`, `safe_point_required`, `idempotency_key`} → `goal_run.stopped`.
- `Plans/Wiring_Matrix.production.json`:
  - 40060-40066 `catalog.orchestrator_pause`, handler `handlers::orchestrator::pause`
  - 51931-51937 `catalog.runtime_abort_run`, handler `handlers::runtime::abort_run`
  - both expect `goal_run.stopped`
  - 52685 skip_node: "a separate run-stop event requires its own owner-admitted transition."
- **Conflict:**
  - `Plans/Wiring_Matrix.md` 483 maps `cmd.runtime.abort_run` to "record the investigation as `cancelled` with `stop_reason_code = investigation.cancelled_by_user`".
  - `Plans/human-in-the-loop.md` 2582 calls it "Cancel run command".

### F10. Downstream consumers halt on stopped rows

- GRS-079 (7447) and GRS-080 (7512) consumers stop before a same-run stopped row.
- GRS-085 (7885): "unsupported same-run replanned/blocked/stopped profiles … halt before that row".
- DL-080 (Decision_Log 1633; unit at 6633-6688) requires the contract to "name its writer" and extend GRS-085.

## 2. Candidate writers

### W-A. `owner.executor.workflow_source.record_stop.v1` for v6 and v7 births: **not viable**

Evidence: F2, F3, F1.
- It is not a Workflow body or update writer.
- Its closed `StopResult` has no event member.
- Its StopSource depends on `record_cancellation.v1`, which is the D06 of Q-12.
- It is the root Stop of *cancellation*, which ends in D06 `cancelled`.

To use it you would need:
- a new StopResult successor with an append member, under new resource IDs;
- a new all-writers profile (old births cannot be enrolled; F5);
- and it would still depend on native cancel.

That contradicts Q-12. **Reject.**

### W-B. The v8 `record_stop.v1` limited revocation, or `owner.executor.native.revoke_run_execution.v1` (A1): **not viable as the writer; usable as an input**

Evidence: F6.
- A1 excludes an Event, a Workflow body change and a stopped writer, in owner words (EP-127 8946, 8957, 8985; GRS-089 8297).
- Revocation does not settle effects (8955).
- It covers only held slot phases; ordinary idle uses the D06-dependent route (8938).

Making it the writer would require amending A1's frozen package (canonical-draft `bb6be609`) and its reviewed Stop root v2. **Reject as the writer.**

Keep `RunRevocationCurrent` (`execution_revoked` / `goal_execution_revoked`) as a D06-free *input* for v8 births.

### W-C (recommended). A new, separately admitted stop-disposition publisher of the Workflow run lifecycle owner

This follows the started and D06 pattern (F5). Every name below is a **proposal, not canon**:
- native publisher `owner.workflow.run_stop.publish_stopped.v1` (Executor/Workflow owner; issuer)
- Storage participant `owner.storage.workflow_stop.commit_original.v1`
- current and retained readers `owner.workflow.run_stop.read_current.v1` and `…read_retained.v1`
- recovery `owner.workflow.run_stop.recover.v1`

D01 `owner.executor.workflow_source.update_workflow.v3`, or its profile successor, observes the change with:
- a new `BoundTransitionRule` value, proposed `original_run_stop`, with `cause=owner_status`;
- a new `OriginalWriterOrigin` kind, proposed `run_stop_original`.

**Inputs.** These are Q-12-safe; none requires StopSource, SchedulerStop, RunOperationResult(cancel), D05 or D06:
- whole current D01 `CurrentSource` and native body/control;
- separate current Goal argument with the latched Goal host Stop (GRS-073 row);
- for v8 births, `RunRevocationCurrent`, acquired only through `read_run_execution_revocation.v1` (EP-127);
- a D06-free settlement or quiescence source. **This source does not exist yet (B1).**

**Outputs, in one joint native outcome:**
- native body `status → stopped`, revision +1, all other fields unchanged;
- matching control;
- D01 update, head, pointer and origin;
- compact intent, control, result and origin custody;
- one `goal_run.stopped` EventRecord, its first barrier and full-value custody.

Goal body and control, and the Stop latch, are preserved. There is no resume and no replan bump.

Minimal new owner text W-C needs (one unit each, following the certified split into prose then companions):
1. **EP (new unit, e.g. EP-128).**
   - Names the writer and states that it extends the Workflow writer list only for births of the profile that installs it.
   - EP-118 7523 "All unlisted Workflow writers remain refused" stays true for earlier profiles.
   - Gives the new transition rule and origin kind, the joint participant set, and the entry and final predicates.
   - States that StopSource, SchedulerStop, native cancel, D05 and D06 are not prerequisites. This is the Q-12 wording, mirroring EP-127 8979-8982.
   - States that D06 may later cancel a stopped run, citing GRS-080 7502.
2. **GRS (new unit, e.g. GRS-090).**
   - The event semantics.
   - The admitted `stop_reason_code` set. The proposal is `user_stopped` only, like GRS-080 7506 admits only `user_cancelled`; other reason codes stay unavailable.
   - The split clocks. The v2 payload uses `expected_goal_revision` (F8), so a v3 payload successor is needed, like started and cancelled.
   - An idempotency recipe. Proposed, modelled on EP-118 and GRS-080: `["pm.goal-runtime-event-idempotency.v3", scope_partition, "goal_run.stopped", project_id, goal_id, goal_revision, expected_goal_run_revision, goal_run_revision, goal_run_id, stop_reason_code, resumable]`.
   - The `resumable` branch rules (B3).
   - The GRS-085 extension.
3. **SP (new unit).** The physical custody families and append participant. The retention policy RP-AUTHORITY-INDEFINITE of registry row `event-family-goal-run-stopped` stays unchanged.
4. **CV (new unit).** The schema roots.
5. **Registry row.** Revision `2.0.0 → 3.0.0` with a Q-02 DL-036 card: before and after rows, and the registry SHA-256 before (`0be54418…c842` at origin/main) and after.

### W-D. Command handlers `handlers::orchestrator::pause` and `handlers::runtime::abort_run` as the writer: **not viable as the named writer**

They are command entries (F9). None of the precedents names a handler as the event writer: GRS-073 routes a command to native owners. They should be named as the *callers* of W-C. Abort also has conflicting semantics (F9).

### W-E. `goal_run.replanned` with `next_action=stop` (D-R19, GRS 3754): **out of scope; not a stopped writer**

It reaches `stopped` through the replanned event (F8 context), but A1 GRS-086 leaves the next action unchosen. The stopped contract should state that entering `stopped` by Replan is recorded by `goal_run.replanned`, not by `goal_run.stopped`, or leave this as an open question (Q5).

## 3. Blockers

- **B1. No settlement or quiescence source that avoids D06 (hard).**
  - D-R21 requires settled children and, for `resumable=true`, no unresolved mutation fence (F8).
  - The only census and settlement aggregate in canon is D05, which consumes StopSource and native cancel (EP-119 7674; F3).
  - The Goal Stop latch blocks only new work (F7).
  - v8 revocation keeps in-flight effects running (EP-127 8955).
  - **Options:**
    - (a) a new D06-free census source, which is owner work;
    - (b) admit only a "provably idle at Stop" branch from D01 `CurrentSource` (no unacknowledged dispatch, no running attempt, no capacity reservation) under the Goal Stop latch, with anything else `unavailable`;
    - (c) a product card.
  - This needs an owner or product decision before W-C's predicates can be written.
- **B2. The profile vehicle (hard).**
  - A new Workflow writer needs a new all-writers profile installed before birth (F5).
  - v8 (A1) explicitly adds none (F6).
  - **Options:**
    - (a) amend A1 before it lands, which reopens its frozen, reviewed package;
    - (b) a later `pm.executor.workflow_source.all_writers.v9`, which leaves v6, v7 and v8 births without a stopped writer;
    - (c) a profile-independent writer, which contradicts `RequiredOtherWorkflowWriterSource=false` and cannot be reached.
  - This decides which births the contract covers.
- **B3. Ordinary-idle v8 and all v6/v7 births have no D06-free execution fence apart from the Goal Stop latch.** The ordinary route needs native cancel (A1 GRS-089 8278; EP-127 8938). Coverage of v6 and v7 births is therefore likely `unavailable`, following the certified v7-only precedent.
- **B4. The resume rule depends on `goal_run.replanned`** (GRS 3468: "resumable only through a new revision and valid `goal_run.replanned` admission"), which is sequenced after A1/A2. The `resumable=true` branch cannot be exercised yet. Should the first contract admit only `resumable=false`? (Q3)
- **B5. The run-level versus Goal-level Stop authority is undefined.**
  - `cmd.orchestrator.pause` addresses a `run_id` (UCC 8108; A1 GRS-089 8294).
  - The only D06-free Stop authorities are Goal-level: the host Stop row (GRS-073) and `GoalStoppedCurrentAcquisition` (A1).
  - Does run Pause latch Goal Stop? Canon does not say.
- **B6.** Abort Run semantics conflict (F9): stopped per the production wiring, cancelled per `Wiring_Matrix.md` 483 and HITL 2582. DL-080 forbids rewiring, so the contract must pick the reading or send a card.
- **B7.** The payload is v2 with the Goal clock only. A v3 successor and a registry revision are needed, which falls under the Q-02 card (F8).

## 4. Open questions (not guessed)

- **Q1.** Is the owner of W-C Executor (native Workflow body) with Orchestrator as caller, as GRS-026 3911 puts it ("Orchestrator owns user-visible projections and Executor owns scheduler truth")? Or does DL-080's "Orchestrator and Executor" need a joint issuer?
- **Q2.** B1 option (a), (b) or (c)?
- **Q3.** Admit `resumable=false` only in the first contract (B4)?
- **Q4.** Which births: v8-before-landing amendment, or a v9 profile (B2)?
- **Q5.** Does entering `stopped` through Replan `next_action=stop` also emit `goal_run.stopped`, or only `goal_run.replanned`?
- **Q6.** Which reason codes other than `user_stopped` are admitted, and who issues automated stops (`budget_exhausted`, `verification_terminal_failure`, …)?
- **Q7.** A1 GRS-089 8295 leaves open what happens to an already durable held `goal_run.certified` Event when Stop revokes a held certified slot. Does it interact with the stopped transition, for example stopping a run in the `certified` phase, where a terminal source is illegal?
- **Q8.** B5 and B6: whether run Pause latches Goal Stop, and whether Abort Run records stopped or cancelled.

## 5. Corrections to the brief

- The DL-080 unit is at `Plans/Decision_Log.md` 6633-6688 on origin/main, not near 6211. The prose at 1609 is correct.
- `record_stop.v1` and `read_stop.v1` are not declared in `Plans/workflow_standard_source_contracts/methods.json` or `native-v7/methods.json`.
  - Those two files list 18 standard-source methods and pin `inputs/Plans/executor_cancellation_contracts/methods.json` (sha 0fbb8d53…) as the whole inherited map.
  - The declarations are in `Plans/executor_cancellation_contracts/methods.json` 148/175 and 490/547, and are re-identified in `workflow_standard_source_contracts/fresh-profile-methods.json` and `native-v7/fresh-profile-methods.json` 148/175.
- GRS-073 and GRS-078 are Goal *cancellation*, not Goal Stop and resume. Current Goal Stop/Pause is GRS-051 and `cmd.chat.goal.pause` (GRS 6659, 258).
- Canon's "D06" is the positive bounded terminal publication (`owner.workflow.executor_cancel.*.v3`, EP-118). Q-12, A1 EP-127 and A1 `stop-protocol.md` 84 use "D06" for the StopSource and native-cancel complex whose issuer is `record_cancellation.v1`. **The Q-12 constraint excludes both.**
