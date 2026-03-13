## 13. Git Status Integration

File Manager integrates with Source Control, not with a legacy combined Git panel.

### 13.1 Git status overlay in file tree

The file tree may show Git status badges, but those badges are read-only indicators unless the user opens Source Control or a file diff.

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md

### 13.2 Source Control strip

The file-tree header or strip may expose compact repo state, but its primary action targets are:
- `Open in Source Control`
- `Open diff`
- `Open compare`

It must not claim ownership of commit, history, graph, or worktree management.

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/WorktreeGitImprovement.md

### 13.3 Repo-aware filtering and worktree context

When multiple worktrees or repo roots are relevant:
- the file tree must show which repo/worktree is active
- file-status overlays must resolve against that active repo/worktree
- any handoff to Source Control must preserve `repo_id` and `worktree_id`

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Orchestrator_Page.md

