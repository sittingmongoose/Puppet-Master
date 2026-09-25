# A3 `goal_run.blocked`: design for the current contract on `all_writers.v9` (label D-blocked)

- Program: Event Authority Step 8(b) Group A, branch A3, DL-080 current contracts, family `goal_run.blocked` only. It is the sibling of `a3-stopped-scope/A3-stopped-design.md` and uses the same section structure. `goal_run.replanned` is not designed here.
- Base, read as git objects only: `origin/main` = `63cf2cb97f936c91dd7bb5c585d9a35d8409ed61`. Pending context, not canon: A1 `origin/plans/replan-v8-a1-20260925` = `e8d61ace4c`; process answers `origin/plans/replan-v8-process-answers-20260925` = `616f12bfde` (`reports/event-authority-20260911/replan-v8/process-answers-20260925.md`, "PA" below).
- Inputs: B1 (current canon), B2 (trigger inventory and writer), V1 (the v9 profile) in this directory; the stopped design and its S3, S4 and S5 notes; Jared's answers to C-2, C-3 and C-4 (`a3-stopped-scope/cards-C2-C4-20260925.md`); the A2 projection note `a2-scope/R2-projection.md` (the A2 design file does not exist yet). This note resolves those inputs into one design. Where they disagree, it says so. It changes nothing in the repository.
- **`origin/main` moved during review (CR-06).** Local `origin/main` is now `abdf4eeadf7abaef2772b5a320073dd878656e28`; `git ls-remote` shows remote `main` at `bd95afcc8` (not fetched; this note stays read-only). At `abdf4eead`: DL-094 registered `coordination.agent_registered` (A2 design §0.3 names commit `3abdf9fe3`), and the Event registry is revision `2026-09-25.1`, 43 families, SHA-256 `4227be36806615cabc8a36c0a8a6555a24b6b6c38e960e07bd12354c3c373e70`. Rechecked there: row 0 (blocked) fingerprint still `f137e724…b4a5`; row 2 (certified) `f58cc6a7…654e`; row 5 (stopped) `8acbc249…e0a3`; Storage registry still 294 families; F1-F3 lines and readiness 491 unchanged; `REVIEWED_GOAL_SUCCESSORS` now starts at `scripts/pm-browser-event-admission.py` 49; the PNC-019 comment block is now lines 43-53 and the constants 54-55; DL-080's canonical text is now `Decision_Log.md` 6669-6670 and its acceptance criterion 6679. Every registry "before" value in §6 and §7 is therefore a placeholder, re-derived at the rebase base.
- Verified for the first draft (all at `63cf2cb`; still true there, stale on the current main where the bullet above says so):
  - Registry SHA-256 `0be544181eda423dcea4d8661206e7da6d066fdcf51913d5962f1a283635c842`, `registry_revision` `2026-09-11.2`, 42 rows.
  - Blocked row `#/families/0`, `Plans/event_family_registry.json` lines 9-50. Fingerprint (sorted keys, `(",",":")`) `f137e7243c8030887b0e4624228c3603dc3a9026170b86bb72e1ffb552b4b4a5`. The row has the same fingerprint at `b09294e44b`, the commit the Browser gate's historical pins come from.
  - 40-row prefix hash `a27cf49b…1050` (row 0 is inside it). `event-family-goal-run-blocked` is in `Plans/browser_event_admission.json` `preexisting_family_ids`.
  - depth42 file `reports/event-authority-20260911/step-08-depth42-assessment-20260924.json` SHA-256 `ba9b84f9…49fd`; blocked row: 2.0.0, `UNDISPOSITIONED`, 3 PASS.
  - A simulated after row that changes only the six Browser-reconstructable fields reconstructs to `f137e724…b4a5` (§6.3).
- **Convention.** "(prop.)" marks a proposal. "By analogy" marks reasoning from the stop writer or another precedent rather than from text. Unit numbers are assigned at authoring or landing, after rebase.
- **One naming fix.** B2 uses `original_run_block` / `run_block_original`; V1 uses `original_run_blocked` / `run_blocked_original`. This design takes B2's form, because it matches the stop pair `original_run_stop` / `run_stop_original` (verb stem). V1 should be aligned (P-08).

---

## 0. The design in brief

- **What the event records.** `goal_run.blocked` records one Workflow GoalRun's native body moving into `blocked` on the D-R16 edge (GRS 3733), and nothing else.
  - The run stays fenced and nonterminal (GRS 3468).
  - It leaves `blocked` only by the v9 stop writer (D-R21 admits a `blocked` source, GRS 3768), by D06 (unbound, Q-12), or by a future admitted `goal_run.replanned`.
  - It is not the Goal's `blocked` state, and it is not a step-level blocked episode.
- **When it happens (the trigger).** Canon does not define it (B1 §7, B2 §2). Under PA Q-09 this goes to Jared as card **B-1**. The design is written for the recommended answer, option 1, and says what changes under the others.
  - **What v9 can reach (CR-01).** v9 carries v8's native roster, which records only a successful first-attempt chain: no retry, repair, failure-result or step-block writer (A1 native-v8 `protocol.md` 129, 163, 165, 169). So canon's general dead-end causes (repair limit, replan required, broken graph) cannot occur on v9 births; they are cited here only by analogy. The dead end a v9 run can actually reach is a failed check that no v9 writer can record (§2.3a). Card B-1 is re-derived on that basis.
- **The writer.** A new blocked publisher W-B, issued by Executor, with Storage as participant and D01 as observer (new rule `original_run_block`, origin kind `run_block_original`). It has no command caller; the Executor scheduler's run-level evaluation calls it.
  - Per C-4 option 2 it exists only in `pm.executor.workflow_source.all_writers.v9` (prop.), together with the stop writer W-C. No v6, v7 or v8 birth can ever record blocked.
  - It writes in two phases: first a durable block receipt, then one joint native outcome with the Event (by analogy to certified, not to stop).
- **The payload.** v3 successor `pm.goal_runtime_event.goal_run_blocked.schema.v3` with the GRS-079/080 envelope. The six v2 event-specific fields stay. The key tail is the GRS 3555 semantic identity `goal_run_id, blocked_reason_code, block_receipt_ref`. The reason enum is a real open point: B-1 option 1's dead-end causes have no `BlockedReasonCode` today (TB-18).
- **The projection.** One shared successor after A2's `v6` admits v9 births and adds both the stopped and the blocked branches (prop.; this replaces the stopped design's separate `v7` stopped / `v8` blocked positions).
- **Two landings.**
  - Landing 1 (source phase) lands on `main` before the v9 package freezes, and v9 pins its landed bytes as members (prop.; the same order as `v9-profile-plan.md` §0 item 2 and the stopped addendum §4.1; the coordinator confirms it as Q-V9-08 / V1-Q8; CR-03). Writer, v3 schema, custody. No Event registry row changes, so no Q-02 card.
  - Landing 2 (adoption phase) goes with stopped, as one landing or two sequential landings (open, P-01): registry row `#/families/0` 2.0.0 → 3.0.0, the projection successor, the re-freezes, the Q-02 card answered before landing, the Q-03 record and the depth file.
- **What needs deciding first.** Cards B-1, B-2 and B-3 to Jared, and owner rulings TB-01, TB-02, TB-05, TB-12, TB-25 and TB-26 (TB-18 only for a cause outside the existing enum), before any W-B prose. B-1 also gates the v9 freeze, so it sits on the stop writer's critical path too (P-03).

---

## 1. What the event means and the transition it records

**Source text (origin/main):**
- GRS 3731-3733, D-R16 (`EA-UND-0016-GOAL`):
  - Fields: "`R{goal_run_id:ref,blocked_reason_code:BlockedReasonCode,blocked_scope:Scope,allowed_action_ids:ActionId[],preserved_work_refs:ref[],block_receipt_ref:ref}`".
  - Branches: "allowed actions are non-empty and owner-valid; permission/recovery branches carry the same restrictions as `D-R01`. `preserved_work_refs` may be empty only when no mutation began. Block receipt must exist before append."
  - Transition: "`ready|running|provisional_success|verifying|failed_verification|repairing -> blocked`; `blocked -> blocked` requires new evidence/action/recovery revision. Certified/failed/cancelled/stopped sources are illegal."
- GRS 3468: "`blocked` and `stopped` are fenced, resumable only through a new revision and valid `goal_run.replanned` admission."
- GRS 3794, oracle pair: positive "Block a running GoalRun with validated block receipt, preserved work, exact scope and owner-valid action set; projection becomes `blocked`."; negative "Reject missing receipt, empty actions, invalid recovery action, preserved mutation omitted, blocked update with no new evidence, or block from terminal/stopped run."
- GRS 3555: semantic identity `goal_run_id,blocked_reason_code,block_receipt_ref`.
- EP 862-865, run-level deferred rule: "if no node is runnable and blocked, backoff, or prerequisite-waiting work exists, the run is deferred rather than terminal."
- A1 `Plans/workflow_standard_source_contracts/native-v8/protocol.md` 80: "Nor does it settle the condition that puts a run into `blocked`, which remains an owner decision."

**Proposed meaning (the GRS semantics unit states it):**
1. **What the event is.** The one original Event of a Workflow GoalRun's native body transition into `blocked` by the D-R16 route, published in the same joint native outcome as that transition.
   - It is not a Goal state. The Goal V2 statuses stay `active | paused | blocked | completed` (GRS 95), and the Goal is unchanged (card B-2, recommended option 1).
   - It is not a step-level blocked episode. Those stay Executor overlays keyed `{run_id, node_id, blocked_sequence}` (EP 800), with their own actions (Approve, Retry, …) unchanged.
   - It is not a stop and not a cancellation.
