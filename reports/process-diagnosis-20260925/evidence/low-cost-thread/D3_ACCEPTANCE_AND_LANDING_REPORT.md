# Task D3 report: bounded seal acceptance, and the landing checks that report only what is new

Status: work complete on the branch, pushed, not merged. The review session verifies and lands.

**Renumbered to DL-066 and DL-067, 2026-09-18** (section 19). Every mention of DL-059 and DL-060 below
is the number this branch used before the Azure DevOps corrections landing took DL-059 through DL-065;
read them as DL-066 and DL-067.

**Ruling applied, 2026-09-18.** The coordinator ruled that `origin/fix/landing-baseline-20260917` owns
decision B's tooling. This branch therefore carries **canon only**: `scripts/pm-landing-gates.py`,
`tests/test_pm_landing_gates.py`, its `.gitignore` line and `reports/landing-gates/**` were removed,
and `AGENTS.md` and `.claude/CLAUDE.md` were reverted to `main` so the landing-procedure text is that
branch's alone. DL-060 and BPM-009 now state the rule in that implementation's terms. Sections 11 to
13 below describe the removed script and the runs taken with it; they are kept because the two script
defects and the stop-rule scoping problem they found apply to the surviving implementation. Section 18
records what the handover changed.

## 1. Branch and commit

