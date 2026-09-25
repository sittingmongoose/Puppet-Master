# Why the Event Authority work is slow and expensive

Written 2026-09-25 by the "PM Low cost/complexity process" thread for Jared, to hand to a reviewing agent that sees only this GitHub repository. Figures are as of 2026-09-25 10:30 UTC; the Event Authority session started that morning from the handover keeps landing (see `evidence/TIMELINE.md`), so the counts move, the shape does not. It is a diagnosis, not a plan. Everything it relies on is either in this repository already (paths given) or copied into this bundle under `evidence/` from machines the reviewer cannot reach; `README.md` in this directory says what was copied from where and what could not be.

## 1. What the work is, and what two weeks produced

The Event Authority program (Decision Log entry DL-039 in `Plans/Decision_Log.md`) has to settle every persisted event of Puppet Master: 444 contract cells across the registered event families (`Plans/event_family_registry.json`, 42 families at revision 2026-09-11.2), plus 252 events that were stored but never registered (the J248 campaign, Step 9 of DL-039). Every unregistered row must end registered with a full contract, excluded with cited evidence, or on a decision card for Jared. Registrations are admitted one family per landing. The step list is `Plans/.audits/event-authority-2026-08-12/NEXT_STEPS_20260910.md`, which is git-ignored; its ten steps are quoted in `reports/event-authority-20260911/step-09-procedure-20260924.md` and in the handover on branch `plans/ea-handover-20260925`.

