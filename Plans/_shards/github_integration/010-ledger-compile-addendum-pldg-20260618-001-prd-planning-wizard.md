# Shard 010: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/GitHub_Integration.md`

Source lines: L1856-L1945

Source SHA256: `ca98a6f62948a97779ea383dd564964b485e8863072dd42e40730cc7ccccbfa9`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### GI-032 - Optional GitHub, Repository Attachment, And Contribution PR Context

```yaml
plan_unit_id: GI-032
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_Integration.md
canonical_text: 'Project context supports greenfield, existing local project, existing Git repository, remote SSH project, and fork or external upstream contexts, with explicit repository and host facts. Planning intake can attach an existing local directory, Git repository, optional GitHub repository, or remote SSH host and project root, recording host, path, repository identity, currentness, and permissions. GitHub is optional for repository creation, fork, push, and PR workflows; local or remote Git and FileSafe remain valid without GitHub credentials, and repository/worktree state is execution truth. Clone, fork, repository creation, git init, remote changes, branch checkout or creation, worktree creation, commit, push, PR creation, stash, discard, reset, and protected-branch operations require the applicable permission policy and durable receipts. For greenfield work, Planning Wizard can create a directory, initialize Git, select
  an initial branch, create an empty or baseline initialization commit, and optionally connect or create a GitHub repository when explicitly authorized. Contribution PR mode records upstream and fork identities, base and head branches, contribution policy, compatibility expectations, required checks, commit policy, and optional PR delivery without conflating those with implementation truth.'
gui_related: true
gui_classification_reason: Includes user-visible GUI/workspace/command/projection behavior.
depends_on: []
unblocks: []
acceptance_criteria:
- The live owner doc preserves every source atom listed in source_atom_ids without treating the ledger as canonical product prose.
- Exact tokens, negative constraints, owner hints, and accepted corrections remain available to future audits through this PlanUnit.
- No WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks are created by this compile.
validation_surfaces:
- python3 scripts/pm-plan-index.py validate
- python3 scripts/pm-bootstrap-ledger-validate.py Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard
risk_class: owner_drift
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/GitHub_Integration.md
- Plans/Planning_Wizard.md
- Plans/FileSafe.md
- Plans/Permissions_System.md
- Plans/GitHub_API_Auth_and_Flows.md
- Plans/WorktreeGitImprovement.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0044
- pldg-20260618-001-prd-planning-wizard:atom-0068
- pldg-20260618-001-prd-planning-wizard:atom-0069
- pldg-20260618-001-prd-planning-wizard:atom-0070
- pldg-20260618-001-prd-planning-wizard:atom-0072
- pldg-20260618-001-prd-planning-wizard:atom-0076
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/04-project-context-and-source-control.md#SRC-PROJECT
source_atom_ids:
- atom-0044
- atom-0068
- atom-0069
- atom-0070
- atom-0072
- atom-0076
decision_refs:
- dec-0015
- dec-0014
correction_refs: []
preserved_exact_tokens:
- greenfield
- existing local project
- existing Git repository
- remote SSH
- fork or external upstream
- local path
- Git repository
- GitHub
- SSH
- GitHub optional
- execution truth
- authority
- receipt
- git init
- push
- PR creation
- baseline initialization commit
- upstream
- fork
- base branch
- head branch
- PR
negative_constraints:
- Do not block local-only planning or build completion solely because GitHub is unavailable.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/FileSafe.md
- Plans/GitHub_Integration.md
- Plans/Permissions_System.md
- Plans/GitHub_API_Auth_and_Flows.md
- Plans/WorktreeGitImprovement.md
```
