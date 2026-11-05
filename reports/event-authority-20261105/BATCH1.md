# Event Authority batch 1 integration — nine branches, 2026-11-05

**Status: STOPPED_BASE_MOVED_AFTER_VERIFICATION — lead reviews and landing remain separate.**

Branch: `plans/ea-batch1-20261105`. Base: `73f2231a9ec1c93190adafcdde51030f028c8c2d`. Seven-branch delivery extended: `673b7d7a17a51d3b1aefd5e04e3d65e25c8c4e5d`. Regenerated/verified content head: `35ef9609e415118c1112aa123475f731ea8c0906` (the report-only delivery head is recorded separately). Machine: VM. Full worktree: `/home/sittingmongoose/pm-worktrees/ea-batch1-add`.

The first operation was `git -C /home/sittingmongoose/src/PuppetMaster fetch origin`. Main remained at the requested base: the diff from 73f2231a9e to origin/main was empty. No rebase was needed at the initial check. At delivery main had moved outside Concepts; see the stop record below. Both added READY heads matched their Sol/Astra reviews. Initial disk availability was 119 GB and available RAM 12 GB. No original batch commit was rewritten or dropped; the original 33 lane commits, three integration follow-ups and seven-branch report remain ancestors. Five additional lane commits retain their exact messages and authors.

The previous report is preserved at `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/BATCH1-7branches.md` — SHA-256 `d29d46409810c8498d22bf9e241ac2ca6694bfc2537a0c7e6eec7e3513cfa85e`. Its complete original replay, collision scan and follow-up evidence remains under the parent directory and `finish-VM/`.

## Nine input branches

| Input branch | Reviewed head | Replayed range | Commits | Owner-text conflicts | Generated conflict occurrences |
|---|---|---|---:|---:|---:|
| `plans/ea-s09-decisions-hb-scope-20261104` | `8724fcea67936ca08d55de237f55c2745eed459e` | `fceab0af8e..ee02fd59a2` (inclusive) | 9 | 0 | 76 |
| `plans/ea-cards1-answers-20261104` | `b6332f391a7870bad5f01a29a7e9d080050dac27` | `ac5bf65217..ac5bf65217` (inclusive) | 1 | 0 | 19 |
| `plans/ea-dl087-088-retirements-20261104` | `b4ef60f0a9610a7fa64fc1e9f44674f20f31d876` | `8f95f05b9c..beca732574` (inclusive) | 5 | 0 | 179 |
| `plans/ea-storage-retention-20261104` | `4d52bd2758526cd0e8a56358baaa73049c1d4bdd` | `aeaf3740de..e8ebb08f13` (inclusive) | 7 | 0 | 1647 |
| `plans/ea-retention-cards1-20261104` | `2663667e14346235daaa561d193e959422640b6e` | `784cd483b7..565310293d` (inclusive) | 7 | 0 | 2378 |
| `plans/ea-gitignore-ea-tests-20261104` | `66af5d0d67f9138754c63823c8ddb68bd10b40aa` | `0ec80aba60..0ec80aba60` (inclusive) | 1 | 0 | 0 |
| `plans/ea-census-recount-20261104` | `c53e4199ae94ca853a197354f3f9e7f296cf1efc` | `8a32cc347a..554052b74e` (inclusive) | 3 | 0 | 0 |
| `plans/ea-cards2-answers-20261105` | `c81490e38cdd62175e5f921cfc6c65b542e2a5b7` | `59d63be2ab..33c5eb35bf` (inclusive) | 3 | 0 | 38 |
| `plans/ea-retention-cards2-20261105` | `9b76338594c6f1ca75de6c757e7a8b98ab68e229` | `3a22fc1a2f..5d27ebb920` (inclusive) | 2 | 0 | 728 |

The first seven replay ranges and conflict counts above are inherited from the preserved seven-branch delivery, whose commits are unchanged. Both added branches have zero source conflicts. Generated paths were restored from the integration HEAD during replay and regenerated together in a separate commit; they were never hand-merged. The retention cherry-pick produced two unmerged registry rename paths (`628-lines-125218-125392.md` and `629-lines-125418-125504.md`); removing those generated index entries allowed the HEAD restore. All 728 generated conflict occurrences are retained in `retention-generated-conflicts.txt`.

## Added commits and integration notes

