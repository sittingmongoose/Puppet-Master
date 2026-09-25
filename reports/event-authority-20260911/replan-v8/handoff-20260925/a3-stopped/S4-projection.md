# S4: projection. What "extend the mandatory GRS-085 run-history projection to its rows" requires for `goal_run.stopped`

Scope label S4-projection, A3 `goal_run.stopped` scoping, 2026-09-25. Read-only. Everything below was read as git objects.

**Bases read**
- `origin/main` `63cf2cb97f`. Pins:
  - `Plans/storage_value_registry.json` `32d267dd…0f46` (294 families, 27 policies)
  - `Plans/event_family_registry.json` `0be54418…c842`
  - `Plans/goal_run_certified_consumer_contracts/protocol.md` `a9d2717a…a8c4`
  - `Plans/Goal_Runtime_System.md` `f233eb9c…2ad9`
  - `Plans/storage-plan.md` `011b8877…67f7`
- Pending context, not canon:
  - `origin/plans/replan-v8-a1-20260925` `74c79b5bf9`
  - `origin/plans/replan-v8-process-answers-20260925` `616f12bfde`. Its `process-answers-20260925.md` is `8c16d369…dbfbe`.

**Line correction.** On `63cf2cb97f` the DL-080 prose heading is `Plans/Decision_Log.md` line 1609, and its PlanUnit is at line 6633, not line 6211. The unit's acceptance criterion at line 6657 reads: "each with a named writer and its rows carried by the mandatory GRS-085 run-history projection."

---

## 1. Verdict

1. **Extending the projection means adding a successor, not revising what exists.** "Extend GRS-085 to its rows" is met the way every earlier GoalRun lifecycle family met it: with a new versioned member of the SP-214 / D-R20 `goal_run_projection` role. That member is a new GRS unit that succeeds GRS-085, a new SP unit that succeeds SP-317 and registers two new derived families, a new dataset `goal_run_projection.v6@<generation_id>`, a new consumer contract directory, and BRS and ATS companions. GRS-085, SP-317, their two registry rows and every v3, v4 and v5 artifact stay byte-unchanged. This is the recommended reading, and the owner can confirm it (§9, O-S4-01).
2. **Nothing migrates from v5 checkpoints.** The successor stages an empty isolated generation and rebuilds it from retained original sources. Canon forbids copying a checkpoint or reinterpreting row bytes.
3. **The projection cannot be designed apart from the writer's birth profile.** The successor admits stopped rows only for the Workflow births that have a `goal_run.stopped` writer. Canon allows no such writer for existing v7 births (closed roster, no enrollment), and A1's v8 adds none. If the writer ends up v8-only or later, then a successor that adds only stopped rows on top of v5 projects nothing for the runs that can emit one. v5, and so such a successor, does not admit those births' started, cancelled or certified Events. This is the main coordination point with A2 (§6).
4. **Census.** At minimum two storage families are added: +2 families, +2 materialized, +2 `later_gui_or_feature_projection`, and no new policy. The eight readiness re-pins A1 listed all move again. Any compact authority families the stopped writer needs come on top of that (§7).

## 2. What canon says today

- **GRS-085 is the mandatory projection and is scoped by version.** `Plans/Goal_Runtime_System.md` line 7875 is the heading. Its canonical text at lines 7880-7885 reads: "validates full EventRecord shape, source scope and original custody before interpreting a supported same-run started, positive-D06 cancelled or certified transition. Gaps, reordering, malformed off-run frames, unsupported same-run replanned/blocked/stopped profiles, conflicting lifecycle or mismatched scope halt before that row; they do not silently advance checkpoint." It applies "only for a genuine fresh pm.executor.workflow_source.all_writers.v7 birth", and "no existing birth is enrolled or cast".
- **SP-317 sets the physical terms.** At `Plans/storage-plan.md` lines 26613-26629 it reads: "Register exactly two separate derived families … exact goal_run_projection.v5@<generation_id> dataset …" and "Never copy an old checkpoint or reinterpret old row bytes" (line 26627).
- **Registry rows.** `Plans/storage_value_registry.json` has `goal_run_started_cancelled_certified_projection` at line 112623 (key `goal_run_projection.v5:K(project_id):K(goal_run_id)`, line 112627) and `goal_run_started_cancelled_certified_checkpoint` at line 112794.
  - Each row's `replay_behavior` repeats the GRS-085 halt text word for word (lines 112652 and 112828).
  - Each row's `migration` reads: "Two separate derived certified successor families; preserve every prior started-only/started-cancelled profile, key, schema, method and checkpoint … no old checkpoint copying" (lines 112653 and 112829).
  - `migration_disposition.mode` is `rebuild_on_schema_change`. `restore_disposition.mode` is `rebuild_from_authority`, citing BRS-029 and SP-317.
  - `recovery_disposition.source_family_ids` lists 64 families, all registered.
