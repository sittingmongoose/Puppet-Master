## 11. File tree actions, local filter, and chat handoff
### 11.1 Canonical tree action catalog
This section is the canonical owner for the full file-tree action catalog; earlier overview bullets are summary-only.

**Create, rename, path, and delete actions**

| UI action | Canonical command | Valid targets | Notes |
|---|---|---|---|
| New file | `cmd.file.new_file` | project root, folder | prompts for name and creates under selected directory |
| New folder | `cmd.file.new_folder` | project root, folder | prompts for name and creates under selected directory |
| Rename | `cmd.file.rename` | file, folder | prompts for `new_name` |
| Delete | `cmd.file.delete` | file, folder, multi-select | explicit confirmation required |
| Copy full path | `cmd.file.copy_full_path` | file, folder | system text clipboard |
| Copy relative path | `cmd.file.copy_relative_path` | file, folder | resolves against project/worktree root context |

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md, ContractName:Plans/Decision_Policy.md

**Clipboard, handoff, open, and export actions**

| UI action | Canonical command | Valid targets | Notes |
|---|---|---|---|
| Copy nodes | `cmd.file.copy_nodes` | file, folder, multi-select | workspace-node clipboard, not text clipboard |
| Cut nodes | `cmd.file.cut_nodes` | file, folder, multi-select | visibly armed until paste/clear |
| Paste nodes | `cmd.file.paste_nodes` | folder, project root | shared validation/conflict engine with drag/drop |
| Add to Assistant Chat | `cmd.chat.add_file_reference` | file only (MVP) | visible composer chip; folder insertion out of scope |
| Open in Terminal | `cmd.terminal.show` | file, folder | reveal existing terminal or open at containing dir |
| Open With… | `cmd.file.open_with` | file only | targets: `source_editor`, `image_viewer`, `workspace_preview`, `detached_preview`, `diff_review` |
| Save Local Copy / Download | `cmd.file.save_local_copy` | file, folder | explicit remote-to-local/export escape hatch |

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md, ContractName:Plans/GitHub_Integration.md

### 11.2 Clipboard, drag/drop, and transfer engine
File transfer actions share one validation and conflict-resolution engine.

Rules:
- the workspace-node clipboard is distinct from the system text clipboard
- paste and drag/drop reuse one path-validation, conflict-resolution, and progress/toast path
- cross-authority paste is blocked rather than silently re-routed
- successful paste reuses the same progress and toast model as drag/drop
- cut-pending state remains visibly armed until paste or clear

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/storage-plan.md

### 11.3 Local tree filter, selection, and current-file reveal
File Manager search is intentionally local to the project tree.

Rules:
- the header/tree search box is a local tree filter/type-ahead only
- it narrows visible nodes and selection inside the current project tree; it does not become a project-wide results host
- the current-file reveal action scrolls and highlights the current editor file inside the tree when practical
- keyboard navigation, multi-select, and context menus must stay coherent while the local filter is active

ContractRef: ContractName:Plans/FinalGUISpec.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/assistant-chat-design.md

### 11.4 Open With and Save Local Copy
`Open With` and `Save Local Copy` are explicit user-visible escape hatches, not hidden fallback behavior.

Rules:
- `cmd.file.open_with` is file-only and MUST NOT expose a `system_default` target in MVP
- `workspace_preview` and `detached_preview` are the only preview/browser open targets in this catalog
- `diff_review` is the explicit handoff target for file-level compare/review entry
- `cmd.file.save_local_copy` works for files and folders; folder export copies recursively to a user-selected local destination
- remote-mode export uses `Save Local Copy` rather than a silent local mirror or cross-authority paste workaround

ContractRef: ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/storage-plan.md

