# Governance reseal, 2026-09-29

This is a repository-wide reseal at `main` `dfd00dbb44`. The previous seal was `792d2fb8b1` on 2026-09-24, and 342 commits have landed since. They include the Settings rework (`0b97dcb3f2`), the Chat WOW spring fix (`2ee4466fe3`) and the wand-modules redesign and canon (ending at `dfd00dbb44`).

Jared designated this session in chat on 2026-09-28 ("You can do it."), and the coordinator relayed the scope:

- `Plans/Spec_Lock.json`
- `Plans/.evidence/**`, which in practice means the one live bundle
- the readiness artifacts
- one row in `Plans/auto_decisions.jsonl`
- the `refresh-batch-hashes` and `refresh-final-summary` pair on migration run 002
- the Event Authority currentness edition, prepared outside the repository and written in place by the landing lead

Nothing else is in scope. The procedure is the one `reports/governance-reseal-20260924/reseal-record.md` records, repeated step for step, with the 2026-09-23 record as the origin of each step.

## Which migration run

The refresh pair ran on run 002 (`pds-20260611-002-atomize-planunits`) only. That is the run `validate_plan_migration` in `run-gates` and `plan_migration` in `audit-governance` validate (`DEFAULT_PLAN_MIGRATION_RUN` in `scripts/pm-plans-verify.py`). Run 017 was not touched. It is refreshed only by the nightly `snapshot-current`, as the 2026-09-24 record explains.

## What was backed up first

Everything the reseal could overwrite was copied to `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20260929/backup/` before any change:

- Spec Lock, `auto_decisions.jsonl` and the node-readiness report;
- the full `Plans/.evidence` tree, `Plans/.implementation_readiness` and migration run 002, each as a tar;
- the shared checkout's ignored currentness edition.

The edition's 15 files were verified byte-identical to the in-place directory. Their manifest, `backup/currentness-edition-ignored.SHA256SUMS`, has SHA-256 `e32dde35…6c583`. That is the same manifest the 2026-09-24 landing recorded, so the in-place edition is still the one that reseal wrote. The backup manifest is `backup/SHA256SUMS`, SHA-256 `f99b80b05588c39bb359836cf731b33ee9031b9789ab10166f23c7bba264283c`.

## What the reseal attests

Of the 94 files Spec Lock locks, **26 changed since the 2026-09-24 seal**. `attestation.json` beside this record lists every one, with its hash at the previous seal, its hash now, and every commit that changed it since `792d2fb8b1`, taken from git history. 62 distinct commits touched them.

- **Plans documents (20):** 00-plans-index, Automated_Testing_System, Commands_System, Contracts_V0, DRY_Rules, Executor_Protocol, FinalGUISpec, Goal_Runtime_System, Models_System, PRD_Builder, Plan_To_Node_Compilation, Planning_Wizard, Release_Supply_Chain, UI_Command_Catalog, UI_Wiring_Rules, Wiring_Matrix, assistant-chat-design, orchestrator-subagent-integration, storage-plan and usage-feature. storage-plan has the most commits (18), then Automated_Testing_System and `storage_value_registry.json` (13 each) and FinalGUISpec (11).
- **Registries, schemas and contracts:** `storage_value_registry.json`, `plans_to_code_handoff.schema.json` and `prd_planning_runtime_contracts.json`.
- **Scripts:** `pm-implementation-readiness.py` and `pm_pnc019_currentness.py`.
- **Readiness:** the buildability report. No commit changed it after the previous seal. This reseal regenerated it, and its attestation entry says so.

Every hash at the previous seal equals the pin in Spec Lock at `792d2fb8b1`. Every hash now equals the pin in the resealed Spec Lock.

## What was done, in order

1. **Currentness edition, first generation.** It was generated from live sources into an empty external directory, `currentness-edition-1`, through the same evidence-location map as last time. It was copied into the worktree's ignored edition only, so the readiness projections below read a current edition. It validates with `evidence_valid: true`.
2. **Readiness projections.** The node-readiness report was regenerated, then the buildability report. The other generated index files changed only in `generated_at_utc`, so they were restored, as last time.

   The node-readiness report on `main` had been generated at 05:43:56Z today in a checkout without the ignored edition. It recorded `event_authority_currentness_audit_unavailable` and `pnc019_source_hash_path_missing` for the currentness receipt. The regenerated report reads the edition and records the receipt's hash as one of the `pnc019_source_hash_stale` rows instead.
3. **Migration run 002.** `refresh-batch-hashes` ran, then `refresh-final-summary` with the default `preseal` state. Validation went from 110 failures to 2.
   - The 110 were 107 `stale_batch_report_sha256_after` rows, the live PlanUnit count (6,721 recorded against 6,926 live) and the two structural rows.
   - The two left are `doc_count_mismatch` (72 inventoried against 96 live documents) and `inventory_doc_set_mismatch`, which no hash refresh can fix.
