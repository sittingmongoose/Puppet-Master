# Shard 015: Runtime Mode / Blocked Recovery Addendum (2026-03-09)

Source: `Plans/Run_Modes.md`

Source lines: L634-L659

Source SHA256: `071b010d6cb5f9ff7238c27f263154cbc0f1c658f3673bd6d05ae9990c0148fc`

---

## Runtime Mode / Blocked Recovery Addendum (2026-03-09)

Execution mode affects which recovery actions can be taken immediately, but mode does not redefine the underlying classification.

### Mode rules

#### Worktree invariant across modes

All assistant chat modes (Ask, Agent, Plan, Deep Plan, Debug) operate within the active thread's worktree when one is bound:
- Ask mode: reads files from worktree
- Agent mode: edits files in worktree
- Plan/Deep Plan mode: executes plans in worktree context
- Debug mode: debug operations target worktree

Mode transitions do not change worktree binding — binding is a thread-level property, not a mode-level property.

Worktree commands (`cmd.chat.worktree.*`) are available in all modes, subject to their when-clauses. The worktree header button and dropdown menu are always visible regardless of current mode.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/Executor_Protocol.md, ContractName:Plans/UI_Command_Catalog.md

- interactive modes may present auth, approval, and clarification actions directly
- non-interactive/headless modes that cannot present a required action yield `blocked_reason_code = headless_ask_denied`
- a later mode change may satisfy the prerequisite and allow resume, but it does not rewrite the original blocked classification

### Safe-point rule
If policy requires rollback before rerun, changing mode alone is insufficient; the safe-point restore requirement still applies.
