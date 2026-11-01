# Governance Reseal Record — 2026-11-01

## Status

Prepared, not landed. Jared assigned the reseal in chat on 2026-11-01 ("Do the needs me and the still open"), after the DL-270 landings reported governance staleness. The storage-review thread prepared branch `plans/governance-reseal-20261101` at frozen main `1e761d0448c5`, in the full local worktree `~/pm-worktrees/governance-reseal-20261101`.

This record covers the checked branch only. It claims none of the following:
- a landing;
- a write to the shared checkout;
- a snapshot or baseline refresh;
- runtime certification;
- Event Authority closure;
- completion of the denominator or of contract depth;
- PNC-019 execution.

## What moved

| History since the 2026-10-29 reseal (`6d9a072b48`) | What it changed |
|---|---|
| **DL-270 decision and plan sweep, `3cf9530e6a` to `808de86f4d`** | 50 plan documents plus command, GUI, wiring and DRY companions |
| **Refresh `683e603ac1`** | Snapshot and baseline after DL-270 |
| **Verifier `6b88cf36de`** | `scripts/pm-plans-verify.py` admits the evidence share at its macOS mount (another thread's change) |
| **DL-270 companions, `4451ee2d30` to `00f1d5f383`** | SP-346 and SP-347, the Case L receipt-custody rewrite, the SP-015 data roots, the storage registry `storage_profile`, and consumer alignments |
| **Refresh `1e761d0448`** | Snapshot and baseline after the companions |
| **This reseal** | The 9 governance files below and these 6 records |

Spec Lock still has 101 entries. Its diff is exactly 29 `sha256` values and nothing else:
- the 28 entries that were stale at the frozen base, which are 25 owner documents, `Plans/storage_value_registry.json` with its schema, and `scripts/pm-plans-verify.py`;
- plus the retained buildability report.

No schema version, locked decision, registration, plan graph, sharding configuration or owner prose changed.

The checked branch changes these nine governance files and adds the six records:

1. `Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json`
2. `Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/shard-check-report.json`
3. `Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/shard_report.json`
4. `Plans/.implementation_readiness/buildability_gate_report.json`
5. `Plans/.plan_index/node_readiness_report.json`
6. `Plans/.plan_migration/pds-20260611-002-atomize-planunits/batch_report.jsonl`
7. `Plans/.plan_migration/pds-20260611-002-atomize-planunits/final_validation_summary.json`
8. `Plans/Spec_Lock.json`
9. `Plans/auto_decisions.jsonl` (one appended decision)

Before and after inventories cover all 17,120 tracked regular files plus the tracked symlink. Before the records were added, they differ in exactly those nine paths.

## Exact check movement

| Check | Before | After |
|---|---:|---:|
| **Spec Lock** | 28 | 0 |
| **Evidence** | 2,400 | 0 |
| **Plan graph** | 2,400 | 0 |
| **Readiness** | 80 | 23 |
| **Aggregate run 002** | 162 | 2 |
| **Current snapshot** | 0 | 0 |
| **Run-gates** | 6,514 | 1,469 |
| **Audit-governance** | 6,514 | 1,469 |

The 2,400 evidence and plan-graph rows were 2,398 `artifact_hash_stale` and 2 `missing_ref`, on shard paths that the companion regeneration renamed. The artifact inventory sync clears both.

The readiness residual is the same shape as after the 2026-10-29 reseal:
- 16 `pnc019_source_hash_stale`;
- two `event_denominator_unresolved`;
- two `event_family_contract_depth_unresolved`;
- one `event_legacy_fixture_root_mismatch`;
- one self-test row;
- one `buildability_gate_report_stale_or_not_canonical`, which is the known one-step cycle.

All 55 `event_authority_currentness_source_drift` rows are gone. Run 002 keeps only `doc_count_mismatch` and `inventory_doc_set_mismatch`.

The aggregates keep audit closure 201, PRD planning runtime contracts 1,240 and PM7 GUI fixtures 3, plus those readiness and run-002 rows. That is unchanged from 2026-10-29.

The normalized comparison finds no new failure in either aggregate. Run-gates shows four printed readiness rows it did not print before: the denominator, contract-depth, legacy fixture-root and self-test rows. All four are in the complete before export. They appear only because run-gates printed 10 of 80 readiness rows before and prints all 23 after.

## Refresh results

- **Shards:** 99 sources and 2,972 shards generated and checked, with zero failures. No shard body or path changed; only the two live reports changed.
- **Evidence:** the live artifact inventory is rebuilt to 3,272 artifacts, with 2 removed and 20 added shard paths. Evidence and plan graph both pass complete validation.
- **Index:** generation and validation pass at 7,217 PlanUnits and 28,817 acceptance units. Three index files whose only differences were timestamp fields were restored byte for byte; only `node_readiness_report.json` remains changed.
- **Buildability:** the first generation is kept, SHA-256 `895c81e74f98807ec72c5e995109304f2f661c380a210fe6a0c015c8b1839559`. A canonical probe after the final index differs only at `source_hashes/Plans/.plan_index/node_readiness_report.json`. That one-step cycle is known, so it is kept rather than chased.
- **Run 002:** 159 of 212 batch rows changed, only in their after-hashes. The final summary is refreshed in preseal state.
- **Decisions:** 221 rows became 222. The only new id is `dec-2026-11-01-governance-reseal`, appended through `upsert_auto_decision`, and `validate-auto-decisions` passes.

## Currentness and PNC-019

The starting 15-file ignored edition exactly matched the landing baseline. Two external editions were generated:
- `currentness-1`, superseded;
- `currentness-final`, which was generated after the evidence bundle, itself a registered currentness source, reached final bytes. It still validates against the finished tree.

Only its seven generated files were installed locally. The eight frozen files still match the baseline exactly. Final currentness validates with `evidence_valid=true` and `event_authority_closed=false`.

The denominator remains `UNKNOWN_OPEN`:
- complete denominator known: false;
- contract depth complete: false;
- build and PNC authority: false;
- 43 registered families;
- the 252-row quarantine unchanged.

Final validator receipt SHA-256: `4745247092bae7ecb84843f80c461d45b709856de3142a87b8ffbe151d46e8f3`. Final 15-file manifest SHA-256: `39d73676503166affd7673e9105fe6cc1ca2b247b7ccaa2d821eaac0f90656ca`.

DL-188 was verify-only. The PNC-019 certification receipt is byte-identical before and after, SHA-256 `49ce40e2816b155a738b7f9278deb8b1de105ec3f8204cfa79e8291cad4b4f29`. Both admission pins match, the checkpoint module is unchanged, and no harness ran.

## Landing instructions

1. Take `/mnt/Cursor/PuppetMaster-Evidence/scratch/landing-lock/held` and fetch. If main moved, rebase and regenerate affected outputs; never hand-merge generated governance files.
2. Run the shard check in the branch worktree. In the shared checkout, stop if uncommitted work overlaps the 15 checked paths. Otherwise fast-forward, run the shard check, then run the landing check before pushing main.
3. Push main to both remotes and verify both tips. Governance staleness that this reseal itself creates is not a reason for another reseal.
4. Still holding the lock, install only the seven generated files from `reviewed-currentness/` into the shared checkout's ignored currentness directory. Keep all eight frozen baseline files, and validate shared currentness.
5. In a full local worktree at the new main, run `snapshot-current` first and `pm-landing-check.py --record-baseline` second. Commit them together as one follow-up, then fast-forward and push main. Remove that worktree, delete the preparation branch, and release the lock.
6. Never record the baseline before the snapshot, never refresh it to excuse the landing just measured, and never install shared currentness before the first checked main push.

## Evidence index

All raw captures are outside the repository, at `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261101/`:

- `before/` and `after/`: complete captures of the eight checks for each stage, with command records and summaries;
- `apply/`: every refresh command, with its streams and exit;
- `proof/`:
  - inventories;
  - the currentness binding and installs;
  - checkpoint pin proofs;
  - the buildability first generation and probe;
  - timestamp restores;
  - the shard stop condition;
- `comparison/`: the normalized comparison and the landing comparison;
- `backup/currentness-baseline-15/`, `currentness-1/`, `currentness-final/` and `reviewed-currentness/`;
- `reseal.py` and `compile_records.py`: the exact helper code.