4. **Live evidence bundle.** This is `pm7-usage-recovery-plan-sharding-2026-08-29`, still the only `live_current` bundle.
   - Its shard reports were regenerated: 99 documents, 2,788 shards, no mismatches, and no shard file changed.
   - Its artifact list was re-synced, from 3,022 to 3,088 artifacts.
   - It was refreshed with the plan-index details, the three command excerpts and a `governance-reseal-2026-09-29` check.
   - The shard commands ran with `--config Plans/sharding_config.json`, which is the script's default. The command excerpts keep the command strings the bundle already records, so they update in place rather than adding rows.
   - `validate-evidence` passes.
5. **Decision row.** One `auto_decisions.jsonl` row, `dec-2026-09-29-governance-reseal`, was written with `upsert_auto_decision` from `scripts/pm-governance-seal.py`, so its `inputs_hash` and serialization follow the file's convention. `validate-auto-decisions` passes.
6. **Spec Lock.** 26 hashes were refreshed: the 25 stale entries plus the regenerated buildability report. `verify-spec-lock` passes with no failures, down from 25.
7. **Currentness edition, final generation.** It was generated last into `currentness-edition-final`, so it pins the final Spec Lock (`3e9aec97…`) and live evidence bundle (`cdbdee36…`).
   - Its frozen inputs are untouched: `EXPECTED_252_EVENT_TYPES.tsv` (SHA-256 `d59142bc…f5c541`) and the seven source groups.
   - The 252-row quarantine ledger and the group manifest are byte-identical to the previous edition.
   - The status stays `UNKNOWN_OPEN`, with closed, denominator-known, depth-complete and build/PNC-019 authority all false.
   - The live registry recorded is `4227be36…c3e70`, 43 families at `2026-09-25.1`. At the last reseal it was `0be54418…5c842`, 42 families at `2026-09-11.2`. The change is the Step 9 registration of `coordination.agent_registered` (`3abdf9fe3f`).
   - Sources went from 246 to 251. The additions are `assistant_chat_contract_fixtures.json`, `assistant_chat_contracts.schema.json`, `collaborative_workflows_contract_fixtures.json`, `collaborative_workflows_contracts.schema.json` and `coordination_event_payloads.schema.json`, all under `Plans/`. None was removed.
   - Discovery went from 3,477 to 3,594 tokens and from 8,917 to 9,419 occurrences. Contested tokens went from 11 to 12, so the minimum owner queue is now 87 (75 likely-persisted plus 12 contested). Ambiguous tokens went from 241 to 285. These are discovery queues, not adjudications.
   - It validates with `evidence_valid: true` and `event_authority_closed: false`.
   - Manifest: `currentness-edition-final.SHA256SUMS`, SHA-256 `0677766400ec6cb6102f2b355ca80a525b8c8e8b8ac656e4cd8ea56f3aea519d`. Receipt SHA-256: `8501ee54544f36d0dade7461cde4787e2f19ef88d1358985a7cdf6f00e9443bb`.
8. **Node readiness, regenerated once more** against the final edition. The plan index validates: 6,926 PlanUnits, 27,072 acceptance units, node readiness `blocked_runtime_certification_incomplete`, runtime not enabled.
9. **In place.** This session did not write the shared checkout's ignored `Plans/.audits/event-authority-2026-08-13-currentness/`. The landing lead writes the final edition over its seven generated files under the landing lock, immediately before the fast-forward, with `in-place-write.sh` in the evidence directory. The script first checks that the in-place directory is still the 2026-09-24 edition and that the source matches its manifest. It then copies the files and verifies all 15 in place: 7 against the final manifest, and the 8 frozen inputs unchanged. Written any earlier, the edition would pin a Spec Lock that was not yet on `main` while other branches landed. The landing record carries the in-place validation.

## Gates after the reseal (worktree)

The worktree is a full checkout with the ignored inputs the checks open, and those inputs have the same content the shared checkout has. Every input-sensitive subcheck passes: `json_syntax`, `lint_contractrefs`, `validate_web_capability_contracts` and `validate_audit_status_index`.

The latest shared-checkout landing check found on disk is the one for `2ee4466fe3`, run on 2026-09-28 at 21:30Z. A copy is at `before/reference-landing-check-2ee4466fe3.txt` in the evidence directory. It reports `run-gates` 4,870, and the before-run matches it subcheck for subcheck, apart from what the 13 wand-modules commits since then changed:

- `verify_spec_lock` rose from 23 to 25, for `Models_System.md` and `usage-feature.md`;
- `validate_evidence` and `validate_plan_graph` rose from 1,616 to 1,722;
- run 002 rose from 100 to 110;
- readiness rose from 71 to 83.

Audit closure (201), the PM7 GUI fixtures (3) and the PRD runtime contracts (1,240) are equal.

