# Brief: continuation 5, spend the review budget on admissions (2026-09-17)

You are an Opus 5 agent, the runner. Read `/mnt/Cursor/PuppetMaster/AGENTS.md` first; the repository is touched only for the final compact bundle. Save a progress note to `~/PM-Experiments/jujutsu-followup-20260911/continuation5/PROGRESS.md` after every step; if resumed, read it first. Jared authorized this experiment on 2026-09-17 and authorized Opus 5 at max effort as the strong model.

## The question

Continuation 4 showed that on identical inputs the review models differ in depth, not in kind, that the binding limit in every arm was admissions rather than money or time, and that at most 14 of the premium arm's 88 leads reached a comparison in any review arm. The best review arm, claude-hicap, reached 45 of 110 with 14 leads compared. This continuation tests whether choosing which leads to admit, and splitting cheap breadth from strong depth, raises recall at the same admission budget and inside a production latency target of 75 minutes per arm at three workers.

## Arms

Both arms use the premium arm's frozen research artifacts in the state continuation 4's review arms received them (88 leads), the continuation-4 protocol copy with all four fixes and the runtime-identity gate, copied to `~/PM-Experiments/jujutsu-followup-20260911/continuation5/protocol/` and re-frozen. One campaign at a time. Quiesce the monitor and every telemetry writer before hashing a tree. DL-043, deliverable 5, the corrections landed this week and everything landed after snapshot `bc7569b3f5` stay outside every research input, and so does the 110-finding union and every continuation-4 adjudication file.

- **Arm P, prioritized depth.** A prioritization pass first: Muse Spark (`muse-code/muse-spark-1.3-contributor`, xhigh) reads the 88 leads and the product brief, nothing else, and ranks them by expected yield of contract corrections and coverage gaps, with a one-line reason per lead, as one job under the standard limits. Then reconcile and compare with Opus 5 through the Claude adapter, effort `max` if the CLI accepts it (check `claude --help`; otherwise `xhigh`, recorded), 12 admissions, 160 responses, 3,600 s and $20 per job, $150 cap, three workers, admitting leads in the ranked order rather than the frozen order. Everything else as claude-hicap.
- **Arm B, cheap breadth then strong compare.** Muse Spark reconciles all 88 leads under the standard limits (40 responses, 2,400 s, $50 cap, as many admissions as it takes, up to 30), then Opus 5 at the same settings as Arm P compares from Muse's reconcile outputs, 12 admissions, in Muse's delivery order. The compare stage never sees a premium reconcile output.

The baseline is claude-hicap's frozen result; do not re-run it.

## Report at each arm's terminal

Per-stage wall time against the 75-minute target, summed job time, average concurrency, job statuses and which limit bound each job, the prioritization ranking and its reasons for Arm P, how many of the 88 leads reached a comparison, the cost line, frozen output paths and manifest hashes, and the runtime identity block. No adjudication. Adjudication uses the continuation-4 method with one standing addition, authorized by Jared: every assertion of a code fact is verified against the pinned source in the arm's cache before credit, and the verification is recorded with the source lines.

## Bundle

At the end, a compact bundle under `reports/jujutsu-research-2026-09-11/continuation5/` from a VM-disk worktree with the sparse set `reports`, by the AGENTS.md procedure, including the three read-only landing checks in the full shared checkout; push the branch and stop for review; do not land until told. State that you are an Opus 5 agent and name the models each arm used.
