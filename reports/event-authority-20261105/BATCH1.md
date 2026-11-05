# Event Authority batch 1 integration — 2026-11-05

**Status: VERIFIED_WITH_NONBLOCKING_FINDINGS — lead reviews and landing remain separate.**

Branch: `plans/ea-batch1-20261105`. New base: `73f2231a9ec1c93190adafcdde51030f028c8c2d`. Original base: `f9c5de6561dff0a53a48e530f2a5c6804a7e941d`. Stopped head: `8e2d0599069d7c0b9a371b11b615d029886452d8`. Rebased source/follow-up/handoff head: `c86749191d64f0f90065db60ab40f11375999d6f`. Generated-files commit: `bd0b2092a490d62f5f41f6143e0ecbb3390cb9e3`. Machine: VM; finish worktree `/home/sittingmongoose/pm-worktrees/ea-batch1-finish`.

After fetching origin, the lead's required diff from f9c5de6561 to origin/main named exactly 61 paths, all under Concepts/. The rebase completed without conflicts. All 37 commits (33 lane commits, three follow-ups and the stopped report) retain their exact messages and authors. The approved two-line .gitignore change remains its own commit. Comparing old and rebased tips found only the same Concepts paths; owner premises and citation locations are unchanged by the rebase. rebase-map.json records every old/new pair.

The prior report is preserved as `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/BATCH1-stopped.md`. No input lane's product work was repeated.

## Input replay

All seven fetched heads still matched the reviewed table at the VM resume. All 33 distinct lane commits were replayed, retaining their complete messages and authors. Stacked ancestors were replayed once. The two-line `.gitignore` input remains its own commit.

| Input branch | Reviewed head | Replayed range | Commits | Owner-text conflicts | Generated conflict occurrences |
|---|---|---|---:|---:|---:|
| `plans/ea-s09-decisions-hb-scope-20261104` | `8724fcea67936ca08d55de237f55c2745eed459e` | `fceab0af8e..ee02fd59a2` (inclusive) | 9 | 0 | 76 |
| `plans/ea-cards1-answers-20261104` | `b6332f391a7870bad5f01a29a7e9d080050dac27` | `ac5bf65217..ac5bf65217` (inclusive) | 1 | 0 | 19 |
| `plans/ea-dl087-088-retirements-20261104` | `b4ef60f0a9610a7fa64fc1e9f44674f20f31d876` | `8f95f05b9c..beca732574` (inclusive) | 5 | 0 | 179 |
| `plans/ea-storage-retention-20261104` | `4d52bd2758526cd0e8a56358baaa73049c1d4bdd` | `aeaf3740de..e8ebb08f13` (inclusive) | 7 | 0 | 1647 |
| `plans/ea-retention-cards1-20261104` | `2663667e14346235daaa561d193e959422640b6e` | `784cd483b7..565310293d` (inclusive) | 7 | 0 | 2378 |
| `plans/ea-gitignore-ea-tests-20261104` | `66af5d0d67f9138754c63823c8ddb68bd10b40aa` | `0ec80aba60..0ec80aba60` (inclusive) | 1 | 0 | 0 |
| `plans/ea-census-recount-20261104` | `c53e4199ae94ca853a197354f3f9e7f296cf1efc` | `8a32cc347a..554052b74e` (inclusive) | 3 | 0 | 0 |

Generated conflicts were deferred during the original replay and have now been resolved by deterministic regeneration; they were never hand-merged. Each no-commit cherry-pick restored `Plans/_shards/**` and `Plans/.plan_index/**` from the integration HEAD; the separate generated-files commit below completes that work. The registry final-chunk rename conflicted at `59e68d0650`; the unmerged generated paths were removed from the index and restored from HEAD for later regeneration. Raw per-commit logs and complete path lists are outside the repository.

## Integration follow-ups

- `dce12e1226` — CA-RET review: SP-291 depends_on and source_lineage add DL-401.
- `f9f90b0c7f` — B1 part 2 review: Eight retired J248 row objects and exactly eight rows in each ledger now record completed Contracts/Run Modes edits and current citations; dispositions, cohort/category, and evidence grades unchanged; historical positive cells explicitly grant no current authority; separate orchestrator pointer remains pending.
- `28b5b10d28` — B1 part 2, B2 and CA-RET reviews: Append current integrated premise locators to dated reports without changing historical source hashes or meanings; DL-404 answers the older B2 Q2.

## IDs and premise checks

