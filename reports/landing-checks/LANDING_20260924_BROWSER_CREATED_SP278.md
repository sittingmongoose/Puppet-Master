# Landing record: Browser-created SP-278 v2 checkpoint companion, 2026-09-24

Branch `plans/browser-created-sp278-20260923`, rebased onto `main` `afcbec3317` and checked at tip `b1347ec1f6`. This record is a report-only commit on top of that tip, and `main` is fast-forwarded to it. The branch holds the conditional `browser.workspace.created` v2 checkpoint successor, repaired after a blind review with one commit per finding (`reports/event-authority-20260911/step-08-browser-created-v2-companion-20260924.md`). It changes 126 paths: the two owner documents `Plans/storage-plan.md` and `Plans/Section15_MVP_Promoted_Features_Spec.md`, their regenerated shard trees and `Plans/.plan_index`, the new `Plans/browser_workspace_created_checkpoint_v2.schema.json`, `Plans/browser_workspace_created_checkpoint_v2_fixtures.json` and `scripts/pm_browser_workspace_created_v2.py`, `tests/test_pm_browser_workspace_created.py`, and three Event Authority reports. It adds no PlanUnit, family, registry, event, admission or retention row. The v2 definition stays `conditional_not_admitted`, and native proof is NOT_RUN.

## Procedure

1. Landing lock taken at 2026-09-24T13:58:11Z with `mkdir /mnt/Cursor/PuppetMaster-Evidence/scratch/landing-lock/held`; agent, branch and time in `held/holder.txt`, refreshed at each step. The fetch ran under the lock.
2. `git fetch origin`: `origin/main` was `afcbec3317`, the branch's base, so no rebase was needed. The shared checkout was on `main` at `afcbec3317`.
3. Shared checkout preflight: none of the 126 branch paths had an uncommitted or untracked entry, and none of the branch's four new files existed there. The 43 unrelated dirty tracked files were hash-guarded; they were unchanged from before the first capture to after the last.
4. Full capture of `main`'s two aggregates at `afcbec3317`. Every subcheck's complete return was saved before the CLI's sample limits, using the unmodified verifier with `pm-landing-check.py`'s own arguments.
5. `git merge --ff-only plans/browser-created-sp278-20260923`: `main` to `b1347ec1f6`.
6. `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json`: pass, 99 sources, 2,720 shards, 0 failures.
7. `python3 scripts/pm-landing-check.py --base origin/main --json`: exit **2**, in 900 seconds.
8. Full capture of the branch's two aggregates in the same checkout; compared row by row with `main` using the landing check's own normalization.
9. Before pushing, `origin/main` was confirmed unchanged at `afcbec3317`.

## What the landing check reported, and why it does not stop this landing

| Check | `main` at `afcbec3317` | This landing | Change |
|---|---:|---:|---:|
| `run-gates` total | 3,217 | 3,279 | +62 |
| `audit-governance` total | 3,217 | 3,279 | +62 |
| evidence / plan graph (truncated) | 847 / 847 | 876 / 876 | +29 / +29 |
| implementation readiness | 38 | 39 | +1 |
| plan-migration subcheck | 31 | 34 | +3 |
| Spec Lock | 10 | 10 | 0 |
| `plan-migration-validate` (run 017) | 33,072 | 33,072 | 0 |

The `main` values come from this landing's own full capture of `afcbec3317`. They equal what the TestOpus5.5 M1a landing recorded, and the migration total comes from that record.

**Full failure-key proof.** Comparing the complete `main` and branch captures, each aggregate gains exactly 62 rows and loses none, and every added row is governance staleness on `Plans/Section15_MVP_Promoted_Features_Spec.md` or its derived shards:

| Added rows per aggregate | Kind | Exact attribution |
|---:|---|---|
| 29 evidence + 29 plan graph | `artifact_hash_stale` | `Plans/Section15_MVP_Promoted_Features_Spec.md` and each of the 28 files of `Plans/_shards/section15_mvp_promoted_features_spec/`, the complete tree, all in `Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json` |
| 1 | `event_authority_currentness_source_drift` | `source_path=Plans/Section15_MVP_Promoted_Features_Spec.md` |
| 3 | `stale_batch_report_sha256_after` | `doc_path=Plans/Section15_MVP_Promoted_Features_Spec.md` in the atomize-planunits batch report |

`Plans/storage-plan.md` adds no row. Its Spec Lock hash, its evidence and plan-graph artifact hashes and those of its shards, and its currentness binding were already stale on `main` from earlier canon edits awaiting reseal. The failure keys drop hash values, so those rows keep their keys. No added row names any other file, and no row was removed.

The checker's **10 blocking items** are classified as follows:

