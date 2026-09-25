# Addendum to the A3 `goal_run.stopped` design: what cards C-2, C-3 and C-4 change (label D-v9)

Read-only note, 2026-09-25. It amends `../a3-stopped-scope/A3-stopped-design.md` (the "design") section by section. The design file itself is not edited.

**Answers applied** (`../a3-stopped-scope/cards-C2-C4-20260925.md`, Jared, 2026-09-25):
- **C-2, option 1.** Pause and Abort Run both record `goal_run.stopped` with reason `user_stopped`, and both latch the run's Goal Stop. The Debug investigation's "Cancel investigation" keeps its own `cancelled` meaning under the investigation owner.
- **C-3, option 1.** New work is blocked at once. Running steps finish or time out under their own owners. The run is recorded stopped when quiet, and the command reports pending until then.
- **C-4, option 2.** No stop writer is reserved in v8. A1 lands as reviewed. The stop and blocked writers go into a later `all_writers.v9`. v8 births never record stopped or blocked.

**Refs.** `@main` = `63cf2cb97f93`; `@A1` = `origin/plans/replan-v8-a1-20260925` `e8d61ace4` (the design cited `74c79b5bf9`; its A1 quotes are unchanged at `e8d61ace4` where re-checked below). "prop." marks a proposal. The companion plan is `v9-profile-plan.md` in this directory.

**`main` moved (CR-06).** Local `origin/main` is now `abdf4eead` (remote `bd95afcc8` per ls-remote, not fetched). DL-094 registered `coordination.agent_registered`: the Event registry is `2026-09-25.1`, 43 families, SHA-256 `4227be36806615cabc8a36c0a8a6555a24b6b6c38e960e07bd12354c3c373e70`. The stopped row `#/families/5` keeps fingerprint `8acbc249…e0a3`. Registry "before" values below are placeholders re-taken at the rebase base.

---

## Header and §0 (the design in brief)

- **Header line 3.** "`goal_run.blocked` comes next" still holds, but blocked now shares the v9 vehicle and, prop., the landing-2 projection successor (see §5 below).
- **§0 "The writer", last bullet.** Replace "That means a v8 grammar reservation before A1 lands, or a later v9 profile" with: the writer exists only for fresh `all_writers.v9` births (C-4 option 2). No original, v6, v7 or v8 birth can have one.
- **§0 "What needs deciding first".** The three product cards are answered. Still open from that list: the single-or-joint issuer half of T-01 (now T-01b) and the chain order, which is now settled in shape (§5 below) but not yet agreed with A2.
- **§0 "Two landings".** Unchanged in content. The timing changes: landing 1 lands before the v9 package freezes (prop.; the blocked design and the v9 plan now use the same order, CR-03), and landing 2 waits for v9 and goes with blocked's row, in one joint landing or two sequential landings (open, P-01 / Q-V9-06; §4.2, §9 below).

## §1 (meaning and transition)

- **§1.3, source states.** Unchanged. `blocked` stays grammar-only until W-B exists, and W-B is also v9-only.
- **§1.3, the Abort Run entry point.** The design says the Abort Run button's "main entry point therefore goes live only with the blocked contract". B2 §4 F3 reads it differently: Abort Run is one of the step-level "Blocked run actions" (UCC 1166 `abort_run`), reachable from any step-level blocked episode that lists it, with no `goal_run.blocked` needed. This correction comes from B2, not from the cards. It is prop. until the Orchestrator and wiring owner confirm it (TB-17 = T-22 below).
- **§1.4, `stopped -> stopped`.** Unchanged. Under C-3 a repeated Pause or Abort while the first is still pending is not a second stop. It returns the same pending stop intent (see §2.3 "pending" below).
- **§1.7, reason codes.** Confirmed by C-2: both commands use `user_stopped`. No new code distinguishes Pause from Abort.
- **§1.8, `resumable`.** Unchanged: only `resumable=false` until a safe-point owner is bound (T-04). The C-2 card already disclosed the cost: "Pause and Abort look the same in the record". The difference between them lives only in the stop-intent custody (`command_id`), not in the payload.
- **New §1.10 (prop.), Pause versus Abort after C-2 (changed for CR-09).** C-2 option 1, approved, says "Pause is stopped and resumable later through replan. Abort is stopped and not resumable." With both at `resumable=false`, D-R21 (GRS 3767 @63cf2cb) alone would still allow resume through "a distinct replan that proves changed admission conditions". So the `payload.resumable` flag does not carry C-2's rule by itself. The stopped GRS unit therefore states C-2's rule as a **binding constraint on the later replanned contract**: a run whose stop intent came from `abort_run` is not resumable, by replan or otherwise; a Pause-origin stop is resumable later through replan. This contract records the command origin in the stop-intent custody so that the replanned contract can enforce the rule. How to enforce it is T-25 (below); whether is settled by C-2.