| Reviewed commit | Replayed commit | Exact message |
|---|---|---|
| `7ddbd14d27b41b29d041b9db5105ff39fc2eb350` | `59d63be2aba2789f6ef71fad88bf68ea54a4bd07` | plans: record all 38 E-CARDS-2 owner answers (DL-415..DL-452) |
| `d152e079438081df8ec935522b3040f3ecab146c` | `4b9cebbaa86a60e7917726d456f0226312e5b43a` | plans: complete deck-2 Decision Log PlanUnits and Debug context |
| `c81490e38cdd62175e5f921cfc6c65b542e2a5b7` | `33c5eb35bf3461ea8bf03c9a0f0a9a33928d7967` | reports: record CA-DL2 round-1 fixes and unchanged validation failures |
| `a4260ca1be5eef9282f0e4fee812a0b1f3a6d0e2` | `3a22fc1a2f41e2c7a0e737ab0a4760faea2200cf` | plans(storage): apply Card 1 clock and no-project retention buckets (DL-415..DL-421) |
| `9b76338594c6f1ca75de6c757e7a8b98ab68e229` | `5d27ebb92045729c244fd7882949004ba3270e29` | reports: trim trailing blank line in CA-RET2 report |

Separate generated-files commit: `35ef9609e415118c1112aa123475f731ea8c0906` — plans: regenerate batch 1 shards and index for deck-2 answers and retention. It contains 744 paths, six index outputs and only the `decision_log`, `storage-plan` and `storage_value_registry` shard namespaces. The report is committed separately.

- **CA-RET2 note 2:** main repairs 9727c9a814 and 120c4f3d88 survive. The onboarding test retains the 344-family census and main ordering/prefix repairs together with the branch’s 35-policy assertion. The golden fixture is byte-identical to main and retains revision 2026-11-04.1.
- **CA-RET2 note 4 / Astra:** preview membership is still empty; all three exact-type confirmations remain explicitly open. Debug’s older Project-required payload still needs owner reconciliation. Full-contract and separate-admission gates remain. No dev-session, formatter or LSP history was assigned by analogy.
- **Earlier integration follow-ups:** dce12e1226 (SP-291 → DL-401), f9f90b0c7f (eight retirement ledger rows) and 28b5b10d28 (current premise locators) remain unchanged. Integration integrity rechecks the eight row objects against their ledgers, dispositions and evidence grades.
- **CA-DL2 historical pointer note:** the exact presented DL-431/432 Sources lines remain unchanged. Their mutable `evidence:drafts/DCW/DCW.md` lookup has the independent immutable recovery at commit cdc9d4a94878868c9a2c67439bdf28ea5e5168f0, reports/event-authority-20261104/DCW.md:58 and :62, SHA-256 27ab75273ed730657ec4fb7d9321fff0a223c9984d70d9f000467c6467d6b5a0. This is lineage lookup only, with no answer change.

## IDs, dependencies and current premises

The 38 added indexed decisions are DL-415 through DL-452; no prior PlanUnit is removed. All 38 reviewed prose sections are byte-identical after integration. Main’s DL-302 is present. The integrity check proves that the only PlanUnit additions against the original batch base are the original 17 decisions and these 38. All five added commit messages/authors and the original 33 lane commit messages/authors match their source objects.

All nine required edges resolve to existing unique indexed targets: SP-237 → DL-401 and DL-415..DL-421 (eight edges), and SP-291 → DL-401 (one edge). Build order is available; none of the missing-answer dependency/build-order failures remains.

- **Current locator:** `Plans/storage-plan.md:17903` — `plan_unit_id: SP-237`.
- **Current locator:** `Plans/storage-plan.md:23938` — `plan_unit_id: SP-291`.
- **Current locator:** `Plans/storage-plan.md:17500` — `- **1.g — Owner-confirmed preview history`.
- **Current locator:** `tests/test_pm_onboarding_phases.py:366` — `self.assertEqual(len(families), 344)`.
- **Current locator:** `tests/test_pm_onboarding_phases.py:389` — `self.assertEqual(len(self.registry["retention_policies"]), 35)`.

The original 548-ref collision scan and its known stale-branch DL-095/096 collision remain as recorded in BATCH1-7branches.md; those conflicting definitions are absent from main. CA-DL2’s completed independent reviews cover all 38 additional IDs and the retention stack; no new ID is allocated here. Source-memory, generated and migration copies are not counted as additional canonical definitions.

Retention preserves all 344 family rows and all 28 prior policy objects. The seven added policy objects exactly match the reviewed retention branch, giving 35 policies. The five populated application buckets retain the approved 9 + 12 + 5 + 3 + 1 exact types; preview has zero members. No event family or admission record was added.