| Items | Classification |
|---:|---|
| 4 | `event_authority_currentness_source_drift` on this branch's two owner documents, in each aggregate. The `Plans/storage-plan.md` row is already on `main`; the Section15 row is the one proved above. This is the expected staleness of editing canon before a reseal. |
| 4 | The truncated evidence and plan-graph totals 665 → 876 in both aggregates. The inherited 665 → 847 is classified in `LANDING_20260924_DL070_FOLLOWUPS.md` and `LANDING_20260924_POST_AUDIT_REPAIR.md`. This branch's 847 → 876 is fully proved above. |
| 1 | The currentness bucket 4 → 10: inherited 4 → 9, plus this branch's Section15 row. |
| 1 | The `storage_value_registry_spec_lock_hash_stale` bucket 1 → 2, entirely inherited from `main` (classified in `LANDING_20260924_STORAGE_REGISTRY_REPAIRS.md`). |

All other on-branch rows are staleness kinds the checker excuses: 2 `stale_hash`, 2 `artifact_hash_stale`, 24 `stale_batch_report_sha256_after`, and 5,408 `current_snapshot_*` rows of the stale 2026-09-06 migration snapshot. The checker marks 62 keys new against its older baseline (`75bcda93bc`). 55 of them are already in the full `main` capture; the other 7 are this branch's Section15 rows proved above. The baseline is not refreshed.

## Landing record and reseal request

- **Owner documents edited:** `Plans/storage-plan.md` (SP-266: the conditional v2 subsection, criterion A006, validation surfaces, dependency on SP-278 and ContractRef) and `Plans/Section15_MVP_Promoted_Features_Spec.md` (SMPFS-167: the v2 reader subsection, criterion A005 and validation surfaces).
- **New acceptance units:** `SP-266-A006` and `SMPFS-167-A005`. The PlanUnit count is unchanged at 6,718; acceptance units go from 26,210 to 26,212.
- **Reseal request** for the designated Plans agent covers both owner documents and their shard trees:
  - their Spec Lock hashes;
  - their evidence and plan-graph artifact hashes;
  - their Event Authority currentness bindings;
  - the atomize-planunits batch-report hashes;
  - the implementation readiness report;
  - the stale plan-migration snapshot.

  This landing changes no governance binding, Spec Lock, evidence bundle or baseline.
- **Follow-up:** the S-03 prose cites the coordinator's 2026-09-24 ruling on the nine-field durable token. When `plans/storage-owner-closeout-20260924` lands its Decision Log entry, that citation can be switched to it.

## Evidence custody

All digests are SHA-256. The raw captures are outside the repository, in `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/sp278-landing-20260924/`, whose `SHA256SUMS` lists 168 files and has digest `633e941eef1883f97815a4ef498284f776a17619412f0c760c0d01c4635e71d7`.

| Artifact | SHA-256 |
|---|---|
| `landing-b1347ec1f6/landing-check.stdout` (complete landing JSON) | `8be467750cb3ddc3c3dfb5dd9ac752e6fec50da9ded8c67bc7db5f9c012cf312` |
| `landing-b1347ec1f6/shard-check.stdout` | `a23246d8fa7c4eff08b5397dacfe298aa454b500ce3662df1efc56ad0bb930c2` |
| `full-delta.json` (every added and removed row, classified) | `7938db115bd37278ebac45fda8fead4565eea2236ec61e978eea579e69d34d00` |
| `main-afcbec3317/run-gates-full/full-report.json` | `98be0019f3ec93f837c622bc80657de44dee03b2665caf2b7e1b8eb511d9c216` |
| `main-afcbec3317/audit-governance-full/full-report.json` | `216f2c4ee199622b5a0f9976e88ac093778941cf545e01866d6d1b297d26b306` |
| `branch-b1347ec1f6/run-gates-full/full-report.json` | `e22050237280500338f27fb5b74823b4b27752fb3f389751725f563c689cc360` |
| `branch-b1347ec1f6/audit-governance-full/full-report.json` | `2b74f3d4e20fe12fb7c8b3bb1d21d145fc865affacdd0761d7e8b0f12d47b0b4` |
| `observe_full_aggregate.py` (the observer earlier landings used) | `796f3191d809c9f0eb487acbcf3b59d2bd54dd4dd0f50dea02894729a1996c0f` |
| `delta.py` | `2f3fe8cdcadcbe71d20300ed5da3712d2ae8c2f23e80b03c0f3bd26851521fc5` |

This record is report-only on top of the checked commit. The full check is not claimed to have run on the record's own commit hash, and no checked source, test, generated index, shard or governance input changes with it. Publication of `main`, worktree removal and lock release follow under the held lock.
