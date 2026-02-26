## 7. Edge cases

- **File deleted on disk:** If the file was deleted externally, show a clear state (e.g. "File not found" or "Deleted") and offer to close the tab or reload from path if it reappears. **Broken/missing files list:** Provide a single place (e.g. list or badge in editor or status bar) that shows tabs with missing/deleted files, with bulk **Close all** or **Reload if present** so the user does not hunt through tabs.
- **File changed on disk:** See §2.5 (when to check, combined prompt with dirty).
- **No project selected:** File Manager and @ disabled; editor may show last project tabs or clear.
- **Project root moved/renamed:** Invalidate list and tabs; show File not found. **Detection:** AutoDecision: detect via failure on next I/O (e.g. read/save); no filesystem watcher in MVP.
- **Symlinks:** AutoDecision: show symlinks as a single node (do not follow during enumeration). Open-file contract validates that the resolved canonical path is still under the project root; otherwise reject open.
- **File replaced by directory (or vice versa) on disk:** If the path now refers to a directory (or was a directory and is now a file), on next open/save or refresh show a clear state (e.g. "Path is no longer a file") and offer to close the tab.
- **Editor floating and main window closed:** AutoDecision: closing the main window does not exit the app if a floating editor window exists; the app exits when the last window closes (or on explicit Quit).
- **Read-only and binary:** See §2.6 (and read-only reason in UI).
- **Large files:** See §2.7 (threshold, hard cap, truncated + "Load full file").
- **LSP and format/rename:** When LSP is in use, server crash or hang is handled per §10.10.4 (fallback, no editor crash). If format-on-save times out, save without formatting. If the file is renamed on disk (by LSP rename or externally), detect and prompt to save to new path or close. Symbol index staleness: see §12.2.7.

---

