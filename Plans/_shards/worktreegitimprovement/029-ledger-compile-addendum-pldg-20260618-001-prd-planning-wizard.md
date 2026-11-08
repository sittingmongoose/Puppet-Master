# Shard 029: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L5104-L5235

Source SHA256: `b3597b48c672b6b129bd99fcc15fc655cbac22b2f0681eb4c91447632457245d`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### W-073 - Planning Greenfield, Worktree Boundary, And Source-Control Receipts

```yaml
plan_unit_id: W-073
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: After the user selects or provides a project, Planning Wizard may automatically inspect
  local or remote paths, repository presence, current branch, remotes, status, file tree, package managers,
  frameworks, configuration, architecture signals, and test commands without mutation. Clone, fork, repository
  creation, git init, remote changes, branch checkout or creation, worktree creation, commit, push, PR
  creation, stash, discard, reset, and protected-branch operations require the applicable permission policy
  and durable receipts. Planning Wizard records repository context and may perform explicitly authorized
  project setup, but implementation worktree allocation, mutation preparation, and execution safe points
  belong to Executor provisioning after Plan Compile. For greenfield work, Planning Wizard can create
  a directory, initialize Git, select an initial branch, create an empty or baseline initialization commit,
  and optionally connect or create a GitHub repository when explicitly authorized. Existing uncommitted
  user changes are preserved and inventoried; Puppet Master must not silently commit, stash, discard,
  reset, overwrite, or mingle with them and must create evidence-backed isolation or block unsafe mutation.
  Contribution PR mode records upstream and fork identities, base and head branches, contribution policy,
  compatibility expectations, required checks, commit policy, and optional PR delivery without conflating
  those with implementation truth. Testing-tool installation and configuration writes use FileSafe/source-control
  safe points, bounded write surfaces, receipts, revalidation, and rollback so discovery cannot damage
  the user's project or environment. Project-owned Starter file sets and Saved setups remain different
  sources; manager copying is only owner subtransactions. FGI-024 contribution uses exact original/fork
  and head/base bindings, the captured original fetched revision, chosen native fork workspace and explicit
  reconciliation strategy. Separate branch/change is the default; direct main is an explicit alternative
  under normal protection. The selected owner route remains cmd.source_control.remote.sync through handlers::source_control::remote_sync
  and catalog.source_control_remote_sync. Plans/source_control_contracts.schema.json selects source_control_command_request_v2/source_control_command_result_v2
  and the closed remote_operation_target_v2 union. kind=remote_effect retains its exact historical v1
  target; kind=local_reconcile_only uses remote_sync_local_reconcile_target_v2 with the captured original/fork/head/base
  repositories, fetched original revision and fetch receipt, exact native fork workspace/revision, resolved
  reconciliation_strategy policy/ref/hash, current preview, permission/FileSafe/Stop and writer generations.
  Require push_targets=[] and publish_performed=false; publication remains a separately admitted cmd.source_control.remote.publish
  action. Refuse stale identities, unsupported strategy/backend or absent source/native proof. No magic
  fork-sync command, path/focus/remote-name inference, synthetic app Project or Git fallback from unavailable
  JJ is admitted.
gui_related: false
gui_classification_reason: Backend, planning, contract, governance, or workflow behavior rather than visual
  presentation.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger
  as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future
  audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts,
  or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: stale_or_forbidden_behavior
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/WorktreeGitImprovement.md
- Plans/Planning_Wizard.md
- Plans/FileSafe.md
- Plans/Permissions_System.md
- Plans/GitHub_Integration.md
- Plans/Executor_Protocol.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0067
- pldg-20260618-001-prd-planning-wizard:atom-0070
- pldg-20260618-001-prd-planning-wizard:atom-0071
- pldg-20260618-001-prd-planning-wizard:atom-0072
- pldg-20260618-001-prd-planning-wizard:atom-0074
- pldg-20260618-001-prd-planning-wizard:atom-0076
- pldg-20260618-001-prd-planning-wizard:atom-0088
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/04-project-context-and-source-control.md#SRC-PROJECT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
- projects-refresh-20261030/pass2/PLANS-EDIT-PLAN.md#lane-b; E-B01; P2/P3/P6; S8–S11; N25
- 'Jared, 2026-11-03: "I approve the outstanding questions with their recommended settings."'
- projects-refresh-20261030/pass2/plans-edit-requests/Fb-requests.md#Fb-E01
source_atom_ids:
- atom-0067
- atom-0070
- atom-0071
- atom-0072
- atom-0074
- atom-0076
- atom-0088
decision_refs:
- dec-0014
- dec-0015
- dec-0017
correction_refs: []
preserved_exact_tokens:
- read-only project discovery
- git status
- current branch
- authority
- receipt
- git init
- push
- PR creation
- Executor provisioning
- implementation worktree
- greenfield
- baseline initialization commit
- dirty repository
- uncommitted user changes
- upstream
- fork
- base branch
- head branch
- PR
- safe point
- rollback
negative_constraints:
- Do not create implementation worktrees or execution safe points as an implicit Planning Wizard side
  effect.
- Never silently commit, stash, discard, reset, or overwrite user changes.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/FileSafe.md
- Plans/WorktreeGitImprovement.md
- Plans/Permissions_System.md
- Plans/GitHub_Integration.md
- Plans/Executor_Protocol.md
- Plans/Automated_Testing_System.md
```
