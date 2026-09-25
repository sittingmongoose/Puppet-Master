# Task D2 report: the plan-layer seal decision in canon, and the repository gates at landing

## 1. Branch and commit

- Repository: `/mnt/Cursor/PuppetMaster`
- Worktree (local disk, left in place for the review session): `/home/sittingmongoose/pm-worktrees/plan-layer-seal-20260917`
- Branch: `plans/plan-layer-seal-20260917`, pushed to `origin` and to the `ssh://192.168.50.200` mirror the push hook writes to
- Commit: `0387eb6b9ba49ad21928b9d1f54d4033a2a8c989`
- Base: `origin/main` = `d43694b6e1d21ae48e73e42f089d56167b1f340a`. The final `git fetch origin` found nothing new, so `git rebase origin/main` was a no-op and the branch is exactly one commit ahead of `main`.
- Not merged into `main`; worktree not removed. The review session does both.
- 34 files: 5 owner/prose documents, `AGENTS.md`, `.claude/CLAUDE.md`, 21 regenerated shards for exactly the two sharded documents I edited, and the 6 `Plans/.plan_index` outputs. 1186 insertions, 583 deletions.

Files changed:

| Path | What changed |
|---|---|
| `Plans/Bootstrap_Planning_Migration.md` | BPM-005 amended; new 2026-09-17 addendum carrying the prose and BPM-009 |
| `Plans/Decision_Log.md` | DL-055 in both sections |
| `Plans/bootstrap/Bootstrap_Planning_Workflow.md` | Governance seal section reconciled |
| `Plans/bootstrap/Bootstrap_Design_Brief.md` | Governance seal paragraph reconciled |
| `Plans/bootstrap/Codex_Prompts.md` | Governance-seal Goal prompt reconciled |
| `AGENTS.md`, `.claude/CLAUDE.md` | one step added to "How to land on main" |
| `Plans/_shards/bootstrap_planning_migration/**` (11), `Plans/_shards/decision_log/**` (10) | regenerated, never hand-edited |
| `Plans/.plan_index/**` (6) | regenerated |

## 2. Where the seal contract lives, and why

The contract is split across two owners and I changed both, as the brief allows.

1. **`Plans/Bootstrap_Planning_Migration.md`, BPM-005 "Governance Seal Timing"** is the canonical PlanUnit owner of the governance seal. It is the only unit in canon that says what a seal phase does, and `Plans/Planning_Ledger_System.md` PLS-011 defers to it explicitly ("Bootstrap_Planning_Migration/BPM-005 owns governance seal timing while this PlanUnit owns compile-queue fidelity"). The seal profile and the claim boundary went here, plus a new sibling unit **BPM-009** in a 2026-09-17 addendum for the landing and nightly placement.
2. **The bootstrap prose**, in `Plans/bootstrap/Bootstrap_Planning_Workflow.md`, `Plans/bootstrap/Bootstrap_Design_Brief.md` and `Plans/bootstrap/Codex_Prompts.md`, is where an operator actually reads what a seal runs. All three carried the old "full gates" wording and all three were reconciled.

What I checked and ruled out:

- **`Plans/Progression_Gates.md`** does not own the repository seal or landing. Its GATE-001..GATE-014 are the product's promotion gates for plan-to-code progression, and it says nothing about `main`, fast-forward merges or landing. Nothing in it needed to change.
- **`Plans/Planning_Wizard.md` PWIZ-006 and PWIZ-011** are the product-native Planning Wizard's conversion/audit/repair contract (Overseer conversion agent, Topic Plan Draft, Ready state). They are not the repository's governance seal. Nothing in them needed to change.
- **No new owner document was invented.**

One fact worth recording: **none of the nineteen operation names existed anywhere in `Plans/**` before this branch.** `grep` for `register_owners`, `index_generate`, `spec_lock_refresh`, `readiness_projection_check`, `plan_graph_validate`, `audit_status_generate` and the rest returned only unrelated coincidences (`spec_lock_refresh` in a Working Notebook fixture, `run_gates` in `plan_graph.json`, `migration_snapshot` in FinalGUISpec). `seal_profile`, `full_repository_qualified` and `repository_gates_status` appeared nowhere in the repository at all. Canon described *when* a seal runs and *what artifacts* it refreshes, but never *which operations* it runs or *what it claims*. This branch is the first time either is written down.

The operation names and record fields were taken from the running harness, not invented: `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/b3-live-001/evidence/seal-config.json` lists the fifteen `profile_operations` verbatim, and `planning-workflow-successor-11-development/pwflow/host_seal.py` defines `FULL19`, `PLAN_LAYER_OMITTED` and the `PROFILES` table.

## 3. BPM-005, full new text

````markdown
### BPM-005 - Governance Seal Timing

