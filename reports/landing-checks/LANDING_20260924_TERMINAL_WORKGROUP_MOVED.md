# Landing record: terminal.workgroup_moved owner contract, 2026-09-24

Branch `plans/terminal-workgroup-depth-20260923`. It was rebased onto `main` `54ac20a1bc` and checked at tip `e44b9186fb`. `main` was fast-forwarded from `54ac20a1bc` to `e44b9186fb` and pushed after the landing check. This record is a report-only commit on top, landed the same way. The branch report is `reports/event-authority-20260911/step-08-terminal-workgroup-draft-repair-20260924.md`.

**What lands.**

- **Owner documents.**
  - `Plans/Section15_MVP_Promoted_Features_Spec.md` adds SMPFS-170.
  - `Plans/storage-plan.md` adds SP-319. The SP-266 v2 subsection now cites DL-076 for the nine-field token.
  - `Plans/Decision_Log.md` changes one line of DL-070's PlanUnit: `source_reseeded` is retired as of 2026-09-24, citing FinalGUISpec's DL-070 follow-up amendment (`566970cb7b`).
  - One further file: `Plans/browser_workspace_created_checkpoint_v2.schema.json` has one description citation switched to DL-076.
- **New PlanUnits:** SMPFS-170 and SP-319, both under DL-045 for the registered family `terminal.workgroup_moved`. The index goes from 6,719 to 6,721 PlanUnits and from 26,216 to 26,233 acceptance units. SP-319 depends on SMPFS-170, not the reverse. There are 0 cycles and `build_order_available` is true.
- **Renumbering.** The inherited draft named its storage unit SP-314, but main's SP-314 is a different accepted unit ("Original Standard authority families and fresh whole stored profiles"). The unit lands as SP-319. Its `source_lineage` and `stale_retired_dispositions` record the renumbering and cite the landed draft commit `a475070763`, rebased from `254505ccf9`.
- **Derived files:** the three documents' shards and `Plans/.plan_index`, regenerated at every commit.

**Authority.** Jared authorized the repair through the coordinator. A blind review returned fix_then_land with 10 findings, none blocking, and all were applied as its REVIEW.md states. The coordinator then asked for the DL-070 line and gave the landing go on 2026-09-24.

**Landing lock.** Acquired at 2026-09-24T16:56:17Z, after the TestOpus5.5 M2 landing released it, which had held it from 16:26:50Z. It was held through the rebase, the fast-forward, the shard check, the landing check, both pushes of `main` and the worktree removal.

## Procedure

1. **Rebase onto `54ac20a1bc`.**
   - `main` had moved by Concepts-only commits and one landing record, with no Plans, scripts or tests change. The rebase had no conflicts.
   - Every authored and derived file is byte-identical to before the rebase, and regenerating changed only timestamps.
   - No cited passage changed, so nothing needed re-adjudication.
   - Because the rebase rewrote every hash, commit `e44b9186fb` points SP-319's renumbering note at the landed draft commit `a475070763`; `93bbc67c85` was no longer reachable. This keeps review finding T-10 satisfied.
2. **Checks in the worktree** at `e44b9186fb`:
   - shard check: pass, 99 documents, 2,722 shards;
   - index validation: pass, 6,721 PlanUnits, 26,233 acceptance units, 0 cycles, build order available;
   - ten test modules, 311 tests, all OK;
   - lint-contractrefs: the one failure `main` also has.
3. **Full-list deltas against `main` `54ac20a1bc`.** Each standalone subcheck was run with its full failure list on a detached sparse checkout of `54ac20a1bc` and on the branch. The lists were diffed by the landing check's own `normalize` keys.

   | Subcheck | `main` | Branch | Added | Removed |
   |---|---:|---:|---:|---:|
   | `validate-evidence` | 876 | 876 | 0 | 0 |
   | `validate-plan-graph` | 876 | 876 | 0 | 0 |
   | `verify-spec-lock` | 10 | 10 | 0 | 0 |
   | `validate-prd-planning-runtime-contracts` | 1,240 | 1,240 | 0 | 0 |
   | `validate-implementation-readiness` | 30 | 30 | 0 | 0 |

