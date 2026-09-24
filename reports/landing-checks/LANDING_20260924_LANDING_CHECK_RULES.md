# Landing record: landing-check rules (staleness kinds, pre-existing, timeouts), 2026-09-24

Branch `fix/landing-check-stale-kinds-20260924`: 13 commits on `main` `d7e26ed537`, ending at
`a0f9847b32`. `main` was fast-forwarded from `d7e26ed537` to `a0f9847b32` and pushed after the
landing check. This record is a report-only commit on top, landed the same way.

**What lands.** `scripts/pm-landing-check.py`, `tests/test_pm_landing_check.py` and
`reports/landing-checks/README.md` only. No canon, derived file or governance artifact changes.

- **Rule 1 (`47d84afc18`).** Governance staleness now covers every kind the AGENTS.md rule names.
  The additions are `event_authority_currentness_source_drift`,
  `buildability_passed_with_stale_source_hashes` and every readiness `*_spec_lock_hash_stale` kind.
  They count as rows and as grown buckets. A truncated readiness rise is the growth counter of stale
  readiness rows when its printed rows show stale growth on the branch's own files and nothing else
  new. Every other truncated rise still exits 2.
- **Rule 2 (`60e11b0bab`).** Take a failure that is not staleness, in a `baseline.json` bucket whose
  count on the branch has not risen. It is pre-existing, content changed or not. It never blocks,
  and it is reported as `pre-existing` or `improved` with both counts.
- **Rule 3 (`e1365986e1`).** `--subcheck-timeout-seconds` defaults to 600, where it was 180. A
  subcheck timeout is an infrastructure result: it gets its own line and its elapsed time. It is
  never a new failure, growth or a blocker, and it does not change the exit code.
  `--record-baseline` refuses such a run.
- **Review fixes, one commit per finding:**
  - `67d388457d` L-02: the growth counter needs stale growth on the branch's files.
  - `94f0d76310` L-04: pre-existing rows with changed content on a touched file are flagged.
  - `23d551e9a2` L-05: the baseline commit is printed beside the pre-existing list.
  - `31c642fe2c` L-06 and `5796ef815a` L-07: documented limits.
  - `6f8d1e3a3e` L-08: a run with a timed-out subcheck is never called clean.
  - `cfe0661133` L-10: a refused nightly baseline is rerun the same night.
  - `f960777853` L-12: `event_authority_currentness_validator_drift` is staleness, and its reseal is
    a currentness edition.
  - `f527835275` L-13: three tests.
  - `a0f9847b32` L-03: `--keep-check-reports DIR` keeps every printed row, so a replay is exact.
- **Tests:** 96 before, **123** after, all OK.

**Authority.** Jared authorized the goal. The brief is
`/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/BRIEF_LANDING_CHECK_RULES_20260924.md`,
from the External Plan Audit thread, which owns the script. The coordinator (PM Low cost/complexity
process) dispatched the work and relayed the authorization. A blind form-driven review by a fresh
agent returned **fix then land**: 15 findings, 0 blocking, 6 should-fix
(`/home/sittingmongoose/PM-Experiments/landing-check-review-20260924/`). Every fix it prepared was
applied, and the coordinator decided the two judgment calls: L-12 adds the kind, and L-10 adds the
runbook sentence. The coordinator gave the landing go on 2026-09-24 with that one review cycle.

**Landing lock.** The lock was free when checked at 19:32:27Z and was acquired at 19:32:32Z, before
the landing fetch. It was held through the fast-forward, the shard check, the landing check, both
pushes of `main`, this record's landing and the worktree removal.

## Procedure

1. **Rebase.** At the landing fetch `origin/main` was still `d7e26ed537`, the branch's base, so no
   rebase was needed.
2. **Checks in the worktree** at `a0f9847b32`:
   - `python3 -m unittest tests.test_pm_landing_check`: 123 tests, OK;
   - shard check: pass, 99 documents, 2,722 shards.
