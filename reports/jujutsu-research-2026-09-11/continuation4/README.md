# Jujutsu research, continuation 4 — six arms on the frozen case

2026-09-16 to 2026-09-17. Six arms ran on the frozen Jujutsu case, snapshot `bc7569b3f5`. Nothing here
is adjudicated: this bundle reports what ran, under which limits and code, what each job cost, and what
stopped each job. Scoring the outputs happens separately.

Raw workspaces stay outside this repository, under
`~/PM-Experiments/jujutsu-followup-20260911/continuation4/`. Every frozen output tree is named with a
SHA-256 manifest in `output-manifests.json`, and each arm's per-job detail is in `arm-reports/<arm>.json`.

## What each arm was

| Arm | Model and effort | Runtime | Stages | Inputs |
|---|---|---|---|---|
| `claude` (Arm C) | `opus` → **claude-opus-5**, xhigh | Claude Code CLI 2.1.226 | reconcile, compare | the premium arm's frozen artifacts, in the exact state the premium continuation 3 started from |
| `claude-hicap` | **claude-opus-5**, xhigh | Claude Code CLI 2.1.226 | reconcile, compare | same as Arm C |
| `deepseek41` | **opencode-go/deepseek-v4.1-flash**, max | oh-my-pi, omp/18.2.2 | reconcile, compare | same as Arm C |
| `glm53` | **zai/glm-5.3-flash**, max | oh-my-pi, omp/18.2.2 | reconcile, compare | same as Arm C |
| `muse13` | **muse-code/muse-spark-1.3-contributor**, xhigh | oh-my-pi, omp/18.2.2 | reconcile, compare | same as Arm C |
| `union` (Arm U) | **openrouter/stealth/union-alpha**, high | oh-my-pi, omp/18.2.2 | discovery, implementation, history, reconcile, compare | the frozen case only; workers saw the product brief, the frozen Plans entered at review, nothing from any other arm |

The Muse provider is `muse-code`; there is no provider named `muse`. Union Alpha's opencode routes
(`opencode-go`, `opencode-zen`) returned 500 and then hung all evening, so the arm ran on the OpenRouter
route, which the protocol admits as a second route for that arm and which is priced at zero in the
catalogue and in its own native records. Credentials never enter any artifact: the OpenRouter key is read
from its file into the campaign's environment at launch.

## Timing

| Arm | Stage | Wall s | Summed job s | Avg concurrency |
|---|---|---|---|---|
| claude | reconcile (8) | 1 386.2 | 3 181.1 | 2.295 |
| claude | compare (4) | 1 215.9 | 1 707.9 | 1.405 |
| **claude** | **arm** | **1 868.0** | **4 888.9** | **2.617** |
| claude-hicap | reconcile (6) | 2 635.6 | 4 997.1 | 1.896 |
| claude-hicap | compare (6) | 2 682.6 | 5 262.3 | 1.962 |
| **claude-hicap** | **arm** | **3 535.2** | **10 259.3** | **2.902** |
| deepseek41 | reconcile (9) | 1 133.7 | 2 301.5 | 2.030 |
| deepseek41 | compare (3) | 751.5 | 793.9 | 1.056 |
| **deepseek41** | **arm** | **1 135.8** | **3 095.4** | **2.725** |
| glm53 | reconcile (7) | 3 183.0 | 5 824.5 | 1.830 |
| glm53 | compare (5) | 2 425.3 | 3 515.6 | 1.450 |
| **glm53** | **arm** | **3 250.2** | **9 340.1** | **2.874** |
| muse13 | reconcile (7) | 557.8 | 963.1 | 1.727 |
| muse13 | compare (5) | 527.9 | 730.8 | 1.384 |
| **muse13** | **arm** | **668.7** | **1 693.9** | **2.533** |
| union | discovery (1) | 595.1 | 594.6 | 0.999 |
| union | implementation (5) | 1 889.2 | 2 381.2 | 1.260 |
| union | history (5) | 2 079.6 | 2 944.2 | 1.416 |
| union | reconcile (6) | 3 699.3 | 9 298.8 | 2.514 |
| union | compare (3) | 658.3 | 1 492.6 | 2.267 |
| **union** | **arm** | **6 378.3** | **16 711.4** | **2.620** |

Stage wall is the admission-to-terminal span of that stage; summed is execution elapsed; retries count.

## Job status, and what bound each job

`bound_by` is the limit that ended the job, read from the adapter status, the runtime's own result record
and the durable meter's stop reason. It is the field to read: the oh-my-pi adapter labels *any* meter
denial `budget_truncated`, including a plain response ceiling, so the raw status can say "budget" where
the cause was turns.

