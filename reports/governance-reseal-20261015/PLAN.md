# Governance reseal plan — 2026-10-15

**Phase 1 only. Nothing has been sealed or landed by this thread.** Jared assigned the repository-wide governance reseal; the coordinator `home-redesign-planner` assigned it to `reseal-20261015`. Phase 2 starts only when that coordinator mails an explicit **GO Phase 2**, after an independent review of this plan. Mail `1015022926-e547` adds one prerequisite and does not authorize Phase 2.

Branch: `plans/governance-reseal-20261015`. Full worktree: `/home/sittingmongoose/pm-worktrees/governance-reseal-20261015` (not sparse), owned by `/home/sittingmongoose/src/PuppetMaster`. The validators ran at **`f402a3e1236bb8f41a3fb39289d895e7243f7f16`**. While they ran, `origin/main` advanced to **`e3c90cf99efa0fe218e826cf40caa7f39e345e01`** (`concept: land shell polish sources on current main`): 14 Concepts files and no `Plans/` path. The measured governance counts still describe the Plans bytes. Phase 2 rebases onto the main that exists at GO and recomputes them. It does not freeze this snapshot as the seal inputs.

## Authority and procedure

Read `AGENTS.md`, `.claude/CLAUDE.md`, and `Plans/00-plans-index.md` first. The procedure is the [2026-10-11 reseal record](../governance-reseal-20261011/reseal-record.md), its [plan](../governance-reseal-20261011/PLAN.md), [attestation](../governance-reseal-20261011/attestation.json), and [baseline record](../governance-reseal-20261011/baseline-record.md), with the landing rules in [the baseline README](../landing-checks/README.md). The earlier record it follows is [the 2026-10-09 reseal](../governance-reseal-20261009/reseal-record.md). External reference: `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261009/RESEAL-RUNBOOK.md`. Do not reuse its dated hashes, counts, base commit, or run IDs. Argument parsers were read from this worktree into `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261015/phase1/help.txt`, SHA-256 `731897cdf488f0894c7de414078fe7d10f77fdfa1fde2fa66c39fcd160c66b77`.

The reseal's scope is the one `AGENTS.md` names: Spec Lock, the one `live_current` evidence bundle, readiness projections, one new `Plans/auto_decisions.jsonl` row, the `refresh-batch-hashes` plus `refresh-final-summary --seal-state preseal` pair on `pds-20260611-002-atomize-planunits` (`scripts/pm-plans-verify.py` `DEFAULT_PLAN_MIGRATION_RUN`, line 35 of this tree), and the currentness edition written in place after a backup. The landing follow-up, separate from the reseal, refreshes the run named in `Plans/.plan_migration/current_run.json` with `snapshot-current`, then `--record-baseline`.

The approved currentness custody sequence in the 2026-10-11 plan still matches today's checker. `pm-landing-check.py --help` still has `--readiness-audit-root`. The README still refuses a changed currentness edition with exit 3 before classifying findings, and `pm-implementation-readiness.py validate --help` still has no audit-root flag. Retain the recorded old edition through the first landing check and the first main push. Write the seven generated files in place only after that push, under the same lock. Then run `snapshot-current` and `--record-baseline` against the already pushed main and the new edition.

Two dated tools from the previous reseal do not carry forward:

- `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261011/phase2/in-place-write.py` (SHA-256 `63fddc88b0acdb324d2212853828165ca34bb3cbd9c65c47315aec0aa3e6cb24`) asserts that reseal's manifests, holder name, and branch. Phase 2 writes a new helper under the 2026-10-15 evidence directory. Same algorithm: `check` / `write` / `restore`, seven generated files, eight frozen files, and a write or restore only while this thread holds the lock and shared `HEAD` and `origin/main` are the already pushed reseal SHA.
- The DL-188 receipt-pin helper is not a Phase 2 step. At this HEAD the certification receipt already pins the live registry and the workspace-layout v2 payload. See the pin check below. If those two pins differ from live bytes at GO, stop and ask. Do not run `pm-pnc019-certification-harness.py`.

`cp -a` from the shared checkout onto this worktree returns "Operation not supported" while preserving permissions. The currentness bytes still matched the shared edition (15 files, no hash mismatch). Phase 2 copies ignored inputs with `rsync -a --no-perms --no-owner --no-group`, and symlinks the 1.1 GB resize audit instead of copying it.

## Required landings before GO

Phase 2 waits for every row. None of these is a GO. Rebase onto the resulting main and re-inventory before writing governance files.