- Repository: `/mnt/Cursor/PuppetMaster`
- Worktree (local disk, left in place for the review session): `/home/sittingmongoose/pm-worktrees/acceptance-and-landing-baseline-20260917`
- Branch: `plans/acceptance-and-landing-baseline-20260917`
- Base: `origin/main` = `129c9c6803b01b3b368a7c8a45a1b752f0a0c2f8` (it moved from `4f5eda0d18` mid-task; the new commit is Concepts-only, touching no `Plans/`, `scripts/`, `tests/`, `AGENTS.md` or `.claude/` file, so every cited passage and every free id was re-verified unchanged and the rebase was clean)
- Commits: `8bdf887403` (the decisions and the tooling), `e1d54d6cb2` (the checkout-path fix section 13 found), `a4c8c3b99b` (**HEAD**, the handover: tooling removed, DL-060 and BPM-009 restated in the winning implementation's terms). Pushed to `origin` and to the `ssh://192.168.50.200` mirror; both at `a4c8c3b99b`
- 71 files in the first commit: 4 owner/prose documents, `AGENTS.md`, `.claude/CLAUDE.md`, `.gitignore`, the new script and its tests, 48 regenerated shards for exactly the three sharded documents edited, the 6 `Plans/.plan_index` outputs, and the 6 initial-baseline artifacts. 3,493 insertions, 985 deletions. 5 files in the second
- Not merged into `main`; worktree not removed.

A second, temporary worktree at `origin/main`, `/home/sittingmongoose/pm-worktrees/landing-baseline-main-20260918`, was used only to take the baseline run against a clean tree. It has been removed; nothing it held is missing from the commit.

## 2. What was decided, and where each half lives

| Decision | Recorded as | Canon owner |
|---|---|---|
| A. Acceptance of a plan seal is bounded | `DL-059`, both sections of `Plans/Decision_Log.md` | `PWIZ-028` (new) in `Plans/Planning_Wizard.md`, amending `PWIZ-006` and `PWIZ-011`; prose in `Plans/bootstrap/Bootstrap_Planning_Workflow.md` |
| B. Landing checks report only what is new | `DL-060`, both sections of `Plans/Decision_Log.md` | `BPM-009` amended in `Plans/Bootstrap_Planning_Migration.md`; `AGENTS.md` and `.claude/CLAUDE.md` landing procedure |

DL-054 was the highest entry on `origin/main` when D2 landed; DL-058 is the highest now, so **DL-059 and DL-060** were the free numbers. Checked against `origin/main` and every unmerged remote branch at branch creation and again at rebase: no branch had gone past DL-058, and `PWIZ-028` was free everywhere (all branches at `PWIZ-027`).

## 3. PlanUnit delta

Exactly three units added, none removed, diffed from `Plans/.plan_index/plan_units.jsonl` against `HEAD`:

```
old 6674  new 6677
added ids: ['DL-059', 'DL-060', 'PWIZ-028']
removed ids: []
```

## 4. Decision Log DL-059, full text

### Prose entry, under `## Entries`

````markdown
### DL-059: A plan seal is accepted after one review and one bounded repair round

Decided on 2026-09-17 by Jared.

The question was when a sealed plan is finished. The audit loop, as canon described it, ran a review, repaired what the review found, ran another review, and repeated until nothing was left to find or a typed blocker stopped it. That has no end an operator can see from the inside, so the question was whether to put a bound on it, and what to do with whatever the bound leaves behind.

It came up because reviews were measured not converging. On one arm of the Jev pilot's two-arm trial, a second fresh reviewer raised new should-fix items after the first reviewer's findings had already been repaired. The repairs were real and the new items were also real; neither reviewer was wrong. The first reviewed seal on the new harness found four defects, of which one had been introduced by the work under review and three had been in the document before it started. A loop that ends when a reviewer stops finding things therefore ends when the reviewers run out, not when the plan is right. Two other things follow from the same measurement: a fresh reviewer spends most of its effort on material the review was not about, and the work a repair round does is the part that is actually attributable to the change under review.

The options were:

1. Accept a seal once the deterministic checks pass, one scoped review has run, one bounded repair round has addressed that review's blocking findings with a further seal, and a re-review limited to the rows the repair affected finds no blocking finding; record whatever remains as open questions on the plan.
2. Keep repairing and re-reviewing until a review returns no findings at all.
3. Accept a seal as soon as the deterministic checks pass, and treat every review as advisory.

The answer is option 1. A seal is accepted when four things have happened, in order, and not before.

The deterministic checks pass. These are the checks that give the same answer every time they run on the same bytes, so a failure among them is never a matter of judgment and there is nothing to negotiate about it.

One scoped review runs. Scoped means it reads the rows the work under review actually touched, with the surrounding canon it needs in order to judge them, rather than the whole document. One review, not a panel and not a series.

One bounded repair round addresses that review's blocking findings, and the repaired plan is sealed again. Bounded means one round: the repair works from the findings that review produced, and a finding that arrives later belongs to a later review rather than to this round. The further seal is what proves the repaired text still passes the deterministic checks.

A re-review limited to the affected rows finds no blocking finding. Affected rows means the rows the repair changed and the rows it was supposed to change. This step exists to catch a repair that did not repair, or that broke something next to what it fixed. It is not a fresh reading of the plan and it is not an opportunity to open a new subject.

What the bound leaves behind is recorded rather than discarded. Every finding still standing at that point is written onto the plan as an open question, carrying its severity and the citations the reviewer gave it. An open question does not block acceptance. It stays visible, anyone may pick it up, and if a later review reads the same material and calls it blocking, it blocks from that point and the plan goes round again. Nothing is closed by being ignored.

Two things this does not permit. A seal is not accepted on a review whose blocking findings were never repaired and re-reviewed, so the bound cannot be used to skip the round. And a finding that remains is not left off the plan, so the bound cannot be used to make a problem disappear by declining to write it down.

What this buys is a seal that ends. An operator can tell from the outside whether a plan is accepted, and the cost of accepting one stops depending on how many reviewers are available. What it costs is that a plan can be accepted while known non-blocking findings are still open against it, so the open-question list has to be real, has to be read, and has to be able to escalate.

This records planning canon only. It enables no runtime behaviour, admits no command or event, and seals no governance.

SourceRef: `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/D3_ACCEPTANCE_AND_LANDING_BASELINE_BRIEF.md`, SHA-256 `efd043f2a5a21f68841c8cd0813cef407cd587a5f0fb9958d19cc4bd135cf274` as read on 2026-09-17; `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/reports/F_R7A_SCOPED_REVIEW_REPORT.md`; `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/reports/N2_REVIEW_CALIBRATION_REPORT.md`; Jared, direction of 2026-09-17. Agent-relayed, not verifiable from inside this repository.

ContractRef: ContractName:Plans/Planning_Wizard.md, ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/Plan_Document_System.md
````

### PlanUnit, under `## PlanUnits`

`````markdown
### DL-059 - Plan Seal Acceptance Is Bounded By One Review And One Repair Round

```yaml
plan_unit_id: DL-059
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-17 that acceptance of a plan seal is bounded. A seal is accepted when
  the deterministic checks pass, one scoped review has run, one bounded repair round has addressed
  that review's blocking findings with a further seal, and a re-review limited to the rows the
  repair affected finds no blocking finding. The scoped review reads the rows the work under review
  touched together with the canon needed to judge them, not the whole document. The repair round is
  one round: it works from the findings that review produced, and a finding raised later belongs to
  a later review. The affected-rows re-review checks that the repair repaired what it claimed and
  broke nothing beside it; it is not a fresh reading of the plan. Findings that remain after that
  point are recorded as open questions on the plan, each carrying its severity and its citations,
  and they do not block acceptance unless a later review raises one of them to blocking. Acceptance
  never requires a review that returns no findings, never proceeds on a review whose blocking
  findings were not repaired and re-reviewed, and never omits a remaining finding from the plan.
gui_related: false
gui_classification_reason: Seal acceptance and review bounding are planning governance timing, not GUI behavior.
split_recommended: false
depends_on: [PWIZ-006, PWIZ-011, PWIZ-028]
unblocks: []
acceptance_criteria:
  - PWIZ-028 states the four acceptance conditions in order, the open-question disposition for remaining findings, and the escalation path by which a later review may raise an open question to blocking.
  - PWIZ-006 and PWIZ-011 carry the bound, so no reader of the topic audit loop or the final audit loop can read either as repairing and re-reviewing until a review returns no findings.
  - The bootstrap seal and audit prose in Plans/bootstrap/Bootstrap_Planning_Workflow.md states the same bound and the same open-question disposition.
  - A seal whose review raised blocking findings is not accepted until those findings were repaired in one bounded round, sealed again, and re-reviewed over the affected rows.
  - Every finding remaining at acceptance appears on the plan as an open question with its severity and citations.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds, executable queues, or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - Manual review of Plans/Planning_Wizard.md PWIZ-006, PWIZ-011, and PWIZ-028 against this record.
risk_class: unbounded_review_loop_or_suppressed_finding
reasoning_tier: high
context_scope: repo_governance
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Planning_Wizard.md
  - Plans/bootstrap/Bootstrap_Planning_Workflow.md
node_compile_hint:
  mode: seal_acceptance_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md:DL-059-direction-2026-09-17
  - Plans/Planning_Wizard.md#PWIZ-006
  - Plans/Planning_Wizard.md#PWIZ-011
  - Plans/Planning_Wizard.md#PWIZ-028
preserved_exact_tokens:
  - deterministic checks
  - scoped review
  - bounded repair round
  - affected rows
  - open questions
  - blocking finding
negative_constraints:
  - Do not accept a seal on a review whose blocking findings were not repaired and re-reviewed.
  - Do not withhold a recorded open question from the plan.
  - Do not require a review that returns no findings before a seal may be accepted.
  - Do not widen the affected-rows re-review into a fresh review of the whole plan.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Planning_Wizard.md
```
`````

## 5. Decision Log DL-060, full text

### Prose entry, under `## Entries`

````markdown
### DL-060: The landing checks report only the failures that are new since a recorded baseline

Decided on 2026-09-17 by Jared.

The question was what the three repository-wide checks at landing should tell the person landing a branch. They could report everything they find, which is what they did, or they could compare what they find against a recorded picture of the last full run and report only the difference.

It came up because two landings on 2026-09-17 each spent a quarter of an hour reading the same failures. The first ran the three checks in fourteen minutes and twelve seconds; the second, three hours later, took fifteen minutes and sixteen seconds. Between them the two runs produced identical failure sets: twenty-five failing sub-checks and two hundred and twenty-eight individual failures, not one of which had appeared, changed or gone away in between, and none of which had anything to do with either branch. The Jev pilot's landings saw the same thing. A check whose output is the same before and after a change tells the person making the change nothing, and reading it costs the same whether it is useful or not.

The options were:

1. Compare each run's failure set against a recorded baseline from the last full run, report only what is new since it, and refresh the baseline nightly.
2. Keep printing everything and let the person landing sort it out.
3. Stop running the checks at landing and rely on the nightly run alone.

The answer is option 1, with the stop rule that follows from it: a landing stops only on a new failure that names a file the branch touches.

The checks themselves do not change. All three still run in full, they still read the whole repository, and their complete reports are still written out, so nothing stops being checked and nothing is hidden. What changes is what is put in front of a reader. Each run records a normalized set of the failures it found, where a failure is identified by the check it came from, the sub-check inside it, the error code, the path it names, and the finding's own stable identity where the report gives one. Counts, hashes, timestamps and prose wording are deliberately left out of that identity, so the same failure keeps the same identity from one run to the next and a run that changes nothing produces no difference at all.

The baseline is the recorded failure set of the last full run. A nightly run does the whole thing against main whether or not anything landed, and that run becomes the new baseline, so the baseline is never older than a day and never depends on someone having pushed a branch.

At landing, the run is compared against the baseline and only new failures are printed, grouped by check, each with the files it names. A landing stops when one of those new failures names a file the branch touches; every other new failure is reported and the landing proceeds. That is the rule the shard check and the landing gates already follow, applied to a smaller set. A failure already in the baseline is not new, so the twenty-five failing sub-checks that predate every branch stop being read at every landing while still being reported every night.

Two carve-outs stay exactly as they were. Stale governance hashes for the documents a branch itself edited remain the expected consequence of editing canon before the designated Plans agent's next reseal, so they never stop a landing even when the baseline diff surfaces them as new, and they are still reported with a reseal request. And nobody repairs another thread's files to make a check pass.

What this buys is a landing that reads its checks in seconds instead of a quarter of an hour, and a signal that means something when it appears. What it costs is a baseline that has to be kept current, a nightly run that has to actually run, and the risk that a failure sitting inside the baseline stays unexamined until somebody reads the nightly report on purpose.

This records planning canon only. It enables no runtime behaviour, admits no command or event, and seals no governance.

SourceRef: `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/D3_ACCEPTANCE_AND_LANDING_BASELINE_BRIEF.md`, SHA-256 `efd043f2a5a21f68841c8cd0813cef407cd587a5f0fb9958d19cc4bd135cf274` as read on 2026-09-17; the two landing runs of 2026-09-17 at `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/reports/landing-gates-20260917/` (run-gates.json SHA-256 `fec3ff2a4b515902772f1d76d2eaaeb5cfb202135151b456af31e445f5155ac4`) and `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/reports/landing-gates-20260917-n4/` (run-gates.json SHA-256 `079c484c63bfcc99e421458b6c06bd2eb811d326078a197931516cad3fcd588b`); Jared, direction of 2026-09-17.

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/Planning_Ledger_System.md
````

### PlanUnit, under `## PlanUnits`

`````markdown
### DL-060 - Landing Checks Report Only Failures New Since A Recorded Baseline

```yaml
plan_unit_id: DL-060
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-17 that the three read-only repository-wide checks at landing report
  only what is new. Each run still executes run_gates, audit_governance and migration_validate
  in full and still writes their complete reports, and additionally records a normalized
  failure set in which a failure is identified by its check id, its sub-check, its error code, the
  path it names, and the finding's stable identity where the report gives one; counts, hashes,
  timestamps and prose wording are excluded from that identity. A landing run compares its failure
  set against a recorded baseline from the last full run and prints only the failures new since it,
  grouped by check, with the files each one names. A landing stops only on a new failure that names
  a file the branch touches; every other new failure is reported and the landing proceeds, which is
  the rule the shard check already follows. Stale governance hashes for documents the branch itself
  edited never stop a landing even when the diff surfaces them as new, and are reported with a
  reseal request. The nightly full run against main refreshes the baseline whether or not anything
  landed. The measured basis is two landings of 2026-09-17 that took fourteen minutes twelve
  seconds and fifteen minutes sixteen seconds and produced identical failure sets of twenty-five
  failing sub-checks and two hundred twenty-eight failures, none of which belonged to either branch.
gui_related: false
gui_classification_reason: Landing check reporting and baseline placement are repository governance procedure, not GUI behavior.
split_recommended: false
depends_on: [BPM-009, DL-055]
unblocks: []
acceptance_criteria:
  - BPM-009 states the baseline comparison, the normalized failure identity, the new-failure-only report, the nightly baseline refresh, and the stop rule that turns on a new failure naming a touched file.
  - The landing procedure in AGENTS.md and .claude/CLAUDE.md invokes scripts/pm-landing-gates.py with a baseline and a listing of the paths the branch changed, rather than the three commands separately.
  - The stale-hash carve-out survives the change and still applies to anything the baseline diff surfaces on the branch's own documents.
  - All three checks still run in full at landing and their complete reports are still written, so the change alters what is read and not what is checked.
  - The nightly run refreshes the baseline against main independently of whether anything landed.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds, executable queues, or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-landing-gates.py --baseline reports/landing-gates/BASELINE --touched <listing of the paths the branch changed>
  - python3 -m unittest tests.test_pm_landing_gates
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - Manual AGENTS.md and .claude/CLAUDE.md landing-procedure review.
risk_class: landing_signal_lost_in_preexisting_failures
reasoning_tier: standard
context_scope: repo_governance
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Bootstrap_Planning_Migration.md
  - scripts/pm-landing-gates.py
  - AGENTS.md
  - .claude/CLAUDE.md
node_compile_hint:
  mode: landing_baseline_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md:DL-060-direction-2026-09-17
  - Plans/Decision_Log.md#DL-055
  - Plans/Bootstrap_Planning_Migration.md#BPM-009
preserved_exact_tokens:
  - run_gates
  - audit_governance
  - migration_validate
  - reports/landing-gates/BASELINE
  - scripts/pm-landing-gates.py
negative_constraints:
  - Do not narrow, skip or shorten any of the three checks in order to make a landing faster; only the reporting changes.
  - Do not stop a landing on a failure that is already in the baseline.
  - Do not treat an empty or missing baseline as an empty failure set.
  - Do not let the nightly baseline refresh lapse and then read a stale baseline as current.
  - Do not repair or commit another thread's files to make a check pass at landing.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Bootstrap_Planning_Migration.md
```
`````

## 6. Canon for decision A: PWIZ-028, full text

`````markdown
### PWIZ-028 - Bounded Acceptance Of A Sealed Plan

```yaml
plan_unit_id: PWIZ-028
unit_type: constraint
status: accepted
owner_doc: Plans/Planning_Wizard.md
canonical_text: >-
  Acceptance of a plan seal is bounded. A seal is accepted when the deterministic checks pass, one
  scoped review has run, one bounded repair round has addressed that review's blocking findings with
  a further seal, and a re-review limited to the affected rows finds no blocking finding. A scoped
  review reads the rows the work under review touched together with the canon needed to judge them,
  not the whole document. A bounded repair round is one round, working from the findings the
  preceding review produced; a finding raised later belongs to a later review. The affected-rows
  re-review covers the rows the repair changed and the rows it was supposed to change, and exists to
  catch a repair that did not repair or that broke something beside what it fixed; it is neither a
  fresh reading of the plan nor an opening for a new subject. Blocking findings are the findings
  carrying repair_required true and finding_level blocker. Findings that remain after the
  affected-rows re-review are recorded as open questions on the plan, each with its severity and its
  citations, and do not block acceptance unless a later review raises one of them to blocking, which
  sends the plan round again. Acceptance never requires a review that returns no findings, never
  proceeds on a review whose blocking findings were not repaired and re-reviewed, and never omits a
  remaining finding from the plan.
gui_related: false
gui_classification_reason: Seal acceptance and review bounding are planning governance timing, not visual presentation.
split_recommended: false
depends_on: [PWIZ-006, PWIZ-011]
unblocks: []
acceptance_criteria:
  - A seal is accepted only after the deterministic checks pass, one scoped review has run, one bounded repair round has addressed that review's blocking findings with a further seal, and an affected-rows re-review finds no blocking finding.
  - The scoped review reads the rows the work under review touched plus the canon needed to judge them, and no reviewer is required to read the whole document to produce it.
  - The repair round is one round, and a finding raised after it is carried to a later review rather than folded into it.
  - The affected-rows re-review covers the rows the repair changed and the rows it was supposed to change, and raises no new subject.
  - Every finding remaining after the affected-rows re-review appears on the plan as an open question carrying its severity and its citations.
  - A recorded open question does not block acceptance, and a later review may raise it to blocking, which returns the plan to the loop.
  - No acceptance waits for a review that returns no findings, and no acceptance proceeds on a review whose blocking findings were not repaired and re-reviewed.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - "python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/<audit_id> --require-closure-matrix"
  - Manual review of the seal record, the scoped review, the repair round and the affected-rows re-review against this unit.
risk_class: unbounded_review_loop_or_suppressed_finding
reasoning_tier: high
context_scope: repo_governance
implementation_surfaces:
  - Plans/Planning_Wizard.md
  - Plans/bootstrap/Bootstrap_Planning_Workflow.md
  - Plans/Decision_Log.md
node_compile_hint:
  mode: seal_acceptance_bound
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-059
  - Plans/Planning_Wizard.md#PWIZ-006
  - Plans/Planning_Wizard.md#PWIZ-011
preserved_exact_tokens:
  - deterministic checks
  - scoped review
  - bounded repair round
  - affected rows
  - open questions
  - blocking finding
  - repair_required
  - finding_level
negative_constraints:
  - Do not accept a seal on a review whose blocking findings were not repaired and re-reviewed.
  - Do not withhold a recorded open question from the plan.
  - Do not require a review that returns no findings before a seal may be accepted.
  - Do not widen the affected-rows re-review into a fresh review of the whole plan.
  - Do not fold a finding raised after the repair round into that round instead of carrying it to a later review.
owner_hints:
  - Plans/Planning_Wizard.md
  - Plans/bootstrap/Bootstrap_Planning_Workflow.md
  - Plans/Decision_Log.md
```
`````

## 7. Canon for decision A: the amendments to PWIZ-006 and PWIZ-011

`PWIZ-006` and `PWIZ-011` are compiled from `pldg-20260618-001-prd-planning-wizard` and carry
`source_atom_ids`, so their `canonical_text` was left byte-for-byte intact: rewriting it would break
ledger fidelity for atoms that were never about this decision. The bound was added instead as
acceptance criteria and negative constraints inside each unit, each one labelled
`Amended 2026-09-17 by PWIZ-028`, plus a `source_lineage` pointer to `PWIZ-028` and `DL-059`. That
is the "amendment to the owning unit" the brief allows, and it leaves the compile witnesses'
atom-preservation checks untouched.

```diff
diff --git a/Plans/Planning_Wizard.md b/Plans/Planning_Wizard.md
index e04d8ae615..41566764db 100644
--- a/Plans/Planning_Wizard.md
+++ b/Plans/Planning_Wizard.md
@@ -437,6 +437,8 @@ unblocks: []
 acceptance_criteria:
 - The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
 - Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
+- 'Amended 2026-09-17 by PWIZ-028: the audit and repair loop this unit describes is bounded. A topic becomes Ready after the deterministic checks pass, one scoped review has run, one bounded repair round has addressed that review''s blocking findings with a further seal, and a re-review limited to the affected rows finds no blocking finding.'
+- 'Amended 2026-09-17 by PWIZ-028: findings remaining after the affected-rows re-review are recorded as open questions on the plan with their severity and citations; they do not block Ready unless a later review raises one to blocking.'
 - No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
 validation_surfaces:
 - python3 scripts/pm-plan-index.py validate
@@ -455,6 +457,8 @@ node_compile_hint:
   create_worknodes: false
   create_nodeseeds: false
 source_lineage:
+- Plans/Planning_Wizard.md#PWIZ-028
+- Plans/Decision_Log.md#DL-059
 - pldg-20260618-001-prd-planning-wizard:atom-0058
 - pldg-20260618-001-prd-planning-wizard:atom-0059
 - pldg-20260618-001-prd-planning-wizard:atom-0060
@@ -482,6 +486,8 @@ preserved_exact_tokens:
 - high-risk checkpoint
 negative_constraints:
 - Do not require later topic agents to interpret every prior raw ledger before continuing.
+- 'Amended 2026-09-17 by PWIZ-028: do not read the audit, repair and re-audit sequence in this unit as repeating until a review returns no findings.'
+- 'Amended 2026-09-17 by PWIZ-028: do not hold a topic out of Ready over a finding that is recorded as an open question and is not blocking.'
 owner_hints:
 - Plans/Planning_Wizard.md
 - Plans/Plan_Document_System.md
@@ -889,6 +895,8 @@ unblocks: []
 acceptance_criteria:
 - The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
 - Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
+- 'Amended 2026-09-17 by PWIZ-028: the audit and repair loop this unit owns is bounded. A sealed plan is accepted when the deterministic checks pass, one scoped review has run, one bounded repair round has addressed that review''s blocking findings with a further seal, and a re-review limited to the affected rows finds no blocking finding.'
+- 'Amended 2026-09-17 by PWIZ-028: a finding still standing after the affected-rows re-review is durably closed by being recorded as an open question on the plan with its severity and citations, and a later review may raise it to blocking.'
 - No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
 validation_surfaces:
 - python3 scripts/pm-plan-index.py validate
@@ -908,6 +916,8 @@ node_compile_hint:
   create_worknodes: false
   create_nodeseeds: false
 source_lineage:
+- Plans/Planning_Wizard.md#PWIZ-028
+- Plans/Decision_Log.md#DL-059
 - pldg-20260618-001-prd-planning-wizard:atom-0130
 - pldg-20260618-001-prd-planning-wizard:atom-0131
 - pldg-20260618-001-prd-planning-wizard:atom-0132
@@ -950,6 +960,8 @@ negative_constraints:
 - Do not make superseded experimental pipeline artifacts part of the product audit architecture.
 - Do not certify a broad final audit performed by one agent when parallel specialist review is required.
 - Do not allow parallel repair subagents to race canonical Plan writes.
+- 'Amended 2026-09-17 by PWIZ-028: do not read "re-audit until all findings are durably closed" as repairing and re-reviewing until a review returns no findings.'
+- 'Amended 2026-09-17 by PWIZ-028: do not treat a finding recorded as a non-blocking open question as an unclosed finding that withholds acceptance.'
 owner_hints:
 - Plans/Planning_Wizard.md
 - Plans/Goal_Runtime_System.md
@@ -2420,3 +2432,121 @@ negative_constraints:
 - No peer questionnaire lifecycle, decision-disposition storage owner or new planning mode is introduced.
 - No implementation, WorkNodes, NodeSeeds or governance seal is created by this PlanUnit.
 ```
+
+## Bounded Seal Acceptance Addendum - 2026-09-17
+
+This addendum records when a sealed plan is accepted, under `Plans/Decision_Log.md#DL-059`. It
+amends the audit and repair loops that `PWIZ-006` and `PWIZ-011` own; it changes no validator,
+creates no WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files or
+production build tasks, and it seals nothing by itself.
+
+A seal is accepted when four things have happened, in order, and not before. The deterministic
+checks pass. One scoped review runs, reading the rows the work under review touched together with
+the canon needed to judge them, rather than the whole document. One bounded repair round addresses
+that review's blocking findings -- the findings carrying `repair_required: true` and
+`finding_level: blocker` -- and the repaired plan is sealed again. A re-review limited to the
+affected rows, meaning the rows the repair changed and the rows it was supposed to change, finds no
+blocking finding.
+
+The repair round is one round. It works from the findings the review that preceded it produced; a
+finding raised later belongs to a later review rather than to this one. The affected-rows re-review
+exists to catch a repair that did not repair, or that broke something beside what it fixed. It is
+not a fresh reading of the plan and it is not an opportunity to open a new subject.
+
+Reviews do not converge, which is why the bound exists. On one arm of the Jev pilot's two-arm trial
+a second fresh reviewer raised new should-fix items after the first reviewer's findings had already
+been repaired; the repairs were real and so were the new items. The first reviewed seal on the new
+harness found four defects, one introduced by the work under review and three already present before
+it. A loop that ends when a reviewer stops finding things ends when the reviewers run out, not when
+the plan is right.
+
+Findings still standing at acceptance are recorded as open questions on the plan, each carrying its
+severity and the citations the reviewer gave it. An open question does not block acceptance. It
+stays visible, anyone may pick it up, and a later review that reads the same material and calls it
+blocking makes it blocking from that point, which sends the plan round again. Nothing is closed by
+being ignored, and no remaining finding is left off the plan.
+
+`PASS_WITH_WARNINGS` remains terminal on the same footing it already had: the findings that make a
+cycle `PASS_WITH_WARNINGS` rather than `PASS` are exactly the ones that become recorded open
+questions. What this addendum changes is that acceptance no longer waits for a cycle that returns
+`PASS`.
+
+### PWIZ-028 - Bounded Acceptance Of A Sealed Plan
+
+```yaml
+plan_unit_id: PWIZ-028
+unit_type: constraint
+status: accepted
+owner_doc: Plans/Planning_Wizard.md
+canonical_text: >-
+  Acceptance of a plan seal is bounded. A seal is accepted when the deterministic checks pass, one
+  scoped review has run, one bounded repair round has addressed that review's blocking findings with
+  a further seal, and a re-review limited to the affected rows finds no blocking finding. A scoped
+  review reads the rows the work under review touched together with the canon needed to judge them,
+  not the whole document. A bounded repair round is one round, working from the findings the
+  preceding review produced; a finding raised later belongs to a later review. The affected-rows
+  re-review covers the rows the repair changed and the rows it was supposed to change, and exists to
+  catch a repair that did not repair or that broke something beside what it fixed; it is neither a
+  fresh reading of the plan nor an opening for a new subject. Blocking findings are the findings
+  carrying repair_required true and finding_level blocker. Findings that remain after the
+  affected-rows re-review are recorded as open questions on the plan, each with its severity and its
+  citations, and do not block acceptance unless a later review raises one of them to blocking, which
+  sends the plan round again. Acceptance never requires a review that returns no findings, never
+  proceeds on a review whose blocking findings were not repaired and re-reviewed, and never omits a
+  remaining finding from the plan.
+gui_related: false
+gui_classification_reason: Seal acceptance and review bounding are planning governance timing, not visual presentation.
+split_recommended: false
+depends_on: [PWIZ-006, PWIZ-011]
+unblocks: []
+acceptance_criteria:
+  - A seal is accepted only after the deterministic checks pass, one scoped review has run, one bounded repair round has addressed that review's blocking findings with a further seal, and an affected-rows re-review finds no blocking finding.
+  - The scoped review reads the rows the work under review touched plus the canon needed to judge them, and no reviewer is required to read the whole document to produce it.
+  - The repair round is one round, and a finding raised after it is carried to a later review rather than folded into it.
+  - The affected-rows re-review covers the rows the repair changed and the rows it was supposed to change, and raises no new subject.
+  - Every finding remaining after the affected-rows re-review appears on the plan as an open question carrying its severity and its citations.
+  - A recorded open question does not block acceptance, and a later review may raise it to blocking, which returns the plan to the loop.
+  - No acceptance waits for a review that returns no findings, and no acceptance proceeds on a review whose blocking findings were not repaired and re-reviewed.
+  - No WorkNodes, NodeSeeds, executable queues, final node manifests, implementation files, or production build tasks are created by this PlanUnit.
+validation_surfaces:
+  - python3 scripts/pm-plan-index.py validate
+  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
+  - "python3 scripts/pm-audit-closure.py validate --audit-dir Plans/.audits/<audit_id> --require-closure-matrix"
+  - Manual review of the seal record, the scoped review, the repair round and the affected-rows re-review against this unit.
+risk_class: unbounded_review_loop_or_suppressed_finding
+reasoning_tier: high
+context_scope: repo_governance
+implementation_surfaces:
+  - Plans/Planning_Wizard.md
+  - Plans/bootstrap/Bootstrap_Planning_Workflow.md
+  - Plans/Decision_Log.md
+node_compile_hint:
+  mode: seal_acceptance_bound
+  create_worknodes: false
+  create_nodeseeds: false
+source_lineage:
+  - Plans/Decision_Log.md#DL-059
+  - Plans/Planning_Wizard.md#PWIZ-006
+  - Plans/Planning_Wizard.md#PWIZ-011
+preserved_exact_tokens:
+  - deterministic checks
+  - scoped review
+  - bounded repair round
+  - affected rows
+  - open questions
+  - blocking finding
+  - repair_required
+  - finding_level
+negative_constraints:
+  - Do not accept a seal on a review whose blocking findings were not repaired and re-reviewed.
+  - Do not withhold a recorded open question from the plan.
+  - Do not require a review that returns no findings before a seal may be accepted.
+  - Do not widen the affected-rows re-review into a fresh review of the whole plan.
+  - Do not fold a finding raised after the repair round into that round instead of carrying it to a later review.
+owner_hints:
+  - Plans/Planning_Wizard.md
+  - Plans/bootstrap/Bootstrap_Planning_Workflow.md
+  - Plans/Decision_Log.md
+```
+
+ContractRef: ContractName:Plans/Planning_Wizard.md, ContractName:Plans/Plan_Document_System.md
```

## 8. Canon for decision B: the BPM-009 amendment

```diff
diff --git a/Plans/Bootstrap_Planning_Migration.md b/Plans/Bootstrap_Planning_Migration.md
index 02adb68dad..8ebd97bf23 100644
--- a/Plans/Bootstrap_Planning_Migration.md
+++ b/Plans/Bootstrap_Planning_Migration.md
@@ -462,6 +462,23 @@ nightly run covers the repository whether or not anything landed, so repository
 depends on a branch having been pushed. `AGENTS.md` and `.claude/CLAUDE.md` carry this step in their
 landing procedure.
 
+Amended 2026-09-17 under `Plans/Decision_Log.md#DL-060`: the three landing checks report only what
+is new. Two landings on 2026-09-17 took fourteen minutes twelve seconds and fifteen minutes sixteen
+seconds and produced identical failure sets -- twenty-five failing sub-checks and two hundred
+twenty-eight individual failures, none of which belonged to either branch -- so reading the whole
+output at every landing tells a lander nothing. All three checks still run in full and their
+complete reports are still written; what changes is what is read. `scripts/pm-landing-gates.py` runs
+the three in the checkout it is invoked in, writes their complete reports and a normalized failure
+set under `reports/landing-gates/<UTC timestamp>/`, and identifies each failure by its check id, its
+sub-check, its error code, the path it names, and the finding's stable identity where the report
+gives one. Counts, hashes, timestamps and prose wording are excluded from that identity, so an
+unchanged failure keeps its identity from run to run. With `--baseline` the run prints only the
+failures new since the recorded baseline, grouped by check, with the files each one names; with
+`--touched` it exits non-zero when a new failure names a file the branch changed. The nightly full
+run passes `--record-baseline`, which points `reports/landing-gates/BASELINE` at that run and makes
+it the baseline every subsequent landing compares against. The stale-hash carve-out is unchanged and
+still applies to anything the diff surfaces on the branch's own documents.
+
 ### BPM-009 - Repository-Wide Gates Run At Landing And Nightly
 
 ```yaml
@@ -474,8 +491,8 @@ canonical_text: >-
   branch lands on main and on a nightly schedule, not inside a per-plan governance seal; the
   migration_snapshot creates a new tracked run directory, so it runs only on the nightly schedule, in
   a worktree, by the designated Plans agent, never in the shared checkout at landing. At landing the
-  three checks run in the shared checkout after the fast-forward and the shard check and cost about
-  ten minutes there. A landing is refused when a repository-wide failure
+  three checks run in the shared checkout after the `git merge --ff-only` fast-forward and the shard
+  check and cost about ten minutes there. A landing is refused when a repository-wide failure
   names a file the landing branch touches, and that failure is fixed on the branch; when every
   failure names files the branch does not touch, the landing proceeds and the failures are reported,
   which is the rule the shard check already follows. Stale-hash failures for documents the branch
@@ -485,7 +502,19 @@ canonical_text: >-
   nightly run covers the repository whether or
   not anything landed, so repository qualification never depends on a branch having been pushed.
   AGENTS.md and .claude/CLAUDE.md carry this step in their landing procedure with the measured cost
-  stated.
+  stated. The three landing checks report only what is new. Each run executes all three in full and
+  writes their complete reports, and additionally records a normalized failure set in which a
+  failure is identified by its check id, its sub-check, its error code, the path it names, and the
+  finding's stable identity where the report gives one; counts, hashes, timestamps and prose wording
+  are excluded from that identity, so an unchanged failure keeps its identity from run to run. A
+  landing run compares its failure set against the baseline recorded by the last full run and prints
+  only the failures new since it, grouped by check, with the files each one names. A landing stops
+  only on a new failure that names a file the branch touches. The nightly full run records its own
+  failure set as the new baseline, and that refresh replaces the tracked baseline run rather than
+  adding another one beside it. scripts/pm-landing-gates.py is the one command that runs the three
+  checks, writes the reports and performs the comparison; the landing invocation passes
+  reports/landing-gates/BASELINE and a listing of the paths the branch changed, and the nightly
+  invocation passes --record-baseline.
 gui_related: false
 gui_classification_reason: Gate placement in the landing and nightly repository procedures is governance timing, not GUI behavior.
 split_recommended: false
@@ -498,8 +527,16 @@ acceptance_criteria:
   - A stale-hash failure for a document the landing branch itself edited (Spec Lock, owner or artifact evidence hashes, the readiness report, the plan-migration inventory) is the expected consequence of editing canon before the next designated reseal; it never stops the landing and is reported with a reseal request.
   - All four operations, including the migration snapshot taken in a worktree by the designated Plans agent, run on a nightly schedule against main, independently of whether anything landed.
   - No per-plan seal is required to run them, and no seal record claims their outcome.
+  - A landing run reports only the failures new since the recorded baseline, grouped by check and with the files each one names, and all three checks still run in full with their complete reports written.
+  - A failure's identity is its check id, its sub-check, its error code, the path it names, and the finding's stable identity where the report gives one; a run that changes nothing reports nothing new.
+  - The landing invocation is scripts/pm-landing-gates.py with reports/landing-gates/BASELINE and a listing of the paths the branch changed, and it stops the landing only on a new failure naming one of those paths.
+  - The nightly invocation passes --record-baseline, and the refreshed baseline replaces the tracked baseline run rather than accumulating beside it.
+  - A missing, empty or unreadable baseline is an error rather than an empty failure set, so a landing never reads "no new failures" from a baseline that was never recorded.
   - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
 validation_surfaces:
+  - "python3 scripts/pm-landing-gates.py --baseline reports/landing-gates/BASELINE --touched <listing of the paths the branch changed>"
+  - python3 scripts/pm-landing-gates.py --record-baseline
+  - python3 -m unittest tests.test_pm_landing_gates
   - python3 scripts/pm-plans-verify.py run-gates
   - python3 scripts/pm-plans-verify.py audit-governance
   - "python3 scripts/pm-plan-migration.py validate --run-dir <the run named in Plans/.plan_migration/current_run.json>"
@@ -512,12 +549,15 @@ implementation_surfaces:
   - AGENTS.md
   - .claude/CLAUDE.md
   - Plans/Bootstrap_Planning_Migration.md
+  - scripts/pm-landing-gates.py
+  - tests/test_pm_landing_gates.py
 node_compile_hint:
   mode: landing_gate_placement
   create_worknodes: false
   create_nodeseeds: false
 source_lineage:
   - Plans/Decision_Log.md#DL-055
+  - Plans/Decision_Log.md#DL-060
   - Plans/Bootstrap_Planning_Migration.md#BPM-005
 preserved_exact_tokens:
   - run_gates
@@ -527,11 +567,18 @@ preserved_exact_tokens:
   - "git merge --ff-only"
   - AGENTS.md
   - .claude/CLAUDE.md
+  - scripts/pm-landing-gates.py
+  - reports/landing-gates/BASELINE
+  - "--record-baseline"
 negative_constraints:
   - Do not run the four repository-wide operations inside a per-plan seal in order to satisfy this rule.
   - Do not land a branch whose own files fail a repository-wide gate.
   - Do not repair or commit another thread's files to make a repository-wide gate pass at landing.
   - Do not treat the nightly run as a substitute for the landing run, or the landing run as a substitute for the nightly one.
+  - Do not narrow, skip or shorten any of the three checks to make a landing faster; only the reporting changes.
+  - Do not stop a landing on a failure that is already in the baseline.
+  - Do not treat a missing or unreadable baseline as an empty failure set.
+  - Do not accumulate superseded baseline runs in the repository when the nightly refresh records a new one.
 owner_hints:
   - Plans/Bootstrap_Planning_Migration.md
   - Plans/bootstrap/Bootstrap_Planning_Workflow.md
```

## 9. The bootstrap seal and audit prose

```diff
diff --git a/Plans/bootstrap/Bootstrap_Planning_Workflow.md b/Plans/bootstrap/Bootstrap_Planning_Workflow.md
index 794e482a04..4747578709 100644
--- a/Plans/bootstrap/Bootstrap_Planning_Workflow.md
+++ b/Plans/bootstrap/Bootstrap_Planning_Workflow.md
@@ -172,6 +172,8 @@ Bounded repairs write `repair_closure_matrix.jsonl` only for actionable source r
 
 After repair edits, run an internal post-repair semantic audit over the original `audit_scope_manifest.jsonl` plus every impact row. Newly discovered actionable findings are added to the same scope/impact set and closed in the same Goal. Repair may finish only with `repair_required_count=0` or a true user decision; passing validators alone are insufficient. Only after internal semantic closure may repair append/update the global registry, regenerate PlanUnit index or governance artifacts, seal governance, or write `REPAIR_CERTIFICATION.md`.
 
+The repair round is one round, under `Plans/Planning_Wizard.md` PWIZ-028. It works from the findings the review that preceded it produced; a finding raised after it belongs to a later review rather than to this round. The post-repair audit above is limited to the affected rows -- the rows the repair changed and the rows it was supposed to change -- and exists to catch a repair that did not repair or that broke something beside what it fixed. It is not a fresh reading of the plan and it does not open a new subject. `repair_required_count=0` is therefore reached over that set: a finding that is not blocking is closed by being recorded as an open question on the plan, with its severity and its citations, rather than by another repair cycle.
+
 Repairs run:
 
 ```text
@@ -188,6 +190,8 @@ A per-plan seal runs the plan-layer profile only: `register_owners`, `index_gene
 
 The seal record says so: `seal_profile: plan_layer`, `omitted_operations` naming exactly those four, `full_repository_qualified: false`, and `repository_gates_status: not_run_in_this_seal`. A plan-layer seal is a production seal because it states what it did not run; it never claims repository qualification. `Plans/Bootstrap_Planning_Migration.md` BPM-005 and BPM-009 own this contract and the landing/nightly placement.
 
+A seal is accepted when four things have happened, in order, and not before: the deterministic checks pass, one scoped review has run, one bounded repair round has addressed that review's blocking findings with a further seal, and a re-review limited to the affected rows finds no blocking finding. Findings still standing at that point are recorded as open questions on the plan, each with its severity and its citations; they do not block acceptance unless a later review raises one of them to blocking, which sends the plan round again. Acceptance never waits for a review that returns no findings, never proceeds on a review whose blocking findings were not repaired and re-reviewed, and never omits a remaining finding from the plan. `Plans/Planning_Wizard.md` PWIZ-028 owns this bound, amending PWIZ-006 and PWIZ-011, under `Plans/Decision_Log.md#DL-059`.
+
 ## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard
 
 Ledger-to-Plans compile phases that exceed atom, owner-doc, or document-size thresholds must use bounded read-only subagents with assignment/result evidence. The parent/controller remains the only canonical writer. The compile phase writes live Plans docs and allowed `Plans/.plan_index/**` outputs only; it does not run the finished-product `Approve And Build` runtime, launch Plan Compile, create WorkNodes, create NodeSeeds, create executable queues, launch GoalRuns, edit implementation files, or update Spec Lock, shards, evidence, plan_graph, or auto_decisions.
```

## 10. AGENTS.md and .claude/CLAUDE.md

Both files carry a byte-identical "How to land on main" block, and both got the same replacement: the one three-command bullet became two bullets, the first for the landing invocation and the second for the nightly refresh and the stale-hash carve-out. Verified identical after the edit by diffing the two blocks.

```diff
diff --git a/.claude/CLAUDE.md b/.claude/CLAUDE.md
index ae6a391f07..cd2f5f0f33 100755
--- a/.claude/CLAUDE.md
+++ b/.claude/CLAUDE.md
@@ -35,7 +35,8 @@
 - `git fetch origin`, then `git rebase origin/main` on your branch. For Plans edits, re-read every passage you cite against the current text before applying; a passage that changed since your snapshot is re-adjudicated, not merged blind. Never hand-merge `_shards` or `.plan_index`; regenerate them.
 - In the shared checkout, if `git status` shows uncommitted changes in any file your branch touches, stop and hand the branch over. Otherwise `git merge --ff-only <branch>`, run `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json`, and push `main`.
 - The shard check reads the working tree, not `HEAD`, so another thread's uncommitted work in the shared checkout can fail your landing. Run the check in your own worktree before you land, so a failure at landing can only be someone else's. If every failure names files your branch does not touch, confirm `HEAD` is consistent (`git cat-file -e HEAD:<named shard>` succeeds and `git show HEAD:<its manifest>` references it), push `main` anyway, and report the failing files to Jared. Never fix or commit another thread's files to make the check pass. If any failure names a file your branch touches, stop and fix it on your branch first.
-- After the fast-forward and the shard check, run the three read-only repository-wide checks in the shared checkout: `python3 scripts/pm-plans-verify.py run-gates`, `python3 scripts/pm-plans-verify.py audit-governance` and `python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/<the run named in Plans/.plan_migration/current_run.json>`. A per-plan seal no longer runs them, so landing is where they run; they cost about ten minutes here. If any failure names a file your branch touches, stop and fix it on your branch. If every failure names files your branch does not touch, push `main` anyway and report them to Jared, exactly as the shard-check rule above reads. The migration snapshot (`pm-plan-migration.py snapshot-current`) creates a new tracked run directory, so it is never run in the shared checkout at landing; it runs on the nightly schedule in a worktree by the designated Plans agent, together with the same three checks against `main`, whether or not anything landed. Stale-hash failures for documents your branch edited (Spec Lock `stale_hash`, stale owner or artifact evidence hashes, a stale readiness report, the plan-migration document count) are the expected consequence of editing canon before the designated Plans agent's next reseal; they do not stop the landing and are reported with a reseal request. Any other failure that names a file your branch touches does stop it.
+- After the fast-forward and the shard check, run the three read-only repository-wide checks in the shared checkout through one command, which reports only the failures that are new since the recorded baseline: `git diff --name-only origin/main...<branch> > /tmp/touched.txt`, then `python3 scripts/pm-landing-gates.py --baseline reports/landing-gates/BASELINE --touched /tmp/touched.txt`. It runs `pm-plans-verify.py run-gates`, `pm-plans-verify.py audit-governance` and `pm-plan-migration.py validate --run-dir <the run named in Plans/.plan_migration/current_run.json>` in full, writes their complete reports and a normalized failure set under `reports/landing-gates/<UTC timestamp>/`, prints the new failures grouped by check with the files they name, and exits 3 when a new failure names a file your branch touches. It costs about ten minutes here. A per-plan seal no longer runs these checks, so landing is where they run. Stop only on a new failure naming a file your branch touches, and fix it on your branch. Every other new failure is reported to Jared and the landing proceeds, exactly as the shard-check rule above reads. Do not stop on a failure that is already in the baseline, and do not read a missing or unreadable baseline as "nothing new" -- the command exits 2 and says so.
+- The baseline is refreshed by the nightly run, `python3 scripts/pm-landing-gates.py --record-baseline`, which the designated Plans agent runs in a worktree against `main` whether or not anything landed, together with the migration snapshot (`pm-plan-migration.py snapshot-current`). The snapshot creates a new tracked run directory, so it is never run in the shared checkout at landing. A refreshed baseline replaces the tracked baseline run rather than accumulating beside it. Stale-hash failures for documents your branch edited (Spec Lock `stale_hash`, stale owner or artifact evidence hashes, a stale readiness report, the plan-migration document count) are the expected consequence of editing canon before the designated Plans agent's next reseal; they do not stop the landing even when the baseline diff surfaces them as new, and are reported with a reseal request. Any other new failure that names a file your branch touches does stop it.
 - When the branch is on `main`, remove the worktree: `git -C /mnt/Cursor/PuppetMaster worktree remove <path>` and `git branch -d <branch>`.
 
 ### Never
diff --git a/.gitignore b/.gitignore
index 5ea3d5f4bf..49a79355cd 100755
--- a/.gitignore
+++ b/.gitignore
@@ -61,6 +61,7 @@ tests/
 !/tests/test_pm_origin_retained_routes.py
 !/tests/test_pm_runtime_vocabulary_migration.py
 !/tests/test_pm_ledger_compile_witness.py
+!/tests/test_pm_landing_gates.py
 !/tests/test_pm_credential_attachment_lifetime.py
 !/tests/test_pm_runtime_identity_scope.py
 !/tests/test_pm_full_thread_contracts.py
diff --git a/AGENTS.md b/AGENTS.md
index ca0e83161a..13e79369a9 100755
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -92,7 +92,8 @@ Use the repo skill `$pm-bootstrap-planning-ledger` when available. If skills are
 - `git fetch origin`, then `git rebase origin/main` on your branch. For Plans edits, re-read every passage you cite against the current text before applying; a passage that changed since your snapshot is re-adjudicated, not merged blind. Never hand-merge `_shards` or `.plan_index`; regenerate them.
 - In the shared checkout, if `git status` shows uncommitted changes in any file your branch touches, stop and hand the branch over. Otherwise `git merge --ff-only <branch>`, run `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json`, and push `main`.
 - The shard check reads the working tree, not `HEAD`, so another thread's uncommitted work in the shared checkout can fail your landing. Run the check in your own worktree before you land, so a failure at landing can only be someone else's. If every failure names files your branch does not touch, confirm `HEAD` is consistent (`git cat-file -e HEAD:<named shard>` succeeds and `git show HEAD:<its manifest>` references it), push `main` anyway, and report the failing files to Jared. Never fix or commit another thread's files to make the check pass. If any failure names a file your branch touches, stop and fix it on your branch first.
-- After the fast-forward and the shard check, run the three read-only repository-wide checks in the shared checkout: `python3 scripts/pm-plans-verify.py run-gates`, `python3 scripts/pm-plans-verify.py audit-governance` and `python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/<the run named in Plans/.plan_migration/current_run.json>`. A per-plan seal no longer runs them, so landing is where they run; they cost about ten minutes here. If any failure names a file your branch touches, stop and fix it on your branch. If every failure names files your branch does not touch, push `main` anyway and report them to Jared, exactly as the shard-check rule above reads. The migration snapshot (`pm-plan-migration.py snapshot-current`) creates a new tracked run directory, so it is never run in the shared checkout at landing; it runs on the nightly schedule in a worktree by the designated Plans agent, together with the same three checks against `main`, whether or not anything landed. Stale-hash failures for documents your branch edited (Spec Lock `stale_hash`, stale owner or artifact evidence hashes, a stale readiness report, the plan-migration document count) are the expected consequence of editing canon before the designated Plans agent's next reseal; they do not stop the landing and are reported with a reseal request. Any other failure that names a file your branch touches does stop it.
+- After the fast-forward and the shard check, run the three read-only repository-wide checks in the shared checkout through one command, which reports only the failures that are new since the recorded baseline: `git diff --name-only origin/main...<branch> > /tmp/touched.txt`, then `python3 scripts/pm-landing-gates.py --baseline reports/landing-gates/BASELINE --touched /tmp/touched.txt`. It runs `pm-plans-verify.py run-gates`, `pm-plans-verify.py audit-governance` and `pm-plan-migration.py validate --run-dir <the run named in Plans/.plan_migration/current_run.json>` in full, writes their complete reports and a normalized failure set under `reports/landing-gates/<UTC timestamp>/`, prints the new failures grouped by check with the files they name, and exits 3 when a new failure names a file your branch touches. It costs about ten minutes here. A per-plan seal no longer runs these checks, so landing is where they run. Stop only on a new failure naming a file your branch touches, and fix it on your branch. Every other new failure is reported to Jared and the landing proceeds, exactly as the shard-check rule above reads. Do not stop on a failure that is already in the baseline, and do not read a missing or unreadable baseline as "nothing new" -- the command exits 2 and says so.
+- The baseline is refreshed by the nightly run, `python3 scripts/pm-landing-gates.py --record-baseline`, which the designated Plans agent runs in a worktree against `main` whether or not anything landed, together with the migration snapshot (`pm-plan-migration.py snapshot-current`). The snapshot creates a new tracked run directory, so it is never run in the shared checkout at landing. A refreshed baseline replaces the tracked baseline run rather than accumulating beside it. Stale-hash failures for documents your branch edited (Spec Lock `stale_hash`, stale owner or artifact evidence hashes, a stale readiness report, the plan-migration document count) are the expected consequence of editing canon before the designated Plans agent's next reseal; they do not stop the landing even when the baseline diff surfaces them as new, and are reported with a reseal request. Any other new failure that names a file your branch touches does stop it.
 - When the branch is on `main`, remove the worktree: `git -C /mnt/Cursor/PuppetMaster worktree remove <path>` and `git branch -d <branch>`.
 
 ### Never
```

## 11. `scripts/pm-landing-gates.py`

### Usage

```
python3 scripts/pm-landing-gates.py [--baseline DIR|POINTER] [--touched FILE]
                                    [--record-baseline] [--out-dir DIR]
                                    [--subcheck-timeout-seconds N]
                                    [--check-timeout-seconds N]
```

- Runs `pm-plans-verify.py run-gates`, `pm-plans-verify.py audit-governance` and
  `pm-plan-migration.py validate --run-dir <the run named in Plans/.plan_migration/current_run.json>`,
  in the checkout it is invoked in. The checkout is `Path(__file__).resolve().parents[1]`, the same
  way the other `scripts/` tools resolve it, so it never reaches into another worktree.
- Writes each check's **complete** report plus a normalized failure set and a plain `summary.json`
  under `reports/landing-gates/<UTC timestamp>/`.
- `--baseline` takes either a run directory or the `reports/landing-gates/BASELINE` pointer file, and
  prints only the failures new since it, grouped by check, with the files each one names.
- `--touched` takes a file listing the branch's changed paths, one per line (`#` comments and blanks
  ignored). Exit 3 when a new failure names one of them, 0 otherwise.
