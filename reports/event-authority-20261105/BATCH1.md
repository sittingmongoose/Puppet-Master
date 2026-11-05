# Event Authority batch 1 — nine branches rebased after stream C, 2026-11-05

**Status: STOPPED_BASE_MOVED_DURING_DRY_CHECK — main moved outside Concepts; no branch push. Lead reviews and landing remain separate.**

Destination: `plans/ea-batch1-20261105`. Base: `57c28f706e10dd9f7c6b13ed5e962de74e9a6ea5`. Verified content head: `1350d130d32538b76b013e6fd59e935b9d656992`. Report-parent head: `1350d130d32538b76b013e6fd59e935b9d656992`. The final local report-only head is preserved in `BATCH1-rebased-on-57c28f706e-local.bundle`; its SHA and bundle hash are in external `delivery.json`. The remote branch remains at `673b7d7a17a51d3b1aefd5e04e3d65e25c8c4e5d`.

Starting bundle head: `6bd5c396c75dea250e21c030f87ba09636f8842e`, based on `73f2231a9ec1c93190adafcdde51030f028c8c2d`. `git bundle verify` passed and that head was fetched from the named bundle. The old report is preserved at `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/BATCH1-nine-on-73f2231.md` (SHA-256 `222d44b5e2237b54160d35d133590f42ade1f6dce0bb4139d1a1fcec976d127e`).

Full local worktree: `/home/sittingmongoose/pm-worktrees/ea-batch1-rebase`, created from the VM clone after fetching origin. Initial free disk: 114 GB; available RAM: 11 GB. One generator or checker ran at a time, with the requested below-6 GB pause / 7 GB resume guard. No memory pause was needed.

## Replay and conflicts

All 44 retained commits preserve their original messages, authors and author dates. This includes 38 lane commits, three existing integration follow-ups and three prior delivery reports. Only standalone regeneration commits `bd0b2092a490d62f5f41f6143e0ecbb3390cb9e3` and `35ef9609e415118c1112aa123475f731ea8c0906` were dropped. Their paths, and derived paths embedded in lane commits, were excluded from source replay and regenerated fresh at the end.

Replay used each retained commit’s binary source patch with Git’s three-way application, then `git commit -C` with the original metadata. No source path changed by stream C intersects the batch’s source-path set. **Source/owner conflicts: 0 files, 0 hunks.** There was no owner choice to adjudicate. Stream C’s changed owner text, closure re-audit code, audit records, sealed ledgers 0627/0630 and PLS-025 remain byte-identical to the base. Generated files were not hand-merged.

| Input branch | Reviewed head | Replayed inclusive range | Commits | Conflicts |
|---|---|---|---:|---:|
| `plans/ea-s09-decisions-hb-scope-20261104` | `8724fcea67936ca08d55de237f55c2745eed459e` | `b3dcb7763f..5686f5ba7a` | 9 | 0 |
| `plans/ea-cards1-answers-20261104` | `b6332f391a7870bad5f01a29a7e9d080050dac27` | `c961554cd3..c961554cd3` | 1 | 0 |
| `plans/ea-dl087-088-retirements-20261104` | `b4ef60f0a9610a7fa64fc1e9f44674f20f31d876` | `f4a7459b12..d785124727` | 5 | 0 |
| `plans/ea-storage-retention-20261104` | `4d52bd2758526cd0e8a56358baaa73049c1d4bdd` | `69cb7e0c61..7d21735de7` | 7 | 0 |
| `plans/ea-retention-cards1-20261104` | `2663667e14346235daaa561d193e959422640b6e` | `8dc7d7bfdf..6a0b0aeff6` | 7 | 0 |
| `plans/ea-gitignore-ea-tests-20261104` | `66af5d0d67f9138754c63823c8ddb68bd10b40aa` | `52361e3ca8..52361e3ca8` | 1 | 0 |
| `plans/ea-census-recount-20261104` | `c53e4199ae94ca853a197354f3f9e7f296cf1efc` | `6dc14d352c..f2d5a57d1a` | 3 | 0 |
| `plans/ea-cards2-answers-20261105` | `c81490e38cdd62175e5f921cfc6c65b542e2a5b7` | `586f380657..ebe41dea21` | 3 | 0 |
| `plans/ea-retention-cards2-20261105` | `9b76338594c6f1ca75de6c757e7a8b98ab68e229` | `b4c88fa679..8f1e686ab9` | 2 | 0 |

