# S1: what current canon says about `goal_run.stopped`

- Label: S1-current-stopped. Program: Event Authority Step 8(b) Group A, branch A3 (the DL-080 current contracts), for `goal_run.stopped` only.
- Base: `origin/main` = `63cf2cb97f936c91dd7bb5c585d9a35d8409ed61` (2026-09-25 10:26 UTC). Everything was read as git objects. Nothing in the repository was modified.
- Line numbers are `origin/main` lines at that commit. Quotes are verbatim and shortened with "...".
- Pending (not canon): `origin/plans/replan-v8-a1-20260925` = `74c79b5bf900b37a7437ac3999bf546fca7b1827`, which is only summarised in section 12.

SHA-256 of the files cited, at the base commit:

| File | SHA-256 |
|---|---|
| Plans/event_family_registry.json (revision `2026-09-11.2`) | `0be544181eda423dcea4d8661206e7da6d066fdcf51913d5962f1a283635c842` |
| Plans/event_payloads/goal_runtime/goal_run_stopped.schema.json | `043212b8d2cdc1f65ffcac057f38f7b24ce82e7d46dc193f9975ba45ba545297` |
| Plans/event_payloads/goal_runtime/goal_stopped.schema.json | `26812b949780cf89e58b0bb1670d15b71f86b0cf4e8886394f298b6b7ccffd92` |
| Plans/Goal_Runtime_System.md | `f233eb9c22c5dd14e711523f968a1dad75727542998ac7f926c578499e572ad9` |
| Plans/Decision_Log.md | `0ca4f10131297113a0413c3bfb0d9d3481a8bd7301aea3aac7c3eafa8c2db506` |
| Plans/UI_Command_Catalog.md | `1866213d2640b13255a7638544c4c5e7dc0c2c74e93fe0b08ef9200268ca71f1` |
| Plans/Wiring_Matrix.production.json | `ef3085adb3068257c35b7d848fdf5f16c30257980ec1b414f02c4041c4232bed` |
| Plans/Orchestrator_Page.md | `ac2b4e5b3e867049a18e838c874eb45aa731cbfa5ae40f8bc38746c5f6f25f8f` |
| Plans/storage-plan.md | `011b88771f4a9fff2ed5448035e0b448232fcedfcc9eb51dcffbecfcc3fd67f7` |
| Plans/Executor_Protocol.md | `53125b0e45132356d0d316a172676cde8e6737c78c43012c9713e34fcd303c89` |
| Plans/Contracts_V0.md | `56742a9c78668b4856133be6179aa1e3e162a7a9d28cbeacd6c78f88c7dae6c9` |
| Plans/executor_cancellation_contracts/methods.json | `0fbb8d53064eaffd091cb0a1f071453e8cf9e460f897a41369f2b284b1cc08d1` |
| Plans/executor_cancellation_contracts/schemas/workflow-original-start.v2.schema.json | `9e0b863dde63528b1ea44f7bbc22f2483b78baac3ccc7b0e1b9242946de72b81` |
| reports/event-authority-20260911/step-08-depth42-assessment-20260924.json | `ba9b84f99e0e0761a8b435a16602d4c88d14589ef273f789fd5b92bdbd5849fd` |
| reports/event-authority-20260911/step-08-depth42-assessment-20260924.md | `cbf5debccd15135e2e769a39f201a26f59e96929fe6e6d7a61367fad5012c9e2` |

---

## 1. Summary

1. **What the event means.** The event records a Workflow GoalRun (the Orchestrator run, not the four-state Goal) entering status `stopped`. D-R21 (GRS l.3764-3768) defines the transition: "`ready|running|provisional_success|verifying|failed_verification|repairing|blocked -> stopped`; `stopped -> stopped` requires new settlement/recovery evidence. Certified/failed/cancelled sources are illegal."
   - `stopped` is fenced and not terminal. GRS l.3466: "`blocked` and `stopped` are fenced, resumable only through a new revision and valid `goal_run.replanned` admission."
   - A second route into `stopped` exists: `goal_run.replanned` with `next_action=stop` (D-R19, l.3754).
   - Two routes lead out of `stopped`: `goal_run.replanned` (D-R19) and `goal_run.cancelled` (D-R17, l.3740).
   - `goal_run.blocked` from `stopped` is illegal (D-R16, l.3733).
