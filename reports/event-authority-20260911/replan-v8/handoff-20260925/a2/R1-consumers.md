# R1 — Canon consumer precedents for A2 (started, cancelled, certified)

Reader R1 for the A2 scope (Replan v8, Step 8(b) Group A). Read-only. Nothing in the repository was edited.

**Refs read.**
- `origin/main` = `63cf2cb97f936c91dd7bb5c585d9a35d8409ed61`.
- A1 = `origin/plans/replan-v8-a1-20260925`. It moved during this read, to `982f66083`. Every A1 line cited below was re-checked at `982f66083`.
- Process answers = `origin/plans/replan-v8-process-answers-20260925`.
- Line numbers are 1-based lines of the file at the named ref.

**Conventions.** "prop." marks a proposal for A2. "By analogy" marks a step from one precedent to another case. Everything else is a cited fact.

---

## 0. Bottom line

1. Canon has three versioned members of one `goal_run_projection` role: v3 started-only (SP-311), v4 started+cancelled (SP-312), v5 started+cancelled+certified (SP-317). Each successor added two new Storage rows and a new consumer contract. Each left its predecessor byte-exact.
2. None of the three admits an `all_writers.v8` birth. v3 and v4 are bound to the original EP-118 producer. v5 is bound to `all_writers.v7`, with digest `0055de6c…`.
3. No precedent edits a consumer in place to admit a new birth profile. The v7 precedent made copies ("companions") of the older started and cancelled schemas inside the new certified successor. The copies differ only in `$id`/`$ref` prefixes. The per-profile current readers became separate methods (`…native_v7.v1`).
4. So accepting v8 births means a new successor (v6 by the A3 chain proposal), not a new version of the v5 files. By analogy with v7, it takes v8 companions and `…native_v8.v1` methods inside that successor.
5. A consumer-only change has no precedent of touching an Event registry row. The v5 consumer did not add itself to the certified row's `source_refs`. Q-02's card rule is written for registry-row changes. It applies to A2 only if A2 edits an Event registry row.

---

## 1. Started consumer (v3, "started-only")

### 1.1 Files (`origin/main`)
- `Plans/goal_run_started_consumer_contracts/consumer.schema.json` (966 lines)
- `Plans/goal_run_started_consumer_contracts/methods.json` (129 lines)
- `Plans/goal_run_started_consumer_contracts/physical-families.json` (37 lines)
- Outside the directory, also part of the adoption: `Plans/goal_run_started_consumer_schema_resources.json`. It is listed in GRS-079 at `Goal_Runtime_System.md:7477`.

### 1.2 Owner units
- GRS-079, heading at `Plans/Goal_Runtime_System.md:7435`. Validation surfaces at 7474-7479 list the three files.
- EP-120, heading at `Plans/Executor_Protocol.md:8328`. Surfaces at 8361-8366.
- SP-311, heading at `Plans/storage-plan.md:25958`. Surfaces at 26042-26047.
- BRS-027, heading at `Plans/Backup_Restore_System.md:1581`. It lists the files at 1614-1616.
- Landing commit: `e686963ad` (2026-09-14), "plans: adopt original Workflow started v3 event consumer and checkpoint".

### 1.3 Closure wording (the "equivalent birth-profile closure")
There is no "roster" wording. Closure is by producer route and by a halt list.
- `Goal_Runtime_System.md:7437` @main: "No sibling Goal/GoalRun event, Executor attempt run.started, or old accepted profile is upgraded by name or alias."
- `storage-plan.md:25984` @main: "Replanned, blocked, certified, cancelled and stopped GoalRun events in this run are `UNSUPPORTED_RELEVANT_EVENT`: stop immediately before that row." The same line ends: "Thus this is a deliberately bounded started-only projector, not an implementation of all six GoalRun transitions."
- `Executor_Protocol.md:8340` @main: "without rekeying, reschematizing or rewriting any of the coordinator baseline's 278 complete family rows".

### 1.4 How it names its producer
- The producer is named in prose, not by an `all_writers` profile. `Goal_Runtime_System.md:7441` @main: "Original `owner.workflow.activation.commit_start.v2` with `owner.storage.workflow_start.commit_original.v2` retains the complete EP-118/SP-309 start coordinator".
- In the schema the binding is by resource. `consumer.schema.json` has 13 refs to `executor_workflow_original_start.v2.schema.json` and 11 refs to `workflow_start_original_custody.v2.schema.json` (counted with grep).
- The only profile literal is its own projector profile. `consumer.schema.json:408-409` @main: `"profile": { "const": "goal_run_started_projector.v1" }`.

