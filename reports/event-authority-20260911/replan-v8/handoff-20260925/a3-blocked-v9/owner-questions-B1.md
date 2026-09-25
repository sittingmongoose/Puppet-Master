# Owner questions for card B-1: TB-25, TB-26 (with T-02/TB-03), TB-12, TB-02

Prepared 2026-09-25. Read-only, from git objects only.
- `main` = `origin/main` @ `bd95afcc8`.
- `A1` = `origin/plans/replan-v8-a1-20260925` @ `e8d61ace4`.
- `nv8` = `Plans/workflow_standard_source_contracts/native-v8/protocol.md` @A1 (A1 only; not on main).
- `nv8m` = `.../native-v8/methods.json` @A1.
- `cs5` = `.../native-v8/schemas/workflow-standard-current-source.v5.schema.json` @A1.
- `wam` = `Plans/workflow_activation_contracts/methods.json` (byte-identical on main and A1, sha256 `cd24a81a…9727`).
- `nwca` = `Plans/workflow_activation_contracts/schemas/native-worknode-current-activation.v1.schema.json` @main (same line numbers @A1).
- `stopP` = `Plans/workflow_combined_source_contracts/stop-protocol.md` @A1 (A1 only).
- "prop." marks a proposal. "By analogy" or "inference" marks what canon does not say outright.

## 0. Bottom line

1. **Canon already has a failure writer. v8 does not admit it.** `owner.executor.native.record_failed.v1` is in `wam` 745-762: "actual Verifier fail; verify_pending->failed; actual original failure receipt; no current Goal writer". Its Storage families are also canon (`storage-plan.md` 25528-25537 @main). A1 EP-125 (EP 8733 @A1) says: "No v8 map or occurrence names owner.executor.native.record_failed.v1 … which stay complete dependency contracts only under EP-117." So the gap in design §2.3a is not "no failure writer exists". It is "v8 does not admit the one canon has".
2. **TB-25 (prop.): no.** A failing verifier result reaches native state only as an input capture. `nv8` 153 says "An input capture cannot be used alone." `nv8` 145 says "A cause token is never proof." Canon names the authoritative record of a failed check: node `status = "failed"` (EP 141 @main), written by `record_failed.v1`.
3. **TB-12 (prop.): no.** On v8/v9 a failed final Standard decision leaves no durable non-pass record. The only issuance schema requires every gate `const: true` and `final_certifier_decision` `const: "certified"` (`cs5` 1187-1233).
4. **TB-26 (prop.): the census must judge "running" by live execution, not by lifecycle state.** Under the C-2 latch, canon appears to deny every native chain method after a Goal Stop (`nv8m` 247, `stopP` 66, inference). If so, any attempt caught in `in_progress` or `verify_pending` at Stop time stays there forever. This happens under every B-1 option. If lifecycle alone decides "running", a C-3 stop on such a run never completes.
5. **TB-02 (prop.):** on v9 births, the authoritative block source is the native failed-transition publication that `record_failed.v1` issues. It is not a `blocked_sequence` episode, a projection or a raw capture.
6. **Card B-1: option 1 is not sound. Option 2 is required, and it is smaller than the card says.** v9 admits one existing canon method, `record_failed.v1`. It needs no run-level writer to `failed_verification`. This fixes the blocked trigger. It fixes the C-3 stop only for failures recorded before the Stop. The general stop case still needs the TB-26 ruling.

## 1. What canon and A1 say

### 1.1 The verifier result: owner, storage, durability

- **Who issues it.** EP 130 @main: "Verifier writes evidence to `evidence_pointer` and returns `verifier_result`."
- **Who records the outcome.** The Overseer, which is the Executor.
  - Pass: EP 132 @main, "Overseer MUST first set node `status = "verified"`".
  - Fail: EP 141 @main, "When `verifier_result.outcome == "fail"`, Overseer sets node `status = "failed"`." The same text is at EP 141 @A1.
- **Its shape.** `project_plan_node.schema.json` 112-123 @main: `verifier_result.outcome` enum `["pending", "pass", "fail"]`. Lines 191-208 tie `status: failed` to `outcome: fail`.
  - `nwca` 2539-2541: `OriginalVerifierResult` is `$ref` to that `verifier_result`.
  - `nwca` 2542-2597: `OriginalVerifierInput` binds `scope`, `attempt_id`, `attempt_number`, `original_result`, `result_capture`, `complete_evidence`, `evidence_capture`, `required_validator_captures`, `original_worknode_revision` and `original_run_generation`.
