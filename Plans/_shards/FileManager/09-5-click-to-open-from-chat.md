## 5. Click-to-open from chat

**Done when:** Click on path or code block in files-touched strip, activity line, or diff header opens file in editor at line/range when available; already-open file focuses existing tab. **Depends on** §4.1 and §2; chat only invokes open-file contract. **If file not found:** Open-file contract returns error; chat or editor shows brief message (e.g. "File not found").

When the user clicks a **file path** or **code block** in the Assistant (or Interview) chat thread, the app **opens that file in the in-app IDE-style editor** via the open-file contract (§4.1). This applies to:

- **Files-touched strip** (chat footer): each path with diff count (e.g. `src/main.rs` (+12 −3)); click opens the file in the editor. When the entry has line/range info, the editor opens at that location (assistant-chat-design §4.1).
- **Activity transparency:** "Read: path" and "Edited: path" (and "Edited: path (lines 12-45)"); click opens the file and, when line/range is known, scrolls to it.
- **Code block / diff header:** The filename (and optional +N −M) at the top of an inline code block or diff in the thread; click opens that file and, when the block has line/range information, scrolls to that line or range.

**Line/range:** Same 1-based inclusive format as §2.3 (e.g. lines 12-45). **Open already-open file:** If the file is already open in a tab (in any group), **focus that tab** (and switch to its group if needed); do not open a second tab for the same path. If line/range is provided, scroll to and highlight it in the existing tab. **Single behavior:** All such clicks open in the same editor; no separate "preview" vs "edit." Chat does not implement its own file viewer; it always targets the editor (this plan §2). **Discoverability:** Provide affordance that paths and code blocks are clickable (e.g. hover underline, cursor change, or first-time tooltip) so users learn the feature.

---

