# Shard 029: Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

Source: `Plans/Permissions_System.md`

Source lines: L7757-L7864

Source SHA256: `9aaebb4076398655d3e72ea34024342ef2d315b82a167c3390e6a3d78fb4f205`

---

## Ledger Compile Addendum - pldg-20260618-001-prd-planning-wizard

This addendum compiles source-lineage obligations from bootstrap ledger `pldg-20260618-001-prd-planning-wizard` into this existing owner or consumer doc. It does not create WorkNodes, NodeSeeds, executable queues, GoalRuns, implementation files, generated governance artifacts, or production build tasks.

### PS-117 - Planning Setup Authority, Remote Context, Secrets, And Testing Permissions

```yaml
plan_unit_id: PS-117
unit_type: requirement
status: accepted
owner_doc: Plans/Permissions_System.md
canonical_text: 'Planning intake can attach an existing local directory, Git repository, optional GitHub repository, or remote SSH host and project root, recording host, path, repository identity, currentness, and permissions. Clone, fork, repository creation, git init, remote changes, branch checkout or creation, worktree creation, commit, push, PR creation, stash, discard, reset, and protected-branch operations require the applicable permission policy and durable receipts. For an SSH project, discovery, FileSafe, Git, worktrees, commands, testing, path authority, safe points, and execution occur on the remote host through the authorized adapter, with no silent local fallback. Planning, PRD, Plan Pack, WorkNodeRequest, receipts, logs, and UI projections may identify required secret classes or permission scopes but must carry references or ephemeral handles rather than secret values. Test Capability Discovery searches current official
  and primary sources for appropriate live testing, hot reload, live preview, browser automation, GUI automation, simulator, emulator, device, cloud, accessibility, performance, security, and project-native testing methods relevant to the technology stack. Global or privileged installation, paid services, license acceptance, account creation, credential use, device enrollment, or material external effects require applicable authority and may become a typed blocker rather than an unsafe silent install. Visible testing, screenshots, video, logs, console, network traces, and artifacts apply secret and sensitive-data redaction before display or persistence.'
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
risk_class: stale_or_forbidden_behavior
reasoning_tier: high
context_scope: ledger_to_plans_compile
implementation_surfaces:
- Plans/Permissions_System.md
- Plans/Planning_Wizard.md
- Plans/GitHub_Integration.md
- Plans/FileSafe.md
- Plans/WorktreeGitImprovement.md
- Plans/Executor_Protocol.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Automated_Testing_System.md
- Plans/Tools.md
- Plans/human-in-the-loop.md
- Plans/Runtime_Artifacts_Panel.md
node_compile_hint:
  mode: canonical_planunit_from_bootstrap_ledger
  create_worknodes: false
  create_nodeseeds: false
source_lineage:
- pldg-20260618-001-prd-planning-wizard:atom-0068
- pldg-20260618-001-prd-planning-wizard:atom-0070
- pldg-20260618-001-prd-planning-wizard:atom-0075
- pldg-20260618-001-prd-planning-wizard:atom-0079
- pldg-20260618-001-prd-planning-wizard:atom-0084
- pldg-20260618-001-prd-planning-wizard:atom-0087
- pldg-20260618-001-prd-planning-wizard:atom-0097
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/04-project-context-and-source-control.md#SRC-PROJECT
- Plans/ledgers/v2/pldg-20260618-001-prd-planning-wizard/source_shards/05-testing-and-visible-verification.md#SRC-TESTING
source_atom_ids:
- atom-0068
- atom-0070
- atom-0075
- atom-0079
- atom-0084
- atom-0087
- atom-0097
decision_refs:
- dec-0014
- dec-0015
- dec-0017
- dec-0019
correction_refs:
- corr-0013
preserved_exact_tokens:
- local path
- Git repository
- GitHub
- SSH
- authority
- receipt
- git init
- push
- PR creation
- remote host
- no silent local fallback
- secret reference
- ephemeral handle
- official sources
- live testing
- hot reload
- live preview
- privileged installation
- paid service
- license acceptance
- redaction
negative_constraints:
- Do not run against an unrelated local copy when remote context is active.
- Do not persist credentials or secret values in ledgers, Plans, compile artifacts, receipts, logs, or Orchestrator projections.
- Do not rely solely on stale internal model knowledge for current tools, versions, setup methods, or platform availability.
- Do not expose credentials, tokens, personal data, or protected project content through visible testing.
owner_hints:
- Plans/Planning_Wizard.md
- Plans/GitHub_Integration.md
- Plans/FileSafe.md
- Plans/Permissions_System.md
- Plans/WorktreeGitImprovement.md
- Plans/Executor_Protocol.md
- Plans/Plan_To_Node_Compilation.md
- Plans/Automated_Testing_System.md
- Plans/Tools.md
- Plans/human-in-the-loop.md
- Plans/Runtime_Artifacts_Panel.md
```
