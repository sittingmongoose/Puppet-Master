# Governance Reseal Plan — 2026-11-01

## Authority, base, and stop line

On 2026-11-01 the storage-review thread reported that the DL-270 landing left governance staleness and needed a reseal. Jared then assigned the reseal in chat: "Do the needs me and the still open". The work is prepared on local branch `plans/governance-reseal-20261101` in the full local worktree `~/pm-worktrees/governance-reseal-20261101`.

The frozen base is `1e761d0448c5`. That is `main` after the DL-270 decision (`808de86f4d`), its companions (`00f1d5f383`) and the snapshot and baseline refresh that followed them. If `origin/main` moves before landing, the branch is rebased and every affected measurement is repeated. Generated outputs are never hand-merged.

Preparation ends with a pushed branch, a baseline-bound landing comparison and an Astra max review. Landing follows only after that review raises no blocking finding, under the normal landing rules below.

## Scope and non-goals

The reseal changes none of the following:
- owner prose;
- product behavior;
- `Plans/plan_graph.json`, `Plans/sharding_config.json` or the plan graph;
- owner-doc registrations;
- the PNC-019 registry;
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
6. exactly one helper-appended row in `Plans/auto_decisions.jsonl`;
7. these six dated records.

## Custody

Raw command records, complete reports, comparisons, proofs and currentness editions are kept outside the repository under `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261101/`. The driver `reseal.py` and the record compiler `compile_records.py` are kept there too; they are adapted from the 2026-10-29 helpers.

The 15-file currentness edition bound by `reports/landing-checks/baseline.json` was copied from the shared checkout. All 15 hashes match the baseline. Long-running commands use local scratch under `~/pm-scratch`. No scratch or raw report is committed.

## PNC-019 / DL-188

The historical certification receipt is read-only here. Its bytes hash to `49ce40e2816b155a738b7f9278deb8b1de105ec3f8204cfa79e8291cad4b4f29` before and after. The two admission pins still match it:
- `Plans/event_family_registry.json`;
- `Plans/event_payloads/workspace_layout_changed_v2.schema.json`.

The checkpoint module is unchanged at `7542cdac…`. The active denominator remains the 43-family `2026-10-09.1` checkpoint. No pin changed and no certification harness ran. No runtime, buildability, denominator, contract-depth or Event Authority closure claim is made. The denominator remains `UNKNOWN_OPEN`.

## Sequence run

1. Set up the worktree:
   - the evidence symlink;
   - the ten ignored `Plans/.audits` inputs;
   - the baseline-bound currentness edition, verified against the baseline.
2. Inventory all tracked files at the frozen base: 17,120 regular files and one symlink. 28 of the 101 Spec Lock entries were stale.
3. Measure the eight checks with complete reports kept externally: Spec Lock, evidence, plan graph, readiness, aggregate run 002, current snapshot, run-gates and audit-governance.
4. Generate currentness edition 1 externally. Install only its seven generated files locally, keep the eight frozen inputs, and validate.
5. Generate and validate the PlanUnit index. Restore each index file whose only differences are timestamps, and keep the node-readiness report.
6. Generate the buildability report once and keep that first generation.
7. Run `refresh-batch-hashes` on run 002, then `refresh-final-summary --seal-state preseal`, then validate.
8. Regenerate and check shards into the live bundle reports. The stop condition is zero changed shard bodies or paths, and it held.
9. Sync the bundle's artifact inventory with `sync-plan-sharding-evidence`. Then refresh the evidence hashes, command excerpts, plan-index details, shard checks and the dated reseal check with `pm-governance-seal.py`.
10. Refresh the Spec Lock with `pm-governance-seal.py refresh --spec-lock Plans/Spec_Lock.json` only.
11. Generate the final currentness edition after the evidence bundle, itself a currentness source, reached final bytes. Install and validate it, then generate and validate the final index.
12. Probe the buildability report once more. The probe differs only in the node-readiness source hash, so the first generation is restored.
13. Append exactly one decision, `dec-2026-11-01-governance-reseal`, through `upsert_auto_decision`, and validate.
14. Repeat the eight checks. Inventory every tracked file again, compile the comparison and the JSON records, and write these records.
15. Commit explicit paths only and push the branch. Run the baseline-bound landing comparison on the committed SHA, then hand the branch to Astra max review.

## Results

| Check | Before | After |
|---|---:|---:|
| Spec Lock | 28 | 0 |
| Evidence | 2,400 | 0 |
| Plan graph | 2,400 | 0 |
| Readiness | 80 | 23 |
| Aggregate run 002 | 162 | 2 |
| Current snapshot | 0 | 0 |
| Run-gates | 6,514 | 1,469 |
| Audit-governance | 6,514 | 1,469 |

The residuals have the same shape as after the 2026-10-29 reseal:
- **Readiness:**
  - 16 `pnc019_source_hash_stale`;
  - 2 denominator and 2 contract-depth;
  - 1 buildability-report cycle row;
  - 1 legacy fixture root and 1 self-test.
- **Run 002:** only `doc_count_mismatch` and `inventory_doc_set_mismatch`.
- **Aggregates:** audit closure 201, PRD planning runtime contracts 1,240, PM7 GUI fixtures 3, plus those readiness and run-002 rows.

## Landing rules

Landing is done by the landing agent, holding the landing lock:
1. Rebase if `main` moved, and regenerate rather than hand-merge generated files.
2. Run the shard check, then the landing check, in the required order.
3. Never leave local `main` ahead unpublished.
4. After the first checked push, while the lock is held, install the prepared seven generated currentness files into the shared checkout. Do not install them before that push.
5. This landing changes `Plans/` paths. So the same lock then refreshes the current snapshot and baseline, in that order, as one follow-up commit in a full local worktree at the new `main`.
