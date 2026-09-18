# Shard 009: Plan-Layer Seal Profile And Landing Gates Addendum - 2026-09-17

Source: `Plans/Bootstrap_Planning_Migration.md`

Source lines: L421-L609

Source SHA256: `28be8c386c8cdeb4f0d049c98ab1101c6c5940f04cffb04112181240a9b89da6`

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
proceeds and the failures are reported, which is the rule the shard check already follows.
Stale-hash failures for documents the branch itself edited, in Spec Lock, owner or artifact evidence
hashes, the readiness report or the plan-migration inventory, are the expected consequence of editing
canon before the designated Plans agent's next reseal; they never stop a landing and are reported with
a reseal request. The
nightly run covers the repository whether or not anything landed, so repository qualification never
depends on a branch having been pushed. `AGENTS.md` and `.claude/CLAUDE.md` carry this step in their
landing procedure.

Amended 2026-09-17 under `Plans/Decision_Log.md#DL-067`: the three landing checks report only what
is new. Two landings on 2026-09-17 took fourteen minutes twelve seconds and fifteen minutes sixteen
seconds and produced identical failure sets -- twenty-five failing sub-checks and two hundred
twenty-eight individual failures, none of which belonged to either branch -- so reading the whole
output at every landing tells a lander nothing. All three checks still run in full; what changes is
what is read. `scripts/pm-landing-check.py` runs the three in the checkout it is invoked in and turns
every failure into a stable key of check, sub-check, error kind, path, and a digest of what is left
of the failure once timestamps, hash values, the absolute path of the checkout it ran in, and the
measured `actual` and `expected` values are removed. It reports two sets and nothing else: failures
whose key is not in the recorded baseline or whose check's failure count has risen above the baseline
count, and failures that name a path from `git diff --name-only <base>..HEAD`, whether or not they
are new.

The per-sub-check totals are compared as well as the keys, because `run_gates` prints only fifty
failures per sub-check and `audit_governance` only a hundred while reporting the true total.
Everything above that cap is never keyed, and the on-branch match therefore runs over the sample
rather than the whole failure set, so a rise in a truncated sub-check is reported and stops the
landing: what was added cannot be matched against the branch's paths.

The check runs after the fast-forward and the shard check and **before** `main` is pushed, because it
measures the branch by its diff against `main` and that diff is empty once `main` is pushed. Its
outcomes are graded: nothing to report; nothing that stops the landing, being governance staleness on
files the branch edited or new failures naming none of the branch's files, which are pushed and
reported; something that stops the landing, being a non-staleness failure on the branch's own files, a
grown bucket whose error kind is not staleness, or a rise in a truncated sub-check; and failing to run
at all, which is not success.

The baseline lives at `reports/landing-checks/baseline.json`, taken from a full run against `main` in
a full checkout with `--record-baseline` and committed with the commit it was taken at. It is
refreshed on the nightly run beside the migration snapshot, by the designated Plans agent in a
worktree, whether or not anything landed; nothing on this machine schedules that today, so it is a
scheduled task that does both and commits both, with its runbook in
`reports/landing-checks/README.md`. A baseline is never refreshed to make a landing pass, which would
excuse exactly the failure it was meant to show. The stale-hash carve-out is unchanged and still
applies to anything the comparison surfaces on the branch's own documents. The command, its baseline
file and the landing-procedure wording in `AGENTS.md` and `.claude/CLAUDE.md` are carried by the
branch that implements this decision; this addendum states the rule.

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
  three checks run in the shared checkout after the `git merge --ff-only` fast-forward and the shard
  check and cost about ten minutes there. A landing is refused when a repository-wide failure
  names a file the landing branch touches, and that failure is fixed on the branch; when every
  failure names files the branch does not touch, the landing proceeds and the failures are reported,
  which is the rule the shard check already follows. Stale-hash failures for documents the branch
  itself edited, in Spec Lock, owner or artifact evidence hashes, the readiness report or the
  plan-migration inventory, are the expected consequence of editing canon before the designated
  Plans agent's next reseal; they never stop a landing and are reported with a reseal request. The
  nightly run covers the repository whether or
  not anything landed, so repository qualification never depends on a branch having been pushed.
  AGENTS.md and .claude/CLAUDE.md carry this step in their landing procedure with the measured cost
  stated. The three landing checks report only what is new or what is on the branch. Each run
  executes all three in full and turns every failure into a stable key of check, sub-check, error
  kind, path, and a digest of what is left once timestamps, hash values, the absolute path of the
  checkout it ran in, and the measured actual and expected values are removed. A landing run reports
  two sets and nothing else: failures whose key is not in the recorded baseline or whose check's
  failure count rose above the baseline count, and failures that name a path the branch changed
  whether or not they are new. Per-sub-check totals are compared as well as keys, because run_gates
  prints only fifty failures per sub-check and audit_governance only a hundred while reporting the
  true total, so a rise in a truncated sub-check is reported and stops the landing. The check runs
  after the fast-forward and the shard check and before main is pushed, because it measures the
  branch by its diff against main and that diff is empty once main is pushed. scripts/pm-landing-check.py
  is the one command that runs the three checks and performs the comparison; the landing invocation
  names the branch's base, and the nightly invocation passes --record-baseline and writes
  reports/landing-checks/baseline.json, committed with the commit it was taken at. A baseline is
  never refreshed to make a landing pass.
