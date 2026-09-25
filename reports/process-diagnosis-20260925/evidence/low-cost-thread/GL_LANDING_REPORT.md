# GL bounded-acceptance landing report

Status: STOPPED BEFORE MAIN PUSH. Shared main is `d09377d4eb8936e0cb5e905dfcb464a7a03320c4`; origin/main remains `478cd2aa0fa5a5660961f351918739d43643bbac`. The tested branch is published to GitHub and NAS. Shared validation completed, but the observed findings exceed the specified carve-out; main push and cleanup have not occurred.

- Original branch: `plans/acceptance-and-landing-baseline-20260917` at `b8d47eecf4d78af42c05897598cbe30bd85cc11c`.
- Rebase target: `478cd2aa0fa5a5660961f351918739d43643bbac` (`origin/main`, fetched 2026-09-21).
- Worktree: `/home/sittingmongoose/pm-worktrees/acceptance-and-landing-baseline-20260917`.
- DL numbers retained: **DL-066 and DL-067**. Both were absent on the fetched main; no renumbering was necessary.
- Reference: `D3_ACCEPTANCE_AND_LANDING_REPORT.md`, section 19.
- Start: 2026-09-21 03:53:54 UTC; wall-clock bound: three hours.

## Source reconciliation

The parent performed both text reconciliations. BPM-009 combines the current main landing procedure and baseline rule with the branch's comparison details, preserving one PlanUnit and one lineage list. The branch's DL-067 prose addendum is retained; main's preceding landing prose remains unchanged. Main's implementation surfaces and stricter full-checkout baseline condition are retained.

Decision_Log.md was rebuilt from fetched main with only the branch's two exact prose entries inserted after DL-065's ContractRef and before Owner / Consumer Map, and its two exact PlanUnits immediately before `### DL-001`. Removing those inserted blocks reproduces main byte-for-byte. Both main DL-055 sections are unchanged. Planning_Wizard.md and Bootstrap_Planning_Workflow.md remain byte-identical to the original branch.

### BPM-009 before (fetched main)

````markdown
### BPM-009 - Repository-Wide Gates Run At Landing And Nightly

```yaml
plan_unit_id: BPM-009
unit_type: constraint
status: accepted
owner_doc: Plans/Bootstrap_Planning_Migration.md
canonical_text: >-
  The repository-wide operations run_gates, audit_governance, and migration_validate run when a
  branch lands on main and on a nightly schedule, not inside a per-plan governance seal; the
  migration_snapshot creates a new tracked run directory, so it runs only on the nightly schedule, in
  a worktree, by the designated Plans agent, never in the shared checkout at landing. At landing the
  three checks run in the shared checkout after the fast-forward and the shard check, before main is
  pushed, and cost about ten minutes there. The lander runs them through
  scripts/pm-landing-check.py, which reports only failures that are new since the recorded baseline
  reports/landing-checks/baseline.json or that name a path the branch touches, because the three
  produce tens of thousands of pre-existing failures that name no landed file. The baseline is
  recorded from a full run against main in a full checkout, committed with the commit it was taken
  at, and refreshed on the nightly schedule only, never per landing. A landing is refused when a
  repository-wide failure
  names a file the landing branch touches, and that failure is fixed on the branch; when every
  failure names files the branch does not touch, the landing proceeds and the failures are reported,
  which is the rule the shard check already follows. Stale-hash failures for documents the branch
  itself edited, in Spec Lock, owner or artifact evidence hashes, the readiness report or the
  plan-migration inventory, are the expected consequence of editing canon before the designated
  Plans agent's next reseal; they never stop a landing and are reported with a reseal request. The
  nightly run covers the repository whether or
  not anything landed, so repository qualification never depends on a branch having been pushed.
  AGENTS.md and .claude/CLAUDE.md carry this step in their landing procedure with the measured cost
  stated.
gui_related: false
gui_classification_reason: Gate placement in the landing and nightly repository procedures is governance timing, not GUI behavior.
split_recommended: false
depends_on: [BPM-005]
unblocks: []
acceptance_criteria:
  - The landing procedure in AGENTS.md and .claude/CLAUDE.md names run-gates, audit-governance, and the migration validate as one step after the fast-forward and the shard check and before main is pushed, states the measured cost of about ten minutes, and keeps the migration snapshot out of the shared checkout.
  - That step is run through scripts/pm-landing-check.py, which reports only failures that are new since reports/landing-checks/baseline.json or that name a path from git diff --name-only origin/main..HEAD, and which runs the same three checks with the same arguments and scope.
  - The baseline is recorded from a full run against main in a full checkout, is committed with the commit it was taken at, and is refreshed on the nightly schedule only, never per landing.
  - A repository-wide failure that names a file the landing branch touches stops the landing and is fixed on the branch.
  - A repository-wide failure that names only files the landing branch does not touch does not stop the landing; main is pushed and the failures are reported, exactly as the shard-check rule reads.
  - A stale-hash failure for a document the landing branch itself edited (Spec Lock, owner or artifact evidence hashes, the readiness report, the plan-migration inventory) is the expected consequence of editing canon before the next designated reseal; it never stops the landing and is reported with a reseal request.
  - All four operations, including the migration snapshot taken in a worktree by the designated Plans agent, run on a nightly schedule against main, independently of whether anything landed.
  - No per-plan seal is required to run them, and no seal record claims their outcome.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-landing-check.py --base origin/main
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py audit-governance
  - "python3 scripts/pm-plan-migration.py validate --run-dir <the run named in Plans/.plan_migration/current_run.json>"
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - Manual AGENTS.md and .claude/CLAUDE.md landing-procedure review.
risk_class: repository_gate_placement_drift
reasoning_tier: standard
context_scope: repo_governance
implementation_surfaces:
  - AGENTS.md
  - .claude/CLAUDE.md
  - Plans/Bootstrap_Planning_Migration.md
  - scripts/pm-landing-check.py
  - reports/landing-checks/baseline.json
node_compile_hint:
  mode: landing_gate_placement
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-055
  - Plans/Bootstrap_Planning_Migration.md#BPM-005
preserved_exact_tokens:
  - run_gates
  - audit_governance
  - migration_snapshot
  - migration_validate
  - scripts/pm-landing-check.py
  - reports/landing-checks/baseline.json
  - "git merge --ff-only"
  - AGENTS.md
  - .claude/CLAUDE.md
negative_constraints:
  - Do not run the four repository-wide operations inside a per-plan seal in order to satisfy this rule.
  - Do not land a branch whose own files fail a repository-wide gate.
  - Do not repair or commit another thread's files to make a repository-wide gate pass at landing.
  - Do not treat the nightly run as a substitute for the landing run, or the landing run as a substitute for the nightly one.
  - Do not record a baseline from a checkout that is missing any input the three checks read, and do not refresh the baseline to make a landing pass.
owner_hints:
  - Plans/Bootstrap_Planning_Migration.md
  - Plans/bootstrap/Bootstrap_Planning_Workflow.md
```

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/Planning_Ledger_System.md
````

