# R5: A2 registry, storage, readiness and governance consequences

Reader R5 for Replan v8 Step 8(b) Group A, branch A2 (consumer adoption). Read-only. Nothing in the repository was edited.

Refs read (fetched 2026-09-25):
- `origin/main` = `63cf2cb97f936c91dd7bb5c585d9a35d8409ed61`.
- `origin/plans/replan-v8-a1-20260925` (called "A1" below) = `e8d61ace4c219723022fd9fea7187ffedc8b3b14`. It is 27 ahead of main and 0 behind.
- `Plans/event_family_registry.json` is byte-identical on main and A1: SHA-256 `0be544181eda423dcea4d8661206e7da6d066fdcf51913d5962f1a283635c842`, `registry_revision` `2026-09-11.2`, 42 families.
- `Plans/storage_value_registry.json`: main `32d267dd…0f46` (294 families, 27 policies). A1 `45e383b2…4c13` (328 families, 27 policies).

"prop." marks a proposal. "Inference" marks a reading that is not stated in the cited text.

---

## 1. Event registry rows: which list consumers, and how

The registry row has no consumer field. The row schema is closed. `Plans/event_family_registry.schema.json:305-319` @origin/main: `"family": { "type": "object", "additionalProperties": false, "required": [ "family_id", "family_revision", … "source_refs", "retention_policy_ref" ]`. So a consumer can appear in a row only as a path in `source_refs`.

The six `goal_run.*` rows on origin/main (same bytes on A1). Row fingerprint = SHA-256 of sorted-key compact JSON, the recipe of `scripts/pm-browser-event-admission.py:124-125` @origin/main (`json.dumps(value, sort_keys=True, separators=(",", ":"))`).

| Row | Event | Revision | Consumer paths in `source_refs` | Retention | Fingerprint |
|---|---|---|---|---|---|
| `/families/0` | goal_run.blocked | 2.0.0 (line 11) | none (lines 40-44, 3 refs) | RP-AUTHORITY-INDEFINITE (47) | `f137e724…b4a5` |
| `/families/1` | goal_run.cancelled | 3.0.0 (53) | yes: `goal_run_cancelled_consumer_contracts/consumer.schema.json`, `…/methods.json`, `goal_run_cancelled_consumer_schema_resources.json` (91-93) | RP-AUTHORITY-INDEFINITE (97) | `f60bbabf…af6b` |
| `/families/2` | goal_run.certified | 3.0.0 (103) | **none.** It lists the coordinator only: `"Plans/goal_certified_event_coordinator_contracts/protocol.md"` (136). `goal_run_certified_consumer_contracts/` is not listed | RP-AUTHORITY-INDEFINITE (141) | `f58cc6a7…654e` |
| `/families/3` | goal_run.replanned | 2.0.0 (147) | none (176-180) | **RP-RUNTIME-365D** (183) | `cfbe2a47…eb55` |
| `/families/4` | goal_run.started | 3.0.0 (189) | yes: `goal_run_started_consumer_contracts/consumer.schema.json`, `…/methods.json`, `goal_run_started_consumer_schema_resources.json` (232-234) | RP-RUNTIME-365D (238) | `3b6a4abd…daeb` |
| `/families/5` | goal_run.stopped | 2.0.0 (244) | none (273-277) | RP-AUTHORITY-INDEFINITE (280) | `8acbc249…e0a3` |

All line numbers are in `Plans/event_family_registry.json` @origin/main.

How the consumer refs got there (history on origin/main):
- `e686963ad` ("adopt original Workflow started v3 event consumer and checkpoint") changed the started row: `family_revision` 2.0.0 → 3.0.0, a new payload schema, and nine added `source_refs`, three of them consumer paths.
- `a3c511657` did the same for cancelled.
- `f6350caf2` ("integrate complete certified event source family") revised the certified row to 3.0.0, but added no consumer path. The certified consumer directory landed in that same commit.
- In all three, the consumer refs came with a payload successor. No commit on main adds a consumer ref to a row without also changing its payload. (This is an observation from these three diffs, not a stated rule.)