## §2.1 (why no existing method can write it)

Unchanged. The A1 quotes still hold at `e8d61ace4`: EP-127 `Executor_Protocol.md` 8985 @A1, "The limited operation appends no Event and adds no goal_run.stopped, goal_run.blocked or goal_run.cancelled writer."

## §2.2 (the writer, by birth profile): table replaced

| Birth profile | Stopped writer | What Pause and Abort Run do (C-2, C-4) |
|---|---|---|
| EP-118 original/activation profile, `all_writers.v6`, `all_writers.v7` | None, and none can be added (EP 7523 @main) | The handler latches the Goal Stop (Goal shows paused, GRS 258 @main). W-C returns `unavailable` (unsupported profile). No Event. |
| `all_writers.v8` (A1) | **None (C-4 option 2).** EP-125 8700 @A1: "there is no late or old-birth enrollment" | Same as above. For a held Replan or certified slot, the Goal Stop also drives EP-127's limited revocation, which "appends no Event". |
| `all_writers.v9` (prop.) | W-C, installed at birth | The handler latches the Goal Stop, then W-C records `goal_run.stopped` when the run is quiet (C-3). |

- The C-4 card's first stated downside applies to the v8 row: "Any run created under v8 can never record `goal_run.stopped` … the wiring's expected stopped event never appears." That is theoretical while nothing is built.
- The wiring test sentences assert emission ("Assert cmd.orchestrator.pause emits goal_run.stopped …", WM 40060-40120 @main). For non-v9 births that cannot happen. DL-080 forbids rewiring. How the wiring owner treats that is new question T-26.

## §2.3 (the writer W-C)

**Native issuer.** Unchanged. T-01's issuer half is still open (T-01b).

**Callers (changed by C-2 and C-3; prop.).** The Orchestrator handlers `handlers::orchestrator::pause` and `handlers::runtime::abort_run` do two things, in order:
1. **Latch the Goal Stop** through the Goal owner on the GRS-073 host-selected row (GRS 6830 @main). This is what "new work is blocked at once" rests on: `Plans/workflow_standard_source_contracts/native-v8/protocol.md` 147 @A1 (U3), the source v9 carries: "New native work requires an admissible current Goal action and no accepted Stop/cancel/owner conflict" (the same sentence is native-v7 `protocol.md` 33 @63cf2cb; CR-13). For a v9 run in a held Replan or certified slot, the same Goal Stop drives the carried EP-127 limited revocation.
2. **Record a durable stop intent and invoke W-C.** W-C either publishes (run quiet) or returns `pending` with the intent reference.
- Which run-to-Goal mapping the handler uses (the Pause command is "addressed by run ID", GRS-089, `Goal_Runtime_System.md` 8294 @A1) and which Goal owner method latches the Stop is new question T-27.
- `handlers::runtime::abort_run` must branch on the run kind. For a Workflow run it follows the two steps above. For a Debug investigation run it keeps the investigation owner's `cancelled` meaning (C-2 option 1; `Plans/Wiring_Matrix.md` 483 @main). No command, catalog or wiring row changes.

**Inputs.** Changes only:
- Input 2, the latched Goal Stop: now always present for a W-C call, because the handler latches it first (C-2). It stays a required input: W-C refuses without it.
- Input 3: "For v8 births in held Replan or certified slot phases" becomes "for v9 births in held Replan or certified slot phases". The reader `read_run_execution_revocation.v1` is carried into v9 with its method ID (v9 plan §2).
- Input 4, the quiescence proof: unchanged in content. Its role changes under C-3 (next item).

