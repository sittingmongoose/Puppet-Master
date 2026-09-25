# Brief: landing-check classification and timeout rules (2026-09-24)

You are an Opus 5 agent dispatched by the "PM Low cost/complexity process" thread. The External Research thread ("PM External Plan Audit process") owns scripts/pm-landing-check.py and reads only the report; acceptance is the deterministic checks below plus one blind form-driven review by a fresh agent of the dispatching thread (form: ~/PM-Experiments/jev-pilot-20260917/wave3/trial/INSTRUCTIONS_REVIEWER.md), cycle cap two, leftovers as open questions in the report. Read /mnt/Cursor/PuppetMaster/AGENTS.md first. Save a progress note to ~/PM-Experiments/landing-check-rules-20260924/PROGRESS.md after every step; if resumed, read it first.

Standing rule: write any handoff to a file named in your report and continue; a missing route is never a block. No attempt caps on rebases or pushes. The goal is complete when the report is written. Preflight before any git operation: `git -C /mnt/Cursor/PuppetMaster remote -v` lists origin and truenas-backup, `git -C /mnt/Cursor/PuppetMaster config --get extensions.worktreeConfig` prints true, and `df --output=pcent /home/sittingmongoose` is under 90 percent; if not, wait 15 minutes, up to 3 hours, then write the progress note and stop. Never repair .git/config.

Ownership signal: before creating the branch, and again at the first push, check `git ls-remote --heads origin 'fix/landing-check-stale-kinds-20260924*'`. If a branch of that name already exists on origin that you did not create, a Codex session holds this goal: stop and report that, touching nothing.

## Task

Make scripts/pm-landing-check.py match the AGENTS.md landing rule. Worktree ~/pm-worktrees/landing-check-stale-kinds-20260924, branch fix/landing-check-stale-kinds-20260924 from origin/main, sparse set `scripts reports tests`. Use `git push -u origin <branch>` on the first push.

Changes, and nothing beyond them:

1. Governance staleness covers every kind the rule names: Spec Lock stale_hash; stale owner and artifact evidence hashes, including event_authority_currentness_source_drift; stale readiness rows and their growth counters; the stale plan-migration snapshot. Staleness on an edited file exits 1.
2. A keyed failure present in reports/landing-checks/baseline.json whose count on the branch has not risen is pre-existing, content changed or not; it never blocks and is reported as "pre-existing" or "improved" with both counts.
3. `--subcheck-timeout-seconds` defaults to 600. A subcheck that times out is an infrastructure result: reported on its own line with the elapsed time, never counted as a new failure, growth or a blocker. Measured case: lint-contractrefs takes about 199 s in the shared checkout on the share, 0 failures when run alone.

Keep: a non-staleness failure on a touched file exits 2; a rise in a truncated subcheck exits 2; a staleness failure on an untouched file exits 1; the sparse-worktree refusal (exit 3) stays as landed.

## Evidence and tests

Replay the recorded shared-checkout runs under /mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/ and the retention-guard landing's run (paths in reports/landing-checks/LANDING_20260921.md) through the classifier; each must now exit 1 with its findings listed as staleness or pre-existing. Existing tests in tests/ still pass. Add one positive and one negative test per rule, including implementation_readiness_self_tests_failed dropping from seven to three rows on a touched file (exit 1) and lint-contractrefs exceeding the timeout (infrastructure result, exit unchanged). A new test file needs its own `!/tests/test_pm_<name>.py` line in .gitignore; `git ls-files` must name it. Record the kinds and rules in reports/landing-checks/README.md. Commit only your paths; push.

## Rule-file sentence (conditional)

Only if the dispatching thread states in its go that Jared explicitly requested the rule-file edit: add this sentence, identical in AGENTS.md and .claude/CLAUDE.md, to "How to land on main" directly after the bullet naming `git merge --ff-only`: "Landing lock: before the fetch that precedes your fast-forward, acquire /mnt/Cursor/PuppetMaster-Evidence/scratch/landing-lock/held with mkdir, write held/holder.txt with your agent name, branch and UTC time, hold it through the push of main and the worktree removal, then rm -r held; a holder older than 90 minutes is stale and may be cleared, otherwise wait five minutes and retry; branch pushes need no lock." Not a Plans edit; no regeneration follows. Without that statement, skip this section.

## Land

Acquire the landing lock: `mkdir /mnt/Cursor/PuppetMaster-Evidence/scratch/landing-lock/held`, then write held/holder.txt with agent, branch and UTC time; if mkdir fails and holder.txt is older than 90 minutes, `rm -r held` and retry, otherwise sleep 300 and retry (after 4 hours, progress note and stop). Holding it: fetch, rebase as fix/landing-check-stale-kinds-20260924-landN, tests in the worktree, then in /mnt/Cursor/PuppetMaster: if `git status` shows uncommitted changes in a file this branch touches, release the lock and stop (the one stop; report the file); otherwise `git merge --ff-only`, `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json`, `python3 scripts/pm-landing-check.py --base origin/main`, push main to origin and truenas-backup. Failures naming files this branch does not touch, or that only the shared checkout reports, are the carve-out: push and list them. A rejected push, non-fast-forward or index.lock error: repeat from fetch. Write the landing record as reports/landing-checks/LANDING_20260924_landing-check-rules.md in the same form as the other LANDING_20260924_*.md records, in the landing commit. Remove the worktree, delete the branches locally and on origin, `rm -r held`.

## Report

Main hash, rules added, replay exit codes before and after, tests added, carve-outs listed, review findings fixed and open, and the path of the landing record. State that you are an Opus 5 agent.