2. **What the transition changes.** The native body `status` goes from the source to `blocked`, and the body revision advances exactly once. Every other body field is unchanged. Goal body and control, the Goal Stop latch, WorkNodes, attempts, prior results and schedules stay under their owners (the GRS-080 7502 wording pattern).
3. **Source states admitted by the first contract (prop.).**
   - `running` and `provisional_success` are admitted. On v9 births these are the only sources a B-1 option-1 dead end can reach (§2.3a).
   - `ready` is admitted only if TB-14 says a graph-integrity failure before the first dispatch is a block. On v9 births such a failure leaves no durable record (a refused `admit_first_attempt`), and reading `graph_integrity` as a block is itself an inference (TB-27). So `ready` is grammar only in the first contract unless TB-14 and TB-27 both say otherwise (changed for CR-01, CR-02).
   - `verifying`, `failed_verification` and `repairing` are admitted in grammar only. No v9 writer reaches them (B2 F7: v8's chain is "ready → running → provisional_success → certified").
4. **`blocked -> blocked`.** Not admitted. D-R16 needs "new evidence/action/recovery revision", and D-R19 `remain_blocked` belongs to the replanned contract. A same-key repeat returns the first Event; a new identity returns `unavailable` (TB-08).
5. **Exits from `blocked`.**
   - To `stopped`, by the v9 stop writer W-C (D-R21, GRS 3768). A blocked run is already quiet, so under C-3 option 1 Abort records stopped at once.
   - To `cancelled`, only by D06, which stays unbound (Q-12). No working cancel exists.
   - To `running` or another state, only through an admitted `goal_run.replanned`, which is not current.
   - The contract says in words: "a blocked run stays fenced until an admitted `goal_run.replanned`, a v9 stop, or a D06 cancellation; only the stop is supplied today".
6. **Consequence for the stopped design (P-06).** Its §1.3 says a `blocked` source "cannot occur until the `goal_run.blocked` writer exists". Both writers now arrive in the same v9, so the stop writer's `blocked` source goes live in v9 together with W-B.
7. **Relation to EP-082 "deferred" (inference; TB-20).** EP-082 calls a run with no runnable node "deferred rather than terminal". "Deferred" is not a GoalRunStatus value. Recommended reading: "deferred" is the scheduler's posture of a nonterminal run, and it does not exclude native `blocked` when the W-B trigger holds. The EP unit states this in one sentence and does not rewrite EP-082. Under B-1 option 1 every other stall stays "deferred" exactly as today.

---

## 2. The writer (in v9, per C-4) and the trigger

### 2.1 Why no existing method can write it

- EP-118, EP 7523: "All unlisted Workflow writers remain refused by `RequiredOtherWorkflowWriterSource=false`". No run-blocked writer is listed.
- A1 EP-127 (A1 EP 8985): "The limited operation appends no Event and adds no goal_run.stopped, goal_run.blocked or goal_run.cancelled writer." EP-125 (A1 EP 8696, 8700): "an unknown or incompletely enrolled participant refuses birth"; "there is no late or old-birth enrollment".
- GRS-026 (GRS 3919) leaves "blocked overlays" with the Executor scheduler; D-R16's basis GRS-027 is superseded, and the contracts it hands custody to were never written (B1 §0).
- No command or wiring row expects `goal_run.blocked` (B1 §6; B2 F3). The 13 "Orchestrator > Blocked run actions" rows are step-episode actions.

### 2.2 The writer, by birth profile

| Birth profile | Blocked writer | Evidence |
|---|---|---|
| EP-118 original/activation, `all_writers.v6`, `all_writers.v7` | **None, and none can be added.** Stalls stay "deferred" (EP-082). | EP 7523 |
| `all_writers.v8` (A1, lands as reviewed per C-4 option 2) | **None.** A v8 run that meets a dead end waits and records no run event (B2 F9). | A1 EP-127 8985, EP-125 8700 |
| `all_writers.v9` (prop.) | W-B, installed at birth, beside W-C. What it can prove on a v9 birth: §2.3a | C-4 answer: "one v9 carries both the stop and the blocked writers once blocked's trigger is decided" (cards file 117, 119) |

### 2.3 The trigger: what canon gives and the product choice

- B2 §3 lists 26 rows, of which T22-T26 are not block triggers (T22 refusal codes, T23 cannot arise under Goal V2, T24 codes left from older Goal kinds, T25 terminate, T26 stopped). Nearly all the rest are step-level waits (approval, permission, clarification, sign-in, FileSafe, worktree, plugin hook, restore). For those EP-082 says the run is "deferred", and EP 381 says "unrelated blocked or waiting nodes MUST NOT stall runnable work elsewhere in the graph".
- Only GRS 3818-3820 maps conditions straight to `goal_run.blocked`. GRS 3819: "Permission denial/approval required | Named `goal.blocked`/`goal_run.blocked`, exact permission evidence and actions".
- D-R19 defines `remain_blocked` only as a replan successor. GRS-085 only halts. So there is no existing definition, and PA Q-09 applies: "do not decide it: present Jared a DL-036 card with the concrete options canon supports".
- **Storage-caused blocks (T12) are out in every option.** Under GRS 3817 a viewer store runs "no producer … receipt writer", so the Event could only be written after the cause clears (B2 F5). They stay a projection posture.

### 2.3a What a v9 birth can reach (added for CR-01)

The first draft took its dead-end causes from the general Executor and Decision_Policy text and did not check them against the roster v9 installs. v9 keeps every v8 method ID (`v9-profile-plan.md` §2). The v8 native roster is:
- 18 native methods (`native-v8/methods.json` @A1): `admit_first_attempt`, `capture_original_input`, `begin_attempt`, `submit_verification`, `record_verified`, `complete_worknode`, `publish_execution`, `publish_provisional_success`, `issue_final_decision`, `capture_standard.v2`, `prepare_certified`, `publish_certified_joint`, `read_retained`, `read_standard`, `update_execution`, `update_provisional`, `update_certified`, `read_current`. No method ID in any A1 `methods.json` (native-v8, fresh-profile, combined guard, coordinator, producer, Replan) names a failure, block, retry or repair (grep, @A1).
- A1 native-v8 `protocol.md` 129 @A1: "Unsupported retry, general repair, waiver, exception, child or unknown writer branches remain unadmitted".
- Line 163 (`begin_attempt`): "Its WorkNode is queued, has no prior attempt, empty retries…". Line 165: "terminal_result, result_ref and blocked_state_ref are null". No other line of that protocol sets `blocked_state_ref`.
- Line 169 (`record_verified`): "Failing/blocked/skipped/unresolved results cannot use this method."
- B2 F9 already says "a v8 run has no blocked path at all". The first draft did not carry that into v9.

**Consequences (inference from the lines above).**
- **Remediation ceiling** (Decision_Policy 423): needs repeated attempts. v9 has one attempt per WorkNode, so the ceiling cannot be reached.
- **`replan_required`** (EP 419) and **`graph_integrity`** (EP 418): no v9 writer records either as a result. `graph_integrity` is a `failure_class` ("hard fail; replan path only"), not a blocked reason code; reading it as a block trigger is an inference (TB-27). A graph fault before the first dispatch shows only as a refused `admit_first_attempt`, which leaves no durable record.
- **Step-level blocked episodes** (approval, permission, clarification, sign-in): no v9 method records one, so options that trigger on them (B-1 options 3 and 4) have no native source on v9 births either.
- **What a v9 run can reach.** A required step's first attempt whose own verifier returns a failing result: `record_verified` refuses it, no writer records a failure, and the attempt stays `verify_pending` in native state. Or a run at `provisional_success` whose final Standard decision fails G4 (A1 native-v8 `protocol.md` 189 @A1), if TB-12 finds a durable non-pass decision record. In both cases the run stands still and nothing in the native state says why.
- **Where a proof could come from.** Only from an owner record outside the native roster: the verifier's own failing result, or the final Standard decision. Whether either is an authentic, authoritative trigger proof for W-B is new owner question TB-25. Without it, W-B is installed on v9 births but can never write.
- **Is such a run quiet?** The failing attempt stays `verify_pending`, never terminal. If the owners count it as "running" for the quiet census, the run is never quiet: W-B cannot write, and a C-3 stop on the same run stays pending forever (W-C also needs quiet). New owner question TB-26, shared with stopped's T-02 / TB-03.
- **Canon's reason code fits the v9 case.** `verification_terminal_failure` is already a `BlockedReasonCode` (GRS 3501), so the enum problem (TB-18) applies only to causes outside that list, which only a later profile with retries could reach.
- **The alternative is a scope change.** v9 could also install native outcome writers that record the failed check (`failed_verification`, a D-R16 source state) in the run's own state. That adds writers and source contracts to v9, which is a product and scope change, so it is shown on card B-1 as its own option.

**Product options (card B-1, §7.2), re-derived against the v9 roster:**

| Option | Recorded blocked when | Effect on existing exits and buttons |
|---|---|---|
| **1, failed check with no way on (rec., conditional on TB-25 and TB-26)** | The run is quiet, and a required step's first attempt has a failing result from its own verifier, or the final check fails on an open blocker (G4, only if TB-12 creates a non-pass record), and no v9 writer can record that result. Reason `verification_terminal_failure` (prop. map, TB-06). Proof: the verifier's or final decision's own record (TB-25) | Once recorded, the run is fenced (GRS 3468). Canon also names a manual fix (Decision_Policy 423) and a patch (EP 419) as ways out of dead ends, and the step actions (UCC 1156-1167: `retry_now`, `start_fresh_attempt`, `resume_after_prerequisite`, `skip_node`) would no longer restart the run. Only Abort, and later Replan, remain. On v9 births those other exits have no installed writer anyway (inference from §2.3a); on a later profile with retries the loss would be real |
| 2, as 1, and v9 also records the failure (scope change) | As option 1, but v9 also installs native outcome writers that record the failed check in the run's own state, so W-B's proof is a native record and TB-25 falls away | As option 1. Adds writers and source contracts to v9 and delays its freeze |
| 3, stuck on a person | Option 1, plus: nothing can run and every remaining required step waits on a person or another owner | As option 1, and Approve alone no longer restarts the run (GRS 3468); the Approve wiring (`node.unblocked`, WM 51995-52000) would need changing. No v9 writer records a step wait, so this also needs step-wait writers in v9 (scope change, as option 2) |
| 4, any approval or permission block | GRS 3819 read literally | Option 3's cost, and it halts unrelated runnable steps, against EP 381 |

For a later profile that installs retries and repair, the general dead-end causes (remediation ceiling, `replan_required`, `graph_integrity`) are the natural extension of option 1. That is by analogy and is not part of the v9 contract.

**The trigger rule the owner units state under option 1 (prop., `RunBlockTrigger`).** It holds at one exact native revision when all of these hold:
1. **Quiet.** No WorkNode is runnable, no attempt is running, no dispatch is unacknowledged, no effect or tool call is open, no capacity reservation is held, and no mutation fence is unresolved. These facts are taken by analogy from stopped's T-02 (TB-03); whether a `verify_pending` attempt with a failing verifier result counts as running is TB-26.
2. **Dead end.** At least one required WorkNode's first attempt has an authentic failing verifier result, or the run has an authentic non-pass final Standard decision (TB-12), and no installed writer can record it. Which record is authoritative is TB-02 and TB-25. What "required" means for a WorkNode is TB-24.
3. **No Stop.** No Goal Stop is latched on the GRS-073 host-selected row. Stop wins over block (GRS 511: "A manual Stop, Pause, or Cancel is authoritative and terminal for automation").

Under option 2 the proof in item 2 becomes the native record. Under options 3 and 4 the dead-end set widens, and item 1 changes under option 4. The writer's shape does not change.

### 2.4 The writer W-B (all names prop.)

| Element | W-B | Relation to W-C (stop design §2.3) |
|---|---|---|
| Native issuer | `owner.workflow.run_block.publish_blocked.v1` (Executor). Basis: EP 54 "The canonical owner of readiness, blocked state …"; GRS 3919 | same owner |
| Caller | The Executor scheduler's run-level evaluation (EP 244: "Evaluate readiness, blocked, backoff, graph-integrity, and capacity predicates"). Not a command. The bounded manager only if TB-01 says so | **differs**: no command caller |
| Storage participant | `owner.storage.workflow_block.commit_original.v1` | same pattern |
| Readers, recovery | `owner.workflow.run_block.read_current.v1`, `…read_retained.v1`, `…inspect_original.v1`, `…recover.v1` (resolves a lost acknowledgement through SP-286/CV-339 `resolve.v2`, never re-executes) | same pattern |
| D01 | observes through `BoundTransitionRule` `original_run_block` (`cause=owner_status`) and `OriginalWriterOrigin` kind `run_block_original`, in the v9 D01 successor (V1 Pattern A). D01 is never the issuer (EP 7523) | same pattern |
| Profile | `all_writers.v9` only | same |

**Inputs, all D06-free. The EP unit says so in words (Q-12 wording, as W-C).**
1. The whole current D01 `CurrentSource` and native body and control at an exact revision (CAS basis).
2. A separate current Goal argument proving **no** latched Goal Stop on the GRS-073 host-selected row. If Stop is latched, W-B returns `unavailable` and the stop route owns the run.
3. **Trigger proof** from authoritative owner sources, never from `blocked_projection` (a rebuildable projection, `storage_value_registry.json` 3771-3814; B2 F4):
   - (a) the quiet census of §2.3 item 1;
   - (b) for each blocking required WorkNode, the authentic owner record of its dead end. On v9 births the only reachable one is the verifier's own failing result for the first attempt (§2.3a); no v9 native writer records a block episode `{run_id, node_id, blocked_sequence}` or a remediation counter. Whether the verifier's result is an authoritative proof is TB-25 (with TB-02). Under B-1 option 2 it is the native failure record instead;
   - (c) for a G4 failure at `provisional_success`, an authentic non-pass Standard decision record, only if TB-12 creates one. Without it, the G4 cause is not admitted.
4. **Block receipt:** a durable receipt of `ReceiptKind` `goal_blocked` (GRS 3497), written in phase 1 (§2.5). Its family is TB-05. The existing `goal_receipt` family (`storage_value_registry.json` `/families/10`) requires `certification_tier`, `validator_outputs` and `final_certifier_decision`, and its producer is `capture_standard.v2`, so it does not fit a block. Recommended: a dedicated compact family `executor_workflow_run_block_receipt` (prop.).
5. **Preserved work:** the settled mutation census from attempt records and FileSafe/WorktreeGit. It may be empty only when no mutation began (GRS 3732).
6. **Allowed actions:** each must name an action whose issuer is bound in the run's birth profile at write time (TB-07). GRS 3732 adds: "allowed actions are non-empty and owner-valid; permission/recovery branches carry the same restrictions as `D-R01`." D-R01 (GRS 3607 @63cf2cb) says: permission outcomes require `blocker_class=permission`, at least one `block_ref`, and the permission-owned evidence ref; Storage/recovery outcomes require `blocker_class=integrity|recovery`, exact recovery evidence in `evidence_refs`, and "may offer only actions valid for that owner"; `retry_storage` "is an admission probe, never repair or auto-resume"; `try_anyway`, `force_open`, generic `salvage` and generic `repair` are forbidden. The v3 blocked payload has no `blocker_class` field, and B-1 option 1 admits no permission or recovery cause, so neither D-R01 branch arises in the first contract (inference). Under B-1 options 3 and 4 the permission branch would arise, and the GRS unit would then state how its restrictions map onto the v3 envelope (`block_refs`, `evidence_refs`).

   The 13 ActionIds (GRS 3502) against the first contract. **Every reason below is an inference, not owner text; TB-07 and TB-22 stay open until an owner confirms.**

   | ActionId | First contract | Reason (inference) |
   |---|---|---|
   | `stop_goal` | **admitted** | bound through W-C: under C-2 option 1 Abort Run latches the Goal Stop and records stopped, which is what `stop_goal` names (prop. map to `abort_run`, TB-07) |
   | `replan` | not yet | GRS 3468 names replan as the only resume route, but `goal_run.replanned` is not current and v9 Replan release is undecided (Q-V9-03, A2 card C-A2-1). Admitted once the replanned contract is current and in the birth profile |
   | `cancel_goal` | refused | needs D06, which is unavailable (Q-12) |
   | `retry_same_action` | refused | no v9 retry writer (A1 native-v8 `protocol.md` 129, 163); a retry on a fenced run is a resume without replan (GRS 3468) |
   | `resume_after_revalidation` | refused | a resume without replan, against GRS 3468 |
   | `retry_storage` | refused | D-R01: "an admission probe, never repair or auto-resume"; storage causes are out in every option (§2.3) |
   | `narrow_scope` | refused | changes the admitted scope of a fenced run, which only a new revision through replan can do (GRS 3468); no bound v9 issuer |
   | `change_model` | refused | changes what a new attempt would use; v9 has no second attempt and the run is fenced; no bound v9 issuer |
   | `change_account` | refused | as `change_model` |
   | `request_approval` | refused | a permission-branch action; D-R01 ties it to `blocker_class=permission` and a `block_ref`, and no option-1 cause is a permission block; no bound v9 issuer |
   | `restore_from_mandatory_backup` | refused | a recovery-branch action; D-R01 needs `blocker_class=integrity|recovery` and recovery evidence, and no option-1 cause is a recovery outcome |
   | `abandon_preserved_work` | refused | no owner route in v9 disposes preserved work, and GRS 3732 requires the preserved-work census to stay on the record; no bound v9 issuer |
   | `resolve_owner_conflict` | refused | no owner-conflict cause is in the option-1 set; no bound v9 issuer |

   So under B-3 option 1 the set is exactly `["stop_goal"]`, which meets `minItems:1` (prop.; TB-07, TB-22).
7. For v8-lineage held Replan or certified slots carried into v9 (if V1 keeps them): the A1 revocation reader, as corroboration only (TB-11).

**Explicitly not inputs:** `StopSource`, `SchedulerStop`, `RunOperationResult(operation=cancel)`, `record_cancellation.v1`, `record_stop.v1`, D05, D06, A1 `RunRevocationCurrent` as a block cause, the Goal's own `blocked` state, `blocked_projection`, and a model's free-text judgement unless TB-01 binds the bounded manager.

### 2.5 Output: two phases (by analogy to certified, not to stop)

- **Phase 1.** The block receipt is written durably. Nothing is published.
- **Phase 2.** One joint native outcome:
  - body status to `blocked`, revision +1, control matching;
  - D01 update, head, pointer and origin;
  - compact custody families (prop., all `RP-AUTHORITY-INDEFINITE@1.0.0`, mandatory backup): `executor_workflow_run_block_intent`, `_control`, `_result`, `_origin`;
  - exactly one `goal_run.blocked` v3 EventRecord, first barrier adopting SP-286 by name, full-value custody;
  - Goal body, control and Stop latch preserved.
- **Final re-check.** Before phase 2 the trigger and the no-Stop predicate are re-run over the complete final write set (as A1 native-v8 protocol 213 does). If either fails, the result is `unavailable` and nothing is published.

**Crash cuts.**
- Before phase 1: nothing is visible.
- After phase 1, before phase 2: a receipt exists with no Event. A retry with the same key reuses that receipt. If the trigger has cleared, the receipt stays as unpublished history and is never read as a block; the projection reads Events only. Whether an orphan receipt needs a "superseded" marker is TB-05.
- After phase 2, before acknowledgement: the same key returns the first original Event and receipt. No new key or timestamp is minted (GRS 7443).

**Refusals.**
- A certified, failed, cancelled or stopped source is `illegal_transition` (GRS 3733).
- A stale Workflow revision is `revision_conflict`; the same key with a different digest is `idempotency_conflict`; unprovable dedupe is `dedupe_unavailable`.
- Each of these returns `unavailable`, which is source quality and never a lifecycle state: a latched Goal Stop; a trigger not proven; a run not quiet; a missing receipt; an empty or unbound action set; a reason outside the admitted subset; an unsupported birth profile; Storage not writer; a held unreleased v8-lineage certified Event or Replan operation (TB-11).

**Withdrawal** (the W-C protocol, which certified passed): a profile successor that omits W-B cuts off the writer; readers are fenced by reader version; the projection is rebuilt as a successor that halts on blocked rows again; written Events stay under `RP-AUTHORITY-INDEFINITE`.

### 2.6 What B-3 changes

- **B-3 option 1 (rec. with B-1 option 1 or 2).** W-B is live in v9. A blocked run's only exit is Abort until run replan is current. Under B-1 option 1, W-B can write only if TB-25 and TB-26 are answered yes; otherwise it is live in name only (§2.3a).
- **B-3 option 2.** v9 carries W-B's grammar with the issuer stated as an unbound dependency (the Q-12 pattern). It goes live only when replanned does. **Tension (P-04):** DL-080's acceptance criterion (DL 6657) says the stopped and blocked contracts "land before the contract for goal_run.replanned, each with a named writer". A blocked contract whose writer waits for replanned makes that order circular unless "land" means the contract text with a named but unbound issuer. The card says this.

---

## 3. Payload v3 schema, idempotency and event_id

- **Home (prop.):** `Plans/workflow_run_block_contracts/schemas/goal-run-blocked.v3.schema.json`, in the producer's source directory (the S3 §3 precedent). The v2 file `Plans/event_payloads/goal_runtime/goal_run_blocked.schema.json` (SHA-256 `66400648…0500`) stays byte-exact as history.
- **`$id` and `schema_version`:** `pm.goal_runtime_event.goal_run_blocked.schema.v3`; `event_name` const `goal_run.blocked`; closed root (`additionalProperties:false`, `unevaluatedProperties:false`).

**Envelope (copied from the started/cancelled v3 schemas; GRS 7439, 7504):**
- Kept: `event_name`, `schema_version`, `occurred_at_utc`, `project_id`, `goal_id`, `goal_revision` (the unchanged original Goal context), `actor_ref`, `execution_role`, requested and effective provider, model and account refs, `correlation_id`, `evidence_refs`, `artifact_refs`, `payload`.
- Optional: `thread_id`, `causation_event_ref`, `approval_refs`, `block_refs`.
- Added and required: `expected_goal_run_revision`, `goal_run_revision` (integer, minimum 1; the native before-revision and before+1). `idempotency_key` becomes required.
- Removed: `expected_goal_revision`, `parent_goal_id` (GRS 7504: "An expected Goal revision from v2 is not silently reinterpreted as the Workflow clock").
- This resolves the depth42 `closed_payload_schema` CONFLICT for blocked ("the closed root requires expected_goal_revision … it has no Workflow revision fields and still admits parent_goal_id").

**Event-specific `payload`: the six v2 fields (GRS 2652, GRS 3731).**

| Field | Schema | Owner predicate (GRS unit) |
|---|---|---|
| `goal_run_id` | non_empty_ref, required | equals the outer `run_id` (GRS 3440) and the native Workflow identity |
| `blocked_reason_code` | enum, required | the admitted subset set by B-1 and TB-06; see the enum problem below |
| `blocked_scope` | the v2 `scope` object (`scope_kind`, `include_refs`, `exclude_refs`, `write_allowed`), required | prop.: the run's admitted work scope from its birth, never widened (TB-19) |
| `allowed_action_ids` | ActionId array, `minItems:1`, unique, required | only actions whose issuer is bound in the birth profile at write time; first contract `["stop_goal"]` (§2.4 input 6) |
| `preserved_work_refs` | ref_array, required | the settled mutation census; empty only when no mutation began |
| `block_receipt_ref` | non_empty_ref, required | the phase-1 receipt; must exist before append |

**The enum problem (TB-18; an owner decision, not a product one).**
- On v9 births (§2.3a) the reachable causes are a failing verifier result and a G4 failure. Both map to existing codes: `verification_terminal_failure` (and `authority_boundary` for a G4 authority fault, although B2 T24 lists that code among those left from older Goal kinds) in the 28-value `BlockedReasonCode` (GRS 3501). So v9 needs no widening (prop. map, TB-06).
- The general causes of canon (remediation ceiling, `replan_required`, `graph_integrity`) have no code. They matter only for a later profile with retries, and then the choice below applies:
- (a, rec. for that profile) The schema then in force widens the enum by three values, `remediation_ceiling_exceeded`, `replan_required`, `graph_integrity_failed` (prop.), and the GRS unit adds them to the GRS 3501 table. The field set stays unchanged. This departs from the precedents, which kept the event-specific grammar byte-equal (GRS 2657 routing note: "the listed event-specific fields are unchanged"); the unit says so.
- (b) Keep the enum and map to the nearest code (`infrastructure_blocker` or `authority_boundary`). This loses the reason the user needs to choose Replan or Abort.
- In both cases the v3 schema keeps the refusal codes (`dedupe_unavailable`, `idempotency_conflict`, `revision_conflict`) and `child_settlement_incomplete` as grammar with no issuer (TB-15).

**Command joins.** None: there is no command.
- `correlation_id` is the scheduler-pass identity (prop.).
- `causation_event_ref` is absent, because the step-level causes are not registered Events.
- `evidence_refs` carries the trigger proof: on v9 births the verifier's failing result (TB-25) or, if TB-12 creates it, the non-pass decision record; under B-1 option 2 the native failure record. Episode refs and remediation counters apply only to a later profile that records them.

**Idempotency key (by analogy: GRS 7443 @63cf2cb defines this JCS recipe for `goal_run.started` only; applying it to blocked is a proposal):**
```
idempotency_key = "pm.goal-runtime-event.v3:" + lower_hex(SHA-256(RFC8785-JCS(
  ["pm.goal-runtime-event-idempotency.v3", scope_partition, "goal_run.blocked",
   project_id, goal_id, goal_revision, expected_goal_run_revision, goal_run_revision,
   goal_run_id, blocked_reason_code, block_receipt_ref])))
```
- The tail is the GRS 3555 semantic identity. Storage owns `scope_partition`; the inner and outer keys are byte-equal. The producer semantic digest and the stored-value commitment are separate codecs.
- Because `block_receipt_ref` is in the key and phase 1 writes the receipt first, a retry after a phase-1 crash reproduces the same key only if it reuses the receipt. The EP unit requires that.

**`event_id`.** Use whatever stopped's T-06 settles, so the two families match. The stopped design's proposal, applied here:
```
event_id = "goal_run.blocked.v3:" + lower_hex(SHA-256("pm.goal_run.blocked.event_id.v3" || 0x00 || LP(scope_partition) || LP(idempotency_key)))
```
LP is the byte count, `:`, then the bytes. `replay_policy` is `dedupe_by_idempotency_key`.

**Outcomes.** Same key and digest return the first original Event and receipt, with no second append. A changed digest is `idempotency_conflict`. A stale revision is `revision_conflict`. Unprovable dedupe is `dedupe_unavailable`.

**Fixtures.** Whole-value v3 positive and negative fixtures, TEST_ONLY where synthetic: at least one positive per admitted cause, and negatives for each GRS 3794 case (missing receipt, empty actions, invalid action, omitted preserved mutation, `blocked -> blocked` with no new evidence, terminal or stopped source), plus a latched-Stop case and a not-quiet case.

---

## 4. Owner units, companion files and storage families

### 4.1 Landing 1: source phase, landed before the v9 package freezes. Event registry unchanged, so no Q-02 card.

V1 §8 recommended one package and one review round for the v9 profile and both A3 source contracts (V1-Q8). The v9 plan (§0 item 2, Q-V9-08) and the stopped addendum (§4.1 "Timing") instead land each A3 landing 1 on `main` first, so that v9 pins stable, landed bytes. This design now follows that order too (prop., changed for CR-03), so all three notes agree. The coordinator confirms it as Q-V9-08 / V1-Q8. Any later change to landing 1 re-freezes v9.

| Doc | Unit (prop.) | Contents |
|---|---|---|
| `Plans/Executor_Protocol.md` | EP-(next) "Workflow run block publisher" | W-B identity; listed only by `all_writers.v9`; D01 rule and origin kind; participants; the `RunBlockTrigger` rule under the B-1 answer; entry and final predicates; the two phases; crash cuts; refusals; the action rule; the Q-12 wording that D06, D05, StopSource, SchedulerStop, native cancel and `record_stop.v1` are not inputs; the EP-082 sentence (§1.7); withdrawal; NOT_RUN. |
| `Plans/Goal_Runtime_System.md` | GRS-(next) "goal_run.blocked v3 source semantics" | Meaning (§1); v3 envelope and payload predicates (§3); key and `event_id`; the reason subset and any enum widening (TB-18); the action rule; exits; the Goal-unchanged rule (B-2); NOT_RUN. D-R16 stays unchanged as the basis. |
| `Plans/storage-plan.md` | SP-(next) "Workflow run block custody" | Four custody families plus the receipt family (§2.4-2.5), keys, CV339 MessagePack, `RP-AUTHORITY-INDEFINITE`, mandatory backup; first receipt adopting SP-286 by name; baseline and delta census wording (SP-312 26174 form). |
| `Plans/Backup_Restore_System.md` | BRS-(next) | Mandatory backup and restore coherence of the block custody, the receipt and the Event. |
| `Plans/Decision_Policy.md` (cite only) | none | The remediation ceiling is cited, not edited (Crosswalk 266: it "owns deterministic remediation ceilings and blocked posture after ceiling exhaustion"). |

No OP unit in landing 1: there is no command, and DL-080 changes no command or wiring.

**Landing 1 companion files (task 2, after the prose):**
- `Plans/workflow_run_block_contracts/` (prop.): `protocol.md`, `methods.json` (6 methods: publisher, Storage commit, three readers, recover; status `canonical_source_contract_native_installation_not_run`), `physical-families.json`, `schemas/goal-run-blocked.v3.schema.json`, `schemas/run-block-source.v1.schema.json` (intent, trigger proof, receipt, result, `Unavailable`), `resource-realms.json` (`network_fallback:false`, same-ID conflict rule), `owner-sources.json`, `source-citations.json`, `fixtures/`.
- The v9 D01 successor (`workflow-original-start.v8`, prop.) carries `original_run_block` and `run_block_original` beside W-C's pair: 13 rules and 6 origin kinds (V1 §5.3).
- `Plans/storage_value_registry.json`: append 5 families (4 custody + receipt), all 26 fields with inline `value_schema`. Policies stay 27.

### 4.2 Landing 2: adoption phase, with stopped (one landing or two, P-01). Needs Q-02 and Q-03.

| Doc | Unit (prop.) | Contents |
|---|---|---|
| GRS | GRS-(next) "goal_run.blocked current adoption" | Adopts exactly row `event-family-goal-run-blocked` at 3.0.0. Membership stays at the base count (43 at `abdf4eead`, or more after further admissions), and the other rows are unchanged except the stopped row adopted beside it. v2 kept as history. Names W-B. Read roles; NOT_RUN. **This unit is the new `semantic_owner_doc`.** |
| GRS | GRS-(next) projection successor (§5) | Shared with stopped: one unit for the v9-birth successor with both branches. GRS-085 byte-unchanged. |
| SP | SP-(next) projection successor | Two derived families on dataset `goal_run_projection.v<N>`; reducer; keys; generation and frontier; census delta. **This unit is the new `payload_owner_doc` of both rows.** Plus one routing paragraph in SP-214 after its certified paragraph (storage-plan 15166-15176) covering stopped and blocked, and A006 extended or an A007 added. |
| BRS | BRS-(next) | Optional coherent derived backup, restore order, source-coupled lifetime. |
| ATS | ATS-(next) | Whole-value facets for W-B, the Event and the blocked branch; re-keys GOAL-COMMON-04 and GOAL-COMMON-13 to the v3 envelope (depth42 remaining gap). |
| CV | CV-(next) | Schema-root closure for the v3 payload and consumer schema; updates the Known-37 roster row for blocked (Contracts_V0 3686). |
| OP | OP-(next), optional | Which reader shows a blocked run's reason and actions on the run card (OP 228 already lists a `blocked` state label). Owner decision (O-S4-07). |
| GRS minima table | routing note under row 2652 | Same pattern as GRS 2657. |
| `Plans/00-plans-index.md` | one section | Shared with stopped. |

**Landing 2 companion files:** the shared consumer directory (the certified consumer file set: `protocol.md` P0-P8, `methods.json`, `schemas/consumer.v1.schema.json` with `StoppedProjection` and `BlockedProjection`, `companions/`, `companion-differences.json`, `commitment-domains.json`, `dependencies.json`, `imports.json`, `installed-profile.json` and digest, `owner-sources.json`, `source-citations.json`, `physical-retention-install.json`, `resource-realms.json`, `source-method-composition.json`, `source-variants.json`); a family composition file; `storage_value_registry.json` +2 projection families; `event_family_registry.json` rows `#/families/0` and `#/families/5`, and no other row unless the certified question below says so.

**A possible third row (CR-10).** Landing 2 adopts certified Events for v9 births. A2's open question O-R2-05 (carried as Q-V9-09 in the v9 plan, and as A2's conditional card C-A2-2 in `a2-scope/A2-design.md` §6.2) asks whether the certified row's `source_refs`, which pin `Plans/goal_certified_event_coordinator_contracts/schemas/identity.v1.schema.json#/$defs/EventRecord` @63cf2cb, must change for later-profile certified Events. A2 recommends no row change. If the answer is yes, landing 2 also revises `#/families/2` (fingerprint `f58cc6a7…654e`, unchanged at `abdf4eead`), and that revision needs its own Q-02 card in the §7.1 form, its own DL-077-form record and depth file, and its own `REVIEWED_GOAL_SUCCESSORS` pin. §7 lists it as a conditional card.

