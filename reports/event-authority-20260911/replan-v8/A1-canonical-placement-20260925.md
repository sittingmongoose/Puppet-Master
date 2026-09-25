# Replan v8, A1: the combined v8 source placed in canon, 2026-09-25

Step 8(b) Group A, branch A1 of `reports/event-authority-20260911/step-08-remaining-source-work-plan-20260924.md` (Part 2). A1 places the accepted canonical draft of the combined Replan v8 source into canon: owner prose first, then the placed files, the registry rows and the census re-pins. It installs source contracts only.

**Subject.** `pm.executor.workflow_source.all_writers.v8` with its producer component `pm.goal_run_certified.producer_source.v3`, from the external combined source `goal-replan-combined-source-20260921/v3` (manifest `9ed8ba4f825939cc59b37941aafe1068be7ed2d6ada87c0e3b8eaa3b5225896e`), through the canonical-draft package `goal-replan-v8-canonical-draft-20260925/v1` (manifest `bb6be609d20536be795bdaab41de179e85caec79e9d5973e16d6e0b3c2139ba5`).

**Base.** `main` at `63cf2cb97f936c91dd7bb5c585d9a35d8409ed61` (2026-09-25 10:26Z), the package's landing base. Branch `plans/replan-v8-a1-20260925`. A0 (`plans/replan-v8-a0-20260925`, report at `632f557c0`) has not landed yet; see "Landing prerequisites".

**Branch state.** Compiled on the branch, pending the blind review of the canon branch. Task 1, the owner prose, is `94585533b`; task 2, the companions, is `48a2b6840`; this report and its bundle are the commit after them. `Plans/.plan_index/node_readiness_report.json` is deliberately left at `main`'s version; the lander regenerates it (see "Landing prerequisites").

## Summary

1. **Installed as source.** Thirteen owner units in six documents (EP-125 to EP-127, GRS-086 to GRS-089, CV-354, SP-321, SP-322, ATS-059, ATS-060, BRS-031), one `00-plans-index.md` section, 74 placed files under two new directories, 34 storage registry rows at `/families/294` to `/families/327`, and eight census re-pins.
2. **Not installed.** No Event registry row, payload successor, consumer, projector or checkpoint. No native installation or execution, no schema instance, no Storage admission of v8-born certified values, no readiness or governance clearance. The v7 certified family and its directories are untouched.
3. **Reviewed before canon was edited.** The package was independently reviewed in two cycles (cycle 1: repairs required, 38 findings; cycle 2: accepted, 5 findings applied) and accepted by root with five conditions. The canon branch itself still needs its own blind form-driven review, cycle cap two.
4. **What A1 closes from A0.** Canonical placement; whole-package review; the pending-source boundaries and the install-at-birth rule in owner prose; TRUTHFUL-UNAVAILABLE's statement; and, at source level, the Replan v3 prebirth-composition gap. D06, native execution and instances, the six other positive-route discharges, A2 and A3 stay open (section 8).

## 1. What A1 installs, and what it does not

| Installed | Where |
|---|---|
| 13 owner units, appended at the end of each document | `Executor_Protocol.md`, `Goal_Runtime_System.md`, `Contracts_V0.md`, `storage-plan.md`, `Automated_Testing_System.md`, `Backup_Restore_System.md` |
| The index section "Combined Workflow v8 source family — 2026-09-25" | `Plans/00-plans-index.md` |
| 74 files, byte-identical to the package's `after/Plans/` (10,357,413 B) | `Plans/workflow_combined_source_contracts/` (with `coordinator/`, `producer/`, `replan/`, `schemas/`) and `Plans/workflow_standard_source_contracts/native-v8/` |
| 34 rows: SP-321 30, SP-322 4 | `Plans/storage_value_registry.json` `/families/294` to `/families/327` |
| Eight census re-pins (294 → 328 families) | `scripts/pm-implementation-readiness.py`, `Plans/storage-plan.md` 523 and three test files (section 6) |

What A1 does not do, in the words its units use:
- "It supplies no Event registry row, payload successor, consumer, projector or checkpoint." The registered `goal_run.replanned` row stays at v2 and unselected.
- "Native installation, capability authentication and execution are NOT_RUN", and "all such native evidence and all schema instances remain NOT_RUN. No WorkNode or NodeSeed is created."
- The source "applies only to a genuine fresh `pm.executor.workflow_source.all_writers.v8` Workflow birth and its `pm.goal_run_certified.producer_source.v3` component". Workflows born under all_writers.v6 or v7 keep their closed scope; no existing birth is enrolled, cast or re-read as v8.
- v8-born certified values use the seven `goal_certified_event_*` physical names under the coordinator, identity and append-phase v2 roots; "their Storage admission for v8 births is unavailable until a separate Storage revision". SP-316 is unchanged.
- No file under `goal_certified_event_coordinator_contracts/`, `goal_certified_producer_source_contracts/`, `goal_run_certified_consumer_contracts/` or `native-v7/` changes.
- A1 reseals nothing (see "Reseal request").

## 2. The package and its reviews

