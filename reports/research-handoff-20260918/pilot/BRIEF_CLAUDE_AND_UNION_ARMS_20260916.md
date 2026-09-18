# Brief: a Claude Opus 5 arm and a Union Alpha arm on the frozen Jujutsu case (2026-09-16)

You are an Opus 5 agent working for Jared's reviewer. Read `/mnt/Cursor/PuppetMaster/AGENTS.md` first for the repository rules, although this brief touches the repository only for a final compact report bundle. Save a progress note to `~/PM-Experiments/jujutsu-followup-20260911/continuation4/PROGRESS.md` after every step, because sessions can be cut off; if you are resumed, read that file first.

## Purpose

The Jujutsu research compared two configurations on one frozen case: a premium arm, Astra XHIGH throughout, and a hybrid arm, DeepSeek research with Astra review. Continuation 3 completed their reconciliation and comparison stages; the adjudicated union of findings has 110 entries in `reports/jujutsu-research-2026-09-11/continuation3/final/comparison.json`. Codex is unavailable for a week. Two more arms are wanted, using runtimes that are available now:

- **Arm C, Claude Opus 5** on the review stages only, reconciliation and comparison, over the premium arm's frozen research artifacts. It tests a third model family on the expensive stage.
- **Arm U, Union Alpha** through oh-my-pi, a full arm from discovery through comparison, because it is free this week. It is slow; time is its cost.

You do not adjudicate the outputs. Freeze them with hash manifests and report timing, job statuses and cost. Adjudication against the union happens separately.

## The frozen protocol

The protocol continuation 3 ran is frozen at `~/PM-Experiments/jujutsu-followup-20260911/continuation3/protocol/`: `bounded_campaign.py`, `discovery_to_plan.py`, `cost_watch.py`, `native_receipts.py`, `research.py`, `prepare_continuation.py`, `freeze.json`, `freeze_protocol.py`, and `adapters/codex_native.py` and `adapters/omp_native.py`. Its gate report at `reports/jujutsu-research-2026-09-11/continuation3/gate/README.md` and the frozen `cost_policy.json` describe the admission rule: captured usage plus a $12 in-flight allowance per job until two jobs of a stage have reconciled usage, job-end reconciliation from native records, 2,400 seconds and 40 model requests per job, three workers, batches of at most three leads and 10,000 characters.

Do not modify the frozen directory. Copy it to `~/PM-Experiments/jujutsu-followup-20260911/continuation4/protocol/`, make your changes there, and record a new `freeze.json` with the hashes of every file, so both new arms run identical code.

The frozen case is under `~/PM-Experiments/jujutsu-20260911/d1/cases` and `~/PM-Experiments/jujutsu-20260911/protocol/cases`, snapshot `bc7569b3f5`. The premium arm's run directories and artifact hashes are named in `reports/jujutsu-research-2026-09-11/continuation3/end/runtime-summary.json` and `end/evidence-manifest.json`. Worker inputs are the frozen case and, for Arm C, the premium arm's own artifacts; DL-043, the deliverable 5 PlanUnits and anything landed after the snapshot stay outside every research input.

## Part 1. The Claude adapter

Write `adapters/claude_native.py` in the continuation4 copy, mirroring `adapters/omp_native.py`'s command line: `--cwd`, `--session-dir`, `--objective-file`, `--output-dir`, `--model`, `--thinking`, `--tools`, `--progress-file`, `--max-duration-seconds`, `--meaningful-idle-seconds`. It runs the Claude Code CLI headless from the job workspace: `claude -p` with the objective, `--output-format json`, `--model` as given, `--max-turns 40` as the request limit, and tools limited to Bash, Read, Write, Grep and Glob so the job uses the `research.py` helper in its workspace like the other arms. Write the CLI's JSON result and stream to the output directory, and produce the same `run.json` shape the scheduler expects from the OMP adapter, including status, duration and error. For job-end reconciliation, map the CLI's reported usage and cost into the record shape `native_receipts.py` reads for the other arms; if the shapes cannot be aligned, write a sidecar `claude-usage.json` per job with input, output and cache tokens and the CLI's reported cost, and make `cost_watch.py` read it. Add a `claude` adapter branch in the scheduler beside `codex` and `omp`.

Qualify it with one stub job of at most two turns and confirm: the job runs from the workspace, the objective reaches the model, the progress file is written, and usage is captured at job end. Then **stop and report** before launching any arm, with the cost the qualification reported.

## Part 2. Arm C, Claude Opus 5 review stages

Prepare a continuation for a new arm whose research artifacts are the premium arm's frozen discovery, study and history outputs, exactly as the premium continuation used them, and whose review model is `opus` through the Claude adapter. Limits: 12 admissions, 2,400 seconds and 40 turns per job, three workers, the frozen batching, and a captured cost cap of $100 as reported by the CLI. Run reconciliation and comparison. Freeze the outputs with a hash manifest. Report per-stage wall time, summed job time, average concurrency, job statuses including request-limited and truncated, and the CLI-reported cost. Stop and report.

## Part 3. Arm U, Union Alpha full arm

Resolve the exact oh-my-pi selector for Union Alpha from `omp models`; the table lists `union-alpha` with efforts minimal through xhigh. Record the selector you used. Run a full arm on the frozen case through the existing OMP adapter: discovery, implementation and history studies, reconciliation and comparison, at effort `high`, under the goal 2 limits: 20 admissions, 2,400 seconds and 40 requests per job, three workers, 6 hours of processing. Discovery and study workers receive the product brief only; the frozen Plans enter at reconciliation and comparison; nothing from any other arm. Freeze the outputs with a hash manifest and report as for Arm C, plus per-stage wall time, since speed is the question for this model.

## Rules

- One campaign at a time in the continuation4 directory; Arm C first, then Arm U.
- Twenty minutes per workflow-change attempt, two attempts for the adapter; if it cannot be made to work in that time, report and stop.
- Raw workspaces stay under `~/PM-Experiments/`. At the end, a compact bundle under `reports/jujutsu-research-2026-09-11/continuation4/` in the repository, landed by the AGENTS.md procedure from a VM-disk worktree: README, freeze hashes, per-arm timing and cost tables, job status tables, and the hash manifests of the frozen outputs.
- Report at three boundaries: after the qualification, after Arm C, after Arm U. State that you are an Opus 5 agent and name the models each arm used.
