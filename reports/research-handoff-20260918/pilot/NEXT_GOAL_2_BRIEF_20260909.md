# Next goal 2 (issued 2026-09-09; revised 2026-09-10 for the repository rules; revised 2026-09-11 after the research agent's review): the first real Puppet Master topic through the whole loop

Written by Jared's reviewer after verifying the five-deliverable goal. Read `/mnt/Cursor/PuppetMaster/AGENTS.md` first: it holds the working rules for every agent and overrides anything here that conflicts with it. Then read `Plans/Decision_Log.md` DL-035 through DL-039 and `DECISIONS_PLAIN_20260909.md`; they are the authority for the product direction and the decision format.

The 2026-09-11 revision accepts the research agent's five corrections: an unbiased comparison contract, explicit campaign limits, an approval checkpoint, one landing procedure consistent with AGENTS.md, and a more precise case boundary. It also makes latency a measured deliverable, because production Puppet Master cannot spend hours of research per topic on the two to four agents most users can afford.

## What changed since your last report

- **The repository history was rewritten on 2026-09-10.** Any clone or worktree from before that is stale and must not push. Start from a fresh worktree using the template below; read AGENTS.md "Working rules for every agent" first.
- **Your five deliverables verified.** D1 through D3 are in the owners, D4's comparison stage completed, D5 is sound and corrected the reviewer's unit count. Jared confirms DL-037 and DL-038 are his answers.
- **Push was the missing step.** Your last five commits sat unpushed for hours; the reviewer pushed them. Now the rule is stronger and simpler: push your branch after every landing-sized step. Unpushed work does not exist.
- **Concurrency is expected, not avoided.** Other tracks run at the same time as you. Each agent has its own worktree and the repository was slimmed on 2026-09-10. The only serialized step is landing on `main`: one writer at a time, never while the Plans agent is resealing. If git in your worktree slows to minutes, report it rather than working around it.
- **The Concepts restore was correct.** Nothing further to do there.
- **DL-039 is taken.** Another thread recorded Event Authority decisions under it on 2026-09-10. Never assume an ID; allocate the next unused `DL-NNN` during the serialized landing step, after rebasing, and check `Plans/Decision_Log.md` first.
- **Other agents edit the Plans continuously.** You work in your own sandbox and never edit the shared checkout.

## Before you start: the 2026-09-10 rewrite

- **The tree was restructured and every commit hash changed.** Nothing you landed was lost; the head tree is byte-identical. Your five deliverables are now D1 `98258a07f1`, D2 `7ba82a6fc4`, P10 answers `b027f3b0e1`, D4 `b32452559f`, D5 `12f069a2c2`. Do not cite the old hashes.
- **Make your worktree on the VM's local disk under `~/pm-worktrees/`**, exactly as the AGENTS.md template shows, including its `safe.directory` line, which is required even on local disk because the worktree's index and git directory stay on the mount. Never on the mount.
- **Raw evidence has a home.** Native workspaces, captures and scratch go to `/mnt/Cursor/PuppetMaster-Evidence/` or stay under `/mnt/Cursor/PM-Experiments/`. Only compact sanitized result bundles go under `reports/`, cited by path plus SHA-256, as D4 and D5 did.
- **Regeneration commands are deterministic now.** After any Plans edit on your branch: `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json`, then `python3 scripts/pm-plan-index.py generate`, then `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json`. If derived files change for documents you did not edit, stop and report instead of committing them.
- **Remove your worktree once its branch is on main** and make a fresh one for the next step.

## The goal

Run the research loop once on a real, untuned Puppet Master topic, compare the two research configurations fairly on it, land its result, and measure where the time goes. Nothing synthetic this time.

**Topic: Jujutsu Integration.** Owner `Plans/Jujutsu_Integration.md`, eight PlanUnits, 506 lines, last touched 2 September. Jujutsu is young and fast-moving, several competing integrations exist to study, and model prior knowledge is weak. If Jared swaps the topic in his paste line, everything below applies unchanged.

