# Baseline Record — Governance Reseal 2026-11-01

## Frozen binding

- **Frozen `main`:** `1e761d0448c5`
- **Preparation branch:** `plans/governance-reseal-20261101`
- **Baseline file:** `reports/landing-checks/baseline.json`
- **Baseline SHA-256:** `53c3ab31f28ce9e1b6927a7366f01f8519b8f77a1b4603b3f41a59175ccf32eb`
- **Baseline commit:** `00f1d5f383b80be2dcc026c526683d57528d8fb2`
- **Baseline recorded:** `2026-11-01T03:38:39Z`
- **Current run:** `Plans/.plan_migration/pds-20261101-001-current-planunit-snapshot`
- **Baseline buckets:** 88 printed and 38 export buckets

This preparation did not edit or re-record the baseline. Its commit is an ancestor of the frozen main and less than one day older, so it is inside the landing check's seven-day currency window.

## Currentness binding

The baseline binds 15 ignored files below `Plans/.audits/event-authority-2026-08-13-currentness/`. The starting edition was copied from the shared checkout and independently verified: all 15 SHA-256 values equal `baseline.readiness_audit_inputs.files`. That edition is kept at `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261101/backup/currentness-baseline-15/` for the baseline-bound comparison.

Only the seven generated files were replaced locally. The eight frozen inputs still equal the baseline after the final install: the expected 252-row TSV and source groups A to G.

The prepared 15-file final edition is kept at `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261101/reviewed-currentness/`. Its manifest is `proof/currentness-final-manifest.json`, SHA-256 `39d73676503166affd7673e9105fe6cc1ca2b247b7ccaa2d821eaac0f90656ca`. The final validator receipt SHA-256 is `4745247092bae7ecb84843f80c461d45b709856de3142a87b8ffbe151d46e8f3`.

The generated external edition selected for landing is `currentness-final/`. It was generated after the evidence bundle and the Spec Lock reached their final bytes, and it still validates against the finished tree. `currentness-1/` is superseded.

## Comparison rule

The post-commit landing comparison works as follows:
1. Move the prepared local edition aside, keeping its copy in `reviewed-currentness/`, so the check selects the baseline-bound 15-file edition from the shared checkout, its default.
2. Keep all reports and exports outside the repository.
3. Prove the baseline and the selected edition were not changed.
4. Restore the seven prepared generated files and validate the final edition.

Any of these stops the handoff:
- a blocking row;
- an infrastructure row;
- an incomplete report;
- an unclassified new row;
- unexplained truncated growth;
- an export mismatch.

## Post-landing refresh

This reseal changes `Plans/` paths. After its checked first push, still holding the landing lock, the landing agent:
1. runs `snapshot-current` in a full local worktree at the new main;
2. then runs `pm-landing-check.py --record-baseline`;
3. commits the snapshot and baseline together as one follow-up;
4. pushes that before releasing the lock.

The baseline is never refreshed to excuse the landing being measured.
