# Landing record: the landing check keys a truncated subcheck from its validator's export, 2026-09-24

Branch `fix/landing-check-exports-20260924`: 7 commits on `main` `3c4a64b2b5`, ending at `d30bbc95e8`.
`main` was fast-forwarded from `3c4a64b2b5` to `d30bbc95e8` and pushed after the landing check. This
record is a report-only commit on top, landed the same way under the same lock, as `f1ce058ccd` and
`b3169c48d9` were. The branch was built on `bc1d99c11e`, rebased onto `ac9c0ad2e4` before the review
(pushed as `e6aacc8ccc`, `578208f35f`, `2614ef579f`, `94ea73cfee`, then `ec0dfd9008`, `35c3e0aa47` and
`d941c0d3b5` for the review fixes), and rebased onto `3c4a64b2b5` at landing without conflict.

Landed by an Opus 5.5 agent dispatched by the "PM Low cost/complexity process" coordinator, for the
External Plan Audit thread ("PM External Plan Audit process"), which owns `scripts/pm-landing-check.py`.

**What lands.** `scripts/pm-landing-check.py`, `tests/test_pm_landing_check.py`,
`reports/landing-checks/README.md`, and one bullet of `AGENTS.md` and `.claude/CLAUDE.md`, which is
byte-identical in the two files. No canon, derived file or governance artifact changes.

- **The repair (`caf6faca5d`).** A run-gates or audit-governance subcheck that prints only 50 or 100 of
  its failures is keyed from its export: the report its command writes when the check runs the same
  command line again, as `pm-plans-verify.py` builds it for the aggregates. The subcheck is keyed when
  its command writes a complete export, the baseline holds its rows in full (printed, or recorded from an
  export), the export finishes within `--subcheck-timeout-seconds`, and its total equals the printed
  total. Then every row is judged by the kind rules and the subcheck is not truncated. Otherwise the
  truncated rule applies as before, and the summary says which case and why. `--record-baseline` keys
  from exports too, and records their rows as `export_buckets` beside the printed `buckets`.
  `--keep-check-reports` keeps each export as `<dir>/exports/<command>.json`.
- **Which subchecks have an export,** read in `scripts/pm-plans-verify.py` and every validator it calls,
  not guessed. The two aggregates run 36 commands: 36 subchecks in run-gates and 33 in
  audit-governance. 35 of the commands write a complete export, covering 67 of the 69 subchecks.
  `validate-audit-closure` does not, because `cmd_validate_audit_closure` keeps only the first 200 of its
  validator's errors; that pair stays under the truncated rule. The run header prints the list, and a
  test pins it against the real script.
- **README (`e39945efd8`).** The new section "Subchecks keyed from their export" lists the commands with
  the subchecks of each, the conditions, the fallbacks, the baseline fields and the `--json` fields.
- **Rule text (`a7ce78f4c5`).** The truncation bullet gains the brief's sentence verbatim: "A subcheck
  whose validator writes a complete export is keyed from that export when the export's total matches the
  printed total, and is then not truncated; the check prints which subchecks were keyed this way." The
  first baseline's figure ("8,800 of the 9,807") is replaced with no figure.
- **Record run (`29f422b2ef`).** A `--record-baseline` run prints the list of complete exports too.
- **Review fixes.** `ae29c53f6c` (X-09), `8f839f8520` (X-07) and `d30bbc95e8` (X-13); see "Review" below.
- **Tests:** 138 before, **154** after, all OK. The 16 new tests are 13 in `ExportKeyedSubchecks` and 3 in
  `RunExport`. The 15 of them that the first review saw fail on the script at `bc1d99c11e`.

**Authority.**
- **Brief.** `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/BRIEF_LANDING_CHECK_EXPORTS_20260924.md`
  (SHA-256 `d6abaa6def8168fcf1b7006f668dd351cf6e9977a28c26bf285c472452738b1e`), with the standing rule,
  preflight and landing lock of `BRIEF_LANDING_CHECK_RULES_20260924.md` beside it (SHA-256
  `c3dd3d6424e75f0f6c8f183b37fb3b52b1f55650c76cb53351d640c5a3a898f0`).
