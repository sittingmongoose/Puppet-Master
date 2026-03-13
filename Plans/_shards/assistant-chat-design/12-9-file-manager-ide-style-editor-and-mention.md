## 9. File Manager, IDE-style editor, and @ Mention

**Full specification:** Plans/FileManager.md (File Manager panel, in-app IDE-style editor, @ mention, click-to-open from chat).

**Chat-specific requirements (this document):**

- **@ mention in chat:** In the chat input, the user can type **@** to open a small search box over the file list. User picks a file (search/filter by name or path); the selected file is added to the agent's context for that message. Same file list as File Manager (single source of truth). When **LSP is available** (MVP), **@ symbol** also offers **symbols** (functions, classes, etc.) via LSP workspace/symbol so the user can add a symbol by name to context; see §9.1.
- **Click-to-open:** Clicking a file path (files-touched strip, "Read:" / "Edited:", or code block filename) in the thread **opens that file in the in-app IDE-style editor** (FileManager.md); when line/range is known, the editor scrolls to it. See §4.1 (files-touched strip) and §13 (activity transparency, code blocks).
- **Document review messaging contract (required):** After document generation or revision, chat must post:
  1. `Opened in editor` indicator,
  2. Clickable canonical file path,
  3. Document-pane pointer (`See <Document name> in document pane` or equivalent).
- **No full-doc-in-chat rule (required):** Chat message bodies for document workflows contain summaries, findings, gaps, and next actions only.
- **Findings summary in chat (required):** Requirements and Interview Multi-Pass runs must post a findings summary block before final approval.

### Findings summary block (requirements and interview)

Chat renders a compact findings block for review flows:
- `Scope` (`requirements` or `interview`)
- `Gaps`
- `Consistency issues`
- `Missing information`
- `Applied changes summary`
- `Unresolved items`

The findings block is shown before final approval and links to the same canonical findings artifact surfaced in the page preview section. Chat may render a compact projection, but it MUST resolve to the same review-run identity and revised-artifact reference used by the final approval gate.

### 9.1 LSP support in Chat (MVP)

**LSP is MVP.** The Chat Window must **fully take advantage of LSP** so the user and the Assistant benefit from language intelligence without leaving the chat. Full specification: **Plans/LSPSupport.md §5.1 (LSP in the Chat Window)** and **Plans/FinalGUISpec.md §7.16** (control placement, empty/error states, accessibility). Summary of Chat-specific requirements:

| Requirement | Behavior |
|-------------|----------|
| **Diagnostics in Assistant context** | When building context for the next Assistant (or Interview) turn, **include a summary of current LSP diagnostics** for the project or for @'d/recently edited files (errors/warnings with file, line, message, severity, source). The agent can suggest fixes and prioritize work. |
| **@ symbol with LSP** | When LSP is available, the **@** menu includes **symbols** (from LSP workspace/symbol and optionally documentSymbol) so the user can add a function/class/symbol to context by name; results show path, line, kind. When no project is set, @ symbol shows files only (no symbol category). Empty result: show "No symbols" (no error). |
| **Code blocks in messages** | **Code blocks** in assistant or user messages support **LSP hover** (tooltip with type/docs) and **click-to-definition** (e.g. Ctrl+Click or F12) when the block has a known language and the project has an LSP server; definition opens in the File Editor. Unknown language or no LSP: no hover/definition, no error. |
| **Problems link from Chat** | **Placement:** Chat **footer** strip, right of context usage (FinalGUISpec §7.16). Label: **"N problems"** when count > 0, **"Problems"** when zero. **Click target:** Opens the **Problems** panel (FinalGUISpec §7.20) filtered to the current project (or context). |
| **Diagnostics hint for @'d files** |

**Diagnostics Hint for @'d Files (Resolved — Deferred to Post-MVP):**
Not included in MVP. Priority: **P3** (post-MVP polish). When implemented: show a compact badge next to @-mentioned files with error/warning counts from LSP diagnostics (if LSP gate is enabled). |

**Fallback:** When no LSP server is active, @ symbol uses text-based or indexed symbol search (FileManager §12.1.4); code blocks have no hover/definition; diagnostics in context are omitted.

**Control placement and edge cases:** Exact placement of LSP controls (footer order, Problems link position), empty/zero states ("No problems", "No symbols", unknown-language code blocks), error states (LSP server error, timeout, project not set), and accessibility (focus order, screen reader text for Problems link and code-block go-to-definition) are specified in **Plans/FinalGUISpec.md §7.16** (Chat LSP control placement, empty and zero states, error states, accessibility).

**Additional Chat enhancements (LSP):** With LSP MVP, further Chat/Assistant flows become possible (Plans/LSPSupport.md §9.1): **"Fix all" / quick fixes** from diagnostics (Assistant suggests or user clicks "Fix" on a diagnostic); **"Rename X to Y"** from Chat (invoke LSP Rename symbol with confirmation); **"Where is this used?"** (LSP Find references, show in Chat or References panel); **"Format this file"** (LSP Format document); **Copy type/signature to Chat** from editor hover. Implement as high-value follow-ups after core Chat LSP (§5.1).

---