- **Where it is stored.** As an `OriginalInputCapture` with `input_kind` `verifier_result` (`nwca` 2476-2500), plus its origin.
  - `capture_original_input.v1` "coissues both durably" (`nv8` 161).
  - `cs5` 1576-1590: `OriginalInputValue` kind `verifier_result`, whose `complete_value` is the `OriginalVerifierResult`. Nothing in the schema limits it to a pass.
  - Family: `executor_original_input_capture` (`wam` 735, 834).
- **Durable and authentic when it fails?**
  - Durable: yes, if a capture is taken. The capture binds the original owner, operation, payload hash and time (`nwca` 2452-2537).
  - Authentic: yes, for the same reason.
  - Authoritative on its own: no (§2.1).
  - **Not stated:** whether the owner issues a capture at all when no admitted method will consume it. `nv8` 161 says: "All consuming operations require these genuinely issued inputs before their consuming birth or mutation". On v8 no admitted method consumes a failing result.

### 1.2 Native attempt lifecycle, and what moves an attempt out of `verify_pending`

- **Canon lifecycle.** EP 114-119 @main: "`queued -> in_progress -> verify_pending -> verified -> done`", "`verify_pending -> failed`", and "`done` and `failed` are terminal".
- **Native schema.**
  - `nwca` 1275-1283: lifecycle enum `queued, in_progress, verify_pending, verified, done, failed`.
  - `nwca` 2277-2380 (`StateTransitionReceipt`): exactly five edges. They are queued→in_progress, in_progress→verify_pending, verify_pending→verified, verified→done and verify_pending→failed (2374, 2377).
  - There is no edge out of `in_progress` except to `verify_pending`. There is no edge out of `verified` except to `done`.
- **v8 writers (`nv8` 163-173).**

| From | To | v8 method | Condition |
|---|---|---|---|
| queued | in_progress | `begin_attempt.v1` | first attempt only (163) |
| in_progress | verify_pending | `submit_verification.v1` | "an actual completed submission" (167) |
| verify_pending | verified | `record_verified.v1` | "The original verifier result must pass … Failing/blocked/skipped/unresolved results cannot use this method." (169) |
| verified | done | `complete_worknode.v1` | Auditor certified, tests pass, and so on (171) |
| verify_pending | failed | **none on v8.** `record_failed.v1` exists in canon (`wam` 745) but is "Complete dependency contract only" (EP 7438 @main and @A1) and is not in any v8 map (EP 8733 @A1) | — |

- **Why the table is not a guess.** `nv8m` 3-12 inherits `wam` "whole" (`whole_inherited_maps`). But EP-125 @A1 8733 says plainly that no v8 map names `record_failed.v1`. EP-117 (EP 7430-7440) keeps it "no dispatch or later-state admission through this unit". `wam` 761: `activation_selection` "COMPLETE_DEPENDENCY_DECLARATION_NOT_CURRENT_ACTIVATION_DISPATCH".
- **Result.** On a v8/v9 birth, only `record_verified.v1` can move an attempt out of `verify_pending`, and only on a pass. A failing result leaves the attempt in `verify_pending` for good. The design's §2.3a reading holds for the roster. The correction is that the writer exists in canon.

### 1.3 The final Standard decision (G4)

- `nv8` 181: `issue_final_decision.v1` "independently evaluates G1–G8".
- `nv8m` 509-517: the method's `entry_predicates` include `"G1"` … `"G4"` … `"G8"` and `"DocumentPackaging"`. A failed gate stops the method at entry.
- `cs5` 1187-1233 (`FinalDecisionResult`): `"no_active_blockers": {"const": true}` (1216), and all eight gate booleans `const: true`. Also `"final_certifier_decision": {"const": "certified"}` (1231-1232).
- `nv8` 205: `capture_standard.v2` requires "Standard decision/label are certified".
- Canon's wider enum has `rejected` and `blocked` (`FinalCertifierDecision`, GRS 3486 @main). No v8 method issues them.

### 1.4 Run-level `failed_verification`

- GRS 3466 @main: `GoalRunStatus` includes `failed_verification`.
- It appears in GRS @main only as a **source** state. See D-R16 blocked (3733), D-R19 replanned (3754) and D-R21 stopped (3768).
- No `goal_run.*` Event and no D-R row has `failed_verification` as its target. So canon has no writer that moves a run into it (grep, @main and @A1).