- **Rule text.** The brief's "Rule text (conditional)" section was done on Jared's explicit request of
  2026-09-24 ("Yes you can do the rule change."). The coordinator relayed it; the lander did not see it
  itself. The rule text is its own commit, and its message says so.
- **X-09.** The coordinator gave the go as the dispatching thread, because the repair strengthens the
  brief's match condition, and is telling the tool owner.
- **Go.** The coordinator gave the landing go after the re-check at `d941c0d3b5`.

**Landing lock.** The DL-039 Steps 8-9 agent held the lock from 23:48:31Z for
`plans/ea-step08-remaining-plan-20260924` and again from 00:06:09Z (2026-09-25) for
`plans/ea-validator-post-august-20260924`. This landing polled every five minutes from 23:59:53Z and took
the lock at 00:29:54Z, when it was free, before the landing fetch. It held the lock through the
fast-forward, the shard check, the landing check, both pushes of `main`, this record's landing and the
worktree removal.

## Procedure

1. **Preflight.** `origin` and `truenas-backup` are both listed, `extensions.worktreeConfig` is true, and
   `/home` was at 76 percent.
2. **Rebase.** At the landing fetch, `origin/main` was `3c4a64b2b5`, 49 commits past the branch's base
   `ac9c0ad2e4`. Among them are the DL-039 Step 8 and validator landings. None of them touches the
   branch's 5 paths, and the rebase was clean.
3. **Checks in the worktree** at `d30bbc95e8`:
   - `python3 -m unittest tests.test_pm_landing_check`: 154 tests, OK;
   - the replays below, at the rebased tip, unchanged;
   - shard check: pass, 99 documents, 2,722 shards.

   The rebased branch was pushed with a lease.
4. **Overlap check in the shared checkout.** It was on `main` at `3c4a64b2b5`, equal to `origin/main`. The
   fast-forward writes 5 paths. A path-limited `git status` over them, `reports/landing-checks`,
   `AGENTS.md` and `.claude/CLAUDE.md` found no uncommitted entry. The 43 other uncommitted paths in the
   checkout are none of the branch's.
5. **Fast-forward and shard check.** `main` went from `3c4a64b2b5` to `d30bbc95e8` at 00:31:53Z. The
   shared shard check passed: 99 documents, 2,722 shards. Its output is byte-identical to the worktree's.
6. **Landing check,** with the new script, which is what lands:
   `python3 scripts/pm-landing-check.py --base origin/main --json --keep-check-reports <evidence>/landing/check-reports`.
   It ran from 00:32:14Z to 00:47:10Z and exits **1** with **0 blocking items**. stderr is empty.
   - **Baseline:** current, so rule 2 applies. Its commit `792d2fb8b1` is an ancestor of the base
     `3c4a64b2b5` and 0.16 days older than it.
   - **Totals:** `run-gates` 1,495 and `audit-governance` 1,495, against the baseline's 1,470 each;
     `plan-migration-validate` 33,072, equal to the baseline's.
   - **Branch:** 5 paths, no Plans document, 0 units. **0 rows name a branch file.**
   - **Exports:** 4 subchecks printed only a sample, and none was keyed.
     - `validate_audit_closure` and `audit_closure` fall back as "no complete export".
     - `validate_prd_planning_runtime_contracts` (50 of 1,240) and `prd_planning_runtime_contracts`
       (100 of 1,240) fall back as "baseline sample", because the baseline printed only a sample of them
       and recorded no export.
     - So the landing was judged exactly as the previous script would have judged it, plus the header
       lines.
   - **No infrastructure results.** No subcheck timed out.
   - **Text summary:** `landing.txt` was rendered from the kept reports by the landed script's `main()`,
     with the recorded branch paths and base. Its JSON equals the recorded report on every compared
     field.
7. **Push.** At 00:47:39Z, `main` `d30bbc95e8` was pushed to `origin` (GitHub and the NAS) and to
   `truenas-backup`, which was already up to date through `origin`'s NAS push URL. This record then
   followed as a report-only fast-forward under the same lock.

## Classification

Exit 1: nothing reported stops the landing. All 50 new rows are governance staleness that names no
file of this branch, 25 in each aggregate. They are `main`'s own drift since the baseline, from the
DL-077/DL-078 and DL-039 Step 8 edits of `Plans/Decision_Log.md`:

- 11 `artifact_hash_stale` rows in each of the evidence and plan-graph copies, for `Decision_Log.md`
  and its 10 shards in the live plan-sharding evidence bundle (0 -> 11);
- 1 `event_authority_currentness_source_drift` row for `Decision_Log.md` in each readiness copy
  (24 -> 25);
- 1 `stale_batch_report_sha256_after` and 1 `complete_final_summary_live_plan_unit_count_stale` row
  in each plan-migration copy (2 -> 4).

No bucket grew. No subcheck rise is truncated, since every rise stays inside its print cap. No row is
pre-existing on a branch file. As the rule reads, these rows are reported, not fixed. They clear at the
designated Plans agent's next reseal and the nightly baseline refresh.

## Reseal request

None from this branch. It edits no canon and no currentness source, and none of its five paths has a
Spec Lock entry.

## Before the landing

- **Replays,** by `replay_exports.py` at each tip, through the script at `origin/main` (before) and this
  branch's (after).

  | Run (baseline) | Recorded | Before | After |
  |---|---|---|---|
  | gl-bounded, shared, 2026-09-21 (`b29eab7b99`) | 2, 8 | 1, 0 | 1, 0 |
  | retention-guard, shared, 2026-09-21 (`b29eab7b99`) | 2, 7 | 1, 0 | 1, 0 |
  | `b3169c48d9` record, exact `main()` from its kept check reports (`792d2fb8b1`) | 0, 0 | 0, 0 | 0, 0, equal to the recorded report |
  | landing-check rules, exact `main()` (`75bcda93bc`) | 2, 4 | 2, 4 | 2, 4 |
  | **ea-certified-anchors**, the reviewer's plan-graph export (133 rows) | - | **2, 2** | **1, 0** |
  | the same rows with a kind that is not staleness | - | - | 2, 4 |
  | an export of 132 rows against a printed total of 133 | - | - | 2, 2, falls back with the reason |

  Each cell gives the exit code, then the number of blocking items.
  - The other four retained runs replay identically before and after too.
  - In the anchors case, the before column is exit 2 on the two truncated rises. After, both copies are
    keyed from the export: 132 staleness and 1 pre-existing each.
- **Live runs** in a full worktree at `94ea73cfee`:
  - run 1, the branch against `origin/main` `ac9c0ad2e4`: exit 1, 0 on branch files;
  - run 2, a scratch baseline recorded with exports: the PRD contracts were keyed in both copies from a
    real 1,240-row export;
  - run 3, the same tree against that baseline: exit 0, with the PRD contracts keyed and the unkeyed
    failures down from 2,582 to 252.

## Review

A blind form-driven review of `94ea73cfee`, by a fresh agent of the dispatching thread, is in
`~/PM-Experiments/review-landing-check-exports-20260924/`. Its `findings.jsonl` has SHA-256
`a34fd5b436f2d5ebf7df20ef392b5f030d24b70a16e34d2df6050618d5d96723`. Verdict: fix_then_land,
landing-ready yes. It raised 18 findings: 0 blocking, 1 should_fix and 17 notes.

It confirmed:
- the enumeration;
- the unchanged judging functions;
- every fallback's printed case;
- the replays;
- the author's baseline condition, which it found sound and necessary: without it, its probes show a
  false pass one way and a false block the other.

Fixed, one commit each, in the reviewer's words, and re-checked at `d941c0d3b5`:
- **X-09** (should_fix, `ae29c53f6c`). A keyed subcheck trusted its export by total alone, so an export
  lacking a printed row at an equal total was a false pass (case E3). It now falls back as
  `rows_mismatch` unless every printed row's key is among the export's keys, counted as multisets.
  - This is the reviewer's `patched/` version and its E3 test.
  - The module docstring's list of fallback cases and the README's list of `--json` cases also name
    `rows_mismatch`.
- **X-07** (`8f839f8520`): the README explains the baseline-sample fallback by the mechanism the code has.
- **X-13** (`d30bbc95e8`): audit-closure falls back as "no complete export", before and after the refresh.

## Conditions and open questions carried forward

