# Jujutsu research, continuation 5 — spending the review budget on admissions

2026-09-17. Continuation 4 showed that on identical inputs the review models differ in depth, not in
kind; that the binding limit in every arm was admissions rather than money or time; and that at most
14 of the premium arm's 88 leads reached a comparison in any review arm. Continuation 5 asks whether
**choosing which leads to admit**, and **splitting cheap breadth from strong depth**, raises recall at
the same admission budget, inside a production latency target of 75 minutes per arm at three workers.

Nothing here is adjudicated. This bundle reports what ran, under which limits and code, what it cost,
what stopped each job, and how many leads reached a comparison. Scoring the outputs happens separately.

Raw workspaces stay outside this repository, under
`~/PM-Experiments/jujutsu-followup-20260911/continuation5/`. Every frozen output tree is named with a
SHA-256 manifest in `output-manifests.json`; per-job detail is in `arm-reports/<arm>.json`.

Inputs for every arm are the premium arm's frozen research artifacts in the exact state continuation 4's
review arms received them: 88 leads, snapshot `bc7569b3f5`. Nothing from the 110-finding union, the
continuation-4 adjudication, DL-043, deliverable 5, or anything landed after that snapshot entered any
research input. The baseline is claude-hicap's frozen continuation-4 result, which was not re-run.

## Arm P — prioritized depth (complete)

A cheap prioritization pass chooses the order, then the expensive reviewer works down that order.

| Stage | Model | Runtime | Limits |
|---|---|---|---|
| prioritization | **muse-code/muse-spark-1.3-contributor**, xhigh | oh-my-pi, omp/18.2.2 | one job, 40 responses, 2 400 s, $50 cap |
| depth (reconcile + compare) | `opus` → **claude-opus-5**, effort **max** | Claude Code CLI 2.1.226 | 12 admissions, 3 workers, 160 responses / 3 600 s / $20 per job, $150 cap |

The Claude CLI does accept `--effort max` (`claude --help` lists low, medium, high, xhigh, max; a probe
returned `PROBE_OK` from `claude-opus-5`), so the brief's `xhigh` fallback was not needed and both Opus 5
stages ran at **max**.

### Prioritization

Muse Spark read exactly two things — the 88 lead bodies and the frozen product brief — with no Plans, no
navigation, no research helper and nothing from any other arm. It ranked **all 88** leads with one line of
reasoning each, in 97.3 s on 14 of its 40 permitted responses, for $0.011961 of its $50 cap. Receipts 14 =
durable request count 14, accounting complete, $0.00 unresolved. The full ranking and every reason are in
`arm-p-ranking.json`; the job's own record is in `prioritization.json`.

The top of the ranking, which is the order the scheduler then admitted in:

| Rank | Lead | Reason (Muse Spark's own line) |
|---|---|---|
| 1 | L-21de7aceefe8 | Extra-table head-loss fix #9648 is absent in 0.44 plus silent remove_head errors, directly threatening operation recovery and capture. |
| 2 | L-4634dafd85af | GC roots, refs/jj/keep retention and op-store TOCTOU define the missing GC fence around historical-operation restore. |
| 3 | L-a87239280738 | Exact 0.44 import/export no-op versus race plus HEAD and cache-tree regressions pins the colocation certification matrix. |
| 4 | L-3016429f1ffd | Native concurrency merges competing ops and --at-op forks, so neither implements the brief's stale-revision rejection or writer lease. |
| 5 | L-f8ff85550285 | Publish-before-checkout with stale working copies and Git HEAD lag makes every cancellation an unknown-effect case. |
| 6 | L-6028298d8855 | Multi-store operation/view/head/index/extra plus shared-workspace links sets the full backup closure bookmarks alone cannot prove. |
| 7 | L-772b9a7a0dbf | SecureConfig IDs, migration and symlinks let a restored copy reconnect to live user config unless the drill sanitizes it. |
| 8 | L-62e705862167 | Auto-track limits, ignores and size caps let commands succeed while omitting files, breaking success-equals-capture. |
| 9 | L-289201b4f4ec | Alternates, commondir, split indexes and back-pointers let Git-backed closure escape both workspace and repository. |
| 10 | L-732df4469871 | Promisor and partial-clone objects make clean fsck and reads hydrate over the network, falsifying offline restore. |

Ranks 85–88 are the four aggregate `unresolved_intake` pseudo-leads, which the scheduler never admits
anyway — the prioritizer put them last on its own, reading only their text.

### Depth stage

| Stage | Jobs | Wall s | Summed job s | Avg concurrency |
|---|---|---|---|---|
| reconcile | 6 | 3 339.1 | 5 799.6 | 1.737 |
| compare | 6 | 3 531.3 | 5 702.4 | 1.615 |
| **arm** | **12** | **4 193.3** | **11 502.0** | **2.743** |

**4 193.3 s is 69 min 53 s, inside the 75-minute (4 500 s) target with 5 min 7 s to spare.** Processing
used 4 193.5 s of the 14 400 s arm allowance. Stage wall is the admission-to-terminal span of that stage;
summed is execution elapsed.

Stop reason: `Stop: admitted_attempt_cap` — the arm used all 12 admissions and ended on its own designed
stop. It was not drained and no operator gate was applied.

| bound_by | Jobs |
|---|---|
| finished | 11 |
| error | 1 |

**Nothing hit a response, time or budget ceiling.** Responses per job ranged 43–89 (mean 65.8) against the
160 ceiling; the longest job ran 1 227.3 s of its 3 600 s cap; the dearest cost $10.89 of its $20 budget.
The one non-`completed` job is `J0028-compare`, status `cli_error`, whose error text is
"You've hit your session limit · resets 8:30am (UTC)" — the **account's** shared five-hour window, not an
arm limit. It had already dispatched 76 responses, wrote `notes.md`, delivered its 3 leads, and reconciled
with 76 receipts against 76 requests.

All 12 jobs reconciled at job end, receipts equal requests in every job, **$0.00 unresolved**.

Cost: captured upper **$85.5011** = CLI-reported $85.5011, of the $150 cap; $3.81–$10.89 per job.

### How many of the 88 leads reached a comparison

**16**, against claude-hicap's 14 on the same artifacts in the frozen order — and they are **exactly ranks
1 through 16 of the Muse ranking, with no gaps**. The admissions went precisely where the prioritizer sent
them, which is the mechanism this arm was built to test. 12 of 12 jobs wrote `notes.md`; 32 lead deliveries
were receipted; the lead set grew from 88 to 129 as review jobs ingested new leads.

## Rate limits

The Claude CLI emits a typed `{"type":"rate_limit_event","rate_limit_info":{…}}` object. That object is the
only source used here: a text search for "429" or "rate limit" matches this research corpus itself, which is
about source control. CLI 2.1.226 carries `status`, `resetsAt`, `rateLimitType`, `overageStatus`,
`overageDisabledReason` and `isUsingOverage`, and a `utilization` field only once a warning threshold is
passed. Arm P's stream recorded 22 such events: `allowed` throughout until 05:48:52 Z, when the final event
recorded `rejected`, overage `rejected` for `out_of_credits`, five-hour window resetting 08:30:00 Z. The
reading is preserved in `rate-limit-at-arm-p-terminal.json`.

## Protocol

Continuation 5 copied continuation 4's frozen protocol, with all four of its defect fixes and the
runtime-identity gate, and re-froze it: **`2ffdb9a27415c9bd470b9de0139e09803ef6fa8aea7bcaa427fe57500090f684`**.
The patch added the authorized arm identities and caps, the per-arm boundary ceilings, the arm routes and
adapters, and moved the non-arm allowance identity to `continuation5`. One scheduler change was required
and is recorded: the reviews loop previously tried both review phases unconditionally, and an unadmitted
phase raises `Stop('continuation_phase_not_allowed')`, which kills the campaign; Arm B's stages admit only
one review phase each, so the loop now iterates only the phases an arm admits. For an arm that admits both —
every continuation-4 arm — the behaviour is unchanged.

The protocol test suite reports 108 tests with 29 failures and 14 errors, an **identical failure set** (diffed
by name) to the same suite run against the untouched continuation-4 protocol: pre-existing suites written
against the pre-fix `before_request`/`after_request` semantics and the fail-closed codex transport gate. The
continuation-4 worker-record race test passes.

`protocol-fingerprints.json` gives each run's pinned protocol hashes, so the mapping from arm to code is
verifiable rather than asserted. `runtime-identity.json` is taken from each job's own adapter record.

## Files

| File | What it is |
|---|---|
| `arm-reports/p-depth.json` | Arm P depth stage, per job: status, bound_by, elapsed, requests, receipts, reconciliation, cost, deliveries |
| `arm-p-ranking.json` | The full 88-lead prioritization ranking with every reason, and which leads reached a comparison |
| `prioritization.json` | The prioritization job's own limits, result, receipts and cost |
| `output-manifests.json` | Every frozen output tree, by SHA-256 file manifest and manifest digest |
| `protocol-fingerprints.json` | Each run's pinned protocol file hashes and its fingerprint |
| `runtime-identity.json` | Per-job runtime binary, version and hash, plus the live installed reading |
| `p-rank-manifest.json` | The prioritization job's own file manifest |
| `rate-limit-at-arm-p-terminal.json` | The typed rate-limit event at Arm P's terminal |

## Still to run

Arm B (cheap breadth then strong compare) and the coordinator's overnight sweep arms (T80, A24, T320) are
held: the account's five-hour window is shared with two other Claude Code threads, and no continuation-5
arm starts until the coordinator confirms topic-2 Arm S is terminal. One Opus arm admits at a time.
