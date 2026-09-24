# Post-audit contract repair landing, 2026-09-24

## Authority and tested revisions

The user authorized source-hash staleness for `Plans/Commands_System.md`, `Plans/UI_Command_Catalog.md`, `Plans/touch_closure.json`, and their derived files, conditional on a complete aggregate failure-key comparison. On September 24 the user additionally authorized the exact `stale_hash` for `scripts/pm-plans-verify.py`: expected `d10c009eceea4fcc66de4e55e9db3fabe1226425c3713e66e70a7f0bb55c1ca0`, actual `e678cdf975dc77beceed5b9a85ad0e10de85fc2f53782516847afceb96281c39`. No governance binding or baseline refresh is authorized or performed.

- Base main: `566970cb7b7a0448c14959e16a93b8aae4fec2e2`.
- Tested repair: `33edfd71fa47c7d1d9c6f8b5936985ca19c5565d`.
- Branch: `fix/post-audit-contract-repair-20260924-land4`.
- Worktree: `/home/sittingmongoose/pm-worktrees/post-audit-contract-repair-20260921`.
- Landing lock acquired with atomic `mkdir /mnt/Cursor/PuppetMaster-Evidence/scratch/landing-lock/held` at `2026-09-24T02:06:39Z`; agent, branch and UTC acquisition time recorded in `held/holder.txt`. The landing fetch occurred while holding this lock.

The September 23 blocked record remains historical. The five missing local historical FINAL_REPORT inputs were copied byte-for-byte from shared main, each checked against its previously captured SHA-256. The unchanged audit-status index now validates: 71 reports, no failures. No audit report or governance index was regenerated.

## Full failure-key proof

Both aggregate commands were run on main and the repair, saving every unchanged subcheck return before the CLI's sample limits. The normal report's count and status were checked against each complete failure array. Counter differences use the landing check's own normalization and preserve duplicate multiplicity. Every added and removed raw row and normalized key is retained in the evidence below. Both capture runs have no capture errors; HEAD, base and pinned inputs stayed stable across all five snapshots. Shared dirty-tracked hashes were also stable.

| Aggregate | Main | Repair | Added | Removed | Outside exception |
|---|---:|---:|---:|---:|---:|
| run-gates | 3,029 | 3,217 | 189 | 1 | 0 |
| audit-governance | 3,029 | 3,217 | 189 | 1 | 0 |

Added rows in each aggregate:

| Kind | Count | Exact attribution |
|---|---:|---|
| `artifact_hash_stale` | 176 | 88 evidence and 88 plan-graph entries for Commands_System, UI_Command_Catalog and their shards |
| `stale_batch_report_sha256_after` | 7 | Commands_System (3), UI_Command_Catalog (4) |
| `event_authority_currentness_source_drift` | 3 | Commands_System, UI_Command_Catalog, touch_closure.json |
| `stale_hash` | 3 | Commands_System, UI_Command_Catalog, and the exact authorized verifier-script hash |

Evidence and plan-graph subchecks each rise **759 → 847**. Migration subcheck rises **24 → 31**. Spec Lock rises **7 → 10**. The single removed error is `central extraction typed UI actions lack rows: ['ui.project.restore_archived']`; Touch now passes. Audit-status passes on both sides; there is no remaining added environmental row.

Readiness is **35 → 38** in both aggregates. The complete added readiness keys are exactly:

- `event_authority_currentness_source_drift`, `source_path=Plans/Commands_System.md`.
- `event_authority_currentness_source_drift`, `source_path=Plans/UI_Command_Catalog.md`.
- `event_authority_currentness_source_drift`, `source_path=Plans/touch_closure.json`.

There are no removed readiness keys. The rise is entirely within the user's exception. The older recorded baseline still has readiness 79; this proof compares against current main, not that obsolete total.

## Rebase and focused verification

The intervening storage-registry landing re-froze Browser's current upstream39 manifest hash. The repair preserves that exact new pin separately from the original historical39/40 fingerprints and six reviewed whole-row Goal successors. The upstream current40 fixture assertion is retained alongside the repair's lineage checks. A new test rejects substitution of the historical manifest hash while preserving historical row proof. No registry, admission manifest, schema binding or governance artifact was refreshed by this repair.

The focused capture at `bd4c5ee3ef9a7a9711165379796c977e86e8831a` passes all 111 tests: authentication 4, Touch 50, Browser 38, primary catalog 19. Browser CLI, audit-status validation, plan-index validation and shard check also pass. The subsequent rebase changes none of those authored repair files or tests. Shards/index were regenerated, never hand-merged. Only the Commands_System and UI_Command_Catalog shard directories differ from final main. Final rebased checks pass: 99 documents, 2,720 shards, 6,718 PlanUnits and 26,210 acceptance units.

Shared checkout preflight: 112 branch paths, 43 unrelated modified tracked files, eight untracked files, zero overlap. Other tasks' edits are preserved. This record adds one report path to the landing diff.

## Evidence custody

All digests are SHA-256. Raw captures remain outside the repository.

