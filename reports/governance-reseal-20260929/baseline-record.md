# Landing-check baseline re-record, 2026-09-29

`reports/landing-checks/baseline.json` was re-recorded from a full run against `main` `c2f98fd9ea`, the resealed `main`, at 2026-09-29T07:05:42Z. It replaces the 2026-09-24 baseline from `792d2fb8b1`. The re-record is the last step of the reseal that `reseal-record.md` beside this file describes; Jared designated this session to do that reseal in chat on 2026-09-28.

## Where it was recorded

It was recorded in the reseal's full worktree `~/pm-worktrees/governance-reseal-20260929`, not sparse, at `c2f98fd9ea`. That commit was `main` and `origin/main` for the whole run, and `HEAD` did not move. No subcheck timed out at the default 600-second bound, so the tool recorded the baseline and exited 0.

The worktree held the gitignored inputs the checks open, with the content the shared checkout has, exactly as the 2026-09-24 re-record did: the currentness edition (the final edition this reseal wrote in place in the shared checkout), the two small audit directories, `FINAL_REPORT.md` of the three large audit directories plus the one `audit_report.json` that `Plans/00-plans-index.md` cites, a link for `audit-20260830-001`, the three ignored `event-authority-2026-08-12` files, and the `tests/agent_packet_restrictions` link. The tool records only the last of these in `untracked_inputs`.

**It matches the shared checkout.** The reseal's landing check ran in the shared checkout on the same commit just before this run and printed the same totals: `run-gates` 1,470, `audit-governance` 1,470 and `plan-migration-validate` 38,569.

## What it contains

| Check | Previous baseline, `792d2fb8b1` | This baseline, `c2f98fd9ea` |
|---|---:|---:|
| `run-gates` | 1,470 in 5 subchecks | 1,470 in 5 subchecks |
| `audit-governance` | 1,470 in 5 subchecks | 1,470 in 5 subchecks |
| `plan-migration-validate` (run 017) | 33,072 | 38,569 |

There are 62 buckets, the same as before. Three are matched by count only: the three largest run-017 snapshot buckets.

**What it clears.** Before the reseal, the landings since 2026-09-24 had raised Spec Lock to 25, evidence and plan graph to 1,722 each, run 002 to 110 and readiness to 83. All of that is gone. From now on a rise in evidence, plan graph or Spec Lock is new again.

**What it keeps, and why:**

- **Implementation readiness, 24:** the same kinds as the last two reseals. They are 17 `pnc019_source_hash_stale`, because the PNC-019 receipt is not reissued while DL-039 forbids certification; 2 denominator and 2 depth rows; the buildability report, one step behind by design; the legacy fixture root row; and the self-test row.
- **Plan migration, 2:** run 002's two structural document-set mismatches.
- **`plan-migration-validate`, 38,569:** run 017 snapshot staleness. Only a nightly `snapshot-current` clears it. That writes a new run directory, which is outside the reseal's scope, so it was not run here. The rise from 33,072 is `main`'s own growth since 2026-09-24 (the Settings rework and the wand-modules canon among the 343 commits from `792d2fb8b1` to `0a9a27fcb4`), measured identically in the reseal's before-run.
- **Audit closure 201, PM7 GUI fixtures 3, PRD runtime contracts 1,240:** pre-existing, and unchanged by the reseal.

This is not the nightly refresh. That refresh also takes the migration snapshot, and the rules assign it to a scheduled task. No such task has run since the run-017 snapshot of 2026-09-06, so the run-017 count keeps growing with every Plans landing until one does.

Raw output: `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20260929/landing/record-baseline.out`.

Cost: one baseline run, kept on the first attempt; monetary attribution is unavailable.
