## FileSafe Action Mapping and Persistence

FileSafe outcomes must align with the shared runtime blocked taxonomy and the child-run storage model.

ContractRef: ContractName:Plans/Permissions_System.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md

Required rules:
- runtime-facing FileSafe blocks use canonical `blocked_reason_code` plus ordered `allowed_action_ids[]`.
- `recovery_options[]` and `allowed_actions[]` are not canonical shared runtime fields.
- child runs blocked by FileSafe remain child runs with canonical lineage and status history.
- rerun and restore behavior must preserve canonical child/run/worktree identities.

Context-shaping and handoff rule:
- FileSafe does not define alternate child continuity or alternate memory behavior.
- any rerun or restore after FileSafe denial uses canonical handoff reconstruction.

ContractRef: ContractName:Plans/Prompt_Pipeline.md, ContractName:Plans/assistant-memory-subsystem.md, ContractName:Plans/orchestrator-subagent-integration.md
