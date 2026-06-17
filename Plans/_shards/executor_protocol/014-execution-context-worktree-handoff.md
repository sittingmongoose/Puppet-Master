# Shard 014: Execution Context: Worktree Handoff

Source: `Plans/Executor_Protocol.md`

Source lines: L758-L842

Source SHA256: `334885065f8e4264f866eb13a4336ff4589318b9fb5a97d87e70767163be3710`

---

## Execution Context: Worktree Handoff

PM-native `Open With` stays inside the file/editor surface and carries the same worktree handoff context as other executor file operations. Any later OS handoff must be a separate explicit command such as `cmd.file.open_in_system_default`, so system-default launching does not dilute PM-native target selection, blocked/recovery semantics, or worktree-scoped file identity.


When Orchestrator or Assistant Chat creates an execution unit that should run inside a worktree, the execution context handoff includes worktree identity.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md

The execution context MUST include:
- `working_directory`: set to worktree root path (not project root) when worktree is bound
- `worktree_id`: identifier of the target worktree
- `worktree_branch`: branch name checked out in worktree
- `is_worktree`: bool flag distinguishing worktree context from main repo context

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md

**Caller responsibilities:**
- Orchestrator sets these fields when launching a DAE in a lane-owned worktree
- Assistant Chat sets these fields when the active thread has a bound worktree and the user runs agent-mode or plan-mode work
- If `is_worktree` is false or absent, execution defaults to project root

For Assistant Chat, turn-start resolves `thread_state:{thread_id}:worktree_binding`, populates `execution_unit_context.worktree_id` and `working_directory`, and freezes both values for that turn. Mid-turn unbind changes apply only to the next turn or rotated follow-up. The executor propagates the frozen `working_directory` to FileSafe checks, tool invocations, bash/shell `cwd`, MCP tools, `@file` resolution, auto-retrieval scope context, and provider CLI or DAE execution-context JSON payloads. This is a cwd-based execution contract; it does not require separate prompt-only worktree injection.

**Executor responsibilities:**
- File operations resolve relative to `working_directory`
- Git operations target the worktree, not the main repo
- Terminal sessions start in `working_directory`
- LSP root identity uses worktree path when `is_worktree` is true
- File mutation logs store absolute paths. If `cmd.chat.revert` targets an edit from a removed worktree, for example `/project/.puppet-master/worktrees/thread-abc/src/main.rs`, the executor reports `Cannot restore file: original path no longer exists. The worktree may have been removed.` and does not recreate missing directories.

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/LSPSupport.md, ContractName:Plans/Commands_System.md

ContractRef: Plans/Contracts_V0.md#6.1 Canonical blocked-episode approval anchor

Required fields:
- run_id
- node_id
- attempt_id
- lane_id
- package_id
- seam_id
- execution_role
- requested_account_id
- effective_account_id
- operational_identity
- blocked_sequence
- approval_scope_key

Canonical terms and values:
- execution_unit_context
- run_id
- node_id
- attempt_id
- lane_id
- package_id
- seam_id
- execution_role
- requested_account_id
- effective_account_id
- operational_identity
- blocked_sequence
- approval_scope_key

Labels:
- execution unit context
- blocked episode

Behavioral rules:
- Execution protocol must define runtime scope through execution-unit context rather than tier roots.
- Blocked-episode identity must remain explicit in execution-relevant recovery paths.

Permission carry-through:
- effective account, execution role, and blocked-episode approval scope must survive execution handoff
### Mode interaction

All assistant chat modes (Ask, Agent, Plan, Deep Plan, Debug) operate within the thread's worktree when one is bound:
- Ask mode: read-only context from worktree files
- Agent mode: file edits go to worktree
- Plan/Deep Plan mode: plans execute in worktree context
- Debug mode: debug operations target worktree

Mode transitions do not affect worktree binding — the binding is thread-level, not mode-level.

ContractRef: ContractName:Plans/Run_Modes.md, ContractName:Plans/assistant-chat-design.md