### 1.5 Goal Stop and the native chain (bears on C-3)

- `nv8` 147 (U3, entry predicate of every v8 method, `nv8m` 211-218): "New native work requires an admissible current Goal action and no accepted Stop/cancel/owner conflict … Existing authentic native completion remains preserved if Stop arrives later".
- `nv8m` 247 (on `record_verified`; the same text is on every method, e.g. 77, 191, 303): "Independently authentic Goal Stop is a current acquisition in every authentic slot phase … Execution remains denied."
- `stopP` 66 @A1: "After revocation, no execution, dispatch, wake promotion, new attempt/effect, graph mutation or normal continuation/publication is admitted. Pure readback, repeated Stop, original cancellation/effect cleanup, and recovery of the exact already-held original operation retain only their original narrow capabilities."
- `stopP` 34: "pending wakes, delays, capacity reservations and unacknowledged dispatch facts are not zeroed." `stopP` 44: "An already-running external effect is not magically undone … Original FileSafe/process/effect shutdown and acknowledgement sources remain necessary".
- **Inference.** After the Goal Stop latch, `submit_verification`, `record_verified`, `complete_worknode` (and `record_failed`, if admitted) are "normal continuation/publication". So they are denied. An attempt in `in_progress` or `verify_pending` at Stop time cannot reach a terminal state through the native chain. Canon does not say this in so many words, so it goes to the owners (TB-28, §2.2).

### 1.6 The stop quiescence census

- Canon has no "quiet run" definition for a GoalRun stop. I found no hit for quiescence, "running attempt" or "in-flight attempt" in GRS @main. The EP @main hits (7668, 7744, 7877, 8208) concern FileSafe and process-effect quiescence, not a run census.
- The five facts come from the stopped design, §2.3 input 4 (prop., S2 B1(b)): "no unacknowledged dispatch, no running attempt, no open effect or tool call, no capacity reservation and no unresolved mutation fence". T-02 asks whether D01 `CurrentSource` carries them.
- The nearest canon is `nv8` 151 (U5): "Enumerate every current D01 materialized member, attempt and dispatch … No pending conflicting operation, missing member, unregistered attempt … unacknowledged required publication or ambiguous recovered result can pass." That is an admission census, not a quiet definition (by analogy only).
- D-R21 (GRS 3767 @main) asks for "no unresolved mutation fence" only for `resumable=true`. W-C uses `resumable=false`.

## 2. Answers (prop. owner rulings)

### 2.1 TB-25: is the verifier's own failing result, or the final Standard decision, a trigger proof for W-B on v9?

**Ruling (prop.): No, for both.**
- **The verifier's failing result.**
  - It exists natively only as an input capture (§1.1). `nv8` 153: "An input capture cannot be used alone."
  - `nv8` 145: "Only installed writer branches and authentic native original owner results can extend lineage. A cause token is never proof."
  - Canon names the owner record for a failure: node `status = "failed"` (EP 141), written by `record_failed.v1` (`wam` 758), which consumes the same `OriginalVerifierInput`.
  - If W-B read the capture directly, it would stand in for an owner record that canon already defines. It would also bypass that owner's `failed` transition.
  - It may not even exist. Canon does not say that a capture is issued when no method consumes it (§1.1).
- **The final Standard decision.** No non-pass record exists (TB-12, §2.3).
- **Owners:** Executor (Overseer), Verifier, Goal Runtime.

### 2.2 TB-26 (with stopped T-02/TB-03): does a `verify_pending` attempt with a failing result count as running?

**What canon settles.** `verify_pending` is not terminal (EP 117-119). Canon does not define "running" for a stop census (§1.6).

**What makes the question wider than the failing-verifier case (inference, §1.5).** After a C-2 Goal Stop latch, the native chain appears denied. So these attempts all stay put:
- an attempt still `in_progress` (worker was running),
- an attempt in `verify_pending` whose verifier had not returned, or had returned a pass, or a fail.

If the census reads "running" as "lifecycle is `in_progress` or `verify_pending`", a C-3 stop on any run that had a step in flight at Stop time never completes. That breaks Jared's C-3 answer ("running steps finish on their own, and the run is recorded stopped when quiet") under every B-1 option.

