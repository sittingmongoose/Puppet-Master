## 7.12 Crews and Subagent Communication Enhancements for Git/Worktree Operations

Git and worktree coordination must use the reconciled PM crew model rather than ad hoc crew-memory or side-file canon.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md

Required rules:
- git/worktree coordination crews are optional overlays, not separate persistent actor systems.
- crew members remain child runs.
- crew coordination uses explicit shared crew state and crew-board messages when enabled.
- `.puppet-master/memory/*` is not canonical crew coordination state.
- `active-agents.json` is not canonical git/worktree coordination state.

If git/worktree coordination is needed:
- store canonical lineage, ownership, and conflict state in seglog/redb projections.
- treat longer-lived crew identity as explicit shared state, not hidden child memory.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/FileSafe.md