### 4.3 Storage census (re-derive at every rebase, rule R2)

One order for all three notes (CR-03): A1, A2, A3-stopped landing 1, A3-blocked landing 1, v9, landing 2.

| Step | Families | Note |
|---|---|---|
| origin/main | 294 | verified at `63cf2cb` and again at `abdf4eead` (DL-094 added no Storage row) |
| A1 lands | 328 | +34 (SP-321, SP-322) |
| A2 `v6` lands | 330 | +2 (R2 §4.6), plus any certified Storage revision A2 carries (O-R2-07) |
| A3-stopped landing 1 | 334 | +4 stop custody (the addendum's 334) |
| A3-blocked landing 1 | 339 | +5 block custody (4 + receipt); 338 if TB-21 gives no receipt family |
| v9 landing | 339 + x | x = any v9 rows V1-Q5 adds (0 under the routes pattern); matches the plan's "338 to 339 before v9" |
| Landing 2 | 341 + x | +2 projection families (with the first row, if P-01 splits it into two landings) |

Materialized and `later_gui_or_feature_projection` counts move with them; the eight readiness re-pins move at each step (S4 §7).

---

## 5. The projection successor and its place in the one `goal_run_projection` chain

**Reading.** "extends the mandatory GRS-085 run-history projection to its rows" (DL-080 canonical text, `Decision_Log.md` 6647-6648 @63cf2cb, 6669-6670 @abdf4eead; the acceptance criterion at 6657 @63cf2cb says "its rows carried by the mandatory GRS-085 run-history projection") is met by a new versioned successor, not an in-place edit (S4 §3; O-S4-01). GRS-085, SP-317 and all v3, v4 and v5 artifacts stay byte-exact.

**Why stopped and blocked share one successor (prop.; resolves V1-Q9 for A3's side).**
- Under C-4 option 2 both writers exist only for v9 births.
- A branch is live only in a successor that also admits that birth profile's `goal_run.started`, `cancelled` and `certified` Events; otherwise the run halts at its own `goal_run.started` (S4 §6.1 item 4).
- A2's `v6` admits v7 and v8 births and still halts on same-run stopped and blocked (R2 §4.5).
- So the successor after `v6` must admit v9 births for started, cancelled and certified in any case. Splitting stopped and blocked into two successors would build that v9 admission twice, register two extra families and add one more rebuild, with no benefit: both writers go live in the same profile at the same time.
- This replaces the stopped design's §5 table (`v7` stopped, `v8` blocked). Rule R3 still holds: DL-080's order constrains rows, not chain positions, and stopped and blocked rows are both admitted before replanned rows.

**Chain (prop.; numbers taken at landing, R2):**

| Successor | Author | Adds | Birth scope |
|---|---|---|---|
| `v6` | A2 | v8-birth started, cancelled, certified (certified gated on a Storage revision, R2 §4.3) | original profile, v7, v8; halts on stopped, blocked, replanned |
| `v7` | A3 landing 2 (stopped + blocked) | v9-birth started, cancelled, certified; **stopped branch; blocked branch** | stopped and blocked only for v9 births; everything of `v6` carried in whole banks |
| `v8` | A3-replanned | replanned branch | v9 Replan (R2 RR-2 recommends no v8 Replan release) |

**Reducer rules for the blocked branch (from D-R16, D-R17, D-R18, D-R21 and v5 P4):**
- **Blocked is supported** from the admitted sources. The source state comes from the original native before-commitment, never from invented Event history (v5 P4, protocol line 57).
- **`ready -> blocked` with no started row** is supported only if TB-14 admits it, with the native before-status as proof.
- **`blocked -> blocked`:** a new identity halts (not admitted); an identical identity is generic dedupe.
- **After blocked:**
  - `stopped` is legal (D-R21) and is the only live exit in the first contract.
  - `cancelled` is legal only on the positive-D06 branch, unchanged.
  - `certified` without an admitted replanned is a conflicting lifecycle and halts (D-R18 GRS 3747 allows only `provisional_success|verifying -> certified`).
  - Same-run `replanned` halts until the replanned successor.
- **Blocked after certified, cancelled or stopped** is illegal and halts.
- **Historical v2 `goal_run.blocked` rows** halt ("No v2 sibling is cast or skipped", protocol line 53).
- **Q-12.** A block is never projected as stopped or cancelled, and neither is inferred from a block.
- **Current read.** A blocked row is current only while fresh native and Goal sources still match the block issuance and the generic frontier is equal (v5 P7). A run that has since been stopped reads the stopped row; a run with an unmatched later update reads `unavailable`.
- **Source lifetime.** The Event is `RP-AUTHORITY-INDEFINITE`. The projection cannot extend the lifetime of the receipt, the owner block records or the preserved-work sources it cites. The projection is `RP-PROJECTION-3GEN@1.0.0`, and `physical-retention-install.json` gains `blocked` and `stopped` source-lifetime entries. No DL-045 card is needed.

---

## 6. The registry-row revision and what re-freezes with it

### 6.1 The row before (verbatim, `Plans/event_family_registry.json` 9-50 @63cf2cb; fingerprint `f137e7243c8030887b0e4624228c3603dc3a9026170b86bb72e1ffb552b4b4a5`, the same at `abdf4eead`; registry SHA-256 then `0be54418…c842`, now `4227be36…3e70` at `abdf4eead`, to be re-taken at the rebase base)

```json
    {
      "family_id": "event-family-goal-run-blocked",
      "family_revision": "2.0.0",
      "event_type": "goal_run.blocked",
      "scope_policy": "project_only",
      "semantic_owner_doc": "Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima",
      "payload_owner_doc": "Plans/storage-plan.md#sp-214---goal-runtime-persistence-consumer",
      "payload_schema_id": "pm.goal_runtime_event.goal_run_blocked.schema.v2",
      "payload_schema_ref": {
        "path": "Plans/event_payloads/goal_runtime/goal_run_blocked.schema.json",
        "json_pointer": "#",
        "schema_id": "pm.goal_runtime_event.goal_run_blocked.schema.v2"
      },
      "legacy": {
        "aliases": [],
        "admitted_extensions": [],
        "identity_json_pointers": {
          "project_id": [
            "/payload/project_id"
          ],
          "thread_id": [
            "/payload/thread_id"
          ]
        },
        "referenced_event_id_pointer": null,
        "redaction": {
          "mode": "reject_unhandled_secrets",
          "transform_id": null,
          "transform_version": null
        }
      },
      "source_refs": [
        "Plans/event_payloads/goal_runtime/goal_run_blocked.schema.json#",
        "Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima",
        "Plans/Contracts_V0.md#cv-287---goal-runtime-event-schema-registration"
      ],
      "retention_policy_ref": {
        "registry_schema_id": "pm.storage_value_registry.v2",
        "policy_id": "RP-AUTHORITY-INDEFINITE",
        "policy_version": "1.0.0"
      }
    },
```

### 6.2 The row after (proposed; `<…>` values are fixed when the row is frozen on the landing-2 branch tip)

The started/cancelled pattern: anchors moved, v2 refs kept, new refs appended. Only the six Browser-reconstructable fields change. `scope_policy`, `legacy` (so no `run_id` pointer, as for started and cancelled) and `retention_policy_ref` are unchanged.

```json
    {
      "family_id": "event-family-goal-run-blocked",
      "family_revision": "3.0.0",
      "event_type": "goal_run.blocked",
      "scope_policy": "project_only",
      "semantic_owner_doc": "Plans/Goal_Runtime_System.md#GRS-<blocked adoption unit>",
      "payload_owner_doc": "Plans/storage-plan.md#SP-<shared projection successor unit>",
      "payload_schema_id": "pm.goal_runtime_event.goal_run_blocked.schema.v3",
      "payload_schema_ref": {
        "path": "Plans/workflow_run_block_contracts/schemas/goal-run-blocked.v3.schema.json",
        "json_pointer": "#",
        "schema_id": "pm.goal_runtime_event.goal_run_blocked.schema.v3"
      },
      "legacy": { …unchanged, byte-identical to 6.1… },
      "source_refs": [
        "Plans/event_payloads/goal_runtime/goal_run_blocked.schema.json#",
        "Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima",
        "Plans/Contracts_V0.md#cv-287---goal-runtime-event-schema-registration",
        "Plans/workflow_run_block_contracts/schemas/goal-run-blocked.v3.schema.json#",
        "Plans/Goal_Runtime_System.md#GRS-<blocked adoption unit>",
        "Plans/Executor_Protocol.md#EP-<W-B unit>",
        "Plans/storage-plan.md#SP-<shared projection successor unit>",
        "Plans/Backup_Restore_System.md#BRS-<derived unit>",
        "Plans/<shared consumer dir>/schemas/consumer.v1.schema.json",
        "Plans/<shared consumer dir>/methods.json",
        "Plans/<shared consumer dir>/resource-realms.json"
      ],
      "retention_policy_ref": { …unchanged… }
    },
```

- **Label and count (reopened, CR-06).** At `abdf4eead` the registry is `2026-09-25.1` with 43 families. DL-094 moved the label from `2026-09-11.2` for an admission under DL-078's standing rule (`Decision_Log.md` 2159-2165 @abdf4eead). Whether a row revision that keeps the count also moves the label is open again (P-10, stopped T-15), with DL-094 as the new evidence. The count stays 43 (or 43+k after further admissions).
- **One landing or two (open, CR-04).** Whether the stopped and blocked rows move in one joint landing or in two sequential landings, and which registry SHA pair each card shows, is a process question (P-01 = Q-V9-06), not a settled default. The process text leans to one row per landing: PA line 7, "each landing is answered on its own line"; PA line 17 (Q-09), "land `goal_run.stopped` first so the blocked card does not hold up the other work"; DL-078 (`Decision_Log.md` 1571 @63cf2cb), "one family per landing" for admissions. Fallback if the process thread does not allow a joint landing: stopped's row lands first, then blocked's, each with its own before/after pair taken from `main`. Every note uses that fallback until the answer comes.

### 6.3 What re-freezes in landing 2

One set of re-freezes covers both rows. Each item is its own commit naming both row commits (the `c7b136ad2`, `d21679659`, `1cdf39074` precedent).

| # | Value | Where (origin/main line) | Blocked-specific note |
|---|---|---|---|
| F1 | current39 `e2b5a433…d306` | `Plans/browser_event_admission.json` 8; `…admission.schema.json` 46; `scripts/pm-browser-event-admission.py` 31; `tests/test_pm_browser_event_admission.py` 185-187 | row 0 is in `preexisting_family_ids` (verified) |
| F2 | prefix40 `a27cf49b…1050` | `scripts/pm_emit_only_event_contract.py` 16; `Plans/github_project_event_admission.json` 5; `Plans/testing_session_event_admission.json` 8; `tests/test_pm_emit_only_event_boundaries.py` 28; `tests/test_pm_browser_event_admission.py` 67 | row 0 is in the prefix |
| F3 | sorted upstream40 `b59cc61d…52ea` | `tests/test_pm_testing_session_events.py` 34; `tests/test_pm_github_project_integration.py` 62 | |
| F4 | new `REVIEWED_GOAL_SUCCESSORS` entry `"event-family-goal-run-blocked": ("f137e7243c8030887b0e4624228c3603dc3a9026170b86bb72e1ffb552b4b4a5", "<after fingerprint>", "<row commit>", "Plans/Goal_Runtime_System.md#GRS-<adoption>")` | `scripts/pm-browser-event-admission.py` 45-79 @63cf2cb (dict at 49 @abdf4eead) (comment "six" becomes "eight" with stopped); `tests/test_pm_browser_event_admission.py` 116-127 (six IDs become eight) | historical pin equals the current row and the row at `b09294e44b`; reconstruction simulated `True` |
| P1 | provenance only | `github_project_event_admission.json` 6-10; `testing_session_event_admission.json` 9-13; `browser_event_admission.json` 51 | |
| R1 | readiness map | `scripts/pm-implementation-readiness.py` 491 `"goal_run.blocked"` moves to the v3 path; self-test 5465-5473 | without it, `event_family_registry_goal_payload_ref_mismatch` on `families/0` blocks the landing |
| PNC | PNC-019 | `scripts/pm_pnc019_currentness.py` comment 43-49 @63cf2cb (rewritten by DL-094: comment 43-53, constants 54-55 @abdf4eead) names the new SHA; a new checkpoint approval record | one record for the landing, citing both cards |
| S | Storage census | readiness 761/764/770 and 744-760; the three test files; `storage-plan.md` 523 | both landings |

Left as dated pins: `Plans/coordination_event_admission.json` 11, `goal_certified_family_composition.json` 41, certified consumer `owner-sources.json` 41 and `source-citations.json` 213. `ORIGINAL39_SHA256` and `ORIGINAL40_SHA256` are not moved.

---

## 7. DL-036 cards

Four cards, plus one conditional card. B-1, B-2 and B-3 are product cards to present now (before any W-B prose). The Q-02 checkpoint card is frozen at landing 2. A second Q-02 card for the certified row `#/families/2` is prepared only if O-R2-05 / Q-V9-09 finds that row must change (§4.2, CR-10). Cards are presented by the coordinator or host.

### 7.1 Q-02 checkpoint card (draft; frozen on the landing-2 branch tip)

Proposed file: `reports/event-authority-20260911/replan-v8/a3/goal-run-blocked-checkpoint-card.md`. Its SHA-256 is recorded as `frozen_card_sha256`.

````markdown
# Checkpoint card: the blocked-run event row moves to its current version

Card ID: `EA-A3-GOALRUN-BLOCKED-ROW-001`
Status: **QUEUED_UNANSWERED**. Prepared <date> under process ruling Q-02 (2026-09-25). It does not re-ask DL-080
or the blocked-trigger card.
Owner: Orchestrator and Executor (Workflow run lifecycle), with Goal Runtime and Storage.
Family: `goal_run.blocked` (`event-family-goal-run-blocked`, registry row `#/families/0`).
Presented with: `EA-A3-GOALRUN-STOPPED-ROW-001` <same landing | the earlier landing, per P-01>. Answer each card on its own line.

**Name:** The registered "run blocked" event moves to its current version.

**Question:** Should the registered `goal_run.blocked` row change from version 2.0.0 to version 3.0.0 exactly as
shown below, <in the same landing as the stopped row | after the stopped row has landed, per P-01>, with the
approved registry checkpoint moving from SHA-256 `<before SHA-256>` to `<after SHA-256>`?

**Why:** On 2026-09-24 you made `goal_run.blocked` a current event (DL-080), and on <date> you chose when a run
counts as blocked (<DL entry for B-1>). The registered row still points at the old v2 payload, which uses the Goal's
revision instead of the run's own, and which the Step 8 grading marked as a conflict. The new contract
(<EP unit>, <GRS units>, <SP units>) names the writer and adds blocked rows to the run history. The standing rule
for registrations (DL-078) does not cover changing an already registered row, so you approve it yourself, as you
did for the certified row on 2026-09-23.

**What you get:** Runs born under all_writers.v9 record a blocked event when they reach <the B-1 answer>, with the
reason and the way out. The run history shows it. The revised row grades <n> of 12 depth criteria (<depth file>,
SHA-256 <…>); native execution is NOT_RUN. It does not rely on cancellation (D06), which stays unavailable.

**What it costs:** The registry hash changes, so the admission fingerprints of the older families are re-frozen in
the same landing (<F1-F4, provenance, readiness map; commit list>). The designated Plans agent then reseals the
governance files this landing makes stale (<list>). Runs born before v9 never record blocked.

**The change (exact):**
- Registry before: revision `<label at the rebase base>`, `<n>` families, SHA-256 `<before>` (at `abdf4eead` these were
  `2026-09-25.1`, 43, `4227be36806615cabc8a36c0a8a6555a24b6b6c38e960e07bd12354c3c373e70`; re-derived at freeze).
- Registry after (<whole landing, both rows | this landing, this row>, per P-01): revision `<label, per P-10>`,
  `<n>` families, SHA-256 `<after>`.
- Row before, fingerprint `f137e7243c8030887b0e4624228c3603dc3a9026170b86bb72e1ffb552b4b4a5`: <verbatim, design §6.1>.
- Row after, fingerprint `<after fingerprint>`: <verbatim frozen row>.
- Fields changed: family_revision, semantic_owner_doc, payload_owner_doc, payload_schema_id, payload_schema_ref,
  source_refs. Unchanged: event type, scope, legacy identity and redaction, retention (RP-AUTHORITY-INDEFINITE).
- Other rows this landing changes: <`#/families/5` (`goal_run.stopped`), on its own card, if P-01 allows a joint
  landing | none>; and <`#/families/2` (`goal_run.certified`), on its own card, only if O-R2-05 / Q-V9-09 says the
  certified row must change | no certified change>.

**Options:**
1. **Approve the row and the new checkpoint** (recommended). It lands with its re-freezes; your answer is recorded
   as a Decision Log entry carrying the after SHA-256.
2. **Keep the old row.** The blocked contract stays written but not current. The landing drops this row; in a joint
   landing the other card is re-frozen with a new after SHA-256 and shown again.
3. **Change the row first.** Say what to change; a new card follows.

**Recommendation:** Option 1.

**Answer:** ____________________

## What this card does not do
It registers, admits or removes no family, keeps the count, changes no other row except those named above, each on
its own card, changes no validator or seal condition, and certifies nothing. The blocked family's DL-077-form record is
informational and not read by the seal check. If the registry changes before landing, this card is re-frozen and
shown again.
Evidence: branch tip <commit>; depth file <path> SHA-256 <…>; compact bundle SHA256SUMS <…>.
````

### 7.2 Card B-1: which situations count as a blocked run

Re-derived for CR-01 and CR-02 against the roster v9 actually installs (§2.3a).

````markdown
# Card B-1: when a Workflow run is recorded as blocked

Card ID: `EA-A3-GOALRUN-BLOCKED-TRIGGER-001`
Status: **QUEUED_UNANSWERED**. Prepared 2026-09-25 under process ruling Q-09 (canon does not define the trigger).
Owner: Executor (scheduler and blocked state), with Goal Runtime, Orchestrator and Decision Policy.
Family: `goal_run.blocked`.

**Name:** When a Workflow run is recorded as blocked.

**Question:** On runs born under all_writers.v9, which situations should record the whole run as blocked
(`goal_run.blocked`)?

**Why:**
- Ruling Q-09 says this is your decision when canon does not define it, and it does not.
- Canon points both ways. One Goal Runtime table says a permission denial or approval request blocks the run
  (Goal_Runtime_System 3819). The Executor says that when steps wait, the run is only "deferred" and other steps
  keep running (Executor_Protocol 381, 864).
- v9 runs can record only success. They get one attempt per step, and nothing records a failed check, a retry, a
  repair or a step that waits (the v8 method list v9 carries). So a v9 run whose check fails, or whose final check
  fails, simply stands still, and nothing says why. Canon's other dead ends (repair limit reached, replan required,
  broken plan graph) need retries or failure records, so they cannot happen on v9 runs.
- A blocked run is fenced. Clearing the cause does not restart it; only a replan does (Goal_Runtime_System 3468),
  and run replan is not current yet. Abort Run can still stop it.
- No button or wiring expects the blocked event today. Approve expects the step to continue by itself.

**What you get:**
- Option 1: a v9 run that stands still after a failed check shows as blocked, with the reason and Abort as the way
  out. Nothing new is added to v9.
- Option 2: the same, and the step card also shows that its check failed.
- Option 3: the run history also shows every stall where a person has to act.
- Option 4: the most visible: the first approval request already shows the whole run as blocked.

**What it costs:**
- Option 1: it works only if the owners agree that the check's own failing result is proof enough, and that a run
  whose failed step was never recorded counts as quiet (owner questions TB-25 and TB-26). If they do not, v9
  records no blocked run at all. Once a run is recorded blocked, the other ways out canon names for dead ends, a
  manual fix and a patch (Decision_Policy 423, Executor_Protocol 419), and the step buttons that restart work
  (Retry, Start fresh attempt, Resume, Skip) no longer restart it; only Abort, and later Replan, remain. On v9
  runs nothing could carry those out anyway, since v9 has no retry or repair; on a later profile the loss would be
  real. A run waiting for an approval shows as waiting, not blocked.
- Option 2: everything option 1 costs except the two owner questions, plus new writers in v9 that record a failed
  check. That is more v9 work (about 12 to 24 agent-hours, prop.) and a later v9 freeze.
- Option 3: also needs new v9 writers that record a step waiting on a person. Once recorded blocked, Approve alone no
  longer restarts the run; it needs a Replan, and until run replan exists the only way out is Abort. The Approve
  wiring would also need changing.
- Option 4: everything option 3 costs, and it also halts unrelated steps that could still run, which goes against
  the Executor's rule.
- In every option, storage problems cannot be recorded while storage cannot be written. They stay a warning on the
  screen. The final check counts as a cause only if the owners create a record of a failed final decision (TB-12).
- This answer shapes the v9 profile, which carries the stop writer too. How a late answer affects the stop writer is
  a separate question (P-03).

**Options:**
1. **A failed check with no way on (recommended if the owners confirm TB-25 and TB-26).** Record blocked when nothing
   is running and a required step's first attempt has a failing result from its own check, or the final check fails
   on an open blocker (only if TB-12 creates a record of it), and no v9 writer can record that result.
2. **The same, and v9 also records the failed check.** v9 gains writers that record the failure in the run's own
   state, then records blocked as in option 1. Choose this if the owners do not confirm TB-25 and TB-26.
3. **Stuck waiting on a person.** Option 1, and also when nothing can run and every remaining step waits on a
   person or another owner (approval, clarification, sign-in, FileSafe, a worktree fix). Needs step-wait writers in v9.
4. **Any approval or permission block,** as the Goal Runtime table reads literally.

**Recommendation:** Option 1 if the owners confirm TB-25 and TB-26, otherwise option 2. It records only the stalls
that need a run-level decision. It does close the manual-fix and patch routes for a recorded run, which v9 cannot use.

**Answer:** ____________________

## What this card does not do
It writes no contract and changes no registry row, command or wiring. It does not change how single steps wait.
It does not decide the dead ends of later profiles that have retries.
Evidence: design note `A3-blocked-design.md` §2.3 and §2.3a; inventory `B2-trigger-writer.md` §3.
````

### 7.3 Card B-2: what the Goal shows while its run is blocked

````markdown
# Card B-2: the Goal of a blocked run

Card ID: `EA-A3-GOALRUN-BLOCKED-GOAL-001`
Status: **QUEUED_UNANSWERED**. Prepared 2026-09-25.
Owner: Goal Runtime, with Orchestrator.
Family: `goal_run.blocked` (and, under option 2, `goal.blocked`).

**Name:** The Goal of a blocked run.

**Question:** When a Workflow run is recorded blocked, should its Goal also show blocked?

**Why:**
- A Goal has its own `blocked` state that names an owner condition (Goal_Runtime_System 95), and Resume stays
  disabled until that condition clears (Goal_Runtime_System 173).
- No current writer can set a Goal to blocked today (`goal.blocked` is undispositioned in the Step 8 grading).
- For a stop you chose to pause the Goal as well (card C-2).

**What you get:**
- Option 1: no new Goal contract is needed. The run card and the run history show blocked, with its reason and
  its way out.
- Option 2: the Goal list shows the block too.

**What it costs:**
- Option 1: the Goal reads "active" while its run cannot move.
- Option 2: a current `goal.blocked` writer has to be written first, and Goal Resume must be routed to run replan.
  That is a second contract before blocked can land.

**Options:**
1. **The Goal stays as it is (recommended).**
2. **The Goal also moves to blocked,** naming the run's block.

**Recommendation:** Option 1. It needs no extra contract, and the run already shows the reason.

**Answer:** ____________________

## What this card does not do
It does not decide `goal.blocked`'s own contract, which is separate owner work.
````

### 7.4 Card B-3: the way out before run replan exists

````markdown
# Card B-3: blocked runs before run replan exists

Card ID: `EA-A3-GOALRUN-BLOCKED-EXIT-001`
Status: **QUEUED_UNANSWERED**. Prepared 2026-09-25. Read after card B-1.
Owner: Executor, with the A3 coordinator.
Family: `goal_run.blocked`.

**Name:** Blocked runs before run replan exists.

**Question:** A blocked run can only continue through a replan, which is not current yet. Should v9 record blocked
runs anyway, so that their only way out until then is Abort Run?

**Why:**
- The rule is in Goal_Runtime_System 3468. Your decision DL-080 orders blocked before replanned.
- Cancellation (D06) is not available (ruling Q-12), so it is not a way out either.

**What you get:**
- Option 1: v9 runs that meet the dead end you chose on card B-1 become visible and can be aborted as soon as v9
  exists. Under B-1 option 1 that happens only if the owners confirm TB-25 and TB-26; otherwise v9 records none.
- Option 2: no blocked run ever lacks a Replan exit.
- Option 3: a blocked run continues by itself once its cause clears, with no replan and no Abort.

**What it costs:**
- Option 1: until run replan lands, a blocked run cannot be continued, only aborted. Canon names other ways out of
  dead ends, a manual fix (Decision_Policy 423) and a patch (Executor_Protocol 419); recording blocked closes them
  for that run. On v9 runs no installed writer could carry them out, since v9 has no retry or repair (inference,
  design §2.3a), but that is a property of v9, not of the rule.
- Option 2: the blocked writer is carried in v9 as grammar only, with its issuer unbound, and goes live only when
  replanned does. Stalled runs stay invisible until then. It also strains DL-080, which says the blocked contract
  lands, with a named writer, before the replanned one.
- Option 3: it changes a lifecycle rule and needs a new owner contract. It also conflicts with DL-080's resume rule.

**Options:**
1. **Record blocked in v9, with Abort as the exit until replan lands** (recommended if B-1 is option 1 or 2).
2. **Hold the blocked writer until run replan is current** (recommended if B-1 is option 3 or 4).
3. **Let a blocked run resume without a replan when its cause clears.** Not recommended.

**Recommendation:** Option 1, provided B-1 is answered with option 1 or 2.

**Answer:** ____________________

## What this card does not do
It does not schedule run replan and does not change the resume rule.
````

**Recording answers.** Each answered product card becomes a Decision Log entry (prose, PlanUnit with `depends_on: [DL-080]`, `preserved_exact_tokens` including the card ID and `goal_run.blocked`) and a `decision-responses.jsonl` row with `frozen_card_sha256`, before the W-B prose (P-05). The Q-02 answer is recorded in landing 2 exactly as the stopped design §7 describes, with `depends_on: [DL-039, DL-078, DL-080, <B-1 entry>]` and the negative constraints "not an extension of DL-078 to row revisions" and "do not re-pin DL-077's records".

---

## 8. The DL-077-form record and the single-family depth assessment (Q-03)

**Record.**
- **Path (same as stopped, OQ-1):** `reports/event-authority-20260911/admission-records/original-37-revisions/goal_run.blocked.json`, outside the validator's non-recursive `admission-records/*.json` glob (validator 269; a Known-37 record there raises `post_august_admission_incomplete`, 294, 623-626).
- **First key:** `"seal_check_note": "Not read by the seal check: goal_run.blocked is an original-37 row revised under DL-080, not a post-August admission (process answer Q-03, 2026-09-25)."`, written with `indent=1`, insertion order kept.
- **Fields (S5 §5.2 form):** `schema_id` (post-August record v1, form parity), `event_type` `goal_run.blocked`, `family_id` `event-family-goal-run-blocked`, `implementation_receipt_sha256` `dceb7f21…d827`, `decision_ref` = the blocked Q-02 DL entry (it names `goal_run.blocked` and the after SHA), `decision_section_sha256`, `registry_before` `{<label>, <before SHA>, <n>}` taken at the rebase base (at `abdf4eead`: `2026-09-25.1`, `4227be36…`, 43; CR-06), `registry_after` `{<label per P-10>, <after>, <n>}`, `registry_row_sha256` = the after fingerprint, `depth_assessment {path, sha256}`, `revision_landing {row_commit, record}`, `criteria_not_passing_at_recording`, `status_at_recording`, `recorded_by`, `recorded_at_utc`, `notes` (a revision, so the one-more-family rule does not apply; the card ID; the B-1 entry).
- **Offline check:** `admission_record_problems` from a scratch copy of the validator. Expect only `registry_before_after_not_exactly_one_family`, plus `depth_incomplete:*` if short. The validator is never edited.

**Depth file.**
- **Path:** `reports/event-authority-20260911/replan-v8/a3/goal-run-blocked-depth-<YYYYMMDD>.{md,json}`, with a compact quote bundle and `SHA256SUMS` beside it.
- **Shape:** the depth42 shape with exactly one row, `#/families/0`, `family_revision` `3.0.0`, `registry.sha256` = the after SHA. `supersedes` names the depth42 blocked row only (`/rows/0` of `ba9b84f9…`). No other family is re-graded. Every cell carries `evidence[{path, unit, line_start, line_end, excerpt_sha256}]`; every PASS has evidence under `Plans/`.
- **Timing:** graded on the landing-2 tip after companions and re-freezes; excerpts re-checked byte-identical at the rebase base. A separate file from the stopped one, graded in the same pass.
- **Rubric:** S5 §6.2 (reconstructed); check against `rubric.md` (`81f1d8b2…`) from a local session (OQ-7).

**Forecast (prior 3/12, cells P P p C p p P p p A p p):**

| Criterion | Prior | Target | Closed by |
|---|---|---|---|
| membership_version | P | PASS | 3.0.0 row resolves to the v3 `$id` |
| owner_doc | P | PASS | anchors moved to the new GRS and SP units |
| producer | p | **PASS only if TB-25 and TB-26 hold, or B-1 is option 2** | W-B named, v9 listing, trigger rule, receipt-then-append order, SP-286 by name. Without a provable trigger on v9 births (§2.3a) W-B is installed but can never write, and the grade is likely PARTIAL |
| closed_payload_schema | C | PASS | v3 envelope; action and preserved-work predicates |
| scope_identity | p | PASS | revision joins, inner key with the GRS 3555 tail, explicit `event_id` |
| replay_idempotency | p | PASS | v3 key, phase-1 receipt reuse, `resolve.v2` |
| retention | P | PASS (re-graded) | projection source coupling stated |
| redaction_custody | p | PASS | custody and receipt families, BRS, DL-076 tokens |
| transitions | p | **PARTIAL likely** | entry edges adopted; `blocked -> blocked` unadmitted and the exit to running rests on unadopted replanned |
| consumers_checkpoints | A | PASS | shared successor, SP-278 by name, DL-076 token |
| compatibility_withdrawal | p | PASS | withdrawal protocol (§2.5) |
| positive_negative_oracles | p | PASS | ATS unit, whole-value fixtures, GOAL-COMMON-04/13 re-keyed |

Honest target: 10-11 of 12 if `producer` passes, 9-10 if it does not (CR-01). `transitions` is the likely gap, and the grader decides whether the replanned exit belongs to replanned. If TB-12 creates no non-pass record, the G4 cause is simply not admitted; that does not lower a grade.

---

## 9. Order of work and review

**Effort (per Jared's instruction in this run):** workers at high effort; reviewers at extra-high (xhigh).

0. **Decisions before prose.**
   - Jared: B-1, then B-2 and B-3 (§7.2-7.4). Present now, so B-1 is answered early (P-03).
   - Owners: TB-01 (issuer), TB-02 and TB-25 (authoritative trigger proof on v9 births), TB-26 (is a run with an unrecorded failed attempt quiet), TB-05 (receipt family), TB-12 (G4 non-pass record), TB-27 (`graph_integrity` as a block). TB-18 only if a cause outside the existing enum is admitted. Shared with stopped: TB-03/T-02 and TB-04/T-03.
   - Record each answered card as a DL entry (P-05).
1. **Landing 1, task 1 (prose only), after A1 lands (changed for CR-03: landing 1 now lands before the v9 package freezes).** The EP, GRS, SP and BRS units of §4.1 for W-B. Then `pm-shard-plans.py --generate --config Plans/sharding_config.json`, `pm-plan-index.py generate`, `--check`, `pm-plan-index.py validate`. Stop if unrelated shards change.
2. **Landing 1, task 2 (companions):** `workflow_run_block_contracts/`, storage +5 with census re-pins, schema self-validation and all fixtures, the three storage test suites, `pm-implementation-readiness.py`.
3. **Review, landing 1:** one blind form-driven canon review (xhigh), cap two; leftovers become written open questions; validation report and checks JSON under `reports/event-authority-20260911/replan-v8/a3/`; STATUS.md; push. A local session lands it under the lock with `pm-landing-check.py --base origin/main` on a full tree.
4. **v9 package and canon compile (`v9-profile-plan.md` §4), after both A3 landing 1s are on `main`.** v9 pins their landed bytes, carries v8 forward, and adds the D01 successor with both rules and origin kinds, the descriptors (v9, producer v4), routes, rows and inverse, with checks for D01 rule/origin completeness, the W-B two-phase order and the action rule. Package review: one blind form-driven review (xhigh), one bounded repair round, re-review of what the repair touched (cycle cap two). Under B-1 option 2 or 3 this step also authors the added native writers.
5. **Landing 2 (with stopped), after A2's `v6` and v9 are on `main`.** One joint landing, or stopped's row first and blocked's second, per P-01 (open; the sequential order is the fallback).
   - Task 1, prose: the two GRS adoption units, the shared projection successor (GRS and SP), SP-214 routing paragraph, BRS, ATS, CV, optional OP, index section, minima routing notes. Regenerate.
   - Task 2: the shared consumer directory, composition file, storage +2, the two row edits (stopped then blocked), the re-freeze commits F1-F4, P1, R1. Run the six event suites listed in the stopped design §9 step 5, the three storage suites, the Browser and emit-only checks, and readiness (no `goal_payload_ref_mismatch` on `families/0` or `families/5`).
6. **Landing 2, governance:** freeze both after rows, fingerprints and the after SHA; grade both depth files; write both Q-03 records and run the scratch check; freeze the Q-02 card(s) of the landing (plus the conditional certified card if §4.2 applies) and send them through the coordinator, in one batch where cards are prepared together (PA line 7). **Jared answers each on its own line before landing.** Then the DL entries, `decision-responses.jsonl`, one checkpoint approval record and the PNC-019 comment; regenerate Decision_Log shards and index.
7. **Review, landing 2:** one blind form-driven review (xhigh), cap two; validation report; rebase check (if the registry SHA moved, re-freeze and re-present both cards). A local session lands it. Expected staleness goes to a reseal request; anything else on the branch's files blocks.
8. **Handoff:** A3-replanned builds the next successor on this head.

---

## 10. Open questions

### 10.1 Product (DL-036 cards to Jared)

| Card | Question | Options (recommendation first) |
|---|---|---|
| **B-1** | On v9 runs, which situations record a run as blocked? | (1, rec. if TB-25 and TB-26 hold) A failed check with no way on. (2, rec. otherwise) The same, and v9 also records the failed check (scope change). (3) Also when every remaining step waits on a person (needs step-wait writers). (4) Any approval or permission block. |
| **B-2** | Does the Goal show blocked too? | (1, rec.) Goal unchanged. (2) Goal moves to blocked; needs a `goal.blocked` writer first. |
| **B-3** | Record blocked before run replan exists? | (1, rec. with B-1 option 1 or 2) Yes, Abort is the only exit meanwhile. (2) Hold the writer until replanned (strains DL-080 order). (3) Resume without replan; not recommended. |
| **Q-02 row card** | Blocked row 2.0.0 → 3.0.0 and checkpoint SHA (§7.1) | Approve / keep old row / change first. Presented at landing 2, batched with stopped's if prepared together; one landing or two per P-01. |
| **Q-02 certified row card (conditional)** | Certified row `#/families/2` revision, only if O-R2-05 / Q-V9-09 says it must change (§4.2, CR-10) | Same form as §7.1. |

### 10.2 Owner and technical questions

From B2 (unchanged, see B2 §8): **TB-01** sole Executor issuer or bounded manager; **TB-02** which authoritative record proves a block episode and the remediation counter; **TB-03** quiet facts in D01 `CurrentSource` (= T-02); **TB-04** does native `blocked` alone fence dispatch (= T-03); **TB-05** receipt family, issuer, order and orphan handling; **TB-06** code mapping from Executor, Decision_Policy, Permissions and HITL onto `BlockedReasonCode`; **TB-07** ActionId to UCC `allowed_action_id` map (`stop_goal` → `abort_run`?); **TB-08** `blocked -> blocked` refused; **TB-09** Goal host continuation while its run is blocked (GRS-050); **TB-10** Stop-versus-block race, Stop wins; **TB-11** refuse while a held certified Event or held Replan exists; **TB-12** Standard tier with a mutation and verifier unavailable, and whether a non-pass decision record exists; **TB-13** `budget_exhausted` stop or block; **TB-14** admit `ready -> blocked`; **TB-15** exclude refusal and retired codes; **TB-16** chain position (now §5: shared successor); **TB-17** Abort Run reachable from step-level blocked episodes (UCC 1166).

New in this design:

| ID | Question | Recommended default | For |
|---|---|---|---|
| TB-18 | Only for a later profile with retries: the general dead-end causes (remediation ceiling, replan required, graph integrity) have no `BlockedReasonCode`. Widen the enum, or map to the nearest code? v9's reachable causes map to `verification_terminal_failure` (CR-01) | For that profile: widen by three values; the field set stays; the GRS unit says it departs from the "grammar unchanged" precedent | Goal Runtime, Executor, Decision Policy |
| TB-19 | Source of `blocked_scope`: the run's birth-admitted scope, or the blocking node's scope? | The run's birth-admitted scope, never widened | Goal Runtime, Executor |
| TB-20 | The EP sentence on EP-082 "deferred" versus native `blocked` (§1.7): a sentence in the W-B unit, or an EP-082 edit? | A sentence in the W-B unit; EP-082 text unchanged | Executor |
| TB-21 | Block receipt as a dedicated compact family (`executor_workflow_run_block_receipt`), since `goal_receipt` requires certification fields? | Dedicated family, `ReceiptKind` `goal_blocked` | Storage, Goal Runtime |
| TB-22 | Confirm the 13-row ActionId table of §2.4 input 6 (all reasons are inferences), including the D-R01 reading for permission and recovery branches: the first contract admits only `stop_goal` (and `replan` once current) | Confirm | Goal Runtime, Permissions, Storage |
| TB-25 (new, CR-01) | On v9 births no native writer records a failed check. Is the verifier's own failing result (or the final Standard decision, TB-12) an authentic, authoritative trigger proof for W-B? | Yes, if the verifier owner's record is durable and bound to the attempt; otherwise B-1 option 2 | Executor, Verifier owner, Goal Runtime |
| TB-26 (new, CR-01; shared with stopped T-02 / TB-03) | A failed first attempt stays `verify_pending` because `record_verified` refuses it. Does it count as "running" for the quiet census? If yes, the run is never quiet: W-B never writes and a C-3 stop stays pending forever | Not running: the attempt has no open effect, dispatch or tool call; the owner confirms | Executor |
| TB-27 (new, CR-02) | Is `graph_integrity`, a `failure_class` ("hard fail; replan path only", EP 418), ever a run-block trigger, and with what durable record? | Not in the v9 contract (no record exists); decide for a later profile | Executor, Orchestrator |
| TB-23 | The stop writer's `blocked` source goes live in v9 with W-B; the stopped contract admits it from the start | Yes | Executor, Goal Runtime |
| TB-24 | What makes a WorkNode "required" for the trigger (so optional nodes do not block a run)? | Bind to the owner's existing required/optional node term; if none exists, every node the certification plan needs | Executor, Orchestrator |

### 10.3 Process questions (with recommended defaults)

| ID | Question | Recommended default |
|---|---|---|
| P-01 (= Q-V9-06) | Both rows in one landing 2, or two landings, and which registry SHA pair each card shows? | **Open, no default (CR-04).** Send to the process thread as one question, citing PA line 7, PA line 17 (Q-09) and DL-078 (`Decision_Log.md` 1571 @63cf2cb). Stated fallback: two sequential landings, stopped first, each card with its own before/after pair from `main` |
| P-02 | One projection successor for stopped and blocked (§5)? | Yes; it replaces the stopped design's `v7`/`v8` split. Needs A2's agreement (O-15, V1-Q9) |
| P-03 | B-1 gates the v9 freeze, which also carries the stop writer. Q-09 says stopped must not wait on the blocked card. What if B-1 is still open when v9 is ready to freeze? | Present B-1 now so it is answered before the freeze. If it is still open then, "wait" (C-4: one v9 carries both) against "v9 stop-only plus v10 blocked" (Q-09) is a tension for Jared or the process thread; no recommendation (the v9 plan §6.1 now says the same, CR-05) |
| P-04 | Under B-3 option 2, does a contract with a named but unbound issuer meet DL-080's "land before replanned, each with a named writer"? | The coordinator reads "full current contract" as a live writer; B-3 option 2 is then shown to Jared as straining DL-080 (it is on the card) |
| P-05 | Who records the B-1 to B-3 answers as DL entries, and in which landing? | A small governance branch right after the answers, before any W-B prose, as DL-080 was recorded |
| P-06 | Corrections the stopped design needs: §1.3 (`blocked` source live in v9), §2.2 and §2.4 (V-1 is moot under C-4 option 2), §5 (shared successor), T-22 (Abort reachable from step episodes, TB-17) | Write a short addendum to the stopped design; do not edit it in place |
| P-07 | Depth grading: one grading pass for both families, with two separate files? | Yes, same grader, two files, two SHAs |
| P-08 | Align V1's D01 names (`original_run_blocked`, `run_blocked_original`) with this design's `original_run_block`, `run_block_original` | Align V1 before the v9 build. The v9 plan now closes its Q-V9-10 with this choice (CR-14) |
| P-09 | Q-03 record path, first-key form, `schema_id`, `decision_ref` (stopped OQ-1, OQ-2, OQ-4, OQ-6) | Same answers as stopped, applied to both records |
| P-10 | Does a row revision that keeps the count move the registry label (stopped T-15)? Reopened (CR-06): DL-094 moved the label to `2026-09-25.1` for an admission under DL-078's standing rule (`Decision_Log.md` 2159-2165 @abdf4eead) | Open; ask with DL-094 as evidence. The cards carry the label as a placeholder |

---

## Critique disposition

Critique: `critique.json` in this directory (verdict `not_ready`, 16 findings). One row per finding that names this file.

| Finding | Severity | Disposition | Where |
|---|---|---|---|
| CR-01 | blocking | **Applied.** New §2.3a checks the trigger against the 18-method roster v9 carries (A1 native-v8 `protocol.md` 129, 163, 165, 169; no failure, block, retry or repair method ID in any A1 `methods.json`). The Executor and Decision_Policy causes are now marked unreachable on v9 and cited only by analogy. B-1 is re-derived: option 1 is a failed check no v9 writer can record; option 2 adds native outcome writers as a stated scope change. New owner questions TB-25 (trigger proof) and TB-26 (is such a run quiet; a "no" answer would leave a C-3 stop pending forever, also sent to stopped's T-02). The `producer` forecast is now conditional | header, §0, §1.3, §2.2, §2.3, §2.3a, §2.4 inputs 3 and 6, §2.6, §3, §7.2, §7.4, §8, §9, §10 |
| CR-02 | blocking | **Applied.** The option table, card B-1 and card B-3 now say that canon also names a manual fix (Decision_Policy 423) and a patch (EP 419), and that recording blocked closes them and the step restart buttons (UCC 1156-1167) for that run. B-3's "could not have continued anyway" is removed. `graph_integrity` is marked an inference (TB-27). The G4 cause is conditional on TB-12 in the card text too | §1.3, §2.3a, §7.2, §7.4, §10.2 |
| CR-03 | should_fix | **Applied.** This design now lands landing 1 before the v9 package freezes, as the plan and the addendum do. One census table from that order (294, 328, 330, 334, 339, 339 + x, 341 + x). Q-V9-08 / V1-Q8 stays for the coordinator to confirm | §0, §4.1, §4.3, §9 |
| CR-04 | should_fix | **Applied.** P-01 is now open with no default, to go to the process thread as one question citing PA lines 7 and 17 and DL-078. Fallback stated: two sequential landings, stopped first. The Q-02 card carries the landing and SHA pair as placeholders | §6.2, §7.1, §9 step 5-6, §10.3 |
| CR-06 | should_fix | **Applied.** Header records the move to `abdf4eead` (registry `2026-09-25.1`, 43, `4227be36…`) and the remote `bd95afcc8` (not fetched). Card and Q-03 "before" values are placeholders. P-10 reopened with DL-094. F4 and PNC-019 line citations re-checked and updated; F1-F3 and readiness 491 unchanged | header, §6.1, §6.2, §6.3, §7.1, §8, §10.3 |
| CR-08 | should_fix | **Applied.** One-line reason for each of the 13 ActionIds, all labelled inference. D-R01 (GRS 3607 @63cf2cb) read for the permission and recovery branches. TB-07 and TB-22 stay open | §2.4 input 6, §10.2 |
| CR-10 | should_fix | **Applied.** The card's "other rows" line is now conditional on O-R2-05 / Q-V9-09. §4.2 and §7 list a conditional Q-02 card for `#/families/2` | §4.2, §7 intro, §7.1, §10.1 |
| CR-12 | note | **Applied.** §5 cites DL 6647-6648 @63cf2cb (6669-6670 @abdf4eead) for the quoted phrase and quotes line 6657's own wording | §5 |
| CR-14 | note | **Applied.** The idempotency key and the quiet facts are labelled "by analogy". P-08 records that the plan closes Q-V9-10 with this design's names | §2.3 trigger item 1, §3, §10.3 |
| CR-15 | note | **Applied.** "26 rows, of which T22-T26 are not block triggers". Card B-3 now gives option 3's gain | §2.3, §7.4 |
| CR-16 | note | **No change needed.** Verified clean; nothing to repair | — |
