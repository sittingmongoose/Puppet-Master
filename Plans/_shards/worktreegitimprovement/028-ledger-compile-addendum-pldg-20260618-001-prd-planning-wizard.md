# Shard 028: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/WorktreeGitImprovement.md`

Source lines: L4962-L5057

Source SHA256: `0c41a6b37023f7b438a2774a46c1a88eae020bb5f9d3ff1284fa4ad8d521185d`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### W-073 - Planning Greenfield, Worktree Boundary, And Source-Control Receipts

```yaml
plan_unit_id: W-073
unit_type: requirement
status: accepted
owner_doc: Plans/WorktreeGitImprovement.md
canonical_text: 'After the user selects or provides a project, Planning Wizard may automatically inspect local or remote paths, repository presence, current branch, remotes, status, file tree, package managers, frameworks, configuration, architecture signals, and test commands without mutation. Clone, fork, repository creation, git init, remote changes, branch checkout or creation, worktree creation, commit, push, PR creation, stash, discard, reset, and protected-branch operations require the applicable permission policy and durable receipts. Planning Wizard records repository context and may perform explicitly authorized project setup, but implementation worktree allocation, mutation preparation, and execution safe points belong to Executor provisioning after Plan Compile. For greenfield work, Planning Wizard can create a directory, initialize Git, select an initial branch, create an empty or baseline initialization commit, and optionally connect
  or create a GitHub repository when explicitly authorized. Existing uncommitted user changes are preserved and inventoried; Puppet Master must not silently commit, stash, discard, reset, overwrite, or mingle with them and must create evidence-backed isolation or block unsafe mutation. Contribution PR mode records upstream and fork identities, base and head branches, contribution policy, compatibility expectations, required checks, commit policy, and optional PR delivery without conflating those with implementation truth. Testing-tool installation and configuration writes use FileSafe/source-control safe points, bounded write surfaces, receipts, revalidation, and rollback so discovery cannot damage the user''s project or environment.'
gui_related: false
gui_classification_reason: Backend, planning, contract, governance, or workflow behavior rather than visual presentation.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
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
- Do not create implementation worktrees or execution safe points as an implicit Planning Wizard side effect.
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
