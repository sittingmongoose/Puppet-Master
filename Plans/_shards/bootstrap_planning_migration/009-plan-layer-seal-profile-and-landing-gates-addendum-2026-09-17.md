# Shard 009: Plan-Layer Seal Profile And Landing Gates Addendum - 2026-09-17

Source: `Plans/Bootstrap_Planning_Migration.md`

Source lines: L421-L531

Source SHA256: `0ef753ba54284f57927f0073899ffadf53cf37079baacb5646b94b8c6bfaa4d1`

---

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

Three of the four omitted operations, `run_gates`, `audit_governance` and `migration_validate`, run
when a branch lands on `main` and on a nightly schedule. At landing they run in the shared checkout
after the fast-forward and the shard check, and they cost about ten minutes there. `migration_snapshot`
creates a new tracked run directory, so it never runs in the shared checkout at landing; it runs on
the nightly schedule in a worktree by the designated Plans agent. They fail on this repository today for reasons that belong to no single plan,
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
  The repository-wide operations run_gates, audit_governance, and migration_validate run when a
  branch lands on main and on a nightly schedule, not inside a per-plan governance seal; the
  migration_snapshot creates a new tracked run directory, so it runs only on the nightly schedule, in
  a worktree, by the designated Plans agent, never in the shared checkout at landing. At landing the
  three checks run in the shared checkout after the fast-forward and the shard check and cost about
  ten minutes there. A landing is refused when a repository-wide failure
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
  - The landing procedure in AGENTS.md and .claude/CLAUDE.md names run-gates, audit-governance, and the migration validate as one step after the fast-forward and the shard check, states the measured cost of about ten minutes, and keeps the migration snapshot out of the shared checkout.
  - A repository-wide failure that names a file the landing branch touches stops the landing and is fixed on the branch.
  - A repository-wide failure that names only files the landing branch does not touch does not stop the landing; main is pushed and the failures are reported, exactly as the shard-check rule reads.
  - All four operations, including the migration snapshot taken in a worktree by the designated Plans agent, run on a nightly schedule against main, independently of whether anything landed.
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