**Pending, not refused (changed by C-3; prop.).**
- The design said "Anything short of this returns `unavailable`, and nothing is written … the caller retries."
- Under C-3 option 1 the stop is accepted at once and completes later. So a non-quiet run is no longer a refusal. The durable stop-intent family `executor_workflow_run_stop_intent` holds the accepted request. W-C returns a `pending` result naming that intent. `pending` is a result kind of W-C, never a lifecycle state and never a `goal_run.*` Event.
- The command result stays within its catalog fields (UCC 8108 @main: `run_id`, `pause_receipt_ref`, `resumable`). `pause_receipt_ref` names the stop intent. The expected Event arrives later. No command field is added (DL-080: no command change).
- **Who completes it (new question T-24).** Either the Orchestrator retries W-C, or the Executor scheduler pass re-invokes W-C when its run-level evaluation finds the run quiet. The second is the same caller B2 proposes for W-B (B2 §5.1: "the Executor scheduler pass's run-level evaluation"). Prop.: the scheduler pass, so a stop completes without a live UI. **This differs from the wording Jared approved** (cards file C-3, option 1, "What it costs": "The command reports pending, and the caller retries until the run is quiet"). If it is adopted, the C-3 Decision Log entry records the difference (CR-11).
- **A stop that may never complete (from the blocked design, CR-01).** On v9 births a failed first attempt stays `verify_pending`, because `record_verified` refuses it and no v9 writer records a failure (`native-v8/protocol.md` 169 @A1). If the owners count that attempt as running (T-02 / TB-26), the run is never quiet and a C-3 stop on it stays pending forever.
- A repeated Pause or Abort with the same idempotency identity returns the same pending intent, or the first Event once published.

**Output, crash cuts.** Unchanged, with one addition: a crash after the intent is written and before publication leaves a pending intent. Recovery completes it through the same key when the run is quiet, and never mints a new key (GRS 7443 @main).

**Refusals (changed).**
- "A non-quiescent run … returns `unavailable`" becomes `pending` (above).
- "An unsupported birth profile" now means every non-v9 birth: original, v6, v7 and v8.
- A missing Goal Stop latch still returns `unavailable`.

### §2.3, T-09 re-read for v9 (held certified Event)

**The design's recommendation** was that W-C refuses while a durable held, unreleased `goal_run.certified` Event exists, "until the A1/A2 certified-release rule decides otherwise".

**Why C-2 and C-3 make that harder in v9.** By my reading of the carried v8 texts (@A1):
- The certified route appends the Event before the native certification. `Plans/workflow_standard_source_contracts/native-v8/protocol.md` 86 @A1: "Original Storage append establishes durable held Event/custody before native certification."
- A Stop in that window revokes the held slot and does not force certification. Same file, 94: "They do not clear the slot, deny already applied native facts, replay publication or force a terminal certificate."
- After revocation nothing continues, and the Goal Stop is not cleared by release. GRS-089, `Goal_Runtime_System.md` 8289-8290 @A1: "neither recovery, a later D06 nor a coordinator release clears it or remints execution capability. After revocation no execution, dispatch, wake promotion, new attempt or effect, graph mutation or normal continuation or publication is admitted".
- So the native body stays at `provisional_success`, which is a legal stop source, while a durable certified Event exists that will never be released. D06 is unavailable (Q-12), so cancellation cannot settle it either.

**The conflict.** Under C-2 every Pause and Abort latches the Goal Stop, so this window is reachable by an ordinary Pause. Under C-3 the command reports pending "until the run is quiet". If W-C refuses while the held Event exists, that run stays pending forever.

**Options (not decided; for Executor, Goal Runtime, A2 and A3):**
- **(a) Refuse, as the design said.** The run stays "stopping" forever in that window. That contradicts C-3's promise that the stop completes.
- **(b) Publish the stop, and make the projection treat the unreleased certified Event as no success.** v5 already gives such an Event no success: `goal_run_certified_consumer_contracts/protocol.md` 33 @main, "An armed, Event-only, committed-but-unreleased, uncertain, missing or fabricated release has no RetainedCertifiedNative success." The v7 successor would need a reducer rule: an unreleased held certified Event followed by a stopped row is admitted, and the run reads stopped. The design's §5 rule "If it is seen, it halts" would be reversed for this case only.
- **(c) Record stopped only after an owner disposition of the held Event.** This needs a new owner rule for held certified Events after revocation, which neither A1 nor A2 supplies.
- **Prop.:** (b). It keeps C-3's promise, it needs no new owner route, and it relies on an existing no-success rule. It changes A2's proposed v6 behaviour only for v9 births, which v6 does not admit anyway (R2 §4.5 proposes that v6 halts there for v8 births).
- **Related, V1-Q6.** Does a revoked held Replan or certified slot count as "quiet" for W-C? The native side is fenced and nothing runs, but the slot is not cleared (native-v8 `protocol.md` 94 @A1). Under (b) the answer should be yes.

