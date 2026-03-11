## 9. Tabs: Editor, Terminal, Browser

### 9A. Browser tab and detached preview normalization (2026-03-08)
The canonical browser container model is tab-first for in-shell browsing.

Rules:
- in-shell browser uses browser tabs, not a free-floating browser-instance pool
- detached preview/browser windows are first-class and outside the in-shell browser-tab cap
- LRU browser-instance reuse is not canonical behavior
- when the browser cap is reached, the user gets an explicit choice or a deterministic command failure; the app must not silently replace the current preview subject
- browser tab identity is distinct from preview-session identity so the same preview subject may exist in multiple containers without persistence ambiguity
### 10.1 Editor UX (text/code)

- **Minimap:** Small overview of the file in the right gutter for quick scrolling and orientation (e.g. VS Code-style).
- **Breadcrumbs:** Path above or below the editor (e.g. `file > function > block`) for in-file navigation. **When LSP is available**, use **LSP document outline** for accurate breadcrumbs (§10.10); **otherwise** use a simple heuristic (e.g. indent-based regions plus brace matching).
- **Code folding:** Collapse/expand blocks (e.g. by braces or indent level). Configurable fold level and keyboard shortcuts.
- **Multi-cursor:** Multiple carets/selections (e.g. Alt+Click, add next occurrence of word). Parallel edits in one buffer.
- **Find in file / Replace:** In-editor find (and replace) with regex option, match count, next/previous. Optionally "find in all open files."
- **Comment toggle:** Shortcut to toggle line or block comment for the current language (e.g. `//` vs `/* */`).
- **Indent/outdent:** Increase/decrease indent (e.g. Tab / Shift+Tab); optional "indent to line" and language-aware behavior.
- **Duplicate line / Delete line:** Shortcuts to duplicate current line (above/below) or delete line without selecting.
- **Move line up/down:** Move current line (or selection) up or down without copy/paste.
- **Trim trailing whitespace:** Option to trim trailing spaces (and optionally blank lines at end of file) on save or on demand.
- **Render whitespace:** Optional display of spaces/tabs (e.g. dots and arrows) for debugging indentation.
- **Sticky scroll:** Keep current "scope" headers (e.g. function name or block start) visible at top of editor while scrolling.

### 10.2 Navigation and search

- **Powerful search and fuzzy search:** Global **search** that can target: **current (open) file**, **all open files**, **project files** (by path/name/content), and optionally **buffers** or **recent files**. **Default search scope:** Define a default (e.g. current file or project) and show a **visible scope indicator** in the search UI so users know what is being searched. **Fuzzy search** for file open and symbol/symbol-in-workspace (e.g. Ctrl+P for quick open, Ctrl+Shift+O for go to symbol). Search supports plain text and regex; results show line and context; jump to match on select.
- **Go to symbol:** Jump to symbol (function, class, etc.) in **current file** via list or dropdown. **When LSP is available**, use LSP `textDocument/documentSymbol` (§10.10); **otherwise** use regex-based outline (§12.1.4).
- **Go to definition:** **When LSP is available**, use LSP `textDocument/definition`; **otherwise** best-effort via grep or indexed search, open file and scroll to line (§10.10, §12.1.4).
- **Find symbol in workspace:** Search symbols across the project. **When LSP is available**, use LSP workspace symbols; **otherwise** text-based or lightweight index (§12.1.4). Open file and location on select.
- **Recent files:** List of recently opened (or recently edited) files for quick re-open; accessible from quick open or dedicated shortcut.
- **Quick open (Ctrl+P):** Fuzzy open file by path/name; can be unified with command palette (fuzzy commands + files).

### 10.3 Layout and display

- **Split editor:** Covered in §2.4 (multiple editor groups).
- **Zoom in/out:** Editor font zoom (e.g. Ctrl+Plus/Minus) without changing global theme font size.
- **Line wrap:** Toggle on/off (already in §2.6); easily discoverable in view menu or settings.
- **Rulers:** Optional vertical ruler(s) at configurable column(s) (e.g. 80, 120) for line length guidance.

### 10.4 JetBrains-style: run/debug and debugger

- **Run/debug from editor:** "Run" or "Debug" for current file or selected **run configuration** (e.g. `cargo run`, `python main.py`, `npm start`). Run configurations are **preset-driven** (§11) or user-defined; integrate with existing terminal/runner and project context.
- **Integrated debugger:** Breakpoints, step over/into/out, variables view, call stack. MVP supports at least one workflow per preset (e.g. Rust with LLDB, Python with debugpy, Node with inspector). Debugger UI (panes, controls) is in-scope; language-specific adapters may be bundled per preset.

### 10.5 Lapce-inspired: modal editing and remote development

- **Modal (Vim-like) editing:** Optional **modal editing** mode: normal/insert/visual modes and Vim-style keybindings (or configurable). Toggle in settings or command palette; applies to editor only. **Focus trap:** When modal mode is on, provide an explicit "focus next panel" / "focus command palette" shortcut (e.g. Ctrl+Shift+Z) so Tab does not leave the editor without user intent; supports accessibility and keyboard-only flow. See §12.2.4 for conflicts with app shortcuts.
- **Remote development (SSH):** Edit files on a **remote host** over SSH. Project can be **remote path** (e.g. `user@host:/path/to/project`). A small proxy or agent runs on the remote host; app uses same editor and file tree over the connection. If connection is lost, show "Connection lost" and offer **Reconnect** or **Work offline (cached)**; do not corrupt local state. Optional: run/debug and terminal also remote (see §12.2.3).