```yaml
plan_unit_id: BPM-005
unit_type: constraint
status: accepted
owner_doc: Plans/Bootstrap_Planning_Migration.md
canonical_text: >-
  Spec Lock, generated shards, evidence bundles, plan graph, and governance locks are refreshed only
  during an explicit governance seal phase after canonical docs and generated indexes stop changing.
  A per-plan seal runs the plan-layer profile, which is the fifteen operations register_owners,
  index_generate, index_validate, readiness_generate, audit_status_generate, audit_status_validate,
  shards_generate, shards_check, shard_evidence_sync, spec_lock_refresh, final_index_validate,
  readiness_projection_check, spec_lock_verify, plan_graph_validate, and evidence_validate. The four
  repository-wide operations run_gates, audit_governance, migration_snapshot, and migration_validate
  are omitted from a per-plan seal and run at landing and on a nightly schedule instead. Every
  plan-layer seal record is labelled with seal_profile plan_layer, omitted_operations naming exactly
  those four, full_repository_qualified false, and repository_gates_status not_run_in_this_seal. A
  plan-layer seal is a production seal because it states what it did not run; it never claims
  repository qualification and never reports a result for an operation it did not run. The plan-layer
  profile is the exact subset of the full profile: every retained operation runs the same validator
  with the same arguments and the same scope it ran under the full profile, so no validator is
  weakened, reordered, or narrowed.
gui_related: false
gui_classification_reason: Governance seal timing is not GUI implementation work.
depends_on: [BPM-003, BPM-004, PDS-006, PNC-004]
unblocks: []
acceptance_criteria:
  - Ordinary ledger writing, plan drafting, plan conversion batches, and PlanUnit indexing do not update Spec Lock or generated governance artifacts.
  - The seal phase runs only after doc/index churn stops.
  - A per-plan governance seal runs exactly the fifteen plan-layer operations and omits run_gates, audit_governance, migration_snapshot, and migration_validate.
  - Every plan-layer seal record carries seal_profile plan_layer, the four omitted operation names, full_repository_qualified false, and repository_gates_status not_run_in_this_seal.
  - No plan-layer seal record, report, or certification claims repository qualification or reports an outcome for an operation it did not run.
  - Every operation the plan-layer profile retains runs the same validator, with the same arguments and scope, that it ran under the full profile.
validation_surfaces:
  - python3 scripts/pm-plans-verify.py run-gates
  - python3 scripts/pm-shard-plans.py --check
  - Explicit governance seal report.
risk_class: governance_artifact_staleness
reasoning_tier: standard
context_scope: repo_governance
implementation_surfaces: [Plans/Spec_Lock.json, Plans/_shards, Plans/.evidence, Plans/plan_graph.json, Plans/auto_decisions.jsonl, Plans/bootstrap/Bootstrap_Planning_Workflow.md, Plans/bootstrap/Bootstrap_Design_Brief.md, Plans/bootstrap/Codex_Prompts.md]
node_compile_hint: {mode: seal_phase_only, create_worknodes: false}
source_lineage:
  - pldg-20260610-001-ledger-plan-system:atom-0027
  - pldg-20260610-001-ledger-plan-system:atom-0031
  - pldg-20260610-001-ledger-plan-system:dec-0007
  - pldg-20260610-001-ledger-plan-system:dec-0010
  - source_ref:chat:design-discussion
  - source_ref:chat:user-node-readiness-correction
  - Plans/Decision_Log.md#DL-055
preserved_exact_tokens: ["Plans/Spec_Lock.json", "Plans/_shards/**", "Plans/.evidence/**", "Plans/plan_graph.json", "PlanUnit index", "node-readiness report", "Do not create WorkNodes", "plan_layer", "seal_profile", "omitted_operations", "full_repository_qualified", "repository_gates_status", "not_run_in_this_seal", "run_gates", "audit_governance", "migration_snapshot", "migration_validate"]
negative_constraints:
  - Do not update Spec Lock during ordinary ledger writing, plan drafting, or plan conversion batches.
  - Do not create WorkNodes or executable build tasks during PlanUnit indexing.
  - Do not read a plan-layer seal as a full-profile seal or as evidence that the repository-wide gates passed.
  - Do not weaken, reorder, or narrow the scope of any operation the plan-layer profile retains.
  - Do not omit the profile label, the omitted operation names, or the repository-gate status from a plan-layer seal record.
owner_hints: [Plans/Bootstrap_Planning_Migration.md, Plans/Plan_Document_System.md, Plans/Plan_To_Node_Compilation.md]
```

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/Plan_To_Node_Compilation.md
````

The unchanged fields are omitted from no part of the block above; this is the whole unit as it now stands. Four acceptance criteria and three negative constraints were added, `canonical_text` became a block scalar carrying the profile contract, `implementation_surfaces` gained the three bootstrap prose documents, `source_lineage` gained the decision, and `preserved_exact_tokens` gained the nine profile and record tokens.