## Regeneration and targeted verification

The ignored currentness edition was copied before index generation: `cp -a` exited 1 on attributes, while all 15 source/copy SHA-256 pairs matched. The baseline identity is checked again by the dry landing tool. Generators and checkers ran one at a time. The RAM guard checks before each launch; below 6 GB it rechecks every two minutes and resumes at 7 GB. No memory pause was required. The nine additional required audit inputs copied successfully; the optional live-resize directory copy timed out, matching the previous run. The evidence symlink is present.

| Check | Exit | Parsed top-level status | Seconds | RAM before |
|---|---:|---|---:|---:|
| `shard-generate` | 0 | pass | 3.69 | 10 GB |
| `shard-check` | 0 | pass | 23.53 | 10 GB |
| `index-generate` | 0 | pass | 55.41 | 9 GB |
| `index-validate` | 0 | pass | 55.36 | 8 GB |
| `test_event_authority_holding_bucket` | 1 | — | 4.38 | 8 GB |
| `test_pm_emit_only_event_boundaries` | 1 | — | 69.44 | 8 GB |
| `test_pm_pnc019_currentness` | 1 | — | 8.5 | 13 GB |
| `test_pm_coordination_events` | 1 | — | 39.29 | 12 GB |
| `test_pm_onboarding_phases` | 0 | — | 10.4 | 14 GB |
| `test_pm_plan_index` | 0 | — | 2.17 | 14 GB |
| `test_shared_runtime_storage_contracts` | 0 | — | 20.12 | 14 GB |
| `test_pm_runtime_vocabulary_migration` | 1 | — | 15.95 | 12 GB |
| `readiness-self-test` | 0 | pass | 36.94 | 13 GB |
| `case-l` | 0 | pass | 1.2 | 13 GB |
| `frozen-readonly` | 1 | None | 0.37 | 13 GB |
| `integration-integrity` | 0 | pass | 6.09 | 13 GB |
| `validate-new-contracts` | 0 | pass | 208.8 | 12 GB |
| `validate-projects-refresh-contracts` | 0 | pass | 43.5 | 11 GB |
| `validate-browser-event-admission` | 0 | pass | 11.45 | 11 GB |
| `validate-testing-session-event-admission` | 0 | pass | 6.89 | 10 GB |
| `validate-github-project-integration` | 0 | pass | 5.23 | 10 GB |
| `validate-working-notebook-contracts` | 0 | pass | 1.12 | 11 GB |
| `validate-case-l-non-event-materialization` | 0 | pass | 1.42 | 11 GB |
| `validate-implementation-readiness` | 1 | fail | 43.1 | 11 GB |
| `verify-spec-lock` | 1 | fail | 0.82 | 17 GB |
| `lint-contractrefs` | 0 | pass | 107.37 | 17 GB |
| `storage-profile-check` | 1 | fail | 0.57 | 14 GB |

Index generation and validation both have parsed top-level `status=pass`: **7,477 PlanUnits**, **30,110 acceptance units**, 96 documents. Shards cover 99 sources. Runtime readiness remains `blocked_runtime_certification_incomplete`; no WorkNodes or NodeSeeds were created.

All 50 onboarding tests, all 18 index/PlanUnit-retention tests and all 16 shared runtime/storage tests pass. The readiness self-test, Case L, integration integrity and the seven targeted contract/admission checkers pass.

The holding-bucket (two failures), emit-only (one failure), coordination (14 failing test/subtest cases) and currentness (one failure) failed-case identities match the retained seven-branch runs. The first three concern existing missing approval/settings admission fixtures, registry digests and payload/schema/storage pins. Currentness reports source drift that the reseal must bind; it is not a new closure. `test-baseline-comparison.json` retains the exact identity comparison.

The additional runtime-vocabulary suite has one pre-existing renderer-copy failure in nine tests: it expects “Skia compiled in and selected by default”. Both that test file and Plans/FinalGUISpec.md are byte-identical to main; the literal is absent there too. Its storage-registry representation cases pass. `runtime-vocabulary-baseline.json` binds both equal input hashes. No unrelated test or GUI owner text was changed.

The storage-profile checker exits 1 with 41 missing profiles. Its checker, complete storage-profile object and consumed family identities/kinds are unchanged from main; its full error array exactly equals main’s missing-profile set (`storage-profile-baseline.json`). No profile gap was introduced here. The initial optional lock/reference invocations rejected an unsupported timeout flag (exit 2); corrected invocations are recorded in the table and the rejected outputs are retained with an `-invocation-error` suffix.

