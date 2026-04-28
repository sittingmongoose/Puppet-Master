## 9. File Manager, IDE-style editor, and @ Mention

Chat consumes file context through explicit file-reference handoff and canonical editor/file-open contracts.

Rules:
- `@` mention and picker flows may discover files and symbols, but actual file insertion into the composer is represented as visible chips
- `cmd.chat.add_file_reference { project_id, thread_id?, path, line_range? }` is the canonical file-reference insertion command
- file references are file-only in MVP; folder insertion is out of scope
- clicking a file chip or file citation opens through the shared open-file contract rather than through chat-local navigation rules

ContractRef: ContractName:Plans/FileManager.md, ContractName:Plans/UI_Command_Catalog.md, ContractName:Plans/FinalGUISpec.md

Restore and review boundaries:
- `cmd.chat.revert` is the canonical entrypoint for `Revert last agent edit`
- omitted `target_message_id` resolves to the latest assistant turn in the current thread with persisted file mutations
- if that assistant turn touched multiple files, the revert applies to the whole turn across all affected files
- `cmd.chat.rewind` remains conversation-history rewind only
- Chat may preview or summarize diff/review context, but Source Control owns hunk actions, compare targets, and conflict resolution

ContractRef: ContractName:Plans/FileSafe.md, ContractName:Plans/GitHub_Integration.md, ContractName:Plans/Wiring_Matrix.md

Search boundary:
- chat search/history retrieval is chat-domain retrieval only
- project-wide find-in-files and replace-in-files remain Search side-panel owned
- semantic symbol/reference lookup remains editor/LSP owned even when chat launches it

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/FileManager.md, ContractName:Plans/storage-plan.md

