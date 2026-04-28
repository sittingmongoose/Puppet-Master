## 4. Integration: File Manager, editor, and chat

- File Manager, editor, and chat share the **same project context**.
- `@` mention resolution uses the same file list as the File Manager (single source of truth for project files).
- Clicking a file path or code block in chat opens the file in the editor; see §5.

### 4.1 Open-file contract

FileManager is the canonical owner of the file-open and artifact-storage contract. When a file is opened (via GUI, CLI, or internal routing), the following rules apply:

1. **Identity-based routing**: If the file path includes a route_target scheme (e.g., `github://owner/repo/file.md`), the open request is resolved through the shared route/open semantics in Contracts_V0.md, not a raw filesystem read.
2. **Worktree binding**: Opened files are bound to the active worktree via an execution_unit_context; artifacts opened in different worktrees have separate identity chains.
3. **Artifact-by-identity**: Artifacts (outputs, logs, diffs) are stored by content hash and indexed by (concern_id, route_target, artifact_type, timestamp); raw paths are deprecated.
4. **Open-file visibility**: The open-file list visible in the GUI is filtered by the active execution_role and the current approval_scope. Files opened in restricted approval scopes are not shown to unprivileged users.

### Route/open rules

#### Acceptance carry-through
- Let Contracts_V0 own canonical route_target and OpenSubject contracts
- Keep Crosswalk limited to primitive boundary ownership and FileManager OpenFile narrow and path-based
- Keep route_target small with subject_id or object_kind/object_id identity
- Limit subject_id families to doc:/artifact:, keep inspector_target secondary, and override only necessary destination/context state

### Error recovery in file/artifact access

If a file path is broken or a route_target is unreachable:
- Log a visibility deferral (do not fail the entire run).
- Emit a navigable error in the concern record so the user can inspect what went wrong.
- Provide a fallback route (e.g., workspace://project/concern) for results if the primary route was unavailable.