Spec Lock verification fails on stale hashes; implementation-readiness validation retains source/governance drift and the open denominator/depth requirements. The full dry landing check classifies their reported items below.

The frozen validator ran read-only, with bytecode disabled and only its receipt destination redirected in memory to external evidence. Exit 1 / pass=false retains six open-authority findings: post_august_admission_incomplete, unexpected_august_set, fresh_census_denominator_not_closed, individual_dispositions_evidence_gap_blocking, individual_dispositions_provisional and registered_contract_depth_incomplete. All seven frozen-directory file hashes match before/after. No closure is claimed.

## Dry landing check and complete classification

**Dry landing exit: 1; blocking items: 0; infrastructure results: 0.**

Baseline `0edfd9406fb708773df7f25ce1ce25a064ae06ad`: `{'age_days': 0.07, 'ancestor': True, 'base': 'origin/main', 'base_commit': '73f2231a9ec1c93190adafcdde51030f028c8c2d', 'baseline_commit': '0edfd9406fb708773df7f25ce1ce25a064ae06ad', 'max_age_days': 7, 'reason': 'its commit 0edfd9406fb7 is an ancestor of the base origin/main (73f2231a9ec1) and 0.07 days older than it, within 7', 'rule_two_applies': True}`. All 15 recorded currentness input hashes matched before checking. Derived paths are excluded from branch matching; their PlanUnit IDs are matched against the edited owner documents.

| Aggregate | Result | Failure total | Baseline total |
|---|---|---:|---:|
| `audit-governance` | fail | 2067 | 222 |
| `plan-migration-validate` | fail | 9411 | 0 |
| `run-gates` | fail | 2067 | 222 |

Reported sets overlap: 13101 new rows, 9493 rows on branch files, 0 pre-existing rows; 13103 distinct reported items. Every distinct item is classified in landing-classification.json. The table below groups that complete classification by error kind.

| Classification | Error kind | Items |
|---|---|---:|
| branch_governance_staleness_reseal | `artifact_hash_stale` | 20 |
| branch_governance_staleness_reseal | `buildability_gate_report_stale_or_not_canonical` | 2 |
| branch_governance_staleness_reseal | `current_snapshot_batch_doc_invalid` | 1 |
| branch_governance_staleness_reseal | `current_snapshot_coverage_not_exact_same_document_planunit_set` | 15 |
| branch_governance_staleness_reseal | `current_snapshot_live_bytes_mismatch` | 8 |
| branch_governance_staleness_reseal | `current_snapshot_live_line_count_mismatch` | 6 |
| branch_governance_staleness_reseal | `current_snapshot_live_sha256_mismatch` | 8 |
| branch_governance_staleness_reseal | `current_snapshot_live_span_metadata_mismatch` | 8811 |
| branch_governance_staleness_reseal | `current_snapshot_span_sha256_mismatch` | 542 |
| branch_governance_staleness_reseal | `event_authority_currentness_source_drift` | 10 |
| branch_governance_staleness_reseal | `event_record_spec_lock_hash_stale` | 2 |
| branch_governance_staleness_reseal | `non_executable_closure_spec_lock_hash_stale` | 2 |
| branch_governance_staleness_reseal | `pnc019_source_hash_stale` | 2 |
| branch_governance_staleness_reseal | `stale_batch_report_sha256_after` | 52 |
| branch_governance_staleness_reseal | `stale_hash` | 8 |
| branch_governance_staleness_reseal | `storage_value_registry_spec_lock_hash_stale` | 4 |
| new_on_untouched_governance_files | `historical_successor_terminal_current_snapshot_invalid` | 2 |
| new_on_untouched_governance_files | `missing_ref` | 4 |
| other_governance_staleness | `artifact_hash_stale` | 3328 |
| other_governance_staleness | `complete_final_summary_live_plan_unit_count_stale` | 3 |
| other_governance_staleness | `current_snapshot_anchor_aliases_json_exact_mismatch` | 1 |
| other_governance_staleness | `current_snapshot_batch_report_jsonl_exact_mismatch` | 1 |
| other_governance_staleness | `current_snapshot_complete_md_exact_mismatch` | 1 |
| other_governance_staleness | `current_snapshot_coverage_map_jsonl_exact_mismatch` | 1 |
| other_governance_staleness | `current_snapshot_current_run_pointer_invalid` | 1 |
| other_governance_staleness | `current_snapshot_final_summary_invalid` | 1 |
| other_governance_staleness | `current_snapshot_final_validation_summary_json_exact_mismatch` | 1 |
| other_governance_staleness | `current_snapshot_inventory_json_exact_mismatch` | 1 |
| other_governance_staleness | `current_snapshot_live_span_count_mismatch` | 1 |
| other_governance_staleness | `current_snapshot_live_span_set_mismatch` | 1 |
| other_governance_staleness | `current_snapshot_original_hashes_json_exact_mismatch` | 1 |
| other_governance_staleness | `current_snapshot_plan_unit_count_stale` | 1 |
| other_governance_staleness | `current_snapshot_plans_manifest_sha256_mismatch` | 2 |
| other_governance_staleness | `current_snapshot_span_map_jsonl_exact_mismatch` | 1 |
| other_governance_staleness | `doc_count_mismatch` | 2 |
| other_governance_staleness | `inventory_doc_set_mismatch` | 2 |
| other_governance_staleness | `stale_batch_report_sha256_after` | 254 |

