# Governance reseal, 2026-09-24

This is a repository-wide reseal at `main` `f1ce058ccd`. The previous seal was `aff2a0d692` on 2026-09-23. The session that did that reseal is out of usage, so Jared delegated the designation of the Plans agent for this one to the coordinator, who relayed it with the scope:

- `Plans/Spec_Lock.json`
- `Plans/.evidence/**`
- the readiness artifacts
- one row in `Plans/auto_decisions.jsonl`
- the `refresh-batch-hashes` and `refresh-final-summary` pair on migration run 002
- the Event Authority currentness edition, written in place after a backup

Nothing else. The procedure is the one `reports/governance-reseal-20260923/reseal-record.md` records, repeated step for step.

## Which migration run

The AGENTS.md scope sentence says "the current migration run". Here that means the run the aggregate checks validate. `validate_plan_migration` in `run-gates` and `plan_migration` in `audit-governance` are both fixed to run 002 (`DEFAULT_PLAN_MIGRATION_RUN` in `scripts/pm-plans-verify.py`), and yesterday's reseal refreshed run 002.

Run 017, the run `Plans/.plan_migration/current_run.json` names, is checked only by the landing check's third check. It is refreshed only by `snapshot-current`, which writes a new run and belongs to the nightly. A trial of the pair on run 017, reverted afterwards, took its validation from 33,072 failures to 33,028. It cleared 55 `stale_batch_report_sha256_after` rows and the live-count row, but added 11 `current_snapshot_batch_doc_invalid` rows and one `current_snapshot_current_run_pointer_invalid` row, because `current_run.json` pins the final summary's SHA-256. The coordinator decided on run 002 only, and will have the rule sentence corrected to name it.

## What was backed up first

Everything the reseal could overwrite was copied to `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20260924/backup/` before any change: Spec Lock, `auto_decisions.jsonl`, the node-readiness report, the full `Plans/.evidence` tree, `Plans/.implementation_readiness`, migration run 002, and the ignored currentness edition. The edition's 15 files were verified byte-identical to the in-place directory. Manifest: `backup/SHA256SUMS`, SHA-256 `d0cf34e168fd3d039ab4db2621b7c90d3bb18e90d8676acbea122753a957dd60`.

## What the reseal attests

Of the 94 files Spec Lock locks, **11 changed since the 2026-09-23 seal**. `attestation.json` beside this record lists every one, with its hash at the previous seal, its hash now, and every commit that changed it since `aff2a0d692`, taken from git history.

- **Plans documents:** 00-plans-index, Commands_System, FinalGUISpec, UI_Command_Catalog and storage-plan. storage-plan alone has 28 commits, from the BSD lifecycle, storage registry repairs, Browser-created SP-278 companion, storage owner closeout and terminal.workgroup_moved landings.
- **Registry:** `storage_value_registry.json`.
- **Scripts:** the readiness, plan-index, plans-verify and shard scripts.
- **Readiness:** the buildability report. No commit changed it after the previous seal. This reseal regenerated it, and its attestation entry says so.

## What was done, in order

1. **Currentness edition, first generation.** Generated from live sources into an empty external directory, `currentness-edition-1`, through the same evidence-location map as yesterday. It was copied into the worktree's ignored edition only, so the readiness projections below read a current edition. It validates with `evidence_valid: true`.
2. **Readiness projections.** The node-readiness report was regenerated, then the buildability report. The other generated index files changed only in `generated_at_utc`, so they were restored, as yesterday.
3. **Migration run 002.** `refresh-batch-hashes` and `refresh-final-summary`, the latter with the default `preseal` state. Validation went from 34 failures to 2. The 34 were 31 `stale_batch_report_sha256_after`, the live PlanUnit count (6,717 recorded against 6,721 live), and the two structural rows. The two left are `doc_count_mismatch` (72 inventoried against 96 live documents) and `inventory_doc_set_mismatch`, which no hash refresh can fix.
4. **Live evidence bundle.** This is `pm7-usage-recovery-plan-sharding-2026-08-29`, still the only `live_current` bundle. Its shard reports were regenerated: 99 documents, 2,722 shards, no mismatches, and no shard file changed. Its artifact list was re-synced, from 3,019 to 3,022 artifacts. It was refreshed with the plan-index details, the three command excerpts, and a `governance-reseal-2026-09-24` check.
5. **Decision row.** One `auto_decisions.jsonl` row, `dec-2026-09-24-governance-reseal`, written with `upsert_auto_decision` from `scripts/pm-governance-seal.py`, so its `inputs_hash` and serialization follow the file's convention. `validate-auto-decisions` passes.
6. **Spec Lock.** Refreshed: 11 hashes, the ten stale entries plus the regenerated buildability report. `verify-spec-lock` passes with no failures, down from 10.
7. **Currentness edition, final generation.** Generated last into `currentness-edition-final`, so it pins the final Spec Lock and live evidence bundle.
   - Its frozen inputs are untouched: `EXPECTED_252_EVENT_TYPES.tsv` (SHA-256 `d59142bc…f5c541`) and the seven source groups.
   - The 252-row quarantine ledger and the group manifest are byte-identical to the previous edition.
   - The status stays `UNKNOWN_OPEN`, with closed, denominator-known, depth-complete and build/PNC-019 authority all false.
   - The live registry recorded is `0be54418…5c842`, 42 families at `2026-09-11.2`, unchanged.
   - Sources went from 245 to 246. The one addition is `Plans/back_seat_driver_contracts.schema.json`. Discovery went from 3,468 to 3,477 tokens and from 8,887 to 8,917 occurrences. These are discovery queues, not adjudications, and the minimum owner queue is still 86.
   - It validates with `evidence_valid: true` and `event_authority_closed: false`.
   - Manifest: `currentness-edition-final.SHA256SUMS`, SHA-256 `069fe48b521e0ab5f07864842361879809d1f95ab9aa9d2039dd45ec6e7f7e78`. Receipt SHA-256: `ac790cc6c02571a36b9772890d7c707c35021168b384dc80943ef49488dad3c9`.
