# B1 — What current canon says about `goal_run.blocked`

Label: B1-current-blocked. Read-only research note, 2026-09-25.
Refs read: `origin/main` = `63cf2cb97f936c91dd7bb5c585d9a35d8409ed61`; A1 branch `origin/plans/replan-v8-a1-20260925` = `e8d61ace4c219723022fd9fea7187ffedc8b3b14`; process answers on `origin/plans/replan-v8-process-answers-20260925`.
All line numbers are at `origin/main` unless a ref is named. "prop." marks a proposal. "Inference" marks anything not stated in canon.

## 0. Short answer

- **The transition the event records.** A Workflow GoalRun enters `blocked`. D-R16 (GRS 3733): "`ready|running|provisional_success|verifying|failed_verification|repairing -> blocked`; `blocked -> blocked` requires new evidence/action/recovery revision. Certified/failed/cancelled/stopped sources are illegal." The status is the GoalRun status (GRS 3466), not the four-state Goal status. It is also the `status` field of the native run control `pm.storage_value.workflow_goal_run_control.v1`. That enum includes `blocked` (`Plans/workflow_standard_source_contracts/native-v7/schemas/workflow-original-start.v6.schema.json` ~2463-2475).
- **Who performs it.** No one, in current canon. No writer is named or admitted:
  - EP-118 (EP 7523): "All unlisted Workflow writers remain refused by `RequiredOtherWorkflowWriterSource=false`".
  - The only owner-level statement is GRS-026 (GRS 3911). Goal Runtime "governs ... blockers ... while Orchestrator owns user-visible projections and Executor owns scheduler truth". Its acceptance criterion (GRS 3919) says "Executor/runtime scheduler remains the canonical owner for readiness, blocked overlays, retry/backoff, capacity, wakeups, and dispatch."
  - D-R16's basis includes GRS-027, which is superseded. Its custody "moves to the Orchestrator and Executor owners ... under their own contracts" (GRS 3981). None of those contracts exists for this event.
  - DL-080 (DL 1633) names the owner that must write the contract: "The Workflow run lifecycle owner (Orchestrator and Executor, with Goal Runtime and Storage)". It notes "the Workflow writer list lacks [a writer] today".
- **What triggers it.** Canon lists conditions that end in "blocked". It does not say when a run, as opposed to a node or a Goal, becomes blocked, or which owner decides. See section 7. Under Q-09 this is the B01 gap. The contract cannot adopt a trigger by citation alone.
- **v8.** A1 EP-127 (A1 EP 8985): "The limited operation appends no Event and adds no goal_run.stopped, goal_run.blocked or goal_run.cancelled writer." A1 GRS-089 (A1 GRS 8297, 8337) says the same. Under C-4 option 2, v8 births never record blocked. The writer goes into `all_writers.v9`.

## 1. Registry row (`Plans/event_family_registry.json`)

- The file is at registry `schema_version` "2.0.0", `registry_revision` "2026-09-11.2" (lines 4-5). The whole-file SHA-256 at `origin/main` is `0be544181eda423dcea4d8661206e7da6d066fdcf51913d5962f1a283635c842`. It was last changed by f6350caf2 on 2026-09-21.
- The row is `#/families/0` (lines 10-50):
  - `family_id` `event-family-goal-run-blocked`, `family_revision` "2.0.0", `event_type` "goal_run.blocked", `scope_policy` "project_only" (10-13).
  - `semantic_owner_doc` "Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima" (14).
  - `payload_owner_doc` "Plans/storage-plan.md#sp-214---goal-runtime-persistence-consumer" (15).
  - `payload_schema_id` and ref: `pm.goal_runtime_event.goal_run_blocked.schema.v2` at `Plans/event_payloads/goal_runtime/goal_run_blocked.schema.json#` (16-21).
  - `legacy`: no aliases, no admitted extensions. Identity pointers are `/payload/project_id` and `/payload/thread_id` only, with no `run_id` pointer. Redaction mode is `reject_unhandled_secrets` (22-38).
  - `source_refs`: the schema, the GRS minima anchor and `Contracts_V0.md#cv-287---goal-runtime-event-schema-registration` (40-44).
  - `retention_policy_ref`: `pm.storage_value_registry.v2` / `RP-AUTHORITY-INDEFINITE` / "1.0.0" (45-49).
- The sibling rows are still v2: `goal_run.stopped` and `goal_run.replanned` are both 2.0.0. `goal_run.started`, `goal_run.cancelled` and `goal_run.certified` are at 3.0.0. `goal.blocked` is `#/families/6` at 2.0.0, with the same owner docs and retention.
- Contracts_V0 3686 lists the same schema root in the Known-37 roster. The Storage retention table (SP 17969) lists `goal_run.blocked` under `RP-AUTHORITY-INDEFINITE@1.0.0`.

