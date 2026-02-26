## 4. Integration: File Manager, editor, and chat

- File Manager, editor, and chat share the **same project context**.
- @ mention resolution uses the same file list as the File Manager (single source of truth for "project files").
- **Clicking a file path or code block in chat opens the file in the editor**; see §5.

### 4.1 Open-file contract

**Done when:** All callers (chat, File Manager, Ctrl+P) use one handler; request shape and defaults as specified; response is add/switch tab + optional scroll/highlight; floating editor receives focus and file. **Implement §4.1 before §2 (editor), §1 (File Manager open), §5 (click-to-open).** Editor is the single target; contract is the API. **Response on failure:** If open fails (not found, permission, too large, binary), return or signal error; caller shows message; do not add tab with broken state. **Path outside project:** AutoDecision: reject (after canonicalization) unless under the current project root. **Response shape:** Success: tab added or focused; optional payload for line/range applied. Failure: error code + message (e.g. FileNotFound, PermissionDenied, FileTooLarge).

ContractRef: Plans/assistant-chat-design.md §4.1, Plans/Tools.md §2.5, Plans/FileSafe.md

All "open file" actions (chat click-to-open, File Manager selection, quick open Ctrl+P) use a **single internal contract** and one code path. **Request shape:** `OpenFile { path: PathBuf, line?: number, range?: { start: number, end: number }, target_group?: 'active' | 'other' | 'new' }`. **Defaults:** `line` and `range` are 1-based inclusive; `target_group` defaults to **active** (focused editor group). If the editor is floating, the target is still the single editor surface -- focus the floating window and open the file there. **Response:** Add or switch to the tab for `path` in the target group; if `line` or `range` is set, scroll to and optionally highlight that range (§2.3). AutoDecision: canonicalize and validate `path` under the current project root (including symlink escape); reject otherwise. Implementors: one function/handler for all callers.

---

