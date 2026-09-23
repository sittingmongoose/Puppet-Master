# Shard 037: Worktrees in Assistant

Source: `Plans/assistant-chat-design.md`

Source lines: L2759-L2771

Source SHA256: `8b1cfe27bc861b853c0ed88c516e1c48a955074f926bcebded388e88f1a31e45`

---

## Worktrees in Assistant

This section specifies the W.1-W.17 thread-level worktree binding feature: a per-thread worktree button in the chat header, worktree icon in the thread selector, merge-back flow, pre-merge test gate, and all associated lifecycle, data model, events, commands, settings, and error handling.

ContractRef: ContractName:Plans/WorktreeGitImprovement.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Executor_Protocol.md

### W.0 Source Control consumer state

Assistant chat deep-links into Source Control without owning its accordion layout. Per-project Source Control section open/close (`/close`) state persists at `config:project:{pid}:source_control.accordion_state` as:

```json
{ "Changes": true, "Worktrees": false, "Branches/Stash": false, "History": false, "Graph": false }
```
