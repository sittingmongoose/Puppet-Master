# Reconciliation: blind findings against the implementer's report

I wrote the findings (`findings.jsonl`, 15 findings, 0 blocking, verdict `fix_then_land`) before
reading `~/PM-Experiments/landing-check-rules-20260924/REPORT.md`. This file sets out where the
report already covers a finding, where the two differ, and what the report does not mention. I have
not edited `findings.jsonl` since reading the report.

## Where the report and the blind findings agree

| Finding | What the report says | Reconciled |
|---|---|---|
| L-01 (both replays: old exit 2 with 8 and 7 blocking; new exit 1 with 0 blocking) | Same numbers. Their control through the old classifier also reproduces all six recorded exit codes. | Agree. My replay was built independently (`cases/replay.py`, baseline blob from `9368d26b7c`) and gives the same result. |
| L-07 (the storage registry self-test row still blocks through its run-gates copy) | Open question 1; the supplementary replay shows exit 2 with 1 blocking | Agree. It is documented, and the follow-up (use the sibling aggregate's complete bucket) lies outside the brief. |
| L-09 (rule 3 behaves as specified) | Same, including why the elapsed time shown is the bound | Agree. |
| L-10, L-11 (baseline refusal on a timeout, `buildability_passed_with_stale_source_hashes`, the `_spec_lock_hash_stale` suffix) | Judgment calls to confirm (open question 4) | Confirmed sound, with one runbook sentence added for L-10. |
| L-14 (scope, tracking, tests) | 96 tests before, 117 after, three paths | Agree. I reran them from a scratch export: 117 OK. |
| L-15 (the touch_closure rows are neither staleness nor pre-existing) | Declared as a "Deviation from the brief's wording" | Agree. The rows are new, name no branch file, and exit 1 under AGENTS.md. Resolved. |
| C4a (a real readiness failure above the cap, hidden during a rise whose sample shows the branch's own drift) | Open question 2, and the README states it | Agree. It is the accepted hole of the growth-counter rule. |

## Where they differ

- **L-03 (the replay depends on the unrecorded sample rows).** The report does state that the
  readiness counter "was read over the printed rows that were kept, not over the whole sample".
  Its table still presents "exit 1, 0 blocking" as a plain result. The blind review measured how
  much that caveat matters: one unrecorded pathless non-stale readiness row flips both replays to
  exit 2 with 2 blocking. Such a row is plausible, because the 2026-09-21 ignored audit inputs
  differ from today's, and the registry at `d09377d4eb` and `8e27ca6832` does not match today's
  status file, so `event_authority_currentness_live_registry_drift` could have been printed. The
  report's caveat is honest but understated. I would downgrade L-03 from should_fix to one added
  sentence in the report. It is listed under "Edits" in REVIEW.md.
- **L-12 (artifact_drift and validator_drift left out).** The report asks for confirmation. I
  confirm `artifact_drift`: its targets are gitignored, and no branch can move them. I only partly
  confirm `validator_drift`. A branch that edits `scripts/pm-event-authority-currentness.py` is
  stopped by a hash that only a currentness edition can refresh. That is the situation the tool
  already treats as staleness for `*_spec_lock_hash_stale` on an edited validator script. The
  README's reason ("a canon edit changes neither") is true but leaves this case out. This remains a
  note, not a blocker, because blocking is the conservative direction.

## Not in the report

- **L-02: the growth counter does not require the stale growth to be the branch's.** Case C4b: the
  branch's edited files show no staleness; only `main`'s own drift rows are visible; a real failure
  sits at row ~150 on the branch's own registry file. The new classifier exits 1 and the old one
  exits 2. Neither AGENTS.md ("staleness for documents your branch edited") nor the brief's Keep
  rule ("a truncated rise exits 2") supports that. The one-line repair keeps all tests and both
  replays at exit 1 and makes C4b exit 2 (`patched/`).
- **L-04: same-bucket swap on an edited file.** One failure fixed and another added, same kind and
  path, reads as pre-existing, and the tool says there is "nothing for this branch to fix". This
  follows from the brief's "content changed or not", but neither the README nor the output says so.
- **L-05: baseline lag.** Rule 2 compares against `baseline.json` (`75bcda93bc`), not `main`. A
  failure fixed on `main` since then and reintroduced by a branch on its own edited file reads as
  pre-existing with exit 1, where the old classifier gave exit 2. The room this leaves exists today:
  readiness is 79 in the baseline and about 30 on `main`.
- **L-06: a crash reads as an improvement.** A subcheck that stops part-way lowers bucket counts,
  and what is left on the branch's files is "improved". The crash row blocks only if it names a
  branch file.
- **L-08: exit 0 with "Nothing to report" when a subcheck did not finish.** The exit is what the
  brief requires. The sentence is false, and a branch that makes a subcheck hang turns an exit 2
  (C5a) into it (C5b).
- **L-13: tests for the above are missing.** `patched/` adds three and adjusts one assertion:
  120 tests OK.

## The report's open question 3 (rule text)

AGENTS.md still says "A failure that names a file your branch touches and is not governance
staleness stops the landing". After rule 2, the tool exits 1 for such a failure when its bucket
count has not risen. The tool and the rule file will disagree from the moment this lands. The
report's proposed wording is adequate. It needs Jared's explicit request (CLAUDE.md scope), so it
is a landing condition to raise, not an edit for this branch.