Growth: 0 buckets and 11 subchecks. The full growth/export/pairing records are retained in landing-classification.json. Subchecks compared only by total: ['audit-governance/audit_closure', 'run-gates/validate_audit_closure'].

No new non-staleness finding on this branch stops the handoff. Branch governance staleness belongs to the reseal request. Pre-existing findings are compared against the current baseline. New findings on untouched governance files are non-blocking under the repository rules and require the follow-ups below.

**New findings on untouched files:**

| Error | Path | Reported items |
|---|---|---:|
| `historical_successor_terminal_current_snapshot_invalid` | `Plans/.plan_migration/pds-20260611-002-atomize-planunits/final_validation_summary.json` | 2 |
| `missing_ref` | `Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json` | 4 |

The protected evidence still references prior final shard paths; deterministic regeneration changes the corresponding paths. The designated reseal must refresh those references. Historical-successor failures wrap the stale current migration snapshot; the eventual landing refreshes that snapshot and its baseline, with the run-002 historical summary handled in the assigned reseal. These findings do not authorize changes to protected governance in this branch.

## Reseal request and landing follow-up

The reseal source-input list remains the same **41 paths**, enumerated in `reseal-inputs.json`: Plans/Decision_Log.md, Plans/Contracts_V0.md, Plans/Run_Modes.md, Plans/storage-plan.md, Plans/storage_value_registry.json, scripts/pm-implementation-readiness.py, both changed disposition ledgers and their 33 changed row objects.

The assigned reseal worker handles applicable Spec Lock entries; edited owner/shard artifact evidence and stale shard references; currentness source bindings; run-002 batch hashes and final summary; readiness/buildability artifacts; and the one required auto-decisions row. The eventual landing agent separately refreshes the current migration snapshot and landing baseline after landing. None of these protected artifacts was edited here.

## Open and stopped items

The earlier seven Card-1 clock/count questions are now answered by DL-415..DL-421 and applied by the added retention branch. Memory cutoff choices are answered by DL-446/447; applying later-card decisions to their owners remains separate work and is not falsely reported as still awaiting Jared’s choice.

- **Open owner gates:** all three no-project preview type confirmations; Debug payload/scope reconciliation; full per-family contract and admission gates.
- **Later batches / owners:** orchestrator pointer and child-run/board/raw-output text, collaborative contracts/admissions and remaining deck-2 owner applications.
- **Carried technical notes:** Chat successor physical form at first admission; SR-04 Boot aggregate interpretation; SR-05 future regrade; storage_maintenance_operation count/card observation.
- **Authority still open:** denominator, registered-contract depth, missing approval/settings admission records and the six frozen findings above. CA-SEAL remains excluded.

Blocking items from the completed dry check (the separate delivery stop is recorded below): 0. Infrastructure results: 0. See complete classification for every reported item.

## Evidence and delivery