## 4. The new addendum and BPM-009, full new text

````markdown
## Plan-Layer Seal Profile And Landing Gates Addendum - 2026-09-17

This addendum records the seal profile a per-plan governance seal runs and where the repository-wide
gates run instead. It changes no validator, creates no WorkNodes, NodeSeeds, executable queues, final
node manifests, implementation files, production build tasks, or generated governance artifacts, and
it seals nothing by itself.

A per-plan governance seal runs the plan-layer profile: `register_owners`, `index_generate`,
`index_validate`, `readiness_generate`, `audit_status_generate`, `audit_status_validate`,
`shards_generate`, `shards_check`, `shard_evidence_sync`, `spec_lock_refresh`,
`final_index_validate`, `readiness_projection_check`, `spec_lock_verify`, `plan_graph_validate`, and
`evidence_validate`. Those fifteen operations act on the plan being sealed and on the artifacts
derived from it, and they take about two to three minutes between them.

Four operations are omitted: `run_gates`, `audit_governance`, `migration_snapshot`, and
`migration_validate`. They read the whole corpus rather than the plan, they were measured taking 80
to 85 percent of a seal's script time -- about 22 of 27 minutes on the clean run of 2026-09-10 -- and
a change to one plan cannot be what they are checking. The plan-layer profile is the exact subset of
the full profile: every operation it retains runs the same validator with the same arguments and the
same scope, so the reduction removes work rather than weakening it.

A plan-layer seal is a production seal because its record says what it did not run. Every such record
carries `seal_profile: plan_layer`, `omitted_operations` naming exactly those four,
`full_repository_qualified: false`, and `repository_gates_status: not_run_in_this_seal`. A plan-layer
seal therefore never claims repository qualification, and nothing may read it as a full-profile seal
or as evidence that the repository-wide gates passed.

The four omitted operations run when a branch lands on `main` and on a nightly schedule. At landing
they run in the shared checkout after the fast-forward and the shard check, and they cost about
twelve minutes there. They fail on this repository today for reasons that belong to no single plan,
which is why the landing rule turns on whose files a failure names rather than on the gate passing
outright. A landing is refused when a failure names a file the landing branch touches, and that
failure is fixed on the branch; when every failure names files the branch does not touch, the landing
proceeds and the failures are reported, which is the rule the shard check already follows. The
nightly run covers the repository whether or not anything landed, so repository qualification never
depends on a branch having been pushed. `AGENTS.md` and `.claude/CLAUDE.md` carry this step in their
landing procedure.

### BPM-009 - Repository-Wide Gates Run At Landing And Nightly

```yaml
plan_unit_id: BPM-009
unit_type: constraint
status: accepted
owner_doc: Plans/Bootstrap_Planning_Migration.md
canonical_text: >-
  The four repository-wide operations run_gates, audit_governance, migration_snapshot, and
  migration_validate run when a branch lands on main and on a nightly schedule, not inside a per-plan
  governance seal. At landing they run in the shared checkout after the fast-forward and the shard
  check and cost about twelve minutes there. A landing is refused when a repository-wide failure
  names a file the landing branch touches, and that failure is fixed on the branch; when every
  failure names files the branch does not touch, the landing proceeds and the failures are reported,
  which is the rule the shard check already follows. The nightly run covers the repository whether or
  not anything landed, so repository qualification never depends on a branch having been pushed.
  AGENTS.md and .claude/CLAUDE.md carry this step in their landing procedure with the measured cost
  stated.
gui_related: false
gui_classification_reason: Gate placement in the landing and nightly repository procedures is governance timing, not GUI behavior.
split_recommended: false
depends_on: [BPM-005]
unblocks: []
acceptance_criteria:
  - The landing procedure in AGENTS.md and .claude/CLAUDE.md names run-gates, audit-governance, the migration snapshot, and the migration validate as one step after the fast-forward and the shard check, and states the measured cost of about twelve minutes.
  - A repository-wide failure that names a file the landing branch touches stops the landing and is fixed on the branch.
  - A repository-wide failure that names only files the landing branch does not touch does not stop the landing; main is pushed and the failures are reported, exactly as the shard-check rule reads.
  - The same four operations run on a nightly schedule against main, independently of whether anything landed.
  - No per-plan seal is required to run them, and no seal record claims their outcome.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
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
  - "git merge --ff-only"
  - AGENTS.md
  - .claude/CLAUDE.md
negative_constraints:
  - Do not run the four repository-wide operations inside a per-plan seal in order to satisfy this rule.
  - Do not land a branch whose own files fail a repository-wide gate.
  - Do not repair or commit another thread's files to make a repository-wide gate pass at landing.
  - Do not treat the nightly run as a substitute for the landing run, or the landing run as a substitute for the nightly one.
owner_hints:
  - Plans/Bootstrap_Planning_Migration.md
  - Plans/bootstrap/Bootstrap_Planning_Workflow.md
```

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/Planning_Ledger_System.md
````