**Ruling (prop.):**
- (a) The census judges "running" by live execution facts, not by lifecycle.
- (b) An attempt counts as running while its execution capability is not revoked, or while it has an unacknowledged dispatch, an open effect or tool call, a held capacity reservation or an unresolved mutation fence. These are the other four T-02 facts, read per attempt.
- (c) A non-terminal attempt whose capability is revoked (`stopP` 38) and whose effects are settled through their own owners (`stopP` 44) is not running.
- (d) Without a Stop, (a) to (c) are not needed for W-B under option 2, because the failure is recorded and the attempt is `failed`, which is terminal.
- (e) Under option 1, without a Stop, the census would have to treat a `verify_pending` attempt as idle because a capture says the verifier failed. That is the capture used alone again (§2.1).

**New owner question TB-28 / T-28 (prop.; Executor, with the Stop owner).** After the Goal Stop latch, may `submit_verification`, `record_verified`, `record_failed` (if admitted) and `complete_worknode` still run for an attempt begun before the Stop?
- If **yes**, C-3's "finish on their own" can happen natively. Under option 2 the attempt ends `done` or `failed`, and a lifecycle census would work.
- If **no** (the reading in §1.5), ruling (a) to (c) is required for C-3 in every option.
- **Related gap (inference).** Without a Stop, an attempt whose worker dies stays `in_progress`. The schema has no other exit (`nwca` 2305-2380, `StateTransitionReceipt`), and v8 admits no cancellation or retry writer. The same goes for a `verified` attempt that `complete_worknode` refuses (`nv8` 171). Neither is a B-1 trigger. Both are stalls the census must name.

### 2.3 TB-12: does a failed final Standard decision leave a durable non-pass record on v8/v9?

**Ruling (prop.): No.**
- G4 is an entry predicate of `issue_final_decision.v1` (`nv8m` 512).
- The only result schema requires `no_active_blockers` `const: true` and `final_certifier_decision` `const: "certified"` (`cs5` 1216, 1231-1232).
- `capture_standard.v2` requires "certified" (`nv8` 205).
- So a G4 failure leaves the run at `provisional_success`, with no record of why.

**For v9 (prop.):**
- Do not admit the G4 cause on card B-1.
- Do not add a non-pass decision writer to v9. Canon's `rejected` and `blocked` decisions (GRS 3486) would need a new issuance schema and a Storage branch, and that belongs to a later profile.
- Such a run is quiet, because every required WorkNode is `done` (`nv8` 179). A C-3 stop completes on it: `provisional_success -> stopped` is legal (GRS 3768).

**First half of TB-12 (Standard tier, verifier unavailable, with a mutation).**
- Still open. GRS 3820 says only "standard only if no mutation/required check affected".
- `record_failed.v1` needs "actual Verifier fail" (`wam` 758), so an unavailable verifier is not recorded under either option. That stall stays unrecorded on v9 (inference).

### 2.4 TB-02: which record is the authoritative block source?

**Ruling (prop.), for v9 births.** The authoritative source is the native failed-transition publication that `record_failed.v1` issues, read through the D01 `CurrentSource`. It consists of:
- the WorkNode at `failed`,
- its `executor_worknode_transition` row,
- the AttemptRecord `terminal_result`,
- the `attempt_receipt` ("actual original failure receipt"),
- `executor_native_operation_result`,
- `executor_original_publication_origin`.

These are the joint families at `wam` 747-756, with Storage keys at `storage-plan.md` 25528-25537 @main.

**What is not the source:**
- A `blocked_sequence` episode. EP 800 @main: "Executor mints `blocked_sequence` when a HITL, auth, `/storage`, or recovery condition creates a blocked-episode". A failed check is none of these.
- `blocked_projection`, which is a projection (B2 F4).
- `AttemptRecord.blocked_state_ref`, which is null at birth (`nv8` 165), and no v8 method sets it.
- The raw verifier capture (§2.1).

The remediation counter does not apply on v9 (one attempt per step, `nv8` 163). `block_receipt_ref` still needs its own receipt family (TB-05, unchanged).

## 3. What follows for card B-1

### 3.1 Option 1 (blocked from the verifier's own record, no new v9 writers) is not sound (prop.)

- It rests on TB-25 = yes, and §2.1 finds canon against it (`nv8` 153, 145; EP 141).
- It also needs TB-26 = "not running" for a `verify_pending` attempt without a Stop. That in turn needs the capture as proof.
- It records blocked while the WorkNode still reads `verify_pending`. That contradicts EP 141 ("sets node `status = "failed"`") and `nv8` 129: "failure or cancellation evidence remains truthful".

### 3.2 Option 2 is required, and its minimal form is small (prop.)