### 10.6 Cursor/agent-related

- **In-app browser + click-to-context:** Already in §8 and newfeatures.md §15.18.
- **Visual design sidebar:** Sidebar for the **HTML/preview** workflow: theme (light/dark), visual controls for CSS (shadow, opacity, borders, colors, dimensions, layout), drag-and-drop element rearrangement, component prop inspection. **One-click apply** changes from sidebar to code (e.g. update HTML/CSS in editor). Complements hot reload (§8.2).
- **Agent-driven browser actions:** The Assistant (or agent) can **drive the built-in browser**: navigate, click, type, scroll, take screenshots, read console/network. Same WebView as §8; actions gated by tool policy and user permissions (assistant-chat-design). **Browser/Assistant boundary:** The interface (how chat/Assistant sends commands and receives results) and security constraints are defined in Plans/newfeatures.md §15.18; this plan assumes that boundary is implemented there.

### 10.7 OpenCode-inspired

- **Session-scoped view state:** Per-file view state (scroll, cursor, selected range) can be **session-scoped** as well as per-project. **Session** = chat thread (thread id) when in Assistant/Interview; optionally interview session id. State is keyed by `project_id` + `session_id`. When the user switches threads, **explicitly prompt:** e.g. "Restore N tabs from [thread name]?" with **Yes** / **No** / **Don't ask again** -- do not restore silently without user choice.
- **LRU content cache with eviction:** Limit in-memory open buffers by **size or count** with LRU eviction; the **max tabs** value (§2.9) is the cap. When reopening an evicted file, reload from disk. Prevents unbounded memory use with many open tabs.
- **File tree + watcher invalidation:** File Manager tree **invalidates or refreshes** when files change on disk (e.g. via filesystem watcher). Optional "watch" toggle; refresh on focus or manual refresh remains available.

### 10.8 Graphite-style (review and quality)

- **AI or rule-based code review:** Assistant (or dedicated review mode) can perform **automated code review** on demand or on commit/PR: logic bugs, security, style, documentation, accidental commits. Inline-style comments or a review panel; integrates with chat and file context.
- **Custom review rules:** User- or project-defined **review rules** (e.g. "flag TODOs," "require error handling here," "OWASP checklist"). Enforced during review runs or as optional editor hints (with or without LSP; LSP diagnostics can complement rules). **Canonical project file:** `.puppet-master/review-rules.yaml`. **App-level storage:** redb `review_rules/app`. Load order is app rules first, then project rules override or extend by rule id. Minimum rule fields: `id`, `description`, `severity`, optional `scopes`, and either a human-review prompt fragment or a machine-evaluable matcher. Invalid project YAML must surface a non-blocking warning and fall back to app rules instead of silently disabling review. See §12.1.9.
- **1-click apply suggestion:** In chat or in a review panel: **"Apply this change"** applies a suggested diff (e.g. agent suggestion or review fix) to the file in the editor. Reuses same apply/patch pipeline as agent edits (FileSafe, tool policy). See §12.2.8 for merge/conflict handling.

### 10.9 Additional editor features (MVP)

All of the following are **in scope for MVP**. Evaluate usefulness at implementation; some may be optional or simplified.

- **Recover unsaved buffers:** Required. On crash or quit-with-unsaved, offer to restore unsaved content from recovery store (redb or temp per Plans/storage-plan.md). Align with section 2.9.
- **Editor diff view:** Side-by-side or inline diff of two versions (e.g. buffer vs disk, or two branches); integrate with revert and review.
- **Snippets and templates:** User-defined or preset code snippets; expand on trigger (e.g. prefix or shortcut). MVP contract: support global snippets plus project overrides, TextMate-style placeholders (`${1:name}`, `$0`), autocomplete insertion, and an optional `Tab expands snippet prefix` setting. LSP completions flagged as snippets should reuse the same insertion pipeline.
- **Search in chat / search in messages:** Extend "powerful search" (§10.2) to include chat history and thread messages (content or metadata).
- **Breadcrumbs:** Use LSP document outline when LSP is available (§10.1, §10.10); otherwise use heuristics.
- **Per-preset keybinding schemes:** Optional keybinding profile per preset (e.g. VS Code vs Vim vs JetBrains-style) in addition to modal editing.
- **Editor theming:** User-selectable editor theme (beyond app theme) for syntax colors and editor background.
- **Minimap click-to-scroll:** Click on minimap to jump to that region of the file (common in IDEs).
- **Terminal replay / log:** Persist terminal output per tab for replay or copy after close; optional.

**Storage alignment:** Editor and panel state (open tabs, max tabs setting, layout, view state) are persisted in **redb** (§2.9 schema). Optional: editor **lifecycle events** (e.g. `FileOpened`, `FileClosed`, `TabSwitched`, `BufferSaved`, `BufferReverted`) can be written to **seglog** for analytics; projector pipeline can then index or roll up as needed. A minimal event set supports "revert last agent edit" (refresh after revert), analytics, and future features. **Confirm dialogs:** Standardize all confirmation prompts (Save/Discard/Cancel, Reload/Overwrite/Cancel, Discard unsaved and reload?, etc.) as one pattern: **message + optional "Show diff" + 2-3 buttons**; same UI component and accessibility behavior for all.

### 10.10 LSP support (MVP)
MVP editor LSP behavior follows Plans/LSPSupport.md and must not redefine conflicting defaults here.