Raw commands, stdout/stderr, exit records, reviewed-input custody, copy hashes, replay map, integrity proof, frozen receipt, full landing reports/exports and per-item classification are retained under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/add-VM`. The branch report copy is `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/BATCH1.md`; delivery.json records the final local head, unchanged remote head and report hash.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/add-VM/SHA256SUMS` — SHA-256 `75b541434096089dd30064b19fd77893fd6dabb39b436b58f8290b8bb9a5ddc8`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/add-VM/currentness-copy.json` — SHA-256 `a3c4d658e151f7732b549a132fcf835a468e98ff72cb5da279a98890450162b9`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/add-VM/replay.json` — SHA-256 `54e688391355032e972393f8241a9f22178841bbee1df8245100a90b8cfa064c`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/add-VM/index-generate.log` — SHA-256 `79c0ad750d74dfe7f8bf64a1cf07eecabefc50cfd72151684ef773ad5f43cdda`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/add-VM/index-validate.log` — SHA-256 `74ee11ed7aa32716e123864cf0adbbe3b7467ea9de7552cd7be5586d3bc6655d`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/add-VM/integration-integrity.log` — SHA-256 `865e1cc40a3360e24b5a1fedaf9bf71ad1db539fbd5e40c0081451ea0b70539c`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/add-VM/test-baseline-comparison.json` — SHA-256 `a047d53e0610582b892002636171ea24578bf79f3ff148f842c31dcc9ad83b1b`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/add-VM/runtime-vocabulary-baseline.json` — SHA-256 `2e7b8c48727e5ee4a6bd44dfe7f858d26105818faf7dea8e67f8e5f61bd517fc`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/add-VM/storage-profile-baseline.json` — SHA-256 `7e4bc6d9075c574f88e44b56fc364f77b1cde76095cff11c1990ee6b1c775cab`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/add-VM/frozen-readonly-integrity.json` — SHA-256 `57ab2379a423c33f92560dfa20b39895934d32bdf125736e971398f952f8e759`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/add-VM/frozen-receipt/event_authority_validator_receipt.json` — SHA-256 `42d0c6094fd419f4908b35eeb262f0de60d01678769528358c8c909f7e4121c5`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/add-VM/landing-check.log` — SHA-256 `a8dc1ad0ce9ffad8b715dc3c6ed0f4fca761b79553699e81ac97da47fd6a9ea8`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/add-VM/landing-classification.json` — SHA-256 `2faf9a01fdc61a3b7847b2b1d9564f163c13547b495881eb33d01ca309c4c988`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/add-VM/reseal-inputs.json` — SHA-256 `a188bd918c82f55731a6d98ea546e5733ef31756b4204ee28a23edbd641e63e2`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/add-VM/base-drift.json` — SHA-256 `f88c94ab3c9ed8ec802400f5b1eba0fe431a777df33cc1f4a2b4c9ce30b30515`.
- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/add-VM/base-drift-paths.txt` — SHA-256 `eb09251e107998444bf2bb1145a5e6a723c55d190a2c541918d9686e304d6eac`.

The final remote check found main had advanced outside Concepts during verification, triggering the explicit stop condition. No rebase or push was performed after that discovery. Completed source, generation and report commits are preserved locally for the lead; the remote batch branch remains at 673b7d7a17a51d3b1aefd5e04e3d65e25c8c4e5d. The worktree is removed with the literal-path Git command after copying the report and evidence. No main push, landing lock, reseal, forbidden governance edit, frozen source edit, admission, pm-mail, subagent, browser or server. Lead reviews and landing remain separate.

## Delivery stop: main advanced outside Concepts

After the dry check, a final remote read and fetch found main at `57c28f706e10dd9f7c6b13ed5e962de74e9a6ea5`. `git diff --name-only 73f2231a9e origin/main` lists 427 paths, including 427 outside Concepts. The instruction says anything outside Concepts means stop and report the paths. This worker therefore does not rebase, force-push or certify the result against this new main. The dry-check exit 1 / zero blockers applies only to the verified base `73f2231a9ec1c93190adafcdde51030f028c8c2d`.

Primary changed paths (the complete exact list, including generated, audit and ledger paths, is in base-drift-paths.txt and base-drift.json):

- `Plans/00-plans-index.md`
- `Plans/Goal_Runtime_System.md`
- `Plans/Media_Generation_and_Capabilities.md`
- `Plans/Planning_Ledger_System.md`
- `Plans/Section15_MVP_Promoted_Features_Spec.md`
- `Plans/UI_Command_Catalog.md`
- `Plans/bootstrap/Bootstrap_Design_Brief.md`
- `Plans/chain-wizard-flexibility.md`
- `Plans/orchestrator-subagent-integration.md`
- `scripts/pm-audit-closure.py`
- `scripts/pm-plans-verify.py`

This base change is the one stopped item. It is separate from the zero blocking items in the completed dry check. The lead must adjudicate the new base before integration resumes.
