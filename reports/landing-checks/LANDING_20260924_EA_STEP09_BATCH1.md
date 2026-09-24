# Landing record: Event Authority Step 9 batch 1, DL-074 and DL-075 applied to their 20 J248 rows, 2026-09-24

Branch `plans/ea-step09-card-answers-20260924`: 7 commits, built on `792d2fb8b1` and rebased at landing onto `main` `b3169c48d9`, ending at `41fbecb612`. `main` was fast-forwarded from `b3169c48d9` to `41fbecb612` at 21:57:56Z and pushed at 22:14:14Z, after the landing check. This record is a report-only commit on top, landed the same way. Before the rebase the commits were pushed as `10c3df084e`, `96aadbc36d`, `96b711c5b2`, `940c9b8f05`, `ed46ced646`, `12283f22e4` and `67e3056687`, the tip the landing go named.

**What lands.** 25 paths. The batch report is `reports/event-authority-20260911/step-09-card-answer-application-20260924.md`.
- Under `Plans/.audits/event-authority-2026-08-12/`: the 20 row files `individual-disposition/rows/ROW_task.failed.json` and `ROW_runtime_artifact.*.json` (19), `individual-disposition/LEDGER.jsonl`, `census-adjudication/LEDGER.jsonl`, and `individual-disposition/OWNER_VETOES.jsonl`, which is empty again.
- The application record `reports/event-authority-20260911/step-09-card-answer-application-20260924.json` and the batch report.

`task.failed` is excluded under DL-074. The 19 `runtime_artifact.*` rows go back to technical work with retention settled under DL-075. Nothing is registered. No Plans document, shard, index, registry, validator, cohort pin, freeze digest or closure hash changes. Campaign count after this landing, of 252: registered 0, excluded 7, carded 0, remaining 245.

| Commit | What it does |
|---|---|
| `8750b56e2f` | Applies DL-074 and DL-075 to the 20 rows, the two ledgers and the veto list, with the application record |
| `d6972b6b85` | Review B-01 and B-03: the retention note states DL-075's admission precondition and its two limits |
| `a19949b30d` | Review B-02: retention cells went to PASS from FAIL in 10 rows and from OWNER_REQUIRED in 9 |
| `d929521cac` | Review B-05: the validator's drop from 6 to 5 failures is the owner-veto check alone |
| `828f0cac27` | Review B-07: the application record names `792d2fb8b1` as the anchor revision of the new citations |
| `9e6afd55cb` | Review B-08: pins `SHA256SUMS` and the full receipt hashes; notes the before receipt's `f1ce058ccd` origin |
| `41fbecb612` | Report: the post-August validator question is answered (DL-077 and DL-078, on their own branch) |

**Authority.**
- **Answers.** Jared answered both Step 9 cards on 2026-09-23. The answers are recorded as DL-074 and DL-075, already on `main`.
- **Review.** One blind form-driven review, dispatched by the coordinator: `/home/sittingmongoose/PM-Experiments/review-ea-step09-batch1-20260924/`. Its findings were repaired one commit per finding, above. The coordinator accepted the batch.
- **Go.** The coordinator gave the landing go at `67e3056687` on 2026-09-24.

**Landing lock.** The lock was free when tried. It was taken at 21:57:11Z, before the landing fetch, and held through the fast-forward, both shard checks, the landing check, the push of `main`, this record's landing, and the removal of the worktree and the branch.

## Procedure

1. **Rebase.** At the landing fetch, `origin/main` was `b3169c48d9`, nine commits on the branch's base `792d2fb8b1`:
   - `2d85b37488`, the baseline re-record, and `aa38fc0454`, its landing record;
   - `3e867163f8`, `4c95cae1c8`, `083e7acc5e`, `9473727263`, `2b8b4bd239` and `f0e194b6b4`, the landing-check follow-ups, and `b3169c48d9`, their landing record.

   Those commits changed 10 paths: the landing-check script, its test, the rules text in `AGENTS.md` and `.claude/CLAUDE.md`, the baseline and four reports. None is one of the branch's 25 paths, and none is read by the checks the batch ran. The rebase was clean, and the rebased branch was pushed with a lease.
2. **Checks in the worktree** at `41fbecb612`:
   - shard check: pass, 99 documents, 2,722 shards;
   - `test_event_authority_holding_bucket` (13 tests), `test_pm_pnc019_currentness` (9) and `test_pm_emit_only_event_boundaries` (13): all OK.

   The independent-validator and currentness results in the batch report were produced before the rebase. The rebase changed none of their inputs.