| Prerequisite | Plans paths at this check | What Phase 2 re-reads |
|---|---|---|
| PM7 landing train, still not on `origin/main` | None. `git diff --name-only origin/main...<sha> -- Plans/` is empty for each SHA, and `git status --short -- Plans/` in each worktree is empty. | Concepts-only landings add no governance hash. Re-inventory anyway if one of them later touches `Plans/`. |
| shell polish — **landed during Phase 1** at `e3c90cf99efa0fe218e826cf40caa7f39e345e01` (branch tip checked earlier was `fc724774c4`) | 14 Concepts files, no `Plans/` path (`git diff --name-only f402a3e123..e3c90cf99e -- Plans/` is empty) | Already on main. No governance hash of its own. |
| DnD finish `81d2a069e6c59d1bd3b36ed324c313befd944dae` | 6 Concepts files | |
| DnD combined `143ebf8f43b6dd90926c4fef5359b5b57f35e199` | 7 Concepts files | |
| DnD more-target `e6c02a81c9b6646c3dd247caa24c89af697354fe` | 7 Concepts files | |
| Projects `e5ca71395e9c9325906b5658ec171fbf4aa95176` | 5 Concepts files | |
| Wizard `f4bc00621709fd03c5236b9b506be684fb26a219` | 8 Concepts files | |
| drop-perf `adf5734789b3cfa199141cf3063d30d4d82ded22` | 13 Concepts files | |
| M4 follow-up `dd9115cfb9ae3963c11b2b724d69773a67476368` | 5 Concepts files | |
| Editor customizer `b24a6cf9ed50fcd04f973ef4baf98531c81edeff` | No `Plans/` paths. 29 Concepts files and 8 reports files. Uncommitted `Plans/` status is empty. | If a later commit adds `Plans/settings_inventory.json` or any other Plans path, that path joins the re-inventory. |
| Terminal round 3 `135a1430a2ec2a24e44f5dcb27c86e49aefa7f1a` | No `Plans/` paths. 48 Concepts files and 8 reports files. Uncommitted `Plans/` status is empty. | Same rule as the editor branch. |
| Q19 Plans pass 2, coordinator mail `1015022926-e547` | No SHA yet. After the concept work lands, a separate Plans pass updates owner docs, DRY, commands, wiring, and the settings inventory for everything that landed since `386c792b2c`. | Phase 2 runs only on a main that contains this pass. The stale set below will move. |

## Previous seal and Plans landings since it

Both recorded SHAs are ancestors of fetched `origin/main`:

- Combined reseal `f2f61a803a92b76878e94c23cf9c04668390f27f` (2026-10-11 13:56:08 -0400, subject `reports: normalize checkpoint verification file mode`).
- Its snapshot/baseline follow-up `2f91e7a6228e5d3b50be997a562eb263bef059bc` (2026-10-11 14:23:31 -0400), parent `f2f61a803a`, run `pds-20261011-004-current-planunit-snapshot`.

`git log --format='%H %ci %s' f2f61a803a..origin/main -- Plans/` then groups into two owner landings plus that follow-up. Later main commits `ab4d17c056` and `f402a3e123` change no `Plans/` path.

### 1. No-pills Settings

Owner commit `f8a9f64e604886147eeb8f6dce724fceabc1afdf`: `Plans/FinalGUISpec.md`, `Plans/Settings_System.md`. Snapshot/baseline follow-up `e254a56477c7b8da424b7485ba17f358fdbf3ec5` records `pds-20261012-001-current-planunit-snapshot` and says snapshot-current ran at main `4ca54b237a`. The landing-check log's checkout is `4ca54b237a17`, baseline `f2f61a803a92`.

No file named `RESEAL-REQUEST` exists under `/mnt/Cursor/share/puppet-master/2026-10-1[1-5]*/` for this landing. The landing check itself is the request. Log: `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-no-pills-landing-20261012/landing-check.log`, SHA-256 `303c981c327c5d0e6cd9afca71e3d965909d26acd95992f90ff9996d090ac309`.

- Exit 1. Run-gates 1,699 (baseline 1,486), audit-governance 1,682 (baseline 1,469), plan-migration-validate 1,684 (baseline 0).
- On-branch findings excused as staleness: 1,702. Kinds: `current_snapshot_live_span_metadata_mismatch` 1,656, `stale_batch_report_sha256_after` 22, `artifact_hash_stale` 4, `current_snapshot_live_bytes_mismatch` 4, `current_snapshot_live_line_count_mismatch` 4, `current_snapshot_live_sha256_mismatch` 4, `event_authority_currentness_source_drift` 4, `current_snapshot_span_sha256_mismatch` 2, `stale_hash` 2.
- Named stale lock paths in that log: `Plans/FinalGUISpec.md` (and the audit-governance copy). Source drift names `Plans/FinalGUISpec.md` and `Plans/Settings_System.md`.
- The log's closing line tells the lander to report a reseal request to Jared.
- Follow-up log SHA-256 `51c70d386c033cdc2504a239acbe9b680d554cbfd521c505deb8824d963bc092`: checkout `e254a56477`, exit 0, plan-migration-validate 0, run-gates 1,699 against a new baseline of 1,701. The follow-up is the snapshot and baseline, not a reseal.

### 2. PM7 canon

One fast-forward of owner commits, then one snapshot. Owner range `4f6b63a6e3` through `386c792b2c9cd2ab06d0d5782b07bee3323af19c`, parent of the first owner commit `fbc3871593`. Authored Plans paths across that range, excluding shards, index, and the later snapshot:

`Plans/00-plans-index.md`, `Automated_Testing_System.md`, `Commands_System.md`, `DRY_Rules.md`, `Decision_Log.md`, `FinalGUISpec.md`, `GUI_Rebuild_Requirements_Checklist.md`, `Orchestrator_Page.md`, `Planning_Wizard.md`, `Settings_System.md`, `UI_Command_Catalog.md`, `UI_Wiring_Rules.md`, `Wiring_Matrix.md`, `Wiring_Matrix.production.exclusions.json`, `Wiring_Matrix.production.json`, `appearance_quick_sets.json`, `appearance_quick_sets.schema.json`, `editor_appearance.schema.json`, `glyph_catalog.json`, `pm7_canon.fixtures.json`, `pm7_control_bindings.json`, `pm7_control_bindings.schema.json`, `settings_inventory.json`, `settings_system_contract_fixtures.json`, `storage-plan.md`, `touch_closure.json`, `usage-feature.md`, `wallpaper_catalog.json`.

Commit `7f1cded1b8` regenerates a Settings inventory tail shard only. Snapshot/baseline `611563296a43a6ca65666b84db9e96fad7a3fec1` adds `pds-20261015-001-current-planunit-snapshot` and `Plans/.plan_migration/current_run.json`.

Requests read:

- `/mnt/Cursor/share/puppet-master/2026-10-14-plans-canon/NOTES.md`, SHA-256 `30c342bb9911c20b1f303f1417b9eda5ff334b21b18e5baa59bd94393a1bb5f5`. Reseal request: refresh edited canon and companion hashes. The completed report records four nonblocking `missing_ref` observations of obsolete shard `Plans/_shards/settings_inventory/113-lines-22401-22532.md` in the untouched live bundle. Include that reference in the reseal. The follow-up is not a reseal, and the request remains open.
- `LANDING-CHECK.txt`, SHA-256 `363d93b355a003d340e2f4f932aaaf53666315f390cee218f0d5344e008951a9`. Head `386c792b2c`, base `fbc3871593`, exit 1, zero blocking findings, zero infrastructure results. Underlying totals: audit-governance 3,029 (baseline 1,684), plan-migration-validate 9,891 (baseline 0), run-gates 3,046 (baseline 1,701). All on-branch findings are staleness. All eight grown buckets are staleness. Four new non-stale observations name that same obsolete Settings shard.
- `FOLLOWUP-LANDING-CHECK.txt`, SHA-256 `8375e44436b54d7fdbb785ca72e4dbea74de8ff14c07aefd4b0dc4342a9585da`. Head `ab4d17c056`, base `386c792b2c`, exit 0, zero new or on-branch findings. Machine report `/mnt/Cursor/PuppetMaster-Evidence/tests/pm7-plans-canon-landing-20261014/followup-check-final/report.json`, SHA-256 `84ebb0921358d5887d7a705b67656b5251693dc8cbb1c53ef35fbe7bfcc5666f`: run-gates 3,046 against baseline 3,048, audit-governance 3,029 against baseline 3,031, plan-migration-validate 0. The committed baseline, read from this worktree's `reports/landing-checks/baseline.json` (SHA-256 `84c9e0acb10339385a3c53b4913a02564ef3acfa29cc1c4835bf77a7014fa027`), was recorded at `386c792b2c` on `2026-10-15T00:56:34Z` with run `pds-20261015-001-current-planunit-snapshot` and totals run-gates 3,048, audit-governance 3,031, plan-migration-validate 0.
- `ac99d7f7cd-LANDING-CHECK.txt`, SHA-256 `202368c081e1db02dad6bf5f03913aac2d78c89a06dc1a384e97675dd3e95624`, is an earlier candidate check at `ac99d7f7cd` against baseline `4ca54b237a`, not the landed head. It exited through the staleness rule (run-gates 3,047, audit-governance 3,031, plan-migration-validate 4,267). It is not the seal input.

The coordinator handoff log under `2026-10-13-pm7-coordinator-handoff/` mentions the same canon reseal request and also names the 2026-10-09 request files. Those 2026-10-09 files were inputs to the reseal that already landed as `f2f61a803a`. They are not a second open request.

## Inventory at `f402a3e123`

Read-only. Ignored inputs were copied or linked into this full worktree before the validators: the 15-file currentness edition, two small audit directories, three `FINAL_REPORT.md` files plus the widget `audit_report.json`, a symlink to the resize audit, three ignored 2026-08-12 Event Authority files, and `tests/agent_packet_restrictions` linked at the shared checkout's resolved target. That link and `/mnt/Cursor/PuppetMaster-Evidence/tests/agent_packet_restrictions` are the same inode. `git status --short` was empty before the run and after it (`STATUS_AFTER 0` in the log). No Spec Lock, evidence, auto-decision, readiness, migration, or currentness file was written.

Commands and the log are under `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261015/phase1/`. Log SHA-256 `6b0e72e5a43ff1afa1ffb380268599ecc250060c01724a715d4d8972dcff8df6`. Every aggregate subcheck status is `pass` or `fail`. The reports record `subcheck_timeout_seconds` 600 and no timed-out subcheck.