## 2. v2 payload schema (`Plans/event_payloads/goal_runtime/goal_run_blocked.schema.json`)

- SHA-256 `66400648120d8b6c60c7a47962433bd192ef942fb9b9bbced9d76e07b2790500`. Promoted 2026-09-11 (4869b4cba) under DL-039. `$comment` line 2: "Schema authority does not establish Event Authority contract depth, registry admission, runtime proof, certification, or buildability."
- The root (`$id` line 787) is closed, with `unevaluatedProperties:false` (893).
  - It requires `event_name` (const "goal_run.blocked"), `schema_version`, `occurred_at_utc`, `project_id`, `goal_id`, `goal_revision`, `actor_ref`, `execution_role`, the requested and effective provider, model and account refs, `correlation_id`, `evidence_refs`, `artifact_refs`, `payload` and `expected_goal_revision`.
  - It allows `thread_id`, `parent_goal_id`, `causation_event_ref`, `idempotency_key`, `approval_refs` and `block_refs`.
  - It has no `goal_run_revision` and no `expected_goal_run_revision`.
- `#/$defs/event_payload` (275ff) is closed. It requires all six fields:
  - `goal_run_id` (non-empty ref).
  - `blocked_reason_code`: a 28-value enum, including `approval_required`, `permission_denied`, `storage_*`, `restore_*`, `verifier_unavailable`, `budget_exhausted`, `usage_exhausted` and `child_settlement_incomplete`.
  - `blocked_scope` (Scope).
  - `allowed_action_ids`: `minItems:1`, unique, from the 13-value ActionId enum `retry_same_action, replan, narrow_scope, request_approval, change_model, change_account, retry_storage, restore_from_mandatory_backup, abandon_preserved_work, resolve_owner_conflict, cancel_goal, stop_goal, resume_after_revalidation`.
  - `preserved_work_refs` (ref array; may be empty).
  - `block_receipt_ref` (non-empty ref).
- The payload `$comment` says: "Permission/recovery owner restrictions, whether mutation began, block receipt existence/currentness, owner-valid actions, and legal lifecycle transitions remain owner/runtime predicates."
- `goal_run_status` (371) repeats the 11-value GoalRunStatus enum, including `blocked`.

## 3. Goal Runtime owner text

- **Payload minima (GRS 2652).** "| `goal_run.blocked` | `goal_run_id`, `blocked_reason_code`, `blocked_scope`, `allowed_action_ids[]`, `preserved_work_refs[]`, `block_receipt_ref` |". The 2026-09-24 routing note (GRS 2657) covers only started, cancelled and certified. It says v3 "changes the envelope (required `expected_goal_run_revision`, `goal_run_revision` and `idempotency_key`; no `expected_goal_revision` or `parent_goal_id`)". The blocked row still uses the v2 envelope.
- **Event log framing (GRS 2620).** "plus Orchestrator GoalRun projections from `goal_run.started`, `goal_run.replanned`, `goal_run.blocked`, ...". There is no individual historical-only or current ruling for `goal_run.blocked`. The same line lists individual rulings for other families only.
- **Common fields (GRS 3411-3436).** `expected_goal_revision` is "required on all other rows". Every row inherits `D-CAS-01`. As written, a GoalRun blocked event is keyed on the Goal revision clock.
- **Outer join (GRS 3440).** "`run_id=payload.payload.goal_run_id` for the six GoalRun rows".
- **GoalRun state (GRS 3466-3468).**
  - `GoalRunStatus = ready | running | provisional_success | verifying | failed_verification | repairing | certified | failed | blocked | cancelled | stopped`.
  - "`blocked` and `stopped` are fenced, resumable only through a new revision and valid `goal_run.replanned` admission."
- **Materialization row (GRS 3555).** `EA-UND-0016-GOAL`, semantic identity tuple `goal_run_id,blocked_reason_code,block_receipt_ref`.
- **D-R16 (GRS 3729-3734):**
  - Fields: `R{goal_run_id:ref,blocked_reason_code:BlockedReasonCode,blocked_scope:Scope,allowed_action_ids:ActionId[],preserved_work_refs:ref[],block_receipt_ref:ref}`.
  - Branches: "allowed actions are non-empty and owner-valid; permission/recovery branches carry the same restrictions as `D-R01`. `preserved_work_refs` may be empty only when no mutation began. Block receipt must exist before append."
  - Transition: quoted in section 0.
  - Basis: "`C-GRS-MIN`, `C-GRS-LIFE` (`GRS-026..027`, `GRS-043`), `D-R16`."
  - Observation (inference): D-R01's branches key on `blocker_class` (GRS 3607: "permission outcomes require `blocker_class=permission`"). `goal_run.blocked` has no `blocker_class` field. How the D-R01 restrictions carry over is not stated.