The two-line `.gitignore` change is isolated in `52361e3ca8b6badafb1f074467b9736ddd1929b8` and contains no other path. Source messages and authors are checked by `integration-integrity.log`; the full 44-commit map is `replay.json`.

Existing integration follow-ups retained:

- **`4f0fa70b3f`:** plans(storage): add SP-291 decision dependency and lineage from CA-RET review.
- **`a4d9027196`:** audits: apply B1 part 2 review follow-up to eight retired J248 rows.
- **`ab4220d36e`:** reports: update integrated premise citations from B1 part 2, B2 and CA-RET reviews.

New integration-only follow-ups:

- **`84f360e95f`:** refresh stream C citation locators only; no answer or owner meaning changes.
- **`1350d130d3`:** fresh shards and six index outputs, in a separate commit.

## Premises, citations and CA-RET2

Re-read all cited numeric passages in the nine stream-C-changed owner documents. **940 unique in-base spans retain identical text; 273 moved.** The two inserted Goal Runtime lines shift later locators by two; one UI Command Catalog compatibility note shifts later locators by one. The other changed owner passages do not replace any numeric cited premise. Whole-owner deltas were read to retain the current Planning Wizard ownership and append-only closure re-audit semantics.

**25 citation occurrences corrected in place:** 24 in `Plans/Decision_Log.md`, one in `reports/event-authority-20261104/CA-RET.md`. Questions, answers, selected options and scope conditions are unchanged. Presented-deck source records remain frozen; the live Decision Log’s duplicated prose/YAML locators now resolve to current text. `reports/event-authority-20261105/BATCH1-citation-locators.md` supplies all 273 moved-span mappings for the frozen census, whose source hashes and original capture remain unchanged. Full before/current quotes and use sites are in external `premise-citation-audit.json`.

| Cited owner | Corrected locator examples |
|---|---|
| `Plans/UI_Command_Catalog.md` | 8572–8578 → 8573–8579; 8572–8577 → 8573–8578 |
| `Plans/Goal_Runtime_System.md` | 6862 → 6864; 8211–8235 → 8213–8237 |

The three Section 15 preview locators are explicitly pinned to prepared commit `024adc567a2cf4f1c6da898c3951b9110df3b59e`, not main; its document hash and all three `Scope: project_only` lines still match. Preview membership remains empty and all three exact-type confirmations remain open. Debug’s Project-required payload reconciliation, full per-family contracts and separate admissions remain open. No formatter, LSP or dev-session type was assigned by analogy.

CA-RET2’s test-repair note still holds: main’s 344-family census and ordering/prefix repairs are preserved; only the approved policy-census assertion and its explanatory comments differ. The legacy-normalization golden fixture is byte-identical to current main (revision 2026-11-04.1). The registry retains all 344 family rows and exactly 35 reviewed policy objects.

CA-DL2’s historical DL-431/432 source recovery remains at commit `cdc9d4a94878868c9a2c67439bdf28ea5e5168f0`, `reports/event-authority-20261104/DCW.md:58` and `:62`, SHA-256 `27ab75273ed730657ec4fb7d9321fff0a223c9984d70d9f000467c6467d6b5a0`. This is lineage only.

## IDs, dependencies and index

No IDs were allocated or renumbered. Current main has none of the batch’s 55 added decision IDs (DL-095/096 and DL-400..DL-452); no existing indexed ID was removed or duplicated. The original 548-ref collision scan and independently reviewed deck-2 scan are inherited. The known stale-branch DL-095/096 definitions remain source-lineage conflicts absent from main. Main’s DL-302 and PLS-025 remain present.