2. **Who performs the transition today.** No one. No current canon unit performs a Workflow transition into `stopped`.
   - EP-118's Workflow writer list refuses every unlisted writer (EP l.7523, "All unlisted Workflow writers remain refused by `RequiredOtherWorkflowWriterSource=false`"). Its closed `PublicationOwnerSource` kinds are `activation_original`, `d06_original`, `original_workflow_start` and, in v6/v7 only, `standard_original` (certification). None of them is a stop.
   - The native `RunOperationResult.operation` enum is `materialize | graph_lock | replan | cancel`, with no stop or pause.
   - Executor `owner.executor.workflow_source.record_stop.v1` only records a `SchedulerStop` (result kind `scheduler_fenced`). That record requires `goal_stop`, `native_cancel_result` and `run_control_after` selectors, so it belongs to the Goal Stop → D05 → D06 cancel path.
   - That path ends in `cancelled` and `goal_run.cancelled` v3, not in `stopped` (GRS-078 step 5, l.7341; GRS-080 l.7502).
   - Goal Stop and Pause latch the host stop epoch and "cancel no workflow-owned record" (GRS l.258). GRS-071 l.6659 says "Actual Workflow stopping, safe points, tool settlement and goal_run.stopped remain separately owned." No unit takes that ownership.
   - The only places that expect an emitter are the command catalog and the wiring: `cmd.orchestrator.pause` → `handlers::orchestrator::pause`, and `cmd.runtime.abort_run` → `handlers::runtime::abort_run`. Both expect `goal_run.stopped`, but no owner transition contract backs them.
   - The Executor `record_stop` method exists, but it is not a Workflow-status writer.
3. **Payload.** Schema `pm.goal_runtime_event.goal_run_stopped.schema.v2`, which is the shared Known-37 v2 Goal envelope plus a closed payload.
   - Required payload fields: `goal_run_id`, `stop_reason_code`, `child_settlement_refs[]` and `resumable`.
   - Optional: `safe_point_ref`, which is required when `resumable=true`.
   - `stop_reason_code` takes one of 10 values. Only `user_stopped` is user-initiated. There is no pause or abort value.
   - The envelope requires `expected_goal_revision` and has no Workflow revision fields. Section 3 has details.

---

## 2. Registry row (`Plans/event_family_registry.json`)

- The file is at revision `2026-09-11.2` with 42 families, and its SHA-256 equals the one pinned by depth42.
- The row is `#/families/5`, at l.242-283. Its exact byte span, l.242-283 including the trailing `},`, hashes to `d023087d8c2c081667497d6672a09277a0ceb2374a75cf441e663ef1a440a431`. The row serialised with sorted keys and compact separators hashes to `8acbc2495110aa3ee37fe7469603fe6240250f0a2a4bd756f8973dedc549e0a3`. This is for the "before" row on a DL-036 checkpoint card; the card should pin its own canonical form.
- The registry file last changed in commit `f6350caf` (2026-09-23, certified integration). The schema file last changed in `4869b4cb` (2026-09-11, DL-039 promotion).

| Field | Value |
|---|---|
| family_id | `event-family-goal-run-stopped` (l.243) |
| family_revision | `2.0.0` |
| event_type | `goal_run.stopped` |
| scope_policy | `project_only` |
| semantic_owner_doc | `Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima` |
| payload_owner_doc | `Plans/storage-plan.md#sp-214---goal-runtime-persistence-consumer` |
| payload_schema_id | `pm.goal_runtime_event.goal_run_stopped.schema.v2` |
| payload_schema_ref | path `Plans/event_payloads/goal_runtime/goal_run_stopped.schema.json`, `#`, same schema_id |
| legacy.aliases / admitted_extensions | `[]` / `[]` |
| legacy.identity_json_pointers | project_id `/payload/project_id`; thread_id `/payload/thread_id` (no run_id pointer) |
| referenced_event_id_pointer | `null` |
| redaction | `reject_unhandled_secrets`, transform null/null |
| source_refs | `...goal_run_stopped.schema.json#`, `Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima`, `Plans/Contracts_V0.md#cv-287---goal-runtime-event-schema-registration` |
| retention_policy_ref | `pm.storage_value_registry.v2` / `RP-AUTHORITY-INDEFINITE` / `1.0.0` |

The row has no explicit "owners" field. Ownership is carried by `semantic_owner_doc` and `payload_owner_doc`.

How the row compares with its siblings:

- `goal_run.blocked` and `goal_run.replanned` have the same v2 shape.
- `goal_run.replanned` and `goal_run.started` use `RP-RUNTIME-365D`. `blocked`, `cancelled`, `certified` and `stopped` use `RP-AUTHORITY-INDEFINITE`.
- The v3 precedents rewrote the owner anchors and the source refs:
  - `goal_run.started` 3.0.0: semantic `Plans/Goal_Runtime_System.md#GRS-079`, payload `Plans/storage-plan.md#SP-311`, 11 source_refs including `Plans/executor_cancellation_contracts/schemas/goal-run-started.v3.schema.json#`, EP-120, BRS-027, and the consumer schema, methods and resources.
  - `goal_run.cancelled` 3.0.0: `#GRS-080` / `#SP-312`, with the same pattern.
  - `goal_run.certified` 3.0.0: kept the old semantic and payload anchors and changed only its version and source refs. The Routing note at GRS l.2659 records this.

