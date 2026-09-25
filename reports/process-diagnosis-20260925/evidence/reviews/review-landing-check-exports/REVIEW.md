# Review: fix/landing-check-exports-20260924 at 94ea73cfee (base ac9c0ad2e4)

**Verdict: fix_then_land. Landing-ready: yes, once X-09 is either applied (it needs the coordinator's go) or recorded
as an open question.** There are 18 findings in `findings.jsonl`: 0 blocking, 1 should_fix and 17 notes. The file was
written blind, before the author's report was read.

The branch does what the brief asks.

- **Keying.** A subcheck is keyed from its export only when the export holds the printed total.
- **Judgement.** The kind rules that landed at b3169c48d9 then judge every row. The judging functions are
  byte-identical to the base.
- **Fallbacks.** Each fallback applies the truncated rule exactly as before and prints its case and reason.
- **Enumeration.** It is right: 35 of the 36 commands have a complete export, and validate-audit-closure is the one
  exception.
- **Fixture.** The reviewer's fixture exits 1 (132 staleness, 1 pre-existing). The negative case exits 2 and the
  mismatch case falls back.
- **Recorded runs.** The recorded runs give their recorded results under both replay tools.
- **Tests.** The 15 new tests fail on the old script and pass on the new one.
- **Rule text.** The sentence is verbatim and identical in both rule files, and the figure is gone.
- **The author's interpretation** (a subcheck is keyed only when the baseline holds its rows in full) is sound. The
  probes show it is necessary: without it, the tool gives a false pass in one direction and a false block in the
  other.

The should_fix item is X-09. The export is a second run, matched to the aggregate by total alone. A row the aggregate
printed that the export lacks, at an equal total, is never judged: E3 exits 1 on a printed failure on a touched file,
where the base exits 2. The real validators are deterministic, so only a change to the tree or the code between the two
runs can cause it. The guard costs nothing in a normal run, and it is proven in `patched/`.

At this landing, nothing is keyed. The committed baseline 792d2fb8b1 holds the PRD contracts only as a sample, and
audit-closure has no export; the author's live run1 shows exit 1 on main's own drift. The keying starts after the next
`--record-baseline` by this script.

## How it was checked

- `export/` is `git archive 94ea73cfee` and `base/` is `git archive ac9c0ad2e4`, each holding the scripts, the tests,
  `reports/landing-checks`, `AGENTS.md`, `.claude/CLAUDE.md` and `.gitignore`. `clone-tip` is a `git clone --shared`
  of the shared checkout. It is a separate repository that reads the shared object store and writes nothing there,
  sparse at the tip. `clone-d7e` is a worktree of that clone at d7e26ed537, `clone-full` a full one at the tip for the real run, and
  `clone-full2` a second full one for the determinism check, so the two could not disturb each other.
- Tests: tip 153 OK; base 138 OK; the tip's test file against the base script: 138 ok and all 15 new tests fail or
  error.
- Enumeration: `pm-plans-verify.py` was read at blob 53c050186, which is the same at bc1d99c11e, the base and the
  tip. The 36 commands were mapped with the tip's own `aggregate_subcheck_argv`, and every `scripts/*.py` was swept
  for failure-list truncation.
- Replays: the follow-ups agent's `replay.py` and the author's `replay_exports.py` (a copy with its output
  directory moved to my scratch), both on the base and the tip script.
- End to end: `cases/e2e.py` runs the real CLI as a subprocess in a scratch git repository, against a stand-in
  `pm-plans-verify.py`. The real `run_check`, `aggregate_subcheck_argv` and `run_export` run unpatched, and the real
  fixture file is served as the export.
- Probes: `cases/probe_i6*.py` run a copy of the tip with the baseline-sample condition disabled, only line 1321
  changed.
- Real run: the tip script, unmodified, `--record-baseline` then compare, on `clone-full` with the real validators.
  Determinism: six real commands run twice under PYTHONHASHSEED 1 and 2 on `clone-full2`.
- The X-09 repair was applied in `patched/` and rerun through the tests, the scenarios and the author's replay.

| Case | Base script | Tip script | Finding |
|---|---|---|---|
| S1: reviewer's plan-graph export (132 artifact_hash_stale + main's missing_ref) | exit 2, two truncated rises | exit 1, 0 blocking, 132 staleness + 1 pre-existing per aggregate | X-05 |
| S2: the same rows as missing_artifact | exit 2 | exit 2, 4 blocking | X-05 |
| S3: export 132 rows, printed total 133 | exit 2 | exit 2, `[not keyed] ... holds 132 rows, but the printed total is 133; the truncated rule applies` | X-03 |
| S4: export killed at a 3 s bound, grandchild in its group | - | exit 2 after 3.5 s, grandchild gone, 0 infrastructure results | X-03 |
| S5: export not JSON | - | exit 2, reason printed | X-03 |
| S6: audit-closure 150 -> 151 | - | exit 2, no export run | X-03 |
| S7: `--keep-check-reports` | - | `exports/validate-plan-graph.json`, argv, 133 rows | X-17 |
| S8: `--record-baseline`, same state | buckets | identical buckets and checks (+`exported`), + `export_buckets` | X-17 |
| E1a/E1b: run-gates baseline 60 as a sample, twin keyed, 192 now | - | exit 2, pair refused ("prints 100 of 192") | X-10 |
| E1c: the same with an exported baseline | - | exit 1 | X-10 |
| E3: printed row on a touched file absent from the export, equal totals | exit 2 | exit 1 | X-09 |
| E4: 133 new missing_ref rows on untouched paths | exit 2 | exit 1 | X-02 |
| E6: keyed readiness 10 -> 130, stale rows on a touched file | - | exit 1, labelled as the growth counter | X-11 |
| I6a: probe without the baseline condition, off-branch bucket rise | exit 2 | tip 2, probe 1 | X-06 |
| I6b: probe, pre-existing rows past the cap on a touched file | exit 1 | tip 1, probe 2 | X-06 |
| Real: record, then compare, on a full checkout with the real validators | - | record exit 0, PRD contracts keyed from a 1240-row export in 0.7 s, printed rows = the export's first rows; compare exit 0, '1240 pre-existing' | X-18 |
| Real: six validators under two hash seeds | - | identical rows, identical order | X-09 |
| E3 with the X-09 repair (`patched/`) | exit 2 | exit 2, `[not keyed] ... holds all 133 rows, but 1 of the rows the aggregate printed is not among them` | X-09 |