3. **Full-list deltas against `main` `d7e26ed537`.** Each standalone subcheck was run with its full
   failure list at `main` and at the branch tip, in full checkouts. The lists were diffed by the
   landing check's own `normalize` keys.

   | Subcheck | `main` | Branch | Added | Removed |
   |---|---:|---:|---:|---:|
   | `validate-evidence` | 876 | 876 | 0 | 0 |
   | `validate-plan-graph` | 876 | 876 | 0 | 0 |
   | `verify-spec-lock` | 10 | 10 | 0 | 0 |
   | `validate-implementation-readiness` | 30 | 30 | 0 | 0 |
   | `validate-prd-planning-runtime-contracts` | 1,240 | 1,240 | 0 | 0 |
   | `validate-audit-closure` | 201 | 201 | 0 | 0 |

   `scripts/pm-landing-check.py` has no Spec Lock entry, so no Spec Lock row names the edited
   script.
4. **Overlap check in the shared checkout.** It was on `main` at `d7e26ed537`. A path-limited
   `git status` over the branch's three paths and `reports/landing-checks` found no uncommitted
   entry.
5. **Fast-forward and shard check.** `main` went from `d7e26ed537` to `a0f9847b32` at 19:33:12Z.
   The shared shard check passed: 99 documents, 2,722 shards.
6. **Landing check,** with the new script, which is what lands:
   `python3 scripts/pm-landing-check.py --base origin/main --json --keep-check-reports <evidence>/check-reports`.
   It ran from 19:33:40Z to 19:47:33Z and exits **2** with **4 blocking items**, all classified
   below.
   - Totals: `run-gates` 3,279, `audit-governance` 3,279, `plan-migration-validate` 33,072. The
     baseline `75bcda93bc` has 2,875, 2,875 and 32,967. The totals match the DL-070 closeout
     landing's.
   - Branch: 3 paths and no Plans document, so 0 units. **0 rows name a branch file.**
   - New rows: 61, all staleness: 42 `stale_batch_report_sha256_after`, 10 Spec Lock `stale_hash`,
     6 `event_authority_currentness_source_drift`, and one each of the `event_record_`,
     `storage_value_registry_` and `non_executable_closure_spec_lock_hash_stale` readiness kinds.
     They are the keys the last two landings listed. Rule 1 now classes them as staleness.
   - Pre-existing: 1. The audit-governance `implementation_readiness_self_tests_failed` row reads
     1 -> 1 with changed content and names no branch file.
   - Grown buckets: 6, all staleness. Two of them blocked the last two landings and are staleness
     under rule 1 now: `audit-governance/implementation_readiness/event_authority_currentness_source_drift`
     at 4 -> 10, and `storage_value_registry_spec_lock_hash_stale` at 1 -> 2.
   - Infrastructure results: none. `lint-contractrefs` finished within the new 600-second bound.
   - The full check reports are kept, every printed row, for an exact replay later.
7. **Push.** At 19:47:51Z, `main` `a0f9847b32` was pushed to `origin` (GitHub and the NAS) and to
   `truenas-backup`, which was already up to date through `origin`'s NAS push URL. This record then
   followed as a report-only fast-forward under the same lock. The landing check does not read
   Markdown under `reports/landing-checks/`, so the record was landed with the shard check and was
   not run through the landing check again.

## Classification of the 4 blocking items

| Rows | What | Classification |
|---:|---|---|
| 4 | Truncated-subcheck rises of `evidence`/`validate_evidence` and `plan_graph`/`validate_plan_graph`, from 665 to 876 in both aggregates | **Evidence and plan-graph hash staleness that is already `main`'s state since the baseline; the branch adds 0.** The full-list deltas above show 876 on `main` and 876 on the branch, with 0 added and 0 removed. The last three landings recorded the same 876. Rule 1 keeps a truncated rise blocking outside the readiness counter, so these stay blocking until the next reseal. The baseline was not refreshed to pass this landing. |