- `--record-baseline` writes `reports/landing-gates/BASELINE` pointing at this run, recording the run
  it supersedes. This is the nightly invocation.
- Always prints one summary line: `landing-gates: new=N resolved=M unchanged=K elapsed=Ts`.

Exit codes: `0` completed and nothing new names a touched file; `2` the run could not be performed
(missing or unreadable baseline, missing touched listing, unreadable current migration run); `3` a
new failure names a touched file.

### The normalized failure set

A failure's identity is exactly what the brief specifies: **check id, sub-check, error code, path,
and the finding's stable identity where the report gives one**. The identity is taken from the first
present of an ordered key list (`finding_key`, `closure_id`, `check_id`, `span_id`, `plan_unit_id`,
`unit_id`, ... ), and the fingerprint is a SHA-256 over that five-tuple, truncated to 16 hex
characters. Counts, hashes, timestamps, expected/actual values and prose messages are deliberately
outside the identity.

Three shapes of report had to be handled, all of them found in real output rather than guessed:

1. The aggregate wrapper: `{"check": <sub-check>, "status": "fail", "failures": [<leaf>, ...]}`,
   flattened to leaves with the sub-check carried down.
2. A failing sub-check with an **empty** `failures` list. It is kept as a leaf in its own right, so a
   sub-check that fails without reporting rows is never silently dropped.