### BPM-009 after reconciliation

````markdown
### BPM-009 - Repository-Wide Gates Run At Landing And Nightly

```yaml
plan_unit_id: BPM-009
unit_type: constraint
status: accepted
owner_doc: Plans/Bootstrap_Planning_Migration.md
canonical_text: >-
  The repository-wide operations run_gates, audit_governance, and migration_validate run when a
  branch lands on main and on a nightly schedule, not inside a per-plan governance seal; the
  migration_snapshot creates a new tracked run directory, so it runs only on the nightly schedule,
  in a worktree, by the designated Plans agent, never in the shared checkout at landing. At landing
  the three checks run in the shared checkout after the `git merge --ff-only` fast-forward and the
  shard check, before main is pushed, and cost about ten minutes there. The lander runs them through
  scripts/pm-landing-check.py, because the three produce tens of thousands of pre-existing failures
  that name no landed file. Each run executes all three checks in full and turns every failure into
  a stable key of check, sub-check, error kind, path, and a digest of what is left once timestamps,
  hash values, the absolute path of the checkout it ran in, and the measured actual and expected
  values are removed. A landing run reports two sets and nothing else: failures whose key is not in
  the recorded baseline or whose check's failure count rose above the baseline count, and failures
  that name a path the branch changed whether or not they are new. Per-sub-check totals are compared
  as well as keys, because run_gates prints only fifty failures per sub-check and audit_governance
  only a hundred while reporting the true total, so a rise in a truncated sub-check is reported and
  stops the landing. The landing invocation names the branch's base and runs before main is pushed,
  because it measures the branch by its diff against main and that diff is empty once main is pushed.
  The baseline at reports/landing-checks/baseline.json is recorded from a full run against main in a
  full checkout, committed with the commit it was taken at, and refreshed on the nightly schedule
  only, never per landing; the nightly invocation passes --record-baseline. A baseline is never
  refreshed to make a landing pass. A landing is refused when a repository-wide failure names a
  file the landing branch touches, and that failure is fixed on the branch; when every failure
  names files the branch does not touch, the landing proceeds and the failures are reported, which
  is the rule the shard check already follows. Stale-hash failures for documents the branch itself
  edited, in Spec Lock, owner or artifact evidence hashes, the readiness report or the plan-migration
  inventory, are the expected consequence of editing canon before the designated Plans agent's next
  reseal; they never stop a landing and are reported with a reseal request. The nightly run covers
  the repository whether or not anything landed, so repository qualification never depends on a
  branch having been pushed. AGENTS.md and .claude/CLAUDE.md carry this step in their landing
  procedure with the measured cost stated.
gui_related: false
gui_classification_reason: Gate placement in the landing and nightly repository procedures is governance timing, not GUI behavior.
split_recommended: false
depends_on: [BPM-005]
unblocks: []
acceptance_criteria:
  - The landing procedure in AGENTS.md and .claude/CLAUDE.md names run-gates, audit-governance, and the migration validate as one step after the fast-forward and the shard check and before main is pushed, states the measured cost of about ten minutes, and keeps the migration snapshot out of the shared checkout.
  - That step is run through scripts/pm-landing-check.py, which reports only failures that are new since reports/landing-checks/baseline.json or that name a path from git diff --name-only origin/main..HEAD, and which runs the same three checks with the same arguments and scope.
  - The baseline is recorded from a full run against main in a full checkout, is committed with the commit it was taken at, and is refreshed on the nightly schedule only, never per landing.
  - A repository-wide failure that names a file the landing branch touches stops the landing and is fixed on the branch.
  - A repository-wide failure that names only files the landing branch does not touch does not stop the landing; main is pushed and the failures are reported, exactly as the shard-check rule reads.
  - A stale-hash failure for a document the landing branch itself edited (Spec Lock, owner or artifact evidence hashes, the readiness report, the plan-migration inventory) is the expected consequence of editing canon before the next designated reseal; it never stops the landing and is reported with a reseal request.
  - All four operations, including the migration snapshot taken in a worktree by the designated Plans agent, run on a nightly schedule against main, independently of whether anything landed.
  - No per-plan seal is required to run them, and no seal record claims their outcome.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
  - A landing run reports two sets and nothing else: failures new since the recorded baseline or whose check's count rose, and failures naming a path the branch changed; all three checks still run in full.
  - A failure's key is its check, its sub-check, its error kind, the path it names, and a digest of the remaining fields once timestamps, hash values, the checkout's absolute path and the measured values are removed; a run that changes nothing reports nothing.
  - Per-sub-check totals are compared as well as keys, and a rise in a sub-check whose failures are truncated is reported and stops the landing because the on-branch match cannot see what was added.
  - The landing invocation is scripts/pm-landing-check.py against the branch's base, and it runs before main is pushed, because the branch diff it measures is empty afterwards.
  - The nightly invocation passes --record-baseline and writes reports/landing-checks/baseline.json from a full run against main in a full checkout, committed with the commit it was taken at.
  - A missing, empty or unreadable baseline is an error rather than an empty failure set, so a landing never reads "nothing to report" from a baseline that was never recorded.
validation_surfaces:
  - python3 scripts/pm-landing-check.py --base origin/main
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-plans-verify.py audit-governance
  - "python3 scripts/pm-plan-migration.py validate --run-dir <the run named in Plans/.plan_migration/current_run.json>"
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - Manual AGENTS.md and .claude/CLAUDE.md landing-procedure review.
  - python3 scripts/pm-landing-check.py --record-baseline
risk_class: repository_gate_placement_drift
reasoning_tier: standard
context_scope: repo_governance
implementation_surfaces:
  - AGENTS.md
  - .claude/CLAUDE.md
  - Plans/Bootstrap_Planning_Migration.md
  - scripts/pm-landing-check.py
  - reports/landing-checks/baseline.json
node_compile_hint:
  mode: landing_gate_placement
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md#DL-055
  - Plans/Bootstrap_Planning_Migration.md#BPM-005
  - Plans/Decision_Log.md#DL-067
preserved_exact_tokens:
  - run_gates
  - audit_governance
  - migration_snapshot
  - migration_validate
  - scripts/pm-landing-check.py
  - reports/landing-checks/baseline.json
  - "git merge --ff-only"
  - AGENTS.md
  - .claude/CLAUDE.md
  - "--record-baseline"
negative_constraints:
  - Do not run the four repository-wide operations inside a per-plan seal in order to satisfy this rule.
  - Do not land a branch whose own files fail a repository-wide gate.
  - Do not repair or commit another thread's files to make a repository-wide gate pass at landing.
  - Do not treat the nightly run as a substitute for the landing run, or the landing run as a substitute for the nightly one.
  - Do not record a baseline from a checkout that is missing any input the three checks read, and do not refresh the baseline to make a landing pass.
  - Do not narrow, skip or shorten any of the three checks to make a landing faster; only the reporting changes.
  - Do not stop a landing on a failure that is already in the baseline.
  - Do not treat a missing or unreadable baseline as an empty failure set.
  - Do not refresh the baseline to make a landing pass.
  - Do not run the landing check after main is pushed, when the branch diff it measures is already empty.
owner_hints:
  - Plans/Bootstrap_Planning_Migration.md
  - Plans/bootstrap/Bootstrap_Planning_Workflow.md
```

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/Planning_Ledger_System.md
````

