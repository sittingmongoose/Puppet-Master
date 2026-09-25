# B2: the `goal_run.blocked` trigger and writer (label B2-trigger-writer)

- Program: Event Authority Step 8(b) Group A, A3 `goal_run.blocked`, for a later `all_writers.v9` profile (C-4 option 2, Jared 2026-09-25).
- Read-only. Nothing in the repository or the packages checkout was changed.
- Refs used (git objects only):
  - `@main` = `origin/main` `63cf2cb97f936c91dd7bb5c585d9a35d8409ed61`.
  - `@A1` = `origin/plans/replan-v8-a1-20260925` `e8d61ace4c219723022fd9fea7187ffedc8b3b14` (pending, not canon).
  - `@A0` = `origin/plans/replan-v8-a0-20260925` `632f557c0936fc1058858bfac07821a0187be32f`.
  - `@PA` = `origin/plans/replan-v8-process-answers-20260925` `616f12bfde2fa2ebbed1fd2b0e762a670f742282`.
  - `pkg v3` = `/home/user/pmpkg-push/replan-v8/goal-replan-combined-source-20260921/v3/` (checkout HEAD `3928dd6a`, private, not canon).
- Line numbers are for the file at the named ref. "WM" is `Plans/Wiring_Matrix.production.json`. "(prop.)" marks a proposal. "By analogy" is said wherever I reason from the stop writer or another precedent rather than from text.

---

## 0. In brief

1. **Canon has no single blocked trigger.** It names many blocking conditions. Almost all are step-level blocked episodes (one WorkNode waits). For those, the Executor's run-level rule says the run is "deferred", not blocked (EP 864, EP-082). Only one Goal Runtime table maps conditions straight to `goal_run.blocked` (GRS 3818-3820). So Q-09's "canon has none" branch applies: Jared gets a card (B-1).
2. **Blocked is a heavy state.** It is fenced and resumes only through a new revision and an admitted `goal_run.replanned` (GRS 3468). Abort takes it to stopped (GRS 3768). So each condition mapped to run-level blocked turns a one-click Approve into a Replan.
3. **Nothing in the wiring expects `goal_run.blocked`.** All 13 WM "Blocked run actions" are step-level episode actions, and none of them lists `goal_run.blocked`. So the writer has no user-command caller. It is internal to the owner.
4. **The writer (W-B, prop.)** follows the stop writer W-C closely: native issuer Executor, a Storage participant, a D01 observer rule and origin kind, a joint native outcome, the same crash cuts and withdrawal, and v9 only. The analogy breaks in five places: callers, the reason and trigger evidence, the block receipt that must exist before the append, the Goal effect, and quiescence, which here is part of the trigger rather than a wait.
5. **The trigger evidence has no authority-grade source today.** `blocked_projection` is a rebuildable projection. The step events (`node.unblocked`, `scheduler.pass`) are not registered. Storage-caused blocks can never be recorded while they hold, because Storage then refuses every writer.
6. **Three product cards** (B-1 trigger, B-2 Goal display, B-3 the way out before run replan exists). **Seventeen owner questions** (TB-01 to TB-17).
7. **Recommendation:** B-1 option 1. Record blocked only at a dead end: nothing can run or is running, and a required step is stuck on something only Replan or Abort can clear. With that answer, B-3 option 1 costs nothing: the run is stuck either way, and recording it makes the stall visible and gives it an exit (Abort).

---

## 1. What canon says a blocked run is

- **The edges (D-R16).** GRS 3733 @main: "`ready|running|provisional_success|verifying|failed_verification|repairing -> blocked`; `blocked -> blocked` requires new evidence/action/recovery revision. Certified/failed/cancelled/stopped sources are illegal."
- **The fields.** GRS 3731: "`R{goal_run_id:ref,blocked_reason_code:BlockedReasonCode,blocked_scope:Scope,allowed_action_ids:ActionId[],preserved_work_refs:ref[],block_receipt_ref:ref}`".
- **The branches.** GRS 3732: "allowed actions are non-empty and owner-valid; permission/recovery branches carry the same restrictions as `D-R01`. `preserved_work_refs` may be empty only when no mutation began. Block receipt must exist before append."
- **Fenced.** GRS 3468: "`blocked` and `stopped` are fenced, resumable only through a new revision and valid `goal_run.replanned` admission."
- **The exits.**
  - To stopped: GRS 3768, D-R21, admits a `blocked` source.
  - To cancelled: GRS 3740, D-R17, admits `blocked|stopped`, but only through D06, which has no issuer (Q-12).
  - Back to a working state: only through D-R19, GRS 3754, which admits a `blocked` source ("`remain_blocked=>blocked`", "`continue_running=>running`").
- **The oracle.** GRS 3794: "Block a running GoalRun with validated block receipt, preserved work, exact scope and owner-valid action set; projection becomes `blocked`."
- **The owners.**
  - GRS-026, GRS 3919: "Executor/runtime scheduler remains the canonical owner for readiness, blocked overlays, retry/backoff, capacity, wakeups, and dispatch."
  - EP 54 (§1.5 Runtime scheduler): "The canonical owner of readiness, blocked state, transitions, retry budgets, wakeups, and dispatch."
  - DL-080 (DL 1633): "The Workflow run lifecycle owner (Orchestrator and Executor, with Goal Runtime and Storage) writes a full current Event Authority contract".