**Model roles.** Astra XHIGH is used only where it defines the premium arm: that arm's discovery, studies, reconciliation and comparison. Case preparation, accounting, freezing, verification, adjudication drafting, ledger work and landing use scripts and Medium-effort agents. XHIGH may resolve a named dispute in adjudication; each such use is recorded.

Five deliverables, in order. Each is landed on your branch, verified, pushed, and reported in one paragraph before the next starts. The goal has a mandatory checkpoint after deliverable 4; it does not promise uninterrupted completion. This execution's completion point is precise: deliverables 1 through 4 done and the decision packet awaiting Jared's answers. That is the checkpoint. Deliverable 5 stays pending until the answers arrive, and reaching the checkpoint is reported as reaching the checkpoint, never as completing the brief.

### 1. Prepare the case

In your worktree, from the snapshot commit you froze, build the case with `prepare_case.py` and explicit includes, `--plans-dir` pointing at the worktree's `Plans`. Include:

- the owner document and its direct consumers from the owner map in `Plans/00-plans-index.md`;
- every other document that references the topic, found mechanically: search the frozen Plans for `Jujutsu`, `jujutsu` and `jj` as a word, and include each document that binds to it, at least Source Control, Permissions, FileSafe, Backup and Restore, and Shared Integration Runtime where they do;
- the relevant Contracts and Wiring rows and the validation fixtures those documents name;
- a recorded list of what was included, what was found and excluded, and why. The owner map is a starting point, not a complete dependency graph.

Write the product brief in plain product terms from those documents. Record the snapshot SHA. There is no answer key and none is needed; this is a real audit. This deliverable is script and Medium work.

### 2. Run both arms from the same frozen case, before any landing

Two campaigns, same case, same brief, same limits, same scheduler, neither seeing the other's outputs or anything landed after the snapshot:

- **Premium:** Astra XHIGH for discovery, studies, reconciliation and comparison.
- **Hybrid:** DeepSeek V4 Flash MAX for discovery and studies; Astra XHIGH for reconciliation and comparison.

Discovery covers Jujutsu itself, tools built on it, IDE and editor integrations, and how adjacent version-control integrations in other workbenches evolved. Studies follow the leads. Reconciliation and comparison run against the frozen Plans.

**Limits per arm.** 2,400 seconds per job, at most one retry per job, at most 20 admitted jobs, at most 6 hours elapsed, and a usage cap of $150 Astra API-equivalent for the premium arm and $60 combined for the hybrid arm, both on the preserved September 8 basis. When any limit is reached the campaign stops, preserves pending leads and unfinished intake visibly, and reports a partial result. Workflow repair is limited to twenty minutes per attempt and two restarts per arm; after that, preserve the attempt and report. Every limit is cumulative across all attempts, retries and restarts of that arm: a restart inherits the time and usage already spent and never resets them.

**Overall limit before the checkpoint.** Preparation, freezing, adjudication, verification and landing sit outside the per-arm caps. Together with both arms they may use at most 24 hours of processing time, human waiting excluded, and at most $60 Astra API-equivalent of non-arm usage, with at most five named XHIGH dispute resolutions. When either is reached, stop, preserve, and report the point the work has reached. That is a partial result, not the checkpoint.

**Concurrency.** The D4 run was launched with two workers but ran at an average concurrency of 0.98: the scheduler admitted one review batch per pass because the 30,000-character batch absorbed every ready lead, and no comparison started until every reconciliation had finished. Four reconciliations ran one after another for 123 minutes and four comparisons for 120 minutes. Before launch, admit several smaller review batches per pass and start each comparison as soon as its reconciliation batch finishes, with the worker cap raised to three or four. Pipelining is allowed only with a dependency check: a comparison batch may start early only when every input it requires has a terminal outcome and an immutable hash. If the change cannot be done inside the repair limit, launch anyway and record the reason. Freeze the scheduler before either arm starts: both arms run the same code, with the SHA-256 of `discovery_to_plan.py`, `child_transport.py` and `research.py` recorded in each run's record, the same worker count and the same batching policy. Either way, report per-stage wall time, summed job time and average concurrency for each arm; the two-hour figure below is a hypothesis to measure, not a target to hit.