| Output | Result | SHA-256 |
|---|---|---|
| `spec-lock.json` | 94 locked files, 11 `stale_hash` | `6c599bee758ebc4db7cca775aae3da577ca10bcc26b2d11fac9563903dbe6145` |
| `evidence.json` | 22 bundles checked, 743 `artifact_hash_stale`, 1 `missing_ref` | `7419f6e3daba689f8607c68fd5a86a7fd0fd0c17baafa4878729f4ac57878f2c` |
| `plan-graph.json` | Same 744 findings; graph follows the live bundle | `a7610e835d998a6c85c2cf572890134a399301e7d6bd0a8b75f5557636f96f3e` |
| `readiness.json` | 42 findings; buildability false | `409b022745522d68e7df3503666a7186ab3710aa2daf06aefa69955906adf4af` |
| `migration-002.json` | 44 findings on run 002 | `4c995a942a6f563b8828599431b88c1011f2388653e93ec542e5dcad21753567` |
| `migration-current.out` | PASS, 0 findings, 96 docs, 7,129 PlanUnits | `3d9cc829a251daa388c87e990d92880cbd2c22e6aa39b2aa46871e0b2bbd9ae8` |
| `plan-index-validate.out` | PASS, 7,129 PlanUnits, 28,419 acceptance units, coverage pass, node readiness `blocked_runtime_certification_incomplete` | `b388020ae182b7a7eda05154a592c12b73281cd05e63f4e573f402ce52943312` |
| `currentness-validate.out` | `evidence_valid` false; two source checks fail; registry, fail-closed flags, and 252-row custody pass | `394531f008c2b980e8f1c943a031160ab86791a94154fa3933919f7bc56f1d2b` |
| `json-syntax.json` | 17 findings | `bdc04513380e238c1333764a9a55abf494959a106810f8a035313685dd9587cd` |
| `run-gates.json` | 3,046 failures; 27 pass / 9 fail | `05dca33da75744fb8d023261bacb119397812c878d7e86dc46967f1ae9da3449` |
| `audit-governance.json` | 3,029 failures; 25 pass / 8 fail | `87ce3baf21e41761ef8003a021895bd16cc0c15f670c0424d74b27737d7ea83d` |
| `pnc-pin-check.json` | Both DL-188 pins match live bytes | `b88a096a322b1bcd32fe07b5a1e4a670d312b002efff4988f1fff3f3ecc7bde7` |

`light-inventory.json` (SHA-256 `d9ecceb7ec876afcd643668f0cabba7d948649ec53264e5c472a1ba8fce408b5`) records the 94 lock entries, the one live bundle, current run `pds-20261015-001-current-planunit-snapshot`, and fail-closed currentness flags. Its `dl188_pins` object read the currentness `VALIDATOR_RECEIPT.json`, which has no `source_hashes`. The certification-receipt comparison is `pnc-pin-check.json`.

Direct `Plans/*.md` count: 96, matching `current_run.json` `doc_count`.

### What a reseal refreshes

**Spec Lock.** 11 `stale_hash` of 94. Refresh every existing entry from live bytes, including unchanged entries. Do not add registrations and do not pass `--register-file` or `--schema-version`.

```text
Plans/00-plans-index.md
Plans/Automated_Testing_System.md
Plans/DRY_Rules.md
Plans/UI_Command_Catalog.md
Plans/Planning_Wizard.md
Plans/FinalGUISpec.md
Plans/Wiring_Matrix.md
Plans/usage-feature.md
Plans/storage-plan.md
Plans/Commands_System.md
Plans/UI_Wiring_Rules.md
```

These changed owner or companion files are not Spec Lock entries. Their bytes are bound where currentness or the live shard inventory already names them. Do not register them because a landing touched them:

`Plans/Decision_Log.md`, `GUI_Rebuild_Requirements_Checklist.md`, `Orchestrator_Page.md`, `Settings_System.md`, `Wiring_Matrix.production.json`, `Wiring_Matrix.production.exclusions.json`, `appearance_quick_sets.json`, `appearance_quick_sets.schema.json`, `editor_appearance.schema.json`, `glyph_catalog.json`, `pm7_canon.fixtures.json`, `pm7_control_bindings.json`, `pm7_control_bindings.schema.json`, `settings_inventory.json`, `settings_system_contract_fixtures.json`, `touch_closure.json`, `wallpaper_catalog.json`.

**Live evidence.** `Plans/evidence_artifact_binding_modes.json` has 22 entries: 21 `historical_snapshot` and one `live_current`, `Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json`. The validator reports 743 `artifact_hash_stale` and one `missing_ref`: artifact `Plans/_shards/settings_inventory/113-lines-22401-22532.md`. That is the obsolete Settings tail the canon request names. The four landing-check observations are this one reference seen across the aggregate copies. Regenerate shard reports and `sync-plan-sharding-evidence`. Do not substitute the path by hand. `Plans/plan_graph.json` has the same 744 findings and no separate hash edit. Historical bundles stay immutable.

**Currentness.** Installed edition status is `UNKNOWN_OPEN`, with `closed`, `complete_denominator_known`, `contract_depth_complete`, and `build_or_pnc019_authority` all false. Registry revision `2026-10-09.1`, 43 families, live registry SHA-256 `4ffde4e80c0671c7240c65b7903e6cabc0c6112bc88afc3fc2faca2a044370fe`. Validate fails `exact_live_source_set` and `all_live_sources_rehashed`. It passes the registry match, fail-closed flags, frozen 252-row custody, receipt artifact hashes, and the validator hash. Readiness lists the 19 drifted sources:

```text
Plans/00-plans-index.md
Plans/Automated_Testing_System.md
Plans/Commands_System.md
Plans/DRY_Rules.md
Plans/Decision_Log.md
Plans/FinalGUISpec.md
Plans/GUI_Rebuild_Requirements_Checklist.md
Plans/Orchestrator_Page.md
Plans/Planning_Wizard.md
Plans/Settings_System.md
Plans/UI_Command_Catalog.md
Plans/UI_Wiring_Rules.md
Plans/Wiring_Matrix.md
Plans/Wiring_Matrix.production.exclusions.json
Plans/Wiring_Matrix.production.json
Plans/settings_inventory.json
Plans/storage-plan.md
Plans/touch_closure.json
Plans/usage-feature.md
```

Regenerate the seven generated files into an external directory. Preserve the eight frozen files, including `adjudication/EXPECTED_252_EVENT_TYPES.tsv` at its existing pin `d59142bc9ceef3f8c2d2257b7a6fbe9307ddae236720a0ac5a8c62afc7c5f541` unless a later landing changes that tracked input, in which case stop and ask. Keep `UNKNOWN_OPEN` and the four authority flags false.

**Readiness projections.** `pm-plan-index.py validate` currently passes, so the committed node-readiness report is not a stale artifact at this HEAD. Phase 2 still regenerates it after the new currentness edition, because that edition is an input. Restore other index JSON only after proving the only difference is `generated_at_utc`. If any other field differs, stop and report. Generate buildability after the first index generation and keep those bytes through the final cycle. The previous reseals leave buildability one generation behind its node-readiness pin and report that one residual.

**Run 002.** 41 `stale_batch_report_sha256_after`, one `complete_final_summary_live_plan_unit_count_stale` (7,095 recorded, 7,129 live), one `doc_count_mismatch` (72 versus 96), and one `inventory_doc_set_mismatch`. The refresh pair is what cleared the stale batch hashes and the stale live-unit count on 2026-10-11, leaving the two structural findings. Phase 2 confirms the after-count. It does not repair the historical document set and does not pass `--seal-state postseal`.

**Current run.** `pds-20261015-001-current-planunit-snapshot` validates with zero findings. The reseal does not rewrite it. The post-push follow-up allocates the next free `pds-<execution-date>-NNN-current-planunit-snapshot` and passes that id to `snapshot-current`. Do not reserve `pds-20261015-002` now; Q19 or another Plans landing may take the next id first.

**DL-188 pins.** `Plans/.implementation_readiness/pnc019_certification_receipt.json` has 14 `source_hashes`. These two match live bytes:

```text
Plans/event_family_registry.json
  4ffde4e80c0671c7240c65b7903e6cabc0c6112bc88afc3fc2faca2a044370fe
Plans/event_payloads/workspace_layout_changed_v2.schema.json
  5d486daf7af60d2e8e487a3102a1d4200fdbd66465839578d96640d1405b04f1
```

The receipt is backed up and then left byte-identical. It is not in `applied_to`.

### What stays reported

A reseal does not repair these. They are canon, historical certification, fixture, or raw-capture findings:

| Kind | Count | Where measured |
|---|---:|---|
| `unresolved_local_ref` | 1,240 | run-gates `validate_prd_planning_runtime_contracts` |
| `audit_closure_validator_error` | 201 | run-gates `validate_audit_closure` (no complete export; the subcheck total is 201) |
| `pnc019_source_hash_stale` | 16 | readiness report |
| `raw_capture_manifest_entry_not_in_verifier_file_set` | 16 | `json-syntax.json`, under `tests/agent_packet_restrictions` |
| `raw_capture_mode_census_mismatch` | 1 | `tests/fixtures/governance/raw_evidence_capture_modes.json` |
| PM7 GUI fixture findings | 3 | `forbidden_context_compaction_event_family`, `missing_pm7_valid_command_fixtures`, `missing_pm7_invalid_command_fixtures` |
| `event_denominator_unresolved` | 2 | readiness |
| `event_family_contract_depth_unresolved` | 2 | readiness |
| `doc_count_mismatch` | 1 | run 002, 72 versus 96 |
| `inventory_doc_set_mismatch` | 1 | run 002 |
| `event_legacy_fixture_root_mismatch` | 1 | readiness, fixture revision `2026-08-27.1` versus live `2026-10-09.1` |
| `implementation_readiness_self_tests_failed` | 1 | readiness |
| `buildability_gate_report_stale_or_not_canonical` | 1 | expected to remain as the one-generation cycle residual |

