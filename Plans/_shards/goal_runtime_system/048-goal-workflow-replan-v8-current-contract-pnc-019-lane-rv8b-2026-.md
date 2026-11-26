# Shard 048: Goal Workflow Replan v8 current contract (PNC-019 lane rv8b, 2026-11-14)

Source: `Plans/Goal_Runtime_System.md`

Source lines: L10307-L10447

Source SHA256: `828fae2e8d97ac26de741feb064e70475c62350b769071666b9e5a52fbc7a128`

---

## Goal Workflow Replan v8 current contract (PNC-019 lane rv8b, 2026-11-14)

DL-080 option 1 made `goal_run.replanned` a current event, written after `goal_run.stopped` and `goal_run.blocked` and after the Workflow Replan source work. That source work is the frozen `pm.executor.workflow_source.all_writers.v8` package, accepted by an independent review on 2026-11-14 (ACCEPT_WITH_NOTES) and adopted by EP-3100. The two units below are the family's current Goal Runtime contract. They are newly authored owner contracts under DL-045 and choose no product behaviour: the six next actions, their successors and the resume fence are D-R19, D-R21 and Known-37 4.2 as written; the cancel reconciliation follows GRS-080's ownership of positive cancellation.

### GRS-3100 - Current goal_run.replanned contract

```yaml
plan_unit_id: GRS-3100
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: |-
  Newly authored owner contract under DL-045, written for DL-080 option 1 (PNC-019 lane rv8b, 2026-11-14), for exactly goal_run.replanned, Project edition. Producer: owner.executor.workflow_run.replan.v1 (EP-3101), installed only at a genuine fresh pm.executor.workflow_source.all_writers.v8 birth (EP-3100); every other birth refuses it. Payload: pm.goal_runtime_event.goal_run_replanned.schema.v3 (CV-3100) on the GoalRun envelope grammar CV-288 keeps for Event Authority custody after DL-478: the Goal revision is unchanged context, expected_goal_run_revision is the authentic native Workflow body revision immediately before the replan's native application and goal_run_revision is exactly one higher; neither is graph generation. Transitions adopt D-R19 over the native Workflow status set: running|provisional_success|verifying|failed_verification|repairing|blocked|stopped -> successor by action, continue_running=>running, repair=>repairing, remain_blocked=>blocked, stop=>stopped, begin_verification=>verifying; ready, certified, failed and cancelled sources are illegal. The cancel action is never published by a replan: the manager's cancel decision is carried out only by genuine D06 positive cancellation (GRS-080), whose goal_run.cancelled v3 row supplies the cancelled successor D-R19 names (adoption correction C7). replan_generation is the authentic prior generation plus one under the checked u32 rule; previous and new WorkGraph refs differ; every affected WorkNode has exactly one cancelled or resteered original disposition record (a total bijection); the payload carries the exact requested, validated and applied graph-patch history and the applied record equals the validated one except status. Resume: on a v8 birth, blocked and stopped are left only through a later valid goal_run.replanned row (Known-37 4.2) or D06 cancellation; a stopped run whose last stop said resumable=false needs a replan whose original sources prove changed admission conditions (D-R21). Births without the v8 Replan writer keep their fence: a stopped or blocked run there leaves only by D06 (GRS-200, GRS-201). The whole v2 payload stays the historical reader. Prepared without admission: the registry row keeps v2 until the S5b switch.
gui_related: false
gui_classification_reason: Defines event, writer, persistence or projection contracts; no visual surface.
split_recommended: false
depends_on:
- GRS-075
- GRS-079
- GRS-080
- EP-3101
- CV-3100
- SP-3100
- DL-080
- DL-045
unblocks: []
acceptance_criteria:
- Only EP-3101's Replan writer appends goal_run.replanned v3, after native application and producer finalization, on a v8 birth only.
- Every D-R19 edge is checked against the authentic native Workflow status before the replan's native application; ready and terminal sources refuse.
- A replan whose next_action is cancel is refused before any effect; the cancelled successor is reached only through D06 and goal_run.cancelled v3.
- replan_generation is the prior generation plus one, below 4294967295; the WorkGraph refs differ; affected WorkNodes and disposition records are a total bijection.
- goal_run_revision is expected_goal_run_revision plus one and the Goal revision is unchanged; a v2 expected_goal_revision is never read as a Workflow clock.
- A stopped run with resumable=false is resumed only by a replan whose original sources prove changed admission conditions.
- On a birth whose profile lists no Replan writer, a blocked or stopped run is not resumed by any replan.
validation_surfaces:
- Plans/event_payloads/goal_runtime/goal_run_replanned.v3.schema.json
- Plans/goal_run_replan_contracts/oracle-fixtures.json
- python3 scripts/pm_goal_run_replan_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: goal_run_replanned_contract
reasoning_tier: high
context_scope: goal_run_replanned_current
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-080
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PM-Experiments/goal-replan-combined-source-20260921/v3/manifest.json (sha256 9ed8ba4f825939cc59b37941aafe1068be7ed2d6ada87c0e3b8eaa3b5225896e)
- /mnt/Cursor/PM-Experiments/goal-replan-combined-root-review-20260921/v3/REVIEW.md (ACCEPT_WITH_NOTES, adoption items 2 and 7)
preserved_exact_tokens:
- "goal_run.replanned"
- "pm.goal_runtime_event.goal_run_replanned.schema.v3"
- "owner.executor.workflow_run.replan.v1"
- "D-R19"
negative_constraints:
- No Goal-state change, child Goal, alias of goal.replanned or replan on a birth whose profile lists no Replan writer.
- No cancellation by replan and no registry change before the S5b switch.
owner_hints:
- Plans/Goal_Runtime_System.md
```

