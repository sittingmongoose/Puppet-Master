# Landing-check baseline re-record, 2026-09-24

`reports/landing-checks/baseline.json` was re-recorded from a full run against `main` `792d2fb8b1`, the resealed `main`, recorded at 2026-09-24T21:10:29Z. It replaces the 2026-09-23 baseline from `75bcda93bc`. The coordinator set this re-record as the fourth condition of the reseal, relayed from Jared.

## Where it was recorded

It was recorded in the reseal's full worktree `~/pm-worktrees/governance-reseal-20260924`, with sparse checkout disabled, at `792d2fb8b1`. That commit was `main` and `origin/main` for the whole run, from 21:01:45Z to 21:10:29Z, and `HEAD` did not move. No subcheck timed out at the default 600-second bound, so the tool recorded the baseline and exited 0.

The worktree held the gitignored inputs the checks open, with the content they have in the shared checkout:

- the currentness edition, identical to the in-place edition the reseal wrote;
- the two small audit directories;
- `FINAL_REPORT.md` of the three large audit directories, and the one `audit_report.json` that `Plans/00-plans-index.md` cites;
- a link for `audit-20260830-001`;
- the three ignored `event-authority-2026-08-12` files;
- the `tests/agent_packet_restrictions` link.

The tool records only the last of these in `untracked_inputs`. The touch-closure central map that yesterday's baseline saw under `scratchpad/` is no longer in the shared checkout either, so its finding is not in this baseline.

**It is the shared checkout's baseline, row for row.** The reseal's landing check ran in the shared checkout on the same commit, just before this run, and kept every printed row. Both sets of reports were passed through the landing check's own `extract`. They give identical keys for 129 run-gates rows, 229 audit-governance rows and 33,072 plan-migration rows, and identical totals in every subcheck. A baseline taken in the shared checkout at this commit would therefore be this one.

## What it contains

| Check | Previous baseline, `75bcda93bc` | This baseline, `792d2fb8b1` |
|---|---:|---:|
| `run-gates` | 2,875 in 12 subchecks | 1,470 in 5 subchecks |
| `audit-governance` | 2,875 in 12 subchecks | 1,470 in 5 subchecks |
| `plan-migration-validate` (run 017) | 32,967 | 33,072 |

Per subcheck, the same in both aggregates:

| Subcheck | Previous | This |
|---|---:|---:|
| evidence | 665 | 0 |
| plan graph | 665 | 0 |
| Spec Lock | 5 | 0 |
| plan migration (run 002) | 13 | 2 |
| implementation readiness | 79 | 24 |
| touch closure | 1 | 0 |
| browser event admission | 1 | 0 |
| GitHub project integration | 1 | 0 |
| testing-session event admission | 1 | 0 |
| audit closure | 201 | 201 |
| PM7 GUI fixtures | 3 | 3 |
| PRD planning runtime contracts | 1,240 | 1,240 |

There are 62 buckets, down from 150. Three are matched by count only: the three largest run-017 snapshot buckets.

**What it clears.** The previous baseline recorded the staleness left by landing `e6571faf7a` after yesterday's reseal: 665 evidence, 665 plan-graph and 5 Spec Lock rows. Later landings reported evidence and plan-graph rises against it, to 876 each. All of that is gone. From now on, a rise in evidence, plan graph or Spec Lock is new. The four admission and touch-closure rows had already been resolved on `main` before this reseal.

**What it keeps, and why:**

- **Implementation readiness, 24:**
  - 17 `pnc019_source_hash_stale`, because the PNC-019 receipt is not reissued while DL-039 forbids certification;
  - 2 denominator and 2 depth rows;
  - the buildability report, one step behind by design, as the reseal record explains;
  - the legacy fixture root row;
  - the self-test row.
- **Plan migration, 2:** run 002's two structural document-set mismatches.
- **`plan-migration-validate`, 33,072:** run 017 snapshot staleness. Only a nightly `snapshot-current` clears it. That writes a new run directory, which is outside this reseal's scope, so it was not run here. The total is 105 above the previous baseline's 32,967. That growth is `main`'s own, measured identically on `main` before the reseal.
- **Audit closure 201, PM7 GUI fixtures 3, PRD runtime contracts 1,240:** pre-existing, and unchanged by the reseal.

This is not the nightly refresh. That refresh also takes the migration snapshot, and the rules assign it to a scheduled task.

Cost: one baseline run of 8 min 44 s, kept on the first attempt; monetary attribution is unavailable.