## 2. Does a consumer entry change the row fingerprint? Is it a row revision?

Yes. `source_refs` is part of the row, and the fingerprint hashes the whole row. The change is caught three ways:

1. **Per-row pins.** `scripts/pm-browser-event-admission.py:48-78` @origin/main (`REVIEWED_GOAL_SUCCESSORS`) pins the current whole-row fingerprints of started (`3b6a4abd…`), cancelled (`f60bbabf…`) and certified (`f58cc6a7…`). These equal the live values in section 1.
   - Any other fingerprint raises `"unreviewed_preexisting_successor: "` (line 141).
   - A missing adopted pin gives `"required_preexisting_successors_missing"` (line 225).
2. **Whole-set pins.** Rows without a pin, which include replanned, stopped and blocked, are compared as a set with `ORIGINAL39_SHA256` (line 27). A change gives `"historical_preexisting_baseline_mismatch"` (line 206).
3. **Admission-manifest pin.** `CURRENT39_SHA256` (line 31) equals `Plans/browser_event_admission.json:8` `"preexisting_family_rows_sha256"`.

So adding an A2 consumer path to any of the six rows means:
- a new pin pair in that script;
- a registry SHA change;
- under the process ruling, a checkpoint card for each row. `reports/event-authority-20260911/replan-v8/process-answers-20260925.md:7` @origin/plans/replan-v8-process-answers-20260925 says: "DL-078 does not cover a revision of an existing registry row … every A3 landing that changes a registry row (family revision, payload successor, owners, source refs) needs its own checkpoint approval card before it lands, in the DL-036 form, carrying the exact before and after rows and the registry SHA-256 before and after."
- DL-078 agrees: `Plans/Decision_Log.md:1571` @origin/main, "Any other registry change still needs Jared's own checkpoint approval".

The ruling names A3, but its reason covers any change to a registered row. Applying it to A2 is inference; the text does not name A2.

**prop. R5-P1: A2 changes no Event registry row.** Follow the certified precedent: declare the consumer in owner prose, in its consumer directory and in the Storage rows, not in `source_refs`. Result:
- no Q-02 card;
- no `REVIEWED_GOAL_SUCCESSORS` or `CURRENT39_SHA256` re-pin;
- no PNC-019 move, since `scripts/pm_pnc019_currentness.py:50` `EVENT_FAMILY_REGISTRY_REVISION = "2026-09-11.2"` is untouched.

The payload schemas do not name a writer profile. A grep for `all_writers|profile` in `goal-run-started.v3`, `goal-run-cancelled.v3` and `goal-run-certified.v3` @origin/main returns nothing. So v8 births need no payload successor for those three rows.

**Caveat.** A1 `Plans/Goal_Runtime_System.md:8201-8203` (GRS-088) @A1 says: "The goal_run.certified registry row, the GRS-085 projection, the SP-317 families and the v7 certified consumer … do not admit or project the certified rows or Events of a v8 birth". If A2 reads this as needing a certified row revision (for example `source_refs` to the v8 coordinator `v2` roots), that is a row revision and needs a Q-02 card. R5 recommends reading the sentence as a statement about the consumer and projection, not about the row. That is a reading for the A2 author to confirm. Replanned, stopped and blocked row changes are A3's: A1 report line 178 @A1 says A3 "owns the goal_run.replanned, goal_run.blocked and goal_run.stopped contracts, their registry rows and payload successors".

**Registry SHA churn.** The certified consumer pins the whole registry file:
- `Plans/goal_run_certified_consumer_contracts/owner-sources.json:41` @origin/main: `"sha256": "0be544181eda…c842"`;
- the same value in `source-citations.json:213` and `Plans/goal_certified_family_composition.json:41`.

Unlanded `origin/plans/ea-s09-coord-registered-20260925` (0 behind main) appends `coordination.agent_registered`. It moves the registry to `2026-09-25.1`, 43 families, SHA `4227be36…3e70`, and leaves all six `goal_run.*` fingerprints unchanged. Every later Step 9 landing moves the SHA again.

