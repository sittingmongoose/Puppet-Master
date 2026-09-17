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

## Arm B — cheap breadth then strong compare (complete)

| Stage | Model | Runtime | Limits |
|---|---|---|---|
| breadth (reconcile only) | **muse-code/muse-spark-1.3-contributor**, xhigh | oh-my-pi, omp/18.2.2 | 30 admissions, 3 workers, 40 responses / 2 400 s per job, $50 cap |
| compare (compare only) | `opus` → **claude-opus-5**, effort **max** | Claude Code CLI 2.1.226 | 12 admissions, 3 workers, 160 responses / 3 600 s / $20 per job, $150 cap |

### Breadth — complete, 12:05:36 Z → 12:31:04 Z, `Stop: admitted_attempt_cap`

| Stage | Jobs | Wall s | Summed job s | Avg concurrency |
|---|---|---|---|---|
| reconcile | 30 | 1 523.0 | 4 300.5 | 2.824 |
| **arm** | **30** | **1 527.6** | **4 300.5** | **2.815** |

**25 min 28 s, far inside the 75-minute target.** bound_by: responses 16, finished 14 — read `bound_by`, not
the raw status, because the oh-my-pi adapter labels *any* meter denial `budget_truncated` including a plain
40-response ceiling, and captured spend was **$0.3606** of a $50 cap. Requests per job 23–41 (mean 37.6). All
30 jobs reconciled, receipts equal requests, $0.00 unresolved. 23 of 30 jobs wrote `notes.md`.

**It did not reconcile all 88.** Within its authorized 30 admissions it delivered **54 of the 88** frozen
leads; 34 were never reached. 54 lead deliveries were receipted and the lead set grew from 88 to 100. That
ceiling is the finding: at three leads per batch, 30 admissions cannot cover 88 leads once retries and
oversized single-lead batches are counted.

### Compare — attempt 1 destroyed by the account rate limit, attempt 2 is the result

The compare stage read **only** Muse's reconcile outputs. That is verified, not asserted, in
`compare-isolation.json`, and the check runs *before* activation, so a tree that failed it would never
become an arm: all 54 reconcile-ready leads depend on one of the 30 Muse reconcile jobs, and the 12 premium
reconcile jobs `J0005`–`J0016` are present in the tree but delivered **nothing** in the frozen premium run,
so none of them can be a compare dependency and no compare-eligible lead names one.

**Attempt 1** (12:32:08 Z → 12:37:02 Z) ran straight into the account's shared five-hour limit. 12
admissions, bound_by **error 11, budget 1**; eleven jobs died on the literal CLI text "You've hit your
session limit · resets 1:30pm (UTC)", nine within 6.6–7.9 s on one response each. **Zero comparisons, no
notes written**, $6.2983 captured. It is archived, preserved and manifested, and **not scored**; the two
mistakes that let it start and keep admitting are described under *Rate limits* below. `b-compare-attempts.json`
records both attempts side by side.

**Attempt 2** (13:37:45 Z → 14:44:07 Z, `Stop: admitted_attempt_cap`) is the scored result. It was relaunched
per continuation 4's precedent for an arm destroyed by an external fault — archive the attempt, reset the arm
state, regrant the full 12 admissions — from the same b-breadth run in the same 54-lead delivery order, with
the launch gated on a typed probe taken in its own separate step.

| Stage | Jobs | Wall s | Summed job s | Avg concurrency |
|---|---|---|---|---|
| compare | 12 | 3 973.8 | 11 286.4 | 2.840 |
| **arm** | **12** | **3 981.3** | **11 286.4** | **2.835** |

**66 min 21 s, inside the 75-minute target with 8 min 39 s to spare.** bound_by: **finished 12 of 12**.
Nothing hit a response, time, budget or rate limit; every typed event during the run stayed `allowed` and the
watcher ended on "campaign terminal" without ever needing to hold. Responses per job 56–86 (mean 72.8) against
the 160 ceiling; longest job 1 300.7 s of 3 600; dearest $10.21 of $20. All 12 reconciled, receipts equal
requests, $0.00 unresolved. 12 of 12 wrote `notes.md`; 32 lead deliveries receipted. Captured **$102.1967** =
CLI-reported, of the $150 cap.

**32 of the 88 leads reached a comparison — exactly Muse delivery-order positions 1 through 32, no gaps.**

## What the three arms cost, and what they reached

| Arm | Leads compared, of 88 | Cost | Arm wall |
|---|---|---|---|
| `claude-hicap` (continuation-4 baseline, frozen order) | 14 | $82.52 | 3 535.2 s |
| **Arm P**, prioritized depth | **16** (ranks 1–16) | $85.51 | 4 193.3 s |
| **Arm B**, cheap breadth then strong compare | **32** (delivery positions 1–32) | $108.86 | 5 508.9 s over two stages |

Arm B's gain is structural rather than clever: because Muse had already reconciled, **all twelve** of Opus 5's
admissions bought comparisons, where Arm P spent six of its twelve on reconciliation and claude-hicap spent
six as well. Arm P's prioritization did what it was built to do — the admissions landed on exactly the
top-ranked leads — but choosing *better* leads inside the same budget moved recall from 14 to 16, while moving
the cheap half of the work to a cheap model moved it to 32. Arm B's totals are not a free lunch: it cost 32%
more than Arm P and its two stages together exceed the 75-minute target, though each stage on its own is
inside it. None of these outputs has been adjudicated, so this table is reach, not quality.

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
runtime-identity gate, and re-froze it: **`2ffdb9a27415c9bd470b9de0139e09803ef6fa8aea7bcaa427fe57500090f684`**,
which Arm P ran under. A second freeze,
**`792d0347122e0d20221c1840d49c753f0d0fe2340c65a6fee7e675618ba3f442`**, added the coordinator's sweep arms
(T80, A24, T320) and raised the Claude adapter's absolute ceilings from 160 responses / 3 600 s to
320 / 7 200 so T320 can be expressed; they remain absolute, and a request above them still raises. Both Arm B
stages ran under that second freeze. `protocol-fingerprints.json` shows which generation each run pinned.
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
| `arm-reports/b-breadth.json` | Arm B breadth stage, same per-job detail |
| `arm-reports/b-compare.json` | Arm B compare stage, same per-job detail |
| `arm-b-delivery-order.json` | The order b-breadth delivered its 54 reconciled leads in, which the compare stage admitted in |
| `compare-isolation.json` | The pre-activation proof that the compare stage can only depend on Muse's reconcile deliveries |
| `b-compare-attempts.json` | Both compare attempts side by side: what each reached, cost and stopped on, and where attempt 1 is archived |
| `arm-p-ranking.json` | The full 88-lead prioritization ranking with every reason, and which leads reached a comparison |
| `prioritization.json` | The prioritization job's own limits, result, receipts and cost |
| `output-manifests.json` | Every frozen output tree, by SHA-256 file manifest and manifest digest |
| `protocol-fingerprints.json` | Each run's pinned protocol file hashes and its fingerprint |
| `runtime-identity.json` | Per-job runtime binary, version and hash, plus the live installed reading |
| `p-rank-manifest.json` | The prioritization job's own file manifest |
| `rate-limit-at-arm-p-terminal.json` | The typed rate-limit event at Arm P's terminal |

## Still to run

The sweep arms T80, A24 and T320 are patched in, gate-verified and held until the coordinator confirms the
window. Their limits, and how each differs from goal 2, are recorded in each arm policy's `limits_note`.