## 3. v2 payload schema (`goal_run_stopped.schema.json`, 870 lines)

- `$id` (l.763) and `schema_version` const are both `pm.goal_runtime_event.goal_run_stopped.schema.v2`. `event_name` const is `goal_run.stopped` (l.794).
- The file is self-contained with 21 common `$defs`. The root has `additionalProperties:false` and `unevaluatedProperties:false` (l.869).
- The root requires (l.847-867): `event_name, schema_version, occurred_at_utc, project_id, goal_id, goal_revision, actor_ref, execution_role, requested/effective_provider_ref, requested/effective_model_ref, requested/effective_account_ref, correlation_id, evidence_refs, artifact_refs, payload, expected_goal_revision`.
- Optional root fields: `thread_id`, `parent_goal_id` (l.821), `causation_event_ref`, `idempotency_key` (l.815), `approval_refs` (min 1) and `block_refs` (min 1).
- `#/$defs/event_payload` (l.275-333) is closed:
  - `goal_run_id`: non_empty_ref, required.
  - `stop_reason_code`: enum, required. Values: `user_stopped, forbidden_action, missing_source_ledger, missing_plans_or_target, permission_or_filesystem_failure, unsafe_or_destructive_scope, contradictory_goal, infrastructure_blocker, budget_exhausted, verification_terminal_failure`. GRS l.3499 defines this list as `StopReasonCode`.
  - `child_settlement_refs`: ref_array, required, may be empty, unique.
  - `resumable`: boolean, required.
  - `safe_point_ref`: non_empty_ref, optional. An `if resumable=true then required safe_point_ref` clause enforces it.
- Owner-only predicates (`$comment` l.276): "Complete child settlement, safe-point/current Storage/restore/permission evidence, mutation-fence truth, materially new repeated stop, future replan admission, and legal lifecycle transitions remain owner/runtime predicates."
- The root `$comment` (l.2) says the schema has authority status only: "Schema authority does not establish Event Authority contract depth, registry admission, runtime proof..." It also states the D-CAS-01 content: "goal_revision = expected_goal_revision + 1 and expected_goal_revision = current.goal_revision remain owner/runtime equality predicates".
- There are no `expected_goal_run_revision`, `goal_run_revision` or required inner `idempotency_key` fields. The v3 GoalRun envelope requires all three (GRS-079 l.7439, GRS-080 l.7504, and the GRS l.2659 Routing note).
- The legacy aggregate `Plans/goal_runtime_events.schema.json` (`pm.goal_runtime_events.schema.v1`, l.51 lists the name) is reader-only input (GRS l.2676).

## 4. Goal_Runtime_System owner text for `goal_run.stopped`

- **Payload-minima row** (l.2655): "| `goal_run.stopped` | `goal_run_id`, `stop_reason_code`, `safe_point_ref?`, `child_settlement_refs[]`, `resumable` |". Unlike the started, cancelled and certified rows, it carries no v3 qualification. The shared envelope is at l.2627.
- **Data-shape list** (l.2620): "plus Orchestrator GoalRun projections from `goal_run.started`, ... and `goal_run.stopped`."
- **K37 materialization table** (l.3560): `EA-UND-0021-GOAL`, the family, the schema ID and the path. Its ordered semantic identity is `goal_run_id,stop_reason_code,resumable`.
- **v2 idempotency** (Section 7.1, l.3570-3592): `"pm.goal-runtime-event.v2:" + lower_hex(sha256(JCS(["pm.goal-runtime-event-idempotency.v2", scope_partition, event_name, project_id, goal_id, goal_revision, ...ordered_row_semantic_identity])))`.
  - The lifetime domain is `(scope_partition,event_type,idempotency_key)`.
  - Error results are `idempotency_conflict`, `dedupe_unavailable` and `revision_conflict` (stale `expected_goal_revision`).
  - Replay rebuilds only disposable projections.
- **Outer join** (Section 3.3, l.3438-3440): "`run_id=payload.payload.goal_run_id` for the six GoalRun rows".
- **Section 4.2 GoalRun state** (l.3464-3466): `GoalRunStatus = ready | running | provisional_success | verifying | failed_verification | repairing | certified | failed | blocked | cancelled | stopped`. "`certified`, `failed`, and `cancelled` are terminal. `blocked` and `stopped` are fenced, resumable only through a new revision and valid `goal_run.replanned` admission."
- **D-R21** (l.3764-3768):
  - Fields: `R{goal_run_id:ref,stop_reason_code:StopReasonCode,child_settlement_refs:ref[],resumable:boolean}; O{safe_point_ref:ref}`.
  - Branches: "`resumable=true` requires `safe_point_ref`, all child settlements, current storage/restore/permission evidence, and no unresolved mutation fence. `resumable=false` forbids future resume without a distinct replan that proves changed admission conditions."
  - Transition: quoted in section 1.
  - Basis: "`C-GRS-MIN`, `C-GRS-LIFE` (`GRS-026`, `GRS-034`, `GRS-043`), `D-R21`".
