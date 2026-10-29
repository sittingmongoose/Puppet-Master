# Governance Reseal Plan — 2026-10-29

## Authority, base, and stop line

Jared assigned this reseal in chat on 2026-10-29 ("You can reseal") after PMConcept7 resize
pass 4 landed. The work is prepared by `muse-reseal-20261029` on local branch
`plans/governance-reseal-20261029` in this thread's existing full local T3 worktree. The frozen
base is `bb62e4032aecb3f32e4f2b25b40d18ed7d5b34be`. If `origin/main` moves before review, the
branch is rebased and every affected measurement is repeated; generated outputs are never
hand-merged.

This preparation ends with a pushed branch and Astra max review. It does not take the landing
lock, fast-forward or push `main`, write the shared checkout, install currentness there, record
a snapshot or baseline, delete the branch, or settle the thread. Those steps require explicit
GO and the normal landing agent.

## Scope and non-goals

No owner prose, product behavior, `Plans/plan_graph.json`, `Plans/sharding_config.json`, plan
graph, owner-doc registration, PNC-019 registry, schema, locked decision, Spec Lock schema
version, or shard body/path changes. No WorkNodes, NodeSeeds, NodeSeed candidates, executable
queues, final node manifests, product code, or production build tasks.

The only permitted tracked governance changes are:

1. existing hashes in `Plans/Spec_Lock.json`;
2. the live current plan-sharding evidence bundle and its two reports;
3. `Plans/.implementation_readiness/buildability_gate_report.json`;
4. `Plans/.plan_index/node_readiness_report.json`;
5. aggregate run 002's batch report and preseal final summary;
6. exactly one helper-appended row in `Plans/auto_decisions.jsonl`;
7. these six dated records.

## Custody

Raw command records, complete reports, comparisons, proofs, and generated currentness editions
are preserved outside the repository under
`/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261029/`. The 15-file currentness
edition bound by `reports/landing-checks/baseline.json` was reconstructed byte-for-byte from
the preceding reseal's reviewed custody and verified against every baseline hash. The eight
frozen currentness inputs remain byte-identical to that edition. Historical support inputs were
restored from the preceding reseal custody with all 3,529 files hash-verified.

Long-running commands use local scratch under `~/pm-scratch`; no scratch or raw report is
committed.

## PNC-019 / DL-188

The historical certification receipt is read-only in this task. Before refresh, its bytes hash
to `49ce40e2816b155a738b7f9278deb8b1de105ec3f8204cfa79e8291cad4b4f29`, and the two admission
pins still match it. The active denominator remains the 43-family `2026-10-09.1` checkpoint.
No pin changed, no certification harness ran, and no runtime, buildability, denominator,
contract-depth, or Event Authority closure claim is made. The final denominator remains
`UNKNOWN_OPEN`, with all authority flags false.

## Sequence run

1. Hash inventory of all 17,065 tracked regular files and the one tracked symlink at the frozen
   base; exact Spec Lock staleness was four entries before the retained buildability cycle.
2. Measure Spec Lock, evidence, plan graph, readiness, aggregate run 002, current snapshot,
   run-gates, and audit-governance with complete reports preserved externally.
3. Classify inherited findings with the landing-check normalization code: no raw-capture,
   audit-status, or other support-reference observations; 256 bundle `missing_ref` observations
   are the live shard inventory refresh in scope.
4. Generate currentness externally, install only its seven generated files locally, preserve
   the eight frozen inputs, and validate.
5. Generate and validate the PlanUnit index. Restore each index file whose only difference is
   a timestamp value; retain the semantic node-readiness report.
6. Generate the buildability report once and retain that first generation. A later read-only
   canonical probe differs only in the final node-readiness source hash.
7. Run run 002 `refresh-batch-hashes`, then `refresh-final-summary --seal-state preseal`, then
   validate it. Exactly the historical `doc_count_mismatch` and
   `inventory_doc_set_mismatch` remain.
8. Regenerate and check shards into the live bundle reports; stop conditions require zero
   changed shard bodies or paths. Rebuild the bundle artifact inventory with
   `sync-plan-sharding-evidence`, then refresh evidence hashes, successful command excerpts,
   plan-index details, shard checks, and the dated reseal check with `pm-governance-seal.py`.
9. Refresh Spec Lock with `pm-governance-seal.py refresh --spec-lock Plans/Spec_Lock.json`
   only. The diff is five `sha256` values and nothing else.
10. Because the evidence bundle is itself a currentness source, regenerate the final
    currentness edition after the evidence and Spec Lock refreshes, install its seven generated
    files locally, validate it, generate and validate the final index, restore timestamp-only
    index diffs, and rerun the read-only buildability probe.
11. Append exactly one decision, `dec-2026-10-29-governance-reseal`, through
    `pm-governance-seal.py:upsert_auto_decision`, then validate auto-decisions.
12. Repeat all eight checks, apply the same incomplete-output guard, compare normalized
    aggregate rows and complete standalone exports, inventory every tracked file again, and
    write the six records.
13. Commit explicit paths only, push the branch, run the baseline-bound landing comparison on
    the committed checked SHA with the baseline-bound old currentness edition selected locally,
    restore the prepared final edition, and stop for Astra max review and explicit GO.

## Expected results

- Spec Lock: `4 -> 0`.
- Evidence and plan graph: `109 -> 0` each.
- Readiness: `27 -> 23`, removing exactly the four currentness source-drift rows as a kind.
  One `pnc019_source_hash_stale` row's expected receipt hash necessarily changes with the new
  ignored validator receipt; its source path and error do not.
- Aggregate run 002: `36 -> 2`, removing all 34 stale batch after-hashes.
- Current snapshot: `0 -> 0`.
- Run-gates and audit-governance: `1,729 -> 1,469` each.
- Retained buildability report remains the one known non-canonical source-hash cycle, proven
  rather than chased.
- No new normalized printed aggregate row in either aggregate. Complete standalone exports
  reconcile Spec Lock, evidence, graph, readiness, and migration. PRD is keyed from its complete
  export by the landing check; audit closure has no complete export and remains total-compared,
  with its printed samples and total unchanged.

## Landing rules after GO

The landing agent takes the lock, rebases if main moved, regenerates rather than hand-merges
generated files, runs shard and landing checks in the required order, and never leaves local
`main` ahead unpublished. The prepared seven generated currentness files are installed in the
shared checkout only after the first checked push and while the lock is held. Because this
landing changes `Plans/` paths, the same lock then refreshes the current snapshot and baseline
in a full local worktree at the new main, in that order, as one follow-up commit.
