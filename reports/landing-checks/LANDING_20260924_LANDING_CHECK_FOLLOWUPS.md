# Landing record: landing-check follow-ups L-05, L-07, L-08 and the landing rules text, 2026-09-24

Branch `fix/landing-check-followups-20260924`: 6 commits on `main` `aa38fc0454`, ending at
`f0e194b6b4`. `main` was fast-forwarded from `aa38fc0454` to `f0e194b6b4` and pushed after the
landing check. This record is a report-only commit on top, landed the same way. The branch was built
on `f1ce058ccd` and rebased onto the resealed `main` at landing. Its commits were pushed before the
rebase as `dbedab111b`, `7acba51c9b`, `a581a97a1b`, `683af89d39`, `a5d849035b` and `b6dfeb7a42`.

**What lands.** `scripts/pm-landing-check.py`, `tests/test_pm_landing_check.py`,
`reports/landing-checks/README.md`, and three passages of `AGENTS.md` and `.claude/CLAUDE.md`, which
are byte-identical in the two files. No canon, derived file or governance artifact changes.

- **L-05 (`3e867163f8`).** Rule 2 now applies only while the baseline is current. Rule 2 is the one under
  which a pre-existing failure never blocks. Current means the baseline's commit is an ancestor of
  the base and is at most 7 days older than it, by commit time. Otherwise rule 2 is off for the
  landing, and the report's first three lines say the baseline is stale and must be re-recorded
  before the next landing, never to pass this one. `--json` carries `baseline_currency`.
- **L-08 (`4c95cae1c8`).** A subcheck timeout lifts exit 0 to 1 and changes no other exit code. The
  timeout line names the subcheck, how long it ran and the limit, and `--json` rows carry
  `limit_seconds`.
- **L-07 (`083e7acc5e`).** A run-gates subcheck that prints only a sample, now or at the baseline, is
  judged by the audit-governance copy of the same validator when all of these hold:
  - both copies run the same command line, read from `pm-plans-verify.py`'s own helpers;
  - both ran at the same version: `HEAD` and a digest of `scripts/` are unchanged across the two
    aggregates;
  - neither copy timed out;
  - the totals agree;
  - the audit-governance copy printed every failure, now and at the baseline;
  - every run-gates row is among its rows.

  Otherwise the run-gates copy keeps the truncated rule, and the report says why. The summary prints
  one line per such subcheck, and `--json` carries `validator_pairs`.
- **Rule text, three commits.**
  - `9473727263` makes the reseal-scope sentence of "How to commit and push" name migration run 002,
    `pds-20260611-002-atomize-planunits`, the run the aggregate checks validate.
  - `2b8b4bd239` changes the exit codes and "What to do with what it reports" in "How to land on main".
    They now describe rules 2 and 3 together with L-05, L-07 and L-08.
  - `f0e194b6b4` makes the truncated-subcheck bullet state its two exceptions: the readiness growth
    counter, and a run-gates copy judged by its paired complete audit-governance copy.
- **Tests:** 123 before, **138** after, all OK.

**Authority.**
- **Answers.** The brief owner answered L-05, L-07 and L-08 "yes", with the conditions implemented
  above. The owner is the External Research thread, the "PM External Plan Audit process". The
  answers are in
  `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/ANSWERS_LANDING_CHECK_L05_L07_L08_20260924.md`
  (SHA-256 `fc5fe70f69b565da96471da461548439c68f4cae0dcc3f63a5069004a438d4c0`). That file says the
  rule-file text needs Jared's explicit request.
- **Rule-file text.** The coordinator relayed Jared's explicit request on 2026-09-24. It covers
  rules 2 and 3 with the answers. The coordinator also relayed that the run-002 correction to the
  reseal-scope sentence, and the exceptions in the truncated-subcheck bullet, are covered by it. The
  lander did not see the request itself.
- **Go.** The coordinator gave the landing go on 2026-09-24.
- **Review.** The review that raised the three findings is
  `/home/sittingmongoose/PM-Experiments/landing-check-review-20260924/`.

**Landing lock.** The reseal agent held the lock from 20:44:51Z for the reseal, the baseline
re-record, their landing records and its worktree removal. This landing polled every five minutes
from 20:44:16Z. It took the lock at 21:34:40Z, when the lock was free and `origin/main` had moved to
`aa38fc0454`, before the landing fetch. It held the lock through the fast-forward, the shard check,
the landing check, both pushes of `main`, this record's landing and the worktree removal.

## Procedure

