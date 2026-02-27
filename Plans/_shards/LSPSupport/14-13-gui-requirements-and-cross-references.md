## 13. GUI requirements and cross-references

Where each LSP feature appears in the UI. FinalGUISpec and FileManager are authoritative for layout; this section maps LSP behavior to those specs.

| LSP feature | UI location | Spec reference | Notes |
|-------------|-------------|----------------|-------|
| **Diagnostics (list)** | Bottom panel → **Problems** tab | FinalGUISpec §7.20 | Table: file, line, message, severity, source. Click → open file at location. Filter by severity. Empty: "No problems detected" when LSP active with zero diagnostics; "Open a file to see diagnostics" when no LSP server is running. |
| **Diagnostics (inline)** | Editor: underlines + **gutter markers** (left of line numbers) | FileManager §10 (editor enhancements) | Severity colors: error (red), warning (amber), info (blue). Gutter: icon or dot per line with diagnostic. |
| **LSP status** | **Status bar** (bottom strip) | FinalGUISpec §3.2, §7.18, §8.1 StatusBar | Show server name + state: e.g. "rust-analyzer: Ready", "Initializing...", "Error: ...". When no server: show nothing (no "no LSP" indicator). |
| **Hover** | **Tooltip** at cursor (or slightly offset) | Editor UX | Rich content: markdown when server provides it; else plain text. Themed; max width to avoid overflow. |
| **Completion** | **Inline list** below cursor (or above if near bottom) | Editor UX | List of items (label, detail, kind icon); select with arrow keys + Enter; optional resolve on select. Trigger: typing, or explicit (e.g. Ctrl+Space). |
| **Signature help** | **Popup** near cursor (e.g. below line) | Editor UX | Current signature + parameter highlight; optional previous/next overload. Dismiss on cursor move or Escape. |
| **Inlay hints** | **Inline decorations** in editor (no buffer change) | Editor UX | Rendered in a different style (muted, smaller font); do not affect cursor/selection. Refresh on document change or on visible range change. |
| **Code actions** | **Context menu** and/or **lightbulb** icon in gutter or on selection | Editor UX | "Quick fix" / "Refactor" entries; apply via workspace/applyEdit (FileSafe). |
| **Code lens** | **Inline links** above applicable lines (e.g. "Run test", "3 references") | Editor UX | Click to invoke (e.g. run test, show references). Optional toggle to show/hide code lens. |
| **Breadcrumbs** | Above or below editor (path-style: file > symbol > block) | FileManager §10.1 | When LSP available, use `documentSymbol` for outline; else heuristic (§10.1). |
| **Go to symbol** | Command palette / quick open (e.g. Ctrl+Shift+O) + dropdown | FileManager §10.2 | List from LSP `documentSymbol` when available; else regex outline (§12.1.4). |
| **Install hint (fallback)** | **Toast** or **dismissible banner** in editor area | Optional | One-time or per-session: "Install rust-analyzer for full support" with link to docs or Settings. |
| **LSP server error / crash** | Status bar; optional Restart action | FinalGUISpec §7.18, §8.1; LSPSupport §8 | Status bar shows "Error: ..." for current editor context. Offer "Restart language server" (status bar context menu or Problems panel when diagnostics cleared). Do not block UI. |
| **Problems link (Chat)** | Chat footer, right of context usage | FinalGUISpec §7.16, §7.20 | Label "N problems" when count > 0, "Problems" when 0. Placement: immediately right of context usage (context circle / "42k/128k"). Opens Problems tab filtered to project; when no project: "Select a project to see diagnostics". |
| **Editor LSP shortcuts** | Editor, context menu | FinalGUISpec §7.18 | F12 = Go to definition; Shift+F12 = Find references; F2 = Rename; Ctrl+Space = completion; Ctrl+. = code actions; Ctrl+Shift+O = Go to symbol. Discoverable in Settings > Shortcuts. |
| **LSP configuration** | **Settings > LSP** tab | FinalGUISpec §7.4.2 | Full GUI control: see below. |

**Empty states:** Problems tab shows "No problems detected" when LSP active with zero diagnostics; "Open a file to see diagnostics" when no LSP server is running. Chat Problems link shows "Problems" (no number) when count is 0.

