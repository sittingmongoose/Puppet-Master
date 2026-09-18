# Brief: currentness check and landing path for the continuation-4 correction candidates (2026-09-17)

You are an Opus 5 agent working for Jared's reviewer. Read `/mnt/Cursor/PuppetMaster/AGENTS.md` first and follow it exactly, including the landing rule with the three repository-wide checks. Save a progress note to `~/PM-Experiments/c4-candidates-20260917/PROGRESS.md` after every step; if resumed, read it first. This work starts only after the continuation-4 adjudication bundle is on `main` under `reports/jujutsu-research-2026-09-11/continuation4/adjudication/`.

## What exists

`consolidated-candidates.json` in that bundle lists 27 propositions the six continuation-4 arms delivered that match no finding in the 110-finding union: 20 shaped as corrections, 5 as capabilities, 2 as product choices. Five are flagged as inside classes continuation 3 already rejected; leave those five as recorded. The per-arm `*-candidates.json` files carry each candidate's assertion text, cited passages and evidence paths with hashes; the independent review `REVIEW_ADJUDICATION_20260916.md` beside this file upheld the classifications and judged the strongest candidate, the verification-depth convergence (Arm C `C4C-01` and glm53 `C4G-01`), a genuine correction in the same restore family as F106.

## Part 1. Currentness and adjudication of the correction-shaped candidates

For each of the correction-shaped candidates not flagged as rejected, in the order the bundle ranks them, starting with the convergence:

1. Re-read the cited canon passage on current `main`. Canon has moved this week: F106 to F109 landed (commits `fdddacea20`, `b0977cd851`), DL-051 to DL-054 with the picker PlanUnits and the parent-bound and duplicate-row rules (`a76f22a2f9`, `d43694b6e1`), and other threads have landed since. A candidate that current canon already covers is dropped and reported as covered, with the covering passage.
2. Decide whether it is a correction by continuation 3's test: it names an existing promise and a contradiction or gap that makes the promise unfalsifiable or false, and it adds no capability beyond repairing that. A candidate that turns out to be a capability or product choice is reclassified and set aside for a decision card, not landed.
3. Where two candidates are the same defect, merge them and credit both arms.
4. Write the result as an adjudication record under `~/PM-Experiments/c4-candidates-20260917/` with a hash manifest: for each candidate, verdict (correction to land, covered, reclassified, rejected), the passage, and the evidence hashes.

Stop and report after Part 1 with the list of corrections to land, before any canon edit.

## Part 2. Land the accepted corrections

Only after the reviewer confirms the Part 1 list. Follow the shape of the F106 to F109 landing exactly (see `reports/jujutsu-research-2026-09-11/continuation3-landing/` and its ledger `pldg-20260916-001-jujutsu-continuation-corrections`): owner text and acceptance criteria as folded scalars, schema and fixture changes with positive and negative fixtures each failing for the intended constraint, a new ledger `pldg-20260917-001-jujutsu-continuation4-corrections` registered and validated, derived files regenerated and committed with the edit, a compact bundle under `reports/jujutsu-research-2026-09-11/continuation4-landing/` with evidence receipts whose `use` fields name what each file actually supports. Relational rules JSON Schema cannot express go into the semantic gate only if Jared has authorized that script edit for the rule; otherwise they land as owner obligations marked unenforced, with a question recorded. Worktree `~/pm-worktrees/c4-corrections-20260917`, branch `plans/c4-corrections-20260917`, sparse set `Plans scripts reports tests`. Push and stop for the independent review before landing.

## Report

Part 1: the verdict table, with one line per candidate and the covering passage for anything dropped. Part 2: findings landed first, naming for each the promise repaired and the files changed; validator results one line each; branch and commit hashes; questions for Jared in one line each. State that you are an Opus 5 agent.