## 5. Decision Log DL-055

DL-054 was the highest entry on `origin/main` in both sections, and DL-055 was still free at the final fetch, so the number stands. BPM-009 was likewise free.

### Prose entry, under `## Entries`

````markdown
### DL-055: A plan-layer seal is a production seal, and the repository-wide gates run at landing

Decided on 2026-09-17 by Jared.

The question was what a per-plan governance seal should run. It could run the whole profile, four of whose operations validate the entire repository rather than the plan being sealed, or it could run only the operations that act on that plan and leave the repository-wide four to the moment a branch lands and to a nightly schedule.

It came up because the seal of one small plan was measured spending 80 to 85 percent of its script time in those four operations: about 22 of the 27 minutes a seal took on the clean run of 2026-09-10. They read the whole corpus, they fail on this repository for reasons that have nothing to do with the plan being sealed, and a change to a single plan cannot be what they are checking. The fifteen operations that do act on the plan take about two to three minutes between them. The reduced profile had already been shown to be the exact subset of the full one, with every retained operation running the same validator with the same arguments, and the seals produced under the full profile were already recording that they did not qualify the repository. So the claim a seal of this kind makes is not new; it stops running work it never claimed.

The options were:

1. Run the plan-layer profile for every per-plan seal, and run the four repository-wide operations when a branch lands on main and on a nightly schedule.
2. Keep the full profile in every seal and accept the time.
3. Run the full profile for the first seal of a new plan and the plan-layer profile for amendments.

The answer is option 1. Plan-layer seals are fine for production; the repository-wide gates run at landing.

A per-plan seal therefore runs fifteen operations: it registers owners, generates and validates the plan index, generates readiness, generates and validates the audit status, generates and checks shards, synchronizes shard evidence, refreshes Spec Lock, validates the final index, checks the readiness projection, verifies Spec Lock, validates the plan graph, and validates evidence. It omits the two aggregate gate runs and the two migration-snapshot operations. Nothing about the retained operations changes: each runs the same validator with the same arguments and the same scope it ran before, so this removes work rather than weakening it.

What makes that safe is the label the seal record carries, not the decision. A plan-layer seal record names its profile, names the four operations it did not run, records that the repository is not qualified by it, and records that the repository gates were not run in it. A seal like that cannot be read as a full-profile seal, and it claims no result for anything it skipped. A plan-layer seal never claims repository qualification.

The four omitted operations run when a branch lands on main and on a nightly schedule. At landing they run in the shared checkout after the fast-forward and the shard check, and they cost about twelve minutes there. A landing is refused when a failure names a file the landing branch touches, and that failure is fixed on the branch; when every failure names files the branch does not touch, the landing proceeds and the failures are reported. That is the rule the shard check already follows, applied to the same moment. The nightly run covers the repository whether or not anything landed, so repository qualification never depends on somebody having pushed a branch.

This buys a per-plan seal in the order of twenty minutes instead of forty, and a seal cost that scales with the change instead of with the repository. It costs a seal record that has to say what it did not run, four operations that must actually run at landing and on a schedule rather than being assumed, and a landing that is refused when they fail on files the branch touches.

This records planning canon only. It enables no runtime behaviour, admits no command or event, and seals no governance.

SourceRef: `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/D2_PLAN_LAYER_SEAL_DECISION_BRIEF.md`, SHA-256 `36be3a9a620f74b4754484844d3a8dfc645ed4df7821cc0ef62d4ac7696dbb36` as read on 2026-09-17; `/home/sittingmongoose/PM-Experiments/harness-latency-20260916/reports/C_ARCHIVE_TEST_REPORT.md`, SHA-256 `923f43cfa7487f7bca537c6db84068c529d9b0ca701acc6d97f1f3c7ac0f1234`; Jared, direction of 2026-09-17.

ContractRef: ContractName:Plans/Bootstrap_Planning_Migration.md, ContractName:Plans/Planning_Ledger_System.md, ContractName:Plans/Plan_Document_System.md
````

### PlanUnit, under `## PlanUnits`