- **Other edges into or out of `blocked`:**
  - D-R17 (GRS 3740): "any nonterminal GoalRun state, including `blocked|stopped`, -> `cancelled`".
  - D-R19 (GRS 3754): `blocked` is a legal replan source, and `remain_blocked=>blocked`.
  - D-R21 (GRS 3768): `blocked -> stopped` is legal.
  - GRS-080 (GRS 7502): D06 cancellation applies "from a genuine legal nonterminal Workflow, including blocked or stopped". Q-12 says D06 is unavailable.
- **Oracles (GRS 3794).**
  - Positive: "Block a running GoalRun with validated block receipt, preserved work, exact scope and owner-valid action set; projection becomes `blocked`."
  - Negative: "Reject missing receipt, empty actions, invalid recovery action, preserved mutation omitted, blocked update with no new evidence, or block from terminal/stopped run."
  - The mirror at ATS 2525 (GOAL-COMMON-13) is `NOT_EXECUTABLE_UNDER_THIS_TRANSACTION`.
- **Common failure table (GRS 3818-3820). These are the only condition statements:**
  - "Storage/root/integrity/recovery truth unknown | Goal/GoalRun is blocked or remains unknown; no mutation/certification."
  - "Permission denial/approval required | Named `goal.blocked`/`goal_run.blocked`, exact permission evidence and actions; never failed or complete; approval cannot widen a Storage/FileSafe block."
  - "Verifier unavailable | ... strong blocks." This does not say whether the Goal or the GoalRun blocks.
- **GRS-043 (GRS 5284ff).** Goal Runtime "emits project-scoped EventRecord 2.0 goal and goal-run events ... viewer, root, integrity, restore-recovery, and permission blockers cannot become failure or completion."
- **GRS-085 (GRS 7884-7886).** "unsupported same-run replanned/blocked/stopped profiles ... halt before that row; they do not silently advance checkpoint." Today the mandatory run-history projection halts on any same-run blocked row.
- **GRS-065 (GRS 6089).** "The four-state text-first Goal remains under GRS-064; Workflow GoalRun status is separate."

## 4. `goal.blocked` and `blocked_reason_ref`, compared with `goal_run.blocked`

- **Goal V2 is four-state (GRS 95).** "`blocked` means an owner-supplied condition prevents safe progress and names it through `blocked_reason_ref`." `GoalRecordV2` carries `blocked_reason_ref` and `active_run_ref` (GRS 25). `GoalContinuationRecord.result` includes `blocked` (GRS 27, 137-139).
- **Resume (GRS 173, 259).** "Resume from `blocked` is eligible only when the owner condition named by `blocked_reason_ref` reports that it has cleared". `cmd.chat.goal.resume` is "Refused ... while `blocked_reason_ref` has not cleared".
- **Goal V2 events (GRS 273).** `goal.blocked` is a required semantic name. "Each exact name requires its own central EventRecord registration and payload schema before emission." Commands_System 5990 still lists it as `requires_central_adjudication`.
- **Goal V2 relation to runs (GRS 99).** "Every Goal has zero or one `active_run_ref`. Concurrency between the Goal and its run is resolved by the run owner".
- **What `goal.blocked` v2 carries.** D-R01 (GRS 3604-3609) has `blocker_class`, `blocked_reason_code`, `cause`, `affected_scope`, `autonomous_recovery_stop_reason`, `next_safe_action` and `allowed_action_ids`. Its transition runs over the retired 15-state GoalStatus. depth42 grades that cell CONFLICT with Goal V2.
- **Relation to `goal_run.blocked`.** No canon rule links the two. Nothing says that a blocked GoalRun sets Goal `blocked` or `blocked_reason_ref`, or the reverse. The only joint mention is the permission row at GRS 3819, "Named `goal.blocked`/`goal_run.blocked`". It does not say which event, or whether both. GRS 6089 keeps the two statuses separate. GRS-077 (GRS 7137) says for B1 association: "B1.state / blocked_reason_ref | Exact B0 values; association adds no lifecycle transition." Inference: in current canon a run block does not touch the Goal record.

## 5. Executor: node-level blocked, not run-level

