## 10.5 Crews and Subagent Communication Enhancements for Cleanup Operations

Cleanup-operation crews, when used, must follow the current PM crew model.

ContractRef: ContractName:Plans/orchestrator-subagent-integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/assistant-memory-subsystem.md

Rules:
- cleanup crews are optional overlays, not a separate persistent actor system.
- cleanup crew members remain PM child runs.
- crew coordination uses explicit shared state and crew-board messages when enabled.
- hidden memory files and active-agent side files are not canonical cleanup coordination state.

ContractRef: ContractName:Plans/Contracts_V0.md, ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/WorktreeGitImprovement.md