- **Distinct from the Goal state.** GRS 95: "`blocked` means an owner-supplied condition prevents safe progress and names it through `blocked_reason_ref`." That is the four-state Goal, not the run. `goal.blocked` has no current writer: the depth42 row is UNDISPOSITIONED with the gap "author a current-writer successor for goal.blocked".
- **No writer today.**
  - EP 7523 @main (EP-118): "All unlisted Workflow writers remain refused by `RequiredOtherWorkflowWriterSource=false`".
  - EP-127 @A1 (EP 8985): "The limited operation appends no Event and adds no goal_run.stopped, goal_run.blocked or goal_run.cancelled writer."
  - GRS-089 @A1 (GRS 8337): "No goal_run.stopped or goal_run.blocked writer, D06 result, permanent ban or restart route is created".
- **The registry row** is `#/families/0`, `Plans/event_family_registry.json` lines 9-50 @main, revision 2.0.0 with v2 payload `pm.goal_runtime_event.goal_run_blocked.schema.v2`. Its row fingerprint is `f137e7243c8030887b0e4624228c3603dc3a9026170b86bb72e1ffb552b4b4a5` (sorted keys, `(",",":")`, the same method that gives the stopped row `8acbc249…e0a3`). The registry SHA-256 is `0be544181eda423dcea4d8661206e7da6d066fdcf51913d5962f1a283635c842`.

## 2. B01 and the Q-09 first step

- **Origin.** "B01" is the package's label only.
  - pkg v3 `PROTOCOL.md` 80: "B01's blocked trigger remains pending the actual owner decision."
  - `inputs/plan/PLAN.md` 38: "B01's blocked trigger and any genuine product-policy gap remain separately unresolved."
  - `inputs/scope/ADJUDICATION.md` 15: "B01's blocked trigger and every unanswered product card remain untouched."
  - `replan/PROTOCOL.md` 129 adds the scope: "B01 whole-Workflow blocked trigger remains pending and grants no authority."
- **The canon wording at A1** replaced the label: "Nor does it settle the condition that puts a run into `blocked`, which remains an owner decision" (A1 `Plans/workflow_standard_source_contracts/native-v8/protocol.md` 80; also GRS-086 @A1 7984: "The condition that puts a run into blocked remains an owner decision, and this source grants no authority for it.").
- **The Q-09 ruling** (@PA `process-answers-20260925.md` 17): "read the owner text (D-R19 in Orchestrator and Executor canon, GRS-085 and the run-history projection) for an existing definition … If canon does not, do not decide it: present Jared a DL-036 card with the concrete options canon supports".
- **Result of that reading:**
  - D-R19 (GRS 3753-3754) defines `remain_blocked` only as a Replan successor, which is `blocked -> blocked` through `goal_run.replanned`. It defines no entry into blocked.
  - GRS-085 (GRS 7885) only halts: "unsupported same-run replanned/blocked/stopped profiles … halt before that row".
  - D-R16 gives legal edges, not the condition.
  - So there is no existing definition. The card branch applies (B-1, §7).

## 3. Every blocking condition canon names

Level: **S** means a step-level (WorkNode) blocked episode, keyed `{run_id, node_id, blocked_sequence}` (CV 1828-1851, EP 800). **R** means the whole run. **G** means the Goal.