- **Node overlays (EP-064, EP 751-760).** "Runtime overlays include blocked, backoff, retrying, remediation, and waiting-approval states". "overlays do not replace canonical node lifecycle values".
- **Blocked episodes (EP 799-801, EP 4765).** "Executor mints `blocked_sequence` when a HITL, auth, `/storage`, or recovery condition creates a blocked-episode". It is "canonical per run_id/node_id blocked episode".
- **EP-082, run-level deferred rule (EP 862-865, 5054ff).** "if no node is runnable and blocked, backoff, or prerequisite-waiting work exists, the run is deferred rather than terminal." "Deferred" is not a GoalRunStatus value. Inference: canon has no rule that turns node blocked episodes into run `blocked`. EP-082 says such a run is "deferred". This is a tension a blocked trigger must resolve.
- **EP-004 (EP 1118).** "Runtime scheduler owns readiness, blocked state, transitions, retry budgets, wakeups, and dispatch".
- **EP-118 (EP 7523).** It lists the observed writers: materialized, stage-entrypoint, prepare-start, prestart-abort, original-start, D06. It then says "All unlisted Workflow writers remain refused by `RequiredOtherWorkflowWriterSource=false`; this adoption supplies no completion, certification, ownership-transfer or optional/replanned materialization route." No run-blocked writer is listed.
- **A1 protocols (A1 `Plans/workflow_standard_source_contracts/native-v8/protocol.md` 80, and `workflow_combined_source_contracts/replan/protocol.md` 80, 129, 218).** They say the source does not "settle the condition that puts a run into `blocked`, which remains an owner decision". This is the text Q-09 labels B01.

## 6. Commands and production wiring

- **No production wiring row lists `goal_run.blocked` in `expected_event_types`.** None lists `goal.blocked` either. I checked all 1,142 entries of `Plans/Wiring_Matrix.production.json`. The only `goal_run.*` expectations are `goal_run.stopped`, for `catalog.orchestrator_pause` and `catalog.runtime_abort_run`.
- **Rows under "Orchestrator > Blocked run actions" (WM 51931-52700), with their expected events:**
  - `abort_run`: `goal_run.stopped` (51931-51937).
  - `approve`: `node.unblocked` (~51999).
  - `replan`: `goal.replanned` (52387-52391). This is the Goal family that GRS-070 made historical-only, not `goal_run.replanned`.
  - `restore_safe_point_then_retry`: `safe_point.restored`.
  - `resume_after_prerequisite`: `node.unblocked` and `scheduler.pass`.
  - `start_fresh_attempt`: `scheduler.pass`.
  - `decline`, `retry_now`, `skip_node` and the four `open_*` rows: receipt-only, with no events.
- **The label "Blocked run actions" appears only in these `ui_location` strings.** `Plans/Orchestrator_Page.md` has no section of that name. It has a state label `blocked` in its progress taxonomy (OP 228: "`queued|running|attention_required|blocked|recovering|degraded|complete`").
- **UI_Command_Catalog 1152-1167.** The recovery table maps `allowed_action_id` to `cmd.runtime.*`. Every row except `abort_run` is keyed by `{run_id, node_id, blocked_sequence, ...}`, that is, by the Executor node episode. `abort_run` takes `{ run_id }`.
- **Observation.** This `allowed_action_id` vocabulary (`approve`, `decline`, `retry_now`, `resume_after_prerequisite`, `restore_safe_point_then_retry`, `start_fresh_attempt`, `replan`, `skip_node`, `abort_run`, `open_details`) differs from the GRS ActionId enum in the v2 payload. Only `replan` matches exactly. Canon has no mapping between the two.
- **Result.** DL-080's "Why" (DL 1617) cites commands and wiring that expect `goal_run.stopped`, and a resume rule that depends on `goal_run.replanned`. Nothing in current wiring or commands expects `goal_run.blocked`. Its demand comes from GRS 3468 and 3819, D-R16, DL-080 and GRS-085's halt.

## 7. Does canon define the trigger? (Q-09 / B01)

- **What canon gives.**
  - The reason vocabulary: BlockedReasonCode (GRS 3501).
  - Condition rows that end in "blocked": GRS 3818-3820 and GRS-043.
  - The legal source states and the fence: D-R16 and GRS 3468.
  - The receipt-before-append rule.
  - Node-level episode minting by Executor: EP 800.