prop. R5-P2: A2 pins the six `goal_run.*` rows by row fingerprint, plus the registry SHA at A2's own base, re-taken at rebase. A whole-file pin goes stale with every coordination or collaboration admission.

## 3. Storage families A2 needs (new rows after `/families/327`)

**Precedent: each consumer successor added exactly two new rows and changed no existing row.** Checked by diffing each landing's parent against the commit:

| Commit | Families | New rows | Existing rows changed |
|---|---|---|---|
| `e686963ad` | 278 → 280 | `goal_run_started_projection`, `goal_run_started_checkpoint` | 0 |
| `a3c511657` | 280 → 282 | `goal_run_started_cancelled_projection`, `…_checkpoint` | 0 |
| `f6350caf2` | 285 → 294 | 7 `goal_certified_event_*` rows plus `goal_run_started_cancelled_certified_projection` and `…_checkpoint` | 0 |

Current head of the chain (origin/main `Plans/storage_value_registry.json`):
- 112623: `"family_id": "goal_run_started_cancelled_certified_projection"`, `"key_shape": "goal_run_projection.v5:K(project_id):K(goal_run_id)"`, `redb_projection`, `messagepack_canonical`, `"retention_policy_ref": "RP-PROJECTION-3GEN"`, owner `SP-317`.
- 112794: `…_checkpoint`, key `goal_run_started_cancelled_certified_checkpoint.v1:K(storage_instance_id):K(project_id):K(goal_id):K(goal_run_id)`.

A1 has these rows at `/families/292` and `/families/293` and ends at `/families/327` `workflow_combined_slot_origin` (A1 line 116553).

A1's draft row #23, which was not registered:
- A1 `Plans/workflow_combined_source_contracts/physical-families.json:237-239`: `"family_id": "goal_run_started_cancelled_replanned_checkpoint"`, `"status": "A2_SUCCESSOR_REQUIRED_NOT_REGISTERED"`, `"key_shape": "goal_run_started_cancelled_replanned_checkpoint.v1:H(storage_instance_id):…"`.
- It has codec `pm.workflow.activation_source_json.v1`, retention `RP-PROJECTION-3GEN` and producer `owner.workflow.replan.project.v1`.
- Its generation prefix is `grscrg_` (A1 `replan/schemas/goal-run-started-cancelled-replanned-consumer.v1.schema.json:1977`).
- It has no certified branch. Its predecessors are v3 and v4 (`"const": "pm.goal_run_projection.started_cancelled.v4"`, line 1405).

**prop. R5-P3: storage rows for A2.**

- **(a) Required: one pair for the next chain successor `goal_run_projection.v6`.** This follows O-15 (A1 design line 650: "A2 and A3 agree one `goal_run_projection.vN` chain") and A3-stopped design section 5, table line 308 ("`v6` | A2 | v8-birth started, cancelled and certified").
  - Two families: a `redb_projection` and a `redb_checkpoint`. Both materialized, tier `later_gui_or_feature_projection`, `RP-PROJECTION-3GEN`, `rebuild_from_authority` / `derived_rebuildable`, as the SP-317 rows.
  - Names are open. The A3 design suggests a chain-neutral stem `goal_run_lifecycle_projection` / `_checkpoint` (O-S4-03). Any new stem must avoid `grsg_`, `grscg_`, `grsccg_` and `grscrg_`.
  - `recovery_disposition.source_family_ids` must add the A1 rows v6 reads. SP-317's list has 64 ids and ends at `workflow_start_origin`.
- **(b) Not a separate row: draft #23.** A3 design line 298 (rule R1) says: "There is no second projector for the per-run role." The Replan branch joins the chain later (A3 table line 311: "`v9` | A2/A3-replanned | replanned branch"). #23 is re-keyed to the chain conventions (`K(...)`, CV339 MessagePack) and does not stay a separate H-keyed JSON checkpoint. This is an inference from R1. The A1 text does not decide it.
- **(c) Open: v8 certified Storage admission.** A1 GRS-088 (`Plans/Goal_Runtime_System.md:8204-8205` @A1): "The certified values of v8 births use the seven goal_certified_event_* physical names, headers and keys under the v2 roots; their Storage admission for v8 births is unavailable until a separate Storage revision, and SP-316 is unchanged". The A1 report lists it as its own open item (line 179), not under A2.
  - It is either a revision of rows `/families/285`-`/families/291` or new rows.
  - A revision re-points `Plans/goal_certified_family_composition.json` `registry_schema_resolution_bindings` (for example `"/families/285/value_schema"`).
  - A2 cannot admit v8 certified Events into v6 without it. Owner not assigned.