- **Oracle pair** (l.3799): positive: "Stop a running GoalRun with settled children and validated safe point; projection becomes fenced resumable `stopped`." Negative: "Reject resumable without safe point/current admission evidence, unsettled child work, unknown reason, terminal source, or silent resume without new valid replan revision."
  - Automated_Testing_System mirrors both at l.2508-2509 as `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION`.
  - Plans/.audits/event-authority-2026-08-12/oracle-harness/fixtures/goal_run_stopped/{positive,negative}.json are audit lineage only. Their positive fixture uses `goal_revision=1` with `expected_goal_revision=1`.
- **Common failure table** (l.3810-3822): an illegal edge gives `illegal_transition`. Unknown schema or version is quarantined without checkpoint advance. "A projector advances its checkpoint only after all events through that sequence validate and apply atomically."
- **Basis units:**
  - GRS-026 (l.3903): the GoalRun envelope, where "Executor owns scheduler truth".
  - GRS-034 (l.4492): interrupt/cancel settlement across provider stream, subprocess, MCP call, browser/device and child run; "no conversion to success/failure".
  - GRS-043 (l.5284): project-scoped EventRecord 2.0, where "Current run scheduling still applies every actual storage/permission/recovery/stop-epoch gate".
- **GRS-065** (l.6089): "The four-state text-first Goal remains under GRS-064; Workflow GoalRun status is separate."

### Neighbouring D-rows that involve `stopped`

- D-R16 `goal_run.blocked` (l.3733): "Certified/failed/cancelled/stopped sources are illegal."
- D-R17 `goal_run.cancelled` (l.3740): "any nonterminal GoalRun state, including `blocked|stopped`, -> `cancelled`". GRS-080 l.7502 repeats this for v3: "positive native cancellation from a genuine legal nonterminal Workflow, including blocked or stopped."
- D-R19 `goal_run.replanned` (l.3753-3754): the allowed actions include `stop`. The sources include `stopped`, and "`stop=>stopped`".

## 5. Goal-side stop, pause and abort text (not the Workflow transition)

- **Goal V2 lifecycle** (l.95): "exactly `active | paused | blocked | completed`... `paused` means the user stopped continuation." Goal V2 has no `stopped` state.
- **Commands** (l.258): `cmd.chat.goal.pause` "Sets `paused`, latches the stop epoch, and cancels no workflow-owned record. Nothing may auto-resume afterwards." `cmd.chat.goal.cancel` (l.260): "Workflow-owned records remain under their owners."
- **GRS-051** (l.503): "A manual Stop, Pause, or Cancel is authoritative and terminal for automation... discarded by stop-epoch comparison at dispatch time." Tokens: `manual_stop_latched`, `user_stop_epoch`.
- **Goal V2 events** (l.272): `goal.paused` and `goal.resumed` are required names, each needing its own registration. None of them is `goal_run.*`.
- **Historical `goal.stopped`** (GRS-071, l.6578-6667; registry `event-family-goal-stopped@2.0.0`, row l.748; schema SHA above):
  - Every current writer is refused: "every current writer is refused before dedupe/CAS/outbox/append".
  - Its reader is `storage.goal_stopped_history_read.v1@1.0.0` under SP-302 (SP l.24714), with checkpoint `none_required`. CV-345 and SP-214 l.15154 apply the qualification.
  - Key sentence (l.6659): "Current Goal Stop/Pause follows GRS-051 and cmd.chat.goal.pause... Actual Workflow stopping, safe points, tool settlement and goal_run.stopped remain separately owned. No automatic alias from goal.stopped to goal.paused or goal.cancelled."
  - D-R12 (l.3695-3701) keeps the richer historical fields: `interruption_boundary` (4 values), `tool_settlement_refs`.
- **Goal Stop in the Workflow cancel route** (GRS-078, l.7317+):
  - `owner.goal.host_stop@1.0.0` performs C-stop, giving StopControl, StopReceipt and `cancellation_pending`.
  - D05 then performs safe-stop aggregation.
  - Then "If Workflow was nonterminal, D06 performs its original cancelled run transition and its own original `goal_run.cancelled` event".
  - In current canon, Goal Stop therefore leads to Workflow **cancelled**, not **stopped**.
- **GRS-079** (l.7449) and **GRS-080** (l.7514): current reads treat "pending/Stopped authority" and "separate current Goal Stop/current-controls arguments" as currentness inputs only.
- **PlanRun** (l.5420, PGOAL): "`cmd.chat.goal.pause` pauses the bound `PlanRun` at a shared safe boundary". This concerns the Assistant Plan runtime and is not a Workflow GoalRun.

## 6. Commands and production wiring

UI_Command_Catalog:

- l.8076 header: `| Command ID | Payload fields | Result fields | Error/disabled fields | Receipt or event effect |`.
- **l.8108**: "| `cmd.orchestrator.pause` | `run_id`, `pause_scope`, `pause_reason`, `safe_point_required`, `idempotency_key` | `run_id`, `pause_receipt_ref`, `resumable` | `permission_denied`, `blocked_state_required`, `stale_projection` | `goal_run.stopped` |"
- l.8109: `cmd.orchestrator.resume` takes `expected_goal_revision` and emits `scheduler.pass`, not `goal_run.replanned`.
- l.1166: "| `abort_run` | `cmd.runtime.abort_run` | `{ run_id }` |". The same runtime allowed-action table also maps `replan` to `cmd.runtime.replan`.
- **l.8148**: "Dispatch emits `node.unblocked`, `safe_point.restored`, `scheduler.pass`, `goal.replanned`, `goal_run.stopped`, or an explicit dispatch receipt; it must not emit `runtime.command_applied`." `goal.replanned` is historical-only under GRS-070. The depth42 gap note flags this.
- UCC-108 (l.8150+): the FABLE unit preserves `cmd.orchestrator.pause` and `abort_run` as tokens and adds "Do not treat command-catalog or wiring rows as runtime certification evidence."
- `cmd.run.stop` (UCC l.10776; Commands_System l.4552, "Stop Run — requests run stop; precondition `run_active`", `two_step`) has no expected event. WM `catalog.run_stop` has `expected_event_types: []`. OP-034 (OP l.2631) says it "requests run stop through the existing stop/lifecycle path (referenced)". No unit binds that path to `goal_run.stopped`.

Wiring_Matrix.production.json:

- **`catalog.orchestrator_pause`** (l.40060-40120): ui_location "Orchestrator > Pause", handler `handlers::orchestrator::pause`, `expected_event_types: ["goal_run.stopped"]`, effect_contract `receipt_or_event_refs: ["goal_run.stopped"]`. The test requires: "Assert cmd.orchestrator.pause emits goal_run.stopped with command_id, origin, correlation_id, and handler target."
- **`catalog.runtime_abort_run`** (l.51931-51980): ui_location "Orchestrator > Blocked run actions > Abort Run", handler `handlers::runtime::abort_run`, `expected_event_types: ["goal_run.stopped"]`. The test requires: "Assert cmd.runtime.abort_run emits canonical event type goal_run.stopped with command_id, origin, correlation_id, and handler target."
- **`catalog.runtime_skip_node`** (l.52630+): a repair precedent (reports/.../step-08-skip-node-wiring-validation.md) removed an unconditional stopped expectation: "Assert cmd.runtime.skip_node does not unconditionally emit goal_run.stopped... a separate run-stop event requires its own owner-admitted transition."
- Other rows: `catalog.orchestrator_resume` → `scheduler.pass`, `catalog.runtime_replan` → `goal.replanned`, `catalog.chat_stop` → `[]`, and `assistant.redesign.w_007.chat_goal_pause` → `[]`.
- In total, 10 string occurrences of `goal_run.stopped` sit in 3 entries, and only pause and abort_run expect it.

## 7. Orchestrator_Page status projection

- **OP-022** (l.1571-1600): "Projected GoalRun and WorkNode statuses include ready, running, provisional_success, verifying, failed_verification, repairing, certified, failed, blocked, cancelled, and stopped, with contract, storage, permission, worktree, and model-owner records remaining authoritative". The acceptance criterion says they "distinguish ... stopped".
- OP-025 (l.1790) lists "pause, cancel, resume" as launch-chain commands that need an enablement, receipt and recovery definition.
- OP l.244 records terminal precedence receipts such as `already_stopped`, which apply to external side effects.
- The run-start reader (l.2730): "Historical start evidence cannot make a stopped/terminal run active, imply completion, or enable resume/retry."
- The Orchestrator owns projection only. No OP unit names a writer or an event contract for stop.

## 8. Storage and projection

- **SP-214** (l.15097+): the payload owner.
  - It lists `goal_run.stopped` among persisted GoalRun events (l.15107) and names projection `goal_run_projection.v1:{project_id}:{goal_run_id}`.
  - Its acceptance criteria say "Rebuild applies only to an individually admitted projection route" (l.15187-15192). No route is admitted for stopped.
  - For certified, the mandatory projection role "is carried by GRS-085 in the two SP-317 families rather than by goal_run_projection.v1" (l.15199-15202).