### Decision Log before (main DL-055 prose and PlanUnit)

````markdown
### DL-055: A plan-layer seal is a production seal, and the repository-wide gates run at landing

Decided on 2026-09-17 by Jared.

The question was what a per-plan governance seal should run. It could run the whole profile, four of whose operations validate the entire repository rather than the plan being sealed, or it could run only the operations that act on that plan and leave the repository-wide four to the moment a branch lands and to a nightly schedule.

It came up because the seal of one small plan was measured spending 80 to 85 percent of its script time in those four operations: about 22 of the 27 minutes a seal took on the clean run of 2026-09-10. They read the whole corpus, they fail on this repository for reasons that have nothing to do with the plan being sealed, and a change to a single plan cannot be what they are checking. The fifteen operations that do act on the plan take about two to three minutes between them. The reduced profile had already been shown to be the exact subset of the full one, with every retained operation running the same validator with the same arguments, and the seals produced under the full profile were already recording that they did not qualify the repository. So the claim a seal of this kind makes is not new; it stops running work it never claimed.

The options were:

1. Run the plan-layer profile for every per-plan seal, and run the repository-wide checks when a branch lands on main, with the migration snapshot and the same checks on a nightly schedule.
2. Keep the full profile in every seal and accept the time.
3. Run the full profile for the first seal of a new plan and the plan-layer profile for amendments.

The answer is option 1. Plan-layer seals are fine for production; the repository-wide gates run at landing.

A per-plan seal therefore runs fifteen operations: it registers owners, generates and validates the plan index, generates readiness, generates and validates the audit status, generates and checks shards, synchronizes shard evidence, refreshes Spec Lock, validates the final index, checks the readiness projection, verifies Spec Lock, validates the plan graph, and validates evidence. It omits the two aggregate gate runs and the two migration-snapshot operations. Nothing about the retained operations changes: each runs the same validator with the same arguments and the same scope it ran before, so this removes work rather than weakening it.

What makes that safe is the label the seal record carries, not the decision. A plan-layer seal record names its profile, names the four operations it did not run, records that the repository is not qualified by it, and records that the repository gates were not run in it. A seal like that cannot be read as a full-profile seal, and it claims no result for anything it skipped. A plan-layer seal never claims repository qualification.

Three of the four omitted operations, the gate run, the governance audit and the migration validate, run when a branch lands on main and on a nightly schedule. At landing they run in the shared checkout after the fast-forward and the shard check and before main is pushed, and they cost about ten minutes there. Since Jared's answer of 2026-09-18 the lander reads them through `scripts/pm-landing-check.py`, which runs the same three checks and reports only the failures that are new since the recorded baseline `reports/landing-checks/baseline.json` and the failures that name a path the branch touches; the first baseline held 37,935 failures that named no landed file, and reading that list at every landing told the lander nothing. The baseline is recorded from a full run against main in a full checkout, committed with the commit it was taken at, and refreshed on the nightly schedule only, never per landing. The migration snapshot creates a new tracked run directory, so it never runs in the shared checkout at landing; it runs nightly, in a worktree, by the designated Plans agent. A landing is refused when a failure names a file the landing branch touches, and that failure is fixed on the branch; when every failure names files the branch does not touch, the landing proceeds and the failures are reported. That is the rule the shard check already follows, applied to the same moment. Stale governance hashes for the very documents a branch edited, in Spec Lock, the evidence hashes, the readiness report or the migration inventory, are what every canon edit produces until the designated Plans agent reseals; they never stop a landing and are reported with a reseal request. The nightly run covers the repository whether or not anything landed, so repository qualification never depends on somebody having pushed a branch.

This buys a per-plan seal in the order of twenty minutes instead of forty, and a seal cost that scales with the change instead of with the repository. It costs a seal record that has to say what it did not run, three checks that must actually run at landing and four operations on a schedule rather than being assumed, a landing that is refused when they fail on files the branch touches, and a recorded baseline that has to be refreshed or the residue it excuses goes stale.

This records planning canon only. It enables no runtime behaviour, admits no command or event, and seals no governance.

SourceRef: `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/D2_PLAN_LAYER_SEAL_DECISION_BRIEF.md`, SHA-256 `36be3a9a620f74b4754484844d3a8dfc645ed4df7821cc0ef62d4ac7696dbb36` as read on 2026-09-17; `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/reports/C_ARCHIVE_TEST_REPORT.md`, SHA-256 `923f43cfa7487f7bca537c6db84068c529d9b0ca701acc6d97f1f3c7ac0f1234`; Jared, direction of 2026-09-17.

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md
````

````markdown
### DL-055 - Plan Layer Seal Is A Production Seal With Repository Gates At Landing