**Numbering.** No unlanded origin branch appends Storage families, other than A1. Method: the family-id set of every branch that touches the registry was compared with main. All show 294 families except A1 (328) and the stale `fix/packet-gap-closure-20260911-landing-dc5` (88 families, 635 behind main).

The A3-stopped design (scratchpad, not pushed) plans "+4 custody (landing 1) +2 projection (landing 2)" (line 276). So:
- If A2 lands right after A1, its pair is `/families/328`-`/families/329`.
- If A3-stopped landing 1 lands first, the pair is `/families/332`-`/families/333`.

Pointers, census and `source_family_ids` are taken at landing (A3 rule R2, line 300).

## 4. Census pins that re-pin

The pins at A1 (A2 moves every one of them):

| File @A1 | Line | Pin at A1 |
|---|---|---|
| `scripts/pm-implementation-readiness.py` | 765 | `STORAGE_VALUE_REGISTRY_EXPECTED_FAMILY_COUNT = 328` |
|  | 766 | `…RETENTION_POLICY_COUNT = 27` |
|  | 768 | `"materialized": 308` |
|  | 774 | `"later_gui_or_feature_projection": 285` |
|  | 758-764 | provenance comment |
| `tests/test_pm_assistant_contract_closure.py` | 601 | `len(REGISTRY["families"]), 328` |
| `tests/test_pm_onboarding_phases.py` | 315-316 | family count and unique ids, 328 |
|  | 334 (main line) | `len(self.registry["retention_policies"]), 27` |
| `tests/test_shared_runtime_storage_contracts.py` | 219, 224 | 328 families, `"materialized": 308` |
| `Plans/storage-plan.md` | 523 | "The current pin, set by the Replan v8 A1 landing of 2026-09-25, is 328 families and 27 retention policies: 308 materialized …" |

prop. Census after A2's pair (a) on A1: **330 families, 310 materialized, 287 later-GUI**. The policy count is unchanged when `RP-PROJECTION-3GEN` is reused.

**Conflicts with other branches.** Unlanded `origin/plans/ea-storage-retention-20260925` (0 behind main) adds `RP-CHAT-THREAD-LIFETIME`, so there are 28 policies. It re-pins the same readiness line (`…RETENTION_POLICY_COUNT = 28`), `tests/test_pm_onboarding_phases.py` (`…retention_policies"]), 28)`) and `storage-plan.md:523` ("294 families and 28 retention policies"). A1 and the retention branch both rewrite line 523 and the readiness comment block. Whichever lands second rebases them. A2 then pins 330 families and **28** policies if the retention branch has landed.

Five other branches also touch `tests/test_pm_onboarding_phases.py` without adding families. For example `fix/server-pairing-issuance-rebased-20260925` and `fix/packet-canon-repairs-rebased-20260925` (both 72 behind main). This is a textual rebase risk only.

Historical census lines stay. A1 design line 458: "`storage-plan.md` 18890, SP-316's '285' and the composition's `storage_final_families: 294` are historical records".

## 5. Retention for the projection and checkpoint