3. **Overlap check in the shared checkout.** It was on `main` at `b3169c48d9`, equal to `origin/main`. `git status` listed 43 uncommitted paths: 41 under `Concepts/chat-assistant-concepts/5.6 Pro/`, plus `.omp/lsp.json` and `WATCHDOG.yml`. None is a branch path.
4. **Fast-forward and shard check.** `main` went from `b3169c48d9` to `41fbecb612` at 21:57:56Z. The shared shard check passed: 99 documents, 2,722 shards. Its output is byte-identical to the worktree's.
5. **Landing check:** `python3 scripts/pm-landing-check.py --base origin/main --json --keep-check-reports <evidence>/landing/check-reports`. It ran from 21:58:19Z to 22:12:28Z and exits **0** with **0 blocking items**. stderr is empty.
   - **Baseline.** It is current, so rule 2 applies: its commit `792d2fb8b1` is an ancestor of the base `b3169c48d9` and 0.05 days older than it.
   - **Totals.** `run-gates` 1,470, `audit-governance` 1,470 and `plan-migration-validate` 33,072, all equal to the baseline's.
   - **Branch.** 25 paths, no Plans document, 0 units. **0 rows name a branch file.**
   - **Other rows.** There are no new, pre-existing, grown, resolved or infrastructure rows.
   - **Truncated subchecks.** Four are compared by total only, all unchanged: `audit_closure` (201) and `prd_planning_runtime_contracts` (1,240), in each aggregate. Neither pair is judged together, because the audit-governance copies print only 100 rows.
   - The `plan-migration-validate` report is byte-identical to the previous landing's (`dfac5598…`).
6. **Push.** A fetch just before the push found `origin/main` still at `b3169c48d9`. At 22:14:14Z, `main` `41fbecb612` was pushed to `origin` (GitHub and the NAS) and to `truenas-backup`, which was already up to date through `origin`'s NAS push URL. This record then followed as a report-only fast-forward under the same lock. The landing check does not read Markdown under `reports/landing-checks/`, so the record was landed with the shard check and was not run through the landing check again.

## Classification

Nothing to classify: exit 0 and no blocking items.

## Reseal request

None from this branch. It edits no Plans document. None of its 25 paths has a Spec Lock entry, and none is named in a governance evidence bundle.

## Open items carried forward

- **No exclusion category.** The frozen disposition schema has no J248 exclusion category, so `task.failed` keeps its legacy bucket and cohort pin, as the six earlier exclusions do. No denominator removal is claimed.
- **`COVERAGE.json`** in `individual-disposition/` is a 2026-09-11 snapshot, already stale before this batch, and is left unchanged.
- **The validator's `unexpected_august_set` failure.** It cannot clear while any family registered after August stays registered. DL-077 and DL-078 answer this, but they are on `plans/ea-seal-check-decisions-20260924` and not yet on `main`. The amendment itself is on `plans/ea-validator-post-august-20260924` and awaits its own review.
- **The Step 9 procedure record** (`step-09-procedure-20260924.md`, on the DL-077/DL-078 branch) counts batch 1 "once it lands". When that branch lands, its count row can name this landing (`41fbecb612`).
- **Unchanged validator failures.** The independent validator still reports the five failures listed in the batch report. `individual_dispositions_owner_veto_blocking` is the one this batch cleared.

Cost: the landing check took 14 min 9 s in the shared checkout. Monetary attribution is unavailable.

## Evidence

Directory: `/mnt/Cursor/PuppetMaster-Evidence/event-authority-20260911/step09-card-answers-20260924/landing/`.

| File | SHA-256 |
|---|---|
| `landing.json` (landing check report) | `e7db7e9d68da229b33b1b598806404731cc0aaed5c701ef97f08d22f14755728` |
| `check-reports/run-gates.json` | `ad406566dc63d3a6889e0da4e5d1335490b9dc903e729720deb5bb7ab6be752f` |
| `check-reports/audit-governance.json` | `58412ae8fccadb9051226640f8f0a5a6a4a5abcbdc4f7cfa91b3e1e7b26145fb` |
| `check-reports/plan-migration-validate.json` | `dfac5598b4a207b8edf17ae79331da3bdec151b33e4c28fbd9c9594bcf6e2994` |
| `shared-shard-check.json` and `worktree-shard-check.json` (identical) | `b8070a4e73ae546e6c7bb6814c469dd0d020724d62d5f13df27e79b6f067d55f` |
| `shared-status-before-ff.txt` (the 43 uncommitted paths) | `c1d79a51e30e42d114095293c253ac35b97540a5b08a7c1d6513c1ed5a058856` |
| `push.txt` | `48839e98972d792a66e8f25fe0df8f6a4b48312cb8dda14402403b2951cf8132` |
| `worktree-test_event_authority_holding_bucket-41fbecb612.log` | `66849b5b203b1ff7669c41b13f3acb73067d5935c0c1c0f7a394fc4c91f1698c` |
| `worktree-test_pm_pnc019_currentness-41fbecb612.log` | `97c5b4d6682942a6fae8dd852680eeebc228fa1a6d8440024d063dd2b614de97` |
| `worktree-test_pm_emit_only_event_boundaries-41fbecb612.log` | `304c9bc7e5386f59abc7ac92c5090371a54faf257530ad448bd4c126457e4269` |

The batch's own evidence, which the batch report cites, is in the parent directory under its `SHA256SUMS` (`9def2ced18181dfd294474492acf592d6064462d29f96bb1127ef49a59bf4747`).