| # | Condition | Verbatim evidence (@main unless noted) | Level | Who detects | Canon's run outcome |
|---|---|---|---|---|---|
| T1 | Permission denied / approval required | GRS 3819: "Permission denial/approval required \| Named `goal.blocked`/`goal_run.blocked`, exact permission evidence and actions; never failed or complete". ATS 2525 GOAL-COMMON-13 repeats it. EP 396: "permission-denied, user-declined, headless approval denial, FileSafe block, external-side-effect block, and replan-needed outcomes stay blocked until the owning recovery action resolves them." | GRS: R. EP: S | Permissions decides (Crosswalk 253: "owns … blocked-family expectations for permission-caused outcomes"); Executor mints the episode (EP 800) | **Conflict:** GRS 3819 says goal_run.blocked; EP 864 says run deferred |
| T2 | Waiting for approval (HITL) | HITL 373: "waiting for approval is a blocked state with `blocked_reason_code = waiting_approval`"; 374: "approval resolution emits `node.prerequisite_resolved` and wakes scheduling in the same cycle" | S | HITL (Crosswalk 231), Executor | deferred (EP 864) |
| T3 | Human input: clarification, credentials, legal, destructive or irreversible action, product decision, security approval | GRS-029, GRS 4164: "User escalation is last-resort for critical authority blockers: missing credentials or secrets, billing/payment/legal/license acceptance, unsafe destructive operation, irreversible external side effect, unrecoverable environment failure, true product decision with no inferable answer, or security-sensitive approval." CV 748: "A blocked episode covers approval waiting, clarification waiting, auth `/prerequisite` waiting, permission `/FileSafe/external-side-effect` blocks, and worktree conflict or dirty-worktree blocks" | S | Goal Runtime policy (GRS-029), HITL, Executor | deferred |
| T4 | Auth required | EP 428: "absent credentials, missing scopes, or required login before admission map to `blocked_reason_code = auth_required`" | S | Executor classifier; the account owner supplies the fact | deferred ("auth recovery" wakes it, EP 865) |
| T5 | FileSafe block | EP 414: "`filesafe_blocked` \| 0 \| — \| No \| never auto-retry; honor FileSafe restore requirements". FinalGUISpec 4654: "A FileSafe block is a persistent blocked episode until the underlying runtime block resolves." | S | FileSafe | deferred |
| T6 | External side-effect approval | EP 415: "`external_side_effect_blocked` … preserve local work and wait for approval/decline" | S | Permissions, Executor | deferred |
| T7 | Worktree conflict, dirty worktree | Decision_Policy 424-425: "`worktree_conflict` \| wait for conflict resolution … remain blocked"; "`dirty_worktree` \| wait for cleanup or restore action … remain blocked" | S | WorktreeGit under Decision_Policy | deferred |
| T8 | Plugin hook blocked | Decision_Policy 426: "`plugin_hook_blocked` \| wait for hook resolution or explicit override action … remain blocked" | S | Plugins | deferred |
| T9 | Validation blocked, unknown classifier | EP 431: "unknown values fail closed as `blocked_reason_code = validation_blocked`"; Decision_Policy 422 | S | Executor | deferred |
| T10 | Replan required, broken graph | EP 419: "`replan_required` \| 0 \| — \| No \| remain blocked until patch or replan is applied"; EP 418: "`graph_integrity` \| 0 \| — \| No \| hard fail; replan path only" | S, but the only remedy is run-level | Executor | none stated; only Replan clears it |
| T11 | Remediation ceiling exceeded | Decision_Policy 423: "`remediation_ceiling_exceeded` \| no automatic retry \| … \| remain blocked until replan, manual fix, or abort" | S, but the remedy is run-level | Executor counts; Decision_Policy owns the ceiling (Crosswalk 266: "owns deterministic remediation ceilings and blocked posture after ceiling exhaustion") | none stated; Replan or Abort |
| T12 | Storage not writer; root, integrity or recovery unknown | GRS 3818: "Storage/root/integrity/recovery truth unknown \| Goal/GoalRun is blocked or remains unknown; no mutation/certification." GRS 3817, Storage viewer: "no producer, scheduler, projector writer, receipt writer". GRS 5226: "Root mismatch, root unavailable, fallback divergence, or untrustworthy snapshot produces a visible blocked/recovery posture". EP 437 | R (whole app) | Storage | **Cannot be written while it holds** (F5) |
| T13 | Restore refused, failed, recovery required | GRS 5230: "`restore_recovery_required` retains the mutation fence and blocked episode". EP 696-698 | S | FileSafe restore; Executor episode | deferred |
| T14 | Budget exhausted | Permissions 9013: "`budget_exhausted -> blocked` unless the owner policy grants a bounded extension"; 9011 lists `budget_kind` as `turns`, `tokens`, `wall_time_seconds`, `parallel_agents`, `cost`. The same code is also a `StopReasonCode` (GRS 3499). Goal budgets are retired (GRS 35: "Goal-owned workflow budgets … all retired") | the frozen budget sits on the attempt (A1 native-v8 protocol 163) | Permissions (the receipt), Executor (the frozen budget) | **Conflict:** block or stop (TB-13) |
| T15 | Usage or quota exhausted | EP 417: "`quota_exceeded` \| 0 \| — \| No \| user action or later retry window" (a failure class, not a blocked code). usage-feature 277: "PM records `/exhaustion` only when the runtime or provider explicitly signals a hard block or exhausted state". `usage_exhausted` exists only in the GRS enum (3501) | S or account | Usage, Executor | failure class, not blocked |
| T16 | Capacity | EP 864: "if no node is runnable and blocked, backoff, or prerequisite-waiting work exists, the run is deferred rather than terminal." EP-082 (EP 5061): "deferred until prerequisite, restore, remediation, auth, or capacity wakeups" | R | Executor | **deferred, not blocked** |
| T17 | Dependency or prerequisite | Same EP-082 text. `external_dependency_unavailable` appears only in the GRS enum (3501); I found no owner text that detects it | S | Executor | deferred |
| T18 | Verifier unavailable | GRS 3820: "Lightweight may degrade with receipt/evidence; standard only if no mutation/required check affected; strong blocks. Never silently certifies." Its source unit GRS-014 is superseded (GRS 1846), and GRS-027 moved custody "to the Orchestrator and Executor owners" (GRS 3983). v8 is Standard tier only | R | Orchestrator/Executor verification | strong tier: blocked. Standard tier with a mutation: **not stated** (TB-12) |
| T19 | Final check fails on an active blocker | A1 native-v8 protocol 189 (G4): "Any active blocker, failed required test, unresolved original risk, critical_block, authority_boundary or exhausted repair budget fails." Protocol 169: "Failing/blocked/skipped/unresolved results cannot use this method." Enum: `verification_terminal_failure`, and `FinalCertifierDecision` includes `blocked` (GRS 3486) | R, at `provisional_success` | Orchestrator Standard decision (`owner.workflow.standard.issue_final_decision.v1`) | none. The run sits in provisional_success; no non-pass record is issued (TB-12) |
| T20 | All steps blocked | FinalGUISpec 4664: "Until owner runtime contracts define dedicated all-blocked events, GUI surfaces MAY derive all-blocked banners from current projections but MUST NOT treat undeclared runtime events as canonical." FinalGUISpec 4775: "When all runnable nodes are blocked, the runtime emits the relevant blocked/recovery events and the UI shows the corresponding persistent blocked-state banner" | R | Executor would own it | explicitly left to "owner runtime contracts" |
| T21 | Goal receipt lost | GRS 5209: "missing, corrupt, quarantined, or unrecoverable canonical goal receipt data remains `goal.blocked` for completion/certification" | G | Storage, Goal Runtime | Goal-level only |
| T22 | Codes that are refusals, not conditions | `dedupe_unavailable`, `idempotency_conflict` and `revision_conflict` are in the BlockedReasonCode enum (GRS 3501), but GRS 3811-3813 make them return values: "Return `idempotency_conflict`; append and projection unchanged"; "Return `dedupe_unavailable`; append nothing" | — | — | not triggers (TB-15) |
| T23 | Child settlement incomplete | `child_settlement_incomplete` is in the enum. GRS-075, GRS 6961 onward: child requirements "must authenticate as empty" | — | — | cannot arise under Goal V2 |
| T24 | Codes left from older Goal kinds | `missing_source_ledger`, `missing_plans_or_target`, `contradictory_goal`, `unsafe_or_destructive_scope`, `infrastructure_blocker`, `permission_or_filesystem_failure` and `authority_boundary` (GRS 3501). My search of `Plans/*.md` @main found no current owner text that detects them for a Workflow run; `authority_boundary` appears only as a G4 failure (T19) | ? | none found | open (TB-06) |
| T25 | Identical-failure loop, loop breaker | EP 444: "the executor MUST emit `stop.identical_failure` and terminate the run immediately". GRS-037 gives each loop family a "terminal action" | R | Executor, Goal Runtime | terminate, not blocked |
| T26 | Pause, Abort Run | C-2: `goal_run.stopped` | R | Orchestrator, Executor | stopped, not blocked |