`````markdown
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
  operation runs the same validator with the same arguments and scope as before. The four omitted
  operations run when a branch lands on main, in the shared checkout after the fast-forward and the
  shard check at a measured cost of about twelve minutes, and on a nightly schedule; a landing is
  refused when a failure names a file the branch touches, and proceeds with the failures reported
  when every failure names files the branch does not touch.
gui_related: false
gui_classification_reason: Seal profile composition and repository gate placement are planning governance timing, not GUI behavior.
split_recommended: false
depends_on: [BPM-005, BPM-009]
unblocks: []
acceptance_criteria:
  - BPM-005 states the fifteen plan-layer operations, the four omitted operations, the labelled seal record, that a plan-layer seal never claims repository qualification, and that every retained operation runs unchanged.
  - BPM-009 places run_gates, audit_governance, migration_snapshot, and migration_validate at landing on main and on a nightly schedule, with the landing refusal and reporting rule and the measured cost.
  - The landing procedure in AGENTS.md and .claude/CLAUDE.md carries the repository-wide gates as one step after the fast-forward and the shard check, and states the measured cost.
  - The bootstrap seal prose no longer says that a per-plan seal runs the full gate set, and no passage in Plans says a seal qualifies the repository.
  - No validator, validator argument, or validator scope changes for any retained operation.
  - No command, handler, event, or runtime behaviour is admitted, and no WorkNodes, NodeSeeds, executable queues, or build tasks are created by this record.
validation_surfaces:
  - python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json
  - python3 scripts/pm-plan-index.py validate
  - python3 scripts/pm-plans-verify.py validate-wiring-matrix
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
`````

## 6. AGENTS.md and .claude/CLAUDE.md diff

Both files carry a byte-identical "How to land on main" block, and both got the same single bullet, inserted after the shard-check rule and before the worktree-removal rule. Nothing else in either file changed; `git diff` for this commit touches exactly these two hunks.

```diff
diff --git a/.claude/CLAUDE.md b/.claude/CLAUDE.md
index cb83bdcb3d..943a1d5099 100755
--- a/.claude/CLAUDE.md
+++ b/.claude/CLAUDE.md
@@ -35,6 +35,7 @@
 - `git fetch origin`, then `git rebase origin/main` on your branch. For Plans edits, re-read every passage you cite against the current text before applying; a passage that changed since your snapshot is re-adjudicated, not merged blind. Never hand-merge `_shards` or `.plan_index`; regenerate them.
 - In the shared checkout, if `git status` shows uncommitted changes in any file your branch touches, stop and hand the branch over. Otherwise `git merge --ff-only <branch>`, run `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json`, and push `main`.
 - The shard check reads the working tree, not `HEAD`, so another thread's uncommitted work in the shared checkout can fail your landing. Run the check in your own worktree before you land, so a failure at landing can only be someone else's. If every failure names files your branch does not touch, confirm `HEAD` is consistent (`git cat-file -e HEAD:<named shard>` succeeds and `git show HEAD:<its manifest>` references it), push `main` anyway, and report the failing files to Jared. Never fix or commit another thread's files to make the check pass. If any failure names a file your branch touches, stop and fix it on your branch first.
+- After the fast-forward and the shard check, run the four repository-wide gates in the shared checkout: `python3 scripts/pm-plans-verify.py run-gates`, `python3 scripts/pm-plans-verify.py audit-governance`, `python3 scripts/pm-plan-migration.py snapshot-current --run-id <the run named in Plans/.plan_migration/current_run.json>` and `python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/<that run>`. A per-plan seal no longer runs them, so landing is where they run; they cost about twelve minutes here. If any failure names a file your branch touches, stop and fix it on your branch. If every failure names files your branch does not touch, push `main` anyway and report them to Jared, exactly as the shard-check rule above reads. The same four also run nightly against `main`, whether or not anything landed.
 - When the branch is on `main`, remove the worktree: `git -C /mnt/Cursor/PuppetMaster worktree remove <path>` and `git branch -d <branch>`.
 
 ### Never
diff --git a/AGENTS.md b/AGENTS.md
index 4d38d9da45..7cff692a13 100755
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -92,6 +92,7 @@ Use the repo skill `$pm-bootstrap-planning-ledger` when available. If skills are
 - `git fetch origin`, then `git rebase origin/main` on your branch. For Plans edits, re-read every passage you cite against the current text before applying; a passage that changed since your snapshot is re-adjudicated, not merged blind. Never hand-merge `_shards` or `.plan_index`; regenerate them.
 - In the shared checkout, if `git status` shows uncommitted changes in any file your branch touches, stop and hand the branch over. Otherwise `git merge --ff-only <branch>`, run `python3 scripts/pm-shard-plans.py --check --config Plans/sharding_config.json`, and push `main`.
 - The shard check reads the working tree, not `HEAD`, so another thread's uncommitted work in the shared checkout can fail your landing. Run the check in your own worktree before you land, so a failure at landing can only be someone else's. If every failure names files your branch does not touch, confirm `HEAD` is consistent (`git cat-file -e HEAD:<named shard>` succeeds and `git show HEAD:<its manifest>` references it), push `main` anyway, and report the failing files to Jared. Never fix or commit another thread's files to make the check pass. If any failure names a file your branch touches, stop and fix it on your branch first.
+- After the fast-forward and the shard check, run the four repository-wide gates in the shared checkout: `python3 scripts/pm-plans-verify.py run-gates`, `python3 scripts/pm-plans-verify.py audit-governance`, `python3 scripts/pm-plan-migration.py snapshot-current --run-id <the run named in Plans/.plan_migration/current_run.json>` and `python3 scripts/pm-plan-migration.py validate --run-dir Plans/.plan_migration/<that run>`. A per-plan seal no longer runs them, so landing is where they run; they cost about twelve minutes here. If any failure names a file your branch touches, stop and fix it on your branch. If every failure names files your branch does not touch, push `main` anyway and report them to Jared, exactly as the shard-check rule above reads. The same four also run nightly against `main`, whether or not anything landed.
 - When the branch is on `main`, remove the worktree: `git -C /mnt/Cursor/PuppetMaster worktree remove <path>` and `git branch -d <branch>`.
 
 ### Never
```