New PlanUnit IDs are DL-095, DL-096 and DL-400 through DL-414. The new main base has no definition of any of these IDs; its entire change from the original base is confined to Concepts/. The original completed all-origin scan (retained evidence; not repeated in this finish) examined 548 refs and 1,383 distinct canonical root Plans owner versions, called `git grep` for every ref, and reused exact Git blob identities for unchanged owner files. Source-memory ledgers, generated shards and migration copies are not canonical PlanUnit definitions. Stream C’s DL-330–332 on `origin/plans/closure-owner-answers-20261105` and DL-333 on `origin/plans/command-payload-defs-20261105` are disjoint. The matching Event Authority definitions on its September lineage and two reviewed input branches are the same decisions, not independently minted IDs.

**Known stale-branch collision:** `origin/fix/server-pairing-issuance-rebased-20260925` defines DL-095 as “Replace import resets omitted ordinary settings within the chosen scope” and DL-096 as “Stash apply explicitly chooses whether to restore saved staged selections”. These are different from stream E’s heartbeat/scope decisions. They are absent from main. BATCH1.md explicitly requires stopping on a main collision; the reviewed stream E IDs are preserved without unilateral renumbering.

Current premise locators and moved-citation corrections are appended to the B1 part 2, B2 and CA-RET reports. The 25 retention-row assignments remain at `Plans/storage-plan.md:17427`, `:17429`, `:17431`; the Chat policy object is still at `Plans/storage_value_registry.json:558`. Main’s DL-302, FileSafe and application-compaction admission boundaries, prototype cleanup and typed app storage/onboarding changes are preserved. B2’s older Q2 is answered by DL-404. Historical application hashes and dated source-revision citations are not restamped.

## Regeneration and verification

All four derived-file commands exited 0, with top-level JSON status parsed as pass. Shards cover 99 sources. Index generation and validation report 7,439 PlanUnits, 29,993 acceptance units and blocked_runtime_certification_incomplete; no WorkNodes or NodeSeeds were created. Only five shard namespaces changed: contracts_v0 (66 tracked paths), decision_log (13), run_modes (30), storage-plan (91), storage_value_registry (633). The generated-files commit contains 839 paths, including six index outputs and the final registry-shard rename.

The mandatory ignored currentness edition was copied before generation. cp -a exited 1 on attributes, while all 15 source/copy SHA-256 pairs matched. Commands ran sequentially. The RAM guard ran free -g before each generator/checker; below 6 GB it would recheck every two minutes, resume at 7 GB and stop only after 45 continuous minutes below 6 GB. No RAM pause or stop was needed in this finish. Initial disk free: 85 GB.

| Check | Exit | Parsed top-level status | Seconds | Available RAM before |
|---|---:|---|---:|---:|
| `shard-generate` | 0 | pass | 3.38 | 11 GB |
| `shard-check` | 0 | pass | 25.02 | 9 GB |
| `index-generate` | 0 | pass | 54.49 | 9 GB |
| `index-validate` | 0 | pass | 63.79 | 10 GB |
| `test_event_authority_holding_bucket` | 1 | see result below | 4.78 | 9 GB |
| `test_pm_emit_only_event_boundaries` | 1 | see result below | 66.28 | 9 GB |
| `test_pm_pnc019_currentness` | 1 | see result below | 14.32 | 9 GB |
| `test_pm_coordination_events` | 1 | see result below | 41.66 | 9 GB |
| `test_pm_onboarding_phases` | 0 | see result below | 12.08 | 11 GB |
| `readiness-self-test` | 0 | pass | 42.13 | 12 GB |
| `case-l` | 0 | pass | 1.33 | 10 GB |
| `frozen-readonly` | 1 | see result below | 0.47 | 10 GB |
| `integration-integrity` | 0 | pass | 4.87 | 10 GB |
| `validate-new-contracts` | 0 | pass | 236.5 | 10 GB |
| `validate-projects-refresh-contracts` | 0 | pass | 58.72 | 9 GB |
| `validate-browser-event-admission` | 0 | pass | 15.98 | 8 GB |
| `validate-testing-session-event-admission` | 0 | pass | 9.64 | 8 GB |
| `validate-github-project-integration` | 0 | pass | 7.32 | 7 GB |
| `validate-working-notebook-contracts` | 0 | pass | 1.49 | 8 GB |
| `validate-case-l-non-event-materialization` | 0 | pass | 1.68 | 8 GB |
| `validate-implementation-readiness` | 1 | fail | 47.94 | 8 GB |
| `landing-check` | 1 | see result below | 1862.16 | 10 GB |