### 1.5 Projection, checkpoint, rebuild ("backfill") and retention
- Projection. `physical-families.json:6-8` @main: `"name": "goal_run_projection.started.v3"`, table `goal_run_projection.v3@<generation_id>`, key `goal_run_projection.v3:K(project_id):K(goal_run_id)`.
- Checkpoint. `physical-families.json:24-26` @main: `"name": "goal_run_started_checkpoint.v1"`, table `checkpoints`, key `goal_run_started_checkpoint.v1:K(storage_instance_id):K(project_id):K(goal_id):K(goal_run_id)`.
- Writer. `methods.json:45` @main is `owner.goal_run.started.project_prefix.v1`. `methods.json:55` @main says `"effects": "own projection dataset and checkpoint only"`. The other four methods have `"effects": "none"` (lines 15, 31, 79, 103).
- Anchor. `storage-plan.md:25976` @main: "`anchor_sha256 = SHA256(encode(["goal_run_started_anchor.v1", storage_instance_id, scope, profile, seed_hex, source_token_at_birth]))`". The same line says: "Snapshot id from the actual ten-field generic token is only a live transaction fence; never persist or manufacture it."
- Rebuild. `storage-plan.md:25990` @main: "Rebuild starts with an empty isolated dataset and genuine current whole generic coverage."
- The word "backfill" occurs in none of the three consumer directories (git grep, zero hits). The equivalent is the staged isolated rebuild and cutover.
- Retention. `physical-families.json:20` @main: "RP-PROJECTION-3GEN; derived original Event content never extends RP-RUNTIME-365D original source lifetime". `storage-plan.md:26000` @main: "Original goal_run.started remains RP-RUNTIME-365D".
- Preserve clause. `physical-families.json:3` @main: "entire deferred goal_projection_families and original v1/v2 start readers unchanged".

### 1.6 Storage rows (`Plans/storage_value_registry.json` @main)
- #278 `goal_run_started_projection` at line 111058. Line 111067 is `producer`, line 111070 is `consumers`. The consumers are `owner.goal_run.started.project_prefix.v1`, `read_historical.v1`, `read_current.v1`, and "Orchestrator / Goal Runtime views / certification readers through complete admitted GoalRuntime read".
- #279 `goal_run_started_checkpoint` at line 111180, with the same producer and consumers.
- `storage-plan.md:26014` @main: "Exactly two additions extend the 278-family coordinator baseline through SP-310 to 280".

### 1.7 Event registry entry (`Plans/event_family_registry.json` @main)
- Row `event-family-goal-run-started` at line 188. Line 189 is `"family_revision": "3.0.0"`. Line 192 is `semantic_owner_doc` GRS-079. Line 193 is `payload_owner_doc` SP-311.
- `source_refs` at lines 232-234 name the consumer: `goal_run_started_consumer_contracts/consumer.schema.json`, `methods.json`, and `goal_run_started_consumer_schema_resources.json`.
- The registry has no separate "consumers" field.

### 1.8 What would have to change to accept v8 births
- In place is excluded. Four canon statements fix it:
  - `Goal_Runtime_System.md:7537` @main (GRS-080 acceptance): "Existing started-v3 profiles and methods remain unchanged".
  - `storage-plan.md:26178` @main: "the old started-only reader still refuses cancellation and remains a valid bounded original/running reader under SP-311".
  - The v5 consumer pins this `methods.json` by hash. `goal_run_certified_consumer_contracts/source-method-composition.json:9-10` @main has sha256 `5d7be8fd…`, which equals the file on main (verified).
  - Storage row #278 `value_schema_ref` names this file (svr line 111065).
- A standalone "started v4" has no precedent either. For v7 the new start roots entered as a companion copy inside the certified successor (see 3.8).
- So, by analogy, prop.: carry a v8 started companion inside the A2 successor. It would replace the `executor_workflow_original_start.v2` and `workflow_start_original_custody.v2` prefixes with A1's `…original_start.v7` and `…original_custody.v7` (A1 `native-v8/schemas/workflow-original-start.v7.schema.json` and `workflow-start-custody.v7.schema.json`, both with those `$id`s at A1). The current reader would be a new method, `read_current_started.native_v8.v1`.
- Name check only: every `$defs` name the v7 started companion reaches in the v6 roots also exists in A1's v7 roots. v8 adds, for example, `CombinedPendingStartSource` and `OriginalStartAssociation`. Nobody has checked that the definitions carry the same meaning.

---

## 2. Cancelled consumer (v4, combined started+cancelled)

### 2.1 Files (`origin/main`)
- `Plans/goal_run_cancelled_consumer_contracts/consumer.schema.json` (1771 lines). It re-hosts the whole started definitions under its own `$id` (line 409 still has `const "goal_run_started_projector.v1"`) and adds the `Combined*` definitions (lines 1203-1702).
- `cancelled-causal-arguments.schema.json`, `goal-arguments.schema.json`, `filesafe-arguments.schema.json`, `methods.json` (253 lines) and `physical-families.json` (37 lines).
- Outside the directory: `Plans/goal_run_cancelled_consumer_schema_resources.json`.

