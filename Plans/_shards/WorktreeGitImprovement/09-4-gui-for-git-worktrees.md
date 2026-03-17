## 4. GUI for Git & Worktrees

Source Control and Orchestrator have a deliberate split.

Source Control is:
- compact
- worktree-first
- Git-native

Orchestrator is:
- lane/package/seam operational
- history/lineage focused
- concern/recovery/governance aware

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/FinalGUISpec.md

Rules:
- Source Control rows are concrete worktrees, branches, and paths
- package, lane, and run context appear as attached metadata in Source Control rather than as the primary grouping axis
- Orchestrator does not duplicate a raw worktree inventory
- lane identity survives after a live worktree is archived or removed
- cleanup posture belongs to Orchestrator; archive/prune/remove execution belongs to Source Control

ContractRef: ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md, ContractName:Plans/FileManager.md
