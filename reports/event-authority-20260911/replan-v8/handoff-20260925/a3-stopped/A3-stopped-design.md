# A3 `goal_run.stopped`: design for the current contract (label D-stopped)

- Program: Event Authority Step 8(b) Group A, branch A3, DL-080 current contracts, family `goal_run.stopped` only. `goal_run.blocked` comes next and `goal_run.replanned` after A1/A2. Neither is designed here.
- Base, read as git objects only: `origin/main` = `63cf2cb97f936c91dd7bb5c585d9a35d8409ed61`. Pending context, not canon: A1 `origin/plans/replan-v8-a1-20260925` = `74c79b5bf9`, and process answers `origin/plans/replan-v8-process-answers-20260925` = `616f12bfde` (`reports/event-authority-20260911/replan-v8/process-answers-20260925.md`).
- Inputs: the five scoping notes S1 to S5 in this directory. This note resolves their findings into one design. Where S1 to S5 disagree or leave something open, it says so. It changes nothing in the repository.
- Verified again for this note:
  - Registry SHA-256 `0be544181eda423dcea4d8661206e7da6d066fdcf51913d5962f1a283635c842`, revision `2026-09-11.2`, 42 rows.
  - Stopped row `#/families/5`, lines 242-283. Its fingerprint (sorted keys, `(",",":")`) is `8acbc2495110aa3ee37fe7469603fe6240250f0a2a4bd756f8973dedc549e0a3`.
  - The DL-080 unit is at `Plans/Decision_Log.md` 6633, not near 6211 as the brief said; the prose is at 1609.
- Highest unit IDs on main: GRS-085, EP-124, SP-320, BRS-029, ATS-058, CV-353, OP-036, DL-093.
- Highest unit IDs on A1: GRS-089, EP-127, SP-322, BRS-031, ATS-060, CV-354.
- All IDs, method names, paths and family names below that are not already on main are **proposals**, marked "(prop.)". Numbers are assigned at authoring or landing, after rebase.

---

## 0. The design in brief

- **What the event records.** `goal_run.stopped` records one Workflow GoalRun's own native body moving into `stopped` on the direct D-R21 edge, and nothing else.
  - The run stays fenced and nonterminal.
  - It leaves `stopped` only through `goal_run.cancelled`, which is D06 and unchanged, or through a future admitted `goal_run.replanned`.
- **The writer.** It is a new stop publisher owned by the Workflow run lifecycle owner, W-C from S2.
  - The native owner is Executor. The Orchestrator Pause and Abort Run handlers are its callers.
  - D01 observes the change through a new transition rule, and one EventRecord is written in the same joint outcome.
  - The writer's inputs are D06-free: the latched Goal host Stop, the whole current D01/native source, and a quiescence proof.
  - A writer can exist only for births of a profile that lists it. That means a v8 grammar reservation before A1 lands, or a later v9 profile. No existing v6 or v7 birth can have one.
- **The payload.** v3 successor `pm.goal_runtime_event.goal_run_stopped.schema.v3`. It has the GRS-079/080 v3 envelope, and the v2 event-specific fields are unchanged. The key is JCS `pm.goal-runtime-event.v3:`, and the `event_id` recipe is stated explicitly.
- **The projection.** A new versioned successor in one linear `goal_run_projection` chain agreed with A2. It is not an in-place edit of GRS-085/SP-317.
- **Two landings.**
  - Landing 1 is the source phase: writer, v3 schema and custody. It changes no Event registry row.
  - Landing 2 is the adoption phase: registry row 2.0.0 → 3.0.0, the projection successor, the fingerprint re-freezes, the Q-02 checkpoint card answered before landing, the Q-03 record and the depth file.
- **What needs deciding first.** Three product cards go to Jared before any writer prose: Pause and Abort meaning, in-flight work at a stop, and v8 reservation versus v9 coverage. Two owner and coordination rulings are also needed: the profile vehicle, and the chain order with A2.

---

## 1. What the event means and the transition it records

**Source text (origin/main):**
- `Plans/Goal_Runtime_System.md` 3764-3768, D-R21:
  - "`resumable=true` requires `safe_point_ref`, all child settlements, current storage/restore/permission evidence, and no unresolved mutation fence. `resumable=false` forbids future resume without a distinct replan that proves changed admission conditions."
  - "Transition: `ready|running|provisional_success|verifying|failed_verification|repairing|blocked -> stopped`; `stopped -> stopped` requires new settlement/recovery evidence. Certified/failed/cancelled sources are illegal."
- GRS 3468: "`blocked` and `stopped` are fenced, resumable only through a new revision and valid `goal_run.replanned` admission."
- GRS 3799, oracle pair EA-UND-0021: positive "Stop a running GoalRun with settled children and validated safe point; projection becomes fenced resumable `stopped`."; negative "Reject resumable without safe point/current admission evidence, unsettled child work, unknown reason, terminal source, or silent resume without new valid replan revision."
- GRS-080, GRS 7502 (exit to cancelled): "positive native cancellation from a genuine legal nonterminal Workflow, including blocked or stopped."
- GRS 6659: "Actual Workflow stopping, safe points, tool settlement and goal_run.stopped remain separately owned."
- DL-080 unit acceptance, DL 6657-6660: "each with a named writer and its rows carried by the mandatory GRS-085 run-history projection"; "The Pause and Abort Run wiring and the resume rule keep expecting these events."

**Proposed meaning (the GRS semantics unit states it):**
1. **What the event is.** It is the one original Event of a Workflow GoalRun's native body transition into `stopped` by the direct D-R21 stop route. It is published in the same joint native outcome as that transition.
   - It is not a Goal state. The Goal V2 statuses stay `active | paused | blocked | completed` (GRS 95).
   - It is not a cancellation.
   - It is not a scheduler-only fence, which is what `record_stop.v1` is.
2. **What the transition changes.**
   - The native body `status` goes from the source state to `stopped`, and the body revision advances exactly once. Every other body field is unchanged, including the activation state and revision.
   - Goal body and control, the Goal Stop latch, WorkNodes, attempts, prior results, schedules and quota stay under their owners. This follows the GRS-080 7502 wording pattern.
   - There is no resume, no replan and no fifth Goal state.
3. **Source states admitted by the first contract.** `ready | running | provisional_success | verifying | failed_verification | repairing` are admitted.
   - `blocked` is admitted in grammar but cannot occur until the `goal_run.blocked` writer exists, because no writer produces native `blocked` today (A3 blocked scope).
   - The Abort Run button is placed under "Orchestrator > Blocked run actions" (Wiring_Matrix.production.json 51931-51937). Its main entry point therefore goes live only with the blocked contract.
4. **`stopped -> stopped`.** Not admitted by the first contract; D-R21 requires materially new settlement or recovery evidence, and no owner of such evidence is bound. A repeat Pause or Abort on a stopped run with the same idempotency identity returns the first original Event and receipt. With a new identity it returns `unavailable`, which is never a lifecycle state. This is technical question T-08.
5. **Exits from `stopped`.**
   - To `cancelled`, only by D06, which is unchanged. D06 stays an unbound issuer (Q-12), so today a stopped run has no working cancel.
   - To another status, only through an admitted `goal_run.replanned`, which is not yet current.
   - The contract says in words: "a stopped run stays fenced until an admitted `goal_run.replanned` or a D06 cancellation; neither is supplied here".