**Targeted tests.** Holding bucket: 34 tests, two failures; emit-only: 13 tests, one failure; coordination: 50 tests, 14 failing test/subtest cases. Every failing case matches the retained lane base output by name after normalizing only unittest's tests. module prefix (test-baseline-comparison.json). Holding-bucket failures concern the three missing approval/settings admission records; emit-only's first-40 digest and the coordination payload/schema/storage pins are pre-existing. Currentness: nine tests, one failure caused solely by the five edited owner documents' source drift; this is a reseal item. Onboarding: all 50 tests pass, including the 28-policy census. Readiness self-test and Case-L validation pass. Seven targeted contract/admission checkers pass. Implementation-readiness validation exits 1; its 31 findings include governance drift and the retained denominator/depth blockers, classified by the dry check below.

**Frozen validator, read-only.** Imported without bytecode writes; its receipt destination was redirected only in memory to the external evidence directory. All seven original frozen-directory file hashes matched before and after. Exit 1, pass=false, six open-authority findings: post_august_admission_incomplete, unexpected_august_set, fresh_census_denominator_not_closed, individual_dispositions_evidence_gap_blocking, individual_dispositions_provisional, registered_contract_depth_incomplete. Incomplete Browser/compaction depth and missing approval/settings records remain visible. No closure is claimed. Full details are in the external receipt.

**Integration integrity.** Exit 0. The 33 original lane messages/authors and the separate rebase map are preserved; the approved .gitignore diff is isolated; the 17 new PlanUnit IDs are unique and retain their reviewed Decision Log text; DL-077/DL-094 pins are unchanged; eight retirement rows retain their dispositions/evidence grades and match the ledgers; registry family count and original policies are preserved with exactly the approved Chat policy added; recount artifacts and protected paths are unchanged.

## Dry landing check and classification

**Dry landing exit: 1; blocking items: 0; infrastructure results: 0.**

Baseline `0edfd9406fb708773df7f25ce1ce25a064ae06ad`: `{'age_days': 0.07, 'ancestor': True, 'base': 'origin/main', 'base_commit': '73f2231a9ec1c93190adafcdde51030f028c8c2d', 'baseline_commit': '0edfd9406fb708773df7f25ce1ce25a064ae06ad', 'max_age_days': 7, 'reason': 'its commit 0edfd9406fb7 is an ancestor of the base origin/main (73f2231a9ec1) and 0.07 days older than it, within 7', 'rule_two_applies': True}`. All 15 recorded currentness input hashes matched before checking. Derived paths are excluded from branch matching; their PlanUnit IDs are matched against the edited owner documents.

| Aggregate | Result | Failure total | Baseline total |
|---|---|---:|---:|
| `audit-governance` | fail | 2067 | 222 |
| `plan-migration-validate` | fail | 9413 | 0 |
| `run-gates` | fail | 2067 | 222 |

Reported sets overlap: 13103 new rows, 9495 rows on branch files, 0 pre-existing rows; 13105 distinct reported items. Every distinct item is classified in landing-classification.json. The table below groups that complete classification by error kind.

| Classification | Error kind | Items |
|---|---|---:|
| branch_governance_staleness_reseal | `artifact_hash_stale` | 20 |
| branch_governance_staleness_reseal | `buildability_gate_report_stale_or_not_canonical` | 2 |
| branch_governance_staleness_reseal | `current_snapshot_batch_doc_invalid` | 1 |
| branch_governance_staleness_reseal | `current_snapshot_coverage_not_exact_same_document_planunit_set` | 15 |
| branch_governance_staleness_reseal | `current_snapshot_live_bytes_mismatch` | 8 |
| branch_governance_staleness_reseal | `current_snapshot_live_line_count_mismatch` | 6 |
| branch_governance_staleness_reseal | `current_snapshot_live_sha256_mismatch` | 8 |
| branch_governance_staleness_reseal | `current_snapshot_live_span_metadata_mismatch` | 8814 |
| branch_governance_staleness_reseal | `current_snapshot_span_sha256_mismatch` | 541 |
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

**Six findings on untouched governance files:** four missing_ref rows (the plan-graph and evidence validators in both aggregates) name Plans/.evidence/pm7-usage-recovery-plan-sharding-2026-08-29/evidence.json. Its final registry-shard reference is still 631-lines-125818-125835.md; deterministic regeneration renamed that shard to 631-lines-125818-125851.md. The designated reseal must refresh the protected evidence reference. The two historical_successor_terminal_current_snapshot_invalid rows name run-002/final_validation_summary.json and wrap the 9,413 stale current-snapshot findings. The eventual landing snapshot/baseline refresh and designated run-002 reseal follow-up resolve those. These findings were caused by this batch but are reported against governance files outside its edited paths. No protected file or generated alias was changed to suppress them.

