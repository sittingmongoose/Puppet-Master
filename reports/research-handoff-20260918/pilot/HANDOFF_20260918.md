# Handoff: the external research process for Puppet Master plans (as of 2026-09-18, main at dd1df59d63)

This document is for a model that has the GitHub repository and this zip, and nothing else. It says what we are trying to do, how we did it, what we measured, what we concluded, and where every claim's evidence lives. Verify the findings; then look for better ways to reach the goal. Everything below was produced by AI agents (Codex "Astra" first, then Claude Opus 5 agents coordinated by a Claude Fable 5.1 session) under Jared's direction; Jared made every product decision recorded here.

## 1. The goal

Puppet Master (PM) is a Rust/Slint coding-agent workbench, currently in a planning phase. Its plans live in `Plans/` as owner documents made of PlanUnit YAML blocks (`plan_unit_id`, `canonical_text`, `acceptance_criteria`, `validation_surfaces`), with JSON schemas and fixture packs as contracts, derived shards and an index under `Plans/_shards` and `Plans/.plan_index`, and ledgers under `Plans/ledgers/v2/`. There are about 6,700 PlanUnits.

PM must be able to take a user's idea or an incomplete plan and turn it into a well-researched, coherent plan by researching the external world (tools, protocols, other products) and comparing the findings against the plan. We are building that capability by using it on PM's own plans first. Two constraints from Jared: quality must not drop, and the process must fit a product budget of roughly 60 to 75 minutes per topic with two to four agents, because most users cannot afford more.

## 2. The process as it stands

A topic is one owner document. A research **arm** is one configuration of models run through five stages, each stage a set of bounded jobs with fresh native model sessions and Markdown hand-offs:

1. discovery from a product brief (no plan text is admitted, so the research cannot parrot the plan);
2. implementation and history studies of the external subject;
3. reconciliation of leads against a frozen snapshot of the plan;
4. comparison, which produces propositions classed as **correction** (the plan promises something false or unfalsifiable), **optional capability**, **product choice**, or **unsupported or already covered**;
5. blind adjudication of every arm's propositions into a **union**, then each arm's recall against that union.

Corrections land in canon under a standing repair authorization, after a currentness re-check against current `main`, an independent review, and a ledger; capabilities and product choices go to Jared as plain-language decision cards (question, why, what you get, what it costs, options, recommendation) and his answers become Decision Log entries. Budget accounting per job and per arm, per-job limits, provenance hashes and runtime identity are recorded for every run. This process is now itself product canon: `Plans/External_Research.md` (ERS-001 to ERS-014), landed 2026-09-17.

## 3. What was run, and what it measured

All numbers are on `main` in the report bundles named in section 5. "Recall" means findings credited to an arm out of the adjudicated union of 110 findings on the first topic.

**Topic 1: Jujutsu integration** (`Plans/Jujutsu_Integration.md` and its contracts). Frozen case `bc7569b3f5`.

| Arm | Configuration | Recall of 110 | Corrections of 5 | Cost | Wall |
|---|---|---|---|---|---|
| premium | Codex Astra XHIGH, every stage, two campaigns | 78 | 4 | $121.92 lifetime | 66 min review |
| hybrid | DeepSeek research, Astra review | 90 | 2 | $73.72 lifetime | 42 min review |
| claude (continuation 4) | Opus 5 review stages over the premium arm's frozen research, 40-response ceiling | 18 | 0 | $36.12 | 31 min |
| claude-hicap | same, 160-response ceiling | 45 | 2 | $82.52 | 59 min |
| deepseek41 | DeepSeek 4.1 Flash review stages, same inputs | 34 | 0 | $0.53 | 19 min |
| glm53 | GLM 5.3 Flash, same | 36 | 0 | $0.82 | 54 min |
| muse13 | Muse Spark 1.3, same | 40 | 1 | $0.16 | 11 min |
| union | Union Alpha (OpenRouter), full pipeline from discovery | 42 | 0 | $0.00 | 106 min |
| Arm P (continuation 5) | Muse ranks the 88 leads, Opus 5 reviews in ranked order | 32 | 0 | $85.51 | 70 min |
| Arm B | Muse reconciles all 88, Opus 5 compares in delivery order | 39 | 1 | $102.56 | 92 min two stages |
| T80 | Opus 5, frozen order, 80-response ceiling | 26 | 1 | $76.45 | 104 min |
| A24 | Opus 5, frozen order, 24 admissions | 43 | 2 | $162.15 | 110 min |

