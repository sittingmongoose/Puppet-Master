# V1 — What an `all_writers.v9` profile must contain, and how to build it

Label: V1-v9-profile. Read-only research note, 2026-09-25.

**Refs read.**
- `origin/main` = `63cf2cb97f936c91dd7bb5c585d9a35d8409ed61`.
- A1 = `origin/plans/replan-v8-a1-20260925` at `e8d61ace4` (reviewed, not landed).
- The A1 canonical-draft package, read-only: `/home/user/pmpkg-push/replan-v8/goal-replan-v8-canonical-draft-20260925/v1/`.
- Scratch design notes: A1 design, A3-stopped design, cards C-2 to C-4, A2 note R1, sibling note B1.

**Conventions.** Line numbers are 1-based lines of the file at the named ref. "prop." marks a proposal. "By analogy" marks a step from one precedent to another case. Open questions are listed in §11 and are not answered here.

---

## 0. Short answer

- **v9 is a whole new fresh-birth profile, not an add-on to v8.** Three v8 schemas hard-code the v8 profile name, and 14 of the 19 placed v8 schemas reach one of them. So v9 re-issues almost the whole v8 schema closure under new `$id`s, exactly as v8 did to v7.
- **v9 adds two writers:** the stop publisher (W-C) and a blocked publisher. Each needs a D01 transition rule, a D01 origin kind and compact custody families. The blocked writer cannot be frozen until the blocked trigger (Q-09's "B01") is decided.
- **v9 carries forward** v8's started, cancelled (D06 grammar carried, issuer still unbound), certified and Replan routes, and the limited Stop revocation route of EP-127. Method IDs stay the same; only the profile field and the reached `$id`s change.
- **The certified producer component must also move** to `producer_source.v4`, because the v3 descriptor names `all_writers.v8` inside its own digest preimage.
- **Consumer adoption** needs one more `goal_run_projection` successor after A2's, admitting v9 births for started, cancelled and certified, and carrying the new stopped and blocked branches.
- **Estimate (prop., by analogy with A1):** the v9 profile alone is about 15 to 25 agent-hours and 2.0 to 3.5M output tokens. The whole route to live stopped and blocked Events on v9 births is about 45 to 75 agent-hours and 5 to 9M output tokens. Most of A1's build and check scripts can be reused.

---

## 1. The v8 installed-profile descriptor

File: `Plans/workflow_combined_source_contracts/installed-profile.json` @A1. Digest file: `installed-profile-digest.txt` @A1, value `7b22c1f471761caffd37319dd0ae4f5da07c5f3e6f5ac83828d07308df5aaf8b`.

**Codec (CV-352).** `Plans/Contracts_V0.md` 23426 @main: "Profile digests are SHA-256 of the entire sorted-key compact UTF-8 JSON preimage without prefix or trailing LF." The descriptor states the same codec in `digest_codec` (line 25): `SHA256_SORTED_KEY_COMPACT_UTF8_NO_PREFIX_NO_LF`. EP-125 (A1 `Executor_Protocol.md` 8696) names it: "the digest in installed-profile-digest.txt, the SHA-256 of the entire sorted-key compact UTF-8 JSON serialization of the descriptor without prefix or trailing LF, the codec CV-352 states".

**Top-level fields** (all inside the digest preimage):

| Field | v8 value (A1 line) |
|---|---|
| `profile` | `pm.executor.workflow_source.all_writers.v8` (1002) |
| `status` | `CANONICAL_COMPLETE_SOURCE_PROFILE_NOT_INSTALLED` (1004) |
| `predecessor_native_profile` | `…all_writers.v7` (988), with its descriptor path, sha256 and digest `0055de6c…` |
| `producer_source_profile` | `pm.goal_run_certified.producer_source.v3` (995), with descriptor `producer/installed-profile.json` and digest `1157877714ff…` |
| `bound_certified_profiles` | v7 (`0055de6c…`) and `producer_source.v2` (`599315856…`) (3-22) |
| `members` | 189 files, each with path, sha256 and bytes |
| `birth_rule` | line 2: "Actual native WorkflowBirth.writer_contract is exactly all_writers.v8 … Birth only: no existing Workflow birth is enrolled, cast or re-read as v8." |
| `registry_selection` | line 1003: "Storage: 34 families at /families/294-/families/327 under SP-321 (30 Replan) and SP-322 (4 combined guard) … Event registry: no row" |
| `consumer` | line 24: "None admitted. … are A2's." |
| `digest_exclusions` | the digest file, `composition.json`, the package manifest and check outputs, runtime values (26-31) |
| `external_lineage` | five `external-source-evidence:sha256:` tokens (32-38) |
| `native`, `instances` | `NOT_RUN` |

**Members, by directory** (189): `workflow_combined_source_contracts` 57, `workflow_standard_source_contracts` 39, `executor_cancellation_contracts` 31, `goal_certified_producer_source_contracts` 18, `workflow_activation_contracts` 16, top-level `Plans/*.schema.json` 14, `goal_certified_event_coordinator_contracts` 12, one started and one cancelled consumer file. The package status gives the split as 71 placed and 118 canon (`PACKAGE-STATUS.md` §1).

**The writer roster.** No field is named "roster". The closed roster is the set of method entries the descriptor binds:
- `native-v8/methods.json`: 18 native methods. EP-125 (A1 EP 8730): it "keeps the eighteen native-v7 method IDs".
- `native-v8/fresh-profile-methods.json`: the D01, Start, SafeStop, positive-cancel and FileSafe/Process sections. It has 63 method entries, the same 63 names as native-v7 (checked).
- `new-original-methods.json`: 5 (`combined.read_guard.v1`, `combined.birth.v1`, `combined.claim.v1`, `revoke_run_execution.v1`, `read_run_execution_revocation.v1`).
- `coordinator/methods.json` 12, `producer/methods.json` 14, `replan/methods.json` 27.
- `complete-method-occurrences.json`: 323 occurrences. `slot-transition-contracts.json`: the 17 slot issuers. `stop-native-participants.json`: 6 participants.
- Anything not listed is refused. `Plans/Executor_Protocol.md` 7523 @main: "All unlisted Workflow writers remain refused by `RequiredOtherWorkflowWriterSource=false`". In the D01 schema this is a `const false` (`native-v8/schemas/workflow-original-start.v7.schema.json`, `$defs/RequiredOtherWorkflowWriterSource`).
- A late addition is excluded. EP-125 (A1 EP 8696): "an unknown or incompletely enrolled participant refuses birth", and 8700: "there is no late or old-birth enrollment and no caller-selected profile or phase".

**The profile name is inside the schemas.** Three placed schemas carry `"const": "pm.executor.workflow_source.all_writers.v8"` @A1:
- `native-v8/schemas/workflow-original-start.v7.schema.json` 448 (`WorkflowBirth.writer_contract`);
- `schemas/workflow-combined-guard.v1.schema.json` 70 (`Enrollment.profile_id`);
- `replan/schemas/workflow-replan-source.v1.schema.json` 78.

The method maps also carry the profile per entry: `all_writers.v8` occurs 405 times in `complete-method-occurrences.json`, 118 in `fresh-profile-methods.json`, 37 in `native-v8/methods.json`, 28 in `replan/methods.json`, 15 in `producer/methods.json` and 13 in `coordinator/methods.json`.

---

## 2. How v8 succeeded v7

**Byte-exact carry.**
- 31 of the v7 descriptor's 42 members are v8 members at the same sha256; 0 changed (computed from both descriptors @A1). The 11 not carried are coordinator-internal companions, for example `correction-evidence.json`, `participant-method-tuples.json`, `native-v7/stored-profile-routes.json` and `goal_certified_original_scope_dispatch.json`. They are replaced by v8 companions.
- The v7 descriptor and its digest are themselves v8 members and `bound_certified_profiles`.
- Four byte-equal native-v7 maps are not copied. They are referenced at their `native-v7/` paths through the alias table in `composition.json` (A1 design §2.2 A).
- The native method IDs are kept (18 native, 63 D01 and related). Only the `profile` field of each entry changes.
- Nothing in canon's v7 directories changes. EP-125 (A1 EP 8738-8739): "Workflows born under all_writers.v6 or v7, and their editions, keep their closed scope".

**Whole successors (new `$id`, new bytes).** `whole-successor-lineage.json` @A1 lists 16 rows:
- 9 native schemas: start-arguments v6→v7, cancel-positive-arguments v2→v3, start-custody v6→v7, original-start v6→v7, standard-certification-argument v4→v5, standard-event-prerequisite v4→v5, cancel-start-profile v6→v7, standard-current-source v4→v5, safestop-start-arguments v2→v3;
- 3 coordinator schemas v1→v2 and `native-worknode-current-activation.v1` → `native-worknode-combined-current.v1`;
- 3 Replan roots placed from external sources.

**Stored headers.** `native-v8/stored-profile-routes.json` @A1 has 11 routes keyed by `installed_native_profile`. They add no registry row; its `rule` says "Original registry rows below remain byte-equivalent lineage, not edited/admitted routes." Two headers were bumped, with reasons in `physical-header-decisions.json` @A1:
- `executor_workflow_workflow_birth` v8→v9: "writer_contract const now combined v8; old header cannot describe this new body grammar." (line 8)
- `executor_workflow_lineage_origin` v8→v9: "Method-specific birth afterimage selector now references genuine new v9 birth."
- The other 9 (update, head, Start, D06 and Standard families) keep their headers.

**Renamed.** Only A1-owned identifiers with a draft marker (A1 design §1.3). `rename-map.json` @A1 has 124 rows: 27 `draft.replan.*` methods to `owner.workflow.replan.*.v1`, 31 draft families, 3 draft `$id`s, and stored headers and constants. Versions reset to `.v1`. Profile IDs were kept as authored.

**New in v8.**
- The combined guard, slot journal and Enrollment (4 families, SP-322).
- The Replan source (27 methods, 30 families, SP-321).
- The limited Stop revocation route (EP-127) with its two new Executor methods.
- The producer component v3.
- `replan/all-writer-adoption.json` @A1 states the rule that forced a new profile: `"status": "NEW_PREBIRTH_PROFILE_REQUIRED"` (line 2) and `"old_profiles_unchanged": true` (line 9).

---

## 3. The D01 `update_workflow` schema successor pattern

**What the D01 schema holds per writer.** In `workflow-original-start.v7` @A1, each admitted writer appears in five places:
1. a `BoundTransitionRule` enum value;
2. a `cause` mapping in `OriginalWorkflowUpdate.allOf` (for example `d06_cancel_nonterminal` → `owner_status`, `original_standard_certification` → `completion_certification`);
3. an `original_writer_method` const in `TransitionCommitment.allOf`, where one is fixed;
4. an `OriginalWriterOrigin` kind, whose `value` is a `$ref` to the writer's own stored origin;
5. a `PublicationOwnerSource` branch.

**History of the enum** (computed from the canon schemas @A1):

| D01 schema | Profile const | Rules | Origin kinds |
|---|---|---|---|
| `executor_cancellation_contracts/…original-start.v2` | v3 | 8 (5 activation, 2 d06, `original_workflow_start`) | `activation_original`, `d06_original`, `original_workflow_start` |
| `…predecessor/v1/…original-start.v3` | v4 | 11: adds `original_execution_progress`, `original_provisional_success`, `original_standard_certification` | adds `standard_original` |
| `.v4`, `.v5`, `native-v7/.v6`, `native-v8/.v7` | v5, v6, v7, v8 | 11, unchanged | 4, unchanged |

So there are two precedents for admitting a new writer at D01:
- **Pattern A, in-schema (the Standard writer, original-start v2→v3).** Add the rule, cause, writer const, origin kind and owner-source branch to the D01 schema successor.
- **Pattern B, sibling observer (Replan in v8).** `replan/schemas/executor-workflow-replan-observer.v1` @A1 keeps the D01 core unchanged and adds its own record `ReplanWorkflowUpdate` (`cause` const `owner_status`), `ReplanTransitionCommitment` (`rule` const `original_replan`, writer `owner.workflow.replan.apply_native.v1`) and `ReplanWriterOrigin` (kind `original_replan`). It has its own families `executor_workflow_replan_update` (row #294) and `executor_workflow_replan_observer_origin` (row #323), its own observer method `owner.workflow.replan.observe.v1`, and a Replan-aware current reader (`ReplanAwareCurrentSource`).

**For v9 (prop.).** Pattern A fits stop and blocked better. Both are plain owner-status transitions, like `d06_cancel_nonterminal`, with no pending inventory observation. The D01 schema must be re-issued anyway, because of the `writer_contract` const (§1). Pattern A therefore costs little extra. Pattern B would add 2 families and a new current reader per writer. The Executor owner decides (§11, V1-Q3).

---

## 4. Storage rows and census re-pins a profile successor adds

**A1 actuals.**
- 34 rows, `/families/294`-`/families/327`: SP-321 has 30 and SP-322 has 4.
- Census: 294 → 328 families; 274 → 308 materialized; 251 → 285 later-GUI. Policies stay 27.
- Eight landing re-pins (`data/census-after.json` in the package):
  - `scripts/pm-implementation-readiness.py`: the family count, the materialized and later-GUI counts, and the comment block;
  - `tests/test_pm_assistant_contract_closure.py` (one assert);
  - `tests/test_pm_onboarding_phases.py` (two asserts);
  - `tests/test_shared_runtime_storage_contracts.py` (count and status);
  - the `storage-plan.md` census pin sentence.
- Historical records stay as written, for example SP-316's "All 285 previous Storage rows remain unchanged".
- Native header bumps are routes, not rows (§2).

**What v9 adds (prop.; counts to be re-derived at landing, per A3 design §5 rule R2):**
- Stop custody: 4 families (`executor_workflow_run_stop_intent`, `_control`, `_result`, `_origin`), `RP-AUTHORITY-INDEFINITE@1.0.0`, mandatory backup (A3-stopped design §2.3).
- Blocked custody: by analogy 4 families, plus perhaps 1 block-receipt family. `block_receipt_ref` has no receipt family today (B1 §7: "No receipt family for GoalRun blocks exists").
- Under Pattern B only: 2 more families per writer.
- v9 stored-profile routes (no rows). The 11 native routes are re-issued for v9, with `executor_workflow_workflow_birth` and `executor_workflow_lineage_origin` bumped again (v9→v10), by analogy with the reasons above. Under Pattern A, `executor_workflow_workflow_update` probably bumps too, because its body gains new rule values; A1 kept that header only because the body grammar did not change.
- A1's own 34 families: their record schemas reach the re-issued roots. `workflow_combined_enrollment` holds the profile const. The registry rows point at `.v1` `$id`s. Whether v9 uses routes or new rows for them is a Storage-owner question (V1-Q5).
- The same eight re-pin sites move again.

---

## 5. What v9 adds

### 5.1 The stop publisher (W-C)

All names are prop., from the A3-stopped design §2.3:
- Native issuer `owner.workflow.run_stop.publish_stopped.v1`; Storage participant `owner.storage.workflow_stop.commit_original.v1`; readers `…read_current.v1`, `…read_retained.v1`, `…inspect_original.v1`; recovery `…recover.v1`.
- D01: rule `original_run_stop`, `cause=owner_status`, origin kind `run_stop_original` (A3-stopped design line 110).
- Custody: the four families of §4.
- Meaning, set by the answered cards: Pause and Abort Run both record `goal_run.stopped` with reason `user_stopped` and latch the Goal Stop (C-2 option 1). New work is blocked at once, running steps finish under their own owners, and the stop is recorded when the run is quiet; the command reports pending until then (C-3 option 1).
- Inputs are D06-free (Q-12): the current D01 source, the latched Goal Stop, a quiescence proof, and, for held slots, `RunRevocationCurrent` through `read_run_execution_revocation.v1`.
- Interaction with v8's route (prop.). The EP-127 limited revocation stays the immediate fence for held Replan or certified slots, and W-C is the later, separate "recorded stopped" step. v9 must state whether a revoked held slot counts as quiet (V1-Q6), and whether W-C is a slot issuer. SP-322's 17-issuer enumeration then either grows or stays (prop.: W-C does not write the slot).

### 5.2 The blocked publisher

- Names, all prop., by analogy with W-C: `owner.workflow.run_block.publish_blocked.v1`, a Storage participant, readers and recovery. D01 rule `original_run_blocked`, `cause=owner_status`, origin kind `run_blocked_original`.
- Custody: `executor_workflow_run_block_intent`, `_control`, `_result` and `_origin`, plus a block-receipt family if the owner decides one is needed.
- Legal sources come from D-R16. `Plans/Goal_Runtime_System.md` 3733 @main (quoted in B1): "`ready|running|provisional_success|verifying|failed_verification|repairing -> blocked`; `blocked -> blocked` requires new evidence/action/recovery revision."
- **Gate.** The trigger is open. Q-09 wording: "the condition that puts a run into blocked, which remains an owner decision". The writer's arguments depend on the trigger. So v9 cannot freeze the blocked grammar before that card is answered (V1-Q1).

### 5.3 The D01 successor itself (prop., Pattern A)

- `workflow-original-start.v8` (new `$id`): 13 rules, 6 origin kinds, 2 new `PublicationOwnerSource` branches, `writer_contract` const `…all_writers.v9`.
- `RequiredOtherWorkflowWriterSource` stays `const false`.
- EP 7523 still holds: "D01 never becomes the issuer of the underlying native effect."

### 5.4 The descriptor

- `profile` `…all_writers.v9`.
- `predecessor_native_profile` v8, with the landed digest of the v8 descriptor. `7b22c1f4…` is the reviewed value. A1 STATUS says a landing rebase re-derives it if bound canon members moved, so v9 pins whatever digest lands.
- `producer_source_profile` `…producer_source.v4` (§6).
- `bound_certified_profiles` extended with v8 and producer v3.
- Members: the carried and re-issued files, plus the stop and blocked source contract files.
- `registry_selection`: the new custody rows; "Event registry: no row".
- `consumer`: none admitted (same form as v8).

---

## 6. What v9 carries forward from v8

**Schema closure** (computed @A1 over the 19 placed schemas, following every `$ref` inside the placed set):
- **Must be re-issued (14).** These reach the v8 const: 7 of the 9 native-v8 roots (all but the two below, and including `workflow-original-start.v7`), the combined guard, the Stop root v2, the generation source, `native-worknode-combined-current.v1`, and the three Replan roots.
- **Can stay byte-exact (5).** Coordinator `coordinator.v2`, `identity.v2` and `append-phase.v2` reference only themselves. `workflow-standard-certification-argument.v5` and `workflow-standard-event-prerequisite.v5` reach no changed root. This is a proposal, to be confirmed by the C04 resolution check.

**Routes carried (prop.).**
- **Started:** `owner.workflow.activation.commit_start.v2` and its Start custody, re-issued.
- **Cancelled:** the D06 argument grammar is carried in the successor of `workflow-cancel-positive-arguments.v3`. **D06 stays an unbound dependency.** Q-12 says no contract may depend on it. C-2 option 3 and C-3 option 3 were rejected as needing D06. The EP-117 row still reads "Complete dependency contract only" (`Executor_Protocol.md` 7440 @main). v9 repeats EP-127's statements (A1 EP 8978-8982): the grammar is carried, `owner.executor.native.record_cancellation.v1` is an unbound dependency, nothing activates it by implication, and no revocation or stop value validates as a D06 `StopSource`, `SchedulerStop` or `RunOperationResult(operation=cancel)`.
- **Certified:** coordinator v2 byte-exact, with its 12 methods re-issued for v9. **Producer v4 is required.** `producer/installed-profile.json` @A1 line 106 has `"native_profile": "pm.executor.workflow_source.all_writers.v8"` and line 105 has "Actual native capability must independently authenticate the full all_writers.v8 descriptor at birth". Both are inside its preimage. The 14 producer method IDs can be kept.
- **Replan:** the 27 `owner.workflow.replan.*.v1` method IDs are kept. The Replan roots are re-issued because of the const. The 30 Replan families stay, with v9 routes or rows (V1-Q5). The limited Stop route of EP-127 is carried unchanged, with its 7 source obligations still NOT_RUN. GRS-087's statement that the replanned Event is not admitted until A3 carries over unchanged.
- **Occurrences:** all 323 are re-issued with the v9 profile, plus the occurrences of the new writers. Each still requires `RunRevocationCurrent` (EP-125, A1 EP 8727-8728).
- **Rejected alternative:** keep v8 bytes and enroll a separate "run-lifecycle writers" component at v8 birth. EP-125 forbids it: "an unknown or incompletely enrolled participant refuses birth" (A1 EP 8696), and `writer_contract` is "the fixed v8 constant".

---

## 7. Consumer adoption v9 births need (an A2-like step)

- **Which consumers.** The v9 births' started, cancelled and certified Events need a consumer successor. By analogy with A2 (A2 note R1 §3.9), that means:
  - v9 companions with a `uri_map` to the v9 roots;
  - `…native_v9.v1` current readers;
  - an `OriginalLegacySet` branch `all_writers.v9`;
  - a descriptor pin on the v9 digest.
  Plus the new **stopped** and **blocked** reducer branches. The Replan consumer follows with A3-replanned.
- **Which projection successor.** A3-stopped design §5 proposes the chain v6 (A2: v8 births), v7 (stopped), v8 (blocked), v9 (replanned). Under C-4 option 2 both new writers exist only for v9 births, and a stopped or blocked branch is live only in a successor that also admits that birth profile's started Event (A3 design §5). So prop.: one successor after A2's v6 admits v9 births and carries both new branches. Replanned comes after it.
- **Registry and governance.**
  - The two Event rows (`goal_run.stopped`, `goal_run.blocked`) move to 3.0.0 in A3's landing 2, not in the v9 profile landing. Each row revision needs its own DL-036 checkpoint card (Q-02) and a DL-077-form record plus a depth assessment (Q-03).
  - The projection successor adds two Storage rows (`RP-PROJECTION-3GEN`) and moves the census again.
  - The v9 profile landing itself changes no Event row, following A1's precedent, so it needs no Q-02 card (prop.).
- **The descriptor names no consumer.** A consumer pins the profile digest, so naming the consumer in the profile would make each digest depend on the other (A2 note R1 §3.9).

---

## 8. Order of work (prop.)

1. Answer the B01 card (blocked trigger) and T-01 (single or joint issuer). Rule on V1-Q3 (Pattern A or B) and V1-Q5 (routes or rows).
2. A1 lands. Pin the landed v8 digest.
3. Author the stop and blocked source contracts (A3 landing 1 for each). Their files become v9 members.
4. Build the v9 package: select the v8 canon, bump `$id`s, patch D01 and the profile consts, re-issue the maps and occurrences, regenerate bindings, write the routes, the descriptors (v9 and producer v4), the rows and the inverse. Run the checks, then two review cycles.
5. Canon compile: owner prose first, then companions, rows and re-pins. Then the canon review, cycle cap two.
6. Consumer successor for v9 births, with the stopped and blocked branches. Registry rows with Q-02 cards and Q-03 records.

Steps 3 and 4 can share one package and one review round, which saves review overhead (prop.).

---

## 9. Estimate against A1 actuals

**A1 actuals** (A1 `reports/event-authority-20260911/replan-v8/STATUS.md` 72): "about 28 agent-hours and about 4.8M output tokens: 41 subagents (16 agent-hours, 4.63M output tokens) … plus about 12 hours of host time". A1 placed 74 files (about 10.4 MB), 34 rows and 13 units. Its package review returned 38 findings in cycle 1.

**Differences from A1.**
- **Cheaper:** there is no external source to re-adjudicate, relocate or repair, and the renaming is a mechanical `$id` bump.
- **Dearer:** the D01 successor and the two writers' fit with the combined slot and Stop route are new authoring, not placement. These are the parts where reviews will find things.

**Estimates, all prop. and by analogy:**

| Part | Agent-hours | Output tokens |
|---|---|---|
| v9 profile (carry-forward, D01 successor, descriptors, routes, rows, about 8 owner units, 2+2 review cycles, host) | 15-25 | 2.0-3.5M |
| Stop and blocked source contracts (A3 landing 1 for each; 5 units and a companion directory each) | 16-24 | 2.0-3.5M |
| Consumer successor for v9 plus the stopped and blocked branches, rows, cards (A2 and A3 landing 2) | 12-20 | 1.5-2.5M |
| **Total to live stopped and blocked Events on v9 births** | **45-75** | **5-9M** |

These are rough. A2 has no actuals yet, and the blocked trigger's scope is unknown.

---

## 10. What can be reused from the A1 package tooling

Package `scripts/`, 6,913 lines of stages plus checks (17,381 lines in all):

| Script | Reuse for v9 |
|---|---|
| `build.py`, `manifest.py`, `common.py`, `rebase_check.py` | As is: stage runner, freeze, base drift |
| `select.py` | As is, with the source changed to canon at the landing base |
| `rename.py` + a v8→v9 successor map | High. The same engine performs `$id` bumps and profile-field changes |
| `repair.py` (JSON-pointer patches) | High. The D01 enum, origin, cause and owner-source additions and the profile consts become patch rows |
| `bind.py` | High. Regenerates `resource-realms.json`, `method-root-bindings.json` and `original-reference-routing.json` |
| `inverse.py` | High, retargeted: the inverse is v9 against canon v8, not against an external v3 |
| `author.py` (2,280 lines) | Medium. The descriptor, identity-map, composition, superseded-lineage, citations and row authoring carry over; its v8-specific tables do not |
| `relocate.py`, `tables.py` | Low. There are no external paths to relocate |
| Checks C01-C04, C07-C11, `run_all.py` | High |
| C05: `check_stop_phase_v3.py` (751 checks), `check_stop_correction.py` (1,252 checks) | High, to re-prove the carried Stop route under the v9 names |
| C06 (token walk) | High, for the new custody rows |
| New checks | D01 rule and origin completeness for the two writers; the byte-exact carry of the five unchanged schemas |

---

## 11. Open questions (recorded, not answered)

- **V1-Q1 (product card; gates the freeze).** B01: what puts a run into blocked, and which owner decides? Until it is answered, v9 either waits, or carries only the stop writer and leaves blocked for a later profile. The second choice goes against the C-4 answer that one v9 carries both.
- **V1-Q2 (owner, T-01).** Is W-C one Executor issuer with Orchestrator as caller, or a joint issuer? The same question applies to the blocked publisher.
- **V1-Q3 (Executor owner).** Pattern A (in-schema D01 successor) or Pattern B (sibling observer, as Replan) for the two writers?
- **V1-Q4 (Executor owner).** Is either new writer a slot issuer (SP-322's 17-method enumeration)?
- **V1-Q5 (Storage owner).** For v9 births, do A1's 34 families and the native families get profile-qualified routes (the v8 native pattern) or new registry rows? Which headers bump?
- **V1-Q6 (Executor owner).** Does a slot revoked under EP-127 with a held Replan or certified operation count as quiet for W-C? Does W-C refuse while a durable held certified Event exists (A3 T-09)?
- **V1-Q7 (A3-replanned).** Resuming a stopped or blocked run needs a `goal_run.replanned` admission (GRS 3468 @main). But `combined.claim.v1` "cannot claim for a stopped Goal" (A1 EP 8965-8966). Does v9's Replan need a stopped or blocked source state, or does Goal resume come first under existing contracts?
- **V1-Q8 (process).** Does the v9 profile package share one package and one review round with the two A3 landing-1 source contracts, or is it separate?
- **V1-Q9 (process).** A1's O-15 says one `goal_run_projection` chain. Do A2 and A3 agree to collapse the chain's stopped and blocked positions into one v9-admitting successor (§7)?