The 16 certification-source rows name `Plans/event_record.schema.json`, `storage_recovery_contracts.schema.json`, `storage_value_registry.schema.json`, `storage_value_registry.json`, `Plan_To_Node_Compilation.md`, `Planning_Wizard.md`, `Executor_Protocol.md`, `Goal_Runtime_System.md`, `Orchestrator_Page.md`, `Automated_Testing_System.md`, `UI_Command_Catalog.md`, `Wiring_Matrix.production.json`, `UI_Wiring_Rules.md`, `scripts/pm-pnc019-certification-harness.py`, `scripts/pm_pnc019_currentness.py`, and the currentness `VALIDATOR_RECEIPT.json`. Five of those have `actual: null` because the receipt has no hash for that source. Refreshing the two checkpoint pins that already match does not recertify this set.

Run-gates total 3,046 and audit-governance total 3,029 match the follow-up landing check at `ab4d17c056`. They are the current absolute totals, not a delta from the baseline recorded at `386c792b2c` (3,048 and 3,031).

Applying the 2026-10-11 pair's effect to today's kinds would clear the 11 lock rows, 744 evidence rows, 744 graph rows, 19 currentness source-drift rows, 41 stale batch hashes, and the one stale live-unit count, and would leave the table above plus the buildability residual. That is a projection for the reviewer, not a measured after-state. Phase 2 records the actual after-counts.

## Phase 2 commands and order

Run only after the GO mail has been read and matched to the prerequisite table, including a main that contains Q19 Plans pass 2. Fetch and rebase first. If any inventoried source, shard, or index changed, rebuild from that main. The branch may contain this plan commit; do not label its HEAD as main. Preparation uses this full worktree. Shared-checkout mutation is reserved for landing.

```bash
RESEAL_EVIDENCE=/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261015
RESEAL_BUNDLE=Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29
RESEAL_RUN002=Plans/.plan_migration/pds-20260611-002-atomize-planunits
RESEAL_CURRENTNESS=Plans/.audits/event-authority-2026-08-13-currentness
```

1. **Inputs and backup.** Recopy the ignored inputs listed above with `rsync -a --no-perms --no-owner --no-group`. Symlink the resize audit to the shared checkout. Symlink `tests/agent_packet_restrictions` to the resolved shared target. Confirm a full checkout and a clean status. Back up Spec Lock, auto-decisions, the node-readiness report, and the PNC-019 receipt; tar the evidence tree, the readiness directory, and run 002; copy all 15 shared currentness files. Record SHA-256 manifests before any overwrite. Keep helpers and transcripts under `$RESEAL_EVIDENCE/phase2/`, not in the repository.

2. **Measure, then confirm pins.** Run `run-gates`, `audit-governance`, readiness validate, run 002 validate, and current-run validate into `$RESEAL_EVIDENCE/phase2/before/`, with `--subcheck-timeout-seconds 600` on the aggregate and migration commands. Recompute the two DL-188 pins. A mismatch stops the reseal. Do not apply the 2026-10-11 pin helper.

3. **First currentness generation.** Write an evidence map whose only mapping is logical root `Plans/.audits/event-authority-2026-08-13-currentness` to the shared checkout's existing edition. The file schema is `pm.external_evidence_locations.v1` with `mappings` of `{logical_root, physical_root}`. Pass it only on generate:

   ```bash
   PM_EVIDENCE_MAP="$RESEAL_EVIDENCE/phase2/evidence-map.json" \
     python3 scripts/pm-event-authority-currentness.py generate \
     --outdir "$RESEAL_EVIDENCE/phase2/currentness-edition-1"
   ```

   Copy the seven generated files into the local ignored edition. Validate with no map and no `--outdir`, so the command reads that local copy. Preserve frozen files, `UNKNOWN_OPEN`, and the four authority flags false.

4. **Readiness projections and run 002.**

   ```bash
   python3 scripts/pm-plan-index.py generate
   python3 scripts/pm-plan-index.py validate
   python3 scripts/pm-implementation-readiness.py generate
   python3 scripts/pm-plan-migration.py refresh-batch-hashes --run-dir "$RESEAL_RUN002"
   python3 scripts/pm-plan-migration.py refresh-final-summary --run-dir "$RESEAL_RUN002" --seal-state preseal
   python3 scripts/pm-plan-migration.py validate --run-dir "$RESEAL_RUN002"
   ```

   After index generation, restore non-node JSON that differs only in `generated_at_utc`. Save the first buildability bytes. Do not pass `--write-report`, `--ledger-id`, or `--seal-state postseal`.

5. **Live evidence and graph.**

   ```bash
   python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json --report "$RESEAL_BUNDLE/shard_report.json"
   python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json --report "$RESEAL_BUNDLE/shard-check-report.json"
   python3 scripts/pm-governance-seal.py sync-plan-sharding-evidence --evidence "$RESEAL_BUNDLE/evidence.json" --report "$RESEAL_BUNDLE/shard_report.json"
   python3 scripts/pm-governance-seal.py refresh \
     --evidence "$RESEAL_BUNDLE/evidence.json" \
     --plan-index-details '<actual main base, PlanUnit and acceptance counts, blocked runtime>' \
     --command-excerpt '<existing command string>|||<actual successful output>' \
     --check-detail 'governance-reseal-2026-10-15|||<assigned reseal scope, valid currentness, false authority flags, receipt unchanged>'
   python3 scripts/pm-plans-verify.py validate-evidence
   python3 scripts/pm-plans-verify.py validate-plan-graph
   ```

   If shard bodies or paths change, stop. Do not use `register-canonical-docs`, `--register-file`, or `--schema-version`. Supply command excerpts from this run. Leave historical `plan-shard-generate` text unchanged. Graph validation must pass without a graph edit.