Conclusions the adjudications reached, each verifiable in the bundles:

- **On identical inputs the review models differ in depth, not in kind.** The four cheapest review arms nest inside the strong arm's set; no new arm found anything the premium and hybrid arms had not; the union over all ten arms stopped growing at the eighth (62 of 110).
- **The binding limit was admissions, never money or time.** At most 14 of the premium arm's 88 leads reached a comparison in any 12-admission arm.
- **Turn budget must be sized to finish.** Opus needed 37 to 110 responses per job; at 40 it lost eleven of twelve jobs; at 80 it capped three of twelve and the arm was the slowest. The turn ceiling itself explains only two findings of the 80-versus-160 gap; the one-hour job limit explains eight; run-to-run variance explains eight.
- **The variance floor is seven to eight findings**, measured twice on identical inputs with no limit involved. Any difference inside that band is noise. That makes single runs unreliable as measurements.
- **Ranking leads by expected yield lost thirteen findings**: the ranking concentrated on one theme and dropped two families; credits per rank band were flat. Cheap breadth (Muse reconciling everything for 36 cents, then a strong compare) beat ranking by seven and was inside the noise band of the strong baseline, but its yield per compared lead fell steeply (3.2 to 1.2), and the cheap reconcile earned no credits itself because it cites no plan passages.
- **Doubling admissions** bought five findings for about eighty dollars.
- **A different research model did not change the union** (Union Alpha, free, full pipeline: 42 of 110, nothing outside the existing union; its research stages produced no first credits; its reconcile and compare produced them all).
- **Adjudication must verify code facts against source.** One Jujutsu garbage-collection fact had five outcomes across six arms; both Claude arms asserted the false reading, one while quoting the code that refutes it; the cheap models either read the source or declined to claim.
- **Production reading** (continuation-5 adjudication README): plan around one strong model at high effort over an unranked lead set with twelve admissions and a turn ceiling above the observed maximum; do not buy more admissions; do not rank; use breadth to extend the union, not to raise recall; budget for variance.

**Topic 2: Azure DevOps Integration**, selected by rule as the thinnest un-researched owner document. Two full arms from discovery (Opus 5 throughout; Muse research with Opus review). Union of 73 propositions from only five compared leads: 32 correction-shaped, 8 capabilities, 4 product choices, 29 covered. Arm S 50, H2 42, neither a subset. After a currentness and correction test and a confirmation review, **26 corrections landed** on 2026-09-18 (`e9fafbdb21`), with seven product decisions as DL-059 to DL-065. The union cannot support a recall estimate for the document; it supports per-defect claims anchored to passages.

## 4. What else the work produced

