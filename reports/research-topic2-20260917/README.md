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

## Status — FINAL for this window. Both Opus arms are INTERRUPTED, not complete.

| Arm | Outcome | Admissions used | Captured | Pending leads |
|---|---|---|---|---|
| **S** (Opus 5, effort max, all stages) | **INTERRUPTED** | 4 of 20 | $14.90 of $250 | 22 reconcile, 22 compare |
| **H2 research** (Muse Spark) | **COMPLETE**, `Stop: admitted_attempt_cap` | 12 of 12 | $0.15 of $50 | — |
| **H2 review** (Opus 5, effort max) | **INTERRUPTED** | 3 of 12 | $7.18 of $150 | 32 reconcile, 32 compare |

Only Arm H2's cheap research half ran to a designed terminal. **Neither Opus arm finished**, so this topic does
not yet support the blind union and per-arm recall the brief asks for: Arm S delivered one completed discovery
job and no reviews, and Arm H2's review half delivered three interrupted reconciles. The pending-lead counts
above are the honest measure of what is missing.

### What interrupted them

Two separate events, in order.

1. **05:43Z — the five-hour window.** The CLI began reporting `status: "allowed_warning"` with
   `utilization: 0.90` (then 0.91). Admissions were stopped on both live arms by the drain described below;
   live jobs were left running. Details and the full typed record are in `rate-limit-event.json`.
2. **Some time after 05:50Z — the Opus session limit killed the runner**, and both campaigns died with it.
   Their monitors survived and heartbeat the same frozen snapshot for about five hours. Six jobs were left
   orphaned: two with a shutdown-path receipt, four still marked `admitted` with no terminal receipt at all.

At **11:05:36Z** the CLI answered a probe normally (`is_error: false`), but the typed record had changed shape:
`{"status": "allowed_warning", "rateLimitType": "seven_day", "utilization": 0.82, "surpassedThreshold": 0.75,
"resetsAt": 1789646400}` — i.e. **2026-09-17T12:00:00Z**. The five-hour window had reset and was no longer the
constraint; a **seven-day** window past its 0.75 warning threshold had become one. Under the standing rule —
stop admissions at the first `allowed_warning`, whatever the utilization — **admissions were not resumed**, and
the 12:00Z deadline pointed the same way independently, since Arm S's remaining 16 admissions could not
complete in the 54 minutes available.

### Close-out, which bought nothing and settled what it could

Each interrupted campaign was relaunched **without** `--restart`. `bounded_campaign` runs
`recover_interrupted()` at line 527 and raises `Stop('Existing campaign requires explicit restart')` at line
529, so every orphaned job received its terminal receipt and **no admission and no model request occurred**.
All six are now terminal.

Two honest residues remain rather than being tidied away:

- **$36.00 unresolved on each Opus arm.** Jobs killed mid-flight never got their adapter's final `usage.json`,
  so completeness cannot be proven and each retains its $12 cold-allowance liability. Receipts equal requests
  in every one of them, so no usage is missing — only the proof of final settlement. Continuation 4's union arm
  recorded the same shape.
- **No `campaign-terminal.json` for either Opus arm.** A campaign killed with its process never reaches the
  `finally` block that writes one, and the close-out stops at line 529, which is outside that `try`. The arms
  are frozen and reported as INTERRUPTED rather than inventing the artifact.

### Per-stage wall time against the targets

| Arm | Stage | Wall | Summed job time | Avg concurrency | Target | Against target |
|---|---|---|---|---|---|---|
| s-full | discovery | 24m 24s | 24m 23s | 0.999 | — | — |
| s-full | implementation | 4m 00s | 7m 59s | 1.998 | — | — |
| s-full | history | 4m 00s | 4m 00s | 1.0 | — | — |
| **s-full** | **arm total** | **28m 50s** | **24m 23s** | **0.846** | **3 h** | **0.16x (under)** |
| h2-research | discovery | 2m 55s | 2m 54s | 0.997 | — | — |
| h2-research | implementation | 9m 25s | 12m 23s | 1.316 | — | — |
| h2-research | history | 8m 11s | 12m 50s | 1.568 | — | — |
| **h2-research** | **arm total** | **12m 52s** | **28m 08s** | **2.185** | **3 h** | **0.07x (under)** |
| h2-review | reconcile | 10m 30s | 31m 29s | 2.999 | 75 min | 0.14x (under) |
| **h2-review** | **arm total** | **10m 40s** | **0m 00s** | **0.0** | **3 h** | **0.06x (under)** |

