# Plan: the `all_writers.v9` canonical-draft package and its canon compile (label D-v9)

Read-only planning note, 2026-09-25. Nothing in the repository or the packages checkout was changed.

**Refs.**
- `@main` = `origin/main` `63cf2cb97f936c91dd7bb5c585d9a35d8409ed61`.
- `@A1` = `origin/plans/replan-v8-a1-20260925` `e8d61ace4c219723022fd9fea7187ffedc8b3b14` (reviewed, not landed).
- `@PA` = `origin/plans/replan-v8-process-answers-20260925` `616f12bfde2fa2ebbed1fd2b0e762a670f742282`.
- `main` moved after this was written: local `origin/main` is `abdf4eead` (registry `2026-09-25.1`, 43 families, SHA-256 `4227be36…`, DL-094); remote `main` is at `bd95afcc8` (ls-remote, not fetched). No v8 descriptor member changed (A2 design §0.3). Storage is still 294 families. Re-take every pin at the landing base.
- Scratch notes (not canon): V1 (`V1-v9-profile.md`), B1, B2 (`B2-trigger-writer.md`) in this directory; the A3-stopped design and S1 to S5 in `../a3-stopped-scope/`; the answered cards `../a3-stopped-scope/cards-C2-C4-20260925.md`; A2 note R2 (`../a2-scope/R2-projection.md`). `A2-design.md` did not exist when this was written.

**Conventions.** Line numbers are 1-based lines at the named ref. "prop." marks a proposal. "By analogy" marks a step from a precedent to a new case. Open questions are in §12 and are not answered here. Every ID, path, family and method name not already on `@main` or `@A1` is prop.

---

## 0. The plan in brief

1. **v9 is a new fresh-birth profile.** It re-issues the v8 closure under new `$id`s, keeps every v8 method ID, and adds two writers: the stop publisher W-C and the blocked publisher W-B. No existing birth (original, v6, v7, v8) is enrolled (V1 §0, §6; A1 EP-125, `Executor_Protocol.md` 8700 @A1: "there is no late or old-birth enrollment").
   - **What that carry means for W-B (CR-01).** The v8 native roster records only a successful first-attempt chain. It has no retry, repair, failure-result or step-block writer (`native-v8/protocol.md` 129 @A1: "Unsupported retry, general repair, waiver, exception, child or unknown writer branches remain unadmitted"; 169: "Failing/blocked/skipped/unresolved results cannot use this method"). So on v9 births W-B's trigger can rest only on an owner record outside the native roster, such as the verifier's own failing result (B-1 option 1, owner questions TB-25 and TB-26), or v9 must also install native outcome writers (B-1 option 2, a stated scope and product change on the card). Which one is Jared's B-1 answer plus the owner rulings (design §2.3a).