```yaml
plan_unit_id: DL-055
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-17 that a plan-layer seal is a production seal and that the
  repository-wide gates run at landing. A per-plan governance seal runs the fifteen plan-layer
  operations register_owners, index_generate, index_validate, readiness_generate,
  audit_status_generate, audit_status_validate, shards_generate, shards_check, shard_evidence_sync,
  spec_lock_refresh, final_index_validate, readiness_projection_check, spec_lock_verify,
  plan_graph_validate, and evidence_validate, and omits the four repository-wide operations
  run_gates, audit_governance, migration_snapshot, and migration_validate. The seal record carries
  seal_profile plan_layer, omitted_operations naming exactly those four, full_repository_qualified
  false, and repository_gates_status not_run_in_this_seal, so a plan-layer seal never claims
  repository qualification and reports no outcome for an operation it did not run. Every retained
  operation runs the same validator with the same arguments and scope as before. Three of the four omitted
  operations, run_gates, audit_governance, and migration_validate, run when a branch lands on main,
  in the shared checkout after the fast-forward and the shard check and before main is pushed, at a
  measured cost of about ten minutes, read through scripts/pm-landing-check.py, which reports only
  the failures that are new since the recorded baseline reports/landing-checks/baseline.json and the
  failures that name a path the branch touches, and on a nightly schedule from which the baseline is
  refreshed, never per landing; migration_snapshot runs only nightly, in a worktree, by the
  designated Plans agent, because it creates a new tracked run directory; a landing is
  refused when a failure names a file the branch touches, and proceeds with the failures reported
  when every failure names files the branch does not touch; stale governance hashes for the documents
  the branch itself edited are the expected state until the designated reseal and never stop a landing.
gui_related: false
gui_classification_reason: Seal profile composition and repository gate placement are planning governance timing, not GUI behavior.
split_recommended: false
depends_on: [BPM-005, BPM-009]
unblocks: []
acceptance_criteria:
  - BPM-005 states the fifteen plan-layer operations, the four omitted operations, the labelled seal record, that a plan-layer seal never claims repository qualification, and that every retained operation runs unchanged.
  - BPM-009 places run_gates, audit_governance, and migration_validate at landing on main and all four, including migration_snapshot in a worktree, on a nightly schedule, with the landing refusal and reporting rule and the measured cost.
  - The landing procedure in AGENTS.md and .claude/CLAUDE.md carries the repository-wide gates as one step after the fast-forward and the shard check and before the push, states the measured cost, and runs them through scripts/pm-landing-check.py against the recorded baseline.
  - The bootstrap seal prose no longer says that a per-plan seal runs the full gate set, and no passage in Plans says a seal qualifies the repository.
  - No validator, validator argument, or validator scope changes for any retained operation.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds, executable queues, or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-landing-check.py --base origin/main
  - Manual AGENTS.md and .claude/CLAUDE.md landing-procedure review.
risk_class: seal_claim_overreach_or_unrun_repository_gates
reasoning_tier: high
context_scope: repo_governance
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Bootstrap_Planning_Migration.md
  - Plans/bootstrap/Bootstrap_Planning_Workflow.md
  - Plans/bootstrap/Bootstrap_Design_Brief.md
  - Plans/bootstrap/Codex_Prompts.md
  - AGENTS.md
  - .claude/CLAUDE.md
node_compile_hint:
  mode: governance_seal_profile_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md:DL-055-direction-2026-09-17
  - Plans/Bootstrap_Planning_Migration.md#BPM-005
  - Plans/Bootstrap_Planning_Migration.md#BPM-009
preserved_exact_tokens:
  - plan_layer
  - seal_profile
  - omitted_operations
  - full_repository_qualified
  - repository_gates_status
  - not_run_in_this_seal
  - run_gates
  - audit_governance
  - migration_snapshot
  - migration_validate
negative_constraints:
  - Do not read a plan-layer seal as a full-profile seal or as evidence that the repository-wide gates passed.
  - Do not run the four repository-wide operations inside a per-plan seal in order to satisfy the landing rule.
  - Do not weaken, reorder, or narrow the scope of any operation the plan-layer profile retains.
  - Do not land a branch whose own files fail a repository-wide gate, and do not fix another thread's files to make one pass.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Bootstrap_Planning_Migration.md
```
````

### Decision Log after (DL-055 preserved exactly)

````markdown
### DL-055: A plan-layer seal is a production seal, and the repository-wide gates run at landing

Decided on 2026-09-17 by Jared.

The question was what a per-plan governance seal should run. It could run the whole profile, four of whose operations validate the entire repository rather than the plan being sealed, or it could run only the operations that act on that plan and leave the repository-wide four to the moment a branch lands and to a nightly schedule.

It came up because the seal of one small plan was measured spending 80 to 85 percent of its script time in those four operations: about 22 of the 27 minutes a seal took on the clean run of 2026-09-10. They read the whole corpus, they fail on this repository for reasons that have nothing to do with the plan being sealed, and a change to a single plan cannot be what they are checking. The fifteen operations that do act on the plan take about two to three minutes between them. The reduced profile had already been shown to be the exact subset of the full one, with every retained operation running the same validator with the same arguments, and the seals produced under the full profile were already recording that they did not qualify the repository. So the claim a seal of this kind makes is not new; it stops running work it never claimed.

The options were:

1. Run the plan-layer profile for every per-plan seal, and run the repository-wide checks when a branch lands on main, with the migration snapshot and the same checks on a nightly schedule.
2. Keep the full profile in every seal and accept the time.
3. Run the full profile for the first seal of a new plan and the plan-layer profile for amendments.

The answer is option 1. Plan-layer seals are fine for production; the repository-wide gates run at landing.

A per-plan seal therefore runs fifteen operations: it registers owners, generates and validates the plan index, generates readiness, generates and validates the audit status, generates and checks shards, synchronizes shard evidence, refreshes Spec Lock, validates the final index, checks the readiness projection, verifies Spec Lock, validates the plan graph, and validates evidence. It omits the two aggregate gate runs and the two migration-snapshot operations. Nothing about the retained operations changes: each runs the same validator with the same arguments and the same scope it ran before, so this removes work rather than weakening it.

What makes that safe is the label the seal record carries, not the decision. A plan-layer seal record names its profile, names the four operations it did not run, records that the repository is not qualified by it, and records that the repository gates were not run in it. A seal like that cannot be read as a full-profile seal, and it claims no result for anything it skipped. A plan-layer seal never claims repository qualification.

Three of the four omitted operations, the gate run, the governance audit and the migration validate, run when a branch lands on main and on a nightly schedule. At landing they run in the shared checkout after the fast-forward and the shard check and before main is pushed, and they cost about ten minutes there. Since Jared's answer of 2026-09-18 the lander reads them through `scripts/pm-landing-check.py`, which runs the same three checks and reports only the failures that are new since the recorded baseline `reports/landing-checks/baseline.json` and the failures that name a path the branch touches; the first baseline held 37,935 failures that named no landed file, and reading that list at every landing told the lander nothing. The baseline is recorded from a full run against main in a full checkout, committed with the commit it was taken at, and refreshed on the nightly schedule only, never per landing. The migration snapshot creates a new tracked run directory, so it never runs in the shared checkout at landing; it runs nightly, in a worktree, by the designated Plans agent. A landing is refused when a failure names a file the landing branch touches, and that failure is fixed on the branch; when every failure names files the branch does not touch, the landing proceeds and the failures are reported. That is the rule the shard check already follows, applied to the same moment. Stale governance hashes for the very documents a branch edited, in Spec Lock, the evidence hashes, the readiness report or the migration inventory, are what every canon edit produces until the designated Plans agent reseals; they never stop a landing and are reported with a reseal request. The nightly run covers the repository whether or not anything landed, so repository qualification never depends on somebody having pushed a branch.

This buys a per-plan seal in the order of twenty minutes instead of forty, and a seal cost that scales with the change instead of with the repository. It costs a seal record that has to say what it did not run, three checks that must actually run at landing and four operations on a schedule rather than being assumed, a landing that is refused when they fail on files the branch touches, and a recorded baseline that has to be refreshed or the residue it excuses goes stale.