Canonical File Manager alignment:
- app-level LSP config lives at `config.lsp`
- project override lives at `.puppet-master/lsp.json`
- merge rule is app config first, project override second; scalar/object keys override, arrays replace, absent keys inherit
- defaults are `didChangeDebounceMs=100`, `hoverTimeoutMs=5000`, `completionTimeoutMs=5000`, `workspaceSymbolTimeoutMs=10000`, `hoverDelayMs=300`, `workspaceFolders` cap = 10 active roots
- completion uses server trigger characters when provided, otherwise normal typing plus manual invocation
- inlay hints refresh on document open and after debounced edits
- rename / code actions / `workspace/applyEdit` use the FileSafe-backed apply-edit path and do not bypass mutation safety rules

This section is intentionally a consumer summary. Policy ownership remains in Plans/LSPSupport.md.

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/FileSafe.md, ContractName:Plans/Tools.md
### 12.1 Gaps (missing or underspecified)

#### 12.1.1 Click-to-open when editor is floating

**Decision:** When the editor is floating, open-file actions focus the floating editor window and open the file there.

**Solution:** Treat the editor as a single logical surface regardless of dock state. (1) **Open-file action** always targets that surface: if the editor is docked, open in the docked editor; if it's floating, **focus the floating window** and open the file there (add tab or switch to existing tab). (2) App state holds one "editor instance" (tabs, active group, dock state); the UI that renders it (main layout vs floating Window) is a view over the same state. (3) Document in §5 and §2.1: "Open file from chat or File Manager targets the editor surface; when floating, the floating editor window is focused and receives the file."

#### 12.1.2 Which editor group gets the file

**Gap:** With split panes, click-to-open and "open from File Manager" don't specify which editor group receives the new file.

**Solution:** (1) **Default:** Open in the **active (focused) editor group**. Track focus per group; when the user clicks a path in chat or selects a file in File Manager, the file opens in whichever group last had focus. (2) **Optional:** Add an "Open in" control (e.g. right-click file in File Manager or a small dropdown on click-to-open): "Open in current group" | "Open in other group" | "Open in new group." (3) Document in §5 and §2.4 that the default is active group and that optional "Open in" can be added without changing the default.

#### 12.1.3 Large-file threshold value

**Gap:** §2.7 gives examples (> 10 000 lines or > 2 MB) but no final value or hard cap.

**Solution:** (1) **Pick one primary metric:** Either **line count** (e.g. 10 000 lines) or **file size** (e.g. 2 MB). Recommend **line count** for editor UX (virtualized rendering). (2) **Define hard cap:** e.g. never load more than 5 MB into a single buffer regardless of threshold; above that, show "File too large to edit" and offer "View read-only (truncated)" or "Open in system editor." (3) **Settings:** Add **Large file threshold** (lines or MB) and **Hard cap (MB)** in Settings → Editor; persist in redb. (4) Document the chosen default and range (e.g. threshold 5k-50k lines, hard cap 2-10 MB) in §2.7.

#### 12.1.4 Symbol search (LSP when available, fallback without)

**Gap:** Go to symbol and find symbol in workspace need a clear path when LSP is and isn't available.

**Solution:** (1) **When LSP is available** (§10.10), use LSP `textDocument/documentSymbol` for current file and LSP workspace symbol request for find-symbol-in-workspace. **Resolved in §10.10:** LSP behavior for documentSymbol and workspace symbols is specified in §10.10.1 and §10.10.2; implement per §10.10 and §10.2. (2) **Fallback when LSP is unavailable:** **Current file (go to symbol):** Use a **regex-based outline** over the current buffer (language-specific regex sets per preset or extension). Produce `{ name, line, kind }`; user picks from dropdown; editor scrolls to line. **Workspace (find symbol):** Optional **project symbol index** (regex scan, store `{ name, path, line, kind }` in redb or project-local file). Refresh on save, watcher, or manual "Reindex." (3) Document the fallback outline and index schema in §10.2.

#### 12.1.5 Preset detection vs interview

**Gap:** "Detects or asks" for language/framework when a project is added -- detection rules and fallback are not listed.

**Solution:** (1) **Detection order:** (a) **File-based heuristics** at project root: e.g. `Cargo.toml` → Rust, `package.json` + `tsconfig.json` → TypeScript, `pyproject.toml` or `requirements.txt` → Python, `composer.json` → PHP, `go.mod` → Go, `*.sln` / `*.csproj` → C#. (b) If multiple match (monorepo), use **primary** (e.g. first by priority list) or prompt "Select preset." (c) If none match, show **"Select preset"** dialog with the full preset list. (2) **When interview was run:** If the project was created or configured via chain start wizard / interviewer, use the **interview output** (e.g. architecture phase result) to set or suggest the preset; user can override. (3) Document the detection table (file → preset) and the "Select preset" flow in §11 or a short "Preset detection" subsection.

#### 12.1.6 Tool download failure

**Decision:** Preset tool download failure does not block opening the project; show error + Retry + Skip and allow installing later.

**Solution:** (1) **On failure:** Show a **clear error** in the UI (e.g. "Could not install Rust toolchain: [reason]"). Include retry and skip actions. (2) **Retry:** "Retry" re-runs the download/install for that preset. (3) **Skip:** "Use project without full preset" -- project opens with the preset selected but without the optional tools; run/debug may be limited (e.g. "Run" might prompt to install later). Do **not** block opening the project. (4) **Docs:** "Open docs" or "Troubleshoot" link to preset-specific setup or system-requirement docs. (5) Optionally persist "skip this preset's tools" so the user isn't prompted every time; allow "Install preset tools" from Settings or project menu later. Document in §11.

