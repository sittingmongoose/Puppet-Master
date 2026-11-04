# Governance Reseal Record — 2026-11-03

## Status

Landed. Jared assigned the reseal in chat on 2026-11-03 ("whoever you want. Opus 5.5 xhigh is fine"). The `pm7-reseal` thread (Opus 5.5) prepared branch `plans/governance-reseal-20261103` at frozen main `4dbe63c96c46`, in the full local T3 worktree `~/.t3/worktrees/PuppetMaster/t3-43d1d239`. It landed the branch itself, holding the landing lock from 2026-11-04T03:53:27Z:

| Step | Result |
|---|---|
| **Reseal commit `9fa4018fb0`** | Pushed to `main` on both remotes, `4dbe63c96c..9fa4018fb0`. Both tips were verified. |
| **Branch comparison** on `9fa4018fb0`, with the baseline-bound shared edition | Exit 1, nothing that stops the landing. 348 in each aggregate (baseline 5,950), plan migration 0. The 6 new rows are `event_authority_currentness_source_drift` for the evidence bundle, the receipt and the Spec Lock, measured against the old edition. Of the rows naming this branch's paths, 42 are excused as staleness: 34 receipt rows, 6 drift rows and 2 buildability rows. 0 infrastructure rows. 783 s. The baseline and the shared edition are byte-identical before and after. |
| **Shard checks** | Pass in the branch worktree and in the shared checkout after the fast-forward. |
| **Shared landing check** after the fast-forward, before the push | Identical to the branch comparison: exit 1, nothing that stops the landing. 1,093 s. |
| **Shared currentness** | After the push, the seven generated files from `reviewed-currentness/` were installed and the eight frozen files are unchanged. Validation gives `evidence_valid=true`, and all 15 shared files equal the prepared edition. Proof: `landing/shared-currentness-install.json`. |
| **Follow-up `bb8e125b63`** | Snapshot `pds-20261104-002-current-planunit-snapshot` (96 documents, 7,421 PlanUnits, status `pass`). Then the baseline, recorded at `9fa4018fb0` with the installed edition: run-gates 230, audit-governance 230, plan migration 0, 24 buckets. Baseline SHA-256 `97400a63728d687147b15f251d181556c396ffec586a485345afe8c1ced5f6c2`. |
| **This status update** | A reports-only commit on top of the follow-up. Both land in one fast-forward after a shared landing check. That check's verdict is in `landing/landing-check-followup.out` in the evidence folder. |

The 348 against 230 difference is the drift that the old shared edition reported until the prepared edition was installed: 117 source-drift rows and 1 registry-drift row.

This record claims none of the following:
- runtime certification or a PNC-019 recertification;
- Event Authority closure;
- completion of the denominator or of contract depth;
- PNC-019 execution.

## Sequencing

The PM7 small landing (`07dbf43786..d45dfcdba5`, refresh `3cafa5a8d0`) reported the reseal request. `claude-projects-refresh` was about to land the projects and settings refresh. By mail (`1103213957-38c0`, answered `1103214035-92a6`) the two threads agreed that it lands first and that one reseal covers both landings. It landed `8895b233be`, then refresh `4dbe63c96c`, and handed the staleness over in mail `1104025710-9299`. A `pm-mail` FYI to all threads then asked for notice before any Plans or scripts landing.

## What moved

| History since the 2026-11-01 reseal (`40e8ccd704`, refresh `34b9ab2843`) | What it changed |
|---|---|
| **PM7 plans canon** (DL-272 footage, fixture identities, refusal and Ready feedback), refresh `07dbf43786` | PM7 owner docs and fixtures |
| **DL-273 retirement**, `a9d07f5ec7` to `8558fa10e6`, with Glass `9d31647f83` and FO-22 `0801112071`; refresh `3cafa5a8d0` | Hosted Forgejo and unselected hosted providers retired across plans, tests and wiring; Glass and setup contrast; FO-22 Back paths |
| **Concepts and harness**, including `b53f4c0702` | Projects and settings concepts and a playwright bump; no Plans paths |
| **Projects and settings refresh**, lanes A to F-d, `f41a598213` to `8895b233be`; refresh `4dbe63c96c` | DL-280 to DL-300, owner docs, schemas, fixtures, registries and validators |
| **DL-300**, `5375bfd2a7` | Event Authority registry `2026-11-04.1`, 46 families, and the PNC-019 checkpoint module naming it |
| **This reseal** | The 10 governance files below and these 6 records |