- **What canon does not give.**
  - Which owner decides that the run, not only a node, is blocked.
  - Whether a node episode, all nodes blocked, or a run-scoped condition such as storage viewer or permission denial for the whole run is the trigger.
  - How that squares with EP-082's "deferred".
  - Who mints `block_receipt_ref` and what receipt schema it has. No receipt family for GoalRun blocks exists. `ReceiptKind` has `goal_blocked` only (GRS 3497).
  - How the node-level `allowed_action_ids` map to run-level ActionIds.
- **Conclusion (inference).** Canon does not define the run-level trigger. The Q-09 ruling therefore applies: a DL-036 card with the options canon supports, not a decision. Options canon could support, all prop.:
  - (a) Run-scoped conditions only: storage viewer or blocked, root or integrity unknown, restore-recovery-required, or permission denial for the whole run (GRS 3818-3819). Node episodes stay Executor overlays under EP-082 "deferred".
  - (b) (a), plus "no node runnable and at least one node blocked-episode awaiting a person". This amends EP-082.
  - (c) An explicit Executor-owned run-block decision at named points, with a closed reason subset.

## 8. depth42 row (`reports/event-authority-20260911/step-08-depth42-assessment-20260924.md` 79, and `.json` `/rows/0`)

- **Disposition and score.** `UNDISPOSITIONED`, PASS count 3, `native_execution` NOT_RUN, grading batch GC.
- **Cells.** In the order Mem, Own, Prod, Schema, Scope, Replay, Ret, Custody, Trans, Cons, Compat, Oracles, the grades are P P p C p p P p p A p p.
  - Producer PARTIAL: "No emitter, ordering of block receipt, append and first receipt, or SP-286 adoption exists. EP-118 refuses every unlisted Workflow writer".
  - Schema CONFLICT: "the closed root requires expected_goal_revision and, by D-CAS-01, advances the Goal revision on each GoalRun event; it has no Workflow revision fields and still admits parent_goal_id."
  - Transitions PARTIAL: "no writer is admitted (EP-118, GRS-082), D-R16's basis GRS-027 is superseded, blocked -> blocked keys on the v2 Goal revision, and GRS-085 halts the current projection on same-run blocked rows."
  - Consumers ABSENT: "The only current GoalRun projection (GRS-085 ...) treats same-run blocked as unsupported and halts".
  - Retention PASS.
- **`remaining_gaps`.**
  - A v3 successor on the current GoalRun envelope: "Workflow clock, required inner key, no parent_goal_id, as GRS-079/080".
  - An EP-118 writer listing.
  - "block-receipt/append/first-receipt ordering with SP-286".
  - GRS-085/SP-312 reducer support, or a separate consumer adopting SP-278 with the DL-076 token.
  - Custody, a withdrawal rule and oracle fixtures. GOAL-COMMON-04 and GOAL-COMMON-13 must be re-keyed.
- **`goal.blocked` row (md 85).** Also UNDISPOSITIONED with 3 PASS. Its Trans cell is CONFLICT as well. md 136 and 166: "`goal.blocked` and `goal.completed` are required current names (Goal V2 events), so their successors are owner work, not a product choice."

## 9. Storage

- **SP-214 (SP 15094-15110)** names `goal_run.blocked` among the "Orchestrator GoalRun events". It lists the disposable projections `goal_blocked_projection.v1:{project_id}:{goal_id}` and `goal_run_projection.v1:{project_id}:{goal_run_id}`.
- depth42 says neither is an admitted route. The GoalRun projection role is carried by GRS-085 in the SP-317 families (SP 15203).

## 10. Open questions (recorded, not answered)

1. Which owner decides that a run is blocked, and on what trigger (B01)? Section 7 has the card options.
2. EP-082 "deferred" against GoalRun `blocked`: is "deferred" a projection of `running`, or does it become `blocked` under some trigger?
3. `block_receipt_ref`: which receipt family and owner? No GoalRun block receipt is defined.
4. Does a run block set Goal `blocked`/`blocked_reason_ref` through `owner.goal.body.mutation@1.0.0`? Or does it stay separate per GRS 6089? GRS 3819 names both events.
5. How does the run-level ActionId set relate to the node-level `allowed_action_id` commands, which are keyed by `blocked_sequence`?
6. Which `blocked_reason_code` values survive into v3? depth42 flags `budget_exhausted`, `usage_exhausted`, `verifier_unavailable` and `child_settlement_incomplete` against retired Goal concepts (the `goal.blocked` row, gap 5).
7. The D-R01 restrictions key on `blocker_class`, which `goal_run.blocked` lacks. Does v3 add it or derive it?
8. Should the "Blocked run actions" Replan row keep expecting `goal.replanned`, which is historical-only? That is outside blocked scope and belongs to the replanned or wiring owner.
