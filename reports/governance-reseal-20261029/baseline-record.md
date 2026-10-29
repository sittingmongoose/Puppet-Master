# Baseline Record — Governance Reseal 2026-10-29

## Frozen binding

- Frozen `main`: `bb62e4032aecb3f32e4f2b25b40d18ed7d5b34be`
- Preparation branch: `plans/governance-reseal-20261029`
- Baseline file: `reports/landing-checks/baseline.json`
- Baseline SHA-256: `550625bc90537a9b2fb144f34b696674f149f4a3fd5ccebc34c61cdda106767a`
- Baseline commit: `70275841aa3df61471e2449451138bffd59b9196`
- Baseline recorded: `2026-10-26T17:42:32Z`
- Current run: `Plans/.plan_migration/pds-20261026-001-current-planunit-snapshot`
- Baseline buckets: 50 printed and 22 export buckets

The baseline was not edited or re-recorded in this preparation. Its commit is an ancestor of
the frozen main and three days older, so it is inside the landing check's seven-day currency
window.

## Currentness binding

The baseline binds 15 ignored files below
`Plans/.audits/event-authority-2026-08-13-currentness/`. The starting edition was copied from
the preceding reseal's reviewed external custody and independently verified: all 15 SHA-256
values equal `baseline.readiness_audit_inputs.files`. That original edition is preserved at
`/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261029/backup/currentness-baseline-15/`
for the baseline-bound comparison.

Only the seven generated files were replaced locally during preparation. The eight frozen
inputs (the expected 252-row TSV and source groups A-G) still equal the baseline after the final
install. The prepared 15-file final edition is preserved at
`/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261029/reviewed-currentness/`; its
manifest is `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261029/proof/currentness-final-manifest.json`.

The generated external edition selected for landing is
`/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261029/currentness-edition-final2/`.
The earlier `currentness-edition-final/` is superseded because the subsequent evidence refresh
is itself a currentness source.

## Comparison rule

The post-commit landing comparison selects the baseline-bound 15-file edition in the same local
ignored directory, runs with `--readiness-audit-root` pointed at that directory, preserves all
kept reports and exports externally, proves the baseline and selected edition were not mutated,
then restores all seven prepared generated files and validates the final edition. A raw exit
caused only by the checker's known summary limitation is classified from its JSON; a blocking
row, infrastructure row, incomplete report, unclassified new row, unexplained truncated growth,
or export mismatch stops the handoff.

## Post-landing refresh

This reseal changes `Plans/` paths. After its checked first push, while still holding the
landing lock, the landing agent must run `snapshot-current` and then
`pm-landing-check.py --record-baseline` in a full local worktree at the new main, commit the
snapshot and baseline together as one follow-up, and push that before releasing the lock. The
baseline is never refreshed to excuse the landing being measured.