## 4. What the inventory shows

- **F1: two levels, and canon points both ways.**
  - Nearly every named condition (T1-T11, T13) is a step-level blocked episode.
  - The run-level rule for those is deferral: EP 862-865, "if any node is runnable, the run remains active", "the run is deferred rather than terminal".
  - Unrelated work must continue: EP 381, "unrelated blocked or waiting nodes MUST NOT stall runnable work elsewhere in the graph"; `orchestrator-subagent-integration.md` 6341, "continue unrelated runnable work when some nodes are blocked on approval, clarification, auth, or other explicit blocked states".
  - Only GRS 3818-3820 and ATS GOAL-COMMON-13 map conditions straight to `goal_run.blocked`.
- **F2: blocked is fenced.**
  - Once a run is blocked, clearing the cause does not restart it; only `goal_run.replanned` does (GRS 3468).
  - The Approve wiring expects a step event, not a replan: WM 51995-52000, `cmd.runtime.approve` → `expected_event_types: ["node.unblocked"]`.
  - Mapping approval waits to run-level blocked would therefore break the Approve flow unless canon changes.
- **F3: no command caller.**
  - The 13 WM "Blocked run actions" rows (WM 51933 to about 52512) are Abort Run, Approve, Decline, the four Open views, Replan, Restore Safe Point Then Retry, Resume After Prerequisite, Retry Now, Skip Node and Start Fresh Attempt. Their expected events are `goal_run.stopped`, `node.unblocked`, `goal.replanned`, `safe_point.restored`, `scheduler.pass` or none. None is `goal_run.blocked`.
  - They are step-episode actions: UCC 1156-1167 maps each `allowed_action_id` to a `cmd.runtime.*` command whose arguments carry `blocked_sequence`, and `abort_run` is one of those ids (UCC 1166).
  - **Correction to the A3 stopped design, prop.:** A3 §1.3 and T-22 say the Abort Run entry "goes live only with the blocked contract". By this reading, Abort Run is reachable from any step-level blocked episode that lists `abort_run`, so it does not depend on `goal_run.blocked` (TB-17).
- **F4: no authority-grade trigger source.**
  - `blocked_projection` is a projection: `storage_value_registry.json` 3771-3814 @main, `"storage_kind": "redb_projection"`, "Projection rebuilds from EventRecord/receipt sources"; its producer is the "Executor blocked-state projector" and its consumers include "Goal Runtime blocked receipt".
  - The step events it rebuilds from (`node.unblocked`, `node.prerequisite_resolved`, `scheduler.pass`) are not among the 42 registered Event families.
  - `storage-plan.md` 109 calls `blocked_projection.{run_id}.{node_id}.{blocked_sequence}` "lifecycle truth", but the registry says "Run-scoped … keys are migration-read aliases only". The two disagree.
  - The v3 precedents require whole authentic owner sources, never projections. So the writer cannot yet prove its trigger (TB-02).
- **F5: storage blocks cannot be recorded while they hold.** Under GRS 3817 a viewer store runs "no producer … receipt writer". A `goal_run.blocked` for T12 could be written only after writer access returns, and by then the cause has cleared. T12 is a projection posture, not an Event trigger, whatever B-1 decides.
- **F6: the vocabularies disagree.**
  - Reason codes:
    - GRS BlockedReasonCode has 28 values (GRS 3501).
    - Executor: `permission_denied`, `user_declined`, `headless_ask_denied`, `filesafe_blocked`, `external_side_effect_blocked`, `replan_required`, `auth_required`, `validation_blocked`.
    - Decision_Policy: `remediation_ceiling_exceeded`, `worktree_conflict`, `dirty_worktree`, `plugin_hook_blocked`.
    - Permissions (9010): `approval_required`, `policy_denied`, `preflight_failed`, …
    - HITL: `waiting_approval`.
    - Several of these, such as `remediation_ceiling_exceeded` and `replan_required`, have no GRS code.
  - Actions: GRS `ActionId` (3502, for example `stop_goal`, `cancel_goal`, `replan`) differs from the UCC `allowed_action_id` (1156-1167, for example `abort_run`, `approve`).
  - The stop precedent keeps the v2 event-specific fields unchanged, so a mapping is needed (TB-06, TB-07).