6. **One decision row, then Spec Lock.** Append exactly one row through an external helper that calls `upsert_auto_decision` in `scripts/pm-governance-seal.py`. Then:

   ```bash
   python3 scripts/pm-plans-verify.py validate-auto-decisions
   python3 scripts/pm-governance-seal.py refresh --spec-lock Plans/Spec_Lock.json
   python3 scripts/pm-plans-verify.py verify-spec-lock
   ```

7. **Final currentness and node readiness.** Generate into a new empty `currentness-edition-final` directory with the same inline map. Copy the same seven files into the local ignored edition and validate without the map. Assert final Spec Lock and live-bundle hashes equal the inventory pins. Assert the receipt is byte-identical to its backup. Assert frozen inputs and the quarantine ledger and group manifest equal the backup. Run `pm-plan-index.py generate` and `validate` again. Retain the first buildability report. Report the one-step-behind node-readiness pin rather than regenerating buildability in a loop.

8. **Final checks, commit, push.** Run shard check, index validate, Spec Lock verify, auto-decision validate, evidence validate, graph validate, and currentness validate. Run `pm-plans-verify.py run-gates --report "$RESEAL_EVIDENCE/phase2/after/run-gates.json" --subcheck-timeout-seconds 600` and the same bound for `audit-governance`. Validate run 002 and the pointer-named current run without `--write-report`. Compare failures with the before outputs. Commit only the changed governance paths and the compact `reports/governance-reseal-20261015/` execution records. Push `plans/governance-reseal-20261015`. Remove the local currentness copy after the final local gates so the landing checker can see the shared old edition.

## The one auto_decisions row

`Plans/auto_decisions.jsonl` has 214 rows at this HEAD. `dec-2026-10-15-governance-reseal` is absent. Check again immediately before apply. `upsert_auto_decision` writes `timestamp_utc` and `inputs_hash`; do not hand-write either. The object it appends is:

```json
{
  "schema_id": "pm.auto_decisions.schema.v1",
  "decision_id": "dec-2026-10-15-governance-reseal",
  "timestamp_utc": "<utc_now() inside upsert_auto_decision>",
  "scope": "plans.governance.reseal_repository_wide",
  "inputs_hash": "<sha256 of the sorted payload of decision_id, scope, decision, rationale, applied_to, contract_refs, and artifact_hashes of applied_to, taken before the Spec Lock refresh>",
  "decision": "reseal_spec_lock_live_evidence_readiness_run002_and_currentness_at_main_<10-hex-frozen-main>_without_certification_runtime_or_receipt_rewrite",
  "rationale": "Jared assigned the 2026-10-15 governance reseal; coordinator home-redesign-planner authorized Phase 2 in <go-mail-id>. Previous seal f2f61a803a92 and snapshot/baseline 2f91e7a6228e. Plans landings since that seal are no-pills f8a9f64e60 with follow-up e254a56477 and the PM7 canon stack through 386c792b2c with follow-up 611563296a. Phase 2 base is <frozen-main>, after the prerequisite concept landings and Q19 Plans pass 2. The reseal refreshes Spec Lock, the live-current bundle pm7-usage-recovery-plan-sharding-2026-08-29, buildability and node readiness, run 002 batch hashes and preseal final summary, and the ignored currentness edition written in place after the first checked main push. The 2026-10-11 registry pin 4ffde4e80c0671c7240c65b7903e6cabc0c6112bc88afc3fc2faca2a044370fe and workspace-layout v2 payload pin 5d486daf7af60d2e8e487a3102a1d4200fdbd66465839578d96640d1405b04f1 still match live bytes, so the PNC-019 receipt is not rewritten and the certification harness is not run. Frozen 252-row custody stays byte-identical. Denominator, depth, runtime, and buildability stay closed.",
  "applied_to": [
    "Plans/Spec_Lock.json",
    "Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json",
    "Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/shard_report.json",
    "Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/shard-check-report.json",
    "Plans/.implementation_readiness/buildability_gate_report.json",
    "Plans/.plan_index/node_readiness_report.json",
    "Plans/.plan_migration/pds-20260611-002-atomize-planunits/batch_report.jsonl",
    "Plans/.plan_migration/pds-20260611-002-atomize-planunits/final_validation_summary.json"
  ],
  "contract_refs": [
    "PolicyRule:Decision_Policy.md#spec-lock-update-protocol",
    "ContractName:Plans/Decision_Log.md#DL-039",
    "ContractName:Plans/Decision_Log.md#DL-067",
    "SchemaID:pm.auto_decisions.schema.v1"
  ]
}
```

Substitute the frozen main, the GO mail id, and any prerequisite SHA that landed after this plan. Do not stamp `f402a3e123`. DL-188 is omitted from `contract_refs` because this reseal does not apply a receipt change. If the pins have drifted by GO, stop instead of adding that contract ref in order to make the row fit.

