# Landing record: governance reseal, 2026-09-24

Branch `plans/governance-reseal-20260924` is 1 commit on `main` `f1ce058ccd`: `792d2fb8b1`. `main` was fast-forwarded from `f1ce058ccd` to `792d2fb8b1` and pushed after the landing check. This record lands in the next commit, beside the re-recorded baseline, under the same lock.

**What lands.** The repository-wide governance reseal:

- `Plans/Spec_Lock.json`;
- the live plan-sharding evidence bundle: `evidence.json`, `shard_report.json` and `shard-check-report.json`;
- the buildability and node-readiness reports;
- run 002's `batch_report.jsonl` and `final_validation_summary.json`;
- one `Plans/auto_decisions.jsonl` row;
- `reports/governance-reseal-20260924/reseal-record.md` and `attestation.json`.

No canonical document, validator, registry or other thread's file lands. As part of the landing, the gitignored Event Authority currentness edition was written in place in the shared checkout.

**Authority.** Jared authorized the reseal and delegated the designation of the Plans agent. The coordinator relayed both, with the scope, the conditions and the landing go. The coordinator also decided the migration-run question: run 002 only, as `reseal-record.md` explains.

**Landing lock.** The lock was free and was acquired at 20:44:51Z, before the landing fetch. It is held through:

- the in-place write, the fast-forward, the shard check, the landing check and the push of `main`;
- the baseline landing and its record's landing;
- the worktree removal.

## Procedure

1. **Rebase.** At the landing fetch `origin/main` was still `f1ce058ccd`, the branch's base. No rebase and no re-run of the refresh was needed.
2. **Checks in the worktree** at `792d2fb8b1`:
   - shard check: pass, 99 documents, 2,722 shards;
   - `verify-spec-lock`: pass;
   - plan-index validate: pass;
   - `run-gates`: 1,470 failures in 5 subchecks, against 3,279 in 8 before the reseal.
3. **Overlap check in the shared checkout.** It was on `main` at `f1ce058ccd`. A path-limited `git status` over the branch's 11 paths and `reports/landing-checks` found no uncommitted entry. The in-place currentness edition was still the one the backup holds.
4. **Currentness edition in place.** At 20:45:20Z the seven generated files of `currentness-edition-final` were copied over the in-place edition in `Plans/.audits/event-authority-2026-08-13-currentness/`. They were checked against their manifest, and the eight frozen inputs were unchanged. The previous edition is in the reseal backup.
5. **Fast-forward and shard check.** `main` went from `f1ce058ccd` to `792d2fb8b1` at 20:45:20Z. The shared shard check passed: 99 documents, 2,722 shards. The in-place edition validates from the shared checkout with `evidence_valid: true`, `event_authority_closed: false`, and all 14 checks true.
6. **Landing check:** `python3 scripts/pm-landing-check.py --base origin/main --json --keep-check-reports <evidence>/landing/check-reports`. It ran from 20:45:58Z to 21:00:41Z and exits **1** with **0 blocking items**.
   - **Totals:** `run-gates` 1,470, `audit-governance` 1,470, `plan-migration-validate` 33,072. The baseline `75bcda93bc` has 2,875, 2,875 and 32,967.
   - **Subchecks still failing,** in each aggregate: audit closure 201, implementation readiness 24, plan migration 2, PM7 GUI fixtures 3, PRD runtime contracts 1,240. Evidence, plan graph and Spec Lock now pass.
   - **Branch:** 11 paths and no Plans document, so 0 units. **2 rows name a branch file.** Both are the buildability report's `buildability_gate_report_stale_or_not_canonical`, one per aggregate. They are governance staleness, and the designed residual of the reseal (`reseal-record.md`, "One residual").
   - **New rows: 0.**
   - **Pre-existing: 1.** The audit-governance `implementation_readiness_self_tests_failed` row reads 1 -> 1 and names no branch file.
   - **Grown: `plan-migration-validate`,** 32,967 -> 33,072. It is not truncated, and the growth is in two run-017 snapshot buckets:
     - `current_snapshot_live_span_metadata_mismatch`, 28,185 -> 28,243;
     - `current_snapshot_span_sha256_mismatch`, 1,204 -> 1,251.

     This is `main`'s state, not this branch's. The branch does not touch run 017, and its `plan-migration-validate` report is byte-identical to the one the landing-check rules landing kept (SHA-256 `dfac5598…`). Both kinds are staleness.
   - **Resolved: 62 buckets,** 51 in audit-governance and 11 in run-gates. They include every Spec Lock `stale_hash`, run 002's stale-batch and live-count rows, the currentness source drift, and the readiness Spec Lock-hash kinds. The storage-registry, touch-closure and admission buckets among them had already been resolved on `main` by earlier landings.
   - **Infrastructure results: none.**
7. **Push.** At 21:01:23Z `main` `792d2fb8b1` was pushed to `origin` (GitHub and the NAS) and to `truenas-backup`, which was already up to date through `origin`'s NAS push URL.

## Classification

Nothing blocks. The exit 1 comes only from the two staleness rows on the branch's buildability report, the one artifact the governance cycle leaves one step behind. The coordinator had allowed for evidence and plan-graph rises against the old baseline. There are none: both went to 0.

## Reseal request

None. This landing is the reseal. What stays stale, and why:

- the buildability report, one step behind by design;
- run 017's snapshot staleness, which only the nightly `snapshot-current` clears;
- the PNC-019 receipt's 17 source hashes, which stay stale until DL-039 allows a certification.

## Evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20260924/`.

| File | SHA-256 |
|---|---|
| `landing/landing.json` (landing check report) | `23ae57d92cb443949b796861fac1890d0191caeb83e178ff2792f106a799d3c6` |
| `landing/check-reports/run-gates.json` | `4e022b6faac0362f2d77a9753bc665b7a9707d33e8a723a684fe929a5b9b3416` |
| `landing/check-reports/audit-governance.json` | `36611c4016cc534afd0a8686c761c52034cf7724127e0148b8ed39c87450ced1` |
| `landing/check-reports/plan-migration-validate.json` | `dfac5598b4a207b8edf17ae79331da3bdec151b33e4c28fbd9c9594bcf6e2994` |
| `landing/shared-shard-check.json` | `b8070a4e73ae546e6c7bb6814c469dd0d020724d62d5f13df27e79b6f067d55f` |
| `landing/currentness-validate-in-place.out` | `c1a812cd48c307af8ff0870839204f748202c0c5f035eb6751650741bc0a384b` |
| `landing/in-place-edition.SHA256SUMS` (all 15 in-place files) | `e32dde35a6577dc0ffcad128c77ede9ce770e87b35208c0b469b71873e16c583` |
| `currentness-edition-final.SHA256SUMS` (the 7 generated files) | `069fe48b521e0ab5f07864842361879809d1f95ab9aa9d2039dd45ec6e7f7e78` |
| `backup/SHA256SUMS` (pre-reseal backup) | `d0cf34e168fd3d039ab4db2621b7c90d3bb18e90d8676acbea122753a957dd60` |
| `before/run-gates-before.json` | `1013317d3582fa5d318afcee1e6dc635065eefbe3a6ece5894d59a000d37f109` |
| `after/run-gates-after.json` | `30cf8e5c60f9faace74e3ffada371749d1b9a63f0b4919b169789344c4c77e62` |

`landing/shared-overlap.txt` is empty.

Cost: the landing check took 14 min 43 s in the shared checkout; monetary attribution is unavailable.
