# Topic 2 — a second research topic, two full arms from discovery (2026-09-17)

Written by an **Opus 5 agent**, the runner for this topic.

Brief: `/mnt/Cursor/PM-Experiments/research-audit-native-20260907/process-pilot-20260908/BRIEF_TOPIC2_20260917.md`,
sha256 `00c1ad2d657028f6524b79846dc1f38ac1cdfea329051e4a9981176e6c298546`.

Everything measured so far is one frozen case, the Jujutsu integration. This is the second topic, run the way
goal 2 ran the first: two full arms from discovery over one frozen case, so an adjudicator can build a blind
union of their findings and score each arm against it. **No adjudication is done here.** This bundle reports
what ran, how long it took, what bound each job, what it cost, and under exactly which code and runtimes.

## Topic

**Azure DevOps Integration** — `Plans/Azure_DevOps_Integration.md`, PlanUnits ADO-001..ADO-005.

Selected by the brief's rule: the thinnest owner document that describes a product surface with a real external
body of knowledge to research and has not been the subject of a research campaign. It carries 5 PlanUnits and 15
acceptance units — **3.000 acceptance units per PlanUnit, 0.760× the corpus median of 3.948** — and **no fixture
file anywhere contains an `ADO-00N` reference**, so none of its five units has an acceptance fixture written
against it. Its external body of knowledge is large and entirely unextracted here: the Azure DevOps REST API 7.x,
the cloud-Services versus on-premises-Server split, Entra ID / PAT / SSH scopes, the pull-request
threads/votes/iterations model, branch policies and status checks, Azure Pipelines, and Service Hooks.

It is also the same *kind* of document as Jujutsu Integration — a small third-party-integration owner doc, 5 units
and 16 KB against Jujutsu's 22 units and 108 KB — which is what "run the way goal 2 ran the first" needs for the
two topics to be comparable at all.

The full ranking, the five runners-up with their numbers, both fixture metrics, and the reading of "anything named
in `reports/`" that makes criterion (b) satisfiable are in **`topic-selection.json`**.

## Models

| Arm | Stages | Model | Runtime |
|---|---|---|---|
| **S** (strong throughout) | discovery, implementation, history, reconcile, compare | `claude-opus-5`, effort **max** | Claude Code CLI 2.1.226 |
| **H2** research half | discovery, implementation, history | `muse-code/muse-spark-1.3-contributor`, effort xhigh | oh-my-pi 18.2.2 |
| **H2** review half | reconcile, compare | `claude-opus-5`, effort **max** | Claude Code CLI 2.1.226 |

The Claude CLI accepts `--effort max` (verified by a probe before launch: `claude -p --model opus --effort max`
answered, model `claude-opus-5`), so both Opus 5 stages run at **max**, not the authorized `xhigh` fallback.

## Case

Frozen the way `bc7569b3f5` was frozen. Plans snapshot commit **`a6162b559b502278458a56e95c5c0891c3e2a505`**
(= `origin/main`; `Plans/` clean in the shared checkout at capture). Product brief 1,263 words of the 1,500
allowed, written from the owner document's stated purpose and the user-facing behaviour it promises, scanned clean
of plan text, unit ids, command identities and acceptance criteria. 200 owner files (43 `.md`, 157 `.json`) enter
at reconcile — the same corpus shape the Jujutsu case froze, with **every Jujutsu artifact removed** and the
current Azure and forge artifacts present. Hashes and the full composition are in **`case-freeze.json`**.

Discovery and study workers receive the product brief only. The frozen owner passages enter at reconcile and
compare. Nothing from any other arm, and no Jujutsu material at all.

## Limits

| | Arm S | H2 research | H2 review |
|---|---|---|---|
| admissions | 20 (9 reserved for review) | 12 | 12 |
| workers | 3 | 3 | 3 |
| responses per job | 160 | 40 | 160 |
| seconds per job | 3,600 | 2,400 | 3,600 |
| budget per job | $20 | — | $20 |
| arm captured cap | $250 | $50 | $150 |
| arm processing | 21,600 s | 14,400 s | 14,400 s |

Arm S and the H2 review half run **above** goal 2's per-job ceilings (40 responses, 2,400 s, $12), as the brief
authorizes. Their cost and per-job duration are therefore **not** comparable with goal 2's arms; only the outputs
are. Each arm's launch gate records this as `limits_differ_from_goal2`.

Targets this is measured against: **75 minutes per review stage** and **3 hours for a whole pipeline**.

## Status — FINAL. All three arms are terminal and frozen.

Every arm reached a **designed gate**. Nothing is running, and nothing can be resumed: both Opus arms have
spent their restarts and their arm clocks.

