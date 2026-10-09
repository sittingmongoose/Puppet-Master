# Governance reseal, 2026-10-09

This is a repository-wide reseal at `main` `806941ca04`. The previous seal was `c2f98fd9ea` on 2026-09-29, and 394 commits have landed since. They include the NieR Mode settings rows, DL-138 (wand decisions), DL-139 (Skia-only desktop and the Leptos web client), DL-140 to DL-144 (the assistant chat's neon icons and NieR Mode), DL-145 to DL-151 (the 5.6 Pro chat's sixteen tweaks) and DL-152 (NieR onboarding).

Jared assigned this session (T3 thread `2ef30239`) to the reseal in chat on 2026-10-09. There is no standing Plans agent: the same landing reworded the rule to say so (`e4b4cbca59`), and a reseal is now a task Jared assigns. The scope is the one the 2026-09-29 record names:

- `Plans/Spec_Lock.json`
- `Plans/.evidence/**`, which in practice means the one live bundle
- the readiness artifacts
- one row in `Plans/auto_decisions.jsonl`
- the `refresh-batch-hashes` and `refresh-final-summary` pair on migration run 002
- the Event Authority currentness edition, prepared outside the repository and written in place at landing

Nothing else is in scope. The procedure is the 2026-09-29 one, repeated step for step. The exact commands were rebuilt from the scripts' argument parsers and the earlier outputs, because the earlier records name the steps but not every command line.

## Which migration run

The refresh pair ran on run 002 (`pds-20260611-002-atomize-planunits`) only, the run `validate_plan_migration` in `run-gates` and `plan_migration` in `audit-governance` validate (`DEFAULT_PLAN_MIGRATION_RUN`). The current run named in `current_run.json` is `pds-20261009-003-current-planunit-snapshot`. Since 2026-09-30 every landing that touches `Plans/` refreshes that run with `snapshot-current`, so it validates with 0 failures before and after, and the reseal did not touch it.

## What was backed up first

Everything the reseal could overwrite was copied to `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261009/backup/` before any change: Spec Lock, `auto_decisions.jsonl` and the node-readiness report; the `Plans/.evidence` tree, `Plans/.implementation_readiness` and migration run 002, each as a tar; and the shared checkout's ignored currentness edition. The edition's 15 files are byte-identical to the in-place directory, and their manifest hashes to `cab64d79…598f6`, the in-place manifest the 2026-09-29 landing recorded. The backup manifest `backup/SHA256SUMS` has SHA-256 `d7edbca5c473f347516e43ccb998ea7675e68a7169a4bbcd41cbd9dce38c7ac9`.

## What the reseal attests

Of the 94 files Spec Lock locks, **18 changed since the 2026-09-29 seal**. `attestation.json` beside this record lists each one with its hash at the previous seal, its hash now and every commit that changed it since `c2f98fd9ea`; 15 distinct commits touched them.

- **Plans documents (15):** 00-plans-index, Automated_Testing_System, Commands_System, Contracts_V0, DRY_Rules, Executor_Protocol, FinalGUISpec, Goal_Runtime_System, Planning_Wizard, Release_Supply_Chain, UI_Command_Catalog, Wiring_Matrix, assistant-chat-design, storage-plan and usage-feature. FinalGUISpec has the most commits (12), then 00-plans-index (8).
- **Registry:** `storage_value_registry.json`.
- **Script:** `pm-implementation-readiness.py`.
- **Readiness:** the buildability report. No commit changed it after the previous seal; this reseal regenerated it, and its attestation entry says so.

## What was done, in order

1. **Currentness edition, first generation**, from live sources into an empty external directory (`currentness-edition-1`) through the same evidence-location map, then copied into the worktree's ignored edition only. It validates with `evidence_valid: true` and all 14 checks true.
2. **Readiness projections.** The node-readiness report was regenerated, then the buildability report. The other generated index files changed only in `generated_at_utc` and were restored. The plan index validates: 6,963 PlanUnits and 27,304 acceptance units. `main`'s node-readiness report had been generated without the ignored edition; the regenerated one reads it, as on 2026-09-29.
3. **Migration run 002.** `refresh-batch-hashes`, then `refresh-final-summary` with the default `preseal` state. Validation went from 74 failures to 2: `doc_count_mismatch` and `inventory_doc_set_mismatch`, which no hash refresh can fix.
4. **Live evidence bundle** `pm7-usage-recovery-plan-sharding-2026-08-29`, still the only `live_current` bundle. Its shard reports were regenerated (99 documents, 2,797 shards, no shard file changed), its artifact list re-synced from 3,088 to 3,097, and it was refreshed with the plan-index details, the three command excerpts (updated in place) and a `governance-reseal-2026-10-09` check worded for an assigned agent rather than a Plans agent. `validate-evidence` passes.
5. **Decision row** `dec-2026-10-09-governance-reseal`, written with `upsert_auto_decision` from `scripts/pm-governance-seal.py` before the Spec Lock refresh, so its `inputs_hash` covers the artifacts as they are pinned. `validate-auto-decisions` passes.
6. **Spec Lock.** 18 hashes were refreshed: the 17 stale entries plus the regenerated buildability report. `verify-spec-lock` passes, down from 17.
7. **Currentness edition, final generation**, last, so it pins the final Spec Lock and live bundle (both read pinned equal to live).
   - The frozen inputs are untouched: `EXPECTED_252_EVENT_TYPES.tsv` (SHA-256 `d59142bc…f5c541`) and the seven source groups. The 252-row quarantine ledger and the group manifest are byte-identical to the previous edition.
   - The status stays `UNKNOWN_OPEN`, with closed, denominator-known, depth-complete and build/PNC-019 authority all false.
   - The live registry is unchanged since the last reseal: `4227be36…c3e70`, 43 families at `2026-09-25.1`.
   - Sources: 251, as last time (96 direct Plans documents, 155 registered machine inputs).
   - Discovery: 3,594 tokens (unchanged) and 9,431 occurrences (from 9,419). Contested tokens went from 12 to 13; the minimum owner queue reads 87; ambiguous tokens 285 (unchanged). These are discovery queues, not adjudications.
   - Manifest `currentness-edition-final.SHA256SUMS`, SHA-256 `66074083f776be22d0288a2fab904462d5d9568f99e8ca3eef96f3ff6a8bfe75`.