**Premise check of DL-080 (2026-11-14).** DL-080 asked for this contract because the resume fence depends on the event, the Workflow writer list names no Replan writer and GRS-085 halts on the row. Today's text: Known-37 4.2 still makes `blocked` and `stopped` resumable only through a new revision and valid `goal_run.replanned` admission; EP-118 still refuses unlisted writers; GRS-085 and GRS-202 still halt on same-run replanned rows; GRS-070 keeps WorkGraph regeneration with "the actual workflow and separately governed goal_run.replanned". The premise holds. Newer facts: the stopped and blocked writers (EP-200) are listed only by `all_writers.stop_block.v1`, a fresh edition distinct from v8, so neither edition composes the other's writers (GRS-3101 says what each birth accepts).

**Clocks.** The v2 payload advanced the Goal revision through `expected_goal_revision` (D-CAS-01). The accepted v8 source keeps the Goal revision fixed and adds the Workflow clock pair; CV-3100 places that on the GoalRun envelope by dropping the redundant `expected_goal_revision` and the retired `parent_goal_id` and requiring the inner `idempotency_key`. Graph generation is a third, independent clock (checked u32, advanced once per applied structural replan by the graph-lock owner).

**Who decides.** The bounded manager (Crosswalk scheduler plus bounded manager) chooses the replacement graph and one of the six actions; this contract and the v8 source choose none. B01's whole-Workflow blocked trigger stays pending and grants no authority. `cmd.runtime.replan` (EP-3101) requests a replan of a live blocked episode; it never names the action or the graph.

**Cancel and stop.** `cancel` stays in the closed next_action grammar so the v2 historical reader keeps its meaning, but no current writer publishes it (C7). `stop` and `remain_blocked` are published by the replan itself on a v8 birth, because that birth has no EP-200 writer; a later replan or D06 leaves them. The limited execution revocation of the v8 Stop protocol revokes capabilities only: it is never a stopped row, a cancelled row, SchedulerStop or D06 (`Plans/goal_run_replan_contracts/cancellation-dependencies.json`).

**Historical rows.** The v2 payload, the Known-37 v2 key and the EA-UND-0019-GOAL oracle pair describe v2 only; ATS-3100 supersedes that pair for current writes. Same-run v2 rows remain unsupported by every current reducer and are read only by the historical reader.

ContractRef: ContractName:Plans/Executor_Protocol.md#EP-3101, ContractName:Plans/Contracts_V0.md#CV-3100, ContractName:Plans/storage-plan.md#SP-3100, ContractName:Plans/Goal_Runtime_System.md#GRS-3101, ContractName:Plans/Decision_Log.md#DL-080

### GRS-3101 - Unified run-history projection branch for all_writers.v8 births