The commands are the real ones. `audit-governance` and `run-gates` are both `pm-plans-verify.py` subcommands; the migration pair is `pm-plan-migration.py snapshot-current --run-id ...` and `pm-plan-migration.py validate --run-dir ...`, which is exactly what the harness's `migration_snapshot` and `migration_validate` invoke (`pwflow/scoped_governance.py` lines 593 and 597). The run is named indirectly, through `Plans/.plan_migration/current_run.json`, so the rule cannot go stale the way a hard-coded run id would.

## 7. The sweep: every holdout found and its disposition

Method. Three passes over `Plans/*.md` **and** `Plans/bootstrap/*.md` (the brief names the top-level glob; the bootstrap directory is where the seal prose actually lives, so it was swept too):

1. Phrase sweep for `run full gates`, `full governance gates`, `full gate set`, `all gates`, `every gate`, `complete gate set`, `entire gate set`, `full validator set`, `all validators`.
2. Phrase sweep for `qualifies the repository`, `repository-qualified`, `repository-wide gate/check/validation`, `whole repository`, `entire repository`, `repo-wide`.
3. A proximity pass in Python: every line containing `seal` whose four-line window also contains `run-gates`, `run_gates`, `audit-governance`, `audit_governance` or `gate`. 86 windows, read one by one.

| # | Hit | Disposition |
|---|---|---|
| 1 | `Plans/bootstrap/Bootstrap_Design_Brief.md:127` — "The seal phase may regenerate shards, evidence, plan graph artifacts, decision logs, and `Plans/Spec_Lock.json`, **then run full gates**." | **Reconciled.** Now "then run the plan-layer validators", with the four omitted operations named, their landing/nightly placement, `full_repository_qualified: false`, and a pointer to BPM-005 and BPM-009. |
| 2 | `Plans/bootstrap/Codex_Prompts.md:154` — governance-seal Goal prompt, step 5 "**Run full governance gates:** `run-gates`, `pm-shard-plans.py --check`". | **Reconciled.** Step 5 is now "Run the plan-layer validators" with five named plan-layer commands and an explicit "Do not run run-gates, audit-governance, the migration snapshot, or the migration validate here." Step 6 now requires the seal record to be labelled. |
| 3 | `Plans/bootstrap/Bootstrap_Planning_Workflow.md:186` — "## Governance seal ... run plan/shard validators, and certify changed files/blockers/risks." | **Reconciled.** The wording was not false, but it was the only operator-facing definition of a seal and it named no profile. Two paragraphs were added: the fifteen retained operations, the four omitted ones, the labelled record, and that a plan-layer seal never claims repository qualification. |
| 4 | `Plans/bootstrap/Codex_Prompts.md:244` (was 236) — repair-and-certify Goal prompt: "seal governance if governed files changed ... **Then run** pm-audit-closure validate, pm-plan-index validate, ... **run-gates**, shard check, validate-auto-decisions, verify-spec-lock, validate-evidence ...". | **Left, reviewed, already correct.** This runs the repository-wide validators *after and outside* the seal, as a repository certification step. That is exactly where the decision puts them. Reading it as "the seal runs run-gates" would be a misreading; the sequence is seal, then certify. No change needed, and changing it would have removed a repository-wide run the decision wants kept. |
| 5 | `Plans/bootstrap/Codex_Prompts.md:211` (was 203) — closed-world audit prompt runs `run-gates` among its validators. | **Left, correct as written.** An audit is not a seal. It is read-only and it is entitled to run the repository-wide gates. |
| 6 | `Plans/Planning_Ledger_System.md:391` — "Standard plan **run-gates intentionally exclude** the full bootstrap-ledger matrix; the dedicated `validate-bootstrap-ledgers` smoke check validates every selected ledger." plus the negative constraint "Do not treat run-gates as proof that every historical bootstrap ledger validates." | **Left, correct as written, and reinforcing.** This is canon already saying that a gate run proves only what it covers. It is the same principle the new seal record makes explicit, one level down. |
| 7 | `Plans/Bootstrap_Planning_Migration.md` BPM-005 `validation_surfaces` still lists `python3 scripts/pm-plans-verify.py run-gates`. | **Left deliberately.** `validation_surfaces` is how the *PlanUnit* is validated, not what the seal runs. Removing it would have said that repository gates no longer validate this canon, which is the opposite of the decision. BPM-009 lists the same command for the same reason. |
| 8 | `Plans/00-plans-index.md:5611` and `:5647` — PMConcept7 build receipts reading "receipt ... (base_pin_ok, 20/20 transforms, **gates_all_pass**, zero page errors on load). Governance: seal row `dec-2026-08-15-pm7-tweak-wave-8`". | **Left, out of scope, not a holdout.** `gates_all_pass` is the PM7 concept *build pipeline's* own transform gate, not the repository governance gate set, and these are dated historical receipts. Rewriting them would falsify a log. |
| 9 | `Plans/Decision_Policy.md:3374`, `Plans/Release_Supply_Chain.md:819` — `scripts/pm-governance-seal.py refresh` is the Spec Lock authority; enforcement is `verify-spec-lock` locally plus the CI gate. | **Left, correct as written, and consistent.** `spec_lock_refresh` and `spec_lock_verify` are both retained plan-layer operations, so nothing in these passages moves. |
| 10 | Roughly sixty PlanUnits whose `negative_constraints` end "...generated governance artifacts, or governance seal outputs are created by this compile". | **Left, correct as written.** These say a compile creates no seal. They make no claim about what a seal runs. |