3. A sub-check that reports a **bare string** instead of a record. Three of them do
   (`"preexisting_registry_changed"`, `"preexisting_registry_rows_changed"`, `"central extraction
   typed UI actions lack rows: ['ui.project.restore_archived']"`). The string is the only identity
   such a failure has, so it becomes the code. An earlier draft collapsed all of a sub-check's bare
   strings into one row; the archived reports caught it.

Paths are collected from the whole record, not only its `path` field, because sub-checks name the
file they are unhappy about under `ref`, `parent`, `owner_doc`, `shard`, `rows[].path` and others. A
value under one of those keys is trusted even with spaces in it; a bare string elsewhere has to look
like a path and must carry no whitespace and no URL scheme, so a sentence that happens to contain a
slash is not mistaken for a file. That rule came out of a failing unit test, not out of review.

### Storage

The complete reports and the failure set are stored gzipped (`<name>.json.gz`); nothing is truncated.
This is not cosmetic: the plan-migration validate report alone is **29.5 MB** of near-identical rows,
and the whole run is 34 MB raw against about 0.7 MB gzipped. A baseline has to live in the repository
for every lander to diff against, and this repository has just come through a bloat reduction.
`summary.json` stays plain so a reader can see what a run did without unpacking anything. The gzip
header is written with `mtime=0`, so a run that found the same failures produces byte-identical
output and does not show up as a repository change.