- **Consumer protocol P4.** `Plans/goal_run_certified_consumer_contracts/protocol.md`:
  - Line 53: "Same-run replanned, blocked, stopped, any other GoalRun transition, unknown family or incompatible profile halts before its row. No v2 sibling is cast or skipped."
  - Line 59: "Certification does not follow cancellation, and cancellation does not follow certification under this bounded route."
  - Line 5: "This proposal adds no native writer to the closed all_writers.v7 roster."
- **The projection is a role.** SP-311 says "The new family implements the SP214 / Goal Runtime D-R20 goal_run_projection role as a versioned member" (`storage-plan.md` line 25960). SP-312 says "It materializes the mandatory SP214 per-project, per-Workflow-run goal_run_projection role through a separate versioned family" (line 26068). SP-214's A006 criterion (`storage-plan.md` lines 15201-15204) says the role for certified v3 "is carried by GRS-085 in the two SP-317 families rather than by goal_run_projection.v1".
- **The depth42 assessment grades the stopped row.** `reports/event-authority-20260911/step-08-depth42-assessment-20260924.json`, row `goal_run.stopped`:
  - `consumers_checkpoints` is ABSENT: "The only current GoalRun projection (GRS-085 …) halts before a same-run stopped row without advancing its checkpoint, so emitting goal_run.stopped under the wiring expectations would stall it."
  - `transitions` is PARTIAL: "GRS-085 halts on same-run stopped, resumption hinges on an unadopted goal_run.replanned".
  - `retention` is PASS, on the ground that "The family owns no admitted projection or checkpoint".

## 3. Why a successor and not a revision

**Precedent.** The chain grew three times, and each time the earlier rows were left alone:

| Step | Unit | Dataset | Generation prefix | Supported rows |
|---|---|---|---|---|
| v3 | SP-311 / GRS-079 | `goal_run_projection.v3` | `grsg_` | started |
| v4 | SP-312 / GRS-080 | `goal_run_projection.v4` | `grscg_` | started, cancelled |
| v5 | SP-317 / GRS-085 | `goal_run_projection.v5` | `grsccg_` | started, cancelled, certified |

- The v3 rows still say "unsupported relevant GoalRun event halts before its row" (lines 111090 and 111215).
- The v4 rows still halt on "same-run replanned/blocked/certified/stopped" (lines 111353 and 111520). GRS-080 at `Goal_Runtime_System.md` line 7512 still says certified halts, even though GRS-085 now supports it.
- SP-312 at line 26172 reads: "They are separate physical families and roots; neither overwrites goal_run_started_projection nor goal_run_started_checkpoint … no old v3 root is silently upgraded to grscg_ or v4."

**A revision in place does not fit.**
- The v5 row's `value_schema` pins `schema_id` const `pm.goal_run_projection.started_cancelled_certified.v5` and `schema_version` const `5.0.0`.
- The v5 `Projection` definition is a closed `oneOf` of the started/cancelled, cancelled and certified projections (`schemas/consumer.v1.schema.json`). Adding a stopped branch therefore changes the schema version, the key shape (`…v5:`), the family name and the checkpoint version.
- GRS-085 and SP-317 say the family is "version-scoped" and that earlier routes "retain their original boundaries". For v5, the halt stays true.

**The recommended reading.** GRS-085 stays as the accepted bounded v5 member. The stopped contract's successor takes over the mandatory role for births in its scope, as SP-312 and SP-317 each did in turn.

## 4. Deliverables for the stopped successor

All names below are placeholders. The owner or author decides them (§9).

