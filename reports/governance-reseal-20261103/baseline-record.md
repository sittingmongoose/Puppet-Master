# Baseline Record — Governance Reseal 2026-11-03

## Frozen binding

- **Frozen `main`:** `4dbe63c96c464a9a90b790739d77a90bda619871`
- **Preparation branch:** `plans/governance-reseal-20261103`
- **Baseline file:** `reports/landing-checks/baseline.json`
- **Baseline SHA-256:** `a243b984f069871760252503900c71a210d397a67d939d8ef85318ea25133d2c`
- **Baseline commit:** `8895b233be5a2c2fafd60db51b08a1d44a76b9e6`
- **Baseline recorded:** `2026-11-04T02:36:07Z`, by `claude-projects-refresh` after its landing
- **Current run:** `Plans/.plan_migration/pds-20261104-001-current-planunit-snapshot`
- **Baseline buckets:** 102 printed and 40 export buckets

This reseal did not edit or re-record the baseline before landing. Its commit is the parent of the frozen main and less than one hour older, so it is inside the landing check's seven-day currency window.

## Currentness binding

The baseline binds 15 ignored files below `Plans/.audits/event-authority-2026-08-13-currentness/`. The starting edition was copied from the shared checkout and independently verified: all 15 SHA-256 values equal `baseline.readiness_audit_inputs.files`. That edition is kept at `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261103/backup/currentness-baseline-15/` for the baseline-bound comparison. Its proof is `proof/currentness-baseline-binding.json`.

Only the seven generated files were replaced locally. After the final install, the eight frozen inputs still equal the baseline: the expected 252-row TSV and source groups A to G.

The prepared 15-file final edition is kept at `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261103/reviewed-currentness/`:
- its manifest is `proof/currentness-final-manifest.json`, SHA-256 `126c4309ca775ccb0d0d0b78f35044635890a8fc74d103c41a5fc2d0f87e313c`;
- its validator receipt SHA-256 is `7e54ba80e607e3384fb0862a9363f2c6abc258ae4c3cf17666560280237e5471`;
- its `EVENT_FAMILY_DENOMINATOR_STATUS.json` pins registry `2026-11-04.1`, 46 families, SHA-256 `443ae71d7e6326c3673a409f63950b9f33713c67f43c256fed6efa1c0d03a653`.

The edition selected for landing is `currentness-final/`. It was generated after the receipt, the evidence bundle and the Spec Lock reached their final bytes. After the decision row was appended, it was validated again against the finished tree: `evidence_valid=true`, `event_authority_closed=false`. `currentness-1/` is superseded.

## Comparison rule

The post-commit landing comparison works as follows:
1. Move the prepared local edition aside, keeping its copy in `reviewed-currentness/`, so the check links the baseline-bound 15-file edition from the shared checkout, its default.
2. Keep all reports and exports outside the repository.
3. Prove the baseline and the selected edition were not changed.
4. Restore the prepared edition and validate it.

Any of these stops the landing:
- a blocking row;
- an infrastructure row;
- an incomplete report;
- an unclassified new row;
- unexplained truncated growth;
- an export mismatch.

## Post-landing refresh

This reseal changes `Plans/` paths. After its checked first push, still holding the landing lock, the landing agent:
1. installs the seven prepared generated currentness files into the shared checkout and validates them;
2. runs `snapshot-current` in a full local worktree at the new main;
3. then runs `pm-landing-check.py --record-baseline`;
4. commits the snapshot and baseline together as one follow-up;
5. pushes that before releasing the lock.

The baseline is never refreshed to excuse the landing being measured.