- **F7: which states a v9 birth can block from.** v8's writers reach only `ready`, `running` and `provisional_success` before `certified` (A1 native-v8 protocol 129, the "bounded successful chain"; pkg `ADJUDICATION.md` 15: "an unbound verifying writer remain excluded"). So D-R16's `verifying`, `failed_verification` and `repairing` sources cannot occur until their writers exist.
- **F8: stop or block for the same code.** `budget_exhausted` and `verification_terminal_failure` are in both StopReasonCode (GRS 3499) and BlockedReasonCode (GRS 3501). This is an owner choice per code.
- **F9: a v8 run has no blocked path at all.** Attempts start with "terminal_result, result_ref and blocked_state_ref are null" (A1 native-v8 protocol 165), and non-passing results "cannot use this method" (169). A v8 run that meets any block simply waits, as the EP-082 deferral says, and records no run event.

## 5. The writer W-B (all names prop.), by analogy to W-C

### 5.1 Where the analogy holds and where it breaks

| Element | W-C stop (A3 design §2.3) | W-B blocked (prop.) | Analogy |
|---|---|---|---|
| Event and edge | `goal_run.stopped`, D-R21 | `goal_run.blocked`, D-R16 (GRS 3733) | holds |
| Native issuer | Executor, Workflow body owner | Executor: `owner.workflow.run_block.publish_blocked.v1`. Its basis is stronger than stop's (EP 54; GRS 3919) | holds |
| Callers | Orchestrator Pause and Abort Run handlers | **No command** (F3). The Executor scheduler pass's run-level evaluation (EP 244: "Evaluate readiness, blocked, backoff, graph-integrity, and capacity predicates"; EP 249: route "blocked … or replan outcomes"). Possibly the bounded manager (Crosswalk 365), if TB-01 says so | **breaks** |
| Storage participant | `owner.storage.workflow_stop.commit_original.v1` | `owner.storage.workflow_block.commit_original.v1` | holds |
| Readers, recovery | `read_current`, `read_retained`, `inspect_original`, `recover` (via `resolve.v2`) | the same four under `owner.workflow.run_block.*` | holds |
| D01 rule and origin | `original_run_stop` (`cause=owner_status`), `run_stop_original` | `original_run_block` (`cause=owner_status`), `run_block_original`. The v8 `BoundTransitionRule` enum @A1 has 11 values and neither of these | holds |
| Fence against new work | the latched Goal host Stop | the native `blocked` status (GRS 3468). Whether native status alone fences dispatch is A3 T-03, shared here as TB-04. Under B-1 option 1 nothing is runnable at the moment of recording | partly |
| Quiescence | a precondition: record when quiet (C-3) | part of the trigger itself: EP-082's "no node is runnable", plus no running attempt or open effect | holds, but in a different role |
| Reason | the route admits only `user_stopped` | taken from the owner block record; the admitted subset is set by B-1 and TB-06 | **breaks** |
| Extra evidence | none beyond the Goal Stop and quiescence | a block receipt that "must exist before append" (GRS 3732), `preserved_work_refs`, and an owner-valid action set. This is closer to the certified route, which writes its receipt durably first and publishes after (A1 native-v8 protocol 129, "durable Standard v2 receipt → native certified transition"). **By analogy to certified, not to stop** | **breaks** |
| Goal effect | the Goal Stop is latched (C-2) | the Goal is unchanged (B-2, recommended) | **breaks** |
| Profile | v9 only (C-4) | v9 only (C-4 answer: "one v9 carries both the stop and the blocked writers") | holds |
| Precedence | — | Stop wins over block (GRS-051, GRS 511: "A manual Stop, Pause, or Cancel is authoritative and terminal for automation") | new |

### 5.2 Inputs (all D06-free; the EP unit says so in words, as W-C's does)

1. The whole current D01 `CurrentSource` and native body and control at an exact revision. This is the compare-and-set basis.
2. A separate current Goal argument proving that **no** Goal Stop is latched on the GRS-073 host-selected row. If Stop is latched, the stop route owns the run, and W-B returns `unavailable`.
3. **Trigger proof (content depends on B-1)** from authoritative owner sources, never from `blocked_projection` (F4):
   - (a) The run-level census: no runnable node, no running attempt, no unacknowledged dispatch, no open effect or tool call, no capacity reservation and no unresolved mutation fence. These are the same five facts as A3 T-02, shared here as TB-03.
   - (b) For each blocking required WorkNode, its authentic owner block record: episode identity `{run_id, node_id, blocked_sequence}`, reason code, ordered actions, and for T11 the remediation counter under the Decision_Policy ceiling.
   - (c) For T19, an authentic non-pass Standard decision record, if TB-12 creates one.
4. **Block receipt:** a durable receipt of `ReceiptKind` `goal_blocked` (GRS 3497), written before the joint publication. Its family and issuer are TB-05; the `goal_receipt.v1` family is the candidate by analogy to certified.
5. **Preserved work:** the settled mutation census from attempt records and FileSafe/WorktreeGit. It may be empty only when no mutation began (GRS 3732).
6. **Allowed actions:** each one must name an action whose issuer is bound in this run's profile at write time (TB-07).
   - Before `goal_run.replanned` is current, that is only Abort (maps to `stop_goal`? TB-07) through the v9 stop writer.
   - `replan` becomes valid only once the replanned contract is current.
   - `cancel_goal` is invalid for the run while D06 is unbound: GRS-089 @A1 8337-8338, "GRS-078 from step 5 (D05 then positive D06) onward stays unavailable".