All 11 growing subchecks are fully keyed or print every failure; none is a truncated-growth blocker. Only audit-closure remains compared by total, unchanged at 201 in each aggregate. Existing baseline findings that do not name branch files are omitted by the landing reporter; there are zero reported pre-existing rows on branch files.


## Reseal and landing follow-up

The reseal input list is Plans/Decision_Log.md, Plans/Contracts_V0.md, Plans/Run_Modes.md, Plans/storage-plan.md, Plans/storage_value_registry.json, scripts/pm-implementation-readiness.py, both changed disposition ledgers and their 33 changed row objects. reseal-inputs.json enumerates all 41 paths. The assigned reseal worker handles applicable Spec Lock entries, edited source/shard artifact evidence, currentness source bindings, run-002 batch hashes/final summary and readiness artifacts. The eventual landing agent separately refreshes the current migration snapshot and landing baseline after landing. This worker refreshed none of them.

## Open items

No product decision is supplied here. Carried exact retention questions:

- Which event starts the 90-day clock? Proposed option: first durable record creation, with no reset on retry, replay or recovery.
- How should the nine already-approved no-project Debug investigation history names be counted under the seven-year rule?
- How should the twelve memory-maintenance history names over a no-project thread-private memory corpus be counted under the seven-year rule?
- How should these five no-project candidate history names be counted under the seven-year rule? Permission override remains a non-emitting candidate.
- How should the three no-project hook candidate history names be counted under the approved 90-day terms?
- How should no-project model.catalog_refreshed records be counted under the approved 90-day terms?
- How should no-project preview history be counted under the approved 90-day terms, after the owner maps its scope and payload/adoption? This does not assert application scope for all seven names.

- Memory owner must propose age/score cutoffs for monthly summary/prune; neither job runs before approval (DL-403).
- Separate orchestrator pointer/child-run/board/raw-output owner edits and collaborative family contracts/admissions belong to batch 2.
- Storage SR-04 Boot aggregate interpretation, SR-05 future regrade and storage_maintenance_operation count/card observation remain carried notes; no choice made here.
- Chat successor physical form belongs to first admission technical work.
- CA-SEAL frozen-validator third change is excluded from batch 1.

## Evidence and handoff

All resumed raw outputs, exact commands/exit codes, stderr, copied-input hashes, rebase mapping, full landing reports/exports, every classified landing item and the frozen receipt are retained under `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/finish-VM/`. Its SHA256SUMS manifest binds every file. The report copy and delivery record bind the final branch head separately. Historical replay and stopped-run evidence remain in the parent directory. The optional ignored live-resize directory copy timed out, as on the stopped run; all required currentness files matched, nine other audit-input copies succeeded, and the evidence symlink was created.

No main push, landing lock, reseal, admission, frozen source edit, protected governance edit, pm-mail or subagent. Sol/Astra reviews are the lead's next step; none were launched in this finish. The report is committed separately from generated files. The branch is force-pushed with a lease before removing the finish worktree.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/finish-VM/rebase-map.json` — SHA-256 `0729514a3ea482c5a793fbf5b0fbb5e57c21e74f7fe078ebfbdea30cee46c79c`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/finish-VM/currentness-copy.json` — SHA-256 `26ef55265edcbd597aef3a0a001b5ddc92359fb05d828942652db5ecc50d56f0`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/finish-VM/index-generate.log` — SHA-256 `99b7faa88c7a6da66e27e451e40424634cf1ef060159e4c1cf537893d0419db6`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/finish-VM/index-validate.log` — SHA-256 `62cecf01db70bc8b33997fc3bbdf668185692fc82ac98bffc6501d6ee835f1c9`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/finish-VM/test-baseline-comparison.json` — SHA-256 `45005430c4462f7d705fd4b66e174099d60a5fdc5c449412328805f2931719e6`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/finish-VM/frozen-receipt/event_authority_validator_receipt.json` — SHA-256 `bf47b1719f11c868f552ecb81bfb1ad06877cacbe2b5c8f8fa80165181913bce`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/finish-VM/landing-check.log` — SHA-256 `f5a0cede607dcf248d31fd798d26abb8ef1824ca84c05cd69cb75738dcd27866`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/finish-VM/landing-classification.json` — SHA-256 `7f4f07140b91dc1457bc90458b56f3d11ddd1b9cf4774f5002ad5b40d36e8ace`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/finish-VM/reseal-inputs.json` — SHA-256 `a188bd918c82f55731a6d98ea546e5733ef31756b4204ee28a23edbd641e63e2`.

- `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20261104/drafts/BATCH1/finish-VM/SHA256SUMS` — SHA-256 `d7a74f40f1b0a6a3cbbc2cfbcd8112c07e2548886b482018c34ce6d56a2b947d`.
