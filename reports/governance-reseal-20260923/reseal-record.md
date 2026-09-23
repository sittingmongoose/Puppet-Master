# Governance reseal, 2026-09-23

This is a repository-wide reseal at `main` `2da97421a1`. The previous seal was `fcd2bb25f4` on 2026-09-07. Jared designated the DL-039 takeover agent for it and set the scope himself:

- `Plans/Spec_Lock.json`
- `Plans/.evidence/**`
- the readiness artifacts
- one row in `Plans/auto_decisions.jsonl`
- the refresh pair on migration run 002
- the Event Authority currentness edition, written in place

Nothing else. All other landings were held while the reseal was in flight.

## What was backed up first

Everything the reseal could overwrite was copied to `/mnt/Cursor/PuppetMaster-Evidence/reseal-20260923/pre-reseal/` before any change: Spec Lock, `auto_decisions.jsonl`, the full `Plans/.evidence` tree, `Plans/.implementation_readiness`, migration run 002, and the ignored currentness edition (15 files, verified byte-identical). Manifest: `pre-reseal/SHA256SUMS`, SHA-256 `30466bdac8b146bd40a43929c7001c0ca9c6786147bc20ad608f42ee38e76c73`.

## What the reseal attests

Of the 94 files Spec Lock locks, **35 changed since the 2026-09-07 seal**. `attestation.json` beside this record lists every one, with its hash at the previous seal, its hash now, and every commit that changed it since `fcd2bb25f4`, taken from git history.

- **Plans documents:** 00-plans-index, Automated_Testing_System, Bootstrap_Planning_Migration, Commands_System, Contracts_V0, Crosswalk, Executor_Protocol, FinalGUISpec, Glossary, Goal_Runtime_System, Models_System, Plan_To_Node_Compilation, Planning_Ledger_System, Planning_Wizard, Release_Supply_Chain, UI_Command_Catalog, UI_Wiring_Rules, Wiring_Matrix, assistant-chat-design, orchestrator-subagent-integration, storage-plan and usage-feature.
- **Registries and schemas:** `storage_value_registry.json` and its schema, `Wiring_Matrix.schema.json`, `plans_to_code_handoff.schema.json`, `shared_runtime_contracts.schema.json` and `sharding_config.json`.
- **Scripts:** the readiness, plan-index, plans-verify, shard, storage-materialize and PNC-019 currentness scripts.
- **Readiness:** the buildability report.

## What was done, in order

1. **Currentness edition.**
   - Regenerated from live sources into an empty external directory, then written in place over the seven generated files in `Plans/.audits/event-authority-2026-08-13-currentness/`.
   - The frozen inputs were untouched: `EXPECTED_252_EVENT_TYPES.tsv` (SHA-256 `d59142bc…f5c541`) and the seven source groups.
   - The 252-row quarantine ledger and the group manifest are byte-identical to the previous edition.
   - The status stays `UNKNOWN_OPEN`, with closed, denominator-known, depth-complete and build/PNC-019 authority all false.
   - The live registry recorded is `0be54418…5c842`, 42 families at `2026-09-11.2`, matching the approved checkpoint.
   - Discovery grew from 234 to 245 sources and from 3,238 to 3,468 lexical occurrences. These are discovery queues, not adjudications.
   - The edition was generated last, so it pins the final Spec Lock. It validates with `evidence_valid: true` and `event_authority_closed: false`. Final manifest: `currentness-edition-final.SHA256SUMS`, SHA-256 `19b3d4e4…a1adc`.
2. **Readiness projections.** The buildability report and node-readiness report were regenerated.
3. **Migration run 002.** `refresh-batch-hashes` and `refresh-final-summary` took validation from 182 failures to 2. The two left are the pre-existing structural `doc_count_mismatch` and `inventory_doc_set_mismatch`, which no hash refresh can fix.
4. **Live evidence bundle.** This is `pm7-usage-recovery-plan-sharding-2026-08-29`, the only `live_current` bundle. Its shard reports were regenerated (99 documents, 2,719 shards, no mismatches) and its artifact list re-synced (3,019 artifacts). It records the reseal check. The 21 historical-snapshot bundles are immutable, and the tool refuses to change them.
5. **Decision row.** One `auto_decisions.jsonl` row: `dec-2026-09-23-dl039-governance-reseal`.
6. **Spec Lock.** Refreshed, and `verify-spec-lock` now passes with no failures, down from 35.

## Gates after the reseal (worktree)

25 pass and 11 fail. Against `2da97421a1`:

- **Now pass:** `verify_spec_lock` (was 35), `validate_evidence` (was 1,584) and `validate_plan_graph` (was 1,584).
- **Lower:** `validate_plan_migration`, from 182 to the 2 structural failures above.
- **Unchanged and still failing:** audit closure, browser, GitHub and testing-session admission gates, PM7 GUI fixtures, PRD runtime contracts, and readiness. Readiness is down from 178 to 73.
- **Worktree artifacts:** `json_syntax`, `lint_contractrefs` and `validate_audit_status_index` fail only in the fresh worktree. They need ignored inputs that exist only in the shared checkout: the `tests/agent_packet_restrictions` evidence symlink and ignored `Plans/.audits/*` reports. They were clean in the shared checkout before the reseal, and the landing check runs there.

## One residual the reseal cannot remove

The governance artifacts form a cycle: Spec Lock pins the buildability report, the buildability report pins the node-readiness report, the node-readiness report records currentness findings, and the currentness edition inventories Spec Lock. One artifact must be left one step behind.

I left it at the buildability report: it is stale only against the regenerated node-readiness hash, and shows as one `buildability_gate_report_stale_or_not_canonical` row inside the readiness gate, which fails on denominator and depth anyway. The alternatives would leave Spec Lock unverified or put a currentness drift on Spec Lock itself.

## Deliberately not done

- The PNC-019 certification harness was **not** rerun. The existing July receipt reads `status: pass`, and a rerun would issue a new certification, which DL-039 forbids until denominator and depth are complete. Its 17 `pnc019_source_hash_stale` rows stay reported.
- No validator, registry, canonical prose or other thread's file was changed.
- No denominator, depth, runtime, buildability or PNC-019 claim follows from this reseal.

## Afterwards

The landing-check baseline is re-recorded from a full run against the resealed `main` in a full checkout, and committed with the commit it was taken at, as a separate landing.

## Correction to an earlier report

`reports/event-authority-20260911/card-answers-dl068-075-20260923.md` said the Step 9 interaction and extensions card files needed a separate status check. They do not. The interaction lane's two cards were answered and applied earlier (DL-041, and DL-042 with TDR-012), and the extensions review found no product card justified. The eight answered cards were the complete set.

Raw outputs are in `/mnt/Cursor/PuppetMaster-Evidence/reseal-20260923/`; manifest `SHA256SUMS` there.

Cost: one session; seal loop, two currentness generations, readiness and index fixpoint, and one full gate run; monetary attribution unavailable.