| Writer (prop. name) | Source state | What it records | Canon status |
|---|---|---|---|
| **W-F1** `owner.executor.native.record_failed.v1`, admitted into `all_writers.v9` | WorkNode `verify_pending`, same live first attempt, actual `OriginalVerifierInput` with `original_result.outcome = "fail"` and its captures; no Goal Stop (TB-28) | `verify_pending -> failed`; AttemptRecord `terminal_result`/`result_ref`; AttemptControl; failure `attempt_receipt`; native result/origin; D01 member observation. Workflow body stays `running`; "no current Goal writer" (`wam` 758) | Method ID, typed shape (`wam` 746) and Storage families exist. Missing: v9 method entry, argument schema in a `cs5` successor, protocol paragraph (mirrors `nv8` 169), stored-profile route, D01 rule |
| (not recommended) run `running -> failed_verification` | — | — | No canon Event or D-R row targets it (§1.4). W-B does not need it: D-R16 admits `running -> blocked` (GRS 3733). Adding it means a new Event family and D01 rule |

- **No other writer is needed for the B-1 trigger.** The W-B trigger then reads: run quiet, at least one required WorkNode `failed` through W-F1, no Stop latched. Reason: `verification_terminal_failure` (GRS 3501).
- **Card and design text to correct.**
  - The card says option 2 needs "new writers" at "about 12 to 24 agent-hours". It should say "admits one existing canon writer". I give no revised estimate.
  - §2.3a should say that canon has `record_failed.v1` and that v8 excludes it (EP 8733 @A1), not that "nothing records a failed check".
- **Other effects.**
  - `publish_provisional_success` already refuses when a member is "failed" (`nv8` 179), so W-F1 cannot leak into certification.
  - A `failed` WorkNode is terminal (EP 119). Without run replan, the run's only exit is Abort (B-3, unchanged).

### 3.3 Does option 2 also fix the C-3 stop problem?

- **Partly.**
  - A failure recorded by W-F1 before the Stop leaves the attempt terminal, so the attempt no longer holds the census open.
  - A Stop that lands while an attempt is `in_progress` or `verify_pending` is not fixed if TB-28 = no. The attempt stays non-terminal.
- So C-3 needs the TB-26 ruling (§2.2 (a) to (c)) under both options.

### 3.4 Can a run whose attempt failed verification be Paused or Aborted to `stopped`?

Under C-2, Pause and Abort both latch the Goal Stop and go through W-C. `running`, `blocked` and `provisional_success` are legal sources (GRS 3768).

| Case | Option 1 | Option 2 |
|---|---|---|
| Failure happened before Stop, TB-26 as ruled in §2.2 | Yes. Attempt `verify_pending`, capability revoked, no open effect → quiet → `running -> stopped`. If W-B wrote first: `blocked -> stopped` | Yes. Attempt `failed` (W-F1) → quiet → `running -> stopped`, or `blocked -> stopped` if W-B wrote first |
| Failure happened before Stop, TB-26 = lifecycle counts as running | **No.** Stop and Abort stay `pending` forever. W-B never writes either | Yes, because W-F1 already made the attempt terminal |
| Verifier returns fail after Stop | Same as the rows above, by TB-26 | `record_failed` likely denied (TB-28). Result as in option 1: yes under §2.2, never under a lifecycle census |
| G4 fails at `provisional_success` | Yes (quiet; `provisional_success -> stopped`) | Yes, same |
| D06 cancel as a fallback | Not available (Q-12) | Not available (Q-12) |

## 4. Open points for the owners and the card

- TB-25, TB-26, TB-12, TB-02: rulings as in §2 (prop.). Owners: Executor/Overseer, Verifier, Goal Runtime, Storage.
- **TB-28 / T-28 (new).** Do native chain methods run after a Goal Stop for an attempt begun before it? This decides whether C-3 "finish on their own" is native or census-only.
- **TB-29 (new, prop.).** Is admitting `record_failed.v1` into v9 an owner change of EP-117's "dependency contract only" status? Prop.: yes. It needs an EP unit naming v9, the way EP-125 names v8's chain.
- **Card B-1 wording.**
  - Option 1 should be marked "not recommended: canon's failure record is `record_failed.v1`".
  - Option 2 should become "admit canon's existing failure writer into v9".
  - The recommendation should be option 2.
  - The G4 cause stays excluded.
- **Unchanged:** TB-05 (receipt family), TB-06/TB-18 (code map), P-03 (freeze timing).