- **Retention table RET-K37-ASSIGNMENT-001** (l.17969): `goal_run.stopped` is under `RP-AUTHORITY-INDEFINITE@1.0.0`, one of 23 families. storage_value_registry l.95 has `retention_mode: indefinite`.
- **The mandatory run-history projection stops on stopped rows:**
  - GRS-079 l.7447: "this same run's replanned, blocked, certified, cancelled or stopped event is unsupported by this bounded reducer and stops before its row."
  - GRS-080 l.7512: "Same-run replanned, blocked, certified, stopped ... halts before its row".
  - **GRS-085** l.7883: "unsupported same-run replanned/blocked/stopped profiles ... halt before that row; they do not silently advance checkpoint."
  - SP-311 and SP-312 (l.25984, l.26136): `UNSUPPORTED_RELEVANT_EVENT`, "halt immediately before the row".
  - Plans/goal_run_certified_consumer_contracts/protocol.md l.53: "Same-run replanned, blocked, stopped ... halts before its row."
  - SP-317 (l.26613) registers `goal_run_started_cancelled_certified_projection` and `_checkpoint` (dataset `goal_run_projection.v5@<generation_id>`, `RP-PROJECTION-3GEN@1.0.0`). Retention is source-coupled: "Start retains RP-RUNTIME-365D..., cancelled/certified authority retains RP-AUTHORITY-INDEFINITE".
- Consequence: a real `goal_run.stopped` row in a run with a projection would stall the mandatory projection. DL-080 requires extending GRS-085 to cover stopped rows.

## 9. Executor and native sources: who could write `stopped`

- **EP-118** (l.7517-7523): the writer list is quoted in section 1.2. It ends "this adoption supplies no completion, certification, ownership-transfer or optional/replanned materialization route." It also says "Every materialization/attempt registration, ... Stop recording/recovery and current/Stop reader uses its complete original method input".
- **`owner.executor.workflow_source.record_stop.v1`** (methods.json `/workflow_source_methods/methods/13`, boundary `record_stop`, protocol EP-118):
  - Result `StopResult` is `oneOf {kind:"scheduler_fenced", source:StopSource} | {kind:"unavailable"}`.
  - `SchedulerStop` requires `scope, operation_id, transaction_id, scheduler_before, scheduler_after_revision, inventory_cut, goal_stop, native_cancel_result, native_cancel_origin, run_control_after, stopped_at_utc`. Its storage family is `pm.storage_value.executor_workflow_scheduler_stop.v2`.
  - It fences the scheduler and does not write Workflow body status. It depends on a native cancel result.
- **Native schema** (Plans/workflow_activation_contracts/schemas/native-worknode-current-activation.v1.schema.json): `RunOperationResult.operation` enum is `["materialize","graph_lock","replan","cancel"]`. `RunExecutionControl` has `cancellation` but no stop field.
- **Workflow body status enums** include `stopped`: workflow-original-start.v2 l.2403-2416, workflow-activation.v3/v4 l.1833, and native-v7 v6 l.2475. The D06 positive schema's `NonterminalBody` includes `stopped` (workflow-cancel-positive-safestop.v1 l.189). The body state exists, but no writer produces it.
- **D06 issuer**: `owner.executor.native.record_cancellation.v1` reads "Complete dependency contract only; no dispatch or later-state admission through this unit." (EP l.7440). Q-12 rules that the stopped contract must not depend on D06.
- **Assignment in canon**: DL-080 assigns the writer to "The Workflow run lifecycle owner (Orchestrator and Executor, with Goal Runtime and Storage)". It names no method, handler or native operation.

## 10. DL-080 (the answer being implemented)

- Prose is at DL l.1609-1637. The unit is at **l.6633-6700**; the brief said "near 6211", but at this commit it is 6633.
- Key text (l.1633): "Each contract names the family's writer, which the Workflow writer list lacks today, and extends the mandatory run-history projection (GRS-085) to its rows. ... It changes no registry row, command, wiring or resume rule, and registers, admits or removes nothing."
- Acceptance criteria (l.6657-6660): the stopped and blocked contracts land first, each "with a named writer and its rows carried by the mandatory GRS-085 run-history projection"; "The Pause and Abort Run wiring and the resume rule keep expecting these events."
- Negative constraint: "Do not retire the three families or rewrite the Pause, Abort Run or resume wiring to stop expecting them."
- Why (l.1617): "The Pause and Abort Run commands and their production wiring expect `goal_run.stopped`, the rule for resuming a blocked or stopped run depends on `goal_run.replanned`".
- Card `EA-S08D-GOALRUN-LIFECYCLE-EVENTS-001` (product-cards l.40-63). decision-responses.jsonl l.22 records `card_status: approved_recorded_owner_contract_pending`.

## 11. depth42 row (`EA-STEP08-LIVE42-DEPTH-20260924`)