### 4.1 GRS successor unit (Goal Runtime)
- **Numbering.** The next number is GRS-090 if A1 (GRS-086 to 089) lands first; re-check at rebase. For the other prefixes, `main` is at SP-320, BRS-029, ATS-058, CV-353 and EP-124. A1 claims SP-321-322, BRS-031, ATS-059-060, CV-354 and EP-125-127. BRS-030 is claimed on `origin/fix/server-pairing-issuance-rebased-20260925` and `origin/fix/packet-canon-repairs*`.
- **Content, in GRS-085's form:**
  - The mandatory started/cancelled/certified/stopped per-Workflow-run prefix projection.
  - Supported same-run transitions: started v3, positive-D06 cancelled v3, certified v3 (as scoped in v5) and stopped v3, the payload successor A3 selects.
  - Replanned, blocked and v2 stopped rows, and any other unsupported profile, still halt before their row.
  - Every original v3/v4/v5 bank and method is preserved.
  - The same source-lifetime and NOT_RUN statements as GRS-085.
  - Which births it admits for each branch (§6).
- **What it must not do.** It must not edit GRS-085. It may add a routing note to the GRS minima table row for `goal_run.certified` (line 2653, which names "GRS-085 governing its mandatory … projection") and to the `goal_run.stopped` row (line 2655), following the pattern of the 2026-09-24 routing note at line 2657.

### 4.2 SP successor unit (Storage) and two new registry rows
Model the rows field by field on rows 292 and 293:
- **`family_id`.** For example `goal_run_started_cancelled_certified_stopped_projection` and `…_checkpoint`. They must match `^[a-z][a-z0-9_]*$`.
- **Status and tier.** `status: materialized` and `tier: later_gui_or_feature_projection`, as for rows 278-281 and 292-293.
- **Keys.**
  - Projection `key_shape`: `goal_run_projection.v6:K(project_id):K(goal_run_id)`, in table `goal_run_projection.v6@<generation_id>`.
  - Checkpoint key: `<checkpoint_family>.v1:K(storage_instance_id):K(project_id):K(goal_id):K(goal_run_id)`, in table `checkpoints`.
- **Schema and codec.** Projection schema ID `pm.goal_run_projection.<…>.v6@6.0.0`; checkpoint schema ID `pm.<…>_checkpoint.v1@1.0.0`. Encoding `messagepack_canonical`, the CV339 whole value.
- **`value_schema`.** An inline closed wrapper, following the pattern of `7ad1ffff6` and A0's P-03, and never a bare reference. Section 2.3.1, `storage-plan.md` line 518, rejects a bare reference.
- **Producer and consumers.** Producer `owner.storage.<…>.publish.v1`. Consumers are the new `project_prefix`, the whole method table and BRS-backed derived backup.
- **`replay_behavior`.** The GRS successor text, with stopped as a supported transition and the reduced halt list.
- **`migration`.** "separate derived successor families; preserve every prior started-only/started-cancelled/started-cancelled-certified profile, key, schema, method and checkpoint; empty isolated generation, no checkpoint copying". `migration_disposition` is `rebuild_on_schema_change` with `fail_closed`.
- **Recovery.** `restore_disposition` is `rebuild_from_authority`, citing the BRS successor. `recovery_disposition`:
  - `derived_rebuildable` with `rebuild_from_seglog`.
  - `source_family_ids` holds the 64 v5 sources plus the stopped writer's own authority and custody families, which must already be registered (§9, O-S4-04).
  - `backup_required: false` and `user_disclosure_required: true`.
- **Retention.** `retention_policy_ref: RP-PROJECTION-3GEN`, an existing policy, so no DL-045 card is needed. `retention_compaction` and `physical-retention-install.json` `source_lifetimes` gain a `stopped` entry. The registered `goal_run.stopped` row keeps `RP-AUTHORITY-INDEFINITE@1.0.0` (event registry `#/families/5`). If A3's v3 row changed that policy, it would become a DL-045 question.
- **SP-214.** Add a routing paragraph after the certified one (`storage-plan.md` lines 15166-15176): "For exactly goal_run.stopped, GRS-0xx … governs the mandatory … projection … SP-3xx owns its projection and checkpoint families". Extend A006, or add an A007, to name the successor. SP-214 stays the `payload_owner_doc` route of the stopped registry row, as it is for certified.