Nothing else blocks. The old classifier on the same `main` state (the DL-070 closeout landing) gave
exit 2 with 8 blocking. The other four items are staleness now: two drift rows on that landing's
edited document, and the two grown buckets above.

## Reseal request

None from this branch. It edits no canon, no Spec-Locked file and no currentness source. `main`'s
standing reseal requests, from the earlier 2026-09-24 records, are unchanged.

## Conditions and open questions carried forward

- **AGENTS.md and `.claude/CLAUDE.md` now disagree with the tool.** They still say a non-staleness
  failure on a touched file stops the landing; under rule 2 the tool exits 1 when its bucket count
  has not risen. They also say nothing about infrastructure results. Changing the rule text needs
  Jared's explicit request. Proposed wording is in the implementer's report,
  `~/PM-Experiments/landing-check-rules-20260924/REPORT.md`, open question 3.
- **Open questions for the brief owner,** from the review:
  - whether rule 2 should apply only to a baseline no older than the base's last landing (L-05);
  - whether an infrastructure result should lift exit 0 to a non-blocking 1 (L-08);
  - whether the run-gates copy of a validator should be judged by the audit-governance copy's
    complete counts (L-07).
- **For future landings,** pass `--keep-check-reports` with a directory under
  `/mnt/Cursor/PuppetMaster-Evidence/`, as README "Commands" says.

## Replays of the two 2026-09-21 shared-checkout runs

These are replayed through the landed classifier against the baseline those runs used, `b29eab7b99`.

| Run | Recorded | Replayed |
|---|---|---|
| gl-bounded-acceptance-20260921, shared checkout | exit 2, 8 blocking | exit 1, 0 blocking |
| retention-guard landing, shared checkout | exit 2, 7 blocking | exit 1, 0 blocking |

- The formerly blocking items are staleness: source-drift rows on the edited documents, and the
  readiness rise from 124 to 218 as the growth counter.
- Two touch-closure rows per run stay new and name no branch file.
- Replaying the same runs through the old classifier gives back all six recorded verdicts.
- The exit 1 is conditional (review L-03): the retained reports do not hold the whole readiness
  sample.

Cost: the landing check took 13 min 53 s in the shared checkout. The six standalone full-list pairs
took under 20 s each in the worktrees. Monetary attribution is unavailable.

## Evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/scratch/landing-check-rules-20260924/`.

| File | SHA-256 |
|---|---|
| `landing/landing.json` (landing check report) | `28ef5a150458a8038bd5103791ba0965791d81651c3a9eb742978a5e5ed0e62a` |
| `landing/check-reports/run-gates.json` | `c1a7e63cda221002e944f95b31356380ce9ae603928b0516ad0ddfa2492f33e4` |
| `landing/check-reports/audit-governance.json` | `87fbebdff2b7b75b7cce012cec49c7c9c1561f67e789724a3ff1af0690cfbd82` |
| `landing/check-reports/plan-migration-validate.json` | `dfac5598b4a207b8edf17ae79331da3bdec151b33e4c28fbd9c9594bcf6e2994` |
| `landing/classification.txt` | `c7f2c12ce2fc9a9d54fea3f2cd03300111edd3041ec4f9bc7d700cb0c21330ea` |
| `full-lists/delta.txt` (full-list deltas) | `8b28483213ac792f0df889addc9c6130d9b79e23a0e957979d7678f619c358ad` |
| `replay-after-review/replay.json` | `1f21d656e00f7137eac16bf9118140048f499797d8ddb478cdc60bbcafb529c5` |
| `replay-control-old-classifier/replay.json` | `6be45f744e5e5b3f372dd176eb3467fa5b6f8bb39bd4b8a5a7fa823ce1b7650c` |

The shared and worktree shard-check outputs are `landing/shared-shard-check.json` and
`landing/worktree-shard-check.json`. `landing/shared-overlap.txt` is empty.