**GUI feature behavior (inputs, outputs, edge cases, fallback when LSP unavailable):**

- **Diagnostics (list):** *Inputs:* publishDiagnostics per URI. *Outputs:* Problems tab table (file, line, message, severity, source); click → open file at location. *Edge cases:* Server crash → clear list, offer Restart; empty → "No problems detected" or "Open a file to see diagnostics". **Fallback when LSP unavailable:** No diagnostics; show "Open a file to see diagnostics" or hide/empty panel.
- **Diagnostics (inline):** *Inputs:* same. *Outputs:* Underlines + gutter markers. *Edge cases:* Crash → clear underlines/gutter. **Fallback when LSP unavailable:** No underlines or gutter markers.
- **LSP status:** *Inputs:* Server state (Initializing/Ready/Error). *Outputs:* Status bar text. *Edge cases:* No server → show nothing (or "No LSP" per §1.1). **Fallback when LSP unavailable:** Omit or "No LSP".
- **Hover:** *Inputs:* (URI, position). *Outputs:* Tooltip. *Failure:* Timeout → "Timed out", discard; stale → discard. **Fallback when LSP unavailable:** No tooltip.
- **Completion:** *Inputs:* (URI, position, trigger). *Outputs:* Inline list. *Failure:* Timeout/stale → discard. **Fallback when LSP unavailable:** No LSP completions.
- **Signature help / Inlay hints / Code actions / Code lens:** *Outputs:* Popup, decorations, context menu/lightbulb, inline links. *Failure:* Timeout → skip. **Fallback when LSP unavailable:** No feature.
- **Breadcrumbs / Go to symbol:** *Inputs:* documentSymbol. *Outputs:* Outline, symbol list. **Fallback when LSP unavailable:** Heuristic/regex outline (FileManager §10.1, §12.1.4).
- **Install hint (fallback):** *Outputs:* Toast or dismissible banner. **Fallback when LSP unavailable:** Optional one-time or per-session hint to install server.
- **Problems link (Chat):** *Inputs:* Diagnostics count. *Outputs:* "N problems" or "Problems"; click → Problems tab. **Fallback when LSP unavailable:** Show "Problems" (0) or hide; link still opens panel.

**Config surface (Settings > LSP):** The GUI **must** expose all of the following in **Settings > LSP** (FinalGUISpec §7.4.2):

- **Disable automatic LSP server downloads** -- Global toggle (default: off). When on, the app does not auto-download or auto-install any LSP server. Servers already on PATH or already installed are still used.
- **Built-in servers** -- List of all built-in servers (§3.2). Each server has an **Enable** toggle; **all are on by default**. User can turn any server off individually. Per server, user can **configure**: **Environment variables** (key-value), **Initialization options** (key-value or JSON sent in LSP `initialize`).
- **Custom LSP servers** -- Add / edit / remove custom servers. Each custom entry: **Name** (id), **Command** (array of strings), **Extensions** (comma-separated or list), and optionally **Environment variables** and **Initialization options**. **Edit** and **Remove** per row. Same schema as OpenCode (`command`, `extensions`, `env`, `initialization`).
- **Code lens** -- Toggle to show/hide code lens in the editor (default: on). FinalGUISpec §7.18.
- **Custom LSP server validation:** When adding or editing a custom server: (1) **Command** must be non-empty (at least one string; trim whitespace). If empty, show inline error "Command is required" and disable Save/Apply. (2) **Extensions** must be non-empty (at least one extension). If empty, show "At least one file extension is required" and disable Save/Apply. (3) **Name** (id) must be unique among custom servers; if duplicate, show "Name already used" and disable Save/Apply. Saving or applying with invalid fields is not allowed.
- **Initialization options (JSON):** When the user edits **Initialization options** as JSON (built-in or custom servers), validate on blur or on Save. If invalid JSON: show inline error (e.g. "Invalid JSON: unexpected token at line N"), do **not** persist the value, block Save and focus the field. Do not send invalid JSON to the LSP server (use last known valid value or empty object). FinalGUISpec §7.4.2.

ContractRef: ContractName:Plans/LSPSupport.md, ContractName:Plans/FinalGUISpec.md

Settings are persisted in app config (redb); optional project-level overrides. See FinalGUISpec §7.4.2 for full UX detail.

---