Spec Lock still has 101 entries. Its diff is exactly 41 `sha256` values and nothing else:
- the 39 entries that were stale at the frozen base: 28 owner documents, `Plans/storage_value_registry.json`, six schemas or fixtures (`editor_appearance.schema.json`, `execution_unit_context.schema.json`, `glyph_catalog.json`, `pm7_canon.fixtures.json`, `pm7_control_bindings.schema.json` and `shared_runtime_contracts.schema.json`) and four scripts (`pm-implementation-readiness.py`, `pm-plans-verify.py`, `pm-prd-planning-runtime-validate.py` and `pm_pnc019_currentness.py`);
- the retained buildability report;
- the refreshed PNC-019 receipt.

No schema version, locked decision, registration, plan graph, sharding configuration or owner prose changed.

The checked branch changes these ten governance files and adds the six records:

1. `Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json`
2. `Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/shard-check-report.json`
3. `Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/shard_report.json`
4. `Plans/.implementation_readiness/buildability_gate_report.json`
5. `Plans/.implementation_readiness/pnc019_certification_receipt.json` (one source hash, under DL-300)
6. `Plans/.plan_index/node_readiness_report.json`
7. `Plans/.plan_migration/pds-20260611-002-atomize-planunits/batch_report.jsonl`
8. `Plans/.plan_migration/pds-20260611-002-atomize-planunits/final_validation_summary.json`
9. `Plans/Spec_Lock.json`
10. `Plans/auto_decisions.jsonl` (one appended decision)

Before and after inventories cover all 17,498 tracked regular files plus the tracked symlink. Before the records were added, they differ in exactly those ten paths.

## Exact check movement

| Check | Before | After |
|---|---:|---:|
| **Spec Lock** | 39 | 0 |
| **Evidence** | 2,693 | 0 |
| **Plan graph** | 2,693 | 0 |
| **Readiness** | 146 | 24 |
| **Aggregate run 002** | 175 | 2 |
| **Current snapshot** | 0 | 0 |
| **Run-gates** | 5,950 | 230 |
| **Audit-governance** | 5,950 | 230 |

The before rows by kind:
- **Spec Lock:** 39 `stale_hash`.
- **Evidence and plan graph:** 2,689 `artifact_hash_stale` and 4 `missing_ref` each, on shard paths the regenerations renamed. The artifact inventory sync clears both.
- **Readiness:**
  - 114 `event_authority_currentness_source_drift`;
  - 1 `event_authority_currentness_live_registry_drift`, the DL-300 registry against the old status file;
  - 18 `pnc019_source_hash_stale`;
  - 6 `*_spec_lock_hash_stale`;
  - the 7 inherited rows listed under the readiness residual below.
- **Run 002:** 172 `stale_batch_report_sha256_after`, 1 `complete_final_summary_live_plan_unit_count_stale`, and the 2 inherited rows.

The readiness residual has the same shape as after the 2026-11-01 reseal, with one more historical receipt row:
- 17 `pnc019_source_hash_stale`. These are the 16 historical certification dependencies from the last record, plus `Plans/execution_unit_context.schema.json`, which the projects refresh edited. Refreshing them would claim a recertification that did not happen.
- two `event_denominator_unresolved`;
- two `event_family_contract_depth_unresolved`;
- one `event_legacy_fixture_root_mismatch`: the golden fixture names `2026-08-27.1`, and now `2026-11-04.1` is expected;
- one self-test row (`implementation_readiness_self_tests_failed`), inherited;
- one `buildability_gate_report_stale_or_not_canonical`, which is the known one-step cycle.

All source-drift, registry-drift and Spec Lock hash rows are gone. Run 002 keeps only `doc_count_mismatch` and `inventory_doc_set_mismatch`.

The aggregates keep audit closure 201 and PM7 GUI fixtures 3, plus those readiness and run-002 rows: 201 + 24 + 2 + 3 = 230. The PM7 GUI rows are the `context.compaction` family and its two missing command fixtures, unchanged since 2026-11-01. PRD planning runtime contracts, 1,240 at the last reseal, was already 0 at the frozen base.

The normalized comparison finds no new failure in either aggregate. Each aggregate prints four readiness rows it did not print before: the two denominator rows, the legacy fixture-root row and the self-test row. All four are in the complete before export. They appear only because the printed sample held part of the 146 readiness rows before and holds all 24 after.

## Refresh results

- **Shards:** 99 sources and 3,090 shards generated and checked, with zero failures. No shard body or path changed; only the two live reports changed.
- **Evidence:** the live artifact inventory is rebuilt to 3,390 artifacts, with 4 removed and 122 added shard paths. Evidence and plan graph both pass complete validation.
- **Index:** generation and validation pass at 7,421 PlanUnits and 29,931 acceptance units, with top-level status `pass`. Three index files whose only differences were timestamp fields were restored byte for byte; only `node_readiness_report.json` remains changed.
- **Buildability:** the first generation is kept, SHA-256 `11904169ccc31aa82bf3e5a5d48031cdd36061a5b414c068562d59fa529a9802`. A probe after the final index differs only in `generated_at_utc` and `source_hashes/Plans/.plan_index/node_readiness_report.json`. That one-step cycle is known, so it is kept rather than chased.
- **Run 002:** 172 of 212 batch rows changed, only in their after-hashes. The final summary is refreshed in preseal state.
- **Decisions:** 222 rows became 223. The only new id is `dec-2026-11-03-governance-reseal`, appended through `upsert_auto_decision`, and `validate-auto-decisions` passes.