### 4.3 Dataset, generation and profile identities
- **Dataset.** `goal_run_projection.v6`. Neither `main` nor A1 uses `goal_run_projection.v6` or `v7` anywhere; searched on both.
- **Identities to choose:**
  - A generation prefix distinct from `grsg_`, `grscg_`, `grsccg_` and A1's draft `grscrg_`.
  - New anchor and frontier domain labels, following the pattern of `goal_run_started_cancelled_certified_anchor.v1` and `…_frontier.v1` (protocol line 69).
  - A new projector profile, successor to `goal_run_started_cancelled_certified_projector.v1`.
  - A new `installed-profile-digest.txt`.

### 4.4 Consumer contract directory
Successor to `Plans/goal_run_certified_consumer_contracts/`, with the same file set:
- **Core files.**
  - `protocol.md`, P0 to P8.
  - `methods.json`: v5 has 12 methods. Add `…stopped.read_retained_native`, `inspect_original`, `read_historical` and `read_current`; the new `project_prefix`, `read_sources` and `publish`; and the carried legacy started/cancelled/certified read roots.
  - `schemas/consumer.v1.schema.json`: a `StoppedProjection`, a `Projection` `oneOf` extended by it, and `Checkpoint`, `Generation`, `ProcessedPrefix` and `DurableGenericToken`.
- **Companions.** `companions/` holds the whole v5 consumer schema, plus `companion-differences.json`.
- **Supporting files.** `imports.json`, `resource-realms.json`, `source-variants.json`, `owner-sources.json`, `source-citations.json`, `commitment-domains.json`, `dependencies.json`, `source-method-composition.json`, `physical-retention-install.json`, `installed-profile.json` and its digest.
- **Composition file.** A family composition analogous to `Plans/goal_certified_family_composition.json`. Leave its historical `registry_selection.storage_final_families: 294` unchanged, as A1 did.
- **External consumers.** On `main`, nothing outside the v5 directory, `storage-plan.md`, the registry and the composition file names a v5 method or row; searched. No Orchestrator or UI reader has to be re-pointed. Which reader serves the Pause and Abort run history is unbound (§9, O-S4-07).

### 4.5 Companions in other owners
- A BRS successor. BRS-029 covers only the v5 derived unit and is scoped to v7.
- An ATS acceptance unit, like ATS-057's facets, to lift `positive_negative_oracles`.
- CV schema roots if the new consumer schema gets CV-352-style binding.
- A `00-plans-index.md` section, like the certified section at line 6011.

## 5. Reducer semantics the successor must state, from current canon

- **Into stopped.** D-R21, `Goal_Runtime_System.md` line 3768: "`ready|running|provisional_success|verifying|failed_verification|repairing|blocked -> stopped`; `stopped -> stopped` requires new settlement/recovery evidence. Certified/failed/cancelled sources are illegal."
  - The reducer does not see an Event for every intermediate native transition. As v5 P4 does for certified (protocol line 57), the source state comes from the original native before/after commitments, never from invented Event history.
  - A same-run `blocked` Event before the stop still halts, because blocked is unsupported.
- **From `ready` with no Start.** A stopped row can exist with no `goal_run.started`. That needs positive native proof that the run was initialized and never started, and the proof must not be D06 (see Q-12 below). Whether the Pause and Abort routes can reach `ready -> stopped` is open (§9, O-S4-06).
- **stopped to stopped.** Admitted only with materially new settlement or recovery evidence. An identical first-original identity follows the generic dedupe rules and is never a second transition.
- **After stopped.**
  - `cancelled` is legal. D-R17 at line 3740: "any nonterminal GoalRun state, including `blocked|stopped`, -> `cancelled`". The cancelled branch stays positive-D06, unchanged.
  - `certified` is illegal. D-R18 at line 3747 allows only `provisional_success|verifying -> certified`. Line 3468: "`blocked` and `stopped` are fenced, resumable only through a new revision and valid `goal_run.replanned` admission". So certified after stopped with no admitted replanned is a conflicting lifecycle and halts. A same-run replanned halts in any case until the replanned successor exists.