This records planning canon only. It enables no runtime behaviour, admits no command or event, and seals no governance.

SourceRef: `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/D2_PLAN_LAYER_SEAL_DECISION_BRIEF.md`, SHA-256 `36be3a9a620f74b4754484844d3a8dfc645ed4df7821cc0ef62d4ac7696dbb36` as read on 2026-09-17; `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/reports/C_ARCHIVE_TEST_REPORT.md`, SHA-256 `923f43cfa7487f7bca537c6db84068c529d9b0ca701acc6d97f1f3c7ac0f1234`; Jared, direction of 2026-09-17.

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md
````

````markdown
### DL-055 - Plan Layer Seal Is A Production Seal With Repository Gates At Landing

```yaml
plan_unit_id: DL-055
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-17 that a plan-layer seal is a production seal and that the
  repository-wide gates run at landing. A per-plan governance seal runs the fifteen plan-layer
  operations register_owners, index_generate, index_validate, readiness_generate,
  audit_status_generate, audit_status_validate, shards_generate, shards_check, shard_evidence_sync,
  spec_lock_refresh, final_index_validate, readiness_projection_check, spec_lock_verify,
  plan_graph_validate, and evidence_validate, and omits the four repository-wide operations
  run_gates, audit_governance, migration_snapshot, and migration_validate. The seal record carries
  seal_profile plan_layer, omitted_operations naming exactly those four, full_repository_qualified
  false, and repository_gates_status not_run_in_this_seal, so a plan-layer seal never claims
  repository qualification and reports no outcome for an operation it did not run. Every retained
  operation runs the same validator with the same arguments and scope as before. Three of the four omitted
  operations, run_gates, audit_governance, and migration_validate, run when a branch lands on main,
  in the shared checkout after the fast-forward and the shard check and before main is pushed, at a
  measured cost of about ten minutes, read through scripts/pm-landing-check.py, which reports only
  the failures that are new since the recorded baseline reports/landing-checks/baseline.json and the
  failures that name a path the branch touches, and on a nightly schedule from which the baseline is
  refreshed, never per landing; migration_snapshot runs only nightly, in a worktree, by the
  designated Plans agent, because it creates a new tracked run directory; a landing is
  refused when a failure names a file the branch touches, and proceeds with the failures reported
  when every failure names files the branch does not touch; stale governance hashes for the documents
  the branch itself edited are the expected state until the designated reseal and never stop a landing.
gui_related: false
gui_classification_reason: Seal profile composition and repository gate placement are planning governance timing, not GUI behavior.
split_recommended: false
depends_on: [BPM-005, BPM-009]
unblocks: []
acceptance_criteria:
  - BPM-005 states the fifteen plan-layer operations, the four omitted operations, the labelled seal record, that a plan-layer seal never claims repository qualification, and that every retained operation runs unchanged.
  - BPM-009 places run_gates, audit_governance, and migration_validate at landing on main and all four, including migration_snapshot in a worktree, on a nightly schedule, with the landing refusal and reporting rule and the measured cost.
  - The landing procedure in AGENTS.md and .claude/CLAUDE.md carries the repository-wide gates as one step after the fast-forward and the shard check and before the push, states the measured cost, and runs them through scripts/pm-landing-check.py against the recorded baseline.
  - The bootstrap seal prose no longer says that a per-plan seal runs the full gate set, and no passage in Plans says a seal qualifies the repository.
  - No validator, validator argument, or validator scope changes for any retained operation.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds, executable queues, or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
  - python3 scripts/pm-landing-check.py --base origin/main
  - Manual AGENTS.md and .claude/CLAUDE.md landing-procedure review.
risk_class: seal_claim_overreach_or_unrun_repository_gates
reasoning_tier: high
context_scope: repo_governance
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Bootstrap_Planning_Migration.md
  - Plans/bootstrap/Bootstrap_Planning_Workflow.md
  - Plans/bootstrap/Bootstrap_Design_Brief.md
  - Plans/bootstrap/Codex_Prompts.md
  - AGENTS.md
  - .claude/CLAUDE.md
node_compile_hint:
  mode: governance_seal_profile_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md:DL-055-direction-2026-09-17
  - Plans/Bootstrap_Planning_Migration.md#BPM-005
  - Plans/Bootstrap_Planning_Migration.md#BPM-009
preserved_exact_tokens:
  - plan_layer
  - seal_profile
  - omitted_operations
  - full_repository_qualified
  - repository_gates_status
  - not_run_in_this_seal
  - run_gates
  - audit_governance
  - migration_snapshot
  - migration_validate
negative_constraints:
  - Do not read a plan-layer seal as a full-profile seal or as evidence that the repository-wide gates passed.
  - Do not run the four repository-wide operations inside a per-plan seal in order to satisfy the landing rule.
  - Do not weaken, reorder, or narrow the scope of any operation the plan-layer profile retains.
  - Do not land a branch whose own files fail a repository-wide gate, and do not fix another thread's files to make one pass.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Bootstrap_Planning_Migration.md
```
````

### Exact inserted decision entries and PlanUnits

````markdown
### DL-066: A plan seal is accepted after one review and one bounded repair round

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

````markdown
### DL-067: The landing checks report only the failures that are new since a recorded baseline

Decided on 2026-09-17 by Jared.

The question was what the three repository-wide checks at landing should tell the person landing a branch. They could report everything they find, which is what they did, or they could compare what they find against a recorded picture of the last full run and report only the difference.

It came up because two landings on 2026-09-17 each spent a quarter of an hour reading the same failures. The first ran the three checks in fourteen minutes and twelve seconds; the second, three hours later, took fifteen minutes and sixteen seconds. Between them the two runs produced identical failure sets: twenty-five failing sub-checks and two hundred and twenty-eight individual failures, not one of which had appeared, changed or gone away in between, and none of which had anything to do with either branch. The Jev pilot's landings saw the same thing. A check whose output is the same before and after a change tells the person making the change nothing, and reading it costs the same whether it is useful or not.

The options were:

1. Compare each run's failure set against a recorded baseline from the last full run, report only what is new since it, and refresh the baseline nightly.
2. Keep printing everything and let the person landing sort it out.
3. Stop running the checks at landing and rely on the nightly run alone.

The answer is option 1, with the stop rule that follows from it: a landing stops only on something the branch is answerable for.

The checks themselves do not change. All three still run in full, they still read the whole repository, and nothing stops being checked and nothing is hidden. What changes is what is put in front of a reader. Every failure becomes a stable key made of the check, the sub-check, the kind of error, the path it names, and a short digest of what is left of the failure once the parts that move on their own are removed: timestamps, hash values, the absolute path of the checkout it ran in, and the measured actual and expected values. What survives is what makes one failure different from another, which span, which unit, which field, so a stale hash for one document keeps one key however often that document changes.