## DL-300 receipt pin

DL-300 approves registry `2026-11-04.1` (46 families) as the PNC-019 baseline and says "The checkpoint evidence and the readiness receipt are refreshed by the next reseal." The bounded refresh follows the DL-188 refresh in the 2026-10-11 reseal:
- **What moved:** in `pnc019_certification_receipt.json`, only `source_hashes["Plans/event_family_registry.json"]`, from `4ffde4e80c0671c7240c65b7903e6cabc0c6112bc88afc3fc2faca2a044370fe` to `443ae71d7e6326c3673a409f63950b9f33713c67f43c256fed6efa1c0d03a653`.
- **What did not:** the workspace-layout v2 payload pin `a611ee3d…` already matched and is unchanged. Every other field and source hash is equal, and the candidate passed schema validation before the write.
- **Receipt SHA-256:** `49ce40e2816b155a738b7f9278deb8b1de105ec3f8204cfa79e8291cad4b4f29` before, `585827e76b2a53b74061b39e40b0734a27356cf225963da94b0e5d1020d0cc8c` after.
- **Checkpoint module:** SHA-256 `34fbf59930d68d0a45f5887a0fb507b8caaf7336e69dcc00a5ba834983747c81`; this reseal did not change it.
- **Harness:** not run.

[checkpoint-pin-verification.json](checkpoint-pin-verification.json) records the dry run, the applied delta and the helper hash.

## Currentness and PNC-019

The starting 15-file ignored edition exactly matched the landing baseline. Two external editions were generated:
- `currentness-1`, superseded;
- `currentness-final`, which was generated after the receipt, the evidence bundle and the Spec Lock reached their final bytes. It was validated again after the decision row: `evidence_valid=true`, `event_authority_closed=false`.

Only its seven generated files were installed locally. The eight frozen files still match the baseline exactly. The status file now pins registry `2026-11-04.1`, 46 families and SHA-256 `443ae71d…`, which clears `event_authority_currentness_live_registry_drift`.

The denominator remains `UNKNOWN_OPEN`:
- complete denominator known: false;
- contract depth complete: false;
- build and PNC authority: false;
- 46 registered families;
- the 252-row quarantine unchanged.

Final validator receipt SHA-256: `7e54ba80e607e3384fb0862a9363f2c6abc258ae4c3cf17666560280237e5471`. Final 15-file manifest SHA-256: `126c4309ca775ccb0d0d0b78f35044635890a8fc74d103c41a5fc2d0f87e313c`.

## Landing instructions

1. Take `/mnt/Cursor/PuppetMaster-Evidence/scratch/landing-lock/held` and fetch. If main moved, rebase and regenerate affected outputs; never hand-merge generated governance files.
2. Run the shard check in the branch worktree. In the shared checkout, stop if uncommitted work overlaps the 16 checked paths. Otherwise fast-forward, run the shard check, then run the landing check before pushing main.
3. Push main to both remotes and verify both tips. Governance staleness that this reseal itself creates is not a reason for another reseal.
4. Still holding the lock, install only the seven generated files from `reviewed-currentness/` into the shared checkout's ignored currentness directory. Keep all eight frozen baseline files, and validate shared currentness.
5. In a full local worktree at the new main, run `snapshot-current` first and `pm-landing-check.py --record-baseline` second. Commit them together as one follow-up, then fast-forward and push main. Release the lock after the worktree cleanup.
6. Never record the baseline before the snapshot, never refresh it to excuse the landing just measured, and never install shared currentness before the first checked main push.

## Evidence index

All raw captures are outside the repository, at `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261103/`:

- `before/` and `after/`: complete captures of the eight checks for each stage, with command records and summaries;
- `apply/`: every refresh command, with its streams and exit;
- `proof/`:
  - inventories;
  - the currentness binding and installs;
  - the receipt-pin dry run and apply;
  - checkpoint pin proofs;
  - the buildability first generation, probe and cycle;
  - timestamp restores;
  - the shard stop condition;
- `comparison/`: the normalized comparison, the final currentness validation and the landing comparison;
- `backup/currentness-baseline-15/`, `backup/pnc019_certification_receipt.before.json`, `currentness-1/`, `currentness-final/` and `reviewed-currentness/`;
- `reseal.py`, `compile_records.py` and `install_shared_currentness.py`: the exact helper code.