1. **Rebase.** At the landing fetch, `origin/main` was `aa38fc0454`, three commits on the branch's
   base `f1ce058ccd`:
   - `792d2fb8b1`, the governance reseal;
   - `2d85b37488`, the baseline re-record at `792d2fb8b1`;
   - `aa38fc0454`, that landing's record.

   Those three commits changed 15 paths, none of them the branch's 5, and the rebase was clean.
2. **Checks in the worktree** at `f0e194b6b4`:
   - `python3 -m unittest tests.test_pm_landing_check`: 138 tests, OK;
   - shard check: pass, 99 documents, 2,722 shards.
3. **Overlap check in the shared checkout.** It was on `main` at `aa38fc0454`, equal to
   `origin/main`. The fast-forward writes 5 paths. A path-limited `git status` over them,
   `reports/landing-checks`, `AGENTS.md` and `.claude/CLAUDE.md` found no uncommitted entry. The 43
   other uncommitted paths in the checkout are none of the branch's.
4. **Fast-forward and shard check.** `main` went from `aa38fc0454` to `f0e194b6b4` at 21:35:24Z. The
   shared shard check passed: 99 documents, 2,722 shards. Its output is byte-identical to the
   worktree's.
5. **Landing check,** with the new script, which is what lands:
   `python3 scripts/pm-landing-check.py --base origin/main --json --keep-check-reports <evidence>/landing/check-reports`.
   It ran from 21:35:51Z to 21:50:03Z and exits **0** with **0 blocking items**. stderr is empty.
   - **L-05, first live reading.** The baseline is current, so rule 2 applies. Its commit
     `792d2fb8b1` is an ancestor of the base `aa38fc0454` and 0.03 days older than it.
   - **Totals:** `run-gates` 1,470, `audit-governance` 1,470, `plan-migration-validate` 33,072,
     equal to the baseline's.
   - **Branch:** 5 paths, no Plans document, 0 units. **0 rows name a branch file.**
   - **Other rows:** no new, pre-existing, grown, resolved or infrastructure rows.
   - **L-07.** Two run-gates subchecks print only a sample: `validate_audit_closure` (50 of 201) and
     `validate_prd_planning_runtime_contracts` (50 of 1,240). Neither is paired, because their
     audit-governance copies print only 100 rows, and the summary says so on one line each.
     Readiness, now 24, is printed in full by both copies, so it needs no pairing.
   - **Rows against the baseline landing:** the kept rows are identical key for key to the baseline
     landing's at `2d85b37488` (129 run-gates, 229 audit-governance and 33,072 plan-migration rows).
     The `plan-migration-validate` report is byte-identical (`dfac5598…`).
   - **Text summary:** `landing.txt` was rendered from the kept reports by the landed script's
     `main()`, with the recorded branch paths and base. Its JSON equals the recorded report on every
     compared field. It ends "Nothing to report. The three checks found only what the baseline
     already knew."
6. **Push.** At 21:50:36Z, `main` `f0e194b6b4` was pushed to `origin` (GitHub and the NAS) and to
   `truenas-backup`, which was already up to date through `origin`'s NAS push URL. This record then
   followed as a report-only fast-forward under the same lock. The landing check does not read
   Markdown under `reports/landing-checks/`, so the record was landed with the shard check and was
   not run through the landing check again.

## Classification

Nothing to classify: exit 0 and no blocking items. The four evidence and plan-graph rises that the
last four landings excused are gone. The reseal brought both totals to 0 on `main`, and the baseline
was re-recorded after it.

## Reseal request

None from this branch. It edits no canon and no currentness source. None of its five paths has a
Spec Lock entry in the resealed `Plans/Spec_Lock.json`.

## Before the landing

- **Worktree tool run.** At `a5d849035b`, before the reseal, the tool ran against the old baseline
  `75bcda93bc` in a full worktree. It exited 2 on exactly the four evidence and plan-graph rises,
  665 -> 876, which were `main`'s own state. Other results:
  - readiness paired, 30 = 30;
  - 0 rows named a branch file;
  - the old script gave the same verdict on the same kept reports.