#### 12.1.7 Hot reload debounce

**Decision:** Hot reload debounce is 400 ms per preview instance; linked files are the HTML file plus referenced local resources under the project root.

**Solution:** (1) **Debounce duration:** Use a **per-file** debounce of **300-500 ms** (e.g. 400 ms). On each save of a file that is "watched" for hot reload (the HTML or linked CSS/JS), start or reset a timer; when the timer fires, trigger one refresh of the browser view that shows that file. (2) **Scope:** Per preview instance: each browser instance watching a given HTML file has its own debounce; rapid saves to that file result in one refresh after the last save within the window. (3) **Settings:** Add **Hot reload debounce (ms)** in Settings → Editor or Developer (range e.g. 100-2000 ms); persist in redb. Document default and key in §8.2.

#### 12.1.8 Session-scoped view state scope

**Decision:** Session-scoped view state is keyed by chat thread id (and interview session id when in Interview).

**Solution:** (1) **Define session:** For "session-scoped view state," **session** = **chat thread** (thread id) when the user is in the Assistant/Interview chat. Optionally also key by **interview session id** when in Interview flow. (2) **Keying:** Store view state (open tabs, scroll, cursor, selected range) under a composite key: e.g. `project_id` + `session_id` (thread id or interview session id). When the user switches threads, offer to restore that thread's editor view state if it was previously used. (3) **Fallback:** If no session id (e.g. user never opened chat), use project-only key so behavior matches "per-project" only. Document in §10.7 that session = thread (and optionally interview session) and that state is keyed by project + session.

#### 12.1.9 Review rules storage

**Decision:** Review rules load from `.puppet-master/review-rules.yaml` (project) plus redb `review_rules/app` (app); project rules override/extend by rule id.

**Solution:** (1) **Storage:** Support both **project-level** and **application-level** rules. Project: `.puppet-master/review-rules.yaml` in project root. Application: redb key `review_rules/app` (or equivalent app-data export/import command). Project rules override or extend app rules by `id` when a project is selected. (2) **Format:** YAML for deterministic parsing and diffability. Minimum schema: `id`, `description`, `severity`, optional `scopes`, and one of `match`, `path_glob`, or `prompt_hint` depending on whether the rule is machine-evaluable or prompt-only. (3) **Application:** When running AI/rule-based review (§10.8), the review engine loads app + project rules, records the merged rule set id/count in the review request metadata, and applies them (e.g. inject into Assistant prompt or run a rule evaluator). Invalid YAML surfaces a warning with line/column if available; the engine falls back to the last valid app-level set rather than failing open.

#### 12.1.10 Floating editor + multiple windows

**Gap:** With main window + floating editor + possibly detached Chat/File Manager, window count and focus for shortcuts (e.g. Ctrl+S) need clarity.

**Solution:** (1) **Focus rule:** **Editor shortcuts** (Save, Close tab, Go to line, etc.) apply when **any editor window has focus** (docked or floating). So Ctrl+S in a floating editor window saves the current buffer in that window. App-level shortcuts (e.g. command palette Ctrl+P) apply when the main window or a non-editor panel has focus. (2) **Single floating editor:** AutoDecision: exactly one floating editor window; when the user drags out again, re-dock the existing floating editor window and float the newly dragged group. (3) **Z-order:** OS manages window order; no special z-order requirement beyond "focus follows click." Document focus rule and single-vs-multiple floating policy in §2.1 or §2.4.

### 12.2 Potential problems

#### 12.2.1 Performance with many tabs

**Problem:** Dozens of open files plus LRU eviction can cause thrashing (frequent load/unload) or slow startup if persisted state is large.

**Solution:** (1) **LRU cap:** Enforce the **max editor tabs** setting (§2.9); only that many buffers are kept in memory. When opening a new file would exceed the cap, evict the least-recently-used buffer (clear from memory; keep path in tab list). On tab switch to an evicted file, reload from disk. (2) **Lazy load:** When restoring session, load only the **active tab** content immediately; load other tab contents on first switch to that tab. (3) **Persist minimal state:** Persist only **ordered list of paths**, **active tab index**, and optionally **scroll/cursor per tab**; do not persist full buffer content. Recovery/unsaved buffer content is separate (redb or temp). (4) **Startup:** On app start, restore tab list and active tab; load active buffer; defer loading other buffers until the user switches. Document in §10.7 and §2.9.

#### 12.2.2 Detach/snap and Slint

**Problem:** Plans/FinalGUISpec.md describes detach for Chat and File Manager; the editor has more state (tabs, buffers, multiple groups) and must work when docked or floating.

**Solution:** (1) **Reuse state machine:** Use the same **DOCKED ↔ FLOATING** state machine and **snap zones** (e.g. 25px from main window edge, visual cue on drag) as for Chat/File Manager. One enum per panel type: `PanelDock::Docked { side, width }` | `PanelDock::Floating { window_id, x, y, w, h }`. (2) **Single editor component:** The editor UI component (tabs, groups, content area) is **one component** that can be rendered either **inline in the main layout** (when docked) or **inside its own Slint Window** (when floating). Same component, different parent. (3) **Shared state via app bridge:** All editor state (tabs, buffers, active group, dirty flags) lives in the Rust app; the Slint editor component reads/writes via the backend bridge. So when the user drags the editor out, the floating window shows the same data; no duplication of state. (4) Document in Plans/FinalGUISpec.md or §2.1 that the editor follows the same detach/snap pattern and that editor state is shared, not copied.