All three records are in `sittingmongoose/PuppetMaster-Packages`, on branch `replan-v8-canonical-draft-20260925` (tip `3928dd6`, which also extends that repository's `README.md` and `SHA256SUMS`). Both reviews accepted it, and the branch has since been merged: the repository's `main` is `3928dd6`.

| Record | Path | Manifest SHA-256 | Commit |
|---|---|---|---|
| Canonical-draft package | `replan-v8/goal-replan-v8-canonical-draft-20260925/v1` | `bb6be609d20536be795bdaab41de179e85caec79e9d5973e16d6e0b3c2139ba5` (417 members) | `083be9a` |
| Independent review, both cycles | `replan-v8/goal-replan-v8-canonical-draft-independent-review-20260925/v1` | `62d94dc1fa719157dc96effebcc6ad24ed7f2f8d5b5e49332eb70acbc3cc170f` | `13085dd` (cycle 1), `81b3a1c` (cycle 2) |
| Root acceptance | `replan-v8/goal-replan-v8-canonical-draft-root-review-20260925/v1` | `a7f5bb5fbebbc9a5794848140fafc38e08ad5784a5120d3ba801baec41f965c4` | `d6cbbcb` |

Each verifies with `sha256sum -c SHA256SUMS` in its own directory (re-run for this report).

**The package.** It holds the canonical edition of the v3 source: 74 files relocated, renamed and repaired for canon (59 copied and edited from v3, 15 authored or regenerated companions), the 34 proposed rows, the census re-pin plan `data/census-after.json`, the build and check scripts, and the design with its notes U1 to U6. Its checks C01 to C11 pass, with three documented exceptions (OI-01 lineage draft strings, OI-02 one lineage host path, OI-03 three named delta classes). Descriptor digests under the CV-352 codec: all_writers.v8 `7b22c1f471761caffd37319dd0ae4f5da07c5f3e6f5ac83828d07308df5aaf8b` (189 members: 71 placed, 118 canon), producer_source.v3 `1157877714ff6c1ebf799610e696e0af92f43a2fba5902ce5535552007339548` (19 members: 9 placed, 10 canon).

**Independent review, cycle 1** (`review-cycle-1.json`, subject `792bf559…`): **repairs required.** 3 blocking, 20 should_fix and 15 notes, IR-01 to IR-38. The blocking three: false lineage identities that broke 27 original-declaration pins (IR-01); map realm labels that did not hold their references, which C04 could not detect (IR-02); and a re-pin plan that missed two test files pinning the census (IR-03). Each finding was repaired in its own commit (`23f7aa9` to `6e2a45b`), and the package was rebuilt and re-frozen as `51c8df4d…` (`660ccb5`). The review also ruled on OI-01 to OI-03.

**Independent review, cycle 2** (`review-cycle-2.json`, subject `51c8df4d…`): **accepted**, with 0 blocking, 1 should_fix and 4 notes. IR2-01 (C04 accepted any selected realm as a placed-root label) was repaired in `c58007a`, IR2-02, IR2-04 and IR2-05 in `e8d581e`, `4f3e0eb` and `ff42975`. IR2-03 asked for the compile rebase, done in `083be9a`: the package was rebuilt at `63cf2cb97f` and re-frozen as `bb6be609…`. The cycle cap is reached.

**Root acceptance** (`acceptance.json`, status `ROOT_ACCEPTS_CANONICAL_DRAFT_FOR_A1_CANON_COMPILE`). Root re-checked the freeze, the 323 occurrence pins, both descriptor digests with no stale member, the placed set, and the diff from the accepted edition `660ccb5` to the final one `083be9a`. It took the rebase check's reproduction of the merged registry `45e383b2…` from the repair record without re-running it. It accepts the review's adjudications and rules on the O-items. Its conditions for the compile and landing:
1. Compile at `63cf2cb97f`, or re-run `scripts/rebase_check.py` at the later base, re-derive, rebuild, re-check and re-freeze first.
2. Re-check the 13 unit IDs against `origin/main` and every `origin/*` branch before the compile and again at landing.
3. Owner prose first, then companions, regenerating after each; one blind form-driven review of the canon branch, cycle cap two.
4. The A1 report commits `checks/citation-census.json` of this edition unchanged. It is at `a1/citation-census.json` (see "Evidence").
5. A1 lands only after A0.

It accepts source for canonical compilation only: `canonical_adoption`, `installation` and `event_admission` are all false, and `main_push` is `HOLD_UNTIL_A1_LANDS_BY_A_DESIGNATED_LOCAL_SESSION`.

## 3. Decisions

**The three decide-first choices** (A0 P-09, P-10, P-11), settled as O-02 in `reports/event-authority-20260911/replan-v8/a1/author-decisions-20260925.md`, which Jared ratified on 2026-09-25 together with the other process questions ("I am good with your recommendations on all these questions"):
- **P-09, coordinator descriptors.** v8 binds canon's certified descriptors `0055de6c…` (coordinator, all_writers.v7) and `599315856…` (producer native-v7). The external corrected coordinator `48c8ae3b…`, producer `e9f563c6…` and `d36cefb6…` become lineage.
- **P-10, the `13e7dbc0` pins.** The 47 frozen pins and the exact passages stay external lineage. A canonical `source-citations.json` pins the relied-on passages at the base, and the citation census covers the rest.
- **P-11, identifiers.** Exactly the draft-marked identifiers A1 owns are renamed, for example `draft.replan.*` → `owner.workflow.replan.*.v1` and `draft_replan_*` → `workflow_replan_*` (124 rename rows); every other identifier stays byte-exact.

**The other author decisions.** The same record settles O-01 (the CV-352 codec), O-03 (lineage as `external-source-evidence:sha256:` tokens), O-06 (the replanned payload identity stays a frozen literal, not a registry selection), O-08, O-10 (the directory layout), O-15 (no projection or checkpoint row in A1), O-18, O-19, O-21 (the stale `original-bank-checks.json` is recorded, not regenerated) and O-23. Two points have moved since that record:
- **Unit IDs (O-18).** The record names CV-353, SP-320 and 321, ATS-058 and 059 and BRS-030. Other threads claimed CV-353, SP-320, ATS-058 and BRS-030, so the package renumbered to CV-354, SP-321, SP-322, ATS-059, ATS-060 and BRS-031 (its DV-41). CV-353, SP-320 and ATS-058 have since landed on `main` with the coordination prep.
- **Review questions.** O-04, O-05, O-07, O-09, O-11, O-12, O-14, O-16, O-17 and O-22 were left to the reviews; root ruled on each (`acceptance.json` `rulings`). O-16 is option (i): v8 certified Storage admission unavailable, SP-316 untouched.

**O-13, retention, for Jared under DL-045.** Root raised no DL-036 card: "The authored retentions stand; no DL-036 card is raised." The stored `WholeGraphPatch` is the content-free governance graph_patch record the sibling native-application family already keeps under `RP-AUTHORITY-INDEFINITE`, and `ProducerIntent` keeps `RP-RUNTIME-365D` with the justification SP-321 carries. No new retention policy or horizon is chosen. Retention assignment is Jared's under DL-045, so this ruling is stated here for his confirmation.

**Process answers.** `reports/event-authority-20260911/replan-v8/process-answers-20260925.md` on branch `plans/replan-v8-process-answers-20260925`, commit `616f12bfd`:
- **Q-12.** A1 may install v8 with D06 explicitly unavailable, provided the owner text says four things (section 8).
- **Package home.** `sittingmongoose/PuppetMaster-Packages` at `replan-v8/goal-replan-v8-canonical-draft-20260925/v1`, on a branch until its reviews accept it, then merged with a `SHA256SUMS`.
- **Landing.** The cloud thread never lands; a local session Jared designates does.
- **Q-02, Q-03, Q-09** bear on A3: each registry revision gets its own DL-036 card; DL-077-form records are written as extra records; B01 is the package's label for the blocked trigger, now written as "the condition that puts a run into `blocked`, which remains an owner decision".

## 4. The owner units

| Unit | Document | What it owns |
|---|---|---|
| EP-125 | `Executor_Protocol.md` | Fresh all_writers.v8 installation before original Workflow birth: the combined descriptor, birth-only enrollment, the combined guard and exclusive operation slot, disjoint generation sources and the 323-occurrence successor map |
| EP-126 | `Executor_Protocol.md` | Replan native-first application, graph-lock generation, D01 inventory observation and source-level release, with the Executor and D01 lower-owner obligations |
| EP-127 | `Executor_Protocol.md` | The limited run-execution revocation Stop route and its readback, with the D06 grammar carried and its issuer unbound |
| GRS-086 | `Goal_Runtime_System.md` | The Workflow Replan original source for v8 births, from the bounded manager decision to the disposition bijection; it chooses no next action |
| GRS-087 | `Goal_Runtime_System.md` | Source-level `goal_run.replanned` publication without Event admission; the registry row and payload are unchanged and the envelope divergence is left to A3 |
| GRS-088 | `Goal_Runtime_System.md` | Certified v3 publication for v8 births through coordinator, identity and append-phase v2 beside v1; the v7 row, projection, storage and consumer do not admit v8 births |
| GRS-089 | `Goal_Runtime_System.md` | Goal Stop in the combined route: independent current Goal Stop, no stopped or blocked Event and no new restart route |
| CV-354 | `Contracts_V0.md` | The whole v8 schema roots, canonical identifiers and frozen literals, coordinator v2 successors, realm bindings, method-root closure and the two descriptor digests |
| SP-321 | `storage-plan.md` | The 30 Workflow Replan original-source and compact authority families, the durable release token and the v8 version scope |
| SP-322 | `storage-plan.md` | The 4 combined operation-guard families, the eleven v8 profile-qualified stored routes and Stop revocation custody |
| ATS-059 | `Automated_Testing_System.md` | The thirteen v8 source-to-native acceptance facets, status-field check reading and truthful NOT_RUN boundaries |
| ATS-060 | `Automated_Testing_System.md` | Limited Stop revocation acceptance: the seven positive-route source obligations, the D06 negatives and native NOT_RUN |
| BRS-031 | `Backup_Restore_System.md` | Mandatory coherent custody and restore of the enrollment, slot journal and Replan authority families; fenced partial restore; no rekey, backfill or reconstruction |

Every unit carries the same `source_lineage`: the external source `9ed8ba4f…`, the package `bb6be609…`, the independent review `62d94dc1…`, the root review `a7f5bb5f…`, the Stop review v3 `c9271320…`, the Stop root acceptance `ab69b0a9…` and A0's report `297b0f29…` (its SHA-256 at `632f557c0`). The appended text is 1,747 lines: EP +376, GRS +418, CV +152, SP +268, ATS +401, BRS +132.

## 5. The 74 files and the 34 rows

**Files.** `Plans/workflow_combined_source_contracts/` holds 60 files: 37 at its top level, 7 in `coordinator/`, 6 in `producer/`, 6 in `replan/` and 4 in `schemas/`. `Plans/workflow_standard_source_contracts/native-v8/` holds 14. None existed on `main`, and none lies under a v7 directory. `installed-profile.json` is the static descriptor and `composition.json` binds the final whole selections; with the digest file these three are the only placed files that are not descriptor members. Task 2 (`48a2b6840`) copied them without overwriting anything: each of the 74 equals its counterpart in the package's `after/Plans/` byte for byte, both on disk and as the committed blob, and the package's `SHA256SUMS` verifies them. `composition.json` `source_reviews` keeps its three `manifest_ref: null` entries (`canonical_draft_package`, `canonical_draft_independent_review`, `canonical_draft_root_review`, lines 2757-2771), because root condition 3 requires the 74 files byte-identical to the package. This departs from PACKAGE-STATUS §6.5 and design §6 step 2, which ask the compile to record the three manifests there. They are recorded instead in every unit's `source_lineage` (`bb6be609…`, `62d94dc1…`, `a7f5bb5f…`). Recording them in `source_reviews` is left to a later v8 edition; the file is outside both descriptors, so neither digest changes.

**Rows.** The 34 rows are appended verbatim, in the registry's own formatting, at `/families/294` to `/families/327`:
- SP-321, 30 rows: `executor_workflow_replan_update`, the 28 `workflow_replan_*` families and `executor_workflow_replan_observer_origin`.
- SP-322, 4 rows: `workflow_combined_enrollment`, `workflow_combined_slot`, `workflow_combined_slot_revision` and `workflow_combined_slot_origin`.

The checkpoint `goal_run_started_cancelled_replanned_checkpoint` is not registered (P-06, O-15: A2 authors the successor). The registry goes from `32d267dd4f06f3dbec4b5319b49bff94c909c600d87c2a6dbed11e07e74c0f46` (294 families) to `45e383b2aedf8056cc21d300d96d44c3088e91f93d0d8f3a46415e965db94c13` (328 families, 4,510,452 B), the value the package's C07 records. The 27 retention policies are unchanged. As committed at `48a2b6840` the registry hashes to `45e383b2…` (4,510,452 B). `/families/0` to `/families/293` equal `63cf2cb97f`'s, and no key other than `families` changed. All 34 new rows are `materialized` and `later_gui_or_feature_projection`; 33 keep `RP-AUTHORITY-INDEFINITE` and `workflow_replan_producer` keeps `RP-RUNTIME-365D`.

## 6. The census re-pins

The census moves from 294 families, 27 policies, 274 materialized / 19 deferred / 1 alias, tiers 40 / 251 / 3, to 328, 27, 308 / 19 / 1 and 40 / 285 / 3 (`data/census-after.json`, derived at `63cf2cb97f`). The eight re-pins:

| File | Line(s) at `63cf2cb97f` (at `48a2b6840`) | Change |
|---|---|---|
| `scripts/pm-implementation-readiness.py` | 761 (765) | family count 294 → 328 |
| same | 764 (768) | materialized 274 → 308 |
| same | 770 (774) | later GUI or feature projection 251 → 285 |
| same | 744-760 (new 761-764) | the census comment block gains a four-line A1 re-pin record after the 2026-09-25 SP-320 paragraph |
| `tests/test_pm_assistant_contract_closure.py` | 600 (601) | 294 → 328, with a one-line re-pin comment |
| `Plans/storage-plan.md` | 523 (523) | the Census rule's dated pin sentence becomes 328 families, 27 policies; 308/19/1; 40/285/3, and records the 294/274/251 pin it replaces |
| `tests/test_pm_onboarding_phases.py` | 312-313 (315-316) | 294 → 328, with the re-pin comment extended (310-313) |
| `tests/test_shared_runtime_storage_contracts.py` | 216, 221 (219, 224) | 294 → 328 and materialized 274 → 308, with a re-pin comment (216-218) |

Two historical statements stay as written: SP-316's "All 285 previous Storage rows remain unchanged" and `goal_certified_family_composition.json` `registry_selection.storage_final_families` 294. The landing gates run no unit tests, so the companions landing runs `python3 -m unittest tests.test_pm_onboarding_phases tests.test_shared_runtime_storage_contracts tests.test_pm_assistant_contract_closure` before it pushes `main`. On an export of `63cf2cb97f` the package found 95 OK unmodified, 3 FAIL with the rows only, and 95 OK with the rows and the eight re-pins. On the branch at `48a2b6840` the three modules run 95 tests, OK, as they do on `origin/main`.

## 7. Checks

**Task 1, owner prose** (`94585533b`: the six documents, 280 shard files of the five sharded ones, 268 changed and 12 new unit shards, and five `Plans/.plan_index` files; `Backup_Restore_System.md` is not sharded)
- Unit IDs: after `git fetch`, `origin/main` was still `63cf2cb97f`. All 13 IDs are free there, and no `origin/*` ref (74 scanned) claims one except the A1 branch.
- Placeholders: none remain. The consistency checks on the filled drafts pass, 373 of 373 (output pinned in `a1/A1-full-outputs.SHA256SUMS`). The output of the original run was not kept, so the check (`check_filled.py`) was re-run on the unchanged filled drafts on 2026-09-25 at 14:07Z, with the same result, and that output is the one pinned. The filled drafts equal the text appended at `94585533b` byte for byte. The counted values come from the package's own check outputs: 2,035 bound schema positions and 240 roots from `checks/c5/canonical/method-root-checks.json`; the commitment graph's 54 nodes and 67 edges from `checks/c5/canonical/final-source-checks.json`; `checks/C05.json` agrees. The transient-only list of 24 is not stated by any check output; it is the length of the placed `physical-families.json` `/transient_only_definitions` and root's O-07 ruling ("transient-only list 24").
- Append points: each document's append line equalled its line count at `63cf2cb97f`, and its last line was the expected ContractRef line.
- Regeneration: `pm-shard-plans.py --generate` and `pm-plan-index.py generate`, then `pm-shard-plans.py --check` PASS (99 documents, 2,750 shards). PlanUnits go from 6,742 to 6,755 (+13) and acceptance units from 26,321 to 26,413 (+92). Shards and index files changed only for the edited documents, apart from `node_readiness_report.json` (below). Before that file was restored, `pm-plan-index.py validate` passed with no failures; on the committed tree it reports exactly one, `stale_generated_index_artifact` for `node_readiness_report.json`, the expected consequence of keeping `main`'s version. Re-running both generators on `94585533b` changes nothing but `generated_at_utc` in three index files and that report.
- **Readiness report, environmental.** Regenerating on the cloud clone also changes `Plans/.plan_index/node_readiness_report.json` for documents A1 does not edit: 8 `event_authority_currentness_source_drift` rows drop and one `event_authority_currentness_audit_unavailable` row appears, and the PNC-019 row for the receipt changes from `pnc019_source_hash_stale` to `pnc019_source_hash_path_missing`. The cause is that `Plans/.audits/event-authority-2026-08-13-currentness/VALIDATOR_RECEIPT.json` is gitignored and absent from the clone. A clean worktree at `HEAD` with no edits gives the same diff. **Resolution (host decision):** the file is deliberately not regenerated on this branch. After every regeneration it was restored with `git checkout HEAD -- Plans/.plan_index/node_readiness_report.json`, and no regenerated copy is committed. It is therefore stale for the 13 units (it still reads 6,742 nodes), and the lander regenerates it where the receipt exists (see "Landing prerequisites").

**Task 2, companions** (`48a2b6840`: the 74 placed files, `00-plans-index.md`, `storage-plan.md` line 523, the registry, the readiness script, the three test files, 701 shard files and four `Plans/.plan_index` files)
- Placement: none of the 74 paths existed before, and each file equals the package's `after/Plans/` copy on disk and as the committed blob (10,357,413 B in all).
- Registry: before the edit it equalled `63cf2cb97f`'s (`32d267dd…`). The committed file is `45e383b2…`, C07's value (section 5).
- Re-pins: all eight are applied (section 6). Each existing re-pin comment now names the A1 landing, and `storage-plan.md` line 523 is the package's SP-notes §4 sentence with its date set to 2026-09-25. Review finding A1-C1-08 later reworded that sentence so that it tells the current pin from the earlier 2026-09-25 pin; the counts are unchanged.
- Index section: appended after line 6013, so `00-plans-index.md` goes from 6,013 to 6,020 lines. Every `Plans/` path it names exists.
- Regeneration: `pm-shard-plans.py --check` PASS (99 documents, 2,770 shards). The 701 shard files are `00-plans-index` 28 (27 changed, 1 new), `storage-plan` 87, and `storage_value_registry` 586 (566 changed, 19 new, 1 renamed). The registry is sharded in 200-line pieces, and every shard records the source SHA-256, so every existing registry shard changes; the last one is renamed as it fills to 200 lines, and 19 new pieces hold the rest of the appended rows. In `Plans/.plan_index`:
  - `plan_units.jsonl` changes 384 rows, all of the two edited documents (`storage-plan.md` 316, `00-plans-index.md` 68), and PlanUnits stay at 6,755;
  - `doc_cards.json` changes only their hashes and the index's heading and line counts;
  - `coverage_report.json` and `dependencies.json` change only `generated_at_utc`;
  - `acceptance_units.jsonl` is unchanged (26,413).

  `pm-plan-index.py validate` reports only the same `stale_generated_index_artifact` for `node_readiness_report.json`. A worktree of `origin/main` (`63cf2cb97f`) in this clone fails the same way, because the receipt is absent there too. Re-running both generators on `48a2b6840` changes nothing but `generated_at_utc` in three index files and that report.
- Repository checks, each run on the branch and on `origin/main`. They ran under a scratch virtual environment with `jsonschema` 4.26.0 and `referencing` 0.37.0, because the clone's system Python has neither `jsonschema` nor `pytest`:
  - `pm-implementation-readiness.py validate`: exit 1 on both, with 29 failures each. Compared without hash values and absolute paths, none is new and none is gone. The rows that differ differ only in expected-hash values, and all of them are staleness for files this branch edits: Spec Lock rows for the registry and the readiness script, and PNC-019 rows for `Executor_Protocol.md`, `Goal_Runtime_System.md`, `Automated_Testing_System.md` and the registry. No new `storage_value_*` error kind appears.
  - `pm-implementation-readiness.py self-test`: exit 1 on both, with the same failing scenario, `case_l_verification_integration`.
  - `pm-plans-verify.py lint-contractrefs`: identical on both. Its one failure is `Plans/00-plans-index.md` line 81, a `missing_ref` to the gitignored `Plans/.audits/audit-20260829-001-pmconcept7-widget-followup/audit_report.json`. That failure was already on `main` and is outside the appended section.
  - `python3 -m unittest` of the three census modules: 95 tests OK on both.
  - `pytest tests/test_pm_browser_event_admission.py tests/test_pm_emit_only_event_boundaries.py`: 51 passed and 397 subtests passed, on both.
  - The 13 units' 82 validation-surface and 41 implementation-surface entries name no `scripts/` path, and every path they name exists.
- Compile witness: not run. `pm-ledger-compile-witness.py` checks a `Plans/ledgers/v2` ledger's findings record, and A1 compiles an accepted package that has no ledger.

**Package checks** (recorded in the package, not re-run here): C01 to C11 PASS with OI-01 to OI-03 (`checks/run_all.json`); `scripts/rebase_check.py` at `63cf2cb97f` PASS, reproducing both digests and the merged registry.

**Not run.** The repository-wide gates (`pm-plans-verify.py run-gates`, `audit-governance`, `pm-plan-migration.py validate`) run at landing through `pm-landing-check.py`. Native execution, schema instances and the positive-route obligations are NOT_RUN.

## 8. A0's open items: what A1 closes, and what stays open

A0 section 9 and root's `remains_open_after_a1`, against the owner units:

| A0 item | After A1 |
|---|---|
| Whole-package semantic acceptance | **Closed** for the package: independent review accepted at cycle 2, root accepted. The canon branch's own blind review is pending |
| Canonical placement | **Closed by compile**: the 13 units (`94585533b`), the index section, the 74 files and the 34 rows (`48a2b6840`), on the branch until it lands |
| Pending-source boundaries (start association, certified current, Replan inventory observer, storage headers) and the Stop install-at-birth rule | **Closed in owner prose.** EP-125: "Only genuine original birth installs v8: there is no late or old-birth enrollment and no caller-selected profile or phase." The four boundaries are placed as `pending-source-boundaries.json`, a validation surface of EP-126 |
| Replan v3 prebirth-composition gap | **Closed at source level** by the v8 installation; native birth stays NOT_RUN |
| TRUTHFUL-UNAVAILABLE | **Stated**: "TRUTHFUL-UNAVAILABLE is compiled as a stated rule only" (EP-127) |
| Full original cancellation, D06 | **Open, stated unavailable.** The four Q-12 statements, in EP-127's words: "The D06 argument grammar of EP-118 and EP-119 is carried"; "Its issuer owner.executor.native.record_cancellation.v1 is an unbound dependency, whose EP-117 row still reads Complete dependency contract only"; "nothing in this installation activates it by implication"; "The Stop route rests on owner.executor.native.revoke_run_execution.v1 as Stop review v3 accepted it." Full original cancellation, D06 and GRS-078 steps 5 onward are unavailable for v8 births. Closing it needs a source package for the issuer, reviewed independently and by root, then native execution |
| Seven positive-route obligations | **Open.** FIRST-REPLAN-CLAIMED, FIRST-REPLAN-PREPARED, FIRST-CERTIFIED-HELD, REPEATED-HELD, READBACK-RELEASED-IDLE-REPLAN, READBACK-RELEASED-IDLE-CERTIFIED and TRUTHFUL-UNAVAILABLE: "instances and native execution are NOT_RUN for all seven" (EP-127, ATS-060). The slot families they need are placed (SP-322) |
| Native installation and execution; schema instances | **Open, NOT_RUN.** "Native installation, capability authentication and execution are NOT_RUN" |
| Consumer adoption (A2) | **Open.** "The Replan consumer, the started and cancelled combined-profile consumers and the projector, checkpoint, backfill and retention declarations are separate required work (A2)" (GRS-087); the certified v8 consumer likewise (GRS-088). `goal_run_started_cancelled_replanned_checkpoint` is unregistered, and "Replan release is unavailable until the consumer-adoption work A2 supplies the projection admission" |
| Event contracts, registry rows and payload successors (A3) | **Open.** A3 "owns the goal_run.replanned, goal_run.blocked and goal_run.stopped contracts, their registry rows and payload successors", the envelope reconciliation (P-14, Q-04) and the Runtime Replan rewiring (Q-07); "each A3 change to a registered row needs its own DL-036 checkpoint approval" (GRS-087). The replanned payload stays the frozen external literal `goal_run_replanned_clock_split_20260921.v4` |
| v8 certified Storage admission | **Open.** "their Storage admission for v8 births is unavailable until a separate Storage revision" (GRS-088, SP-322, BRS-031); SP-316 is unchanged |
| Child goal runs under Goal V2 (A0 Q-01, O-20) | **Open.** "required_child_goal_run_ids is carried as inherited from the landed Workflow activation contracts; its reading under Goal V2 is an open owner question" (GRS-086) |
| Repository validators | At landing (see "Landing prerequisites") |

## Open questions

| ID | Question | For |
|---|---|---|
| O-13 | Confirm the retention ruling in section 3 (no new policy; `RP-AUTHORITY-INDEFINITE` and `RP-RUNTIME-365D` as authored) | Jared, under DL-045 |
| O-20 / Q-01 | Are child goal runs a current Workflow-run concept under Goal V2? | Goal Runtime owner; product: Jared |
| U3-Q7 | Section 2.3.1's reading of `DurableGenericToken` stored under `source_token_at_birth` / `generic_token` (the unregistered `ReplanCheckpoint`) | Storage owner, before A2 registers the checkpoint successor |
| Q-U4-05, Q-U4-07, Q-U4-08 | Released-idle readback reachability; the `record_stop` caller after the Goal Stop latch; the Event treatment of a revoked certified slot holding a durable Event | Executor and Goal owners; A2 and A3 |
| Q-04, Q-07, Q-08 | The replanned envelope; the Runtime Replan wiring; the certified row's unresolved source ref | A3 |
| B01 | The condition that puts a run into `blocked` | A3, by the Q-09 route |
| composition.json source_reviews | The three canonical-draft review entries stay null in canon; record their manifests in a later edition | Designated Plans agent, next v8 edition |
| Q-10 (A0) | The narrow Replan v3 root review `13437dc7…` and the full prebirth plan exist only on the NAS. The cloud session did not read them; canon cites the prebirth plan by hash only (`21e672ca…`, `composition.json` line 1114) and does not cite the root review. Read both on the VM before landing, or record that A1 relies on them by hash only | A1 lander, on the VM |

A0's Q-05 is settled by O-02, Q-06 by the durable-token repair (C06), Q-11 by O-21, and Q-12 by the process answers. Q-10 stays open (Open questions).

## Reseal request

A1 edits canon, so governance goes stale for the documents it edits. That is expected before the designated Plans agent's next reseal; A1 reseals nothing itself. Each item below was checked against the bytes at `63cf2cb97f` and re-checked against the committed tip `48a2b6840`. None of the pinning files changed on this branch.

1. **Spec Lock** (`Plans/Spec_Lock.json` `canonical_ssot_hashes`):
   - `Plans/Executor_Protocol.md` and `Plans/00-plans-index.md` are current on `main` (`53125b0e…`, `cb30c059…`) and go stale with A1.
   - `Plans/Goal_Runtime_System.md`, `Plans/Contracts_V0.md`, `Plans/storage-plan.md`, `Plans/Automated_Testing_System.md`, `Plans/storage_value_registry.json` and `scripts/pm-implementation-readiness.py` are already stale on `main`, and A1 changes them again.
   - `Plans/Backup_Restore_System.md` and the three test files have no Spec Lock entry. The 74 placed files are new and have none.
2. **Plan-sharding evidence.** `Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json` and `shard_report.json` name the five sharded edited documents, `00-plans-index.md` and `storage_value_registry.json`, with their shards. The Executor_Protocol rows at `evidence.json` line 4800 and `shard_report.json` line 10588 are current on `main`, and the registry row at `evidence.json` line 8628 (`df772ad3…`) is already stale there. The 33 shard paths this branch creates (the 12 new unit shards, the new index shard, the 19 new registry shards and the renamed last registry shard) have no rows.
3. **Readiness.** `Plans/.implementation_readiness/buildability_gate_report.json`: its `Executor_Protocol.md` pin (line 323) and `00-plans-index.md` pin (line 319) are current on `main` and go stale with A1. The implementation-readiness gate report needs the same reseal.
4. **R-1, carried from A0, with A1's additions.** `Plans/goal_certified_family_composition.json` members:
   - already stale on `main`: `00-plans-index.md` (`e96a1e1e…`), `Goal_Runtime_System.md` (`ccedade9…`), `storage-plan.md` (`32885861…`) and `storage_value_registry.json` (`8556e243…`), as A0 found; and `Automated_Testing_System.md` (`8c6415ac…`) and `Contracts_V0.md` (`9753361f…`), stale since the coordination prep landing, not since A0;
   - newly stale with A1: `Executor_Protocol.md` (`53125b0e…`, line 31) and `Backup_Restore_System.md` (`c4f00ec4…`, line 21).

   `Plans/goal_run_certified_consumer_contracts/owner-sources.json` pins `Goal_Runtime_System.md` `ccedade9…` (line 5), `storage-plan.md` `32885861…` (17) and `storage_value_registry.json` `8556e243…` (53), all stale on `main`, and `Backup_Restore_System.md` `c4f00ec4…` (line 29), current on `main` and stale with A1. The same consumer's `source-citations.json` C10 to C12 pin `Backup_Restore_System.md` `whole_sha256` `c4f00ec4…` (lines 162, 179, 196); their passages lie before BRS-031 and stay verbatim. `physical-retention-install.json` line 49 pins the registry at `8556e243…`. The `original_source_lineage` hashes are historical by design.
5. **PNC-019 source hashes.** `Plans/Executor_Protocol.md`, `Plans/Goal_Runtime_System.md`, `Plans/Automated_Testing_System.md` and `Plans/storage_value_registry.json` are among the 19 required PNC-019 source paths (`scripts/pm_pnc019_currentness.py`, `REQUIRED_PNC019_SOURCE_HASH_PATHS`). `main`'s readiness report already lists 17 of those paths as `pnc019_source_hash_stale`, including these four. A1 changes them again.
6. **Currentness edition.** `main`'s readiness report shows currentness drift for `Automated_Testing_System.md`, `Contracts_V0.md`, `Goal_Runtime_System.md`, `storage-plan.md` and `storage_value_registry.json`, among others. Whether `Executor_Protocol.md` and `Backup_Restore_System.md` are in the audit's source set cannot be read on the cloud clone, where the receipt is absent.
7. **Plan migration.** Run 002's `batch_report.jsonl` rows naming `Executor_Protocol.md` (lines 50-52) and `00-plans-index.md` (lines 111-112) are current on `main` and go stale with A1; its `Contracts_V0.md` and `storage-plan.md` rows are already stale. These go through the `refresh-batch-hashes` and `refresh-final-summary` pair, and the nightly `snapshot-current`.

**R-2, for its owner.** Realm `native_consumer` of `Plans/goal_run_cancelled_consumer_schema_resources.json` has two rows for `Plans/source_control_contracts.schema.json` pinned `39dda3e18a9cd96e7d561919a7a110c950db2826564c7e5fc76cf25565cb8a5a` (lines 103 and 175). `main` holds `4070038bcaef4539d6d669f2a57618599487e73b2588d79e122fde2b41ed8518`, last changed at `119d7eed2` (2026-09-18). The v8 closure does not reach them, and the placed `resource-realms.json` lists them under `rows_not_current_at_base`. The reseal is for that file's owner, not A1. That file is itself a whole-file member of the all_writers.v8 descriptor (`Plans/workflow_combined_source_contracts/installed-profile.json`, SHA-256 `b616a2b1c219dceb152f1d67fee0b23a00afe8c98c0e821bff04a2592704869c`, 90,258 B). Any reseal of it makes that member pin stale and changes the v8 digest `7b22c1f4…` that CV-354, ATS-059 and `installed-profile-digest.txt` state. It must therefore go with a successor v8 edition (rebuild, re-freeze, re-placement and the matching owner-prose update), not be done alone.

## Landing prerequisites

- **A0 lands first, and so do the process answers.** The placed files cite three report paths, which the package's C10 lists as not yet on `main`: `reports/event-authority-20260911/replan-v8/A0-currentness-placement-20260925.md` (A0's branch), `…/replan-v8/process-answers-20260925.md` and `…/replan-v8/a1/citation-census.json` (this branch). The placed `composition.json` cites the first two with their SHA-256 (`297b0f29…` at `632f557c0`, `8c16d369…` at `616f12bfd`; lines 2749-2756). A0 is `plans/replan-v8-a0-20260925` (tip `632f557c0`). The process answers are only on `plans/replan-v8-process-answers-20260925` (`616f12bfd`), which is an ancestor of neither A0's branch nor `main`. Both branches land before A1; the process answers may land with A0.
- **Re-check the 13 unit IDs** against `origin/main` and every `origin/*` branch at landing (root condition 2). For this report, after a `git fetch`, `origin/main` was still `63cf2cb97f`, and none of the 74 `origin/*` refs claims any of the 13 IDs except this branch.
- **If `main` has moved past `63cf2cb97f`** in any file the package binds, in the storage census, in a relied-on passage or in a file A1 edits, run the package's `scripts/rebase_check.py --landing-base <new main>`. If it reproduces both descriptor digests, every placed file and the merged-registry hash, re-derive only the re-pins (`data/census-after.json`, C07). If it reports any other change, follow root condition 1 in full: rebuild, re-run `run_all.py`, re-freeze and record every base-derived change. Then recompile this branch from the new manifest (re-copy the 74 files, update the digests in CV-354 and ATS-059 and the `canonical-draft-package` token in all 13 units), and have the changed edition reviewed before landing. Never edit outputs by hand. A0's report and the process answers must land byte-identical (`297b0f29…`, `8c16d369…`), because `composition.json` and every unit's `source_lineage` pin them.
- **Readiness report, regenerated by the lander.** `Plans/.plan_index/node_readiness_report.json` is deliberately not regenerated on this branch, because the cloud session lacks the gitignored currentness receipt `Plans/.audits/event-authority-2026-08-13-currentness/VALIDATOR_RECEIPT.json` (section 7). The branch carries `main`'s version, which still counts 6,742 nodes. After the rebase, the lander regenerates it with the receipt present and commits it with the landing, never hand-merged. The precedent is Step 8(d) review A-08 (`reports/event-authority-20260911/step-08-certified-anchors-20260924.md` line 29), whose landing regenerated the index "with the ignored currentness edition symlinked" (`reports/landing-checks/LANDING_20260925_EA_CERTIFIED_ANCHORS.md` line 24). After that, `pm-plan-index.py validate` should report no `stale_generated_index_artifact`.
- **Packages repository.** The packages branch `replan-v8-canonical-draft-20260925` is merged: `main` of `sittingmongoose/PuppetMaster-Packages` is `3928dd6`. The units cite the package by manifest SHA-256, not by branch.