4. **Overlap check in the shared checkout.** It had 43 uncommitted entries. A path-limited `git status` over the branch's documents, shard directories, `Plans/.plan_index`, the report and `reports/landing-checks` found none of them.
5. **Fast-forward and shard check.** `main` went from `54ac20a1bc` to `e44b9186fb`. The shared shard check passed: 99 documents, 2,722 shards.
6. **Landing check.** `python3 scripts/pm-landing-check.py --base origin/main --json` exits **2** with **12 blocking items**, all classified below.
   - Totals: `run-gates` 3,280, `audit-governance` 3,280, `plan-migration-validate` 33,072. The baseline `75bcda93bc` has 2,875, 2,875 and 32,967; the Storage owner closeout landing had 3,279, 3,279 and 33,072.
   - New rows: 64. Sixty-two of them are the same keys that landing listed. The other 2 are new `subprocess_timeout` rows, described below.
7. **Push.** At 17:32:52Z, `main` `e44b9186fb` was pushed to `origin` (GitHub and the NAS) and to `truenas-backup`, which was already up to date through `origin`'s NAS push URL. This record then followed as a report-only fast-forward under the same lock.

## Classification of the 12 blocking items

| Rows | What | Classification |
|---:|---|---|
| 6 | `event_authority_currentness_source_drift` for `Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/storage-plan.md` and `Plans/Decision_Log.md`, 3 rows in each aggregate | **Governance staleness on the edited documents; reseal request.** All three fingerprints (`d1cb22ec6bb2`, `87144dca10ac`, `97e212c23116`) were already present at the Storage owner closeout landing. The branch keeps them drifting and adds no drift row. |
| 2 | Grown buckets. `audit-governance/implementation_readiness/event_authority_currentness_source_drift` is 10 against a baseline of 4. `storage_value_registry_spec_lock_hash_stale` on `Plans/Spec_Lock.json` is 2 against a baseline of 1. | **Earlier classification; name no branch file.** Both counts are the same as at the Storage owner closeout landing, which classified them as `main`'s own growth since the baseline. The branch does not touch `Plans/storage_value_registry.json`. |
| 4 | Truncated-subcheck rises of `evidence`/`validate_evidence` and `plan_graph`/`validate_plan_graph`, from 665 to 876 in both aggregates | **`main`'s own state since the baseline; the branch adds 0.** The full-list deltas above show 876 on `main` and on the branch, with 0 added and 0 removed. The previous landing recorded the same 876. |

No blocking item outside these classes names a file of this branch. Every other on-branch row is a staleness kind on the three owner documents and nothing else: 5,770 rows in total.
- 4,775 are `current_snapshot_live_span_metadata_mismatch`.
- 645 are `current_snapshot_span_sha256_mismatch`.
- 297 are `current_snapshot_coverage_not_exact_same_document_planunit_set`.
- 27 are `stale_batch_report_sha256_after`.
- 22 are other `current_snapshot_*` live and batch mismatches.
- 2 are Spec Lock `stale_hash` rows for `Plans/storage-plan.md`, one in each aggregate.
- 2 are `artifact_hash_stale` rows in the evidence and plan-graph samples.

No row names the schema file, the report or any shard directly.

**New but naming no branch file.** One `subprocess_timeout` of `lint-contractrefs` at 180 seconds in `run-gates`, and one in `audit-governance/support_refs`. They explain the two further grown subcheck totals, 0 to 1 each, and the one-row rise of each aggregate's total over the previous landing. They come from how long the shared checkout takes to read the network mount, not from a finding. Run on its own with no limit in the shared checkout at `e44b9186fb`, `lint-contractrefs` finished in 199 seconds with status `pass` and 0 failures. Reported to Jared under the rule for new failures that name no branch file.

## Reseal request