```yaml
plan_unit_id: GRS-3101
unit_type: requirement
status: accepted
owner_doc: Plans/Goal_Runtime_System.md
canonical_text: |-
  Newly authored owner contract under DL-045, written for DL-080 (PNC-019 lane rv8b, 2026-11-14). It extends GRS-085's mandatory per-run projection, as DL-080 requires, so that one reducer reads the whole same-run lifecycle of a run born under pm.executor.workflow_source.all_writers.v8. The reducer consumes the complete SP-278 global prefix and selects each run's accepted row set from the authentic installed profile of its original Workflow birth (the original WorkflowBirth and combined Enrollment custody), never from a row, a payload or a caller: all_writers.v7 keeps GRS-085 (started, cancelled, certified); all_writers.stop_block.v1 keeps GRS-202 (adds blocked and stopped); all_writers.v8 accepts started, replanned, certified and cancelled. A row of a family the birth profile does not list halts before the row. For v8 births: started-v3 rows authenticate against the v8 native start roots, cancelled-v3 rows against the v8 positive D06 roots, certified-v3 rows against the v8 coordinator and pm.goal_run_certified.producer_source.v3 custody, and replanned-v3 rows against the actual native application, completion and their origins, the observer origin, SP-286 first custody and the full Event (Plans/goal_run_replan_contracts/consumer-bindings.json); no v7 consumer, checkpoint or generation is cast. Rule table: started -> replanned; replanned -> replanned; started or replanned -> cancelled (positive D06 from any legal nonterminal status, including blocked or stopped); started or replanned -> certified when the event-implied status is running, repairing or verifying and the certified row's own sources authenticate provisional success or verifying; nothing after certified or cancelled. Each replanned row is accepted only when its source native status (read from the row's original native before-commitment) is a D-R19 source, its next_action is not cancel, its goal_run_revision is exactly one above its own expected_goal_run_revision, that expected revision equals the projected revision or exceeds it only across intervening body revisions the original D01/native chronology authenticates as supported non-emitting native steps, and its replan_generation is exactly the projected generation plus one. A gap, a lower revision, a skipped or repeated generation, an intervening unsupported same-run Event, a v2 row, a blocked or stopped row or an unknown profile halts before the row. SP-3102 owns the value and checkpoint.
gui_related: false
gui_classification_reason: Defines event, writer, persistence or projection contracts; no visual surface.
split_recommended: false
depends_on:
- GRS-085
- GRS-202
- GRS-3100
- SP-3102
- SP-278
- DL-080
- DL-045
unblocks: []
acceptance_criteria:
- One reducer processes the whole global prefix; the branch is chosen by the authentic birth profile, and no branch skips or casts a row another branch accepts.
- On a v8 birth a verified replanned v3 row on a legal edge advances the projection and its checkpoint atomically; started, certified and cancelled rows of that birth authenticate against the v8 source profiles named in consumer-bindings.json.
- A replanned row with next_action cancel, an illegal source status, a revision or generation that does not follow, or an unauthenticated revision gap halts before the row.
- Blocked or stopped rows on a v8 birth, replanned rows on a v7 or stop_block.v1 birth, v2 rows and unknown profiles halt before the row.
- No existing GRS-085 or GRS-202 generation is reinterpreted; a v8 run's projection is built only in a new generation from a full scan.
validation_surfaces:
- Plans/goal_run_replan_contracts/consumer-bindings.json
- Plans/goal_run_replan_contracts/projection.schema.json
- Plans/goal_run_replan_contracts/oracle-fixtures.json
- python3 scripts/pm_goal_run_replan_oracles.py
- python3 scripts/pm-plan-index.py validate
risk_class: run_history_projection_gap
reasoning_tier: high
context_scope: grs085_v8_replan_extension
implementation_surfaces:
- Plans/Goal_Runtime_System.md
node_compile_hint:
  mode: owner_contract_only
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- Plans/Decision_Log.md#DL-080
- Plans/Decision_Log.md#DL-045
- /mnt/Cursor/PM-Experiments/goal-replan-combined-root-review-20260921/v3/REVIEW.md (adoption item 3)
preserved_exact_tokens:
- "GRS-085"
- "goal_run.replanned"
- "pm.executor.workflow_source.all_writers.v8"
negative_constraints:
- No action, resume, replan, cancellation or Goal authority from a projected row.
- No change to earlier births, their branches or their generations.
owner_hints:
- Plans/Goal_Runtime_System.md
```

**Why one reducer with branches.** The v8 source ships a Replan projector that knows started, cancelled and replanned but not certified, while the certified consumer knows started, cancelled and certified but not replanned. Installed side by side, each would halt at the other's row. The branch rule replaces both with one state machine per birth profile; the frozen projector stays source lineage (adoption correction C9).

**What a projected row says.** `lifecycle_status` is the last supported Event kind; `projected_run_status` is the status that Event implies (D-R19 successor for a replan, running after start, certified, cancelled). Non-emitting native steps (progress, provisional success, verification, failed verification) change native status without an Event, so the projection never claims the current native status; current readers consult the native owner, as GRS-079 says.

**Composition limit (open, technical).** No current fresh edition lists both the EP-200 stop and block writers and the v8 Replan writer. So Pause and Abort Run, which expect `goal_run.stopped`, have no installed writer on a v8 birth and return `handler_unavailable` there, and a stop_block.v1 birth cannot be replanned. Composing both writer sets needs a further fresh source edition with its own review; it is not a product choice and is recorded in the lane report.

ContractRef: ContractName:Plans/Goal_Runtime_System.md#GRS-085, ContractName:Plans/Goal_Runtime_System.md#GRS-202, ContractName:Plans/storage-plan.md#SP-3102, ContractName:Plans/Decision_Log.md#DL-080