**Freeze.** When both arms finish, write a hash manifest of every report and lead from each arm before any adjudication begins. Those manifests are the inputs to deliverable 3.

### 3. Adjudicate the union blind

Pool both arms' findings with arm labels stripped. Deduplicate. Classify every finding as one of:

- **Correction:** repairs an existing promise or contradiction in the frozen Plans, and cites the passage it repairs. A finding that cannot name the passage is not a correction.
- **Optional capability:** a feature Puppet Master does not promise today.
- **Product choice:** a consequential tradeoff Jared must decide.
- **Unsupported or rejected:** with the reason.

Upstream features and hardening ideas never become requirements by themselves; they go to the packet as capabilities or choices. A declined capability is not an incorrect finding.

Then re-attach the arm labels and report, per arm: recall against the adjudicated union by class, shared findings, unique contributions, unsupported findings, findings lost between stages, budget-truncated coverage (leads left pending when a limit stopped the arm), wall time, summed job time, concurrency and cost. Call the score what it is, recall against the adjudicated union. Both arms can miss the same requirement, so the union is the best available reference, not ground truth. This is the first premium-versus-hybrid measurement on a real Puppet Master topic, and it is fair because neither arm's output defined the denominator. Adjudication is Medium work with scripts; name any XHIGH dispute resolution.

Outputs: the corrections set; a plain-language decision packet in the `DECISIONS_PLAIN_20260909.md` form covering every optional capability and product choice, with the question, why it came up, what Jared would get, what it costs, the options and a recommendation; the technical companion beside it; and the comparison table with one cost line per arm.

### 4. Land the corrections, publish the packet, and stop

Apply the corrections on your branch through the ledger path with independent review. Regenerate derived files on the branch, commit only the paths you changed, push, and land on `main` by the procedure below. Publish the packet and companion. Land nothing from the packet.

Then stop at the checkpoint and report: findings landed first; the packet; the comparison table; one cost line per arm; per-stage timing per arm; gate state in one line. From this point, human waiting time is reported separately from processing time. The goal resumes only when Jared's answers arrive.

### 5. After Jared answers

Resume in a fresh worktree from current `main`. During the serialized landing step, allocate the next unused `DL-NNN` and record the dispositions in both Decision Log sections. Add accepted items as PlanUnits under their owners. Regenerate on the branch, push, land. Declined and deferred items stay recorded so they are never re-asked. Remove the worktree.

## Sandbox and landing

The earlier sandbox on the mount no longer exists, and the working rules now put every agent worktree on the VM's local disk. Create yours with the template in AGENTS.md "Where to work":

```
git config --global --add safe.directory ~/pm-worktrees/jujutsu-<date>
git -C /mnt/Cursor/PuppetMaster fetch origin
git -C /mnt/Cursor/PuppetMaster worktree add --no-checkout -b research/jujutsu-<date> ~/pm-worktrees/jujutsu-<date> origin/main
cd ~/pm-worktrees/jujutsu-<date> && git sparse-checkout set Plans scripts reports && git checkout research/jujutsu-<date>
```