## Evidence

| File | What it is |
|---|---|
| `a1/citation-census.json` | The package's `checks/citation-census.json`, byte-identical (`f2c8b43c1d3f5e1ef306ca00205bc2b9cd0b4873cf5a862793862320cfbd2b62`, 942,295 B): the Replan v3 exact passages 467/476 verbatim at `63cf2cb97f`, certified-v2 citations 68/69, scope passages 4/4, whole definitions 4,102/4,111 |
| `a1/A1-source-checks.json` | Compact record: package and review manifests, the checks of tasks 1 and 2, what is NOT_RUN or unavailable |
| `a1/author-decisions-20260925.md` | The author decisions and Jared's ratification (committed earlier on this branch) |
| `a1/A1-full-outputs.SHA256SUMS` | SHA-256 and scratch path of each full output this report relies on: the task-1 consistency re-run (its output and a per-check listing of the 373 checks, the wrapper that lists them, the input hashes and the run time), readiness `validate` and `self-test` on the branch and on `origin/main`, `lint-contractrefs` on both, the `unittest` and `pytest` logs on both, the `pm-plan-index.py validate` outputs of tasks 1 and 2 and of `origin/main`, the two readiness-report diffs of section 7, and the shard check and `pm-plan-index.py validate` re-run on the tree of `74c79b5bf` |
| `a1/SHA256SUMS` | SHA-256 of the four bundle files above (`sha256sum -c SHA256SUMS` in `a1/`) |

**Where the full outputs live.** The files that `a1/A1-full-outputs.SHA256SUMS` lists are in the cloud session's scratchpad, `/tmp/claude-0/-home-user-Puppet-Master/e8a4a4d6-d9cf-5608-ab1e-bc8842bb958d/scratchpad/a1-compile/`. That directory is ephemeral and is not on the NAS, which the cloud session cannot reach, so the files do not outlive the session. The SHA-256 list is the durable record of them. `a1/A1-source-checks.json` `raw_evidence` names the same location and list.

At the design base the census read 469/476 Replan v3 exact passages; at `63cf2cb97f` it reads 467/476. The two passages the rebase lost (#234 and #235) lie in the Section 15 units SMPFS-168 and SMPFS-169, which no A1 fact relies on (the package's `handoff/rebase.md`).

## Cost

Cost: to be filled by the host
