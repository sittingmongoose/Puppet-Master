# Review: fix/landing-check-stale-kinds-20260924 at e1365986e1 (base d7e26ed537)

**Verdict: fix_then_land.** 15 findings, 0 blocking, 6 should_fix, 9 notes (`findings.jsonl`).

The three rules do what the brief says. Existing tests still pass, and each rule has a positive and
a negative test. The old classifier reproduces the two recorded shared-checkout results: exit 2 with
8 blocking items, and exit 2 with 7. The new classifier gives exit 1 with 0 blocking for both,
provided no unrecorded readiness row was a non-stale new kind (L-03).

The fixes are these:

- one overreach in the readiness growth counter (L-02);
- two summary sentences that claim more than the tool knows (L-04, L-08);
- README text for the limits the rules accept but do not state (L-04, L-05, L-06, L-08, L-12, L-10);
- three tests (L-13);
- one sentence in the implementer's report (L-03).

Every code and test edit below is applied in `patched/`. There, the 117 existing tests plus 3 new
ones pass (120 OK), both replays still exit 1 with 0 blocking, and case C4b now exits 2
(`cases/*_patched*`).

## How it was checked

- `export/` holds `git archive e1365986e1` and `base/` holds `d7e26ed537`, for the script, the
  tests and `reports/landing-checks`. `python3 -m unittest tests.test_pm_landing_check` in
  `export/` runs 117 tests, OK.
- `cases/replay.py` replays both classifiers over the two retained `--json` reports, against the
  baseline those runs used. That baseline is `9368d26b7c:reports/landing-checks/baseline.json`,
  commit `b29eab7b99`. The rows the reports do not retain are filled from that baseline, so no
  bucket grows. `cases/replay.py <kind>` swaps one filler row in each readiness sample for a
  pathless row of that kind.
- `cases/exploits.py` builds the cases on a temporary git repository, with the aggregates stubbed
  the way `LandingRun` stubs them, and runs the old and the new script on each.

| Case | Old | New | Finding |
|---|---|---|---|
| Replay, `shared-landing-resumed.json` | exit 2, 8 blocking (recorded 8) | exit 1, 0 blocking | L-01 |
| Replay, `landing-shared-attempt1.json` | exit 2, 7 blocking (recorded 7) | exit 1, 0 blocking | L-01 |
| The same, plus one unrecorded `live_registry_drift` row in each readiness sample | 8 / 7 | exit 2, 2 blocking | L-03 |
| C1: one missing_ref fixed and another added, same edited document | 2 | 1 ("nothing for this branch to fix") | L-04 |
| C2: rows fixed on `main` since the baseline, brought back on the edited registry | 2 | 1 | L-05 |
| C3a: validator stops part-way, pathless crash row | 2 | 1 ("improved 3 -> 1") | L-06 |
| C3b: the same, with a crash row naming the edited file | 2 | 2 | L-06 |
| C4a: readiness 124 -> 218, the branch's own drift visible, real failure at row ~150 | 2 | 1 | accepted, documented |
| C4b: the same, but only `main`'s drift is visible | 2 | 1 | L-02 |
| C5a: lint_path_refs reports a broken ref on the edited document | 2 | 2 | control |
| C5b: the same subcheck is killed at its bound | 1 | 0 ("Nothing to report.") | L-08 |

## Edits to land

### 1. `scripts/pm-landing-check.py`: `edits-script.diff`

sha256 `e4ca6f61f66d404b601b9ba9a76ec90d9235e08ca281680079a3f360ad3631bb`.

- **L-02.** `readiness_counter_is_staleness` takes `on_branch_keys`. Stale growth counts only when
  the grown stale row is on the branch:
  `stale_growth = stale_growth or (rose and (on_branch_keys is None or item["key"] in on_branch_keys))`.
  The caller passes `{item["key"] for item in on_branch}`.
- **L-04.** In the loop, count the pre-existing rows that are both fresh and on the branch
  (`changed_on_branch`). When that count is above 0, the advice reads "pre-existing failures whose
  count has not risen, N of them with changed content on files this branch touched, so compare those
  with the baseline's rows: the same count can hide one failure fixed and another added" instead of
  "so nothing for this branch to fix".
- **L-08.** When nothing is reported but `infrastructure` is non-empty, print "Nothing reported by
  the subchecks that finished. This is not a clean result: the subchecks below the line did not
  finish." instead of "Nothing to report. ...". The final timeout line ends "rerun each on its own
  and judge what it reports by the same rules before pushing main."
- None of the three changes alters an exit code, except L-02's, which applies to a readiness rise
  whose visible stale growth names no branch file.

### 2. `tests/test_pm_landing_check.py`: `edits-tests.diff`

sha256 `23878e08d86d8b7f5d5971be183916db2dd9629bd35a697c2882f5f52755e52e`.

- In `test_seven_rows_dropping_to_three_on_a_touched_file_are_improved_and_exit_one`, the assertion
  "nothing for this branch to fix" becomes "3 of them with changed content on files this branch
  touched".