| Arm | Jobs | finished | responses | time | budget | other |
|---|---|---|---|---|---|---|
| claude | 12 | 1 | **11** | 0 | 0 | 0 |
| claude-hicap | 12 | **12** | 0 | 0 | 0 | 0 |
| deepseek41 | 12 | 2 | 10 | 0 | 0 | 0 |
| glm53 | 12 | 5 | 7 | 0 | 0 | 0 |
| muse13 | 12 | 10 | 2 | 0 | 0 | 0 |
| union | 20 | 17 | 0 | **3** | 0 | 0 |

The pair that answers the question the higher-cap rerun was authorized for: **Arm C stopped 11 of 12 jobs
at the 40-response ceiling; with 160 responses per job, claude-hicap finished all 12**, using 37–110
responses per job (mean 66.7), the longest job taking 1 070 s of its 3 600 s limit and the dearest $12.12
of its $20 per-job budget. 11 of those 12 jobs used more than 40 responses, so Arm C's recall was
turn-capped. The two arms are otherwise identical in inputs, model, effort, admissions, workers and
batching; their cost and per-job durations are not comparable with each other or with goal 2's arms.

Union's three `time` jobs were reconcile jobs cut at the 2 400 s per-job limit; no union job reached the
40-response ceiling (12–39 responses per job, 536 in total).

## Cost

| Arm | Captured (upper) | Cap | Runtime-reported | Unresolved | Jobs reconciled |
|---|---|---|---|---|---|
| claude | **$36.1240** | $100 | $36.1240 | $0.00 | 12 of 12 |
| claude-hicap | **$82.5164** | $150 | $82.5164 | $0.00 | 12 of 12 |
| deepseek41 | **$0.5315** | $50 | n/a | $0.00 | 12 of 12 |
| glm53 | **$0.8195** | $50 | n/a | $0.00 | 12 of 12 |
| muse13 | **$0.1644** | $50 | n/a | $0.00 | 12 of 12 |
| union | **$0.0000** | $100 | n/a | $3.00 | 17 of 20 |

Claude arms are priced from the CLI's own reported cost per response, floored by the preserved first-party
Opus 5 tariff so captured usage is never recorded as zero; the two figures agreed exactly. oh-my-pi arms
are priced from their native per-response records at the provider's published tariff; those providers
report no per-run cost figure. Union's $3.00 unresolved is three jobs killed at the job time limit before
their adapters could write usage records, at the union arm's $1 cold allowance each. Non-arm spend for the
phase was $0.01, a single control probe.

## Delivery counts (counts only, not a judgement)

| Arm | Jobs with notes.md | Lead deliveries receipted | Lead stages at terminal |
|---|---|---|---|
| claude | 4 of 12 | 12 | discovered 93, reconciled 6, comparisons 3 |
| claude-hicap | 12 of 12 | 28 | discovered 126, comparisons 14 |
| deepseek41 | 7 of 12 | 17 | discovered 87, reconciled 9, comparisons 4 |
| glm53 | 8 of 12 | 16 | discovered 81, reconciled 6, comparisons 5 |
| muse13 | 11 of 12 | 25 | discovered 79, reconciled 3, comparisons 11 |
| union | 19 of 20 | 20 | discovered 98, studied 1, reconciled 4, comparisons 3 |

Only union `J0019-reconcile` produced no `notes.md`; `J0018` and `J0020` saved 6,336 and 8,790 bytes
respectively, and `arm-reports/union.json` carries `notes_present: true` on 19 rows.

## Code each arm ran

`freeze-history.json` lists every freeze of the continuation-4 protocol in order, what it contained and
which arms ran under it. `protocol-fingerprints.json` proves the mapping independently: every run pins the
protocol file hashes it validated against, and runs sharing a fingerprint ran identical code. The final
freeze is `53f8fac98b02e8f2c191e076c8460222e728589b7fb367bfd5c3a0899f9df970`.

Four defects were found and fixed while the arms ran, each with the arm that hit it rerun from scratch and
the spoiled attempt archived rather than scored:

1. **The Claude adapter counted stream blocks as model responses.** The CLI emits one assistant event per
   content block, so a 40-response ceiling fired at about 17 real responses. Fixed by counting distinct
   response ids. (Arm C attempt 1 archived.)
2. **A post-response boundary did not count the response that triggered its own denial**, so job-end
   receipts outnumbered the durable request count by one and reconciliation failed, accruing phantom
   liabilities until the arm's cap denied admissions. Fixed by `record_response`, which always registers a
   response that already happened and only denies the next one. (deepseek41 attempt 1 archived.)
3. **A shared temp-file name in the record writer.** `put()` wrote through a fixed `<name>.tmp`, and the
   campaign parent and its own worker both write `worker-process.json`, so one renamed the other's temp
   file away and the loser's rename raised `FileNotFoundError`, ending the campaign. It killed the union
   and glm53 campaigns 27 seconds apart. Fixed by a temp name unique to the writing process and call, with
   a regression test that runs two stub campaigns concurrently and also proves the old shared name still
   loses the rename. (Both attempts archived.)