2. **The stop and blocked source contracts land first, as A3 landing 1 for each.** v9 then pins their landed bytes as members, as v8 pins 118 canon members (V1 §1). The design and the stopped addendum now assume the same order (CR-03); the coordinator confirms it (Q-V9-08). The blocked source contract cannot be written until card B-1 (the blocked trigger) is answered.
3. **One v9 package, then one canon compile.** The package is built from canon at the landing base with A1's tooling, reviewed in up to two cycles, accepted, and merged to the packages repo by Jared. The canon compile then lands owner prose first and companions second, with one blind review, cycle cap two.
4. **Freeze gates.** v9 cannot freeze until: A1 has landed (its landed v8 digest is v9's predecessor pin); B-1 is answered and A3-blocked landing 1 has landed (what happens to the stop writer if B-1 is late is an open C-4 / Q-09 tension, §6.1); the v8 Replan-release question (A2 O-R2-03) is decided, because it changes what v9 carries for Replan; and the owner rulings V1-Q3 to V1-Q6 exist.
5. **Consumer adoption.** v9 births need one projection successor that admits their started, cancelled and certified Events and carries the new stopped and blocked branches. That successor is A3 landing 2 for both families. It moves both Event registry rows to 3.0.0, each with its own Q-02 card and Q-03 record, in one landing or two sequential landings (open, Q-V9-06). A third row, certified, moves only if Q-V9-09 says so (§7).
6. **One chain:** v5 (main) → v6 (A2, v8 births) → v7 (v9 adoption + stopped + blocked) → v8 (replanned). Numbers are taken at landing.
7. **Estimate (prop., scaled from A1 actuals):** v9 profile alone 18 to 30 agent-hours and 3 to 5M output tokens. Everything from now to live stopped and blocked Events on v9 births, excluding A2 and A3-replanned: 50 to 80 agent-hours and 7 to 12M output tokens. B-1 option 2 (native outcome writers in v9) would add about 12 to 24 agent-hours and 1.5 to 3M tokens (§10).
8. **Effort.** Per Jared (2026-09-25, this workflow's request): workers at high effort, reviewers at extra high (xhigh). The estimate assumes this.

---

## 1. Why v9 exists (the constraint, cited)

- A run uses only the writers its birth profile lists. `Plans/Executor_Protocol.md` 7523 @main (EP-118): "All unlisted Workflow writers remain refused by `RequiredOtherWorkflowWriterSource=false`".
- v8 adds neither writer. EP-127, `Executor_Protocol.md` 8985 @A1: "The limited operation appends no Event and adds no goal_run.stopped, goal_run.blocked or goal_run.cancelled writer."
- Jared's C-4 answer (option 2, 2026-09-25): no stop writer is reserved in v8, A1 lands as reviewed, and "one v9 carries both the stop and the blocked writers once blocked's trigger is decided" (cards file lines 117, 119). A1's `STATUS.md` @A1 already records this.
- A component cannot be added to a v8 birth. EP-125, `Executor_Protocol.md` 8696 @A1: "an unknown or incompletely enrolled participant refuses birth". So v9 is a whole successor, not a v8 add-on (V1 §6, "Rejected alternative").

## 2. What v9 carries forward from v8

All from V1 §1, §2 and §6, computed there at `@A1`. Method IDs stay; only the profile field and the reached `$id`s change.

| Part | v8 (A1) | v9 (prop.) |
|---|---|---|
| Descriptor | `workflow_combined_source_contracts/installed-profile.json`, 189 members, digest `7b22c1f4…` (reviewed value) | New descriptor. `predecessor_native_profile` = v8 at its **landed** digest. `bound_certified_profiles` gains v8 and `producer_source.v3`. |
| Native methods | 18 (`native-v8/methods.json`) | same 18 IDs, profile `…all_writers.v9` |
| D01 and related | 63 (`native-v8/fresh-profile-methods.json`) | same 63, plus the two writers' D01 hookups (§3) |
| Combined guard | 5 (`new-original-methods.json`), SP-322's 4 families | same 5 IDs; guard schema re-issued (its `Enrollment.profile_id` const names v8) |
| Coordinator | 12 methods; `coordinator.v2`, `identity.v2`, `append-phase.v2` | schemas byte-exact (they reach no v8 const); 12 method entries re-issued |
| Certified producer | `producer_source.v3`, 14 methods | **`producer_source.v4` required**: `producer/installed-profile.json` @A1 line 106 has `"native_profile": "pm.executor.workflow_source.all_writers.v8"` inside its preimage |
| Replan | 27 `owner.workflow.replan.*.v1` methods, 30 families (SP-321) | same 27 IDs; the three Replan roots re-issued. **Carried as is only if the v8 Replan-release question is settled that way (§6.3).** |
| Outcome writers (failed result, block episode, retry, repair) | **none**: `native-v8/protocol.md` 129, 163 ("no prior attempt, empty retries"), 165 (`blocked_state_ref` null, set by no method), 169 @A1; no such method ID in any A1 `methods.json` | **none**, unless B-1 option 2 or 3 adds them (a scope change shown on card B-1). Without them W-B's proof must come from an owner record outside the roster (TB-25) |
| Stop route (EP-127) | limited revocation; `revoke_run_execution.v1`, `read_run_execution_revocation.v1` | carried unchanged in meaning; its 7 source obligations stay NOT_RUN |
| Cancelled (D06) | grammar carried, issuer `record_cancellation.v1` unbound | same. Q-12 wording repeated. No revocation or stop value validates as a D06 `StopSource`, `SchedulerStop` or `RunOperationResult(operation=cancel)`. |
| Occurrences | 323 in `complete-method-occurrences.json`, each requiring `RunRevocationCurrent` | all 323 re-issued, plus the new writers' occurrences |
| Schemas | 19 placed | 14 re-issued (they reach a v8 const); 5 byte-exact (coordinator v2 ×3, standard certification-argument v5, event-prerequisite v5), to be confirmed by the C04 resolution check |
| Stored-profile routes | 11 (`native-v8/stored-profile-routes.json`); `workflow_birth` and `lineage_origin` headers bumped v8→v9 | 11 re-issued for v9; the same two headers bump again (v9→v10), by analogy; `workflow_update` probably bumps too under Pattern A (V1 §4) |

Nothing in canon's v6, v7 or v8 directories changes. A1 EP-125 (`Executor_Protocol.md` 8738-8739 @A1): "Workflows born under all_writers.v6 or v7, and their editions, keep their closed scope"; v9 says the same of v8.

## 3. What v9 adds

**3.1 The two writers (from the A3 source contracts; names prop.).**
- W-C stop publisher: `owner.workflow.run_stop.publish_stopped.v1`, Storage participant, three readers, recovery. D01 rule `original_run_stop`, origin kind `run_stop_original`. Meaning fixed by C-2 option 1 and C-3 option 1 (see the addendum).
- W-B blocked publisher: `owner.workflow.run_block.publish_blocked.v1`, same shape. D01 rule and origin kind: `original_run_block` / `run_block_original`, the pair the design chose (design P-08, matching the stop pair's verb stem). V1 §5.2's `original_run_blocked` / `run_blocked_original` is aligned before the build. Q-V9-10 is closed with that choice (CR-14).
- **What W-B can prove on a v9 birth (CR-01).** Only a first attempt with a failing verifier result, or a failed final check if TB-12 creates a record, that no v9 writer can record (design §2.3a). Whether that attempt counts as running for the quiet census is TB-26; if it does, neither W-B nor W-C can ever complete on that run.
- v9 installs these writers; their source contracts are A3's (landing 1 of each). v9 does not author their semantics.

**3.2 The D01 successor (prop., Pattern A, V1 §3 and §5.3).** `workflow-original-start.v8` (new `$id`), with 13 rules, 6 origin kinds, two new `PublicationOwnerSource` branches, `writer_contract` const `…all_writers.v9`, and `RequiredOtherWorkflowWriterSource` still `const false`. Pattern B (a sibling observer per writer, as Replan did) is the alternative. The Executor owner chooses (V1-Q3).

**3.3 New custody and receipt families.** They are registered by the A3 landing 1s, not by v9:
- stop: 4 (`executor_workflow_run_stop_intent`, `_control`, `_result`, `_origin`);
- blocked: 4 of the same shape, plus a block-receipt family if TB-05 needs one. GRS 3732 @main: "Block receipt must exist before append." No GoalRun block receipt family exists today (B1 §10 item 3).
- Pattern B would add 2 more families per writer.

**3.4 Stored-profile routes for v9 births (no rows under the v8 pattern).** Whether A1's 34 families get v9 routes or new rows is the Storage owner's call (V1-Q5).

**3.5 New package checks** (V1 §10): D01 rule and origin completeness for the two writers; byte-exact carry of the five unchanged schemas; a v8→v9 inverse (v9 against canon v8); re-running C05 (the two Stop checks, 751 and 1,252 checks at A1) under the v9 names.

## 4. The package and the canon compile

### 4.1 Package (packages repo, private; never copied into canon except the placed files)

- **Home (prop.):** `replan-v8/goal-all-writers-v9-canonical-draft-<date>/v1` in `sittingmongoose/PuppetMaster-Packages`, beside A1's `goal-replan-v8-canonical-draft-20260925/v1`.
- **Source:** canon at the landing base, with A1, the A2 v6 landing and both A3 landing 1s on `main`. There is no external source to re-adjudicate, relocate or repair.
- **Stages** (A1 tooling reuse per V1 §10):
  1. `select.py`: pick the v8 closure and the two A3 source-contract directories from canon.
  2. `rename.py` + a v8→v9 successor map: `$id` bumps and profile-field changes.
  3. `repair.py`: JSON-pointer patches for the D01 enum, origin, cause and owner-source branches, and the three profile consts.
  4. `author.py` (retargeted): the v9 descriptor and digest, `producer_source.v4` descriptor and digest, `composition.json`, `whole-successor-lineage.json`, `physical-header-decisions.json`, the rename map, routes and citations.
  5. `bind.py`: regenerate `resource-realms.json`, `method-root-bindings.json`, `original-reference-routing.json`.
  6. `inverse.py`: v9 against canon v8.
  7. `manifest.py`, `rebase_check.py`, `run_all.py` (C01 to C11 plus the new checks).
- **Placed files (prop. directories, owner and author choice, Q-V9-07):** `Plans/workflow_combined_source_contracts/v9/` (descriptor, digest, composition, method maps, occurrences, guard and Replan roots), `Plans/workflow_standard_source_contracts/native-v9/` (native roots, D01 successor, routes), and `Plans/goal_certified_producer_source_contracts/v4/` (producer descriptor). v8 files are never overwritten: `installed-profile.json` at the combined root must stay v8's.
- **Package review:** one independent review, cycle cap two, reviewer at xhigh effort. Then root acceptance and Jared's packages-repo merge. A1's package review needed both cycles (cycle 1: 3 blocking, 20 should_fix, 15 notes; cycle 2: 1 should_fix, 4 notes; `STATUS.md` @A1). Expect fewer findings on the mechanical carry and most findings on the D01 successor and the writers' fit with the combined slot and the Stop route.

### 4.2 Canon compile (a `plans/` branch; the cloud thread pushes, a local session lands)

- **Task 1, prose only.** About 8 owner units (prop.; numbers at landing), mirroring A1's 13-unit split:

  | Doc | Unit (prop.) | Content | A1 counterpart |
  |---|---|---|---|
  | EP | v9 installation | birth rule, closed roster (carried + W-C + W-B), D01 rules and origin kinds, no late enrollment, older profiles keep their scope | EP-125 |
  | EP | v9 carried Replan and Stop route | EP-126/127 statements under v9 names; D06 unbound wording; how W-C relates to the limited revocation | EP-126, EP-127 |
  | GRS | v9 source scope | started, cancelled (dormant), certified and Replan under v9; stopped and blocked writers installed, but their v3 Events stay unavailable until their registry rows move (A3 landing 2), by analogy to GRS-087's replanned statement | GRS-086, GRS-087, GRS-089 |
  | GRS | producer v4 | certified producer component successor | GRS-088 |
  | CV | v9 digest binding | codec CV-352 applied to the v9 and producer v4 descriptors | CV-354 |
  | SP | v9 storage | routes or rows (V1-Q5); header bumps; census delta | SP-321, SP-322 |
  | ATS | v9 acceptance | whole-value positive and negative facets for birth, roster refusal and the D01 successor | ATS-059, ATS-060 |
  | BRS | v9 backup | only if v9 adds rows | BRS-031 |

  Then `pm-shard-plans.py --generate --config Plans/sharding_config.json`, `pm-plan-index.py generate`, `--check`. Stop if shards of unedited documents change.
- **Task 2, companions.** Copy the placed files byte-identical from the frozen package manifest. Registry rows if any. The eight census re-pins (§5). The index section.
- **This is not a ledger compile,** so the ledger compile witness does not apply (as the A3 design §9 says for its own landings).
- **Canon review:** one blind form-driven review, cycle cap two, reviewer at xhigh. Leftovers become written open questions. A1's canon review: cycle 1 8 should_fix and 5 notes, cycle 2 4 notes (`STATUS.md` @A1).
- **Landing:** a local session under the landing lock; `pm-landing-check.py --base origin/main` on a full tree. Expected: governance staleness for the edited owner docs and registries, sent as a reseal request. v9 changes no Event row, so no Q-02 card (V1 §7, following A1's precedent).

## 5. Storage rows and census re-pins

- **Rows v9 itself adds:** none under the routes pattern; more under the rows pattern (V1-Q5). The custody families of the two writers come from the A3 landing 1s (§3.3).
- **Census base at the v9 landing (prop., to re-derive, rule R2):** 328 after A1 (`STATUS.md` @A1: "the registry at `45e383b2…` (328 families)"); +2 after A2's v6 (R2 §4.6), plus any v8-certified Storage revision A2 carries (O-R2-07); +4 after A3-stopped landing 1; +4 or +5 after A3-blocked landing 1. So about 338 to 339 before v9, and 340 to 341 after the v7 projection successor. Materialized and later-GUI counts move with them.
- **The eight re-pin sites** (A1's `data/census-after.json`, A3 design §6.3 row S): `scripts/pm-implementation-readiness.py` (family count, materialized, later-GUI, comment block); `tests/test_pm_assistant_contract_closure.py` (one assert); `tests/test_pm_onboarding_phases.py` (two asserts); `tests/test_shared_runtime_storage_contracts.py` (count and status); the `Plans/storage-plan.md` census pin sentence. Every landing that adds rows moves them again. Historical statements (SP-316 "285", certified composition `storage_final_families: 294`) stay as written.

## 6. What v9 depends on

### 6.1 The blocked trigger decision (B-1), the main gate

- Q-09 (@PA `process-answers-20260925.md` 17) makes the trigger Jared's decision when canon does not define it, and B1 and B2 found that it does not.
- W-B's arguments (the trigger proof, the reason subset, the action set) depend on B-1. So A3-blocked landing 1 cannot be written, and v9 cannot pin it, until B-1 is answered. B-2 and B-3 shape the same contract. B-1 option 2 or 3 also changes v9's own scope (new native writers).
- Owner questions that must also be settled before W-B prose: TB-01 (issuer), TB-02 and TB-25 (authoritative trigger proof), TB-26 (is a run with an unrecorded failed attempt quiet), TB-05 (block receipt family and order), TB-12 (non-pass Standard decision record) (B2 §8; design §10.2).
- **If B-1 is late: a tension, not a recommendation (CR-05).** Two rulings point different ways:
  - C-4 (cards file line 117): "one v9 carries both the stop and the blocked writers once blocked's trigger is decided". That favours waiting.
  - Q-09 (@PA `process-answers-20260925.md` 17): "land `goal_run.stopped` first so the blocked card does not hold up the other work". Waiting makes the live stop writer and stopped's landing 2 wait on the blocked card, which Q-09 says not to do.
  - The options are: (1) **wait**; the carry-forward part of the package can be built and checked meanwhile, and only the freeze waits; (2) **grammar-only W-B in v9, issuer unbound** (the Q-12 pattern, B-3 option 2), which still needs the argument grammar that B-1 decides, so it saves little; (3) **v9 stop-only, blocked in a v10**, which departs from the C-4 answer and costs a second whole profile and a second consumer adoption.
  - Which to take is for Jared or the process thread (Q-V9-02). This plan makes no recommendation between them.
- **Recommendation (prop.):** present cards B-1 to B-3 now, so the tension does not arise. They are cheap, and they are on the critical path.

### 6.2 Other freeze gates

- **A1 landed.** V1 §5.4: v9 pins "whatever digest lands". A1's landing may re-derive `7b22c1f4…` if bound canon members moved (`STATUS.md` @A1, "Landing A1").
- **A3-stopped landing 1 landed.** Its files are v9 members; any later amendment re-freezes v9.
- **Owner rulings:** V1-Q2 / T-01b (single or joint issuer, both writers), V1-Q3 (Pattern A or B), V1-Q4 (is either writer a slot issuer), V1-Q5 (routes or rows), V1-Q6 and T-09 (a revoked held slot and a held certified Event at a stop; see the addendum §T-09).

### 6.3 The v8 Replan release (A2 finding F-1), a gate v1 did not list

- A2's R2 found that the v8 Replan `ReleaseInput` requires `ReplanProjectionAdmission`, whose `original_projection` is `$ref` to the forked consumer's `ReplanProjectResult` (R2 §2.1, citing `workflow-replan-source.v1.schema.json` lines 203-213 and 4406 @A1). A linear chain successor cannot produce that type.
- R2 recommends RR-2 (prop.): "v8 Replan release is never available. Replan completion moves to v9, whose release input is authored against the chain" (R2 §4.4). That goes to Jared as a card (prop. C-5) unless ruled an owner matter.
- **Consequence for v9.** If RR-2 is chosen, v9 cannot carry the Replan source unchanged. Its release input must be re-authored against the chain. That is new authoring in v9, not a mechanical carry.
- **A cycle to break.** The chain member that admits replanned rows comes after v9 and pins the v9 digest. So v9 cannot `$ref` that member's schema. Possible ways out (not decided; Q-V9-03): (a) v9 carries the forked type unchanged (RR-1 again, two projectors). **This breaks rule R1** (stopped design line 298: "There is no second projector for the per-run role"; A2 R2 §4.4: "Two per-run projectors derive replanned rows. Breaks R1.") and DL-080's single mandatory GRS-085 projection, so it needs an explicit exception against DL-080 (CR-07); (b) v9 owns a projection-admission interface schema that the later chain member must produce; (c) Replan release stays unavailable in v9 too, for a later profile. I found no precedent for (b) and do not claim one.

## 7. Consumer adoption v9 births need

- **Nothing reads a v9 birth until a projection successor admits it.** A1 GRS-088 keeps v5 to v7 births; A2's v6 admits v8 births and halts on "Any Event of a birth profile outside §4.3, for example a future all_writers.v9 birth" (R2 §4.5).
- **The successor (prop., one member, A3 landing 2 for both families):**
  - v9 companion banks for started, cancelled (dormant: D06 unbound) and certified, with a `uri_map` to the v9 roots, `…native_v9.v1` current readers, and a descriptor pin on the v9 digest (V1 §7);
  - the stopped branch (A3 design §5 reducer rules, "v8" read as "v9");
  - the blocked branch (B2 §5.7 rules);
  - two Storage rows, `RP-PROJECTION-3GEN@1.0.0`;
  - the `goal_run.stopped` row (`#/families/5`) and the `goal_run.blocked` row (`#/families/0`) moved to 3.0.0.
- **Governance for the two rows.** Q-02: each row revision has its own DL-036 checkpoint card with exact before and after rows and registry SHA-256 before and after. Q-03: a DL-077-form record and a single-family depth assessment per family. Both rows sit inside the protected prefix, so F1 to F4, P1 and R1 re-freeze in the same landing (S5 §7).
- **Certified for v9 births.** Two A2 questions carry over: whether the certified Storage admission for v2-root values needs a separate Storage revision (O-R2-07), and whether the certified Event row's `source_refs` pin on the v1 identity root means a registry change (O-R2-05). v9 keeps coordinator v2 byte-exact, so the same answers apply, plus producer v4 is new. A2 recommends no row change (A2 design §6.1). If the answer is yes, landing 2 changes a third row, `#/families/2` (`goal_run.certified`), and that revision needs its own Q-02 card, Q-03 record and depth file (design §4.2 and §7; CR-10).
- **The descriptor names no consumer.** A consumer pins the profile digest; naming it in the profile would make each digest depend on the other (V1 §7).

## 8. The one projection chain under C-4 option 2

A2 R2 §5 and V1 §7 agree on the shape below. Rules R1 to R4 of the A3 design §5 hold for every row as recommended: linear; numbers taken at landing; DL-080 orders rows, not chain positions; birth scope stated per branch. The RR-1 branch in the v8 row, and §6.3 option (a), would break R1 (a second per-run projector) and DL-080's single mandatory projection; they are kept only as marked exceptions (CR-07).

| Dataset (at landing) | Branch | Adds | Birth scope |
|---|---|---|---|
| `goal_run_projection.v5` | on `@main` (GRS-085, SP-317) | started, cancelled, certified | v7 births (certified); original profile and v7 (started, cancelled) |
| v6 | A2 | v8 started (live), v8 cancelled (dormant), v8 certified (gated) | + v8 births; halts on stopped, blocked, replanned |
| **v7** | **A3 landing 2 (stopped + blocked), with the v9 adoption** | v9 started, cancelled, certified; **stopped branch; blocked branch** | + v9 births; stopped and blocked only for v9 births |
| v8 | A3-replanned | replanned branch | v9 births; v8 births only under RR-3, or under RR-1, which **breaks R1** (two per-run projectors) and needs an explicit exception against DL-080 |

- **Why one member for stopped and blocked.** Both writers exist only for v9 births. A stopped or blocked branch is live only in a member that also admits that profile's started Event (A3 design §5). So a v9-admitting member is needed anyway, and both branches fit in it (V1 §7; R2 §5, "stopped and blocked may share one successor").
- **Fallback if blocked lags** (prop.): v7 = v9 adoption + stopped; v8 = blocked; v9 = replanned. DL-080 still holds: both rows move before replanned's.
- **v6 to v7 halts.** A v8-born stopped or blocked row is forged or foreign (no v8 writer) and halts (R2 §5).
- **Naming.** A chain-neutral stem (for example `goal_run_lifecycle_v7_projection`) avoids confusing dataset v7/v8/v9 with native `all_writers.v7`/`v8`/`v9`. Each owner unit states both numbers in full (R2 §5).

## 9. Order of the remaining branches

DL-080 unit, `Plans/Decision_Log.md` 6657 @main: "Full current Event Authority contracts for goal_run.stopped and goal_run.blocked land before the contract for goal_run.replanned".

| # | Step | Waits for | Can run in parallel with |
|---|---|---|---|
| 0 | Present cards B-1, B-2, B-3 (blocked) and prop. C-5 (v8 Replan release, A2) to Jared; send TB-01/02/05/12, T-01b, V1-Q3 to Q-6 and T-09 to owners | nothing | everything |
| 1 | A0 and process answers land; A1 lands (landing lock; its `rebase_check.py` if `main` moved) | — | 0 |
| 2 | **A2** canon: v6 successor for v8 births | A1 on `main` | 3 |
| 3 | **A3-stopped landing 1**: W-C source contract (EP, GRS, SP, BRS, OP units), v3 schema, 4 custody rows. Event registry unchanged, no Q-02 card | A1 on `main` (its unit numbers follow A1's) | 2, 4a |
| 4 | **A3-blocked landing 1**: W-B source contract, v3 schema, 4 or 5 custody rows | B-1 (and B-2, B-3, TB-01/02/05/12) answered | 2, 3 once unblocked |
| 4a | v9 package: carry-forward build and checks (not frozen) | A1 on `main` | 2, 3, 4 |
| 5 | **v9** package freeze, reviews, merge; canon compile, review, landing | 3 and 4 on `main`; C-5/RR decision; owner rulings | — |
| 6 | **A3 landing 2 (stopped + blocked)**: v7 projection successor with v9 adoption; both rows to 3.0.0, in one landing or two (Q-V9-06, open; fallback two, stopped first); two Q-02 cards, two Q-03 records and depth files (a third set only if Q-V9-09 moves the certified row); re-freezes | 2 and 5 on `main`; Jared answers each Q-02 card before its landing | — |
| 7 | **A3-replanned**: v8 successor, replanned row, Q-02 card and Q-03 record | 6 on `main` | — |

- **DL-080 check.** Stopped and blocked rows move in step 6, replanned's in step 7. This satisfies DL-080 under either reading of "land" (source phase or full adoption; A2 O-R2-02).
- **Critical path:** B-1 answer → step 4 → step 5 → step 6. A2 (step 2) is off the critical path unless it runs late, because step 6 builds on v6.
- **One landing or two: open (CR-04).** The process text leans to one row per landing: PA line 7, "Cards for two families prepared together may be presented in one batch, but each landing is answered on its own line"; PA line 17 (Q-09), "land `goal_run.stopped` first"; DL-078 (`Decision_Log.md` 1571 @63cf2cb), "one family per landing" for admissions. The notes also disagreed on the SHA pair: the design had main → whole landing on both cards; this plan had X → Y and Y → Z, with Y never on `main`. Both points go to the process thread as one question (Q-V9-06). Until it answers, all three notes use the fallback: two sequential landings, stopped's row first, each card with its own before and after SHA taken from `main`.

## 10. Estimate against A1 actuals (all prop., by analogy)

**A1 actuals** (`reports/event-authority-20260911/replan-v8/STATUS.md` @A1, "Cost"): "about 28 agent-hours and about 4.8M output tokens: 41 subagents (16 agent-hours, 4.63M output tokens) … plus about 12 hours of host time". A1 placed 74 files, 34 rows, 13 units and 8 re-pins. Its own plan had estimated "1.5 to 2.5 agent-days, 0.8M to 1.2M tokens", so tokens ran about 4 to 6 times over plan. The figures below scale from A1's actuals, not its plan.

| Part | Agent-hours | Output tokens | Basis |
|---|---|---|---|
| v9 profile: package, 2 package-review cycles, canon compile (~8 units), 2 canon-review cycles, host | 18-30 | 3-5M | 65 to 105% of A1. Cheaper: no external source to re-adjudicate, relocate or repair. Dearer: D01 successor authoring, possible Replan release re-authoring (§6.3), xhigh reviewers. V1 §9 gave 15-25 h and 2.0-3.5M before the Replan finding and the effort ruling. |
| A3-stopped landing 1 | 8-12 | 1.0-1.8M | 5 units, one companion directory, 4 rows, one review cycle pair |
| A3-blocked landing 1 | 10-16 | 1.2-2.2M | as stopped, plus block receipt, trigger proof and reason mapping |
| A3 landing 2 (v7 successor with v9 adoption, two rows, two cards, two Q-03 records and depth files, re-freezes) | 14-22 | 2.0-3.5M | a consumer directory like certified's, two branches, heavy governance |
| **Total to live stopped and blocked Events on v9 births** | **50-80** | **7-12M** | excludes A2 and A3-replanned |
| If B-1 is option 2: native outcome writers in v9 (record a failed check, and a failed final decision if TB-12) | +12-24 | +1.5-3M | by analogy to one A3 landing 1 per writer, inside the v9 package and compile; also a later v9 freeze (CR-01) |

These are rough. A2 has no actuals yet, the blocked trigger's scope is unknown (B-1 option 2 or 3 adds v9 writers), and the C-5 answer can add a Replan re-authoring task.

## 11. What this plan does not do

It writes no canon and presents no card. It does not choose W-B's trigger, the D01 pattern, routes versus rows, or the Replan release option. It does not reseal governance.

## 12. Open questions (recorded, not answered)

| ID | Question | For |
|---|---|---|
| Q-V9-01 | B-1, B-2, B-3 (B2 §7). Gates A3-blocked landing 1 and the v9 freeze. | Jared |
| Q-V9-02 | If B-1 is late: wait (C-4), grammar-only W-B, or v9 stop-only plus v10 blocked (Q-09)? A tension between C-4 and Q-09, with no recommendation here (§6.1, CR-05). | Jared, process thread |
| Q-V9-03 | v8 Replan release RR-1/RR-2/RR-3 (A2 O-R2-03, prop. card C-5). Under RR-2, how does v9's release input reference a chain type that comes after v9 (§6.3 a/b/c)? | Jared, Executor, A2 |
| Q-V9-04 | T-01b: single Executor issuer or joint issuer, for both writers (V1-Q2, TB-01). | Executor, Orchestrator |
| Q-V9-05 | V1-Q3 (Pattern A or B), V1-Q4 (slot issuer), V1-Q5 (routes or rows; which headers bump). | Executor, Storage |
| Q-V9-06 (= design P-01) | One question for the process thread: may the stopped and blocked rows move in one joint landing, and if so which registry SHA pair does each card show (main → whole landing on both, or X → Y and Y → Z with Y never on `main`)? Cite PA line 7, PA line 17 and DL-078. Fallback until answered: two sequential landings, stopped first (§9, CR-04). | process thread |
| Q-V9-07 | Placed-file directories for v9 and producer v4 (§4.1). | author, Executor |
| Q-V9-08 | Do the A3 landing 1s land before v9 (recommended here, so v9 pins stable bytes), or inside the v9 package with one review round (V1-Q8)? All three notes now assume "before v9" and share one census order (CR-03); the coordinator confirms. | coordinator |
| Q-V9-09 | Does A2's v8-certified Storage admission cover v9 certified values under producer v4, or is a second revision needed (O-R2-05, O-R2-07)? | Storage, A2 |
| Q-V9-10 | **Closed (CR-14):** `original_run_block` / `run_block_original`, the design's choice (P-08). V1 is aligned before the build. | author |
| Q-V9-11 | Is A2's v6 still worth landing on its own, given v7 must follow for v9? Folding v8 adoption into v7 saves one member but delays A2. | A2, coordinator |
| Q-V9-12 | TB-25 and TB-26 (design §10.2): is the verifier's failing result an authoritative trigger proof on v9 births, and is a run whose failed attempt stays `verify_pending` quiet? If either is "no", W-B cannot write on v9 births unless B-1 option 2 adds native outcome writers to v9 (CR-01). TB-26 also decides whether a C-3 stop can ever complete on such a run. | Executor, Verifier owner, Goal Runtime |

## Critique disposition

Critique: `critique.json` in this directory (verdict `not_ready`). One row per finding that names this file.

| Finding | Severity | Disposition | Where |
|---|---|---|---|
| CR-01 | blocking | **Applied.** §0 item 1 and the §2 table now say that the carried v8 roster has no retry, repair, failure-result or step-block writer (`native-v8/protocol.md` 129, 163, 165, 169 @A1), so W-B's v9 trigger rests on an owner record outside the roster (B-1 option 1, TB-25 and TB-26) or on native outcome writers added to v9 (B-1 option 2, a stated scope change). §3.1 says what W-B can prove on a v9 birth. New Q-V9-12; §10 adds the option-2 cost | §0, §2, §3.1, §6.1, §10, §12 |
| CR-03 | should_fix | **Applied.** The design and the addendum now use this plan's order (A3 landing 1s before v9) and one census table; Q-V9-08 records that and stays for the coordinator | §0 item 2, §12 |
| CR-04 | should_fix | **Applied.** "Two rows in one landing" is now an open process question with the SHA-pair disagreement stated and PA lines 7 and 17 and DL-078 cited; fallback two sequential landings, stopped first | §0 item 5, §9, §12 Q-V9-06 |
| CR-05 | should_fix | **Applied.** §6.1 cites Q-09 and presents wait versus v9 stop-only plus v10 as a C-4 / Q-09 tension with no recommendation; the only recommendation is to present B-1 now | §0 item 4, §6.1, §12 Q-V9-02 |
| CR-07 | should_fix | **Applied.** §6.3 option (a) and the RR-1 branch of the §8 v8 row are marked as breaking R1 and DL-080's single mandatory projection, needing an explicit exception | §6.3, §8 |
| CR-10 | should_fix | **Applied.** §7 says that a "yes" to O-R2-05 / Q-V9-09 makes landing 2 change `#/families/2` with its own Q-02 card | §0 item 5, §7, §9 step 6 |
| CR-14 | note | **Applied.** Q-V9-10 closed with the design's names | §3.1, §12 |
| CR-16 | note | **No change needed.** Verified clean | — |