| Arm | Terminal | Admissions | Captured / cap | Delivered |
|---|---|---|---|---|
| **S** (Opus 5, effort max, all stages) | `admitted_attempt_cap` | 20 of 20 | $111.63 / $250 | 3 reconciled, 3 compared |
| **H2 research** (Muse Spark, xhigh) | `admitted_attempt_cap` | 12 of 12 | $0.15 / $50 | 32 leads |
| **H2 review** (Opus 5, effort max) | `admitted_attempt_cap` | 12 of 12 | $43.72 / $150 | 7 reconciled, 2 compared |

Both Opus arms carry 6 jobs that never completed, and in **both** cases those are the jobs killed by the
retired cap-lowering drain documented in `CORRECTION-drain-killed-campaigns.json` — not failures of the runs
themselves. The $72.00 unresolved on each arm is those same jobs. Every job admitted after the drain was
retired reconciled with $0.00 unresolved.

### The admission hold worked in production

At 21:18:18Z the sentinel fired on a genuine five-hour exhaustion — `{"status": "allowed_warning",
"rateLimitType": "five_hour", "utilization": 0.96, "surpassedThreshold": 0.9}` — and placed the
headroom-sized hold. Its own event record shows the arithmetic working exactly as the tests predicted:

```
committed_usd 144.45 | cap_usd 150.00 | headroom 5.55 | hold_usd 5.55
committed_after 150.00 | denies_new_admissions true | truncates_live_jobs false
```

Committed landed on the cap exactly. **New admissions were denied, live jobs were not truncated**, and the
campaign reached its own designed terminal seven minutes later with every job settled. This is the behaviour
the retired drain destroyed four times earlier in the day.

The five-hour-only gating rule proved itself twice within twenty minutes: it let the 20:59Z resume through a
0.37 seven-day *pacing* warning, then still fired on the real 0.96 five-hour exhaustion.

### Timing against the targets

Arm S is the only arm whose review stages ran uninterrupted, and **both came in under the 75-minute target**:
reconcile **50m 46s** (0.68×) and compare **21m 43s** (0.29×).

Wall-clock figures for the two Opus arms span the whole day — the outage, the operator holds and the waits —
and are **not** meaningful. Use summed job time: Arm S **4h 26m 47s**, H2-review **1h 47m 47s**.

### Per-stage wall time against the targets

| Arm | Stage | Wall | Summed job time | Avg concurrency | Target | Against target |
|---|---|---|---|---|---|---|
| s-full | discovery | 24m 24s | 24m 23s | 0.999 | — | — |
| s-full | implementation | 9h 43m 31s | 52m 24s | 0.09 | — | — |
| s-full | history | 9h 29m 53s | 46m 53s | 0.082 | — | — |
| s-full | reconcile | 50m 46s | 1h 32m 30s | 1.822 | 75 min | 0.68x (under) |
| s-full | compare | 21m 43s | 50m 37s | 2.331 | 75 min | 0.29x (under) |
| **s-full** | **arm total** | **10h 59m 10s** | **4h 26m 47s** | **0.405** | **3 h** | **3.66x (OVER)** |
| h2-research | discovery | 2m 55s | 2m 54s | 0.997 | — | — |
| h2-research | implementation | 9m 25s | 12m 23s | 1.316 | — | — |
| h2-research | history | 8m 11s | 12m 50s | 1.568 | — | — |
| **h2-research** | **arm total** | **12m 52s** | **28m 08s** | **2.185** | **3 h** | **0.07x (under)** |
| h2-review | reconcile | 15h 52m 23s | 1h 03m 29s | 0.067 | 75 min | 12.70x (OVER) |
| h2-review | compare | 9h 05m 00s | 44m 18s | 0.081 | 75 min | 7.27x (OVER) |
| **h2-review** | **arm total** | **15h 52m 34s** | **1h 47m 47s** | **0.113** | **3 h** | **5.29x (OVER)** |

### Job status and what bound each job

| Arm | Jobs | Statuses | Bound by | Reconciled | Unresolved |
|---|---|---|---|---|---|
| s-full | 20 | completed 14, interrupted 5, null 1 | **finished** 14, **interrupted** 5, **null** 1 | 14 of 20 | $72.00 |
| h2-research | 12 | budget_truncated 10, completed 2 | **finished** 2, **responses** 10 | 12 of 12 | $0.00 |
| h2-review | 13 | cli_error 3, completed 3, interrupted 6 | **error** 3, **finished** 3, **interrupted** 6 | 6 of 13 | $72.00 |

### Cost

| Arm | Captured upper | Cap | Runtime-reported | Per-job range |
|---|---|---|---|---|
| s-full | $111.6301 | $250 | $104.9907 | $0.8160–$12.0466 |
| h2-research | $0.1545 | $50 | $0.0000 | $0.0074–$0.0228 |
| h2-review | $43.7156 | $150 | $35.5609 | $0.1622–$13.2072 |

### Responses and duration against the per-job ceilings