4. **Declared runtime versions were hardcoded** while oh-my-pi was updated in place during the session
   (omp/18.1.13 → omp/18.2.2 at the same path). Adapters now read the installed binary's version and hash
   at capability time, gates record them, and the boundary check compares the hash, so a runtime that
   changes between gate and campaign fails closed. `runtime-identity.json` was regenerated after the phase
   from every job record of all eleven runs — the six scored arms at 12 jobs each (union 20) and the five
   archived attempts — so it now carries the identity each arm actually ran against, and it names the one
   run that used the older binary (union attempt 1, omp/18.1.13).

`corrections.json` holds all of this as records: the four defects above as `D1`-`D4`, each with the
archived attempt that evidences it and the freeze that fixed it, and the adjudicator's bookkeeping items
`C1`-`C3` in full — including why a `deepseek-v4-flash`
label appears in every arm's budget (it is continuation 3's hybrid-arm cost-policy block, not a per-arm
selector; the arm's route is recorded in its run config, its gate, its adapter argv and all 470 of its
native usage rows), and why some jobs record 41 responses against a 40 ceiling (the boundary runs after a
response, so at most one further response can already be in flight: read the limit as "at most 40
admitted, one may already be on the wire").

**Codex remains fail-closed in continuation 4.** The proof is `protocol/native-boundary-proof.json`,
mirrored into every launch gate as `native_boundary_proofs.codex` with a `receipt_path` and
`receipt_sha256`. Editing the meter and the collector invalidated it: a live call to
`codex_native.native_boundary_capability()` now fails on exactly two comparisons, `meter_sha256` and
`collector_sha256`, so the adapter reports `available: false` and every campaign refuses to launch.

Re-proving it is not a hash refresh. To run a Codex arm again:

1. Re-run the suites the proof itself records under `tests`, against the *current* meter and collector, from
   `protocol/`: `python3 -B -m unittest test_job_end_v4 test_bounded_campaign_v2 test_native_continuation3 -q`
   and the independent meter/collector suites named in the same field.
2. Capture a **fresh transport-gate receipt**: run the gate (`adapters/transport_gate.py`) against the
   installed `codex` binary and keep the evidence file the gate writes, recording `adapter`,
   `runtime_version`, `runtime_sha256`, `proxy_sha256`, `max_model_requests`, `denied_before_dispatch` and
   `all_dispatch_routes_verified`.
3. Obtain a **fresh independent review** of that capture and of the changed meter and collector, and record
   it in the proof's `independent_review` block.
4. Write the new `protocol/native-boundary-proof.json` with the recomputed `adapter_sha256`, `proxy_sha256`,
   `meter_sha256`, `collector_sha256` and `runtime_sha256`, then record that file's path and SHA-256 in the
   arm's launch gate.

The adapter's `valid` predicate has **fifteen** conditions, not five hashes: the five hashes above, plus
`protocol_version == 4`, `live_receipts_required is False`, `usage_reconciliation == 'job_end_native_records'`,
`live_campaign_allowed is True`, `runtime_version` equal to the installed binary's, `independently_reviewed
is True`, `all_dispatch_routes_verified is True`, `denied_before_dispatch is True`, `max_model_requests == 40`,
`max_job_seconds == 2400` and `admitted_phases == ['reconcile', 'compare']`. On top of that,
`bounded_campaign.verify_native_boundary` requires the receipt file to exist with a matching hash and its
evidence's `proxy_sha256` and `runtime_sha256` to agree with the installed proxy and runtime. The three
judgement fields — `independently_reviewed`, `all_dispatch_routes_verified`, `denied_before_dispatch` — are
about the code being reviewed and the routes being captured, so copying them from the old proof would assert
a review of a meter and collector that no longer exist. **A hash refresh alone cannot satisfy this predicate,
and the boundary check must not be relaxed to get past it.**

## Files here

- `arm-reports/<arm>.json` — per-arm limits, stage timing, per-job rows with `bound_by`, cost, delivery counts
- `freeze-history.json` — every freeze, what changed, which arms used it
- `protocol-fingerprints.json` — each run's pinned protocol hashes, grouped. `protocol_fingerprint =
  sha256(json.dumps({file: run.json's protocol_sha256[file] for file in key_files}, sort_keys=True))[:16]`,
  so any reader can recompute it from a run's own `run.json`
- `output-manifests.json` — SHA-256 manifests of every frozen output tree, including the archived attempts,
  with `re_hash_notes` for the two trees that no longer re-hash by one telemetry file each (`glm53`'s
  `monitor-state.json`, written four seconds after the freeze, and the qualification tree's own older copy of
  `protocol-manifest.json`). No arm job output differs anywhere. The freeze procedure now reads: **quiesce the
  monitor and any other telemetry writer before hashing a tree**, then freeze
- `runtime-identity.json` — binary path, self-reported version and hash per arm
- `corrections.json` — the adjudicator's bookkeeping items, with evidence