- Thirteen corrections on the Jujutsu owner and its contracts from the six-arm candidates (`61bea7aabc`), and a compile repair of that landing and of the External Research owner after a deterministic **compile witness** (`scripts/pm-ledger-compile-witness.py`, from a peer thread's pilot) and two blind form-driven reviews found defects both landed reviews had missed (`d108ef5336`).
- Process rules adopted on 2026-09-17 and 2026-09-18: prose compiles split from schema and fixture companions with the witness between; acceptance is deterministic checks plus one blind form-driven review with a cycle cap of two, remaining items recorded as open ledger questions; landing checks report only failures new since a recorded baseline or naming the branch's own files (`scripts/pm-landing-check.py`, branch `fix/landing-baseline-20260917`, reviewed, awaiting one decision); a nightly baseline refresh as a scheduled task.
- Decision cards and answers: `DECISIONS_PLAIN_20260909.md` (terminal), `JUJUTSU_ANSWERS_20260911.md` (44 answers, DL-043), `F110_ANSWER_20260916.md`, `C4_CANDIDATE_ANSWERS_20260917.md`, `ANSWERS_20260918.md`, and the card pages `C4_DECISION_CARDS_20260917.html`, `AZURE_DECISION_CARDS_20260918.html`.

## 5. Where the evidence is

On GitHub at `dd1df59d63` or later:

- `reports/jujutsu-research-2026-09-11/` : `continuation3/` (the premium and hybrid arms, the 110-finding union, gate reports), `continuation4/` (six arms, runner bundle, `adjudication/` with per-arm findings, `consolidated-candidates.json`, `cross-arm.json`), `continuation5/` (five arms, `adjudication/` with `campaign-union.json`, the five-arm table and the production reading), `continuation3-landing/`, `continuation4-landing/`, `f110-landing/`, `d5/`.
- `reports/research-topic2-20260917/` : the Azure DevOps runner bundle, `adjudication/`, `landing/`.
- `reports/compile-repair-20260917/`, `reports/external-research-canon-20260917/`, `reports/ledger-compile-witness-20260917/`.
- `Plans/External_Research.md` (the process as canon), `Plans/Decision_Log.md` DL-035, DL-036, DL-043 and DL-051 to DL-065, the ledgers `Plans/ledgers/v2/pldg-2026091{1,6,7,8}-*`.
- `AGENTS.md` and `.claude/CLAUDE.md` for the working rules every agent follows.

In this zip (local files not in the repository):

- `pilot/` : every brief given to an agent (`BRIEF_*.md`, `NEXT_GOAL_2_*.md`), every review (`REVIEW_*.md`), every answer record and card page, this document.
- `progress/` : the runners' step logs (`continuation4`, `continuation5`, `topic2`), which record every defect, fix and hold in the order they happened.
- `adjudication/` : the adjudicators' working records for continuations 4 and 5 and topic 2, and the candidate records (`c4-candidates`, `topic2-candidates`).
- `blind-reviews/` : the findings files of the blind form-driven reviews, with the review form.
- `jev-pilot/` : the peer thread's reports on its decision-model pilot, which produced the witness, the blind-review form and the acceptance rule.

The raw run trees (job workspaces, model streams, caches, about 400 MB each) are not included; every bundle names them by path and SHA-256 and the adjudications verified the manifests three ways.

## 6. What we are unsure about, honestly

- **Two topics only**, one of them thin. The nesting and variance results come from the Jujutsu case; Azure DevOps has five compared leads.
- **Same-family adjudication.** Opus 5 adjudicated Opus 5 arms; a reviewer tested for family bias and found none, but only on those arms.
- **Cost figures for Claude arms are subscription-equivalent** as reported by the CLI, not billed; the cheap arms are at published tariffs.
- **The account's rate windows shaped the runs.** Several arms were interrupted or drained; the records label every interruption, every archived attempt, and two human-verified wait intervals. A drain tool of ours crashed four campaigns before its replacement was proven; the records say so.
- **Orchestration overhead is large and unmeasured** in dollars: each arm needed a runner agent, an adjudicator, and one or two reviewers, each an Opus 5 session of 150K to 900K tokens. Those agents were long-lived and did many steps each, which is heavier than the per-job fresh-session design used inside the arms.

## 7. What we want from you

1. **Verify the findings** in section 3 against the bundles: the recall table, the nesting claim, the variance floor, the per-lead yield curve, the union's growth, and the source-verification record. Say where the evidence is weaker than the claim.
2. **Time.** The measured review stages take 20 to 110 minutes per topic at three workers, and a full pipeline 106 minutes at concurrency 2.6. A project has many topics. Propose ways to bring a topic under the 60 to 75 minute target without losing the union's quality. Things we have considered but not tested: eight or more workers when not bound by one account's window; running topics as independent parallel campaigns; a deterministic or cheap pre-filter for the "already covered" class, which was 63 of 110 findings and consumes most of the strong compare's turns; deterministic witnesses for settled obligations instead of premium re-verification; a cheaper adjudicator once the union is stable.
3. **Cost and coordination.** The runner, adjudicator and reviewer agents are each asked to do many steps. Propose a decomposition into short, single-purpose sessions with file hand-offs, and say which steps a mid-range model can own without a quality loss the evidence would detect.
4. **Quality.** Two identical runs differ by seven to eight findings. Propose how a product should handle that: two runs and a union, a cheaper second pass, or something else, and what it costs.
5. **Anything we did not think of.** Different decompositions of the stages, different evidence packaging for the judge (the pilot found that what the judge is handed matters more than which model judges), or ways to make research findings land as deterministic checks rather than prose.

Answer with claims tied to file paths, and separate what you verified from what you infer.