### 2.2 Owner units
- GRS-080 at `Goal_Runtime_System.md:7498`. Surfaces at 7540-7548.
- EP-121 at `Executor_Protocol.md:8385`. Surfaces at 8423-8431.
- SP-312 at `storage-plan.md:26066`.
- BRS-028 at `Backup_Restore_System.md:1638`. It lists the files at 1674-1679.
- Landing commit: `a3c511657` (2026-09-14).

### 2.3 Closure wording
- `Goal_Runtime_System.md:7512` @main: "The combined reducer supports exactly the already adopted original started-v3 and this positive cancelled-v3." The same line continues: "Same-run replanned, blocked, certified, stopped, incompatible v2/v3 profile or any other unsupported GoalRun event halts before its row".
- `Goal_Runtime_System.md:7506` @main: "Only user_cancelled is admitted by this positive route."
- `storage-plan.md:26178` @main: "The new combined route is explicitly selected by its own full native installed owner/profile."

### 2.4 How it names its producer
- `Executor_Protocol.md:8387` @main: "EP118's complete positive original_bounded_safe_stop_terminal_publication.v1 registration, D06 v3 methods and D01 coissued original outcome remain the exact producer authority."
- `storage-plan.md:26082` @main: "originally issued under the genuine positive original_bounded_safe_stop_terminal_publication.v1 registration". The same line: "Matching serialized issuer_method, profile, source hashes or role names alone does not prove original invocation."
- Its own projector profile is at `consumer.schema.json:1256-1257` @main: `const "goal_run_started_cancelled_projector.v1"`.