- A new class `ReviewLimits(LandingRun)` holds three tests:
  - `test_a_readiness_rise_whose_stale_growth_names_no_branch_file_blocks` (C4b, exit 2);
  - `test_a_same_bucket_swap_on_a_touched_file_is_pre_existing_and_flagged` (C1, exit 1, flagged);
  - `test_a_timeout_alone_is_not_reported_as_nothing` (C5b, exit 0, not called clean).

### 3. `reports/landing-checks/README.md`

**"The readiness growth counter".** Replace the first bullet with:

> - at least one printed row is a staleness kind whose bucket is new or holds more rows than the
>   baseline's, and that row names a file this branch touched, so the stale growth is visible and is
>   the branch's; and

After "Otherwise it is judged like any other truncated rise and stops the landing.", add:

> Stale growth that names only files the branch did not touch, such as `main`'s own drift since the
> baseline, does not count.

**"Pre-existing and improved failures".** After the "What this cannot see" paragraph, add:

> It cannot tell one failure from another of the same kind on the same path. A branch that fixes one
> missing reference in a document it edits and adds another keeps the bucket's count, so the new one
> reads as pre-existing. The summary counts such rows, meaning changed content on a file the branch
> touched, so that the lander compares them with the baseline's. The count it compares against is the
> baseline's, not `main`'s. A failure that `main` fixed after the baseline's commit, and that a branch
> brings back on a file it edits, reads as pre-existing, so the older the baseline, the more such
> regressions it excuses. A count that fell because the subcheck stopped part-way reads as improved.
> The stop itself stops the landing only if it names a file of the branch's; otherwise it is reported
> as new.

**"Subchecks that time out".** After "rerun each on its own to see what it reports.", add:

> A timeout hides everything the subcheck would have reported, including failures on the branch's
> own files, and the exit code does not show it. Before pushing `main`, the lander reruns each
> timed-out subcheck on its own and judges what it reports by the rules above. The summary never
> calls such a run clean.

To the paragraph "A baseline is never recorded from a run in which a subcheck timed out", add:

> The nightly refresh reruns with a larger bound the same night rather than skipping. A skipped
> refresh leaves an older baseline, and rule 2 compares against it.

**"Deliberately not on the list".** Replace the clause "`event_authority_currentness_artifact_drift`
and `_validator_drift`, because a canon edit changes neither an audit artifact nor the validator"
with:

> `event_authority_currentness_artifact_drift`, because the audit artifacts are gitignored and no
> branch can change them, so drift there means the ignored inputs changed; and
> `event_authority_currentness_validator_drift`, which a canon edit cannot cause but an edit of
> `scripts/pm-event-authority-currentness.py` does. Such a branch stops at landing until a
> currentness edition refreshes the ignored receipt.

### 4. The implementer's report (L-03)

In "Caveats and controls", after the first bullet, add:

> The exit 1 is conditional. One unrecorded printed readiness row of a non-stale kind in a new
> bucket makes both replays exit 2 with 2 blocking items. An example is
> `event_authority_currentness_live_registry_drift`, which is plausible at `d09377d4eb` and
> `8e27ca6832`: their `Plans/event_family_registry.json` does not match today's status file, and the
> 2026-09-21 ignored inputs differed from today's.

## Conditions for the landing itself (not edits to this branch)

- **AGENTS.md and `.claude/CLAUDE.md` will disagree with the tool.** They still say that a
  non-staleness failure on a touched file stops the landing, and rule 2 makes the tool exit 1 for
  it. The report's open question 3 has adequate wording. It needs Jared's explicit request, so raise
  it at the landing go.
- **The landing check of this branch will itself exit 2.** The cause is the evidence and plan-graph
  truncated rises from 665 to 876: `main`'s state since the baseline `75bcda93bc`, as the report and
  the last two landing records show. Classify them as before. The baseline must not be refreshed to
  pass this landing.
- Open questions for the brief owner, left open:
  - whether rule 2 should apply only to a baseline no older than the base's last landing (L-05);
  - whether an infrastructure result should lift exit 0 to a non-blocking 1 (L-08);
  - whether the run-gates copy of a validator should be judged by the audit-governance copy's
    complete counts (L-07).

## Files

All paths are under `/home/sittingmongoose/PM-Experiments/landing-check-review-20260924/`.

- `findings.jsonl`: sha256 `c01e9ca21058ff9b26459d0213030ff756833318cdb6c769561a5710d60f088f`.
- `RECONCILIATION.md` and `PROGRESS.md`.
- `edits-script.diff` and `edits-tests.diff`, with `patched/` as the tree they produce.
- `cases/`: `replay.py` (`b9835ad1…`), `exploits.py` (`4ff9e6be…`), `replay_neutral.txt`
  (`d055d9cb…`), `replay_inject_live_registry_drift.txt` (`bcc6f6f8…`) and `exploits_output.txt`
  (`13561f63…`), plus the `*_patched*` variants.