`BPM-009` and both landing procedures state that the nightly refresh **replaces** the tracked
baseline run rather than accumulating beside it, so the repository holds one baseline, not one per
night.

### Tests

`tests/test_pm_landing_gates.py`, 48 tests, `unittest` (not pytest), all synthetic: no gate is
executed. The only subprocess any test starts is a two-line `python3 -c` stand-in, used to prove
report capture, the stdout fallback and the no-report fallback. The `.gitignore` exception line
`!/tests/test_pm_landing_gates.py` was added after `!/tests/test_pm_ledger_compile_witness.py`, and
`git check-ignore -v` confirms the negation matches, so the file is trackable.

Coverage: report flattening (all three shapes above), fingerprint stability under volatile fields and
sensitivity to each identity component, path extraction and the prose/URL rejection, the new /
resolved / unchanged diff in five configurations, the touched listing and the four ways a failure can
name a touched path, baseline pointer round-trip and its three error paths, the current-run pointer
and its two error paths, the subprocess plumbing, gzip round-trip and byte-stability, and the printed
output.

### Validated against the two real landings the decision is based on

The two landings of 2026-09-17 archived their complete `run-gates.json` and `audit-governance.json`
under `reports/landing-gates-20260917/` and `reports/landing-gates-20260917-n4/` in the experiment
directory. They are genuinely different files:

```
fec3ff2a4b515902772f1d76d2eaaeb5cfb202135151b456af31e445f5155ac4  landing-gates-20260917/run-gates.json
079c484c63bfcc99e421458b6c06bd2eb811d326078a197931516cad3fcd588b  landing-gates-20260917-n4/run-gates.json
c7cb75120d9c87176eb3d7eb1ee46e098ac5478d536a8167aada078e57f5f171  landing-gates-20260917/audit-governance.json
c482c8e9eb4e3254431d0730e2baed411ce62eee79726017f9a89a6daf84be84  landing-gates-20260917-n4/audit-governance.json
```

Normalizing both with the committed script and diffing them:

```
02:24 landing rows: 228   05:30 landing rows: 228
diff of the two landings three hours apart -> new=0 resolved=0 unchanged=228
```

That is the decision working on the data it was made from. Two landings that between them cost 29
minutes 28 seconds and printed 25 failing sub-checks each would, under this rule, have printed
nothing. The sub-check counts also reconcile exactly with the brief's figure: `run-gates` 13 failing
sub-checks and `audit-governance` 12, which is the 25 the brief cites.

## 12. The first real run, recorded as the initial baseline

The baseline was taken **on a clean `origin/main` tree**, in a throwaway worktree at
`4f5eda0d18a9deff2349b03ae573f0ffd706ed61`, not on this branch. That matters: a baseline taken on the
branch would have swallowed the branch's own new failures, and the nightly refresh the rule describes
runs against `main`. (The first attempt at a baseline was taken in this worktree and had to be thrown
away — two Plans edits landed at 21:22 and 21:23 while `audit-governance` was running at 21:23, so it
was measuring a tree that changed underneath it. Caught by comparing file mtimes against the report
mtimes, not by anything the run said.)

```
landing-gates: new=9069 resolved=0 unchanged=0 elapsed=599s
Baseline recorded: reports/landing-gates/BASELINE -> reports/landing-gates/20260918T002758Z
```

| check | status | elapsed | rows in report | failing sub-checks |
|---|---|---|---|---|
| `run-gates` | fail | 329.7 s | 16 | 16 |
| `audit-governance` | fail | 189.2 s | 15 | 15 |
| `plan-migration-validate` | fail | 77.3 s | 28,128 | n/a (flat report) |
| **total** | | **599.4 s** | | **31** |

After the truncation fix the same stored reports re-derive to **9,084** normalized failures, the extra
15 being the `subcheck_failure_total` rows for the 8 truncated `run-gates` sub-checks and the 7
truncated `audit-governance` ones. That re-derivation used `--from-reports`, took **3 seconds** instead
of 599, and is what the committed `failures.json.gz` holds:

```
run-gates 167   audit-governance 268   plan-migration-validate 8,649   total 9,084
```

The 8,649 plan-migration rows come from 28,128 report rows over 11 paths, with 5,971 distinct span and
unit identities; they are one stale snapshot (`pds-20260906-017`, taken 2026-09-06) that every canon
edit since has left further behind, which is exactly the class the baseline exists to stop reprinting.

Committed size: 737 KB gzipped for the whole run, against 34 MB raw.

## 13. The landing check, run on this branch against that baseline
The baseline was then used the way the rule says to use it: on this branch's own commit, with the
paths the branch changed.