8. **Node readiness, regenerated once more** against the final edition; the plan index validates (6,963 PlanUnits, 27,304 acceptance units, node readiness `blocked_runtime_certification_incomplete`, runtime not enabled).
9. **In place.** This session did not write the shared checkout's ignored `Plans/.audits/event-authority-2026-08-13-currentness/` while preparing the reseal. The landing writes the final edition over its seven generated files under the landing lock, immediately before the fast-forward, with `in-place-write.sh` in the evidence directory, after its `check` confirms the in-place edition is still the 2026-09-29 one. The script was tested on a copy (check, write, check, restore).

## Gates after the reseal (worktree)

The worktree is a full local checkout with the ignored inputs the checks open, copied from the shared checkout. Every input-sensitive subcheck passes (`lint_contractrefs`, `validate_web_capability_contracts`, `validate_audit_status_index`), except `json_syntax`, which reports the same 17 raw-capture rows as the shared checkout's own landing checks and is outside the reseal's scope.

| Check | Before, `main` `806941ca04` | After |
|---|---:|---:|
| `verify_spec_lock` | 17 | 0, pass |
| `validate_evidence` | 1,536 | 0, pass |
| `validate_plan_graph` | 1,536 | 0, pass |
| `validate_plan_migration` (run 002) | 74 | 2 |
| `validate_implementation_readiness` | 66 | 24 |
| `validate_audit_closure` | 201 | 201 |
| `validate_pm7_gui_fixtures` | 3 | 3 |
| `validate_prd_planning_runtime_contracts` | 1,240 | 1,240 |
| `json_syntax` | 17 | 17 |
| **run-gates total** | **4,690; 27 pass, 9 fail** | **1,487; 30 pass, 6 fail** |
| current run `pds-20261009-003` validate | 0 | 0, report byte-identical |

The after column matches the 2026-09-29 reseal's (1,470; 31 pass, 5 fail) except for `json_syntax`'s 17 rows, which appeared after that reseal and are not governance staleness.

The 66 readiness rows before were 38 `event_authority_currentness_source_drift` (sources changed since the last edition), 2 `storage_value_registry_spec_lock_hash_stale`, 1 `event_record_spec_lock_hash_stale` and 1 `non_executable_closure_spec_lock_hash_stale`, plus the 24 kinds that remain. The 24 left are the same kinds as last time: 17 `pnc019_source_hash_stale` (the PNC-019 receipt is not reissued), 2 `event_denominator_unresolved`, 2 `event_family_contract_depth_unresolved`, 1 `buildability_gate_report_stale_or_not_canonical` (the residual below), 1 `event_legacy_fixture_root_mismatch` and the pre-existing `implementation_readiness_self_tests_failed`.

## One residual the reseal cannot remove

The governance artifacts form a cycle: Spec Lock pins the buildability report, which pins the node-readiness report, which records the currentness findings, and the currentness edition inventories Spec Lock and the live bundle. One artifact must be left one step behind; as in the last three reseals it is the buildability report. A trial regeneration, reverted from the saved step-2 bytes afterwards, confirmed it differs only in its node-readiness pin (`3c89ee2e…` → `02c2cb88…`). After the revert the report equals its Spec Lock pin. It shows as one `buildability_gate_report_stale_or_not_canonical` row inside the readiness gate, which fails on denominator and depth anyway.

## Deliberately not done

- The PNC-019 certification harness was **not** rerun (DL-039); its 17 `pnc019_source_hash_stale` rows stay reported.
- The current snapshot run was not refreshed by the reseal; the landing's follow-up refreshes it, as every `Plans/` landing does.
- The shared checkout's ignored edition was not written, and `main`, the landing lock and the landing baseline were not touched while preparing. The in-place write and the baseline re-record belong to the landing.
- No validator, registry, canonical prose or other thread's file was changed. The live bundle's `plan-shard-generate` check still reads "98 documents; 2138 shards", as last time; it is not a gate input.
- No denominator, depth, runtime, buildability or PNC-019 claim follows from this reseal.

## Process note

The worktree (`~/pm-worktrees/governance-reseal-20261009`, a full local checkout) received only the ignored inputs the last record lists: the currentness edition, copied; `audit-20260828-002` and `audit-20260828-003`, copied; `FINAL_REPORT.md` for `audit-20260827-001`, `audit-20260828-001` and `audit-20260829-001`, plus the `audit_report.json` of `audit-20260829-001` that `Plans/00-plans-index.md` cites; a link for `audit-20260830-001`; the three ignored `event-authority-2026-08-12` files; and the `tests/agent_packet_restrictions` link. That came to 149 MB under `Plans/.audits`. The helpers (`decision-row.py`, `attestation.py`, `in-place-write.sh`, `gate-summary.py`) live in the evidence directory, never in the worktree; `decision-row.py` refuses to run without `--apply` and ran once. No incident occurred.

## Afterwards

Under the rule since 2026-09-30, the landing agent refreshes the current snapshot with `snapshot-current` and re-records the landing-check baseline from a full run against the resealed `main`, committed together as a separate commit and landed under the same landing lock.

Raw outputs are in `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261009/`; the manifest is `SHA256SUMS` there, and `STATUS.md` is the progress log.