- The row sits in the .json at `rows[]`, `event_type=goal_run.stopped`, and in the .md at l.84: `P | P | p | C | p | p | P | p | p | A | p | p | 3`.
- Registry pinned `2026-09-11.2` / `0be54418…`, the same as today. Assessed tree `f1ce058c`, so line numbers in the evidence differ slightly from the current ones.
- Disposition `UNDISPOSITIONED`, pass_count 3, `normative_depth_complete=false`, `native_execution=NOT_RUN`, grading batch GC. The criteria total 3 PASS, 7 PARTIAL, 1 CONFLICT and 1 ABSENT.
- Current owner units listed: Known-37 D-R21, GRS-026/034/043/041/065/071/075/079/080/082/085, EP-118, CV-287, SP-214, SP-312 (started/cancelled only), the UCC FABLE rows, the WM pause/abort_run rows, and SP-278 and SP-286 ("not adopted").

| # | Criterion | Status | Finding (short verbatim) | Change |
|---|---|---|---|---|
| 1 | membership_version | PASS | "Registry row #/families/5 registers ... at 2.0.0, project_only ... Membership says nothing about current emission." | carried |
| 2 | owner_doc | PASS | "GRS-071 says goal_run.stopped remains 'separately owned', but no other unit governs it, so there is nowhere to reroute." | carried |
| 3 | producer | PARTIAL | "No ordering of settlement, safe point, append and first receipt, or SP-286 adoption exists; EP-118 refuses unlisted Workflow writers, and the skip_node row requires a separately owner-admitted run-stop transition." | carried |
| 4 | closed_payload_schema | CONFLICT | "requires expected_goal_revision and, by D-CAS-01, advances the Goal revision on each GoalRun stop, with no Workflow revision fields... Current GoalRun contracts keep the Goal revision unchanged, use goal_run_revision fields... child_settlement_refs relies on child wording that current text treats as lineage (GRS-075: empty only)." | carried |
| 5 | scope_identity | PARTIAL | "Missing: the Workflow revision joins..., a required inner idempotency_key, and a registry run_id pointer; the wiring rows' command_id/correlation joins have no event contract." | carried |
| 6 | replay_idempotency | PARTIAL | "Current GoalRun routes use v3 keys and a lost-acknowledgement rule this family lacks; SP-286 is unadopted and no projection is registered." | carried |
| 7 | retention | PASS | "RP-AUTHORITY-INDEFINITE@1.0.0 ... The family owns no admitted projection or checkpoint ..., so no further policy is due" | carried |
| 8 | redaction_custody | PARTIAL | "Custody is absent: no unit names who holds the original stop record, safe-point and settlement refs, their backup/restore coherence, or access and deletion checks at read." | carried |
| 9 | transitions | PARTIAL | "D-R21 gives exact edges into stopped... The edges are unadopted: EP-118 admits no writer, GRS-085 halts on same-run stopped, resumption hinges on an unadopted goal_run.replanned, and 'all child settlements' is unreconciled with GRS-075." | upgraded from CONFLICT |
| 10 | consumers_checkpoints | ABSENT | "No consumer exists. The only current GoalRun projection (GRS-085...) halts before a same-run stopped row... SP-214's goal_run_projection.v1 inventory is not an admitted route, and no SP-278 adoption exists." | carried |
| 11 | compatibility_withdrawal | PARTIAL | "There is no withdrawal protocol, and the wiring rows still expect emission. The skip_node repair shows the owner removing an unsupported goal_run.stopped expectation row by row" | carried |
| 12 | positive_negative_oracles | PARTIAL | "EA-UND-0021 has one positive and one negative oracle in prose... No v2 fixtures exist, and the owner-named fixture check validates only legacy v1." | carried |

The row's three `remaining_gaps` notes, verbatim in substance:

1. "ANSWERED by DL-080 ... Until that contract lands, the family stays UNDISPOSITIONED and its grades stand."
2. "Owner work under DL-080: ... must write a v3 successor on the current GoalRun envelope, add EP-118 writer listings for the pause/abort handlers, order settlement, safe point, append and first receipt with SP-286, add GRS-085/SP-312 reducer support (today a same-run stopped row halts the mandatory projection) or a consumer adopting SP-278 with the DL-076 token, and reconcile D-R21 'all child settlements' with GRS-075."
3. "UCC l.8148 still lists goal.replanned, historical-only under GRS-070, among runtime dispatch events; it needs owner reconciliation alongside the goal_run.stopped contract."

Per Q-03, the new single-family assessment for the revised row cannot cite this depth42 row, which is at `family_revision 2.0.0`, once the registry row changes.

## 12. Pending context from the A1 branch (not canon; `74c79b5b`)

- EP-127 (EP-a1 l.8915+): "For a genuine v8 birth, Stop against the combined operation slot is a limited run-execution revocation ...; v6 and v7 births keep the ordinary Stop route of EP-118." It also says "The limited operation appends no Event and adds no goal_run.stopped, goal_run.blocked or goal_run.cancelled writer." (l.8985). The D06 issuer is unbound.
- GRS-089 (GRS-a1 l.8267+): "The limited revocation appends no Event: no goal_run.stopped or goal_run.blocked writer is added (A3), and the D-R21 transitions are unchanged." Also: "Pause stays addressed by run ID and Abort is not a constant false permission." The event side of a revoked held certified slot "stays open, its Event side with the Event contract work A3."
- GRS-087 (l.8093) names A3 as owner of the replanned, blocked and stopped contracts.
- Implication for A3: in v8, Stop is a revocation with no Event and no status write. A `goal_run.stopped` writer is therefore still undefined for every profile (v6, v7 and v8).