#### 12.2.3 Remote SSH + run/debug

**Problem:** Running and debugging on a remote host requires an agent/proxy on the remote machine and port forwarding or a secure channel; complexity and failure modes are high.

**Solution:** (1) **Phase 1 (MVP):** **Remote edit only.** User connects via SSH; file tree and editor read/write files over the connection (e.g. remote proxy or SSHFS-style). Run/debug and terminal **run locally** (or in a local shell that SSHs for commands). Document that "remote run/debug" is out of scope for initial MVP. (2) **Phase 2 (later):** **Remote run/debug** with a documented **remote agent**: e.g. a small binary on the remote that runs commands and streams output; debugger uses port forwarding or the same channel. Document security constraints (no arbitrary code execution beyond project, user consent). (3) **Failure handling:** If SSH drops or proxy fails, show "Connection lost" and offer "Reconnect" or "Work offline (cached files only)." Do not corrupt local state. Document in §10.5.

#### 12.2.4 Modal editing vs shortcuts

**Problem:** Vim-style bindings can conflict with app shortcuts (e.g. Ctrl+S for Save, Ctrl+P for command palette).

**Solution:** (1) **Editor has focus:** When the **editor** has focus and **modal (Vim) mode is on**, the editor **consumes key events first**. So Ctrl+S in insert mode can be "save" (if bound) or pass through to app; in normal mode, 'S' might be "substitute line." Define a **keybinding map** for modal mode that reserves e.g. Ctrl+S for Save and Ctrl+Shift+Z for "open app menu" or "focus main window." (2) **Escape hatch:** Provide a reliable way to **exit modal mode** or **focus out of editor** without mouse: e.g. Ctrl+Shift+Z → "Focus command palette" or "Toggle modal off." (3) **Settings:** Let user choose "Use Vim bindings in editor" and list reserved app shortcuts (Save, command palette, etc.) in Settings → Editor so they are not overridden. Document in §10.5.

#### 12.2.5 Multiple presets in one project

**Problem:** Monorepos (e.g. Rust backend + TypeScript frontend) may need more than one preset; §11 says "single preset per project."

**Solution:** (1) **Primary preset:** Keep **one active preset per project** as the default; it drives run/debug defaults and tool download. (2) **Switchable preset:** Allow the user to **switch** the project's preset (e.g. Settings → Project → Preset: Rust | TypeScript | ...). Use case: "I'm working on the frontend today" → switch to TypeScript. (3) **Combined presets (optional):** Define **combined presets** (e.g. "Rust + Node") that include tools and run configs for both; when selected, both toolchains are available and the user picks run config per launch. (4) **Primary + secondary:** Alternatively, allow **primary** (default run/debug) and **secondary** (additional tools/languages); document in §11. Choose one of combined vs primary+secondary and document.

#### 12.2.6 Browser instances and resources

**Problem:** Browser tabs and detached preview windows use significant memory; too many active browser surfaces can exhaust resources.

**Solution:** (1) **In-shell cap:** Enforce a **max browser tabs** cap for in-shell browser tabs only. Detached preview windows are outside that cap. (2) **Over-cap behavior:** If the user tries to open another in-shell browser tab after the cap is reached, do **not** silently retarget the current preview subject. Instead either prompt the user to close/focus an existing tab or fail the action with a clear message. (3) **Detached windows:** Detached preview windows remain first-class and are managed separately from the in-shell tab cap. (4) **Settings:** Add **Max browser tabs** in Settings → General or Developer (e.g. 2-12); persist in redb. Document in §8 and §9.

#### 12.2.7 Symbol index staleness

**Problem:** The project symbol index (for go-to-symbol / find-symbol in workspace) can be stale after the user or an external process edits files.

