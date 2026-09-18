# Brief: adjudicate the new review arms against the continuation-3 union (2026-09-16)

You are an Opus 5 agent acting as adjudicator. You did not run any arm. Your job is to score each new arm's frozen outputs against the adjudicated union of findings from continuation 3, using the same method continuation 3 used, and to report recall and cost per arm in a form that can be compared with the premium and hybrid arms. Read `/mnt/Cursor/PuppetMaster/AGENTS.md` for the repository rules; the repository is touched only for the compact report bundle at the end.

## The union and the method

- Union: `reports/jujutsu-research-2026-09-11/continuation3/final/comparison.json`, 110 findings F001 to F110, each with a class (correction, optional capability, product choice, unsupported or rejected), the arms that supported it, and a distinctness note. Continuation 3's per-job reviews are in `final/closing-job-reviews.json`, its symmetric adjudication in `final/symmetric-adjudication.json`, and its independent review in `final/independent-review.json`. Read those first to learn the crediting rules: a job is credited with a finding only when its delivered assertion states the same proposition, cited to a passage, not when it merely touches the topic; partial matches are recorded as partial, not credited; new propositions not in the union are recorded as candidates with evidence, not added to the union by you.
- Premium and hybrid recall on the fixed union are in the continuation-3 final README; use the same denominators.

## The arms to score

Each arm's frozen outputs, hash manifest and job table are named in `~/PM-Experiments/jujutsu-followup-20260911/continuation4/PROGRESS.md` and the arm's `runs/<name>/` directory. Score whichever of these are complete when you start, and say which are not:

| Arm | Review model | Inputs |
|---|---|---|
| claude | Claude Opus 5, xhigh, through the Claude Code CLI | the premium arm's frozen discovery, study and history artifacts |
| deepseek41 | opencode-go/deepseek-v4.1-flash, max | same |
| glm53 | zai/glm-5.3-flash, max | same |
| muse13 | muse-code/muse-spark-1.3-contributor, xhigh | same |
| union | Union Alpha, full arm from discovery | the frozen case only |

Important caveats to carry into the report: the review arms are same-input replacements of the review model over the premium arm's research artifacts, so their recall is bounded by what those artifacts contain; the Claude arm's adjudicator and reviewed model share a family; the 40-request per-job cap truncated most Claude jobs, so record request-limited coverage separately as continuation 3 did.

## Output

For each arm: findings credited (by id), partial matches, candidates outside the union with evidence paths and SHA-256, recall on the fixed union by class, shared versus unique coverage against premium and hybrid, request-limited and budget-truncated coverage, per-stage wall time, summed job time, average concurrency, and the cost line from the arm's meter. One table comparing all scored arms with premium and hybrid. Write everything to `~/PM-Experiments/jujutsu-followup-20260911/continuation4/adjudication/` with a hash manifest, and a compact bundle under `reports/jujutsu-research-2026-09-11/continuation4/adjudication/` on a branch `research/jj-c4-adjudication-20260916` from a VM-disk worktree per AGENTS.md, sparse set `reports`; push the branch and stop; do not land until told. State that you are an Opus 5 agent, and state which arm outputs you read by path and hash.