## 13. Open questions (not decided here)

1. **Pause versus Abort semantics.**
   - Both are wired to the same event. D-R21 `stopped` is fenced, nonterminal and resumable only through `goal_run.replanned`.
   - "Abort Run" (Blocked run actions) reads as terminal, and D-R17 `cancelled` is the terminal user route.
   - Canon does not say whether Abort maps to `stopped` with `resumable=false`, or which `stop_reason_code` it uses. The enum has only `user_stopped` for user actions and no pause or abort distinction.
2. **Command-to-payload mapping.**
   - `cmd.orchestrator.pause` has payload `pause_scope`, `pause_reason` and `safe_point_required`, and result `pause_receipt_ref` and `resumable`.
   - The v2 payload has no scope, reason text or receipt field (compare `goal_run.blocked`'s `block_receipt_ref`).
   - `pause_reason` is not typed as `StopReasonCode`.
   - `cmd.runtime.abort_run` carries only `{ run_id }`.
3. **Writer identity.**
   - The candidates are the Orchestrator/Executor handlers `handlers::orchestrator::pause` and `handlers::runtime::abort_run`, a new native run operation (the enum has no stop), or a new EP-118 `PublicationOwnerSource` kind.
   - `record_stop.v1` is scheduler-only and cancel-coupled. Canon names no Workflow-status stop writer. Q-12 rules that the writer must not rely on D06 or `record_cancellation.v1`.
4. **Goal Stop versus Workflow stopped.**
   - Does a Goal Pause or Stop (`cmd.chat.goal.pause` or host Stop) ever produce Workflow `stopped`?
   - Canon says Goal Pause "cancels no workflow-owned record", and Goal Cancel uses Stop → D05 → D06 → `cancelled`.
   - Whether a `stopped` run requires or implies a latched Goal Stop epoch is unstated.
5. **The D-R21 "safe point".** Canon does not say whose safe point it is: a FileSafe `safe_point_id` as in `cmd.runtime.restore_safe_point_then_retry`, the D05 bounded safe-stop, or an Executor checkpoint. "Current storage/restore/permission evidence" is not bound to any owner method.
6. **Child settlements.** `child_settlement_refs` is required and D-R21 asks for "all child settlements", while GRS-075 authenticates child requirements as empty. It is unclear whether the v3 successor keeps the field as always-empty, renames it to WorkNode, attempt or tool settlement, or drops it. GRS-034 settlement covers the provider stream, subprocess, MCP, browser/device and child run.
7. **Envelope successor.** The v2 envelope requires `expected_goal_revision` and, by D-CAS-01, advances the Goal revision. The started and cancelled v3 precedents use `expected_goal_run_revision`/`goal_run_revision`, an unchanged `goal_revision`, a required inner `idempotency_key` and the `pm.goal-runtime-event.v3:` key. A v3 schema resource and home directory are needed; the precedents are `Plans/executor_cancellation_contracts/schemas/goal-run-{started,cancelled}.v3.schema.json` and certified's `Plans/workflow_standard_source_contracts/schemas/`.
8. **Resume path dependency.** `stopped` exits only through `goal_run.replanned` (A1/A2 and later) or `cancelled`. Until the replanned contract lands, `resumable=true` cannot be acted on. Should the stopped contract state that?
9. **Second route into stopped.** D-R19 `next_action=stop` is a separate route that belongs to the replanned contract. The stopped contract should say whether it covers only the direct D-R21 edge.
10. **Retention and projection.** `stopped` is `RP-AUTHORITY-INDEFINITE`, while the other rows of the run it would join are `RP-RUNTIME-365D` (started) and `RP-AUTHORITY-INDEFINITE` (cancelled/certified). Extending the SP-317 source-coupled lifetime text needs a stopped line. The registry row keeps its retention unless a card changes it.
11. **Registry anchors for the revised row.** Will the semantic and payload owner anchors move to new GRS/SP unit IDs, as for started and cancelled, or stay on payload-minima/SP-214, as for certified? Q-02 requires exact before and after rows plus registry SHA-256 before (`0be54418…`) and after.
12. **Stale neighbouring text.**
    - UCC l.8148 lists `goal.replanned`, which is historical-only.
    - The Contracts_V0 roster l.3683-3691 still lists v2 roots for started, cancelled and certified.
    - The GRS payload-minima row for stopped (l.2655) will need a v3 qualification like l.2654.
    - Whether A3 touches these is open.