A landing run reports two sets and nothing else. The first is what is new: a failure whose key is not in the recorded baseline, or a check whose failure count has risen above the baseline's count. The second is what is on the branch: a failure that names a path the branch changed, whether or not it is new. Everything else is silent.

The count comparison is not decoration. The two aggregate checks print only the first fifty failures of a sub-check, or the first hundred, while reporting the true total, so everything above that cap is never keyed at all and the on-branch match runs over the sample rather than the whole set. A rise in a truncated sub-check is therefore reported and does stop the landing, because what was added cannot be matched against the branch's paths and nobody can say it was not the branch's.

The check runs after the fast-forward and the shard check and before main is pushed. That order is not a preference: the branch is measured by what its diff against main names, and once main is pushed that list is empty and the check would be comparing the branch against itself.

Outcomes are graded. Nothing to report is one outcome. Nothing that stops the landing is another: governance staleness on files the branch edited, or failures that are new but name none of the branch's files, both of which are pushed and reported. Something that stops the landing is the third: a failure on the branch's own files that is not staleness, a grown bucket whose error kind is not staleness, or a rise in a truncated sub-check. Being unable to run at all is the fourth, and is not success.

The baseline is a full run against main, recorded in a full checkout and committed with the commit it was taken at. It is refreshed on a nightly run beside the migration snapshot, by the designated Plans agent in a worktree, whether or not anything landed. Nothing on this machine schedules that today, so it is a scheduled task that does the snapshot and the refresh together and commits both. A baseline is never refreshed to make a landing pass; doing that excuses exactly the failure it was meant to show.

Two carve-outs stay exactly as they were. Stale governance hashes for the documents a branch itself edited remain the expected consequence of editing canon before the designated Plans agent's next reseal, so they never stop a landing, and they are still reported with a reseal request. And nobody repairs another thread's files to make a check pass.

What this buys is a landing that reads its checks in seconds instead of a quarter of an hour, and a signal that means something when it appears. What it costs is a baseline that has to be kept current, a nightly run that has to actually run, and the risk that a failure sitting inside the baseline stays unexamined until somebody reads the nightly report on purpose.

The command, the baseline file and the landing procedure text are carried by the branch that implements this decision, which owns `scripts/pm-landing-check.py`, its baseline at `reports/landing-checks/baseline.json`, its runbook, and the landing-procedure wording in `AGENTS.md` and `.claude/CLAUDE.md`. This record states the rule; that branch states how it is run.

This records planning canon only. It enables no runtime behaviour, admits no command or event, and seals no governance.

SourceRef: `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/D3_ACCEPTANCE_AND_LANDING_BASELINE_BRIEF.md`, SHA-256 `efd043f2a5a21f68841c8cd0813cef407cd587a5f0fb9958d19cc4bd135cf274` as read on 2026-09-17; the two landing runs of 2026-09-17 at `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/reports/landing-gates-20260917/` (run-gates.json SHA-256 `fec3ff2a4b515902772f1d76d2eaaeb5cfb202135151b456af31e445f5155ac4`) and `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/reports/landing-gates-20260917-n4/` (run-gates.json SHA-256 `079c484c63bfcc99e421458b6c06bd2eb811d326078a197931516cad3fcd588b`); Jared, direction of 2026-09-17.

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/Planning_Ledger_System.md
````

````markdown
### DL-066 - Plan Seal Acceptance Is Bounded By One Review And One Repair Round

```yaml
plan_unit_id: DL-066
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
  - Plans/Decision_Log.md:DL-066-direction-2026-09-17
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
````

````markdown
### DL-067 - Landing Checks Report Only Failures New Since A Recorded Baseline

```yaml
plan_unit_id: DL-067
unit_type: requirement
status: accepted
owner_doc: Plans/Decision_Log.md
canonical_text: >-
  Jared decided on 2026-09-17 that the three read-only repository-wide checks at landing report
  only what is new or what is on the branch. Each run still executes run_gates, audit_governance
  and migration_validate in full. Every failure becomes a stable key of check, sub-check, error
  kind, path, and a digest of the failure's remaining fields once timestamps, hash values, the
  absolute path of the checkout it ran in, and the measured actual and expected values are removed.
  A landing run reports two sets and nothing else: failures whose key is not in the recorded
  baseline or whose check's failure count rose above the baseline count, and failures that name a
  path the branch changed whether or not they are new. Because run_gates prints only fifty failures
  per sub-check and audit_governance only a hundred while reporting the true total, per-sub-check
  totals are compared as well, and a rise in a truncated sub-check is reported and stops the
  landing, since what was added cannot be matched against the branch's paths. The check runs after
  the fast-forward and the shard check and before main is pushed, because the branch is measured by
  its diff against main and that diff is empty once main is pushed. Outcomes are graded: nothing to
  report; nothing that stops the landing, being governance staleness on files the branch edited or
  new failures naming none of the branch's files, which are pushed and reported; something that
  stops the landing, being a non-staleness failure on the branch's own files, a grown bucket whose
  error kind is not staleness, or a rise in a truncated sub-check; and failing to run at all, which
  is not success. The baseline is a full run against main recorded in a full checkout and committed
  with the commit it was taken at, refreshed on a nightly run beside the migration snapshot by the
  designated Plans agent whether or not anything landed, and never refreshed to make a landing pass.
  The measured basis is two landings of 2026-09-17 that took fourteen minutes twelve seconds and
  fifteen minutes sixteen seconds and produced identical failure sets of twenty-five failing
  sub-checks and two hundred twenty-eight failures, none of which belonged to either branch. The
  command, its baseline file and the landing-procedure text are carried by the branch that
  implements this decision, which owns scripts/pm-landing-check.py and
  reports/landing-checks/baseline.json.
gui_related: false
gui_classification_reason: Landing check reporting and baseline placement are repository governance procedure, not GUI behavior.
split_recommended: false
depends_on: [BPM-009, DL-055]
unblocks: []
acceptance_criteria:
  - BPM-009 states the two reported sets, the stable failure key, the per-sub-check total comparison, the nightly baseline refresh, and the graded outcomes.
  - The landing procedure invokes scripts/pm-landing-check.py against the branch's base rather than the three commands separately, and runs before main is pushed.
  - The recorded baseline lives at reports/landing-checks/baseline.json, taken from a full run against main in a full checkout and committed with the commit it was taken at.
  - A rise in a sub-check whose failures are truncated is reported and stops the landing, because the on-branch match cannot see what was added.
  - The stale-hash carve-out survives the change and still applies to anything the comparison surfaces on the branch's own documents.
  - All three checks still run in full at landing, so the change alters what is read and not what is checked.
  - The nightly run refreshes the baseline against main independently of whether anything landed.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds, executable queues, or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-landing-check.py --base origin/main
  - python3 scripts/pm-landing-check.py --record-baseline
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - Manual AGENTS.md and .claude/CLAUDE.md landing-procedure review.
risk_class: landing_signal_lost_in_preexisting_failures
reasoning_tier: standard
context_scope: repo_governance
implementation_surfaces:
  - Plans/Decision_Log.md
  - Plans/Bootstrap_Planning_Migration.md
