# Brief: independent review of the continuation-4 adjudication before it lands (2026-09-16)

You are an Opus 5 agent reviewing another agent's adjudication. You did not run any arm and you did not score any. Read `/mnt/Cursor/PuppetMaster/AGENTS.md` first. Read-only throughout: no edits to the adjudication branch, no git command that changes state; write your review to `REVIEW_ADJUDICATION_20260916.md` beside this file.

## What was adjudicated

Branch `research/jj-c4-adjudication-20260916` (VM-disk worktree named in the adjudicator's PROGRESS.md under `~/PM-Experiments/jujutsu-followup-20260911/continuation4/adjudication/`) carries, under `reports/jujutsu-research-2026-09-11/continuation4/adjudication/`, one README, findings, candidates and scoring file per arm, a shared evidence manifest and SHA256SUMS. The arms are same-input review-stage replacements over the premium arm's frozen research artifacts (claude at the 40-response cap, claude-hicap at 160, deepseek41, glm53, muse13) and one full arm from discovery (union, Union Alpha through OpenRouter). Each is scored against the 110-finding union in `continuation3/final/comparison.json` by continuation 3's crediting rules: a delivered assertion is credited only when it states the same proposition and cites a passage; partials and out-of-union candidates are recorded separately.

The adjudicator is an Opus 5 agent and two arms are Claude Opus 5, so family bias is the first thing to test. The adjudicator's own reports claim the review arms nest (claude within muse13 within claude-hicap, deepseek41 within muse13) and that the four-arm union equals claude-hicap's set; test that claim, since it drives the conclusion.

## What to check

1. **Sample the credits both ways.** For each arm take at least eight credited findings, including every credited correction, and re-derive the credit from the arm's own delivered assertion and the union entry: same proposition, passage cited, not merely the topic. Then take at least eight misses per arm among findings the arm's inputs plausibly covered and check that no delivered assertion states them. Report any credit you would withdraw and any miss you would credit, with the assertion text and the union entry.
2. **Family bias.** Compare the strictness applied to the two Claude arms against deepseek41 and muse13 on findings all four attempted, especially F107 and the graph leads. State whether the same assertion quality got the same verdict.
3. **The nesting claim and the four-arm union.** Recompute from the findings files.
4. **The cross-arm factual verification** (the operation-store garbage-collection predicate): read the cited source lines in the arms' caches yourself and say whether the adjudicator's reading is correct.
5. **Out-of-union candidates.** For each candidate the adjudicator marked strongest, judge whether it is a correction to existing canon (names a promise and a contradiction) or a capability, and whether it duplicates an already-rejected expansion from continuation 3.
6. **Manifests and hygiene.** Verify SHA256SUMS and the evidence manifest, that the quarantined interrupted runs were not scored, that nothing outside `reports/**` is on the branch, and commit hygiene per AGENTS.md.

## Report

Findings first, ranked blocking, should-fix, note, with file and line. Then a verdict: land as is, or fix first with the list. Then the commands you ran, one line each. State that you are an Opus 5 agent.

## Also review the runner's bundle

The runner's own bundle is on branch `research/continuation4-20260917` (commit `2bd36e1881`, worktree `~/pm-worktrees/research-continuation4-20260917`), adding only `reports/jujutsu-research-2026-09-11/continuation4/**`: README, per-arm reports, freeze history, protocol fingerprints, output manifests, runtime identity, corrections. Check it the same way: every number in its tables reproduces from the durable run state under `~/PM-Experiments/jujutsu-followup-20260911/continuation4/`; the manifest hashes match the frozen trees; the freeze history lists every freeze in order and each run's pinned hashes match the code that ran; the corrections record names the four defects (event-per-block counting, the meter boundary off-by-one, the runtime identity, the shared temp name) with their fixes; the Codex fail-closed statement and re-proof procedure are present; nothing outside `reports/**`; and no credential-shaped string anywhere (the OpenRouter key must appear nowhere). Give a separate verdict for this branch.