- **Terminal states.** Stopped after certified or cancelled is illegal and halts. The v5 rule that certification and cancellation exclude each other stays.
- **Q-12, no D06.** Neither the stopped branch nor its current read may require D06. From A1's GRS-089 text (pending): "NativeExecutionRevocationResult never validates as a D06 StopSource, SchedulerStop or RunOperationResult(operation=cancel)". The successor must keep stopped and cancelled as distinct branches: a revocation or stop record is never projected as a cancelled row, and a cancelled row is never inferred from a stop.
- **Current read.** A stopped row is current only while the fresh native body and control still match the stop issuance, with no later relevant Event or native update, and the complete generic frontier is equal (the v5 P7 pattern). A resumed run is "unavailable", not a stale stopped view.
- **Source lifetime.** The stopped Event is `RP-AUTHORITY-INDEFINITE`, and the projection cannot extend the `safe_point_ref`, child settlement or tool settlement sources it cites. Start expiry (`RP-RUNTIME-365D`) needs the survivor/gap proof pattern of v5 P4 at line 57 and P8 at line 103.
- **Held certified slot.** A1's GRS-089 (pending) leaves open "what then becomes of an already durable held goal_run.certified Event" when a Stop revokes a held certified slot, with the Event side assigned to A3. That can put an unreleased certified Event before a stopped Event in one run. v5 P2 gives such an Event no success ("committed-but-unreleased … has no RetainedCertifiedNative success"). The successor must say whether that halts the run or is unavailable-then-continue (§9, O-S4-05).

## 6. Birth scope and the one successor chain (A1 O-15, A2, A3)

### 6.1 Constraints
1. **v7 births cannot get a stopped writer.** Evidence:
   - Certified consumer protocol line 5 names "the closed all_writers.v7 roster".
   - GRS-085: "no existing birth is enrolled or cast".
   - A0 §7 reads EP-118 as refusing any Workflow writer it does not list.
2. **A1's v8 adds no stopped writer either.** GRS-089 on A1 (`74c79b5bf9`, `Goal_Runtime_System.md` line 8297 on that branch): "The limited revocation appends no Event: no goal_run.stopped or goal_run.blocked writer is added (A3)". EP-125 (A1 `Executor_Protocol.md` line 8700): "Only genuine original birth installs v8: there is no late or old-birth enrollment". So the writer needs one of two things: an amendment of v8 before any v8 birth, meaning before A1 lands or with an A1 re-review, or a later fresh profile. Either way it applies only to births under that profile.
3. **v5 does not admit v8 births.** GRS-088 on A1: "The goal_run.certified registry row, the GRS-085 projection, the SP-317 families and the v7 certified consumer … do not admit or project the certified rows or Events of a v8 birth". GRS-087 on A1: "the started and cancelled combined-profile consumers and the projector, checkpoint, backfill and retention declarations are separate required work (A2)".
4. **Consequence.** A successor that is only "v5 plus stopped" would halt, for any run born under the stopped writer's profile, at that run's own `goal_run.started` (an incompatible profile) before any stopped row. The stopped extension is live only in a successor that also admits that profile's started, cancelled and certified Events. Those Events are A2's adoption items, and A3 does not own them.
5. **A1's draft replanned projector forks the chain.** The file is `Plans/workflow_combined_source_contracts/replan/schemas/goal-run-started-cancelled-replanned-consumer.v1.schema.json` on A1, `7602020e…c9d3`.
   - Its `CombinedProjection` is `oneOf` [v3 `Projection`, v4 `CancelledProjection`], and `ReplanCombinedProjection` adds `ReplannedProjection`. It has no `CertifiedProjection`.
   - Its generation prefix is `grscrg_`. `physical-families.json` on A1 lines 236-245 give it a `H(...)` key codec, JSON codec `pm.workflow.activation_source_json.v1`, and producer `owner.workflow.replan.project.v1`.
   - Its `ReplanCheckpoint` lacks `root_revision` and `last_transaction_id`.
   - Every one of these differs from v5: `K(...)`, CV339 MessagePack, the Storage-owned `publish`, and the root CAS fields. That is the second projector A0 P-06 warned about ("A separate projector needs an explicit justification").
   - Its `ReplannedProjection.status_at_original_event` enumerates `blocked` and `stopped`, so the replanned successor needs the stopped and blocked rows as predecessors.
   - A1's author decision O-15 (`a1/author-decisions-20260925.md`, `bcfbef8a…f6ff4`): "A2 and A3 agree one `goal_run_projection` successor chain."