**No passage anywhere in `Plans/**` said that a seal qualifies the repository.** Pass 2 returned zero seal-related hits, which matches the harness finding that seals already carried `full_repository_qualified: false`: canon never made the stronger claim, it simply never made the weaker one either. That is the gap this branch closes.

Residual check after the edits: `grep -rniE "run full gates|full governance gates|full gate set|then run full"` over `Plans/**` excluding `_shards` returns exactly one line, DL-055's own acceptance criterion asserting that the wording is gone.

## 8. Check and test output

All run in the worktree on the pushed commit. Every one passed. The plan index reports `node_readiness_status: blocked_runtime_certification_incomplete`, which is its pre-existing state on `main` and is not caused by this branch.

```
### shards --generate
{
  "docs_generated": 98,
  "failures": [],
  "shards_generated": 2677,
  "source_count": 98,
  "status": "pass"
}

### plan-index generate
{
  "status": "pass",
  "summary": {
    "acceptance_unit_count": 25871,
    "coverage_status": "pass",
    "doc_count": 95,
    "no_worknodes_created": true,
    "node_readiness_status": "blocked_runtime_certification_incomplete",
    "nodeseed_candidates_created": false,
    "plan_unit_count": 6653
  },
  "outputs": [
    "Plans/.plan_index/plan_units.jsonl",
    "Plans/.plan_index/doc_cards.json",
    "Plans/.plan_index/dependencies.json",
    "Plans/.plan_index/acceptance_units.jsonl",
    "Plans/.plan_index/coverage_report.json",
    "Plans/.plan_index/node_readiness_report.json"
  ]
}

### shards --check
{
  "docs_checked": 98,
  "failures": [],
  "shards_checked": 2677,
  "source_count": 98,
  "status": "pass"
}

### plan-index validate
{
  "failures": [],
  "generated_at_utc": "2026-09-17T01:55:42Z",
  "schema_id": "pm.plan_index.validation_report.v1",
  "status": "pass",
  "summary": {
    "acceptance_unit_count": 25871,
    "coverage_status": "pass",
    "node_readiness_status": "blocked_runtime_certification_incomplete",
    "plan_unit_count": 6653
  }
}

### validate-wiring-matrix
{
  "check": "validate-wiring-matrix",
  "failures": [],
  "generated_at_utc": "2026-09-17T01:55:43Z",
  "generic_forge_row_count": 46,
  "rendered_vocabulary_labels": {
    "catalog.forge_review_create": [
      "Create merge request",
      "Create pull request"
    ],
    "catalog.forge_review_merge": [
      "Merge merge request",
      "Merge pull request"
    ]
  },
  "status": "pass",
  "unavailable_vocabulary_profiles": {
    "catalog.forge_review_create": [
      "generic_git"
    ],
    "catalog.forge_review_merge": [
      "generic_git"
    ]
  },
  "vocabulary_review_profile_count": 12,
  "wiring_provider_literal_hit_count": 0,
  "wiring_provider_literal_row_count": 0
}

### unittest
----------------------------------------------------------------------
Ran 26 tests in 2.516s

OK
```

### Derived-file scope

`git status --porcelain` after regeneration named only:

