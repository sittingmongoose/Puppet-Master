## 10. Editor navigation and semantic affordances
### 10.1 Breadcrumbs and outline

The breadcrumb bar at the top of each file panel follows the chain:

`file > symbol > block`

Each crumb is clickable and shows a dropdown (siblings at that depth).

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/FinalGUISpec.md

**Worktree toggle in breadcrumb:**

When the active chat thread has a bound worktree and `file_manager.worktree_follow_thread` is `true`:
- Breadcrumb prepends a worktree indicator crumb: `🌿 <branch_name> > file > symbol > block`
- The worktree crumb is a toggle: click to switch the file manager root between worktree path and project root
- Visual: muted icon when showing project root; accent when showing worktree
- Tooltip: "Showing worktree: <branch_name>" or "Showing project root"
- Thread switch auto-updates the breadcrumb worktree crumb when `worktree_follow_thread` is on

When the thread has no worktree binding, or when `worktree_follow_thread` is `false`, the worktree crumb is absent and the breadcrumb reverts to the standard `file > symbol > block` chain.

ContractRef: ContractName:Plans/assistant-chat-design.md, ContractName:Plans/storage-plan.md, ContractName:Plans/GitHub_Integration.md

### 10.2 Go to symbol and semantic navigation
`Go to symbol` is an editor/navigation feature, not a Search side-panel substitute.

Rules:
- the default scope is the active document; an explicit workspace mode may widen the query when the user chooses it
- when LSP is available, symbol results come from `documentSymbol` and `workspace/symbol`
- when LSP is unavailable, the fallback path is text/index/heuristic symbol search rather than a silent feature drop
- result rows show symbol kind, path, and line and open through the canonical editor open-file contract
- command palette may host the launcher, but persistent semantic navigation ownership stays with the editor/LSP seam

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/UI_Command_Catalog.md

### 10.3 Diagnostics, gutter markers, and change markers
Inline diagnostics and change markers are editor-owned visual layers.

Rules:
- diagnostics render as underlines, gutter markers, and Problems-panel pivots
- editor gutter and scrollbar overview are the canonical owners for staged/unstaged/conflicted marker state and review heat-map summaries
- conflicted markers override staged/unstaged styling until resolved
- staged and unstaged state must remain visually distinguishable when both exist for one file
- restore/revert outcomes surface as banner/toast/audit state rather than as a new persistent heat-map class

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/assistant-chat-design.md

### 10.4 Definition, references, hover, and code actions
Semantic editor actions reuse the same document authority and mutation path as normal editing.

Rules:
- go to definition, find references, hover, completion, signature help, code actions, and code lens all operate against the active authoritative document state
- stale or version-mismatched responses are discarded rather than patched into the UI optimistically
- workspace edits from format/rename/code action flow through the FileSafe-backed mutation path rather than bypassing normal file mutation rules
- no LSP feature may silently attach to a local mirror for a remote-mode project

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/FileSafe.md, ContractName:Plans/GitHub_Integration.md