- **Worktree** on the VM disk, never on the mount. All your edits happen there. The shared checkout is read-only to you except for the landing step. Open your Codex session in the worktree so its status scans hit local disk.
- **Research** reads the frozen case only. Prepare the case from this worktree so it records the snapshot commit.
- **Drafting** happens on the branch. Regenerate derived files there so the pre-commit hook passes, commit only the paths you changed, and push the branch after every landing-sized step. A pushed branch is your backup and your handoff.
- **Landing on main follows AGENTS.md "How to land on main" exactly**, including the currentness check for every cited passage and the rule that a shard-check failure in files your branch does not touch is reported, not fixed. Two details it leaves to you: because your branch was already pushed, do not force-push it after rebasing onto `origin/main`; create a fresh landing branch from the rebased state, for example `research/jujutsu-<date>-land1`, push that, and leave the original pushed branch as the snapshot. And for every correction and PlanUnit, compare the snapshot passage it cites with the current passage: unchanged, apply; changed, re-adjudicate against the current text; now covered, drop it and say so; conflicting with a direction another agent took since the snapshot, do not resolve it yourself, add a one-line "changed since snapshot" question to the packet. Regeneration happens on the landing branch. Nothing is regenerated or committed in the shared checkout; it only fast-forwards, checks and pushes.
- **The branch never touches Spec Lock, evidence or readiness artifacts.** Reseals happen on main after your branch lands, by the Plans agent.

This is the rule the Planning Wizard canon already sets for its own topic agents: researchers propose against a snapshot, one writer performs serialized writes, and passages changed since the snapshot are re-checked before an amendment applies (PWIZ-011, PWIZ-014).

## Rules

- Everything in AGENTS.md applies and overrides anything here that conflicts with it.
- Commit only the paths you changed, with a message that says what they are. Never `git add -A`. Never commit another thread's edits. Never `--no-verify`. Never prune anything under `Concepts/`.
- Push your branch after every landing-sized step.
- One campaign of yours at a time; the two arms in deliverable 2 run one after the other. Other tracks may run concurrently; do not wait for them. Do not land on `main` while the Plans agent is resealing.
- Report findings landed first, then one cost line per arm, then gate state in one line. Decisions go in the plain-language form; lead IDs, hashes and job numbers go in the companion.
- Every automatic correction names the existing promise or contradiction it repairs and cites the passage.
- Report per-stage wall time, summed job time and average concurrency for every campaign, and human waiting time separately from processing time.
- Do not re-ask anything answered in DL-035 through DL-039.
- Workflow changes are limited to twenty minutes per attempt and two restarts per arm.
- Raw native workspaces stay outside the repository. A compact sanitized bundle goes under `reports/`, as D4 did.

## Latency is now a goal of this track

Production Puppet Master cannot spend hours of research per topic on the two to four agents most users can afford, and the planning pipeline's own target is already about an hour. This goal does not solve that, but it must produce the evidence to solve it: per-stage timing for both arms, the concurrency actually achieved, and the effect of the scheduler fix above. The D4 run's wall time was 4.6 hours at concurrency 0.98; the hypothesis is that the same work at three workers with comparisons pipelined behind reconciliations lands near two hours with no loss of coverage. Measure it and report what actually happened. Thoroughness is not traded for time here; the limits above bound the run, and the coverage report shows what was left pending.

## Governance reseal: authorized, but not yours

Jared authorized a full governance reseal on 2026-09-09. **A separate Plans agent performs it**, following `RESEAL_INSTRUCTION_20260909.md` in this directory. Do not run the seal, evidence refresh or migration refresh yourself. Do not land on main while the reseal is in progress; land deliverables 4 and 5 as two tight merges, and tell Jared when deliverable 5 is on main so the Plans agent can run the second, smaller reseal.

## A third goal after this one, if Jared chooses

The workflow you have now proven, from a Wonderer lead through discovery, studies, reconciliation, comparison and the DL-036 decision cards, is not yet specified as a Puppet Master feature in the Plans. When it is, its specification must include the latency architecture: research running concurrently with the planning run rather than as a serial stage, decision cards streamed to the user as items are adjudicated, retrieval and census done in code rather than by the model, user-selectable depth with honest coverage, and shared research portfolios for domains many users' topics share. That is the natural next goal once this real run has produced the timing evidence.