- Main full capture: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/post-audit-full-main-20260924-566970cb/summary.json` — `d5c650b075cc045aec52fe933e2467aaffad5a2e224b12dbc4448c6de31fdd4e`.
- Repair full capture: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/post-audit-full-branch-20260924-33edfd71/summary.json` — `2b531848e9d55f9c2988aa8c0df740b3105765ed03e30a0ea7d304609eca0f8f`.
- Full comparison summary: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/post-audit-full-delta-20260924-33edfd71/summary.json` — `39b94684a6de570bf8fa2caa02456807aa0d8d7592ccdc8fca0c7699c6017da1`.
- Every run-gates delta row: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/post-audit-full-delta-20260924-33edfd71/run-gates-delta.json` — `35fac2996581b2300e9039f0936b4ca5ad7f6faf7daab8455b597aa9fc874bf3`.
- Every audit-governance delta row: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/post-audit-full-delta-20260924-33edfd71/audit-governance-delta.json` — `4f5b602943c877a378fdde8333d593f82e021daa51ef3a440a3c50eeaadf43f1`.
- Focused capture: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/post-audit-focused-20260924-bd4c5ee3/summary.json` — `9b7600c2f62c8289ca39a3606df0a386021fb88bdf1de5efc7e2ad84635d4a1d`.

## Shared landing result

Shared main was fast-forwarded from `566970cb7b` to `ca57806bfe10798699058c45b733ec3543c57a17` after rechecking the lock, base and zero-overlap condition. The shard check passed (99 documents, 2,720 shards). The normal landing check ran before any main push, with exit **2**, in 892.7 seconds. Its aggregate totals are both **3,217**, readiness is **38** in both, and standalone migration validation reports **33,072** failures versus the recorded baseline's 32,967. Snapshot/hash staleness is excused by the checker; no non-staleness migration blocker is reported.

All **12** checker-reported blocking items are classified:

| Items | Classification |
|---:|---|
| 6 | The three authorized `event_authority_currentness_source_drift` rows in each aggregate. |
| 4 | Truncated evidence/plan-graph totals 665 → 847. The inherited 665 → 759 was authorized and proved in `LANDING_20260924_DL070_FOLLOWUPS.md`; this repair's 759 → 847 is fully proved above. |
| 1 | Currentness bucket 4 → 9: inherited 4 → 6 from DL-070, plus this repair's authorized 6 → 9. |
| 1 | `storage_value_registry_spec_lock_hash_stale` bucket 1 → 2, entirely inherited from current main and classified in `LANDING_20260924_STORAGE_REGISTRY_REPAIRS.md`. This repair does not change `scripts/pm-implementation-readiness.py`. |

Every shared aggregate subcheck total equals the complete repair capture. Every non-staleness key marked new against the old baseline is either present in the full current-main capture or explicitly authorized by this repair's exception. The six non-excused on-branch keys are exactly the authorized source-drift rows. The additional verifier-script hash remains the exact authorized value and is ordinarily classified as staleness by the checker. No added unapproved row is hidden by the exception.

Capture guards report no error: HEAD, base, pinned source/lock hashes and all 43 pre-existing dirty-tracked hashes stayed stable. The checker is not represented as passing; landing proceeds under the explicit exception and the prior landings' recorded inherited classifications.

- Locked shared capture: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/post-audit-locked-landing-20260924-ca57806b/summary.json` — `c5c07677f548446dcefa6b803ceb9307835b04e8286614698b38b4567ea2ef0e`.
- Complete landing JSON: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/post-audit-locked-landing-20260924-ca57806b/landing-check.stdout` — `bb1fea837ad02fdba4d002edc5508c8834af069e787f2f21cc5c8960f3e92010`.
- Shared shard result: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/post-audit-locked-landing-20260924-ca57806b/shard-check.stdout` — `a23246d8fa7c4eff08b5397dacfe298aa454b500ce3662df1efc56ad0bb930c2`.
- Exact exception classification: `/mnt/Cursor/PuppetMaster-Evidence/packet-audits/post-audit-locked-landing-20260924-ca57806b/exception-classification.json` — `98cd24cd14fc8003cab3a29cf91be9529504f7c86d33f8083486a024d5f08c1e`.

This final annotation is report-only on top of the checked commit. The full check is not claimed to have run on the annotation's commit hash; no checked source, test, generated index, shard or governance input changes with it. Main publication, worktree removal and lock release follow this annotation under the held lock.

## Reseal request and retained boundaries

The designated governance owner should reseal the two owner documents and their derived evidence/shards, the currentness bindings for those documents and `Plans/touch_closure.json`, the exact verifier-script Spec Lock hash, and the stale migration snapshot in the authorized governance workflow. This task changes no governance binding, Spec Lock, evidence bundle or baseline.

The formal R5 audit has complete retained coverage of 13,416 cases and remains **implementation FAIL**. The 643 Touch runtime residuals, 51 Browser prepared-but-not-admitted families, native/provider/security/durability/visual proof and readiness admission remain unproved. Deferred visual work and other agents' files are not part of this landing.