### 2.5 Projection, checkpoint, rebuild and retention
- Projection. `physical-families.json:6-8` @main: `goal_run_projection.started_cancelled.v4`, table `goal_run_projection.v4@<generation_id>`, key `goal_run_projection.v4:K(project_id):K(goal_run_id)`.
- Checkpoint. `physical-families.json:24-26` @main: `goal_run_started_cancelled_checkpoint.v1`, key `goal_run_started_cancelled_checkpoint.v1:K(storage_instance_id):K(project_id):K(goal_id):K(goal_run_id)`.
- Writer. `methods.json:79` @main is `owner.goal_run.started_cancelled.project_prefix.v1`. Line 112: "own complete projection and checkpoint only in one Storage transaction".
- Anchor. `storage-plan.md:26124` @main: "…"goal_run_started_cancelled_projector.v1", seed_hex, source_token_at_birth]))`. Generation id is `grscg_` + anchor_sha256." The same line: "The tenth actual redb_snapshot_id is a live fence only, never durable or manufactured."
- Rebuild. `storage_value_registry.json:111354` @main (row #280 `migration`): "No in-place v3-to-v4 conversion, no old checkpoint copying or automatic cutover." `storage-plan.md:26148` @main: "never copy an old row as retained source or rewrite an anchor".
- Retention. `physical-families.json:20` @main: "RP-PROJECTION-3GEN; derived original Event content never extends RP-RUNTIME-365D started or RP-AUTHORITY-INDEFINITE cancelled source lifetime". `storage-plan.md:26158` @main has the same source lifetimes.
- Preserve clause. `physical-families.json:3` @main: "entire existing v1/v2 and reviewed started-only v3 source/routes unchanged".

### 2.6 Storage rows (@main)
- #280 `goal_run_started_cancelled_projection` at svr line 111320. Producer at 111329, consumers at 111332.
- #281 `goal_run_started_cancelled_checkpoint` at svr line 111484. Consumers at 111496.
- `storage-plan.md:26174` @main: "Apply two additions to that actual whole baseline, yielding 282 Storage families; all 280 predecessor rows … remain exact."
- Verified: rows #278 and #279 are byte-identical before and after `a3c511657`. Their hashes are the same at `e686963ad`, `a3c511657`, `f6350caf2` and `origin/main`.

### 2.7 Event registry entry (@main)
- `event_family_registry.json:52-57`: `event-family-goal-run-cancelled`, `"family_revision": "3.0.0"`, owners GRS-080 and SP-312.
- `source_refs` at lines 91-93 name the consumer's `consumer.schema.json`, `methods.json` and the schema resource map.

### 2.8 What would have to change to accept v8 births
- In place is excluded for the same reasons as 1.8. `Goal_Runtime_System.md:7537` fixes the started-v3 profiles and methods. `source-method-composition.json:13-14` @main pins cancelled `methods.json` at sha256 `5a44e6ea…`, which equals main (verified).
- The v7 precedent made cancelled companions inside the certified successor (see 3.8).
- **Blocker for a v8 cancelled branch.** The cancelled route is positive-D06 only (GRS-080:7506 above). A1 says D06 is not available for v8 births:
  - A1 `Goal_Runtime_System.md:8301-8302` @982f66083: "NativeExecutionRevocationResult never validates as a D06 StopSource, SchedulerStop or RunOperationResult(operation=cancel), and full cancellation and D06 are unavailable for v8 births."
  - A1 `Executor_Protocol.md:8983-8984` @982f66083: "full original cancellation, D06 and GRS-078 steps 5 onward are unavailable for v8 births".
- So a v8 cancelled companion could be declared, but no v8 birth can produce the Event it reads. prop.: A2 states the v8 cancelled branch as "unavailable for v8 births until a D06 route is activated", or leaves it out and says why. Do not claim a live v8 cancelled branch.

---

## 3. Certified consumer (v5, combined started+cancelled+certified)

### 3.1 Files (`origin/main`, 18 files)
`protocol.md` (107 lines), `methods.json` (12 methods), `schemas/consumer.v1.schema.json`, and three companions:
- `companions/started-consumer.schema.json`
- `companions/cancelled-consumer.schema.json`
- `companions/cancelled-cancelled-causal-arguments.schema.json`

Plus `companion-differences.json`, `imports.json`, `resource-realms.json`, `source-variants.json`, `source-citations.json`, `source-method-composition.json`, `dependencies.json`, `owner-sources.json`, `commitment-domains.json`, `physical-retention-install.json`, `installed-profile.json` and `installed-profile-digest.txt`.

### 3.2 Owner units
The index line `Plans/00-plans-index.md:6011` @main says: "GRS-085 owns the mandatory started/cancelled/certified global-prefix projection; … SP-317 owns the two derived families and exact atomic checkpoint/3GEN rules; … BRS-029 owns original custody and coherent restore."

All eight units name `Plans/goal_run_certified_consumer_contracts` in their surfaces:
- GRS-084 (`Goal_Runtime_System.md:7803`) and GRS-085 (`:7875`)
- EP-124 (`Executor_Protocol.md:8609`)
- SP-316 (`storage-plan.md:26540`) and SP-317 (`:26613`)
- CV-352 (`Contracts_V0.md:23408`)
- ATS-057 (`Automated_Testing_System.md:5056`)
- BRS-029 (`Backup_Restore_System.md:1701`)

Landing: `f6350caf2` (2026-09-21). It added 9 Storage rows (285 → 294 families): 7 compact authority rows plus 2 consumer rows.

### 3.3 "Closed all_writers.v7 roster": verbatim (`goal_run_certified_consumer_contracts/protocol.md` @main)
- Line 5: "This proposal adds no native writer to the closed all_writers.v7 roster. Its passive source readers call the already composed native current and Storage guard APIs, with genuine independently registered Storage source access and held source fences. … It cannot alter the born native descriptor, silently enroll an older run, or make a caller-supplied guard authoritative. Any implementation needing an additional closed native participant requires a separately reviewed fresh composition before birth."
- Line 13: "Each per-Event branch selects its exact native birth/installed descriptor and original operation, not a caller profile string. Certified sources require the reviewed all_writers.v7 route; original-profile Start/cancellation sources keep their genuine old roster."
- Line 53: "Same-run started-v3, positive cancelled-v3 and this exact certified-v3 source/profile are the only supported transitions. Same-run replanned, blocked, stopped, any other GoalRun transition, unknown family or incompatible profile halts before its row. No v2 sibling is cast or skipped."
- `installed-profile.json:90` @main: `"native_writer_roster_changed": false`.
- `source-method-composition.json:25` @main: "does not enter or modify closed native writer roster. … No automatic enrolled run or old checkpoint cast."
- The scope clause repeated in GRS-084, GRS-085, SP-317, EP-124 and BRS-029, for example `Goal_Runtime_System.md:7893-7896` @main: "passive consumer source roles only for a genuine fresh pm.executor.workflow_source.all_writers.v7 birth and pm.goal_run_certified.producer_source.v2 prepare.v2 binding. Earlier native-v6 and producer-v1 source editions and old started/cancelled branches retain their original closed scope; no existing birth is enrolled or cast."

### 3.4 How it names the producer profile(s) it accepts (four places)
1. Descriptor pin. `installed-profile.json:86-87` @main: `"required_original_native_profile": "pm.executor.workflow_source.all_writers.v7"` and `"required_original_native_profile_digest": "0055de6c…"`. Verified: `0055de6c…` is the sorted-key compact SHA-256 of `goal_certified_event_coordinator_contracts/installed-profile.json` @main, and that file's `profile` (line 2) is `pm.executor.workflow_source.all_writers.v7`.
2. Composition. `source-method-composition.json:24` @main: `"native_profile": "owner.executor.workflow_source.all_writers.v7"`. This is an `owner.` prefix where 1 has `pm.`. **Three spellings exist in one directory**: `pm.…all_writers.v7`, `owner.…all_writers.v7`, and schema `"all_writers.v7"` (item 3).
3. Schema branch consts. `schemas/consumer.v1.schema.json` @main, `OriginalLegacySet` (1029-1091), is a closed `oneOf` of `"profile": {"const": "original_started_cancelled"}` (line 1044) and `"profile": {"const": "all_writers.v7"}` (line 1072). `LegacyProjectionEvidence` (1093-1119) requires `native_v7_starts` and `native_v7_cancellations`.
4. Per-profile methods in `methods.json` @main:
   - `read_current_started.original_profile.v1` (line 683) and `read_current_started.native_v7.v1` (line 817)
   - `read_current_cancelled.original_profile.v1` (line 963) and `read_current_cancelled.native_v7.v1` (line 1097)
   - Protocol line 95: "Current-started/current-cancelled retain their complete original current predicates, with distinct original-profile versus native-v7 method roots."

The reverse link: the v7 native descriptor names its consumer by path. `goal_certified_event_coordinator_contracts/installed-profile.json:222` @main: `"consumer": "Plans/goal_run_certified_consumer_contracts/installed-profile.json is separate passive component; complete actual installation/source/currentness required before admission, native NOT_RUN"`. Its 42 `members` do not include any consumer file (checked).

### 3.5 Projection, checkpoint, rebuild and retention
- Projection. `physical-retention-install.json:5-15` @main: family `goal_run_started_cancelled_certified_projection`, schema `pm.goal_run_projection.started_cancelled_certified.v5` 5.0.0, table `goal_run_projection.v5@<generation_id>`, key `goal_run_projection.v5:K(project_id):K(goal_run_id)`, writer `owner.storage.goal_run.started_cancelled_certified.publish.v1`, initiator `owner.goal_run.started_cancelled_certified.project_prefix.v1`.
- Checkpoint. Lines 18-27: `goal_run_started_cancelled_certified_checkpoint`, key `goal_run_started_cancelled_certified_checkpoint.v1:K(storage_instance_id):K(project_id):K(goal_id):K(goal_run_id)`.
- Writers. `methods.json:270` @main (`project_prefix`): "own derived row and checkpoint only". Line 1518 (`publish`): "atomic own derived row plus whole checkpoint; stage/advance/cutover only". The other ten methods have `"effects": "none"`. This differs from v3/v4: the Storage `publish.v1` is the registry `producer` for v5.
- Anchor. `protocol.md:69` @main: "`anchor_sha256 = SHA256(encode(["goal_run_started_cancelled_certified_anchor.v1", storage_instance_id, scope, "goal_run_started_cancelled_certified_projector.v1", profile_digest, seed_hex, source_token_at_birth]))`. Generation id is `grsccg_` + anchor_sha256. The immutable birth token is the complete durable nine-field SP278 token; its tenth real redb snapshot id is a live fence, never durable or fabricated."
- Profile digest. `protocol.md:67` @main: "Let `profile_digest` be SHA-256 of the entire installed consumer profile's sorted-key compact UTF-8 JSON". The recipe reproduces `installed-profile-digest.txt:1` (`fca86d74…`); verified.
- Rebuild. `protocol.md:81-83` @main: "Stage allocates a legal free generation slot, creates a fresh empty isolated dataset…" and "never copy a prior derived row as original source or edit an immutable anchor." `storage-plan.md:26627` @main (SP-317): "Never copy an old checkpoint or reinterpret old row bytes."
- Retention. `physical-retention-install.json:31-46` @main quotes the exact `RP-PROJECTION-3GEN` object. Lines 59-64 give the source lifetimes: "started": "original RP-RUNTIME-365D unchanged…"; "certified" and "cancelled": "original RP-AUTHORITY-INDEFINITE unchanged…". `protocol.md:99-103` @main, P8, says the same.
- Backup. `physical-retention-install.json:65-68` @main: original mandatory; derived "optional coherent root/generation/dataset whole unit".
- Preserve clause. `physical-retention-install.json:71` @main: "entire original started/cancelled physical-families.json and schema/method/generation contracts remain exact".

### 3.6 Storage rows (@main)
- #292 `goal_run_started_cancelled_certified_projection` at svr line 112623. Producer at 112632 is `owner.storage.goal_run.started_cancelled_certified.publish.v1`. Consumers at 112635 are `project_prefix.v1`, "whole historical/current methods in Plans/goal_run_certified_consumer_contracts/methods.json", and "original coherent optional derived backup/restore under BRS-029".
- #293 `…_checkpoint` at svr line 112794. Consumers at 112806.
- Row #292 `migration` (svr line 112653): "preserve every prior started-only/started-cancelled profile, key, schema, method and checkpoint … no old checkpoint copying, in-place row/header reinterpretation or native action."
- Verified: rows #280 and #281 are byte-identical across `f6350caf2`.

### 3.7 Event registry entry (@main)
- `event_family_registry.json:102-143`: `event-family-goal-run-certified`, `"family_revision": "3.0.0"` (line 103).
- `source_refs` (lines 132-138) name GRS-084, CV-352 and the coordinator. **They do not name the consumer directory**, unlike the started and cancelled rows.
- The anchors stayed on the old units (lines 106-107). Step 8(d) routed them by owner text, not by a registry change. `reports/event-authority-20260911/step-08-certified-anchors-20260924.md:9` @main: "**Disposition: a bounded owner edit, not a registry change.** The registry row, and so the approved checkpoint `2026-09-11.2` … stays unchanged."
- The route lives in SP-214. `storage-plan.md:15166-15176` @main: "GRS-085 governs the mandatory started/cancelled/certified per-Workflow-run prefix projection that carries the durable GoalRun projection role of this unit".

### 3.8 How v7 was taken on (the companion mechanism)
- `companion-differences.json:2` @main: "Only exact $id and $ref resource prefix replacements; full original files retained; every semantic root difference listed".
- 190 changes: 48 for the started schema, 119 for the cancelled schema, 23 for the causal arguments.
- The `uri_map` (line 1145) maps:
  - `executor_workflow_original_start.v2` → `.v6`
  - `workflow_start_original_custody.v2` → `.v6`
  - `workflow_cancel_positive_safestop.v1` → `workflow_cancel_original_start_profile.v6`
  - `workflow_cancel_positive_arguments.v1` → `.v2`
  - plus the three consumer `$id`s → `…native_v7.v1`
- `protocol.md:9` @main: "Original instance header/issuer literals are never text-rewritten. An old closed argument is never populated with a new native wrapper."

### 3.9 What would have to change to accept v8 births
- **In place is excluded.** A1 states it at `Goal_Runtime_System.md:8199-8203` @982f66083: "EP-124, GRS-084, GRS-085, CV-352, SP-316, SP-317, ATS-057 and BRS-029 keep their all_writers.v7 and producer_source.v2 scope unchanged. The goal_run.certified registry row, the GRS-085 projection, the SP-317 families and the v7 certified consumer, which requires all_writers.v7 with descriptor digest 0055de6c…, do not admit or project the certified rows or Events of a v8 birth". A1 also has `workflow_combined_source_contracts/external-consumer-adoption-boundary.json:11` @982f66083: "It is not cast to combined v8 by matching common fields, Event type, URI alias or validation namespace."
- **Every byte change moves the anchor.** Any edit to a pinned member (`installed-profile.json:4-84`) changes `installed-profile.json`. That changes `profile_digest`, which is in the anchor preimage (`commitment-domains.json:14-22` @main). v5 generations would no longer match their own profile.
- **A new version of the v5 files has no precedent.** Each step so far (v3 → v4 → v5) was a new successor with new families and a new projector profile.
- **What a successor would need, by analogy with v5** (prop., all identifiers to be taken at landing per A3's rule R2):
  - A new directory and schema `$id`.
  - A new projector profile const and a new anchor/frontier domain.
  - A new generation prefix, distinct from `grsg_`, `grscg_`, `grsccg_` and A1's draft `grscrg_`.
  - Dataset `goal_run_projection.v6` and two new Storage rows.
  - `required_original_native_profile` becomes a list, or one branch per profile. It must include v8 with its digest `7b22c1f4…`, which is A1 `workflow_combined_source_contracts/installed-profile-digest.txt` @982f66083 and verified by recomputation.
  - A third `OriginalLegacySet` branch, `"all_writers.v8"`, next to the two existing ones.
  - v8 companions with a `uri_map` to A1's v8 roots, and `…native_v8.v1` current-read methods.
  - Certified `$ref`s moved from start v6, standard v4 and coordinator v1 to A1's start v7, `workflow_standard_current_source.v5`, `workflow_standard_certification_argument.v5` and `coordinator/schemas/coordinator.v2.schema.json`.
  - Per A3's recommended order (A3 design §5, table "Recommended order"), v6 would still halt on stopped, blocked and replanned.
- Name check only: every `$defs` name the v7 companions reach also exists in A1's successor roots (start custody v6→v7, original start v6→v7, cancel start profile v6→v7, cancel positive arguments v2→v3, standard current source v4→v5, certification argument v4→v5). Meaning has not been compared.
- **The v8 descriptor does not name a consumer, and cannot without changing its digest.** A1 `workflow_combined_source_contracts/installed-profile.json:24` @982f66083: `"consumer": "None admitted. The certified v8, Replan and started/cancelled combined-profile consumers and the projector, checkpoint, backfill and retention declarations are A2's."` That field is inside the digest preimage; the digest exclusions list does not name it. In v7 the descriptor named its consumer (3.4). prop.: A2 links from the consumer to the v8 descriptor only, and does not edit the v8 descriptor.
- **The v8 digest is not final.** A1 `reports/event-authority-20260911/replan-v8/STATUS.md:62` @982f66083: "Do not land A1 until Jared answers card C-4 … Option 1 … changes the v8 descriptor digest". A2 cannot pin `7b22c1f4…` until C-4 is answered.

---

## 4. Durable token names (P-02 context)

- All three consumers store the nine-field `DurableGenericToken` under two names that are not `*_read_token`:
  - started: `consumer.schema.json:178` (definition, 9 required fields), `:315` `generic_token`, `:414` `source_token_at_birth`
  - cancelled: `:1262` `source_token_at_birth` in `CombinedGeneration`, which reaches `ProcessedPrefix.generic_token` via `:315`
  - certified: `schemas/consumer.v1.schema.json:496`, `:633`, `:733`
- None has `redb_snapshot_id`, so all three follow DL-076 item 2 (`Decision_Log.md:1496` @main: "A stored read token is the nine-field durable token that the goal_run consumers already store as `DurableGenericToken`").
- The §2.3.1 readiness naming rule is stricter. `storage-plan.md:519` @main: "A field named `read_token` or ending in `_read_token` is a read selector … Any other schema under such a name, or either schema under another name, remains a secret-material failure."
- The three canon checkpoint rows escape that check only because their inline `value_schema` reaches `Generation` through an external `$ref`. Checked: none of rows #279, #281 or #293's inline `value_schema` contains `source_token_at_birth` or `generic_token`. A1 says the same of its own rows at `storage-plan.md:27157-27159` @982f66083: "Every row's record is an external $ref, which the readiness checks do not follow".
- A1 hands the names to A2 with a Storage-owner ruling. `storage-plan.md:27161-27164` @982f66083: "The consumer's source_token_at_birth and generic_token belong to its unregistered projection checkpoint … with a Storage-owner ruling on their names under section 2.3.1; that question goes to the Storage owner before the consumer-adoption work A2 registers the checkpoint successor."
- Precedent value: three landed checkpoints already use these names, so a successor that keeps them follows precedent. The §2.3.1 text still says the names fail. The Storage owner has to rule (U3-Q7).

---

## 5. How the three consumers were admitted (the record form)

- **No DL-077 admission record exists for any of them.** `reports/event-authority-20260911/admission-records/` @main holds only `browser.workspace.created.json`, `browser.workspace.reset.json` and `context.compaction.completed.json`.
- DL-077 records are for "one per family registered beyond Known37 and the two August families" (`step-10-post-august-admission-receipt.json:33` @main). A record requires "family_count exactly one more" (`:40`). A row revision cannot meet that.
- The three are original-37 rows. Their consumer adoption was an owner-unit compile plus a Step 08 validation pair:
  - started: `step-08-goal-run-started-v3-validation.md` plus `…-checks.json` (`e686963ad`). Line 3 @main: "GRS-079, EP-120, SP-311 and BRS-027 adopt the complete original `goal_run.started` v3 producer/read/projector/checkpoint contract and select revision 3.0.0 on that one existing Event row." Line 11: an external root-evidence manifest pinned by SHA-256.
  - cancelled: `step-08-goal-run-cancelled-v3-validation.md` plus `…-checks.json` (`a3c511657`).
  - certified: `step-08-certified-family-integration-20260921.md` (`f6350caf2`), with frozen-source, independent-review and repository-check manifests pinned by SHA-256.
- **Event registry.** Each landing moved one row to `family_revision` 3.0.0 and edited its `source_refs`. `registry_revision` stayed `"2026-09-11.2"` in all of them, while the file SHA changed (checked at `e686963ad`, `a3c511657` and `f6350caf2`).
- **The checkpoint approval came after the fact.** `step-08-checkpoint-2026-09-11.2.md:3` @main: "On 2026-09-23 Jared approved the live 42-family registry as the PNC-019 comparison checkpoint". Line 6: "The two differ in one row, landed in `a73cb06d10`: `goal_run.certified` moved from 2.0.0 to 3.0.0."
- **The live check compares the SHA as well.** `scripts/pm_pnc019_currentness.py:174-179` @main requires `registry_status.get("sha256") == sha256_file(live_registry)`, else `event_authority_currentness_live_registry_drift`. `:256-290` compares only schema ID, version, revision and row count for `event_authority_checkpoint_changed_requires_fresh_approval`.
- **Storage rows.** They were added in the same landing as the owner units, with no DL card: 278→280, 280→282, 285→294. Per `storage-plan.md:523` @main, readiness "re-pins them only to landed, recorded registry changes."
- **Technical authority.** DL-045 lists `goal_run.cancelled`, `goal_run.certified`, `goal_run.replanned`, `goal_run.started` and the others as "R — registered depth only" (`Decision_Log.md:584` @main). Its limits (`:564`): "New definitions are limited to technical identity and scope joins, concrete checkpoint values and cursors, atomic projection/advancement, replay, currentness, recovery and withdrawal … This approval does not decide … retention/deletion policy".

---

## 6. Is a consumer-roster change a registry-row revision under DL-078 / Q-02?

- **DL-078 covers only registrations.** `Decision_Log.md:1571` @main: "Any other registry change still needs Jared's own checkpoint approval, and so does a registration that skips any part of the procedure."
- **Q-02 ruling.** `process-answers-20260925.md:7` @process-answers ref: "DL-078 does not cover a revision of an existing registry row. … So every A3 landing that changes a registry row (family revision, payload successor, owners, source refs) needs its own checkpoint approval card before it lands, in the DL-036 form, carrying the exact before and after rows and the registry SHA-256 before and after." It names A3. Applying it to A2 is by analogy.
- **Consumer changes need not touch an Event registry row.**
  - The Event registry has no consumer field.
  - Only the started and cancelled rows name their consumer, in `source_refs` (`event_family_registry.json:91-93`, `:232-234`).
  - The v5 certified consumer landed without adding itself to the certified row (`:132-138`).
  - The later certified routing was done in owner text "not a registry change" (3.7).
  - A1 also says "the unchanged Event registry still selects existing original families" (`external-consumer-adoption-boundary.json:15` @982f66083).
- **Storage rows are a different registry.** The consumer rosters proper (`consumers` arrays) live in `storage_value_registry.json`. The precedent adds successor rows and never revises the predecessor rows (2.6, 3.6). That registry is not the PNC-019 checkpoint, and DL-078 and Q-02 do not speak to it.
- **Conclusion.** prop.:
  - (a) If A2 adds successor Storage rows and routes by owner text only, like SP-214's certified paragraph, no Event registry row changes. Then no Q-02 card is needed for A2, and the registry SHA stays `0be54418…`.
  - (b) If A2 adds its v6 consumer to the `source_refs` of the started, cancelled or certified rows, following the started/cancelled habit, that is a registry-row revision. By analogy with Q-02 it needs its own DL-036 checkpoint card per row revision, and it trips `event_authority_currentness_live_registry_drift` until reseal.
  - Recommend (a). Let A3 carry any Event row changes it needs anyway.

---

## 7. Other findings for A2

1. **The certified consumer's pins are stale on main.**
   - `owner-sources.json:53` @main pins `storage_value_registry.json` at `8556e243…`; main is `32d267dd…`.
   - Line 5 pins `Goal_Runtime_System.md` at `ccedade9…`; main is `f233eb9c…`.
   - Line 17 pins `storage-plan.md` at `32885861…`; main is `011b8877…`.
   - `physical-retention-install.json:49` also pins `8556e243…`.
   - A1 changes `Backup_Restore_System.md` to `2338d293…`, which will make the line-29 pin (`c4f00ec4…`, current on main) stale too.
   - A1 STATUS (`STATUS.md:50-52` @982f66083) carries this as reseal item R-1.
   - Precedent `7ad1ffff6` re-pinned these in place and so changed `installed-profile-digest.txt` from `4889958a…` to `fca86d74…`. That is a change to the anchor-bearing consumer profile digest.
   - prop.: A2 does not re-pin the v5 consumer. It records the tension for the reseal owner.
2. **The profile spelling is inconsistent inside the v5 directory** (see 3.4 item 2). prop.: the v6 successor uses one spelling, `pm.executor.workflow_source.all_writers.v8`, and cites A1's exact string (`installed-profile.json:1002` @982f66083).
3. **The v5 Storage rows use URIs where the older rows use paths.** Row #292 `value_schema_ref` is a URI (`https://puppetmaster.local/proposals/goal_run_started_cancelled_certified_consumer.v1.schema.json#/$defs/StorageProjection`, svr line 112630). Rows #278 and #280 use a `Plans/…` path (svr lines 111065, 111327). prop.: A2 picks one form and states it.
4. **A1's placed Replan consumer root was built from v4, not v5.** Its schema has the v4 started+cancelled definitions (`const "goal_run_started_cancelled_projector.v1"` at `replan/schemas/goal-run-started-cancelled-replanned-consumer.v1.schema.json:1257`) and adds `goal_run_started_cancelled_replanned_projector.v1` (`:1909`) with prefix `grscrg_` (`:1977`) @982f66083. It has no certified branch, which matches A3 design §5 R1. Rebasing it onto the head of the chain is A2 or A3-replanned work.

## 8. Open questions (for the A2 design)

- U3-Q7 (Storage owner): the names `source_token_at_birth` and `generic_token` against `storage-plan.md:519`.
- The v8 descriptor digest waits on card C-4 (A1 STATUS:62).
- The v8 cancelled branch (2.8): declare it unavailable, or leave it out.
- The spelling of the successor stem and generation prefix. This is A3 T-11 and O-S4-02/03, to be agreed with A3.
- Whether A2 edits any Event registry `source_refs`. Recommended no (section 6).