7. For v8-lineage held slots only (if v9 keeps them): the A1 revocation reader, as corroboration only. This is TB-11.

**Explicitly not inputs:**
- `StopSource`, `SchedulerStop`, `RunOperationResult(operation=cancel)`, `record_cancellation.v1`, `record_stop.v1`, D05 and D06.
- A1 `RunRevocationCurrent` as a block cause: a revocation is the Stop route, not a block.
- The Goal's own `blocked` state.
- `blocked_projection`.
- A model's free-text judgement, unless TB-01 binds the bounded manager.

### 5.3 The joint outcome, in two phases (by analogy to certified)

- **Phase 1:** the block receipt is written durably, and nothing is published yet.
- **Phase 2:** one joint native outcome.
  - The body status goes from the source to `blocked` and the revision advances exactly once. All other body fields stay equal.
  - The control matches, and the D01 update, head, pointer and origin are written.
  - Custody families (prop.) are written, all `RP-AUTHORITY-INDEFINITE@1.0.0` with mandatory backup: `executor_workflow_run_block_intent`, `_control`, `_result` and `_origin`.
  - Exactly one `goal_run.blocked` v3 EventRecord is written, with its first barrier adopting SP-286 by name.
  - Goal body, control and Stop latch are preserved (the GRS-080 7502 wording pattern).
- **Before publishing,** the final U/G-style predicate is re-run over the complete final write set (as in A1 native-v8 protocol 213). If the trigger no longer holds, the result is `unavailable` and no Event is written.

### 5.4 Crash cuts

- **Crash before phase 1:** nothing is visible.
- **After phase 1, before phase 2:** a receipt exists with no Event. A retry with the same key reuses that receipt.
  - If the trigger has cleared, the receipt stays as unpublished history and is never read as a block. The projection reads Events only.
  - Whether such an orphan receipt needs an explicit "superseded" marker is TB-05.
- **After phase 2, before the acknowledgement:** the same key returns the first original Event and receipt. No new key or timestamp is minted. This follows GRS 7443: "A missing acknowledgement, expired event or newly generated key/timestamp cannot restart the original run".

### 5.5 Refusals

- A certified, failed, cancelled or stopped source returns `illegal_transition` (GRS 3733).
- A stale Workflow revision returns `revision_conflict`. The same key with a different digest returns `idempotency_conflict`. Unprovable dedupe returns `dedupe_unavailable`.
- `blocked -> blocked`: a same-key repeat returns the first Event. A new identity returns `unavailable` in the first contract, because D-R16 needs "new evidence/action/recovery revision" and D-R19 `remain_blocked` belongs to the replanned contract (TB-08; compare A3 T-08 and T-10).
- Each of the following returns `unavailable`, which is source quality, never a lifecycle state:
  - a latched Goal Stop (Stop wins);
  - a trigger not proven, or a run not quiescent;
  - a missing block receipt;
  - an action set that is empty or unbound;
  - a reason code outside the admitted subset;
  - an unsupported birth profile;
  - storage not writer, which is refused by Storage anyway (F5);
  - a held, unreleased v8 certified Event or held Replan operation (TB-11, by analogy to A3 T-09).

### 5.6 Withdrawal (the same protocol as W-C, which certified passed)

- A profile successor that omits W-B cuts off the writer.
- Readers are fenced by the reader version.
- The projection is rebuilt as a successor that halts on blocked rows again.
- Written Events stay under `RP-AUTHORITY-INDEFINITE`.

### 5.7 The profile vehicle and the payload

- **`all_writers.v9` (prop.)** carries:
  - every v8 writer: started, the cancelled grammar with D06 unbound, certified, and the Replan source;
  - W-C and W-B;
  - the D01 rules `original_run_stop` and `original_run_block`;
  - the origin kinds `run_stop_original` and `run_block_original`.
- **No v6, v7 or v8 birth can ever record blocked** (EP 7523; EP-127 @A1 8985).
- **Payload v3 (prop.), by analogy to the stop design §3:**
  - `pm.goal_runtime_event.goal_run_blocked.schema.v3`, with the GRS-079/080 v3 envelope (Workflow revision pair, required inner key, no `expected_goal_revision` or `parent_goal_id`).
  - The event-specific fields are the six v2 fields, unchanged (GRS 3731), with the admitted enum subset stated in owner text.
  - Key tail: `[… expected_goal_run_revision, goal_run_revision, goal_run_id, blocked_reason_code, block_receipt_ref]`, which keeps the v2 tuple that depth42 `scope_identity` recorded.
  - `correlation_id` is the scheduler-pass identity. There is no command receipt, and `causation_event_ref` is absent, because the step-level causes are not registered Events.
- **Projection branch (the A3 §5 chain, successor `v8`), rules prop.:**
  - blocked is supported from admitted sources, with the source taken from the native before-commitment;
  - blocked → stopped is legal (D-R21);
  - blocked → cancelled is legal only on the positive-D06 branch;
  - blocked → running or blocked needs an admitted replanned;
  - certified after blocked, or blocked after certified, cancelled or stopped, halts.

## 6. Which questions go to whom

