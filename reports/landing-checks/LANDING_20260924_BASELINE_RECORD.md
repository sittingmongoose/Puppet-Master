# Landing record: landing-check baseline re-record, 2026-09-24

Branch `plans/landing-baseline-20260924` is 1 commit on `main` `792d2fb8b1`: `2d85b37488`. `main` was fast-forwarded from `792d2fb8b1` to `2d85b37488` and pushed after the landing check. This record is a report-only commit on top, landed the same way.

**What lands.** Three report files:

- `reports/landing-checks/baseline.json`, re-recorded at `792d2fb8b1`;
- `reports/governance-reseal-20260924/baseline-record.md`;
- `reports/landing-checks/LANDING_20260924_GOVERNANCE_RESEAL.md`, the reseal's landing record.

No canon, derived file, script or governance artifact lands.

**Authority.** The re-record is the fourth condition of the 2026-09-24 governance reseal. Jared set the reseal and delegated its designation, and the coordinator relayed both. It was taken after the reseal reached `main`, not to make a landing pass. The reseal's own landing check had already exited 1 against the old baseline, with 0 blocking items.

**Landing lock.** Held since 20:44:51Z, when it was taken for the reseal landing, and kept through this landing, this record's landing and the worktree removal. No other landing happened in between.

## Procedure

1. **Baseline run.** `python3 scripts/pm-landing-check.py --record-baseline --keep-check-reports <evidence>/baseline/check-reports`, in the reseal's full worktree at `792d2fb8b1`. It ran from 21:01:45Z to 21:10:29Z and exited 0, with no subcheck timed out.
   - Totals: `run-gates` 1,470, `audit-governance` 1,470, `plan-migration-validate` 33,072.
   - The worktree's rows are identical to the rows the shared checkout's landing check read at the same commit, key for key. `baseline-record.md` gives the detail.
2. **Rebase.** At the landing fetch `origin/main` was still `792d2fb8b1`, the branch's base. No rebase was needed.
3. **Overlap check in the shared checkout,** on `main` at `792d2fb8b1`. A path-limited `git status` over the branch's three paths, `reports/landing-checks` and `reports/governance-reseal-20260924` found no uncommitted entry.
4. **Fast-forward and shard check.** `main` went from `792d2fb8b1` to `2d85b37488` at 21:13:02Z. The shared shard check passed: 99 documents, 2,722 shards.
5. **Landing check,** now measured against the new baseline: `python3 scripts/pm-landing-check.py --base origin/main --json --keep-check-reports <evidence>/landing-baseline/check-reports`. It ran from 21:13:27Z to 21:28:32Z and exits **0**. Nothing to report.
   - Totals 1,470, 1,470 and 33,072, equal to the baseline's.
   - Branch: 3 paths, no Plans document, 0 units, and no row names a branch file.
   - No new rows, no pre-existing rows reported, no grown or resolved buckets, no infrastructure results.
   - The shared checkout's `plan-migration-validate` report is byte-identical to the worktree's (SHA-256 `dfac5598…`).
6. **Push.** At 21:28:55Z `main` `2d85b37488` was pushed to `origin` (GitHub and the NAS) and to `truenas-backup`, which was already up to date through `origin`'s NAS push URL. This record then followed as a report-only fast-forward under the same lock. The landing check does not read Markdown under `reports/landing-checks/`, so this record lands with the shard check only.

## Classification

Nothing to classify: exit 0 and no blocking items.

## Reseal request

None. The standing staleness is what `baseline-record.md` lists under "What it keeps". The next nightly `snapshot-current` and baseline refresh starts from this baseline.

## Evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/governance-reseal-20260924/`.

| File | SHA-256 |
|---|---|
| `baseline/record-baseline.out` (baseline run summary) | `1bed07086754b3cb48bae6d10955c6323ba8e4843154fff167ff61d146555c44` |
| `baseline/check-reports/run-gates.json` | `99c90233bdf9fc3f0bfdacb4b6945c8d9230313c06a08a4060fc280c13295ec1` |
| `baseline/check-reports/audit-governance.json` | `a2e2544e35e1b88a9611a1330b1f7aecd04d5821b1bb7bf8f8ef028a65e6e32c` |
| `baseline/check-reports/plan-migration-validate.json` | `dfac5598b4a207b8edf17ae79331da3bdec151b33e4c28fbd9c9594bcf6e2994` |
| `reports/landing-checks/baseline.json` as landed | `0a5043f5f2e42710606b1135ff2180925dd04008a0e3a7a3c7166338b965ff96` |
| `landing-baseline/landing.json` (landing check report) | `038488f4168c0ace650065cfb1ed04c07565d944a25ecc763c615448c8cc2e81` |
| `landing-baseline/check-reports/run-gates.json` | `2251b8e244f1d6a0d19e93643c41f1647944197c1aaeff544d58dccf9b366382` |
| `landing-baseline/check-reports/audit-governance.json` | `2b76e77115922f9e3dfd1ff50b27595a1e0146ed62db1f9dbbf8610ea45cd6dd` |
| `landing-baseline/check-reports/plan-migration-validate.json` | `dfac5598b4a207b8edf17ae79331da3bdec151b33e4c28fbd9c9594bcf6e2994` |
| `landing-baseline/shared-shard-check.json` | `b8070a4e73ae546e6c7bb6814c469dd0d020724d62d5f13df27e79b6f067d55f` |

`landing-baseline/shared-overlap.txt` is empty.

Cost: the baseline run took 8 min 44 s in the worktree and the landing check 15 min 5 s in the shared checkout; monetary attribution is unavailable.