```
git diff --name-only origin/main..HEAD > touched.txt      # 71 paths
python3 scripts/pm-landing-gates.py --baseline reports/landing-gates/BASELINE --touched touched.txt
```

```
landing-gates: new=33 resolved=6 unchanged=9078 elapsed=583s
exit 3
```

**9,078 of 9,084 failures were suppressed; 33 were printed.** That is the decision working: without
the baseline this run prints 9,084 failures over 31 failing sub-checks, and a lander reads none of
them usefully. (The counts shown are after the checkout-path fix below. The run as first executed
reported new=35 resolved=8 unchanged=9076; nothing was re-run, both runs were re-derived from their
stored reports with `--from-reports`.)

What the 33 are, all of them:

| n | what | real? |
|---|---|---|
| 28 | `current_snapshot_live_span_metadata_mismatch` and `current_snapshot_span_sha256_mismatch` on `Planning_Wizard-S0011..S0036` | **Real and this branch's.** The addendum added to `Planning_Wizard.md` shifts its spans against the `pds-20260906-017` snapshot of 2026-09-06. This is the plan-migration inventory staleness class, the documented carve-out; it names `Plans/.plan_migration/...`, which the branch does not touch, so it correctly did not stop the landing. |
| 2 | `subcheck_failure_total` for `lint_path_refs` / `path_refs`, `total=113` -> `total=111` | **Real.** Two failures went away. Which two cannot be told from a truncated report. |
| 3 | `implementation_surface_missing_or_untyped` on `TDR-001`, `TDR-007`, `F3-520` | **False.** Sampling artifacts, and they are what made the command exit 3. |

And the 6 resolved: `BPM-009` and `DL-055` `implementation_surface_missing_or_untyped` in both checks
(4), plus the two superseded total rows.

### Three defects this exercise found, one fixed

**Fixed: a failure's identity contained the checkout it ran in.** `validate_touch_closure` reports
`expected inventory extraction failed: [Errno 2] No such file or directory:
'<absolute worktree path>/Concepts/pm7-tools/systems_integration_source.py'`. The baseline is recorded
in one checkout and compared in another, so that one failure appeared as one resolved and one new on
every cross-checkout comparison -- two false pairs in this very run. `scrub_checkout_path()` now cuts
an absolute path back to its repository-relative tail before it reaches the code, the message or the
path. Commit `e1d54d6cb2`, 5 unit tests. `fix/landing-baseline-20260917` had already solved this; I had
not, and my own landing check is what surfaced it.

**Not fixed, and not fixable here: sampled-row churn.** The 3 false "new" rows above are rows that were
outside the baseline's 50-row sample of `lint_path_refs` and inside this run's, because two rows
(`BPM-009`, `DL-055`) dropped out and let others in. They are not new failures. The count rows catch
whether a truncated sub-check's total moved, but not which rows moved, and nothing in the report
carries the data to do better. Fixing it properly means changing `pm-plans-verify.py` to stop
truncating, which is outside this task. Both implementations share this limitation.

**Not fixed, needs a decision: the plan index makes every Plans branch look guilty.** The 3 false rows
stopped the landing only because they name `Plans/.plan_index/plan_units.jsonl`, which *every* Plans
branch regenerates. Every index-derived failure therefore "names a file the branch touches", whoever
the failing unit belongs to -- here `TDR-001`, `TDR-007` and `F3-520`, none of them this branch's. The
stop rule as written is noisiest for exactly the branches it exists to protect. The options are to
exclude regenerated artifacts (`Plans/.plan_index/**`, `Plans/_shards/**`) from touch-matching, or to
match on the failing `plan_unit_id` against the units the branch added or changed. The second is
right and is more work. **This is a live defect in the rule text as landed, not only in my script**,
and it applies equally to `fix/landing-baseline-20260917`.
## 14. Checks and tests

All run in this worktree, on the committed tree.

| Command | Result |
|---|---|
| `pm-shard-plans.py --generate --config Plans/sharding_config.json` | pass, 99 docs, 2691 shards |
| `pm-plan-index.py generate` | pass, 6677 PlanUnits, 26010 acceptance units, coverage pass |
| `pm-shard-plans.py --check --config Plans/sharding_config.json` | pass, 0 failures, 2691 shards over 99 docs |
| `pm-plan-index.py validate` | pass, 0 failures |
| `pm-plans-verify.py validate-wiring-matrix` | pass |
| `python3 -m unittest tests.test_pm_plan_index tests.test_pm_plans_verify_subprocess tests.test_pm_landing_gates` | OK, 82 tests (re-run after the rebase onto the new `main`) |
| `python3 -m unittest tests.test_pm_landing_gates` | OK, 60 tests |

`node_readiness_status` is `blocked_runtime_certification_incomplete`, unchanged from `HEAD` and not
caused by this branch.

### Derived-file scope

`git status --porcelain` after regeneration named only the three sharded documents I edited and the
plan index:

- `Plans/_shards/decision_log/` — 10 files
- `Plans/_shards/planning_wizard/` — 27 files, one of them created (`027-bounded-seal-acceptance-addendum-2026-09-17.md`)
- `Plans/_shards/bootstrap_planning_migration/` — 11 files
- the 6 `Plans/.plan_index` outputs

No shard for a document this branch did not edit changed. `Plans/bootstrap/**` is not in
`Plans/sharding_config.json`, so the `Bootstrap_Planning_Workflow.md` edit produces no derived files.
Shards for untouched sections of the three documents changed only in their `Source lines:` and
`Source SHA256:` headers, the deterministic consequence of line-offset shifts.

### `preserved_exact_tokens` hygiene

The witness landed in `4f5eda0d18` requires every entry in a unit's registry to occur in that unit's
own text. Checked against all six units this branch touches. Two failures were found and fixed:

- `DL-060` listed `migration_validate` while its `canonical_text` said "the plan-migration validate".
  Mine; fixed by using the literal.
- `BPM-009` listed `git merge --ff-only` and never used it. **Pre-existing**, landed by D2; fixed here
  since this branch is amending that unit anyway, by naming the fast-forward literally.

Three failures in `BPM-005` remain and were **not** touched: `Plans/_shards/**`, `Plans/.evidence/**`
and `node-readiness report` are in its registry but not in its text. They predate this branch, the unit
is not one this branch amends, and repairing another thread's landed unit is not this task's business.
Reported for whoever reseals.

## 15. Collision: another branch already implements decision B's tooling

**This needs adjudication by the review session before either branch lands.**

While this task was running, `origin/fix/landing-baseline-20260917` appeared (4 commits, latest
`215e718f9a`, authored 2026-09-18 00:12 UTC). It implements the same half of decision B, independently:

| | this branch | `fix/landing-baseline-20260917` |
|---|---|---|
| Script | `scripts/pm-landing-gates.py` | `scripts/pm-landing-check.py` |
| Tests | `tests/test_pm_landing_gates.py`, 60 tests | `tests/test_pm_landing_check.py`, 72 tests |
| Baseline | `reports/landing-gates/BASELINE` pointing at a timestamped run directory | `reports/landing-checks/baseline.json`, a single file |
| Branch paths | `--touched <listing>` | `--base origin/main`, computing `git diff --name-only origin/main..HEAD` itself |
| Exit codes | 0 nothing new names a touched file, 2 cannot run, 3 a new failure names one | 0 nothing to report, 1 all reported is governance staleness, 2 anything else, 3 cannot run |
| Rule text | replaces the landing bullet in `AGENTS.md` and `.claude/CLAUDE.md` | replaces the same bullet, differently |
| `Plans/**` | DL-059, DL-060, BPM-009, PWIZ-028, bootstrap prose | **touches no `Plans/` file at all** |

The collision is confined to the script, its tests, its reports directory and the one landing bullet
in the two rule files. **The canon half of this branch does not collide**: the other branch records
no Decision Log entry and amends no PlanUnit, so DL-059, DL-060, the BPM-009 amendment, PWIZ-028 and
the bootstrap prose stand whichever script is chosen. If `fix/landing-baseline-20260917` is preferred,
what has to change here is the command name and the baseline path in BPM-009's `canonical_text`,
`acceptance_criteria`, `validation_surfaces`, `implementation_surfaces` and `preserved_exact_tokens`,
in DL-060's equivalents, and the landing bullet in the two rule files. Nothing else.

Two things their work found that are worth keeping whichever way this goes:

1. **The aggregate reports are truncated.** `run-gates` slices each failing sub-check's rows to 50 and
   `audit-governance` to 100, while stating the true total separately. Their README says so; I had not
   noticed, and my first implementation built its failure set from the rows alone. Verified on the real
   `--report` output of this task's baseline run: **8 of 16 failing `run-gates` sub-checks are
   truncated**, `validate_evidence` among them at 1552 true against 50 listed. A new failure in the
   unsampled tail would have been invisible. Closed here by `subcheck_totals()`, which adds one
   `subcheck_failure_total` record per truncated sub-check so a count change shows as one resolved and
   one new row; 4 unit tests cover it. Both implementations now match failures beyond the sample by
   count, with the same documented limitation: a truncated sub-check that swaps one tail failure for
   another at an unchanged count is not distinguishable.
2. **Their exit code 1 separates governance staleness from everything else.** Mine leaves the
   stale-hash carve-out to the procedure text and the reader. Theirs is the better ergonomics and is
   worth porting if this branch's script is the one that lands.

Neither branch is merged. I did not reconcile them; that is the review session's call, not mine.

## 16. Landing preconditions, for the review session

- `origin/main` moved to `129c9c6803b01b3b368a7c8a45a1b752f0a0c2f8` during this task. That commit is
  Concepts-only, the rebase onto it was clean, the shard check and the 82 tests were re-run after it,
  and the branch is exactly two commits ahead.
- Every passage this branch cites was re-read against the current text after the final fetch: `BPM-009`
  and its addendum, `PWIZ-006`, `PWIZ-011`, the `DL-058` tail of both Decision Log sections, and the
  landing bullet in both rule files. None had changed.
- DL-059, DL-060 and PWIZ-028 were still free across `origin/main` and every unmerged remote branch at
  the final fetch, including `origin/fix/landing-baseline-20260917`, which records no Decision Log
  entry and no PlanUnit.
- The shared checkout's uncommitted changes (`.omp/lsp.json` plus five untracked paths) overlap none of
  this branch's files.
