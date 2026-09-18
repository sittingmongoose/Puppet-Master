# Brief: currentness check and correction test for the Azure DevOps union (2026-09-17)

You are an Opus 5 agent working for Jared's reviewer. Read `/mnt/Cursor/PuppetMaster/AGENTS.md` first and follow it exactly. Save a progress note to `~/PM-Experiments/topic2-candidates-20260917/PROGRESS.md` after every step; if resumed, read it first. This is Part 1 only: no canon edit, no Plans branch.

## What exists

The second research topic, `Plans/Azure_DevOps_Integration.md`, was run as two full arms on a frozen case (Opus 5 throughout; Muse research with Opus review) and blindly adjudicated into a union of 73 propositions: 32 correction-shaped, 8 optional capabilities, 4 product choices, 29 already covered. The adjudication is under `~/PM-Experiments/topic2-20260917/adjudication/topic2/` (`topic2-union.json`, `topic2-arm-scoring.json`, `README.md`, manifest `../topic2-manifest.json`) and its compact bundle is on branch `research/topic2-adjudication-20260917` (commit `3fcfde3e3b`) under `reports/research-topic2-20260917/adjudication/`. The arms' frozen outputs are under `~/PM-Experiments/topic2-20260917/` (read-only). The union rests on five compared leads and supports per-defect claims anchored to passages, not a recall estimate for the document; carry that limit into your record.

## Part 1

For each of the 32 correction-shaped propositions, in the adjudicator's ranking order, starting with the six it lists as top candidates (the ADO-003 fixture surface that does not exist; the two tokens absent from the Azure profiles; the checks command requiring a key Azure cannot accept; blocking-ness with no carrier and the two enums' `notApplicable` collapse; TFVC required elsewhere and never mentioned by the owner; the merge command's missing strategy field selecting no-fast-forward by omission):

1. Re-read the cited owner passage on current `main`, and every consumer passage the union names (forge acceptance packets, command catalog, wiring rows, fixtures). A proposition current canon already covers is dropped and reported as covered, with the covering passage.
2. Apply continuation 3's correction test: it names an existing promise and a contradiction or gap that makes the promise unfalsifiable or false, and adds no capability beyond repairing it. Verify every provider or API fact against the arm's cached sources under the run directories, and record the source lines; a fact you cannot verify is recorded as unverified and the proposition is set aside, not landed.
3. Merge propositions that are the same defect; reclassify anything that is a capability or product choice and set it aside for a decision card.
4. Write the verdict table and record under `~/PM-Experiments/topic2-candidates-20260917/` with a hash manifest: for each proposition, verdict (correction to land, covered, reclassified, unverified, rejected), the promise, the contradiction, the passages, the evidence hashes, and merged pairs.

Stop and report after Part 1 with the verdict table, the count of corrections to land, the questions for Jared one line each, and the four product choices in one line each so they can become decision cards. A separate reviewer confirms the list before any landing branch. State that you are an Opus 5 agent.