All **nine** required edges resolve to unique indexed targets: **SP-237 → DL-401, DL-415..DL-421**, and **SP-291 → DL-401**. Build order is available. The eight retirement rows equal their ledger rows, retain their dispositions/evidence grades, and still record the landed Contracts edits and separately open Orchestrator work.

Index generation and validation both have parsed top-level `status=pass`: **7,478 PlanUnits**, **30,113 acceptance units**, **96 documents**. Only `contracts_v0`, `decision_log`, `run_modes`, `storage-plan` and `storage_value_registry` shard namespaces changed. Runtime readiness remains `blocked_runtime_certification_incomplete`; no executable work was created.

## Verification

The currentness edition was copied before index generation; all 15 source/copy SHA-256 pairs match. Nine additional required ignored audit inputs copied; the optional live-resize directory copy timed out as before. The ignored external agent-packet evidence symlink is present during checks.

| Check | Exit | Parsed top-level status | Seconds |
|---|---:|---|---:|
| `shard-generate` | 0 | pass | 2.82 |
| `shard-check` | 0 | pass | 15.78 |
| `index-generate` | 0 | pass | 39.65 |
| `index-validate` | 0 | pass | 40.85 |
| `test_event_authority_holding_bucket` | 1 | — | 3.98 |
| `test_pm_emit_only_event_boundaries` | 1 | — | 48.94 |
| `test_pm_pnc019_currentness` | 1 | — | 6.29 |
| `test_pm_coordination_events` | 1 | — | 31.13 |
| `test_pm_onboarding_phases` | 0 | — | 7.99 |
| `test_pm_plan_index` | 0 | — | 2.78 |
| `test_shared_runtime_storage_contracts` | 0 | — | 15.47 |
| `test_pm_runtime_vocabulary_migration` | 1 | — | 11.8 |
| `readiness-self-test` | 0 | pass | 29.77 |
| `case-l` | 0 | pass | 0.87 |
| `frozen-readonly` | 1 | — | 0.27 |
| `integration-integrity` | 0 | pass | 6.34 |
| `validate-new-contracts` | 0 | pass | 152.04 |
| `validate-projects-refresh-contracts` | 0 | pass | 34.69 |
| `validate-browser-event-admission` | 0 | pass | 9.65 |
| `validate-testing-session-event-admission` | 0 | pass | 4.99 |
| `validate-github-project-integration` | 0 | pass | 4.28 |
| `validate-working-notebook-contracts` | 0 | pass | 1.27 |
| `validate-case-l-non-event-materialization` | 0 | pass | 1.17 |
| `validate-implementation-readiness` | 1 | fail | 32.68 |
| `verify-spec-lock` | 1 | fail | 0.57 |
| `lint-contractrefs` | 0 | pass | 101.77 |
| `storage-profile-check` | 1 | fail | 0.47 |
| `baseline-comparison` | 0 | pass | 0.67 |

The initial integration-integrity helper exited 1 because its comment-normalization pattern also matched older main repair comments. Restricting that scratch helper to the approved policy comment block corrected the probe; no product source changed. The failed probe is retained as `integration-integrity-probe-error.*`. All eight test suites have exactly the same failed-case identities as the preserved nine-branch verification; passing suites remain passing. Onboarding (50), PlanUnit/index (18), and shared runtime/storage (16) pass. Holding-bucket has two failures; emit-only one; coordination 14 failed cases/subtests; currentness one; runtime vocabulary one. The first three retain existing missing approval/settings admission fixtures, digests and payload/schema/storage pins. Currentness retains source drift for the reseal. The renderer-copy test and its GUI input are byte-identical to main and still lack its expected literal. Full identities and unchanged-input hashes are retained externally.

The storage-profile checker’s 41 missing profiles exactly equal main’s missing-profile set, with identical checker, storage-profile objects and consumed family identities/kinds. This is a pre-existing gap. Spec Lock and implementation-readiness retain governance drift/open authority requirements; the dry check below classifies their findings.