## Landing, follow-up, and cleanup

1. Acquire `/mnt/Cursor/PuppetMaster-Evidence/scratch/landing-lock/held` with `mkdir` before the landing fetch. Write `reseal-20261015`, branch `plans/governance-reseal-20261015`, and UTC time to `holder.txt`. If the directory exists and is older than 90 minutes, read `holder.txt` and clear it; otherwise wait five minutes and retry. Hold the lock through both main pushes, the currentness write, the snapshot/baseline follow-up, worktree removal, and only then release it.
2. Fetch and rebase. Re-read cited owner passages. If a locked or inventoried source changed, rebuild. Run the shard check in this worktree first.
3. Push the branch. In `/mnt/Cursor/PuppetMaster`, fetch it and compare uncommitted paths with the branch diff. Overlap means stop and hand off. Keep all 15 shared currentness files unchanged. Fast-forward main. Run the shard check. Before pushing main, run the landing check against the old edition:

   ```bash
   python3 scripts/pm-landing-check.py --base origin/main \
     --readiness-audit-root /mnt/Cursor/PuppetMaster/Plans/.audits/event-authority-2026-08-13-currentness \
     --keep-check-reports "$RESEAL_EVIDENCE/phase2/landing/check-reports" \
     --json
   ```

   On a failed unpushed landing, `git reset --keep origin/main` in the shared checkout. Do not use `--hard` there.
4. Apply the landing verdict rules. Exit 2 or 3 stops the landing. Exit 1 requires reading the staleness, pre-existing, and off-branch findings and rerunning any timed-out subcheck. Do not refresh the baseline to pass this landing. Push main in the same lock hold.
5. After that push, recheck the old edition against the locked backup. The new in-place helper replaces only the seven generated files. From the shared checkout, with no evidence map:

   ```bash
   python3 scripts/pm-event-authority-currentness.py validate
   python3 scripts/pm-implementation-readiness.py validate
   ```

   The readiness command has no `--readiness-audit-root` flag; running it in the shared checkout selects that tree. Record the exact remaining readiness rows. A failed write restores the backed-up edition and reports the incomplete follow-up. Do not roll back the already pushed main.
6. Still holding the lock, use a full local worktree at the pushed reseal SHA. Its ignored currentness directory is absent, or it resolves to the shared edition. Read `current_run.json` and count direct `Plans/*.md` at that main. Then:

   ```bash
   python3 scripts/pm-plan-migration.py snapshot-current \
     --run-id '<next-free-id>' \
     --expected-doc-count '<actual-direct-doc-count>' \
     --supersedes-run-id '<then-current-run-id>'
   python3 scripts/pm-landing-check.py --record-baseline \
     --readiness-audit-root /mnt/Cursor/PuppetMaster/Plans/.audits/event-authority-2026-08-13-currentness \
     --keep-check-reports "$RESEAL_EVIDENCE/phase2/landing/baseline-check-reports" \
     --json
   ```

   All three snapshot arguments are required. Baseline recording must finish with no timed-out subcheck, name the pushed reseal main, and bind all 15 currentness files by bytes. Commit the new snapshot, pointer, supersession effects, baseline, and compact baseline record as one follow-up. Fast-forward, shard-check, and landing-check that follow-up before the second main push.
7. Mail `home-redesign-planner` both SHAs and the residual findings. Remove this worktree with `git -C ~/src/PuppetMaster worktree remove`, delete the landed local branch, and release the lock only after that.

## Risks

- Q19 and any Plans commit on the in-flight concept branches will change the stale set. Sealing `f402a3e123` after those land would pin the wrong bytes. GO without those landings is not this plan's start condition.
- A local currentness directory that differs from the baseline-bound edition makes the landing check exit 3. Remove the preparation copy before the first check. Do not point `--readiness-audit-root` at a different real directory that happens to have the same bytes; the checker still treats a different resolved path as a mismatch when a local directory exists.
- Reusing the 2026-10-11 in-place helper would demand that reseal's hashes and holder. A new helper uses this run's manifests.
- `cp -a` fails on permission preservation on this filesystem. Byte-compare the rsync copy with the shared edition before trusting it.
- Run 002's two structural findings survive a correct pair. Treating them as a failed reseal and repairing the 2026-06-11 document set would be an out-of-scope canon edit.
- Registering the new PM7 companions in Spec Lock, or bumping a schema version, is an owner change. The refresh command can do either if those flags are passed. Phase 2 does not pass them.
- The node-readiness report validates today. Regenerating it is still required after the new currentness edition. A timestamp-only restore rule that also restores the node report would drop that edition's findings.
- The first landing check compares against the baseline recorded at the pre-reseal main. Refreshing that baseline before the push would hide the reseal's own staleness. The follow-up `--record-baseline` runs only after the first push and the in-place currentness write.

## Out of scope

Canonical owner prose, `Concepts/**`, historical evidence bundles, shard bodies except through the generators, validators, the PNC-019 receipt, the certification harness, WorkNodes, and NodeSeeds. The inherited findings in the table above stay reported. The current snapshot run stays untouched until the ordinary post-push follow-up. No baseline is refreshed to make the pending reseal pass.