8. **Node readiness, regenerated once more** against the final edition. The plan index validates: 6,721 PlanUnits, 26,233 acceptance units, node readiness `blocked_runtime_certification_incomplete`, runtime not enabled.
9. **In place.** The final edition is written over the seven generated files in the shared checkout's ignored `Plans/.audits/event-authority-2026-08-13-currentness/` under the landing lock, immediately before the fast-forward, after checking it is byte-identical to `currentness-edition-final`. Written any earlier, it would have pinned a Spec Lock that was not yet on `main` while other branches landed. The landing record carries the in-place validation.

## Gates after the reseal (worktree)

The worktree had the ignored inputs the checks open, with the same content the shared checkout has, so it has no worktree-only failures. The run before the reseal reproduced the shared checkout's last landing exactly: 3,279 failures in the same eight subchecks.

| Check | Before, `main` `f1ce058ccd` | After |
|---|---:|---:|
| `verify_spec_lock` | 10 | 0, pass |
| `validate_evidence` | 876 | 0, pass |
| `validate_plan_graph` | 876 | 0, pass |
| `validate_plan_migration` (run 002) | 34 | 2 |
| `validate_implementation_readiness` | 39 | 24 |
| `validate_audit_closure` | 201 | 201 |
| `validate_pm7_gui_fixtures` | 3 | 3 |
| `validate_prd_planning_runtime_contracts` | 1,240 | 1,240 |
| **run-gates total** | **3,279; 28 pass, 8 fail** | **1,470; 31 pass, 5 fail** |
| `pm-plan-migration.py validate`, run 017 | 33,072 | 33,072 |

The 24 readiness failures left are:

- 17 `pnc019_source_hash_stale`, because the PNC-019 receipt is not reissued;
- 2 `event_denominator_unresolved` and 2 `event_family_contract_depth_unresolved`;
- 1 `buildability_gate_report_stale_or_not_canonical`, the residual below;
- 1 `event_legacy_fixture_root_mismatch`;
- the pre-existing `implementation_readiness_self_tests_failed` row.

Audit closure, the PM7 GUI fixtures and the PRD runtime contracts are unchanged, and no reseal artifact touches them.

## One residual the reseal cannot remove

The governance artifacts form a cycle:

- Spec Lock pins the buildability report.
- The buildability report pins the node-readiness report.
- The node-readiness report records the currentness findings.
- The currentness edition inventories Spec Lock and the live evidence bundle.

One artifact must be left one step behind. As yesterday, it is the buildability report. It is stale only against the node-readiness hash regenerated in step 8, and shows as one `buildability_gate_report_stale_or_not_canonical` row inside the readiness gate, which fails on denominator and depth anyway.

## Deliberately not done

- The PNC-019 certification harness was **not** rerun. A rerun would issue a new certification, which DL-039 forbids until denominator and depth are complete. Its 17 `pnc019_source_hash_stale` rows stay reported.
- Run 017 was not refreshed, for the reasons above.
- No validator, registry, canonical prose or other thread's file was changed. The live bundle's `plan-shard-generate` check still reads "98 documents; 2138 shards". Yesterday's procedure did not update that detail either, and it is not a gate input.
- No denominator, depth, runtime, buildability or PNC-019 claim follows from this reseal.

## Process note

While the worktree's check inputs were being prepared, a bulk copy of the shared checkout's ignored `Plans/.audits` audit trees and `scratchpad/` filled the VM's disk. The trees hold tens of gigabytes of captures. The coordinator stopped the copy and removed it. Nothing tracked, committed or pushed was affected.

The worktree then received only what the checks open:

- the currentness edition;
- the two small audit directories;
- `FINAL_REPORT.md` for the three large ones, and the one `audit_report.json` that `Plans/00-plans-index.md` cites;
- a link for `audit-20260830-001`, which has no `FINAL_REPORT.md`;
- the three ignored `event-authority-2026-08-12` files;
- the `tests/agent_packet_restrictions` link.

With exactly these, `lint_contractrefs`, the web-capability and audit-status-index checks, and `json_syntax` give the shared checkout's results.

## Afterwards

The landing-check baseline is re-recorded from a full run against the resealed `main` in this worktree, committed with the commit it was taken at, and landed as a separate commit under the same landing lock. `baseline-record.md` beside this record describes it.

Raw outputs are in `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20260924/`; manifest `SHA256SUMS` there.

Cost: one session. It covered two currentness generations, the readiness and index fixpoint, and a full gate run before and after; monetary attribution is unavailable.