The frozen independent validator ran read-only with bytecode disabled and only the receipt destination redirected in memory to external evidence. Exit 1 / pass=false retains six findings: `post_august_admission_incomplete`, `unexpected_august_set`, `fresh_census_denominator_not_closed`, `individual_dispositions_evidence_gap_blocking`, `individual_dispositions_provisional`, `registered_contract_depth_incomplete`. All seven frozen files match before/after. All protected governance files also match their initial hashes.

## Dry landing check

**Dry landing stopped: process exit -15 (SIGTERM), shell exit 143. No complete landing classification or readiness result.**

Main advanced from `57c28f706e10dd9f7c6b13ed5e962de74e9a6ea5` to `071a7e21a9243ea1a011b024b85c2c9f30bf5b5e` during `audit-governance`. Commit `071a7e21a9243ea1a011b024b85c2c9f30bf5b5e plans: refresh the plan-migration snapshot and the landing-check baseline after the closure re-audit landing` changes the current migration snapshot and landing baseline in 12 paths outside Concepts, triggering the user’s explicit stop rule. No second rebase or push was performed.

Completed aggregate: `run-gates`, exit 1. Source/schema/contract/admission/wiring/shard checks pass. Governance subchecks report 2,735 failures, of which 256 rows were printed and 2,479 were beyond the sample cap. These 256 printed rows are classified individually in `landing-classification.json`; full export and growth/baseline comparison did not finish. `audit-governance`, current-snapshot validation and full exports are incomplete. No zero-blocker conclusion is claimed.

| Printed-row classification | Rows |
|---|---:|
| other_governance_staleness | 226 |
| branch_governance_staleness_reseal | 25 |
| non_stale_on_untouched_governance_pending_full_comparison | 5 |

The five non-staleness printed rows name untouched governance files: two `event_denominator_unresolved`, two `event_family_contract_depth_unresolved` and one `historical_successor_terminal_current_snapshot_invalid`. They require the fresh combined baseline/growth classification at the resumed base. No non-staleness row in the printed sample names a batch file. This does not classify the 2,479 unkeyed rows.

| Subcheck | Reported failures | Printed rows |
|---|---:|---:|
| `verify_spec_lock` | 13 | 13 |
| `validate_plan_graph` | 1156 | 50 |
| `validate_evidence` | 1156 | 50 |
| `validate_implementation_readiness` | 43 | 43 |
| `validate_plan_migration` | 166 | 50 |
| `validate_audit_closure` | 201 | 50 |

Changed main paths that stopped delivery:

- `Plans/.plan_migration/current_run.json`
- `Plans/.plan_migration/pds-20261105-003-current-planunit-snapshot/COMPLETE.md`
- `Plans/.plan_migration/pds-20261105-003-current-planunit-snapshot/anchor_aliases.json`
- `Plans/.plan_migration/pds-20261105-003-current-planunit-snapshot/batch_report.jsonl`
- `Plans/.plan_migration/pds-20261105-003-current-planunit-snapshot/coverage_map.jsonl`
- `Plans/.plan_migration/pds-20261105-003-current-planunit-snapshot/final_validation_summary.json`
- `Plans/.plan_migration/pds-20261105-003-current-planunit-snapshot/inventory.json`
- `Plans/.plan_migration/pds-20261105-003-current-planunit-snapshot/original_hashes.json`
- `Plans/.plan_migration/pds-20261105-003-current-planunit-snapshot/pilot_report.json`
- `Plans/.plan_migration/pds-20261105-003-current-planunit-snapshot/span_map.jsonl`
- `Plans/.plan_migration/pds-20261105-003-current-planunit-snapshot/validation_report.json`
- `reports/landing-checks/baseline.json`

## Reseal request and landing follow-up

The source-input reseal list remains **41 paths**, fully enumerated in external `reseal-inputs.json`:

- **Owner/registry:** `Plans/Decision_Log.md`, `Plans/Contracts_V0.md`, `Plans/Run_Modes.md`, `Plans/storage-plan.md`, `Plans/storage_value_registry.json`.
- **Checker:** `scripts/pm-implementation-readiness.py`.
- **Disposition evidence:** both changed `LEDGER.jsonl` files under `Plans/.audits/event-authority-2026-08-12/` and their 33 changed individual row objects.