| Arm | Responses per job | Ceiling | Longest job | Ceiling | Dearest job | Budget |
|---|---|---|---|---|---|---|
| s-full | 25–107 (mean 60.3) | 160 | 1463.2s | 3600s | $12.05 | $20 |
| h2-research | 33–41 (mean 39.7) | 40 | 177.5s | 2400s | $0.02 | $— |
| h2-review | 6–100 (mean 41.7) | 160 | 1126.8s | 3600s | $13.21 | $20 |

### Delivery counts (counts only, nothing adjudicated)

| Arm | Jobs writing notes.md | Lead deliveries | Lead stage counts | Pending reconcile | Pending compare |
|---|---|---|---|---|---|
| s-full | 16 of 20 | 13 | {'discovered': 115, 'studied': 0, 'reconciled': 3, 'comparison_delivered': 3} | 115 | 118 |
| h2-research | 6 of 12 | 2 | {'discovered': 32, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0} | 32 | 32 |
| h2-review | 7 of 13 | 11 | {'discovered': 44, 'studied': 0, 'reconciled': 7, 'comparison_delivered': 2} | 44 | 51 |


### Reading notes

- H2-review's report counts **13 jobs** because its meter journal holds the `HOLD-admission-sentinel` entry
  beside the 12 admissions. That is a scheduler hold, not a model job: adapter null, 0 requests, $0.00
  observed, never terminal. **Twelve jobs ran.**
- `cli_error` on H2-review's last three jobs is the Claude CLI hitting the account limit mid-job. All three
  still reconciled with $0.00 unresolved.
- Both Opus arms ran under **verified waits authorized by Jared** (one for Arm S, two for H2-review),
  excluding outage time from their processing clocks. Each interval was pinned to the exact completion of the
  last in-arm model request and verified to contain none.

### Frozen outputs

| Arm | Run | Manifest sha256 | Files |
|---|---|---|---|
| s-full | `arm-s/runs/topic2-s-full-20260917-051531` | `4bfc2dcfb6b08f402dbcc48daf94b9172d38d5b5f33970cdb3a2476348e2c3b1` | 14,089 |
| h2-research | `arm-h2/runs/topic2-h2-research-20260917-051541` | `c1e7a066c8f21d3561d64020eeb87f0e737495fd02b380fe4796789d1ff2481c` | 8,214 |
| h2-review | `arm-h2/runs/topic2-h2-review-20260917-053231` | `88da881acae5f2835c6f2be6b9fc1b16750e605bf48eb58e41bb1ecb490a9649` | 7,458 |

Each freeze was taken with the arm's monitor stopped first and verified with an explicit assertion that no
file in the run is newer than its manifest. Attempt-1 archives with their own manifests are under each arm's
`arm-history/`.

### Runtime identity

`claude-opus-5` via Claude Code CLI **2.1.226** (sha `4e9bec1177ce9690…`) at effort **max** on Arm S and Arm
H2's review half; `muse-code/muse-spark-1.3-contributor` at xhigh via oh-my-pi **18.2.2**
(sha `77c3520ab8ef8318…`) on Arm H2's research half. Protocol fingerprint `e59e71488db37fb5`. Every value read
from the job's own record; the gate compares the binary hash live, so a runtime that changed between gate and
campaign fails closed.

**No adjudication is done here.** The adjudicator builds the blind union from the three frozen trees above.

## Protocol

Copied from the continuation-5 protocol and re-frozen for this topic: **freeze.json sha256
`2ba0b1923779a315b05d13784b71ea2e8ba9f0a81aaeb409d0daf137b3f743a2`**, identical in both campaign directories. The
patch adds the three arms above and moves `GLOBAL_PHASE` to `topic2`, so a continuation-5 allowance file cannot
launch a topic-2 arm or the reverse. The protocol test suite gives the same 108 tests and the same failure names
as the untouched continuation-5 protocol — the pre-existing suites written against the old request-boundary
semantics and the fail-closed codex transport gate. `test_worker_record_races`, the continuation-4 race fix,
passes.

The two arms run in **two separate campaign directories**, each with its own `campaign.lock`, arm budgets,
accounting and allowance heartbeat, so they cannot collide on a lock. The frozen case tree hashes identical in
both.

**Codex remains fail-closed**, as in continuations 4 and 5: this protocol lineage edits `cost_watch.py` and
`native_receipts.py`, which invalidates the recorded transport-gate proof, so `codex_native` reports
`available=false`. A Codex arm cannot run here without the proof being re-recorded.

## Files

- `README.md` — this file.
- `topic-selection.json` — the corpus statistics, both fixture metrics, the selection with its (a)/(b)/(c)
  justification, the five runners-up with their numbers, and the two also-considered documents.
- `case-freeze.json` — snapshot commit, brief, corpus composition, every hash, and the proof that the case is
  byte-identical in both campaign directories.
- `arm-reports/` — one JSON per arm at its terminal: timing, job statuses, bound-by, cost, output manifest.
- `runtime-identity.json`, `protocol-fingerprints.json` — written at the last terminal.