### Job status and what bound each job

| Arm | Jobs | Statuses | Bound by | Reconciled | Unresolved |
|---|---|---|---|---|---|
| s-full | 4 | completed 1, interrupted 2, null 1 | **finished** 1, **interrupted** 2, **null** 1 | 1 of 4 | $36.00 |
| h2-research | 12 | budget_truncated 10, completed 2 | **finished** 2, **responses** 10 | 12 of 12 | $0.00 |
| h2-review | 3 | interrupted 3 | **interrupted** 3 | 0 of 3 | $36.00 |

### Cost

| Arm | Captured upper | Cap | Runtime-reported | Per-job range |
|---|---|---|---|---|
| s-full | $14.8987 | $250 | $12.0466 | $0.8160–$12.0466 |
| h2-research | $0.1545 | $50 | $0.0000 | $0.0074–$0.0228 |
| h2-review | $7.1788 | $150 | $0.0000 | $2.0835–$2.6263 |

### Responses and duration against the per-job ceilings

| Arm | Responses per job | Ceiling | Longest job | Ceiling | Dearest job | Budget |
|---|---|---|---|---|---|---|
| s-full | 26–105 (mean 48.2) | 160 | 1463.2s | 3600s | $12.05 | $20 |
| h2-research | 33–41 (mean 39.7) | 40 | 177.5s | 2400s | $0.02 | $— |
| h2-review | 42–53 (mean 47.0) | 160 | 630.7s | 3600s | $2.63 | $20 |

### Delivery counts (counts only, nothing adjudicated)

| Arm | Jobs writing notes.md | Lead deliveries | Lead stage counts | Pending reconcile | Pending compare |
|---|---|---|---|---|---|
| s-full | 2 of 4 | 0 | {'discovered': 22, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0} | 22 | 22 |
| h2-research | 6 of 12 | 2 | {'discovered': 32, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0} | 32 | 32 |
| h2-review | 2 of 3 | 2 | {'discovered': 32, 'studied': 0, 'reconciled': 0, 'comparison_delivered': 0} | 32 | 32 |


### Frozen outputs

| Arm | Run | Manifest sha256 | Files |
|---|---|---|---|
| s-full | `arm-s/runs/topic2-s-full-20260917-051531` | `4b14ae0eb765ef81bbef49ad1c74d814f07fd2b9635834a7c0869a94fbd5162e` | 5,928 |
| h2-research | `arm-h2/runs/topic2-h2-research-20260917-051541` | `c1e7a066c8f21d3561d64020eeb87f0e737495fd02b380fe4796789d1ff2481c` | 8,214 |
| h2-review | `arm-h2/runs/topic2-h2-review-20260917-053231` | `076f894af6d52939802fe02863c482c59d797a76f8ef70404216ec83c4891239` | 5,723 |

Every freeze was verified with the monitor stopped first and an explicit assertion that no file in the run is
newer than its manifest.

### Runtime identity

`claude-opus-5` via Claude Code CLI **2.1.226**, binary sha
`4e9bec1177ce9690e8bd988b710ac24105e70da428dd094c5adcbbe786a55555`, effort **max**, on Arm S and Arm H2's review
half. `muse-code/muse-spark-1.3-contributor` at xhigh via oh-my-pi **18.2.2**, binary sha
`77c3520ab8ef8318dda02a0715e3b6e69589c427dc23f90a4bb97650caa72f72`, on Arm H2's research half. Each figure is
read from the job's own record, and the gate compares the binary hash live, so a runtime that changed between
gate and campaign fails closed. Per-arm detail in `arm-reports/<arm>-identity.json`.

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
