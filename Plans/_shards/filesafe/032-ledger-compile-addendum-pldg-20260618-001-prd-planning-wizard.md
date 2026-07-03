# Shard 032: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/FileSafe.md`

Source lines: L13086-L13199

Source SHA256: `a185b2e6e46438574d986a2ac598729ef9751e85d3b0d737daf728434bf3f6f6`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### F2-190 - Planning Source-Control Safety, Non-Git Coverage, And Dirty-State Preservation

```yaml
plan_unit_id: F2-190
unit_type: requirement
status: accepted
owner_doc: Plans/FileSafe.md
canonical_text: 'PRD Builder preserves original uploaded artifacts byte-for-byte with stable source IDs, hashes, MIME/type metadata, and extraction status before semantic processing. Project context supports greenfield, existing local project, existing Git repository, remote SSH project, and fork or external upstream contexts, with explicit repository and host facts. After the user selects or provides a project, Planning Wizard may automatically inspect local or remote paths, repository presence, current branch, remotes, status, file tree, package managers, frameworks, configuration, architecture signals, and test commands without mutation. Planning Wizard records repository context and may perform explicitly authorized project setup, but implementation worktree allocation, mutation preparation, and execution safe points belong to Executor provisioning after Plan Compile. A non-Git project may remain non-Git; FileSafe provides safe-point
  and rollback coverage, while mutating work is serialized unless a future non-Git workspace-isolation adapter provides proven concurrent write isolation. Existing uncommitted user changes are preserved and inventoried; Puppet Master must not silently commit, stash, discard, reset, overwrite, or mingle with them and must create evidence-backed isolation or block unsafe mutation. For an SSH project, discovery, FileSafe, Git, worktrees, commands, testing, path authority, safe points, and execution occur on the remote host through the authorized adapter, with no silent local fallback. Plan Compile and Executor provisioning must compare live repository and environment state against the approved snapshot and route stale facts through bounded re-analysis or recompile rather than executing against invalid assumptions. Testing-tool installation and configuration writes use FileSafe/source-control safe points, bounded write surfaces, receipts, revalidation,
  and rollback so discovery cannot damage the user''s project or environment.'
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
- Plans/FileSafe.md
- Plans/PRD_Builder.md
- Plans/Project_Output_Artifacts.md
- Plans/Planning_Wizard.md
- Plans/GitHub_Integration.md
- Plans/WorktreeGitImprovement.md
- Plans/Executor_Protocol.md
- Plans/Permissions_System.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Automated_Testing_System.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0030
- pldg-20260618-001-prd-planning-wizard:atom-0044
- pldg-20260618-001-prd-planning-wizard:atom-0067
- pldg-20260618-001-prd-planning-wizard:atom-0071
- pldg-20260618-001-prd-planning-wizard:atom-0073
- pldg-20260618-001-prd-planning-wizard:atom-0074
- pldg-20260618-001-prd-planning-wizard:atom-0075
- pldg-20260618-001-prd-planning-wizard:atom-0078
- pldg-20260618-001-prd-planning-wizard:atom-0088
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/02-prd-builder.md#SRC-PRD
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/04-project-context-and-source-control.md#SRC-PROJECT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
source_atom_ids:
- atom-0030
- atom-0044
- atom-0067
- atom-0071
- atom-0073
- atom-0074
- atom-0075
- atom-0078
- atom-0088
decision_refs:
- dec-0009
- dec-0014
- dec-0015
- dec-0017
correction_refs: []
preserved_exact_tokens:
- byte-for-byte
- source IDs
- hashes
- greenfield
- existing local project
- existing Git repository
- remote SSH
- fork or external upstream
- read-only project discovery
- git status
- current branch
- Executor provisioning
- implementation worktree
- non-Git
- FileSafe
- serialized mutations
- dirty repository
- uncommitted user changes
- remote host
- no silent local fallback
- revalidate
- stale facts
- safe point
- rollback
negative_constraints:
- Do not create implementation worktrees or execution safe points as an implicit Planning Wizard side effect.
- Do not force Git adoption merely to use Puppet Master.
- Never silently commit, stash, discard, reset, or overwrite user changes.
- Do not run against an unrelated local copy when remote context is active.
owner_hints:
- Plans/PRD_Builder.md
- Plans/Project_Output_Artifacts.md
- Plans/FileSafe.md
- Plans/Planning_Wizard.md
- Plans/GitHub_Integration.md
- Plans/WorktreeGitImprovement.md
- Plans/Executor_Protocol.md
- Plans/Permissions_System.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Automated_Testing_System.md
```
