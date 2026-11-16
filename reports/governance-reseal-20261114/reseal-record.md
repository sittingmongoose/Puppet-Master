# Governance Reseal Record — 2026-11-14 R0 (program stream P)

## Status and authority

Jared assigned the program's governance reseals to `claude-projects-refresh`, stream P. Its worker `opus-reseal-r0` (Claude Opus 5.5) prepared this one, R0, on the brief `/mnt/Cursor/share/puppet-master/2026-11-04-program/streams/P-reseal/BRIEF-reseal-r0.md`. The program board (`PROGRAM.md`) gives stream P the reseals: "Only P reseals, on Jared's assignment."

**Where it was prepared.** On branch `plans/governance-reseal-20261114`, in the full local worktree `~/pm-worktrees/reseal-r0-20261114`. The base is `d69850c150`, the head of pm7-perf's landing branch `origin/perf/toolbatch-land-20261115`: `main` `6385c1c3d3` merged with Concepts-only changes. `main` fast-forwards to exactly that commit once pm7-perf's landing check passes. The branch was pre-regenerated there so that the lead's landing window stays short.

**History.**
1. **First preparation.** At `main` `090bafbbe9` as `b7b2c72f7e`. Sol 6.1 high's blind review returned CLEAN (`P-reseal/REVIEW-reseal-r0-sol-high.md`).
2. **Rebased three times, at bases that `main` then left behind:** `7cf5636835` (after E's batch 3), `104c6c82b5` (after C's T203) and `34cfd7e93d` (after C's PLS-026). Each time commit 1 rebased cleanly and commit 2's generated outputs were dropped and regenerated.
3. **The final base.** pm7-build set the night's lock order with R0 last, so that it covers E's S1, C's wave-5 append and E's admission merge 1. The lead's go named `main` `6385c1c3d3`. Everything from step 4 of the sequence was regenerated once more, there, as `4230c4d929`. Sol 6.1 high's recheck returned CLEAN (`P-reseal/REVIEW-reseal-r0-r2-sol-high.md`).
4. **Pre-regenerated at `d69850c150`.** The lead yielded the lock to PM7 work before pushing. pm7-perf's toolbatch landing then took the slot; it changes only `Concepts/` (34 paths, including `Concepts/PMConcept7.html`).
   - **No new staleness:** the live evidence bundle pins no `Concepts/` file, and the tools showed none. The quick before-checks at `d69850c150` give the same Spec Lock (47), evidence (3,014) and readiness (134) rows as at `6385c1c3d3`.
   - **Regenerated anyway:** everything from step 4. Against `4230c4d929`, the outputs differ only in timestamps, in the base SHA written into the evidence bundle's check records and the decision row, and in the new edition's validator receipt hash and the hashes that chain from it (node readiness's expected receipt hash, the two shard-report hashes in the evidence inventory, and the buildability report's hash in Spec Lock).

The superseded runs are kept in the evidence folder:
- `first-run-base-090bafbbe9/`
- `superseded-base-7cf5636835/`
- `superseded-base-104c6c82b5/`
- `superseded-base-34cfd7e93d/`
- `superseded-base-6385c1c3d3/`: the reviewed `4230c4d929` run, including its landing check

**Status.** Prepared and pushed (`--force-with-lease`), **not landed**. The lead lands it.

**Commits on the branch:**

| Commit | What it is |
|---|---|
| **1** `de3cb51cdd` | Stream P's stale-pin re-pins, from `ca431a5084` (`origin/plans/p-r0-prep-20261114`, report `P-reseal/R0-PREP-REPORT.md`). Nine lines in seven Goal/cancel resource maps move the full-thread runtime schema pin from `5fa07b1e…` to `926b1216…`. At the base the schema still hashes `926b1216…` (40,428 bytes), and the cherry-pick applied cleanly. No `.md` changed. |
| **2** | This reseal: the seven governance files below and this record. |

## What landed since the last reseal

The last reseal is the 2026-11-04 checkpoint (`45f4c054ce`, decision-row amendments `dd8d15c787` and `0edfd9406f`, snapshot follow-up `f9c5de6561`). Since then 30 snapshot and baseline follow-ups have landed, one per Plans landing (Q5b and Q2 share one):

| Follow-up | Landing it follows |
|---|---|
| `071a7e21a9` | Stream C: closure re-audit |
| `4dac75c871` | Stream C: owner answers |
| `3b4bfbabac` | SW-04 |
| `db416a680b` | Stream E: Event Authority batch 1 |
| `d5ec2f70c0` | Stream C: legacy rule |
| `451738fc0b` | Stream C: GRS-027 lost rules |
| `6861d332de` | Stream C: owner answers 2 |
| `8fbcd61aaf` | Stream C: Q-A |
| `dd6580cd11` | Stream F: group 5 |
| `74748ebd92` | Stream C: Q5 P0+R4 (DL-333, DL-335) |
| `5cbb92a5aa` | Snapshot prune (`snapshot-current` removes older runs) |
| `78a1fd64cd` | Stream C: Q5 definitions (DL-341) |
| `4e3b6c07c7` | Stream C: Q1 Auditor-loop home (DL-472) |
| `61cfa89942` | Stream C: Q5b (DL-471) and Q2 (DL-470) |
| `b4013202fa` | Stream C: Q5c wiring |
| `b5bd6cafd1` | Stream C: final pass |
| `52aa6b4f7e` | Placement, settings canon batch and preserved tokens |
| `2880dfc517` | Stream C: final-pass follow-up |
| `002800123f` | Stream C: canon fix |
| `b4e7a1c639` | Stream P: Settings batches 2 and 3 |
| `a27594279e` | Stream E: Event Authority batch 2 (`streams/E-RESEAL-BATCH2.md`) |
| `8f4eddac6f` | Stream C: Goal V2 leftover sweep (DL-477, DL-478) |
| `c20f9cdf99` | Stream P: batch 4 (DL-479) |
| `3e83edfaca` | Stream C: close-out (`closeout/LANDING-NOTE.md`) |
| `f4e49a6dc4` | Stream C: atom-0017 (PNC-012, ledger `pldg-20260616-002`) |
| `7cf5636835` | Stream E: Event Authority batch 3, `d6159397cc` (INT3: DG-INT with GRS-1132, GRS-1136, SP-1134 and EP-1130; wave-3 lanes W3A to W3I; DL-510; `streams/E-RESEAL-BATCH3.md`) |
| `34cfd7e93d` | Stream C: PLS-026 replacement of audit-006 closure-matrix lines 22 and 23 (DL-511, `c7e935503b..83d1c6128b`; `landing/pls026/LANDING-NOTE.md`) |
| `4f01c9c836` | Stream E: S1, the CA-SEAL landing step (`streams/E-RESEAL-S1.md`), including P's three Spec Lock anchors `fc56eef60b` |
| `4a1d6a36e0` | Stream C: wave-5 append of registry rows 1203, 25 and 35 (`landing/wave5/LANDING-NOTE.md`) |
| `ee3c19f1e4` | Stream E: admission merge 1, `71ece74768` (DL-520 to DL-692, registry 46 to 219 families; `streams/E-RESEAL-MERGE1.md`) |

Also inside the base:
- stream C's T203 audit-closure fix (`e3691dffcd..104c6c82b5`, script and test only);
- E's T198 exclusions refresh `6385c1c3d3`;
- pm7-perf's toolbatch landing `d69850c150` (FO-206 pre-draw follow-up, the kit tool-issues batch and a PMConcept7 republish; Concepts only, so no follow-up);
- the other Concepts-only landings.

The stale set below comes from the tools (`verify-spec-lock`, `validate-evidence`, `validate-implementation-readiness` and the landing check), not from these lists.

### The streams' reseal lists, item by item

| Item | Handled here |
|---|---|
| **Spec Lock** (E's batch 3: 10 files; S1: 14 readiness-family Spec Lock rows on 5 paths; merge 1: `pm-implementation-readiness.py` and `pm_pnc019_currentness.py`; C: `scripts/pm-audit-closure.py`) | Yes. All are among the 47 entries stale at the base, and all were refreshed. Of S1's 22 rows, the other 8 are 2 drift rows on `Plans/Spec_Lock.json` (cleared by the new edition) and 6 closure-registry rows (a residual, below). **S1's three anchors were current at the base, so they are unchanged byte for byte:** `5fa9bc51…`, `af10557b…`, `9cb7c23a…`. |
| **Evidence** (batch 3's 15 artifacts, merge 1's `Decision_Log.md`, PLS-026's documents) | Yes, by the artifact inventory re-sync. |
| **Event Authority currentness:** source drift, and merge 1's `event_authority_currentness_live_registry_drift` | Yes, by the new open edition. Its status file now pins the live registry: revision `2026-11-15.173`, 219 families, SHA-256 `e1bcd4b7…`. Node readiness goes from 102 drift rows and 1 registry-drift row to 0. |
| **`buildability_gate_report.json`** | Yes, regenerated. |
| **DG's GRS-1132, GRS-1136, SP-1134 and EP-1130:** Spec Lock and evidence hashes, and node readiness | Yes. |
| **PNC-019 receipt pins** (batch 3's 4 sources, merge 1's `event_family_registry.json` and `pm_pnc019_currentness.py`, DG's two documents) | No. The receipt is E's; changing it would claim a recertification that did not happen (S9/S11). |
| **Closure-registry staleness** (batch 3's 16 owner-evidence hashes; T203's, PLS-026's 18 rows on 12 registry rows, and wave-5's), the audit status index and `Plans/.audits/closure-reaudit-20261104/**`, including audit-006 | No. DL-039 residuals. No tool showed otherwise. |
| **E's INTEGRATION-NOTES item:** the `event_type` keys in `non_executable_closure_evidence.json` | No; see below. |

**Why the `non_executable_closure_evidence.json` keys are not changed.** E's note (`event-authority-20261104/state/INTEGRATION-NOTES.md:337`) is marked for E's S9 reseal. It says that `plan_compile.stage_receipt.recorded`, `executor.intake_report.recorded`, `provider.stream.event_recorded` and `testing.receipt.recorded` "label existing records (s6r `d42c1d1be6`); correct them at the reseal". Three reasons:
- **It hasn't landed.** `d42c1d1be6` is not on `main`.
- **No tool flags it.** No check reports a row on the file except the Spec Lock hash family, which this reseal clears.
- **No target is given.** The note names no corrected form, so the edit would be a content change to a hand-written readiness record.

It goes to S9.

## Scope

Commit 2 changes exactly seven tracked files and adds this record:

| File | Before SHA-256 | After SHA-256 | What changed |
|---|---|---|---|
| `Plans/Spec_Lock.json` | `bf7d687e79fa…` | `ffc797d84793…` | Exactly 48 `sha256` values and nothing else: the 47 entries stale at the base and the buildability report. S1's three anchors are untouched. Afterwards 0 of 104 entries are stale. |
| `Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json` | `2e0822ec9a06…` | `ff928de0bfa6…` | Artifact inventory re-synced (`sync-plan-sharding-evidence`: 4,367 artifacts, 976 shard paths added, 4 removed), then refreshed (`pm-governance-seal.py refresh`), which adds the check record `governance-reseal-2026-11-14-r0`. This clears 3,010 `artifact_hash_stale` rows and 4 renamed-shard `missing_ref` rows, including the three Q5 references the 2026-11-06 landing exception left for the reseal. |
| `…/shard_report.json` | `78a8fa8ed889…` | `29471030ff06…` | Live shard report: 99 documents, 4,067 shards. |
| `…/shard-check-report.json` | `05d1e754100b…` | `0283169334f9…` | Live shard check report: 99 documents, 4,067 shards, 0 failures. No shard body or path changed (stop condition held). |
| `Plans/.implementation_readiness/buildability_gate_report.json` | `dd648fdbcd78…` | `b75d3d39f984…` | Regenerated once. A probe after the final index differed only in `generated_at_utc`, so the first generation is kept. |
| `Plans/.plan_index/node_readiness_report.json` | `7c4e4c8ef7a9…` | `225c8e359a7b…` | Final index generation with the new currentness edition present. 102 source-drift rows and 1 live-registry-drift row go to 0; the 19 `pnc019_source_hash_stale` rows stay. Three index files that differed only in timestamps were restored. |
| `Plans/auto_decisions.jsonl` | `67fe2b6a000f…` | `3e84f1773b3d…` | One row appended through `upsert_auto_decision` (225 to 226 rows): `dec-2026-11-14-governance-reseal-r0`. Its wording names frozen base `d69850c150` and the 30 follow-ups. `validate-auto-decisions` passes. Contract refs: `Plans/00-plans-index.md`, `Plans/Decision_Log.md#DL-039`, `Plans/Decision_Log.md#DL-300`, `Plans/auto_decisions.schema.json`. The 225 earlier rows are byte-identical. Its `applied_to` names only the six files above that the reseal changes. |

**Not changed:**
- the PNC-019 receipt, the event family registry and any Event Authority row;
- `Plans/.implementation_readiness/non_executable_closure_evidence.json`;
- the DL-412 receipt (`reports/event-authority-20261104/seal-check-multifamily-step-receipt.json`): its `validator_after_sha256` stays `319f6bff…`, and `write_multifamily_receipt.py` was not run;
- any closure-registry hash, the audit status index and `Plans/.audits/**`;
- any shard;
- owner prose, schemas, scripts, tooling, schema versions, locked decisions, the plan graph and the sharding config;
- any run-002 artifact. Run 002 is a declared-superseded historical run and validated with 0 failures at every earlier base, so its refresh pair is not run, as in the checkpoint reseal.

**Not created:** WorkNodes, NodeSeeds, executable queues, final node manifests, product code or production build tasks. The denominator stays `UNKNOWN_OPEN`, and PNC-019 is not recertified.

## Sequence

The driver is `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261114/reseal.py`, adapted from the checkpoint driver. Compared with it:
- new paths;
- an explicit frozen base for the evidence record and the decision row;
- the R0 decision row;
- an `applied_to` limited to the changed files.

Every command's argv, output streams, exit code and timing are kept under `before/`, `apply/` and `after/`.

1. **Rebase.** `git switch -C` the branch to `d69850c150` and cherry-pick commit 1 (clean), which drops commit 2.
2. **Setup.** Full worktree (not sparse); evidence symlink; the 10 ignored `Plans/.audits` inputs; the 15-file currentness edition restored from `backup/currentness-baseline-15/`. All 15 match the current `reports/landing-checks/baseline.json` (recorded at `71ece74768`) and the shared checkout.
3. **Quick before-checks** at commit 1: Spec Lock 47 of 104 stale (S1's anchors not among them), evidence 3,014, readiness 134. These are the same as at `6385c1c3d3`.
4. **Currentness edition 1.** Generated externally; only its seven generated files are installed, and the eight frozen files are unchanged. Validates.
5. **Index generate and validate.** 8,966 PlanUnits, 33,695 acceptance units, status `pass`.
6. **Buildability.** Generated once.
7. **Shards.** Generate and check into the bundle reports. 0 changed shard paths.
8. **Evidence.** Sync, then refresh.
9. **Spec Lock refresh.** The stale set was checked first: the 47 entries stale at the base plus the buildability report. Afterwards 0 are stale.
10. **Final currentness edition.** Generated after the evidence bundle and Spec Lock reached their final bytes, then installed and validated: `evidence_valid=true`, `event_authority_closed=false`, status `UNKNOWN_OPEN`.
    - **Against edition 1:** only `CURRENT_EVENT_SOURCE_INVENTORY.json` and `VALIDATOR_RECEIPT.json` changed.
    - **Against the shared baseline edition:** five generated files differ (the inventory, denominator status, occurrences, README and receipt), and all eight frozen files are identical.
    - **Hashes:** final validator receipt SHA-256 `5a1c070b9f0afc24848a6da357c73c6b5ede42b5e563044f0dd0181a62616b6f`. The 15-file manifest `proof/currentness-15-manifest.sha256` has SHA-256 `0f1abff357df…`.
    - **Custody:** the inventory's `git_custody` block records the generation head `de3cb51cdd` and the six then-uncommitted governance paths, as the checkpoint edition did.
11. **Final index.** Validates: top-level status `pass`, 8,966 PlanUnits.
12. **Buildability probe.** Timestamp-only difference, so the first generation is restored.
13. **Decision row.** Re-upserted with the updated wording, then validated.
14. **Commit 2** (`1c7e7c11e0`), then the direct validators with the new edition. The lead runs the landing check in the shared checkout at landing, so none was run here this time. The landing check of the reviewed `4230c4d929` run at `6385c1c3d3` (below) stands for it. The two bases differ only in `Concepts/`, and the outputs only as step 4 of the History says.

    This record was then added to the same, still unpushed, commit. The measured tree and the pushed tree differ only by this record.

## Check movement

As the lead directed, "before" is `main`'s current baseline (`reports/landing-checks/baseline.json`, recorded at `71ece74768`, the same governance bytes as `6385c1c3d3` and `d69850c150`), plus the quick direct checks of step 3. "After" for the direct checks is measured at `d69850c150`. The aggregate rows come from the landing check at `6385c1c3d3`.

| Check | Before | After |
|---|---:|---:|
| **Spec Lock** | 47 | 0 (of 104) |
| **Evidence** | 3,014 | 0 |
| **Plan graph** | 3,014 | 0 |
| **Readiness** | 134 | 23 |
| **`pm-plan-index.py validate`**, edition present | — | `pass` |
| **Run-gates** (baseline) | 6,412 | 330 in the landing check; 226 with the new edition |
| **Audit-governance** (baseline) | 6,411 | 329 in the landing check; 225 with the new edition |
| **Plan migration** (baseline) | 0 | 0 |

**Readiness before**, by kind:
- 102 `event_authority_currentness_source_drift`
- 1 `event_authority_currentness_live_registry_drift`
- 19 `pnc019_source_hash_stale`
- 7 Spec Lock rows: 5 `storage_value_registry_spec_lock_hash_stale`, 1 `event_record_spec_lock_hash_stale` and 1 `non_executable_closure_spec_lock_hash_stale`
- 4 Event Authority denominator and depth rows
- 1 `buildability_gate_report_stale_or_not_canonical`

**Readiness after:** 19 `pnc019_source_hash_stale` rows on the PNC-019 receipt, 2 `event_denominator_unresolved` and 2 `event_family_contract_depth_unresolved`. The 19 rows are:
- the earlier 18;
- merge 1's `Plans/event_family_registry.json`.

`scripts/pm_pnc019_currentness.py` was already among the 18. One of the 19 names the currentness `VALIDATOR_RECEIPT.json`, which the receipt records as `null`; its expected hash moves with each edition, and the row stays.

### Landing check of the reviewed run (`--base origin/main` = `6385c1c3d3`, on that run's governance files `0baa18440d`; kept in `superseded-base-6385c1c3d3/landing-after/`)

It uses the baseline-bound shared edition, so it measures the new governance bytes against the old edition.

**Result:** exit 1, nothing blocking, 0 infrastructure rows, 0 pre-existing, 52 minutes.
- **Totals:** run-gates 330 and audit-governance 329, against the baseline's 6,412 and 6,411. Each falls by 6,082, and 110 baseline buckets are resolved. Plan migration stays 0. Spec Lock, evidence and plan graph are 0.
- **Readiness: 127 in each aggregate.** That is the 23 direct rows plus 103 `event_authority_currentness_source_drift` rows and 1 `event_authority_currentness_live_registry_drift` row. The extra rows exist because the shared edition predates the sources and the registry that the covered landings and this reseal changed.
  - Two drift rows are new: on the evidence bundle, one in each aggregate. The bucket grew from 102 to 103.
  - All of it is governance staleness. It clears when step 4 of the landing instructions installs the new edition.
  - With the new edition, the aggregates are 226 and 225: the 23 direct readiness rows replace the 127. The other subchecks are unchanged: audit closure 201, the T212 `json_syntax` row in run-gates, and the T213 usage row in each.
- **Audit closure: 201, compared by total only.** Six on-branch rows are excused as staleness: `audit_closure_validator_error` on registry rows 368 and 373, whose owner and closure evidence hashes for `Plans/Spec_Lock.json` are stale. They are the same rows E's S1 list reported, and they were stale before this branch.

## Residuals this reseal does not claim to address

- **Audit closure: 201 in each aggregate.** DL-039 forbids restamping closure-registry hashes without a re-audit. That covers:
  - the hashes E's batch-3 list names;
  - the registry rows staled by C's T203, PLS-026 and wave-5 landings;
  - the audit status index and `Plans/.audits/closure-reaudit-20261104/**`, including audit-006.

  Stream C's re-audit and its final delta pass clear them. C's W01 rows (004:1649/1653/1654) can be rechecked now that Spec Lock and the evidence bundle are current.
- **PNC-019: 19 receipt rows.** These clear only through a real recertification by `scripts/pm-pnc019-certification-harness.py`. That is stream E's S9 and S11.
- **Event Authority: 4 denominator and depth rows.** Stream E.
- **`non_executable_closure_evidence.json` `event_type` keys.** E's S9.
- **`json_syntax` and `validate_usage_contract_drift`.** The 4,400-digit integer in `Plans/card2_event_p2a_cases.json` (T212, T213). The baseline holds both, so these runs were plain too.
- **The `/tmp` quota.** `/tmp` is a 20 GB tmpfs with a per-user quota shared by every thread of this user. It lost one landing-check subcheck at `104c6c82b5` to `validator_no_output` (`OSError: [Errno 122]`). Landing checks should set `TMPDIR` to local disk. It goes on the tool-issues list.

## Landing instructions

1. Take the landing lock and fetch.
   - **If `main` is `d69850c150`:** the branch fast-forwards as it stands.
   - **If `main` moved past `d69850c150` with any `Plans/` or `scripts/` path:** rebase and regenerate every governance output from step 4 of the sequence on, keeping S1's three Spec Lock anchors. Never hand-merge generated governance files.
   - **If the move is Concepts-only:** a rebase is all it needs.
2. Run the shard check in the branch worktree. In the shared checkout, stop if there is uncommitted work in any of the 15 paths (commit 1's seven, commit 2's seven and this record). Otherwise:
   - fast-forward;
   - run the shard check;
   - run the landing check before pushing `main`, with `TMPDIR` on local disk.

   It runs against the old shared currentness edition. It is expected to report what the landing check above reports (run-gates about 330, audit-governance about 329, 0 blocking).
3. Push `main` to both remotes, then verify both tips.
4. While still holding the lock, back up the shared checkout's ignored edition. Install only the seven generated files from `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261114/currentness-final/` (five of them differ from the shared files), keep the eight frozen files, and validate. If the branch was regenerated in step 1, install the edition regenerated there instead.
5. This landing changes `Plans/` paths. In a full local worktree at the new `main`, run `snapshot-current` first and then `pm-landing-check.py --record-baseline`. Commit them as one follow-up, then fast-forward and push. Remove the landed reseal worktree and the landed branch, then release the lock.
6. Mail `pm-closure-lead`, `pm-ea-lead`, `pm7-build` and `pm-fo-lead` with the landed SHA.

## Evidence

Everything is outside the repository, in `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261114/`:
- `reseal.py`, the driver, and `decision-rationale.txt`;
- `before/` (the quick checks at `d69850c150`) and `after/` (the direct validators and `index-validate.out`);
- `apply/`: every reseal command;
- `proof/`:
  - the currentness baseline binding and both installs;
  - the 15-file manifest;
  - the index timestamp restores;
  - the shard stop condition;
  - the Spec Lock stale sets before and after the refresh;
  - the buildability first generation, probe and diff;
  - `tracked-before-after.txt`;
- `currentness-1/`, `currentness-final/`, `backup/currentness-baseline-15/` and `backup/tracked-before/`;
- `first-run-base-090bafbbe9/` (the reviewed first run) and the four `superseded-base-*` folders. `superseded-base-6385c1c3d3/landing-after/` holds the landing check cited above: its JSON report, log and every check's full report.