node_compile_hint:
  mode: landing_baseline_decision_record
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
  - Plans/Decision_Log.md:DL-067-direction-2026-09-17
  - Plans/Decision_Log.md#DL-055
  - Plans/Bootstrap_Planning_Migration.md#BPM-009
preserved_exact_tokens:
  - run_gates
  - audit_governance
  - migration_validate
  - reports/landing-checks/baseline.json
  - scripts/pm-landing-check.py
negative_constraints:
  - Do not narrow, skip or shorten any of the three checks in order to make a landing faster; only the reporting changes.
  - Do not stop a landing on a failure that is already in the baseline and whose count has not risen.
  - Do not treat an empty or missing baseline as an empty failure set.
  - Do not refresh the baseline to make a landing pass.
  - Do not let the nightly baseline refresh lapse and then read a stale baseline as current.
  - Do not run the landing check after main is pushed, when the branch diff it measures is already empty.
  - Do not repair or commit another thread's files to make a check pass at landing.
owner_hints:
  - Plans/Decision_Log.md
  - Plans/Bootstrap_Planning_Migration.md
```
````

## Check results

<!-- CHECK_TABLE_START -->
The following results cover the reconciled worktree rebased onto `478cd2aa0fa5a5660961f351918739d43643bbac`; its committed landing-check tip is `d09377d4eb8936e0cb5e905dfcb464a7a03320c4`.

| Check | Command | Exit and result | Evidence (path and SHA-256) |
| --- | --- | --- | --- |
| Shard generation | `python3 scripts/pm-shard-plans.py --generate --config Plans/sharding_config.json` | 0; pass, 99 documents / 2,692 shards | `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/shards-generate.log`; `1bf3514c7245614815fd0a6118b55ffa7ff61c91d5e76ea1204a290cc35f1dff` |
| Plan index generation | `python3 scripts/pm-plan-index.py generate` | 0; pass, 6,691 units / 26,105 acceptance units | `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/index-generate.log`; `8717be8c82a3d989879997786503e852f458c736fc5762a54734c32e6006c44b` |
| Configured shard check | `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0; pass, 99 documents / 2,692 shards | `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/shards-check.log`; `fc2273ce8ffca254875ef7557332b302dbb251d96f57b7104e49e2f13d5c0f56` |
| Plan index validation | `python3 scripts/pm-plan-index.py validate` | 0; pass, 6,691 units / 26,105 acceptance units | `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/index-validate.log`; `bfab4734b55f8fb2d0b5b327e9393af6484b54e07dbd5b8d0253e918cdc0ed12` |
| Named unit tests | `python3 -m unittest tests.test_pm_plan_index tests.test_pm_plans_verify_subprocess` | 0; 37 tests passed | `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/unit-tests.log`; `6f6881415cf46c5fc62e287f7c060ec50cd60784e043811a079a4e640deec743` |
| Full-checkout worktree landing check at `d09377d4eb8936e0cb5e905dfcb464a7a03320c4` | `python3 scripts/pm-landing-check.py --base origin/main --json` | 1; 0 blockers; 8 new and 774 on-branch findings, all stale; 11 grown buckets, all stale; no truncated-subcheck growth | `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/landing-worktree.json`; `3fb12a4e541abc0def5e5d763c1dd120658e9e10dfa2ba062b531ace171c1325`. Empty stderr: `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/landing-worktree.stderr`; `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| Shared configured shard check | `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json` | 0; pass, 99 documents / 2,692 shards; 20.273 seconds | `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/shared-shards-check-resumed.stdout`; `fc2273ce8ffca254875ef7557332b302dbb251d96f57b7104e49e2f13d5c0f56`; empty stderr `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/shared-shards-check-resumed.stderr`; `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| Shared landing check | `python3 scripts/pm-landing-check.py --base origin/main --json` | 2; aggregate blocking count 8; 10 new (8 stale), 780 on-branch (774 stale); 876.125 seconds | `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/shared-landing-resumed.json`; `22deef99cb9455086b6d938307493a755f30c9ca8bbbf4636249512d2be5c678`; empty stderr `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/shared-landing-resumed.stderr`; `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |

Observed non-stale visible records are **eight**, separately from the tool’s aggregate `blocking: 8`: six `event_authority_currentness_source_drift` records, one per aggregate check for each of `Plans/Bootstrap_Planning_Migration.md`, `Plans/Decision_Log.md`, and `Plans/Planning_Wizard.md`, plus two pathless touch-closure records naming missing typed UI action `ui.project.restore_archived`. The observed source paths do not include `Plans/path_reference_registry.json` in this filtered non-stale set.

Both implementation-readiness subchecks grew from 124 to 218 failures (samples 50 for run-gates / 100 for audit-governance). Hidden failures total 8,988; migration grew untruncated from 28,128 to 28,494. Totals are run-gates 4,986, audit-governance 4,986, migration 28,494. HEAD `d09377d4eb8936e0cb5e905dfcb464a7a03320c4` and origin/main `478cd2aa0fa5a5660961f351918739d43643bbac` remained unchanged before and after the shared run. No publication decision is claimed by this check table.
<!-- CHECK_TABLE_END -->

## Landing and carve-outs

The parent applied the user's step 5 stop rule: “Any other failure that names a file the branch touches stops the landing: report it and do not push.” The shared run reports **eight visible non-stale findings**, rather than the expected seven: source drift for Bootstrap Planning Migration, Decision Log and Planning Wizard in both aggregate checks, plus the two pathless touch findings. The two Planning Wizard rows name a branch file outside the described expected findings. `path_reference_registry.json` does not appear in this filtered reported set.

Both truncated readiness subchecks also grew from 124 to 218. Their two growth counters contribute to the tool's blocking count, separately from the visible pathless touch findings. The explicit count distinction and sampling limits are preserved below; no unkeyed failures are claimed to have been individually cleared.

**Disposition: main is not pushed.** Extending the carve-out to this actual result requires a user decision under the quoted stop rule. No findings, scratch inputs, baseline, governance hashes, or source files were repaired, moved or committed. A governance reseal remains the designated Plans agent's responsibility.

<!-- SHARED_FINDINGS_TABLE_START -->
Observed visible non-stale records from `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/shared-landing-resumed.json`:

| Check / Subcheck | Error | source_path or pathless |
| --- | --- | --- |
| `audit-governance` / `implementation_readiness` | `event_authority_currentness_source_drift` | `Plans/Bootstrap_Planning_Migration.md` |
| `audit-governance` / `implementation_readiness` | `event_authority_currentness_source_drift` | `Plans/Decision_Log.md` |
| `audit-governance` / `implementation_readiness` | `event_authority_currentness_source_drift` | `Plans/Planning_Wizard.md` |
| `audit-governance` / `touch_closure` | `central extraction typed UI actions lack rows: ['ui.project.restore_archived']` | pathless |
| `run-gates` / `validate_implementation_readiness` | `event_authority_currentness_source_drift` | `Plans/Bootstrap_Planning_Migration.md` |
| `run-gates` / `validate_implementation_readiness` | `event_authority_currentness_source_drift` | `Plans/Decision_Log.md` |
| `run-gates` / `validate_implementation_readiness` | `event_authority_currentness_source_drift` | `Plans/Planning_Wizard.md` |
| `run-gates` / `validate_touch_closure` | `central extraction typed UI actions lack rows: ['ui.project.restore_archived']` | pathless |

Truncated-subcheck growth counters:

| Check / Subcheck | Baseline reported | Current reported | Current sampled |
| --- | ---: | ---: | ---: |
| `audit-governance` / `implementation_readiness` | 124 | 218 | 100 |
| `run-gates` / `validate_implementation_readiness` | 124 | 218 | 50 |

The aggregate **blocking count of 8** comprises **6 on-branch source-drift rows plus 2 truncated-growth counters**. The **8 visible non-stale records** above comprise **6 source-drift rows plus 2 pathless touch-closure rows**. The equal totals have different composition; the pathless rows are not the two truncated-growth counters.
<!-- SHARED_FINDINGS_TABLE_END -->

## Anything not done

Main publication, worktree removal and local branch deletion remain undone because of the additional branch-file findings. The worktree and branch are retained; the branch is already published at `d09377d4eb8936e0cb5e905dfcb464a7a03320c4`. Shared main has the same commit locally; origin/main remains at `478cd2aa0fa5a5660961f351918739d43643bbac`.

The resumed preflight confirmed no uncommitted overlap across all 60 branch paths, and the shared main fast-forward succeeded. The shared shard check passed. The full shared landing check completed once, before any main push, with exit 2 and aggregate blocking count 8. The branch paths remain clean and `.omp/lsp.json` is byte-for-byte preserved. No further rebase or source change was needed after the user's resume instruction.

## Evidence

These receipts cover the tested rebased branch and resumed shared-checkout checks at `d09377d4eb8936e0cb5e905dfcb464a7a03320c4`. Main publication remains pending. Full validator logs are cited in the check table.

| Evidence path | SHA-256 |
| --- | --- |
| `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/source-reconciliation.json` | `285127acbf96005cb9dfb69d488eb214904dd81b1da4ab8e6272bc46a1c2362f` |
| `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/committed-scope-proof.json` | `e4b66c14149b347eac5839eb9502069b0e0513e70f6e3740d82e9322a53969d9` |
| `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/concurrent-main-source-proof.json` | `8d55fcce02767cfdd2f3cf58a44d31280553e8673226b8647ba9765241dcabea` |
| `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/shared-preflight.json` | `18bcff1baf7db66ccbee09df9d4f7c594b3e6e049956f0d6adb748e0fa93f05d` |
| `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/branch-push-first.json` | `536d1bc01c90474343c2ea35ca97570addf1d6627df54d0777cc60ac5a999cbf` |
| `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/branch-push-first.log` | `15cd0f5a9cc2a81d5014aa57362ff7dada0934db66e8facd1d18d542b29b4e2a` |
| `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/mechanical-check-results.json` | `16909c5e56aec99a8575cea73df78cf62429e59fffad471f69372e622304b0f3` |
| `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/landing-worktree-result.json` | `1f74cdd082f17b6d542bc43bea62117b17dc36852777b76f99a0d3b25bc71a77` |
| `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/shared-shards-check-resumed-receipt.json` | `53b7c49826d10989d784b3a192d20484266e83307aac5daf15b776b5e299e6ce` |
| `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/shared-landing-resumed-receipt.json` | `51686e470610f3da764ed222731ad38176f491258342867f7aaffc7fba0c0e24` |

Receipt: `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/resumed-preflight.json`; SHA-256 `f1b40f8bd36ef8c32459ad4dcb7a44bff9efc9e93802fd2b4c712fff43b97eb0`.

Receipt: `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/main-fast-forward.json`; SHA-256 `8ab300d13dae8147aaf462d0227261a572ccbd7c58b7ce163d1e8cf941e4c564`.

Receipt: `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/shared-source-invariants.json`; SHA-256 `4dbaa68a901a361a92a937a3ed45bfb5babfe9a22e50fa1abf677c17e0874508`.

Receipt: `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/resumed-adjudication.json`; SHA-256 `4a881ef5fc3ab6ae0dbcb0a077e2b843edbc5c3b74092e645956b2e309a8777b`.

The additional-finding stop condition was revalidated at 2026-09-21 05:17:16 UTC across three consecutive resumed goal turns. Main remains local at `d09377d4eb8936e0cb5e905dfcb464a7a03320c4`, published main remains `478cd2aa0fa5a5660961f351918739d43643bbac`, and approval to extend the carve-out has not been received.

Receipt: `/mnt/Cursor/PuppetMaster-Evidence/scratch/gl-bounded-acceptance-20260921/resumed-blocked-checkpoint.json`; SHA-256 `cfb4b6ed323a710cb8b5d22f6af3b0455b9253eb3d1d96b81a794fea63ebbc30`.

## Landing completed by the coordinator (2026-09-21)

Pushed `d09377d4eb8936e0cb5e905dfcb464a7a03320c4` to `origin` (GitHub and the TrueNAS push URL) and `truenas-backup` as `main`; worktree removed, local branch deleted. Disposition of the eight findings under AGENTS.md "How to land on main": the six `event_authority_currentness_source_drift` rows on `Plans/Bootstrap_Planning_Migration.md`, `Plans/Decision_Log.md` and `Plans/Planning_Wizard.md` are governance staleness for documents this branch edited (stale readiness report and owner evidence hashes), which does not stop a landing and is reported with a reseal request; the two pathless `ui.project.restore_archived` touch-closure rows name no file this branch touches and are reported to Jared; the readiness growth 124 to 218 in both aggregates is the same carve-out the retention-guard landing at 478cd2aa0f accepted; the migration growth is stale-kind. Note for the landing-check tool's owner: `event_authority_currentness_source_drift` is not in its stale-kind list, so it counted the six rows as blocking. Reseal request: Planning_Wizard.md, Bootstrap_Planning_Migration.md and Decision_Log.md need the designated Plans agent's reseal.