6. **Second route into `stopped`.** D-R19's `next_action=stop` (GRS 3754) is recorded by `goal_run.replanned`, not by a second `goal_run.stopped`. The recommendation is to exclude it from this contract and hand it to the replanned contract (T-10).
7. **Reason codes.** Only `user_stopped` is admitted. This follows GRS-080 7506, "Only user_cancelled is admitted by this positive route".
   - The other nine `StopReasonCode` values (GRS 3499) stay registered grammar with no issuer.
   - Automated stops such as `budget_exhausted` or `verification_terminal_failure` have no owner trigger in canon, and this contract adds none (T-16).
8. **The `resumable` branches.**
   - `resumable=true` requires a `safe_point_ref` from a bound safe-point owner. Canon names none: S1 Q5 lists FileSafe `safe_point_id`, a D05 safe-stop, or an Executor checkpoint as candidates (T-04).
   - Until a safe-point owner is bound, the route admits only `resumable=false`. `resumable=true` returns `unavailable`.
   - Because resuming needs `goal_run.replanned` anyway (GRS 3468), no user capability is lost today. The product consequence ("a paused run shows as not resumable until run resume exists") is stated on card C-2.
9. **Child settlements.** Under GRS-075 (GRS 6961-6969: "Complete original child-Goal requirements and receipt arrays must authenticate as empty"), `child_settlement_refs` is required and must equal the authenticated-empty original child set. That is exactly `[]`, and a nonempty or unknown child set refuses.
   - Settling in-flight WorkNode, attempt and tool work is a separate precedent predicate (section 2, B1). It is evidenced in native custody and in `evidence_refs`, not in `child_settlement_refs`.
   - This resolves the depth42 CONFLICT note "child_settlement_refs relies on child wording that current text treats as lineage (GRS-075: empty only)" by owner text. The schema-level form of the constraint is T-05.

---

## 2. The named writer

### 2.1 Why no existing method can write it (evidence, from S2 and re-verified)

- **EP-118, EP 7523:** "All unlisted Workflow writers remain refused by `RequiredOtherWorkflowWriterSource=false`; this adoption supplies no completion, certification, ownership-transfer or optional/replanned materialization route."
  - `BoundTransitionRule` and `OriginalWriterOrigin` have no stop value (S2 F1).
- **`owner.executor.workflow_source.record_stop.v1`** is a scheduler-stop recorder.
  - Its closed `StopResult` is `scheduler_fenced | unavailable` and has no event member.
  - Its `SchedulerStop` requires `native_cancel_result`. `RunOperationResult(operation=cancel)` has one issuer, `owner.executor.native.record_cancellation.v1`, which EP 7440 marks "Complete dependency contract only".
  - Q-12: "the `goal_run.stopped` contract in A3 must not depend on D06 being available." This rules out `record_stop.v1`, StopSource, SchedulerStop, D05 and D06 as inputs (S2 F2-F3).
- **A1, pending:**
  - EP-127 (A1 EP 8985): "appends no Event and adds no goal_run.stopped, goal_run.blocked or goal_run.cancelled writer."
  - GRS-089 (A1 GRS 8297): "no goal_run.stopped or goal_run.blocked writer is added (A3)".
  - EP-125 (A1 EP 8700): "Only genuine original birth installs v8: there is no late or old-birth enrollment".
- **The command handlers** `handlers::orchestrator::pause` and `handlers::runtime::abort_run` are command entries. No precedent names a handler as the Event writer, so they are callers (S2 W-D).

### 2.2 The writer, by birth profile

| Birth profile | Stopped writer | Evidence |
|---|---|---|
| EP-118 original/activation profile, `all_writers.v6`, `all_writers.v7` (every birth on main) | **None, and none can be added.** Pause or Abort on these runs keeps today's behaviour, where Goal-level pause latches the stop epoch and "cancels no workflow-owned record" (GRS 258). The stop publisher returns `unavailable` (unsupported profile), and no Event is written. | EP 7523. The certified consumer `protocol.md` 5 says "closed all_writers.v7 roster". GRS-085 says "no existing birth is enrolled or cast". |
| `all_writers.v8` (A1, if it lands) | **Only if v8 carries the stop-publisher grammar before its first birth.** The recommended vehicle is V-1 below. Without it, v8 births have none. | A1 EP-125 8700, EP-127 8985 |
| A later fresh profile (`all_writers.v9`, prop.) | The stop publisher, installed at birth | S2 B2(b) |

### 2.3 The writer (W-C, all names prop.)

- **Native issuer (Executor, Workflow body owner):** `owner.workflow.run_stop.publish_stopped.v1`.
  - GRS 3911 says "Orchestrator owns user-visible projections and Executor owns scheduler truth".
  - DL-080 names "Orchestrator and Executor". Orchestrator is the caller, and T-01 confirms whether a joint issuer is wanted.
- **Storage participant:** `owner.storage.workflow_stop.commit_original.v1`.
- **Passive readers:** `owner.workflow.run_stop.read_current.v1`, `…read_retained.v1`, `…inspect_original.v1`.
- **Recovery:** `owner.workflow.run_stop.recover.v1`, which resolves a lost acknowledgement through SP-286/CV-339 `resolve.v2` and never re-executes.
- **D01 observation:** `update_workflow.v3`, or its profile successor, observes the change with a new `BoundTransitionRule` value `original_run_stop` (`cause=owner_status`) and a new `OriginalWriterOrigin` kind `run_stop_original`.
  - D01 is never the issuer. This follows EP 7523: "D01 never becomes the issuer of the underlying native effect."

**Inputs, all D06-free. The EP unit says so in words, mirroring the Q-12 ruling wording and A1 EP-127 8979-8982.**
1. The whole current D01 `CurrentSource` and native body/control at an exact revision (the CAS basis).
2. A separate current Goal argument showing a latched Goal host Stop on the GRS-073 host-selected row (GRS 6830).
   - This is the fence against new work: native-v7 `protocol.md` 33 says "New native work requires an admissible current Goal action and no accepted Stop/cancel/owner conflict".
   - Whether run-level Pause latches the Goal Stop is card C-2.
3. For v8 births in held Replan or certified slot phases only, `RunRevocationCurrent`, obtained only through A1's `read_run_execution_revocation.v1`. It is optional corroboration, never a substitute for input 4.
4. A **quiescence proof** from the same current source: no unacknowledged dispatch, no running attempt, no open effect or tool call, no capacity reservation and no unresolved mutation fence. This is S2's B1 option (b). Whether D01 `CurrentSource` carries all five facts is T-02.
   - Anything short of this returns `unavailable`, and nothing is written.
   - In-flight work is never interrupted, because interrupting needs D06. Under the latched Goal Stop, in-flight attempts finish or time out under their own owners, and the caller retries (card C-3).

**Explicitly not inputs:** `StopSource`, `SchedulerStop`, `RunOperationResult(operation=cancel)`, `record_cancellation.v1`, the `record_stop.v1` `scheduler_fenced` result, D05 and D06. The unit also states:
- Nothing activates `record_cancellation.v1` by implication.
- A later D06 cancellation of a stopped run is a separate, unchanged transition (GRS 7502).
- A stop is never projected or read as a cancellation.