### 6.2 Proposed chain rules (process, for A2 and A3 to agree; no product question)
- **R1, linear.** Every successor contains every supported transition of the current head (v5 today), in whole preserved banks, and adds its own rows. No fork, and no second projector for the same per-run role. A1's `grscrg_` draft is rebased onto the head by A2 and re-keyed to the v5 physical conventions.
- **R2, versions assigned at landing.** The dataset version, family names and generation prefix are taken by whichever successor lands next. A successor authored against a head that has since moved is re-adjudicated, not merged blind. That covers its bank imports, companion differences, registry row indices, census numbers and `recovery_disposition` sources.
- **R3, DL-080 order applies to rows, not to chain position.** Stopped and blocked rows are admitted before replanned rows. Adopting v8 births for started, cancelled and certified (A2) carries no DL-080 order constraint, so it can come before or with the stopped successor.
- **R4, birth scope is explicit per branch.** Each successor states, for each branch, which native profiles it admits. For example: started and cancelled for original-profile, v7 and v8; certified for v7, and for v8 only once A2 adopts `coordinator.v2`; stopped only for the writer's profile.

### 6.3 Candidate orderings (author decision; §9, O-S4-02)
- **(a) A2 first.** A2 lands the v8-birth adoption as `v6` (started, cancelled and certified for v7 and v8, still halting on stopped, blocked and replanned). A3 stopped lands `v7` (+ stopped). A3 blocked lands `v8` (+ blocked). A2 or A3 replanned lands `v9` (+ replanned). This keeps each landing single-purpose, but stopped waits for A2.
- **(b) A3 stopped first.** The A3 stopped successor also carries the A2 v8-birth adoption of started, cancelled and certified. It lands sooner but brings A2's four adoption items into A3's scope.
- **(c) Stopped first, v7 births only.** This is only possible if the owner rules that a stopped writer can apply to v7 births. Current canon (constraint 1) forbids that.
- **Naming.** Dataset versions `v7`/`v8` will sit beside native profiles `all_writers.v7`/`v8` with unrelated meanings. A chain-neutral family name, for example `goal_run_lifecycle_projection_v6`, avoids ever longer `started_cancelled_certified_stopped_…` names. This is an author choice (§9, O-S4-03).

## 7. Census consequences

- **Storage registry, the two projection rows alone.** Policies stay 27, deferred 19, alias 1, tier-0 40, migration-only 3.

  | Base | Families | Materialized | `later_gui_or_feature_projection` |
  |---|---|---|---|
  | `main` `63cf2cb97f` (verified 294 / 274 / 251) | 294 → 296 | 274 → 276 | 251 → 253 |
  | A1 landed first (A1 report §5-6: 328 / 308 / 285) | 328 → 330 | 308 → 310 | 285 → 287 |

  - Any compact authority, custody or origin families of the stopped writer add further rows. The certified precedent added 7 through SP-316 (`goal_certified_family_composition.json` `registry_selection.storage_new_compact_authority_families: 7`).
- **Pins that move.** The same eight re-pins as A1's §6, at `63cf2cb97f`:
  - `scripts/pm-implementation-readiness.py` line 761 `STORAGE_VALUE_REGISTRY_EXPECTED_FAMILY_COUNT = 294`, line 764 `"materialized": 274` and line 770 `"later_gui_or_feature_projection": 251`, plus a dated re-pin record in the census comment block at lines 744-760.
  - `tests/test_pm_assistant_contract_closure.py` line 600.
  - `Plans/storage-plan.md` line 523, the Census bullet: "The 2026-09-25 pin is 294 families and 27 retention policies …".
  - `tests/test_pm_onboarding_phases.py` lines 312-313.
  - `tests/test_shared_runtime_storage_contracts.py` lines 216 and 221.
- **Test edits are within scope.** All three test files are allowlisted in `.gitignore`, at lines 81, 90 and 92. Following A1, the landing runs `python3 -m unittest tests.test_pm_onboarding_phases tests.test_shared_runtime_storage_contracts tests.test_pm_assistant_contract_closure` before pushing `main`.
- **Leave two historical statements as written:** SP-316's "All 285 previous Storage rows remain unchanged", and the certified composition's `storage_final_families: 294`.
- **Row pointers.** Rows are appended at the end of `/families`. If A1 or another thread lands first, re-derive every `/families/<n>` pointer, for example in a composition's `registry_schema_resolution_bindings`, and every census number.
- **Event registry side (belongs to the registry label, noted here).** The projection itself changes no Event row. The `goal_run.stopped` v2 → v3 revision changes the Event registry SHA `0be54418…`. That needs the Q-02 checkpoint card and a new PNC-019 revision after `2026-09-11.2` (`scripts/pm_pnc019_currentness.py`), with the kernel count still 42. It also re-freezes the three admission fingerprints and `REVIEWED_GOAL_SUCCESSORS`, as A0 §7 describes.