- **DL-045 does not cover retention.** `Plans/Decision_Log.md:564` @origin/main: "This approval does not decide new features, user-visible integrations, retention/deletion policy, or competing-owner choices. Those remain genuine product decisions." DL-090 repeats it at line 2032: "They may not decide features, retention or which owner wins a conflict. Those still come to you."
- **A new policy object would be Jared's.** A card is needed.
- **Reusing the existing `RP-PROJECTION-3GEN@1.0.0` has three precedents with no Decision Log entry.**
  - The policy is at `storage_value_registry.json:175-189` @origin/main: `current_plus_history`, ttl 604800, max 3 per logical key, `rebuild_projection`.
  - SP-317 (`Plans/storage-plan.md` @origin/main, PlanUnit at 26616) states "Exact RP-PROJECTION-3GEN@1.0.0 means no current TTL, maximum three staged/current/retired generations together …". Its `depends_on` is only `PDS-003` and `SP-316`.
  - SP-311 and SP-312 do the same.
  - A1's draft #23 already names `RP-PROJECTION-3GEN`.
- **The reuse check applies.** The retention branch states the rule: `Plans/storage-plan.md:17282` @origin/plans/ea-storage-retention-20260925, "reuse only when the object's owner defines the required role, version and scope, and never from a sibling or a descriptive role". The owner role of `RP-PROJECTION-3GEN` is derived projection generations. A2's rows have that role, so reuse is an owner assignment, not a new policy (prop.).
- **Source coupling needs owner text, not a new policy.** The v5 row's `retention_compaction` couples "started: original RP-RUNTIME-365D …; cancelled/certified: RP-AUTHORITY-INDEFINITE" (origin/main 112623 ff.). v6 must add the v8 sources, which are A1's `RP-AUTHORITY-INDEFINITE` rows and `workflow_replan_producer` `RP-RUNTIME-365D`. A later replanned branch couples to the `goal_run.replanned` row's `RP-RUNTIME-365D` (registry line 183). This stays an owner statement unless:
  - A3 changes a row's retention, or
  - the projection holds content whose deletion no owner text covers. Example: A1 O-13, `GraphPatchIssuedSnapshot` full `WholeGraphPatch` under indefinite retention (A1 design line 470).

  Either case is a product question for Jared.

## 6. Tokens (P-02) and DL-076

- DL-076 (origin/main `Plans/Decision_Log.md:6419`): "SP-278 defines the nine-field durable read token … and no stored value holds redb_snapshot_id."
- Readiness naming rule, `Plans/storage-plan.md:519` @origin/main: "A field named `read_token` or ending in `_read_token` is a read selector … Any other schema under such a name, or either schema under another name, remains a secret-material failure."
- The consumer fields `source_token_at_birth` and `generic_token` do not match that name pattern.
- All three canon consumers already store them behind external `$ref`s. On origin/main:
  - `goal_run_certified_consumer_contracts/schemas/consumer.v1.schema.json:733` `"source_token_at_birth": { "$ref": ".../DurableGenericToken" }`;
  - `goal_run_started_consumer_contracts/consumer.schema.json:315, 414`.
- A1 SP-321 (`Plans/storage-plan.md:27161-27164` @A1) defers this: "The consumer's source_token_at_birth and generic_token belong to its unregistered projection checkpoint … with a Storage-owner ruling on their names under section 2.3.1; that question goes to the Storage owner before the consumer-adoption work A2 registers the checkpoint successor."
- The ruling belongs to the Storage owner, not to Jared, and it comes before A2's rows. U3's option (i), `a1-scope/U3-replan-storage.md:372`: keep the names, and record that line 519 governs the inline value schema.

## 7. Unit-id and number collisions with other threads

**Method.**
1. Collect `plan_unit_id:` values in `Plans/*.md` on every origin branch that is ahead of main, and diff them against main.
2. Grep `Plans reports scripts tests` on every branch for the ids above A1's.

**Main maxima:** EP-124, GRS-085, CV-353, SP-320, ATS-058, BRS-029, DL-093.

**Claims on unlanded branches (as `plan_unit_id`):**

| Branch | Ahead / behind main | Claims |
|---|---|---|
| `plans/replan-v8-a1-20260925` | 27 / 0 | EP-125..127, GRS-086..089, CV-354, SP-321, SP-322, ATS-059, ATS-060, BRS-031 |
| `fix/packet-canon-repairs-20260924` | 71 / 279 | BRS-030 |
| `fix/packet-canon-repairs-rebased-20260925` | 73 / 72 | BRS-030 |
| `fix/server-pairing-issuance-rebased-20260925` | 115 / 72 | BRS-030, **DL-094..098** |
| `plans/ea-s09-coord-registered-20260925` | 17 / 0 | **DL-094** |
| `plans/ea-s09-decisions-hb-scope-20260925` | 6 / 0 | **DL-095, DL-096** |

