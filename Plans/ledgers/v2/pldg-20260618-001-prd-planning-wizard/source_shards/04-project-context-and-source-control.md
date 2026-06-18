# Project Context, FileSafe, Git, Worktree, GitHub, and SSH

## SRC-PROJECT

Planning can begin for a greenfield project, existing local project, existing Git repository, remote SSH project, or fork/upstream contribution. Work intent is modeled separately so feature, refactor, bugfix, new product, and PR delivery can overlap.

Read-only discovery is automated after project selection. Mutating repository/setup actions require authority and receipts. Planning Wizard may prepare explicitly authorized context, but implementation worktrees and safe points belong to Executor provisioning. GitHub is optional. Non-Git projects remain supported through FileSafe. Dirty user state is never silently committed, stashed, reset, discarded, or overwritten. Remote projects remain remote.

## Accepted obligation inventory

### atom-0044: Support project-context modes

Project context supports greenfield, existing local project, existing Git repository, remote SSH project, and fork or external upstream contexts, with explicit repository and host facts.

- atom_type: `requirement`
- lane: `planning_run`
- gui_related: `false`
- exact_tokens: ["greenfield", "existing local project", "existing Git repository", "remote SSH", "fork or external upstream"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/FileSafe.md", "Plans/GitHub_Integration.md"]

### atom-0045: Support work-intent modes

Work intent supports new product, feature or enhancement, refactor or rewrite, bugfix or bounded task, and contribution PR, and may include more than one compatible delivery intent.

- atom_type: `requirement`
- lane: `planning_run`
- gui_related: `false`
- exact_tokens: ["new product", "feature or enhancement", "refactor or rewrite", "bugfix", "contribution PR"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md"]

### atom-0067: Automate read-only project and repository discovery

After the user selects or provides a project, Planning Wizard may automatically inspect local or remote paths, repository presence, current branch, remotes, status, file tree, package managers, frameworks, configuration, architecture signals, and test commands without mutation.

- atom_type: `requirement`
- lane: `project_context`
- gui_related: `false`
- exact_tokens: ["read-only project discovery", "git status", "current branch"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/FileSafe.md", "Plans/WorktreeGitImprovement.md"]

### atom-0068: Support local path, Git remote, GitHub, and SSH attachment

Planning intake can attach an existing local directory, Git repository, optional GitHub repository, or remote SSH host and project root, recording host, path, repository identity, currentness, and permissions.

- atom_type: `requirement`
- lane: `project_context`
- gui_related: `true`
- exact_tokens: ["local path", "Git repository", "GitHub", "SSH"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/GitHub_Integration.md", "Plans/FileSafe.md", "Plans/Permissions_System.md"]

### atom-0069: Treat GitHub as optional collaboration infrastructure

GitHub is optional for repository creation, fork, push, and PR workflows; local or remote Git and FileSafe remain valid without GitHub credentials, and repository/worktree state is execution truth.

- atom_type: `requirement`
- lane: `project_context`
- gui_related: `false`
- exact_tokens: ["GitHub optional", "execution truth"]
- negative_constraints: ["Do not block local-only planning or build completion solely because GitHub is unavailable."]
- owner_hints: ["Plans/GitHub_Integration.md", "Plans/GitHub_API_Auth_and_Flows.md", "Plans/Planning_Wizard.md"]

### atom-0070: Require authority and receipts for mutating setup

Clone, fork, repository creation, git init, remote changes, branch checkout or creation, worktree creation, commit, push, PR creation, stash, discard, reset, and protected-branch operations require the applicable permission policy and durable receipts.

- atom_type: `requirement`
- lane: `project_authority`
- gui_related: `false`
- exact_tokens: ["authority", "receipt", "git init", "push", "PR creation"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Permissions_System.md", "Plans/GitHub_Integration.md", "Plans/WorktreeGitImprovement.md"]

### atom-0071: Planning Wizard does not own implementation worktrees

Planning Wizard records repository context and may perform explicitly authorized project setup, but implementation worktree allocation, mutation preparation, and execution safe points belong to Executor provisioning after Plan Compile.

- atom_type: `requirement`
- lane: `project_authority`
- gui_related: `false`
- exact_tokens: ["Executor provisioning", "implementation worktree"]
- negative_constraints: ["Do not create implementation worktrees or execution safe points as an implicit Planning Wizard side effect."]
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Executor_Protocol.md", "Plans/WorktreeGitImprovement.md", "Plans/FileSafe.md"]

### atom-0072: Support authorized greenfield repository initialization

For greenfield work, Planning Wizard can create a directory, initialize Git, select an initial branch, create an empty or baseline initialization commit, and optionally connect or create a GitHub repository when explicitly authorized.

- atom_type: `requirement`
- lane: `greenfield`
- gui_related: `false`
- exact_tokens: ["greenfield", "git init", "baseline initialization commit"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/WorktreeGitImprovement.md", "Plans/GitHub_Integration.md"]

### atom-0073: Support non-Git projects through FileSafe

A non-Git project may remain non-Git; FileSafe provides safe-point and rollback coverage, while mutating work is serialized unless a future non-Git workspace-isolation adapter provides proven concurrent write isolation.

- atom_type: `requirement`
- lane: `non_git`
- gui_related: `false`
- exact_tokens: ["non-Git", "FileSafe", "serialized mutations"]
- negative_constraints: ["Do not force Git adoption merely to use Puppet Master."]
- owner_hints: ["Plans/FileSafe.md", "Plans/Executor_Protocol.md", "Plans/Planning_Wizard.md"]

### atom-0074: Never silently alter a dirty repository

Existing uncommitted user changes are preserved and inventoried; Puppet Master must not silently commit, stash, discard, reset, overwrite, or mingle with them and must create evidence-backed isolation or block unsafe mutation.

- atom_type: `negative_constraint`
- lane: `dirty_repo`
- gui_related: `false`
- exact_tokens: ["dirty repository", "uncommitted user changes"]
- negative_constraints: ["Never silently commit, stash, discard, reset, or overwrite user changes."]
- owner_hints: ["Plans/FileSafe.md", "Plans/WorktreeGitImprovement.md", "Plans/Executor_Protocol.md", "Plans/Planning_Wizard.md"]

### atom-0075: Remote SSH execution remains remote

For an SSH project, discovery, FileSafe, Git, worktrees, commands, testing, path authority, safe points, and execution occur on the remote host through the authorized adapter, with no silent local fallback.

- atom_type: `requirement`
- lane: `remote_ssh`
- gui_related: `false`
- exact_tokens: ["remote host", "no silent local fallback"]
- negative_constraints: ["Do not run against an unrelated local copy when remote context is active."]
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/FileSafe.md", "Plans/Executor_Protocol.md", "Plans/Permissions_System.md"]

### atom-0076: Model fork, upstream, base, branch, and PR intent

Contribution PR mode records upstream and fork identities, base and head branches, contribution policy, compatibility expectations, required checks, commit policy, and optional PR delivery without conflating those with implementation truth.

- atom_type: `requirement`
- lane: `contribution_pr`
- gui_related: `false`
- exact_tokens: ["upstream", "fork", "base branch", "head branch", "PR"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/GitHub_Integration.md", "Plans/WorktreeGitImprovement.md"]

### atom-0077: Snapshot project context for approval and compile

The Approved Plan Pack carries a hash-addressed project-context snapshot containing repository identity, host, path, branch, remotes, dirty state, codebase scan facts, test-capability facts, and currentness conditions.

- atom_type: `requirement`
- lane: `currentness`
- gui_related: `false`
- exact_tokens: ["project-context snapshot", "currentness"]
- negative_constraints: []
- owner_hints: ["Plans/Planning_Wizard.md", "Plans/Contracts_V0.md", "Plans/Plan_To_Node_Compilation.md"]

### atom-0078: Revalidate repository context before mutation

Plan Compile and Executor provisioning must compare live repository and environment state against the approved snapshot and route stale facts through bounded re-analysis or recompile rather than executing against invalid assumptions.

- atom_type: `requirement`
- lane: `currentness`
- gui_related: `false`
- exact_tokens: ["revalidate", "stale facts"]
- negative_constraints: []
- owner_hints: ["Plans/Plan_To_Node_Compilation.md", "Plans/Executor_Protocol.md", "Plans/FileSafe.md"]

### atom-0079: Never place secret values in planning or compile artifacts

Planning, PRD, Plan Pack, WorkNodeRequest, receipts, logs, and UI projections may identify required secret classes or permission scopes but must carry references or ephemeral handles rather than secret values.

- atom_type: `negative_constraint`
- lane: `secrets`
- gui_related: `false`
- exact_tokens: ["secret reference", "ephemeral handle"]
- negative_constraints: ["Do not persist credentials or secret values in ledgers, Plans, compile artifacts, receipts, logs, or Orchestrator projections."]
- owner_hints: ["Plans/Permissions_System.md", "Plans/Planning_Wizard.md", "Plans/Plan_To_Node_Compilation.md", "Plans/Executor_Protocol.md"]
