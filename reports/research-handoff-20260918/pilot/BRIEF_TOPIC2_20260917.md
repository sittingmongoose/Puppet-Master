# Brief: a second topic, two full arms, one union (2026-09-17, overnight)

You are an Opus 5 agent, the runner. Read `/mnt/Cursor/PuppetMaster/AGENTS.md` first, then `~/PM-Experiments/jujutsu-followup-20260911/continuation4/PROGRESS.md` and `continuation5/PROGRESS.md` for the machinery: the protocol copy, the Claude adapter, the oh-my-pi selectors, the credential rule, the slot lock, the freeze procedure with the quiesce rule, the runtime-identity gate. Work under `~/PM-Experiments/topic2-20260917/` with your own protocol copy and freeze; save a progress note there after every step; if resumed, read it first. Jared authorized this overnight and authorized Opus 5 at max effort as the strong model.

## Why

Everything measured so far is one frozen case, the Jujutsu integration. Whether the process generalizes needs a second topic run the way goal 2 ran the first: two full arms from discovery, a blind union of their findings, and recall of each arm against it.

## Topic selection, by rule

List the owner documents under `Plans/` that (a) describe a product surface with a real external body of knowledge to research (tools, protocols, formats, other products), (b) have not been the subject of a research campaign (exclude Terminal, Jujutsu Integration, Source Control, the Section 15 and event-authority material, and anything named in `reports/`), and (c) are thin: rank by fixtures and acceptance units per PlanUnit against the corpus median. Take the thinnest that satisfies (a), record the five runners-up with their numbers, and write a product brief of at most 1,500 words from the owner document's stated purpose and the user-facing behaviour it promises, with no plan text, unit ids or acceptance criteria in it. Freeze the case with the protocol's case preparation the way `bc7569b3f5` was frozen: the Plans snapshot hash, the brief, the owner passages that enter at reconcile.

## Arms

Run both concurrently in two campaign directories under `topic2-20260917/`, since they share no state and the worker-record race is fixed; three workers each.

- **Arm S, strong throughout.** Opus 5 through the Claude adapter, effort `max` if the CLI accepts it (else `xhigh`, recorded), every stage from discovery: 20 admissions, 160 responses, 3,600 s and $20 per job, $250 cap.
- **Arm H2, cheap research, strong review.** Muse Spark (`muse-code/muse-spark-1.3-contributor`, xhigh) for discovery and the studies at the standard limits (40 responses, 2,400 s, up to 12 admissions, $50); Opus 5 as in Arm S for reconcile and compare, 12 admissions, $150 cap.

Discovery and study workers receive the product brief only; the frozen owner passages enter at reconcile and compare; nothing from any other arm or from any Jujutsu material. If the Claude CLI reports a usage or rate limit, wait and retry every 15 minutes rather than stopping, and record the wait.

## Report and hand-off

At each arm's terminal: per-stage wall time against a 75-minute target for the review stages and a 3-hour target for the whole pipeline, summed job time, concurrency, job statuses with which limit bound each, cost, frozen output paths with manifest hashes, runtime identity. No adjudication; the adjudicator receives both arms' frozen outputs and builds the union blind, then scores each arm against it. Keep a compact bundle current under `reports/research-topic2-20260917/` on a branch from a VM-disk sparse worktree (`research/topic2-20260917`), pushed after each arm; do not land. State that you are an Opus 5 agent and name the topic, the brief's hash and the models each arm used.