## §2.4 (the profile vehicle): replaced

- **V-1 is removed.** C-4 option 2 rejects the v8 amendment. A1 lands as reviewed, with no reopening of canonical-draft `bb6be609`.
- **V-2 is the vehicle.** `all_writers.v9` installs W-C and W-B together. Its plan is `v9-profile-plan.md`.
- **Not viable,** unchanged: a profile-independent writer contradicts EP 7523 @main.
- The product side of this section (card C-4) is answered.

## §3 (payload v3, idempotency, event ID)

- **Unchanged,** apart from two notes.
- `resumable` is `false` for both commands (see §1.8 above). The idempotency tail keeps `resumable`, so Pause and Abort on the same revision pair produce the same key if everything else is equal. Only one can be first. The second returns the first Event (§1.4). That is acceptable because both are stops with the same reason. The command origin lives in custody.
- **Command joins.** `evidence_refs` carries the stop-intent receipt (named in the command's `pause_receipt_ref`) rather than a separate "Abort receipt".

## §4.1 (landing 1)

- **EP unit.** "which profiles list it (V-1/V-2)" becomes "listed only by `all_writers.v9`". It adds the pending result kind and the durable stop intent (C-3), and states that the handler latches the Goal Stop first (C-2).
- **OP-037 (prop.).** Result mapping, now settled by C-2 and C-3: `pause_receipt_ref` names the stop intent; `resumable` is `false`; the Event follows when quiet. For non-v9 births the handler performs the Goal-level pause only and no Event follows; this is not a disabled command, so none of the closed disabled reasons (`permission_denied`, `blocked_state_required`, `stale_projection`, UCC 8108) is used. Abort Run branches on run kind (Workflow run versus Debug investigation).
- **GRS unit.** Adds the Pause-versus-Abort note (§1.10 above) and the T-09 outcome.
- **Companions.** "Under V-1, the D01 schema successor … lives with A1's v8 package. Under V-2 it lives in the v9 package" becomes: it lives in the v9 package (v9 plan §3.2).
- **Timing (prop.).** Landing 1 lands before the v9 package freezes, so v9 pins its bytes as members. The blocked design and the v9 plan now use the same order (CR-03; coordinator confirms as Q-V9-08). Any later change to landing 1 re-freezes v9. Its custody rows are registered with a writer no installed profile lists yet, as A1 registered 34 families for an uninstalled v8 (descriptor status `CANONICAL_COMPLETE_SOURCE_PROFILE_NOT_INSTALLED`).
- **Unit numbers.** A1 lands first, so the "≥" floors hold (EP ≥128, GRS ≥090, SP ≥323, BRS ≥032). A2 also takes numbers (R2 §4.2 claims GRS-090, SP-323, BRS-032, ATS-061, CV-355), so A3 takes the next free ones at landing.

## §4.2 (landing 2) and the census table

- **Landing 2 goes with blocked's row (prop.).** It carries the v7 projection successor with the v9 adoption (v9 plan §7, §8). Both rows move to 3.0.0, each with its own Q-02 card and Q-03 record. **One joint landing or two sequential landings is open (CR-04):** PA line 7, "each landing is answered on its own line"; PA line 17 (Q-09), "land `goal_run.stopped` first"; DL-078 (`Decision_Log.md` 1571 @63cf2cb), "one family per landing". It goes to the process thread as P-01 / Q-V9-06, together with which SHA pair each card shows. Fallback until answered: stopped's row lands first, in its own landing with the projection successor, and blocked's row follows.
- **GRS adoption unit.** Its scope is v9 births only.
- **Census table: replaced (one table for all three notes, CR-03).** `main` 294 (unchanged at `abdf4eead`); A1 328; A2 v6 330; stopped landing 1 334; blocked landing 1 339 (338 without a receipt family); v9 339 + x (x = v9 rows, V1-Q5); landing 2 341 + x. Re-derive every number at each rebase (rule R2).

## §5 (projection chain): table replaced

| Successor | Author | Adds | Birth scope |
|---|---|---|---|
| v6 | A2 | v8 started (live), cancelled (dormant), certified (gated) | + v8 births; halts on stopped, blocked, replanned |
| **v7** | **A3 landing 2, stopped + blocked** | v9 started, cancelled, certified; stopped branch; blocked branch | + v9 births; stopped and blocked for v9 births only |
| v8 | A3-replanned | replanned branch | v9 births; v8 births only under RR-1 or RR-3 (A2 R2 §4.4) |

- **Fallback if blocked lags:** v7 = v9 adoption + stopped, v8 = blocked, v9 = replanned (v9 plan §8). The design's option (b), "A3-stopped carries A2's v8 adoption items", is no longer needed: A2 owns v8 births and A3 owns v9 births.
- **Reducer rules for the stopped branch:** unchanged, with "v8" read as "v9". One exception follows from T-09 option (b): an unreleased held certified Event followed by a stopped row is admitted, not halted.
- A v8-born stopped row is forged or foreign and halts (R2 §5).

## §6 (registry-row revision)

- **§6.1, the before row.** Unchanged (fingerprint `8acbc249…e0a3`, the same at `63cf2cb` and `abdf4eead`). The registry before value is no longer `0be54418…c842`: at `abdf4eead` it is `4227be36…3e70`, revision `2026-09-25.1`, 43 families, and it is re-taken at the rebase base (CR-06). Which SHA pair the card shows depends on P-01 / Q-V9-06 (open).
- **§6.2, the after row.** `payload_owner_doc` points to the SP unit of the joint v7 successor. The blocked row points to the same unit.
- **§6.3, re-freezes.** One set of re-freeze commits per landing, naming the row commit(s) of that landing (P-01 decides whether that is one landing or two). Across both rows F4 gains two tuples (stopped `8acbc249…e0a3` and blocked `f137e724…b4a5`), and the "six" successor set in `tests/test_pm_browser_event_admission.py` 116-127 becomes eight, not seven.

## §7 (the Q-02 checkpoint card draft)

- "for runs born under <v8 | v9>" becomes "for runs born under `all_writers.v9`".
- "Registry before" and "Registry after" become placeholders, re-derived at freeze: revision `<label>`, `<n>` families, SHA-256 `<before>` / `<after>` (at `abdf4eead`: `2026-09-25.1`, 43, `4227be36…`). The label after the row change follows T-15 (reopened below) (CR-06).
- "Runs born before <v8 | v9> still cannot record a stop" becomes "Runs born under any earlier profile, including v8, still cannot record a stop; for them Pause and Abort Run pause the Goal only".
- **What you get** adds: Pause and Abort Run finish as "stopped" once running steps have finished (C-3).
- The card remains its own card even if presented with blocked's (Q-02).

## §8 (Q-03 record and depth forecast)

- **`producer` criterion.** "profile listing" is now the v9 roster listing.
- **`transitions` criterion.** Still "PASS or PARTIAL". The exit through replanned is still unadopted at landing 2.
- **Nothing else changes.**

## §9 (order of work): step 0 and step 8 replaced

- **Step 0.**
  - Jared's cards C-2, C-3 and C-4: **answered**.
  - The A1 thread has no amendment to make (C-4 option 2).
  - Still before prose: T-01b (issuer), T-02 (quiescence facts), T-24 (who completes a pending stop), T-27 (Goal Stop latch step), T-09 re-read (above), and chain agreement with A2 (T-11).
- **Steps 1 to 3 (landing 1).** Unchanged, and they can run before v9.
- **Step 4 (landing 2).** It waits for A2's v6 and for v9 on `main`, and carries blocked's branch and row (prop.), in the same landing or the next one (P-01, open).
- **Step 8 (handoff).** Replaced: A3-blocked landing 1 follows card B-1. Landing 2 is joint. A3-replanned builds the next successor on it.

## §10.1 (product cards): updated

| Card | Status |
|---|---|
| C-1 | Unchanged. Presented at landing 2, one card per row. |
| C-2 | **Answered, option 1** (Jared, 2026-09-25). |
| C-3 | **Answered, option 1** (Jared, 2026-09-25). |
| C-4 | **Answered, option 2** (Jared, 2026-09-25, after re-presentation). |
| C-2 note (the Abort Run conflict) | **Settled by C-2 option 1:** Workflow run → stopped; Debug investigation → `cancelled` under its own owner. |
| New, related | B-1, B-2, B-3 (blocked, B2 §7) and prop. C-5 (v8 Replan release, A2 R2 §4.4) gate the shared v9 and landing 2. |

## §10.2 (owner, technical and process questions): changes only

| ID | Change |
|---|---|
| T-01 | **Vehicle half answered:** V-2, `all_writers.v9` (C-4 option 2). **Issuer half open**, renamed T-01b: a single Executor issuer with Orchestrator as caller, or a joint issuer? It now applies to W-B as well (TB-01). |
| T-02 | Now also the completion condition of a pending stop (C-3). Shared with TB-03. **Added (CR-01):** does a failed first attempt that stays `verify_pending`, because no v9 writer can record the failure, count as running? If yes, such a run is never quiet and a C-3 stop stays pending forever. Shared with the blocked design's TB-26. |
| T-03 | **More important under C-2.** If the user resumes the Goal (clearing the Goal Stop) while the run stays `stopped`, does native `stopped` alone fence dispatch? GRS 3468 @main says stopped is fenced, and the answer must be yes in the Executor contract. Shared with TB-04. |
| T-07 | Partly settled: `pause_receipt_ref` names the stop intent. The WM test-sentence question stays. |
| T-09 | **Re-read for v9** (§2.3 above). Options (a), (b), (c). Prop. (b). |
| T-11 | Shape settled by C-4 (§5 above). Agreement with A2 still needed. |
| T-15 | **Reopened (CR-06).** The design kept the label `2026-09-11.2` for a row revision. DL-094 has since moved the label to `2026-09-25.1` for an admission under DL-078's standing rule (`Decision_Log.md` 2159-2165 @abdf4eead). Does a row revision that keeps the count also move the label? Ask with DL-094 as evidence; shared with the blocked design's P-10. |
| T-18 | Unchanged. Pause on a `ready` run: C-3 makes it complete at once, since a `ready` run is quiet. |
| T-22 | **Prop. corrected by B2 (TB-17):** Abort Run is reachable from step-level blocked episodes (UCC 1166) and does not wait for `goal_run.blocked`. |
| T-24 (new) | Who completes a pending stop when the run becomes quiet: an Orchestrator retry or the Executor scheduler pass (prop.)? |
| T-25 (new, reworded for CR-09) | C-2 settles that an Abort-origin stop is not resumable. **How** does the replanned contract enforce it, for example by refusing a replan whose stop intent came from `abort_run`, given `resumable=false` alone still allows a distinct replan under D-R21? For A3-replanned; the stopped GRS unit states the constraint. |
| T-26 (new) | The wiring test sentences assert emission for every run. How does the wiring owner treat non-v9 runs, which can never emit it, given DL-080 forbids rewiring? |
| T-27 (new) | Which Goal owner method latches the Goal Stop for a run-addressed Pause or Abort, and how is `run_id` mapped to the GRS-073 host-selected row? |

All other T-rows (T-04 to T-06, T-08, T-10, T-12 to T-14, T-16, T-17, T-19 to T-21, T-23) are unchanged.

## Critique disposition

Critique: `critique.json` in this directory (verdict `not_ready`). One row per finding that names this file, plus CR-01, whose repair asks for a T-02 owner question here.

| Finding | Severity | Disposition | Where |
|---|---|---|---|
| CR-01 (related) | blocking | **Applied, for its T-02 part.** T-02 now asks whether a failed first attempt that stays `verify_pending` counts as running; if yes, a C-3 stop on that run stays pending forever. Shared with the blocked design's TB-26. The rest of CR-01 is applied in the design and the plan | §2.3 "Pending", §10.2 T-02 |
| CR-03 | should_fix | **Applied.** Landing 1 before v9 is now the order of all three notes; one census table (294, 328, 330, 334, 339, 339 + x, 341 + x) | §0, §4.1, §4.2 |
| CR-04 | should_fix | **Applied.** The joint landing 2 is no longer a default: one landing or two is open (P-01 / Q-V9-06), citing PA lines 7 and 17 and DL-078; fallback stopped first | §0, §4.2, §6.1, §6.3, §9 |
| CR-06 | should_fix | **Applied.** The `main` move is recorded; registry "before" values are placeholders; T-15 reopened with DL-094 | header, §6.1, §7, §10.2 |
| CR-09 | should_fix | **Applied.** §1.10 states C-2's rule as a binding constraint on the replanned contract (Abort-origin stops are not resumable); T-25 now asks how to enforce it, not whether | §1.10, §10.2 T-25 |
| CR-11 | note | **Applied.** T-24 says the scheduler-completion option differs from C-3's approved wording ("the caller retries") and must be recorded in the C-3 DL entry if adopted | §2.3 |
| CR-13 | note | **Applied.** The U3 sentence is cited from native-v8 `protocol.md` 147 @A1, with native-v7 33 as the older copy | §2.3 "Callers" |
| CR-16 | note | **No change needed.** Verified clean | — |
