## 12. Source Control handoff, compare, and review
### 12.1 File-tree Source Control strip and diff entrypoints
File Manager integrates with Source Control without stealing Git ownership.

Rules:
- the file-tree strip may expose compact repo state and pivots such as `Open in Source Control`, `Open diff`, and `Open compare`
- Git badges in the tree remain read-only indicators until the user enters Source Control or an explicit diff/review surface
- handoff to Source Control preserves `repo_id`, `worktree_id`, path, and compare origin when known
- File Manager does not become the owner of commit, branch, graph, stash, or worktree management

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/FinalGUISpec.md, ContractName:Plans/storage-plan.md

### 12.2 Compare-target defaults
Default compare targets depend on where the user entered diff/review.

| Origin | Default compare target |
|---|---|
| unstaged list | `index <-> working tree` |
| staged list | `HEAD <-> index` |
| untracked file | `empty <-> working tree` |
| commit history | `selected commit <-> first parent` |
| conflicted file | `base`, `ours`, `theirs`, `result` |

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/Wiring_Matrix.md

### 12.3 Hunk actions, conflict review, and diff-local search
Fine-grained Git review remains Source Control owned.

Rules:
- hunk stage/unstage/discard actions remain Git mutations rather than editor undo
- conflicted files open a conflict review surface with explicit `base`, `ours`, `theirs`, and `result` context
- conflict resolution buttons write structured edits into the result buffer and remain undoable until final stage/mark-resolved
- diff-local search belongs to the diff/review surface and does not route through project Search

ContractRef: ContractName:Plans/GitHub_Integration.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md

### 12.4 Change-marker ownership and revert boundaries
Editor, Source Control, and Chat have distinct but connected restore/review responsibilities.

Rules:
- editor gutter and scrollbar overview own persistent change markers and review heat maps
- Chat is preview/audit/restore-entrypoint only; it does not own hunk actions or persistent marker classes
- `cmd.chat.revert` restores file mutations for one assistant turn; omitted `target_message_id` resolves to the latest assistant turn with persisted file mutations in the active thread
- `cmd.chat.rewind` remains conversation-history rewind only and must not silently stand in for file restore

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FileSafe.md