gui_related: false
gui_classification_reason: Gate placement in the landing and nightly repository procedures is governance timing, not GUI behavior.
split_recommended: false
depends_on: [BPM-005]
unblocks: []
acceptance_criteria:
  - The landing procedure in AGENTS.md and .claude/CLAUDE.md names run-gates, audit-governance, and the migration validate as one step after the fast-forward and the shard check, states the measured cost of about ten minutes, and keeps the migration snapshot out of the shared checkout.
  - A repository-wide failure that names a file the landing branch touches stops the landing and is fixed on the branch.
  - A repository-wide failure that names only files the landing branch does not touch does not stop the landing; main is pushed and the failures are reported, exactly as the shard-check rule reads.
  - A stale-hash failure for a document the landing branch itself edited (Spec Lock, owner or artifact evidence hashes, the readiness report, the plan-migration inventory) is the expected consequence of editing canon before the next designated reseal; it never stops the landing and is reported with a reseal request.
  - All four operations, including the migration snapshot taken in a worktree by the designated Plans agent, run on a nightly schedule against main, independently of whether anything landed.
  - No per-plan seal is required to run them, and no seal record claims their outcome.
  - A landing run reports two sets and nothing else: failures new since the recorded baseline or whose check's count rose, and failures naming a path the branch changed; all three checks still run in full.
  - A failure's key is its check, its sub-check, its error kind, the path it names, and a digest of the remaining fields once timestamps, hash values, the checkout's absolute path and the measured values are removed; a run that changes nothing reports nothing.
  - Per-sub-check totals are compared as well as keys, and a rise in a sub-check whose failures are truncated is reported and stops the landing because the on-branch match cannot see what was added.
  - The landing invocation is scripts/pm-landing-check.py against the branch's base, and it runs before main is pushed, because the branch diff it measures is empty afterwards.
  - The nightly invocation passes --record-baseline and writes reports/landing-checks/baseline.json from a full run against main in a full checkout, committed with the commit it was taken at.
  - A missing, empty or unreadable baseline is an error rather than an empty failure set, so a landing never reads "nothing to report" from a baseline that was never recorded.
  - No WorkNodes, NodeSeeds, executable queues, final node manifests, or production build tasks are created by this PlanUnit.
validation_surfaces:
  - python3 scripts/pm-landing-check.py --base origin/main
  - python3 scripts/pm-landing-check.py --record-baseline
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
  - Plans/Decision_Log.md#DL-067
  - Plans/Bootstrap_Planning_Migration.md#BPM-005
preserved_exact_tokens:
  - run_gates
  - audit_governance
  - migration_snapshot
  - migration_validate
  - "git merge --ff-only"
  - AGENTS.md
  - .claude/CLAUDE.md
  - scripts/pm-landing-check.py
  - reports/landing-checks/baseline.json
  - "--record-baseline"
negative_constraints:
  - Do not run the four repository-wide operations inside a per-plan seal in order to satisfy this rule.
  - Do not land a branch whose own files fail a repository-wide gate.
  - Do not repair or commit another thread's files to make a repository-wide gate pass at landing.
  - Do not treat the nightly run as a substitute for the landing run, or the landing run as a substitute for the nightly one.
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