## 8. Process consequences

- **Q-02 card.** It must carry the exact before and after `goal_run.stopped` Event row and both Event registry SHA-256s. Whether it must also carry the two new storage rows and the storage registry SHA pair is not stated (O-S4-08). As precedent, A1's report recorded the storage SHAs before and after (`32d267dd…` → `45e383b2…`) without a card, and the 2026-09-23 checkpoint approval covered only the Event registry (`step-08-checkpoint-2026-09-11.2.md`).
- **Q-03 single-family depth assessment.** Once the successor exists, re-grade three cells:
  - `consumers_checkpoints`: target PASS, citing the successor's `project_prefix`, `publish` and checkpoint.
  - `transitions`: the halt reason goes away, but resumption still depends on unadopted replanned. So this is likely still PARTIAL until the replanned successor.
  - `retention`: the ground "owns no admitted projection" no longer holds. Re-grade against the successor's source coupling.
- **Governance.** The successor edits `Goal_Runtime_System.md`, `storage-plan.md`, BRS, ATS, the index and the registry, so governance goes stale for them. That is expected, and the designated Plans agent reseals. The certified-family pins are already stale on `main` (A0 P-17), so they must not be bound or resealed here.

## 9. Open questions (none decided here)

| ID | Question | For |
|---|---|---|
| O-S4-01 | Confirm that "extend the mandatory GRS-085 run-history projection" (DL-080 unit line 6657) is met by a versioned successor member that takes over the mandatory role, leaving GRS-085 and SP-317 byte-unchanged, rather than a revision of GRS-085/SP-317 in place. §3 has the evidence for the successor reading. | Goal Runtime and Storage owners |
| O-S4-02 | Chain order (§6.3: a, b or c) and which branch authors the successor that first admits the stopped writer's births. This depends on where the stopped writer lives: a v8 amendment before A1 lands, or a later profile. | A2 and A3, with the S-writer scoping |
| O-S4-03 | Names: the family IDs, generation prefix, anchor and frontier labels, projector profile, method IDs, and whether to switch to a chain-neutral family name | author, A2 and A3 jointly |
| O-S4-04 | The stopped writer's authority and custody families. They go into `recovery_disposition.source_family_ids` and the census count, and must be registered in the same landing or an earlier one. | S-writer label, Storage owner |
| O-S4-05 | A durable, unreleased held `goal_run.certified` Event followed by a revocation Stop or a stopped Event in the same run: halt, or unavailable-then-continue? (A1 GRS-089 open item, Q-U4-08) | Executor and Goal owners, A3 |
| O-S4-06 | Is `ready -> stopped` (no Start) reachable through Pause or Abort Run? If it is, what non-D06 positive proof of initialized-no-start does the stopped row carry? | Goal Runtime and Executor owners |
| O-S4-07 | Which Orchestrator or Goal Runtime reader serves the Pause and Abort run history? None is bound to a v3, v4 or v5 read method on `main`. | Orchestrator owner |
| O-S4-08 | Does the Q-02 card include the storage registry rows and SHA pair, or only the Event registry row? | PM process thread |
| O-S4-09 | Section 2.3.1 treats token schemas stored under names other than `read_token` or `*_read_token` as secret-material failures. v5 stores the `DurableGenericToken` under `source_token_at_birth` and `generic_token`. Confirm with a readiness run that a v6 checkpoint copying the v5 shape passes, or get a Storage ruling (A1 U3-Q7 asks the same for Replan). | Storage owner |
| O-S4-10 | Does the successor admit historical v2 `goal_run.stopped` rows? Precedent: "No v2 sibling is cast or skipped", so they halt. And does the revised Event row keep `RP-AUTHORITY-INDEFINITE`? | A3, with DL-045 if retention changes |