- **Spec Lock** for `Plans/storage-plan.md`, which is already stale on `main`.
- **A currentness edition** for `Plans/Section15_MVP_Promoted_Features_Spec.md`, `Plans/storage-plan.md` and `Plans/Decision_Log.md`.
- **The evidence and plan-graph entries** for those three documents and their shards.
- **The plan-migration current snapshot** (`pds-20260906-017`) for the three documents' units, including the live PlanUnit count, now 6,721.

## Commit map

The landing rebase rewrote the branch's commit hashes. The branch report cites the pre-landing hashes, which map to `main` as follows.

| Before the landing rebase | On `main` | Subject |
|---|---|---|
| `93bbc67c85` | `a475070763` | plans: UNVERIFIED DRAFT inherited from retired Codex thread - terminal.workgroup_moved family contract |
| `e07919afab` | `a26ac74aaa` | plans: renumber the terminal draft's storage unit SP-314 to SP-319 |
| `bf4fa3a480` | `f13d00e976` | plans: break cycle-001 - SP-319 depends on SMPFS-170, not the reverse |
| `6942619e11` | `4f4bae2f78` | plans: align SMPFS-170 and SP-319 with DL-070 and DL-076 |
| `c34d93c9c3` | `052ceef19e` | plans: cite DL-076 for the nine-field token in the SP-266 v2 subsection |
| `48fd2f065f` | `117f2aafe5` | plans: SMPFS-170/SP-319 wording fixes from self-review of the alignment |
| `39915b7d30` | `cc49277c44` | reports: step 08 terminal.workgroup_moved draft repair report |
| `86607345e6` | `9979c00f82` | plans: T-01 - SMPFS-170 appends under the existing ordinary durability class |
| `94ffa73a25` | `8ffe1697ca` | plans: T-02 - SMPFS-170 event_id and idempotency_key are producer-supplied |
| `0a796a1402` | `7cf2e903de` | plans: T-03 - SMPFS-170 and SP-319 adopt the SP-286 resolvers by name |
| `754c977abd` | `5fe31c72e7` | plans: T-04 - name the specified behavior the new history read serves |
| `bd2a89ca17` | `a7ccee40a6` | plans: T-05 - SMPFS-170 search scope names the wiring rows and handler path |
| `9b48df3099` | `8a0e468d5f` | plans: T-06 - carry CV-323's cancelled and failed no-event negations |
| `92c0dcd89d` | `0e4aba3d01` | plans: T-07 - SMPFS-170 direction sentence no longer says "only" |
| `ad2e923d70` | `14bc79d246` | plans: T-08 - vacated-section sentence cites DL-070 and keeps SMPFS-138 |
| `b06d94210d` | `babbe40e0e` | plans: T-09 - SMPFS-170 result content records the vacated source section |
| `f52b05bcd9` | `1786042fca` | plans: T-10 - SP-319 renumbering note cites the reachable rebased commit |
| `0a114f2ce4` | `e6abc53e75` | plans: cite DL-076 in the created v2 checkpoint schema's durable token description |
| `d87c5e8a84` | `bc9475405a` | reports: terminal draft repair report - review fixes section |
| `44d7048ec2` | `08ae6bc439` | plans: DL-070 PlanUnit - source_reseeded is retired, not "always false" |
| (new) | `e44b9186fb` | plans: SP-319 renumbering note cites the draft commit as it lands |

Evidence: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/terminal-workgroup-draft-repair-20260924/landing/`.

| File | SHA-256 |
|---|---|
| `landing.json` (landing check report) | `173cba60d7ceb44b50d07c1cb50a79a987da6fb8e73e6d0af3a29f8cfeb93030` |
| `delta-e44b9186fb/proof-result-e44b9186fb.txt` (full-list deltas) | `b619c3793aa5b55e93f7638373998b82b6b5dbb56ae84658ebbf375b5be56be3` |
| `shared-shard-check-e44b9186fb.json` | `b8070a4e73ae546e6c7bb6814c469dd0d020724d62d5f13df27e79b6f067d55f` |
| `shared-lint-contractrefs-e44b9186fb.json` (the standalone rerun) | `2cc9e3d34881e1f0bf183f6299b7a455d59079374c162b49679878a0e87694c8` |