**Solution:** Applies to the **non-LSP** symbol index; when LSP is used (§10.10), workspace symbols come from the language server and are up to date on didChange/didSave; invalidation policy here applies to the **fallback index** only. (1) **Invalidation triggers:** Invalidate the index (or the affected file's part of the index) on: **file save** (user saves in editor), **filesystem watcher event** (external change), and **manual "Reindex"** action (e.g. command palette or File Manager context menu). (2) **Refresh policy:** **On save:** update that file's symbols in the index. **On watcher:** same. **Full reindex:** on "Reindex" or when project is opened after a long time (e.g. index older than 24 h). (3) **Stale read:** If index is stale, go-to-symbol may point to an old line; user can re-run "Go to symbol" or "Reindex" to refresh. Document refresh policy in §10.2 and §12.1.4.

#### 12.2.8 1-click apply and merge conflicts

**Problem:** Applying an agent or review suggestion when the file was edited elsewhere (or disk changed) can overwrite user changes or produce confusing results.

**Solution:** (1) **Reuse FileSafe/patch pipeline:** All "apply suggestion" actions go through the same **patch/apply/verify** path as agent edits (FileSafe, tool policy). (2) **Pre-apply check:** Before applying, compare **current buffer** and **current disk file** to the **version the suggestion was based on**. If buffer or disk has changed since then: (a) **Prompt:** "File has changed. Reload and re-apply suggestion, or apply anyway (may overwrite), or cancel." (b) **Show diff:** Optional "Show diff" so the user sees what will change. (3) **Apply anyway:** If user chooses "Apply anyway," apply the suggestion on top of current buffer (or merge if possible); if conflict, show conflict UI or reject. (4) **Reload and re-apply:** Reload file from disk (discard or stash buffer changes per user), then apply the suggestion. Document in §10.8 and FileSafe.

### 12.3 Enhancements (all MVP)

All items previously listed as "future ideas" are **in scope for MVP** and are specified in **§10.9 Additional editor features (MVP)**. Implement as needed; evaluate usefulness for optional items (e.g. terminal replay).

### 12.4 Suggested additions (consider for File Manager and editor)

The following are not yet specified above; consider adding them to §1 or §10 if they fit MVP scope.

**File Manager**

- **.gitignore / exclude patterns:** File tree respects `.gitignore` (and optionally a project exclude list). Ignored files/folders are **dimmed** by default; optional user setting to **hide** ignored items (toggle "Hide ignored").
- **Context menu actions:** New file, New folder (in selected directory, with name prompt); Rename; Delete (with confirmation); Copy full path to clipboard. Aligns with selectable labels and context menus elsewhere (AGENTS.md).
- **Expand/collapse persistence:** Optionally persist which folders are expanded in the tree per project (e.g. in redb under project key).

**Editor**

- **Current line highlight:** Subtle background highlight for the line containing the cursor.
- **Bracket matching:** Highlight the matching bracket/brace when the cursor is adjacent to one; optional brief highlight of the matching range.
- **Indent guides:** Vertical lines at indent levels to show block structure (useful without LSP).
- **Selection occurrence highlight:** When text is selected, highlight other occurrences of that text in the current file (read-only).
- **Pin tab:** Option to pin a tab so it is not evicted by LRU when max tabs is reached; pinned tabs shown with a distinct marker and excluded from "Close others" if desired.
- **Column (block) selection:** Rectangular/column selection (e.g. Alt+drag) for multi-line same-column edits.

### 12.5 Implementation plan checklist

Use this list when deriving an implementation plan; order aligns with §6 Implementation order (summary).

- 1. **File Manager:** Tree (virtualized), project context, select file → open in editor; .gitignore (dimmed/hide); context menu (New file/folder, Rename, Delete, Copy path); expand/collapse persistence.
- 2. **Editor:** Buffer model (one per path), tabs per group, shared buffer across groups; open file from tree shows content; dirty state and unsaved indicator (tab + one other place).
- 3. **Open-file contract:** Single handler for all open-file actions; request shape `OpenFile { path, line?, range?, target_group? }`; response: add/switch tab, scroll/highlight when line/range set; when floating, focus floating window and open there.
- 4. **Save / Revert / file-changed-on-disk:** Save persists to disk and clears dirty; Revert restores last-saved (prompt if dirty); file-changed-on-disk check on Save and on tab focus; combined prompt when dirty + disk changed.
- 5. **Presets:** File-based detection at project open; "Select preset" when none/multiple match; store active preset per project; tool download (non-blocking, Retry/Skip on failure).
- 6. **LSP lifecycle:** Start server when project opens or first file of that language opens; stop on project close or idle timeout; one process per (project, server) or (project, language).
- 7. **LSP document sync:** On buffer open send `didOpen`; on edit send debounced `didChange`; on save send `didSave`; map editor positions to LSP line/column.
- 8. **LSP diagnostics:** Consume `publishDiagnostics`; show squiggles in editor and list in Problems panel.
- 9. **LSP features (core):** Hover, autocomplete, go-to-definition, go-to-symbol (current file), find symbol in workspace; fallbacks when LSP unavailable (regex outline, grep/index) per §12.1.4.
- 10. **LSP features (extended):** Code actions, rename, format on save, inlay hints, signature help, find references, highlight occurrences, go to type/implementation/declaration, semantic folding, expand/shrink selection, document links, color picker, CodeLens, format on type, call hierarchy, semantic tokens; per-feature fallback when server does not support.
- 11. **Click-to-open from chat:** Paths and code blocks in chat open file via open-file contract; line/range scroll/highlight; already-open file → focus existing tab.
- 12. **Drag-and-drop (File Manager):** Drop onto tree (copy into folder); drag out (copy to OS); name conflict handling; progress and error feedback; security (target under project root).
- 13. **Editor enhancements (non-LSP):** Line numbers, go-to-line, syntax highlighting, split panes, persistence (tabs, scroll/cursor, max tabs), large-file threshold and hard cap, transient UI states, accessibility.
- 14. **Image viewer & HTML preview:** Image tab/viewer; HTML open in browser; hot reload with debounce (default 400 ms); click-to-context when viewing HTML (per newfeatures.md §15.18).
- 15. **Tabs (Terminal, Browser):** Terminal tabs; browser instance cap and reuse/LRU policy.
- 16. **Optional / later:** Recover unsaved; Save As; Revert last agent edit (contract + refresh notification); "Open in" other/new group; Git status strip; modal editing; remote SSH; review rules storage; combined presets.

### 12.6 Multi-agent review -- addressed in main body

Four reviewer roles (architecture, UX, technical writing, frontend implementation) reviewed this document. **All identified gaps, potential problems, and enhancements have been folded into §§1-11.** Index of where each was addressed:

| Topic | Addressed in |
|-------|----------------|
| Open-file contract | §4.1 (request shape, single code path) |
| Revert last agent edit / FileSafe | §2.2, §2.5 (contract, refresh notification, pointer to FileSafe.md) |
| File changed on disk (when, focus rule, dirty+disk order) | §2.5, §7 |
| Single buffer multiple views | §2.4, §2.5 |
| Editor state in redb (schema) | §2.9 |
| Save failure, save success feedback, unsaved in two places | §2.2 |
| Large-file strategy, threshold, hard cap | §2.7 |
| Collapsed state, floating editor policy (one window) | §2.1 |
| Tab bar model (per-group tab list, shared buffer) | §2.4 |
| Scroll/cursor persistence, restore order, lazy load, max persisted tabs | §2.9 |
| Image viewer placement | §8.1 |
| Hot reload (linked files, debounce default) | §8.2 |
| Line/range format, highlight duration | §2.3, §5 |
| Definitions, scope/ownership, FileSafe pointer | Summary (Definitions), §6 |
| Discoverability (click-to-open, detach) | §1, §2.1, §5 |
| Open already-open file (focus existing tab) | §5 |
| @ vs click-to-open | §3 |
| Accessibility, File Manager tree keyboard | §2 (Transient UI states / Accessibility), §1 |
| Read-only reason in UI | §2.6 |
| Transient UI states (Loading, File not found, etc.) | §2 (after §2.9) |
| Terminal pin, browser instance cap | §9 |
| Project root detection, symlinks, broken-files list, file→dir, editor floating+main closed | §7 |
| Browser/Assistant boundary | §10.6 |
| Preset detection table, tool download order | §11 |
| Session restore explicit prompt | §10.7 |
| Review rules storage | §10.8 |
| Recover unsaved alignment, lifecycle events, confirm dialogs | §2.9, §10.9 |
| Search scope default and indicator, symbol outline/index | §10.2 |
| Modal focus trap, SSH connection lost | §10.5 |
| §12.4 suggested additions | §12.4 (implement as needed); §1 .gitignore and context menu folded into §1 |

**Source key (for reference):** A = architect-reviewer, U = UX-researcher, T = technical-writer, F = frontend-developer.

**Original gaps (historical; addressed in main body)**

- **Open-file contract (§4, §5):** No single request shape (e.g. `path`, `line?`, `range?`, `target_group?`) or code path for chat, File Manager, and quick open. (A, F)
- **Revert last agent edit / FileSafe (§2.5):** Who invokes whom and event/message shape (e.g. `BufferReverted(path)`) not defined; editor "reloads or is notified" is ambiguous. (A, F)
- **File changed on disk (§2.5, §7):** "On next focus" undefined -- per-tab, per-window, or app-global; who performs the check and when. (A, T, F)
- **Single buffer, multiple views (§2.4, §2.5):** When the same path is open in more than one editor group, no explicit rule that all views share one buffer and stay in sync (cursor/scroll ownership, dirty state). (A, F)
- **Editor state in redb (§2.9):** No schema for keys and value shapes (open tabs, active tab, scroll/cursor, max tabs, session-scoped state). (A, T)
- **Save failure (§2.2):** No behavior for write failure (disk full, permission, path deleted): keep buffer dirty, error + retry / "Save As," no "last saved" update. (A, F)
- **Large-file strategy (§2.7):** Both "truncated + Load full" and "read-only virtualized" mentioned; pick one for MVP. Default threshold and hard cap only in §12.1.3 -- state in §2.7. (T, F)
- **Collapsed editor state (§2.1):** Resolved in §2.1: persisted per-project in redb. (F)
- **Tab bar model (§2.4):** "Each group has its own tab list (or shares a common tab bar)" -- choose one for MVP. (F)
- **Scroll/cursor persistence (§2.9):** "Optionally scroll/cursor per tab" -- need a default (yes/no) and storage. (F)
- **Image viewer placement (§8.1):** Resolved in §8.1: same tab area as the editor. (T, F)
- **Hot reload (§8.2):** Which files count as "linked" (same dir, `<link>`/`<script>` refs) and debounce default (e.g. 400 ms) only in §12.1.7 -- add to §8.2. (T, F)
- **Line/range from chat (§2.3, §5):** Resolved in §2.3 and §5: 1-based inclusive; default highlight duration 5 s. (T)
- **Floating editor policy (§2.1, §12.1.10):** Resolved in §2.1 and §12.1.10: exactly one floating editor window (re-dock then float new). (T, F)
- **Definitions:** Terms **buffer**, **tab**, **editor group**, **dirty**, **preset**, and **redb** / **seglog** / **project storage design** / **rewrite-tie-in-memo** (with doc links) not defined here. (T)
- **FileSafe (§2.5):** Referenced but not defined; add pointer (e.g. Plans/FileSafe.md). (T)
- **Discoverability:** How users learn that paths/code blocks in chat are clickable, and that editor/panels can be detached (affordance, hover, tooltip, onboarding). (U)
- **Open already-open file (§2.5, §5):** Resolved in §5: focus existing tab (no duplicates), then apply line/range scroll/highlight when provided. (U)
- **@ vs click-to-open (§3, §5):** Intentional difference (context vs open) not explained in UI. (U)
- **Accessibility:** No mention of screen reader, keyboard-only use (tree, tabs, dialogs), focus order, visible focus, ARIA, reduced motion. (U)
- **File Manager tree keyboard:** Resolved in §1: arrow keys navigate; Enter opens/toggles; type-ahead narrows. (U)
- **Read-only reason (§2.6, §2.7):** UI need not explain why (binary, too large, OS read-only); users can be confused. (U)
- **Save success feedback (§2.2):** No requirement for "Saved" or visible clearing of dirty state. (U)
- **Dirty + Disk Change Prompt Order (Resolved, §7):** When a file has both unsaved editor changes AND has been modified on disk, show a **single combined prompt** (not two sequential prompts): "File [X] has unsaved changes and has been modified on disk." Actions: **[Save yours]** (overwrites disk with editor version), **[Load from disk]** (discards editor changes, loads disk version), **[Show diff]** (opens side-by-side comparison), **[Cancel]** (dismisses prompt, editor retains unsaved changes). The combined prompt prevents the confusing UX of two sequential dialogs about the same file.
- **Transient UI states:** Loading, "Cannot decode as UTF-8", "File not found", "Binary file", "File too large", "Indexing...", open failure -- each needs at least one defined state and copy. (F)
- **Terminal tab "pin" (§9):** Resolved in §9: pinned tabs excluded from Close others and LRU close when cap exists. (F)
- **Project root moved/renamed (§7):** Resolved in §7: detect via next I/O failure only; no watcher in MVP. (A)
- **Symlinks (§7):** Resolved in §7 and §4.1: show symlinks as a single node (no follow); open-file validates canonical path under project root. (T)

**Potential problems**

- **Very large directories (§1, §10.7):** No policy for e.g. node_modules (virtualization depth, row limit, caps). (A)
- **Browser/Assistant boundary (§8, §10.6):** Same browser for preview and agent-driven actions; interface (commands, results) and security not defined. (A)
- **Restore vs lazy load (§2.9, §12.2.1):** §2.9 doesn't state "restore active tab first"; startup could load many buffers before cap. (A)
- **Preset tool download (§11):** Order and UX are defined in §11: non-blocking after project open with progress + Retry/Skip. (A)
- **Summary and §12 (T):** Summary is one long sentence; §12 holds solutions that could live in main body (e.g. §12.1.3 threshold in §2.7); recover unsaved §2.9 vs §10.9 MVP wording inconsistent.
- **Focus when editor floating (§2.8, §12.2.2):** Which window "editor has focus" for shortcuts and open-file target needs an explicit rule. (F)
- **Max persisted tab count (§12.2.1):** Max persisted tab count: **50**. Config: `editor.max_persisted_tabs`, default `50`. Keeps startup and storage bounded. (F)
- **Modal editing (§10.5):** Focus trap when modal on (e.g. Tab shouldn't leave editor without "focus next panel" shortcut). (F)
- **Browser instance cap (§12.2.6):** Define what counts as one instance and whether "Open in browser" reuses or creates new when under cap. (F)
- **Line/range highlight duration (§2.3):** If "fades after short delay," specify duration and configurability. (F)

**Enhancements (consider folding into main spec)**

- **Single open-file contract:** Add subsection under §4 or §5: request shape `path`, `line?`, `range?`, `target_group?`; default active group. (A, F)
- **Editor state schema:** Short "Editor state in redb" note (key names, value types) under §2.9 or §12. (A)
- **Explicit "single buffer, multiple views" rule:** One sentence in §2.4/§2.5: same path in multiple groups ⇒ one buffer, all views in sync. (A)
- **Save failure clause:** In §2.2 or §7: on failure, keep dirty, show error + retry / "Save As," don't update last-saved. (A)
- **Definitions subsection:** After Summary or in §2, define buffer, tab, editor group, dirty, preset; one line each for redb, seglog, doc links. (T)
- **Defaults in body:** Large-file threshold + hard cap in §2.7; hot-reload debounce in §8.2; floating-editor policy (one window) in §2.1. (T, F)
- **Scope/ownership:** 1-2 sentences after Summary: what this spec defines vs defers to assistant-chat-design, newfeatures, etc. (T)
- **MVP definition (§6):** One sentence that "MVP" here means desktop build scope. (T)
- **Onboarding/hints:** Lightweight discovery for click-to-open and detach/snap (e.g. first-time tooltip). (U)
- **Search scope default and indicator (§10.2):** Default scope (current file vs project) and visible scope in search UI. (U)
- **Session restore prompt (§10.7):** Explicit "Restore N tabs from [thread]?" (Yes / No / Don't ask again) instead of "offer to restore." (U)
- **Broken/missing files list (§7):** Single place (list or badge) for tabs with missing/deleted files; bulk Close all / Reload if present. (U)
- **Current file in File Manager (§1):** When editor has focus, highlight or scroll tree to current file ("you are here"). (U)
- **Unsaved in two places (§2.2):** Tab plus one other (e.g. title or status bar) so visible with many tabs. (U)
- **Unified confirm-dialog spec:** Standardize Save/Discard/Cancel, Reload/Overwrite/Cancel, etc. as one pattern (action + optional Show diff + buttons). (F)
- **Editor lifecycle events:** Minimal set (e.g. FileOpened, FileClosed, TabSwitched, BufferSaved, BufferReverted) for bridge and analytics. (F)
- **Symbol outline/index (§12.1.4):** Short note: outline `{ name, line, kind }`; workspace index `{ name, path, line, kind }`; invalidation on save/watcher/Reindex. (F)
- **Preset detection table (§12.1.5):** File → preset table (Cargo.toml → Rust, etc.) and "Select preset" when none/multiple; reference in §11. (F)
- **Adopt §12.4:** Implement suggested File Manager and editor additions (e.g. .gitignore dimmed/hide, context menu, pin tab, bracket matching, etc.). (F)