- The shard check passes in this worktree, so a failure at landing is someone else's.
- Not merged; worktree `/home/sittingmongoose/pm-worktrees/acceptance-and-landing-baseline-20260917`
  left in place, as the brief requires.

## 17. What was not done, and what to watch

- **The collision in section 13 is unresolved and is the one thing that needs a decision.** Two
  implementations of decision B's tooling exist on two unmerged branches. Landing both would put two
  commands and two baselines in the repository and leave the rule files contradicting each other.
- **No governance reseal.** Spec Lock, `Plans/.evidence/**` and the readiness artifacts were not
  touched. Editing four canon documents makes their Spec Lock and evidence hashes stale; that is the
  expected stale-hash class and it is reported here as a reseal request for the designated Plans agent,
  as `BPM-009` prescribes.
- **A truncated sub-check is matched by count, not by membership.** If a sub-check with 1552 failures
  swaps one tail failure for another and stays at 1552, neither implementation sees it. The aggregate
  reports do not carry the rows to do better; fixing it properly means changing `pm-plans-verify.py` to
  stop truncating, which is out of scope here. Measured cost in section 13: 3 of the 33 new rows on
  this branch's own landing check were sampling artifacts.
- **The stop rule fires on the regenerated plan index, whoever the failure belongs to.** Section 13's
  third defect. Every Plans branch regenerates `Plans/.plan_index/plan_units.jsonl`, and every
  index-derived failure names it, so the stop rule flagged three units this branch has nothing to do
  with and exited 3. This is in the rule text as landed, not only in my script, and it needs a
  decision: exclude regenerated artifacts from touch-matching, or match on the failing
  `plan_unit_id` against the units the branch added or changed. I did not change it unilaterally
  because it changes what a landing refuses.
- **The baseline's `root` field records the absolute path of the worktree the run happened in**, which
  will not exist later. It is provenance, not a functional field. The revision the baseline describes is
  `4f5eda0d18`, pinned by the commit it lands in.
- **Nothing on this machine schedules the nightly run.** `BPM-009` and both rule files say the nightly
  refresh is the designated Plans agent's, run by hand until something schedules it. If that refresh
  lapses, the baseline goes stale and new failures accumulate inside it unnoticed. `BPM-009` carries a
  negative constraint against exactly that, which is a rule and not a mechanism.
- **`BPM-005`'s three `preserved_exact_tokens` hygiene failures** are left for whoever reseals; see
  section 14.


## 18. The handover, 2026-09-18

Commit `a4c8c3b99b`, made after the coordinator's ruling. Exactly four things:

1. **Removed** `scripts/pm-landing-gates.py`, `tests/test_pm_landing_gates.py`, the
   `!/tests/test_pm_landing_gates.py` line in `.gitignore`, and all six files under
   `reports/landing-gates/`. `git diff origin/main` for `scripts/`, `tests/`, `reports/` and
   `.gitignore` is now empty.
2. **Reverted** `AGENTS.md` and `.claude/CLAUDE.md` to `origin/main` in full, so the landing bullet is
   untouched by this branch and cannot conflict with the rewrite on
   `fix/landing-baseline-20260917`. `git diff origin/main` for both files is empty.
3. **Restated DL-060 and BPM-009** in the winning implementation's terms, read from its `AGENTS.md`
   diff and its script docstring rather than paraphrased: the two reported sets (a key absent from the
   recorded baseline *or* a check whose count rose, and a failure naming a path from
   `git diff --name-only <base>..HEAD` whether or not it is new); the stable key
   `check | subcheck | error kind | path | fingerprint` with timestamps, hash values, the checkout's
   absolute path and the measured `actual`/`expected` removed; the per-sub-check total comparison, so
   a rise in a truncated sub-check is reported and **stops** the landing because the on-branch match
   cannot see what was added; the requirement to run **before** `main` is pushed, since the branch diff
   it measures is empty afterwards; the four graded outcomes (nothing to report / nothing that stops
   the landing / something that stops it / could not run); and the baseline at
   `reports/landing-checks/baseline.json`, taken in a full checkout, committed with the commit it was
   taken at, refreshed nightly beside the migration snapshot, and **never refreshed to make a landing
   pass**. `validation_surfaces` are now `pm-landing-check.py --base origin/main` and
   `--record-baseline`; `implementation_surfaces` and `preserved_exact_tokens` name their paths.
4. **One sentence added to DL-060's prose** recording that the command, the baseline file and the
   landing-procedure text are carried by that branch: this record states the rule, that branch states
   how it is run.

Unchanged: DL-059, PWIZ-028, the PWIZ-006 and PWIZ-011 amendments, and the bootstrap seal and audit
prose. The PlanUnit delta against `origin/main` is still exactly `['DL-059', 'DL-060', 'PWIZ-028']`
added, none removed.

Re-run after the handover, all passing: shard generate (2691 shards, 99 docs), plan-index generate
(6677 units), `pm-shard-plans.py --check` (0 failures), `pm-plan-index.py validate` (0 failures), and
`tests.test_pm_plan_index` plus `tests.test_pm_plans_verify_subprocess` (22 tests, OK). The
landing-gates tests are gone with the script. `preserved_exact_tokens` hygiene re-checked across
DL-059, DL-060, PWIZ-006, PWIZ-011, PWIZ-028 and BPM-009: 0 failures.

`origin/main` was `129c9c6803` at the rebase, unchanged since the previous one and touching no
`Plans/`, `AGENTS.md` or `.claude/` file, so every cited passage was re-verified unchanged. DL-059,
DL-060 and PWIZ-028 were re-confirmed free against `origin/main` and every unmerged remote branch,
including `fix/landing-baseline-20260917`, `plans/compile-repair-20260917` and the new
`plans/azure-devops-corrections-20260918`, all of which sit at DL-058 and PWIZ-027.

### What the surviving implementation should take from sections 11 to 13

- **The checkout-path identity bug is real and they already handle it** (their fingerprint strips
  "the absolute path of the checkout it ran in"). Section 13 measures what it costs when it is not
  handled: two false new/resolved pairs on a single cross-checkout comparison, from
  `validate_touch_closure`'s `[Errno 2] No such file or directory: '<worktree>/Concepts/...'`.
- **Sampled-row churn remains open for both.** Section 13: 3 of 33 new rows on a real branch were rows
  that moved into the 50-row sample as two others left it, not new failures. Their count comparison
  catches the *rise*; neither implementation can tell *which* rows moved. Their choice to stop the
  landing on a rise in a truncated sub-check is the safer reading of the same limitation.
- **The stop rule scopes wrongly over regenerated artifacts, and this is in the rule text, not only in
  a script.** Every Plans branch regenerates `Plans/.plan_index/plan_units.jsonl`; every index-derived
  failure names it; so the on-branch match fires for units the branch has nothing to do with. Measured:
  `TDR-001`, `TDR-007` and `F3-520` stopped a landing that had nothing to do with them. The fix is to
  exclude regenerated artifacts from the branch-path match, or better, to match on the failing
  `plan_unit_id` against the units the branch added or changed. Worth raising against
  `fix/landing-baseline-20260917` before it lands, since it matches branch paths the same way.


## 19. Rebase onto e9fafbdb21 and the renumbering, 2026-09-18

The Azure DevOps corrections landing took **DL-059 through DL-065** while this branch was open, and
`origin/main` moved from `129c9c6803` to `e9fafbdb21` across ten commits. This branch's two entries
are therefore **DL-066** and **DL-067**, the next free pair, confirmed against `origin/main` and every
unmerged remote branch (all still at DL-058) after a fresh fetch, and confirmed absent from the
Decision Log before insertion.

Commit `b8d47eecf4`, replacing `a4c8c3b99b`. Only `Plans/Decision_Log.md` had changed on `main` among
the four documents this branch edits, so `Planning_Wizard.md`, `Bootstrap_Planning_Migration.md` and
`Bootstrap_Planning_Workflow.md` were carried over whole and only their DL references renumbered;
`Decision_Log.md` was rebuilt from `main`'s current text with the two prose entries and two PlanUnits
re-inserted at freshly re-read anchors.

What the renumbering touched:

- the two prose headings and both PlanUnit headings and `plan_unit_id` fields
- each unit's `source_lineage` self-reference (`Plans/Decision_Log.md:DL-066-direction-2026-09-17`, and DL-067's)
- `PWIZ-028`'s `source_lineage`, and the `source_lineage` added to `PWIZ-006` and `PWIZ-011`
- `BPM-009`'s `source_lineage` and its addendum heading (`Amended 2026-09-17 under Plans/Decision_Log.md#DL-067`)
- the `Bootstrap_Planning_Workflow.md` seal-acceptance paragraph's pointer
- the `Planning_Wizard.md` addendum's opening pointer
- the shard filenames, through regeneration

Re-read against the current text before inserting, because both the Azure landing and the compile
repair `d108ef5336` had edited `Decision_Log.md`: the prose anchor is now after DL-065's `ContractRef`
and before `## Owner / Consumer Map`, and the PlanUnit anchor is still immediately before
`### DL-001`. Neither of this branch's blocks references any of the seven new entries, which was
asserted in the insertion script rather than eyeballed. Note that `main`'s own DL-065 heading contains
the string "DL-060" (it binds the way *its* DL-060 binds); the renumbering was applied only inside
this branch's own blocks, so that reference was not disturbed.

Untouched, as instructed: `AGENTS.md`, `.claude/CLAUDE.md` and `ledger_registry.json` (never
re-serialized). The branch's diff against `main` is `Plans/` only.

Checks after the rebuild: shard generate 2692 shards over 99 docs, plan-index generate 6691 units,
`pm-shard-plans.py --check` 0 failures, `pm-plan-index.py validate` 0 failures, `tests.test_pm_plan_index`
plus `tests.test_pm_plans_verify_subprocess` 22 tests OK, `preserved_exact_tokens` hygiene 0 failures
across DL-066, DL-067, PWIZ-006, PWIZ-011, PWIZ-028 and BPM-009. PlanUnit delta against `origin/main`:
`['DL-066', 'DL-067', 'PWIZ-028']` added, none removed.

60 files: the 4 canon documents, 50 regenerated shards for the three sharded documents (one of them
new, `Plans/_shards/planning_wizard/027-bounded-seal-acceptance-addendum-2026-09-17.md`), and the 6
plan-index outputs.

**Still open:** `fix/landing-baseline-20260917` has not landed and also amends `BPM-009`'s prose, so
this worktree stays in place and this branch expects one more rebase once that branch is on `main`.
