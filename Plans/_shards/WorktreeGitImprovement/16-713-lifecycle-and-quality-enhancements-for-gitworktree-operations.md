## 7.13 Lifecycle and Quality Enhancements for Git/Worktree Operations

Git/worktree lifecycle and quality features must align with the current child-run, crew, and blocked-state canon.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Permissions_System.md

Required rules:
- reuse canonical child-run and crew events rather than inventing separate active-agent lifecycle files.
- blocked payloads use canonical `blocked_reason_code` plus ordered `allowed_action_ids[]`.
- cleanup, reroute, and retry behavior must preserve child lineage and worktree ownership fields.
- quality and handoff metadata belong in canonical event/storage structures rather than memory-manager files.

Cross-session continuity for git/worktree behavior comes from canonical state and handoff reconstruction, not from child-memory files.

ContractRef: ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/Prompt_Pipeline.md
