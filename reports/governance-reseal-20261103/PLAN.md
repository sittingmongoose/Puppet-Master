# Governance Reseal Plan — 2026-11-03

## Authority, base, and stop line

On 2026-11-03 the PM7 small landing (`07dbf43786..d45dfcdba5`, then snapshot and baseline `3cafa5a8d0`) reported governance staleness as a reseal request. Jared assigned the reseal in chat the same day. Asked who should do it, he answered: "whoever you want. Opus 5.5 xhigh is fine".

The `claude-projects-refresh` thread was about to land a large Plans pass. A reseal before that landing would go stale when it landed. By mail they agreed to land first and hand the governance staleness to this reseal instead of to Jared. They landed `8895b233be`, then snapshot and baseline `4dbe63c96c`, on 2026-11-04 UTC. A `pm-mail` broadcast then asked every thread to mail `pm7-reseal` before landing Plans or scripts changes.

The frozen base is `4dbe63c96c46`. The work runs on branch `plans/governance-reseal-20261103` in the full (not sparse) local T3 worktree `~/.t3/worktrees/PuppetMaster/t3-43d1d239`. If `origin/main` moves before landing, the branch is rebased and every affected measurement is repeated. Generated outputs are never hand-merged. If the base moves twice, the reseal stops and reports instead.

## Scope and non-goals

The reseal changes none of the following:
- owner prose;
- product behavior;
- `Plans/plan_graph.json`, `Plans/sharding_config.json` or the plan graph;
- owner-doc registrations;
- the PNC-019 registry, `Plans/event_family_registry.json` or `scripts/pm_pnc019_currentness.py`;
- any schema or locked decision;
- the Spec Lock schema version;
- any shard body or path.

It creates no WorkNodes, NodeSeeds, NodeSeed candidates, executable queues, final node manifests, product code or production build tasks.

The only tracked governance changes it permits:

1. existing hashes in `Plans/Spec_Lock.json`;
2. the live plan-sharding evidence bundle and its two reports;
3. `Plans/.implementation_readiness/buildability_gate_report.json`;
4. `Plans/.plan_index/node_readiness_report.json`;
5. aggregate run 002's batch report and preseal final summary;
6. one source hash in `Plans/.implementation_readiness/pnc019_certification_receipt.json`, under DL-300 (below);
7. exactly one helper-appended row in `Plans/auto_decisions.jsonl`;
8. these six dated records.

## DL-300 receipt pin

`Plans/Decision_Log.md#DL-300` (Jared, 2026-11-04, "Admit them now") moves the Event Authority checkpoint to registry `2026-11-04.1` with 46 families, SHA-256 `443ae71d7e6326c3673a409f63950b9f33713c67f43c256fed6efa1c0d03a653`. It says: "The checkpoint evidence and the readiness receipt are refreshed by the next reseal." This is that reseal. It follows the bounded DL-188 refresh done by the 2026-10-11 reseal:

- **Checkpoint evidence:** the regenerated currentness edition's `EVENT_FAMILY_DENOMINATOR_STATUS.json` pins `2026-11-04.1`, 46 families and that SHA-256.
- **Readiness receipt:** only `source_hashes["Plans/event_family_registry.json"]` moves, from `4ffde4e8…` to `443ae71d…`. The workspace-layout v2 payload pin already matched and is unchanged. Every other receipt field and source hash is unchanged. The candidate passes schema validation, and the certification harness does not run.

The other receipt source hashes are historical certification dependencies. Refreshing them would claim a recertification that did not happen, so they stay stale and are reported as residuals.

## Custody

Raw command records, complete reports, comparisons, proofs and currentness editions are kept outside the repository under `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261103/`. The driver `reseal.py`, the record compiler `compile_records.py` and `install_shared_currentness.py` are kept there too. They are adapted from the 2026-11-01 helpers. The receipt step is adapted from `governance-reseal-20261019/revisions/opus-r1/refresh-dl188-checkpoint-pins.py`.

The 15-file currentness edition bound by `reports/landing-checks/baseline.json` was copied from the shared checkout, and all 15 hashes match the baseline. Long-running commands use local scratch under `~/pm-scratch`. No scratch or raw report is committed.

## Sequence run

1. Set up the worktree:
   - the evidence symlink;
   - the ten ignored `Plans/.audits` inputs;
   - the baseline-bound currentness edition, verified against the baseline.
2. Measure the eight checks at the frozen base, with complete reports kept externally: Spec Lock, evidence, plan graph, readiness, aggregate run 002, current snapshot, run-gates and audit-governance. Inventory all tracked files: 17,498 regular files and one symlink. 39 of the 101 Spec Lock entries were stale.
3. Back up the receipt, dry-run the DL-300 pin refresh, then apply it.
4. Generate currentness edition 1 externally. Install only its seven generated files locally, keep the eight frozen inputs, and validate.
5. Generate and validate the PlanUnit index. Restore each index file whose only differences are timestamps, and keep the node-readiness report.
6. Generate the buildability report once and keep that first generation.
7. Run `refresh-batch-hashes` on run 002, then `refresh-final-summary --seal-state preseal`, then validate.
8. Regenerate and check shards into the live bundle reports. The stop condition is zero changed shard bodies or paths, and it held.
9. Sync the bundle's artifact inventory with `sync-plan-sharding-evidence`, then refresh the evidence bundle with `pm-governance-seal.py`.
10. Refresh the Spec Lock with `pm-governance-seal.py refresh --spec-lock Plans/Spec_Lock.json` only.
11. Generate the final currentness edition after the receipt, the evidence bundle and the Spec Lock reached their final bytes. Install and validate it, then generate and validate the final index.
12. Probe the buildability report once more. Besides its timestamp, the probe differs only in the node-readiness source hash, so the first generation is restored.
13. Append exactly one decision, `dec-2026-11-03-governance-reseal`, through `upsert_auto_decision`, and validate.
14. Repeat the eight checks. Validate currentness against the finished tree. Inventory every tracked file again, compile the comparison and the JSON records, and write these records.
15. Commit explicit paths only and push the branch. Run the baseline-bound landing comparison on the committed SHA, then land.

## Results

| Check | Before | After |
|---|---:|---:|
| Spec Lock | 39 | 0 |
| Evidence | 2,693 | 0 |
| Plan graph | 2,693 | 0 |
| Readiness | 146 | 24 |
| Aggregate run 002 | 175 | 2 |
| Current snapshot | 0 | 0 |
| Run-gates | 5,950 | 230 |
| Audit-governance | 5,950 | 230 |

The residuals are in `reseal-record.md`.

## Landing rules

The landing agent (this reseal) holds the landing lock throughout:
1. Rebase if `main` moved, and regenerate rather than hand-merge generated files.
2. Run the shard check, then the landing check, in the required order.
3. Never leave local `main` ahead unpublished.
4. After the first checked push, while the lock is held, install the prepared seven generated currentness files into the shared checkout. Do not install them before that push.
5. This landing changes `Plans/` paths. So the same lock then refreshes the current snapshot and baseline, in that order, as one follow-up commit in a full local worktree at the new `main`.