- **Product (Jared):** which situations count as a blocked run (B-1), what the Goal shows (B-2), and whether blocked ships before run replan (B-3). Each changes what a user sees, and what they must do, to continue.
- **Owner:** everything that decides how a chosen answer is proven or written (TB-01 to TB-17).

## 7. Product cards (DL-036 form; drafts, not presented)

### Card B-1: which situations count as a blocked run
Card ID: `EA-A3-GOALRUN-BLOCKED-TRIGGER-001` (prop.). Owner: Executor (scheduler and blocked state), with Goal Runtime, Orchestrator and Decision Policy.

**Name:** When a Workflow run is recorded as blocked.

**Question:** Which situations should record a Workflow run as blocked (`goal_run.blocked`)?

**Why:**
- Canon points both ways.
  - One Goal Runtime table says a permission denial or approval request makes the run blocked (GRS 3819).
  - The Executor says that when steps wait, the run is only "deferred", and other steps keep running (EP 381, EP 864).
- A blocked run is fenced. Clearing the cause does not restart it. Only a replan does (GRS 3468), and run replan is not current yet.
- No button or wiring expects the blocked event today. Approve expects the step to continue by itself (WM 51995).
- The process ruling Q-09 says this is your decision when canon does not define it, and it does not.

**What you get:**
- **Option 1:** the run history shows real dead ends, each with its reason and way out. Approve, Retry and the other step buttons keep working as today.
- **Option 2:** the run history also shows every stall where a person has to act.
- **Option 3:** the most visible: the first approval request already shows the whole run as blocked.

**What it costs:**
- **Option 1:** a run waiting for an approval shows as "waiting", not blocked, in the run history. The waiting step shows on its own blocked card, as today.
- **Option 2:** once the run is recorded blocked, Approve alone no longer restarts it. It needs a Replan, and until run replan exists, the only way out is Abort. The Approve wiring would also need changing.
- **Option 3:** everything option 2 costs, and it also halts unrelated steps that could still run. That contradicts the Executor's rule (EP 381).
- **In every option,** storage problems cannot be recorded while storage cannot be written. They stay a warning on the screen.

**Options:**
1. **Dead end only (recommended).** The run is recorded blocked only when nothing can run and nothing is running, and a required step is stuck on something only a Replan or an Abort can fix: the repair limit was reached, a replan is required or the plan graph is broken, or the final check fails on an open blocker. Everything else stays a step-level wait.
2. **Stuck waiting on a person.** Also record blocked when nothing can run and every remaining step waits on a person or another owner (approval, clarification, sign-in, FileSafe, a worktree fix).
3. **Any approval or permission block**, as the Goal Runtime table reads literally.

**Recommendation:** Option 1. It records only the stalls that need a run-level decision, and it breaks no existing button.

### Card B-2: what the Goal shows while its run is blocked
Card ID: `EA-A3-GOALRUN-BLOCKED-GOAL-001` (prop.). Owner: Goal Runtime, with Orchestrator.

**Name:** The Goal of a blocked run.

**Question:** When a Workflow run is recorded blocked, should its Goal also show blocked?

**Why:**
- A Goal has its own `blocked` state that names an owner condition (GRS 95), and Resume stays disabled until that condition clears (GRS 173).
- No current writer can set a Goal to blocked today (`goal.blocked` is UNDISPOSITIONED in depth42).
- For a stop, you chose to pause the Goal as well (C-2).

**What you get:**
- **Option 1:** no new Goal contract is needed. The run card and the run history show blocked, with its reason and actions.
- **Option 2:** the Goal list shows the block too.

**What it costs:**
- **Option 1:** the Goal reads "active" while its run cannot move.
- **Option 2:** a current `goal.blocked` writer has to be written first, and Goal Resume must be routed to run replan.

**Options:**
1. **The Goal stays as it is (recommended).**
2. **The Goal also moves to blocked**, naming the run's block.

**Recommendation:** Option 1. It needs no extra contract, and the run already shows the reason.

### Card B-3: the way out before run replan exists
Card ID: `EA-A3-GOALRUN-BLOCKED-EXIT-001` (prop.). Owner: Executor, with the A3 coordinator.

**Name:** Blocked runs before run replan exists.

**Question:** A blocked run can only continue through a replan, which is not current yet. Should v9 record blocked runs anyway, so that their only way out until then is Abort Run?

**Why:**
- The rule is in GRS 3468. DL-080 orders blocked before replanned.
- Cancellation (D06) is not available (Q-12), so it is not a way out either.

**What you get:**
- **Option 1:** stalled runs become visible and can be aborted as soon as v9 exists.
- **Option 2:** no blocked run ever lacks a Replan exit.

**What it costs:**
- **Option 1:** until run replan lands, a blocked run cannot be continued, only aborted. Under card B-1 option 1, such a run could not have continued anyway.
- **Option 2:** the blocked writer is carried in v9 as grammar only, with its issuer unbound (the Q-12 pattern), and it goes live only when replanned does. Stalled runs stay invisible until then.
- **Option 3:** it changes a lifecycle rule and needs a new owner contract. It also conflicts with DL-080's resume rule, which "keeps expecting these events".

**Options:**
1. **Record blocked in v9, with Abort as the exit until replan lands (recommended if B-1 is option 1).**
2. **Hold the blocked writer until run replan is current** (recommended if B-1 is option 2 or 3).
3. **Let a blocked run resume without a replan when its cause clears.** Not recommended.