**Output: one joint native outcome, following the started pattern (EP-118 7541: "one authentic EventRecord append, its synced first barrier …").**
- The body status goes to `stopped` and the revision advances by one; the control matches.
- The D01 update, head, pointer and origin are written.
- Compact custody families are written, all prop. and all `RP-AUTHORITY-INDEFINITE@1.0.0` with mandatory backup: `executor_workflow_run_stop_intent`, `_control`, `_result` and `_origin`.
- One `goal_run.stopped` v3 EventRecord is written, with its first barrier adopting SP-286 by name (the depth-rubric producer rule) and full-value custody.
- Goal body, control and Stop latch are preserved.

**Crash cuts.**
- Before commit, nothing is visible.
- After commit but before acknowledgement, a retry with the same key returns the first original Event and receipt.
- It never mints a new key or timestamp. This follows GRS 7443 and 7508: "A missing acknowledgement … cannot restart the original run".

**Refusals.**
- A terminal or illegal source is `illegal_transition` (GRS 3810-3822).
- A stale Workflow revision is `revision_conflict`.
- The same key with a different digest is `idempotency_conflict`.
- Unprovable dedupe is `dedupe_unavailable`.
- A missing Goal Stop latch, a non-quiescent run or an unsupported birth profile each return `unavailable`, which is source quality and not a lifecycle state.
- **A held, unreleased `goal_run.certified` Event (v8, A1 GRS-089 8295 open item).** The recommendation is that the stop publisher refuses (`unavailable`) while a durable held certified Event exists for the run, until the A1/A2 certified-release rule decides otherwise (T-09). This also keeps the projection from ever seeing certified-then-stopped.

**Withdrawal protocol**, needed for the depth criterion `compatibility_withdrawal` and modelled on the certified package, which passed that criterion:
- The writer is cut off by a profile successor that omits it.
- Readers are fenced by the reader version.
- The projection is rebuilt as a successor that halts on stopped rows again.
- Already-written Events stay retained under `RP-AUTHORITY-INDEFINITE`.

### 2.4 The profile vehicle: an owner and coordination ruling, with a card (C-4) for its product side

- **V-1 (recommended if A1 has not landed).**
  - A narrow A1 amendment before landing: the v8 roster carries the stop-publisher argument grammar, the `original_run_stop` rule and the `run_stop_original` origin kind, with the issuer stated as an **unbound dependency until the A3 source package lands**.
  - This is the same pattern Q-12 prescribes for D06 in v8: "the D06 argument grammar is carried, its issuer is an unbound dependency".
  - Cost: it reopens A1's reviewed package (canonical-draft `bb6be609`) for a bounded diff, with a re-review of what changed.
  - Benefit: every v8 birth can later emit `goal_run.stopped` without a v9.
- **V-2.**
  - A later `all_writers.v9` installs the writer. A1 is untouched.
  - Cost: v6, v7 and v8 runs never get a stopped Event. Pause and Abort stay Goal-level only for them.
- **Not viable:** a writer that works regardless of profile. That contradicts `RequiredOtherWorkflowWriterSource=false` (EP 7523).

---

## 3. Payload v3 schema, idempotency and event ID

- **Home (prop.):** `Plans/workflow_run_stop_contracts/schemas/goal-run-stopped.v3.schema.json`.
  - In the precedents the v3 file lives in the producer's contract directory, never in `event_payloads/goal_runtime/` (S3 §3).
  - The v2 file `Plans/event_payloads/goal_runtime/goal_run_stopped.schema.json` (SHA-256 `043212b8…5297`) stays byte-exact as history.
- **`$id` and `schema_version`:** `pm.goal_runtime_event.goal_run_stopped.schema.v3`. `event_name` is const `goal_run.stopped`. The root is closed, with `additionalProperties:false` and `unevaluatedProperties:false`.

**The envelope, copied from the started/cancelled v3 schemas (S3 §5; GRS 7439, 7504):**
- **Kept:** `event_name`, `schema_version`, `occurred_at_utc`, `project_id`, `goal_id`, `goal_revision` (the unchanged original Goal context), `actor_ref`, `execution_role`, requested and effective provider, model and account refs, `correlation_id`, `evidence_refs`, `artifact_refs` and `payload`.
- **Optional:** `thread_id`, `causation_event_ref`, `approval_refs` and `block_refs`.
- **Added and required:** `expected_goal_run_revision` and `goal_run_revision` (integer, minimum 1). They equal the genuine native before-revision and before+1. `idempotency_key` becomes required.
- **Removed:** `expected_goal_revision` and `parent_goal_id`. GRS 7504: "An expected Goal revision from v2 is not silently reinterpreted as the Workflow clock."
- This resolves the depth42 `closed_payload_schema` CONFLICT ("requires expected_goal_revision … with no Workflow revision fields").

**Event-specific `payload`, the same fields as v2 (the GRS 2657 routing-note pattern):**

| Field | Schema | Owner predicate (GRS unit) |
|---|---|---|
| `goal_run_id` | non_empty_ref, required | equals the outer `run_id` (GRS 3438) and the native Workflow identity |
| `stop_reason_code` | enum of the 10 `StopReasonCode` values, required | the route admits only `user_stopped` |
| `child_settlement_refs` | ref_array, required, unique | exactly `[]` under GRS-075; nonempty or unknown refuses (T-05: add `maxItems:0` or keep the shape) |
| `resumable` | boolean, required | the first route admits only `false` until a safe-point owner is bound (T-04) |
| `safe_point_ref` | non_empty_ref, optional; required if `resumable=true` (v2 `allOf` kept) | absent on the first route |

- **Command joins, for the depth42 `scope_identity` gap "the wiring rows' command_id/correlation joins have no event contract".**
  - `correlation_id` equals the command's correlation ID.
  - The command's receipt ref (`pause_receipt_ref` or the Abort receipt) goes in `evidence_refs`.
  - `command_id`, origin and handler target live in the native stop-intent custody record, not in the payload.
  - `causation_event_ref` is absent, because commands are not Events.
  - UCC 8108's `pause_scope`, `pause_reason` and `safe_point_required` have no payload slot, and none is added (T-07).

**Idempotency key.** This is the JCS family recipe of GRS-079/080, the same event family style:
```
idempotency_key = "pm.goal-runtime-event.v3:" + lower_hex(SHA-256(RFC8785-JCS(
  ["pm.goal-runtime-event-idempotency.v3", scope_partition, "goal_run.stopped",
   project_id, goal_id, goal_revision, expected_goal_run_revision, goal_run_revision,
   goal_run_id, stop_reason_code, resumable])))
```
- Storage owns `scope_partition`, and the inner and outer keys are byte-equal.
- `safe_point_ref` is left out of the tail. It is covered by the producer semantic digest (Contracts_V0 1008-1028 rules), and the revision pair already makes each transition unique.
- The producer semantic digest and the full stored-value commitment are separate codecs.