The assigned reseal handles applicable Spec Lock entries, owner/shard evidence and stale shard references, currentness source bindings, run-002 batch hashes/final summary, readiness/buildability artifacts and its required auto-decisions row. The eventual landing agent separately refreshes the current migration snapshot and landing baseline after landing. None is refreshed here.

## Open/stopped items

Card-1 clock/count questions are answered by DL-415..DL-421 and applied. Memory cutoff choices are answered by DL-446/447; later-card owner applications remain separate. Preview confirmations, Debug reconciliation, remaining full contracts/admissions, denominator and registered-contract depth stay open. CA-SEAL remains excluded. No main push, landing lock, reseal, protected governance edit, pm-mail or delegation occurred.

Dry-check blockers: **not determined**. One deliberate termination followed the user’s stop rule; no timeout was diagnosed. Main advanced to `071a7e21a9243ea1a011b024b85c2c9f30bf5b5e` with 12 non-Concepts migration snapshot/baseline paths. This explicit stop condition is the stopped item. No push or new-base readiness is claimed. Resume requires a newly authorized rebase and fresh dry check against the current main/baseline; all completed checks in this report apply to `57c28f706e10dd9f7c6b13ed5e962de74e9a6ea5` only.

## Evidence

Raw commands, exits, stdout/stderr, source replay map, copy hashes, citation quotes/maps, integrity proofs, frozen receipt, the completed run-gates report, interrupted-check metadata and per-sample classification (combined report/exports unfinished): `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/rebase-VM`. The report is copied to `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/BATCH1.md`. File hashes are in `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/rebase-VM/SHA256SUMS`.

| Artifact | SHA-256 |
|---|---|
| `currentness-copy.json` | `5c99f673f4396a206bc852dafe6ba4c976ec1cb26b3a3ce75cdad69d6e4db75a` |
| `replay.json` | `f8389f0e8e05fc40a1bc5d7eee077bc63948a1056761a6710a6c803f9e255b84` |
| `citations-fixed.json` | `e4f1bf7934eb5ed95da965bf72b9be394ae8145be7e67c8f115a1c9f430c5125` |
| `premise-citation-audit.json` | `22bc3ef4072d80c1cd937139c4c872338c86d9c8b1bcb456ba28ab36c3055a86` |
| `index-generate.log` | `87b83eb9af462bbb294f70f4e2162577b8b5a9b03c695f9620b30896f90eeaae` |
| `index-validate.log` | `59f7bb229d7d273a4d371fae53a691ede6d5d34a9bebba4f80a1de3dff1d4b74` |
| `integration-integrity.log` | `f6a6977de29941deaa1e60c717b17a8e62698be73c439ae75b38892883439045` |
| `test-baseline-comparison.json` | `a4a533d659f4ce394f1b659a0181632abd1d80c14eb412fc1926ea8876b078db` |
| `storage-profile-baseline.json` | `85d7fac6c5d5ad888212ffcebbe7bfb44c2a829494872a4ae80011376a2ed3a6` |
| `runtime-vocabulary-baseline.json` | `d5349bf7ab3fc9831b5c8efe618fd0c4ffbbfdbb6909c95ab5450efb20701795` |
| `frozen-readonly-integrity.json` | `57ab2379a423c33f92560dfa20b39895934d32bdf125736e971398f952f8e759` |
| `frozen-receipt/event_authority_validator_receipt.json` | `abba33bd7aa92bf89ad708f0c41a80be1643005fd323e6fba6016e07c026108d` |
| `landing-check.log` | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `landing-classification.json` | `b9ec2a136122d4d625ea72598e93fb3c915eecdbace8495e6179050b7d0be13d` |
| `reseal-inputs.json` | `a188bd918c82f55731a6d98ea546e5733ef31756b4204ee28a23edbd641e63e2` |
| `base-drift.json` | `d0454506a304b7e4bdabcab011540aae966a3c5961966d0201ac30e9513f2ce1` |
| `protected-after.json` | `a3c0abbdc06d506e09ab90f0530933b3db9f2f9e20dbef246bd6c197cd1863c8` |