**Recommendation:** Option 1, provided B-1 is answered with option 1.

## 8. Owner, technical and process questions

| ID | Question | For |
|---|---|---|
| TB-01 | Is Executor the sole issuer (recommended), with the scheduler pass as caller? Or does the bounded manager (Crosswalk 365, "scheduler plus bounded manager agent contract") decide when to block? If it is the manager, its authentic `BoundedManagerResult` becomes an input. | Executor, Crosswalk |
| TB-02 | Which authoritative record proves a blocked episode and the remediation counter? `blocked_projection` is a projection, the step events are unregistered, and `storage-plan.md` 109 disagrees with the registry alias note (F4). This must be settled before any trigger is provable. | Executor, Storage |
| TB-03 | Does D01 `CurrentSource` carry the five quiescence facts? (Shared with A3 T-02.) | Executor |
| TB-04 | Does native `blocked` status alone fence dispatch? (Shared with A3 T-03.) | Executor |
| TB-05 | The block receipt: which family (`goal_receipt.v1`, kind `goal_blocked`?), which issuer (the `blocked_projection` consumer list names "Goal Runtime blocked receipt"), its order relative to the Event, and how an orphan receipt is handled after a crash. | Goal Runtime, Storage |
| TB-06 | How the Executor, Decision_Policy, Permissions and HITL codes map onto `BlockedReasonCode`; whether v3 widens the enum (for example `remediation_ceiling_exceeded` has no GRS code); and which subset the first contract admits after B-1. | Goal Runtime, Executor, Decision Policy |
| TB-07 | The map from `ActionId` to UCC `allowed_action_id` (for example `stop_goal` to `abort_run`?), and "owner-valid" defined as "issuer bound in the run's profile at write time". | Contracts, UCC, Goal Runtime |
| TB-08 | `blocked -> blocked`: refused in the first contract (dedupe only, recommended), or admitted on a changed blocker? | Goal Runtime |
| TB-09 | Goal host continuation while its run is blocked (GRS-050): does it keep starting turns? | Goal Runtime |
| TB-10 | The Stop-versus-block race: recheck at the final boundary, and Stop wins (GRS-051). | Executor, Goal Runtime |
| TB-11 | Should W-B refuse while a v8 held certified Event or a held Replan operation exists? (By analogy to A3 T-09.) | Executor, A1/A2 |
| TB-12 | Standard tier, verifier unavailable with a mutation: block, fail or wait (GRS 3820 is silent)? Does the Standard decision owner issue an authentic non-pass (`blocked`) decision record for a G4 failure? Without one, T19 cannot be proven. | Orchestrator, Executor |
| TB-13 | `budget_exhausted`: stop or block (Permissions 9013 against StopReasonCode)? And which budget owner remains after Goal budgets were retired (GRS 35)? | Permissions, Executor |
| TB-14 | Should `ready -> blocked` be admitted before any started row? (Compare A3 T-18.) | Goal Runtime, Executor |
| TB-15 | Exclude the refusal codes (T22) and the retired child code (T23) from the admitted subset (recommended). | Goal Runtime |
| TB-16 | The chain position: the blocked branch as successor `v8` after A3-stopped `v7` (A3 §5 table). The v9 birth scope is carried per branch. | A2, A3, coordinator |
| TB-17 | Confirm the prop. correction to A3 §1.3 and T-22: Abort Run is reachable from a step-level blocked episode (UCC 1166) and does not wait for `goal_run.blocked`. | Orchestrator, wiring owner |

## 9. Order

1. `goal_run.stopped` lands first, as Q-09 rules, so card B-1 holds nothing else up.
2. Cards B-1 to B-3 go to Jared, and TB-01, TB-02, TB-05 and TB-12 go to the owners, before any W-B prose. W-B's inputs depend on all of them.
3. The v9 profile carries W-B's grammar once B-1 is answered. Under B-3 option 2, the issuer stays unbound until replanned.
4. The blocked registry-row revision needs its own Q-02 checkpoint card, as the stop design's §7 does: exact before and after rows, the row fingerprint before (`f137e724…b4a5`), and the registry SHA-256 before (`0be54418…c842`) and after.

## 10. Evidence

- `Plans/Goal_Runtime_System.md` @main, SHA-256 prefix `f233eb9c22c5dd14`.
- `Plans/Executor_Protocol.md` @main, prefix `53125b0e45132356`.
- `Plans/event_payloads/goal_runtime/goal_run_blocked.schema.json` @main, `66400648120d8b6c60c7a47962433bd192ef942fb9b9bbced9d76e07b2790500`.
- pkg v3 files:
  - `PROTOCOL.md` `c7467dfa055dbba60ea6551f1b658861a7b1b6300226a7e2d470f21b14fcc0e0`;
  - `inputs/plan/PLAN.md` `fcc273e95c2e32a4cfa1b1d902593777b10b41eee67706ac4790e3518683ae3c`;
  - `replan/PROTOCOL.md` `72cc5792fef3292c70c6b3827a0d599afe0c525125025521163e98ab4e3f404d`;
  - `inputs/scope/ADJUDICATION.md` `1e2a9747323a0c6021e07564885f117d02c9b74dea9838d5ac45ae3caa12db40`.
- Working extracts (not evidence) are in this directory: `main/*.md`, `.A0.md`, `.PA.md`, `.GRS-a1.md`, `.EP-a1.md`, `.v8protocol.md`, `.replan-protocol.md` and `.WM.json`.