## Edits

### Should fix (needs the coordinator's go, because it adds a fallback case beyond the brief's list)

- **X-09, a printed row absent from the export.** In `key_from_exports`, before a subcheck is keyed, compare the
  aggregate's printed rows for it with the export's normalized rows:
  `missing = Counter(printed keys) - Counter(export keys)`. When `missing` is not empty, set the case to
  `rows_mismatch`, give the reason "its export (<command>) holds all N rows, but n of the rows the aggregate printed
  are not among them", and apply the truncated rule. Add E3 as a test. In the README, add a *rows mismatch* bullet,
  and replace "The equal total is the evidence that it saw what the aggregate saw; the rows are not compared one by
  one." with "The equal total and every printed row being among its rows are the evidence that it saw what the
  aggregate saw." On the real validators, the printed rows were exactly the export's first rows, so this adds no
  spurious fallback. Without the go, record it as an open question.

### Notes (optional, or open questions)

- X-07: correct the README's reason in the baseline-sample bullet.
- X-13: correct the README sentence about audit-closure's fallback case.
- X-10: let `pair_validators` count an audit-governance copy keyed from its export as printing every failure. It
  extends L-07, so only with the coordinator's go.
- X-11: label a keyed readiness rise as keyed, not as the growth counter. Display only.
- X-12: decide whether new staleness rows that name no branch file belong in the "report it to Jared" advice. This
  changes landed behaviour, so it is an open question.
- X-08: the rule sentence names only the total condition. Changing it needs Jared's request, so it is an open
  question.

## Conditions for the landing (not edits to this branch)

- With baseline 792d2fb8b1 nothing is keyed at this landing. The landing check behaves as the base script did, plus
  the header and the `[not keyed]` lines. Expect the author's run1 result: exit 1, with main's own drift since the
  baseline as new rows naming no branch file. Never refresh the baseline to pass this landing.
- None of the branch's five paths has a Spec Lock entry, so no reseal request follows from this branch.
- Open questions for the brief owner, left open:
  - X-09, if the coordinator does not give the go for the guard;
  - X-08, whether the rule sentence should name the baseline condition, which needs Jared's request;
  - X-10, whether the L-07 pairing should count a keyed twin as printing every failure;
  - X-12, whether new staleness rows that name no branch file belong in the "report it to Jared" advice.

## Files

All paths are under `/home/sittingmongoose/PM-Experiments/review-landing-check-exports-20260924/`.

- `findings.jsonl`, sha256 `a34fd5b436f2d5ebf7df20ef392b5f030d24b70a16e34d2df6050618d5d96723`: 18 findings and the
  summary line.
- `RECONCILIATION.md`, `PROGRESS.md`, and this file.
- `patched/`: the tip with the X-09 repair (154 OK). The diffs are `cases/edits-pm-landing-check.py.diff`,
  `cases/edits-test_pm_landing_check.py.diff` and `cases/edits-README.md.diff`, all produced by
  `cases/apply_x09_patch.py`.
- `cases/`:
  - `e2e.py` and `fake_pm_plans_verify.py`, the end-to-end harness;
  - `scenarios.py`, with its outputs in `e2e-out/` and `e2e-out-patched/`;
  - `probe_i6.py`, `probe_i6b.py` and `probe_no_baseline_condition.py`;
  - `replay_exports_copy*.py`, the author's tool with its output moved, with results in `rx/` and `rx-patched/`;
  - `followups/`, the follow-ups tool on base and tip;
  - `real/`, the real record and compare runs, the determinism check and the printed-against-export check.
- `logs/`: everything run, with hashes in `logs/final_sha256.txt` and `logs/evidence_sha256.txt`. Two helpers were
  changed after that list: `e2e.py` and `scenarios.py` gained environment switches for the tip and the output
  directory, with defaults unchanged. The final list has their current hashes.
- `clone-tip`, `clone-d7e`, `clone-full` and `clone-full2` are my own `--shared` clone and its worktrees, nothing in
  the shared checkout. Delete them when the review is closed.