- **Keying starts with the next `--record-baseline`.** At this landing nothing was keyed, because baseline
  `792d2fb8b1` holds the PRD contracts only as a sample.
  - Evidence and plan-graph are complete in that baseline (0 each). So a branch whose rise in them passes
    a print cap is keyed from its export as soon as this is on `main`; that includes
    `plans/ea-certified-anchors-20260924`.
  - The PRD contracts are keyed once the nightly refresh records them from their export.
  - Audit-closure is never keyed.
- **X-08, the rule sentence.** It names only the total condition, while the tool also requires the
  baseline to hold the subcheck's rows in full. The reviewer's candidate wording adds "and the baseline
  holds that subcheck's rows in full, printed or recorded from an export". That change needs Jared's
  request, which the coordinator is asking for.
- **X-10, the L-07 pairing with a keyed twin.** `pair_validators` still reads an audit-governance copy's
  printed count when that copy is keyed from its export. So a run-gates copy whose baseline holds a
  sample of 51 to 100 rows can still block on a rise above 100. That is no worse than before, and it
  cannot happen with this baseline. An optional repair is for the tool owner: count a keyed twin as
  printing every failure (`keyed_rows` in `now()`).
- **X-11, the label of a keyed readiness rise.** A keyed readiness rise that is stale growth on the
  branch's files is labelled as the readiness growth counter, not as keyed. This is display only.
- **X-12, the advice on staleness of regenerated shards.** Keyed staleness rows for the regenerated shards
  of edited documents are new rows naming no branch file, so the summary advises "report it to Jared" for
  them. That advice logic predates this branch. Should such rows be left out of that advice, or counted
  apart?

Cost: the landing check took 14 min 56 s in the shared checkout. The lock wait was 30 minutes. Monetary
attribution is unavailable.

## Evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/scratch/landing-check-exports-20260924/`.

| File | SHA-256 |
|---|---|
| `landing/landing.json` (landing check report) | `56cd3c5901eeb934ca6de5031b74a728093656fd4f0427ed35c24f776c09c455` |
| `landing/landing.txt` (text summary, rendered from the kept reports) | `7e34244cd7a6fe51faef90016333a907dea123f1bc542e9da01f45e740cb86b5` |
| `landing/check-reports/run-gates.json` | `8202ed7bcb9965671704af2891f68ca8e378a294bb6be3fbc99d513d996e1f14` |
| `landing/check-reports/audit-governance.json` | `598bdbe18c684959bb6aebc2762f2e39da6916f4af761a7f574b215f6ffa5bf2` |
| `landing/check-reports/plan-migration-validate.json` | `71d7d2e0c4280ca09e201ec74ba5a9a99a0c2b4369050d0394870fbb641de0ff` |
| `landing/shared-shard-check.json` (byte-identical to the worktree's) | `b8070a4e73ae546e6c7bb6814c469dd0d020724d62d5f13df27e79b6f067d55f` |
| `landing/worktree-tests.txt` (154 tests) | `ef34ae7a4315b54af6ddf69e49b0019b6e3d37b82c642d6c64c03d1cebc0e8bc` |
| `landing/replay-d30bbc95e8/replay.json` (replays at the landed tip) | `381d311ef9ef73d3b725d048cedf30d220db312bc57c5d329e5498ca42df0c5c` |
| `landing/replay-d30bbc95e8/replay.txt` | `7d0cd1929848ac0d917df191487910b1cfb5bdbec8946b5269df5430d139e2a2` |
| `live/SHA256SUMS` (the three live runs) | `7f8424d96e273ac813185ca03a2d605868270b1be496bb7c2bf9f363015f91f7` |
| reviewer's fixture, `~/PM-Experiments/review-ea-anchors-20260924/chk-validate-plan-graph-export-rebased.json` | `c6a0a6d105ae113d6ea58e538314df2deec448483e0a6b2b59cdeb7ba4934063` |

Also kept, under `landing/`:
- the step logs, `phase-a.txt`, `phase-b1.txt`, `phase-b2.txt`, `ff.txt` and `push.txt`;
- the lock holder line, `lock-holder.txt`;
- `shared-overlap.txt`, which is empty.

The replay tool `replay_exports.py` and the run notes are in `~/PM-Experiments/landing-check-exports-20260924/`.