**`event_id` (explicit, to close the depth rubric's event-ID rule; prop., modelled on the certified LP recipe in S3 §6.2):**
```
event_id = "goal_run.stopped.v3:" + lower_hex(SHA-256("pm.goal_run.stopped.event_id.v3" || 0x00 || LP(scope_partition) || LP(idempotency_key)))
```
- LP is the byte count, `:`, then the bytes. `replay_policy` is `dedupe_by_idempotency_key`.
- The alternative is to cite the generic Contracts_V0 1008/1028 rule as started and cancelled did; both still passed `scope_identity` in depth42. This choice is T-06.

**Outcomes.**
- The same key and digest return the first original Event and receipt, with no second append, timestamp or revision.
- A changed digest is `idempotency_conflict`.
- A stale Workflow revision is `revision_conflict`.
- Unprovable dedupe is `dedupe_unavailable`.

**Fixtures.** Whole-value v3 positive and negative fixtures, labelled TEST_ONLY where synthetic, go in the producer directory `fixtures/` or under `tests/fixtures/`. This lifts `positive_negative_oracles` beyond the "prose-only" grade.

---

## 4. Owner units, companion files and storage families

### 4.1 Landing 1: source phase. Event registry unchanged, so no Q-02 card.

| Doc | Unit (prop.) | Contents |
|---|---|---|
| `Plans/Executor_Protocol.md` | EP-(next, ≥128) "Workflow run stop publisher" | Writer identity (§2.3); which profiles list it (V-1/V-2); the D01 rule and origin kind; participants; entry and final predicates (quiescence, Goal Stop latch, source states, `user_stopped` only, `resumable=false` only); joint outcome; crash cuts; refusals; the Q-12 wording that D06, D05, StopSource, SchedulerStop, native cancel and `record_stop.v1` are not inputs; withdrawal; NOT_RUN boundary. |
| `Plans/Goal_Runtime_System.md` | GRS-(next, ≥090) "goal_run.stopped v3 source semantics" | Meaning (§1); v3 envelope and payload predicates (§3); idempotency key and `event_id`; the GRS-075 child reconciliation; the `resumable` branches; exits from stopped; the D-R19 `next_action=stop` exclusion; NOT_RUN. D-R21 stays unchanged as the basis. |
| `Plans/storage-plan.md` | SP-(next, ≥323) "Workflow run stop custody" | Four compact authority families (§2.3) with keys, codec (CV339 MessagePack), `RP-AUTHORITY-INDEFINITE`, mandatory backup; first receipt adopting SP-286 by name; baseline and delta census wording as in SP-312 26174. |
| `Plans/Backup_Restore_System.md` | BRS-(next, ≥032) | Mandatory backup and restore coherence of the stop custody families and the Event, per the depth42 `redaction_custody` finding "no unit names who holds the original stop record …". |
| `Plans/Orchestrator_Page.md` | OP-037 (prop.) | Pause and Abort Run handlers call the stop publisher. Card C-2 decides the result mapping (`resumable`, `pause_receipt_ref`) and the disabled reason for unsupported births, out of the existing closed set `permission_denied`, `blocked_state_required` and `stale_projection` (UCC 8108). No command, catalog or wiring row changes (DL-080 negative constraint). |

**Landing 1 companion files, task 2 after the prose:**
- `Plans/workflow_run_stop_contracts/` (prop.), containing:
  - `protocol.md`
  - `methods.json` (5 methods, status `canonical_source_contract_native_installation_not_run`)
  - `physical-families.json`
  - `schemas/goal-run-stopped.v3.schema.json`
  - `schemas/run-stop-source.v1.schema.json`, covering the intent, result, `Unavailable` and quiescence proof
  - `resource-realms.json`, with `network_fallback:false` and the same-ID conflict rule
  - `owner-sources.json`
  - `source-citations.json`
  - `fixtures/`
- Under V-1, the D01 schema successor that carries the new `BoundTransitionRule` and origin kind lives with A1's v8 package. Under V-2 it lives in the v9 package.
- `Plans/storage_value_registry.json`: append the four custody families at the end, with all 26 fields and an inline `value_schema` (storage-plan 518 rejects bare references). Policies stay at 27.

### 4.2 Landing 2: adoption phase. Registry row and projection successor, needing Q-02 and Q-03.

| Doc | Unit (prop.) | Contents |
|---|---|---|
| GRS | GRS-(next) "goal_run.stopped current adoption" | Adopts exactly row `event-family-goal-run-stopped` at 3.0.0. Registry membership stays 42 and the other 41 rows are unchanged (wording of GRS 7437). v2 is kept as history. Names the writer. Read roles; NOT_RUN. **This unit is the new `semantic_owner_doc`.** |
| GRS | GRS-(next) "run-history projection successor with stopped rows" (§5) | Successor to GRS-085 in the mandatory role. GRS-085 stays byte-unchanged. |
| SP | SP-(next) projection successor | Two new derived families on dataset `goal_run_projection.v<N>`; reducer; keys; generation and frontier; census delta. **This unit is the new `payload_owner_doc`.** Also a routing paragraph in SP-214 after its certified paragraph (storage-plan 15166-15176), and A006 extended or an A007 added. |
| BRS | BRS-(next) | Optional coherent derived backup, restore ordering, source-coupled lifetime (stopped `RP-AUTHORITY-INDEFINITE`, started `RP-RUNTIME-365D`). |
| ATS | ATS-(next) | Whole-value positive and negative facets for the writer, Event and projection, in the style of ATS-057 CF-01..12. |
| CV | CV-(next) | Schema-root and resource-bank closure for the v3 payload and consumer schema. Also updates the stale Known-37 roster row for stopped (Contracts_V0 3683-3691); whether to fix the three sibling v2 rows too is T-17. |
| GRS minima table | routing note under row 2655 | Same pattern as the certified routing note at GRS 2657. |
| `Plans/00-plans-index.md` | one section | As certified did. |

**Landing 2 companion files:**
- A consumer directory, successor to `Plans/goal_run_certified_consumer_contracts/`, with the same file set: `protocol.md` P0-P8, `methods.json`, `schemas/consumer.v1.schema.json`, `companions/` (the whole predecessor consumer schema), `companion-differences.json`, `commitment-domains.json`, `dependencies.json`, `imports.json`, `installed-profile.json` and its digest, `owner-sources.json`, `source-citations.json`, `physical-retention-install.json`, `resource-realms.json`, `source-method-composition.json` and `source-variants.json`.
- A family composition file in the style of `goal_certified_family_composition.json`.
- `storage_value_registry.json`: +2 projection and checkpoint families (S4 §4.2), `RP-PROJECTION-3GEN`.
- `event_family_registry.json`: row `#/families/5` only (§6).

**Storage census.**

| Base | Families | Materialized | `later_gui_or_feature_projection` |
|---|---|---|---|
| origin/main (294 / 274 / 251) | +4 custody (landing 1) +2 projection (landing 2) = **300** | +6 = **280** if the custody families are `materialized` | +2 = **253** |
| A1 landed first (328 / 308 / 285) | **334** | **314** | **287** |

The totals are to be re-derived at each rebase, including any A2 successor families.

---

## 5. The GRS-085 projection extension and the one successor chain

**Reading.** "Extend GRS-085 to its rows" (DL-080) is met by a new versioned successor member of the SP-214 / D-R20 `goal_run_projection` role, not by an in-place edit.
- GRS-085, SP-317, their rows #292/#293 and every v3, v4 and v5 artifact stay byte-exact.
- SP-317, storage-plan 26627: "Never copy an old checkpoint or reinterpret old row bytes".
- The v5 value schema pins `…started_cancelled_certified.v5` / `5.0.0`.
- The owner confirms this reading (S4 O-S4-01).

**The coordination fact that drives the ordering (S4 §6.1).**
- The stopped writer exists only for births of the V-1 (v8) or V-2 (v9) profile.
- v5 admits only `all_writers.v7` births. A1 GRS-088 says v5 does "not admit or project the certified rows or Events of a v8 birth".
- So a "v5 + stopped" successor would halt at the writer's own run's `goal_run.started` (an incompatible profile) and never reach a stopped row.
- The stopped branch is live only in a successor that also admits that profile's started, cancelled and certified Events, which is A2's adoption work.

**Chain rules (process; for A2 and A3 to agree, per A1 author decision O-15, "A2 and A3 agree one `goal_run_projection` successor chain"):**
- **R1, linear.** Each successor carries every supported branch of the current head in whole preserved banks, plus its own. There is no second projector for the per-run role.
  - A1's draft replanned projector (`grscrg_`, H-keys, JSON codec, no certified branch) is rebased onto the head by A2 or A3-replanned and re-keyed to the v5 conventions: `K(...)`, CV339 MessagePack, Storage-owned `publish`, and root CAS fields.
- **R2, numbers taken at landing.** The dataset version, family names and generation prefix are taken at landing. A successor whose base moved is re-adjudicated: bank imports, companion differences, `/families/<n>` pointers, census, and `recovery_disposition.source_family_ids`.
- **R3, DL-080 order is by row.** DL-080's order constrains which rows are admitted (stopped and blocked before replanned), not the chain position.
- **R4, birth scope per branch.** Each successor states the admitted profiles for each branch.

**Recommended order (S4 option (a)):**

| Successor | Author | Adds | Birth scope |
|---|---|---|---|
| `v6` | A2 | v8-birth started, cancelled and certified | started and cancelled for the original profile, v7 and v8; certified for v7, and for v8 once A2 adopts it; still halts on stopped, blocked and replanned |
| `v7` | **A3-stopped (landing 2)** | stopped branch | stopped only for births of the writer's profile (V-1: v8; V-2: v9, which then also needs v9 started, cancelled and certified carried) |
| `v8` | A3-blocked | blocked branch | blocked writer's profile |
| `v9` | A2/A3-replanned | replanned branch | v8 Replan |

If A2 is late, option (b) applies: A3-stopped carries A2's v8 adoption items. That widens A3's scope, and it needs the coordinator's consent. Landing 1 does not wait for either.

**Naming.** Use a chain-neutral family stem, for example `goal_run_lifecycle_projection` / `_checkpoint` with dataset `goal_run_projection.v<N>`. This avoids ever-longer `started_cancelled_certified_stopped` names and avoids confusion with `all_writers.v<N>`; it is an author choice (O-S4-03). The new identities needed are:
- a generation prefix distinct from `grsg_`, `grscg_`, `grsccg_` and `grscrg_`;
- anchor and frontier domain labels;
- the projector profile;
- the installed-profile digest.

**Reducer rules for the stopped branch (from D-R21, D-R17, D-R18 and v5 P4):**
- **Stopped is supported** from the admitted source states. The source state comes from the original native before-commitment, never from invented Event history (v5 P4 line 57).
- **`ready -> stopped` with no started row is supported.** The native before-status `ready` from the committed commitment is the proof, and no D06 is needed (S4 O-S4-06, T-18).
- **`stopped -> stopped`:** a new identity halts, because the first contract does not admit it; an identical identity is generic dedupe.
- **After stopped:** `cancelled` (positive-D06 branch, unchanged) is legal. `certified` without an admitted replanned is a conflicting lifecycle and halts. Same-run `replanned` and `blocked` still halt until their successors exist.
- **Stopped after certified or cancelled** is illegal and halts. The v5 rule that certification and cancellation exclude each other stays.
- **Historical v2 `goal_run.stopped` rows** halt, following the precedent "No v2 sibling is cast or skipped" (O-S4-10).
- **Q-12 in the projector.**
  - A stop is never projected as cancelled, and cancelled is never inferred from a stop.
  - A v8 revocation (EP-127) is not a stopped row.
  - A held, unreleased certified Event followed by a stop cannot arise under the §2.3 refusal. If it is seen, it halts.
- **Current read.** A stopped row is current only while fresh native and Goal sources still match the stop issuance and the generic frontier is equal (v5 P7). A resumed run reads `unavailable`, not a stale stopped view.
- **Retention.** The projection is `RP-PROJECTION-3GEN@1.0.0`, and its source coupling gains a `stopped` entry in `physical-retention-install.json`. The registry row keeps `RP-AUTHORITY-INDEFINITE@1.0.0`, so no DL-045 card is needed.

---

## 6. The registry-row revision and what re-freezes with it

### 6.1 The row before (verbatim, `origin/main` `Plans/event_family_registry.json` 242-283, fingerprint `8acbc249…e0a3`, registry SHA-256 `0be54418…c842`)

```json
    {
      "family_id": "event-family-goal-run-stopped",
      "family_revision": "2.0.0",
      "event_type": "goal_run.stopped",
      "scope_policy": "project_only",
      "semantic_owner_doc": "Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima",
      "payload_owner_doc": "Plans/storage-plan.md#sp-214---goal-runtime-persistence-consumer",
      "payload_schema_id": "pm.goal_runtime_event.goal_run_stopped.schema.v2",
      "payload_schema_ref": {
        "path": "Plans/event_payloads/goal_runtime/goal_run_stopped.schema.json",
        "json_pointer": "#",
        "schema_id": "pm.goal_runtime_event.goal_run_stopped.schema.v2"
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
        "Plans/event_payloads/goal_runtime/goal_run_stopped.schema.json#",
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

This follows the started and cancelled pattern (anchors moved, v2 refs kept and new refs appended), which avoids certified's PARTIAL `owner_doc`. **Only the six fields the Browser gate can reconstruct change** (S5 §7, confirmed there by simulation): `family_revision`, `semantic_owner_doc`, `payload_owner_doc`, `payload_schema_id`, `payload_schema_ref` and `source_refs`. `scope_policy`, `legacy` (so no `run_id` pointer, as for started and cancelled, which still passed `scope_identity`) and `retention_policy_ref` are unchanged.

```json
    {
      "family_id": "event-family-goal-run-stopped",
      "family_revision": "3.0.0",
      "event_type": "goal_run.stopped",
      "scope_policy": "project_only",
      "semantic_owner_doc": "Plans/Goal_Runtime_System.md#GRS-<adoption unit>",
      "payload_owner_doc": "Plans/storage-plan.md#SP-<projection successor unit>",
      "payload_schema_id": "pm.goal_runtime_event.goal_run_stopped.schema.v3",
      "payload_schema_ref": {
        "path": "Plans/workflow_run_stop_contracts/schemas/goal-run-stopped.v3.schema.json",
        "json_pointer": "#",
        "schema_id": "pm.goal_runtime_event.goal_run_stopped.schema.v3"
      },
      "legacy": { …unchanged, byte-identical to 6.1… },
      "source_refs": [
        "Plans/event_payloads/goal_runtime/goal_run_stopped.schema.json#",
        "Plans/Goal_Runtime_System.md#goal-and-goalrun-payload-minima",
        "Plans/Contracts_V0.md#cv-287---goal-runtime-event-schema-registration",
        "Plans/workflow_run_stop_contracts/schemas/goal-run-stopped.v3.schema.json#",
        "Plans/Goal_Runtime_System.md#GRS-<adoption unit>",
        "Plans/Executor_Protocol.md#EP-<writer unit>",
        "Plans/storage-plan.md#SP-<projection successor unit>",
        "Plans/Backup_Restore_System.md#BRS-<derived unit>",
        "Plans/<consumer dir>/schemas/consumer.v1.schema.json",
        "Plans/<consumer dir>/methods.json",
        "Plans/<consumer dir>/resource-realms.json"
      ],
      "retention_policy_ref": { …unchanged… }
    },
```

- The registry revision label stays `2026-09-11.2` (the certified precedent) and the count stays 42. Only the SHA moves (OQ-3; the card states this).
- If coordination admissions land first (S5 H-1), the before-SHA, label and count on the card are those at landing, and the card is re-frozen and re-presented.

### 6.3 What re-freezes in the same landing 2

Each item gets its own commit naming the landed row commit, following the `c7b136ad2` / `d21679659` / `1cdf39074` precedent. All paths are editable: `scripts/**`, and the tests are allowlisted in `.gitignore` at 68, 74, 75, 79, 81, 90 and 92.

| # | Value | Where (origin/main line) |
|---|---|---|
| F1 | current39 `e2b5a433…d306` | `Plans/browser_event_admission.json` 8; `Plans/browser_event_admission.schema.json` 46 (`const`); `scripts/pm-browser-event-admission.py` 31 `CURRENT39_SHA256`; `tests/test_pm_browser_event_admission.py` 185-187 |
| F2 | prefix40 `a27cf49b…1050` | `scripts/pm_emit_only_event_contract.py` 16 (and comment 10-15); `Plans/github_project_event_admission.json` 5; `Plans/testing_session_event_admission.json` 8; `tests/test_pm_emit_only_event_boundaries.py` 28; `tests/test_pm_browser_event_admission.py` 67 |
| F3 | sorted upstream40 `b59cc61d…52ea` | `tests/test_pm_testing_session_events.py` 34; `tests/test_pm_github_project_integration.py` 62 |
| F4 | new `REVIEWED_GOAL_SUCCESSORS` tuple `(8acbc249…e0a3, <after fingerprint>, <row commit>, <GRS anchor>)` | `scripts/pm-browser-event-admission.py` 45-79 (the comment "six" becomes "seven"); `tests/test_pm_browser_event_admission.py` 116-127 (six IDs become seven, adding `event-family-goal-run-stopped`) |
| P1 | provenance (not read by code) | `Plans/github_project_event_admission.json` 6-10; `Plans/testing_session_event_admission.json` 9-13; `Plans/browser_event_admission.json` 51 |
| R1 | readiness goal payload map | `scripts/pm-implementation-readiness.py` 494 moves to the v3 path; self-test 5465-5473. Without this, `event_family_registry_goal_payload_ref_mismatch` is a blocking exit 2 (OQ-11). |
| PNC | PNC-019 | `scripts/pm_pnc019_currentness.py` provenance comment 43-49 names the new SHA and keeps `0be54418…` as the approved predecessor. Constants 50-51 move only if the label is bumped. Add a new checkpoint approval record in the form of `step-08-checkpoint-2026-09-11.2.json` (schema `pm.assurance.event_authority.checkpoint_approval.v1`). The Spec-Locked file adds one staleness row. |
| S | Storage census (both landings) | `scripts/pm-implementation-readiness.py` 761/764/770 and comment block 744-760; `tests/test_pm_assistant_contract_closure.py` 600; `tests/test_pm_onboarding_phases.py` 312-313; `tests/test_shared_runtime_storage_contracts.py` 216/221; `Plans/storage-plan.md` 523 |

- **Left as dated pins (no script reads them):** `Plans/coordination_event_admission.json` 11, `Plans/goal_certified_family_composition.json` 41, `goal_run_certified_consumer_contracts/owner-sources.json` 41 and `source-citations.json` 213. The same goes for the historical `storage_final_families: 294` and SP-316 "285".
- **Not moved:** `ORIGINAL39_SHA256` and `ORIGINAL40_SHA256` (browser script 27-28). They must still reconstruct to `f548a297…` and `4f701c95…`.

---

## 7. DL-036 checkpoint card draft for Jared (process answer Q-02)

Proposed file: `reports/event-authority-20260911/replan-v8/a3/goal-run-stopped-checkpoint-card.md` (OQ-9). It is frozen on the landing-2 branch tip, and its SHA-256 is recorded as `frozen_card_sha256`. The cloud thread does not present it; the coordinator or host does.

````markdown
# Checkpoint card: the stopped-run event row moves to its current version

Card ID: `EA-A3-GOALRUN-STOPPED-ROW-001`
Status: **QUEUED_UNANSWERED**. Prepared <date> under process ruling Q-02 (2026-09-25). It does not re-ask DL-080.
Owner: Orchestrator and Executor (Workflow run lifecycle), with Goal Runtime and Storage.
Family: `goal_run.stopped` (`event-family-goal-run-stopped`, registry row `#/families/5`).

**Name:** The registered "run stopped" event moves to its current version.

**Question:** Should the registered `goal_run.stopped` row change from version 2.0.0 to version 3.0.0 exactly as
shown below, with the approved registry checkpoint moving from SHA-256 `0be54418…c842` to `<after SHA-256>`?

**Why:** On 2026-09-24 you made `goal_run.stopped` a current event (DL-080), so that Pause and Abort Run record
when and why a run was stopped. The registered row still points at the old v2 payload, which uses the Goal's
revision instead of the run's own and which the Step 8 grading marked as a conflict. The new contract
(<EP writer unit>, <GRS units>, <SP units>) names the writer and adds stopped rows to the run history. The standing
rule for registrations (DL-078) does not cover changing an already registered row, so you approve it yourself,
as you did for the certified row on 2026-09-23.

**What you get:** Pause and Abort Run have a registered current event to write, for runs born under
<v8 | v9> (the only runs that can have a stop writer). The run history shows stopped runs. The revised row grades
<n> of 12 depth criteria (<depth file>, SHA-256 <…>); native execution is NOT_RUN. It does not rely on full
original cancellation (D06), which stays unavailable.

**What it costs:** The registry hash changes, so the admission fingerprints of the older families are re-frozen in
the same landing (<F1, F2, F3, F4, provenance, readiness map; commit list>). The designated Plans agent then reseals
the governance files this landing makes stale (<list>). Runs born before <v8 | v9> still cannot record a stop.

**The change (exact):**
- Registry before: revision `2026-09-11.2`, 42 families, SHA-256 `0be544181eda423dcea4d8661206e7da6d066fdcf51913d5962f1a283635c842`.
- Registry after: revision `2026-09-11.2`, 42 families, SHA-256 `<after>`.
- Row before, fingerprint `8acbc2495110aa3ee37fe7469603fe6240250f0a2a4bd756f8973dedc549e0a3`: <verbatim, §6.1>.
- Row after, fingerprint `<after fingerprint>`: <verbatim frozen row>.
- Fields changed: family_revision, semantic_owner_doc, payload_owner_doc, payload_schema_id, payload_schema_ref,
  source_refs. Unchanged: event type, scope, legacy identity and redaction, retention (RP-AUTHORITY-INDEFINITE).

**Options:**
1. **Approve the row and the new checkpoint** (recommended). It lands with its re-freezes; your answer is recorded
   as a Decision Log entry carrying the after SHA-256.
2. **Keep the old row.** The stopped contract stays written but not current; DL-080's order stalls before blocked.
3. **Change the row first.** Say what to change; a new card follows.

**Recommendation:** Option 1.

**Answer:** ____________________

## What this card does not do
It registers, admits or removes no family, keeps the count at 42, changes no other row, validator or seal
condition, and certifies nothing. The stopped family's DL-077-form record is informational and not read by the
seal check. If the registry changes before landing (for example a coordination admission), this card is re-frozen
and shown again.
Evidence: branch tip <commit>; depth file <path> SHA-256 <…>; compact bundle SHA256SUMS <…>.
````

**Recording Jared's answer, in the same landing 2 (S5 §4):**
- A Decision Log entry `DL-<next free at landing>` (DL-094 is taken if coordination lands first), with prose, a PlanUnit (`depends_on: [DL-039, DL-078, DL-080]`) and the `preserved_exact_tokens` card ID, `goal_run.stopped`, the after SHA and the label. Its negative constraints are "not an extension of DL-078 to row revisions" and "do not re-pin DL-077's records".
- A `decision-responses.jsonl` row carrying `frozen_card_sha256`.
- A checkpoint approval record.
- The PNC-019 provenance comment update.
- **Reading of DL-080.** DL-080's "No registry row … changes" describes DL-080's own effect. The row revision is authorized by this separate Q-02 card. The coordinator confirms this reading (T-20).

---

## 8. The DL-077-form record and the single-family depth assessment (Q-03)

**Record.**
- **Path (recommended, OQ-1):** `reports/event-authority-20260911/admission-records/original-37-revisions/goal_run.stopped.json`.
  - The frozen seal check globs only `admission-records/*.json`, non-recursively (validator 269). A record in that glob for a Known-37 family would raise `post_august_admission_incomplete` (validator 294, 623-626).
- **The "first line" (OQ-2):** the first key `"seal_check_note": "Not read by the seal check: goal_run.stopped is an original-37 row revised under DL-080, not a post-August admission (process answer Q-03, 2026-09-25)."`, written with `indent=1` and insertion order kept.
- **Other fields, per S5 §5.2:**
  - `schema_id`: the post-August record v1, kept for form parity.
  - `event_type`, `family_id`.
  - `implementation_receipt_sha256`: `dceb7f21…d827`.
  - `decision_ref`: the new Q-02 DL entry, not DL-080 (OQ-4), because it names `goal_run.stopped` and the after SHA.
  - `decision_section_sha256`.
  - `registry_before` / `registry_after`: same count, different SHA.
  - `registry_row_sha256`: the after fingerprint.
  - `depth_assessment {path, sha256}`.
  - `revision_landing {row_commit, record}` (OQ-6).
  - `criteria_not_passing_at_recording`, `status_at_recording`, `recorded_by`, `recorded_at_utc`.
  - `notes`: states that this is a revision, so DL-077's one-more-family rule does not apply.
- **Offline check:** run `admission_record_problems` from a scratch copy of the validator. Expect only `registry_before_after_not_exactly_one_family`, plus `depth_incomplete:*` if the grade is short. The validator itself is never edited.

**Depth file.**
- **Path:** `reports/event-authority-20260911/replan-v8/a3/goal-run-stopped-depth-<YYYYMMDD>.{md,json}`, with a compact quote bundle and `SHA256SUMS` in the same place (OQ-8, since `/mnt` is unreachable in the cloud).
- **Shape:** mirrors depth42 (`pm.assurance.event_authority.step08_current_depth.v1`, or a single-family variant).
  - `rows` has exactly one entry, `#/families/5`, with `family_revision` `3.0.0` and `registry.sha256` equal to the after SHA.
  - `supersedes` names the depth42 stopped row only (`ba9b84f9…`). No other family is re-graded.
  - Every cell carries `evidence[{path, unit, line_start, line_end, excerpt_sha256}]`, and every PASS has evidence under `Plans/`.
- **Timing:** graded on the landing-2 branch tip after companions and re-freezes. Cited excerpts are re-checked byte-identical at the rebase base.
- **Rubric:** the criteria text in S5 §6.2 is reconstructed. Check it against `rubric.md` (`81f1d8b2…`) from a local session (OQ-7).

**Forecast (prior 3/12 → target):**

| Criterion | Prior | Target | Closed by |
|---|---|---|---|
| membership_version | P | PASS | 3.0.0 row resolves to v3 `$id` |
| owner_doc | P | PASS | anchors moved to the new GRS and SP units |
| producer | p | PASS | named writer, profile listing, SP-286 by name, ordering |
| closed_payload_schema | C | PASS | v3 envelope; GRS-075 child reconciliation |
| scope_identity | p | PASS | revision joins, inner key, explicit `event_id`, command joins |
| replay_idempotency | p | PASS | v3 key, lost-acknowledgement rule, `resolve.v2` |
| retention | P | PASS (re-graded) | projection source coupling stated |
| redaction_custody | p | PASS | custody families, BRS, DL-076 tokens |
| transitions | p | PASS or PARTIAL | edges into stopped are adopted; exit via replanned is unadopted, and the grader decides whether that belongs to replanned |
| consumers_checkpoints | A | PASS | projection successor, SP-278 by name, DL-076 token |
| compatibility_withdrawal | p | PASS | withdrawal protocol (§2.3), which certified passed |
| positive_negative_oracles | p | PASS | ATS unit with whole-value fixtures |

The honest target is 11-12 of 12. No precedent reached 12.

---

## 9. Order of work, checks and review

0. **Decisions before prose.**
   - Jared: cards C-2, C-3 and C-4 (§10).
   - Owner and coordinator: V-1/V-2 (T-01), and the chain order with A2 (T-11).
   - A1 thread: if V-1, amend A1 before it lands and have its reviewer re-review the diff.
   - Worktree `~/pm-worktrees/a3-stopped-<date>` on `plans/replan-v8-a3-stopped-<date>`; the cloud thread pushes and does not land.
1. **Landing 1, task 1 (prose only):** the EP, GRS, SP, BRS and OP units in §4.1. Then `pm-shard-plans.py --generate --config Plans/sharding_config.json`, `pm-plan-index.py generate`, `--check` and `pm-plan-index.py validate`. Regeneration must touch only the edited documents' shards; stop if others change.
2. **Landing 1, task 2 (companions):**
   - The producer directory and v3 schema.
   - The storage registry +4, with the census re-pins S.
   - JSON Schema self-validation of the v3 schema and fixtures, and all positive and negative fixtures.
   - `python3 -m unittest tests.test_pm_onboarding_phases tests.test_shared_runtime_storage_contracts tests.test_pm_assistant_contract_closure`.
   - `pm-implementation-readiness.py`.
   - (The ledger compile witness does not apply: this is not a ledger compile.)
3. **Review, landing 1:**
   - One blind form-driven review, with one bounded repair round and a re-review of only what the repair touched (cycle cap two).
   - Leftovers become written open questions.
   - A validation report and checks JSON in the §8 shape of S3, under `reports/event-authority-20260911/replan-v8/a3/`.
   - STATUS.md, then push. A local session lands it: lock, `pm-landing-check.py --base origin/main` on a full tree, staleness sent to a reseal request.
4. **Landing 2, after A2's successor head lands (or with it under option (b)).** Task 1, prose: the GRS adoption and projection-successor units, SP successor plus the SP-214 routing paragraph, BRS, ATS, CV, the index section and the GRS minima routing note. Then regenerate.
5. **Landing 2, task 2:**
   - The consumer directory, composition file and storage +2 (census S again).
   - The registry row edit (§6.2), then the re-freeze commits F1-F4, P1 and R1, each its own commit.
   - Run `python3 -m unittest tests.test_pm_browser_event_admission tests.test_pm_emit_only_event_boundaries tests.test_pm_testing_session_events tests.test_pm_github_project_integration tests.test_pm_coordination_events tests.test_event_authority_holding_bucket`, plus the three storage suites.
   - Run `pm-browser-event-admission.py` and `pm_emit_only_event_contract.py` checks and readiness (no `goal_payload_ref_mismatch`).
6. **Landing 2, governance:**
   - Freeze the after row, fingerprint and after SHA.
   - Grade the depth file (§8) and pin its SHA.
   - Write the Q-03 record and run the scratch `admission_record_problems` check.
   - Freeze the card and send it via the coordinator. **Jared answers before landing.**
   - Write the DL entry, `decision-responses.jsonl`, the checkpoint record and the PNC-019 comment, then regenerate `Decision_Log` shards and index.
7. **Review, landing 2:**
   - One blind form-driven review, cap two.
   - Validation report.
   - Rebase check: if the registry SHA moved (H-1), re-freeze everything and re-present the card.
   - A local session lands it: landing check on a full tree. Expected: staleness for the registry currentness and live-registry drift (+2), Spec Lock `stale_hash` for the edited Spec-Locked files including `pm_pnc019_currentness.py`, owner and artifact evidence, readiness report and migration snapshot. All go to a reseal request to the designated Plans agent. Anything else on the branch's files blocks the landing.
8. **Handoff:** A3-blocked (with its Q-09 card) builds `v8` on this head. The replanned successor comes after A1/A2.

---

## 10. Open questions

### 10.1 Product questions (DL-036 cards to Jared; drafts in one line each, full cards written before landing 1)

| Card | Question | Options (recommendation first) |
|---|---|---|
| **C-1** | Q-02 checkpoint for the row revision (§7) | Approve / keep old row / change first. Presented at landing 2. |
| **C-2** | What do Pause and Abort Run do to a Workflow run? | (1, rec.) Both record `goal_run.stopped` with reason `user_stopped`: Pause as stopped, not resumable until run resume exists (resume needs `goal_run.replanned`, GRS 3468); Abort as stopped, not resumable. Both latch the run's Goal Stop, so the Goal shows paused and nothing auto-resumes (GRS 258). (2) Pause stops the run only and leaves the Goal active, which needs a new run-level fence that canon lacks outside v8 held slots. (3) Abort records cancelled instead; not available, because DL-080 keeps Abort expecting stopped and D06 is unbound. |
| C-2, note | It must also settle the Abort Run conflict. The production wiring expects `goal_run.stopped` (Wiring_Matrix.production.json 51931-51937). `Plans/Wiring_Matrix.md` 483 records the Debug investigation use as `cancelled`, and `Plans/human-in-the-loop.md` 2582 calls it "Cancel run command". | Recommendation: the Workflow-run meaning is stopped; the investigation-run use stays under its own owner. |
| **C-3** | When Pause or Abort arrives while steps are still running, what happens? | (1, rec.) New work is blocked at once, running steps finish on their own, and the run is recorded stopped when quiet; the command reports pending until then. (2) Refuse Pause while anything is running. (3) Interrupt running steps: needs D06, unavailable (Q-12). |
| **C-4** | Which runs can record a stop? | (1, rec. if A1 is unlanded) Reserve the stop writer in v8 (A1 amendment), so every v8 run can. (2) Wait for a v9 profile; v6, v7 and v8 runs never record stopped and Pause stays Goal-level for them. Either way, runs born before that profile keep today's Goal-level pause. |

### 10.2 Owner, technical and process questions

| ID | Question | For |
|---|---|---|
| T-01 | Vehicle V-1 (v8 grammar reservation, issuer unbound until A3) or V-2 (v9)? Single Executor issuer with Orchestrator as caller, or a joint issuer (DL-080 "Orchestrator and Executor")? | Executor, A1 thread, coordinator |
| T-02 | Does D01 `CurrentSource` carry all five quiescence facts (dispatch acknowledgement, running attempt, open effect or tool call, reservation, mutation fence)? If not, which owner supplies a D06-free census (S2 B1(a))? | Executor |
| T-03 | Does native body `stopped` itself block scheduler dispatch, or only the Goal Stop latch? | Executor |
| T-04 | Which owner issues `safe_point_ref` for `resumable=true` (FileSafe `safe_point_id`, D05 safe-stop or Executor checkpoint)? Until then, is `resumable=false` only confirmed? | Goal Runtime, FileSafe, Executor |
| T-05 | `child_settlement_refs`: owner-text "exactly empty" only, or also schema `maxItems:0` in v3? | Goal Runtime |
| T-06 | Explicit LP `event_id` recipe (§3), or cite the Contracts_V0 generic rule as started and cancelled did? | Goal Runtime, Contracts |
| T-07 | Command joins: `command_id`, origin and handler target in stop-intent custody, and the receipt in `evidence_refs`; do the WM test sentences ("emits goal_run.stopped with command_id, origin, correlation_id, and handler target") accept that? | Orchestrator, wiring owner |
| T-08 | `stopped -> stopped`: refused in the first contract (dedupe only)? Who could own "materially new settlement/recovery evidence"? | Goal Runtime |
| T-09 | v8 held unreleased certified Event, then Stop: the stop publisher refuses (recommended) or proceeds (A1 GRS-089 8295 open item; O-S4-05)? | Executor, Goal Runtime, A1/A2 |
| T-10 | D-R19 `next_action=stop`: recorded only by `goal_run.replanned` (recommended), or also by `goal_run.stopped`? | replanned contract |
| T-11 | Chain order: (a) A2 `v6` first, then A3-stopped `v7` (recommended), or (b) A3-stopped carries A2's v8 adoption. Also family names and generation prefix (O-S4-02/03). | A2, A3, coordinator |
| T-12 | Confirm the successor reading of "extend GRS-085" (O-S4-01). | Goal Runtime, Storage |
| T-13 | Q-03 record path, first-key form, `schema_id` and `decision_ref` (OQ-1, OQ-2, OQ-4, OQ-6). | process thread |
| T-14 | Does the Q-02 card also carry the storage rows and storage SHA pair (O-S4-08)? Recommended no; they are listed in "What it costs". | process thread |
| T-15 | Keep the registry label `2026-09-11.2` (recommended, certified precedent) or bump it, which moves PNC-019 line 50 and must be on the card (OQ-3)? | process thread, Jared via C-1 |
| T-16 | Issuers for the nine automated `StopReasonCode` values: out of scope here; which owner, if any, later? | Goal Runtime, Orchestrator |
| T-17 | Fix the stale neighbours in A3: UCC 8148 `goal.replanned`, the Contracts_V0 roster rows for started, cancelled and certified (3683-3691)? Recommended: fix only the stopped row and list the rest. | coordinator |
| T-18 | `ready -> stopped` with no started row: the projection accepts it from the native before-commitment (recommended); is Pause on a `ready` run wanted? | Goal Runtime, Orchestrator |
| T-19 | If the registry moves between the answer and landing (H-1), is the answer tied to the row diff or to the whole-registry SHAs, which means re-presenting (OQ-10)? | process thread |
| T-20 | Confirm that DL-080's "No registry row … changes" limits only DL-080 itself, and that the Q-02 card authorizes the revision. | process thread |
| T-21 | Answer-source file for a cloud-presented card that the local landing session can pin (OQ-12). | process thread |
| T-22 | Where is the Abort Run button reachable before `goal_run.blocked` exists? It sits under "Blocked run actions" (production WM 51931-51937). | Orchestrator |
| T-23 | Confirm with a readiness run that a successor checkpoint copying v5's `DurableGenericToken` field names passes storage-plan §2.3.1 (O-S4-09). | Storage |
