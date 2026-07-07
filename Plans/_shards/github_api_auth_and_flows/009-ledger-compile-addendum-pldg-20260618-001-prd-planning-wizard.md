# Shard 009: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/GitHub_API_Auth_and_Flows.md`

Source lines: L820-L882

Source SHA256: `bb36d0e03f358c2b87d6c8b91d33f7da5f62c36c45524c34dedaff8146caffd4`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### GAAAF-013 - GitHub Auth Consumers For Optional Planning Context

```yaml
plan_unit_id: GAAAF-013
unit_type: requirement
status: accepted
owner_doc: Plans/GitHub_API_Auth_and_Flows.md
canonical_text: 'GitHub is optional for repository creation, fork, push, and PR workflows; local or remote Git and FileSafe remain valid without GitHub credentials, and repository/worktree state is execution truth. For an SSH project, discovery, FileSafe, Git, worktrees, commands, testing, path authority, safe points, and execution occur on the remote host through the authorized adapter, with no silent local fallback.'
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
risk_class: owner_drift
reasoning_tier: standard
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/GitHub_API_Auth_and_Flows.md
- Plans/GitHub_Integration.md
- Plans/Planning_Wizard.md
- Plans/FileSafe.md
- Plans/Executor_Protocol.md
- Plans/Permissions_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0069
- pldg-20260618-001-prd-planning-wizard:atom-0075
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/04-project-context-and-source-control.md#SRC-PROJECT
source_atom_ids:
- atom-0069
- atom-0075
decision_refs:
- dec-0015
correction_refs: []
preserved_exact_tokens:
- GitHub optional
- execution truth
- remote host
- no silent local fallback
negative_constraints:
- Do not block local-only planning or build completion solely because GitHub is unavailable.
- Do not run against an unrelated local copy when remote context is active.
owner_hints:
- Plans/GitHub_Integration.md
- Plans/GitHub_API_Auth_and_Flows.md
- Plans/Planning_Wizard.md
- Plans/FileSafe.md
- Plans/Executor_Protocol.md
- Plans/Permissions_System.md
```