- **Replays.** The retained runs were replayed through each commit's script, and the rules landing
  exactly through `main()` from its kept check reports.

  | Run (baseline) | Recorded | Before this branch (`f1ce058ccd`) | After (`a581a97a1b`, the L-07 commit before rebase) |
  |---|---|---|---|
  | gl-bounded and retention-guard, shared, 2026-09-21 (`b29eab7b99`) | 2, 8 and 2, 7 | 1, 0 each | 1, 0 each; rule 2 is off for both, because `b29eab7b99` is not on `main`, and no row relied on it |
  | storage registry repairs, shared (`75bcda93bc`) | 2, 11 | 2, 1 | **1, 0**: readiness paired, 33 = 33 |
  | terminal.workgroup_moved, shared (`75bcda93bc`) | 2, 12 | 2, 4 | 2, 4: readiness paired, 39 = 39; the two timeouts change nothing |
  | landing-check rules, shared, exact `main()` (`75bcda93bc`) | 2, 4 | 2, 4 | 2, 4: readiness paired, 39 = 39 |

  Each cell gives the exit code, then the number of blocking items.

## Conditions and open questions carried forward

- **The rule-file text landed on a relayed request.** The lander did not see Jared's request itself.
  `2b8b4bd239`'s message still says "lands only on Jared's request". The coordinator confirmed that
  condition, and the message was left as pushed, at the coordinator's direction.
- **The reseal-scope sentence** keeps every word of the coordinator's replacement, with one change of
  place. The clause about `current_run.json` closes the sentence, so that "and the currentness
  edition" stays in the scope list.
- **Stale counts.** The truncated-subcheck bullet still gives "8,800 of the 9,807" from the first
  baseline. Against today's baseline, 4 subchecks print only part of their failures and 2,582
  failures are never keyed.
- **L-07 depends on two private helpers** of `pm-plans-verify.py`, `_aggregate_subcheck_command_id`
  and `_aggregate_subcheck_cli_args`. If they are renamed, every copy falls back to the truncated
  rule and says why; nothing is paired by mistake. On today's `main` nothing needs pairing. Readiness
  pairs whenever run-gates truncates it (above 50) and audit-governance does not (100 or less).
- **L-08 changed the timeout line.** "its time bound" is now "at its limit of N s", so a tool that
  parses the text summary must follow. `--json` only gained `limit_seconds`.
- **Disk-full incident.** The VM's root disk filled at about 20:10Z, from another worktree's copies of
  ignored films. One working-tree file of this branch was truncated and rebuilt byte for byte.
  Nothing committed was affected.

Cost: the landing check took 14 min 12 s in the shared checkout, and the pre-landing tool run 9 min
7 s in the worktree. Monetary attribution is unavailable.

## Evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/scratch/landing-check-followups-20260924/`.

| File | SHA-256 |
|---|---|
| `landing/landing.json` (landing check report) | `d2f766497e91fbe37c01b2e6d604436de5943749dfc562a58b8bc452737aa927` |
| `landing/landing.txt` (text summary, rendered from the kept reports) | `59c2b5620a944c1e18644ac33df2b041403b78be28396054d744e6359d7dc44f` |
| `landing/check-reports/run-gates.json` | `2dd97c3244f1c36be7db464f0dc6cef225a78d636aa3899ee8b79c4027da56d6` |
| `landing/check-reports/audit-governance.json` | `a9c3da5c5c77f8db9f683661522a141f9c171fe610761e7827763bb0b6102e95` |
| `landing/check-reports/plan-migration-validate.json` | `dfac5598b4a207b8edf17ae79331da3bdec151b33e4c28fbd9c9594bcf6e2994` |
| `landing/shared-shard-check.json` | `b8070a4e73ae546e6c7bb6814c469dd0d020724d62d5f13df27e79b6f067d55f` |
| `landing/worktree-tests.txt` (138 tests) | `acf9c628913d4eceb13f36ab7c6550088c5f1f34444bad057c890fe306d53b62` |
| `tool-run/summary.txt` (pre-landing worktree run) | `1bc3b97a9cb458b6b7124fe8302048003f574832ea8e0c55cd268bdaeaa8622a` |
| `replay.py` (replay script) | `90720511b732aed54a261014a43607f2b357371b3b5a6afc392bea7587c295c0` |
| `replay-f1ce058ccd/replay.json` (before this branch) | `30f334f4e9639c510b955ea1ef4dddf8f2f2c82f8c094ea7d3c83967a58f9487` |
| `replay-a581a97a1b/replay.json` (after L-07) | `678a9bf2ae0ff1a3ef75923e893c0cd2492ffb60cc22935bf968ec2eea830615` |

Also kept, under `landing/`:
- the step logs, `phase-a.txt`, `phase-b1.txt` and `push.txt`;
- the lock holder line, `lock-holder.txt`;
- `worktree-shard-check.json`, byte-identical to the shared checkout's;
- `shared-overlap.txt`, which is empty.

The replays of the L-05 and L-08 commits are in `replay-dbedab111b/` and `replay-7acba51c9b/`.