| Check | Before, `main` `dfd00dbb44` | After |
|---|---:|---:|
| `verify_spec_lock` | 25 | 0, pass |
| `validate_evidence` | 1,722 | 0, pass |
| `validate_plan_graph` | 1,722 | 0, pass |
| `validate_plan_migration` (run 002) | 110 | 2 |
| `validate_implementation_readiness` | 83 | 24 |
| `validate_audit_closure` | 201 | 201 |
| `validate_pm7_gui_fixtures` | 3 | 3 |
| `validate_prd_planning_runtime_contracts` | 1,240 | 1,240 |
| **run-gates total** | **5,106; 28 pass, 8 fail** | **1,470; 31 pass, 5 fail** |
| `pm-plan-migration.py validate`, run 017 | 38,569 | 38,569 |

The after column is identical to the 2026-09-24 reseal's: 1,470 failures in the same five subchecks, with the same counts. The before column is larger than that reseal's (3,279), because more had landed since the previous seal:

- 25 stale Spec Lock entries, against 10;
- 1,722 stale evidence and plan-graph rows, against 876;
- 110 run-002 rows, against 34;
- 83 readiness rows, against 39.

The 83 readiness rows before were:

- 54 `event_authority_currentness_source_drift` and 1 `event_authority_currentness_live_registry_drift`, from the new sources and the 43rd registry family;
- 2 `storage_value_registry_spec_lock_hash_stale`, 1 `event_record_spec_lock_hash_stale` and 1 `non_executable_closure_spec_lock_hash_stale`;
- the 24 kinds that remain after.

The 24 readiness failures left are the same kinds as last time:

- 17 `pnc019_source_hash_stale`, because the PNC-019 receipt is not reissued;
- 2 `event_denominator_unresolved` and 2 `event_family_contract_depth_unresolved`;
- 1 `buildability_gate_report_stale_or_not_canonical`, the residual below;
- 1 `event_legacy_fixture_root_mismatch`, whose fixture carries registry revision `2026-08-27.1` against the live `2026-09-25.1`;
- the pre-existing `implementation_readiness_self_tests_failed` row.

Run 017 grew from 33,072 at the last reseal to 38,569. That growth is `main`'s snapshot staleness, which only the nightly `snapshot-current` clears. The reseal does not touch run 017, and its validation report is byte-identical before and after.

## One residual the reseal cannot remove

The governance artifacts form a cycle:

- Spec Lock pins the buildability report.
- The buildability report pins the node-readiness report.
- The node-readiness report records the currentness findings.
- The currentness edition inventories Spec Lock and the live evidence bundle.

One artifact must be left one step behind. As in the last two reseals, it is the buildability report. A trial regeneration, reverted afterwards, confirmed it is stale only against the node-readiness hash regenerated in step 8: the one differing line pins `d98360dd…`, and the node-readiness report now hashes to `4afc3481…`. It shows as one `buildability_gate_report_stale_or_not_canonical` row inside the readiness gate, which fails on denominator and depth anyway.

## Deliberately not done

- The PNC-019 certification harness was **not** rerun. A rerun would issue a new certification, which DL-039 forbids until denominator and depth are complete. Its 17 `pnc019_source_hash_stale` rows stay reported.
- Run 017 was not refreshed.
- The shared checkout's ignored edition was not written, and `main`, the landing lock and the landing baseline were not touched. The in-place write and the baseline re-record belong to the landing.
- No validator, registry, canonical prose or other thread's file was changed. The live bundle's `plan-shard-generate` check still reads "98 documents; 2138 shards", as last time; it is not a gate input.
- No denominator, depth, runtime, buildability or PNC-019 claim follows from this reseal.

## Process note

The worktree received only the ignored inputs the last record lists:

- the currentness edition, copied;
- `audit-20260828-002` and `audit-20260828-003`, copied;
- `FINAL_REPORT.md` for `audit-20260827-001`, `audit-20260828-001` and `audit-20260829-001`, plus the `audit_report.json` of `audit-20260829-001` that `Plans/00-plans-index.md` cites;
- a link for `audit-20260830-001`;
- the three ignored `event-authority-2026-08-12` files;
- the `tests/agent_packet_restrictions` link.

That came to 148 MB under `Plans/.audits`. Free space on the VM disk stayed at 248 GB.

One slip occurred while reading the previous run's scripts. Running the 2026-09-24 `decision-row.py` with `--help` executed it, because it has no argument parser. It re-upserted that day's row in the worktree's `auto_decisions.jsonl` at 06:10:40Z, while the before-run of `run-gates` was in progress. The file was restored from git within about a minute, and is byte-identical to the backup.

The before-run's `validate_auto_decisions` and every earlier subcheck had finished before the slip. The eight subchecks that ran during that minute (`validate_new_contracts` through `validate_server_command_gap`) were run again on their own after the restore, and all pass, as they did in the gate run. This reseal's own `decision-row.py` refuses to run without `--apply`.

## Afterwards

The landing-check baseline is re-recorded from a full run against the resealed `main`, committed with the commit it was taken at, and landed as a separate commit under the same landing lock. That is a separate step, after landing.

Raw outputs are in `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20260929/`; the manifest is `SHA256SUMS` there, and `STATUS.md` is the progress log.

Cost: one session. It covered two currentness generations, the readiness and index fixpoint, and a full gate run before and after. Monetary attribution is unavailable.