- `Plans/_shards/bootstrap_planning_migration/` — 11 files (10 modified, 1 created: `009-plan-layer-seal-profile-and-landing-gates-addendum-2026-09-17.md`)
- `Plans/_shards/decision_log/` — 10 files
- the 6 `Plans/.plan_index` outputs
- the 5 source documents plus `AGENTS.md` and `.claude/CLAUDE.md`

No shard for a document this branch did not edit changed. `Plans/bootstrap/**` is not in `Plans/sharding_config.json`, so the three bootstrap prose edits produce no derived files at all — confirmed by the config having zero `bootstrap` entries and by the shard check passing at 2677 shards over 98 documents. Shards for untouched sections of the two sharded documents changed only in their `Source lines:` and `Source SHA256:` headers, the expected deterministic consequence of line-offset shifts.

### PlanUnit delta

Exactly two units were added, and none removed. Diffed `plan_units.jsonl` against `HEAD` by id:

```
old 6651  new 6653
added ids: ['BPM-009', 'DL-055']
removed ids: []
```

### Three extra lint subchecks, run individually to de-risk the landing

Not part of the brief's list, and not `run-gates`. I ran them because a landing failure that named one of my files would be mine to fix:

```
lint-banned-phrases   status: pass | failures: 0
lint-contractrefs     status: fail | failures: 1   (pre-existing: a missing Plans/.audits/... ref cited from Plans/00-plans-index.md:75)
lint-path-refs        status: fail | failures: 111 (101 Concepts/, 8 tests/, 2 scratchpad — none in this sparse worktree)
json-syntax           status: fail | failures: 1   (tests/fixtures/governance/raw_evidence_capture_modes.schema.json absent from this worktree)
```

**Zero of those 113 failures name a file, path or PlanUnit this branch touches.** I filtered the `lint-path-refs` failures for `BPM-005`, `BPM-009`, `DL-055`, `AGENTS.md`, `CLAUDE.md` and `bootstrap`: zero matches. The `Concepts/` and `tests/fixtures/` failures are artifacts of the sparse checkout (`Plans scripts tests AGENTS.md .claude`), not of the branch. In particular, adding `AGENTS.md` and `.claude/CLAUDE.md` as `implementation_surfaces` on BPM-009 and DL-055 produced no `implementation_surface_missing_or_untyped` failure.

The repository pre-commit hook ran on both the commit and the amend and reported `pre-commit: shards OK.` No `--no-verify`.

## 9. What I did not do, and why

1. **Not merged; worktree retained**, as instructed. `git merge --ff-only`, the post-merge shard check, the `main` push and `git worktree remove` are the review session's.
2. **`python3 scripts/pm-plans-verify.py run-gates` was not run**, per the brief and per the hard rules. Nor was `audit-governance`, the migration snapshot or the migration validate — which is, pleasingly, exactly the rule this branch writes down.
3. **No governance reseal.** `Plans/Spec_Lock.json`, `Plans/.evidence/**`, `Plans/plan_graph.json`, `Plans/auto_decisions.jsonl` and the readiness artifacts were not touched. `git diff HEAD~1 --name-only` confirms none of them is in the commit.
4. **No shard or plan-index file was hand-edited.** Both were produced by the generators and committed with the edit.
5. **No ledger row was written.** The decision arrived as a brief from the coordinator rather than through a `pldg-*` bootstrap ledger, so there is no ledger question to close and no `latest_audit_*` projection to restamp. DL-051 through DL-054 each cite a ledger question in their `SourceRef`; DL-055 cites the brief and harness test report C by path and SHA-256 instead, which is the same evidence discipline without inventing a ledger record.
6. **`Plans/Progression_Gates.md` was not edited.** It does not own landing or the repository seal (section 2). If the review session disagrees and wants the landing gate recorded there as well, BPM-009 is the unit to point at; nothing in this branch would have to change.
7. **The nightly schedule is recorded as canon, not implemented.** BPM-009 and the landing rule say the four operations run nightly; no cron entry, systemd timer or CI workflow was created, because that is runtime configuration and outside this repository's planning scope. **This is the one open item the decision implies and this branch cannot close.** Until someone installs the schedule, the landing run is the only place the repository-wide gates actually execute, and a week with no landings is a week with no repository qualification. Flagging it for Jared.
8. **A second-order observation, reported not repaired.** Running `python3 scripts/pm-plans-verify.py validate-plan-migration` today fails with `doc_count_mismatch` (72 expected vs 95 actual) and stale `batch_report.jsonl` hashes against `Plans/.plan_migration/pds-20260611-002-atomize-planunits`, the historical atomize run. That is a different run from the one the harness's `migration_validate` targets (the current run named in `current_run.json`), and it is pre-existing on `main` — not caused by this branch. It is a live example of the situation BPM-009's "does the failure name a file your branch touches" rule exists to handle, and it is worth someone's attention on its own.
