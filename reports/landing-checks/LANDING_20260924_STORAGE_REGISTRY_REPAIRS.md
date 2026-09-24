# Landing record: storage registry repairs (front 1), 2026-09-24

Branch `fix/storage-registry-repairs-20260923`, rebased onto `origin/main` `026de6f949` and checked at tip `fa909acd6a`. This record is a report-only commit on top of that tip, and `main` is fast-forwarded to it. The branch's own report is `reports/storage-registry-repairs-20260923/REPORT.md`.

**Authority.** The coordinator (PM Low cost/complexity process) gave the go on 2026-09-24. It classified the landing check's blocking rows as below, and ruled that the branch lands without a rerun as long as `main` is still `026de6f949` at the fast-forward. It was.

## Procedure

1. **Fetch and rebase.** `main` was `026de6f949`. The rebase applied all 15 commits cleanly. `main`'s seven new commits since `dca3c3349e` touched only `reports/` and two test files, so no cited canon passage moved.
2. **Regenerate.** Regenerating shards and index at the rebased tip changed only generation timestamps.
3. **Checks in the worktree**, at `fa909acd6a`:
   - shard check: pass, 99 documents, 2,720 shards;
   - index validation: pass, 6,718 PlanUnits, 26,208 acceptance units;
   - readiness: 33 failures;
   - testing-session, GitHub-project and Browser event gates: pass;
   - whole tracked suite: 908 run, 5 failures, all of which fail identically on `main`.
4. **Overlap check in the shared checkout.** It had 51 uncommitted entries:
   - 43 modified files: 41 in the concept thread's `Concepts/chat-assistant-concepts/5.6 Pro/`, plus `.omp/lsp.json` and `WATCHDOG.yml`, which are not this branch's;
   - 8 untracked files at the root.

   None is among the branch's 102 paths.
5. **Fast-forward and shard check.** `main` was fast-forwarded to `fa909acd6a`. The shared-checkout shard check passed: 99 documents, 2,720 shards.
6. **Landing check.** `python3 scripts/pm-landing-check.py --base origin/main` exits **2** with **11 blocking items**, all classified below. The JSON report is at `/mnt/Cursor/PuppetMaster-Evidence/storage-registry-repairs-20260923/landing-attempt-1-front1/land1-landing.json`, SHA-256 `6842ad2c6c30fbd6351e339ad48665936a54f408c6e5d0fc63d13d2616b54699`.
7. **Hold, ruling, push.** The first pass stopped on the self-test rows, and the unpushed fast-forward was undone. After the coordinator's ruling, `main` was fast-forwarded again, still from `026de6f949`, to this record and pushed to `origin` (GitHub and TrueNAS) and `truenas-backup`.

## Landing-check numbers

| Check | Baseline `75bcda93bc` | This landing |
|---|---:|---:|
| `run-gates` total | 2,875 | 2,827 |
| `audit-governance` total | 2,875 | 2,827 |
| `plan-migration-validate` (run 017) | 32,967 | 32,947 |
| readiness subcheck (both aggregates) | 79 | 33 |
| evidence / plan graph (truncated) | 665 / 665 | 665 / 665 |
| Spec Lock | 5 | 6 |

Other figures:
- **Branch:** 102 paths (89 derived paths excluded), 312 units.
- **Rows naming the branch's files:** 3,503. The tool excuses 3,493 of them as staleness; the other 10 are listed below.
- **New rows:** 6, all on the edited validator.
- **Truncated subchecks:** none grew.

## The 11 blocking items

| Rows | Kind | Classification |
|---|---|---|
| 6 (3 per aggregate check) | `event_record_spec_lock_hash_stale`, `storage_value_registry_spec_lock_hash_stale`, `non_executable_closure_spec_lock_hash_stale`, each with `required_path` `scripts/pm-implementation-readiness.py` | Governance staleness: the validator is Spec-Locked. **Reseal request.** |
| 1 | bucket `audit-governance/implementation_readiness/storage_value_registry_spec_lock_hash_stale`, count 1 to 2 | The same validator staleness, counted by kind. **Reseal request.** |
| 2 (1 per aggregate check) | `event_authority_currentness_source_drift`, `source_path` `Plans/storage-plan.md` | Governance staleness on a document this branch edited. It is already on `main` since the BSD lifecycle landing. **Reseal request** (currentness edition). |
| 2 (1 per aggregate check) | `implementation_readiness_self_tests_failed`, path `scripts/pm-implementation-readiness.py` | Pre-existing failure, improved by this branch; see below. **Owner: Event Authority Step 8/9 (case_l_verification).** |

**Self-test rows, in detail.** On `main`, `implementation_readiness_self_tests_failed` reports **seven** failing checks:
- in the `storage_value_registry` scenario: `membership_is_order_independent` and `valid_storage_value_registry`;
- in `case_l_verification_integration`: `event_contract_depth_residual_remains_fail_closed`, `event_denominator_residual_remains_fail_closed`, `event_family_registry_39_row_kernel_structurally_valid`, `event_family_registry_v2_exact_goal_refs_match_owner_enum` and `event_legacy_two_positive_full_negative_matrix_recomputes`.

After this branch it reports **three**: `event_contract_depth_residual_remains_fail_closed`, `event_denominator_residual_remains_fail_closed` and `event_legacy_two_positive_full_negative_matrix_recomputes`. All three fail on `main` as well and belong to the Step 8 and 9 `case_l_verification` work. The landing check counted the row as new only because its content changed: same kind, same path, different list of failing checks. The coordinator classified it as non-blocking, on the same principle as the 45 registry findings: a pre-existing failure with an unchanged or better count on a touched file.

## Reseal request

- `Plans/storage-plan.md`: Spec Lock, evidence bundle, and a currentness edition that clears the drift row.
- `scripts/pm-implementation-readiness.py`: Spec Lock (the three readiness Spec Lock kinds above and `verify_spec_lock` `stale_hash`).

No other edited file is Spec-Locked or in the currentness inventory.

## Excused by the tool as staleness

- 2,877 `current_snapshot_live_span_metadata_mismatch`
- 378 `current_snapshot_span_sha256_mismatch`
- 203 `current_snapshot_coverage_not_exact_same_document_planunit_set`
- 17 `stale_batch_report_sha256_after`
- 4 `artifact_hash_stale`
- 4 `stale_hash`
- 2 `buildability_gate_report_stale_or_not_canonical`
- 2 each of `current_snapshot_live_bytes_mismatch`, `_live_line_count_mismatch` and `_live_sha256_mismatch`
- 1 each of `current_snapshot_batch_doc_invalid` and `_batch_doc_set_not_exactly_once`

Cost: one landing check run of 13 min 43 s in the shared checkout; monetary attribution unavailable.