| Measure | Value | Where to verify |
|---|---|---|
| Program start | 2026-09-10 (answers to the owner sheet, DL-039) | `Plans/Decision_Log.md` DL-039 |
| Step 9 rows settled | 15 excluded of 252; 237 remain; 0 registered (batch 1 on 2026-09-24, batch 2's answers on 2026-09-25) | `reports/landing-checks/LANDING_20260924_EA_STEP09_BATCH1.md`, `LANDING_20260925_EA_STEP09_BATCH2_ANSWERS.md` |
| Depth cells at PASS | 335 of 504 (42 families x 12 criteria) | `reports/event-authority-20260911/step-08-depth42-assessment-20260924.md` |
| Landings on main, 2026-09-24 to 25 | 20 landing records | `reports/landing-checks/LANDING_2026092[45]_*.md`; `evidence/TIMELINE.md` |
| Commits on main since 2026-09-10 | 694 | `git log --since=2026-09-10 origin/main` |
| Agents dispatched by this thread in the wave | 33 agents, 7.8 million output tokens, 4.2 billion cache-read tokens | `evidence/agent-usage-20260924.csv` |
| The Step 8/9 author agent alone | 5.0 hours wall clock, 1,724 model turns, 966 tool calls, 986,000 output tokens, 6 landings | same file, first row |
| One blind review | 120,000 to 500,000 output tokens, 1 to 3 hours, at maximum effort | same file, rows named review-* |

At this rate Step 9 alone needs months, and the depth work behind it (Replan v8, restore corruption, Browser v2) is sized in agent-days per family (`reports/event-authority-20260911/step-08-remaining-source-work-plan-20260924.md`).

## 2. Where a single change goes

Anatomy of one canon edit, the Browser SP-286 branch (landed 2026-09-25 as a3d6bb616b): two paragraphs added to `Plans/Section15_MVP_Promoted_Features_Spec.md` so two producers adopt an existing contract by name. Its review is in `evidence/reviews/review-ea-browser-sp286/`.

1. Orientation: the author reads AGENTS.md, DL-039, DL-045 to DL-083, the plan, the handover, the landing records. About 20 documents, roughly one million cached tokens before any work.
2. The edit itself: under an hour.
3. Regeneration: 99 documents into 2,722 shards (`Plans/_shards/`), then the plan index of 6,728 units (`Plans/.plan_index/`), once after the edit and once after each fix. Both are committed with the edit, so the branch touches hundreds of derived files.
4. Blind review: a fresh Opus agent exports the repository, regenerates everything again, runs the validators, reads the owner documents, and writes ten findings: zero blocking, five should-fix, mostly wording precision (see `evidence/reviews/review-ea-browser-sp286/REVIEW.md`).
5. Repair round: one commit per finding, regenerate after each, push, cycle-2 re-check by the same reviewer.
6. Landing: the lock, rebase, re-read of cited passages, regeneration with the currentness edition present, tests, fast-forward, shard check, the landing check (three repository-wide checks, 10 to 15 minutes, 1,470 to 1,771 pre-existing failures to classify; see any `LANDING_20260925_EA_*.md`), a landing record, a reseal request, branch deletion.
7. Reseal, later, by a designated agent: `Plans/Spec_Lock.json`, the evidence bundles under `Plans/.evidence/` (one of them hashes 3,022 files), the currentness edition, readiness reports, the migration snapshot, the landing baseline. Hours. See `reports/landing-checks/LANDING_20260924_GOVERNANCE_RESEAL.md`.

Two paragraphs of canon cost about 30 stale evidence rows, a readiness drift row, three migration rows, one failing test until the reseal, one review of several hundred thousand tokens, and two lock windows.

## 3. Root causes

**Governance built for zero trust, applied to everything.** Each rule exists because of a real incident, and none was withdrawn when its risk passed. The inventory:

| Rule | Where it lives | Why it exists | What it costs per landing |
|---|---|---|---|
| Never work on main in the shared checkout; sparse worktree per branch | AGENTS.md "Where to work" | a background regeneration broke the shared checkout on 2026-09-10 | worktree setup and teardown, re-orientation |
| Landing lock (mkdir on the NAS, holder file, 90-minute stale rule) | AGENTS.md "How to land on main" | two threads fast-forwarded main against each other on 2026-09-23 | serialization of every landing through one lock |
| Landing check with rules 1 to 3, exceptions, exports | `scripts/pm-landing-check.py`, `reports/landing-checks/README.md`, AGENTS.md | thousands of pre-existing failures had to be separated from a branch's own | 10 to 15 minutes per landing; four landings on 2026-09-24 were about this tool itself (`LANDING_20260924_LANDING_CHECK_*.md`) |
| Blind form-driven review, cycle cap two, repair round | DL-066; AGENTS.md "How to compile a ledger" | fabricated harness results and an unreviewed compile in September | one cold Opus review per branch |
| Compile witness | AGENTS.md; `scripts/pm-ledger-compile-witness.py` | compiled atoms that did not match the owner text | minutes, deterministic (this one is cheap) |
| Card freeze with hash | `reports/landing-checks/LANDING_20260924_EA_DEPTH42.md` open questions | a card file was edited after Jared answered it (DL-083, 2026-09-24) | none per landing; a rule for card rounds |
| One receipted validator change; barred author | DL-077 | the forged certification of 2026-08-12 | admission records, receipts, a re-pin whenever the assessment moves |
| Reseal by a designated agent only | AGENTS.md "How to commit and push" | governance artifacts were restamped by ordinary work | staleness accumulates between reseals and is reported at every landing |
| Evidence cited by path plus SHA-256, evidence off the repository | AGENTS.md "Where things go" | the repository reached 152,000 tracked files and a 25 GB object store before the 2026-09-10 rewrite | evidence directories with checksums for every branch |

**Verification by reading.** Canon is prose with YAML units: 99 documents, 6,728 plan units, about 26,000 acceptance units (`Plans/.plan_index/`). Whether an edit is right can only be judged by an agent reading the surrounding text, so every review is a cold, full-context read at the most expensive setting. Nothing about an event contract is machine-checkable beyond identifiers resolving, fixtures validating and hashes matching. The review outputs in `evidence/reviews/` show what the reviewers spend their time on: `evidence/REVIEWS_SUMMARY.md` counts their findings by severity.

**Derived artifacts multiply every edit.** Shards, the plan index, evidence bundles that hash the shards, Spec Locks, currentness editions, readiness reports and migration snapshots all depend on the source text. Every edit makes dozens to hundreds of rows stale, the landing check has to classify them, and a reseal has to refresh them. Most of the landing tool's complexity exists to tell expected staleness from real failure; its rule text in AGENTS.md is longer than the rest of the landing procedure.

**One family per landing, one review per branch, one lock.** DL-039 requires one family per landing; DL-066 requires a blind review with a cycle cap of two for every canon change; the lock serializes everything through one shared checkout and one 15-minute check. Minimum latency per branch is about two hours even when nothing is wrong, and 245 rows at one landing each is 245 lock windows.

**Fresh agents everywhere.** The blind-review rule requires a reviewer that has never seen the author's work, so every review starts cold. Handovers, takeovers and coordinators add more cold starts. The same 20 documents were read by more than thirty agents in one wave.

**A coordinator at maximum effort relaying messages.** This thread ran as an orchestrator: dispatch author, dispatch reviewer, relay findings, dispatch re-check, give landing go, relay to Jared. Every relay is a full-context turn of the most expensive model. Codex threads cannot receive messages, so some relays went through Jared by hand.

**Paperwork per answer.** Jared answers a card in seconds. Recording that answer takes a Decision Log entry in two sections, response rows in `reports/event-authority-20260911/decision-responses.jsonl`, an application record, an evidence directory with checksums, regeneration, a review and a landing. Compare `reports/event-authority-20260911/step-08-depth42-product-cards-20260924.md` (five cards) with what recording their answers took (`reports/event-authority-20260911/step-08-depth42-card-answers-20260924.md` and the DL-079 to DL-083 entries).

## 4. Why the old process is still running

This thread's mission was the low-cost planning process: how to get a plan from draft to seal in an hour at a fraction of the cost. What it built is real but was never applied to the Event Authority campaign: a harness with remedy-owner derivation and document-level contract scanning, a seal-path cost analysis, a blind-review method comparison, and a reviewer packet. Those were experiments on the planning pipeline's seal path; their reports are copied to `evidence/low-cost-thread/`.

When the cleanup wave and the Event Authority takeover came, the thread ran the existing rules because they are canon. DL-039 fixes the one-family-per-landing rule, DL-066 fixes the review rule, and the landing procedure is in AGENTS.md; agents are told never to bend them, and every earlier shortcut (unreviewed Codex drafts, a forged certificate) ended in a stricter rule. Changing the rules is Jared's decision, and nobody asked him for it. The honest summary: the thread optimized inside the process instead of replacing it, and it measured its own cost only when asked.

## 5. What a replacement must do

Targets, so the reviewing agent has something to hit: a registered family in under 30 minutes and under 100,000 output tokens end to end; a report-only or recording change landed with no model review at all; the whole of Step 9 in days, not months.

Design changes that get there, and who decides each:

1. **Tier the risk.** Report-only branches, card recordings and derived-file regeneration land on deterministic checks alone. Owner-prose edits get one targeted review of the changed passages by a mid-tier model with a checklist, not a repository export at maximum effort. Only registry admissions and validator-adjacent changes get the full blind review. Decision: Jared, since it amends DL-066.
2. **Batch admissions by owner document.** The 40 orchestrator-subagent-integration rows are one landing, not forty. Decision: Jared, since DL-039 says one family per landing.
3. **Stop reporting known staleness.** Between reseals, evidence, Spec Lock, currentness and readiness staleness on edited documents is expected and should not be computed, printed or classified at landing; the nightly reseal refreshes it. The landing check then shrinks to tests plus the shard and index checks, minutes instead of fifteen. Decision: the landing-check owner, with Jared's request for the rule text.
4. **Regenerate derived files at reseal, not per branch.** Shards and the index are deterministic functions of the source; committing them on every branch is what makes every edit touch hundreds of files and every rebase conflict. Decision: Jared, since it changes what canon holds.
5. **One warm session per program, not fresh agents.** The program runs in one long-lived session with one worktree and its context, dispatching cheap subagents only for grading and drafting. Reviewers stay fresh only for the tier that needs them. Decision: Jared, on how sessions are organized.
6. **Make contracts machine-checkable.** The long-term fix for production Puppet Master: typed event contracts (schema, owner, producer, consumers, retention) validated by code and fixtures, so admission is a test run, not a reading. This is the product's own claim about how planning should work, and the Event Authority campaign is the case that shows prose review cannot scale. Decision: Jared, as a product direction.

## 6. What exists to reuse, all in this repository or this bundle

- Landing tool: `scripts/pm-landing-check.py` (exports repair landed 2026-09-25, main 8bc8986484), `reports/landing-checks/README.md`, its two briefs and open-items list in `evidence/briefs/`.
- Blind-review form: `evidence/briefs/INSTRUCTIONS_REVIEWER.md`; the nine reviews of this wave in `evidence/reviews/`, with `evidence/REVIEWS_SUMMARY.md`.
- Card form: DL-036 in `Plans/Decision_Log.md`; examples `reports/event-authority-20260911/step-08-depth42-product-cards-20260924.md`.
- The low-cost thread's own results: `evidence/low-cost-thread/` (the seal-path reports F2, N7, B11, B12, GL and the review calibration).
- The Event Authority handover: branch `plans/ea-handover-20260925` (c8acca2aa5), `reports/event-authority-20260911/step8-9-progress-20260924.md`.
- Package material for the Replan work: the private repository `sittingmongoose/PuppetMaster-Packages`.
- The wave's timeline with commit hashes: `evidence/TIMELINE.md`. Per-agent cost: `evidence/agent-usage-20260924.csv`.
