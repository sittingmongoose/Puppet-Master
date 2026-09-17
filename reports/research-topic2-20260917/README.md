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

## Status

**Both arms launched 2026-09-17 05:15Z and are running.** Per-stage wall time, summed job time, concurrency, the
job-status and bound-by table, cost, frozen output paths with manifest hashes, and runtime identity are written
here at each arm's terminal, in `arm-reports/`.

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