- DL-094 to DL-096 are claimed twice across threads. That collision already exists between those branches and is not A2's.
- `origin/main:tests/test_pm_coordination_events.py:671-672` already expects `DL-094` for `coordination.agent_registered`.
- `TOUCH-BRS-032…` in `Plans/touch_closure.json:12666` is a different id namespace, not a BRS unit.
- `plans/replan-v8-a0-20260925` mentions EP-125 and GRS-086 only as "next free" notes (A0 report line 148).

**Free on every origin branch and on main:** EP-128+, GRS-090+, CV-355+, SP-323+, ATS-061+, BRS-032+, DL-099+. The exact-id grep returned no hit on any branch.

**prop. R5-P4: A2 unit ids.** Template: the precedent sets e686963ad (GRS-079, EP-120, SP-311, BRS-027), a3c511657 (GRS-080, EP-121, SP-312, BRS-028) and f6350caf2 (+CV, +ATS).
- GRS-090: v6 projection successor to GRS-085.
- EP-128: v8 consumer adoption.
- SP-323: two families plus the P-02 token ruling reference.
- CV-355: consumer schema root and resource bank.
- ATS-061: consumer acceptance.
- BRS-032: derived backup/restore, as BRS-029.
- If needed, DL-099 or later for a Decision Log entry (for example a Q-02 answer, if R5-P1 is not taken).

A3-stopped takes the next numbers at its own landing (A3 rule R2). If A3-stopped lands first, A2 re-takes its numbers at rebase.

## 8. Governance and readiness consequences (A2 landing)

- **No Event registry change** under R5-P1. So there is no DL-078 checkpoint move, no DL-077 admission record (Q-03 covers only the A3 row revisions), no depth42 regrade and no `REVIEWED_GOAL_SUCCESSORS` edit.
- **If A2 does touch a row:**
  - one DL-036 card per row, with the before and after row and the registry SHA before and after;
  - a Decision Log entry with the after SHA (Q-02);
  - a new `REVIEWED_GOAL_SUCCESSORS` pin pair, and `CURRENT39_SHA256` with `Plans/browser_event_admission.json:8`;
  - the depth assessment row goes stale, because the family revision moves (Q-03 currentness rule).
- **Storage registry edit.** Re-pin section 4 in the same landing. The owner units are the next SP unit and `storage-plan.md:523`. Regenerate the shards and the plan index.
- **Owner-doc edits** (GRS, EP, SP, CV, ATS, BRS). The landing check will report Spec Lock `stale_hash` and readiness staleness for the edited documents. That does not block the landing. It needs a reseal request to the designated Plans agent (CLAUDE.md, "Governance staleness … does not stop the landing").
- **Order with other branches.**
  - A2 rebases after A1. Any of ea-storage-retention, ea-s09-coord-registered and A3-stopped landing 1 may also land first.
  - Each changes a pin A2 depends on: the policy count; the registry SHA if A2 pins it; the family pointers and census.

## 9. Open questions for the A2 author or coordinator

1. R5-P1: should A2 add consumer paths to the started, cancelled or certified rows (started and cancelled precedent), or leave the rows untouched (certified precedent)? Adding them costs one Q-02 card per row.
2. The GRS-088 "registry row … do not admit": is a certified row revision needed for v8 certified Events, or only consumer and Storage work?
3. v8 certified Storage admission (rows 285-291 revision, or new rows): is it A2's? A1 leaves it unassigned (report line 179).
4. Chain order (T-11): A2 v6 first, as recommended; A3-stopped v7 next. The family stem and generation prefix are an author choice (O-S4-03).
5. The Storage-owner ruling on `source_token_at_birth` and `generic_token` under `storage-plan.md:519` has to exist before A2's checkpoint row.
