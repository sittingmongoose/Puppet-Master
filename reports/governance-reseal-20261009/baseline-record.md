# Landing-check baseline re-record, 2026-10-09

`reports/landing-checks/baseline.json` was re-recorded from a full run against `main` `cf7fdffe84`, the resealed `main`, at 2026-10-09T06:33:16Z. It replaces the baseline recorded at `4455040e46` by the NieR onboarding landing. The re-record is the last step of the reseal that `reseal-record.md` beside this file describes; Jared assigned this session to that reseal in chat on 2026-10-09.

Under the rule since 2026-09-30 the snapshot comes first: `snapshot-current` wrote run `pds-20261009-004-current-planunit-snapshot` (superseding `pds-20261009-003-current-planunit-snapshot`), and the baseline was recorded after it, so it describes the snapshot later landings are checked against. Both are in this one commit.

## Where it was recorded

It was recorded in the reseal's full worktree `~/pm-worktrees/governance-reseal-20261009`, not sparse, at `cf7fdffe84`, which was `main` and `origin/main` for the whole run. No subcheck timed out at the default 600-second bound, so the tool recorded the baseline and exited 0.

The worktree held the gitignored inputs the checks open, with the content the shared checkout has: the currentness edition (the final edition this reseal wrote in place in the shared checkout), the two small audit directories, `FINAL_REPORT.md` of the three large audit directories plus the one `audit_report.json` that `Plans/00-plans-index.md` cites, a link for `audit-20260830-001`, the three ignored `event-authority-2026-08-12` files, and the `tests/agent_packet_restrictions` link. The tool records only the last of these in `untracked_inputs`.

**It matches the shared checkout.** The reseal's landing check ran in the shared checkout on the same commit just before this run and printed the same totals: `run-gates` 1,487, `audit-governance` 1,470 and `plan-migration-validate` 0.

## What it contains

| Check | Previous baseline, `4455040e46` | This baseline, `cf7fdffe84` |
|---|---:|---:|
| `run-gates` | 4,655 | 1,487 in 6 subchecks |
| `audit-governance` | 4,638 | 1,470 in 5 subchecks |
| `plan-migration-validate` (current run) | 0 | 0 |

There are 44 buckets, none matched by count only.

**What it clears.** Before the reseal, the Plans landings since 2026-09-29 had raised Spec Lock to 17, evidence and plan graph to about 1,536 each, run 002 to 74 and readiness to about 66. All of that is gone. From now on a rise in evidence, plan graph or Spec Lock is new again.

**What it keeps, and why:**

- **Implementation readiness, 24:** the same kinds as the last three reseals: 17 `pnc019_source_hash_stale`, because the PNC-019 receipt is not reissued while DL-039 forbids certification; 2 denominator and 2 depth rows; the buildability report, one step behind by design; the legacy fixture root row; and the self-test row.
- **Plan migration (run 002), 2:** its two structural document-set mismatches.
- **`json_syntax`, 17 (run-gates only):** raw-capture manifest rows under `tests/agent_packet_restrictions`, present in the shared checkout's own landing checks before the reseal; not governance staleness and outside the reseal's scope.
- **Audit closure 201, PM7 GUI fixtures 3, PRD runtime contracts 1,240:** pre-existing, and unchanged by the reseal.

Raw output: `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20261009/landing/record-baseline.out` and `snapshot-current.out`.

Cost: one snapshot and one baseline run, kept on the first attempt; monetary attribution is unavailable.
